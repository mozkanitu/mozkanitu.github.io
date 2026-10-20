# Notes for Claude Code: mozkanitu.github.io

Static site on GitHub Pages. No build step: edit the HTML, CSS and JS files directly.

## Layout
- One folder per page, each with an `index.html`: `research/`, `publications/`, `projects/`, `group/`, `teaching/`, `teaching/group-theory/`, `teaching/physics-1/`. The home page is `index.html`.
- `teaching/classical-mechanics/` is only a redirect to `teaching/physics-1/` (the old address of the Physics I course page); keep it so old links work.
- Header, menu and footer are repeated in every page. A change to them must be made in all eight pages.
- Shared files: `assets/site.css`, `assets/site.js`, `assets/analytics.js` (GoatCounter), `assets/img/`.
- Every page links `site.css?v=N` and `site.js?v=N`. After changing either file, raise N by one in every page so browsers load the new version instead of a cached copy.
- In `assets/site.js`: `PAPERS` (publication list, newest first; also feeds the home page and the research page), `GT` (group theory weekly schedule), `PHYS` (Physics I: Mechanics topics). Resources marked `soon:1` render as dashed "soon" buttons; give them a `url` when the file exists.
- Group theory lecture notes live in `teaching/group-theory/notes/`.
- Physics I lecture notes (English, corrected and translated in October 2026 from the owner's 2016 Turkish notes): `teaching/physics-1/notes/FIZ101_WN.pdf`, Weeks 1–4 = the first four topics in `PHYS` (field `notes`). LaTeX sources in `_src/physics-1-notes/` (not published; shared style `fiz101notes.sty`, all figures in TikZ, no raster images). Rebuild with `sh _src/physics-1-notes/build.sh [N]`, which copies the PDFs into place. Equation numbers follow the chapters of the original notes (Week 1 = Ch. 1–2, Week 2 = Ch. 3–4, Week 3 = Ch. 5, Week 4 = Ch. 6).
- Group theory simulations, one `.html` file each in `teaching/group-theory/` with inline style and script (plus the shared scripts below):
  - Week 1: `symmetry-explorer.html`, `table-builder.html` (has a "Rows as permutations" Cayley switch), `same-group.html`.
  - Week 2: `subgroups-cosets.html`, `homomorphism-builder.html`. Not linked from the course page yet; add them to `GT` week 2 `sims` in `assets/site.js` when the owner says so.
- Shared simulation code in `teaching/group-theory/`: `gt-groups.js` (groups, subgroups, lattice, cosets, homomorphisms, cycle notation; everything computed from multiplication tables) and `gt-lock.js` (the homework lock). Check both with `node _tests/group-theory.test.js` after any change; `_tests/` is not published.
- Homework lock: `gt-lock.js` is the only place that hides Problem Set 1 answers from the simulations (D₄ and Z₁₂ on the subgroups page, Z₄ → Z₆ and Z₆ → Z₄ on the homomorphism page, Cayley permutations of the cuboid group and D₄ in the table builder). It lifts by itself on Wednesday 14 October 2026 at 18:00 Istanbul time (15:00 UTC). Never hard-code answers for locked items in a page; for a later problem set, add its keys and date there.
- Group theory problem sets live in `teaching/group-theory/problem-sets/`: `psN.html` (the web version, math typeset by the self-hosted KaTeX in `assets/katex/`) and `GT_PSN.pdf`. Link one from its week in `GT` with `hw` and `hwDue`.

## Quizzes (encrypted, released on time)
The repo is public, so quiz questions are committed only encrypted; a time check in JavaScript would hide nothing.
- Files in `teaching/group-theory/quizzes/`: `quizN.html` (page shell: countdown, password box), `quizN.enc.json` (AES-256-GCM ciphertext, salt, IV; key from PBKDF2-SHA256, 600,000 iterations), `quiz.js` (shared loader: polls `quizN.key?t=…` every 15 s, decrypts with WebCrypto, waits for the release time by the server clock), and after release `quizN.key` (the passphrase, which stays so the quiz remains readable).
- Never commit quiz plaintext, not even briefly. Keep it outside the repo (or in the gitignored `_private/`). After any quiz work, check: `git grep -F "<a phrase from the quiz>" $(git rev-list --all)` must print nothing.
- Release: `.github/workflows/quiz-release.yml` reads the passphrase from the quiz's Actions secret, checks it opens `quizN.enc.json` (`_tools/quiz-check.js`), then commits `quizN.key` to `main`; Pages deploys in about 70 s (measured). `lead_seconds` in `.github/quizzes.json` is how early it publishes (150 s); the page itself shows the questions only at the release time.
  - By hand (also from the GitHub mobile app): Actions > "Release a quiz" > Run workflow, quiz id e.g. `quiz2`. Releases at once.
  - Scheduled: runs at :07 and :37 past each hour, 06–16 UTC on weekdays; a run releases the next quiz due within 80 minutes, sleeping until its release time minus `lead_seconds`. Not yet tested end to end; test it before relying on it (see below).
  - Fallback in class: write the passphrase on the board; students type it in the page's password box.
- Adding the next quiz (N = 2, …, 6):
  1. Write the questions as an HTML fragment outside the repo (same classes as Quiz 1: `qmeta`, `qbox`, `h2` with `span.pts`, `ol.parts`).
  2. Choose four random lowercase words; encrypt: `node _tools/quiz-encrypt.js /outside/quizN.html quizN "four random words here"`.
  3. Copy `quiz1.html` to `quizN.html` and change `data-id`, `data-name`, `data-opens` (UTC ISO time), `data-opens-label`, the title, `h1` and the date line.
  4. Add `{ "id": "quizN", "secret": "QUIZ_N_KEY", "release": "<UTC ISO time>" }` to `.github/quizzes.json` and the secret `QUIZ_N_KEY` (the passphrase) under Settings > Secrets and variables > Actions. Secrets QUIZ_1_KEY … QUIZ_6_KEY are wired into the workflow.
  5. Link it from its week in `GT` (`assets/site.js`) with `quizUrl` and `quizWhen`, raise the asset version, commit, and run the plaintext check above.
- Turkey is UTC+3 all year: 14:30 Istanbul = 11:30 UTC, 13:30 = 10:30 UTC.

## Physics I live quizzes (graded by the owner's Google Apps Script)
- The ungraded practice quiz of Tuesday 13 October 2026 is `teaching/physics-1/quizzes/practice.html` (`data-id="phys-quiz1"`, results in the sheet tab "Quiz 1"), with symbolic solutions in `practice-solutions.html`. Graded quizzes are numbered from Quiz 1 (Quiz 1 to Quiz 6 plus a make-up quiz, as listed in `PHYS`). Graded Quiz 1: `quiz1.html` (`data-id="phys-q1"`), Tuesday 20 October 2026, Start open 14:30–14:35, projectile motion (angled kick); same Apps Script deployment and URL, results in the sheet tab "Quiz 1 (20 Oct)". Use a new tab name (`QUIZ.sheet`) and a new `data-id` for every quiz so results never mix.
- Page: `teaching/physics-1/quizzes/quizN.html` plus the shared `live-quiz.js` (attributes `data-name`, `data-opens`, `data-closes` and their `-label` versions set the before/open/closed messages). The page holds NO questions: `data-endpoint` is the Apps Script web app URL, `data-opens` the opening time (UTC). Students enter their student number, confirm, get 10 minutes from their own Start, answer the parts in order, and see after each part whether they were right, the correct answer and the solution. A reload resumes the same attempt (student number kept in localStorage).
- Backend: a Google Apps Script bound to the Google Sheet "Physics I quizzes" in the owner's Google account. Its `QUIZ` object holds the questions, choices, answers, solutions, opening time, last start time and length; it grades on the server, allows one answer per part, enforces the times by its own clock, and writes one row per student to the sheet tab named in `QUIZ.sheet`. Student number 000000 is a test number (any time, starts afresh). Never commit that script with real questions to this public repo.
- After any change to the script: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy (the URL stays the same). Paste the script into an EMPTY editor: code pasted inside the default `function myFunction() {` hides doGet/doPost.
- Next quiz: give the owner an updated script (new `QUIZ` block and `sheet: 'Quiz N'`; earlier results stay in their tabs) or a new deployment; copy `quiz1.html` to `quizN.html` and change `data-id`, `data-opens`, `data-opens-label`, `data-endpoint` if it changed, the title, `h1` and date line; link it from its topic in `PHYS` (`assets/site.js`) as the third element of the quiz entry, e.g. `["Quiz 1","Tuesday 20 Oct, 14:30","quizzes/quiz1.html"]`; raise the asset version.

## Rules from the owner
- Never write the email address in plain text anywhere. The "Email" link is a `.mail-btn` button that assembles the address in `assets/site.js` when clicked.
- Do not add an Apps section or mention any apps until the owner asks.
- On the Projects & Honors page, never say which papers belong to which funded project.
- Describe ongoing research only at the level the owner states; do not add unpublished details.
- Group theory course: no tutorials; both weekly sessions (Monday 14:30–16:30, Wednesday 13:30–15:30) are lectures. The midterm date is not set; it will be just before or just after the fall break (16–20 November 2026).
- Quiz solutions are posted only after the quiz has been given.
- Group theory schedule: list a problem set or quiz only once the owner gives it; no "soon" placeholders for future ones.

## Group theory conventions (match the lecture slides)
- Triangle vertices labeled 1, 2, 3 counterclockwise from the bottom left; `r` = counterclockwise turn by 2π/n; `s` = reflection in the line through vertex 1.
- Products read right to left: in `ab`, `b` acts first. Cycle (123) sends 1 to 2, 2 to 3, 3 to 1.
- Normal form for dihedral elements: `r^k` or `r^k s`.

## Style
- Chalkboard green header (`--board`), chalk text, yellow chalk accent (`--yellow`) used sparingly; paper background below. STIX Two Text for text, Instrument Sans for labels and buttons.
- Plain, specific wording in sentence case. No all-caps labels.
- Keep light and dark mode working, and check pages on a phone-width screen.
