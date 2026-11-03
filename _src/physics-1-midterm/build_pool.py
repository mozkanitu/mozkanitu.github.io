#!/usr/bin/env python3
"""Build the FIZ 101 midterm problem pool (multiple choice) from JSON problem data.

Usage
  python3 build_pool.py --data DIR_OR_FILE [...] --mode MODE --out FILE.pdf [--tex FILE.tex] [--png DIR]
  python3 build_pool.py --data DIR_OR_FILE [...] --check

MODE
  student     the pool for students: problems and, at the end, the answer key
  instructor  every problem followed by its answer, solution, why each wrong choice is there,
              and the exam variants (private: never publish this)
  blind       problems only, no answers anywhere (for checking a problem without the key)

Data: one JSON file per topic, {"topic": 5, "title": "Work and kinetic energy", "problems": [...]}.
A directory argument loads every *.json in it, sorted by topic. Each problem:
  subsection   the section of the lecture notes it is based on
  kind         "numerical" | "symbolic" | "conceptual"
  stem         LaTeX text of the question (numbers in the text, not in the figure)
  figure       "" or a complete tikzpicture environment
  layout       "below" (default) or "right": where the figure goes
  choices      five LaTeX strings, (A) to (E)
  correct      index of the right choice, 0 to 4
  answer       the final answer as it appears in the key, LaTeX
  answer_value number (numerical problems): the right answer in the units the stem asks for
  solution     short worked solution, LaTeX
  distractors  five strings: the mistake behind each wrong choice ("correct" for the right one)
  variants     numerical problems: four exam versions with other numbers, each
               {"values", "stem", "choices", "correct", "answer_value"}

Needs pdflatex and latexmk; the style comes from ../physics-1-notes/fiz101notes.sty.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
NOTES = os.path.normpath(os.path.join(HERE, '..', 'physics-1-notes'))
KINDS = ('numerical', 'symbolic', 'conceptual')
LET = 'ABCDE'

PREAMBLE = r"""\documentclass[11pt,a4paper]{article}
\usepackage{fiz101notes}
\usepackage{needspace}
\usepackage{multicol}
\makeatletter
\hypersetup{pdftitle={FIZ 101 Physics I: Mechanics -- Midterm problem pool},pdfauthor={Mehmet \"Ozkan}}
\fancyhead[L]{\small\sffamily\color{fzmuted}FIZ 101 \textperiodcentered\ Midterm problem pool}
\fancyhead[R]{\small\sffamily\color{fzmuted}@@HEADR@@}
\newcommand{\pooltitle}[2]{%
  \thispagestyle{plain}%
  \begin{tcolorbox}[enhanced,colback=fzboard,colframe=fzboard,coltext=white,arc=2mm,boxrule=0pt,
      left=7mm,right=7mm,top=6mm,bottom=6mm,borderline south={2.5pt}{0pt}{fzyellow}]
    {\small\sffamily FIZ 101 \textperiodcentered\ Physics I: Mechanics \textperiodcentered\ Fall 2026}\par\vspace{2.5mm}
    {\sffamily\bfseries\LARGE\raggedright #1\par}\vspace{3mm}
    {\small\sffamily #2}
  \end{tcolorbox}\vspace{2mm}}
% Figure styles (the same as in the weekly notes).
\tikzset{
  vec/.style={->,very thick,fzvec}, sum/.style={->,very thick,fzcomp},
  force/.style={->,very thick,fzcomp}, velo/.style={->,very thick,fzvec},
  accel/.style={->,very thick,fzaux}, disp/.style={->,very thick,fzvec},
  comp/.style={->,thick,dashed,fzcomp!80}, dim/.style={<->,fzgray!90!black},
  track/.style={very thick,fzboard},
  ground/.style={pattern=north east lines,pattern color=fzgray,draw=none},
  axis/.style={->,thin,fzgray!90!black},
}
% Problems
\newcounter{prob}
\newcommand{\plabel}{{\sffamily\bfseries\color{fzboard}\theprob.}\enspace\ignorespaces}
\newenvironment{problem}{\par\needspace{6\baselineskip}\refstepcounter{prob}%
  \tcolorbox[blank,before skip=1.0em plus 0.4em,after skip=0.4em]}{\endtcolorbox}
\newenvironment{probfig}{\par\nopagebreak\begin{center}\vspace{-0.6em}}{\vspace{-0.6em}\end{center}}
% Five choices: one row, rows of three or two, or one per line, whichever fits the longest choice.
\newlength\pc@w \newlength\pc@max \newlength\pc@col
\newcommand\pc@m[1]{\settowidth\pc@w{#1}\ifdim\pc@w>\pc@max\global\pc@max\pc@w\fi}
\newcommand\pc@i[2]{\makebox[\pc@col][l]{\textsf{\small(#1)}\hspace{0.5em}#2}}
\newcommand{\choices}[5]{\par\nopagebreak{\setlength\parskip{0.45em}%
  \global\pc@max=0pt\pc@m{#1}\pc@m{#2}\pc@m{#3}\pc@m{#4}\pc@m{#5}%
  \global\advance\pc@max by 2.6em
  \ifdim\pc@max<0.2\linewidth
    \setlength\pc@col{0.2\linewidth}%
    \noindent\pc@i{A}{#1}\pc@i{B}{#2}\pc@i{C}{#3}\pc@i{D}{#4}\pc@i{E}{#5}\par
  \else\ifdim\pc@max<0.3333\linewidth
    \setlength\pc@col{0.3333\linewidth}%
    \noindent\pc@i{A}{#1}\pc@i{B}{#2}\pc@i{C}{#3}\par\nopagebreak
    \noindent\pc@i{D}{#4}\pc@i{E}{#5}\par
  \else\ifdim\pc@max<0.5\linewidth
    \setlength\pc@col{0.5\linewidth}%
    \noindent\pc@i{A}{#1}\pc@i{B}{#2}\par\nopagebreak
    \noindent\pc@i{C}{#3}\pc@i{D}{#4}\par\nopagebreak
    \noindent\pc@i{E}{#5}\par
  \else
    \begin{enumerate}[label=\textsf{\small(\Alph*)},leftmargin=2.4em,itemsep=0.1em,parsep=0pt,topsep=0.1em]
    \item #1 \item #2 \item #3 \item #4 \item #5
    \end{enumerate}
  \fi\fi\fi}}
% Instructor notes under a problem
\newtcolorbox{instr}{enhanced,breakable,colback=fzpaper,colframe=fzpaper,arc=1.5mm,boxrule=0pt,
  left=3mm,right=3mm,top=1.5mm,bottom=1.5mm,fontupper=\small,borderline west={2pt}{0pt}{fzlink}}
\makeatother
\begin{document}
"""

INTRO = r"""\pooltitle{Midterm problem pool}{Topics 1--6 \textperiodcentered\ Mehmet \"Ozkan, Istanbul Technical University}

The midterm on Tuesday 24 November, during the usual class time, has 10 multiple-choice questions,
all taken from this pool of %(n)d problems. On the exam the numbers in a question may be different
from the numbers here, so learn how to solve each problem rather than its answer. The answers are at
the end.

No calculators are allowed, and none are needed: the numbers are chosen so that the arithmetic can be
done by hand. Take $g = \qty{10}{m/s^2}$ throughout. Each problem is based on the lecture notes of its
topic.
"""

INSTR_INTRO = r"""\pooltitle{Midterm problem pool: instructor copy}{Private: answers, solutions, wrong choices and exam variants}

This copy is for the instructor only. Under each problem: the right answer, a short solution, the
mistake behind each wrong choice, and (for numerical problems) four exam versions with other numbers.
Do not publish it.
"""

BLIND_INTRO = r"""\pooltitle{Midterm problem pool}{Problems only, without answers}

Take $g = \qty{10}{m/s^2}$. No calculators.
"""


def load(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            files += [os.path.join(p, f) for f in os.listdir(p) if f.endswith('.json')]
        else:
            files.append(p)
    topics = []
    for f in files:
        with open(f, encoding='utf-8') as fh:
            d = json.load(fh)
        d['_file'] = f
        topics.append(d)
    topics.sort(key=lambda d: d.get('topic', 0))
    return topics


def norm(s):
    return re.sub(r'\s+', '', s)


def validate(topics):
    errs, warns = [], []
    n = 0
    for t in topics:
        for k in ('topic', 'title', 'problems'):
            if k not in t:
                errs.append('%s: missing "%s"' % (t['_file'], k))
        for p in t.get('problems', []):
            n += 1
            w = 'problem %d (topic %s)' % (n, t.get('topic'))
            for k in ('subsection', 'kind', 'stem', 'choices', 'correct', 'answer', 'solution', 'distractors'):
                if k not in p:
                    errs.append('%s: missing "%s"' % (w, k))
            if errs and errs[-1].startswith(w):
                continue
            if p['kind'] not in KINDS:
                errs.append('%s: kind must be one of %s' % (w, KINDS))
            ch = p['choices']
            if len(ch) != 5:
                errs.append('%s: needs 5 choices, has %d' % (w, len(ch)))
            elif len(set(map(norm, ch))) != 5:
                errs.append('%s: two choices are the same' % w)
            if not (isinstance(p['correct'], int) and 0 <= p['correct'] <= 4):
                errs.append('%s: correct must be 0..4' % w)
            if len(p['distractors']) != 5:
                errs.append('%s: needs 5 distractor notes' % w)
            fig = p.get('figure', '')
            if fig and '\\begin{tikzpicture}' not in fig:
                errs.append('%s: figure must be a tikzpicture environment' % w)
            if p.get('layout', 'below') not in ('below', 'right'):
                errs.append('%s: layout must be "below" or "right"' % w)
            if p['kind'] == 'numerical':
                if not isinstance(p.get('answer_value'), (int, float)):
                    errs.append('%s: numerical problem needs a number in answer_value' % w)
                vs = p.get('variants', [])
                if len(vs) != 4:
                    errs.append('%s: numerical problem needs 4 variants, has %d' % (w, len(vs)))
                vals = set()
                for j, v in enumerate(vs):
                    vw = '%s variant %d' % (w, j + 1)
                    for k in ('values', 'stem', 'choices', 'correct', 'answer_value'):
                        if k not in v:
                            errs.append('%s: missing "%s"' % (vw, k))
                    if 'choices' in v and (len(v['choices']) != 5 or len(set(map(norm, v['choices']))) != 5):
                        errs.append('%s: needs 5 different choices' % vw)
                    if not (isinstance(v.get('correct'), int) and 0 <= v.get('correct', -1) <= 4):
                        errs.append('%s: correct must be 0..4' % vw)
                    if not isinstance(v.get('answer_value'), (int, float)):
                        errs.append('%s: answer_value must be a number' % vw)
                    vals.add(norm(v.get('values', '')))
                    if norm(v.get('stem', '')) == norm(p['stem']):
                        errs.append('%s: same stem as the pool problem' % vw)
                if len(vals) != len(vs):
                    errs.append('%s: two variants have the same values' % w)
            elif p.get('variants'):
                warns.append('%s: %s problem has variants (ignored)' % (w, p['kind']))
    return errs, warns


def problem_tex(p, mode):
    out = []
    fig = p.get('figure', '').strip()
    if fig and p.get('layout', 'below') == 'right':
        out.append('\\begin{minipage}[t]{0.6\\linewidth}\\vspace{0pt}\n\\plabel %s\n\\end{minipage}\\hfill'
                   '\\begin{minipage}[t]{0.37\\linewidth}\\vspace{0pt}\\centering\n%s\n\\end{minipage}\\par' % (p['stem'].strip(), fig))
    else:
        out.append('\\plabel ' + p['stem'].strip())
        if fig:
            out.append('\\begin{probfig}\n%s\n\\end{probfig}' % fig)
    out.append('\\choices' + ''.join('{%s}' % c for c in p['choices']))
    return '\n'.join(out)


def instr_tex(p):
    c = p['correct']
    s = ['\\begin{instr}',
         '\\textbf{Answer:} (%s) %s \\quad \\textcolor{fzmuted}{%s \\textperiodcentered\\ notes: %s}\\par'
         % (LET[c], p['answer'], p['kind'], p['subsection']),
         '\\textbf{Solution.} %s\\par' % p['solution'],
         '\\textbf{Choices.} ' + '; '.join('(%s) %s' % (LET[i], d) for i, d in enumerate(p['distractors'])) + '.\\par']
    for j, v in enumerate(p.get('variants', []) if p['kind'] == 'numerical' else []):
        s.append('\\medskip\\textbf{Exam version %d} (%s): answer (%s) %s.\\par\n%s\n\\choices%s'
                 % (j + 1, v['values'], LET[v['correct']], v['choices'][v['correct']], v['stem'].strip(),
                    ''.join('{%s}' % x for x in v['choices'])))
    s.append('\\end{instr}')
    return '\n'.join(s)


def build_tex(topics, mode):
    total = sum(len(t['problems']) for t in topics)
    body = [PREAMBLE.replace('@@HEADR@@', 'Topics %d--%d' % (topics[0]['topic'], topics[-1]['topic'])
                             if len(topics) > 1 else 'Topic %d' % topics[0]['topic'])]
    body.append({'student': INTRO % {'n': total}, 'instructor': INSTR_INTRO, 'blind': BLIND_INTRO}[mode])
    if topics[0]['problems'] and topics[0].get('first_number'):
        body.append('\\setcounter{prob}{%d}' % (topics[0]['first_number'] - 1))
    n = 0
    key = []
    for t in topics:
        body.append('\n\\needspace{14\\baselineskip}\n\\section*{Topic %d: %s}\n' % (t['topic'], t['title']))
        for p in t['problems']:
            n += 1
            body.append('%% ---- problem %d (topic %d, item %d) ----' % (n, t['topic'], t['problems'].index(p) + 1))
            body.append('\\begin{problem}\n%s\n\\end{problem}' % problem_tex(p, mode))
            if mode == 'instructor':
                body.append(instr_tex(p))
            key.append((n, LET[p['correct']], p['answer']))
    if mode == 'student':
        body.append('\n\\clearpage\n\\section*{Answers}\n\\begin{multicols}{2}\\raggedcolumns\n\\begin{enumerate}'
                    '[label=\\textsf{\\arabic*.},leftmargin=2.2em,itemsep=0.35em]')
        for k, let, ans in key:
            body.append('\\item (%s) \\enspace %s' % (let, ans))
        body.append('\\end{enumerate}\n\\end{multicols}')
    body.append('\\end{document}\n')
    return '\n'.join(body)


def compile_tex(tex, out_pdf, png_dir=None):
    tmp = tempfile.mkdtemp(prefix='pool-')
    try:
        src = os.path.join(tmp, 'pool.tex')
        with open(src, 'w', encoding='utf-8') as fh:
            fh.write(tex)
        env = dict(os.environ, TEXINPUTS=NOTES + ':')
        r = subprocess.run(['latexmk', '-pdf', '-interaction=nonstopmode', '-halt-on-error', 'pool.tex'],
                           cwd=tmp, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        log = open(os.path.join(tmp, 'pool.log'), encoding='latin-1').read() if os.path.exists(os.path.join(tmp, 'pool.log')) else ''
        if r.returncode != 0 or not os.path.exists(os.path.join(tmp, 'pool.pdf')):
            print('LaTeX failed:')
            lines = log.splitlines()
            for i, l in enumerate(lines):
                if l.startswith('!'):
                    print('\n'.join(lines[i:i + 8]))
                    m = re.search(r'l\.(\d+)', '\n'.join(lines[i:i + 12]))
                    if m:
                        ln = int(m.group(1)); tl = tex.splitlines()
                        owner = [x for x in tl[:ln] if x.startswith('% ---- problem')]
                        print('  in the generated file at line %d%s' % (ln, (', ' + owner[-1][2:]) if owner else ''))
                    break
            return False
        os.makedirs(os.path.dirname(os.path.abspath(out_pdf)), exist_ok=True)
        shutil.copy(os.path.join(tmp, 'pool.pdf'), out_pdf)
        over = re.findall(r'Overfull \\hbox \(([\d.]+)pt too wide\)[^\n]*lines? (\d+)', log)
        und = len(re.findall(r'undefined', log))
        pages = re.search(r'Output written on pool.pdf \((\d+) page', log)
        print('%s: %s pages, %d overfull boxes, %d undefined references'
              % (out_pdf, pages.group(1) if pages else '?', len(over), und))
        tl = tex.splitlines()
        for pt, ln in over[:20]:
            owner = [x for x in tl[:int(ln)] if x.startswith('% ---- problem')]
            print('  overfull by %spt at line %s%s' % (pt, ln, (', ' + owner[-1][2:]) if owner else ''))
        if png_dir:
            os.makedirs(png_dir, exist_ok=True)
            base = os.path.join(png_dir, os.path.splitext(os.path.basename(out_pdf))[0])
            subprocess.run(['pdftoppm', '-r', '90', '-png', out_pdf, base], check=True)
            print('page images: %s-*.png' % base)
        return True
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--data', nargs='+', required=True)
    ap.add_argument('--mode', choices=('student', 'instructor', 'blind'), default='student')
    ap.add_argument('--out')
    ap.add_argument('--tex', help='also save the generated LaTeX here')
    ap.add_argument('--png', help='also render the pages as PNG images into this folder')
    ap.add_argument('--check', action='store_true', help='only validate the data')
    a = ap.parse_args()
    topics = load(a.data)
    if a.mode == 'blind':
        for t in topics:
            for p in t['problems']:
                p.setdefault('correct', 0); p.setdefault('answer', ''); p.setdefault('solution', '')
                p.setdefault('distractors', [''] * 5); p.setdefault('subsection', ''); p.setdefault('kind', 'conceptual')
    errs, warns = validate(topics) if a.mode != 'blind' else ([], [])
    for w in warns:
        print('warning:', w)
    for e in errs:
        print('error:', e)
    n = sum(len(t['problems']) for t in topics)
    if a.check or errs:
        kinds = {}
        for t in topics:
            for p in t['problems']:
                kinds[p.get('kind')] = kinds.get(p.get('kind'), 0) + 1
        print('%d problems %s; %d errors, %d warnings' % (n, kinds, len(errs), len(warns)))
        sys.exit(1 if errs else 0)
    if not a.out:
        sys.exit('--out is needed to build')
    tex = build_tex(topics, a.mode)
    if a.tex:
        with open(a.tex, 'w', encoding='utf-8') as fh:
            fh.write(tex)
    sys.exit(0 if compile_tex(tex, a.out, a.png) else 1)


if __name__ == '__main__':
    main()
