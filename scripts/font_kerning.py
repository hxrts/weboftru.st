"""Apply the measured Univers specimen pairs without replacing mark positioning."""
import json
import unicodedata
from pathlib import Path

from fontTools.otlLib.builder import buildLookup, buildPairPosGlyphs, buildValue
from fontTools.ttLib.tables import otTables

# Optical tuning for the site, separate from the measured specimen pairs.
# Values use the same 1000-unit em as the reference measurements.
LOCAL_PAIRS = {"'s": -35, "’s": -35}


def reference_pairs(style):
    reference = json.loads(Path(__file__).with_name("univers-next-kerning.json").read_text())
    profiles = reference["profiles"]
    pairs = {**profiles["upright"], **profiles["light"]}
    if "Italic" in style:
        pairs.update(profiles["italic"])
    return pairs, reference["units_per_em"]


def kerning_pairs(style):
    pairs, units = reference_pairs(style)
    return {**pairs, **LOCAL_PAIRS}, units


def pair_adjustment(font, left, right):
    """Effective first-glyph advance adjustment of the existing kern lookups."""
    table = font["GPOS"].table
    indices = {i for record in table.FeatureList.FeatureRecord if record.FeatureTag == "kern"
               for i in record.Feature.LookupListIndex}
    adjustment = 0
    for index in sorted(indices):
        lookup = table.LookupList.Lookup[index]
        for subtable in lookup.SubTable:
            kind = lookup.LookupType
            if kind == 9:
                kind, subtable = subtable.ExtensionLookupType, subtable.ExtSubTable
            if kind != 2:
                raise ValueError("Unexpected non-pair kern lookup")
            if left not in subtable.Coverage.glyphs:
                continue
            if subtable.Format == 1:
                pair_set = subtable.PairSet[subtable.Coverage.glyphs.index(left)]
                record = next((r for r in pair_set.PairValueRecord if r.SecondGlyph == right), None)
                if record is None:
                    continue
            else:
                first = subtable.ClassDef1.classDefs.get(left, 0)
                second = subtable.ClassDef2.classDefs.get(right, 0)
                record = subtable.Class1Record[first].Class2Record[second]
            for value in (record.Value1, record.Value2):
                if value and (getattr(value, "XPlacement", 0) or getattr(value, "YPlacement", 0)):
                    raise ValueError("Unexpected placement adjustment in reference pair")
            adjustment += getattr(record.Value1, "XAdvance", 0) if record.Value1 else 0
            break  # A lookup uses the first matching subtable, including zero pairs.
    return adjustment


def apply_reference_kerning(font, style):
    observations, reference_units = kerning_pairs(style)
    cmap = font.getBestCmap()
    aliases = {}
    for code, name in cmap.items():
        decomposition = unicodedata.normalize("NFD", chr(code))
        if decomposition and all(unicodedata.combining(c) for c in decomposition[1:]):
            aliases.setdefault(decomposition[0], set()).add(name)
    pairs = {}
    expected = {}
    for text, measured in observations.items():
        target = round(measured * font["head"].unitsPerEm / reference_units)
        for left in aliases.get(text[0], ()):
            for right in aliases.get(text[1], ()):
                current = pair_adjustment(font, left, right)
                expected[left, right] = target
                if target != current:
                    pairs[left, right] = (buildValue({"XAdvance": target - current}), None)
    if not pairs:
        return
    table = font["GPOS"].table
    lookup = buildLookup(buildPairPosGlyphs(pairs, font.getReverseGlyphMap()), flags=8)
    index = len(table.LookupList.Lookup)
    table.LookupList.Lookup.append(lookup)
    table.LookupList.LookupCount = len(table.LookupList.Lookup)
    records = table.FeatureList.FeatureRecord
    kern = [r for r in records if r.FeatureTag == "kern"]
    if not kern:
        record = otTables.FeatureRecord()
        record.FeatureTag = "kern"
        record.Feature = otTables.Feature()
        record.Feature.FeatureParams = None
        record.Feature.LookupListIndex = []
        record.Feature.LookupCount = 0
        records.append(record)
        kern.append(record)
    # The source italics have a Greek-only kern feature. Explicitly enable
    # the new Latin pairs for Latin/default shaping as well.
    kern_indices = [i for i, record in enumerate(records) if record.FeatureTag == "kern"]
    for script in table.ScriptList.ScriptRecord:
        if script.ScriptTag in ("DFLT", "latn"):
            systems = ([script.Script.DefaultLangSys] if script.Script.DefaultLangSys else [])
            systems += [r.LangSys for r in script.Script.LangSysRecord]
            for system in systems:
                system.FeatureIndex = sorted(set(system.FeatureIndex + kern_indices))
                system.FeatureCount = len(system.FeatureIndex)
    for record in kern:
        record.Feature.LookupListIndex.append(index)
        record.Feature.LookupCount = len(record.Feature.LookupListIndex)
    # OpenType feature records are alphabetically ordered. Preserve all existing
    # script/language associations when inserting kern into the italic fonts.
    ordered = sorted(enumerate(records), key=lambda item: item[1].FeatureTag)
    remap = {old: new for new, (old, _) in enumerate(ordered)}
    table.FeatureList.FeatureRecord = [record for _, record in ordered]
    table.FeatureList.FeatureCount = len(records)
    for script in table.ScriptList.ScriptRecord:
        systems = ([script.Script.DefaultLangSys] if script.Script.DefaultLangSys else [])
        systems += [r.LangSys for r in script.Script.LangSysRecord]
        for system in systems:
            system.FeatureIndex = sorted(remap[i] for i in system.FeatureIndex)
            if system.ReqFeatureIndex != 0xFFFF:
                system.ReqFeatureIndex = remap[system.ReqFeatureIndex]
    for (left, right), target in expected.items():
        assert pair_adjustment(font, left, right) == target
