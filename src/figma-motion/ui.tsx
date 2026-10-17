// Figma (UI3, light) rebuilt for the Figma Motion launch film: floating layers and properties panels, the bottom tool
// bar, the canvas with a sample app design (a travel app, original), the Motion timeline, the agent prompt and Dev Mode.
// The film is unofficial; only features Figma announced for Motion (Config 2026) are shown.
import React from "react";

export const F = {
  canvas: "#F5F5F5",
  panel: "#FFFFFF",
  line: "#E6E6E6",
  ink: "#1E1E1E",
  sub: "#7A7A7A",
  faint: "#B3B3B3",
  blue: "#0D99FF",
  blueSoft: "#E5F4FF",
  purple: "#9747FF",
  red: "#F24E1E",
  orange: "#FF7262",
  violet: "#A259FF",
  cyan: "#1ABCFE",
  green: "#0ACF83",
  dark: "#1E1E1E",
  dark2: "#2C2C2C",
};
export const SANS = "Inter, sans-serif";
export const MONO = "'Geist Mono', monospace";

// ---------- the Figma mark: five shapes ----------
export const FigmaMark: React.FC<{ size: number; parts?: (i: number) => { x: number; y: number; s: number; o: number } }> = ({ size, parts }) => {
  // proper Figma geometry on a 40×120 grid
  const geo: [string, string][] = [
    ["M40 0h20a20 20 0 0 1 0 40H40z", F.orange],
    ["M0 20A20 20 0 0 1 20 0h20v40H20A20 20 0 0 1 0 20z", F.red],
    ["M0 60A20 20 0 0 1 20 40h20v40H20A20 20 0 0 1 0 60z", F.violet],
    ["M40 60a20 20 0 1 1 40 0 20 20 0 0 1-40 0z", F.cyan],
    ["M0 100a20 20 0 0 1 20-20h20v20a20 20 0 1 1-40 0z", F.green],
  ];
  return (
    <svg width={size * (80 / 120)} height={size} viewBox="0 0 80 120" style={{ display: "block", overflow: "visible" }}>
      {geo.map(([d, c], i) => {
        const p = parts ? parts(i) : { x: 0, y: 0, s: 1, o: 1 };
        return <path key={i} d={d} fill={c} opacity={p.o} transform={`translate(${p.x} ${p.y}) translate(40 60) scale(${p.s}) translate(-40 -60)`} />;
      })}
    </svg>
  );
};

// ---------- small icons ----------
const Ic: React.FC<{ d: string; size?: number; c?: string }> = ({ d, size = 16, c = F.ink }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", flexShrink: 0 }}>
    <path d={d} fill="none" stroke={c} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const I = {
  frame: "M4 1v14M12 1v14M1 4h14M1 12h14",
  rect: "M2.5 3.5h11v9h-11z",
  text: "M3 3h10M8 3v10",
  move: "M3 2l9 5-4 1.2L6.5 13z",
  pen: "M3 13l2-5 6-6 3 3-6 6z",
  comment: "M2.5 3.5h11v7h-6l-3 3v-3h-2z",
  play: "M5 3.5v9l7-4.5z",
  diamond: "M8 3l5 5-5 5-5-5z",
  code: "M6 4L2 8l4 4M10 4l4 4-4 4",
  sparkle: "M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2",
};

// ---------- the sample design: a travel app screen (original) ----------
// k: 0..1 per card for the "fly in" animation the agent creates; when absent the cards sit in place
export type AppAnim = { cards?: number[]; title?: number; button?: number };
const CARDS: { name: string; days: string; g: string }[] = [
  { name: "Kyoto", days: "5 nights", g: "linear-gradient(160deg,#F9C9A8 0%,#E8735A 55%,#7A2E3B 100%)" },
  { name: "Lisbon", days: "4 nights", g: "linear-gradient(160deg,#BDE3F2 0%,#5BA7D9 55%,#1F4E8C 100%)" },
  { name: "Cape Town", days: "6 nights", g: "linear-gradient(160deg,#D8F0C2 0%,#6CBF84 55%,#1E5E52 100%)" },
];
export const AppScreen: React.FC<{ w: number; anim?: AppAnim; grey?: number }> = ({ w, anim = {}, grey = 0 }) => {
  const s = w / 390, h = 844 * s;
  const card = (i: number) => {
    const k = anim.cards ? anim.cards[i] : 1;
    return { transform: `translateX(${(1 - k) * 420 * s}px) rotate(${(1 - k) * 8}deg)`, opacity: Math.min(1, k * 1.5) };
  };
  return (
    <div style={{ position: "relative", width: w, height: h, background: "#FCFAF7", borderRadius: 28 * s, overflow: "hidden", fontFamily: SANS, filter: grey ? `grayscale(${grey}) contrast(${1 - 0.2 * grey})` : undefined }}>
      <div style={{ position: "absolute", left: 24 * s, top: 70 * s, opacity: anim.title ?? 1, transform: `translateY(${(1 - (anim.title ?? 1)) * 30 * s}px)` }}>
        <div style={{ fontSize: 15 * s, color: "#9A8F84", fontWeight: 500 }}>Good morning, Ana</div>
        <div style={{ fontSize: 34 * s, color: "#1C1714", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 6 * s }}>Find your next<br />escape</div>
      </div>
      {CARDS.map((c, i) => (
        <div key={c.name} style={{ position: "absolute", left: 24 * s, top: (220 + i * 172) * s, width: 342 * s, height: 156 * s, borderRadius: 22 * s, background: c.g, boxShadow: `0 ${12 * s}px ${30 * s}px rgba(60,40,20,0.18)`, ...card(i) }}>
          <div style={{ position: "absolute", left: 18 * s, bottom: 16 * s, color: "#fff" }}>
            <div style={{ fontSize: 22 * s, fontWeight: 600, letterSpacing: "-0.02em" }}>{c.name}</div>
            <div style={{ fontSize: 13 * s, opacity: 0.85, marginTop: 2 * s }}>{c.days}</div>
          </div>
          <div style={{ position: "absolute", right: 16 * s, top: 16 * s, width: 34 * s, height: 34 * s, borderRadius: 17 * s, background: "rgba(255,255,255,0.3)" }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 24 * s, right: 24 * s, bottom: 40 * s, height: 56 * s, borderRadius: 28 * s, background: "#1C1714", color: "#fff", fontSize: 17 * s, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.9 + 0.1 * (anim.button ?? 1)})`, opacity: anim.button ?? 1 }}>Plan a trip</div>
    </div>
  );
};

// ---------- panels ----------
const Panel: React.FC<{ style: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", background: F.panel, borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)", border: `1px solid ${F.line}`, fontFamily: SANS, fontSize: 13, color: F.ink, overflow: "hidden", ...style }}>{children}</div>
);
const LAYERS = ["Halo — Home", "Balance", "Card / Graphite", "Card / Aurora", "Card / Pearl", "Activity"];
export const LayersPanel: React.FC<{ sel?: number }> = ({ sel = 0 }) => (
  <Panel style={{ left: 16, top: 16, width: 248, bottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 14px 10px" }}>
      <FigmaMark size={18} />
      <div style={{ fontWeight: 600 }}>Halo</div>
      <div style={{ marginLeft: "auto", color: F.sub, fontSize: 12 }}>Drafts</div>
    </div>
    <div style={{ display: "flex", gap: 16, padding: "6px 14px 10px", borderBottom: `1px solid ${F.line}`, fontWeight: 600 }}>
      <span>Layers</span>
      <span style={{ color: F.sub, fontWeight: 500 }}>Assets</span>
    </div>
    <div style={{ padding: "8px 6px" }}>
      {LAYERS.map((l, i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: `0 ${8 + (i ? 16 : 0)}px`, borderRadius: 6, background: i === sel ? F.blueSoft : "transparent" }}>
          <Ic d={i ? (i === 1 ? I.text : I.rect) : I.frame} size={14} c={i === sel ? F.blue : F.sub} />
          <span style={{ fontWeight: i ? 400 : 600 }}>{l}</span>
        </div>
      ))}
    </div>
  </Panel>
);
export const PropsPanel: React.FC<{ motion?: number; devMode?: boolean }> = ({ motion = 0, devMode }) => (
  <Panel style={{ right: 16, top: 16, width: 264, bottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: `1px solid ${F.line}` }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, background: "#C9B8FF", color: "#3B2A7A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12 }}>A</div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ padding: "6px 10px", borderRadius: 8, background: devMode ? "#1E1E1E" : F.canvas, color: devMode ? "#fff" : F.ink, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Ic d={I.code} size={13} c={devMode ? "#7CFFB2" : F.ink} />
          Dev Mode
        </div>
        <div style={{ padding: "6px 12px", borderRadius: 8, background: F.blue, color: "#fff", fontWeight: 600, fontSize: 12 }}>Share</div>
      </div>
    </div>
    <div style={{ padding: "12px 14px", display: "grid", gap: 14 }}>
      <div style={{ fontWeight: 600 }}>Frame</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["X 0", "Y 0", "W 390", "H 844"].map((v) => (
          <div key={v} style={{ flex: 1, padding: "6px 7px", borderRadius: 6, background: F.canvas, fontSize: 11.5, color: F.sub, whiteSpace: "nowrap" }}>{v}</div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: motion ? `rgba(151,71,255,${0.08 * motion})` : F.canvas, border: `1px solid ${motion ? F.purple : F.line}` }}>
        <span style={{ fontWeight: 600, color: motion ? F.purple : F.ink }}>Motion</span>
        <div style={{ width: 30, height: 18, borderRadius: 9, background: motion ? F.purple : "#D9D9D9", position: "relative" }}>
          <div style={{ position: "absolute", top: 2, left: 2 + 12 * motion, width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
        </div>
      </div>
      <div style={{ fontWeight: 600 }}>Fill</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, background: "#0B0B0D", border: `1px solid ${F.line}` }} />
        <span style={{ color: F.sub }}>0B0B0D</span>
      </div>
    </div>
  </Panel>
);
export const Toolbar: React.FC<{ bottom?: number }> = ({ bottom = 20 }) => (
  <div style={{ position: "absolute", left: "50%", bottom, transform: "translateX(-50%)", display: "flex", gap: 4, padding: 6, borderRadius: 12, background: F.panel, boxShadow: "0 4px 18px rgba(0,0,0,0.12)", border: `1px solid ${F.line}` }}>
    {[I.move, I.frame, I.rect, I.pen, I.text, I.comment].map((d, i) => (
      <div key={i} style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? F.blue : "transparent" }}>
        <Ic d={d} size={16} c={i === 0 ? "#fff" : F.ink} />
      </div>
    ))}
  </div>
);

// ---------- the Motion timeline ----------
export const TL = { rows: ["Title", "Card / Kyoto", "Card / Lisbon", "Card / Cape Town", "Button"], dur: 2.0, labelW: 180, pxPerS: 360 };
export type Key = { row: number; t: number; pop?: number; sel?: boolean };
export const Timeline: React.FC<{ w: number; playhead: number; keys: Key[]; bars?: number[] }> = ({ w, playhead, keys, bars }) => {
  const x0 = TL.labelW + 16;
  return (
    <div style={{ position: "relative", width: w, height: 236, background: F.panel, borderRadius: 14, border: `1px solid ${F.line}`, boxShadow: "0 -6px 28px rgba(0,0,0,0.08)", fontFamily: SANS, fontSize: 13, color: F.ink, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42, padding: "0 14px", borderBottom: `1px solid ${F.line}` }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: F.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic d={I.play} size={14} c="#fff" />
        </div>
        <span style={{ fontWeight: 600 }}>Motion</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: F.sub, marginLeft: 8 }}>{playhead.toFixed(2)}s</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: F.sub }}>Ease out · 300 ms</span>
      </div>
      {/* ruler */}
      <div style={{ position: "absolute", left: x0, top: 42, right: 0, height: 24, borderBottom: `1px solid ${F.line}` }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: i * (TL.pxPerS / 4), top: 4, fontFamily: MONO, fontSize: 10, color: F.faint }}>{(i * 0.25).toFixed(2)}</div>
        ))}
      </div>
      {TL.rows.map((r, i) => (
        <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 66 + i * 33, height: 33, borderBottom: `1px solid #F2F2F2`, display: "flex", alignItems: "center" }}>
          <div style={{ width: TL.labelW, paddingLeft: 14, color: F.ink, fontSize: 12.5 }}>{r}</div>
          {bars && bars[i] > 0 ? <div style={{ position: "absolute", left: x0 + (i * 0.12) * TL.pxPerS, height: 6, width: 0.5 * TL.pxPerS * bars[i], borderRadius: 3, background: "rgba(151,71,255,0.25)" }} /> : null}
        </div>
      ))}
      {keys.map((k, i) => {
        const p = k.pop ?? 1;
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x0 + k.t * TL.pxPerS - 7, top: 66 + k.row * 33 + 9, width: 14, height: 14, transform: `rotate(45deg) scale(${0.4 + 0.6 * Math.min(1, p) + 0.25 * Math.max(0, 1 - Math.abs(p - 0.8) * 4)})`, background: k.sel ? F.purple : "#fff", border: `2px solid ${F.purple}`, borderRadius: 2, opacity: Math.min(1, p * 2) }} />
        );
      })}
      {/* playhead */}
      <div style={{ position: "absolute", left: x0 + playhead * TL.pxPerS, top: 42, bottom: 0, width: 2, background: F.red }}>
        <div style={{ position: "absolute", top: 0, left: -6, width: 14, height: 12, borderRadius: 3, background: F.red }} />
      </div>
    </div>
  );
};

// ---------- the easing curve editor ----------
export const EaseCurve: React.FC<{ size: number; k: number }> = ({ size, k }) => {
  // k drags the first handle from linear to a strong ease-out
  const h1 = [0.33 - 0.25 * k, 0.33 + 0.62 * k], h2 = [0.67 - 0.1 * k, 1];
  const P = (x: number, y: number) => `${x * size} ${(1 - y) * size}`;
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <rect width={size} height={size} fill="#FAFAFA" stroke={F.line} rx={10} />
      {[0.25, 0.5, 0.75].map((g) => (
        <g key={g} stroke="#EFEFEF">
          <line x1={g * size} x2={g * size} y1={0} y2={size} />
          <line y1={g * size} y2={g * size} x1={0} x2={size} />
        </g>
      ))}
      <line x1={0} y1={size} x2={h1[0] * size} y2={(1 - h1[1]) * size} stroke={F.purple} strokeWidth={1.5} />
      <line x1={size} y1={0} x2={h2[0] * size} y2={(1 - h2[1]) * size} stroke={F.purple} strokeWidth={1.5} />
      <path d={`M${P(0, 0)} C${P(h1[0], h1[1])} ${P(h2[0], h2[1])} ${P(1, 1)}`} stroke={F.ink} strokeWidth={3} fill="none" />
      <circle cx={h1[0] * size} cy={(1 - h1[1]) * size} r={7} fill="#fff" stroke={F.purple} strokeWidth={2.5} />
      <circle cx={h2[0] * size} cy={(1 - h2[1]) * size} r={7} fill="#fff" stroke={F.purple} strokeWidth={2.5} />
    </svg>
  );
};
export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={22} height={30} viewBox="0 0 22 30" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.12})`, transformOrigin: "0 0", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))", zIndex: 60 }}>
    <path d="M2 2v22l6-5.5 4 9 3.6-1.6-4-8.8H20z" fill={F.ink} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);
