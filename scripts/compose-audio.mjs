// Composes, mixes and masters the Clueso MCP soundtrack into public/audio/clueso-mcp-45.wav.
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
const DUR = 45;
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

// ---------- arrangement: 120 BPM, bar = 2s, every cut sits on the grid ----------
const BEAT = 0.5, BAR = 2, S16 = BEAT / 4;
const FREEZE = 8.2, DROP = 10, FLARE = 43.93;
const CH = {
  Am: { root: 45, pad: [57, 60, 64, 71], stab: [57, 60, 64, 69] },
  F: { root: 41, pad: [53, 57, 60, 64], stab: [53, 57, 60, 65] },
  C: { root: 48, pad: [55, 60, 64, 67], stab: [55, 60, 64, 67] },
  G: { root: 43, pad: [55, 59, 62, 67], stab: [55, 59, 62, 67] },
};
const PROG = ["Am", "F", "C", "G"];
const chordAt = (bar) => (bar < 5 ? ["Am", "F", "C", "G", "G"][bar] : bar === 20 ? "F" : bar === 21 ? "G" : PROG[(bar - 5) % 4]);
// Piano motif, 8th notes per chord (null = rest).
const MOTIF = {
  Am: [76, null, 72, 76, 81, null, 79, 76],
  F: [77, null, 72, 77, 81, null, 76, 72],
  C: [79, null, 76, 72, 74, null, 76, 79],
  G: [79, null, 74, 71, 74, 76, 74, null],
};
const inR = (t, a, b) => t >= a && t < b;
const SECTION = (t) =>
  t < 4 ? "intro" : t < FREEZE ? "build" : t < DROP ? "gap" : t < 18 ? "grooveA" : t < 22 ? "break" : t < 36 ? "grooveB" : t < 38 ? "dip" : t < 40 ? "grooveB" : "outro";
const kickTimes = [];

for (let bar = 0; bar < 22; bar++) {
  const t0 = bar * BAR;
  const name = chordAt(bar);
  const c = CH[name];
  const sec = SECTION(t0);

  // Pad (skips the freeze gap).
  if (sec !== "gap") {
    const [L, R] = supersaw(c.pad, BAR + 1.2);
    const n = L.length, a = 0.5 * SR, r = 1.0 * SR;
    for (let i = 0; i < n; i++) {
      const env = Math.min(1, i / a, (n - i) / r);
      const j = Math.round(t0 * SR) + i;
      if (j >= N) break;
      B.pad[0][j] += L[i] * env;
      B.pad[1][j] += R[i] * env;
    }
  }

  // Piano: motif in intro/breakdown/outro (and every other groove bar), rhythmic stabs in the grooves.
  const motif = sec === "intro" || sec === "break" || sec === "outro" || (sec === "grooveA" && bar % 2 === 1);
  if (motif) {
    MOTIF[name].forEach((m, e) => {
      const t = t0 + e * (BEAT / 2);
      if (m === null || t >= FLARE - 0.05) return;
      place(B.keys, piano(m, sec === "grooveA"), t, { gain: sec === "grooveA" ? 0.34 : 0.5, pan: (m - 76) / 30, len: 1.4, release: 0.5 });
    });
  }
  if (sec === "grooveA" || sec === "grooveB" || sec === "build") {
    for (const [off, len, g] of [[0, 1.0, 0.24], [1.5 * BEAT, 0.22, 0.2], [3.5 * BEAT, 0.22, 0.16]]) {
      const t = t0 + off;
      if (inR(t, FREEZE, DROP)) continue;
      c.stab.forEach((m, k) => place(B.keys, piano(m, sec !== "build"), t + k * 0.004, { gain: g, pan: (k - 1.5) / 5, len, release: 0.12 }));
    }
  }
  if (sec === "break") c.stab.forEach((m, k) => place(B.keys, piano(m - 12), t0 + k * 0.012, { gain: 0.12, pan: (k - 1.5) / 4, len: 1.9, release: 0.6 }));

  // Sub bass.
  if (sec === "build") {
    for (let e = 0; e < 8; e++) {
      const t = t0 + e * (BEAT / 2);
      if (t < FREEZE) place(B.bass, sub(c.root - 12, 0.2), t, { gain: 0.42, attack: 0.005, release: 0.06 });
    }
  }
  if (sec === "grooveA" || sec === "grooveB" || sec === "dip") {
    for (const [e, off, len] of [[0, 0, 0.3], [2, 0, 0.2], [3, 12, 0.15], [5, 0, 0.2], [6, 0, 0.3], [7, 7, 0.15]]) {
      place(B.bass, sub(c.root - 12 + off, len), t0 + e * (BEAT / 2), { gain: 0.5, attack: 0.004, release: 0.05 });
    }
  }
  if (sec === "break") place(B.bass, sub(c.root - 12, BAR), t0, { gain: 0.12, attack: 0.1, release: 0.5 });

  // Drums.
  const groove = sec === "grooveA" || sec === "grooveB";
  for (let b = 0; b < 4; b++) {
    const t = t0 + b * BEAT;
    if (inR(t, FREEZE, DROP)) continue;
    const kickOn = groove || sec === "dip" || (sec === "build" && (b % 2 === 0 || t >= 6));
    if (kickOn) {
      place(B.kick, sp("bd_haus"), t, { gain: sec === "build" ? 0.55 : 0.8 });
      place(B.kick, sp("bd_pure"), t, { gain: sec === "build" ? 0.45 : 0.65 });
      kickTimes.push(t);
    }
    const snapOn = (b === 1 || b === 3) && (groove || sec === "break" || sec === "dip" || (sec === "build" && t >= 6));
    if (snapOn) {
      place(B.drums, sp("perc_snap"), t, { gain: sec === "break" ? 0.32 : 0.42, pan: 0.08 });
      if (groove) place(B.drums, sp("sn_dub"), t, { gain: 0.16, pan: -0.05 });
    }
    // Hats: 16ths with velocity accents and light swing.
    const hats = groove ? 4 : sec === "build" ? (t >= 6 ? 4 : 2) : sec === "break" || sec === "dip" ? 2 : 0;
    for (let k = 0; hats > 0 && k < 4; k++) {
      if (hats === 2 && k % 2 === 0) continue;
      const ht = t + k * S16 + (k % 2 ? 0.012 : 0);
      if (inR(ht, FREEZE, DROP)) continue;
      place(B.drums, sp(k === 2 ? "hat_star" : "hat_bdu"), ht, { gain: [0.1, 0.05, 0.14, 0.06][k] * (sec === "break" ? 0.7 : 1), pan: 0.3 + (k % 2) * 0.1 });
    }
    if (groove && b === 3) place(B.drums, sp("drum_cymbal_open"), t + BEAT / 2, { gain: 0.07, pan: 0.35, len: 0.4, release: 0.15 });
    if (sec === "grooveB" && t >= 22 && t < 36) place(B.drums, sp("ride_via"), t, { gain: 0.035, pan: -0.35, len: 0.5, release: 0.2 });
  }
}
// Snare build into the freeze, section splashes, texture beds.
for (let k = 0; k < 10; k++) place(B.drums, sp("sn_dub"), 7 + k * S16, { gain: 0.05 + k * 0.022, pan: -0.1 });
for (const t of [DROP, 22, 38]) place(B.drums, sp("drum_splash_soft"), t - 0.15, { gain: 0.16, pan: -0.2 });
place(B.tex, sp("ambi_glass_hum"), 0, { gain: 0.15, len: 4.5, attack: 1.2, release: 1.5 });
place(B.tex, sp("ambi_glass_hum"), 40, { gain: 0.12, len: 5, attack: 1.5, release: 1 });

// Reverse piano swell drawn into the drop (the only music in the freeze gap besides tails).
const reverseChord = (midis, dur) => {
  const n = Math.round((dur + 1.5) * SR);
  const x = new Float32Array(n);
  for (const m of midis) {
    const p = piano(m);
    for (let i = 0; i < Math.min(p.length, n); i++) x[i] += p[i] * 0.3;
  }
  return x.reverse().slice(-Math.round(dur * SR)).map((v, i, a) => v * (i / a.length) ** 1.6);
};

// Final chord on the logo flare, ringing to the end.
for (const [m, g] of [[33, 0.5], [45, 0.4], [52, 0.35], [57, 0.35], [60, 0.3], [64, 0.3], [71, 0.25], [76, 0.2]]) {
  place(B.keys, piano(m, true), FLARE, { gain: g, len: DUR - FLARE, release: 0.8 });
}
place(B.bass, sub(33, DUR - FLARE), FLARE, { gain: 0.25, release: 0.8 });

// ---------- SFX: recorded, each on its exact visual frame ----------
const u = (units) => units / 30;
const at = (name, t, gain, opts = {}) => place(B.sfx, sp(name), t - (opts.pre ?? 0), { gain, ...opts });
// Typed prompt keystrokes, mirroring Describe.tsx's typing rhythm (one tap per three characters).
const PROMPT = "Turn this into a feature announcement video";
const keyTimes = [];
{
  let acc = 6;
  for (let i = 0; i < PROMPT.length; i++) {
    acc += 0.55 + random(`k${i}`) * 0.6 + (PROMPT[i] === " " ? 0.4 : 0);
    if (i % 3 === 0) keyTimes.push(u(540 + acc));
  }
}

at("misc_cineboom", u(44), 0.55, { pre: 3.36 }); // logo lock (sample peaks 3.36s in)
at("perc_impact2", u(44), 0.22);
at("perc_swoosh", u(173), 0.5, { pre: 0.026, pan: 0.7, panTo: -0.7 }); // whip-pan R→L, peak at max camera speed
[5.95, 6.17, 6.42, 6.63, 6.88, 7.1].forEach((t, i) => at(i % 2 ? "tbd_perc_tap_2" : "tbd_perc_tap_1", t, 0.12, { pan: 0.3 })); // docs typing
at("ambi_swoosh", u(232), 0.3, { pre: 0.96 }); // pull-out, fastest at its midpoint
at("perc_impact1", FREEZE, 0.45, { pre: 0.052 }); // freeze on "Repeat"
at("elec_tick", u(343), 0.55, { pan: 0.3 }); // toggle → Connected
[346, 355, 364].forEach((x) => at("elec_plip", u(x), 0.28, { pan: -0.45 })); // agents dock
keyTimes.forEach((t, i) => at(i % 2 ? "tbd_perc_tap_2" : "tbd_perc_tap_1", t, 0.1, { pan: 0.1 })); // prompt typing
at("elec_blip", u(586), 0.3, { pan: 0.25 }); // send
at("perc_swash", u(588), 0.18, { pre: 0.08, pan: 0.2 });
[620, 627, 633, 640, 646].forEach((x, i) => at("elec_tick", u(x), 0.22 + i * 0.03)); // steps complete
at("perc_swash", u(650), 0.25, { pre: 0.08 }); // fast-forward build starts
at("elec_tick", u(700), 0.5, { pan: 0.4 }); // Export click
at("elec_chime", u(734), 0.18); // "Your video is ready"
at("elec_tick", u(765), 0.5, { pan: -0.5 }); // ticket → Done
at("elec_ping", u(812), 0.2); // generated video ready
[0, 1, 2, 3, 4, 5].forEach((i) => at("tbd_perc_tap_1", u(904 + i * 4.5), 0.12 + i * 0.01, { pan: [-0.45, 0, 0.45][i % 3] })); // cards land
Array.from({ length: 10 }, (_, i) => at("elec_tick", 37.25 + i * 0.1, 0.12 + i * 0.02)); // counter
at("elec_bell", u(1145.3), 0.3); // count reaches 10
at("elec_chime", u(1145.3), 0.12);
at("misc_cineboom", FLARE, 0.5, { pre: 3.36 }); // final flare

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
lowpass(B.pad, (t) => (t < 4 ? lerp(350, 1800, t / 4) : SECTION(t) === "break" ? 1300 : SECTION(t) === "dip" ? 500 : SECTION(t) === "outro" ? 1500 : 2200));
lowpass(B.keys, (t) => (SECTION(t) === "dip" ? lerp(900, 16000, (t - 37.6) / 0.4) : 16000));
lowpass(B.drums, (t) => (SECTION(t) === "dip" ? 1500 : 18000));
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

// Freeze: music stops dead at 8.2s (tails keep ringing in the reverb) until the reverse swell.
{
  const s = Math.round(FREEZE * SR), e = Math.round(DROP * SR);
  for (const b of [B.pad, B.bass, B.keys, B.drums, B.kick]) each(b, (x) => { for (let i = s; i < e; i++) x[i] *= Math.max(0, 1 - (i - s) / (0.02 * SR)); });
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
// Shorten the "Repeat" freeze: drop 1s of the silent hold (8.85–9.85s) to match the trimmed video,
// then add the reverse piano swell into the new drop (9.0s).
const CUT = [8.85, 9.85];
{
  const a = Math.round(CUT[0] * SR), b = Math.round(CUT[1] * SR), xf = Math.round(0.05 * SR);
  for (let ch = 0; ch < 2; ch++) {
    const x = mix[ch], o = new Float32Array(N - (b - a));
    o.set(x.subarray(0, a));
    o.set(x.subarray(b), a);
    for (let i = 0; i < xf; i++) o[a + i] = x[a + i] * (1 - i / xf) + x[b + i] * (i / xf);
    mix[ch] = o;
  }
  if (!SFX_ONLY) {
    const sw = reverseChord([45, 57, 64, 69, 72, 76], 0.75), s0 = Math.round((DROP - (CUT[1] - CUT[0]) - 0.75) * SR);
    for (let i = 0; i < sw.length; i++) { mix[0][s0 + i] += sw[i] * 0.8; mix[1][s0 + i] += sw[i] * 0.8; }
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

const outPath = SFX_ONLY ? join(ROOT, "out/sfx-stem.wav") : join(ROOT, "public/audio/clueso-mcp-45.wav");
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
