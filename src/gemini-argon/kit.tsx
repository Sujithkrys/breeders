// Gemini's visual language, measured from Google's "Introducing Gemini Omni" film: pure black, Google Sans, white
// headlines with one word in Gemini blue (a left→right gradient #4169E7 → #649CFB), lines revealed left to right
// behind a soft edge, a glass prompt box with a glowing blue rim, and the four-colour spark.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { staticFile } from "remotion";
import { ease, ramp } from "../utils";

export const GS = "'Google Sans', 'Inter Tight', Inter, sans-serif";
export const GCODE = "'Google Sans Code', 'JetBrains Mono', Consolas, monospace";
let loaded = false;
export const loadGoogleSans = () => {
  if (loaded) return;
  loaded = true;
  for (const w of ["400", "500", "700"]) loadFont({ family: "Google Sans", weight: w, url: staticFile(`fonts/gsans/GoogleSans-${w}.ttf`) });
  for (const w of ["400", "500"]) loadFont({ family: "Google Sans Code", weight: w, url: staticFile(`fonts/gsans/GoogleSansCode-${w}.ttf`) });
};

export const C = {
  bg: "#000000",
  white: "#FFFFFF",
  grey: "#9AA0A6",
  dim: "#5F6368",
  blueA: "#4169E7",
  blueB: "#649CFB",
  red: "#F2564B",
  green: "#3DDC97",
  spark: { top: "#D7638C", right: "#3084FC", bottom: "#27B47D", left: "#CDCE28" },
};
export const ACCENT: React.CSSProperties = { background: `linear-gradient(90deg, ${C.blueA}, ${C.blueB})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

// ---------- headline: centred lines, each revealed left→right behind a soft edge; `*word*` marks the blue accent ----------
const Words: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith("*") ? (
        <span key={i} style={ACCENT}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);
export const Head: React.FC<{ s: number; at: number; out?: number; lines: string[]; size?: number; y?: number; align?: "center" | "left"; x?: number; stagger?: number; color?: string }> = ({
  s,
  at,
  out = Infinity,
  lines,
  size = 96,
  y = 540,
  align = "center",
  x = 140,
  stagger = 0.14,
  color = C.white,
}) => {
  if (s < at || s > out + 0.4) return null;
  const gone = Number.isFinite(out) ? ramp(s, [out, out + 0.3], [0, 1], ease.in) : 0;
  const lh = size * 1.08;
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? 0 : x,
        right: align === "center" ? 0 : undefined,
        top: y - (lines.length * lh) / 2,
        textAlign: align,
        fontFamily: GS,
        fontWeight: 500,
        fontSize: size,
        lineHeight: `${lh}px`,
        letterSpacing: "-0.02em",
        color,
        opacity: 1 - gone,
        filter: gone > 0.02 ? `blur(${gone * 10}px)` : undefined,
        transform: `translateY(${-gone * 14}px)`,
      }}
    >
      {lines.map((l, i) => {
        const p = ramp(s, [at + i * stagger, at + i * stagger + 0.55], [0, 1], ease.out);
        // the soft edge sweeps from left to right across the line
        const edge = -20 + p * 140;
        const mask = `linear-gradient(90deg, #000 ${edge - 20}%, transparent ${edge}%)`;
        return (
          <div key={i} style={{ WebkitMaskImage: mask, maskImage: mask, transform: `translateX(${(1 - p) * -18}px)`, whiteSpace: "nowrap" }}>
            <Words text={l} />
          </div>
        );
      })}
    </div>
  );
};

// ---------- the spark: four concave sides; the colour is a conic sweep (pink top, blue right, green bottom, yellow left) ----------
export const sparkPath = (r: number, cx = r, cy = r, k = 0.1) =>
  `M ${cx} ${cy - r} Q ${cx + r * k} ${cy - r * k} ${cx + r} ${cy} Q ${cx + r * k} ${cy + r * k} ${cx} ${cy + r} Q ${cx - r * k} ${cy + r * k} ${cx - r} ${cy} Q ${cx - r * k} ${cy - r * k} ${cx} ${cy - r} Z`;
export const Spark: React.FC<{ size: number; glow?: number; style?: React.CSSProperties; mono?: string }> = ({ size, glow = 0, style, mono }) => {
  const r = size / 2;
  const bg = mono ?? `conic-gradient(from 0deg at 50% 50%, ${C.spark.top} 0deg, ${C.spark.right} 90deg, #3996E0 135deg, ${C.spark.bottom} 180deg, ${C.spark.left} 270deg, ${C.spark.top} 360deg)`;
  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      {glow > 0 ? <div style={{ position: "absolute", inset: -size * 0.6, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(70,140,255,${0.45 * glow}), rgba(70,140,255,0))` }} /> : null}
      <div style={{ position: "absolute", inset: 0, background: bg, clipPath: `path('${sparkPath(r)}')` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(closest-side, rgba(70,150,235,0.55), rgba(70,150,235,0) 70%)", clipPath: `path('${sparkPath(r)}')` }} />
    </div>
  );
};

// ---------- glass panel with a glowing blue rim (the Gemini prompt box material) ----------
export const glass = (glow = 1): React.CSSProperties => ({
  background: "linear-gradient(180deg, rgba(22,34,66,0.72) 0%, rgba(6,10,24,0.92) 100%)",
  border: "1.5px solid rgba(120,175,255,0.75)",
  boxShadow: `0 0 ${46 * glow}px rgba(52,128,255,${0.55 * glow}), inset 0 0 ${30 * glow}px rgba(70,140,255,${0.28 * glow}), inset 0 1px 0 rgba(255,255,255,0.25)`,
  borderRadius: 30,
});

// small rounded chip inside glass UI
export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 40, padding: "0 16px", borderRadius: 20, border: "1px solid rgba(160,195,255,0.45)", background: "rgba(255,255,255,0.06)", fontFamily: GS, fontSize: 20, color: "#E8EAED", ...style }}>
    {children}
  </div>
);

// a shimmering line of text (agent step in progress): a light band sweeps across while it works
export const Shimmer: React.FC<{ s: number; text: string; active: boolean; size?: number; color?: string }> = ({ s, text, active, size = 30, color = "#E8EAED" }) => {
  const x = ((s * 0.9) % 1) * 260 - 80;
  return (
    <span
      style={
        active
          ? { background: `linear-gradient(90deg, ${color}66 ${x - 30}%, #FFFFFF ${x}%, ${color}66 ${x + 30}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontSize: size }
          : { color, fontSize: size }
      }
    >
      {text}
    </span>
  );
};
