#!/usr/bin/env python3
"""
Verify a rendered resume PDF the way a machine will read it, not the way a person does.

A resume that looks right and extracts wrong is the worst case: nobody sees the failure
and the candidate never learns why the application went nowhere. Everything asserted
here was a real defect in this file at some point.

TWO extractors, and every property is asserted against BOTH. The first version of this
file used pdfminer alone and reported "problems": [] on a PDF where pypdf — the library
this same file imports for the annotation count — read the headings as "E DUCATION" and
"E XPE RIE NCE" and collected every bullet at the end of the document, away from the
job it belonged to. One parser's opinion is not "the way a machine will read it".

  headings   Compared with all whitespace removed, so ANY internal spacing fails and
             not merely the fully spaced form. A subsetted mono font at 7.4pt was
             enough to split four of the five headings under pypdf.
  order      Each entry's first bullet must extract between its own heading and the
             next one. `position: relative` on a list item gives it a separate paint
             pass, and Chrome writes the PDF text layer in paint order, so every
             bullet in the document landed after every heading — three job titles in a
             row, then all the bullets, in a different order. An ATS reading that
             associates none of the work with the employer it belongs to.
  annots     Zero link annotations means the email and URLs are not clickable.
  nbsp       A non-breaking space inside a figure like "40 TB" reaches some parsers as
             a different character than the space it looks like.

Usage: resume-verify.py <pdf>   ->  prints findings as JSON, exit 1 if any
"""
import sys, io, re, contextlib, json

HEADINGS = ["EDUCATION", "EXPERIENCE", "PROJECTS", "LEADERSHIP", "SKILLS"]

# Each entry's heading, and a fragment of its first bullet that must extract inside it.
# Fragments are deliberately short and distinctive; they are checked, so a reworded
# bullet fails here and gets updated rather than silently dropping the assertion.
ORDER = [
    ("EXPERIENCE", "PROJECTS", "Nobody assigned any of this"),
    ("PROJECTS", "LEADERSHIP", "California Public Records Act"),
    ("LEADERSHIP", "SKILLS", "executive board"),
]

def squash(s):
    return re.sub(r"\s+", "", s)

def extract_all(path):
    """Every extractor we can get. A property has to hold under all of them."""
    out = {}
    from pdfminer.high_level import extract_text
    buf = io.StringIO()
    with contextlib.redirect_stderr(buf):
        out["pdfminer"] = extract_text(path)
    from pypdf import PdfReader
    out["pypdf"] = "\n".join(p.extract_text() or "" for p in PdfReader(path).pages)
    return out

def main(path):
    from pypdf import PdfReader

    problems = []
    reader = PdfReader(path)
    annots = sum(len(p.get("/Annots") or []) for p in reader.pages)
    texts = extract_all(path)

    for name, text in texts.items():
        flat = squash(text)
        for h in HEADINGS:
            if squash(h) not in flat:
                problems.append(f'{name}: heading "{h}" is missing from the extracted text')
            elif h not in text:
                # Present once whitespace is ignored, absent as written: the glyphs are
                # being spaced far enough apart that the extractor inserts breaks.
                # Look for the broken form near where the heading should be, not the
                # first all-caps run in the document — the first version quoted an
                # unrelated line and made the finding harder to act on than it needed
                # to be.
                anchor = flat.index(squash(h))
                lead = re.escape(h[0]) + r"[\s]*" + r"[\s]*".join(re.escape(c) for c in h[1:])
                m = re.search(lead, text)
                near = m if m else None
                del anchor
                problems.append(
                    f'{name}: heading "{h}" extracts broken up'
                    + (f' (as "{near.group(0).strip()}")' if near else "")
                    + " — check the heading font and letter-spacing"
                )

        for start, end, fragment in ORDER:
            i, j = text.find(start), text.find(end)
            if i == -1 or j == -1 or j <= i:
                continue  # the heading problem above already covers this
            if squash(fragment) not in squash(text[i:j]):
                problems.append(
                    f'{name}: the first {start} bullet does not extract between '
                    f'{start} and {end} — bullets are being collected elsewhere'
                )

        if " " in text:
            problems.append(f"{name}: a non-breaking space survives into the extracted text")

    if annots == 0:
        problems.append("no link annotations: the email and URLs are not clickable")

    print(
        json.dumps(
            {
                "annots": annots,
                "chars": {k: len(v) for k, v in texts.items()},
                "problems": problems,
            }
        )
    )
    return 1 if problems else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
