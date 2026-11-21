# சங்கத் தமிழ் — Sangam Corpus and Concordance

Next.js rebuild of sangattamil.com (Dr. A. Kamatchi). No database: the corpus lives in `data/*.json`,
generated from the original Excel files and read on the server.

## Pages

| Route | What it does | Data |
|---|---|---|
| `/` | Kural of the day, quick word search, links to each tool | all |
| `/thirukkural` | Search by chapter, kural number, first word, last word, any word | `data/kural.json` |
| `/concordance` | சங்க இலக்கியச் சொற்களும் அவற்றின் வருகையும்: every line a word occurs in (19 texts) | `data/concordance.json` |
| `/morphology` | உருபனியல் பகுப்புத் தொகுப்பு: search parsed lines by word, grammar marker or text | `data/morph.json` |
| `/dictionary` | சங்க அகராதி: Tamil ↔ English word meanings | `data/morph.json` |
| `/about` | Coverage and contact | — |

All searches are plain GET URLs (`/concordance?lit=நற்றிணை&w=கொன்றை`), so results are shareable and work without JavaScript.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Updating the corpus

Edit the Excel files in `../TAMIL LANGUAGE/`, then regenerate the JSON:

```bash
pip install openpyxl
python scripts/convert_xlsx.py "../TAMIL LANGUAGE/WEBSITE NEW_16092022.xlsx" "../TAMIL LANGUAGE/SANGAM DICTIONARY.xlsx"
```

The script asserts kurals 1–1330 are all present and that the 133 chapter names are in canonical order.

## Deploy

Any Node host works (Vercel is zero-config). Pages render on the server, so this is not a static export.
