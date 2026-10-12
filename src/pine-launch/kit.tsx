import React, { useId } from "react";
import { AbsoluteFill, random } from "remotion";
import { Seq } from "../clueso-mcp/ui";
import { Icon } from "../clueso-mcp/icons";
import { ease, kf, ramp, useT } from "../utils";
import { GRAY, INK, LINE, SANS } from "./theme";

const TAU = Math.PI * 2;

// A shot is a hard cut: it mounts at span[0] and its render gets local time.
export const Cut: React.FC<{
  span: readonly [number, number];
  name: string;
  render: (t: number) => React.ReactNode;
}> = ({ span, name, render }) => (
  <Seq from={span[0]} dur={span[1] - span[0]} name={name}>
    <Local render={render} />
  </Seq>
);
const Local: React.FC<{ render: (t: number) => React.ReactNode }> = ({
  render,
}) => <>{render(useT())}</>;

// ---------- deep-space background ----------
type Star = {
  x: number;
  y: number;
  r: number;
  c: number;
  ph: number;
  sp: number;
  flare: boolean;
};
const STARS: Star[] = (() => {
  const out: Star[] = [];
  for (let i = 0; i < 2600; i++) {
    const band = random(`b${i}`) < 0.72;
    let x: number, y: number;
    if (band) {
      const u = random(`u${i}`);
      const g =
        (random(`g1${i}`) + random(`g2${i}`) + random(`g3${i}`) - 1.5) *
        (random(`gw${i}`) < 0.5 ? 0.35 : 0.9);
      x = -150 + u * 2700;
      y = 1120 - u * 1050 + g * 280;
    } else {
      x = random(`x${i}`) * 2500 - 100;
      y = random(`y${i}`) * 1280 - 100;
    }
    const m = random(`m${i}`);
    const r = m < 0.9 ? 0.4 + m * 0.6 : m < 0.985 ? 1.0 + (m - 0.9) * 9 : 2.1;
    const c = random(`c${i}`);
    out.push({
      x,
      y,
      r,
      c,
      ph: random(`p${i}`) * TAU,
      sp: 0.03 + random(`s${i}`) * 0.09,
      flare: m > 0.993,
    });
  }
  return out;
})();

// Continuous across every dark shot: pass the shot's absolute start so drift never jumps at a cut.
// `tone` recolors the same sky: "night" (neutral blue-black) or "clueso" (charcoal with a magenta galaxy band).
const TONES = {
  night: {
    bg: "linear-gradient(160deg, #020409 0%, #04080E 38%, #081520 70%, #0D2130 100%)",
    band: "rgba(90,120,150,0.2)",
    p1: "rgba(150,170,190,0.12)",
    p2: "rgba(170,150,140,0.1)",
    p3: "rgba(140,165,200,0.12)",
    warm: "#FFD9AE",
    cool: "#C3D9FF",
  },
  clueso: {
    bg: "linear-gradient(160deg, #040306 0%, #08060B 38%, #120914 72%, #1A0B1C 100%)",
    band: "rgba(200,70,180,0.17)",
    p1: "rgba(248,129,229,0.12)",
    p2: "rgba(170,120,200,0.1)",
    p3: "rgba(201,59,183,0.14)",
    warm: "#FFC9F4",
    cool: "#E2CCFF",
  },
};
export const Space: React.FC<{
  t0: number;
  black?: number;
  tone?: keyof typeof TONES;
}> = ({ t0, black = 0, tone = "night" }) => {
  const T = useT() + t0;
  const k = TONES[tone];
  return (
    <AbsoluteFill style={{ background: k.bg }}>
      <AbsoluteFill
        style={{
          transform: `rotate(-21deg) scale(1.5) translateX(${-T * 0.1}px)`,
          translate: "0px -66px"
        }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 60% 16% at 50% 52%, ${k.band}, transparent)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 18% 7% at 34% 50%, ${k.p1}, transparent), radial-gradient(ellipse 22% 6% at 68% 55%, ${k.p2}, transparent), radial-gradient(ellipse 14% 5% at 55% 49%, ${k.p3}, transparent)`,
          }}
        />
      </AbsoluteFill>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <g
          transform={`translate(${(-T * 0.22).toFixed(2)} ${(T * 0.07).toFixed(2)})`}
        >
          {STARS.map((s, i) => {
            const tw = s.flare ? 1 : 0.5 + 0.5 * Math.sin(T * s.sp + s.ph);
            const col = s.c < 0.12 ? k.warm : s.c < 0.22 ? k.cool : "#FFFFFF";
            return (
              <g key={i} opacity={(0.35 + 0.65 * tw) * (s.r > 1 ? 1 : 0.8)}>
                <circle cx={s.x} cy={s.y} r={s.r} fill={col} />
                {s.flare && (
                  <>
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={s.r * 4}
                      fill={col}
                      opacity={0.12}
                    />
                    <ellipse
                      cx={s.x}
                      cy={s.y}
                      rx={s.r * 7}
                      ry={0.5}
                      fill="#fff"
                      opacity={0.5}
                    />
                    <ellipse
                      cx={s.x}
                      cy={s.y}
                      rx={0.5}
                      ry={s.r * 7}
                      fill="#fff"
                      opacity={0.5}
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {black > 0 && (
        <AbsoluteFill style={{ background: "#000", opacity: black }} />
      )}
    </AbsoluteFill>
  );
};

// ---------- type ----------
// Words appear one by one; hidden words still hold their space, so the visible text is anchored where the finished line sits centered.
export const Words: React.FC<{
  text: string;
  t: number;
  at: number;
  step?: number;
  size?: number;
  weight?: number;
  color?: string;
  y?: number;
  dissolveFrom?: number;
}> = ({
  text,
  t,
  at,
  step = 5,
  size = 66,
  weight = 600,
  color = "#FFFFFF",
  y = 540,
  dissolveFrom,
}) => {
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y - size * 0.62,
        display: "flex",
        justifyContent: "center",
        fontFamily: SANS,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: "-0.018em",
        whiteSpace: "pre",
      }}
    >
      {words.map((w, i) => {
        const a = at + i * step;
        if (dissolveFrom !== undefined && i >= dissolveFrom) {
          return (
            <span key={i}>
              {i ? " " : ""}
              <Dissolve text={w} t={t} at={a} />
            </span>
          );
        }
        return (
          <span
            key={i}
            style={{ opacity: ramp(t, [a, a + 1.5], [0, 1], ease.linear) }}
          >
            {i ? " " : ""}
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Particle dissolve: per-letter fractal-noise displacement collapsing to zero, sweeping left to right.
export const Dissolve: React.FC<{
  text: string;
  t: number;
  at: number;
  dur?: number;
  stagger?: number;
}> = ({ text, t, at, dur = 22, stagger = 2.2 }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const letters = text.split("");
  const ps = letters.map((_, i) =>
    ramp(t, [at + i * stagger, at + i * stagger + dur], [0, 1], ease.out),
  );
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          {letters.map((_, i) => (
            <filter
              key={i}
              id={`${id}d${i}`}
              x="-150%"
              y="-150%"
              width="400%"
              height="400%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves={1}
                seed={(Math.floor(t * 2) + i * 7) % 97}
              />
              <feDisplacementMap
                in="SourceGraphic"
                scale={(1 - ps[i]) * 90}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>
      {letters.map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: Math.min(1, ps[i] * 2.2),
            filter: ps[i] < 0.995 ? `url(#${id}d${i})` : undefined,
          }}
        >
          {ch}
        </span>
      ))}
    </>
  );
};

// Gray "thinking" text with a light band sweeping through it.
export const Shimmer: React.FC<{
  t: number;
  children: React.ReactNode;
  base?: string;
  hi?: string;
  period?: number;
  style?: React.CSSProperties;
}> = ({
  t,
  children,
  base = "#A3A3A3",
  hi = "#E4E4E4",
  period = 36,
  style,
}) => {
  const p = ((t % period) / period) * 160 - 30;
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(90deg, ${base} 0%, ${base} ${p - 18}%, ${hi} ${p}%, ${base} ${p + 18}%, ${base} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// ---------- cursors ----------
export const AICursor: React.FC<{
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  press?: number;
  tint?: [string, string, string];
  glow?: boolean;
  outline?: string;
}> = ({
  x,
  y,
  size = 40,
  opacity = 1,
  press = 0,
  tint = ["#E3C9FF", "#A46BFF", "178,120,255"],
  glow = true,
  outline = "#F4E9FF",
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {glow ? (
        <div
          style={{
            position: "absolute",
            left: -size * 1.1,
            top: -size * 1.1,
            width: size * 2.6,
            height: size * 2.6,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${tint[2]},0.55) 0%, rgba(${tint[2]},0.18) 40%, transparent 70%)`,
          }}
        />
      ) : null}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: -2,
          top: -2,
          transform: `scale(${1 - press * 0.15})`,
          transformOrigin: "2px 2px",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={`a${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={tint[0]} />
            <stop offset="1" stopColor={tint[1]} />
          </linearGradient>
        </defs>
        <path
          d="M2.5 2.5 L21 9.2 L12.6 12.4 L9.2 21 Z"
          fill={`url(#a${id})`}
          stroke={outline}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Pointer: React.FC<{
  x: number;
  y: number;
  size?: number;
  press?: number;
  opacity?: number;
  light?: boolean;
}> = ({ x, y, size = 30, press = 0, opacity = 1, light = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      left: x - size * 0.13,
      top: y - size * 0.08,
      opacity,
      transform: `scale(${1 - press * 0.14})`,
      transformOrigin: "13% 8%",
      zIndex: 60,
      overflow: "visible",
      filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
    }}
  >
    <path
      d="M3.2 2 L3.2 19.2 L7.6 15.1 L10.6 21.7 L13.3 20.5 L10.4 14.1 L16.4 14.1 Z"
      fill={light ? "#FFFFFF" : "#111"}
      stroke={light ? "#111" : "#FFFFFF"}
      strokeWidth={1.3}
      strokeLinejoin="round"
    />
  </svg>
);

// Glittering sparkle ring around a rounded rect (toggle confirm, logo).
export const Sparkle: React.FC<{
  t: number;
  at: number;
  x: number;
  y: number;
  w: number;
  h: number;
  n?: number;
  dur?: number;
  color?: string;
}> = ({ t, at, x, y, w, h, n = 70, dur = 34, color = "#FFFFFF" }) => {
  const k = t - at;
  if (k < 0 || k > dur) return null;
  const life =
    ramp(k, [0, 3], [0, 1]) * ramp(k, [dur * 0.45, dur], [1, 0], ease.linear);
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: n }, (_, i) => {
        const a = random(`sa${i}`) * TAU;
        const rr =
          1 +
          random(`sr${i}`) * 0.18 +
          ramp(k, [0, dur], [0, 0.22 * random(`sd${i}`)], ease.out);
        const px = x + (Math.cos(a) * w * rr) / 2;
        const py = y + (Math.sin(a) * h * rr) / 2;
        const tw = 0.5 + 0.5 * Math.sin(k * (0.6 + random(`st${i}`)) + i);
        const s = 0.8 + random(`ss${i}`) * 2.2;
        return (
          <g key={i} opacity={life * tw}>
            <circle cx={px} cy={py} r={s} fill={color} />
            {s > 2.3 && (
              <ellipse cx={px} cy={py} rx={s * 3} ry={0.45} fill={color} />
            )}
            {s > 2.3 && (
              <ellipse cx={px} cy={py} rx={0.45} ry={s * 3} fill={color} />
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- product UI ----------
export const AppIcon: React.FC<{
  name: Parameters<typeof Icon>[0]["name"];
  bg: string;
  size?: number;
}> = ({ name, bg, size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.12)",
      flexShrink: 0,
    }}
  >
    <Icon name={name} size={size * 0.52} color="#fff" stroke={2.2} />
  </div>
);

// Speech-like waveform bars (syllable bursts separated by gaps).
const amp = (i: number) => {
  const syl = Math.sin(i * 0.55) * 0.5 + 0.5;
  const gap = Math.sin(i * 0.13 + 1.3) > -0.55 ? 1 : 0.08;
  return Math.max(0.06, (0.25 + 0.75 * random(`w${i}`)) * syl * gap);
};

export const Composer: React.FC<{
  width?: number;
  text?: React.ReactNode;
  placeholder?: string;
  rec?: { elapsed: number } | null;
  sendPress?: number;
  model?: boolean;
  tray?: boolean;
  micHover?: number;
  trayNode?: React.ReactNode;
  modelNode?: React.ReactNode;
  attach?: React.ReactNode;
}> = ({
  width = 820,
  text,
  placeholder = "Describe the video you want to make",
  rec = null,
  sendPress = 0,
  model = true,
  tray = true,
  micHover = 0,
  trayNode,
  modelNode,
  attach,
}) => {
  const bars = rec ? Math.floor(rec.elapsed * 1.6) : 0;
  const secs = rec ? Math.floor(rec.elapsed / 30) : 0;
  return (
    <div style={{ position: "relative", width }}>
      {tray && (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: "100%",
            marginTop: -26,
            height: 70,
            borderRadius: "0 0 24px 24px",
            background: "#F6F6F6",
            display: "flex",
            alignItems: "flex-end",
            gap: 22,
            padding: "0 22px 14px",
            boxSizing: "border-box",
            fontFamily: SANS,
            fontSize: 14,
            color: "#6B6B6B",
          }}
        >
          {trayNode ?? (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="palette" size={16} color="#6B6B6B" /> Ember brand
                kit
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {["#FF4F1F", "#F4E7D4", "#170C07"].map((c) => (
                  <span
                    key={c}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: c,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                ))}
                <span style={{ marginLeft: 4 }}>Assets</span>
              </span>
            </>
          )}
        </div>
      )}
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 28,
          border: `1px solid ${LINE}`,
          boxShadow: "0 10px 34px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          padding: "22px 22px 16px 26px",
          fontFamily: SANS,
        }}
      >
        {attach}
        <div
          style={{
            minHeight: 58,
            fontSize: 19,
            lineHeight: 1.5,
            color: text ? INK : "#A8A8A8",
            letterSpacing: "-0.005em",
          }}
        >
          {text ?? placeholder}
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 14, height: 42 }}
        >
          {!rec && <Icon name="plus" size={22} color="#6B6B6B" />}
          {rec ? (
            <div
              style={{
                flex: 1,
                height: 42,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 64,
                  top: 20,
                  height: 2,
                  backgroundImage:
                    "radial-gradient(circle, #C4C4C4 0.9px, transparent 1.2px)",
                  backgroundSize: "5px 2px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 64,
                  top: 0,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  gap: 2.6,
                }}
              >
                {Array.from({ length: Math.min(bars, 150) }, (_, k) => {
                  const i = bars - Math.min(bars, 150) + k;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 2.2,
                        height: 3 + amp(i) * 30,
                        borderRadius: 1.2,
                        background: INK,
                      }}
                    />
                  );
                })}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 6,
                  top: 9,
                  fontSize: 18,
                  color: GRAY,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                0:{String(secs).padStart(2, "0")}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1 }} />
          )}
          {model && !rec && modelNode}
          {model && !rec && !modelNode && (
            <span
              style={{
                fontSize: 15,
                color: INK,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Pine Pro <span style={{ color: GRAY }}>Motion</span>
              <Icon name="chevronDown" size={15} color={GRAY} />
            </span>
          )}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              background: rec
                ? "#F0F0F0"
                : micHover > 0
                  ? `rgba(0,0,0,${0.05 * micHover})`
                  : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {rec ? (
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 3,
                  background: INK,
                }}
              />
            ) : (
              <Icon name="mic" size={20} color="#6B6B6B" />
            )}
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 - sendPress * 0.1})`,
            }}
          >
            <Icon name="arrowUp" size={21} color="#fff" stroke={2.4} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- camera & motion helpers ----------
// World camera: shows world point (fx, fy) at the frame center, scaled by s. Plain 2D transform keeps text crisp.
export const Cam: React.FC<{ s: number; fx: number; fy: number; children: React.ReactNode; bg?: string }> = ({ s, fx, fy, children, bg = "#FFFFFF" }) => (
  <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - fx * s}px, ${540 - fy * s}px) scale(${s})` }}>{children}</div>
  </AbsoluteFill>
);
export const press = (t: number, at: number) => ramp(t, [at - 2, at], [0, 1]) * ramp(t, [at, at + 4], [1, 0]);
export const path = (t: number, times: number[], xs: number[], ys: number[]) => ({ x: kf(t, times, xs, ease.inOut), y: kf(t, times, ys, ease.inOut) });

