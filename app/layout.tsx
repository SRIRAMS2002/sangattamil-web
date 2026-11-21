import type { Metadata } from "next";
import Link from "next/link";
import { Anek_Tamil, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";

// Anek Tamil (UI + condensed display headings) and Noto Serif Tamil (verse text).
const ui = Anek_Tamil({ subsets: ["tamil", "latin"], axes: ["wdth"], variable: "--font-ui" });
const verse = Noto_Serif_Tamil({ subsets: ["tamil", "latin"], variable: "--font-verse" });

export const metadata: Metadata = {
  title: { default: "சங்கத் தமிழ் | Sangam Corpus and Concordance", template: "%s | சங்கத் தமிழ்" },
  description:
    "Search the words of Sangam literature, every Thirukkural, and a morphological parse of classical Tamil texts. Prepared by Dr. A. Kamatchi.",
};

const NAV = [
  { href: "/thirukkural", label: "திருக்குறள்", color: "var(--marutham)" },
  { href: "/concordance", label: "சொல்லடைவு", color: "var(--kurinji)" },
  { href: "/morphology", label: "உருபனியல்", color: "var(--neythal)" },
  { href: "/dictionary", label: "அகராதி", color: "var(--mullai)" },
  { href: "/about", label: "About", color: "var(--paalai)" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ta" className={`${ui.variable} ${verse.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-head">
          <div className="wrap">
            <Link href="/" className="brand">
              <b>சங்கத் தமிழ்</b>
              <span>Sangam Corpus and Concordance by Dr. A. Kamatchi</span>
            </Link>
            <nav className="nav" aria-label="Main">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} style={{ "--hover": n.color } as React.CSSProperties}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-foot">
          <div className="wrap">
            <span>© 2022–2026 Dr. A. Kamatchi. All rights reserved.</span>
            <a href="mailto:kamatchi75@gmail.com">kamatchi75@gmail.com</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
