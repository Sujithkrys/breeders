// Sound for the Claude Sonnet 5.5 film (ClaudeSonnet) → public/sonnet/mix.wav.
// Music-led, like OpenAI's "ChatGPT Work" film: one steady electronic track carries the film; the effects are only quiet
// UI accents (clicks, real typing, soft whooshes, small pops). No booms, no chimes. Temporary track: Mixkit "Zay Zay"
// (free licence).
// Run: node scripts/compose-argon.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/claude-sonnet/Sonnet.tsx T
const T = { fast: 4.0, cost: 7.6, work: 11.0, bench: 19.0, everywhere: 23.0, end: 27.0, outro: 31.5, total: 31.5 + 3 }; // film, then the 3s Breeders end card
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
const TRACK = decode(join(SFX, "mixkit-zay-zay-309.mp3"));
put(MUSIC, TRACK, 0, { from: 0, len: T.outro - 0.1, fadeIn: 0.3, fadeOut: 1.4 });

// ---------- the film: quiet accents only ----------
// the mark spins in; the title rises
hit("rm whoosh.wav", 0.35, 0.16);
hit("shot light energy.mp3", 0.95, 0.13);
// to the centre, then it spins up for "30%+ faster" and settles
hit("rm whoosh.wav", 3.7, 0.14, { pan: 0.2 });
hit("Fast whoosh.wav", 4.9, 0.16);
hit("Swishes/Fast zing.wav", 5.6, 0.1, { pan: -0.3 });
// up to 30% less: each tile lands with a soft click; three lift away; the price line
for (let i = 0; i < 10; i++) hit("rm click (1).wav", T.cost + 0.7 + i * 0.07, 0.07, { pan: (i - 4.5) * 0.08 });
hit("rm whoosh.wav", T.cost + 1.7, 0.13, { pan: 0.3 });
hit("Pop 1.mp3", T.cost + 2.4, 0.1);
// everyday work: a soft paper slide as each sheet arrives; they rush past at the end
[0.35, 0.6, 0.85, 1.1, 1.35].forEach((a2, i) => hit("Paper Slide 03.wav", T.work + a2 + 0.5, 0.09, { pan: (i % 2 ? 0.35 : -0.35) }));
hit("Whoosh 2.mp3", T.bench - 0.35, 0.16);
// Terminal-Bench: the bars rise; the number lands
at("UI Data Loading Sound Effect.mp3", T.bench + 0.4, 0.11, { len: 1.6, fadeOut: 0.4 });
hit("Pop 1.mp3", T.bench + 2.0, 0.14);
// everywhere: a soft pop as each platform appears
[0, 1, 2, 3, 4].forEach((i) => hit("Pop 1.mp3", T.everywhere + 0.55 + i * 0.12, 0.06, { pan: (i - 2) * 0.2 }));
// end card
hit("ES_Riser Suction 5 - SFX Producer.mp3", T.end + 0.35, 0.14);
hit("shot light energy.mp3", T.end + 0.45, 0.17);

// ---------- the voiceover (when recorded): one clip per line in public/sonnet/vo, each placed on its shot ----------
const VO_AT = [0.6, 4.1, 7.7, 11.2, 14.2, 19.2, 23.2, 27.3];
VO_AT.forEach((t, i) => {
  const f = join(ROOT, `public/sonnet/vo/${String(i).padStart(2, "0")}.wav`);
  if (existsSync(f)) put(VOICE, decode(f), t, { gain: 1.0, fadeIn: 0.01, fadeOut: 0.06 });
});

// ---------- the Breeders end card (src/brand/Breeders.tsx): mark pops, name slides out ----------
hit("Swishes/Golden swoosh.wav", T.outro + 0.3, 0.3);
hit("05 Impact.wav", T.outro + 0.05, 0.3, { big: true });
hit("Bells/Bells 03.wav", T.outro + 0.6, 0.14);

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
const BODY = Math.round(T.outro * SR);
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
const out = join(ROOT, "public/sonnet/mix.wav");
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
