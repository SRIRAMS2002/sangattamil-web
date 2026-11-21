import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import { chapters, finalWords, initialWords, kurals, one, paals, type Kural } from "@/lib/data";
import { Letters, Marked, PageHead, qs } from "@/components/ui";

export const metadata: Metadata = { title: "திருக்குறள்" };

const MODES = [
  { by: "chapter", label: "அதிகாரம்" },
  { by: "number", label: "குறள் எண்" },
  { by: "first", label: "முதல் சொல்" },
  { by: "last", label: "கடைசிச் சொல்" },
  { by: "any", label: "ஏதேனும் ஒரு சொல்" },
] as const;

export default function Page({ searchParams }: PageProps<"/thirukkural">) {
  return (
    <div className="wrap t-marutham">
      <PageHead title="திருக்குறள்" land="marutham">
        1330 குறள்கள், 133 அதிகாரங்கள். Each kural is shown as printed in the original text, with the
        sandhi-split reading underneath.
      </PageHead>
      <Suspense fallback={<p className="muted">ஏற்றுகிறது…</p>}>
        <KuralSearch searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function KuralSearch({ searchParams }: { searchParams: PageProps<"/thirukkural">["searchParams"] }) {
  const sp = await searchParams;
  const by = MODES.find((m) => m.by === one(sp.by))?.by ?? "chapter";

  return (
    <>
      <nav className="tabs" aria-label="தேடும் முறை">
        {MODES.map((m) => (
          <Link key={m.by} href={`/thirukkural?by=${m.by}`} aria-current={m.by === by ? "page" : undefined}>
            {m.label}
          </Link>
        ))}
      </nav>
      {by === "chapter" && <ByChapter ch={Number(one(sp.ch) ?? 1)} />}
      {by === "number" && <ByNumber n={Number(one(sp.n) ?? 1)} />}
      {by === "first" && <ByWord mode="first" words={initialWords} q={one(sp.q)} w={one(sp.w)} />}
      {by === "last" && <ByWord mode="last" words={finalWords} q={one(sp.q)} w={one(sp.w)} />}
      {by === "any" && <ByAny q={one(sp.q)} />}
    </>
  );
}

function ByChapter({ ch }: { ch: number }) {
  const valid = Number.isInteger(ch) && ch >= 1 && ch <= 133;
  const c = valid ? ch : 1;
  const paal = paals.find((p) => c >= p.from && c <= p.to)!;
  return (
    <div className="tool">
      <Form action="/thirukkural" className="panel">
        <input type="hidden" name="by" value="chapter" />
        <div className="field">
          <label htmlFor="ch">அதிகாரம்</label>
          <select id="ch" name="ch" defaultValue={c} key={c}>
            {paals.map((p) => (
              <optgroup key={p.name} label={p.name}>
                {chapters.slice(p.from - 1, p.to).map((name, i) => (
                  <option key={i} value={p.from + i}>{p.from + i}. {name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button className="btn" type="submit">காட்டு</button>
      </Form>
      <section className="results">
        <div className="summary">
          <h2>{c}. {chapters[c - 1]}</h2>
          <span className="count">{paal.name}</span>
        </div>
        <KuralList list={kurals.slice((c - 1) * 10, c * 10)} hideChapter />
        <nav className="pager">
          {c > 1 ? <Link href={`/thirukkural${qs({ by: "chapter", ch: c - 1 })}`}>முந்தைய அதிகாரம்: {chapters[c - 2]}</Link> : <span />}
          {c < 133 && <Link href={`/thirukkural${qs({ by: "chapter", ch: c + 1 })}`}>அடுத்த அதிகாரம்: {chapters[c]}</Link>}
        </nav>
      </section>
    </div>
  );
}

function ByNumber({ n }: { n: number }) {
  const valid = Number.isInteger(n) && n >= 1 && n <= 1330;
  return (
    <div className="tool">
      <Form action="/thirukkural" className="panel">
        <input type="hidden" name="by" value="number" />
        <div className="field">
          <label htmlFor="n">குறள் எண் (1–1330)</label>
          <input id="n" name="n" type="number" min={1} max={1330} defaultValue={valid ? n : ""} key={n} required />
        </div>
        <button className="btn" type="submit">காட்டு</button>
      </Form>
      <section className="results">
        {valid ? (
          <>
            <KuralList list={[kurals[n - 1]]} />
            <nav className="pager">
              {n > 1 ? <Link href={`/thirukkural${qs({ by: "number", n: n - 1 })}`}>குறள் {n - 1}</Link> : <span />}
              {n < 1330 && <Link href={`/thirukkural${qs({ by: "number", n: n + 1 })}`}>குறள் {n + 1}</Link>}
            </nav>
          </>
        ) : (
          <p className="empty">Enter a kural number between 1 and 1330.</p>
        )}
      </section>
    </div>
  );
}

function ByWord({ mode, words, q, w }: { mode: "first" | "last"; words: string[]; q?: string; w?: string }) {
  const label = mode === "first" ? "முதல் சொல்" : "கடைசிச் சொல்";
  const matches = q ? words.filter((x) => x.startsWith(q)) : [];
  const hits = w ? kurals.filter((k) => k[mode] === w) : [];
  return (
    <div className="tool">
      <div className="panel">
        <Form action="/thirukkural" className="field">
          <input type="hidden" name="by" value={mode} />
          <label htmlFor="q">{label} எதில் தொடங்குகிறது?</label>
          <input id="q" name="q" type="search" defaultValue={q} key={q} placeholder="எ.கா. அற" />
          <button className="btn" type="submit">தேடு</button>
        </Form>
        <Letters base={`/thirukkural?by=${mode}`} current={q} />
        <p className="note">{words.length} distinct {mode === "first" ? "opening" : "closing"} words.</p>
      </div>
      <section className="results">
        {w ? (
          <>
            <div className="summary">
              <h2>{w}</h2>
              <span className="count">{hits.length} குறள்</span>
            </div>
            <KuralList list={hits} />
          </>
        ) : q ? (
          matches.length ? (
            <>
              <h2>“{q}” எனத் தொடங்கும் {label}கள்</h2>
              <ul className="wordlist">
                {matches.map((x) => (
                  <li key={x}><Link href={`/thirukkural${qs({ by: mode, q, w: x })}`}>{x}</Link></li>
                ))}
              </ul>
            </>
          ) : (
            <p className="empty">No kural {mode === "first" ? "opens" : "ends"} with a word starting “{q}”. Try a shorter beginning.</p>
          )
        ) : (
          <p className="empty">Pick a letter or type the beginning of the word to list matching {label}கள்.</p>
        )}
      </section>
    </div>
  );
}

function ByAny({ q }: { q?: string }) {
  const hits = q ? kurals.filter((k) => k.seg.some((l) => l.includes(q)) || k.orig.some((l) => l.includes(q))) : [];
  return (
    <div className="tool">
      <Form action="/thirukkural" className="panel">
        <input type="hidden" name="by" value="any" />
        <div className="field">
          <label htmlFor="q">சொல் அல்லது சொற்பகுதி</label>
          <input id="q" name="q" type="search" defaultValue={q} key={q} placeholder="எ.கா. அன்பு" required />
        </div>
        <button className="btn" type="submit">தேடு</button>
        <p className="note">Matches anywhere in the original text or the sandhi-split reading.</p>
      </Form>
      <section className="results">
        {q ? (
          <>
            <div className="summary">
              <h2>{q}</h2>
              <span className="count">{hits.length} குறள்</span>
            </div>
            {hits.length ? <KuralList list={hits} sub={q} /> : <p className="empty">No kural contains “{q}”.</p>}
          </>
        ) : (
          <p className="empty">Type any word or part of a word to find every kural that contains it.</p>
        )}
      </section>
    </div>
  );
}

function KuralList({ list, sub, hideChapter }: { list: Kural[]; sub?: string; hideChapter?: boolean }) {
  return (
    <ol className="kurals">
      {list.map((k) => (
        <li key={k.n}>
          <span className="kural-no">{k.n}</span>
          <div className="kural-text verse">
            {k.orig.map((l, i) => <p key={i}><Marked text={l} sub={sub} /></p>)}
            <p className="kural-seg"><Marked text={k.seg.join(" / ")} sub={sub} /></p>
            {!hideChapter && (
              <div className="kural-meta">
                <Link href={`/thirukkural${qs({ by: "chapter", ch: k.ch })}`}>{k.ch}. {chapters[k.ch - 1]}</Link>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
