// Colors sampled from Sarvam's "Introducing Content Studio" film and the live Content Studio UI.
export const C = {
  fieldTop: "#88BF5A",
  fieldMid: "#A8D185",
  fieldCream: "#E8E6B4",
  glow: "#C6E3A6",
  glowSoft: "#DCEFC8",
  white: "#FFFFFF",
  stage: "#F0F0F0",
  ink: "#0F0F10",
  ink2: "#2B2B2E",
  muted: "#7A7A80",
  faint: "#B4B4B8",
  line: "#E7E7E7",
  pill: "#EFEFEF",
  hover: "#F4F4F4",
  sarvamGreen: "#7CBF3F",
  newBg: "#E4F4D6",
  newText: "#4B7F23",
  maleBg: "#E8EDFF",
  maleText: "#3D5AD6",
  femaleBg: "#FDE8F0",
  femaleText: "#D03C74",
  offerBg: "#E6ECFF",
  offerText: "#3F51C4",
  waveTop: "#332D8D",
  waveMid: "#3E3EB8",
  waveLow: "#6481DD",
  waveEnd: "#7AA4EE",
  record: "#E5B83A",
  orange1: "#F6A553",
  orange2: "#E8721F",
  hatRed: "#D2232A",
};

const INDIC = [
  "Noto Sans Devanagari",
  "Noto Sans Telugu",
  "Noto Sans Tamil",
  "Noto Sans Kannada",
  "Noto Sans Bengali",
  "Noto Sans Malayalam",
  "Noto Sans Gujarati",
  "Noto Sans Gurmukhi",
  "Noto Sans Oriya",
]
  .map((f) => `'${f}'`)
  .join(", ");

// Closest free stand-ins for Sarvam's Season Mix (headlines) and Matter (UI).
export const FONT = {
  display: `'Inter Tight', ${INDIC}, sans-serif`,
  serif: `'Instrument Serif', serif`,
  ui: `Figtree, ${INDIC}, sans-serif`,
  logo: `Geist, sans-serif`,
  mono: `'Geist Mono', monospace`,
};

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Scene starts in seconds; every cut lands on a 2s bar of the 120 BPM soundtrack.
export const SCENES = {
  hook: [0, 4],
  meet: [4, 8],
  workspace: [8, 12],
  dubbing: [12, 22],
  tts: [22, 30],
  clone: [30, 36],
  library: [36, 42],
  everything: [42, 46],
  audience: [46, 50],
  lockup: [50, 54],
  outro: [54, 57],
} as const;

export const TOTAL_SEC = 57;
