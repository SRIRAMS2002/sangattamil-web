import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import { LIMIT, dictionary, one } from "@/lib/data";
import { Letters, PageHead, qs } from "@/components/ui";

export const metadata: Metadata = { title: "சங்க அகராதி" };

export default function Page({ searchParams }: PageProps<"/dictionary">) {
  return (
    <div className="wrap t-mullai">
      <PageHead title="சங்க அகராதி" land="mullai">
        English meanings for {dictionary.length.toLocaleString("en-IN")} words of classical Tamil. Search by the Tamil
        word or by its English meaning; words marked with a link can be traced in the morphological corpus.
      </PageHead>
      <Suspense fallback={<p className="muted">ஏற்றுகிறது…</p>}>
        <Dictionary searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Dictionary({ searchParams }: { searchParams: PageProps<"/dictionary">["searchParams"] }) {
  const sp = await searchParams;
  const en = one(sp.lang) === "en";
  const q = one(sp.q) ?? (en ? undefined : "அ");
  const lower = q?.toLowerCase();
  const rows = lower
    ? dictionary.filter(([w, m]) => (en ? m.toLowerCase().includes(lower) : w.startsWith(q!)))
    : dictionary;

  return (
    <div className="tool">
      <div className="panel">
        <Form action="/dictionary" className="panel">
          <fieldset className="field">
            <legend>தேடும் மொழி</legend>
            <div className="radios">
              <label><input type="radio" name="lang" value="" defaultChecked={!en} /> தமிழ்</label>
              <label><input type="radio" name="lang" value="en" defaultChecked={en} /> English</label>
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="q">{en ? "English meaning contains" : "சொல்லின் தொடக்கம்"}</label>
            <input id="q" name="q" type="search" defaultValue={q} key={q} placeholder={en ? "e.g. king" : "எ.கா. மலர்"} />
          </div>
          <button className="btn" type="submit">தேடு</button>
        </Form>
        {!en && <Letters base="/dictionary" current={q} />}
      </div>

      <section className="results">
        <div className="summary">
          <h2>{q ?? "அனைத்தும்"}</h2>
          <span className="count">{rows.length} சொற்கள்</span>
        </div>
        {rows.length ? (
          <table className="codes">
            <thead><tr><th scope="col">சொல்</th><th scope="col">English</th></tr></thead>
            <tbody>
              {rows.slice(0, LIMIT).map(([w, m, occurs]) => (
                <tr key={w}>
                  <td className="verse">{occurs ? <Link href={`/morphology${qs({ w })}`}>{w}</Link> : w}</td>
                  <td>{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">No entry matches “{q}”. {en ? "Try a single English word." : "Try a shorter beginning."}</p>
        )}
        {rows.length > LIMIT && <p className="note">Showing {LIMIT} of {rows.length}. Type more letters to narrow it.</p>}
      </section>
    </div>
  );
}
