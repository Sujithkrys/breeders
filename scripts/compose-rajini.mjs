// Sound for RajiniDots (src/rajini/RajiniDots.tsx) → public/rajini/mix.wav. A fan-tribute remix of "Hukum" (Anirudh
// Ravichander, Jailer) from its four Demucs stems, cut in whole bars at 136.02 BPM: the voice alone, drums slamming in,
// bass and the music opening, a closing build into one silent beat, the drop on "Hukum", drums out and back, a "Hukum"
// vocal chop, the "Jai" chant with a stutter, a tape stop. Plus our own synthesised kick, snare roll, hats and fills.
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



// ---------- the remix, built from the four Demucs stems (song 0–80 s) ----------
const STEM = (k) => decode(join(ROOT, `out/stems/hukum/${k}.wav`));
const S = { vocals: STEM("vocals"), drums: STEM("drums"), bass: STEM("bass"), other: STEM("other") };
// place a piece of one stem: [reel start, song start, length], with an optional low-pass sweep and gain curve
const lane = (k, r0, s0, len, { gain = 1, fadeIn = 0.004, fadeOut = 0.008, lp, g } = {}) => {
  const [L, R] = S[k];
  const a = Math.round(s0 * SR), o = Math.round(r0 * SR), n = Math.round(len * SR);
  const z = [[0, 0, 0, 0], [0, 0, 0, 0]];
  const bq = (x, c, f0) => {
    const w = (2 * Math.PI * f0) / SR, al = Math.sin(w) / 2.4, cw = Math.cos(w);
    const b0 = (1 - cw) / 2, b1 = 1 - cw, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    const q = z[c], y = (b0 * x + b1 * q[0] + b0 * q[1] - a1 * q[2] - a2 * q[3]) / a0;
    q[1] = q[0]; q[0] = x; q[3] = q[2]; q[2] = y;
    return y;
  };
  for (let i = 0; i < n; i++) {
    const j = a + i, kk = o + i;
    if (kk >= N || j >= L.length || j < 0) continue;
    const t = i / SR;
    const e = Math.min(1, i / (fadeIn * SR), (n - i) / (fadeOut * SR)) * gain * (g ? g(t) : 1);
    let l = L[j], r = R[j];
    if (lp) { const f = lp(t); if (f < 19000) { l = bq(l, 0, f); r = bq(r, 1, f); } }
    MUSIC[0][kk] += l * e; MUSIC[1][kk] += r * e;
  }
};
const all = (r0, s0, len, opts = {}) => ["vocals", "drums", "bass", "other"].forEach((k) => lane(k, r0, s0, len, opts));
const sweep = (t, t0, t1, f0, f1) => f0 * Math.pow(f1 / f0, Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));

// R0–R1: the spoken intro voice alone (song 11.5 s, before the music enters), over its own quiet bed
lane("vocals", rb(0), 11.5, rb(2), { fadeIn: 0.05, fadeOut: 0.25, gain: 1.1 });
lane("other", rb(0), 11.5, rb(2), { gain: 0.7, fadeIn: 0.4, fadeOut: 0.25 });
// R2–R3: drums slam in under it (bars 5–6)
lane("vocals", rb(2), SB(5), rb(2));
lane("drums", rb(2), SB(5), rb(2), { fadeIn: 0.002 });
lane("other", rb(2), SB(5), rb(2), { gain: 0.7, lp: (t) => sweep(t, 0, rb(2), 900, 6000) });
// R4: bass joins, the music opens (bar 7)
all(rb(4), SB(7), rb(1), { lp: (t) => sweep(t, 0, rb(1), 6000, 18000) });
// R5: drums pulled, the music closes down, the last beat is silent (bar 8)
lane("vocals", rb(5), SB(8), rb(0, 3), { fadeOut: 0.02 });
lane("bass", rb(5), SB(8), rb(0, 3), { gain: 0.8, fadeOut: 0.02 });
lane("other", rb(5), SB(8), rb(0, 3), { fadeOut: 0.02, lp: (t) => sweep(t, 0, rb(0, 3), 18000, 500) });
// R6: DROP on "Hukum", full mix (bars 9–10)
all(rb(6), SB(9), rb(2), { fadeIn: 0.002 });
// R8: drums out for a bar, the rest filtered; R9: drums slam back (bars 11–12)
["vocals", "bass"].forEach((k) => lane(k, rb(8), SB(11), rb(1)));
lane("other", rb(8), SB(11), rb(1), { lp: (t) => sweep(t, 0, rb(1), 4000, 900) });
all(rb(9), SB(12), rb(1), { fadeIn: 0.002 });
// R10: the chop — the "Hukum" vocal re-triggered on every beat over the bar's drums and bass (bar 13)
["drums", "bass"].forEach((k) => lane(k, rb(10), SB(13), rb(1)));
lane("other", rb(10), SB(13), rb(1), { gain: 0.6 });
for (let n = 0; n < 4; n++) lane("vocals", rb(10, n), SB(9), BEAT * 0.9, { fadeOut: 0.02, gain: 1.1 });
// R11–R12: full verse (bars 14–15)
all(rb(11), SB(14), rb(2), { fadeIn: 0.002 });
// R13–R15: the "Jai" chant (bars 22–24), the last bar chopped into eighths
all(rb(13), SB(22), rb(2), { fadeIn: 0.002 });
for (let n = 0; n < 8; n++) all(rb(15, n / 2), SB(24) + (n % 2 ? BEAT / 2 : 0), BEAT * 0.46, { fadeOut: 0.012 });
// R16: tape stop on the full mix, then the last hit rings out
{
  const s0 = SB(9), o = Math.round(rb(16) * SR), n = Math.round(BEAT * 1.6 * SR);
  for (const k of ["vocals", "drums", "bass", "other"]) {
    const [L, R] = S[k];
    for (let i = 0; i < n; i++) {
      const u = i / n, pos = s0 + BEAT * 1.6 * (u - (u * u) / 2), f = pos * SR, j = Math.floor(f), fr = f - j;
      const gg = 1 - Math.pow(u, 2.2);
      MUSIC[0][o + i] += (L[j] * (1 - fr) + L[j + 1] * fr) * gg;
      MUSIC[1][o + i] += (R[j] * (1 - fr) + R[j + 1] * fr) * gg;
    }
  }
}
all(rb(16, 2), SB(10), BEAT * 2, { fadeOut: 1.0, fadeIn: 0.002 });

// ---------- our own beats, layered over the stems ----------
// a synthesised kit: kick (a pitch-dropping sine), snare (a noise burst on a 190 Hz body), hat (bright noise tick)
const synth = (t0, dur, fn, gain) => {
  const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const k = s0 + i; if (k < 0 || k >= N) continue;
    const v = fn(i / SR) * gain;
    FX[0][k] += v; FX[1][k] += v;
  }
};
let seed = 7; const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const kick = (t0, g = 0.9) => { let ph = 0; synth(t0, 0.32, (t) => { const f = 45 + 95 * Math.exp(-t * 28); ph += (2 * Math.PI * f) / SR; return Math.sin(ph) * Math.exp(-t * 9); }, g); };
const snare = (t0, g = 0.5, pitch = 1) => synth(t0, 0.18, (t) => (noise() * 0.8 + Math.sin(2 * Math.PI * 190 * pitch * t) * 0.5) * Math.exp(-t * (22 / pitch)), g);
let hp = 0;
const hat = (t0, g = 0.12) => synth(t0, 0.05, (t) => { const x = noise(); const y = x - hp; hp = x; return y * Math.exp(-t * 90); }, g);
// the build (bar 5): a snare roll that accelerates and climbs, 8ths → 16ths → 32nds, stopping dead before the silent beat
for (let k = 0; k < 3; k++) snare(rb(5, k * 0.5), 0.22 + k * 0.03, 1);
for (let k = 0; k < 4; k++) snare(rb(5, 1.5 + k * 0.25), 0.3 + k * 0.03, 1 + k * 0.05);
for (let k = 0; k < 4; k++) snare(rb(5, 2.5 + k * 0.125), 0.42, 1.25 + k * 0.08); // last hit at beat 2.875, the silent beat stays silent
// the drop and every downbeat of the mass section: our kick doubles the song's
kick(rb(6), 1.0);
for (let bar = 7; bar < 13; bar++) [0, 2].forEach((bt) => kick(rb(bar, bt), 0.55));
// hats driving the montage: 16ths, accented on the off-beats
for (let x = rb(7); x < rb(13); x += BEAT / 4) hat(x, Math.round((x - rb(7)) / (BEAT / 4)) % 4 === 2 ? 0.16 : 0.08);
// a fill into the chant, and kick pushes under it
for (let k = 0; k < 6; k++) snare(rb(12, 2.5 + k * 0.25), 0.35 + k * 0.04, 1 + k * 0.05);
for (let bar = 13; bar < 16; bar++) [0, 1, 2, 3].forEach((bt) => kick(rb(bar, bt), 0.5));

// ---------- sound design: real-object sounds, kept under the music ----------
at("ES_Riser Suction 5 - SFX Producer.mp3", rb(5) - 0.4, 0.22, { len: rb(0, 3) + 0.4, fadeIn: 0.3, fadeOut: 0.02 });
at("Subdrop Low+Hi/SD_Low+Hi_02.wav", rb(6), 0.5, { big: true });
at("05 Impact.wav", rb(6), 0.4, { big: true });
hit("Swishes/Short whip.wav", rb(2), 0.18); // the auto arrives
hit("Mouse Click.mp3", rb(4), 0.3); // coin
hit("Mouse Click.mp3", rb(4, 2), 0.25); // watch tick
hit("Swishes/Golden swoosh.wav", rb(6) + 0.02, 0.22); // shades twirl
for (let b = 26, i = 0; b < 52; b++, i++) if (b % 2 === 0) hit(["Swishes/Short whip.wav", "Swishes/Fast swish.wav", "Swishes/Sharp swoosh.wav"][i % 3], rb(0, b), 0.1, { pan: (i % 2 ? 1 : -1) * 0.35 });
at("05 Impact.wav", rb(13), 0.32, { big: true });
hit("Swishes/Golden swoosh.wav", rb(16, 2), 0.24);
hit("Bells/Bells 03.wav", rb(16, 2.5), 0.12);
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
const out = join(ROOT, "public/rajini/mix.wav");
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
