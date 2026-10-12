// Final audio for "Motion designers are cooked" (GuavaCooked60) → public/guava/mix.wav.
// Music: "dramatic cinematic documentary" by musicdream (Pixabay Content License), edited to the picture on its own
// beat grid (136 BPM; drops at 42.381s and 102.380s). SFX: the recorded pack in audio/sfx, each placed by its measured
// peak on the frame it belongs to. Voice: public/guava/voice.wav, music ducked underneath.
// Cue times mirror src/guava (chat.tsx T, scenes.tsx E, voice.ts WORDS, GuavaFilm.tsx FILM_SFX, brand end card).
// Run: node scripts/compose-guava-pro.mjs          STEM=sfx node scripts/compose-guava-pro.mjs  (effects only)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SFX = join(ROOT, "audio/sfx");
const SR = 44100;
const DUR = 53.9 + 3; // film, then the 3s Breeders end card
// Picture anchors (src/guava/Cooked.tsx END): film v2 32–51, punch 51, end card 53.9.
const PUNCH = 51, OUTRO = 53.9;
const N = Math.round(SR * DUR);
const TAU = Math.PI * 2;

// ---------- decoding ----------
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
const resample = ([L, R], ratio) => {
  const n = Math.floor(L.length / ratio), oL = new Float32Array(n), oR = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = i * ratio, k = Math.floor(p), fr = p - k; oL[i] = L[k] * (1 - fr) + (L[k + 1] ?? 0) * fr; oR[i] = R[k] * (1 - fr) + (R[k + 1] ?? 0) * fr; }
  return [oL, oR];
};
const WORDS = JSON.parse(readFileSync(join(ROOT, "src/guava/voice.ts"), "utf8").match(/WORDS: .*? = (\[.*\]);/s)[1]);
const FILM_SFX = JSON.parse(readFileSync(join(ROOT, "src/guava/GuavaFilm.tsx"), "utf8").match(/FILM_SFX: .*? = (\[.*\]);/)[1]);
const wordAt = (w, after = 0) => WORDS.find((x) => x.w.replace(/[^\w]/g, "").toLowerCase() === w && x.s >= after)?.s ?? after;

// ---------- buses ----------
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
// Place a sound so its measured peak lands on `t`.
const PLACED = [];
const hit = (name, t, gain, peak = 0, opts = {}) => (PLACED.push(t), put)(opts.big ? BIG : FX, sfx(name), t - peak, { gain, ...opts });

// ---------- music: the track cut to the picture ----------
const TRACK = decode(join(ROOT, "audio/music/musicdream-dramatic-cinematic-documentary-609202.mp3"));
const seg = (vFrom, vTo, tFrom, { fadeIn = 0.04, fadeOut = 0.06, gain = 1 } = {}) => put(MUSIC, TRACK, vFrom, { from: tFrom, len: vTo - vFrom, fadeIn, fadeOut, gain });
const DROP1 = 42.381, DROP2 = 102.38;
seg(0, 3.05, 14.143, { fadeOut: 0.12 }); // hook on the track's big hit
{ // rewind: the hook's music scrubbed backwards at double speed
  const a = Math.round(14.143 * SR), b = Math.round(17.143 * SR), n = b - a;
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = TRACK[0][b - 1 - i]; R[i] = TRACK[1][b - 1 - i]; }
  put(MUSIC, resample([L, R], 2.0), 3.0, { gain: 0.5, fadeIn: 0.05, fadeOut: 0.1, len: 1.45 });
}
seg(4.5, 26.0, DROP1 - 14.5, { fadeIn: 0.25, fadeOut: 0.05 }); // build under the chat; silence break falls on the render; drop at 19.0
seg(26.0, 31.4, 162.483, { fadeIn: 0.05, fadeOut: 0.08, gain: 0.9 }); // mellow bed under the edit
seg(31.4, 32.0, DROP2 - 0.6, { fadeIn: 0.05, fadeOut: 0.01 }); // pre-drop swell
{ // showcase: second drop at 32.0, then a tape-stop into silence at the punch
  seg(32.0, PUNCH - 0.45, DROP2, { fadeIn: 0.005, fadeOut: 0.01 });
  const a = Math.round((DROP2 + PUNCH - 0.45 - 32) * SR), n = Math.round(0.45 * SR), L = new Float32Array(n), R = new Float32Array(n);
  let pos = 0;
  for (let i = 0; i < n; i++) { const r = 1 - i / n; pos += r; const k = a + Math.floor(pos); L[i] = TRACK[0][k] * r; R[i] = TRACK[1][k] * r; }
  put(MUSIC, [L, R], PUNCH - 0.45, { fadeOut: 0.03 });
}
seg(OUTRO, DUR, 190.624 - 0.45, { fadeIn: 0.05, fadeOut: 1.0, gain: 1.1 }); // end card: the track's ending hit lands with the mark

// ---------- hook ----------
const hMotion = wordAt("motion"), hAre = wordAt("are"), hCooked = wordAt("cooked");
hit("03 Grand Hit A.wav", hMotion, 0.55, 0.59, { big: true });
hit("Subdrop Low/SD_Low_07.wav", hMotion, 0.35, 0.04, { big: true, len: 1.2, fadeOut: 0.4 });
hit("04 Grand Hit B.wav.wav", hAre, 0.5, 0.56, { big: true });
hit("11 Universe Boom A.wav", hCooked, 0.8, 1.02, { big: true });
hit("Drop Disto Sub 1.wav", hCooked, 0.55, 0.15, { big: true });
hit("Dramatic Horn Transitions/Dramatic Horn Transition 02.wav", hCooked, 0.7, 1.26, { big: true });
hit("Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 05.wav", hCooked, 0.6, 1.49, { big: true });
// every background cut (scenes.tsx HOOK) gets its own hit between the word slams
hit("05 Impact.wav", 0.52, 0.4, 0.05, { big: true });
hit("Swishes/Sharp swoosh.wav", 0.52, 0.3, 0.18, { pan: -0.3 });
hit("Swishes/Sharp swoosh.wav", 1.33, 0.4, 0.18, { pan: 0.3 });
hit("Clicks/Click_03.wav", 1.33, 0.45, 0.01);
hit("Glitch Sound Effects Pack/glitch 05.wav", 1.72, 0.4, 0.62);
hit("Subdrop Low/SD_Low_05.wav", 1.72, 0.3, 0.02, { big: true, len: 0.5, fadeOut: 0.2 });
hit("Swishes/Sharp swoosh.wav", 2.5, 0.35, 0.18, { pan: -0.3 });
hit("18 Termainal Glitch.wav", 2.5, 0.3, 0.16);
// ---------- rewind ----------
hit("08 Rewinding.wav", 3.0, 0.9, 0);
hit("mixkit-fast-tape-rewind-cinematic-transition-1092.wav", 3.15, 0.6, 0);
// ---------- chat ----------
hit("Digital HUD Interface Sounds/HUD Screen - 01.wav", 4.55, 0.5, 0.19);
hit("Swishes/Golden swoosh.wav", 5.9, 0.55, 0.34, { pan: 0.4 });
hit("ES_Suction Pop 5 - SFX Producer.mp3", 6.0, 0.7, 0.11);
[6.1, 6.25, 6.4].forEach((t, i) => hit(`Clicks/Click_0${i + 2}.wav`, t, 0.35, 0.01));
put(FX, sfx("keyboard-typing-5997.mp3"), 6.8, { from: 3.0, len: 3.1, gain: 1.4, fadeIn: 0.05, fadeOut: 0.1 });
hit("Iphone Send.wav", 10.2, 0.55, 0.32);
[11.0, 11.8, 12.6, 13.4, 14.2, 15.0].forEach((t, i) => hit(`Digital HUD Interface Sounds/Select - 0${(i % 3) + 1}.wav`, t, [0.5, 0.35, 0.3][i % 3], [0.02, 0.36, 0.03][i % 3]));
put(FX, sfx("Digital HUD Interface Sounds/Digital Type Text.wav"), 12.8, { from: 0.4, len: 3.2, gain: 1.2, fadeIn: 0.1, fadeOut: 0.3 });
hit("Swishes/Windy swish.wav", 10.5, 0.3, 0.8, { pan: 0.2 }); // camera eases out after send
hit("Cinematic Whoosh Swoosh Sounds - pack 1/04.wav", 16.3, 0.35, 0.64, { pan: 0.4 }); // camera pushes to the render panel
hit("Digital HUD Interface Sounds/HUD Screen - 01.wav", 11.8, 0.35, 0.19); // code panel slides in
Array.from({ length: 8 }, (_, i) => hit("Clicks/Click_04.wav", 13.4 + i * 0.3, 0.28, 0.07, { pan: 0.4 })); // file tree rows
hit("01 Processing.wav", 16.15, 0.9, 0.34);
put(FX, sfx("Digital counting.mp3"), 16.5, { from: 2.2, len: 1.75, gain: 1.3, fadeIn: 0.05, fadeOut: 0.15 });
{ // render thumbnails land at renderP = (i+.5)/6, renderP = inOut(bezier .65,0,.35,1) over T.render+0.5 → T.rendered
  const bz = (u, p1, p2) => 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3;
  for (let i = 0; i < 6; i++) {
    const target = (i + 0.5) / 6;
    let u = 0; while (bz(u, 0, 1) < target) u += 0.001; // y(u) = target
    const x = bz(u, 0.65, 0.35);
    hit(`Digital HUD Interface Sounds/Select - 0${(i % 3) + 1}.wav`, 16.5 + x * 1.8, 0.4, [0.02, 0.36, 0.03][i % 3], { pan: -0.3 + i * 0.12 });
  }
}
hit("11 Access Granted.wav", 18.3, 0.8, 0.49);
hit("Mouse Click.mp3", 18.8, 1.2, 0.09);
hit("Swishes/Future swoosh.wav", 18.95, 0.6, 0.59);
hit("Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 03.wav", 19.0, 0.55, 1.71, { big: true });
// ---------- the "add sound effects" edit ----------
hit("Clicks/Click_01.wav", 26.02, 0.35, 0.26);
put(FX, sfx("keyboard-typing-5997.mp3"), 26.3, { from: 7.0, len: 1.4, gain: 1.4, fadeIn: 0.05, fadeOut: 0.1 });
hit("Pop 1.mp3", 27.9, 0.35, 0.03); // soft send: the voice starts "Add sound effects…" on this frame
// markers pour onto the timeline (35 × 0.068s): a soft rising button tap on every 4th, sweeping left → right
for (let i = 0; i < FILM_SFX.length; i += 4) put(FX, resample(sfx("Buttons/Button_01.wav"), 2 ** (-(i * 0.2) / 12)), 28.3 + i * 0.068, { gain: 0.3, len: 0.35, fadeOut: 0.1, pan: -0.5 + i / FILM_SFX.length });
hit("01 Processing.wav", 30.45, 0.8, 0.34);
hit("Bells/Bells 03.wav", 31.2, 0.3, 0.25); // re-render done
hit("Swishes/Reverse riser 01.wav", 31.95, 0.55, 1.4);
hit("Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 01.wav", 32.0, 0.55, 1.46, { big: true });
// ---------- the sound-designed film (FILM_SFX), varied recordings per kind ----------
const V2 = 32;
const KIT = {
  sub: [["Subdrop Low/SD_Low_03.wav", 0.06, 0.5], ["Cinematic Sub Drop/Cinematic Sub Drop - 04.wav", 0.04, 0.55], ["Subdrop Low/SD_Low_05.wav", 0.02, 0.5]],
  impact: [["Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 02.wav", 1.93, 0.45], ["05 Impact.wav", 0.05, 0.45], ["03 Grand Hit A.wav", 0.59, 0.4], ["Epic Cinematic Trailer Impact - Pack 2/Epic Cinematic Trailer Impact - 04.wav", 2.59, 0.45]],
  whoosh: [["Cinematic Whoosh Swoosh Sounds - pack 1/05.wav", 0.67, 0.45], ["Cinematic Whoosh Swoosh Sounds - pack 1/04.wav", 0.64, 0.45], ["Cinematic Whoosh Swoosh Sounds - pack 1/07.wav", 0.91, 0.4], ["Swishes/Windy swish.wav", 0.8, 0.5]],
  pop: [["Pop Bubble Sound Effect.mp3", 0.32, 0.35], ["ES_Suction Pop 5 - SFX Producer.mp3", 0.11, 0.55]],
  swell: [["Swishes/Reverse riser 01.wav", 1.4, 0.45], ["Swishes/Future zing.wav", 0.42, 0.35]],
  riser: [["ES_Riser Suction 5 - SFX Producer.mp3", 2.86, 0.55]],
  glitch: [["Glitch Sound Effects Pack/glitch 05.wav", 0.62, 0.45], ["18 Termainal Glitch.wav", 0.16, 0.4]],
  tick: [["Clicks/Click_04.wav", 0.07, 0.4], ["Digital HUD Interface Sounds/Select - 03.wav", 0.03, 0.35]],
  chime: [["Digital HUD Interface Sounds/Notification.wav", 0.03, 0.35], ["11 Access Granted.wav", 0.49, 0.6]],
};
const used = {};
FILM_SFX.forEach(([ft, kind]) => {
  const opts = KIT[kind];
  const k = (used[kind] = (used[kind] ?? -1) + 1) % opts.length;
  const [file, peak, gain] = opts[k];
  hit(file, V2 + ft, gain, peak, { big: kind === "impact" || kind === "sub", pan: kind === "whoosh" ? (k % 2 ? 0.35 : -0.35) : 0 });
});
// ---------- "cooked?" in the silence ----------
const c2 = wordAt("cooked", PUNCH);
hit("Swishes/Reverse riser 01.wav", c2, 0.45, 1.4); // sucks into the slam
hit("Clicks/Click_01.wav", wordAt("so", PUNCH), 0.3, 0.26);
hit("12 Universe Boom B.wav", c2, 0.75, 1.08, { big: true });
hit("Drop Disto Sub 1.wav", c2, 0.5, 0.15, { big: true });
hit("Heavy object Hit and body thud sound effect.mp3", c2, 0.45, 1.3, { big: true });
// ---------- the Breeders end card (src/brand/Breeders.tsx): mark pops, name slides out ----------
hit("05 Impact.wav", OUTRO + 0.05, 0.4, 0.05, { big: true });
hit("Swishes/Golden swoosh.wav", OUTRO + 0.4, 0.35, 0.34);
hit("Digital HUD Interface Sounds/Right (bells).wav", OUTRO + 0.95, 0.45, 0.03);

// ---------- voice + ducking ----------
const voice = decode(join(ROOT, "public/guava/voice.wav"))[0];
for (let i = Math.round(OUTRO * SR); i < voice.length; i++) voice[i] = 0; // the voice ends with the film
{
  let ss = 0, n = 0;
  for (let i = 0; i < Math.min(voice.length, N); i++) if (Math.abs(voice[i]) > 0.02) { ss += voice[i] ** 2; n++; }
  const g = 0.16 / Math.sqrt(ss / Math.max(1, n));
  for (let i = 0; i < voice.length; i++) voice[i] *= g;
}
const duck = new Float32Array(N).fill(1);
{
  let env = 0;
  const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.4 * SR));
  for (let i = 0; i < N; i++) {
    const v = Math.abs(voice[i] ?? 0) > 0.015 ? 1 : 0;
    env = v > env ? att * env + (1 - att) * v : rel * env + (1 - rel) * v;
    duck[i] = 1 - 0.62 * env;
  }
}
// Gentle presence cut in the music (1–4 kHz) while the voice talks, so words stay clear over the drop.
{
  const f0 = 2400, q = 0.9, w = (TAU * f0) / SR, al = Math.sin(w) / (2 * q);
  const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al;
  for (const x of MUSIC) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < N; i++) {
      const y = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = y;
      x[i] -= y * 0.5 * (1 - duck[i]) / 0.62;
    }
  }
}

// Sidechain: every big hit dips the music for a moment so it cuts through instead of fighting the bed.
const hitDuck = new Float32Array(N).fill(1);
{
  let env = 0;
  const att = Math.exp(-1 / (0.002 * SR)), rel = Math.exp(-1 / (0.22 * SR));
  for (let i = 0; i < N; i++) {
    const lvl = Math.max(Math.abs(BIG[0][i]), Math.abs(BIG[1][i]));
    env = lvl > env ? att * env + (1 - att) * lvl : rel * env + (1 - rel) * lvl;
    hitDuck[i] = 1 - 0.55 * Math.min(1, env / 0.25);
  }
}
// Music sits lower under the sound-designed film so its 35 cues read.
const musicGain = (i) => { const s = i / SR; return 0.55 - 0.13 * Math.min(1, Math.max(0, (s - 32) / 0.3)) * Math.min(1, Math.max(0, (PUNCH - s) / 0.3)); };

// ---------- mix + master ----------
const STEM = process.env.STEM === "sfx";
const mix = bus();
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) {
  const m = STEM ? FX[c][i] + BIG[c][i] : MUSIC[c][i] * musicGain(i) * duck[i] * hitDuck[i] + FX[c][i] * 0.95 + BIG[c][i] * (0.75 + 0.3 * duck[i]) + (voice[i] ?? 0);
  mix[c][i] = m;
}
// Glue compressor, stereo-linked, 1.5:1 above -12 dBFS; the slow attack lets transients punch through.
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
for (const x of mix) for (let i = 0; i < N; i++) x[i] *= Math.min(1, (N - i) / (0.6 * SR));
// Loudness to ~-14 dBFS RMS over the main body, then a true-sample-ish lookahead limiter at -1 dBFS.
let sum = 0;
const END = Math.round(OUTRO * SR);
for (const x of mix) for (let i = 0; i < END; i++) sum += x[i] * x[i];
const gain = 0.2 / Math.sqrt(sum / (2 * END));
const CEIL = 0.89, LA = Math.round(0.006 * SR), REL = Math.exp(-1 / (0.1 * SR));
const need = new Float32Array(N);
for (let i = 0; i < N; i++) { const p = Math.max(Math.abs(mix[0][i]), Math.abs(mix[1][i])) * gain; need[i] = p > CEIL ? CEIL / p : 1; }
const gr = new Float32Array(N);
{
  // sliding minimum over the lookahead window, then smooth attack/release
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
const out = STEM ? join(ROOT, "out/guava-sfx-stem.wav") : join(ROOT, "public/guava/mix.wav");
mkdirSync(dirname(out), { recursive: true });
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
let peak = 0, clipped = 0;
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) {
  let v = mix[c][i] * gain * gr[i];
  if (Math.abs(v) > CEIL) { clipped++; v = Math.sign(v) * CEIL; }
  peak = Math.max(peak, Math.abs(v));
  buf.writeInt16LE(Math.round(v * 32767), 44 + (i * 2 + c) * 2);
}
writeFileSync(out, buf);
console.log(`Wrote ${out} (gain ${gain.toFixed(2)}, peak ${peak.toFixed(3)}, clipped ${clipped})`);
if (process.env.DENSITY) {
  const onsets = [...new Set(PLACED.map((t) => Math.round(t * 10) / 10))].sort((a, b) => a - b); // hits within 0.1s count once
  console.log("sound events per 10s:", Array.from({ length: Math.ceil(DUR / 10) }, (_, k) => onsets.filter((t) => t >= k * 10 && t < k * 10 + 10).length).join(" "), "| first 3s:", onsets.filter((t) => t < 3).length);
}
