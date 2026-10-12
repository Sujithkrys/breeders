// Dot world: every scene is a lit 2.5D scene described with signed-distance shapes (people, counters, gates, buildings)
// and rendered only as glowing dots on a hex grid, the same language as the world map. Brightness sets dot size,
// a gold mask marks whoever is paying. Drawn on a canvas at 2× so it stays sharp at 4K.
import React, { useLayoutEffect, useRef } from "react";
import { random } from "remotion";

export type Sample = { v: number; gold: number };
export type Field = (x: number, y: number) => Sample;

// ---------- signed distance helpers (pixels; negative = inside) ----------
export const sdCircle = (x: number, y: number, cx: number, cy: number, r: number) => Math.hypot(x - cx, y - cy) - r;
export const sdBox = (x: number, y: number, cx: number, cy: number, hw: number, hh: number, r = 0) => {
  const qx = Math.abs(x - cx) - (hw - r);
  const qy = Math.abs(y - cy) - (hh - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
export const sdCapsule = (x: number, y: number, ax: number, ay: number, bx: number, by: number, r: number) => {
  const pax = x - ax, pay = y - ay, bax = bx - ax, bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay || 1)));
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
};
export const fill = (d: number, soft = 1.5) => Math.max(0, Math.min(1, 0.5 - d / soft));
export const rim = (d: number, w = 5) => Math.max(0, 1 - Math.abs(d) / w);
export const glowOf = (d: number, w: number) => (d < 0 ? 1 : Math.exp(-d / w));

// ---------- a person: head, torso, two arms, two legs; `walk` in cycles, `reach` 0..1 lifts the right hand to (tx, ty) ----------
export type Pose = { x: number; y: number; s: number; walk: number; reach: number; tx: number; ty: number; dir?: 1 | -1 };
export const personSD = (px: number, py: number, p: Pose) => {
  const { x, y, s, walk, reach, tx, ty } = p;
  const dir = p.dir ?? 1;
  const sw = Math.sin(walk * Math.PI * 2);
  const bob = Math.abs(Math.cos(walk * Math.PI * 2)) * 3 * s;
  const hipY = y - 92 * s - bob;
  const shY = y - 158 * s - bob;
  let d = sdCircle(px, py, x + 2 * s * dir, y - 186 * s - bob, 15 * s);
  d = Math.min(d, sdCapsule(px, py, x, shY, x, hipY, 20 * s));
  // legs
  for (const k of [1, -1]) d = Math.min(d, sdCapsule(px, py, x, hipY, x + sw * k * 26 * s * dir, y - 4 * s, 9 * s));
  // back arm swings
  d = Math.min(d, sdCapsule(px, py, x - 4 * s * dir, shY + 4 * s, x - sw * 22 * s * dir, hipY + 8 * s, 7.5 * s));
  // front arm: swings while walking, reaches to the target when paying
  const hx0 = x + sw * 22 * s * dir, hy0 = hipY + 8 * s;
  const hx = hx0 + (tx - hx0) * reach, hy = hy0 + (ty - hy0) * reach;
  const ex = (x + 6 * s * dir + hx) / 2 + 10 * s * dir * reach, ey = (shY + hy) / 2 + 14 * s * (1 - reach);
  d = Math.min(d, sdCapsule(px, py, x + 6 * s * dir, shY + 4 * s, ex, ey, 7.5 * s), sdCapsule(px, py, ex, ey, hx, hy, 7 * s));
  // the phone in that hand
  const phone = sdBox(px, py, hx + 4 * s * dir, hy - 10 * s, 7 * s, 13 * s, 2 * s);
  return { d, phone, hand: { x: hx, y: hy } };
};

// ---------- canvas renderer ----------
export const DotCanvas: React.FC<{ field: Field; step?: number; tint?: [number, number, number]; gold?: [number, number, number]; opacity?: number; seed?: string; maxR?: number; gain?: number; light?: boolean }> = ({
  field,
  step = 9,
  tint = [232, 236, 246],
  gold = [255, 196, 110],
  opacity = 1,
  seed = "dw",
  maxR = 3.6,
  gain = 1.25,
  light = true,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const S = 2;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.clearRect(0, 0, 1920, 1080);
    const glow: [number, number, number, number][] = [];
    let row = 0;
    for (let y = step / 2; y < 1080; y += step * 0.866, row++) {
      for (let x = step / 2 + (row % 2 ? step / 2 : 0); x < 1920; x += step) {
        const f = field(x, y);
        const v = f.v * gain;
        const g = f.gold;
        if (v < (light ? 0.075 : 0.025)) continue;
        const r = 0.45 + Math.min(1, v) * maxR;
        const j = 0.92 + random(`${seed}${row}_${Math.round(x)}`) * 0.16;
        // dark mode: light dots on black. light mode (Apple white): grey → ink dots on white, gold stays gold.
        // on white, a contrast curve so mid-tone shapes (people, counters, cars) print as solid ink, not pale grey
        const tone = light ? Math.pow(Math.min(1, v), 0.55) : 0;
        const base = light ? [212 - tone * 183, 212 - tone * 183, 216 - tone * 185] : tint;
        const gc = light ? [232, 158, 34] : gold;
        const R = Math.round((base[0] + (gc[0] - base[0]) * g) * (light ? 1 : j));
        const G = Math.round((base[1] + (gc[1] - base[1]) * g) * (light ? 1 : j));
        const B = Math.round((base[2] + (gc[2] - base[2]) * g) * (light ? 1 : j));
        ctx.fillStyle = `rgba(${Math.min(255, R)},${Math.min(255, G)},${Math.min(255, B)},${light ? 1 : Math.min(1, 0.35 + v)})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (g > 0.3 && v > 0.2) glow.push([x, y, r, g]);
      }
    }
    // soft bloom on gold dots
    ctx.globalCompositeOperation = light ? "source-over" : "lighter";
    for (const [x, y, r, g] of glow) {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      grd.addColorStop(0, light ? `rgba(245,166,35,${0.14 * g})` : `rgba(255,170,70,${0.22 * g})`);
      grd.addColorStop(1, "rgba(255,170,70,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
    }
    ctx.globalCompositeOperation = "source-over";
  });
  return <canvas ref={ref} width={3840} height={2160} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, opacity }} />;
};
