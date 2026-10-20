#!/bin/sh
# Build the FIZ 101 weekly lecture notes and copy the PDFs to the course page.
# Needs pdflatex and latexmk with these TeX Live packages (Debian/Ubuntu names):
# texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended
# texlive-pictures texlive-science lmodern latexmk.
# Usage: sh _src/physics-1-notes/build.sh [week numbers]   (default: all weeks)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT="$HERE/../../teaching/physics-1/notes"
TMP=$(mktemp -d)
for n in ${*:-1 2 3 4}; do
  cp -r "$HERE/week$n" "$TMP/"
  (cd "$TMP/week$n" && TEXINPUTS="$HERE:" latexmk -pdf -interaction=nonstopmode -halt-on-error "week$n.tex" >/dev/null)
  cp "$TMP/week$n/week$n.pdf" "$OUT/FIZ101_W$n.pdf"
  echo "week $n -> teaching/physics-1/notes/FIZ101_W$n.pdf"
done
rm -rf "$TMP"
