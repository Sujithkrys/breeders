// Sound for FigmaMotion (src/figma-motion/FigmaMotion.tsx) -> public/figma-motion/mix.wav: the voiceover on top,
// Pine Pro's music under it, and a sound on every cut.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/figma-motion/FigmaMotion.tsx (S, seconds; the voice starts at VO)
const VO = 0.3;
const S = { still: 0, never: 1.3, meet: 3.2, mode: 4.9, inside: 8.3, keys: 9.95, scrub: 11.33, ease: 12.1, agent: 12.9, devIn: 16.7, dev: 17.45, logo: 22.5, mont: 23.6, end: 24.5, body: 27.0 };
const DUR = S.body + 3;
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
put(VOICE, decode(join(ROOT, "audio/ElevenLabs_2026-10-17T08_19_49_Bunty - Warm and Clear_pvc_sp100_s99_sb75_v4.mp3")), VO, { fadeIn: 0.005, fadeOut: 0.05 });
// Pine Pro's track ("dramatic cinematic documentary", musicdream, Pixabay) from its second drop
put(MUSIC, decode(join(ROOT, "audio/music/musicdream-dramatic-cinematic-documentary-609202.mp3")), 0, { from: 102.38, len: S.body + 0.6, gain: 0.62, fadeIn: 0.4, fadeOut: 0.8 });

// ---------- a sound on every cut (mirrors CUTS in src/figma-motion/FigmaMotion.tsx) ----------
const CUTS = [0, 1.0, 1.45, 1.9, 3.2, 4.15, 4.9, 5.75, 6.75, 7.9, 8.35, 9.3, 9.95, 11.33, 12.1, 12.9, 14.6, 15.35, 16.7, 17.6, 18.6, 20.35, 21.0, 21.75, 22.5, 23.6, 23.9, 24.2, 24.5];
const CLICK = "mixkit-hard-pop-click-2364.wav", POP = "Pop 1.mp3", MCLICK = "Mouse Click.mp3", TICK = "Clicks/Click_03.wav";
const WHIPS = ["Swishes/Short whip.wav", "Swishes/Fast swish.wav", "Swishes/Sharp swoosh.wav", "Swishes/Fast zing.wav"];
CUTS.slice(1).forEach((c, i) => { hit(WHIPS[i % WHIPS.length], c, 0.2, { pan: (i % 3 - 1) * 0.25 }); hit(CLICK, c + 0.01, 0.14); });
// open: a low hum; the still screens land like shutters
hit("Subdrop Low+Hi/SD_Low+Hi_02.wav", 0.05, 0.35, { big: true });
[0.3, 0.66].forEach((w) => hit(TICK, w, 0.16));
hit("camera shot flash 2.wav", 1.0, 0.16); hit("camera shot flash 2.wav", 1.45, 0.14);
[1.9, 1.97, 2.04, 2.15].forEach((w) => hit(TICK, w, 0.14));
hit(CLICK, 2.28, 0.26);
// Meet Figma Motion
[0, 1, 2, 3, 4].forEach((i) => hit(POP, 3.22 + i * 0.06 + 0.25, 0.15, { pan: (i - 2) * 0.2 }));
hit("05 Impact.wav", 3.42, 0.42, { big: true });
hit("Swishes/Future zing.wav", 3.88, 0.2);
hit(MCLICK, 4.55, 0.42); hit("Digital HUD Interface Sounds/Select - 02.wav", 4.6, 0.16);
// switch a frame to Motion
hit(MCLICK, 5.3, 0.4);
hit(MCLICK, 6.02, 0.42); hit("Digital HUD Interface Sounds/Select - 01.wav", 6.08, 0.16);
hit(MCLICK, 6.45, 0.3);
hit("Swishes/Delay woosh.wav", 7.2, 0.26); hit("Bells/Bells 03.wav", 7.4, 0.1);
// right inside Figma
hit("Cinematic Whoosh Swoosh Sounds - pack 2/Cinematic Whoosh 03.wav", 8.4, 0.24);
// keyframes: a pop per key as the playhead passes
[0, 0.1, 0.35, 0.45, 0.55, 0.6, 0.75, 1.1, 1.15, 1.1].forEach((k, i) => hit(POP, 10.0 + (k / 1.3) * 0.95 + 0.1, 0.12, { pan: (i % 3 - 1) * 0.3 }));
at("mixkit-fast-tape-rewind-cinematic-transition-1092.wav", 11.4, 0.1, { len: 0.62, fadeOut: 0.1 });
hit(MCLICK, 12.18, 0.3); hit("Swishes/Future swoosh.wav", 12.45, 0.14);
// the agent
at("keyboard-typing-5997.mp3", 13.1, 0.3, { from: 0.4, len: 1.2, fadeOut: 0.08 });
hit(MCLICK, 14.48, 0.42); hit("Iphone Send.wav", 14.52, 0.2);
hit("shot light energy.mp3", 14.65, 0.22);
for (let i = 0; i < 10; i++) hit(POP, 14.7 + (0.55 * i) / 10 + 0.06, 0.12, { pan: (i % 3 - 1) * 0.35 });
hit("Swishes/Fast swish.wav", 15.5, 0.16);
// developers get the code
[17.7, 17.8, 17.9, 18.0, 18.1].forEach((w) => hit(TICK, w, 0.12));
hit("Digital HUD Interface Sounds/Select - 01.wav", 18.7, 0.14);
hit(CLICK, 19.52, 0.3); hit(CLICK, 20.38, 0.3); hit(CLICK, 21.02, 0.3);
hit(MCLICK, 21.9, 0.42); hit("Digital HUD Interface Sounds/Right (bells).wav", 21.95, 0.14);
// Figma Motion
hit("05 Impact.wav", 22.58, 0.45, { big: true });
[0, 1, 2, 3, 4].forEach((i) => hit(POP, 22.5 + i * 0.05 + 0.2, 0.13, { pan: (i - 2) * 0.2 }));
// design that moves
hit("Subdrop Low+Hi/SD_Low+Hi_04.wav", 24.5, 0.4, { big: true });
hit("Swishes/Golden swoosh.wav", 24.55, 0.24);
hit("Bells/Bells 03.wav", 25.1, 0.12);
// end card
hit("Swishes/Golden swoosh.wav", S.body + 0.4, 0.26);
hit("05 Impact.wav", S.body + 0.85, 0.32, { big: true });
hit("Bells/Bells 03.wav", S.body + 1.4, 0.14);

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
const BODY = Math.round(S.body * SR);
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
const out = join(ROOT, "public/figma-motion/mix.wav");
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
