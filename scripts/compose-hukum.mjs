// Sound for HukumReel (src/hukum/HukumReel.tsx) → public/hukum/mix.wav. A fan-tribute remix of "Hukum" (Anirudh
// Ravichander, Jailer) cut in whole bars at 136.02 BPM: an underwater build that opens up, drums-out tension, one silent
// beat, the drop on "Hukum", a stutter chop, a jump into the chant, a tape stop. Plus a sound on every cut.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/hukum/HukumReel.tsx: everything in reel bars and beats (136.02 BPM)
const BEAT = 60 / 136.02, BAR = BEAT * 4;
const rb = (bar, beat = 0) => bar * BAR + beat * BEAT; // reel time
const SB = (bar) => 19.093 + bar * BAR; // song time of song bar `bar` (bar 0 = the music's entry, bar 9 = "Hukum")
const END = rb(17), OUTRO = 3;
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



// ---------- the remix: "Hukum" (Anirudh Ravichander, Jailer), re-cut in whole bars ----------
const SONG = decode(join(ROOT, "audio/Hukum---Thalaivar-Alappara-MassTamilan.dev.mp3"));
// a piece of song placed in the reel: [reel start, song start, length]
const place = (r0, s0, len, { gain = 1, fadeIn = 0.004, fadeOut = 0.006, lp } = {}) => {
  const [L, R] = SONG;
  const a = Math.round(s0 * SR), o = Math.round(r0 * SR), n = Math.round(len * SR);
  const z = [[0, 0, 0, 0], [0, 0, 0, 0]];
  const bq = (x, c, f0) => {
    const w = (2 * Math.PI * f0) / SR, al = Math.sin(w) / 2.2, cw = Math.cos(w);
    const b0 = (1 - cw) / 2, b1 = 1 - cw, b2 = b0, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    const q = z[c], y = (b0 * x + b1 * q[0] + b2 * q[1] - a1 * q[2] - a2 * q[3]) / a0;
    q[1] = q[0]; q[0] = x; q[3] = q[2]; q[2] = y;
    return y;
  };
  for (let i = 0; i < n; i++) {
    const j = a + i, k = o + i;
    if (k >= N || j >= L.length) break;
    const e = Math.min(1, i / (fadeIn * SR), (n - i) / (fadeOut * SR)) * gain;
    let l = L[j], r = R[j];
    if (lp) { const f = lp(i / SR); if (f < 19000) { l = bq(l, 0, f); r = bq(r, 1, f); } }
    MUSIC[0][k] += l * e; MUSIC[1][k] += r * e;
  }
};
// R0–R5: the build (song bars 3–8). Underwater for two bars, opening up, then drums-out tension, last beat silent.
const sweep = (t, t0, t1, f0, f1) => f0 * Math.pow(f1 / f0, Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
place(rb(0), SB(3), rb(5, 3), {
  gain: 0.62,
  fadeIn: 0.4,
  lp: (t) => (t < rb(2) ? 420 : t < rb(4) ? sweep(t, rb(2), rb(4), 420, 18000) : t < rb(5) ? 20000 : sweep(t, rb(5), rb(5, 3), 18000, 900)),
});
// R6–R12: DROP on "Hukum" — the mass verse, song bars 9–15
place(rb(6), SB(9), rb(4), { fadeIn: 0.002 });
// R10: the stutter — the first beat of "Hukum" four times, then two half-beats, then the line again
for (let n = 0; n < 4; n++) place(rb(10, n), SB(9), BEAT * 0.92, { fadeOut: 0.02 });
place(rb(11), SB(9), BEAT * 0.46, { fadeOut: 0.015 });
place(rb(11, 0.5), SB(9), BEAT * 0.46, { fadeOut: 0.015 });
place(rb(11, 1), SB(9), rb(2) - BEAT, { fadeIn: 0.002 });
// R13–R15: straight into the "Jai" chant (song bars 22–24), the last bar chopped into eighths
place(rb(13), SB(22), rb(2), { fadeIn: 0.002 });
for (let n = 0; n < 8; n++) place(rb(15, n / 2), SB(24) + (n % 2 ? BEAT / 2 : 0), BEAT * 0.45, { fadeOut: 0.012, gain: 1 + n * 0.03 });
// R16: tape stop — the last "Hukum" hit winds down over one beat, then the end hit
{
  const [L, R] = SONG; const s0 = SB(9), o = Math.round(rb(16) * SR), n = Math.round(BEAT * 1.6 * SR);
  for (let i = 0; i < n; i++) {
    const u = i / n, pos = s0 + (BEAT * 1.6) * (u - (u * u) / 2), f = pos * SR, j = Math.floor(f), fr = f - j;
    const g = 1 - Math.pow(u, 2.2);
    MUSIC[0][o + i] += (L[j] * (1 - fr) + L[j + 1] * fr) * g;
    MUSIC[1][o + i] += (R[j] * (1 - fr) + R[j + 1] * fr) * g;
  }
}
place(rb(16, 2), SB(10), BEAT * 2, { fadeOut: 1.2, fadeIn: 0.002 });

// ---------- sound design ----------
at("ES_Riser Suction 5 - SFX Producer.mp3", rb(4), 0.22, { len: rb(1, 3), fadeIn: 0.3, fadeOut: 0.02 });
// the silent beat stays silent
at("Subdrop Low+Hi/SD_Low+Hi_02.wav", rb(6), 0.55, { big: true });
at("05 Impact.wav", rb(6), 0.5, { big: true });
at("13 Metal Slam.wav", rb(6), 0.35, { big: true });
hit("Mouse Click.mp3", rb(0, 1), 0.35); // the lamp
at("keyboard-typing-5997.mp3", rb(2), 0.22, { from: 0.4, len: BEAT * 3.5, fadeOut: 0.05 });
for (let n = 0; n < 4; n++) hit("13 Metal Slam.wav", rb(3, n), 0.22 + n * 0.04, { big: true, pan: (n % 2 ? 1 : -1) * 0.2 }); // stamps
hit("Swishes/Sharp swoosh.wav", rb(4), 0.2);
hit("Lens flare transition sound effect.mp3", rb(5), 0.16);
// a whoosh on every montage cut, alternating sides, quieter than the music
for (let b = 26, i = 0; b < 52; b++, i++) if (b % 2 === 0) hit(["Swishes/Short whip.wav", "Swishes/Fast swish.wav", "Swishes/Sharp swoosh.wav"][i % 3], rb(0, b), 0.12, { pan: (i % 2 ? 1 : -1) * 0.35 });
hit("05 Impact.wav", rb(13), 0.42, { big: true }); // into the chant
hit("Swishes/Golden swoosh.wav", rb(16, 2), 0.3);
hit("Bells/Bells 03.wav", rb(16, 2.5), 0.16);
// outro: Breeders end card
hit("05 Impact.wav", END + 0.4, 0.35, { big: true });
hit("Swishes/Golden swoosh.wav", END + 0.75, 0.26);
hit("Bells/Bells 03.wav", END + 1.0, 0.12);

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
const vDuck = new Float32Array(N).fill(1); // no voiceover
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
const out = join(ROOT, "public/hukum/mix.wav");
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
