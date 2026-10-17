// Yaad's interface, rebuilt from the product's own screenshots (yaad video reference/screenshots): off-white page,
// white cards, Inter for text, Geist Mono for small caps labels, the orange mark, coloured status chips.
// Parents' worlds (the clock, the keypad phone, the call) sit on a warm evening dark instead.
import React from "react";

export const Y = {
  page: "#F5F5FA",
  card: "#FFFFFF",
  line: "#E4E6EF",
  well: "#F1F2F7",
  ink: "#0E1017",
  sub: "#6B6F7E",
  mute: "#9A9EAD",
  orange: "#F4602A",
  orangeDeep: "#E8501C",
  blue: "#2F44D4",
  green: "#14A064",
  greenBg: "#E6F6EE",
  red: "#D2433B",
  redBg: "#FCEBEA",
  amber: "#C27A12",
  amberBg: "#FBF1DD",
  night: "#14110F",
  nightCard: "#1E1A17",
  warm: "#FFE9D6",
};
export const SANS = "Inter, sans-serif";
export const MONO = "'Geist Mono', monospace";
export const TELUGU = "'Noto Sans Telugu', Inter, sans-serif";

// ---------- the mark ----------
// a person raising a phone, three call waves above it, on an orange tile
export const YaadMark: React.FC<{ size: number; waves?: number; figure?: number }> = ({ size, waves = 1, figure = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
    <defs>
      <linearGradient id="ymk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F86B36" />
        <stop offset="1" stopColor="#F0531C" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#ymk)" />
    <g opacity={figure} stroke="#FFF8F2" strokeLinecap="round" fill="none">
      <path d="M30 41 L47 58" strokeWidth="12" />
      <path d="M57 58 L68 36" strokeWidth="12" />
      <path d="M50 58 L50 74" strokeWidth="12" />
      <circle cx="49.5" cy="40" r="7.5" fill="#FFF8F2" stroke="none" />
    </g>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${73 + i * 4.2} ${30 - i * 4.2} a ${6 + i * 4.5} ${6 + i * 4.5} 0 0 1 ${3.5 + i * 1.4} ${6 + i * 3}`} stroke="#FFF8F2" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity={Math.max(0, Math.min(1, waves * 3 - i))} />
    ))}
  </svg>
);

// ---------- small parts ----------
export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: Y.sub, ...style }}>{children}</div>
);
export type Status = "confirmed" | "missed" | "retry" | "scheduled" | "calling";
const CHIP: Record<Status, [string, string, string]> = {
  confirmed: ["Confirmed", Y.green, Y.greenBg],
  missed: ["Missed", Y.red, Y.redBg],
  retry: ["Retry", Y.amber, Y.amberBg],
  scheduled: ["Scheduled", Y.sub, Y.well],
  calling: ["Calling", Y.orange, "#FDECE4"],
};
export const Chip: React.FC<{ s: Status; scale?: number }> = ({ s, scale = 1 }) => {
  const [t, c, bg] = CHIP[s];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: bg, color: c, fontFamily: MONO, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase", transform: `scale(${scale})`, transformOrigin: "right center" }}>
      <div style={{ width: 7, height: 7, borderRadius: 4, background: c }} />
      {t}
    </div>
  );
};
export const Button: React.FC<{ children: React.ReactNode; press?: number; style?: React.CSSProperties }> = ({ children, press = 0, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 26px", borderRadius: 999, background: Y.orange, color: "#fff", fontFamily: SANS, fontWeight: 500, fontSize: 22, boxShadow: `0 8px 22px rgba(244,96,42,${0.3 - 0.15 * press})`, transform: `scale(${1 - 0.05 * press})`, ...style }}>
    {children}
  </div>
);
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: Y.card, borderRadius: 22, border: `1px solid ${Y.line}`, boxShadow: "0 1px 2px rgba(14,16,23,0.04), 0 18px 50px rgba(14,16,23,0.08)", ...style }}>{children}</div>
);
export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={26} height={34} viewBox="0 0 22 30" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.12})`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.25))", zIndex: 50 }}>
    <path d="M2 2v22l6-5.5 4 9 3.6-1.6-4-8.8H20z" fill="#fff" stroke={Y.ink} strokeWidth={1.5} strokeLinejoin="round" />
  </svg>
);

// ---------- voice ----------
// a voice-like waveform: bars whose heights follow syllables (bursts with gaps), seeded so every frame agrees
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const voiceLevel = (t: number, seed = 1) => {
  const syl = Math.floor(t * 5.2 + seed * 13);
  const ph = (t * 5.2 + seed * 13) % 1;
  const on = hash(syl) > 0.22 ? 1 : 0.08; // pauses between words
  const shape = Math.sin(Math.PI * ph) ** 0.7;
  return on * shape * (0.45 + 0.55 * hash(syl * 3.7 + 1));
};
// bars = a strip of past-to-present levels; talking = 0 lays it flat
export const Wave: React.FC<{ t: number; width: number; height: number; bars?: number; color?: string; talking?: number; seed?: number; reveal?: number }> = ({ t, width, height, bars = 64, color = Y.orange, talking = 1, seed = 1, reveal = 1 }) => {
  const w = width / bars;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      {Array.from({ length: bars }, (_, i) => {
        if (i / bars > reveal) return null;
        const age = (bars - 1 - i) * 0.035;
        const v = 0.06 + 0.94 * voiceLevel(t - age, seed) * talking;
        const h = Math.max(3, v * height);
        return <rect key={i} x={i * w + w * 0.22} y={(height - h) / 2} width={w * 0.56} height={h} rx={w * 0.28} fill={color} opacity={0.35 + 0.65 * (i / bars)} />;
      })}
    </svg>
  );
};

// ---------- India, as dots ----------
// rough outline in lon/lat, filled with a dot grid; cities in lon/lat
const INDIA: [number, number][] = [
  [68.2, 23.7], [68.8, 22.3], [70, 21], [72.6, 21.1], [72.8, 19], [73.4, 16], [74.6, 13], [75.8, 11], [76.6, 8.9], [77.5, 8.1], [78.2, 8.9],
  [79.3, 10.3], [79.9, 11.9], [80.3, 13.4], [80.2, 15.6], [81.3, 16.4], [82.4, 17], [84.2, 18.3], [85.2, 19.5], [86.6, 20.3], [87, 21.5],
  [88.2, 21.6], [89, 22], [88.7, 24.3], [88, 25], [89.8, 26], [92, 25], [92.6, 23.5], [93.2, 22.2], [94.2, 23.9], [95.3, 26.6], [97, 27.8],
  [96, 29], [94, 28], [92, 27.6], [89.5, 26.8], [88.1, 27.9], [86, 27.9], [84, 27.5], [81, 28.9], [79.5, 30.4], [78.8, 31.6], [79, 32.8],
  [78.5, 34.5], [77.8, 35.5], [76, 35.9], [74, 34.9], [73.8, 33.8], [74.6, 32.7], [75.4, 32.3], [74, 31.2], [73.4, 29.9], [72, 28.1],
  [70.6, 27.9], [69.6, 26.9], [70.3, 25.7], [68.8, 24.3],
];
const inside = (x: number, y: number) => {
  let c = false;
  for (let i = 0, j = INDIA.length - 1; i < INDIA.length; j = i++) {
    const [xi, yi] = INDIA[i], [xj, yj] = INDIA[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const DOTS: [number, number][] = [];
for (let lat = 37; lat > 6; lat -= 0.55) for (let lon = 67; lon < 98; lon += 0.55) if (inside(lon, lat)) DOTS.push([lon, lat]);
export const CITY = { you: [77.59, 12.97] as [number, number], amma: [80.65, 16.51] as [number, number] };
// map projection: lon/lat → pixels in a box of width w (height follows)
export const proj = (w: number) => (p: [number, number]): [number, number] => [((p[0] - 67) / 31) * w, ((37 - p[1]) / 31) * w];
export const DotMap: React.FC<{ w: number; reveal: number; dot?: string; glow?: (p: [number, number]) => number }> = ({ w, reveal, dot = "rgba(255,233,214,0.22)", glow }) => {
  const P = proj(w);
  return (
    <svg width={w} height={w} style={{ display: "block", overflow: "visible" }}>
      {DOTS.map((d, i) => {
        const [x, y] = P(d);
        // reveal sweeps in from the south, where both cities are
        const k = Math.max(0, Math.min(1, (reveal * 1.5 - (d[1] - 6) / 31) * 4));
        const g = glow ? glow(d) : 0;
        return <circle key={i} cx={x} cy={y} r={(w / 31) * 0.55 * 0.32 * (1 + g * 0.8)} fill={g > 0.02 ? `rgba(244,96,42,${0.25 + 0.75 * g})` : dot} opacity={k} />;
      })}
    </svg>
  );
};

// ---------- Amma's keypad phone ----------
export const KeypadPhone: React.FC<{ w: number; screen: React.ReactNode; lit?: number; buzz?: number }> = ({ w, screen, lit = 1, buzz = 0 }) => {
  const h = w * 2.15;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: `translateX(${buzz}px) rotate(${buzz * 0.15}deg)` }}>
      {/* body */}
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.16, background: "linear-gradient(160deg, #3A3633 0%, #1C1A18 45%, #121110 100%)", boxShadow: "0 50px 90px rgba(0,0,0,0.55), inset 0 2px 1px rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: w * 0.38, top: w * 0.07, width: w * 0.24, height: w * 0.025, borderRadius: 10, background: "#0A0909" }} />
      {/* screen */}
      <div style={{ position: "absolute", left: w * 0.1, top: w * 0.16, width: w * 0.8, height: w * 0.68, borderRadius: w * 0.04, background: "#0B0A09", overflow: "hidden", boxShadow: "inset 0 0 0 2px #050505" }}>
        <div style={{ position: "absolute", inset: 0, opacity: lit, background: "radial-gradient(ellipse at 50% 30%, #FFF4E8 0%, #FBE3CF 70%, #F2CDAF 100%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: lit }}>{screen}</div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.18) 0%, transparent 35%)" }} />
      </div>
      {/* keys */}
      <div style={{ position: "absolute", left: w * 0.12, top: w * 0.94, width: w * 0.76, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: w * 0.035 }}>
        {["", "◯", "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k, i) => (
          <div key={i} style={{ height: w * 0.16, borderRadius: w * 0.05, background: i === 0 ? "#1F6B3A" : i === 2 ? "#7A2620" : "linear-gradient(180deg, #2E2B28, #1E1C1A)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 3px rgba(0,0,0,0.5)", color: "#CFC8BF", fontFamily: SANS, fontSize: w * 0.075, display: "flex", alignItems: "center", justifyContent: "center", opacity: i === 1 ? 0.6 : 1 }}>
            {k}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- dashboard pieces ----------
export type Row = { who: string; what: string; time: string; s: Status; note: string };
export const TODAY: Row[] = [
  { who: "Nanna", what: "Morning walk", time: "6:30 AM", s: "confirmed", note: "6:30 AM" },
  { who: "Paati", what: "Thyroid tablet", time: "7:30 AM", s: "confirmed", note: "7:30 AM" },
  { who: "Dadi", what: "Morning tablet", time: "8:00 AM", s: "confirmed", note: "8:12 AM" },
  { who: "Nanna", what: "Sugar tablet", time: "1:30 PM", s: "confirmed", note: "1:30 PM" },
  { who: "Amma", what: "BP tablet", time: "7:00 PM", s: "scheduled", note: "" },
];
export const CallRow: React.FC<{ r: Row; status?: Status; note?: string; hi?: number; flip?: number }> = ({ r, status, note, hi = 0, flip = 0 }) => {
  const st = status ?? r.s;
  const dot = st === "confirmed" ? Y.green : st === "missed" ? Y.red : st === "retry" ? Y.amber : st === "calling" ? Y.orange : Y.mute;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 24px", borderRadius: 16, background: hi > 0 ? `rgba(244,96,42,${0.06 * hi})` : "transparent", boxShadow: hi > 0 ? `inset 0 0 0 1.5px rgba(244,96,42,${0.35 * hi})` : undefined }}>
      <div style={{ width: 13, height: 13, borderRadius: 7, background: st === "scheduled" ? "transparent" : dot, border: st === "scheduled" ? `2px solid ${Y.mute}` : undefined }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SANS, fontSize: 26, color: Y.ink }}>{r.who}</div>
        <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: "0.06em", textTransform: "uppercase", color: Y.sub, marginTop: 4 }}>
          {r.what} · {r.time}
        </div>
      </div>
      <div style={{ textAlign: "right", transform: `perspective(600px) rotateX(${flip * 90}deg)` }}>
        <Chip s={st} />
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "0.06em", color: Y.sub, marginTop: 8, textTransform: "uppercase" }}>{note ?? r.note}</div>
      </div>
    </div>
  );
};
