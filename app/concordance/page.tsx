import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import { LIMIT, conLits, conOccurrences, conSingle, conWords, litIndex, one } from "@/lib/data";
import { Letters, LineList, PageHead, qs } from "@/components/ui";

export const metadata: Metadata = { title: "சங்க இலக்கியச் சொற்களும் அவற்றின் வருகையும்" };

export default function Page({ searchParams }: PageProps<"/concordance">) {
  return (
    <div className="wrap t-kurinji">
      <PageHead title="சொற்களும் வருகையும்" land="kurinji">
        சங்க இலக்கியச் சொற்களும் அவற்றின் வருகையும். Find every line of {conLits.length} Sangam texts in which a word
        occurs. Lines are matched on the sandhi-split reading; the original text is shown beneath.
      </PageHead>
      <Suspense fallback={<p className="muted">ஏற்றுகிறது…</p>}>
        <Concordance searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Concordance({ searchParams }: { searchParams: PageProps<"/concordance">["searchParams"] }) {
  const sp = await searchParams;
  const litName = one(sp.lit);
  const lit = litIndex(conLits, litName);
  const q = one(sp.q);
  const w = one(sp.w);

  // Prefix search lists words with their count in the chosen literature.
  const matches = q
    ? conWords
        .filter((x) => x.startsWith(q))
        .map((x) => [x, conOccurrences(x, lit).length] as const)
        .filter(([, c]) => c > 0)
    : [];
  const hits = w ? conOccurrences(w, lit) : [];
  const perLit = w ? countByLit(conOccurrences(w)) : [];

  return (
    <div className="tool">
      <div className="panel">
        <Form action="/concordance" className="panel">
          <div className="field">
            <label htmlFor="lit">இலக்கியம்</label>
            <select id="lit" name="lit" defaultValue={litName ?? ""} key={litName}>
              <option value="">அனைத்து நூல்களும்</option>
              {conLits.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="q">சொல்லின் தொடக்கம்</label>
            <input id="q" name="q" type="search" defaultValue={q ?? w} key={q ?? w} placeholder="எ.கா. கொன்றை" />
          </div>
          <button className="btn" type="submit">தேடு</button>
        </Form>
        <Letters base={`/concordance${qs({ lit: litName })}`} current={q} />
      </div>

      <section className="results">
        {w ? (
          <>
            <div className="summary">
              <h2>{w}</h2>
              <span className="count">
                {hits.length} {hits.length === 1 ? "occurrence" : "occurrences"}
                {lit !== undefined && ` in ${conLits[lit]}`}
              </span>
            </div>
            {perLit.length > 1 && (
              <ul className="spread" aria-label="நூல்வாரியாக">
                <li><Link href={`/concordance${qs({ w })}`} aria-current={lit === undefined}>அனைத்தும் ({perLit.reduce((a, [, c]) => a + c, 0)})</Link></li>
                {perLit.map(([i, c]) => (
                  <li key={i}>
                    <Link href={`/concordance${qs({ lit: conLits[i], w })}`} aria-current={lit === i}>{conLits[i]} ({c})</Link>
                  </li>
                ))}
              </ul>
            )}
            {hits.length ? (
              <LineList lines={hits.slice(0, LIMIT)} lits={conLits} singlePoem={conSingle} token={w} />
            ) : (
              <p className="empty">“{w}” does not occur in {lit !== undefined ? conLits[lit] : "the corpus"}.</p>
            )}
            {hits.length > LIMIT && <p className="note">Showing the first {LIMIT} of {hits.length}. Choose one literature to narrow the list.</p>}
          </>
        ) : q ? (
          matches.length ? (
            <>
              <h2>“{q}” எனத் தொடங்கும் சொற்கள் ({matches.length})</h2>
              <ul className="wordlist">
                {matches.slice(0, LIMIT).map(([x, c]) => (
                  <li key={x}>
                    <Link href={`/concordance${qs({ lit: litName, w: x })}`}>{x}</Link>
                    <small>{c}</small>
                  </li>
                ))}
              </ul>
              {matches.length > LIMIT && <p className="note">Showing {LIMIT} of {matches.length} words. Type more letters to narrow it.</p>}
            </>
          ) : (
            <p className="empty">
              No word starting with “{q}” in {lit !== undefined ? conLits[lit] : "the corpus"}. Check the spelling or try a
              shorter beginning.
            </p>
          )
        ) : (
          <p className="empty">
            <strong>Start with a letter or the beginning of a word.</strong> You will get every matching word with its number
            of occurrences; open one to read each line it appears in.
          </p>
        )}
      </section>
    </div>
  );
}

function countByLit(lines: { 0: number }[]) {
  const counts = new Map<number, number>();
  for (const l of lines) counts.set(l[0], (counts.get(l[0]) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}
