// Sound for SpotifyStems (src/spotify-stems/StemsFilm.tsx) → public/stems/mix.wav.
// Music: "Phonk" by The_Mountain (Pixabay), split into vocals / drums / bass / other with Demucs, then played live
// like a DJ set: drums pulled out underwater and slammed back, a vocal chop, a silent beat into the bass drop, a tape
// stop into the final drop. Every move in the picture really happens in the sound.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
// mirrors src/spotify-stems/StemsFilm.tsx: everything in film beats (123.18 BPM)
const BEAT = 60 / 123.18;
const bt = (n) => n * BEAT;
const END = bt(56), OUTRO = 3;
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



// ---------- music: the four Demucs stems of "Phonk" (The_Mountain, Pixabay), played live like a DJ set ----------
// The rule: every change lands on a downbeat, and every dip in energy is paid off within a beat or two.
//   b20–28  drums pulled out; vocals, bass and melody sink underwater (low-pass closing) under a riser
//   b28     drums slam back, filter wide open
//   b32–40  vocal chop: two vocal slices re-triggered on eighth notes over the running beat
//   b40     one beat of silence
//   b41     the bass drop: everything back at once
//   b43–44  tape stop (the record winds down), then the final drop on b44
const FROM = 9.735; // song time at film 0: film beat 12 = the first kick of the drop (15.58 s)
const STEM = (k) => decode(join(ROOT, `out/stems/htdemucs/phonk48/${k}.wav`));
const S = { vocals: STEM("vocals"), drums: STEM("drums"), bass: STEM("bass"), other: STEM("other") };
const ease01 = (x) => Math.max(0, Math.min(1, x));
// gain envelope of one stem at film time t (12 ms ramps at every edge)
const edge = (t, a, b2) => ease01(Math.min((t - a) / 0.012 + 0.5, (b2 - t) / 0.012 + 0.5));
const gainOf = (k, t) => {
  if (t >= bt(40) && t < bt(41)) return 1 - edge(t, bt(40), bt(41)); // the silent beat
  if (k === "drums" && t >= bt(20) && t < bt(28)) return 1 - edge(t, bt(20), bt(28));
  if (k === "vocals" && t >= bt(32) && t < bt(40)) return 1 - edge(t, bt(32), bt(40)); // replaced by the chop
  return 1;
};
const fadeEnd = (t) => (t < END + 0.4 ? 1 : Math.max(0, 1 - (t - END - 0.4) / 2.2));
// a resonant low-pass whose cutoff closes from wide open to 500 Hz over b20–28, snapping open on b28
const lp = { z: [[0, 0, 0, 0], [0, 0, 0, 0]] };
const cutoffAt = (t) => {
  if (t < bt(20) || t >= bt(28)) return 0; // 0 = bypass
  const k = (t - bt(20)) / (bt(28) - bt(20));
  return 18000 * Math.pow(500 / 18000, Math.pow(k, 0.7));
};
const biquad = (x, c, f0, q = 1.1) => {
  const w = (2 * Math.PI * f0) / SR, al = Math.sin(w) / (2 * q), cw = Math.cos(w);
  const b0 = (1 - cw) / 2, b1 = 1 - cw, b2 = (1 - cw) / 2, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
  const z = lp.z[c];
  const y = (b0 * x + b1 * z[0] + b2 * z[1] - a1 * z[2] - a2 * z[3]) / a0;
  z[1] = z[0]; z[0] = x; z[3] = z[2]; z[2] = y;
  return y;
};
// tape stop over b43–44: playback rate falls from 1 to 0, so the read head covers half a beat of song
const TS0 = bt(43), TS = bt(1);
const songPos = (t) => {
  if (t >= TS0 && t < TS0 + TS) { const u = t - TS0; return FROM + TS0 + u - (u * u) / (2 * TS); }
  return FROM + t;
};
const read = ([L, R], pos) => {
  const f = pos * SR, i = Math.floor(f), a = f - i;
  if (i + 1 >= L.length || i < 0) return [0, 0];
  return [L[i] * (1 - a) + L[i + 1] * a, R[i] * (1 - a) + R[i + 1] * a];
};
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const pos = songPos(t);
  const fe = fadeEnd(t);
  if (fe <= 0) break;
  const tapeGain = t >= TS0 && t < TS0 + TS ? 1 - Math.pow((t - TS0) / TS, 3) : 1;
  let dl = 0, dr = 0, ol = 0, or = 0;
  for (const k of ["vocals", "bass", "other"]) {
    const g = gainOf(k, t);
    if (g <= 0) continue;
    const [l, r] = read(S[k], pos);
    ol += l * g; or += r * g;
  }
  {
    const g = gainOf("drums", t);
    if (g > 0) { const [l, r] = read(S.drums, pos); dl = l * g; dr = r * g; }
  }
  const fc = cutoffAt(t);
  if (fc > 0) { ol = biquad(ol, 0, fc); or = biquad(or, 1, fc); }
  MUSIC[0][i] += (ol + dl) * fe * tapeGain;
  MUSIC[1][i] += (or + dr) * fe * tapeGain;
}
// the vocal chop: two strong vocal eighths (found by scripts/stems-analyse.py data) re-triggered on the grid
{
  const E8 = BEAT / 2;
  const SL = { A: 33.846, B: 32.385 }; // absolute song times of the two strongest vocal eighths
  const PAT = ["A", "A", "", "A", "A", "", "A", "A", "B", "", "B", "", "A", "A", "A", "A"];
  PAT.forEach((p, n) => {
    if (!p) return;
    const s0 = Math.round((bt(32) + n * E8) * SR), len = Math.round(E8 * SR * 0.92);
    const src = Math.round(SL[p] * SR);
    const [L, R] = S.vocals;
    for (let i = 0; i < len; i++) {
      const e = Math.min(1, i / (0.004 * SR), (len - i) / (0.03 * SR)) * 1.15;
      MUSIC[0][s0 + i] += L[src + i] * e;
      MUSIC[1][s0 + i] += R[src + i] * e;
    }
  });
}

// ---------- sound design: the payoffs ----------
hit("Mouse Click.mp3", 0.12, 0.5); // play
[8.4, 9.2, 10.0].forEach((b2) => hit("Digital HUD Interface Sounds/Select - 01.wav", bt(b2), 0.12, { pan: 0.2 }));
hit("Mouse Click.mp3", bt(10.8), 0.4); // Open in Stems
hit("Swishes/Golden swoosh.wav", bt(12), 0.3); // the split
hit("Swishes/Future zing.wav", bt(12) + 0.05, 0.16, { pan: 0.3 });
hit("Mouse Click.mp3", bt(20) - 0.03, 0.36); // drums out
at("ES_Riser Suction 5 - SFX Producer.mp3", bt(23), 0.34, { len: bt(5), fadeIn: 0.4, fadeOut: 0.02 }); // the climb
hit("Mouse Click.mp3", bt(27.85), 0.4); // drums back in
hit("05 Impact.wav", bt(28), 0.55, { big: true });
hit("Subdrop Low+Hi/SD_Low+Hi_02.wav", bt(28) + 0.01, 0.4, { big: true });
for (let n = 0; n < 16; n++) if (n % 4 === 0) hit("Digital HUD Interface Sounds/Select - 02.wav", bt(32) + n * (BEAT / 2), 0.06); // pad taps
hit("Swishes/Reverse riser 01.wav", bt(41) - 0.02, 0.28); // into the drop, through the silence
hit("13 Metal Slam.wav", bt(41), 0.5, { big: true });
hit("Subdrop Low+Hi/SD_Low+Hi_05.wav", bt(41), 0.45, { big: true });
hit("05 Impact.wav", bt(44), 0.5, { big: true }); // the final drop
hit("Swishes/Woosh rattle.wav", bt(44) + 0.02, 0.22);
for (let b2 = 49; b2 < 53; b2 += 0.5) hit("Swishes/Fast swish.wav", bt(b2) + 0.01, 0.1, { pan: ((b2 * 2) % 2 ? 1 : -1) * 0.35 }); // montage
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
const out = join(ROOT, "public/stems/mix.wav");
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
