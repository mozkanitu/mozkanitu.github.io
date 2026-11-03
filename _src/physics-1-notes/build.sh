#!/bin/sh
# Build the FIZ 101 weekly lecture notes and copy the PDFs to the course page.
# Needs pdflatex and latexmk with these TeX Live packages (Debian/Ubuntu names):
# texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended
# texlive-pictures texlive-science lmodern latexmk.
# Usage: sh _src/physics-1-notes/build.sh [week numbers]   (default: every weekN folder)
# Builds in a temporary folder, so no build files are left next to the sources.
# Prints, for each week, the number of overfull boxes and undefined references,
# or the LaTeX error if the build fails.
HERE=$(cd "$(dirname "$0")" && pwd)
OUT="$HERE/../../teaching/physics-1/notes"
TMP=$(mktemp -d)
WEEKS=${*:-$(cd "$HERE" && ls -d week* | sed 's/week//' | sort -n)}
FAIL=0
for n in $WEEKS; do
  cp -r "$HERE/week$n" "$TMP/"
  if (cd "$TMP/week$n" && TEXINPUTS="$HERE:" latexmk -pdf -interaction=nonstopmode -halt-on-error "week$n.tex" >/dev/null 2>&1); then
    cp "$TMP/week$n/week$n.pdf" "$OUT/FIZ101_W$n.pdf"
    LOG="$TMP/week$n/week$n.log"
    echo "week $n -> teaching/physics-1/notes/FIZ101_W$n.pdf ($(grep -c 'Overfull' "$LOG") overfull boxes, $(grep -c 'undefined' "$LOG") undefined references)"
    grep -A1 'Overfull' "$LOG" | head -12
  else
    echo "week $n: LaTeX failed:"
    grep -A4 '^!' "$TMP/week$n/week$n.log" | head -24
    FAIL=1
  fi
done
rm -rf "$TMP"
exit $FAIL
