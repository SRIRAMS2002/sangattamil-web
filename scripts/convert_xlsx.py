"""Convert the original Excel corpus files into the JSON the website reads.

Usage (needs `pip install openpyxl`):
    python scripts/convert_xlsx.py "../TAMIL LANGUAGE/WEBSITE NEW_16092022.xlsx" "../TAMIL LANGUAGE/SANGAM DICTIONARY.xlsx"

Writes data/concordance.json, data/kural.json, data/morph.json.
Re-run it whenever the Excel files change.
"""

import json
import os
import sys

import openpyxl

# ---------------------------------------------------------------- Tamil sort
# Unicode order is not Tamil dictionary order (ன ற ழ sit in the wrong place),
# so word lists are sorted with this key instead.
LETTERS = "அஆஇஈஉஊஎஏஐஒஓஔஃகஙசஞடணதநபமயரலவழளறனஜஷஸஹ"
SIGNS = "்" + "_" + "ாிீுூெேைொோௌ"  # pulli, implicit-a, then vowel signs
FIRST_CONSONANT = LETTERS.index("க")


def tamil_key(word):
    key, i = [], 0
    while i < len(word):
        ch = word[i]
        if ch in LETTERS:
            base = LETTERS.index(ch)
            nxt = word[i + 1] if i + 1 < len(word) else ""
            if base >= FIRST_CONSONANT and nxt and nxt in SIGNS:
                key.append((base, SIGNS.index(nxt)))
                i += 2
                continue
            key.append((base, 1))
        else:
            key.append((1000 + ord(ch), 0))
        i += 1
    return key


assert sorted(["கி", "ன", "க", "அ", "ற", "கா", "க்"], key=tamil_key) == ["அ", "க்", "க", "கா", "கி", "ற", "ன"]

# ------------------------------------------------------------ Kural chapters
# Canonical order of the 133 adhikarams; kural n is in chapter ceil(n / 10).
CHAPTERS = """கடவுள் வாழ்த்து|வான் சிறப்பு|நீத்தார் பெருமை|அறன் வலியுறுத்தல்|இல்வாழ்க்கை|வாழ்க்கைத் துணை|மக்கட்பேறு|அன்புடைமை|விருந்தோம்பல்|இனியவை கூறல்|செய்ந்நன்றியறிதல்|நடுவு நிலைமை|அடக்கமுடைமை|ஒழுக்கமுடைமை|பிறனில் விழையாமை|பொறையுடைமை|அழுக்காறாமை|வெஃகாமை|புறங்கூறாமை|பயனில சொல்லாமை|தீவினையச்சம்|ஒப்புரவறிதல்|ஈகை|புகழ்|அருளுடைமை|புலால் மறுத்தல்|தவம்|கூடா ஒழுக்கம்|கள்ளாமை|வாய்மை|வெகுளாமை|இன்னா செய்யாமை|கொல்லாமை|நிலையாமை|துறவு|மெய்யுணர்தல்|அவா அறுத்தல்|ஊழ்|இறைமாட்சி|கல்வி|கல்லாமை|கேள்வி|அறிவுடைமை|குற்றங் கடிதல்|பெரியாரைத் துணைகோடல்|சிற்றினம் சேராமை|தெரிந்து செயல்வகை|வலி அறிதல்|காலம் அறிதல்|இடனறிதல்|தெரிந்து தெளிதல்|தெரிந்து வினையாடல்|சுற்றம் தழால்|பொச்சாவாமை|செங்கோன்மை|கொடுங்கோன்மை|வெருவந்த செய்யாமை|கண்ணோட்டம்|ஒற்றாடல்|ஊக்கமுடைமை|மடியின்மை|ஆள்வினையுடைமை|இடுக்கண் அழியாமை|அமைச்சு|சொல்வன்மை|வினைத்தூய்மை|வினைத்திட்பம்|வினை செயல்வகை|தூது|மன்னரைச் சேர்ந்தொழுகல்|குறிப்பறிதல்|அவை அறிதல்|அவை அஞ்சாமை|நாடு|அரண்|பொருள் செயல்வகை|படைமாட்சி|படைச்செருக்கு|நட்பு|நட்பாராய்தல்|பழைமை|தீ நட்பு|கூடாநட்பு|பேதைமை|புல்லறிவாண்மை|இகல்|பகை மாட்சி|பகைத்திறம் தெரிதல்|உட்பகை|பெரியாரைப் பிழையாமை|பெண்வழிச் சேரல்|வரைவின் மகளிர்|கள்ளுண்ணாமை|சூது|மருந்து|குடிமை|மானம்|பெருமை|சான்றாண்மை|பண்புடைமை|நன்றியில் செல்வம்|நாணுடைமை|குடிசெயல்வகை|உழவு|நல்குரவு|இரவு|இரவச்சம்|கயமை|தகையணங்குறுத்தல்|குறிப்பறிதல்|புணர்ச்சி மகிழ்தல்|நலம் புனைந்துரைத்தல்|காதற் சிறப்புரைத்தல்|நாணுத்துறவுரைத்தல்|அலர் அறிவுறுத்தல்|பிரிவாற்றாமை|படர்மெலிந்திரங்கல்|கண் விதுப்பழிதல்|பசப்புறு பருவரல்|தனிப்படர் மிகுதி|நினைந்தவர் புலம்பல்|கனவு நிலையுணர்த்தல்|பொழுதுகண்டு இரங்கல்|உறுப்புநலன் அழிதல்|நெஞ்சொடு கிளத்தல்|நிறையழிதல்|அவர்வயின் விதும்பல்|குறிப்பறிவுறுத்தல்|புணர்ச்சி விதும்பல்|நெஞ்சொடு புலத்தல்|புலவி|புலவி நுணுக்கம்|ஊடலுவகை""".split("|")
assert len(CHAPTERS) == 133


def clean(v):
    return " ".join(str(v).split()) if v is not None else ""


def rows(path, sheet):
    wb = openpyxl.load_workbook(path, read_only=True)
    return list(wb[sheet].iter_rows(values_only=True))


def main(corpus_xlsx, dict_xlsx):
    out = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out, exist_ok=True)

    # ------------------------------------------- Concordance (18 Sangam texts)
    # Sheet1 columns: [wordlist (unrelated), segmented line, original line, literature, poem, ':', line]
    lits, lines = [], []
    for r in rows(corpus_xlsx, "Sheet1"):
        lit = clean(r[3])
        if not lit or not isinstance(r[4], int):
            continue  # header row
        if lit not in lits:
            lits.append(lit)
        lines.append([lits.index(lit), r[4], r[6], clean(r[1]), clean(r[2])])
    tokens = {t for l in lines for t in l[3].split()}
    # Sheet2 is the curated word list the old site offered; keep words that really occur.
    words = {clean(r[1]) for r in rows(corpus_xlsx, "Sheet2") if r[1]}
    words = sorted((w for w in words if w in tokens and " " not in w), key=tamil_key)
    json.dump({"lits": lits, "lines": lines, "words": words},
              open(os.path.join(out, "concordance.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"concordance: {len(lits)} texts, {len(lines)} lines, {len(words)} words")

    # ------------------------------------------------------------ Thirukkural
    kurals = {}
    for lit_i, poem, line, seg, orig in lines:
        if lits[lit_i] == "திருக்குறள்":
            k = kurals.setdefault(poem, {"n": poem, "seg": [], "orig": []})
            k["seg"].append(seg)
            k["orig"].append(orig)
    assert sorted(kurals) == list(range(1, 1331)), "expected kurals 1..1330"
    kural_list = []
    for n in range(1, 1331):
        k = kurals[n]
        k["ch"] = (n - 1) // 10 + 1
        k["first"] = k["orig"][0].split()[0]
        k["last"] = k["seg"][-1].split()[-1]
        kural_list.append(k)
    assert kural_list[0]["orig"][0].startswith("அகர")  # kural 1 opens the first chapter
    json.dump({"chapters": CHAPTERS, "kurals": kural_list},
              open(os.path.join(out, "kural.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"kural: {len(kural_list)} kurals")

    # ------------------------------------------- Morphological parse + dictionary
    # Sheet1 columns: [parsed line, original line, literature, poem, ':', line]
    m_lits, m_lines = [], []
    for r in rows(dict_xlsx, "Sheet1"):
        lit = clean(r[2])
        if not lit or not isinstance(r[3], int):
            continue
        if lit not in m_lits:
            m_lits.append(lit)
        m_lines.append([m_lits.index(lit), r[3], r[5], clean(r[0]), clean(r[1])])
    m_tokens = {t for l in m_lines for t in l[3].split()}
    entries = {}
    for r in rows(dict_xlsx, "Sheet2")[1:]:
        w, en = clean(r[0]), clean(r[1])
        if w and en:
            entries.setdefault(w, [])
            if en not in entries[w]:
                entries[w].append(en)
    dictionary = [[w, "; ".join(entries[w]), w in m_tokens] for w in sorted(entries, key=tamil_key)]
    grammar = [[clean(r[0]), clean(r[1]), clean(r[2])] for r in rows(dict_xlsx, "Sheet3")[1:] if r[0]]
    grammar = sorted((g for g in grammar if g[0] in m_tokens), key=lambda g: tamil_key(g[0]))
    json.dump({"lits": m_lits, "lines": m_lines, "dictionary": dictionary, "grammar": grammar},
              open(os.path.join(out, "morph.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"morph: {len(m_lits)} texts, {len(m_lines)} lines, {len(dictionary)} dictionary words, {len(grammar)} grammar items")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
