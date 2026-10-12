// The launch film "Claude made": Guava Pro, a fictional AI dubbing studio. 18s, nine shots cut on the 120 BPM beat.
// Type follows the ChatGPT-launch look of the Pine Pro film: Inter / Inter Tight, sentence case, word-by-word reveals.
// `t` is film-local seconds. FILM_SFX (bottom) is parsed by scripts/compose-guava.mjs, so keep it on one JSON line.
import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { Icon } from "../clueso-mcp/icons";
import { Pointer, Words } from "../pine-launch/kit";
import { ease, ramp } from "../utils";
import { springAt } from "../sarvam-live/kit";

export const G = {
  pink: "#FF4D6D",
  deep: "#D61F55",
  light: "#FF9DB0",
  rind: "#5DB33A",
  rindDark: "#2E7D32",
  lime: "#B6F36B",
  seed: "#FFE9D6",
  ink: "#0D0D0D",
  night: "#06070B",
};
const INDIC = "'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Bengali', 'Noto Sans Gujarati', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Gurmukhi'";
export const GFONT = `Inter, ${INDIC}, sans-serif`;
export const GTIGHT = `'Inter Tight', Inter, ${INDIC}, sans-serif`;
export const DISPLAY = "Anton, 'Inter Tight', sans-serif"; // the hook only
export const FILM_LEN = 18;
// logo · type · orbit · editor · grid · 12 languages · voice match · export 4K · lockup
export const FILM_SHOTS = [0, 2, 4, 6.5, 9.5, 11.5, 13, 14.5, 16.3, FILM_LEN];

// ---------- brand ----------
export const GuavaMark: React.FC<{ size: number; build?: number; glow?: number }> = ({ size, build = 1, glow = 0 }) => {
  const seeds = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * 21, y: 52 + Math.sin(a) * 21, r: a };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: glow > 0 ? `drop-shadow(0 0 ${glow * 36}px rgba(255,77,109,${0.7 * glow}))` : undefined }}>
      <defs>
        <radialGradient id="gv-flesh" cx="0.5" cy="0.52" r="0.5">
          <stop offset="0" stopColor="#FFD1DA" />
          <stop offset="0.35" stopColor={G.light} />
          <stop offset="0.8" stopColor={G.pink} />
          <stop offset="1" stopColor={G.deep} />
        </radialGradient>
        <linearGradient id="gv-rind" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8BD45E" />
          <stop offset="1" stopColor={G.rindDark} />
        </linearGradient>
      </defs>
      <g transform={`translate(50 52) scale(${build}) translate(-50 -52)`}>
        <path d="M58 12 C 70 4, 84 6, 90 14 C 80 20, 68 20, 58 12 Z" fill={G.rind} opacity={ramp(build, [0.6, 1])} />
        <circle cx="50" cy="52" r="42" fill="url(#gv-rind)" />
        <circle cx="50" cy="52" r="36.5" fill="#FFF3E8" />
        <circle cx="50" cy="52" r="34" fill="url(#gv-flesh)" />
        {seeds.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx="2.2" ry="3.4" fill={G.seed} transform={`rotate(${(s.r * 180) / Math.PI + 90} ${s.x} ${s.y})`} opacity={ramp(build, [0.4 + i * 0.03, 0.7 + i * 0.02])} />
        ))}
        <circle cx="50" cy="52" r="11" fill="#FFC3CF" opacity="0.7" />
      </g>
    </svg>
  );
};
// "Guava Pro" wordmark: Inter semibold, tight, like a product wordmark.
const Wordmark: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: size, letterSpacing: "-0.045em", color: "#fff", whiteSpace: "nowrap", ...style }}>
    Guava <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Pro</span>
  </div>
);

// ---------- texture ----------
const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.05 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="gv-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(t * 24) % 50} />
    </filter>
    <rect width="1920" height="1080" filter="url(#gv-grain)" />
  </svg>
);
const Vignette = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />;
const Nebula: React.FC<{ t: number; a?: number }> = ({ t, a = 1 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 45% 40% at ${30 + Math.sin(t * 0.7) * 4}% 40%, rgba(255,77,109,${0.2 * a}), transparent 70%),
        radial-gradient(ellipse 40% 38% at ${72 - Math.sin(t * 0.6) * 4}% 62%, rgba(93,179,58,${0.16 * a}), transparent 70%),
        radial-gradient(ellipse 90% 80% at 50% 50%, #0E0B16 0%, ${G.night} 80%)`,
    }}
  />
);
const STARS = Array.from({ length: 160 }, (_, i) => ({ x: random(`sx${i}`) * 1920, y: random(`sy${i}`) * 1080, r: 0.5 + random(`sr${i}`) * 1.3, p: random(`sp${i}`) * 6 }));
const Stars: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {STARS.map((s, i) => (
      <circle key={i} cx={(s.x - t * 6) % 1920 < 0 ? ((s.x - t * 6) % 1920) + 1920 : (s.x - t * 6) % 1920} cy={s.y} r={s.r} fill="#fff" opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.5 + s.p))} />
    ))}
  </svg>
);

// ---------- 1 · logo reveal ----------
const PARTS = Array.from({ length: 90 }, (_, i) => ({ a: random(`pa${i}`) * Math.PI * 2, v: 500 + random(`pv${i}`) * 900, w: 1 + random(`pw${i}`) * 2.2, c: random(`pc${i}`) < 0.7 ? G.pink : G.lime }));
const LogoShot: React.FC<{ t: number }> = ({ t }) => {
  const dot = springAt(t, 0, { damping: 12, stiffness: 200, mass: 0.5 });
  const burst = ramp(t, [0.35, 1.4], [0, 1], ease.out);
  const build = springAt(t, 0.45, { damping: 11, stiffness: 150, mass: 0.8 });
  const slide = ramp(t, [0.95, 1.35], [0, 1], ease.inOut);
  const word = ramp(t, [1.0, 1.45], [0, 1], ease.out);
  const streak = ramp(t, [1.15, 1.7], [0, 1], ease.inOut);
  const push = interpolate(t, [0, 2], [1, 1.05]);
  const out = ramp(t, [1.82, 2], [0, 1], ease.in);
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <Nebula t={t} />
      <Stars t={t} />
      <AbsoluteFill style={{ transform: `scale(${push + out * 1.6})`, filter: out > 0 ? `blur(${out * 14}px)` : undefined, opacity: 1 - out * 0.6 }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2].map((k) => {
            const p = ramp(t, [0.35 + k * 0.08, 1.2 + k * 0.08], [0, 1], ease.out);
            return p > 0 && p < 1 ? <circle key={k} cx={960} cy={540} r={40 + p * (700 + k * 180)} fill="none" stroke={k === 1 ? G.lime : G.pink} strokeWidth={(1 - p) * 10 + 1} opacity={(1 - p) * 0.8} /> : null;
          })}
          {burst > 0 && burst < 1
            ? PARTS.map((p, i) => {
                const r0 = p.v * burst;
                const r1 = p.v * Math.max(0, burst - 0.06);
                return <line key={i} x1={960 + Math.cos(p.a) * r1} y1={540 + Math.sin(p.a) * r1} x2={960 + Math.cos(p.a) * r0} y2={540 + Math.sin(p.a) * r0} stroke={p.c} strokeWidth={p.w} strokeLinecap="round" opacity={1 - burst} />;
              })
            : null}
        </svg>
        {t < 0.6 ? <div style={{ position: "absolute", left: 960 - 14, top: 540 - 14, width: 28, height: 28, borderRadius: 14, background: "#fff", boxShadow: `0 0 40px 12px ${G.pink}`, transform: `scale(${dot * (1 - ramp(t, [0.4, 0.6], [0, 1]))})` }} /> : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: 540 - 100, height: 200, display: "flex", justifyContent: "center", alignItems: "center", gap: 34 }}>
          <GuavaMark size={180} build={build} glow={0.6 + 0.4 * (1 - slide)} />
          <div style={{ width: 560 * slide, overflow: "hidden" }}>
            <Wordmark size={124} style={{ opacity: word, transform: `translateX(${(1 - word) * -60}px)` }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 622, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 32, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.6)", opacity: ramp(t, [1.4, 1.7]), transform: `translateY(${(1 - ramp(t, [1.4, 1.75], [0, 1], ease.out)) * 12}px)` }}>
          AI dubbing studio
        </div>
        {streak > 0 && streak < 1 ? <div style={{ position: "absolute", left: -600 + streak * 3000, top: 530, width: 900, height: 20, borderRadius: 10, background: "linear-gradient(90deg, transparent, rgba(255,210,220,0.9), transparent)", filter: "blur(6px)", mixBlendMode: "screen" }} /> : null}
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 2 · kinetic type, Pine "you can just" style ----------
const TYPE_BEATS: { at: number; blocks: { x: number; y: number; w: number; h: number; c: string; d: number }[]; words: [string, number, number, number, number][] }[] = [
  {
    at: 0,
    blocks: [
      { x: 80, y: 150, w: 880, h: 780, c: "#F9D7DE", d: 0 },
      { x: 960, y: 150, w: 880, h: 780, c: "#FFEDE6", d: 0.12 },
    ],
    // [word, centre x, centre y, appear at, size]
    words: [
      ["speak", 520, 540, 0.05, 290],
      ["once.", 1400, 540, 0.3, 290],
    ],
  },
  {
    at: 1.0,
    blocks: [
      { x: 80, y: 120, w: 1760, h: 420, c: "#DDF3CF", d: 0 },
      { x: 80, y: 540, w: 1760, h: 420, c: "#C3EAA8", d: 0.12 },
    ],
    words: [
      ["be heard", 960, 330, 0.05, 280],
      ["everywhere.", 960, 750, 0.3, 280],
    ],
  },
];
const TypeShot: React.FC<{ t: number }> = ({ t }) => {
  const beat = TYPE_BEATS[t < 1 ? 0 : 1];
  const k = t - beat.at;
  const out = ramp(t, [1.8, 2], [0, 1], ease.in);
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <Stars t={t + 2} />
      <AbsoluteFill style={{ transform: `scale(${1 + out * 0.08})`, opacity: 1 - out }}>
        {beat.blocks.map((b, i) => (
          <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, background: b.c, clipPath: `inset(${(1 - ramp(k, [b.d, b.d + 0.2], [0, 1], ease.out)) * 100}% 0 0 0)` }} />
        ))}
        {beat.words.map(([w, x, y, at, size]) => (
          <div key={w} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -54%) scale(${ramp(k, [at, at + 0.2], [1.08, 1])})`, fontFamily: GTIGHT, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: "-0.05em", color: G.ink, opacity: ramp(k, [at, at + 0.07]), whiteSpace: "nowrap" }}>
            {w}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3 · language orbit ----------
const ORBIT = ["हिंदी", "தமிழ்", "Español", "日本語", "Français", "తెలుగు", "Deutsch", "বাংলা", "Português", "한국어", "ગુજરાતી", "Italiano"];
const OrbitShot: React.FC<{ t: number }> = ({ t }) => {
  const rot = t * 0.9;
  const fly = ramp(t, [0, 0.5], [0, 1], ease.out);
  const dive = ramp(t, [2.1, 2.5], [0, 1], ease.in);
  const pulse = 0.5 + 0.5 * Math.sin(t * 9);
  const items = ORBIT.map((l, i) => {
    const a = rot + (i / ORBIT.length) * Math.PI * 2;
    const z = Math.sin(a);
    return { l, x: Math.cos(a) * 720 * fly, y: z * 215 * fly - 30, z };
  }).sort((p, q) => p.z - q.z);
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <Nebula t={t + 4} />
      <Stars t={t + 4} />
      <AbsoluteFill style={{ transform: `scale(${1 + dive * 2.2})`, filter: dive > 0 ? `blur(${dive * 16}px)` : undefined, opacity: 1 - dive * 0.7 }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="gv-bar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={G.pink} />
              <stop offset="1" stopColor={G.lime} />
            </linearGradient>
          </defs>
          <ellipse cx={960} cy={510} rx={720} ry={215} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="4 10" opacity={fly} />
          <g transform={`rotate(${t * 22} 960 510)`}>
            {Array.from({ length: 96 }, (_, i) => {
              const a = (i / 96) * Math.PI * 2;
              const len = 14 + 70 * Math.abs(Math.sin(t * 7 + i * 0.45)) * (0.35 + 0.65 * random(`ob${i}`)) * fly;
              return <line key={i} x1={960 + Math.cos(a) * 150} y1={510 + Math.sin(a) * 150} x2={960 + Math.cos(a) * (150 + len)} y2={510 + Math.sin(a) * (150 + len)} stroke="url(#gv-bar)" strokeWidth={5} strokeLinecap="round" />;
            })}
          </g>
          <circle cx={960} cy={510} r={130 + pulse * 6} fill="rgba(255,77,109,0.08)" stroke="rgba(255,77,109,0.5)" strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", left: 960 - 60, top: 510 - 62, transform: `scale(${1 + pulse * 0.05})` }}>
          <GuavaMark size={120} glow={0.8} />
        </div>
        {items.map(({ l, x, y, z }) => {
          const s = 0.62 + 0.38 * ((z + 1) / 2) * 1.5;
          const front = z > 0.93;
          return (
            <div key={l} style={{ position: "absolute", left: 960 + x, top: 510 + y, transform: `translate(-50%, -50%) scale(${s})`, fontFamily: GFONT, fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: front ? "#fff" : `rgba(255,255,255,${0.35 + 0.45 * ((z + 1) / 2)})`, textShadow: front ? `0 0 30px ${G.pink}` : undefined, filter: z < -0.2 ? `blur(${(-z - 0.2) * 3}px)` : undefined }}>
              {l}
            </div>
          );
        })}
      </AbsoluteFill>
      <Words text="Your voice, in every language" t={t * 30} at={12} step={5} size={60} y={900} />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 4 · the Guava Pro editor ----------
const TABS = ["EN", "हिंदी", "தமிழ்", "ES"];
const LINES: string[][] = [
  ["Welcome back to the channel!", "चैनल पर वापस स्वागत है!", "சேனலுக்கு மீண்டும் வரவேற்கிறோம்!", "¡Bienvenidos de nuevo al canal!"],
  ["Today we're making something special.", "आज हम कुछ खास बनाने वाले हैं।", "இன்று ஒரு சிறப்பான விஷயம் செய்யப் போகிறோம்.", "Hoy vamos a hacer algo especial."],
  ["Let's get started.", "चलिए शुरू करते हैं।", "ஆரம்பிக்கலாம்.", "Empecemos."],
];
const Speaker: React.FC<{ t: number; w: number; h: number; hue?: number }> = ({ t, w, h, hue = 0 }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, hsl(${330 + hue} 45% 16%) 0%, hsl(${340 + hue} 50% 26%) 55%, hsl(${140 + hue} 35% 14%) 100%)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: w * 0.08, top: h * 0.1, width: w * 0.3, height: h * 0.8, borderRadius: 12, background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))" }} />
    <div style={{ position: "absolute", left: w * 0.5 - h * 0.2, top: h * 0.16, width: h * 0.4, height: h * 0.4, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #FFC2CD, #E0457B 60%, #6E1B3C)", transform: `translateY(${Math.sin(t * 3) * 3}px)` }} />
    <div style={{ position: "absolute", left: w * 0.5 - h * 0.34, top: h * 0.54, width: h * 0.68, height: h * 0.6, borderRadius: `${h * 0.34}px ${h * 0.34}px 0 0`, background: "linear-gradient(180deg, #3A2140, #1A0F1F)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.45))" }} />
  </div>
);
const Glass: React.CSSProperties = { background: "rgba(22,20,28,0.78)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(14px)", boxShadow: "0 30px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" };
const TC = (s: number) => `00:00:${String(Math.floor(s)).padStart(2, "0")}:${String(Math.floor((s % 1) * 24)).padStart(2, "0")}`;
export const EditorUI: React.FC<{ t: number; tab: number; tabK: number; play: number; dim?: number }> = ({ t, tab, tabK, play, dim = 0 }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(180deg, #121118 0%, #0C0B10 100%)", border: "1px solid rgba(255,255,255,0.09)", overflow: "hidden", fontFamily: GFONT, color: "#fff", boxShadow: "0 80px 160px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,77,109,0.1), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
    {/* title bar */}
    <div style={{ height: 58, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.9 }} />
      ))}
      <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <GuavaMark size={24} />
        <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em" }}>Guava Pro</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Creator interview</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex" }}>
          {["#FF9DB0", "#B6F36B", "#9DB8FF"].map((c, i) => (
            <span key={c} style={{ width: 28, height: 28, borderRadius: 14, background: `linear-gradient(135deg, ${c}, #444)`, border: "2px solid #121118", marginLeft: i ? -8 : 0 }} />
          ))}
        </div>
        <span style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", fontSize: 15, color: "rgba(255,255,255,0.8)" }}>Share</span>
        <span style={{ padding: "7px 16px", borderRadius: 10, background: G.pink, fontSize: 15, fontWeight: 600 }}>Export</span>
      </div>
    </div>
    {/* tool rail */}
    <div style={{ position: "absolute", left: 0, top: 58, bottom: 0, width: 66, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 18 }}>
      {(["film", "languages", "mic", "captions", "sliders"] as const).map((n, i) => (
        <div key={n} style={{ width: 40, height: 40, borderRadius: 12, background: i === 1 ? "rgba(255,77,109,0.16)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={n} size={20} color={i === 1 ? G.pink : "rgba(255,255,255,0.45)"} />
        </div>
      ))}
    </div>
    {/* preview */}
    <div style={{ position: "absolute", left: 86, top: 78, width: 960, height: 540, borderRadius: 16, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
      <Speaker t={t} w={960} h={540} />
      <div style={{ position: "absolute", left: 18, top: 18, display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 18, ...Glass, boxShadow: "none", fontSize: 16, fontWeight: 600 }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: G.pink }} /> Dubbing · {TABS[tab]}
      </div>
      <div style={{ position: "absolute", right: 18, top: 18, display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 18, background: "rgba(0,0,0,0.45)", fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: G.lime, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 5)) }} /> Lip-sync live
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "10px 22px", borderRadius: 12, background: "rgba(0,0,0,0.62)", fontSize: 30, fontWeight: 500, opacity: ramp(tabK, [0, 0.15]), transform: `translateY(${(1 - ramp(tabK, [0, 0.2], [0, 1], ease.out)) * 10}px)` }}>{LINES[0][tab]}</span>
      </div>
    </div>
    {/* transcript */}
    <div style={{ position: "absolute", left: 1066, top: 78, right: 20, height: 540 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>Transcript</span>
        <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 11, background: "rgba(255,255,255,0.06)" }}>
          {TABS.map((l, i) => (
            <span key={l} style={{ padding: "5px 11px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: i === tab ? "#fff" : "transparent", color: i === tab ? G.ink : "rgba(255,255,255,0.55)", transform: i === tab ? `scale(${1 + 0.08 * ramp(tabK, [0, 0.15], [1, 0])})` : undefined }}>
              {l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {LINES.map((ln, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 10, padding: "16px 4px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, height: 22, fontFamily: "'Geist Mono', monospace", fontSize: 13, color: i === 0 ? "#fff" : "rgba(255,255,255,0.35)" }}>
              {i === 0 ? <span style={{ width: 6, height: 6, borderRadius: 3, background: G.pink, boxShadow: `0 0 8px ${G.pink}` }} /> : <span style={{ width: 6 }} />}
              0:0{i * 3}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", marginBottom: 6 }}>{ln[0]}</div>
              <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em", color: i === 0 ? "#fff" : "rgba(255,255,255,0.75)", opacity: ramp(tabK, [0.05 + i * 0.08, 0.25 + i * 0.08]) }}>{ln[tab]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* timeline */}
    <div style={{ position: "absolute", left: 86, right: 20, top: 638, bottom: 18, borderRadius: 16, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", padding: "10px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 150, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Geist Mono', monospace" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i}>0:{String(i * 4).padStart(2, "0")}</span>
        ))}
      </div>
      {[
        ["Video", "rgba(255,255,255,0.08)"],
        [`Voice · ${TABS[tab]}`, "rgba(255,77,109,0.2)"],
        ["Original · EN", "rgba(255,255,255,0.05)"],
        ["Music", "rgba(93,179,58,0.16)"],
      ].map(([n, bg], r) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, height: 44, marginTop: r ? 4 : 8 }}>
          <span style={{ width: 138, fontSize: 14, color: r === 2 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)", textDecoration: r === 2 ? "line-through" : undefined }}>{n}</span>
          <div style={{ flex: 1, height: 38, borderRadius: 8, background: bg, display: "flex", alignItems: "center", gap: r === 0 ? 3 : 2.5, padding: r === 0 ? 3 : "0 8px", overflow: "hidden" }}>
            {r === 0
              ? Array.from({ length: 14 }, (_, i) => <div key={i} style={{ flex: 1, height: "100%", borderRadius: 5, background: `linear-gradient(135deg, hsl(${335 + (i % 3) * 8} 45% ${20 + (i % 4) * 4}%), hsl(${150 + i * 3} 30% 15%))` }} />)
              : Array.from({ length: 170 }, (_, i) => <div key={i} style={{ width: 2.4, flexShrink: 0, borderRadius: 2, background: r === 1 ? G.pink : r === 2 ? "rgba(255,255,255,0.3)" : G.rind, height: 3 + 26 * Math.abs(Math.sin(i * 0.5 + r)) * random(`tl${r}${i}`) }} />)}
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 16 + 150 + play * (1640 - 170 - 150), top: 6, bottom: 8, width: 2, background: G.pink, boxShadow: `0 0 14px ${G.pink}` }}>
        <div style={{ position: "absolute", top: -2, left: -44, width: 90, textAlign: "center", padding: "2px 0", borderRadius: 6, background: G.pink, fontSize: 11, fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>{TC(play * 32)}</div>
      </div>
    </div>
    {dim > 0 ? <div style={{ position: "absolute", inset: 0, background: `rgba(6,6,10,${0.55 * dim})`, backdropFilter: `blur(${6 * dim}px)` }} /> : null}
  </div>
);
const EditorShot: React.FC<{ t: number }> = ({ t }) => {
  const tab = t < 0.9 ? 0 : t < 1.7 ? 1 : t < 2.35 ? 2 : 3;
  const tabK = t - [0, 0.9, 1.7, 2.35][tab];
  const inP = springAt(t, 0, { damping: 18, stiffness: 90, mass: 1 });
  const cards: [number, string, string, number, number, string][] = [
    [0.5, "Voice match", "98%", 70, 150, G.lime],
    [0.9, "Lip-sync", "Frame-accurate", 1560, 120, G.pink],
  ];
  return (
    <AbsoluteFill style={{ background: G.night, overflow: "hidden" }}>
      <Nebula t={t + 7} a={0.8} />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 45%" }}>
        <div style={{ position: "absolute", left: 140, top: 110, width: 1640, height: 880, transform: `translateY(${(1 - inP) * 200}px) scale(${interpolate(t, [0, 3], [0.98, 1.03])}) rotateX(${interpolate(t, [0, 3], [9, 3])}deg) rotateY(${interpolate(t, [0, 3], [-6, 2])}deg)`, opacity: Math.min(1, inP * 1.6) }}>
          <EditorUI t={t} tab={tab} tabK={tabK} play={interpolate(t, [0, 3], [0.1, 0.55])} />
        </div>
      </AbsoluteFill>
      {cards.map(([at, label, value, x, y, c], i) => {
        const p = springAt(t, at, { damping: 12, stiffness: 170, mass: 0.7 });
        return (
          <div key={label} style={{ position: "absolute", left: x + Math.sin(t * 1.3 + i) * 6, top: y + Math.cos(t * 1.1 + i) * 6, padding: "16px 22px", borderRadius: 18, ...Glass, fontFamily: "Inter, sans-serif", color: "#fff", opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p}) translateY(${(1 - p) * 30}px)` }}>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: c }}>{value}</div>
          </div>
        );
      })}
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 5 · four languages at once ----------
const GRID: [string, string][] = [
  ["EN", LINES[0][0]],
  ["हिंदी", LINES[0][1]],
  ["தமிழ்", LINES[0][2]],
  ["ES", LINES[0][3]],
];
const GridShot: React.FC<{ t: number }> = ({ t }) => {
  const zoom = interpolate(t, [0, 2], [1.08, 1]);
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, perspective: 2000 }}>
        {GRID.map(([lang, line], i) => {
          const p = ramp(t, [i * 0.12, i * 0.12 + 0.4], [0, 1], ease.out);
          const x = 70 + (i % 2) * 900;
          const y = 50 + Math.floor(i / 2) * 500;
          return (
            <div key={lang} style={{ position: "absolute", left: x, top: y, width: 880, height: 480, borderRadius: 22, overflow: "hidden", transform: `rotateY(${(1 - p) * 90}deg)`, transformOrigin: i % 2 ? "0% 50%" : "100% 50%", opacity: p > 0.02 ? 1 : 0, boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
              <Speaker t={t + i} w={880} h={480} hue={i * 12} />
              <div style={{ position: "absolute", left: 22, top: 20, padding: "8px 18px", borderRadius: 18, background: i === 0 ? "rgba(255,255,255,0.92)" : G.pink, color: i === 0 ? G.ink : "#fff", fontFamily: GFONT, fontWeight: 600, fontSize: 22 }}>{lang}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center" }}>
                <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontFamily: GFONT, fontSize: 26, fontWeight: 500 }}>{line}</span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: "20px 40px", borderRadius: 60, ...Glass, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 60, letterSpacing: "-0.035em", color: "#fff", opacity: ramp(t, [0.7, 1.0]), transform: `scale(${0.9 + 0.1 * ramp(t, [0.7, 1.05], [0, 1], ease.out)})` }}>
          Same voice. <span style={{ color: G.pink }}>Every language.</span>
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 6 · 12 languages, slot-machine scroll ----------
const ROLL = ["English", "हिंदी", "தமிழ்", "Español", "తెలుగు", "Français", "বাংলা", "Deutsch", "मराठी", "日本語", "ગુજરાતી", "Português", "ಕನ್ನಡ", "한국어", "മലയാളം", "Italiano", "ਪੰਜਾਬੀ", "العربية", "हिंदी", "தமிழ்", "Español", "తెలుగు", "Français", "বাংলা"];
const LangRollShot: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, [0.05, 1.2], [0, 1], (v) => 1 - (1 - v) ** 3);
  const pos = k * 17;
  const count = Math.max(1, Math.round(1 + k * 11));
  const inP = ramp(t, [0, 0.2], [0, 1], ease.out);
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <Nebula t={t + 11} a={0.7} />
      <Stars t={t + 11} />
      <div style={{ position: "absolute", left: 250, top: 540, transform: "translateY(-50%)", opacity: inP }}>
        <div style={{ fontFamily: GTIGHT, fontWeight: 700, fontSize: 300, lineHeight: 0.9, letterSpacing: "-0.06em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>{count}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 44, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.55)", marginTop: 10 }}>languages</div>
      </div>
      <div style={{ position: "absolute", left: 900, top: 540 - 50, width: 760, height: 100, borderRadius: 22, background: "rgba(255,77,109,0.14)", border: "1px solid rgba(255,77,109,0.45)", opacity: inP }} />
      <div style={{ position: "absolute", left: 900, top: 0, width: 760, height: 1080, overflow: "hidden", opacity: inP, WebkitMaskImage: "linear-gradient(180deg, transparent 8%, #000 35%, #000 65%, transparent 92%)" }}>
        {ROLL.map((l, i) => {
          const d = i - pos;
          if (Math.abs(d) > 5) return null;
          const c = Math.abs(d);
          return (
            <div key={i} style={{ position: "absolute", left: 40, top: 540 - 50 + d * 110, height: 100, display: "flex", alignItems: "center", fontFamily: GFONT, fontWeight: 600, fontSize: 64 - Math.min(20, c * 8), letterSpacing: "-0.02em", color: c < 0.5 ? "#fff" : `rgba(255,255,255,${Math.max(0.12, 0.6 - c * 0.12)})`, transform: `perspective(800px) rotateX(${-d * 12}deg)`, filter: k < 0.9 ? `blur(${Math.min(3, (1 - k) * 6)}px)` : undefined }}>
              {l}
            </div>
          );
        })}
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 7 · voice match ----------
const VoiceMatchShot: React.FC<{ t: number }> = ({ t }) => {
  const g = ramp(t, [0.15, 1.1], [0, 0.98], ease.out);
  const align = ramp(t, [0.1, 0.9], [0, 1], ease.inOut);
  const inP = ramp(t, [0, 0.25], [0, 1], ease.out);
  const R = 150, C = 2 * Math.PI * R;
  const bars = (seed: string, row: number) =>
    Array.from({ length: 64 }, (_, i) => {
      const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37 + 0.6)) * (0.5 + 0.5 * random(`vm${i}`));
      const own = 0.25 + 0.75 * random(`${seed}${i}`);
      const h = row === 0 ? base : own + (base - own) * align;
      return <div key={i} style={{ width: 7, flexShrink: 0, borderRadius: 4, height: 8 + 92 * h * (0.85 + 0.15 * Math.sin(t * 8 + i)), background: row === 0 ? "rgba(255,255,255,0.55)" : G.pink }} />;
    });
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <Nebula t={t + 13} a={0.8} />
      <div style={{ position: "absolute", left: 180, top: 300, width: 860, opacity: inP, fontFamily: "Inter, sans-serif" }}>
        {(["Original · EN", "Dubbed · हिंदी"] as const).map((n, r) => (
          <div key={n} style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: GFONT, fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>{n}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, height: 110 }}>{bars(`vd${r}`, r)}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 1260, top: 540 - 190, width: 380, height: 380, opacity: inP }}>
        <svg width={380} height={380} viewBox="0 0 380 380">
          <circle cx={190} cy={190} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={18} />
          <circle cx={190} cy={190} r={R} fill="none" stroke={G.pink} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${C * g} ${C}`} transform="rotate(-90 190 190)" style={{ filter: `drop-shadow(0 0 16px ${G.pink})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: GTIGHT, fontWeight: 700, fontSize: 104, letterSpacing: "-0.05em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>{Math.round(g * 100)}%</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>voice match</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1270, top: 760, display: "flex", gap: 12 }}>
        {["Tone", "Pitch", "Pace"].map((c, i) => {
          const p = springAt(t, 0.7 + i * 0.12, { damping: 12, stiffness: 220, mass: 0.6 });
          return (
            <span key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 20, background: "rgba(182,243,107,0.12)", border: "1px solid rgba(182,243,107,0.4)", fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 600, color: G.lime, transform: `scale(${p})` }}>
              ✓ {c}
            </span>
          );
        })}
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 8 · export in 4K ----------
const RES = ["1080p", "1440p", "4K"];
const ExportShot: React.FC<{ t: number }> = ({ t }) => {
  const modal = springAt(t, 0, { damping: 18, stiffness: 190, mass: 0.7 });
  const pick = 0.6;
  const clickExport = 1.0;
  const seg = t < pick ? 0 : 2;
  const segX = interpolate(ramp(t, [pick, pick + 0.18], [0, 1], ease.out), [0, 1], [0, 2]);
  const prog = ramp(t, [clickExport + 0.05, 1.45], [0, 1], ease.inOut);
  const done = t >= 1.45;
  const M = { x: 960 - 400, y: 540 - 280, w: 800 };
  const cur = {
    x: interpolate(t, [0, 0.45, 0.62, 0.85, 1.02], [1480, M.x + 40 + 3 * 230 - 115, M.x + 40 + 3 * 230 - 115, 960, 960], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut }),
    y: interpolate(t, [0, 0.45, 0.62, 0.85, 1.02], [960, M.y + 330, M.y + 330, M.y + 480, M.y + 480], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut }),
  };
  const press = (a0: number) => ramp(t, [a0 - 0.05, a0], [0, 1]) * ramp(t, [a0, a0 + 0.12], [1, 0]);
  const row = (k: string, v: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", borderBottom: "1px solid #EDEDED" }}>
      <span style={{ fontSize: 20, color: "#6B6B6B" }}>{k}</span>
      <span style={{ fontSize: 20, fontWeight: 500, color: G.ink }}>{v}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <div style={{ position: "absolute", left: 140, top: 110, width: 1640, height: 880 }}>
        <EditorUI t={t + 3} tab={1} tabK={1} play={0.62} dim={Math.min(1, modal)} />
      </div>
      <div style={{ position: "absolute", left: M.x, top: M.y, width: M.w, borderRadius: 30, background: "#FFFFFF", boxShadow: "0 50px 120px rgba(0,0,0,0.55)", fontFamily: GFONT, padding: "38px 40px 36px", boxSizing: "border-box", opacity: Math.min(1, modal * 1.5), transform: `translateY(${(1 - modal) * 30}px) scale(${0.96 + 0.04 * modal})` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: G.ink }}>Export</div>
            <div style={{ fontSize: 19, color: "#8F8F8F", marginTop: 4 }}>Creator interview · हिंदी</div>
          </div>
          <GuavaMark size={46} />
        </div>
        <div style={{ marginTop: 26, borderTop: "1px solid #EDEDED" }}>
          {row("Format", "MP4")}
          {row("Audio", "Dubbed voice + music")}
        </div>
        <div style={{ marginTop: 26, fontSize: 20, color: "#6B6B6B" }}>Resolution</div>
        <div style={{ position: "relative", marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: 5, borderRadius: 18, background: "#F3F3F3" }}>
          <div style={{ position: "absolute", top: 5, bottom: 5, left: 5 + segX * ((M.w - 80 - 10) / 3), width: (M.w - 80 - 10) / 3, borderRadius: 14, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
          {RES.map((r, i) => (
            <div key={r} style={{ position: "relative", height: 58, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
              <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.01em", color: i === seg ? G.ink : "#8F8F8F" }}>{r}</span>
              {i === 2 ? <span style={{ fontSize: 12, color: "#8F8F8F", marginTop: 2 }}>3840 × 2160</span> : null}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", marginTop: 30, height: 64, borderRadius: 32, background: G.ink, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontSize: 21, fontWeight: 600, color: "#fff", transform: `scale(${1 - press(clickExport) * 0.04})` }}>
          {prog > 0 && !done ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, background: "rgba(255,255,255,0.18)" }} /> : null}
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
            {done ? (
              <>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#1DB38A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>
                Exported in 4K
              </>
            ) : prog > 0 ? (
              `Exporting 4K… ${Math.round(prog * 100)}%`
            ) : (
              "Export"
            )}
          </span>
        </div>
        <div style={{ height: 26, marginTop: 14, textAlign: "center", fontSize: 17, color: "#8F8F8F", opacity: ramp(t, [1.45, 1.6]) }}>guava-pro_hindi_4K.mp4 · 3840 × 2160</div>
      </div>
      <Pointer x={cur.x} y={cur.y} size={30} press={press(pick) + press(clickExport)} />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- 9 · lockup ----------
const LockupShot: React.FC<{ t: number }> = ({ t }) => {
  const m = springAt(t, 0.05, { damping: 12, stiffness: 150, mass: 0.8 });
  const w = ramp(t, [0.2, 0.55], [0, 1], ease.out);
  const tag = ramp(t, [0.45, 0.8], [0, 1], ease.out);
  const pill = springAt(t, 0.75, { damping: 12, stiffness: 190, mass: 0.6 });
  return (
    <AbsoluteFill style={{ background: G.night }}>
      <Nebula t={t + 16} />
      <Stars t={t + 16} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <GuavaMark size={132} build={m} glow={0.7} />
          <Wordmark size={112} style={{ opacity: w, transform: `translateX(${(1 - w) * -40}px)` }} />
        </div>
        <div style={{ marginTop: 26, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 44, letterSpacing: "-0.025em", color: "#fff", opacity: tag, transform: `translateY(${(1 - tag) * 14}px)` }}>
          Dub anything. <span style={{ color: "rgba(255,255,255,0.55)" }}>Sound like you.</span>
        </div>
        <div style={{ marginTop: 34, padding: "15px 32px", borderRadius: 40, background: "#fff", color: G.ink, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 24, transform: `scale(${pill})` }}>Try Guava Pro</div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

const SHOTS = [LogoShot, TypeShot, OrbitShot, EditorShot, GridShot, LangRollShot, VoiceMatchShot, ExportShot, LockupShot];
export const GuavaFilm: React.FC<{ t: number }> = ({ t }) => {
  const tt = Math.max(0, Math.min(FILM_LEN - 0.001, t));
  let i = 0;
  while (i < SHOTS.length - 1 && tt >= FILM_SHOTS[i + 1]) i++;
  const Shot = SHOTS[i];
  return (
    <AbsoluteFill style={{ background: G.night, overflow: "hidden" }}>
      <Shot t={tt - FILM_SHOTS[i]} />
      <Grain t={t} />
    </AbsoluteFill>
  );
};

// The film laid out at full 1920×1080 and scaled into a w×h box (AbsoluteFill needs a real 1920×1080 parent).
export const FilmBox: React.FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => (
  <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${w / 1920}, ${h / 1080})`, transformOrigin: "0 0" }}>
      <GuavaFilm t={t} />
    </div>
  </div>
);

// Sound design Claude "adds" in the edit: [film seconds, kind]. Parsed by scripts/compose-guava.mjs, so keep it JSON.
export const FILM_SFX: [number, string][] = [[0,"sub"],[0.35,"impact"],[0.4,"whoosh"],[0.5,"pop"],[1.0,"whoosh"],[1.2,"swell"],[1.85,"riser"],[2.05,"impact"],[2.35,"pop"],[3.0,"impact"],[3.3,"pop"],[3.85,"whoosh"],[4.0,"sub"],[4.4,"swell"],[6.1,"riser"],[6.5,"impact"],[7.0,"pop"],[7.4,"pop"],[7.4,"tick"],[8.2,"tick"],[8.85,"tick"],[9.5,"whoosh"],[9.6,"pop"],[10.2,"chime"],[11.5,"glitch"],[12.7,"impact"],[13.0,"whoosh"],[13.9,"chime"],[14.5,"pop"],[15.1,"tick"],[15.5,"tick"],[15.95,"chime"],[16.0,"chime"],[16.3,"sub"],[16.9,"swell"]];
