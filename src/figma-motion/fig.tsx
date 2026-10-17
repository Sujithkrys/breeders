// Figma's own film language, rebuilt (from Figma's launch films in "new references/videos/figma ref1"): regular-weight
// grotesk titles (Inter Tight 400, sentence case) white on black over a drifting code texture, or top-left on flat
// colour blocks; Figma frames with their "{ } name" label and blue selection; multiplayer cursors with name tags;
// the white agent prompt box with the blue send button; flat Figma UI3 pieces; plum code tiles.
import React from "react";
import { ramp } from "../utils";

export const C = {
  black: "#000000", lav: "#C4B9FD", lime: "#E3F79C", green: "#0C5A2F", greenText: "#E6F5C2", yellow: "#F6E05E",
  canvas: "#E6E6E6", blue: "#0D99FF", ink: "#1E1E1E", sub: "#8A8A8A", line: "#E6E6E6", purple: "#9747FF", plum: "#5B2A5E", red: "#F24E1E",
};
export const TITLE = "'Inter Tight', Inter, sans-serif";
export const UI = "Inter, sans-serif";
export const MONO = "'Geist Mono', monospace";

// ---------- black with a drifting, half-dissolved code texture ----------
const CODE_WORDS = "--color-card-foreground:var(--card);--color-primary:var(--primary);--color-secondary-foreground:var(--secondary);--color-muted:var(--muted);--color-border:var(--border);--color-ring:var(--ring);--color-chart-1:var(--chart-1);--radius-sm:calc(var(--radius) - 4px);--ease-out:cubic-bezier(0.16,1,0.3,1);--duration:600ms;--motion-spin:360deg;--keyframe-0:translateX(0);";
export const CodeBg: React.FC<{ t: number; color?: string; ink?: string }> = ({ t, color = C.black, ink = "rgba(255,255,255,0.08)" }) => {
  const rows = 11, cols = 42;
  return (
    <div style={{ position: "absolute", inset: 0, background: color, overflow: "hidden" }}>
      {Array.from({ length: rows }, (_, r) => {
        const off = (r * 37) % CODE_WORDS.length;
        const line = (CODE_WORDS + CODE_WORDS).slice(off, off + cols + 8);
        return (
          <div key={r} style={{ position: "absolute", left: -40 - ((t * 18 * (r % 2 ? 1 : -1)) % 60), top: r * 100 - 6, fontFamily: MONO, fontSize: 88, lineHeight: "100px", whiteSpace: "pre", color: ink }}>
            {line.split("").map((ch, i) => {
              const h = Math.abs(Math.sin((r + 1) * 91.7 + i * 12.3 + Math.floor(t * 2) * 0.37)) % 1;
              return <span key={i} style={{ opacity: h > 0.42 ? 1 : 0.1 }}>{ch}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// ---------- titles: words appear one after another, no bold ----------
export type TW = [string, number];
export const Title: React.FC<{ t: number; lines: TW[][]; size?: number; color?: string; align?: "center" | "left"; style?: React.CSSProperties }> = ({ t, lines, size = 84, color = "#fff", align = "center", style }) => (
  <div style={{ position: "absolute", fontFamily: TITLE, fontWeight: 400, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1.06, color, textAlign: align, whiteSpace: "pre", ...style }}>
    {lines.map((ln, i) => (
      <div key={i}>
        {ln.map(([w, at], j) => {
          const p = ramp(t, [at, at + 0.12]);
          return <span key={j} style={{ opacity: p }}>{w}{j < ln.length - 1 ? " " : ""}</span>;
        })}
      </div>
    ))}
  </div>
);

// ---------- a Figma frame: "{ } name" label, blue selection, size chip ----------
export const Frame: React.FC<{ name: string; w: number; h: number; sel?: number; size?: string; children: React.ReactNode; style?: React.CSSProperties; scale?: number; motion?: number }> = ({ name, w, h, sel = 0, size, children, style, scale = 1, motion = 0 }) => {
  const col = motion > 0.5 ? C.purple : C.blue;
  return (
    <div style={{ position: "absolute", width: w, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 * scale, height: 30 * scale, fontFamily: UI, fontSize: 16 * scale, color: sel ? col : "#6B6B6B", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 14 * scale }}>{"{ }"}</span>
        {name}
        {motion > 0 ? <span style={{ fontSize: 12 * scale, fontWeight: 600, color: "#fff", background: C.purple, borderRadius: 4 * scale, padding: `${2 * scale}px ${7 * scale}px`, opacity: motion }}>Motion</span> : null}
        {sel ? (
          <span style={{ marginLeft: "auto", display: "flex", gap: 10 * scale, alignItems: "center" }}>
            <svg width={16 * scale} height={16 * scale} viewBox="0 0 16 16"><path d="M9 2h5v5M14 2L9 7M7 14H2V9M2 14l5-5" stroke={col} strokeWidth={1.5} fill="none" /></svg>
            <span style={{ width: 20 * scale, height: 20 * scale, borderRadius: 4 * scale, background: col, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={10 * scale} height={10 * scale} viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="#fff" /></svg>
            </span>
          </span>
        ) : null}
      </div>
      <div style={{ position: "relative", width: w, height: h, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
        {children}
        {sel ? <div style={{ position: "absolute", inset: 0, border: `${2 * scale}px solid ${col}`, opacity: sel }} /> : null}
      </div>
      {sel && size ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 * scale }}>
          <span style={{ background: col, color: "#fff", fontFamily: UI, fontSize: 13 * scale, fontWeight: 500, padding: `${3 * scale}px ${8 * scale}px`, borderRadius: 4 * scale }}>{size}</span>
        </div>
      ) : null}
    </div>
  );
};

// ---------- multiplayer cursor with a name tag ----------
export const NameCursor: React.FC<{ x: number; y: number; name: string; color: string; scale?: number; press?: number; flip?: boolean }> = ({ x, y, name, color, scale = 1, press = 0, flip }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 40, transform: `scale(${scale * (1 - 0.08 * press)})`, transformOrigin: "0 0" }}>
    <svg width={30} height={30} viewBox="0 0 24 24" style={{ position: "absolute", left: -4, top: -4, transform: flip ? "scaleX(-1)" : undefined, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}>
      <path d="M3 2l18 7.5-8 2.2L9.5 20z" fill={color} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
    <div style={{ position: "absolute", left: 26, top: 24, background: color, color: "#fff", fontFamily: UI, fontSize: 22, fontWeight: 500, padding: "5px 12px", borderRadius: 6, whiteSpace: "nowrap" }}>{name}</div>
  </div>
);
// the system pointer (black arrow), as in Figma's films
export const Arrow: React.FC<{ x: number; y: number; size?: number; press?: number }> = ({ x, y, size = 46, press = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", left: x - size * 0.12, top: y - size * 0.08, zIndex: 50, transform: `scale(${1 - 0.1 * press})`, transformOrigin: "10% 10%", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.3))" }}>
    <path d="M3 2v18l5-4.6 3.4 7.6 3-1.4-3.3-7.4H18z" fill="#111" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
  </svg>
);

// ---------- the agent prompt box ----------
export const PromptBox: React.FC<{ w: number; text: string; caret?: boolean; placeholder?: string; ready?: boolean; press?: number; size?: number; chip?: string }> = ({ w, text, caret, placeholder = "Ask for changes", ready, press = 0, size = 34, chip }) => (
  <div style={{ position: "relative", width: w, borderRadius: size * 0.75, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)", padding: `${size * 0.8}px ${size * 0.85}px ${size * 0.6}px`, boxSizing: "border-box", fontFamily: UI }}>
    {chip ? <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.25, background: "#E5F4FF", color: C.blue, fontSize: size * 0.6, padding: `${size * 0.12}px ${size * 0.3}px`, borderRadius: size * 0.2, marginBottom: size * 0.4 }}># {chip}</div> : null}
    <div style={{ fontSize: size, lineHeight: 1.3, color: text ? C.ink : "#A0A0A0", minHeight: size * 2.6, letterSpacing: "-0.01em" }}>
      {text || placeholder}
      {caret ? <span style={{ display: "inline-block", width: Math.max(2, size * 0.06), height: size * 1.1, background: C.ink, verticalAlign: "middle", marginLeft: 2 }} /> : null}
    </div>
    <div style={{ display: "flex", alignItems: "center", marginTop: size * 0.4, color: "#555" }}>
      <span style={{ fontSize: size * 1.05, lineHeight: 1 }}>+</span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: size * 0.6 }}>
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 16 16"><path d="M4 2v12M12 2v12M2 6h4M10 10h4" stroke="#555" strokeWidth={1.4} /></svg>
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 16 16"><rect x={5.5} y={1.5} width={5} height={9} rx={2.5} stroke="#555" strokeWidth={1.4} fill="none" /><path d="M3 8a5 5 0 0 0 10 0M8 13v2" stroke="#555" strokeWidth={1.4} fill="none" /></svg>
        <span style={{ width: size * 1.1, height: size * 1.1, borderRadius: "50%", background: ready ? C.blue : "#D6D6D6", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.12 * press})` }}>
          <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 14 14"><path d="M7 12V2M3 6l4-4 4 4" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </span>
    </div>
  </div>
);

// ---------- the Motion timeline (flat Figma UI) ----------
export const ROWS = ["Header", "Sleeve", "Vinyl", "Tracks", "Play"];
export type Key = { row: number; t: number; pop?: number };
export const TL = { head: 58, ruler: 34, row: 50, label: 190, dur: 1.6 };
export const tlPx = (w: number) => (w - TL.label - 40) / TL.dur;
export const Timeline: React.FC<{ w: number; playhead: number; keys: Key[]; bars?: number[]; label?: string }> = ({ w, playhead, keys, bars, label = "Ease out · 600 ms" }) => {
  const px = tlPx(w), x0 = TL.label + 20, h = TL.head + TL.ruler + ROWS.length * TL.row + 10;
  return (
    <div style={{ position: "relative", width: w, height: h, background: "#fff", borderRadius: 16, boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.08)", fontFamily: UI, color: C.ink, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: TL.head, padding: "0 20px", borderBottom: `1px solid ${C.line}` }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={12} height={12} viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="#fff" /></svg>
        </span>
        <span style={{ fontSize: 19, fontWeight: 600 }}>Motion</span>
        <span style={{ fontFamily: MONO, fontSize: 16, color: C.sub, marginLeft: 6 }}>{playhead.toFixed(2)}s</span>
        <span style={{ marginLeft: "auto", fontSize: 15, color: C.sub }}>{label}</span>
      </div>
      <div style={{ position: "absolute", left: x0, right: 0, top: TL.head, height: TL.ruler, borderBottom: `1px solid ${C.line}` }}>
        {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ position: "absolute", left: i * 0.2 * px + 6, top: 8, fontFamily: MONO, fontSize: 12, color: "#AAA" }}>{(i * 0.2).toFixed(1)}</div>)}
      </div>
      {ROWS.map((r, i) => (
        <div key={r} style={{ position: "absolute", left: 0, right: 0, top: TL.head + TL.ruler + i * TL.row, height: TL.row, display: "flex", alignItems: "center", borderBottom: "1px solid #F2F2F2" }}>
          <span style={{ width: TL.label, paddingLeft: 20, fontSize: 16, color: "#333", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width={12} height={12} viewBox="0 0 12 12"><rect x={1} y={1} width={10} height={10} rx={2} stroke="#999" strokeWidth={1.2} fill="none" /></svg>
            {r}
          </span>
          {bars && bars[i] > 0 ? <div style={{ position: "absolute", left: x0 + START[i] * px, width: LEN[i] * px * bars[i], height: 6, borderRadius: 3, background: "rgba(151,71,255,0.22)" }} /> : null}
        </div>
      ))}
      {keys.map((k, i) => {
        const p = k.pop ?? 1;
        if (p <= 0) return null;
        const over = 0.35 * Math.max(0, 1 - Math.abs(p - 0.75) * 4);
        return <div key={i} style={{ position: "absolute", left: x0 + k.t * px - 8, top: TL.head + TL.ruler + k.row * TL.row + TL.row / 2 - 8, width: 16, height: 16, transform: `rotate(45deg) scale(${0.4 + 0.6 * Math.min(1, p) + over})`, background: "#fff", border: `2.5px solid ${C.purple}`, borderRadius: 2, opacity: Math.min(1, p * 2) }} />;
      })}
      <div style={{ position: "absolute", left: x0 + playhead * px - 1, top: TL.head, bottom: 0, width: 2, background: C.red }}>
        <div style={{ position: "absolute", top: 0, left: -7, width: 16, height: 14, borderRadius: 3, background: C.red }} />
      </div>
    </div>
  );
};
// the animation: each row starts at START[r] and lasts LEN[r]
export const START = [0, 0.1, 0.35, 0.55, 0.75];
export const LEN = [0.45, 0.5, 0.75, 0.6, 0.4];
export const tlX0 = TL.label + 20;

// ---------- right panel crop: Motion section ----------
export const MotionPanel: React.FC<{ on: number; preset?: number; scale?: number }> = ({ on, preset = -1, scale = 1 }) => {
  const s = scale;
  return (
    <div style={{ width: 380 * s, background: "#fff", borderRadius: 14 * s, boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.1)", fontFamily: UI, color: C.ink, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 18 * s, padding: `${14 * s}px ${18 * s}px`, borderBottom: `1px solid ${C.line}`, fontSize: 15 * s, fontWeight: 600 }}>
        <span>Design</span><span style={{ color: C.sub, fontWeight: 500 }}>Prototype</span>
      </div>
      <div style={{ padding: `${16 * s}px ${18 * s}px`, display: "grid", gap: 14 * s }}>
        <div style={{ fontSize: 14 * s, fontWeight: 600 }}>Frame</div>
        <div style={{ display: "flex", gap: 8 * s }}>
          {["W 390", "H 844", "X 0", "Y 0"].map((v) => <div key={v} style={{ flex: 1, padding: `${7 * s}px ${8 * s}px`, borderRadius: 6 * s, background: "#F5F5F5", fontSize: 13 * s, color: C.sub, whiteSpace: "nowrap" }}>{v}</div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: `${12 * s}px ${14 * s}px`, borderRadius: 10 * s, border: `${1.5 * s}px solid ${on > 0.5 ? C.purple : C.line}`, background: on > 0.5 ? "rgba(151,71,255,0.07)" : "#fff" }}>
          <svg width={18 * s} height={18 * s} viewBox="0 0 10 10" style={{ marginRight: 10 * s }}><path d="M2 1l7 4-7 4z" fill={on > 0.5 ? C.purple : C.ink} /></svg>
          <span style={{ fontSize: 17 * s, fontWeight: 600, color: on > 0.5 ? C.purple : C.ink }}>Motion</span>
          <span style={{ marginLeft: "auto", width: 40 * s, height: 24 * s, borderRadius: 12 * s, background: on > 0.5 ? C.purple : "#D9D9D9", position: "relative" }}>
            <span style={{ position: "absolute", top: 3 * s, left: (3 + 16 * on) * s, width: 18 * s, height: 18 * s, borderRadius: 9 * s, background: "#fff" }} />
          </span>
        </div>
        <div style={{ fontSize: 14 * s, fontWeight: 600, opacity: on }}>Presets</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 * s, opacity: on }}>
          {["Fade", "Rotate", "Scale", "Resize"].map((p, i) => (
            <div key={p} style={{ padding: `${9 * s}px ${12 * s}px`, borderRadius: 8 * s, background: i === preset ? C.purple : "#F5F5F5", color: i === preset ? "#fff" : C.ink, fontSize: 14 * s, fontWeight: 500 }}>{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Figma UI3 bottom toolbar, with Motion ----------
export const Toolbar: React.FC<{ active?: number; scale?: number }> = ({ active = 0, scale = 1 }) => {
  const s = scale;
  const icons = ["M3 2l9 5-4 1.2L6.5 13z", "M4 1v14M12 1v14M1 4h14M1 12h14", "M2.5 3.5h11v9h-11z", "M3 13l2-5 6-6 3 3-6 6z", "M3 3h10M8 3v10", "M5 3L1 8l4 5M11 3l4 5-4 5", "M2.5 3.5h11v7h-6l-3 3v-3h-2z", "M5 3.5v9l7-4.5z"];
  return (
    <div style={{ display: "flex", gap: 6 * s, padding: 8 * s, borderRadius: 14 * s, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.12)" }}>
      {icons.map((d, i) => {
        const on = i === active;
        const motion = i === icons.length - 1;
        return (
          <div key={i} style={{ width: 46 * s, height: 46 * s, borderRadius: 10 * s, display: "flex", alignItems: "center", justifyContent: "center", background: on ? (motion ? C.purple : C.blue) : "transparent" }}>
            <svg width={20 * s} height={20 * s} viewBox="0 0 16 16"><path d={d} fill={motion ? (on ? "#fff" : C.purple) : "none"} stroke={on ? "#fff" : motion ? C.purple : C.ink} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        );
      })}
    </div>
  );
};

// ---------- a code tile (plum, as in Figma's films) ----------
export const CodeTile: React.FC<{ file: string; lines: string[]; w: number; t: number; at: number; bg?: string; size?: number }> = ({ file, lines, w, t, at, bg = C.plum, size = 26 }) => (
  <div style={{ width: w, background: bg, borderRadius: 18, padding: "26px 30px", boxSizing: "border-box", fontFamily: MONO, color: "#F3E8F5" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: size * 0.95, marginBottom: 18, color: "#fff" }}>
      <span style={{ opacity: 0.8 }}>{"</>"}</span>{file}
    </div>
    {lines.map((ln, i) => {
      const o = ramp(t, [at + i * 0.04, at + i * 0.04 + 0.15]);
      return (
        <div key={i} style={{ fontSize: size, lineHeight: 1.55, whiteSpace: "pre", opacity: o, transform: `translateX(${(1 - o) * 16}px)` }}>
          <span style={{ display: "inline-block", width: size * 1.6, opacity: 0.45 }}>{i + 1}</span>
          {hl(ln)}
        </div>
      );
    })}
  </div>
);
const TOK = /("[^"]*")|(-?\b\d+(?:\.\d+)?(?:ms|px|deg|s)?\b)|(\b(?:import|from|export|function|return|const|animation|@keyframes|from|to)\b)/g;
const hl = (line: string) => {
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null;
  TOK.lastIndex = 0;
  while ((m = TOK.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    out.push(<span key={m.index} style={{ color: m[1] ? "#D9F56A" : m[2] ? "#FFC08A" : "#C9A8FF" }}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  out.push(line.slice(last));
  return out;
};
