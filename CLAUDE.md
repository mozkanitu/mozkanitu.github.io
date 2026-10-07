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
- Group theory simulations, one `.html` file each in `teaching/group-theory/` with inline style and script (plus the shared scripts below):
  - Week 1: `symmetry-explorer.html`, `table-builder.html` (has a "Rows as permutations" Cayley switch), `same-group.html`.
  - Week 2: `subgroups-cosets.html`, `homomorphism-builder.html`. Not linked from the course page yet; add them to `GT` week 2 `sims` in `assets/site.js` when the owner says so.
- Shared simulation code in `teaching/group-theory/`: `gt-groups.js` (groups, subgroups, lattice, cosets, homomorphisms, cycle notation; everything computed from multiplication tables) and `gt-lock.js` (the homework lock). Check both with `node _tests/group-theory.test.js` after any change; `_tests/` is not published.
- Homework lock: `gt-lock.js` is the only place that hides Problem Set 1 answers from the simulations (D₄ and Z₁₂ on the subgroups page, Z₄ → Z₆ and Z₆ → Z₄ on the homomorphism page, Cayley permutations of the cuboid group and D₄ in the table builder). It lifts by itself on Wednesday 14 October 2026 at 18:00 Istanbul time (15:00 UTC). Never hard-code answers for locked items in a page; for a later problem set, add its keys and date there.
- Group theory problem sets live in `teaching/group-theory/problem-sets/`: `psN.html` (the web version, math typeset by the self-hosted KaTeX in `assets/katex/`) and `GT_PSN.pdf`. Link one from its week in `GT` with `hw` and `hwDue`.

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
