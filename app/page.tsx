import Link from "next/link";
import Image from "next/image";
import { photos, type Land } from "@/lib/photos";
import Form from "next/form";
import { Suspense } from "react";
import { connection } from "next/server";
import { chapters, conLines, conLits, conWords, dictionary, grammar, kurals, morphLines, type Kural } from "@/lib/data";
import { qs } from "@/components/ui";

const n = (x: number) => x.toLocaleString("en-IN");

const TOOLS = [
  {
    href: "/thirukkural", land: "marutham" as Land, theme: "t-marutham",
    title: "திருக்குறள்",
    desc: "அதிகாரம், குறள் எண், முதல் சொல், கடைசிச் சொல் அல்லது ஏதேனும் ஒரு சொல்லால் தேடுங்கள்.",
    stat: `${n(kurals.length)} குறள், ${chapters.length} அதிகாரம்`,
  },
  {
    href: "/concordance", land: "kurinji" as Land, theme: "t-kurinji",
    title: "சங்க இலக்கியச் சொற்களும் அவற்றின் வருகையும்",
    desc: "ஒரு சொல் எந்த நூலில், எந்தப் பாடலில், எந்த அடியில் வருகிறது என்று காணுங்கள்.",
    stat: `${conLits.length} நூல்கள், ${n(conLines.length)} அடிகள், ${n(conWords.length)} சொற்கள்`,
  },
  {
    href: "/morphology", land: "neythal" as Land, theme: "t-neythal",
    title: "தமிழ்ச் செவ்விலக்கியங்களின் உருபனியல் பகுப்புத் தொகுப்பு",
    desc: "ஒவ்வோர் அடியும் உருபன்களாகப் பகுக்கப்பட்டுள்ளது. சொல் அல்லது இலக்கணக் கூறு கொண்டு தேடுங்கள்.",
    stat: `${n(morphLines.length)} அடிகள், ${grammar.length} இலக்கணக் கூறுகள்`,
  },
  {
    href: "/dictionary", land: "mullai" as Land, theme: "t-mullai",
    title: "சங்க அகராதி",
    desc: "சங்கச் சொற்களுக்கான ஆங்கிலப் பொருள். தமிழிலோ ஆங்கிலத்திலோ தேடலாம்.",
    stat: `${n(dictionary.length)} சொற்கள்`,
  },
  {
    href: "/about", land: "paalai" as Land, theme: "t-paalai",
    title: "About this work",
    desc: "How the corpus was prepared, what each search covers, and how to reach Dr. A. Kamatchi.",
    stat: "",
  },
];

export default function Home() {
  return (
    <>
      <div className="wrap">
        <Image className="banner" src={photos.banner.src} alt={photos.banner.alt} preload />
      </div>
      <section className="wrap hero">
        <Suspense fallback={<KuralFigure k={kurals[0]} />}>
          <KuralOfTheDay />
        </Suspense>
        <div className="hero-side">
          <h1>சங்கத் தமிழ்ச் சொல்லடைவு</h1>
          <p>
            Sangam literature, Thirukkural and classical Tamil texts, searchable word by word.
            Prepared by Dr. A. Kamatchi.
          </p>
          <Form action="/concordance" className="field t-kurinji">
            <label htmlFor="home-q">ஒரு சொல்லைத் தேடுங்கள்</label>
            <input id="home-q" name="q" type="search" placeholder="எ.கா. கொன்றை" required />
            <button className="btn" type="submit">தேடு</button>
          </Form>
        </div>
      </section>

      <section className="wrap" aria-label="தேடல் கருவிகள்">
        <ul className="tinai">
          {TOOLS.map((t) => (
            <li key={t.href} className={t.theme}>
              <Link href={t.href}>
                <Image className="tinai-photo" src={photos[t.land].src} alt={photos[t.land].alt} />
                <span>
                  <span className="tinai-title">{t.title}</span>
                  <span className="tinai-desc">{t.desc}</span>
                </span>
                <span className="tinai-stat">{t.stat}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** A different kural each day, picked from the date at request time. */
async function KuralOfTheDay() {
  await connection(); // render per request, so the date is today's and not the build date
  return <KuralFigure k={kurals[daysSinceEpoch() % kurals.length]} />;
}

function daysSinceEpoch() {
  return Math.floor(Date.now() / 86_400_000);
}

function KuralFigure({ k }: { k: Kural }) {
  return (
    <figure className="hero-kural">
      {k.orig.map((line, i) => (
        <p key={i} className="verse">{line}</p>
      ))}
      <figcaption>
        இன்றைய குறள் {k.n}, {chapters[k.ch - 1]}.{" "}
        <Link href={`/thirukkural${qs({ by: "chapter", ch: k.ch })}`}>அதிகாரம் முழுவதும் படிக்க</Link>
      </figcaption>
    </figure>
  );
}
