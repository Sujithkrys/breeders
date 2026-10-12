export const L = {
  bg0: "#FFFFFF",
  bg1: "#F3F4F7",
  bg2: "#E9EBF0",
  ink: "#0F1115",
  ink2: "#2A2D33",
  gray: "#A3A7B0",
  line: "rgba(15,17,21,0.08)",
  lavender: "#B9B4FF",
  blue: "#8FB2FF",
  mint: "#5FE0B4",
  gold: "#FFC93C",
  orange: "#FF8A1F",
  leaf: "#3DBE6E",
};
export const DISPLAY = "'Inter Tight', Inter, sans-serif";
export const SANS = "Inter, sans-serif";

export const FPS = 60;
// Shot timeline in 30fps units (1s = 30), mapped from the storyboard; every boundary sits on a 120 BPM beat.
export const SHOTS = {
  logo: [0, 30],
  ideas: [30, 60],
  field: [60, 90],
  prompt: [90, 150],
  pinepro: [150, 180],
  turn: [180, 210],
  creates: [210, 240],
  styles: [240, 270],
  cinematic: [270, 300],
  anystyle: [300, 330],
  poster: [330, 360],
  usecases: [360, 390],
  creators: [390, 420],
  workflow: [420, 480],
  sphere: [480, 510],
  fast: [510, 540],
  control: [540, 570],
  outcome: [570, 630],
  cta: [630, 660],
  brand: [660, 690],
  final: [690, 750],
} as const;
export const TOTAL_UNITS = 750;
