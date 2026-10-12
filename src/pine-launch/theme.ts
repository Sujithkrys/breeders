export const FPS = 60;
export const SANS = "Inter, sans-serif";
export const TIGHT = "'Inter Tight', Inter, sans-serif";
export const INK = "#0D0D0D";
export const GRAY = "#8F8F8F";
export const LINE = "#E6E6E6";

// Shot timeline in 30fps units (1s = 30). The music runs at 120 BPM, so one beat = 15 units; every cut sits on a beat.
export const SHOT = {
  open: [0, 120],
  blocks: [120, 172],
  great: [172, 255],
  toggle: [255, 300],
  voice: [300, 480],
  steps: [480, 600],
  answer: [600, 690],
  film: [690, 900],
  refine: [900, 1080],
  tagline: [1080, 1140],
  montage: [1140, 1260],
  cta: [1260, 1320],
  logo: [1320, 1380],
} as const;
export const TOTAL = 1380;
