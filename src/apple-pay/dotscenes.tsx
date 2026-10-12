// Dot-world scenes for the Apple Pay India film. Each returns a Field: brightness + gold for any point at time `s`.
import { random } from "remotion";
import { ease, ramp } from "../utils";
import { Field, fill, glowOf, personSD, rim, sdBox, sdCapsule, sdCircle } from "./dotworld";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---------- an Indian city skyline at night: buildings with lit windows, a tower, traffic trails on the road ----------
type Bld = { x: number; w: number; h: number; seed: number };
const BLDS: Bld[] = (() => {
  const out: Bld[] = [];
  let x = -40;
  let i = 0;
  while (x < 1980) {
    const w = 60 + random(`bw${i}`) * 110;
    const tall = random(`bt${i}`);
    const h = 120 + tall * tall * 300; // kept low: the white film sets its titles in clear sky above
    out.push({ x: x + w / 2, w, h, seed: i });
    x += w + 6 + random(`bg${i}`) * 14;
    i++;
  }
  return out;
})();
const GROUND = 860;
const GATE_X = 470;
const indiaGate = (x: number, y: number) => {
  if (Math.abs(x - GATE_X) > 150 || y < GROUND - 330 || y > GROUND) return { v: 0, gold: 0 };
  const base = GROUND - 22;
  const ped = sdBox(x, y, GATE_X, GROUND - 11, 140, 11, 2);
  const body = sdBox(x, y, GATE_X, base - 120, 108, 120, 2);
  const arch = Math.min(sdBox(x, y, GATE_X, base - 75, 38, 75, 0), sdCircle(x, y, GATE_X, base - 150, 38));
  const cornice = sdBox(x, y, GATE_X, base - 246, 120, 8, 2);
  const attic = sdBox(x, y, GATE_X, base - 278, 82, 24, 2);
  const bowl = sdBox(x, y, GATE_X, base - 312, 44, 12, 10);
  const solid = Math.min(ped, Math.max(body, -arch), cornice, attic, bowl);
  if (solid > 3) return { v: 0, gold: 0 };
  let v = solid < 0 ? 0.42 : rim(solid, 3) * 0.7;
  if (solid < 0 && Math.abs(y - (base - 205)) < 4) v = 0.75; // the inscription band
  if (solid < 0 && arch > 0 && Math.abs(arch) < 7) v = 0.8; // the arch's moulding
  return { v, gold: 0 };
};
const autoRickshaw = (x: number, y: number, ax: number, wy: number) => {
  if (Math.abs(x - ax) > 80 || y < wy - 110 || y > wy + 16) return { v: 0, gold: 0 };
  const canopy = sdBox(x, y, ax - 6, wy - 82, 54, 22, 20);
  const body = sdBox(x, y, ax - 4, wy - 36, 60, 26, 12);
  const nose = sdBox(x, y, ax + 54, wy - 48, 14, 34, 8);
  const pillar = sdCapsule(x, y, ax + 40, wy - 62, ax + 44, wy - 30, 3);
  const wheels = Math.min(sdCircle(x, y, ax - 38, wy - 4, 13), sdCircle(x, y, ax + 50, wy - 4, 12));
  const d = Math.min(canopy, body, nose, pillar, wheels);
  if (d > 3) return { v: 0, gold: 0 };
  return { v: d < 0 ? (canopy < 0 ? 0.5 : wheels < 0 ? 0.85 : 0.4) : rim(d, 3) * 0.7, gold: canopy < 0 || nose < 0 ? 0.9 : 0 };
};
export const skyline =
  (s: number): Field =>
  (x, y) => {
    let v = 0.02 + 0.04 * clamp01(1 - y / 900);
    // a soft warm glow over the city
    v += 0.06 * Math.exp(-((y - GROUND) ** 2) / 60000);
    // India Gate, in open ground left of centre: pedestal, the arch, cornice, attic and the shallow bowl on top
    const gate = indiaGate(x, y);
    if (gate.v > 0) return { v: Math.max(v, gate.v), gold: gate.gold };
    for (const b of BLDS) {
      if (Math.abs(b.x - GATE_X) < b.w / 2 + 170) continue;
      if (Math.abs(x - b.x) > b.w / 2 + 3 || y < GROUND - b.h - 3 || y > GROUND) continue;
      const d = sdBox(x, y, b.x, GROUND - b.h / 2, b.w / 2, b.h / 2, 3);
      if (d > 2) continue;
      v = Math.max(v, 0.09 + rim(d, 3) * 0.22);
      // windows: a grid, some lit, a few switching on and off
      const wx = Math.floor((x - (b.x - b.w / 2) - 8) / 18);
      const wy = Math.floor((y - (GROUND - b.h) - 10) / 24);
      const inX = (x - (b.x - b.w / 2) - 8) % 18 < 9;
      const inY = (y - (GROUND - b.h) - 10) % 24 < 12;
      if (wx >= 0 && wy >= 0 && inX && inY && x < b.x + b.w / 2 - 8 && y < GROUND - 14) {
        const k = random(`w${b.seed}_${wx}_${wy}`);
        const on = k > 0.6 || (k > 0.54 && Math.sin(s * 1.3 + k * 40) > 0.2);
        if (on) v = Math.max(v, 0.45 + 0.45 * random(`wb${b.seed}_${wx}_${wy}`));
      }
    }
    // road + traffic trails
    if (y > GROUND && y < GROUND + 90) {
      v = Math.max(v, 0.06);
      for (let lane = 0; lane < 2; lane++) {
        const ly = GROUND + 28 + lane * 34;
        if (Math.abs(y - ly) < 5) {
          const dir = lane ? -1 : 1;
          for (let c = 0; c < 9; c++) {
            const cx = ((((s * 380 * dir + c * 233 + lane * 117) % 2200) + 2200) % 2200) - 140;
            const dx = (x - cx) * dir;
            if (dx < 0 && dx > -90) v = Math.max(v, 0.85 * (1 + dx / 90));
          }
        }
      }
    }
    // an auto-rickshaw puttering along the near lane (yellow canopy = gold)
    const ax = ((s * 210 + 900) % 2300) - 180; // crosses below the title during 10–13s
    const au = autoRickshaw(x, y, ax, GROUND + 84);
    if (au.v > 0) return au;
    return { v, gold: y > GROUND && y < GROUND + 90 ? 0.55 : 0 };
  };

// ---------- metro station: perspective ceiling lights and floor, a row of gates, commuters; one pays and turns gold ----------
const VP = { x: 960, y: 470 };
const GATES = [560, 800, 1040, 1280];
export const METRO = { tap: 5.7, reader: { x: 1040, y: 596 } };
export const metro =
  (s: number, t0: number): Field =>
  (x, y) => {
    const k = s - t0;
    let v = 0.03;
    // back wall + signage
    if (y > 250 && y < 720) v = 0.055 + 0.02 * Math.sin(x / 140);
    const sign = sdBox(x, y, 1500, 310, 150, 38, 10);
    if (sign < 0) v = Math.max(v, 0.32);
    v = Math.max(v, rim(sign, 3) * 0.75);
    const logo = sdCircle(x, y, 1310, 310, 34);
    v = Math.max(v, rim(logo, 4) * 0.9, logo < 0 ? 0.18 : 0);
    // ceiling: rows of light panels receding to the vanishing point (perspective: scale = 1 / depth)
    if (y < VP.y - 30) {
      for (let z = 1.15; z < 9; z *= 1.32) {
        const sc = 1 / z;
        const cy = VP.y - 470 * sc;
        if (Math.abs(y - cy) > 40 * sc + 14) continue;
        for (let c = -3; c <= 3; c++) {
          const cx = VP.x + c * 330 * sc;
          const d = sdBox(x, y, cx, cy, 120 * sc, 9 * sc + 1, 4 * sc);
          v = Math.max(v, d < 0 ? 0.12 : 0.05 * glowOf(d, 10 * sc + 3));
        }
      }
    }
    // floor tiles converging on the vanishing point
    if (y > 720) {
      const tt = (y - VP.y) / (1080 - VP.y);
      const fx = (x - VP.x) / tt;
      const line = Math.abs(((fx % 220) + 220) % 220 - 110) < 3 / tt;
      const zrow = Math.abs(((1 / tt) * 90 + k * 0) % 60 - 30) < 2.2;
      v = Math.max(v, 0.07 + (line ? 0.22 : 0) + (zrow ? 0.12 : 0));
    }
    // gates: pillars, readers on top, glass flaps between that open after the tap
    const open = ramp(s, [METRO.tap + 0.35, METRO.tap + 0.85], [0, 1], ease.inOut);
    let gold = 0;
    const goldK = ramp(s, [METRO.tap, METRO.tap + 0.25], [0, 1], ease.out);
    for (const gx of GATES) {
      const p = sdBox(x, y, gx, 760, 24, 140, 8);
      v = Math.max(v, p < 0 ? 0.3 + 0.25 * clamp01((760 - y) / 140) : 0, rim(p, 3) * 0.6);
      const rd = sdCircle(x, y, gx, 596, 15);
      const isOurs = gx === METRO.reader.x;
      if (rd < 0) {
        v = Math.max(v, 0.85);
        if (isOurs) gold = Math.max(gold, goldK);
      } else v = Math.max(v, glowOf(rd, 10) * 0.35);
      if (gx !== GATES[GATES.length - 1]) {
        const shut = isOurs ? 1 - open : 1;
        const fl = sdBox(x, y, gx + 24 + 48 * shut, 712, 48 * shut, 52, 6);
        const fr = sdBox(x, y, gx + 216 - 48 * shut, 712, 48 * shut, 52, 6);
        if (shut > 0.02) v = Math.max(v, (fl < 0 || fr < 0 ? 0.16 : 0) + Math.max(rim(fl, 2.5), rim(fr, 2.5)) * 0.5);
      }
    }
    // background commuters, dimmer, walking across
    for (let i = 0; i < 4; i++) {
      const dir = i % 2 ? -1 : 1;
      const speed = 150 + i * 30;
      const px = ((((k * speed * dir + i * 610) % 2400) + 2400) % 2400) - 240;
      const pose = { x: px, y: 690, s: 0.62, walk: (k * speed) / 120 + i * 0.3, reach: 0, tx: 0, ty: 0, dir: dir as 1 | -1 };
      const { d } = personSD(x, y, pose);
      if (d < 2) v = Math.max(v, fill(d) * 0.22 + rim(d, 2.5) * 0.3);
    }
    // our commuter: walks in, stops at the gate, raises the phone to the reader
    const arrive = ramp(s, [t0 + 0.0, t0 + 1.45], [0, 1], (u) => 1 - (1 - u) * (1 - u));
    const px = -160 + arrive * (METRO.reader.x - 120 + 160);
    const reach = ramp(s, [t0 + 1.55, METRO.tap], [0, 1], ease.inOut) * (1 - ramp(s, [METRO.tap + 0.9, METRO.tap + 1.3], [0, 1], ease.inOut));
    const pose = { x: px, y: 930, s: 1.3, walk: (arrive * (METRO.reader.x - 120 + 160)) / 150, reach, tx: METRO.reader.x - 26, ty: METRO.reader.y + 10 };
    const me = personSD(x, y, pose);
    if (me.d < 4) {
      const shade = 0.75 + 0.25 * clamp01((930 - y) / 260);
      v = Math.max(v, (fill(me.d) * 0.55 + rim(me.d, 4) * 0.4) * shade);
      if (me.d < 1) gold = Math.max(gold, goldK);
    }
    if (me.phone < 0) {
      v = Math.max(v, 0.95);
      gold = Math.max(gold, goldK);
    }
    // ripples from the reader on the tap
    for (let i = 0; i < 3; i++) {
      const rk = ramp(s, [METRO.tap + i * 0.14, METRO.tap + i * 0.14 + 1.0], [0, 1], ease.out);
      if (rk > 0 && rk < 1) {
        const R = 20 + rk * 520;
        const w = rim(Math.hypot(x - METRO.reader.x, y - METRO.reader.y) - R, 5) * (1 - rk);
        if (w > 0) {
          v = Math.max(v, w * 0.9);
          gold = Math.max(gold, w);
        }
      }
    }
    return { v, gold };
  };
