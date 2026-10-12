import React from "react";
import { AbsoluteFill, interpolate, random, spring, SpringConfig, useCurrentFrame, useVideoConfig } from "remotion";
import { AICursor } from "../pine-launch/kit";
import { BASE_FPS, ease, ramp } from "../utils";
import { SARVAM_LETTERS, SARVAM_VIEWBOX } from "./brand/sarvam";
import { C, FONT } from "./theme";

// Scene-local time in seconds.
export const useS = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const springAt = (t: number, at: number, config: Partial<SpringConfig> = { damping: 15, stiffness: 160, mass: 0.8 }) =>
  t < at ? 0 : spring({ frame: (t - at) * BASE_FPS, fps: BASE_FPS, config });

// Keyframed value in seconds: [[time, value], ...], eased per segment.
export const track = (t: number, keys: [number, number][], easing = ease.inOut) =>
  interpolate(
    t,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

type Segmenter = { segment: (s: string) => Iterable<{ segment: string }> };
const seg: Segmenter = new (Intl as unknown as { Segmenter: new (l: string, o: object) => Segmenter }).Segmenter("en", {
  granularity: "grapheme",
});
// Grapheme clusters, so Indic conjuncts and vowel signs never split apart.
export const graphemes = (s: string) => Array.from(seg.segment(s), (x) => x.segment);

// ---------- backgrounds ----------

// Full green field from the film's opening: lime at the top, fading to cream at the bottom corners.
export const GreenField: React.FC<{ t: number }> = ({ t }) => {
  const d = Math.sin(t * 0.6) * 3;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 45% 40% at ${12 + d}% 104%, ${C.fieldCream} 0%, transparent 70%),
          radial-gradient(ellipse 45% 40% at ${88 - d}% 104%, #EDEAB8 0%, transparent 70%),
          radial-gradient(ellipse 60% 35% at 50% 110%, #D6E8B4 0%, transparent 80%),
          linear-gradient(180deg, ${C.fieldTop} 0%, #97C86C 30%, ${C.fieldMid} 58%, #C9E2A8 82%, #DCE8B8 100%)`,
      }}
    />
  );
};

// White canvas with soft green light pooling at the bottom, slowly drifting.
export const GlowBg: React.FC<{ t: number; amount?: number }> = ({ t, amount = 1 }) => {
  const a = Math.sin(t * 0.5) * 4;
  const b = Math.cos(t * 0.42) * 4;
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <AbsoluteFill
        style={{
          opacity: amount,
          background: `radial-gradient(ellipse 34% 30% at ${18 + a}% 100%, ${C.glow} 0%, transparent 72%),
            radial-gradient(ellipse 34% 30% at ${82 + b}% 100%, ${C.glow} 0%, transparent 72%),
            radial-gradient(ellipse 30% 26% at ${50 - a}% 104%, ${C.glowSoft} 0%, transparent 75%),
            radial-gradient(ellipse 80% 28% at 50% 100%, #EEF7E6 0%, transparent 85%)`,
          filter: "blur(18px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const White: React.FC = () => <AbsoluteFill style={{ backgroundColor: C.white }} />;
export const Stage: React.FC = () => <AbsoluteFill style={{ backgroundColor: C.stage }} />;

// ---------- type ----------

// Letters sharpen in from blur left to right, and leave the same way — the film's signature text move.
export const TextWipe: React.FC<{
  text: string;
  t: number;
  at: number;
  out?: number;
  size: number;
  color?: string;
  font?: string;
  weight?: number;
  per?: number;
  dur?: number;
  letterSpacing?: string;
  style?: React.CSSProperties;
}> = ({ text, t, at, out, size, color = C.ink, font = FONT.display, weight = 400, per = 0.03, dur = 0.42, letterSpacing = "-0.025em", style }) => {
  const g = graphemes(text);
  return (
    <span style={{ fontFamily: font, fontSize: size, fontWeight: weight, color, letterSpacing, lineHeight: 1.15, whiteSpace: "pre", ...style }}>
      {g.map((ch, i) => {
        const pin = ramp(t, [at + i * per, at + i * per + dur], [0, 1], ease.out);
        const pout = out === undefined ? 0 : ramp(t, [out + i * per * 0.7, out + i * per * 0.7 + dur * 0.8], [0, 1], ease.in);
        const p = pin * (1 - pout);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              filter: p < 0.99 ? `blur(${(1 - p) * size * 0.09}px)` : undefined,
              transform: `translateX(${(1 - pin) * size * 0.08 - pout * size * 0.06}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

export const Center: React.FC<{ y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y = 540, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: "translateY(-50%)", display: "flex", justifyContent: "center", alignItems: "center", ...style }}>
    {children}
  </div>
);

// Caption above floating UI windows; the bottom band is reserved for the Breeders credit.
export const TopCaption: React.FC<{ text: string; t: number; at: number; out?: number }> = ({ text, t, at, out }) => (
  <Center y={92}>
    <TextWipe text={text} t={t} at={at} out={out} size={50} per={0.018} />
  </Center>
);

// Vertical word list: the active word is dark, neighbours fade to grey above and below.
export const Roller: React.FC<{
  items: string[];
  pos: number;
  size: number;
  font?: string;
  align?: "left" | "center" | "right";
  gap?: number;
  visible?: number;
}> = ({ items, pos, size, font = FONT.display, align = "left", gap = 1.25, visible = 2.2 }) => (
  <div style={{ position: "relative", height: size * gap, width: "100%" }}>
    {items.map((w, i) => {
      const d = i - pos;
      if (Math.abs(d) > visible + 0.5) return null;
      const o = Math.max(0, 1 - Math.abs(d) * 0.62);
      const grey = Math.min(1, Math.abs(d));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: d * size * gap,
            left: 0,
            right: 0,
            textAlign: align,
            fontFamily: font,
            fontSize: size * (1 - Math.min(0.18, Math.abs(d) * 0.12)),
            lineHeight: `${size * gap}px`,
            letterSpacing: "-0.02em",
            color: `rgba(15,15,16,${1 - grey * 0.62})`,
            opacity: o,
            filter: Math.abs(d) > 0.6 ? `blur(${(Math.abs(d) - 0.6) * 1.6}px)` : undefined,
            transformOrigin: align === "left" ? "0% 50%" : align === "right" ? "100% 50%" : "50% 50%",
          }}
        >
          {w}
        </div>
      );
    })}
  </div>
);

// ---------- brand ----------

// The official wordmark, typed in one letter at a time like the film's closing frames.
export const SarvamWordmark: React.FC<{ height: number; color?: string; t: number; at: number; out?: number; per?: number }> = ({
  height,
  color = C.ink,
  t,
  at,
  out,
  per = 0.07,
}) => {
  const w = (height * SARVAM_VIEWBOX.w) / SARVAM_VIEWBOX.h;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${SARVAM_VIEWBOX.w} ${SARVAM_VIEWBOX.h}`} style={{ overflow: "visible" }}>
      {SARVAM_LETTERS.map((d, i) => {
        const pin = ramp(t, [at + i * per, at + i * per + 0.28], [0, 1], ease.out);
        const pout = out === undefined ? 0 : ramp(t, [out + i * 0.04, out + i * 0.04 + 0.25], [0, 1], ease.in);
        const p = pin * (1 - pout);
        return <path key={i} d={d} fill={color} opacity={p} transform={`translate(0 ${(1 - pin) * 6})`} style={{ filter: p < 0.99 ? `blur(${(1 - p) * 1.4}px)` : undefined }} />;
      })}
    </svg>
  );
};

// ---------- visuals ----------

// Rounded gradient bars (indigo → sky) from the film's speech moments. `tilt` 1 = lying diagonal like its intro.
export const WaveBars: React.FC<{ t: number; count?: number; barW?: number; gap?: number; height: number; tilt?: number; energy?: number; seed?: string }> = ({
  t,
  count = 11,
  barW = 18,
  gap = 22,
  height,
  tilt = 0,
  energy = 1,
  seed = "w",
}) => (
  <div style={{ display: "flex", alignItems: "center", gap, transform: `skewX(${-tilt * 32}deg) rotate(${tilt * 22}deg)` }}>
    {Array.from({ length: count }, (_, i) => {
      const base = 0.55 + 0.35 * random(`${seed}${i}`);
      const wob = Math.sin(t * (5.5 + random(`${seed}f${i}`) * 4) + i * 1.3) * 0.22 * energy;
      const h = height * Math.max(0.28, Math.min(1, base + wob)) * (1 - tilt * 0.1) + tilt * height * 0.4;
      const off = Math.sin(t * 3 + i) * 10 * energy;
      return (
        <div
          key={i}
          style={{
            width: barW,
            height: h,
            borderRadius: barW / 2,
            transform: `translateY(${off}px)`,
            background: `linear-gradient(180deg, ${C.waveTop} 0%, ${C.waveMid} 30%, ${C.waveLow} 70%, ${C.waveEnd} 100%)`,
            flexShrink: 0,
          }}
        />
      );
    })}
  </div>
);

// Pixel-mosaic art like Content Studio's avatars and illustrations. Pattern chars index into `palette`; '.' is empty.
export const PixelArt: React.FC<{
  pattern: string[];
  palette: Record<string, string>;
  cell: number;
  t?: number;
  at?: number;
  spread?: number;
  seed?: string;
  gapPx?: number;
}> = ({ pattern, palette, cell, t = 99, at = 0, spread = 0.5, seed = "px", gapPx = 0 }) => {
  const rows = pattern.length;
  const cols = pattern[0].length;
  return (
    <svg width={cols * cell} height={rows * cell} viewBox={`0 0 ${cols} ${rows}`} shapeRendering="crispEdges" style={{ display: "block" }}>
      {pattern.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          if (ch === "." || !palette[ch]) return null;
          const r = random(`${seed}${x}_${y}`);
          const p = ramp(t, [at + r * spread, at + r * spread + 0.18], [0, 1], ease.out);
          if (p <= 0) return null;
          const g = gapPx / cell;
          return <rect key={`${x}_${y}`} x={x + g / 2} y={y + g / 2} width={1 - g} height={1 - g} fill={palette[ch]} opacity={p * (0.82 + 0.18 * random(`${seed}o${x}${y}`))} />;
        }),
      )}
    </svg>
  );
};

// Voice avatar: a pixel rosette with a play notch, tinted per voice.
const ROSETTE = [
  "...aaaa...",
  "..abbbba..",
  ".abbccbba.",
  "aabcwwcbaa",
  "abccwwwcba",
  "abccwwwcba",
  "aabcwwcbaa",
  ".abbccbba.",
  "..abbbba..",
  "...aaaa...",
];
export const VoiceAvatar: React.FC<{ hue: [string, string, string]; size: number; t?: number; at?: number; seed?: string }> = ({ hue, size, t, at, seed = "va" }) => (
  <PixelArt pattern={ROSETTE} palette={{ a: hue[0], b: hue[1], c: hue[2], w: "#FFFFFF" }} cell={size / 10} t={t} at={at} seed={seed} spread={0.3} />
);

export const VOICE_HUES: Record<string, [string, string, string]> = {
  indigo: ["#8F8BE8", "#4B45C8", "#2F2A9E"],
  green: ["#8CC77A", "#3E8E3A", "#256B26"],
  crimson: ["#E08AA6", "#B8325E", "#8C1C44"],
  mustard: ["#EFCB6B", "#C99A1E", "#9A7210"],
  orange: ["#F7A77A", "#E8672C", "#B84A17"],
};

// App tiles from the film's icon carousel.
export type IconKind = "tts" | "dub" | "library" | "clone" | "stt";
export const APP_ICONS: Record<IconKind, { bg: string; fg: string; label: string }> = {
  tts: { bg: "linear-gradient(135deg, #C8526C 0%, #D98A9A 100%)", fg: "#FFFFFF", label: "Text to Speech" },
  dub: { bg: "linear-gradient(135deg, #E0704A 0%, #E88E68 100%)", fg: "#FFFFFF", label: "Dubbing" },
  library: { bg: "linear-gradient(135deg, #5B55D6 0%, #8A86EA 100%)", fg: "#FFFFFF", label: "Voice Library" },
  clone: { bg: "linear-gradient(135deg, #E2D2B2 0%, #F1E9DA 100%)", fg: "#FFFFFF", label: "Voice Cloning" },
  stt: { bg: "linear-gradient(135deg, #6FAE45 0%, #A2CF7F 100%)", fg: "#FFFFFF", label: "Speech to Text" },
};

const Glyph: React.FC<{ kind: IconKind; color: string }> = ({ kind, color }) => {
  const s = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "tts":
      return (
        <g>
          <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill={color} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M15.5 9a4.2 4.2 0 0 1 0 6" {...s} />
          <path d="M18.3 6.5a8 8 0 0 1 0 11" {...s} />
        </g>
      );
    case "dub":
      return (
        <g>
          <path d="M3.5 5h9a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H8l-3 2.5V13H3.5A1.5 1.5 0 0 1 2 11.5v-5A1.5 1.5 0 0 1 3.5 5z" {...s} />
          <path d="M5.5 8.2h5M8 7v1.2c0 1.6-1 2.8-2.5 3.3M7.4 9.6c.7.9 1.7 1.5 2.8 1.8" {...s} strokeWidth={1.4} />
          <path d="M16 9.5h4.5A1.5 1.5 0 0 1 22 11v5a1.5 1.5 0 0 1-1.5 1.5H19V20l-3-2.5h-3.5A1.5 1.5 0 0 1 11 16v-1" {...s} />
          <path d="M15 16.2l1.8-4.6 1.8 4.6M15.6 14.8h2.4" {...s} strokeWidth={1.4} />
        </g>
      );
    case "library":
      return (
        <g>
          <rect x="4" y="3.5" width="16" height="17" rx="2.5" {...s} />
          <path d="M10 9.2v5.6l4.6-2.8z" fill={color} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
        </g>
      );
    case "clone":
      return (
        <g>
          <rect x="9" y="3" width="6" height="11" rx="3" fill={color} />
          <path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6" {...s} />
        </g>
      );
    case "stt":
      return (
        <g>
          <rect x="3" y="5" width="18" height="14" rx="3" {...s} />
          <path d="M10.2 10.2a2.2 2.2 0 1 0 0 3.6M16.6 10.2a2.2 2.2 0 1 0 0 3.6" {...s} />
        </g>
      );
  }
};

export const AppIcon: React.FC<{ kind: IconKind; size: number; style?: React.CSSProperties }> = ({ kind, size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: APP_ICONS[kind].bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 ${size * 0.08}px ${size * 0.22}px rgba(40,30,20,0.14), inset 0 1px 0 rgba(255,255,255,0.35)`,
      flexShrink: 0,
      ...style,
    }}
  >
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24">
      <Glyph kind={kind} color={APP_ICONS[kind].fg} />
    </svg>
  </div>
);

// ---------- cursor ----------

// The Pine Pro AI cursor shape in black (graphite → ink gradient, light outline), without its glow.
const BLACK_TINT: [string, string, string] = ["#55555C", "#0A0A0B", "0,0,0"];
// `tag` adds a Figma-style name pill that trails the pointer.
export const Cursor: React.FC<{ x: number; y: number; press?: number; ripple?: number; size?: number; opacity?: number; tag?: string; tagColor?: string }> = ({ x, y, press = 0, size = 30, opacity = 1, tag, tagColor = "#D2232A" }) => (
  <>
    <AICursor x={x} y={y} size={size * 1.15} press={press} opacity={opacity} glow={false} tint={BLACK_TINT} outline="#FFFFFF" />
    {tag ? (
      <div style={{ position: "absolute", left: x + size * 0.85, top: y + size * 1.05, padding: `${size * 0.16}px ${size * 0.4}px`, borderRadius: size * 0.5, background: tagColor, color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: size * 0.56, letterSpacing: "-0.01em", whiteSpace: "nowrap", boxShadow: "0 6px 16px rgba(0,0,0,0.18)", border: "1.5px solid rgba(255,255,255,0.9)", opacity, pointerEvents: "none" }}>
        {tag}
      </div>
    ) : null}
  </>
);

// Cursor path through [time, x, y] waypoints; clicks are [time] list → press + ripple.
export const cursorAt = (t: number, path: [number, number, number][], clicks: number[] = []) => {
  const x = track(t, path.map((p) => [p[0], p[1]] as [number, number]));
  const y = track(t, path.map((p) => [p[0], p[2]] as [number, number]));
  let press = 0, ripple = 0;
  for (const c of clicks) {
    if (t >= c - 0.08 && t < c + 0.14) press = Math.max(press, 1 - Math.abs(t - c) / 0.14);
    if (t >= c && t < c + 0.45) ripple = (t - c) / 0.45;
  }
  return { x, y, press, ripple };
};
