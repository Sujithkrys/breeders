// The Sonnet film's type system: one family (Instrument Sans, free on Google Fonts) at four sizes only.
// Hero 160 · Headline 96 · Sub 44 · Label 24. Medium for display, regular for text, tight tracking on the big sizes.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const SANS = "'Instrument Sans', 'Inter', sans-serif";
export const SIZE = { hero: 160, headline: 96, sub: 44, label: 24 } as const;
export const TRACK = { hero: "-0.045em", headline: "-0.035em", sub: "-0.015em", label: "0.01em" } as const;
export const COLOR = { ink: "#141413", sub: "#6B6A64", faint: "#9B998F", paper: "#F2EFE8", clay: "#D27454", cream: "#FAF8F3" } as const;
let loaded = false;
export const loadInstrument = () => {
  if (loaded) return;
  loaded = true;
  for (const w of ["400", "500", "600"]) loadFont({ family: "Instrument Sans", weight: w, url: staticFile(`fonts/instrument/InstrumentSans-${w}.ttf`) });
};
