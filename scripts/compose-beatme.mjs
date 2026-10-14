// Sound for MustangBeatMe (src/mustang/BeatMe.tsx) → public/mustang/beatme-mix.wav.
// Music: the "Beat me, hate me" verse of "They Don't Care About Us", taken from the gym edit the user referenced.
// The two slurs in the verse are muted under hard hits. A sound on every cut, landings, the break, the outro.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/mustang/BeatMe.tsx (seconds into the verse)
const W = { beat: 0, hate: 0.55, never1: 1.25, brk: 1.75, me1: 2.27, will: 2.59, thrill: 3.25, never2: 3.95, kill: 4.55, me2: 4.93, slur1: 5.21, sue: 5.94, everybody: 6.46, doMe: 6.94, kick: 7.91, slur2: 8.56, dont: 9.24, black: 9.58, white: 9.93, me3: 10.27, all: 10.52, care: 11.89, end: 14.1 };
const END = W.end, OUTRO = 3;
const T = { cta: END };
const DUR = END + OUTRO;
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



// ---------- music: the verse from the gym edit the user referenced ----------
const VERSE = decode(join(ROOT, "audio/music/beat-me-verse (gym edit reference).wav"));
put(MUSIC, VERSE, 0, { len: END + 0.2, fadeIn: 0.003, fadeOut: 0.25 });
// the two slurs are muted under a hard hit
const mute = (t0, t1) => {
  for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) {
    const e = Math.min(1, (i - t0 * SR) / (0.01 * SR), (t1 * SR - i) / (0.02 * SR));
    MUSIC[0][i] *= 1 - 0.94 * e;
    MUSIC[1][i] *= 1 - 0.94 * e;
  }
};
mute(W.slur1 - 0.02, W.slur1 + 0.42);
mute(W.slur2 - 0.02, W.slur2 + 0.4);
hit("13 Metal Slam.wav", W.slur1, 0.6, { big: true });
hit("05 Impact.wav", W.slur1, 0.4, { big: true });
hit("13 Metal Slam.wav", W.slur2, 0.6, { big: true });
hit("05 Impact.wav", W.slur2, 0.4, { big: true });

// ---------- cuts ----------
const cuts = [W.hate, W.never1, W.will, W.thrill, W.never2, W.sue, W.everybody, W.doMe, W.kick, W.black, W.white, W.all, W.care];
const sw = ["Swishes/Short whip.wav", "Swishes/Fast swish.wav", "Swishes/Sharp swoosh.wav", "Swishes/High fast swoosh.wav", "Swishes/Flame pass.wav", "Swishes/Rumble swish.wav", "Swishes/Windy swish.wav"];
cuts.forEach((t, i) => hit(sw[i % sw.length], t + 0.01, 0.2, { pan: (i % 2 ? 1 : -1) * 0.35 }));
// beat me: the launch
hit("Digital HUD Interface Sounds/Select - 01.wav", 0.28, 0.3);
hit("Swishes/Space ship fly by.wav", 0.4, 0.3, { pan: 0.3 });
// break me: out and home
hit("Swishes/Woosh rattle.wav", W.brk, 0.32);
hit("05 Impact.wav", W.brk, 0.3, { big: true });
hit("13 Metal Slam.wav", W.me1, 0.55, { big: true });
hit("Subdrop Low+Hi/SD_Low+Hi_02.wav", W.me1 + 0.02, 0.35, { big: true });
// thrill me / kick me: landings
hit("06 Evolve_Boom Hint of Metal.wav", W.thrill + 0.55, 0.4, { big: true });
hit("06 Evolve_Boom Hint of Metal.wav", W.kick + 0.66, 0.42, { big: true });
// kill me: the stop at the edge
hit("Swishes/Woosh rattle.wav", W.never2 + 0.3, 0.26);
hit("05 Impact.wav", W.me2, 0.32, { big: true });
// white: the flash
hit("Lens flare transition sound effect.mp3", W.white, 0.22);
// care about us: the climb
hit("Swishes/Reverse riser 01.wav", W.end - 0.1, 0.24);
// ---------- outro: BREEDERS ----------
hit("05 Impact.wav", END + 0.4, 0.4, { big: true });
hit("Swishes/Golden swoosh.wav", END + 0.75, 0.3);
hit("Bells/Bells 03.wav", END + 1.0, 0.14);

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
const vDuck = new Float32Array(N).fill(1); // no voice in this film
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
const out = join(ROOT, "public/mustang/beatme-mix.wav");
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
