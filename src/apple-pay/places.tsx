// The places in the Apple Pay India film, each a lit dot-world scene where someone taps to pay and turns gold.
// Only places where you really tap a card in India: the metro ticket counter (not the gate), a café, a petrol pump,
// a clothing store, the airport, and a wrist tap. Every scene: field(s) for absolute seconds, starting at `t0`, paying
// at `t0 + tap`; `at` is the screen point of the tap (the next scene's ring opens there).
import { random } from "remotion";
import { ease, ramp } from "../utils";
import { Field, fill, glowOf, personSD, rim, sdBox, sdCapsule, sdCircle } from "./dotworld";

const c01 = (v: number) => Math.max(0, Math.min(1, v));
// Human scale: people stand on FEET at size PS (about 450px tall); counters are waist-high; machines sit at chest height.
const FEET = 1010;
const PS = 2.3;
const TOP = 772; // counter top
const TERM_Y = 722; // card machine centre on a counter
const LAMP = 0.12; // light fixtures: barely there on the white film
export type Place = { name: string; tap: number; at: { x: number; y: number }; field: (s: number, t0: number) => Field };

// ---------- shared pieces ----------
// Ripples of light from a point after the tap.
const ripples = (x: number, y: number, s: number, tapT: number, cx: number, cy: number, reach = 520) => {
  let v = 0;
  for (let i = 0; i < 3; i++) {
    const k = ramp(s, [tapT + i * 0.14, tapT + i * 0.14 + 1.0], [0, 1], ease.out);
    if (k > 0 && k < 1) v = Math.max(v, rim(Math.hypot(x - cx, y - cy) - (20 + k * reach), 5) * (1 - k));
  }
  return v;
};
// Someone seen from the waist up behind a counter (head, shoulders, arms resting).
const upperSD = (x: number, y: number, cx: number, cy: number, s: number, reach = 0, tx = 0, ty = 0) => {
  let d = sdCircle(x, y, cx, cy - 70 * s, 15 * s);
  d = Math.min(d, sdCapsule(x, y, cx, cy - 46 * s, cx, cy + 20 * s, 21 * s));
  const hx = cx - 40 * s + (tx - (cx - 40 * s)) * reach, hy = cy + 6 * s + (ty - (cy + 6 * s)) * reach;
  d = Math.min(d, sdCapsule(x, y, cx - 14 * s, cy - 36 * s, hx, hy, 7 * s), sdCapsule(x, y, cx + 14 * s, cy - 36 * s, cx + 34 * s, cy + 10 * s, 7 * s));
  return d;
};
// Card machine (lit screen on top, keypad).
const terminal = (x: number, y: number, cx: number, cy: number, s: number, done: number) => {
  const body = sdBox(x, y, cx, cy, 26 * s, 44 * s, 7 * s);
  if (body > 6) return { v: 0, gold: 0, hit: false };
  const scr = sdBox(x, y, cx, cy - 16 * s, 18 * s, 14 * s, 3 * s);
  let v = body < 0 ? 0.32 : rim(body, 2.5) * 0.6;
  if (scr < 0) v = 0.9;
  if (body < 0 && cy + 4 * s < y && Math.abs((x - cx) % (12 * s)) < 4 * s && Math.abs((y - cy - 4 * s) % (11 * s)) < 4 * s) v = Math.max(v, 0.5);
  return { v, gold: scr < 0 || body < 0 ? done : 0, hit: body < 0 };
};
const walkIn = (s: number, t0: number, from: number, to: number, dur: number) => {
  const u = ramp(s, [t0, t0 + dur], [0, 1], (q) => 1 - (1 - q) * (1 - q));
  return { x: from + (to - from) * u, walk: (Math.abs(to - from) * u) / 150 };
};
const lightPanels = (x: number, y: number, vpx: number, vpy: number, h: number, w: number, cols: number) => {
  let v = 0;
  if (y > vpy - 30) return 0;
  for (let z = 1.15; z < 9; z *= 1.32) {
    const sc = 1 / z;
    const cy = vpy - h * sc;
    if (Math.abs(y - cy) > 40 * sc + 14) continue;
    for (let c = -cols; c <= cols; c++) {
      const d = sdBox(x, y, vpx + c * w * sc, cy, 0.36 * w * sc, 9 * sc + 1, 4 * sc);
      v = Math.max(v, d < 0 ? LAMP : 0.05 * glowOf(d, 10 * sc + 3));
    }
  }
  return v;
};
const floorGrid = (x: number, y: number, vpx: number, vpy: number, top: number, spacing = 220) => {
  if (y < top) return 0;
  const tt = (y - vpy) / (1080 - vpy);
  const fx = (x - vpx) / tt;
  const line = Math.abs((((fx % spacing) + spacing) % spacing) - spacing / 2) < 3 / tt;
  const zrow = Math.abs(((1 / tt) * 90) % 60 - 30) < 2.2;
  return 0.07 + (line ? 0.22 : 0) + (zrow ? 0.12 : 0);
};
const shadeBody = (d: number, y: number, top: number, h: number) => (fill(d) * 0.55 + rim(d, 4) * 0.4) * (0.75 + 0.25 * c01((top + h - y) / h));

// ---------- 1 · metro ticket counter ----------
export const METRO_COUNTER: Place = {
  name: "metro",
  tap: 1.9,
  at: { x: 930, y: 692 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 1.9;
    const done = ramp(s, [tapT, tapT + 0.25], [0, 1], ease.out);
    let v = Math.max(0.03, lightPanels(x, y, 960, 430, 430, 330, 3), floorGrid(x, y, 960, 430, 760));
    let gold = 0;
    if (y > 240 && y < 760) v = Math.max(v, 0.05);
    // distant gates on the right
    for (const gx of [1460, 1560, 1660, 1760]) {
      const p = sdBox(x, y, gx, 700, 12, 62, 5);
      v = Math.max(v, p < 0 ? 0.2 : rim(p, 2) * 0.35, sdCircle(x, y, gx, 632, 6) < 0 ? 0.6 : 0);
    }
    // the booth: glass window frame, counter, attendant behind the glass
    const frame = sdBox(x, y, 1060, 560, 330, 210, 12);
    // commuters crossing the concourse behind, smaller and paler (hidden by the booth)
    if (frame > 4 && y < TOP + 6 && y > 560) {
      for (let i = 0; i < 4; i++) {
        const dir = i % 2 ? -1 : 1;
        const sp = 140 + i * 35;
        const cx = ((((s * sp * dir + i * 590) % 2300) + 2300) % 2300) - 190;
        const p = personSD(x, y, { x: cx, y: 800, s: 0.95, walk: (s * sp) / 95 + i * 0.37, reach: 0, tx: 0, ty: 0, dir: dir as 1 | -1 });
        if (p.d < 2) v = Math.max(v, fill(p.d) * 0.2 + rim(p.d, 2.5) * 0.22);
      }
    }
    v = Math.max(v, rim(frame, 3) * 0.8);
    const mull = Math.min(Math.abs(x - 1060), Math.abs(y - 520)) < 2 && frame < 0 ? 0.3 : 0;
    v = Math.max(v, mull);
    const att = upperSD(x, y, 1170, 700, 2.0, ramp(s, [tapT + 0.55, tapT + 0.95], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 1.3, tapT + 1.6], [0, 1])), 1010, 760);
    if (att < 2 && frame < 0) v = Math.max(v, fill(att) * 0.2 + rim(att, 3) * 0.32);
    const counter = sdBox(x, y, 1060, 930, 360, 158, 6);
    if (counter < 0) v = Math.max(v, 0.15 + (y < TOP + 10 ? 0.45 : 0));
    v = Math.max(v, rim(counter, 3) * 0.55);
    const tm = terminal(x, y, 930, TERM_Y, 1.25, done);
    if (tm.v) { v = Math.max(v, tm.v); gold = Math.max(gold, tm.gold); }
    // the token slides across the counter to the customer
    const tok = ramp(s, [tapT + 0.7, tapT + 1.25], [0, 1], ease.inOut);
    if (s > tapT + 0.6) {
      const td = sdCircle(x, y, 1060 - tok * 240, TOP - 8, 11);
      if (td < 0) { v = 0.95; gold = 1; }
    }
    // the customer
    const w = walkIn(s, t0, -260, 690, 1.4);
    const reach = ramp(s, [t0 + 1.45, tapT], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.9, tapT + 1.3], [0, 1], ease.inOut));
    const me = personSD(x, y, { x: w.x, y: FEET, s: PS, walk: w.walk, reach, tx: 900, ty: TERM_Y - 30 });
    if (me.d < 4) { v = Math.max(v, shadeBody(me.d, y, 560, 450)); if (me.d < 1) gold = Math.max(gold, done); }
    if (me.phone < 0) { v = 0.95; gold = Math.max(gold, done); }
    const rp = ripples(x, y, s, tapT, 930, TERM_Y - 30);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};

// ---------- 2 · café counter: pendant lights, espresso machine with steam, barista, cups ----------
export const CAFE: Place = {
  name: "cafe",
  tap: 1.5,
  at: { x: 1120, y: 692 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 1.5;
    const done = ramp(s, [tapT, tapT + 0.25], [0, 1], ease.out);
    let v = 0.035 + 0.03 * c01(1 - y / 700);
    let gold = 0;
    // pendant lights
    for (const px of [520, 860, 1200, 1540]) {
      const cord = Math.abs(x - px) < 1.6 && y < 210 ? 0.3 : 0;
      const shade = sdBox(x, y, px, 230, 40, 20, 18);
      const bulb = sdCircle(x, y, px, 254, 10);
      v = Math.max(v, cord, shade < 0 ? 0.3 : 0, bulb < 0 ? LAMP : 0.08 * glowOf(bulb, 40), rim(shade, 2.5) * 0.5);
    }
    // back shelf with jars
    if (Math.abs(y - 430) < 3 && x > 300 && x < 1700) v = Math.max(v, 0.4);
    for (let i = 0; i < 14; i++) {
      const jx = 340 + i * 98;
      const j = sdBox(x, y, jx, 400, 22, 28, 8);
      if (j < 2) v = Math.max(v, j < 0 ? 0.14 + random(`jar${i}`) * 0.1 : rim(j, 2) * 0.4);
    }
    // espresso machine + steam
    const mach = sdBox(x, y, 640, 590, 150, 70, 14);
    if (mach < 3) v = Math.max(v, mach < 0 ? 0.28 + (Math.abs(y - 560) < 4 ? 0.4 : 0) : rim(mach, 3) * 0.6);
    for (const gx of [590, 690]) if (sdBox(x, y, gx, 672, 12, 14, 4) < 0) v = Math.max(v, 0.5);
    for (let k = 0; k < 3; k++) {
      const ph = (s * 0.7 + k / 3) % 1;
      const sy = 500 - ph * 220;
      const sx = 640 + Math.sin(ph * 9 + k) * 26 + (k - 1) * 30;
      const d = Math.hypot(x - sx, y - sy) - (10 + ph * 22);
      if (d < 0) v = Math.max(v, 0.35 * (1 - ph));
    }
    // barista behind the counter
    const bar = upperSD(x, y, 860, 700, 2.0, 0);
    if (bar < 2) v = Math.max(v, fill(bar) * 0.22 + rim(bar, 3) * 0.35);
    // counter + cups + terminal
    const counter = sdBox(x, y, 960, 930, 800, 158, 8);
    if (counter < 0) v = Math.max(v, 0.13 + (y < TOP + 10 ? 0.45 : 0) + (Math.abs(((x - 200) % 60) - 30) < 2 ? 0.06 : 0));
    v = Math.max(v, rim(counter, 3) * 0.55);
    for (const cx of [700, 780]) {
      const cup = Math.min(sdBox(x, y, cx, TOP - 30, 26, 30, 8), sdCircle(x, y, cx + 32, TOP - 32, 12) < 0 && sdCircle(x, y, cx + 32, TOP - 32, 5) > 0 ? -1 : 9);
      if (cup < 0) v = Math.max(v, 0.6);
      for (let k = 0; k < 2; k++) {
        const ph = (s * 0.55 + k * 0.5 + cx * 0.013) % 1;
        const d = Math.hypot(x - (cx + Math.sin(ph * 7 + cx) * 12), y - (TOP - 66 - ph * 150)) - (5 + ph * 13);
        if (d < 0) v = Math.max(v, 0.3 * (1 - ph));
      }
    }
    const tm = terminal(x, y, 1120, TERM_Y, 1.25, done);
    if (tm.v) { v = Math.max(v, tm.v); gold = Math.max(gold, tm.gold); }
    // customer from the right
    const w = walkIn(s, t0 - 0.2, 2200, 1330, 1.2);
    const reach = ramp(s, [t0 + 1.0, tapT], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.8, tapT + 1.2], [0, 1], ease.inOut));
    const me = personSD(x, y, { x: w.x, y: FEET, s: PS, walk: w.walk, reach, tx: 1150, ty: TERM_Y - 30, dir: -1 });
    if (me.d < 4) { v = Math.max(v, shadeBody(me.d, y, 560, 450)); if (me.d < 1) gold = Math.max(gold, done); }
    if (me.phone < 0) { v = 0.95; gold = Math.max(gold, done); }
    const rp = ripples(x, y, s, tapT, 1120, TERM_Y - 30);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};

// ---------- 3 · petrol pump at night: canopy lights, dispenser, car, attendant with the card machine ----------
export const FUEL: Place = {
  name: "fuel",
  tap: 1.2,
  at: { x: 1150, y: 710 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 1.2;
    const done = ramp(s, [tapT, tapT + 0.25], [0, 1], ease.out);
    let v = 0.025;
    let gold = 0;
    // canopy with strip lights
    const can = sdBox(x, y, 960, 120, 980, 46, 4);
    if (can < 0) v = Math.max(v, 0.16);
    for (let i = 0; i < 6; i++) {
      const d = sdBox(x, y, 260 + i * 280, 168, 90, 5, 4);
      v = Math.max(v, d < 0 ? LAMP : 0.05 * glowOf(d, 26));
    }
    // light pool on the ground
    if (y > 820) v = Math.max(v, 0.06 + 0.12 * Math.exp(-((x - 960) ** 2) / 400000));
    // dispenser
    const disp = sdBox(x, y, 560, 600, 95, 230, 12);
    if (disp < 3) v = Math.max(v, disp < 0 ? 0.24 : rim(disp, 3) * 0.6);
    const scr = sdBox(x, y, 560, 470, 68, 52, 6);
    if (scr < 0) {
      v = Math.max(v, 0.16);
      const row = y < 470 ? 0 : 1;
      const cell = Math.floor((x - 504) / 28);
      const inCell = cell >= 0 && cell < 4 && (x - 504) % 28 < 21 && Math.abs(y - (row ? 494 : 446)) < 15;
      if (inCell) {
        const tick = Math.floor(Math.min(s, tapT) * (row ? 18 : 7) / (cell === 3 ? 1 : cell + 1.5));
        if (random(`pd${row}${cell}${Math.round(x)}_${Math.round(y)}_${tick}`) > 0.38) { v = 0.85; gold = Math.max(gold, done * row); }
      }
    }
    v = Math.max(v, rim(scr, 2.5) * 0.6);
    const hose = sdCapsule(x, y, 650, 560, 700, 760, 5);
    if (hose < 0) v = Math.max(v, 0.3);
    // the car: body, roof, wheels, window (the driver's side faces us)
    const body = sdBox(x, y, 1330, 880, 520, 112, 60);
    const roof = sdBox(x, y, 1360, 730, 290, 84, 60);
    const win = sdBox(x, y, 1250, 735, 150, 54, 22);
    const carD = Math.min(body, roof);
    if (carD < 3) v = Math.max(v, carD < 0 ? 0.17 + (y < 790 && y > 680 ? 0.05 : 0) : rim(carD, 3) * 0.6);
    if (win < 0) v = Math.max(v, 0.07 + (upperSD(x, y, 1290, 790, 1.6, 0) < 0 ? 0.12 : 0));
    for (const wx of [1000, 1660]) {
      const wh = sdCircle(x, y, wx, 990, 74);
      if (wh < 0) v = Math.max(v, sdCircle(x, y, wx, 990, 30) < 0 ? 0.45 : 0.1);
      v = Math.max(v, rim(wh, 3) * 0.5);
    }
    if (sdBox(x, y, 1835, 860, 20, 12, 6) < 0) v = Math.max(v, 1); // headlight
    // driver's arm out of the window with the phone
    const reach = ramp(s, [t0 + 0.3, tapT], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.8, tapT + 1.1], [0, 1], ease.inOut));
    const hx = 1250 - reach * 80, hy = 760 - reach * 34;
    const arm = sdCapsule(x, y, 1290, 772, hx, hy, 14);
    const phone = sdBox(x, y, hx - 6, hy - 20, 13, 24, 4);
    if (arm < 0) { v = Math.max(v, 0.42); gold = Math.max(gold, done); }
    if (phone < 0) { v = 0.95; gold = Math.max(gold, done); }
    // attendant standing at the window, holding the card machine out
    const att = personSD(x, y, { x: 940, y: FEET, s: PS, walk: 0.25, reach: 0.9, tx: 1090, ty: 745, dir: 1 });
    if (att.d < 4) v = Math.max(v, shadeBody(att.d, y, 560, 450) * 0.85);
    const tm = terminal(x, y, 1120, 728, 1.05, done);
    if (tm.v) { v = Math.max(v, tm.v); gold = Math.max(gold, tm.gold); }
    const rp = ripples(x, y, s, tapT, 1150, 710);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};

// ---------- 4 · clothing store checkout: racks of clothes under spotlights, bags, counter ----------
export const STORE: Place = {
  name: "store",
  tap: 1.0,
  at: { x: 860, y: 692 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 1.0;
    const done = ramp(s, [tapT, tapT + 0.25], [0, 1], ease.out);
    let v = 0.03;
    let gold = 0;
    // spotlights
    for (let i = 0; i < 7; i++) {
      const sx = 200 + i * 260;
      const d = sdCircle(x, y, sx, 70, 12);
      v = Math.max(v, d < 0 ? LAMP : 0.05 * glowOf(d, 30));
      const beam = Math.abs(x - sx) < (y - 70) * 0.28 && y < 520 ? 0.05 * (1 - (y - 70) / 450) : 0;
      v = Math.max(v, beam);
    }
    // racks with hanging garments
    for (const [rx, rw] of [[330, 260], [1530, 300]] as const) {
      if (Math.abs(y - 300) < 3 && Math.abs(x - rx) < rw) v = Math.max(v, 0.5);
      for (let g = 0; g < 9; g++) {
        const gx = rx - rw + 20 + g * ((rw * 2 - 40) / 8);
        const gd = sdBox(x, y, gx + Math.sin(s * 1.5 + g) * 2, 410, 16, 105, 10);
        if (gd < 2) v = Math.max(v, gd < 0 ? 0.12 + random(`gar${g}${rx}`) * 0.16 : rim(gd, 2) * 0.35);
      }
    }
    // counter + bags
    const counter = sdBox(x, y, 1000, 930, 400, 158, 8);
    if (counter < 0) v = Math.max(v, 0.14 + (y < TOP + 10 ? 0.45 : 0));
    v = Math.max(v, rim(counter, 3) * 0.55);
    const hand = ramp(s, [tapT + 0.45, tapT + 1.05], [0, 1], ease.inOut);
    for (const [bx0, bh] of [[1170, 70], [1260, 54]] as const) {
      const mine = bx0 === 1170;
      const bx = mine ? bx0 + (720 - bx0) * hand : bx0;
      const by = mine ? TOP - bh - Math.sin(hand * Math.PI) * 130 : TOP - bh;
      const bag = sdBox(x, y, bx, by, 42, bh, 5);
      if (mine && bag < 1) gold = Math.max(gold, done * ramp(s, [tapT + 0.4, tapT + 0.6]));
      const handle = Math.abs(Math.hypot(x - bx, y - (by - bh)) - 20) < 3 && y < by - bh ? 0.6 : 0;
      if (bag < 0) v = Math.max(v, 0.35);
      v = Math.max(v, handle, rim(bag, 2) * 0.6);
    }
    const tm = terminal(x, y, 860, TERM_Y, 1.25, done);
    if (tm.v) { v = Math.max(v, tm.v); gold = Math.max(gold, tm.gold); }
    const cashier = upperSD(x, y, 1040, 700, 2.0, ramp(s, [tapT + 0.3, tapT + 0.5], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.95, tapT + 1.2], [0, 1], ease.inOut)), 1170 + (760 - 1170) * hand, TOP - 150 - Math.sin(hand * Math.PI) * 130);
    if (cashier < 2 && y < TOP) v = Math.max(v, fill(cashier) * 0.2 + rim(cashier, 3) * 0.32);
    const w = walkIn(s, t0 - 0.4, -260, 620, 1.0);
    const reach = ramp(s, [t0 + 0.55, tapT], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.7, tapT + 1.0], [0, 1], ease.inOut));
    const me = personSD(x, y, { x: w.x, y: FEET, s: PS, walk: w.walk, reach, tx: 832, ty: TERM_Y - 30 });
    if (me.d < 4) { v = Math.max(v, shadeBody(me.d, y, 560, 450)); if (me.d < 1) gold = Math.max(gold, done); }
    if (me.phone < 0) { v = 0.95; gold = Math.max(gold, done); }
    const rp = ripples(x, y, s, tapT, 860, TERM_Y - 30);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};

// ---------- 5 · airport: big window with a plane taking off, departures board, a traveller with a suitcase ----------
export const AIRPORT: Place = {
  name: "airport",
  tap: 0.85,
  at: { x: 1240, y: 692 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 0.85;
    const done = ramp(s, [tapT, tapT + 0.25], [0, 1], ease.out);
    let v = 0.03;
    let gold = 0;
    // window wall with mullions, night sky, runway lights, a plane climbing
    const wall = sdBox(x, y, 760, 380, 700, 300, 4);
    if (wall < 0) {
      v = Math.max(v, 0.05 + 0.05 * c01(1 - y / 680));
      if (Math.abs(((x - 60) % 175) - 87) > 84 || Math.abs(((y - 80) % 150) - 75) > 73) v = Math.max(v, 0.4);
      if (Math.abs(y - 610) < 3 && Math.abs(((x + s * 200) % 70) - 35) < 4) v = Math.max(v, 0.9);
      const k = s - t0;
      const px = 300 + k * 260, py = 520 - k * 90;
      const fus = sdCapsule(x, y, px - 90, py + 16, px + 90, py - 16, 12);
      const wingA = sdCapsule(x, y, px - 10, py, px - 50, py + 46, 6);
      const wingB = sdCapsule(x, y, px - 10, py, px + 20, py - 50, 6);
      const tail = sdCapsule(x, y, px - 84, py + 14, px - 104, py - 18, 5);
      const pd = Math.min(fus, wingA, wingB, tail);
      if (pd < 0) v = Math.max(v, 0.7);
      if (sdCircle(x, y, px + 92, py - 18, 4) < 0) v = 1;
    }
    v = Math.max(v, rim(wall, 3) * 0.7);
    // departures board
    const board = sdBox(x, y, 1560, 230, 250, 110, 8);
    if (board < 0) {
      v = Math.max(v, 0.08);
      const row = Math.floor((y - 140) / 28);
      if (((y - 140) % 28) < 12 && x > 1330 && x < 1790) {
        const on = random(`dep${row}_${Math.floor((x - 1330) / 18)}`) > 0.35;
        const flick = Math.sin(s * 9 + row * 2) > 0.85 && row === 3;
        if (on) v = Math.max(v, flick ? 0.2 : 0.65);
      }
    }
    v = Math.max(v, rim(board, 3) * 0.7);
    // floor
    v = Math.max(v, floorGrid(x, y, 960, 420, 690, 260) * 0.8);
    // café kiosk terminal on a stand
    const stand = sdBox(x, y, 1240, 880, 14, 140, 4);
    if (stand < 0) v = Math.max(v, 0.3);
    const tm = terminal(x, y, 1240, TERM_Y, 1.25, done);
    if (tm.v) { v = Math.max(v, tm.v); gold = Math.max(gold, tm.gold); }
    // traveller with a suitcase walking in
    const w = walkIn(s, t0 - 0.8, -260, 1010, 1.3);
    const reach = ramp(s, [t0 + 0.45, tapT], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.6, tapT + 0.9], [0, 1], ease.inOut));
    const me = personSD(x, y, { x: w.x, y: FEET, s: PS, walk: w.walk, reach, tx: 1212, ty: TERM_Y - 30 });
    if (me.d < 4) { v = Math.max(v, shadeBody(me.d, y, 560, 450)); if (me.d < 1) gold = Math.max(gold, done); }
    if (me.phone < 0) { v = 0.95; gold = Math.max(gold, done); }
    const case_ = Math.min(sdBox(x, y, w.x - 130, 925, 60, 85, 10), sdCapsule(x, y, w.x - 130, 840, w.x - 70, 770, 4));
    if (case_ < 0) v = Math.max(v, 0.32);
    v = Math.max(v, rim(case_, 2) * 0.5);
    const rp = ripples(x, y, s, tapT, 1240, TERM_Y - 30);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};

// ---------- 6 · close-up: a wrist with a watch taps the reader ----------
export const WRIST: Place = {
  name: "wrist",
  tap: 0.8,
  at: { x: 1060, y: 560 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 0.8;
    const done = ramp(s, [tapT, tapT + 0.25], [0, 1], ease.out);
    let v = 0.03;
    let gold = 0;
    // big terminal, close up
    const body = sdBox(x, y, 1180, 700, 170, 300, 40);
    if (body < 3) v = Math.max(v, body < 0 ? 0.26 : rim(body, 3) * 0.6);
    const scr = sdBox(x, y, 1180, 560, 130, 110, 16);
    if (scr < 0) { v = Math.max(v, 0.75); gold = Math.max(gold, done); }
    for (let i = 0; i < 4; i++) {
      const arc = Math.abs(Math.hypot(x - 1130, y - 560) - (20 + i * 18)) < 3.5 && x > 1130 && Math.abs(y - 560) < 12 + i * 15;
      if (arc && scr < 0) v = Math.max(v, 1);
    }
    // forearm + fist + watch, swinging in from the left to the screen
    const k = ramp(s, [t0, tapT], [0, 1], ease.inOut) * (1 - ramp(s, [tapT + 0.45, tapT + 0.8], [0, 1], ease.inOut) * 0.4);
    const ex = -200, ey = 820;
    const wx = 520 + k * 520, wy = 760 - k * 180;
    const arm = sdCapsule(x, y, ex, ey, wx, wy, 52);
    const fist = sdCircle(x, y, wx + 46, wy - 14, 48);
    const ad = Math.min(arm, fist);
    if (ad < 3) v = Math.max(v, shadeBody(ad, y, wy - 60, 200));
    const watch = sdBox(x, y, wx - 60, wy - 6, 40, 52, 16);
    if (watch < 0) {
      v = Math.max(v, sdBox(x, y, wx - 60, wy - 6, 30, 42, 12) < 0 ? 0.85 : 0.4);
      gold = Math.max(gold, done);
    }
    if (ad < 1) gold = Math.max(gold, done * 0.6);
    const rp = ripples(x, y, s, tapT, 1060, 560, 700);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};

// ---------- online: a laptop checkout, the pay button turns gold ----------
export const ONLINE: Place = {
  name: "online",
  tap: 1.1,
  at: { x: 960, y: 640 },
  field: (s, t0) => (x, y) => {
    const tapT = t0 + 1.1;
    const done = ramp(s, [tapT, tapT + 0.3], [0, 1], ease.out);
    let v = 0.03;
    let gold = 0;
    const lid = sdBox(x, y, 960, 470, 520, 320, 22);
    if (lid < 3) v = Math.max(v, lid < 0 ? 0.08 : rim(lid, 3) * 0.75);
    const base = sdBox(x, y, 960, 810, 620, 18, 9);
    if (base < 0) v = Math.max(v, 0.4);
    if (lid < -14) {
      // page: header, product block, text lines
      if (sdBox(x, y, 960, 210, 470, 16, 6) < 0) v = Math.max(v, 0.3);
      if (sdBox(x, y, 720, 400, 190, 130, 14) < 0) v = Math.max(v, 0.22);
      for (let i = 0; i < 4; i++) if (sdBox(x, y, 1140 - i * 12, 320 + i * 44, 170 - i * 30, 7, 4) < 0) v = Math.max(v, 0.45);
      // the pay button
      const btn = sdBox(x, y, 960, 640, 300, 40, 20);
      if (btn < 0) {
        v = Math.max(v, 0.85);
        gold = Math.max(gold, done);
      }
    }
    const rp = ripples(x, y, s, tapT, 960, 640, 640);
    if (rp > 0) { v = Math.max(v, rp * 0.9); gold = Math.max(gold, rp); }
    return { v, gold };
  },
};
