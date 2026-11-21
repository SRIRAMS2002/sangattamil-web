// Small presentational pieces shared by the tool pages. Server components only.
import Link from "next/link";
import Image from "next/image";
import type { Line } from "@/lib/data";
import { photos, type Land } from "@/lib/photos";

export function PageHead({ title, land, children }: { title: string; land: Land; children: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      <Image className="page-head-photo" src={photos[land].src} alt={photos[land].alt} preload />
    </div>
  );
}

/** Text with matches highlighted: whole tokens equal to `token`, or every `sub` substring. */
export function Marked({ text, token, sub }: { text: string; token?: string; sub?: string }) {
  if (token) {
    return text.split(" ").map((t, i) => (
      <span key={i}>
        {i > 0 && " "}
        {t === token ? <mark>{t}</mark> : t}
      </span>
    ));
  }
  if (sub) {
    return text.split(sub).map((part, i) => (
      <span key={i}>
        {i > 0 && <mark>{sub}</mark>}
        {part}
      </span>
    ));
  }
  return text;
}

/** One numbered poem is a citation "poem:line"; the ten long poems only need the line number. */
export function cite(lits: string[], l: Line, singlePoem: Set<number>) {
  if (singlePoem.has(l[0])) return `${lits[l[0]]}, அடி ${l[2]}`;
  return `${lits[l[0]]} ${l[1] === 0 ? "கடவுள் வாழ்த்து" : l[1]}:${l[2]}`;
}

export function LineList({
  lines, lits, singlePoem, token, sub,
}: { lines: Line[]; lits: string[]; singlePoem: Set<number>; token?: string; sub?: string }) {
  return (
    <ol className="lines">
      {lines.map((l, i) => (
        <li key={i}>
          <span className="seg verse"><Marked text={l[3]} token={token} sub={sub} /></span>
          <span className="orig verse">{sub ? <Marked text={l[4]} sub={sub} /> : l[4]}</span>
          <cite>{cite(lits, l, singlePoem)}</cite>
        </li>
      ))}
    </ol>
  );
}

export function Letters({ base, current, param = "q" }: { base: string; current?: string; param?: string }) {
  const letters = "அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ க ங ச ஞ ட த ந ப ம ய வ".split(" ");
  const sep = base.includes("?") ? "&" : "?";
  return (
    <nav className="letters" aria-label="முதல் எழுத்து">
      {letters.map((c) => (
        <Link key={c} href={`${base}${sep}${param}=${encodeURIComponent(c)}`} aria-current={current === c}>
          {c}
        </Link>
      ))}
    </nav>
  );
}

/** Build a query string from the non-empty entries. */
export function qs(params: Record<string, string | number | undefined>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") s.set(k, String(v));
  const out = s.toString();
  return out ? `?${out}` : "";
}
