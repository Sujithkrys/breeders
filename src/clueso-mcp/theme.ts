export const C = {
  bg: "#0B0B0E",
  bgGlow: "#16161D",
  surface: "#141419",
  surface2: "#1B1B22",
  surface3: "#24242D",
  surface4: "#2E2E39",
  line: "#2A2A34",
  lineSoft: "#1F1F27",
  text: "#F4F4F6",
  text2: "#C9C9D1",
  muted: "#8E8E9B",
  faint: "#5A5A67",
  pink: "#F881E5",
  magenta: "#C93BB7",
  accent: "#E35BD0",
  ok: "#4CC38A",
  warn: "#F2B35B",
  danger: "#E5484D",
  // The fictional product being demoed inside recordings.
  acme: "#4F7CFF",
  acmeDeep: "#0E1633",
};

export const GRADIENT = `linear-gradient(225deg, ${C.pink} 0%, ${C.magenta} 100%)`;

export const FONT = {
  sans: "Inter, sans-serif",
  display: "Geist, Inter, sans-serif",
  mono: "'Geist Mono', monospace",
};

// Color of the "works with" agent marks — monochrome per the brief.
export const MARK_COLOR = C.text;

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Timings in 30fps units (1 unit = 1/30 s). 44s = 1320 units.
// Problem is 150 units: the "Repeat" freeze holds 0.8s before dissolving into the MCP scene.
export const SCENES = {
  coldOpen: { from: 0, dur: 120 },
  problem: { from: 120, dur: 150 },
  mcp: { from: 270, dur: 240 },
  describe: { from: 510, dur: 210 },
  ship: { from: 720, dur: 150 },
  proof: { from: 870, dur: 210 },
  offer: { from: 1080, dur: 90 },
  finale: { from: 1170, dur: 150 },
} as const;

export const DISSOLVE = 15;
export const TOTAL_UNITS = 1320;
