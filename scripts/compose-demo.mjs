// Sound for the 30s Claude Sonnet 5.5 product demo (ClaudeDemo30) → public/sonnet/demo-mix.wav, done the Pine Pro way:
// the same music ("dramatic cinematic documentary" by musicdream, Pixabay) started at its second drop (1:42.38) so the
// drop hits the first frame, every cut on its 136 BPM beat, and a recorded sound on every cut (Pine's own SFX).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/claude-sonnet/Demo.tsx (seconds, on beats of 60/136)
const B = 60 / 136;
const bt = (n) => n * B;
const D = { intro: 0, open: bt(6), model: bt(9), tasks: bt(15), stats: bt(51), end: bt(60) };
const TASK_LEN = bt(9);
const PROMPTS = ["Build a landing page for my ceramics studio, Kiln & Co.", "Turn these Q3 notes into a board deck.", "Chart revenue by region and tell me what stands out.", "Plan 3 days in Goa for two, under ₹40,000."];
const T = { total: 30, cta: 30 };
const DUR = 30;
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


// ---------- music: Pine Pro's track from its second drop ----------
const TRACK = decode(join(ROOT, "audio/music/musicdream-dramatic-cinematic-documentary-609202.mp3"));
put(MUSIC, TRACK, 0, { from: 102.38, len: 30, fadeIn: 0.005, fadeOut: 0.6 });

// ---------- the announcement ----------
hit("Subdrop Low+Hi/SD_Low+Hi_02.wav", 0.0, 0.45, { big: true });
hit("Swishes/Future swoosh.wav", 0.2, 0.28);
hit("shot light energy.mp3", 0.62, 0.26);
hit("Pop 1.mp3", 1.45, 0.16);
// ---------- open Claude, switch the model ----------
hit("Swishes/Short whip.wav", D.open, 0.32);
const menuAt = D.model + bt(1.5), pickAt = D.model + bt(4);
hit("Mouse Click.mp3", menuAt - 0.05, 0.42);
hit("Pop 1.mp3", menuAt + 0.02, 0.14);
hit("Mouse Click.mp3", pickAt, 0.42);
hit("Pop Bubble Sound Effect.mp3", pickAt + 0.05, 0.22);
hit("Swishes/Future zing.wav", pickAt + 0.08, 0.2);
// ---------- four tasks ----------
PROMPTS.forEach((p, i) => {
  const a = D.tasks + i * TASK_LEN, m = a + bt(3), z = a + bt(6);
  const sendAt = a + 0.1 + p.length / 55 + 0.05;
  hit(i % 2 ? "Swishes/Sharp swoosh.wav" : "Swishes/Short whip.wav", a, 0.3, { pan: i % 2 ? 0.3 : -0.3 });
  at("keyboard-typing-5997.mp3", a + 0.1, 0.3, { from: 0.4 + i * 1.3, len: Math.max(0.3, sendAt - a - 0.15), fadeOut: 0.06 });
  hit("Mouse Click.mp3", sendAt, 0.38);
  hit("Iphone Send.wav", sendAt + 0.02, 0.22);
  hit("Message sound.mp3", m + 0.15, 0.14);
  hit("Swishes/Fast swish.wav", m + 0.6, 0.22, { pan: 0.4 });
  hit(i % 2 ? "Swishes/Short whip.wav" : "Swishes/Sharp swoosh.wav", z, 0.28, { pan: i % 2 ? -0.3 : 0.3 });
  [0.15, 0.35, 0.55].forEach((f, k) => hit("Pop 1.mp3", m + 0.8 + f * (TASK_LEN - bt(3) - 1.1), 0.08, { pan: (k - 1) * 0.4 }));
});
// ---------- the numbers ----------
[0, 1, 2].forEach((i) => {
  const t = D.stats + bt(3 * i);
  hit("Swishes/Short whip.wav", t, 0.34, { pan: (i - 1) * 0.3 });
  hit("05 Impact.wav", t + 0.06, 0.48, { big: true });
  hit("mixkit-hard-pop-click-2364.wav", t + 0.28, 0.3);
});
// ---------- the name ----------
hit("ES_Riser Suction 5 - SFX Producer.mp3", D.end + 0.05, 0.4);
hit("11 Universe Boom A.wav", D.end + 0.08, 0.5, { big: true });
hit("shot light energy.mp3", D.end + 0.3, 0.26);

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
const out = join(ROOT, "public/sonnet/demo-mix.wav");
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
