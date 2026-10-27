#!/usr/bin/env python3
"""Measure pair adjustments from the supplied Univers Next Field Guide PDF.

Requires PyMuPDF and fontTools. Only numeric spacing observations are saved;
embedded font programs and outlines are never written to the repository.
Usage: python3 scripts/measure-univers-kerning.py ~/Downloads/Univers_Next_specimen.pdf
"""
import argparse
import hashlib
import json
from collections import defaultdict
from io import BytesIO
from pathlib import Path
from statistics import median

import pymupdf
from fontTools.agl import toUnicode
from fontTools.ttLib import TTFont

SAMPLES = {
    "Typography": "upright",
    "generating waveforms through methods": "upright",
    "Univers® Next": "upright",
    "amateur electronics market": "light",
    "self-contained instruments with built-in keyboards": "italic",
    "AVANT-GARDE": "condensed",
}


def measure(pdf):
    document = pymupdf.open(pdf)
    page = document[0]
    fonts = {
        ref: TTFont(BytesIO(document.extract_font(ref)[-1]))
        for ref, extension, _, name, *_ in page.get_fonts()
        if "UniversNext" in name and extension == "ttf"
    }
    observations = defaultdict(lambda: defaultdict(list))
    samples = []
    for span in page.get_texttrace():
        if "UniversNext" not in span["font"]:
            continue
        size = span["size"]
        chars = span["chars"]

        def score(font):
            order = font.getGlyphOrder()
            units = font["head"].unitsPerEm
            return sum(abs((c[3][2] - c[3][0]) / size * 1000
                           - font["hmtx"][order[c[1]]][0] / units * 1000)
                       for c in chars)

        ref = min(fonts, key=lambda key: score(fonts[key]))
        font = fonts[ref]
        assert score(font) < .1, "Could not identify the actual reference font instance"
        order = font.getGlyphOrder()
        units = font["head"].unitsPerEm

        def character(char):
            # The italic sample's ToUnicode map is broken. Glyph names retain
            # its real Latin text (e.g. s.ital), unlike extracted Unicode.
            return toUnicode(order[char[1]].split(".")[0]) or chr(char[0])

        text = "".join(map(character, chars))
        if text not in SAMPLES:
            continue
        profile = SAMPLES[text]
        samples.append({"text": text, "profile": profile, "pdf_font_xref": ref,
                        "size_pt": round(size, 4)})
        for first, second in zip(chars, chars[1:]):
            if abs(first[2][1] - second[2][1]) > .01:
                continue
            pair = character(first) + character(second)
            if len(pair) != 2 or " " in pair:
                continue
            # These Univers samples use zero tracking. Position differences
            # minus nominal glyph advances isolate their PDF TJ adjustments.
            adjustment = ((second[2][0] - first[2][0]) / size * 1000
                          - font["hmtx"][order[first[1]]][0] / units * 1000)
            observations[profile][pair].append(adjustment)
    assert len(samples) == len(SAMPLES), "Reference sample missing or changed"
    return {
        "source": pdf.name,
        "sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
        "units_per_em": 1000,
        "scope": "Observed PDF pair positioning only. No complete Univers kerning table is embedded. Body copy is Helvetica Now and is excluded. Condensed data is recorded but not applied to normal-width UniversClone.",
        "policy": "Upright and light observations form a shared normal-width baseline for all five styles. Italic observations override that baseline in Italic and BoldItalic. Cross-style sharing is a family-level adaptation, not independent measurements of every weight. Accented Latin variants inherit their base-letter adjustment. Other existing pairs remain unchanged.",
        "samples": samples,
        "profiles": {
            profile: {pair: round(median(values)) for pair, values in sorted(pairs.items())}
            for profile, pairs in sorted(observations.items())
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--out", type=Path,
                        default=Path(__file__).with_name("univers-next-kerning.json"))
    args = parser.parse_args()
    result = measure(args.pdf.expanduser())
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    for profile, pairs in result["profiles"].items():
        print(profile, {pair: value for pair, value in pairs.items() if value})
