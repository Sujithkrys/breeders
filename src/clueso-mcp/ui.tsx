import React from "react";
import { AbsoluteFill, random, Sequence, useVideoConfig } from "remotion";
import { ease, ramp, toFrames, u, useT } from "../utils";
import { C, FONT, GRADIENT } from "./theme";

// <Sequence> with timings in 30fps units.
export const Seq: React.FC<{ from: number; dur?: number; name?: string; children: React.ReactNode }> = ({ from, dur, name, children }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={toFrames(from, fps)} durationInFrames={dur === undefined ? undefined : toFrames(dur, fps)} name={name} layout="none">
      {children}
    </Sequence>
  );
};

export const Background: React.FC<{
  glow?: string;
  glowX?: number;
  glowY?: number;
  children?: React.ReactNode;
}> = ({ glow = C.magenta, glowX = 50, glowY = 38, children }) => {
  const t = useT();
  const dx = Math.sin(t / 90) * 4;
  const dy = Math.cos(t / 110) * 3;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at ${glowX + dx}% ${glowY + dy}%, ${glow}1C 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 50% 40%, ${C.bgGlow} 0%, ${C.bg} 75%)`,
        }}
      />
      {children}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const gradientText: React.CSSProperties = {
  backgroundImage: GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const bare = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();

// Words rise out of a mask while sharpening from blur.
export const Reveal: React.FC<{
  text: string;
  start?: number;
  size: number;
  weight?: number;
  family?: string;
  color?: string;
  stagger?: number;
  accent?: string[];
  lineHeight?: number;
  letterSpacing?: string;
  duration?: number;
  accentStyle?: React.CSSProperties;
}> = ({
  text,
  start = 0,
  size,
  weight = 600,
  family = FONT.display,
  color = C.text,
  stagger = 2.5,
  accent = [],
  lineHeight = 1.14,
  letterSpacing = "-0.035em",
  duration = 18,
  accentStyle = gradientText,
}) => {
  const t = useT();
  const accents = accent.map(bare);
  const words = text.split(" ");
  return (
    <span style={{ fontFamily: family, fontSize: size, fontWeight: weight, lineHeight, letterSpacing, color }}>
      {words.map((w, i) => {
        const p = ramp(t, [start + i * stagger, start + i * stagger + duration], [0, 1], ease.out);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              paddingBottom: size * 0.12,
              marginBottom: -size * 0.12,
            }}
          >
            <span
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                transform: `translateY(${(1 - p) * 105}%)`,
                filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
                opacity: Math.min(1, p * 1.4),
                ...(accents.includes(bare(w)) ? accentStyle : null),
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const Caption: React.FC<{ y: number; maxWidth?: number; children: React.ReactNode }> = ({
  y,
  maxWidth = 1500,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      transform: "translateY(-50%)",
      display: "flex",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth }}>{children}</div>
  </div>
);

// Darkens the lower part of a full-bleed shot so captions stay legible.
export const Scrim: React.FC<{ from?: number }> = ({ from = 55 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, transparent ${from}%, rgba(11,11,14,0.86) ${from + 22}%, ${C.bg} 100%)`,
    }}
  />
);

export type CameraProps = {
  x?: number;
  y?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  perspective?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

// Rotation lives on an outer layer at 1× while zoom is a 2D transform inside it. Chrome rasterizes
// 3D-transformed layers at their own scale, so zooming the 3D layer itself would upscale a blurry texture.
export const Camera: React.FC<CameraProps> = ({
  x = 0,
  y = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  scale = 1,
  perspective = 2200,
  children,
  style,
}) => {
  const rotated = Math.abs(rx) + Math.abs(ry) + Math.abs(rz) > 0.01;
  return (
    <AbsoluteFill style={{ perspective, perspectiveOrigin: "50% 45%" }}>
      <AbsoluteFill style={{ transform: rotated ? `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` : undefined }}>
        <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, ...style }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const Bar: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({
  w,
  h = u(1.25),
  color = C.surface4,
  style,
}) => <div style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: color, flexShrink: 0, ...style }} />;

// Window surface with a faint top highlight, like light catching an edge.
export const Panel: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; radius?: number }> = ({
  style,
  children,
  radius = u(2.5),
}) => (
  <div
    style={{
      position: "absolute",
      backgroundColor: C.surface,
      border: `1px solid ${C.line}`,
      borderRadius: radius,
      overflow: "hidden",
      boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 40px 100px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: u(0.75),
      padding: `${u(0.5)}px ${u(1.25)}px`,
      borderRadius: u(1),
      backgroundColor: C.surface3,
      border: `1px solid ${C.line}`,
      fontFamily: FONT.sans,
      fontWeight: 500,
      fontSize: 13,
      color: C.text2,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Dot: React.FC<{ color: string; size?: number; glow?: boolean }> = ({ color, size = 8, glow }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      flexShrink: 0,
      boxShadow: glow ? `0 0 ${size}px ${color}` : undefined,
    }}
  />
);

export const Spinner: React.FC<{ size: number; t: number; color?: string; track?: string }> = ({
  size,
  t,
  color = C.text,
  track = C.surface4,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${t * 13}deg)`, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={track} strokeWidth="2.5" />
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Avatar: React.FC<{ name: string; size?: number; hue?: number }> = ({ name, size = 28, hue }) => {
  const h = hue ?? Math.floor(random(name) * 360);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        flexShrink: 0,
        background: `linear-gradient(135deg, hsl(${h} 55% 58%), hsl(${(h + 40) % 360} 55% 42%))`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.sans,
        fontWeight: 600,
        fontSize: size * 0.4,
        color: "#fff",
      }}
    >
      {initials}
    </div>
  );
};

export const Waveform: React.FC<{
  width: number;
  height: number;
  seed: string;
  progress?: number;
  color?: string;
  gap?: number;
  barW?: number;
}> = ({ width, height, seed, progress = 1, color = C.muted, gap = 2, barW = 3 }) => {
  const n = Math.floor(width / (barW + gap));
  const shown = Math.floor(n * progress);
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", gap }}>
      {Array.from({ length: shown }, (_, i) => {
        const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.21 + random(seed) * 6));
        const h = Math.max(2, height * env * (0.3 + 0.7 * random(`${seed}${i}`)));
        return <div key={i} style={{ width: barW, height: h, borderRadius: barW / 2, backgroundColor: color, flexShrink: 0 }} />;
      })}
    </div>
  );
};

export const Toggle: React.FC<{ on: number; size?: number }> = ({ on, size = 1 }) => (
  <div
    style={{
      width: 40 * size,
      height: 24 * size,
      borderRadius: 12 * size,
      backgroundColor: on > 0.5 ? C.ok : C.surface4,
      position: "relative",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 3 * size,
        left: (3 + 16 * on) * size,
        width: 18 * size,
        height: 18 * size,
        borderRadius: 9 * size,
        backgroundColor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    />
  </div>
);

// macOS-style pointer. `press` 0..1 compresses it; `ripple` 0..1 draws a click ring.
export const Cursor: React.FC<{ x: number; y: number; press?: number; ripple?: number; size?: number }> = ({
  x,
  y,
  press = 0,
  ripple = 0,
  size = 30,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    {ripple > 0 && ripple < 1 ? (
      <div
        style={{
          position: "absolute",
          left: -40 * ripple,
          top: -40 * ripple,
          width: 80 * ripple,
          height: 80 * ripple,
          borderRadius: "50%",
          border: `2px solid rgba(255,255,255,${0.7 * (1 - ripple)})`,
          backgroundColor: `rgba(255,255,255,${0.12 * (1 - ripple)})`,
        }}
      />
    ) : null}
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: -3,
        top: -2,
        transform: `scale(${1 - press * 0.15})`,
        transformOrigin: "3px 2px",
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
      }}
    >
      <path d="M4 2.5l15.5 11.2-6.6 1.3 3.9 6.4-2.6 1.5-3.8-6.5L5.3 21z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  </div>
);

// Horizontal-only motion blur for whip-pans; apply via `filter: url(#id)`.
export const HBlurFilter: React.FC<{ id: string; amount: number }> = ({ id, amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-20%" y="0" width="140%" height="100%">
      <feGaussianBlur stdDeviation={`${amount} 0`} />
    </filter>
  </svg>
);

export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontFamily: FONT.sans,
      fontSize: 12,
      color: C.muted,
      padding: "1px 6px",
      borderRadius: 5,
      border: `1px solid ${C.line}`,
      backgroundColor: C.surface2,
    }}
  >
    {children}
  </span>
);
