import type { Metadata } from "next";
import Link from "next/link";
import { conLines, conLits, dictionary, grammar, kurals, morphLines, morphLits } from "@/lib/data";
import Image from "next/image";
import { PageHead } from "@/components/ui";
import { photos } from "@/lib/photos";

export const metadata: Metadata = { title: "About" };

const n = (x: number) => x.toLocaleString("en-IN");

export default function About() {
  return (
    <div className="wrap t-paalai">
      <PageHead title="About this work" land="paalai">
        A digital corpus, concordance and morphological analysis of classical Tamil literature, prepared by Dr. A. Kamatchi.
      </PageHead>
      <div className="prose">
        <Image className="about-banner" src={photos.banner.src} alt={photos.banner.alt} />
        <p>
          Sangam Tamil brings together the texts of the Sangam age and the Thirukkural in a form that can be searched word
          by word. Every line is kept in two forms: the original text (மூலபாடம்) as it is traditionally printed, and the
          sandhi-split reading (சந்தி பிரித்தது), where each word stands on its own. Searches run on the split reading, so a
          word is found even where sandhi has joined it to its neighbour.
        </p>

        <h2>What you can search</h2>
        <dl>
          <dt><Link href="/thirukkural">திருக்குறள்</Link></dt>
          <dd>{n(kurals.length)} kurals in 133 chapters: by chapter, number, opening word, closing word or any word.</dd>
          <dt><Link href="/concordance">சொல்லடைவு</Link></dt>
          <dd>{n(conLines.length)} lines from {conLits.length} texts: {conLits.join(", ")}.</dd>
          <dt><Link href="/morphology">உருபனியல்</Link></dt>
          <dd>{n(morphLines.length)} lines parsed into morphemes, with {grammar.length} grammatical markers: {morphLits.join(", ")}.</dd>
          <dt><Link href="/dictionary">அகராதி</Link></dt>
          <dd>English meanings for {n(dictionary.length)} words.</dd>
        </dl>

        <h2>திருவள்ளுவர்</h2>
        <p>
          Thiruvalluvar (திருவள்ளுவர்), commonly known as Valluvar, was a celebrated Tamil poet and philosopher. He is best
          known as the author of the Thirukkural, a collection of couplets on ethics, political and economic matters, and
          love.
        </p>

        <h2>Contact</h2>
        <div className="contact">
          <Image className="portrait" src={photos.portrait.src} alt={photos.portrait.alt} />
          <dl>
            <dt>Name</dt>
            <dd>Dr. A. Kamatchi</dd>
            <dt>Address</dt>
            <dd>6-6-47, Mega City, Nilakottai Town, Dindigul District, Tamil Nadu</dd>
            <dt>Phone</dt>
            <dd><a href="tel:+919442022507">+91 94420 22507</a></dd>
            <dt>Email</dt>
            <dd><a href="mailto:kamatchi75@gmail.com">kamatchi75@gmail.com</a></dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
