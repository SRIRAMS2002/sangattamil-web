// Photos cropped from the original site banner (TAMIL LANGUAGE/Screenshot/Sangam Corpus.png).
// Static imports let next/image read width/height at build time.
import banner from "@/public/images/banner.png";
import kurinji from "@/public/images/kurinji.png";
import mullai from "@/public/images/mullai.png";
import marutham from "@/public/images/marutham.png";
import neythal from "@/public/images/neythal.png";
import paalai from "@/public/images/paalai.png";
import portrait from "@/public/images/portrait.png";

export const photos = {
  banner: { src: banner, alt: "Sangam Corpus and Concordance by Dr. A. Kamatchi: the five Sangam landscapes and their flowers" },
  kurinji: { src: kurinji, alt: "குறிஞ்சி மலர்" },
  mullai: { src: mullai, alt: "முல்லை மலர்" },
  marutham: { src: marutham, alt: "மருதம் மலர்" },
  neythal: { src: neythal, alt: "நெய்தல் மலர்" },
  paalai: { src: paalai, alt: "பாலை மலர்" },
  portrait: { src: portrait, alt: "Dr. A. Kamatchi" },
};

export type Land = "kurinji" | "mullai" | "marutham" | "neythal" | "paalai";
