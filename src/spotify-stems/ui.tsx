// Spotify desktop, rebuilt at its real proportions (dark theme, 1920×1080 window) for the Stems concept film.
// Text stays at the app's own sizes: the camera does the zooming, so nothing is ever set large.
// Spotify's own typeface isn't available to us; Figtree is the closest free geometric sans.
import React from "react";
import data from "./analysis.json";

export const FONT = "Figtree, 'Inter', sans-serif";
export const C = {
  bg: "#000000",
  panel: "#121212",
  card: "#1F1F1F",
  hover: "#2A2A2A",
  line: "#2A2A2A",
  text: "#FFFFFF",
  sub: "#B3B3B3",
  dim: "#6A6A6A",
  green: "#1ED760",
};
export type Stem = "vocals" | "drums" | "bass" | "other";
export const STEMS: { k: Stem; name: string; color: string }[] = [
  { k: "vocals", name: "Vocals", color: "#FF5A9E" },
  { k: "drums", name: "Drums", color: "#FF9A2E" },
  { k: "bass", name: "Bass", color: "#4C8DFF" },
  { k: "other", name: "Melody", color: "#1ED760" },
];
export const TRACK = { title: "Phonk", artist: "The Mountain", album: "Phonk" };

// ---------- audio data ----------
const D = data as { fps: number; env: Record<Stem, number[]>; peaks: Record<Stem, number[]>; peakRate: number };
export const envAt = (k: Stem, songT: number) => {
  const a = D.env[k];
  const i = Math.max(0, Math.min(a.length - 1, Math.round(songT * D.fps)));
  return a[i];
};
const peakAt = (k: Stem | "mix", s: number) => {
  const i = Math.max(0, Math.min(D.peaks.drums.length - 1, Math.round(s * D.peakRate)));
  if (k === "mix") return Math.min(1, (D.peaks.vocals[i] * 0.6 + D.peaks.drums[i] + D.peaks.bass[i] * 0.8 + D.peaks.other[i] * 0.7) / 2.2);
  return D.peaks[k][i];
};
// a mirrored waveform as an SVG path: the window [t0, t1] of song time across width w, half-height h
export const wavePath = (k: Stem | "mix", t0: number, t1: number, w: number, h: number, step = 3, gain = 1) => {
  const n = Math.floor(w / step);
  let top = "", bot = "";
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const v = Math.min(1, peakAt(k, t0 + ((t1 - t0) * i) / n) * gain);
    const y = Math.max(0.6, v * h);
    top += `${i ? "L" : "M"}${x.toFixed(1)} ${(h - y).toFixed(1)} `;
    bot = `L${x.toFixed(1)} ${(h + y).toFixed(1)} ` + bot;
  }
  return `${top}${bot}Z`;
};

// ---------- small pieces ----------
export const Icon: React.FC<{ d: string; size?: number; color?: string }> = ({ d, size = 16, color = C.sub }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", flexShrink: 0 }}>
    <path d={d} fill={color} />
  </svg>
);
const I = {
  home: "M8 1.5 1.5 7v7.5h4.5v-5h4v5h4.5V7z",
  search: "M7 1.5a5.5 5.5 0 1 0 3.4 9.8l3.6 3.6 1-1-3.6-3.6A5.5 5.5 0 0 0 7 1.5zm0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  lib: "M2 1.5h1.5v13H2zm3.5 0H7v13H5.5zm3.2.3 1.4-.5 4.4 12.5-1.4.5z",
  prev: "M3 2h1.5v12H3zm1.8 6 8.2-6v12z",
  next: "M13 2h-1.5v12H13zm-1.8 6L3 2v12z",
  shuffle: "M11.5 2.5 14 5l-2.5 2.5V6H10L5.5 11H2V9.5h3L9.5 4.5h2zm0 6L14 11l-2.5 2.5V12H9.6l-1.4-1.6 1-1.1.9 1.2h1.4zM2 4.5h3.5l1.5 1.7-1 1.1-1-1.3H2z",
  repeat: "M3 5h8V3l3 3-3 3V7H4.5v3H3zm10 6H5v2l-3-3 3-3v2h6.5V6H13z",
  heart: "M8 14.3 1.9 8.4A3.6 3.6 0 0 1 7 3.3l1 1 1-1a3.6 3.6 0 0 1 5.1 5.1z",
  vol: "M1.5 5.5H4L8 2v12l-4-3.5H1.5zM10 4.8a4.5 4.5 0 0 1 0 6.4l-1-1a3 3 0 0 0 0-4.4zm2-2a7.3 7.3 0 0 1 0 10.4l-1-1a5.8 5.8 0 0 0 0-8.4z",
  lyrics: "M2 2h12v9H6l-4 3zm2.5 3v1.5h7V5zm0 3v1.5h5V8z",
  queue: "M2 3h12v1.5H2zm0 4h12v1.5H2zm0 4h7v1.5H2z",
  stems: "M2 3h12v1.6H2zm0 3.5h9v1.6H2zm0 3.5h11v1.6H2zm0 3.5h6V15H2z",
  more: "M3 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z",
};
export const PlayGlyph: React.FC<{ playing: boolean; size: number; color?: string }> = ({ playing, size, color = "#000" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block" }}>
    {playing ? <path d="M4 2.5h2.7v11H4zm5.3 0H12v11H9.3z" fill={color} /> : <path d="M4.5 2.3v11.4L13.5 8z" fill={color} />}
  </svg>
);
// generated album art (original, not anyone's real cover): warm smoke over black, a hard horizon
export const Cover: React.FC<{ size: number; seed?: number; hue?: [string, string, string] }> = ({ size, seed = 0, hue = ["#FF4D2E", "#B3127A", "#140812"] }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.04, overflow: "hidden", position: "relative", flexShrink: 0, background: hue[2] }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${30 + (seed * 37) % 40}% ${60 + (seed * 13) % 25}%, ${hue[0]} 0%, ${hue[1]} 38%, transparent 70%)` }} />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${70 - (seed * 23) % 40}% ${25 + (seed * 17) % 30}%, ${hue[1]}AA 0%, transparent 55%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: `${62 + (seed * 7) % 14}%`, height: 1.5, background: "rgba(255,255,255,0.55)" }} />
  </div>
);
export const Cursor: React.FC<{ x: number; y: number; press?: number; scale?: number }> = ({ x, y, press = 0, scale = 1 }) => (
  <svg width={22 * scale} height={30 * scale} viewBox="0 0 22 30" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.12})`, transformOrigin: "0 0", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))", zIndex: 50 }}>
    <path d="M2 2v22l6-5.5 4 9 3.6-1.6-4-8.8H20z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

// ---------- the desktop window ----------
const ROWS = [
  ["Phonk", "The Mountain", "2:38"],
  ["Midnight Garage", "Lumen Drive", "3:12"],
  ["Low Orbit", "Kaia Blue", "2:51"],
  ["Paper Suns", "North Atlas", "3:40"],
  ["Static Hearts", "The Valets", "2:57"],
  ["Ferro", "Ines Mar", "3:05"],
  ["Coastline", "Harbor Kids", "3:22"],
];
const PLAYLISTS = ["Liked Songs", "Night Drive", "Focus Flow", "Phonk Heat", "Late Night Jazz", "Run 180", "Sunday Slow", "Studio Sessions"];
export type AppState = {
  playing: boolean;
  progress: number; // 0..1 of the track
  wave: number; // 0..1 how much of the player-bar waveform has drawn
  songT: number; // song time, for the live waveform
  dimRest?: number; // 0..1 darken everything except the player bar
  hoverRow?: number;
  playGlow?: number;
};
export const PLAY_BTN = { x: 960, y: 1015 }; // centre of the play button in window space
export const DesktopApp: React.FC<{ s: AppState; children?: React.ReactNode }> = ({ s, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, background: C.bg, fontFamily: FONT, color: C.text, overflow: "hidden" }}>
    {/* top bar */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={I.home} size={22} color={C.text} />
      </div>
      <div style={{ width: 480, height: 48, borderRadius: 24, background: C.card, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", color: C.sub, fontSize: 16 }}>
        <Icon d={I.search} size={20} />
        What do you want to play?
      </div>
    </div>
    {/* library */}
    <div style={{ position: "absolute", left: 8, top: 64, width: 340, bottom: 96, background: C.panel, borderRadius: 8, padding: "18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 16, color: C.sub }}>
        <Icon d={I.lib} size={20} />
        Your Library
      </div>
      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        {["Playlists", "Artists", "Albums"].map((c) => (
          <div key={c} style={{ fontSize: 14, padding: "6px 12px", borderRadius: 16, background: C.card }}>{c}</div>
        ))}
      </div>
      {PLAYLISTS.map((p, i) => (
        <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <Cover size={48} seed={i + 3} hue={i === 3 ? ["#FF4D2E", "#B3127A", "#140812"] : [["#5A3FFF", "#1E8F6A", "#0B0B18"], ["#FFB23F", "#E2453C", "#1A0A06"], ["#3FD0FF", "#3243B8", "#05101A"]][i % 3] as [string, string, string]} />
          <div>
            <div style={{ fontSize: 16, color: i === 3 ? C.green : C.text }}>{p}</div>
            <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>Playlist · Breeders</div>
          </div>
        </div>
      ))}
    </div>
    {/* main: the playlist */}
    <div style={{ position: "absolute", left: 356, top: 64, right: 8, bottom: 96, background: C.panel, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ height: 300, background: "linear-gradient(180deg, #8A2B1E 0%, #3A1410 70%, #121212 100%)", display: "flex", alignItems: "flex-end", gap: 24, padding: "0 28px 26px" }}>
        <Cover size={232} seed={1} />
        <div style={{ paddingBottom: 6 }}>
          <div style={{ fontSize: 14 }}>Playlist</div>
          <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: "-0.03em", margin: "6px 0 12px" }}>Phonk Heat</div>
          <div style={{ fontSize: 14, color: "#E0D0CE" }}>Breeders · 48 songs, 2 hr 31 min</div>
        </div>
      </div>
      <div style={{ padding: "18px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlayGlyph playing={s.playing} size={22} />
          </div>
          <Icon d={I.shuffle} size={30} color={C.sub} />
          <Icon d={I.more} size={30} color={C.sub} />
        </div>
        <div style={{ display: "flex", fontSize: 14, color: C.sub, padding: "0 16px 8px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ width: 40 }}>#</div>
          <div style={{ flex: 1 }}>Title</div>
          <div style={{ width: 300 }}>Album</div>
          <div style={{ width: 80, textAlign: "right" }}>Time</div>
        </div>
        {ROWS.map(([t, a, d], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", fontSize: 16, padding: "8px 16px", borderRadius: 4, background: s.hoverRow === i ? C.hover : "transparent" }}>
            <div style={{ width: 40, color: i === 0 ? C.green : C.sub }}>{i + 1}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
              <Cover size={40} seed={i + 7} />
              <div>
                <div style={{ color: i === 0 ? C.green : C.text }}>{t}</div>
                <div style={{ fontSize: 14, color: C.sub }}>{a}</div>
              </div>
            </div>
            <div style={{ width: 300, fontSize: 14, color: C.sub }}>{t}</div>
            <div style={{ width: 80, textAlign: "right", fontSize: 14, color: C.sub }}>{d}</div>
          </div>
        ))}
      </div>
      {s.dimRest ? <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.6 * s.dimRest})` }} /> : null}
    </div>
    {s.dimRest ? <div style={{ position: "absolute", left: 8, top: 64, width: 340, bottom: 96, borderRadius: 8, background: `rgba(0,0,0,${0.6 * s.dimRest})` }} /> : null}
    {/* now playing bar */}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 96, display: "flex", alignItems: "center", padding: "0 16px" }}>
      <div style={{ width: 420, display: "flex", alignItems: "center", gap: 14 }}>
        <Cover size={56} seed={1} />
        <div>
          <div style={{ fontSize: 15 }}>{TRACK.title}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{TRACK.artist}</div>
        </div>
        <Icon d={I.heart} size={18} color={C.green} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Icon d={I.shuffle} size={18} color={C.green} />
          <Icon d={I.prev} size={18} color={C.sub} />
          <div style={{ width: 36, height: 36, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: s.playGlow ? `0 0 ${40 * s.playGlow}px ${12 * s.playGlow}px rgba(30,215,96,${0.45 * s.playGlow})` : undefined }}>
            <PlayGlyph playing={s.playing} size={16} />
          </div>
          <Icon d={I.next} size={18} color={C.sub} />
          <Icon d={I.repeat} size={18} color={C.sub} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.sub }}>
          <span>{fmt(s.progress * 158)}</span>
          <div style={{ width: 600, height: 28, position: "relative", display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "#4D4D4D", opacity: 1 - s.wave }} />
            <div style={{ position: "absolute", left: 0, width: `${s.progress * 100}%`, height: 4, borderRadius: 2, background: "#fff", opacity: 1 - s.wave }} />
            {s.wave > 0 ? (
              <svg width={600} height={28} style={{ position: "absolute", left: 0, top: 0, clipPath: `inset(0 ${(1 - s.wave) * 100}% 0 0)` }}>
                <path d={wavePath("mix", s.songT - 4, s.songT + 4, 600, 14, 3, 1.25)} fill="#FFFFFF" opacity={0.9} />
              </svg>
            ) : null}
          </div>
          <span>2:38</span>
        </div>
      </div>
      <div style={{ width: 420, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18 }}>
        <Icon d={I.stems} size={18} color={C.green} />
        <Icon d={I.lyrics} size={18} />
        <Icon d={I.queue} size={18} />
        <Icon d={I.vol} size={18} />
        <div style={{ width: 92, height: 4, borderRadius: 2, background: "#4D4D4D" }}>
          <div style={{ width: "70%", height: 4, borderRadius: 2, background: "#fff" }} />
        </div>
      </div>
    </div>
    {children}
  </div>
);
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

// ---------- the context menu on the playing row ----------
export const MENU_ITEMS = ["Add to playlist", "Save to your Liked Songs", "Add to queue", "Go to artist", "Share", "Open in Stems"];
export const ContextMenu: React.FC<{ x: number; y: number; open: number; hover: number; press?: number }> = ({ x, y, open, hover, press = 0 }) =>
  open <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: 300, padding: 4, borderRadius: 6, background: "#282828", boxShadow: "0 16px 32px rgba(0,0,0,0.6)", transformOrigin: "0 0", transform: `scale(${0.92 + 0.08 * open})`, opacity: open, fontFamily: FONT, zIndex: 40 }}>
      {MENU_ITEMS.map((m, i) => {
        const last = i === MENU_ITEMS.length - 1;
        return (
          <React.Fragment key={m}>
            {last ? <div style={{ height: 1, background: "#3E3E3E", margin: "4px 8px" }} /> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40, padding: "0 12px", borderRadius: 3, fontSize: 14, color: "#EAEAEA", background: hover === i ? (last ? `rgba(30,215,96,${0.18 + 0.12 * press})` : "#3E3E3E") : "transparent" }}>
              {last ? <Icon d={I.stems} size={16} color={C.green} /> : <div style={{ width: 16 }} />}
              <span style={{ flex: 1 }}>{m}</span>
              {last ? <span style={{ fontSize: 11, fontWeight: 600, color: "#000", background: C.green, borderRadius: 10, padding: "2px 7px" }}>New</span> : null}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

// ---------- the Stems panel ----------
export type LaneState = Record<Stem, { on: number; solo: number; mute: number }>;
export const LANE_H = 150;
export const STEMS_PANEL = { x: 240, y: 170, w: 1440, h: 740 };
export const StemsPanel: React.FC<{ songT: number; lanes: LaneState; tempo: number; press?: { k: Stem; b: "S" | "M"; v: number } }> = ({ songT, lanes, tempo, press }) => (
  <div style={{ position: "absolute", left: STEMS_PANEL.x, top: STEMS_PANEL.y, width: STEMS_PANEL.w, height: STEMS_PANEL.h, background: "#121212", borderRadius: 12, fontFamily: FONT, color: C.text, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.7)", border: "1px solid #232323" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 28px", borderBottom: "1px solid #232323" }}>
      <Cover size={44} seed={1} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{TRACK.title}</div>
        <div style={{ fontSize: 13, color: C.sub }}>{TRACK.artist} · Stems</div>
      </div>
      <div style={{ fontSize: 13, color: C.sub, marginRight: 12 }}>Speed</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: tempo < 0.99 ? C.green : C.text, width: 56, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{tempo.toFixed(2)}×</div>
    </div>
    {STEMS.map((st, i) => {
      const L = lanes[st.k];
      const e = envAt(st.k, songT);
      const live = L.on * (1 - L.mute);
      return (
        <div key={st.k} style={{ position: "relative", height: LANE_H, display: "flex", alignItems: "center", borderBottom: "1px solid #1E1E1E", opacity: 0.14 + 0.86 * live }}>
          <div style={{ width: 230, padding: "0 28px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: st.color, boxShadow: `0 0 ${12 * e * live}px ${st.color}` }} />
            <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{st.name}</div>
            {(["M", "S"] as const).map((bn) => {
              const active = bn === "S" ? L.solo : L.mute;
              const p = press && press.k === st.k && press.b === bn ? press.v : 0;
              return (
                <div key={bn} style={{ width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: active > 0.5 ? (bn === "S" ? C.green : "#E8E8E8") : "#2A2A2A", color: active > 0.5 ? "#000" : C.sub, transform: `scale(${1 - 0.12 * p})` }}>
                  {bn}
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, height: LANE_H - 24, position: "relative", marginRight: 28 }}>
            <svg width={1150} height={LANE_H - 24} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id={`lg${st.k}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={st.color} stopOpacity={0.25} />
                  <stop offset="0.5" stopColor={st.color} stopOpacity={1} />
                  <stop offset="1" stopColor={st.color} stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <path d={wavePath(st.k, songT - 3, songT + 3, 1150, ((LANE_H - 24) / 2) * (0.15 + 0.85 * (1 - L.mute)), 3, 1.1)} fill={`url(#lg${st.k})`} style={{ filter: `drop-shadow(0 0 ${10 * e * live}px ${st.color})` }} />
              <line x1={575} x2={575} y1={0} y2={LANE_H - 24} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1.5} />
            </svg>
          </div>
        </div>
      );
    })}
  </div>
);
