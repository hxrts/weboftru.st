#!/usr/bin/env python3
"""Build English-focused UniversClone WOFF2s from the unmodified Perun TTFs.

Install `scripts/font-requirements.txt` with pip, then run
`python3 scripts/build-univers-clone.py --source-dir /path/to/perun-originals`.
The generated fonts are committed assets; normal builds do not require Python.

Fixes the curly apostrophe's erroneous GDEF mark classification so its
native advance is respected. Keeps the -0.01em leftward outline adjustment,
using the original advance widths without the old CSS's extra right spacing.
Unobserved kerning and other OpenType features remain intact. Renames the
derivative because Perun is an OFL Reserved Font Name. Originals and embedded
notices are preserved. Subsets retain Latin letters, common accents, punctuation,
currency, and mathematical symbols. Cyrillic and Bulgarian localized forms are
removed. Applies the observed normal-width Univers Next specimen kerning
pairs; see univers-next-kerning.json for measurement scope and style mapping.
WOFF2 compression reduces transfer size without changing outlines.
"""
import argparse
from io import BytesIO
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from font_kerning import apply_reference_kerning, pair_adjustment, kerning_pairs

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "static" / "fonts"
STYLES = ("Regular", "Italic", "Medium", "Bold", "BoldItalic")
UNICODE_RANGES = (
    (0x0000, 0x017F),  # English, Latin-1, and common accented names
    (0x0300, 0x036F),  # Combining accents
    (0x2000, 0x206F),  # Spaces, smart quotes, dashes, and punctuation
    (0x2070, 0x209F),  # Superscripts and subscripts
    (0x20A0, 0x20CF),  # Currency
    (0x2100, 0x214F),  # Letterlike symbols
    (0x2190, 0x22FF),  # Arrows and mathematical operators
    (0x25A0, 0x25FF),  # Geometric symbols
)
RETAIN = {code for first, last in UNICODE_RANGES for code in range(first, last + 1)}
RETAIN.update((0x0394, 0xFEFF, 0xFFFD))  # Delta used on the site, BOM, replacement


def site_characters():
    """Check that subsetting drops no currently used, previously covered text."""
    chars = set()
    for directory in ("content", "templates"):
        for file in (FONTS.parent.parent / directory).rglob("*"):
            if file.is_file():
                chars.update(map(ord, file.read_text(encoding="utf-8")))
    return chars


def patch(style, source_dir):
    source = source_dir / f"Perun-{style}.ttf"
    font = TTFont(source, recalcTimestamp=False)
    units = font["head"].unitsPerEm
    shift = round(-0.01 * units)
    extra_advance = 0
    cmap = font.getBestCmap()
    apostrophes = {cmap[ord(char)] for char in "'’"}
    for name in apostrophes:
        # Punctuation must not be classified as a combining mark. HarfBuzz
        # otherwise zeros its advance, regardless of the hmtx value.
        classes = font["GDEF"].table.GlyphClassDef.classDefs
        if classes.get(name) == 3:
            classes[name] = 1
        glyph = font["glyf"][name]
        if glyph.isComposite():
            raise ValueError(f"Unexpected composite apostrophe in {source}")
        glyph.coordinates.translate((shift, 0))
        glyph.recalcBounds(font["glyf"])
        advance, bearing = font["hmtx"][name]
        font["hmtx"][name] = (advance + extra_advance, bearing + shift)

    # Some accented letters and the double quote reuse these outlines as
    # components. Counteract the translation there to preserve those glyphs.
    for name in font.getGlyphOrder():
        glyph = font["glyf"][name]
        if glyph.isComposite():
            for component in glyph.components:
                if component.glyphName in apostrophes:
                    if hasattr(component, "transform"):
                        raise ValueError(f"Unexpected transformed quote in {name}")
                    component.x -= shift
                    glyph.recalcBounds(font["glyf"])

    # Keep copyright, authorship, and licensing intact. Only identifying
    # names change; licensing metadata can still refer to the original.
    for record in font["name"].names:
        value = record.toUnicode()
        if record.nameID in (1, 4, 16, 18, 21):
            value = value.replace("Perun", "UniversClone")
        elif record.nameID == 6:
            value = value.replace("Perun", "UniversClone")
        elif record.nameID == 3:
            value = f"UniversClone-{style}-English6"
        elif record.nameID == 5:
            value += "; UniversClone English subset and specimen kerning revision 6"
        else:
            continue
        record.string = value.encode(record.getEncoding())
    font["OS/2"].recalcAvgCharWidth(font)
    buffer = BytesIO()
    font.save(buffer)

    # Validate the serialized output, not just the in-memory glyph edits.
    patched = TTFont(BytesIO(buffer.getvalue()), recalcTimestamp=False)
    original = TTFont(source)
    for char in "'’":
        name = cmap[ord(char)]
        old_advance, old_bearing = original["hmtx"][name]
        assert patched["hmtx"][name] == (old_advance + extra_advance, old_bearing + shift)
        assert patched["glyf"][name].xMin == original["glyf"][name].xMin + shift
        assert patched["GDEF"].table.GlyphClassDef.classDefs.get(name) != 3
    for name in original.getGlyphOrder():
        if name not in apostrophes:
            assert patched["hmtx"][name] == original["hmtx"][name]
            assert (patched["glyf"][name].getCoordinates(patched["glyf"])[0]
                    == original["glyf"][name].getCoordinates(original["glyf"])[0])
    assert patched["GPOS"].compile(patched) == original["GPOS"].compile(original)
    assert patched["GSUB"].compile(patched) == original["GSUB"].compile(original)
    assert all("Perun" not in record.toUnicode() for record in patched["name"].names
               if record.nameID in (1, 4, 6, 16, 18, 21))
    apply_reference_kerning(patched, style)
    required = site_characters() & set(cmap)
    assert not required - RETAIN, f"Subset would drop site characters: {required - RETAIN}"
    options = subset.Options()
    options.layout_features = ["*"]
    options.layout_scripts = ["DFLT", "latn"]
    options.name_IDs = ["*"]  # Preserve copyright and complete license metadata
    options.name_legacy = True
    options.glyph_names = True
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=set(cmap) & RETAIN)
    subsetter.subset(patched)
    patched.flavor = "woff2"
    output = FONTS / f"UniversClone-{style}.woff2"
    patched.save(output)
    webfont = TTFont(output)
    assert required <= set(webfont.getBestCmap())
    assert not any(0x0400 <= code <= 0x052F for code in webfont.getBestCmap())
    for code, name in webfont.getBestCmap().items():
        expected = original["hmtx"][cmap[code]]
        if name in apostrophes:
            expected = (expected[0] + extra_advance, expected[1] + shift)
        assert webfont["hmtx"][name] == expected
    observed, reference_units = kerning_pairs(style)
    web_cmap = webfont.getBestCmap()
    for pair, value in observed.items():
        assert pair_adjustment(webfont, *(web_cmap[ord(c)] for c in pair)) == round(
            value * webfont["head"].unitsPerEm / reference_units)
    assert webfont["name"].getDebugName(13) == original["name"].getDebugName(13)
    (FONTS / f"UniversClone-{style}.ttf").unlink(missing_ok=True)
    print(f"Built {output.name}: {source.stat().st_size:,} -> {output.stat().st_size:,} bytes")
    return original


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True,
                        help="External directory containing the original Perun TTFs")
    args = parser.parse_args()
    for style in STYLES:
        original = patch(style, args.source_dir.expanduser())
    license_text = original["name"].getDebugName(13)
    copyright_text = original["name"].getDebugName(0)
    (FONTS / "UniversClone-LICENSE.txt").write_text(
        f"UniversClone is a modified version of Perun by Stefan Peev.\n"
        f"Modifications correct apostrophe spacing and classification, subset for Latin web use, and adapt observed Univers Next kerning.\n\n{copyright_text}\n\n{license_text}\n",
        encoding="utf-8",
    )
