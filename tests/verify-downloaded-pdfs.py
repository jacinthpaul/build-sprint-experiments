"""Run after browser tests: python tests/verify-downloaded-pdfs.py.

Requires pypdf, already installed in the development environment.
"""
from pathlib import Path
import re
from pypdf import PdfReader


def text_of(name):
    reader = PdfReader(Path("verification") / name)
    assert reader.pages, f"{name}: PDF has no pages"
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert "For my family" in text, f"{name}: missing family note"
    assert "How to start a claim" in text, f"{name}: missing claim steps"
    assert "does not update automatically" in text, f"{name}: missing copy notice"
    assert "\ufffd" not in text, f"{name}: unreadable text"
    return text


recovered = text_of("recovered-policy.pdf")
for expected in [
    "DEMO-EARLIER-001",
    "Demo Family",
    "Fictional family note: the spare copy is with Demo Family.",
    "Ask the claims branch.",
    "Demo policy page 3",
]:
    assert expected in recovered, f"Recovered PDF lost saved detail: {expected}"

recovered_pages = PdfReader("verification/recovered-policy.pdf").pages
assert any(
    "Confirm with insurer" in page.extract_text() and "Ask the claims branch." in page.extract_text()
    for page in recovered_pages
), "Recovered PDF separated a claim heading from its instructions"

for name in ["demo-policy.pdf", "saved-policy.pdf", "family-recipient.pdf"]:
    text_of(name)

assert "SAMPLEONLY" in re.sub(r"\s+", "", text_of("public-demo.pdf")), "Sample PDF is not marked fictional"
print("Five downloaded PDFs retain policy details, claim steps, and copy notices.")
