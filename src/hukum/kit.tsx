// The Hukum reel's material kit: gold foil and chrome type, aged paper, ink stamps, a light beam with dust,
// the sunglasses, silhouettes, keys, a fingerprint, a wax seal, paper shards. All drawn in code (no photos),
// so it reads as a fan tribute, never as official material.
import React from "react";

export const W = 1080, H = 1920;
export const C = {
  black: "#060504",
  ink: "#0D0B09",
  paper: "#E9DEC6",
  paperDark: "#C9B996",
  gold: "#E8B64A",
  goldDeep: "#9C6A1C",
  red: "#B3261E",
};
export const DISPLAY = "Anton, 'Inter Tight', sans-serif";
export const MONO = "'Geist Mono', monospace";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- gold and chrome type ----------
// sweep 0..1 moves a specular band across the letters
export const Gold: React.FC<{ children: React.ReactNode; size: number; sweep?: number; spacing?: string; chrome?: boolean; glow?: number; style?: React.CSSProperties }> = ({ children, size, sweep = 0.5, spacing = "0.02em", chrome, glow = 0.45, style }) => {
  const base = chrome
    ? "linear-gradient(180deg, #FFFFFF 0%, #D6DCE2 30%, #6E7782 52%, #F4F7FA 62%, #9AA3AD 100%)"
    : "linear-gradient(180deg, #FFF4CC 0%, #F4C65A 26%, #A9741F 50%, #FFE3A0 60%, #C88F2E 78%, #7A4E12 100%)";
  const band = `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.95) ${sweep * 140 - 22}%, transparent ${sweep * 140 - 14}%)`;
  const common: React.CSSProperties = { fontFamily: DISPLAY, fontSize: size, lineHeight: 0.92, letterSpacing: spacing, whiteSpace: "nowrap", textTransform: "uppercase" };
  return (
    <div style={{ position: "relative", ...style }}>
      {/* depth: a dark extrusion under the face */}
      <div style={{ ...common, position: "absolute", left: 0, top: size * 0.035, color: chrome ? "#2A2F35" : "#3B2406" }}>{children}</div>
      <div style={{ ...common, position: "relative", backgroundImage: `${band}, ${base}`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 ${size * 0.18}px rgba(244,198,90,${glow}))` }}>{children}</div>
    </div>
  );
};

// ---------- light and air ----------
export const Beam: React.FC<{ x: number; top: number; width: number; opacity: number; angle?: number }> = ({ x, top, width, opacity, angle = 0 }) => (
  <div style={{ position: "absolute", left: x - width / 2, top, width, height: H * 1.2, transformOrigin: "50% 0", transform: `rotate(${angle}deg)`, opacity, pointerEvents: "none", background: "linear-gradient(180deg, rgba(255,226,170,0.55) 0%, rgba(255,210,140,0.18) 45%, transparent 85%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(18px)", mixBlendMode: "screen" }} />
);
export const Dust: React.FC<{ t: number; n?: number; opacity?: number; box?: [number, number, number, number] }> = ({ t, n = 70, opacity = 1, box = [0, 0, W, H] }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
    {Array.from({ length: n }, (_, i) => {
      const x = box[0] + ((hash(i) * box[2] + t * (8 + hash(i + 3) * 18)) % box[2]);
      const y = box[1] + ((hash(i + 7) * box[3] - t * (12 + hash(i + 5) * 22) + box[3] * 10) % box[3]);
      const r = 0.8 + hash(i + 9) * 2.6;
      return <circle key={i} cx={x} cy={y} r={r} fill="#FFE7B8" opacity={0.25 + 0.6 * hash(i + 11) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
    })}
  </svg>
);
export const Flash: React.FC<{ k: number; color?: string }> = ({ k, color = "#FFE9B0" }) => (k <= 0.01 ? null : <div style={{ position: "absolute", inset: 0, background: color, opacity: k, mixBlendMode: "screen", pointerEvents: "none" }} />);

// ---------- paper and ink ----------
export const PaperDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="paperTex" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n" />
        <feColorMatrix in="n" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.16  0 0 0 0.22 0" result="g" />
        <feComposite in="g" in2="SourceGraphic" operator="in" result="t" />
        <feBlend in="SourceGraphic" in2="t" mode="multiply" />
      </filter>
      <filter id="inkRough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="5" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="2" result="speck" />
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="mask" />
        <feComposite in="d" in2="mask" operator="in" />
      </filter>
    </defs>
  </svg>
);
export const Paper: React.FC<{ w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; tone?: string }> = ({ w, h, style, children, tone = C.paper }) => (
  <div style={{ position: "absolute", width: w, height: h, background: `linear-gradient(160deg, ${tone} 0%, #DDCFB2 70%, #CDBD99 100%)`, boxShadow: "0 30px 70px rgba(0,0,0,0.55), inset 0 0 60px rgba(120,90,40,0.18)", borderRadius: 6, overflow: "hidden", ...style }}>
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <rect width={w} height={h} fill={tone} filter="url(#paperTex)" opacity={0.9} />
    </svg>
    {children}
  </div>
);
// press 0 → 1: the stamp falls from above and bites; ink spreads a little after
export const Stamp: React.FC<{ text: string; press: number; size?: number; rotate?: number; color?: string }> = ({ text, press, size = 120, rotate = -8, color = C.red }) => {
  if (press <= 0) return null;
  const fall = Math.min(1, press / 0.35);
  const sc = 1 + 1.6 * (1 - fall) ** 2;
  return (
    <div style={{ display: "inline-block", transform: `rotate(${rotate}deg) scale(${sc})`, opacity: Math.min(1, fall * 1.6) }}>
      <svg width={text.length * size * 0.52 + size * 0.7} height={size * 1.55} style={{ display: "block", overflow: "visible" }}>
        <g filter="url(#inkRough)" opacity={0.92}>
          <rect x={size * 0.12} y={size * 0.12} width={text.length * size * 0.52 + size * 0.46} height={size * 1.31} rx={size * 0.08} fill="none" stroke={color} strokeWidth={size * 0.09} />
          <text x={(text.length * size * 0.52 + size * 0.7) / 2} y={size * 1.2} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} fill={color} letterSpacing={size * 0.04}>
            {text}
          </text>
        </g>
      </svg>
    </div>
  );
};
// redaction bar that peels off to the right
export const Redact: React.FC<{ w: number; h: number; peel: number }> = ({ w, h, peel }) => (
  <div style={{ position: "absolute", inset: 0, width: w, height: h, transformOrigin: "100% 50%", transform: `perspective(600px) rotateY(${-100 * peel}deg)`, background: "#0A0907", opacity: 1 - Math.max(0, peel - 0.7) / 0.3, boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }} />
);

// ---------- the hero props ----------
// sunglasses, front view. glint 0..1 runs a reflection across both lenses; chrome frame
export const Shades: React.FC<{ w: number; glint?: number; turn?: number }> = ({ w, glint = 0.5, turn = 0 }) => {
  const h = w * 0.36;
  return (
    <svg width={w} height={h} viewBox="0 0 300 108" style={{ display: "block", overflow: "visible", transform: `perspective(900px) rotateY(${turn}deg)` }}>
      <defs>
        <linearGradient id="lens" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2622" />
          <stop offset="0.55" stopColor="#0A0908" />
          <stop offset="1" stopColor="#1B1714" />
        </linearGradient>
        <linearGradient id="frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0C2" />
          <stop offset="0.45" stopColor="#C8932F" />
          <stop offset="1" stopColor="#6E4610" />
        </linearGradient>
        <clipPath id="lenses">
          <path d="M18 22 Q20 14 32 14 L128 14 Q140 14 138 26 L132 70 Q128 94 100 94 L52 94 Q26 94 22 70 Z" />
          <path d="M282 22 Q280 14 268 14 L172 14 Q160 14 162 26 L168 70 Q172 94 200 94 L248 94 Q274 94 278 70 Z" />
        </clipPath>
      </defs>
      <path d="M0 26 L18 22 M300 26 L282 22" stroke="url(#frame)" strokeWidth="7" strokeLinecap="round" />
      <path d="M138 30 Q150 20 162 30" stroke="url(#frame)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <g clipPath="url(#lenses)">
        <rect width="300" height="108" fill="url(#lens)" />
        <rect x={-120 + glint * 420} y="-20" width="38" height="160" fill="rgba(255,236,190,0.75)" transform="skewX(-24)" />
        <rect x={-80 + glint * 420} y="-20" width="10" height="160" fill="rgba(255,236,190,0.45)" transform="skewX(-24)" />
      </g>
      <path d="M18 22 Q20 14 32 14 L128 14 Q140 14 138 26 L132 70 Q128 94 100 94 L52 94 Q26 94 22 70 Z" fill="none" stroke="url(#frame)" strokeWidth="5" />
      <path d="M282 22 Q280 14 268 14 L172 14 Q160 14 162 26 L168 70 Q172 94 200 94 L248 94 Q274 94 278 70 Z" fill="none" stroke="url(#frame)" strokeWidth="5" />
    </svg>
  );
};
// a front bust in silhouette: voluminous hair, shades, collar. Rim-lit in gold from behind.
const BUST_BODY = "M200 40 C150 40 118 60 108 92 C96 96 92 116 100 132 C96 150 104 170 116 178 C118 214 132 246 156 266 L156 300 C110 312 64 330 40 360 C20 386 12 430 10 500 L390 500 C388 430 380 386 360 360 C336 330 290 312 244 300 L244 266 C268 246 282 214 284 178 C296 170 304 150 300 132 C308 116 304 96 292 92 C282 60 250 40 200 40 Z";
const BUST_HAIR = "M104 104 C100 70 130 30 178 26 C196 14 226 16 246 28 C286 30 310 66 300 108 C292 82 270 66 244 64 C220 58 182 58 156 66 C130 70 112 84 104 104 Z";
export const Bust: React.FC<{ w: number; rim?: number; glint?: number }> = ({ w, rim = 1, glint = 0.5 }) => (
  <div style={{ position: "relative", width: w, height: w * 1.25 }}>
    <svg width={w} height={w * 1.25} viewBox="0 0 400 500" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id="rimBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {rim > 0 ? (
        <g filter="url(#rimBlur)" opacity={rim} fill="none" stroke="#F4C65A" strokeWidth="12">
          <path d={BUST_BODY} />
          <path d={BUST_HAIR} />
        </g>
      ) : null}
      <g fill="#050403">
        <path d={BUST_BODY} />
        <path d={BUST_HAIR} />
      </g>
    </svg>
    <div style={{ position: "absolute", left: w * 0.26, top: w * 0.355 }}>
      <Shades w={w * 0.48} glint={glint} />
    </div>
  </div>
);
// a figure walking toward us, backlit, with a long shadow stretched across the floor
export const Walker: React.FC<{ h: number; t: number }> = ({ h, t }) => {
  const s = Math.sin(t * 7);
  return (
    <svg width={h * 0.45} height={h} viewBox="0 0 180 400" style={{ display: "block", overflow: "visible" }}>
      <g fill="#050403">
        <ellipse cx="90" cy="38" rx="24" ry="28" />
        <path d="M66 26 C70 6 110 4 116 26 C110 18 76 16 66 26 Z" />
        <path d="M54 76 Q90 62 126 76 L134 200 Q90 212 46 200 Z" />
        <path d={`M54 84 L${34 - s * 6} 196 L${46 - s * 6} 198 L68 100 Z`} />
        <path d={`M126 84 L${146 + s * 6} 196 L${134 + s * 6} 198 L112 100 Z`} />
        <path d={`M58 200 L${52 + s * 14} 388 L${72 + s * 14} 390 L90 214 Z`} />
        <path d={`M122 200 L${128 - s * 14} 388 L${108 - s * 14} 390 L90 214 Z`} />
      </g>
    </svg>
  );
};
export const Keys: React.FC<{ size: number; swing: number }> = ({ size, swing }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" style={{ display: "block", overflow: "visible", transformOrigin: "50% 8%", transform: `rotate(${swing}deg)` }}>
    <defs>
      <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF0C2" />
        <stop offset="0.5" stopColor="#C8932F" />
        <stop offset="1" stopColor="#5E3B0C" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="40" r="32" fill="none" stroke="url(#kg)" strokeWidth="9" />
    {[-22, 0, 22].map((a, i) => (
      <g key={i} transform={`rotate(${a + swing * 0.3 * (i - 1)} 100 70)`}>
        <rect x="93" y="70" width="14" height="150" rx="5" fill="url(#kg)" />
        <circle cx="100" cy="82" r="18" fill="url(#kg)" />
        <circle cx="100" cy="82" r="7" fill="#0D0B09" />
        <path d={`M107 ${178 + i * 6} h22 v10 h-10 v10 h-12 Z`} fill="url(#kg)" />
      </g>
    ))}
  </svg>
);
export const Fingerprint: React.FC<{ size: number; scan: number; reveal: number }> = ({ size, scan, reveal }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 200 250" style={{ display: "block", overflow: "visible" }}>
    <defs>
      <clipPath id="fpr">
        <rect x="0" y="0" width="200" height={250 * reveal} />
      </clipPath>
    </defs>
    <g clipPath="url(#fpr)" fill="none" stroke="#2A1A0A" strokeWidth="3.2" strokeLinecap="round" opacity="0.85">
      {Array.from({ length: 13 }, (_, i) => {
        const rx = 14 + i * 6.2, ry = 18 + i * 7.6;
        const gap = 0.35 + 0.3 * hash(i);
        const a0 = Math.PI * (1.05 + gap * 0.2), a1 = Math.PI * (3.0 - gap * 0.5);
        const p = (a: number) => `${100 + rx * Math.cos(a) * (1 + 0.04 * Math.sin(a * 5 + i))} ${130 + ry * Math.sin(a)}`;
        return <path key={i} d={`M ${p(a0)} A ${rx} ${ry} 0 1 1 ${p(a1)}`} />;
      })}
    </g>
    <rect x="0" y={250 * scan - 3} width="200" height="6" fill="#E8B64A" opacity={scan > 0 && scan < 1 ? 0.9 : 0} style={{ filter: "drop-shadow(0 0 10px #E8B64A)" }} />
  </svg>
);
export const Seal: React.FC<{ size: number; text: string; press?: number; sweep?: number }> = ({ size, text, press = 1, sweep = 0.5 }) => {
  const sc = 1 + 0.5 * (1 - Math.min(1, press / 0.3)) ** 2;
  return (
    <div style={{ width: size, height: size, transform: `scale(${sc})`, opacity: Math.min(1, press * 3) }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <radialGradient id="wax" cx="0.38" cy="0.32" r="0.8">
            <stop offset="0" stopColor="#FFE7A6" />
            <stop offset="0.35" stopColor="#D9A13C" />
            <stop offset="0.75" stopColor="#8E5B14" />
            <stop offset="1" stopColor="#4A2C05" />
          </radialGradient>
          <path id="ring" d="M100 100 m-66 0 a66 66 0 1 1 132 0 a66 66 0 1 1 -132 0" />
          <clipPath id="waxClip">
            <circle cx="100" cy="100" r="92" />
          </clipPath>
        </defs>
        <path d={Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, r = 92 + (i % 2 ? 6 : 0) + 3 * hash(i); return `${i ? "L" : "M"}${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)}`; }).join(" ") + "Z"} fill="url(#wax)" />
        <circle cx="100" cy="100" r="74" fill="none" stroke="#6E4610" strokeWidth="3" opacity="0.7" />
        <text fontFamily={DISPLAY} fontSize="19" letterSpacing="5" fill="#5A3608">
          <textPath href="#ring" startOffset="0">{`★ ${text} ★ ${text} `}</textPath>
        </text>
        <g clipPath="url(#waxClip)">
          <rect x={-120 + sweep * 420} y="-20" width="30" height="240" fill="rgba(255,245,215,0.35)" transform="skewX(-22)" />
        </g>
      </svg>
    </div>
  );
};
// paper shards flying out from the centre on the drop
export const Shards: React.FC<{ k: number; n?: number }> = ({ k, n = 46 }) =>
  k <= 0 || k >= 1 ? null : (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i) * Math.PI * 2, sp = 500 + hash(i + 2) * 1300;
        const e = 1 - (1 - k) ** 3;
        const x = W / 2 + Math.cos(a) * sp * e, y = H / 2 + Math.sin(a) * sp * e + 400 * k * k;
        const s = 30 + hash(i + 4) * 90, r = (hash(i + 6) - 0.5) * 900 * k;
        const pts = [0, 1, 2, 3].map((j) => { const b = (j / 4) * Math.PI * 2 + hash(i * 4 + j); return `${Math.cos(b) * s * (0.6 + 0.4 * hash(i + j))},${Math.sin(b) * s * 0.7}`; }).join(" ");
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={1 - k * 0.8}>
            <polygon points={pts} fill={i % 5 === 0 ? "#F4C65A" : C.paper} stroke={i % 5 === 0 ? "#FFF0C2" : "#B89A5E"} strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
export const Bars: React.FC<{ n?: number; light?: number }> = ({ n = 9, light = 1 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: (i + 0.5) * (W / n) - 14, top: 0, width: 28, height: H, background: "linear-gradient(90deg, #050403, #2A241D 45%, #050403)", boxShadow: `0 0 ${40 * light}px rgba(255,200,120,${0.08 * light})` }} />
    ))}
  </div>
);
