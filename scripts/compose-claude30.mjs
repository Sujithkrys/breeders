// Sound for the 30s Claude Sonnet 5.5 film (ClaudeSonnet30) → public/sonnet/claude30-mix.wav, done the Pine Pro way:
// the same music ("dramatic cinematic documentary" by musicdream, Pixabay) started at its second drop (1:42.38) so the
// drop hits the first frame, every cut on its 136 BPM beat, and a recorded sound on every cut (Pine's own SFX).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/claude-sonnet/ClaudePine.tsx SHOT (30fps units, cut on beats of 13.235 units)
const BEAT = 30 * (60 / 136);
const bt = (n) => Math.round(n * BEAT) / 30; // the n-th beat, in seconds
const S = { open: 0, blocks: bt(8), space: bt(12), toggle: bt(16), voice: bt(18), steps: bt(28), answer: bt(34), film: bt(38), stat1: bt(52), stat2: bt(56), stat3: bt(60), logo: bt(64) };
const u = (shot, units) => S[shot] + units / 30;
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

// ---------- 0:00 open ----------
hit("Subdrop Low+Hi/SD_Low+Hi_02.wav", 0.0, 0.5, { big: true });
hit("Swishes/Space ship fly by.wav", 0.5, 0.3, { pan: -0.3 });
hit("shot light energy.mp3", u("open", 58), 0.3);
hit("Swishes/Future zing.wav", u("open", 60), 0.22, { pan: 0.3 });
// ---------- hand it over ----------
hit("Swishes/Short whip.wav", S.blocks, 0.4);
hit("05 Impact.wav", S.blocks + 0.02, 0.5, { big: true });
[1, 5, 9].forEach((k, i) => hit("mixkit-hard-pop-click-2364.wav", u("blocks", k + 1), 0.4, { pan: (i - 1) * 0.3 }));
[10, 14].forEach((k, i) => hit("Pop 1.mp3", u("blocks", k + 2), 0.2, { pan: i ? 0.3 : -0.3 }));
// ---------- the work in space ----------
hit("Cinematic Whoosh Swoosh Sounds - pack 2/Cinematic Whoosh 03.wav", S.space, 0.4);
[4, 6, 7, 9, 10, 12, 14].forEach((k, i) => hit("Pop 1.mp3", u("space", k + 4), 0.14, { pan: (i % 3 - 1) * 0.4 }));
hit("Swishes/Fast zing.wav", u("space", 40), 0.22);
// ---------- toggle ----------
hit("Swishes/Short whip.wav", S.toggle, 0.3);
hit("Mouse Click.mp3", u("toggle", 9), 0.45);
hit("Bells/Bells 03.wav", u("toggle", 11), 0.22);
hit("Swishes/Future zing.wav", u("toggle", 11), 0.2);
// ---------- voice prompt ----------
hit("Swishes/Sharp swoosh.wav", S.voice, 0.32);
hit("Mouse Click.mp3", u("voice", 7), 0.35);
hit("Mouse Click.mp3", u("voice", 67), 0.3);
at("keyboard-typing-5997.mp3", u("voice", 70), 0.32, { from: 0.4, len: 1.6, fadeOut: 0.12 });
hit("Mouse Click.mp3", u("voice", 123), 0.35);
hit("Iphone Send.wav", u("voice", 124), 0.3);
// ---------- working ----------
at("UI Data Loading Sound Effect.mp3", S.steps, 0.18, { len: 2.4, fadeOut: 0.4 });
[0, 14, 28, 42].forEach((k, i) => hit(`Digital HUD Interface Sounds/Select - 0${(i % 3) + 1}.wav`, u("steps", k + 2), 0.24));
// ---------- answer, play ----------
hit("Swishes/Golden swoosh.wav", S.answer, 0.3);
hit("Message sound.mp3", u("answer", 2), 0.22);
hit("Mouse Click.mp3", u("answer", 36), 0.4);
// ---------- the deck film ----------
hit("Swishes/Reverse riser 01.wav", S.film, 0.4);
hit("Cinematic Sub Drop/Cinematic Sub Drop - 04.wav", S.film, 0.45, { big: true });
hit("mixkit-big-cinematic-impact-788.mp3", S.film + 0.03, 0.4, { big: true }); // "Q3" slams
hit("Cinematic Whoosh Swoosh Sounds - pack 2/Cinematic Whoosh 05.wav", u("film", 25), 0.32); // clay circle wipe
[0, 1, 2, 3, 4, 5].forEach((i) => hit("Pop 1.mp3", u("film", 25 + 7 + i * 2), 0.12, { pan: (i - 2.5) * 0.15 })); // REVIEW letters
hit("Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 02.wav", u("film", 50), 0.4, { big: true }); // +29%
at("Display Digits 2.wav", u("film", 54), 0.3, { len: 0.7, fadeOut: 0.15 });
hit("Glitch transition sounds/T3.wav", u("film", 95), 0.35); // the tile grid
[0, 1, 2].forEach((i) => hit("Fast whip.wav", u("film", 96 + i * 5), 0.22, { pan: (i - 1) * 0.4 }));
hit("Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 04.wav", u("film", 135), 0.4, { big: true }); // end card
hit("Bells/Bells 05.wav", u("film", 143), 0.22);
// ---------- the numbers ----------
["stat1", "stat2", "stat3"].forEach((k, i) => {
  hit("Swishes/Short whip.wav", S[k], 0.36, { pan: (i - 1) * 0.3 });
  hit("05 Impact.wav", u(k, 2), 0.5, { big: true });
  hit("mixkit-hard-pop-click-2364.wav", u(k, 3), 0.35);
  hit("mixkit-hard-pop-click-2364.wav", u(k, 8), 0.3);
});
// ---------- logo ----------
hit("ES_Riser Suction 5 - SFX Producer.mp3", u("logo", 10), 0.45);
hit("11 Universe Boom A.wav", u("logo", 12), 0.55, { big: true });
hit("Lens flare transition sound effect.mp3", u("logo", 10), 0.3);
hit("Digital HUD Interface Sounds/Right (bells).wav", u("logo", 14), 0.22);

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
const out = join(ROOT, "public/sonnet/claude30-mix.wav");
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
