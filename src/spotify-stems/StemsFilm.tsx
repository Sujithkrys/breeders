// SpotifyStems: a concept launch for a feature Spotify doesn't have, "Stems": pull any song apart into vocals,
// drums, bass and melody, right in the desktop app. The middle is played like a live DJ set, and every move on screen
// really happens in the sound (scripts/compose-stems.mjs → public/stems/mix.wav): the drums pulled out while the rest
// sinks underwater, the drums slammed back, a vocal chop on pads, one silent beat into the bass drop, a tape stop into
// the final drop. No headline type: the only words are the app's own small labels.
// Music: "Phonk" by The_Mountain (Pixabay), split with Demucs, cut on its beat grid (123.18 BPM).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { C, ContextMenu, Cover, Cursor, DesktopApp, envAt, FONT, LaneState, PLAY_BTN, Stem, STEMS, STEMS_PANEL, StemsPanel, wavePath } from "./ui";

export const BEAT = 60 / 123.18;
const b = (n: number) => n * BEAT;
const BODY = b(56);
export const STEMS_FILM = { fps: 30, width: 1920, height: 1080, seconds: BODY + OUTRO_LEN };

// film time → song time inside the analysis window (which starts at the song's 9.735 s, see scripts/stems-analyse.py).
// The tape stop over b43–44 winds the record down: half a beat of song in one beat of picture.
const songOf = (s: number) => {
  if (s >= b(43) && s < b(44)) {
    const u = s - b(43), T = b(1);
    return b(43) + u - (u * u) / (2 * T);
  }
  return s;
};

// ---------- camera ----------
type Cam = { px: number; py: number; sc: number; rx?: number; ry?: number; rz?: number; blur?: number };
const lerpCam = (a: Cam, c: Cam, k: number): Cam => ({
  px: a.px + (c.px - a.px) * k,
  py: a.py + (c.py - a.py) * k,
  sc: a.sc * Math.pow(c.sc / a.sc, k),
  rx: (a.rx ?? 0) + ((c.rx ?? 0) - (a.rx ?? 0)) * k,
  ry: (a.ry ?? 0) + ((c.ry ?? 0) - (a.ry ?? 0)) * k,
  rz: (a.rz ?? 0) + ((c.rz ?? 0) - (a.rz ?? 0)) * k,
  blur: (a.blur ?? 0) + ((c.blur ?? 0) - (a.blur ?? 0)) * k,
});
// look at point (px, py) of a 1920×1080 layer, magnified sc, tilted in 3D. Past 2.5x the tilt fades out: a 3D layer
// that big makes Chrome rasterise the whole magnified page, which runs this laptop out of memory.
const Camera: React.FC<{ cam: Cam; children: React.ReactNode; bg?: string }> = ({ cam, children, bg = "#000" }) => {
  const t = Math.max(0, Math.min(1, (3.2 - cam.sc) / 0.7));
  const tilt = t > 0.01 ? `rotateX(${(cam.rx ?? 0) * t}deg) rotateY(${(cam.ry ?? 0) * t}deg) rotateZ(${(cam.rz ?? 0) * t}deg)` : "none";
  return (
  <AbsoluteFill style={{ background: bg, perspective: t > 0.01 ? 2200 : undefined, overflow: "hidden" }}>
    <AbsoluteFill style={{ transformStyle: t > 0.01 ? "preserve-3d" : undefined, transform: tilt }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - cam.px * cam.sc}px, ${540 - cam.py * cam.sc}px) scale(${cam.sc})`, filter: cam.blur ? `blur(${cam.blur}px)` : undefined }}>
        {children}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
  );
};

// ---------- 0 → 12: play, the waveform, "Open in Stems" ----------
const MENU = { x: 760, y: 300 };
const Opening: React.FC<{ s: number }> = ({ s }) => {
  const playing = s > 0.12;
  const songT = songOf(s);
  // camera: a macro on the play button, pull back along the player bar, then glide up to the tracklist
  let cam: Cam;
  if (s < b(4)) cam = lerpCam({ px: PLAY_BTN.x, py: PLAY_BTN.y, sc: 7.5, rx: 6 }, { px: PLAY_BTN.x, py: PLAY_BTN.y - 4, sc: 6.2, rx: 6 }, ramp(s, [0, b(4)], [0, 1], ease.inOut));
  else if (s < b(8)) cam = lerpCam({ px: PLAY_BTN.x, py: PLAY_BTN.y - 4, sc: 6.2, rx: 6 }, { px: 1000, py: 1010, sc: 2.2, rx: 14, ry: -6 }, ramp(s, [b(4), b(8)], [0, 1], ease.inOut));
  else cam = lerpCam({ px: 980, py: 640, sc: 1.55, rx: 8, ry: -8 }, { px: 900, py: 520, sc: 1.75, rx: 6, ry: -4 }, ramp(s, [b(8), b(12)], [0, 1], ease.inOut));
  const menuOpen = ramp(s, [b(8.2), b(8.5)], [0, 1], ease.out) * (1 - ramp(s, [b(11.3), b(11.7)], [0, 1]));
  const hover = s < b(8.4) ? -1 : s < b(9.2) ? 0 : s < b(10.0) ? 3 : 5;
  const press = ramp(s, [b(10.8), b(10.95)]) * (1 - ramp(s, [b(11.0), b(11.2)]));
  // cursor: in to the play button, then to the row, then down the menu
  const cur = s < b(4)
    ? { x: PLAY_BTN.x + 10 - ramp(s, [0, 0.12], [40, 0], ease.out), y: PLAY_BTN.y + 6, p: s > 0.08 && s < 0.2 ? 1 : 0 }
    : s < b(8.2)
      ? { x: 760 - 260 * (1 - ramp(s, [b(6), b(8)], [0, 1], ease.inOut)), y: 300 - 0, p: s > b(7.9) && s < b(8.1) ? 1 : 0 }
      : { x: MENU.x + 140, y: MENU.y + 20 + (hover < 0 ? 0 : (hover === 5 ? 5 * 40 + 9 : hover * 40)), p: press };
  return (
    <Camera cam={cam}>
      <DesktopApp s={{ playing, progress: 0.06 + songT / 158, wave: ramp(s, [b(4.5), b(7.5)], [0, 1], ease.inOut), songT, dimRest: ramp(s, [b(11.2), b(12)]), hoverRow: s > b(6) ? 0 : undefined, playGlow: ramp(s, [0.12, 0.4]) * (1 - ramp(s, [b(3), b(4)])) }}>
        <ContextMenu x={MENU.x} y={MENU.y} open={menuOpen} hover={hover} press={press} />
        <Cursor x={cur.x} y={cur.y} press={cur.p} />
      </DesktopApp>
    </Camera>
  );
};

// ---------- 12 → 16 and 42 → 45: the split and the braid ----------
// k = 0: one white waveform; k = 1: four coloured ribbons stacked apart
const Ribbons: React.FC<{ s: number; k: number; tiltY: number; tiltX: number; labels: number; zoom?: number }> = ({ s, k, tiltY, tiltX, labels, zoom = 1 }) => {
  const songT = songOf(s);
  const gap = 170 * k;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, #141414 0%, #050505 70%)", perspective: 1800 }}>
      <AbsoluteFill style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${zoom})`, transformStyle: "preserve-3d" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            {STEMS.map((st) => (
              <linearGradient key={st.k} id={`rb${st.k}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={st.color} stopOpacity={0} />
                <stop offset="0.25" stopColor={st.color} stopOpacity={0.9} />
                <stop offset="0.75" stopColor={st.color} stopOpacity={0.9} />
                <stop offset="1" stopColor={st.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {STEMS.map((st, i) => {
            const y = 540 + (i - 1.5) * gap;
            const e = envAt(st.k, songT);
            return (
              <g key={st.k} transform={`translate(160 ${y - 90})`} style={{ mixBlendMode: "screen" }}>
                <path d={wavePath(st.k, songT - 2.6, songT + 2.6, 1600, 90, 4, 1.05)} fill={k < 0.05 ? "#FFFFFF" : `url(#rb${st.k})`} opacity={0.35 + 0.65 * Math.max(k, 0.4)} style={{ filter: `drop-shadow(0 0 ${8 + 24 * e * k}px ${st.color})` }} />
              </g>
            );
          })}
          <line x1={960} x2={960} y1={540 - 2.2 * 170 * k - 120} y2={540 + 2.2 * 170 * k + 120} stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5} />
        </svg>
        {STEMS.map((st, i) => (
          <div key={st.k} style={{ position: "absolute", left: 172, top: 540 + (i - 1.5) * gap - 118, fontFamily: FONT, fontSize: 15, fontWeight: 600, color: st.color, opacity: labels, letterSpacing: "0.02em" }}>
            {st.name}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 16 → 44: the Stems panel, played live ----------
//   16–20 tracking across the lanes · 20–28 drums pulled, the rest underwater · 28 drums slam back
//   32–40 vocal chop on four pads · 40 one silent beat · 41 the bass drop · 43 tape stop
const allOn: LaneState = { vocals: { on: 1, solo: 0, mute: 0 }, drums: { on: 1, solo: 0, mute: 0 }, bass: { on: 1, solo: 0, mute: 0 }, other: { on: 1, solo: 0, mute: 0 } };
const lanesAt = (s: number): LaneState => {
  if (s >= b(20) && s < b(28)) return { ...allOn, drums: { on: 1, solo: 0, mute: ramp(s, [b(20), b(20.3)], [0, 1], ease.out) } };
  if (s >= b(32) && s < b(40)) return { ...allOn, vocals: { on: 1, solo: 0, mute: 1 } }; // the pads take over
  if (s >= b(40) && s < b(41)) return { vocals: { on: 0, solo: 0, mute: 1 }, drums: { on: 0, solo: 0, mute: 1 }, bass: { on: 0, solo: 0, mute: 1 }, other: { on: 0, solo: 0, mute: 1 } };
  return allOn;
};
const LANE_Y = (i: number) => STEMS_PANEL.y + 85 + i * 150 + 75; // centre of lane i
const MUTE_X = STEMS_PANEL.x + 169;
const WAVE_X = STEMS_PANEL.x + 230; // where the lane waveforms start
// the chop pattern (eighths from b32): which pad fires
const CHOP = [0, 1, -1, 0, 2, -1, 3, 2, 1, -1, 1, -1, 0, 1, 2, 3];
const Pads: React.FC<{ s: number }> = ({ s }) => {
  const vis = ramp(s, [b(32), b(32.25)], [0, 1], ease.out) * (1 - ramp(s, [b(39.8), b(40)]));
  if (vis <= 0) return null;
  const e8 = Math.floor((s - b(32)) / (BEAT / 2));
  const u = (s - b(32)) / (BEAT / 2) - e8;
  const pad = e8 >= 0 && e8 < 16 ? CHOP[e8] : -1;
  return (
    <div style={{ position: "absolute", left: WAVE_X + 20, top: LANE_Y(0) - 52, display: "flex", gap: 18, opacity: vis }}>
      {[0, 1, 2, 3].map((i) => {
        const on = pad === i ? 1 - u * 0.8 : 0;
        return (
          <div key={i} style={{ width: 262, height: 104, borderRadius: 10, background: `rgba(255,90,158,${0.12 + 0.6 * on})`, border: `1.5px solid rgba(255,90,158,${0.45 + 0.55 * on})`, boxShadow: on > 0 ? `0 0 ${40 * on}px rgba(255,90,158,${0.7 * on})` : undefined, transform: `scale(${1 + 0.05 * on})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={200} height={60}>
              <path d={wavePath("vocals", 24.11 + i * 0.25, 24.11 + i * 0.25 + 0.24, 200, 30, 4, 1.4)} fill="#FF5A9E" opacity={0.5 + 0.5 * on} />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
const Panel: React.FC<{ s: number }> = ({ s }) => {
  const songT = songOf(s);
  let cam: Cam;
  let cur: { x: number; y: number; p: number } | null = null;
  let press: { k: Stem; b: "S" | "M"; v: number } | undefined;
  const click = (at: number) => ramp(s, [at - 0.12, at], [0, 1]) * (1 - ramp(s, [at, at + 0.14], [0, 1]));
  const slam = (at: number, amp: number): Cam => {
    const u = s - at;
    if (u < 0 || u > 0.45) return { px: 0, py: 0, sc: 1 };
    const a = amp * Math.exp(-u * 10);
    return { px: Math.sin(u * 90) * 22 * a, py: Math.sin(u * 70 + 1) * 16 * a, sc: 1 + 0.06 * a };
  };
  let kick: Cam = { px: 0, py: 0, sc: 1 };
  if (s < b(20)) {
    // a slow tracking move across the four lanes, in perspective; the cursor drifts to the drums' mute
    cam = lerpCam({ px: 760, py: 540, sc: 1.08, rx: 14, ry: 16 }, { px: 980, py: 540, sc: 1.18, rx: 10, ry: 6 }, ramp(s, [b(16), b(20)], [0, 1], ease.inOut));
    cur = { x: MUTE_X + 4 - 320 * (1 - ramp(s, [b(18.4), b(19.8)], [0, 1], ease.inOut)), y: LANE_Y(1) - 4, p: click(b(19.97)) };
    press = { k: "drums", b: "M", v: click(b(19.97)) };
  } else if (s < b(28)) {
    // drums out: the camera creeps in on the dark drum lane, the cursor waits on the button
    cam = lerpCam({ px: 980, py: 560, sc: 1.18, rx: 10, ry: 6 }, { px: 760, py: LANE_Y(1), sc: 2.3, rx: 4, ry: 2 }, ramp(s, [b(20), b(28)], [0, 1], ease.in));
    cur = { x: MUTE_X + 4, y: LANE_Y(1) - 4, p: click(b(27.85)) };
    press = { k: "drums", b: "M", v: click(b(27.85)) };
  } else if (s < b(32)) {
    // DRUMS BACK: punch out to the whole panel, shaking
    cam = lerpCam({ px: 960, py: 540, sc: 1.02, rx: 6, ry: -2 }, { px: 980, py: 540, sc: 1.1, rx: 8, ry: -6 }, ramp(s, [b(28), b(32)], [0, 1], ease.out));
    kick = slam(b(28), 1);
  } else if (s < b(40)) {
    // the chop: on the vocal lane's pads, a little bump on every hit
    cam = lerpCam({ px: 980, py: LANE_Y(0) + 10, sc: 1.75, rx: 8, ry: 8 }, { px: 1040, py: LANE_Y(0) + 30, sc: 1.9, rx: 6, ry: -4 }, ramp(s, [b(32), b(40)], [0, 1], ease.inOut));
    const e8 = Math.floor((s - b(32)) / (BEAT / 2));
    if (e8 >= 0 && e8 < 16 && CHOP[e8] >= 0) kick = slam(b(32) + e8 * (BEAT / 2), 0.18);
  } else if (s < b(43)) {
    // the bass drop: everything shakes back in
    cam = lerpCam({ px: 960, py: 560, sc: 1.25, rx: 12, ry: 10 }, { px: 960, py: 540, sc: 1.08, rx: 8, ry: 4 }, ramp(s, [b(41), b(43)], [0, 1], ease.out));
    kick = slam(b(41), 1.2);
  } else {
    // tape stop: the whole view winds down, tipping and sinking
    const k = ramp(s, [b(43), b(44)], [0, 1], ease.in);
    cam = { px: 960, py: 540 + 40 * k, sc: 1.08 - 0.12 * k, rx: 8 + 10 * k, ry: 4, rz: -5 * k };
  }
  cam = { ...cam, px: cam.px + kick.px, py: cam.py + kick.py, sc: cam.sc * kick.sc };
  const under = ramp(s, [b(20), b(27.8)], [0, 1], ease.in) * (s < b(28) ? 1 : 0); // how far underwater
  const tape = s >= b(43) && s < b(44) ? ramp(s, [b(43), b(44)], [0, 1], ease.in) : 0;
  const drop = s >= b(40) && s < b(41);
  return (
    <Camera cam={cam} bg="#050505">
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, #161616 0%, #050505 75%)" }} />
      <div style={{ position: "absolute", inset: 0, filter: under > 0 || tape > 0 ? `blur(${under * 2.2 + tape * 3}px) saturate(${1 - 0.5 * under - 0.8 * tape}) brightness(${1 - 0.25 * under - 0.4 * tape})` : undefined }}>
        <StemsPanel songT={songT} lanes={lanesAt(s)} tempo={1} press={press} />
        <Pads s={s} />
      </div>
      {/* underwater: a cold wash over everything but the drum lane */}
      {under > 0 ? <div style={{ position: "absolute", inset: 0, background: `rgba(20,45,90,${0.28 * under})`, mixBlendMode: "multiply" }} /> : null}
      {s >= b(32) && s < b(40) ? (
        <div style={{ position: "absolute", left: WAVE_X + 20, top: LANE_Y(0) - 84, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#000", background: "#FF5A9E", borderRadius: 12, padding: "4px 10px", opacity: ramp(s, [b(32), b(32.3)]) }}>Chop</div>
      ) : null}
      {/* the silent beat: the screen holds its breath, only a hairline of bass left */}
      {drop ? (
        <div style={{ position: "absolute", inset: -400, background: "#000", opacity: 0.9 }}>
          <div style={{ position: "absolute", left: 400 + WAVE_X, width: 1150, top: 400 + LANE_Y(2), height: 2, background: "#4C8DFF", boxShadow: "0 0 24px 4px rgba(76,141,255,0.8)", opacity: ramp(s, [b(40), b(40.9)], [0.2, 1], ease.in) }} />
        </div>
      ) : null}
      {cur ? <Cursor x={cur.x} y={cur.y} press={cur.p} /> : null}
    </Camera>
  );
};

// ---------- 47 → 49: back to the whole app, floating ----------
const Floating: React.FC<{ s: number }> = ({ s }) => {
  const k = ramp(s, [b(47), b(49)], [0, 1], ease.out);
  const songT = songOf(s);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, #1A1A1A 0%, #050505 75%)", perspective: 2400 }}>
      <AbsoluteFill style={{ transform: `rotateX(${10 - 4 * k}deg) rotateY(${-14 + 8 * k}deg) scale(${0.9 - 0.28 * k})`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", boxShadow: "0 60px 160px rgba(0,0,0,0.8), 0 0 0 1px #2A2A2A" }}>
          <DesktopApp s={{ playing: true, progress: 0.06 + songT / 158, wave: 1, songT, playGlow: 0.6 }} />
          {/* a glass sweep across the window */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${20 + 70 * k}%, rgba(255,255,255,0.10) ${26 + 70 * k}%, transparent ${34 + 70 * k}%)` }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 49 → 53: any song, half a beat each ----------
const COVERS: [string, string, string][] = [
  ["#5A3FFF", "#1E8F6A", "#0B0B18"],
  ["#FFB23F", "#E2453C", "#1A0A06"],
  ["#3FD0FF", "#3243B8", "#05101A"],
  ["#F5F0E6", "#C9B8A0", "#2A2520"],
  ["#FF3F8E", "#6A1BB8", "#0E0614"],
  ["#9BFF5A", "#1B7A3E", "#06120A"],
  ["#FFD84A", "#FF6A2A", "#160C04"],
  ["#7AC4FF", "#E8F2FF", "#0A1422"],
];
const Montage: React.FC<{ s: number }> = ({ s }) => {
  const i = Math.min(7, Math.floor((s - b(49)) / b(0.5)));
  const u = (s - b(49) - i * b(0.5)) / b(0.5);
  const split = ramp(u, [0.15, 0.7], [0, 1], ease.out);
  return (
    <AbsoluteFill style={{ background: "#050505", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${1.04 - 0.04 * u})`, display: "flex", alignItems: "center", gap: 70 }}>
        <div style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
          <Cover size={460} seed={i + 11} hue={COVERS[i]} />
        </div>
        <svg width={760} height={460}>
          {STEMS.map((st, j) => (
            <path key={st.k} transform={`translate(0 ${230 - 50 + (j - 1.5) * 105 * split})`} d={wavePath(st.k, 6 + i * 3.3, 9.2 + i * 3.3, 760, 50, 4, 1.05)} fill={split < 0.05 ? "#fff" : st.color} opacity={0.85} style={{ mixBlendMode: "screen" }} />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 53 → 56: the mark ----------
const SpotifyMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 168 168">
    <circle cx="84" cy="84" r="84" fill={C.green} />
    <path d="M39 64c30-9 64-6 93 9" stroke="#000" strokeWidth="13" strokeLinecap="round" fill="none" />
    <path d="M44 90c25-7 52-5 76 8" stroke="#000" strokeWidth="11" strokeLinecap="round" fill="none" />
    <path d="M48 114c20-5 41-4 60 6" stroke="#000" strokeWidth="9" strokeLinecap="round" fill="none" />
  </svg>
);
const EndMark: React.FC<{ s: number }> = ({ s }) => {
  const k = ramp(s, [b(53), b(54)], [0, 1], ease.out);
  const songT = songOf(s);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <svg width={1920} height={240} style={{ position: "absolute", top: 420, opacity: 0.18 * k }}>
        {STEMS.map((st) => (
          <path key={st.k} transform="translate(0 30)" d={wavePath(st.k, songT - 4, songT + 4, 1920, 90, 6, 1)} fill={st.color} style={{ mixBlendMode: "screen" }} />
        ))}
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: k, transform: `translateY(${(1 - k) * 10}px)` }}>
        <SpotifyMark size={72} />
        <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: C.text }}>Stems</div>
        <div style={{ fontFamily: FONT, fontSize: 17, color: C.sub }}>· Concept</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- the cut list ----------
const Shot: React.FC<{ s: number }> = ({ s }) => {
  if (s < b(12)) return <Opening s={s} />;
  if (s < b(16)) {
    const k = ramp(s, [b(12), b(12.6)], [0, 1], ease.out);
    return <Ribbons s={s} k={k} tiltY={-18 + 10 * ramp(s, [b(12), b(16)])} tiltX={20 - 6 * ramp(s, [b(12), b(16)])} labels={ramp(s, [b(12.6), b(13.2)])} zoom={1.05 - 0.05 * ramp(s, [b(12), b(16)])} />;
  }
  if (s < b(44)) return <Panel s={s} />;
  // the final drop on b44: the four ribbons braid back into one
  if (s < b(47)) {
    const k = 1 - ramp(s, [b(44), b(46.5)], [0, 1], ease.inOut);
    return <Ribbons s={s} k={k} tiltY={8 - 16 * (1 - k)} tiltX={14} labels={k} zoom={0.95 + 0.1 * (1 - k)} />;
  }
  if (s < b(49)) return <Floating s={s} />;
  if (s < b(53)) return <Montage s={s} />;
  return <EndMark s={s} />;
};

// a directional smear on the cuts that move fast
const WHIPS = [b(12), b(16), b(44), b(47), b(49), b(53)];
const whipAt = (s: number) => Math.max(0, ...WHIPS.map((t) => 1 - Math.abs(s - t) / 0.08));

export const SpotifyStems: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const whip = whipAt(s);
  const hitFlash = (at: number, peak: number) => (s >= at ? ramp(s, [at, at + 0.18], [peak, 0]) : 0);
  const flash = Math.max(hitFlash(b(12), 0.35), hitFlash(b(28), 0.45), hitFlash(b(41), 0.5), hitFlash(b(44), 0.35));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("stems/mix.wav")} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whipS" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${whip * 50} 0`} />
        </filter>
      </svg>
      {s < BODY ? (
        <>
          <AbsoluteFill style={{ filter: whip > 0.02 ? "url(#whipS)" : undefined }}>
            <Shot s={s} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash, mixBlendMode: "overlay", pointerEvents: "none" }} />
          {/* film finish: soft vignette and fine grain */}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
          <Watermark opacity={(1 - ramp(s, [BODY - 0.3, BODY])) * 0.85} dark={1} />
        </>
      ) : (
        <BreedersOutro t={s - BODY} />
      )}
    </AbsoluteFill>
  );
};
