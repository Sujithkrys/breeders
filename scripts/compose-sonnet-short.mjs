// Sound for "Done before ten." (ClaudeSonnet28, 28s) → public/sonnet/short-mix.wav.
// Music: Mixkit "We Own the Night" (free licence), started 11.46s in: its quiet intro sits under 9:47 PM, its drop
// lands at 6.0s as Claude starts working, and its silence + second drop land on "Done before ten." (23.44s).
// SFX from audio/sfx, each placed on its frame (loudest moment on the cut). Voice clips (when recorded) go in
// public/sonnet/short-vo/NN.wav and are placed at VO_AT.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/claude-sonnet/Short.tsx T
const T = { clock: 0, chaos: 2.0, claude: 4.5, work: 6.0, sheet: 7.3, deck: 8.8, email: 10.4, fix: 12.0, fast: 14.5, less: 16.0, price: 17.5, bench: 19.0, done: 22.0, drop2: 23.44, end: 26.0, total: 28.0, cta: 27.88 };
const DUR = T.total;
const N = Math.round(SR * DUR);

const cache = new Map();
const decode = (path) => {
  if (cache.has(path)) return cache.get(path);
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", path, "-ac", "2", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  const n = f.length / 2, L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
  cache.set(path, [L, R]);
  return [L, R];
};
const sfx = (name) => decode(join(SFX, name));
const bus = () => [new Float32Array(N), new Float32Array(N)];
const MUSIC = bus(), FX = bus(), BIG = bus(), VOICE = bus();
const put = (b, [L, R], t, { gain = 1, from = 0, len, fadeIn = 0.002, fadeOut = 0.02, pan = 0 } = {}) => {
  const s0 = Math.round(t * SR), a = Math.round(from * SR);
  const n = Math.min(len ? Math.round(len * SR) : L.length - a, L.length - a);
  const fi = Math.max(1, fadeIn * SR), fo = Math.max(1, fadeOut * SR);
  const gl = Math.min(1, 1 - pan), gr = Math.min(1, 1 + pan);
  for (let i = 0; i < n; i++) {
    const j = s0 + i;
    if (j < 0) continue;
    if (j >= N) break;
    const e = Math.min(1, i / fi, (n - i) / fo) * gain;
    b[0][j] += L[a + i] * e * gl;
    b[1][j] += R[a + i] * e * gr;
  }
};
const peakCache = new Map();
const peakOf = (name) => {
  if (peakCache.has(name)) return peakCache.get(name);
  const [L, R] = sfx(name), w = Math.round(0.01 * SR);
  let best = 0, at = 0, acc = 0;
  for (let i = 0; i < L.length; i++) {
    acc += Math.abs(L[i]) + Math.abs(R[i]);
    if (i >= w) acc -= Math.abs(L[i - w]) + Math.abs(R[i - w]);
    if (acc > best) { best = acc; at = (i - w / 2) / SR; }
  }
  peakCache.set(name, Math.max(0, at));
  return Math.max(0, at);
};
// place a sound so its loudest moment lands on `t`
const hit = (name, t, gain, opts = {}) => put(opts.big ? BIG : FX, sfx(name), t - peakOf(name), { gain, ...opts });
// play from the file's start (for sounds whose start matters, like typing)
const at = (name, t, gain, opts = {}) => put(opts.big ? BIG : FX, sfx(name), t, { gain, ...opts });


// ---------- music ----------
const TRACK = decode(join(SFX, "mixkit-we-own-the-night-roll-out-320.mp3"));
put(MUSIC, TRACK, 0, { from: 17.46 - T.work, len: T.total - 0.12, fadeIn: 0.05, fadeOut: 0.04 });

// ---------- 0–4.5 · 9:47 PM and the mess ----------
hit("Display Digits 1.wav", 0.2, 0.3, { len: 0.5 });
for (let t = 0.6; t < T.claude - 0.1; t += 0.5) hit("Clock Tick.mp3", t, 0.22, { len: 0.3 });
[T.chaos, T.chaos + 0.8, T.chaos + 1.6].forEach((t, i) => hit("Fast whip.wav", t, 0.28, { pan: i % 2 ? 0.3 : -0.3 }));
hit("Digital HUD Interface Sounds/Wrong.wav", T.chaos + 0.18, 0.3);
[0, 1, 2, 3, 4].forEach((i) => hit("Pop 1.mp3", T.chaos + 1.66 + i * 0.12, 0.12, { pan: (i - 2) * 0.2 }));
// ---------- 4.5–6 · hand it to Claude: a riser into the drop ----------
hit("rm whoosh.wav", T.claude, 0.3);
hit("shot light energy.mp3", T.claude + 0.08, 0.3);
hit("ES_Riser Suction 5 - SFX Producer.mp3", T.work - 0.02, 0.4);
// ---------- 6–12 · the work builds ----------
at("keyboard-typing-5997.mp3", T.work + 0.05, 0.32, { from: 0.4, len: 0.95, fadeOut: 0.08 });
hit("Mouse Click.mp3", T.work + 1.1, 0.4);
hit("Iphone Send.wav", T.work + 1.12, 0.2);
hit("Fast whoosh.wav", T.sheet, 0.26);
at("Digital counting.mp3", T.sheet + 0.05, 0.22, { len: 0.75, fadeOut: 0.15 });
hit("Pop 1.mp3", T.sheet + 1.0, 0.16);
hit("Fast whip.wav", T.deck, 0.24, { pan: 0.3 });
[0, 1, 2].forEach((i) => hit("Paper Slide 03.wav", T.deck + 0.12 + i * 0.28, 0.2, { pan: (i - 1) * 0.4 }));
hit("Fast whip.wav", T.email, 0.24, { pan: -0.3 });
at("keyboard-typing-5997.mp3", T.email + 0.1, 0.24, { from: 2.0, len: 1.35, fadeOut: 0.1 });
hit("Pop Bubble Sound Effect.mp3", T.email + 1.45, 0.2);
// ---------- 12–14.5 · one line fixes slide 3 ----------
hit("rm whoosh.wav", T.fix, 0.22);
at("keyboard-typing-5997.mp3", T.fix + 0.15, 0.22, { from: 4.0, len: 0.6, fadeOut: 0.08 });
hit("05 Impact.wav", T.fix + 1.18, 0.4, { big: true });
hit("Swishes/Fast zing.wav", T.fix + 1.15, 0.2);
hit("Pop Bubble Sound Effect.mp3", T.fix + 1.52, 0.3);
// ---------- 14.5–19 · the numbers: an impact on each punch ----------
[T.fast, T.less, T.price].forEach((t, i) => {
  hit("05 Impact.wav", t + 0.06, 0.5, { big: true });
  hit("Subdrop Low/SD_Low_03.wav", t + 0.06, 0.32, { big: true, len: 0.8, fadeOut: 0.3 });
  hit(i === 2 ? "rm whoosh.wav" : "Fast whoosh.wav", t, 0.24, { pan: i === 1 ? 0.3 : -0.3 });
  hit("Clicks/Click_01.wav", t + 0.36, 0.2);
});
// ---------- 19–22 · Terminal-Bench ----------
hit("rm whoosh.wav", T.bench, 0.22);
at("Digital counting.mp3", T.bench + 0.35, 0.26, { len: 1.35, fadeOut: 0.25 });
hit("shot light energy.mp3", T.bench + 1.72, 0.3);
hit("Pop 1.mp3", T.bench + 1.72, 0.18);
// ---------- 22–26 · 9:58, the laptop shuts, the lamp clicks off, silence, "Done before ten." ----------
hit("Display Digits 2.wav", T.done + 0.1, 0.28, { len: 0.4 });
hit("Heavy object Hit and body thud sound effect.mp3", 22.68, 0.22);
hit("Clicks/Click_03.wav", 22.71, 0.4);
{ const name = "12 Universe Boom B.wav", pk = peakOf(name); put(BIG, sfx(name), T.drop2 - pk, { gain: 0.7 }); }
hit("Drop Disto Sub 1.wav", T.drop2, 0.45, { big: true });
hit("05 Impact.wav", T.drop2 + 0.25, 0.35, { big: true });
// ---------- 26–28 · Claude Sonnet 5.5, hard cut ----------
hit("rm whoosh.wav", T.end, 0.26);
hit("shot light energy.mp3", T.end + 0.1, 0.28);

// ---------- the voiceover (when recorded): one clip per line in public/sonnet/short-vo, each on its shot ----------
const VO_AT = [0.25, 2.1, 4.6, 6.4, 12.2, 14.55, 19.1, 23.5, 26.3];
VO_AT.forEach((t, i) => {
  const f = join(ROOT, `public/sonnet/short-vo/${String(i).padStart(2, "0")}.wav`);
  if (existsSync(f)) put(VOICE, decode(f), t, { gain: 1.0, fadeIn: 0.01, fadeOut: 0.06 });
});

// ---------- mix + master ----------
const envDuck = (src, depth, ref, attS, relS) => {
  const d = new Float32Array(N).fill(1);
  let env = 0;
  const att = Math.exp(-1 / (attS * SR)), rel = Math.exp(-1 / (relS * SR));
  for (let i = 0; i < N; i++) {
    const lvl = Math.max(Math.abs(src[0][i]), Math.abs(src[1][i]));
    env = lvl > env ? att * env + (1 - att) * lvl : rel * env + (1 - rel) * lvl;
    d[i] = 1 - depth * Math.min(1, env / ref);
  }
  return d;
};
const duck = envDuck(BIG, 0.5, 0.25, 0.002, 0.22); // big hits dip the music
const vDuck = envDuck(VOICE, 0.72, 0.04, 0.008, 0.35); // the voice dips everything else a little
const mix = bus();
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) mix[c][i] = (MUSIC[c][i] * 0.9 * duck[i] + FX[c][i] * 0.95 + BIG[c][i] * 0.9) * vDuck[i] + VOICE[c][i] * 2.6;
{
  let env = 0;
  const att = Math.exp(-1 / (0.025 * SR)), rel = Math.exp(-1 / (0.2 * SR));
  for (let i = 0; i < N; i++) {
    const lvl = Math.max(Math.abs(mix[0][i]), Math.abs(mix[1][i]));
    env = lvl > env ? att * env + (1 - att) * lvl : rel * env + (1 - rel) * lvl;
    const db = 20 * Math.log10(env + 1e-9);
    const g = db > -12 ? 10 ** ((-(db + 12) / 3) / 20) : 1;
    mix[0][i] *= g; mix[1][i] *= g;
  }
}
let sum = 0;
const BODY = Math.round(T.cta * SR);
for (const x of mix) for (let i = 0; i < BODY; i++) sum += x[i] * x[i];
const gain = 0.2 / Math.sqrt(sum / (2 * BODY));
const CEIL = 0.89, LA = Math.round(0.006 * SR), REL = Math.exp(-1 / (0.1 * SR));
const need = new Float32Array(N);
for (let i = 0; i < N; i++) { const p = Math.max(Math.abs(mix[0][i]), Math.abs(mix[1][i])) * gain; need[i] = p > CEIL ? CEIL / p : 1; }
const gr = new Float32Array(N);
{
  let g = 1;
  const dq = [];
  for (let i = 0; i < N + LA; i++) {
    if (i < N) { while (dq.length && need[dq[dq.length - 1]] >= need[i]) dq.pop(); dq.push(i); }
    const j = i - LA;
    if (j < 0) continue;
    while (dq.length && dq[0] < j) dq.shift();
    const target = dq.length ? need[dq[0]] : 1;
    g = target < g ? target : target - (target - g) * REL;
    gr[j] = g;
  }
}
const out = join(ROOT, "public/sonnet/short-mix.wav");
mkdirSync(dirname(out), { recursive: true });
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
let peak = 0;
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) {
  let v2 = mix[c][i] * gain * gr[i];
  v2 = Math.max(-CEIL, Math.min(CEIL, v2));
  peak = Math.max(peak, Math.abs(v2));
  buf.writeInt16LE(Math.round(v2 * 32767), 44 + (i * 2 + c) * 2);
}
writeFileSync(out, buf);
console.log(`Wrote ${out} (gain ${gain.toFixed(2)}, peak ${peak.toFixed(3)})`);
