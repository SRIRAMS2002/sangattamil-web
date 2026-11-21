import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import {
  LIMIT, dictionary, grammar, litIndex, morphLits, morphSingle, morphTextHits, morphTokenHits, one,
} from "@/lib/data";
import { LineList, PageHead, qs } from "@/components/ui";

export const metadata: Metadata = { title: "தமிழ்ச் செவ்விலக்கியங்களின் உருபனியல் பகுப்புத் தொகுப்பு" };

export default function Page({ searchParams }: PageProps<"/morphology">) {
  return (
    <div className="wrap t-neythal">
      <PageHead title="உருபனியல் பகுப்பு" land="neythal">
        தமிழ்ச் செவ்விலக்கியங்களின் உருபனியல் பகுப்புத் தொகுப்பு. Every line is split into its morphemes, with
        grammatical markers numbered by function (for example அ1, the genitive case marker). Search by a word, by a
        grammatical item, or by any text.
      </PageHead>
      <Suspense fallback={<p className="muted">ஏற்றுகிறது…</p>}>
        <Morphology searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Morphology({ searchParams }: { searchParams: PageProps<"/morphology">["searchParams"] }) {
  const sp = await searchParams;
  const litName = one(sp.lit);
  const lit = litIndex(morphLits, litName);
  const en = one(sp.lang) === "en";
  const q = one(sp.q);
  const w = one(sp.w);
  const g = one(sp.g);
  const s = one(sp.s);
  const base = { lit: litName, lang: en ? "en" : undefined };

  const lower = q?.toLowerCase();
  const wordMatches = lower
    ? dictionary.filter(([word, meaning, occurs]) => occurs && (en ? meaning.toLowerCase().includes(lower) : word.startsWith(q!)))
    : [];
  const grammarMatches = lower
    ? grammar.filter(([code, english, tamil]) =>
        code.startsWith(q!) || (en ? english.toLowerCase().includes(lower) : tamil.includes(q!)))
    : [];

  const selected = w ?? g ?? s;
  const hits = w ? morphTokenHits(w, lit) : g ? morphTokenHits(g, lit) : s ? morphTextHits(s, lit) : [];
  const gram = g ? grammar.find((x) => x[0] === g) : undefined;
  const meaning = w ? dictionary.find((x) => x[0] === w)?.[1] : undefined;

  return (
    <div className="tool">
      <Form action="/morphology" className="panel">
        <div className="field">
          <label htmlFor="lit">இலக்கியம்</label>
          <select id="lit" name="lit" defaultValue={litName ?? ""} key={litName}>
            <option value="">அனைத்து நூல்களும்</option>
            {morphLits.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <fieldset className="field">
          <legend>தேடும் மொழி</legend>
          <div className="radios">
            <label><input type="radio" name="lang" value="" defaultChecked={!en} /> தமிழ்</label>
            <label><input type="radio" name="lang" value="en" defaultChecked={en} /> English</label>
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="q">சொல் அல்லது இலக்கணக் கூறு</label>
          <input id="q" name="q" type="search" defaultValue={q} key={q} placeholder={en ? "e.g. flower, genitive" : "எ.கா. மலர், அ1"} />
        </div>
        <button className="btn" type="submit">தேடு</button>
      </Form>

      <section className="results">
        {selected ? (
          <>
            <div className="summary">
              <h2>{selected}</h2>
              <span className="count">
                {gram && `${en ? gram[1] : gram[2]}. `}
                {meaning && `${meaning}. `}
                {hits.length} {hits.length === 1 ? "line" : "lines"}
                {lit !== undefined && ` in ${morphLits[lit]}`}
              </span>
            </div>
            {hits.length ? (
              <LineList lines={hits.slice(0, LIMIT)} lits={morphLits} singlePoem={morphSingle} token={w ?? g} sub={s} />
            ) : (
              <p className="empty">No line in {lit !== undefined ? morphLits[lit] : "these texts"} contains “{selected}”.</p>
            )}
            {hits.length > LIMIT && <p className="note">Showing the first {LIMIT} of {hits.length}. Choose one literature to narrow the list.</p>}
          </>
        ) : q ? (
          <>
            {wordMatches.length > 0 && (
              <>
                <h2>சொற்கள் ({wordMatches.length})</h2>
                <ul className="wordlist">
                  {wordMatches.slice(0, LIMIT).map(([word, m]) => (
                    <li key={word}>
                      <Link href={`/morphology${qs({ ...base, w: word })}`}>{word}</Link>
                      <small>{m}</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {grammarMatches.length > 0 && (
              <>
                <h2 style={{ marginTop: 32 }}>இலக்கணக் கூறுகள் ({grammarMatches.length})</h2>
                <GrammarTable rows={grammarMatches} base={base} en={en} />
              </>
            )}
            <p className="note">
              <Link href={`/morphology${qs({ ...base, s: q })}`}>“{q}” வரும் எல்லா அடிகளையும் காட்டு</Link> (matches any part of a line).
            </p>
            {!wordMatches.length && !grammarMatches.length && (
              <p className="empty">No word or grammatical item matches “{q}”. Use the link above to search the line text instead.</p>
            )}
          </>
        ) : (
          <>
            <h2>இலக்கணக் கூறுகள்</h2>
            <p className="note" style={{ marginTop: 0 }}>Open a marker to see every line where it is used.</p>
            <GrammarTable rows={grammar} base={base} en={en} />
          </>
        )}
      </section>
    </div>
  );
}

function GrammarTable({ rows, base, en }: { rows: [string, string, string][]; base: Record<string, string | undefined>; en: boolean }) {
  return (
    <table className="codes">
      <thead>
        <tr><th scope="col">குறி</th><th scope="col">{en ? "Meaning" : "பொருள்"}</th><th scope="col">{en ? "தமிழ்" : "English"}</th></tr>
      </thead>
      <tbody>
        {rows.map(([code, english, tamil]) => (
          <tr key={code}>
            <td><Link href={`/morphology${qs({ ...base, g: code })}`}>{code}</Link></td>
            <td>{en ? english : tamil}</td>
            <td className="muted">{en ? tamil : english}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
