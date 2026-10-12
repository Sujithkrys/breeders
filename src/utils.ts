import { loadFont } from "@remotion/fonts";
import {
  Easing,
  interpolate,
  spring,
  SpringConfig,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const u = (n: number) => n * 8;

// Animations are authored in 30fps "units" so the render fps can change without re-timing.
export const BASE_FPS = 30;

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * BASE_FPS) / fps;
};

export const toFrames = (units: number, fps: number) => Math.round((units * fps) / BASE_FPS);

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: (t: number) => t,
};

export const ramp = (
  t: number,
  [t0, t1]: [number, number],
  [v0, v1]: [number, number] = [0, 1],
  easing: (x: number) => number = ease.out,
) =>
  interpolate(t, [t0, t1], [v0, v1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Piecewise keyframes; easing applies to each segment.
export const kf = (
  t: number,
  times: number[],
  values: number[],
  easing: (x: number) => number = ease.inOut,
) => interpolate(t, times, values, { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const SPRING_POP: Partial<SpringConfig> = { damping: 14, stiffness: 170, mass: 0.7 };
export const SPRING_SOFT: Partial<SpringConfig> = { damping: 22, stiffness: 110, mass: 0.9 };

export const pop = (t: number, delay = 0, config: Partial<SpringConfig> = SPRING_POP) =>
  spring({ frame: Math.max(0, t - delay), fps: BASE_FPS, config });

// Scale that jumps up at `at` and springs back to 1 — a "zoom-punch".
export const punch = (t: number, at: number, amount = 0.08) =>
  t < at
    ? 1
    : interpolate(
        spring({ frame: t - at, fps: BASE_FPS, config: { damping: 16, stiffness: 200 } }),
        [0, 1],
        [1 + amount, 1],
      );

export const typed = (text: string, t: number, start: number, perUnit: number) =>
  text.slice(0, Math.max(0, Math.floor((t - start) * perUnit)));

const FONT_FILES: [family: string, weight: string, file: string][] = [
  ["Inter", "400", "inter-latin-400-normal.woff2"],
  ["Inter", "500", "inter-latin-500-normal.woff2"],
  ["Inter", "600", "inter-latin-600-normal.woff2"],
  ["Geist", "400", "geist-sans-latin-400-normal.woff2"],
  ["Geist", "500", "geist-sans-latin-500-normal.woff2"],
  ["Geist", "600", "geist-sans-latin-600-normal.woff2"],
  ["Geist", "700", "geist-sans-latin-700-normal.woff2"],
  ["Geist Mono", "400", "geist-mono-latin-400-normal.woff2"],
  ["Geist Mono", "500", "geist-mono-latin-500-normal.woff2"],
  ...["300", "400", "500", "600", "700", "800"].map((w): [string, string, string] => ["Inter Tight", w, `inter-tight-latin-${w}-normal.woff2`]),
  ...["300", "400", "500", "600"].map((w): [string, string, string] => ["Figtree", w, `figtree-latin-${w}-normal.woff2`]),
  ["Instrument Serif", "400", "instrument-serif-latin-400-normal.woff2"],
  ["Sora", "600", "sora-latin-600-normal.woff2"],
  ["Anton", "400", "anton-latin-400-normal.woff2"],
  ["Sora", "700", "sora-latin-700-normal.woff2"],
  ...(
    [
      ["Devanagari", "devanagari"],
      ["Telugu", "telugu"],
      ["Tamil", "tamil"],
      ["Kannada", "kannada"],
      ["Bengali", "bengali"],
      ["Malayalam", "malayalam"],
      ["Gujarati", "gujarati"],
      ["Gurmukhi", "gurmukhi"],
      ["Oriya", "oriya"],
    ] as const
  ).flatMap(([name, slug]) =>
    ["300", "400"].map((w): [string, string, string] => [`Noto Sans ${name}`, w, `noto-sans-${slug}-${slug}-${w}-normal.woff2`]),
  ),
];

let fontsLoaded = false;
export const loadFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  for (const [family, weight, file] of FONT_FILES) {
    loadFont({ family, weight, url: staticFile(`fonts/${file}`) });
  }
};
