// Composes, mixes and masters the Sarvam Content Studio "live" soundtrack into public/audio/sarvam-live-60.wav.
// Engine shared with compose-pine.mjs. Sources (royalty-free, see assets/samples/LICENSES.md): Sonic Pi samples (CC0)
// and the Salamander Grand Piano (CC BY 3.0, Alexander Holm). Pads and sub bass are synthesized here.
// Mix target taken from the reference film: bright (centroid ~2 kHz), light low end, ~-14 dBFS RMS.
// Cue times mirror the scene constants in src/sarvam-live (scene start + in-scene seconds).
// Run: node scripts/compose-sarvam-live.mjs      STEM=sfx node scripts/compose-sarvam-live.mjs  (effects only)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { random } from "remotion";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAMPLES = join(ROOT, "assets/samples");
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const SR = 44100;
const DUR = 57; // film, then the 3s Breeders end card
const N = SR * DUR;
const TAU = Math.PI * 2;

// ---------- samples ----------
const cache = new Map();
const load = (rel) => {
  if (cache.has(rel)) return cache.get(rel);
  const path = join(SAMPLES, rel);
  if (!existsSync(path)) throw new Error(`Missing sample ${path}`);
  const wav = execFileSync(FFMPEG, ["-v", "error", "-i", path, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", "-f", "wav", "-"], { maxBuffer: 1 << 28 });
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
const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// Salamander is sampled every minor third; fall back to the other velocity layer when one isn't in assets/samples.
const piano = (midi, loud = false) => {
  const key = `p${midi}${loud}`;
  if (cache.has(key)) return cache.get(key);
  const s = 21 + 3 * Math.round((midi - 21) / 3);
  const name = (v) => `piano${v}/${SHARP[s % 12]}${Math.floor(s / 12) - 1}v${v}.mp3`;
  const pref = loud ? [12, 8] : [8, 12];
  const v = pref.find((vv) => existsSync(join(SAMPLES, name(vv))));
  if (v === undefined) throw new Error(`No piano sample near midi ${midi}`);
  const x = resample(load(name(v)), 2 ** ((midi - s) / 12));
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
const supersaw = (midis, dur) => {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const det = [-0.1, -0.05, 0, 0.05, 0.1];
  midis.forEach((m, mi) => {
    det.forEach((d, k) => {
      const f = hz(m + d);
      let ph = random(`ph${m}${k}${mi}`);
      const [gl, gr] = panGains((k - 2) / 2.5);
      for (let i = 0; i < n; i++) {
        ph += f / SR;
        ph -= Math.floor(ph);
        const s = (2 * ph - 1) * 0.1;
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
    o[i] = Math.tanh((Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * 2 * f * t)) * 1.3);
  }
  return o;
};

// ---------- arrangement: light, airy, 120 BPM, C major (C–G–Am–F), bar = 2s; every scene cut is on a bar ----------
const BEAT = 0.5, BAR = 2, S16 = BEAT / 4;
const LAND = 54.3; // the Breeders mark lands (src/brand/Breeders.tsx end card)
const CH = {
  C: { root: 48, pad: [55, 60, 64, 67], stab: [60, 64, 67, 72], arp: [60, 64, 67, 72] },
  G: { root: 43, pad: [55, 59, 62, 67], stab: [59, 62, 67, 71], arp: [59, 62, 67, 71] },
  Am: { root: 45, pad: [57, 60, 64, 69], stab: [60, 64, 69, 72], arp: [57, 60, 64, 69] },
  F: { root: 41, pad: [53, 57, 60, 65], stab: [57, 60, 65, 69], arp: [57, 60, 65, 69] },
};
const PROG = ["C", "G", "Am", "F"];
const chordAt = (bar) => PROG[bar % 4];
const MOTIF = {
  C: [79, null, 76, 79, 84, null, 79, 76],
  G: [79, null, 74, 79, 83, null, 79, 74],
  Am: [81, null, 76, 81, 84, null, 81, 76],
  F: [81, null, 77, 81, 84, null, 81, 77],
};
const inR = (t, a, b) => t >= a && t < b;
// intro 0–8 · grooveA 8–22 (workspace, dubbing) · grooveB 22–36 (TTS, cloning) · dip 36–42 (library, whip)
// · peak 42–50 (everything, audience, offer) · outro 50–54 (lockup) · end card from 54
const SECTION = (t) =>
  t < 8 ? "intro" : t < 22 ? "grooveA" : t < 36 ? "grooveB" : t < 42 ? "dip" : t < 50 ? "peak" : t < 54 ? "outro" : t < LAND ? "throw" : "final";
const kickTimes = [];

// Pad bed, per bar, until the hat is thrown.
for (let bar = 0; bar < 27; bar++) {
  const [Lp, Rp] = supersaw(CH[chordAt(bar)].pad, BAR + 1.4);
  const a = 0.7 * SR, r = 1.2 * SR, s0 = bar * BAR * SR;
  for (let i = 0; i < Lp.length && s0 + i < N; i++) {
    const env = Math.min(1, i / a, (Lp.length - i) / r);
    B.pad[0][s0 + i] += Lp[i] * env;
    B.pad[1][s0 + i] += Rp[i] * env;
  }
}

for (let b = 0; b < DUR / BEAT; b++) {
  const t = b * BEAT, sec = SECTION(t), bar = Math.floor(t / BAR), beat = b % 4;
  const c = CH[chordAt(bar)];
  const groove = sec === "grooveA" || sec === "grooveB" || sec === "peak" || sec === "dip";
  // Intro: sparse piano chords, then an 8th-note arp building into the app reveal.
  if (sec === "intro") {
    if (beat === 0) c.stab.forEach((m, k) => place(B.keys, piano(m), t + k * 0.03, { gain: 0.17, pan: (k - 1.5) / 5, len: 2.2, release: 0.8 }));
    if (t >= 4) for (let e = 0; e < 2; e++) place(B.keys, piano(c.arp[(beat * 2 + e) % 4] + 12), t + e * 0.25, { gain: 0.08 + (t - 4) * 0.012, pan: e ? 0.3 : -0.3, len: 0.5, release: 0.2 });
    if (t >= 6) place(B.drums, sp("hat_bdu"), t + 0.25, { gain: 0.05, pan: 0.3 });
  }
  if (groove) {
    const soft = sec === "grooveA" || sec === "dip";
    place(B.kick, sp("bd_pure"), t, { gain: soft ? 0.42 : 0.52 });
    if (sec === "peak") place(B.kick, sp("bd_haus"), t, { gain: 0.35 });
    kickTimes.push(t);
    if (beat === 1 || beat === 3) {
      place(B.drums, sp("perc_snap"), t, { gain: 0.3, pan: 0.08 });
      if (sec !== "grooveA") place(B.drums, sp("sn_dub"), t, { gain: 0.08, pan: -0.05 });
    }
    for (let k = 0; k < 4; k++) place(B.drums, sp(k === 2 ? "hat_star" : "hat_bdu"), t + k * S16 + (k % 2 ? 0.012 : 0), { gain: [0.055, 0.025, 0.075, 0.03][k], pan: 0.3 + (k % 2) * 0.1 });
    if (sec === "peak" && beat === 3) place(B.drums, sp("drum_cymbal_open"), t + BEAT / 2, { gain: 0.05, pan: 0.35, len: 0.4, release: 0.15 });
    if (sec === "grooveB" || sec === "peak") place(B.drums, sp("ride_via"), t, { gain: 0.025, pan: -0.35, len: 0.5, release: 0.2 });
    for (const [e, off, len] of [[0, 0, 0.2], [1, 12, 0.1]]) place(B.bass, sub(c.root - 12 + off, len), t + e * 0.25, { gain: 0.3, attack: 0.004, release: 0.05 });
    // Light 8th piano plucks keep the airy, bright feel of the reference.
    for (let e = 0; e < 2; e++) place(B.keys, piano(c.arp[(beat * 2 + e + (sec === "peak" ? 1 : 0)) % 4] + 12), t + e * 0.25, { gain: soft ? 0.07 : 0.09, pan: e ? 0.35 : -0.35, len: 0.35, release: 0.15 });
    if (beat === 0 || beat === 2) c.stab.forEach((m, k) => place(B.keys, piano(m, sec === "peak"), t + (beat === 2 ? 0.25 : 0) + k * 0.004, { gain: sec === "peak" ? 0.15 : 0.11, pan: (k - 1.5) / 5, len: beat === 0 ? 0.9 : 0.25, release: 0.12 }));
  }
  // Outro (lockup): piano chords and pad only.
  if (sec === "outro" && beat === 0) c.stab.forEach((m, k) => place(B.keys, piano(m), t + k * 0.03, { gain: 0.16, pan: (k - 1.5) / 5, len: 2.2, release: 0.9 }));
}
// Piano motif: every other bar in groove A, every bar in groove B and the peak.
for (let bar = 4; bar < 25; bar++) {
  const t0 = bar * BAR, sec = SECTION(t0);
  if (!["grooveA", "grooveB", "peak"].includes(sec)) continue;
  if (sec === "grooveA" && bar % 2 === 1) continue;
  MOTIF[chordAt(bar)].forEach((m, e) => {
    if (m !== null) place(B.keys, piano(m + (inR(t0, 44, 48) ? 12 : 0), true), t0 + e * (BEAT / 2), { gain: 0.2, pan: (m - 80) / 30, len: 1.1, release: 0.45 });
  });
}
// Risers and accents.
const reverseChord = (midis, dur) => {
  const n = Math.round((dur + 1.5) * SR), x = new Float32Array(n);
  for (const m of midis) { const p = piano(m); for (let i = 0; i < Math.min(p.length, n); i++) x[i] += p[i] * 0.3; }
  return x.reverse().slice(-Math.round(dur * SR)).map((v, i, a) => v * (i / a.length) ** 1.6);
};
place(B.keys, reverseChord([48, 60, 64, 67, 72], 1.2), 8 - 1.2, { gain: 0.7 });
place(B.keys, reverseChord([48, 60, 64, 67, 72], 1.4), 42 - 1.4, { gain: 0.85 });
for (let k = 0; k < 8; k++) place(B.drums, sp("sn_dub"), 41 + k * S16, { gain: 0.03 + k * 0.02, pan: -0.1 });
for (const t of [8, 22, 42]) place(B.drums, sp("drum_splash_soft"), t - 0.15, { gain: 0.13, pan: -0.2 });
place(B.tex, sp("ambi_glass_hum"), 0, { gain: 0.2, len: 4.5, attack: 1.0, release: 1.4 });
place(B.tex, sp("ambi_glass_hum"), 50, { gain: 0.14, len: 5, attack: 1.2, release: 2 });
// Final chord as the hat lands: clean C major ringing out.
for (const [m, g] of [[36, 0.22], [48, 0.34], [55, 0.34], [60, 0.34], [64, 0.3], [67, 0.28], [72, 0.24], [76, 0.18], [79, 0.14]]) place(B.keys, piano(m, true), LAND, { gain: g, len: DUR - LAND, release: 1.2 });
place(B.bass, sub(48, DUR - LAND), LAND, { gain: 0.1, release: 1.2 });
place(B.kick, sp("bd_pure"), LAND, { gain: 0.6 });

// ---------- SFX: recorded, only on real on-screen actions, each on its exact frame ----------
const at = (name, t, gain, opts = {}) => place(B.sfx, sp(name), t - (opts.pre ?? 0), { gain, ...opts });
const pitched = (name, t, gain, semis, opts = {}) => place(B.sfx, resample(sp(name), 2 ** (semis / 12)), t, { gain, ...opts });
// Hook
at("elec_ping", 2.5, 0.3); // "Live now" pill
// Meet: tiles pop in left → right, then push into the app
[0, 1, 2, 3, 4].forEach((i) => pitched("elec_plip", 4.9 + i * 0.12, 0.12, i, { pan: -0.6 + i * 0.3 }));
at("ambi_swoosh", 7.55, 0.2, { pre: 0.96 });
// Workspace
[0, 1, 2, 3, 4].forEach((i) => at("tbd_perc_tap_1", 8.45 + i * 0.1, 0.07, { pan: -0.3 }));
at("elec_plip", 9.95, 0.12, { pan: -0.5 }); // tooltip
// Dubbing (scene starts 12.0)
at("elec_tick", 12.3, 0.38, { pan: -0.4 }); // click Dubbing
at("elec_pop", 12.6, 0.22); // gift popup
at("elec_tick", 14.05, 0.38); // Start dubbing now
at("perc_swash", 15.3, 0.12, { pre: 0.08, pan: 0.5, panTo: -0.1 }); // file dragged in
at("perc_snap", 15.7, 0.22); // file dropped
at("elec_tick", 16.2, 0.36); // Upload
at("perc_swash", 16.45, 0.12, { pre: 0.08 }); // card grows
at("ambi_glass_rub", 17.0, 0.16, { len: 1.2, attack: 0.2, release: 0.4 }); // generating
at("elec_chime", 18.2, 0.15); // ready
for (let k = 0; k < 9; k++) pitched("elec_plip", 18.7 + k * 0.3, 0.09, k * 0.6, { pan: 0.45 }); // languages roll
// Text to Speech (22.0)
{
  let acc = 22.45;
  while (acc < 24.9) {
    at(random(`k${acc}`) > 0.5 ? "tbd_perc_tap_1" : "tbd_perc_tap_2", acc, 0.045, { pan: -0.1 });
    acc += 0.075 + random(`kk${acc}`) * 0.05;
  }
}
at("elec_tick", 25.95, 0.36, { pan: 0.4 }); // pick Ritu
at("elec_tick", 27.05, 0.38); // Generate
at("elec_blip", 27.05, 0.12);
at("perc_swash", 28.95, 0.13, { pre: 0.08, pan: 0.5 }); // History slides in
// Voice cloning (30.0)
at("elec_tick", 31.35, 0.36);
at("elec_twip", 31.4, 0.12);
at("ambi_glass_hum", 32.0, 0.1, { len: 1.8, attack: 0.3, release: 0.5 }); // recording
at("elec_chime", 34.2, 0.18); // cloned voice card
// Library + Speech to Text (36.0)
[36.9, 37.3, 37.7, 38.1].forEach((t, i) => at("elec_tick", t, 0.16, { pan: -0.3 + i * 0.2 }));
at("perc_swoosh", 39.05, 0.26, { pre: 0.142, pan: 0.7, panTo: -0.7 }); // whip-pan
at("elec_tick", 39.75, 0.36);
at("elec_twip", 39.8, 0.1);
// Everything (42.0)
at("perc_swash", 42.85, 0.14, { pre: 0.08 }); // tiles converge
at("ambi_swoosh", 44.4, 0.12, { pre: 0.96 }); // "one workflow" lines
// Audience + offer (46.0)
[46.05, 46.75, 47.45, 48.15].forEach((t, i) => pitched("elec_plip", t, 0.12, [0, 2, 4, 7][i]));
at("elec_bell", 48.95, 0.22);
at("elec_chime", 48.97, 0.1);
// Lockup (50.0)
at("elec_ping", 51.35, 0.2);
// Breeders end card (54.0): the mark pops, the name slides out
at("perc_snap", LAND, 0.2);
at("misc_cineboom", LAND, 0.18, { pre: 3.36 });
at("perc_swash", 54.6, 0.12, { pre: 0.08, pan: -0.3 }); // the name slides out

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
lowpass(B.pad, (t) => (t < 8 ? lerp(400, 2000, t / 8) : SECTION(t) === "dip" ? 900 : 2400));
lowpass(B.bass, () => 240);
// The dip under Library/STT is muffled and opens back up into "Everything".
for (const b of [B.drums, B.keys, B.kick]) lowpass(b, (t) => (inR(t, 36, 42) ? lerp(1400, 9000, (t - 40.5) / 1.5) : 16000));

// Sidechain pump keyed on the kick.
{
  const g = new Float32Array(N).fill(1);
  for (const k of kickTimes) {
    const s = Math.round(k * SR);
    for (let i = 0; i < 0.3 * SR && s + i < N; i++) g[s + i] = Math.min(g[s + i], 1 - 0.5 * Math.exp(-i / (0.08 * SR)));
  }
  for (const b of [B.pad, B.bass, B.keys]) each(b, (x) => { for (let i = 0; i < N; i++) x[i] *= g[i]; });
}
// Quiet sections sit under the grooves; the pad fades out as the hat is thrown.
{
  const quiet = (t) => {
    const s = SECTION(t);
    if (s === "intro") return 1.15;
    if (s === "outro") return 0.85;
    if (s === "throw") return lerp(0.6, 0.12, (t - 54) / 0.8);
    if (s === "dip") return 0.8;
    return 1;
  };
  for (const b of [B.pad, B.bass, B.drums, B.tex]) each(b, (x) => { for (let i = 0; i < N; i++) x[i] *= quiet(i / SR); });
  each(B.keys, (x) => { for (let i = 0; i < N; i++) { const t = i / SR; if (SECTION(t) !== "final") x[i] *= quiet(t); } });
}

// Dotted-8th ping-pong on the piano.
{
  const d = Math.round(0.375 * SR);
  const [l, r] = B.keys;
  const dl = new Float32Array(N), dr = new Float32Array(N);
  for (let i = d; i < N; i++) {
    dl[i] = (r[i - d] + dr[i - d]) * 0.2;
    dr[i] = (l[i - d] + dl[i - d]) * 0.2;
  }
  for (let i = 0; i < N; i++) { l[i] += dl[i]; r[i] += dr[i]; }
}

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
  lowpass(out, () => 7500);
  return out;
};
const send = bus();
for (const [b, amt] of [[B.pad, 0.3], [B.keys, 0.45], [B.drums, 0.12], [B.tex, 0.4], [B.sfx, 0.16]]) {
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) send[ch][i] += b[ch][i] * amt;
}
const verb = reverb(send);

// ---------- mix + master ----------
const SFX_ONLY = process.env.STEM === "sfx";
const LEVEL = { kick: 0.85, drums: 0.9, bass: 0.7, pad: 0.5, keys: 1, tex: 0.5, sfx: 1.7 };
const mix = bus();
for (let ch = 0; ch < 2; ch++) {
  for (let i = 0; i < N; i++) {
    let m = SFX_ONLY ? B.sfx[ch][i] : verb[ch][i] * 0.8;
    if (!SFX_ONLY) for (const k in LEVEL) m += B[k][ch][i] * LEVEL[k];
    mix[ch][i] = m;
  }
}
const M = mix[0].length;
// Air: high-shelf lift for the reference's bright top end.
each(mix, (x) => {
  let s = 0;
  const a = 1 - Math.exp((-TAU * 7000) / SR);
  for (let i = 0; i < M; i++) { s += a * (x[i] - s); x[i] += (x[i] - s) * 0.18; }
});
// Glue compressor: stereo-linked, 2:1 above -20 dBFS.
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
each(mix, (x) => { for (let i = 0; i < M; i++) x[i] *= Math.min(1, (M / SR - i / SR) / 1.0); });

// Loudness to ~-14 dBFS RMS (measured over the music, not the tail), then a 5ms-lookahead limiter at -1 dBFS.
let sum = 0;
const MUSIC_END = Math.round(54 * SR);
each(mix, (x) => { for (let i = 0; i < MUSIC_END; i++) sum += x[i] * x[i]; });
const gain = 0.2 / Math.sqrt(sum / (2 * MUSIC_END));
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

const outPath = SFX_ONLY ? join(ROOT, "out/sfx-stem.wav") : join(ROOT, "public/audio/sarvam-live-60.wav");
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
