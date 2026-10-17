// The dot engine for the Rajinikanth film. One grid of dots covers the world (a 1080×1920 page); photos are placed
// in it as layers (moved, rotated, flipped, scaled), and every dot takes its size and colour from whatever photo lies
// under it. A camera looks at the world (zoom 1 = the whole page, zoom 20 = a single dot fills the frame).
// Effects bend the field: ripple, scatter, implode/explode, stutter, a disc mask. Drawn on a 2× canvas for 4K.
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const W = 1080, H = 1920;
export const GRID = 15; // world px between dots
const RES = 2; // canvas pixels per page pixel

// ---------- sources ----------
export type Src = { w: number; h: number; rgba: Uint8ClampedArray; lum: Float32Array };
const cache = new Map<string, Promise<Src>>();
const loadSrc = (name: string) => {
  if (!cache.has(name))
    cache.set(
      name,
      new Promise<Src>((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const g = c.getContext("2d")!;
          g.drawImage(img, 0, 0);
          const rgba = g.getImageData(0, 0, c.width, c.height).data;
          // luminance equalised inside the subject, so faces carry midtones and features read as dots
          const n = c.width * c.height, raw = new Float32Array(n), idx: number[] = [];
          for (let i = 0; i < n; i++) {
            raw[i] = (0.3 * rgba[i * 4] + 0.59 * rgba[i * 4 + 1] + 0.11 * rgba[i * 4 + 2]) / 255;
            if (rgba[i * 4 + 3] > 128) idx.push(i);
          }
          idx.sort((a, b) => raw[a] - raw[b]);
          const lum = new Float32Array(n).fill(1);
          idx.forEach((p, r) => (lum[p] = 0.7 * (r / Math.max(1, idx.length - 1)) + 0.3 * raw[p]));
          res({ w: c.width, h: c.height, rgba, lum });
        };
        img.onerror = rej;
        img.src = staticFile(`rajini/dots/${name}.png`);
      }),
    );
  return cache.get(name)!;
};
export const SOURCES = ["classic", "today", "robot", "namaste", "auto", "coin_one", "coin_lion", "shades", "keys", "watch"] as const;
export type SrcName = (typeof SOURCES)[number];
export const useSources = () => {
  const [srcs, setSrcs] = useState<Record<string, Src> | null>(null);
  const [handle] = useState(() => delayRender("dot sources"));
  useEffect(() => {
    Promise.all(SOURCES.map(loadSrc)).then((all) => {
      const m: Record<string, Src> = {};
      SOURCES.forEach((s, i) => (m[s] = all[i]));
      setSrcs(m);
      continueRender(handle);
    });
  }, [handle]);
  return srcs;
};

// ---------- scene description ----------
export type Mode = "color" | "mono" | "tint";
export type Layer = {
  src: SrcName;
  x: number; y: number; // centre, world px
  w: number; // width, world px
  rot?: number; // degrees
  sx?: number; sy?: number; // extra scale (a flip is sy going through 0)
  o?: number; // opacity 0..1 (scales dot size: crossfading two layers morphs the dots)
  mode?: Mode;
  tint?: [number, number, number];
  tone?: "dark" | "full"; // dark: size from darkness (faces); full: size from coverage (coloured objects)
};
export type Cam = { x: number; y: number; zoom: number; rot?: number };
export type Fx = {
  ripple?: { x: number; y: number; t: number; amp: number }; // t: seconds since the hit
  scatter?: number; // 0..1 dots thrown off their grid point
  burst?: { x: number; y: number; k: number }; // k 1 = dots flung out from (x, y), 0 = home
  disc?: { x: number; y: number; r: number }; // only dots inside the disc
  stutter?: boolean; // drop every other dot
  invert?: boolean; // white dots on black
  baseDot?: number; // size of the empty grid dot (0..1)
};

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const sample = (L: Layer, s: Src, px: number, py: number) => {
  const sx = (L.sx ?? 1) || 1e-4, sy = (L.sy ?? 1) || 1e-4;
  const scale = L.w / s.w;
  let dx = px - L.x, dy = py - L.y;
  if (L.rot) {
    const a = (-L.rot * Math.PI) / 180, c = Math.cos(a), si = Math.sin(a);
    [dx, dy] = [dx * c - dy * si, dx * si + dy * c];
  }
  const ix = Math.floor(dx / (scale * sx) + s.w / 2), iy = Math.floor(dy / (scale * Math.abs(sy)) + s.h / 2);
  if (ix < 0 || iy < 0 || ix >= s.w || iy >= s.h) return null;
  const p = iy * s.w + ix, a = s.rgba[p * 4 + 3] / 255;
  if (a < 0.4) return null;
  const tone = L.tone === "full" ? 0.55 + 0.45 * (1 - s.lum[p]) : Math.pow(1 - s.lum[p], 0.9);
  // the back of a flipped object reads a little darker
  const shade = sy < 0 ? 0.8 : 1;
  return { v: a * tone * (L.o ?? 1), r: s.rgba[p * 4] * shade, g: s.rgba[p * 4 + 1] * shade, b: s.rgba[p * 4 + 2] * shade };
};

export const DotField: React.FC<{ srcs: Record<string, Src>; layers: Layer[]; cam: Cam; fx?: Fx; ink?: string }> = ({ srcs, layers, cam, fx = {}, ink = "#0B0B0B" }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = fx.invert ? "#0B0B0B" : "#FFFFFF";
    g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(RES, 0, 0, RES, 0, 0);
    const z = cam.zoom, cr = ((cam.rot ?? 0) * Math.PI) / 180, cc = Math.cos(cr), cs = Math.sin(cr);
    const toScreen = (x: number, y: number): [number, number] => {
      const dx = (x - cam.x) * z, dy = (y - cam.y) * z;
      return [W / 2 + dx * cc - dy * cs, H / 2 + dx * cs + dy * cc];
    };
    // world range on screen (with a margin for rotation and scatter)
    const half = Math.hypot(W, H) / 2 / z + GRID * 3;
    const i0 = Math.floor((cam.x - half) / GRID), i1 = Math.ceil((cam.x + half) / GRID);
    const j0 = Math.floor((cam.y - half) / GRID), j1 = Math.ceil((cam.y + half) / GRID);
    const inkRGB = fx.invert ? [245, 245, 240] : [11, 11, 11];
    const base = fx.baseDot ?? 0.08;
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        let wx = i * GRID, wy = j * GRID;
        const id = i * 7919 + j * 104729;
        if (fx.stutter && (i + j) % 2 === 0) continue;
        if (fx.disc && Math.hypot(wx - fx.disc.x, wy - fx.disc.y) > fx.disc.r) continue;
        // pick the strongest layer under this dot
        let best: ReturnType<typeof sample> = null, bl: Layer | null = null;
        for (const L of layers) {
          const s = sample(L, srcs[L.src], wx, wy);
          if (s && (!best || s.v > best.v)) { best = s; bl = L; }
        }
        let size = base + (best ? best.v * (1 - base) : 0);
        // ripple: a ring of growth travelling out from the hit
        if (fx.ripple) {
          const d = Math.hypot(wx - fx.ripple.x, wy - fx.ripple.y), front = fx.ripple.t * 900;
          size *= 1 + fx.ripple.amp * Math.exp(-Math.pow((d - front) / 90, 2)) * Math.exp(-fx.ripple.t * 2);
        }
        // scatter and burst move the dot away from its grid point
        if (fx.scatter) {
          const a = hash(id) * Math.PI * 2, m = fx.scatter * (40 + hash(id + 1) * 160);
          wx += Math.cos(a) * m; wy += Math.sin(a) * m;
        }
        if (fx.burst && fx.burst.k > 0) {
          const dx = wx - fx.burst.x, dy = wy - fx.burst.y, d = Math.hypot(dx, dy) || 1;
          const m = fx.burst.k * (300 + hash(id + 2) * 900);
          wx += (dx / d) * m; wy += (dy / d) * m;
        }
        const [sx, sy] = toScreen(wx, wy);
        if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue;
        const r = (GRID / 2) * z * Math.min(1.25, size) * 0.92;
        if (r < 0.35) continue;
        let col: string;
        if (!best || !bl || bl.mode === "mono" || size < base + 0.02) {
          const k = best ? 1 : 0.18; // the bare grid is a faint grey
          col = best ? `rgb(${inkRGB[0]},${inkRGB[1]},${inkRGB[2]})` : fx.invert ? `rgba(245,245,240,${k})` : `rgba(11,11,11,${k})`;
        } else if (bl.mode === "tint" && bl.tint) {
          col = `rgb(${bl.tint[0]},${bl.tint[1]},${bl.tint[2]})`;
        } else {
          // photo colour, pushed a touch richer so dots stay vivid on white
          const m = (best.r + best.g + best.b) / 3, k = 1.25;
          col = `rgb(${Math.min(255, m + (best.r - m) * k) | 0},${Math.min(255, m + (best.g - m) * k) | 0},${Math.min(255, m + (best.b - m) * k) | 0})`;
        }
        g.fillStyle = col;
        g.beginPath();
        g.arc(sx, sy, r, 0, Math.PI * 2);
        g.fill();
      }
  });
  return <canvas ref={ref} width={W * RES} height={H * RES} style={{ position: "absolute", inset: 0, width: W, height: H }} data-ink={ink} />;
};
