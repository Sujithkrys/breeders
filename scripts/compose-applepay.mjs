// Sound for the Apple Pay India film (ApplePayIndia) → public/applepay/mix.wav.
// Music (temporary until the ElevenLabs track): "dramatic cinematic documentary" by musicdream (Pixabay), cut so its
// drop (42.381s) lands on "Finally." (10.45s); the music is hushed for the silence before 2026.
// SFX: the recorded pack in audio/sfx, each placed by its measured peak. The "ding": a bell synthesised here, tuned to A
// major pentatonic; every Apple Pay tick plays one note, and in the montage the notes play a rising melody.
// Run: node scripts/compose-applepay.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
const DUR = 39.3 + 3; // film, then the 3s Breeders end card
const N = Math.round(SR * DUR);
const T = { finally: 10.45, finale: 30.3, outro: 39.3 };

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
const MUSIC = bus(), FX = bus(), BIG = bus();
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

// ---------- the ding: a small bell (inharmonic partials, fast attack, exponential decay) ----------
const NOTE = { A5: 880, B5: 987.77, Cs6: 1108.73, E6: 1318.51, Fs6: 1479.98, A6: 1760, B6: 1975.53, Cs7: 2217.46, E7: 2637.02 };
const ding = (t, f, gain = 0.32, pan = 0, decay = 0.55) => {
  const n = Math.round(SR * (decay * 3.2)), L = new Float32Array(n), R = new Float32Array(n);
  const parts = [[1, 1, decay], [2.0, 0.42, decay * 0.6], [3.01, 0.2, decay * 0.4], [4.2, 0.09, decay * 0.25], [0.5, 0.18, decay * 1.3]];
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    const atk = Math.min(1, s / 0.003);
    let v = 0;
    for (const [m, a, d] of parts) v += a * Math.sin(2 * Math.PI * f * m * s) * Math.exp(-s / d);
    v *= atk * gain;
    L[i] = v * Math.min(1, 1 - pan);
    R[i] = v * Math.min(1, 1 + pan);
  }
  put(FX, [L, R], t, { fadeOut: 0.05 });
};
const success = (t, gain = 0.3) => { ding(t, NOTE.E6, gain * 0.9); ding(t + 0.11, NOTE.A6, gain); };

// ---------- music (temporary bed) ----------
const TRACK = decode(join(ROOT, "audio/music/musicdream-dramatic-cinematic-documentary-609202.mp3"));
const DROP1 = 42.381, OFF = DROP1 - T.finally; // track time = film time + OFF
put(MUSIC, TRACK, 0, { from: OFF, len: DUR, fadeIn: 0.6, fadeOut: 1.2 });

// ---------- Act 1 · the wait ----------
hit("Digital HUD Interface Sounds/HUD Screen - 01.wav", 0.35, 0.35);
hit("Clicks/Click_03.wav", 0.6, 0.4);
ding(1.0, NOTE.A5, 0.3);
hit("Bells/Bells 01.wav", 1.0, 0.18);
for (let y = 2015; y <= 2025; y++) {
  const t = 2.0 + (y - 2015) * 0.5;
  hit("Clicks/Click_04.wav", t, 0.3, { pan: -0.2 });
  ding(t + 0.05, [NOTE.A5, NOTE.B5, NOTE.Cs6, NOTE.E6, NOTE.Fs6][(y - 2015) % 5], 0.12, 0.3 - ((y - 2015) % 3) * 0.3, 0.35);
}
{ // the clock speeds up while India waits, then stops dead
  let t = 7.0, gap = 0.25;
  while (t < 8.6) { hit("Clicks/Click_01.wav", t, 0.3 + (t - 7) * 0.12, { pan: 0.15 }); t += gap; gap = Math.max(0.055, gap * 0.86); }
}
// 2026: India ignites, the camera dives into it, the city forms, and "Finally." lands on the drop
hit("Display Digits 2.wav", 9.15, 0.35, { len: 0.3, fadeOut: 0.1 });
hit("Lens flare transition sound effect.mp3", 9.3, 0.45);
{ const name = "Cinematic Whoosh Swoosh Sounds - pack 2/Cinematic Whoosh 05.wav", pk = peakOf(name); put(FX, sfx(name), 9.25, { from: Math.max(0, pk - 0.9), gain: 0.5, fadeIn: 0.05 }); }
hit("shot light energy.mp3", 10.15, 0.35);
hit("Digital HUD Interface Sounds/HUD Screen - 02.wav", 10.1, 0.25);
{ const name = "11 Universe Boom A.wav", pk = peakOf(name); put(BIG, sfx(name), T.finally - 0.5, { from: pk - 0.5, gain: 0.75, fadeIn: 0.05 }); }
hit("Subdrop Low+Hi/SD_Low+Hi_02.wav", T.finally, 0.5, { big: true });
success(11.85, 0.3);
hit("Bells/Bells 03.wav", 11.85, 0.16);

// ---------- the places: a whoosh into each scene, an NFC blip + chime as the payer turns gold ----------
const PLACES = [[13.0, 14.9], [16.6, 18.1], [19.6, 20.8], [22.2, 23.2], [24.6, 25.4], [27.6, 28.7]];
const WHOOSH = ["Swishes/Fast zing.wav", "Cinematic Whoosh Swoosh Sounds - pack 2/Cinematic Whoosh 03.wav", "Swishes/Sharp swoosh.wav", "Cinematic Whoosh Swoosh Sounds - pack 2/Cinematic Whoosh 07.wav"];
const CHIME = [NOTE.E6, NOTE.Fs6, NOTE.A6, NOTE.B6, NOTE.Cs7, NOTE.A6];
PLACES.forEach(([t0, tap], i) => {
  hit(WHOOSH[i % WHOOSH.length], t0 - 0.05, 0.32, { pan: ((i % 3) - 1) * 0.35 });
  hit("Digital HUD Interface Sounds/Right (bells).wav", tap, 0.32);
  ding(tap + 0.02, CHIME[i], 0.24, ((i % 3) - 1) * 0.2, 0.6);
  ding(tap + 0.13, CHIME[i] * 1.5, 0.18, ((i % 3) - 1) * 0.2, 0.7);
  hit("shot light energy.mp3", tap + 0.05, 0.12);
  hit("Pop 1.mp3", tap + 0.27, 0.11, { pan: ((i % 3) - 1) * 0.2 }); // the receipt pops up
});
// montage: five gold moments, 0.3s each, the chimes climbing
[NOTE.A6, NOTE.B6, NOTE.Cs7, NOTE.E7, NOTE.A6 * 2].forEach((f, i) => { ding(26.1 + i * 0.3, f, 0.2, ((i % 2) - 0.5) * 0.6, 0.35); hit("Pop 1.mp3", 26.1 + i * 0.3, 0.2); });

// ---------- finale (authored from 35s, shifted by FIN) ----------
const FIN = T.finale - 35;
hit("Subdrop Low/SD_Low_07.wav", T.finale, 0.4, { big: true, len: 1.4, fadeOut: 0.4 });
// the day's receipts fly home into India: one soft whoosh as they leave, a rising chime as each one lands
hit("Swishes/Fast zing.wav", T.finale + 0.55, 0.18, { pan: -0.2 });
[NOTE.E6, NOTE.Fs6, NOTE.A6, NOTE.B6, NOTE.Cs7, NOTE.E7].forEach((f, i) => { ding(T.finale + 1.0 + i * 0.1, f, 0.13, ((i % 3) - 1) * 0.25, 0.4); hit("Pop 1.mp3", T.finale + 1.0 + i * 0.1, 0.1); });
hit("Swishes/Delay woosh.wav", 36.45 + FIN, 0.35);
hit("ES_Riser Suction 5 - SFX Producer.mp3", 39.0 + FIN, 0.5);
hit("11 Universe Boom A.wav", 39.0 + FIN, 0.55, { big: true });
success(39.45 + FIN, 0.34);
hit("Bells/Bells 05.wav", 40.0 + FIN, 0.2);
ding(41.85 + FIN, NOTE.A6, 0.16, 0, 0.9);

const VOICE = bus(); // no voice in this film

// ---------- the Breeders end card (src/brand/Breeders.tsx): mark pops, name slides out ----------
hit("Swishes/Golden swoosh.wav", T.outro + 0.3, 0.3);
hit("05 Impact.wav", T.outro + 0.05, 0.3, { big: true });
hit("Bells/Bells 03.wav", T.outro + 0.6, 0.14);

// ---------- mix + master ----------
const duck = new Float32Array(N).fill(1);
{
  let env = 0;
  const att = Math.exp(-1 / (0.002 * SR)), rel = Math.exp(-1 / (0.22 * SR));
  for (let i = 0; i < N; i++) {
    const lvl = Math.max(Math.abs(BIG[0][i]), Math.abs(BIG[1][i]));
    env = lvl > env ? att * env + (1 - att) * lvl : rel * env + (1 - rel) * lvl;
    duck[i] = 1 - 0.5 * Math.min(1, env / 0.25);
  }
}
// the music sits under the montage's dings and drops out for the silence before 2026
const musicGain = (i) => {
  const s = i / SR;
  const hush = s > 8.55 && s < 10.3 ? Math.max(0, 1 - Math.min(s - 8.55, 10.3 - s) / 0.05) : 1;
  return 0.6 * hush * (s >= 13 && s < 27.6 ? 0.85 : 1);
};
const mix = bus();
const vDuck = new Float32Array(N).fill(1);
{
  let env = 0;
  const att = Math.exp(-1 / (0.01 * SR)), rel = Math.exp(-1 / (0.3 * SR));
  for (let i = 0; i < N; i++) {
    const lvl = Math.max(Math.abs(VOICE[0][i]), Math.abs(VOICE[1][i]));
    env = lvl > env ? att * env + (1 - att) * lvl : rel * env + (1 - rel) * lvl;
    vDuck[i] = 1 - 0.45 * Math.min(1, env / 0.08);
  }
}
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) mix[c][i] = MUSIC[c][i] * musicGain(i) * duck[i] + (FX[c][i] * 0.95 + BIG[c][i] * 0.9) * vDuck[i] + VOICE[c][i] * 1.6;
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
const out = join(ROOT, "public/applepay/mix.wav");
mkdirSync(dirname(out), { recursive: true });
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
let peak = 0;
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) {
  let v = mix[c][i] * gain * gr[i];
  v = Math.max(-CEIL, Math.min(CEIL, v));
  peak = Math.max(peak, Math.abs(v));
  buf.writeInt16LE(Math.round(v * 32767), 44 + (i * 2 + c) * 2);
}
writeFileSync(out, buf);
console.log(`Wrote ${out} (gain ${gain.toFixed(2)}, peak ${peak.toFixed(3)})`);
