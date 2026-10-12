// Composes, mixes and masters the Pine Pro soundtrack into public/audio/pine-pro-25.wav (engine shared with compose-audio.mjs).
// Sources (royalty-free, see assets/samples/LICENSES.md): Sonic Pi samples (CC0) and the Salamander Grand Piano
// (CC BY 3.0, Alexander Holm). Pads and sub bass are synthesized here.
// Run: node scripts/compose-audio.mjs [path/to/unpacked/packages]   (argument only needed to copy samples in)
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { random } from "remotion";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAMPLES = join(ROOT, "assets/samples");
const FFMPEG = join(ROOT, "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg");
const SRC = process.argv[2];
const SR = 44100;
const DUR = 25;
const N = SR * DUR;
const TAU = Math.PI * 2;

// ---------- samples ----------
const srcPath = (rel) => {
  const [kind, file] = rel.split("/");
  if (kind === "sp") return join(SRC, "supersonic-scsynth-samples-0.86.0/package/samples", file);
  return join(SRC, `audio-samples-piano-mp3-${kind === "piano8" ? "velocity8" : "velocity12"}-1.0.5/package/audio`, file);
};
const cache = new Map();
const load = (rel) => {
  if (cache.has(rel)) return cache.get(rel);
  const path = join(SAMPLES, rel);
  if (!existsSync(path)) {
    if (!SRC) throw new Error(`Missing ${path}; pass the unpacked packages dir to copy samples in.`);
    mkdirSync(dirname(path), { recursive: true });
    copyFileSync(srcPath(rel), path);
  }
  const wav = execFileSync(FFMPEG, ["-v", "error", "-i", path, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", "-f", "wav", "-"], {
    env: { ...process.env, LD_LIBRARY_PATH: dirname(FFMPEG) },
    maxBuffer: 1 << 28,
  });
  const i = wav.indexOf("data");
  const bytes = wav.length - i - 8;
  const pcm = new Int16Array(wav.buffer.slice(wav.byteOffset + i + 8, wav.byteOffset + i + 8 + bytes - (bytes % 2)));
  const out = Float32Array.from(pcm, (s) => s / 32768);
  cache.set(rel, out);
  return out;
};
const sp = (name) => load(`sp/${name}.flac`);
const resample = (x, ratio) => {
  const n = Math.floor(x.length / ratio);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * ratio, k = Math.floor(p), f = p - k;
    o[i] = x[k] * (1 - f) + (x[k + 1] ?? 0) * f;
  }
  return o;
};
// Salamander is sampled every minor third (A, C, D#, F#); the nearest sample is at most ±1 semitone away.
const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const piano = (midi, loud = false) => {
  const key = `p${midi}${loud}`;
  if (cache.has(key)) return cache.get(key);
  const s = 21 + 3 * Math.round((midi - 21) / 3);
  const v = loud ? 12 : 8;
  const x = resample(load(`piano${v}/${SHARP[s % 12]}${Math.floor(s / 12) - 1}v${v}.mp3`), 2 ** ((midi - s) / 12));
  cache.set(key, x);
  return x;
};

// ---------- buses & placement ----------
const bus = () => [new Float32Array(N), new Float32Array(N)];
const B = { kick: bus(), drums: bus(), bass: bus(), pad: bus(), keys: bus(), tex: bus(), sfx: bus() };
const panGains = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];
const place = (b, x, t, { gain = 1, pan = 0, len, attack = 0.001, release = 0.03, panTo } = {}) => {
  const start = Math.round(t * SR);
  const n = Math.min(len ? Math.round(len * SR) : x.length, x.length);
  const a = Math.max(1, attack * SR), r = Math.max(1, release * SR);
  for (let i = 0; i < n; i++) {
    const j = start + i;
    if (j < 0) continue;
    if (j >= N) break;
    const env = Math.min(1, i / a, (n - i) / r);
    const [gl, gr] = panGains(panTo === undefined ? pan : pan + (panTo - pan) * (i / n));
    const s = x[i] * env * gain;
    b[0][j] += s * gl;
    b[1][j] += s * gr;
  }
};

// ---------- synths ----------
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
// Detuned 5-voice saw per note, spread across the stereo field.
const supersaw = (midis, dur) => {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const det = [-0.12, -0.06, 0, 0.06, 0.12];
  midis.forEach((m, mi) => {
    det.forEach((d, k) => {
      const f = hz(m + d);
      let ph = random(`ph${m}${k}${mi}`);
      const [gl, gr] = panGains((k - 2) / 2.5);
      for (let i = 0; i < n; i++) {
        ph += f / SR;
        ph -= Math.floor(ph);
        const s = (2 * ph - 1) * 0.12;
        L[i] += s * gl;
        R[i] += s * gr;
      }
    });
  });
  return [L, R];
};
const sub = (midi, dur) => {
  const n = Math.round(dur * SR);
  const o = new Float32Array(n);
  const f = hz(midi);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    o[i] = Math.tanh((Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)) * 1.4);
  }
  return o;
};

// ---------- arrangement: warm cinematic, 120 BPM, C major (C–G–Am–F), bar = 2s; sections follow the storyboard ----------
const BEAT = 0.5, BAR = 2, S16 = BEAT / 4;
const LOCK = 3, FLARE = 23;
const CH = {
  C: { root: 48, pad: [55, 60, 64, 67], stab: [55, 60, 64, 67], arp: [60, 64, 67, 72] },
  G: { root: 43, pad: [55, 59, 62, 67], stab: [55, 59, 62, 67], arp: [59, 62, 67, 71] },
  Am: { root: 45, pad: [57, 60, 64, 69], stab: [57, 60, 64, 69], arp: [57, 60, 64, 69] },
  F: { root: 41, pad: [53, 57, 60, 65], stab: [53, 57, 60, 65], arp: [57, 60, 65, 69] },
};
const PROG = ["C", "G", "Am", "F"];
const chordAt = (bar) => PROG[bar % 4];
const MOTIF = {
  C: [72, null, 76, 79, 84, null, 79, 76],
  G: [74, null, 79, 83, 86, null, 83, 79],
  Am: [76, null, 72, 76, 81, null, 76, 72],
  F: [77, null, 72, 77, 81, null, 79, 77],
};
const inR = (t, a, b) => t >= a && t < b;
const SECTION = (t) =>
  t < LOCK ? "intro" : t < 7 ? "build" : t < 13 ? "grooveA" : t < 19 ? "grooveB" : t < 21 ? "break" : t < 22 ? "build2" : t < FLARE ? "peak" : "outro";
const kickTimes = [];

// Pad across the whole piece (C major bed), per bar.
for (let bar = 0; bar < 12; bar++) {
  const [Lp, Rp] = supersaw(CH[chordAt(bar)].pad, BAR + 1.2);
  const a = 0.6 * SR, r = 1.0 * SR, s0 = bar * BAR * SR;
  for (let i = 0; i < Lp.length && s0 + i < N; i++) {
    const env = Math.min(1, i / a, (Lp.length - i) / r);
    B.pad[0][s0 + i] += Lp[i] * env;
    B.pad[1][s0 + i] += Rp[i] * env;
  }
}
// Per-beat events.
for (let b = 0; b < 46; b++) {
  const t = b * BEAT, sec = SECTION(t), bar = Math.floor(t / BAR), beat = b % 4;
  const c = CH[chordAt(bar)];
  const groove = sec === "grooveA" || sec === "grooveB" || sec === "peak";
  // Intro: sparse whole-note piano on each bar.
  if (sec === "intro" && beat === 0) c.stab.forEach((m, k) => place(B.keys, piano(m), t + k * 0.03, { gain: 0.18, pan: (k - 1.5) / 5, len: 2.2, release: 0.8 }));
  // Build: piano 8th ostinato + quarter sub pulse; soft hats from 5s.
  if (sec === "build" || sec === "build2") {
    for (let e = 0; e < 2; e++) place(B.keys, piano(c.arp[(beat * 2 + e) % 4] + 12), t + e * 0.25, { gain: 0.16 + (t - 3) * 0.012, pan: e ? 0.25 : -0.25, len: 0.6, release: 0.2 });
    place(B.bass, sub(c.root - 12, 0.4), t, { gain: 0.32, attack: 0.01, release: 0.12 });
    if (t >= 5) place(B.drums, sp("hat_bdu"), t + 0.25, { gain: 0.06, pan: 0.3 });
  }
  if (groove) {
    // Kick: soft in groove A, fuller from 13s.
    place(B.kick, sp("bd_pure"), t, { gain: sec === "grooveA" ? 0.55 : 0.65 });
    if (sec !== "grooveA") place(B.kick, sp("bd_haus"), t, { gain: 0.6 });
    kickTimes.push(t);
    if (beat === 1 || beat === 3) {
      place(B.drums, sp("perc_snap"), t, { gain: 0.34, pan: 0.08 });
      if (sec !== "grooveA") place(B.drums, sp("sn_dub"), t, { gain: 0.12, pan: -0.05 });
    }
    for (let k = 0; k < 4; k++) place(B.drums, sp(k === 2 ? "hat_star" : "hat_bdu"), t + k * S16 + (k % 2 ? 0.012 : 0), { gain: [0.08, 0.035, 0.11, 0.045][k], pan: 0.3 + (k % 2) * 0.1 });
    if (sec !== "grooveA" && beat === 3) place(B.drums, sp("drum_cymbal_open"), t + BEAT / 2, { gain: 0.06, pan: 0.35, len: 0.4, release: 0.15 });
    if (sec === "grooveB") place(B.drums, sp("ride_via"), t, { gain: 0.03, pan: -0.35, len: 0.5, release: 0.2 });
    // Sub bass line and piano stabs.
    for (const [e, off, len] of [[0, 0, 0.22], [1, 12, 0.12]]) place(B.bass, sub(c.root - 12 + off, len), t + e * 0.25, { gain: 0.42, attack: 0.004, release: 0.05 });
    if (beat === 0 || beat === 2) c.stab.forEach((m, k) => place(B.keys, piano(m, sec === "peak"), t + (beat === 2 ? 0.25 : 0) + k * 0.004, { gain: sec === "peak" ? 0.22 : 0.16, pan: (k - 1.5) / 5, len: beat === 0 ? 0.9 : 0.25, release: 0.12 }));
  }
  // Warm break (19–21s): piano chords and snaps only.
  if (sec === "break") {
    if (beat === 0) c.stab.forEach((m, k) => place(B.keys, piano(m - 12), t + k * 0.015, { gain: 0.16, pan: (k - 1.5) / 4, len: 1.9, release: 0.6 }));
    if (beat === 1 || beat === 3) place(B.drums, sp("perc_snap"), t, { gain: 0.26, pan: 0.08 });
  }
}
// Piano motif over the grooves and the break (every other bar in groove A, every bar from 13s).
for (let bar = 3; bar < 11; bar++) {
  const t0 = bar * BAR, sec = SECTION(t0);
  if (sec === "grooveA" && bar % 2 === 0) continue;
  MOTIF[chordAt(bar)].forEach((m, e) => {
    if (m !== null) place(B.keys, piano(m + (inR(t0, 16, 18) ? 12 : 0), true), t0 + e * (BEAT / 2), { gain: sec === "break" ? 0.3 : 0.24, pan: (m - 78) / 30, len: 1.2, release: 0.45 });
  });
}
// Risers and accents.
const reverseChord = (midis, dur) => {
  const n = Math.round((dur + 1.5) * SR), x = new Float32Array(n);
  for (const m of midis) { const p = piano(m); for (let i = 0; i < Math.min(p.length, n); i++) x[i] += p[i] * 0.3; }
  return x.reverse().slice(-Math.round(dur * SR)).map((v, i, a) => v * (i / a.length) ** 1.6);
};
place(B.keys, reverseChord([48, 60, 64, 67, 72], 1.2), 7 - 1.2, { gain: 0.8 });
place(B.keys, reverseChord([48, 60, 64, 67, 72], 1.0), 22 - 1.0, { gain: 0.8 });
for (let k = 0; k < 8; k++) place(B.drums, sp("sn_dub"), 21 + k * S16, { gain: 0.04 + k * 0.025, pan: -0.1 });
for (const t of [7, 13, 16, 22]) place(B.drums, sp("drum_splash_soft"), t - 0.15, { gain: 0.14, pan: -0.2 });
place(B.tex, sp("ambi_glass_hum"), 0, { gain: 0.22, len: 3.5, attack: 0.9, release: 1.2 });
// Final chord: clean, powerful C major ringing out.
for (const [m, g] of [[36, 0.5], [48, 0.42], [55, 0.36], [60, 0.36], [64, 0.32], [67, 0.3], [72, 0.26], [76, 0.2], [79, 0.16]]) place(B.keys, piano(m, true), FLARE, { gain: g, len: DUR - FLARE, release: 0.9 });
place(B.bass, sub(36, DUR - FLARE), FLARE, { gain: 0.3, release: 0.9 });
place(B.kick, sp("bd_haus"), FLARE, { gain: 0.7 });
place(B.kick, sp("bd_pure"), FLARE, { gain: 0.7 });

// ---------- SFX: recorded, following the storyboard's sound notes, each on its exact frame ----------
const at = (name, t, gain, opts = {}) => place(B.sfx, sp(name), t - (opts.pre ?? 0), { gain, ...opts });
const u = (x) => x / 30;
const PROMPT = "A product launch video for a coffee brand";
const keys = [];
{
  let acc = 6;
  for (let i = 0; i < PROMPT.length; i++) {
    acc += 0.62 + random(`pp${i}`) * 0.5 + (PROMPT[i] === " " ? 0.3 : 0);
    if (i % 2 === 0) keys.push(u(90 + acc));
  }
}
[0.08, 0.17, 0.26, 0.34, 0.42].forEach((t, i) => at("tbd_perc_tap_1", t, 0.05 + i * 0.01)); // logo facets
at("perc_swoosh", 1.0, 0.2, { pre: 0.142 }); // brand line — subtle whoosh
at("ambi_swoosh", 2.2, 0.25, { pre: 0.96 }); // cards fly in
keys.forEach((t, i) => at(i % 2 ? "tbd_perc_tap_2" : "tbd_perc_tap_1", t, 0.08, { pan: 0.1 })); // soft keyboard
at("elec_tick", u(140), 0.45, { pan: 0.35 }); // send
at("elec_blip", u(140), 0.15, { pan: 0.35 });
Array.from({ length: 8 }, (_, i) => at("elec_tick", u(150 + 1 + i * 1.3), 0.2)); // "Pine Pro" types — crisp
at("perc_swoosh", 6.0, 0.18, { pre: 0.142 }); // value statement — subtle whoosh
at("perc_swash", 7.0, 0.2, { pre: 0.08 }); // AI creates
at("misc_cineboom", 9.0, 0.4, { pre: 3.36 }); // cinematic output
[0, 3, 6, 9].forEach((d) => at("elec_plip", u(300 + d), 0.16)); // style tiles
at("perc_impact1", 11.0, 0.55, { pre: 0.016 }); // example video — impactful
[0, 2.5, 5, 7.5, 10, 12.5].forEach((d) => at("tbd_perc_tap_1", u(360 + d), 0.1)); // use-case chips
at("perc_swoosh", 13.0, 0.18, { pre: 0.142 }); // creators carousel
[8, 24, 40].forEach((d) => { at("elec_tick", u(420 + d), 0.42); at("elec_blip", u(420 + d), 0.1); }); // workflow steps
at("ambi_swoosh", 16.2, 0.3, { pre: 0.96 }); // for everyone — expansive
at("perc_swash", 17.0, 0.15, { pre: 0.08 }); // key benefits — soft whoosh
at("elec_tick", u(546), 0.3); // drag start
at("elec_tick", u(560), 0.24); // drag end
at("perc_swoosh", 19.0, 0.14, { pre: 0.142 }); // outcome
at("elec_tick", u(646), 0.5); // "Try Pine Pro" click
at("elec_pop", u(646), 0.25);
at("perc_swash", 22.0, 0.2, { pre: 0.08 }); // brand close
at("elec_chime", 22.1, 0.12);
at("misc_cineboom", FLARE, 0.45, { pre: 3.36 }); // final — clean, powerful finish
// ---------- processing ----------
const each = (b, fn) => b.forEach(fn);
const lowpass = (b, fc) =>
  each(b, (x) => {
    let s1 = 0, s2 = 0;
    for (let i = 0; i < N; i++) {
      const a = 1 - Math.exp((-TAU * fc(i / SR)) / SR);
      s1 += a * (x[i] - s1);
      s2 += a * (s1 - s2);
      x[i] = s2;
    }
  });
const lerp = (a, b, p) => a + (b - a) * Math.max(0, Math.min(1, p));
lowpass(B.pad, (t) => (t < LOCK ? lerp(350, 1800, t / LOCK) : SECTION(t) === "break" ? 1300 : SECTION(t) === "outro" ? 1500 : 2200));
lowpass(B.bass, () => 260);

// Sidechain pump keyed on the kick.
{
  const g = new Float32Array(N).fill(1);
  for (const k of kickTimes) {
    const s = Math.round(k * SR);
    for (let i = 0; i < 0.3 * SR && s + i < N; i++) g[s + i] = Math.min(g[s + i], 1 - 0.6 * Math.exp(-i / (0.08 * SR)));
  }
  for (const b of [B.pad, B.bass, B.keys]) each(b, (x) => { for (let i = 0; i < N; i++) x[i] *= g[i]; });
}

// Quiet sections sit well under the grooves, like the reference's breakdown and ending.
{
  const quiet = (t) => (SECTION(t) === "break" ? 0.6 : SECTION(t) === "outro" && t < FLARE ? 0.62 : SECTION(t) === "intro" ? 0.85 : 1);
  for (const b of [B.pad, B.bass, B.keys, B.drums, B.tex]) each(b, (x) => { for (let i = 0; i < N; i++) x[i] *= quiet(i / SR); });
}


// Dotted-8th ping-pong on the piano.
{
  const d = Math.round(0.375 * SR);
  const [l, r] = B.keys;
  const dl = new Float32Array(N), dr = new Float32Array(N);
  for (let i = d; i < N; i++) {
    dl[i] = (r[i - d] + dr[i - d]) * 0.22;
    dr[i] = (l[i - d] + dl[i - d]) * 0.22;
  }
  for (let i = 0; i < N; i++) { l[i] += dl[i]; r[i] += dr[i]; }
}

// Stereo reverb (damped combs + allpasses) fed by a send.
const reverb = (input) => {
  const out = bus();
  const combs = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116];
  input.forEach((x, ch) => {
    const y = out[ch];
    for (const len of combs) {
      const L = len + ch * 23, buf = new Float32Array(L);
      let p = 0, lp = 0;
      for (let i = 0; i < N; i++) {
        const o = buf[p];
        lp = o * 0.55 + lp * 0.45;
        buf[p] = x[i] + lp * 0.84;
        y[i] += o / combs.length;
        p = (p + 1) % L;
      }
    }
    for (const len of [225, 341, 556]) {
      const L = len + ch * 7, buf = new Float32Array(L);
      let p = 0;
      for (let i = 0; i < N; i++) {
        const o = buf[p];
        buf[p] = y[i] + o * 0.5;
        y[i] = o - y[i] * 0.5;
        p = (p + 1) % L;
      }
    }
  });
  lowpass(out, () => 7000);
  return out;
};
const send = bus();
for (const [b, amt] of [[B.pad, 0.3], [B.keys, 0.45], [B.drums, 0.12], [B.tex, 0.4], [B.sfx, 0.18]]) {
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) send[ch][i] += b[ch][i] * amt;
}
const verb = reverb(send);

// ---------- mix + master ----------
const SFX_ONLY = process.env.STEM === "sfx";
const LEVEL = { kick: 1, drums: 0.9, bass: 0.85, pad: 0.55, keys: 1, tex: 0.5, sfx: 1.7 };
const mix = bus();
for (let ch = 0; ch < 2; ch++) {
  for (let i = 0; i < N; i++) {
    let m = SFX_ONLY ? B.sfx[ch][i] : verb[ch][i] * 0.8;
    if (!SFX_ONLY) for (const k in LEVEL) m += B[k][ch][i] * LEVEL[k];
    mix[ch][i] = m;
  }
}
const M = mix[0].length;

// Air: gentle high-shelf lift for a crisp top end.
each(mix, (x) => {
  let s = 0;
  const a = 1 - Math.exp((-TAU * 7000) / SR);
  for (let i = 0; i < M; i++) { s += a * (x[i] - s); x[i] += (x[i] - s) * 0.35; }
});
// Glue compressor: stereo-linked peak envelope, 2:1 above -20 dBFS.
{
  let env = 0;
  const att = Math.exp(-1 / (0.01 * SR)), rel = Math.exp(-1 / (0.15 * SR));
  for (let i = 0; i < M; i++) {
    const lvl = Math.max(Math.abs(mix[0][i]), Math.abs(mix[1][i]));
    env = lvl > env ? att * env + (1 - att) * lvl : rel * env + (1 - rel) * lvl;
    const db = 20 * Math.log10(env + 1e-9);
    const g = db > -20 ? 10 ** ((-(db + 20) / 2) / 20) : 1;
    mix[0][i] *= g;
    mix[1][i] *= g;
  }
}
each(mix, (x) => { for (let i = 0; i < M; i++) x[i] *= Math.min(1, (M / SR - i / SR) / 0.8); });

// Loudness to ~-14 dBFS RMS, then a 5ms-lookahead limiter with a -1 dBFS ceiling.
let sum = 0;
each(mix, (x) => { for (let i = 0; i < M; i++) sum += x[i] * x[i]; });
const gain = 0.2 / Math.sqrt(sum / (2 * M));
const CEIL = 0.89, LA = Math.round(0.005 * SR), REL = Math.exp(-1 / (0.08 * SR));
const need = new Float32Array(M);
for (let i = 0; i < M; i++) {
  const p = Math.max(Math.abs(mix[0][i]), Math.abs(mix[1][i])) * gain;
  need[i] = p > CEIL ? CEIL / p : 1;
}
const gr = new Float32Array(M);
{
  let g = 1;
  for (let i = 0; i < M; i++) {
    let target = 1;
    for (let k = 0; k < LA && i + k < M; k += 4) target = Math.min(target, need[i + k]);
    g = target < g ? g + (target - g) * 0.08 : target - (target - g) * REL;
    gr[i] = g;
  }
}

const outPath = SFX_ONLY ? join(ROOT, "out/sfx-stem.wav") : join(ROOT, "public/audio/pine-pro-25.wav");
mkdirSync(dirname(outPath), { recursive: true });
const buf = Buffer.alloc(44 + M * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + M * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(M * 4, 40);
let peak = 0, clipped = 0;
for (let i = 0; i < M; i++) {
  for (let ch = 0; ch < 2; ch++) {
    let v = mix[ch][i] * gain * gr[i];
    if (Math.abs(v) > CEIL) { clipped++; v = Math.sign(v) * CEIL; }
    peak = Math.max(peak, Math.abs(v));
    buf.writeInt16LE(Math.round(v * 32767), 44 + (i * 2 + ch) * 2);
  }
}
writeFileSync(outPath, buf);
console.log(`Wrote ${outPath} (gain ${gain.toFixed(2)}, peak ${peak.toFixed(3)}, hard-clipped samples ${clipped})`);

