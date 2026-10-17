// "Loop": an original record-store + live-music app, the design animated in the Figma Motion film. Everything is
// drawn in code: generative album covers, a vinyl with grooves, a concert ticket with a QR code. Bold condensed
// display type (Anton) inside the app, Inter for the interface, like the app designs in Figma's own films.
import React from "react";

export const LOOP = { plum: "#3A1D4A", plum2: "#5B2A5E", cream: "#F5F1E8", lime: "#D9F56A", peach: "#FFD9B8", ink: "#16121A", gray: "#8C8494" };
const ANTON = "Anton, 'Inter Tight', sans-serif";
const UI = "Inter, sans-serif";

// ---------- generative covers ----------
export const COVERS = [
  { title: "Night Swim", artist: "Mara Vale", label: "#2B6BFF" },
  { title: "Paper Sun", artist: "Okin", label: "#FF6A2B" },
  { title: "Neon Garden", artist: "Lux Atlas", label: "#D9F56A" },
  { title: "Static", artist: "Hollow Bay", label: "#F5F1E8" },
];
export const Cover: React.FC<{ i: number; size: number; r?: number }> = ({ i, size, r = 0.06 }) => {
  const s = size / 100;
  const box: React.CSSProperties = { position: "relative", width: size, height: size, borderRadius: size * r, overflow: "hidden", flexShrink: 0 };
  const name = (c: string) => (
    <div style={{ position: "absolute", left: 7 * s, bottom: 6 * s, fontFamily: ANTON, fontSize: 11 * s, letterSpacing: "0.01em", color: c, textTransform: "uppercase", lineHeight: 1 }}>{COVERS[i].title}</div>
  );
  if (i === 0)
    return (
      <div style={{ ...box, background: "radial-gradient(circle at 70% 30%, #6FA3FF 0%, #2B6BFF 30%, #0B1B5C 75%)" }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          {[14, 22, 30, 38, 46].map((rr, k) => <circle key={k} cx={70} cy={30} r={rr} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.6} />)}
          <circle cx={70} cy={30} r={8} fill="#E8F0FF" />
        </svg>
        {name("#E8F0FF")}
      </div>
    );
  if (i === 1)
    return (
      <div style={{ ...box, background: "#F3E7D3" }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <path d="M14 66a36 36 0 0 1 72 0z" fill="#FF6A2B" />
          {[70, 76, 82, 88].map((y, k) => <rect key={k} x={14} y={y} width={72} height={2.4} fill="#FF6A2B" opacity={1 - k * 0.2} />)}
        </svg>
        {name("#3A1D4A")}
      </div>
    );
  if (i === 2)
    return (
      <div style={{ ...box, background: "#13301F" }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 16 }, (_, k) => {
            const x = 12 + (k % 4) * 25, y = 12 + Math.floor(k / 4) * 22;
            return <circle key={k} cx={x} cy={y} r={k % 3 === 0 ? 9 : 6} fill={k % 2 ? "#D9F56A" : "#FF7AC6"} opacity={0.9} />;
          })}
        </svg>
        {name("#D9F56A")}
      </div>
    );
  return (
    <div style={{ ...box, background: "#0E0E10" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 22 }, (_, k) => <rect key={k} x={0} y={8 + k * 3.6} width={100} height={1.2 + 1.2 * Math.abs(Math.sin(k * 0.7))} fill="#F5F1E8" opacity={0.85} />)}
        <circle cx={50} cy={44} r={20} fill="#0E0E10" />
      </svg>
      {name("#F5F1E8")}
    </div>
  );
};

export const Vinyl: React.FC<{ size: number; label: string; rot?: number }> = ({ size, label, rot = 0 }) => (
  <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", transform: `rotate(${rot}deg)`, background: "repeating-radial-gradient(circle at 50% 50%, #141416 0px, #141416 2px, #1F1F23 3px, #141416 4px)", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 30deg, transparent 0deg, rgba(255,255,255,0.16) 30deg, transparent 70deg, transparent 180deg, rgba(255,255,255,0.12) 210deg, transparent 250deg)" }} />
    <div style={{ position: "absolute", left: "33%", top: "33%", width: "34%", height: "34%", borderRadius: "50%", background: label, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "14%", height: "14%", borderRadius: "50%", background: "#141416" }} />
      <div style={{ position: "absolute", top: "18%", fontFamily: ANTON, fontSize: size * 0.035, color: "rgba(0,0,0,0.6)" }}>LOOP</div>
    </div>
  </div>
);

// ---------- the home screen ----------
// anim (0..1 each): header, sleeve, vinyl (slides out of the sleeve), list (tracks stagger), play; spin in degrees
export type LoopAnim = { header?: number; sleeve?: number; vinyl?: number; list?: number; play?: number; spin?: number };
const TRACKS: [string, string][] = [["Low Tide", "3:42"], ["Glass Harbour", "4:05"], ["Swim Home", "3:18"], ["Undertow", "5:01"]];
export const LoopHome: React.FC<{ w: number; anim?: LoopAnim }> = ({ w, anim = {} }) => {
  const s = w / 390;
  const a = { header: 1, sleeve: 1, vinyl: 1, list: 1, play: 1, spin: 0, ...anim };
  const fade = (k: number, dy = 24): React.CSSProperties => ({ opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - k) * dy * s}px)` });
  return (
    <div style={{ position: "relative", width: w, height: 844 * s, background: LOOP.cream, overflow: "hidden", fontFamily: UI, color: LOOP.ink }}>
      <div style={{ position: "absolute", left: 26 * s, top: 18 * s, fontSize: 15 * s, fontWeight: 600 }}>9:41</div>
      <div style={{ position: "absolute", right: 26 * s, top: 21 * s, width: 24 * s, height: 11 * s, borderRadius: 3 * s, border: `${1.3 * s}px solid ${LOOP.ink}` }} />
      {/* header */}
      <div style={{ position: "absolute", left: 22 * s, right: 22 * s, top: 58 * s, display: "flex", alignItems: "center", ...fade(a.header) }}>
        <div style={{ fontFamily: ANTON, fontSize: 40 * s, color: LOOP.plum, letterSpacing: "0.01em", lineHeight: 1 }}>LOOP</div>
        <div style={{ marginLeft: 10 * s, padding: `${4 * s}px ${10 * s}px`, borderRadius: 99, background: LOOP.lime, fontSize: 12 * s, fontWeight: 600, color: LOOP.plum }}>New this week</div>
        <div style={{ marginLeft: "auto", width: 36 * s, height: 36 * s, borderRadius: 18 * s, background: "linear-gradient(135deg,#FFB38A,#FF6A2B)" }} />
      </div>
      {/* the featured record: the vinyl slides out of its sleeve and spins */}
      <div style={{ position: "absolute", left: 22 * s, top: 120 * s, width: 346 * s, height: 250 * s }}>
        <div style={{ position: "absolute", left: (24 + 120 * a.vinyl) * s, top: 10 * s, opacity: Math.min(1, a.sleeve * 2) }}>
          <Vinyl size={226 * s} label={COVERS[0].label} rot={a.spin} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, boxShadow: `0 ${20 * s}px ${40 * s}px rgba(30,15,40,0.28)`, borderRadius: 8 * s, transform: `translateX(${(1 - a.sleeve) * -60 * s}px) rotate(${(1 - a.sleeve) * -6}deg)`, opacity: Math.min(1, a.sleeve * 2) }}>
          <Cover i={0} size={246 * s} r={0.03} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 22 * s, top: 392 * s, right: 22 * s, display: "flex", alignItems: "flex-end", ...fade(a.header) }}>
        <div>
          <div style={{ fontFamily: ANTON, fontSize: 34 * s, lineHeight: 1, color: LOOP.plum, textTransform: "uppercase" }}>Night Swim</div>
          <div style={{ fontSize: 14 * s, color: LOOP.gray, marginTop: 6 * s }}>Mara Vale · Vinyl LP · 2026</div>
        </div>
        <div style={{ marginLeft: "auto", width: 58 * s, height: 58 * s, borderRadius: 29 * s, background: LOOP.plum, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * a.play})`, opacity: a.play }}>
          <svg width={20 * s} height={22 * s} viewBox="0 0 20 22"><path d="M3 2l15 9-15 9z" fill={LOOP.lime} /></svg>
        </div>
      </div>
      {/* tracks */}
      <div style={{ position: "absolute", left: 22 * s, right: 22 * s, top: 480 * s }}>
        {TRACKS.map(([n, d], k) => {
          const kk = Math.max(0, Math.min(1, a.list * 1.6 - k * 0.2));
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", height: 50 * s, borderBottom: `1px solid rgba(58,29,74,0.1)`, opacity: kk, transform: `translateX(${(1 - kk) * 40 * s}px)` }}>
              <span style={{ width: 28 * s, fontSize: 13 * s, color: LOOP.gray, fontVariantNumeric: "tabular-nums" }}>0{k + 1}</span>
              <span style={{ fontSize: 16 * s, fontWeight: 500 }}>{n}</span>
              <span style={{ marginLeft: "auto", fontSize: 13 * s, color: LOOP.gray }}>{d}</span>
            </div>
          );
        })}
      </div>
      {/* buy bar */}
      <div style={{ position: "absolute", left: 22 * s, right: 22 * s, bottom: 30 * s, height: 60 * s, borderRadius: 30 * s, background: LOOP.plum, color: "#fff", display: "flex", alignItems: "center", padding: `0 ${8 * s}px 0 ${24 * s}px`, ...fade(a.list, 30) }}>
        <span style={{ fontSize: 16 * s, fontWeight: 600 }}>$32 · 180g vinyl</span>
        <span style={{ marginLeft: "auto", height: 44 * s, padding: `0 ${20 * s}px`, borderRadius: 22 * s, background: LOOP.lime, color: LOOP.plum, display: "flex", alignItems: "center", fontSize: 15 * s, fontWeight: 700 }}>Add to bag</span>
      </div>
    </div>
  );
};

// ---------- the concert ticket ----------
const qr = (n: number) => {
  const m: boolean[][] = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 > 0.5));
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) m[oy + y][ox + x] = x === 0 || y === 0 || x === 6 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
    for (let k = 0; k < 8; k++) { if (oy + 7 < n && ox + k < n) m[oy + 7][ox + k] = false; if (ox + 7 < n && oy + k < n) m[oy + k][ox + 7] = false; }
  };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  return m;
};
const QR = qr(25);
export const QRCode: React.FC<{ size: number; color?: string }> = ({ size, color = LOOP.ink }) => (
  <svg width={size} height={size} viewBox="0 0 25 25" shapeRendering="crispEdges">
    {QR.flatMap((row, y) => row.map((on, x) => (on ? <rect key={x + "-" + y} x={x} y={y} width={1} height={1} fill={color} /> : null)))}
  </svg>
);
export const LoopTicket: React.FC<{ w: number; slide?: number }> = ({ w, slide = 1 }) => {
  const s = w / 390;
  return (
    <div style={{ position: "relative", width: w, height: 844 * s, background: LOOP.lime, overflow: "hidden", fontFamily: UI, color: LOOP.plum }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 110 * s, background: LOOP.peach, display: "flex", alignItems: "flex-end", padding: `0 ${22 * s}px ${16 * s}px`, fontSize: 17 * s, fontWeight: 600 }}>
        Your ticket
        <span style={{ marginLeft: "auto", fontSize: 13 * s, fontWeight: 500 }}>1 Adult</span>
      </div>
      <div style={{ position: "absolute", left: 22 * s, top: 130 * s, fontFamily: ANTON, fontSize: 92 * s, lineHeight: 0.9, letterSpacing: "-0.01em", transform: `translateY(${(1 - slide) * 80 * s}px)`, opacity: slide }}>
        LOOP<br />LIVE
      </div>
      <div style={{ position: "absolute", left: 22 * s, top: 312 * s, display: "inline-block", padding: `${4 * s}px ${12 * s}px`, background: LOOP.plum, color: LOOP.lime, fontFamily: ANTON, fontSize: 26 * s, textTransform: "uppercase" }}>Night Swim Tour</div>
      <div style={{ position: "absolute", left: 22 * s, right: 22 * s, top: 380 * s, height: 330 * s, borderRadius: 22 * s, background: "#fff", padding: 20 * s, boxSizing: "border-box", boxShadow: `0 ${16 * s}px ${36 * s}px rgba(58,29,74,0.14)`, transform: `translateY(${(1 - slide) * 300 * s}px)` }}>
        <div style={{ display: "flex", gap: 18 * s }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12 * s, color: LOOP.gray }}>DATE</div>
            <div style={{ fontSize: 17 * s, fontWeight: 600 }}>Fri, 12 Jun 2026</div>
            <div style={{ fontSize: 12 * s, color: LOOP.gray, marginTop: 12 * s }}>DOORS</div>
            <div style={{ fontSize: 17 * s, fontWeight: 600 }}>19:30</div>
            <div style={{ fontSize: 12 * s, color: LOOP.gray, marginTop: 12 * s }}>VENUE</div>
            <div style={{ fontSize: 17 * s, fontWeight: 600 }}>Harbour Hall</div>
          </div>
          <QRCode size={130 * s} color={LOOP.plum} />
        </div>
        <div style={{ position: "absolute", left: 20 * s, right: 20 * s, bottom: 20 * s, height: 50 * s, borderRadius: 25 * s, background: LOOP.plum, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 * s, fontWeight: 600 }}>Add to Wallet</div>
      </div>
    </div>
  );
};

// ---------- browse: a grid of covers ----------
export const LoopBrowse: React.FC<{ w: number; k?: number }> = ({ w, k = 1 }) => {
  const s = w / 390;
  return (
    <div style={{ position: "relative", width: w, height: 844 * s, background: LOOP.plum, overflow: "hidden", fontFamily: UI }}>
      <div style={{ position: "absolute", left: 22 * s, top: 60 * s, fontFamily: ANTON, fontSize: 44 * s, color: LOOP.lime, lineHeight: 1 }}>BROWSE</div>
      <div style={{ position: "absolute", left: 22 * s, right: 22 * s, top: 120 * s, height: 40 * s, borderRadius: 20 * s, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", paddingLeft: 16 * s, fontSize: 14 * s }}>Search records, artists, gigs</div>
      <div style={{ position: "absolute", left: 22 * s, top: 182 * s, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 * s }}>
        {[0, 1, 2, 3, 1, 0].map((c, j) => {
          const kk = Math.max(0, Math.min(1, k * 2 - j * 0.15));
          return (
            <div key={j} style={{ opacity: kk, transform: `translateY(${(1 - kk) * 60 * s}px) scale(${0.9 + 0.1 * kk})` }}>
              <Cover i={c} size={166 * s} r={0.05} />
              <div style={{ color: "#fff", fontSize: 14 * s, fontWeight: 600, marginTop: 8 * s }}>{COVERS[c].title}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 * s }}>{COVERS[c].artist}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
