export const PINK = "#F881E5";
export const MAG = "#C93BB7";
export const GRAD = `linear-gradient(225deg, ${PINK} 0%, ${MAG} 100%)`;
export const TINT: [string, string, string] = ["#FFD3F7", "#E35BD0", "240,110,220"];

// Shot timeline in 30fps units; 120 BPM, one beat = 15 units. Same grammar as the Pine Pro launch.
export const SHOT = {
  open: [0, 120],
  blocks: [120, 172],
  great: [172, 255],
  connect: [255, 300],
  voice: [300, 480],
  steps: [480, 600],
  answer: [600, 690],
  film: [690, 900],
  refine: [900, 1080],
  tagline: [1080, 1140],
  montage: [1140, 1260],
  cta: [1260, 1350],
  logo: [1350, 1410],
} as const;
export const TOTAL = 1410;
