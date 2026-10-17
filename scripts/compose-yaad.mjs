// Sound for YaadFilm (src/yaad/YaadFilm.tsx) → public/yaad/mix.wav: the voiceover (audio/yaad-vo.mp3) on top,
// "Eyes in the Puddle" (Mixkit, free) under it, a synthesised phone ring, and a sound on every cut.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/yaad/YaadFilm.tsx (T, seconds)
const T = { clock: 0, map: 1.85, meet: 6.7, setup: 7.7, ring: 15.25, call: 20.4, back: 24.8, dash: 25.95, miss: 29.5, end: 36.35, total: 41.5, cta: 41.5 };
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



// ---------- voice + music ----------
put(VOICE, decode(join(ROOT, "audio/yaad-vo.mp3")), 0, { fadeIn: 0.005, fadeOut: 0.05 });
put(MUSIC, decode(join(ROOT, "audio/sfx/mixkit-eyes-in-the-puddle-257.mp3")), 0, { len: DUR, gain: 0.55, fadeIn: 1.2, fadeOut: 2.5 });
// a phone ring, synthesised: a warbling two-tone trill, "brrr brrr", then a pause
const ring = (t0, dur, gain = 0.16) => {
  for (let i = Math.round(t0 * SR); i < Math.round((t0 + dur) * SR) && i < N; i++) {
    const t = i / SR - t0, cyc = t % 2.0;
    const on = (cyc < 0.4 || (cyc > 0.6 && cyc < 1.0)) ? 1 : 0;
    if (!on) continue;
    const env = Math.min(1, (cyc % 0.6) / 0.01) * 0.9;
    const f = Math.sin(2 * Math.PI * 22 * t) > 0 ? 1320 : 1660;
    const v = (Math.sin(2 * Math.PI * f * t) * 0.6 + Math.sin(2 * Math.PI * f * 2 * t) * 0.15) * env * gain;
    const buzz = Math.sign(Math.sin(2 * Math.PI * 150 * t)) * 0.05 * gain;
    FX[0][i] += v + buzz; FX[1][i] += v + buzz;
  }
};
// ---------- sound on every cut ----------
at("Clock Tick.mp3", 0.0, 0.35, { len: 0.6 });
hit("Mouse Click.mp3", 0.34, 0.4); // the flap
hit("Bells/Bells 01.wav", 0.6, 0.18);
hit("Swishes/Delay woosh.wav", T.map, 0.24);
[0.9, 1.3, 1.7, 2.1].forEach((d) => hit("Digital HUD Interface Sounds/Select - 02.wav", T.map + d, 0.08));
hit("05 Impact.wav", T.meet, 0.35, { big: true });
hit("Swishes/Golden swoosh.wav", T.meet + 0.05, 0.26);
hit("Swishes/Short whip.wav", T.setup, 0.22);
[0.45, 1.75, 4.95].forEach((d) => hit("Mouse Click.mp3", T.setup + d, 0.32));
at("keyboard-typing-5997.mp3", T.setup + 6.1, 0.28, { from: 0.4, len: 0.6, fadeOut: 0.05 });
hit("Mouse Click.mp3", T.setup + 7.2, 0.4);
hit("Iphone Send.wav", T.setup + 7.32, 0.26);
ring(T.ring + 0.1, 4.9);
hit("Swishes/Future swoosh.wav", T.call, 0.22);
hit("Swishes/Fast swish.wav", T.back, 0.26);
hit("Pop 1.mp3", T.back + 0.8, 0.2);
hit("Message sound.mp3", T.dash + 0.1, 0.3);
hit("Swishes/Short whip.wav", T.miss, 0.22);
hit("Swishes/Sharp swoosh.wav", T.miss + 1.0, 0.2);
ring(T.miss + 1.95, 1.7, 0.13);
hit("Glitch transition sounds/T3.wav", T.miss + 3.7, 0.16);
hit("Iphone Receive.wav", T.miss + 5.25, 0.32);
hit("Swishes/Golden swoosh.wav", T.end, 0.26);
hit("05 Impact.wav", T.end + 0.15, 0.3, { big: true });
hit("Bells/Bells 03.wav", T.end + 0.7, 0.14);

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
const vDuck = envDuck(VOICE, 0.6, 0.05, 0.01, 0.4); // the voice dips the music and sounds
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
const out = join(ROOT, "public/yaad/mix.wav");
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
