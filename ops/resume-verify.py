#!/usr/bin/env python3
"""
Verify a rendered resume PDF the way a machine will read it, not the way a person does.

A resume that looks right and extracts wrong is the worst case: nobody sees the failure
and the candidate never learns why the application went nowhere. Everything asserted
here was a real defect in this file at some point.

  headings   Letter-spacing above ~0.1em makes a PDF extract "EXPERIENCE" as
             "E X P E R I E N C E". No parser matches that against a known section.
  annots     Zero link annotations means the email and URLs are not clickable.
  order      The bullets must extract near their own headings, not collected at the
             end. (Checked because it was alleged; it was NOT true here, and the check
             exists so a future layout change cannot quietly make it true.)
  nbsp       A non-breaking space inside a figure like "40 TB" reaches some parsers as
             a different character than the space it looks like.

Usage: resume-verify.py <pdf>   ->  prints findings, exit 1 if any
"""
import sys, io, contextlib, json

HEADINGS = ["EDUCATION", "EXPERIENCE", "PROJECTS", "LEADERSHIP", "SKILLS"]

def main(path):
    from pypdf import PdfReader
    from pdfminer.high_level import extract_text

    problems = []
    reader = PdfReader(path)
    annots = sum(len(p.get("/Annots") or []) for p in reader.pages)

    buf = io.StringIO()
    with contextlib.redirect_stderr(buf):
        text = extract_text(path)

    for h in HEADINGS:
        if h not in text:
            spaced = " ".join(h)
            if spaced in text:
                problems.append(f'heading "{h}" extracts as "{spaced}" — reduce h2 letter-spacing')
            else:
                problems.append(f'heading "{h}" is missing from the extracted text')

    if annots == 0:
        problems.append("no link annotations: the email and URLs are not clickable")

    if " " in text:
        problems.append("a non-breaking space survives into the extracted text")

    # Bullet-near-heading proximity: the first Experience bullet must appear before the
    # Projects heading, i.e. bullets are not being collected at the end of the document.
    ie, ip = text.find("EXPERIENCE"), text.find("PROJECTS")
    if ie != -1 and ip != -1:
        between = text[ie:ip]
        if "Nobody assigned any of this" not in between:
            problems.append("experience bullets do not extract between their own headings")

    print(json.dumps({"annots": annots, "chars": len(text), "problems": problems}))
    return 1 if problems else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
