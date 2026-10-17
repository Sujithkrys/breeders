// The premium pieces of the Figma Motion film: "Halo", an original wallet app (graphite, aurora and pearl cards) as
// the design being animated, shown as a floating Figma frame; and the Figma Motion UI as isolated, large glass pieces
// (Motion toggle, timeline, agent composer, Design/Dev switch) — designed objects in space, never a screen recording.
import React from "react";
import { DISPLAY, L } from "../pine-pro/theme";
import { F, I, MONO, SANS } from "./ui";

export const SHADOW = "0 40px 80px rgba(30,35,60,0.16), 0 10px 24px rgba(30,35,60,0.08)";
export const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.74)",
  backdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.95)",
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), ${SHADOW}`,
};

// ---------- Halo: the wallet app ----------
export type WAnim = { title?: number; cards?: number[]; list?: number };
const CARDS: { name: string; num: string; bg: string; sheen: string; ink: string }[] = [
  {
    name: "Graphite", num: "4021", ink: "#F2F2F2",
    bg: "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), linear-gradient(135deg, #55585F 0%, #2A2B30 42%, #121214 100%)",
    sheen: "linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.22) 44%, transparent 58%)",
  },
  {
    name: "Aurora", num: "7738", ink: "#FFFFFF",
    bg: "radial-gradient(circle at 18% 22%, #FF7AC6 0%, transparent 46%), radial-gradient(circle at 82% 28%, #6C7BFF 0%, transparent 52%), radial-gradient(circle at 62% 96%, #2EE6D6 0%, transparent 52%), #2A1B5C",
    sheen: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.2) 46%, transparent 60%)",
  },
  {
    name: "Pearl", num: "0912", ink: "#18181B",
    bg: "linear-gradient(135deg, #FDFCFA 0%, #ECE8E1 55%, #DAD5CC 100%)",
    sheen: "linear-gradient(115deg, transparent 34%, rgba(170,195,255,0.4) 47%, rgba(255,195,230,0.35) 54%, transparent 66%)",
  },
];
export const CARD_TILT = [-14, 10, -7];
export const Card: React.FC<{ i: number; s: number; style?: React.CSSProperties }> = ({ i, s, style }) => {
  const c = CARDS[i];
  return (
    <div style={{ position: "absolute", width: 342 * s, height: 214 * s, borderRadius: 20 * s, background: c.bg, color: c.ink, overflow: "hidden", boxShadow: `0 ${18 * s}px ${44 * s}px rgba(0,0,0,0.45), inset 0 ${1 * s}px 0 rgba(255,255,255,0.25)`, fontFamily: SANS, ...style }}>
      <div style={{ position: "absolute", inset: 0, background: c.sheen }} />
      <div style={{ position: "absolute", left: 22 * s, top: 20 * s, fontFamily: DISPLAY, fontSize: 19 * s, fontWeight: 600, letterSpacing: "-0.02em" }}>halo</div>
      <div style={{ position: "absolute", right: 22 * s, top: 22 * s, fontSize: 12 * s, fontWeight: 500, opacity: 0.7, letterSpacing: "0.02em" }}>{c.name}</div>
      <div style={{ position: "absolute", left: 22 * s, top: 78 * s, width: 42 * s, height: 32 * s, borderRadius: 7 * s, background: "linear-gradient(135deg, #E9D7A6, #B8975A 60%, #E3CC92)", boxShadow: `inset 0 0 0 ${1 * s}px rgba(0,0,0,0.15)` }} />
      <div style={{ position: "absolute", left: 22 * s, bottom: 20 * s, fontSize: 16 * s, fontWeight: 500, letterSpacing: "0.12em" }}>•••• {c.num}</div>
      <div style={{ position: "absolute", right: 22 * s, bottom: 18 * s, display: "flex" }}>
        <div style={{ width: 26 * s, height: 26 * s, borderRadius: 13 * s, background: c.ink, opacity: 0.55 }} />
        <div style={{ width: 26 * s, height: 26 * s, borderRadius: 13 * s, background: c.ink, opacity: 0.3, marginLeft: -10 * s }} />
      </div>
    </div>
  );
};
const ACTIVITY: [string, string, string, string][] = [
  ["Morning coffee", "Today · 8:12", "−$4.80", "#2B2B30"],
  ["Airport train", "Yesterday", "−$12.00", "#2B2B30"],
  ["Salary", "Mon", "+$4,200.00", "#16352A"],
];
export const WalletScreen: React.FC<{ w: number; anim?: WAnim }> = ({ w, anim = {} }) => {
  const s = w / 390;
  const title = anim.title ?? 1, list = anim.list ?? 1;
  return (
    <div style={{ position: "relative", width: w, height: 844 * s, background: "#0B0B0D", overflow: "hidden", fontFamily: SANS, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 40% at 50% 0%, rgba(108,123,255,0.18), transparent 70%)" }} />
      <div style={{ position: "absolute", left: 28 * s, top: 18 * s, fontSize: 15 * s, fontWeight: 600 }}>9:41</div>
      <div style={{ position: "absolute", right: 28 * s, top: 22 * s, width: 24 * s, height: 11 * s, borderRadius: 3 * s, border: `${1.2 * s}px solid rgba(255,255,255,0.7)` }} />
      <div style={{ position: "absolute", left: 24 * s, top: 76 * s, opacity: title, transform: `translateY(${(1 - title) * 24 * s}px)` }}>
        <div style={{ fontSize: 15 * s, color: "#8A8A93", fontWeight: 500 }}>Total balance</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 48 * s, fontWeight: 600, letterSpacing: "-0.04em", marginTop: 4 * s }}>$12,480<span style={{ color: "#6E6E78" }}>.40</span></div>
        <div style={{ fontSize: 14 * s, color: "#7CE3A1", fontWeight: 500, marginTop: 2 * s }}>+2.4% this month</div>
      </div>
      {CARDS.map((_, i) => {
        const k = anim.cards ? anim.cards[i] : 1;
        return (
          <Card key={i} i={i} s={s} style={{ left: 24 * s, top: (214 + i * 66) * s, opacity: Math.min(1, k * 2.5), transform: `translate(${(1 - k) * (i % 2 ? 90 : -90) * s}px, ${(1 - k) * 560 * s}px) rotate(${(1 - k) * CARD_TILT[i]}deg) scale(${0.92 + 0.08 * k})` }} />
        );
      })}
      <div style={{ position: "absolute", left: 24 * s, right: 24 * s, top: 580 * s, opacity: list, transform: `translateY(${(1 - list) * 30 * s}px)` }}>
        <div style={{ fontSize: 15 * s, color: "#8A8A93", fontWeight: 500, marginBottom: 10 * s }}>Activity</div>
        {ACTIVITY.map(([n, d, a, bg]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 * s, height: 58 * s }}>
            <div style={{ width: 40 * s, height: 40 * s, borderRadius: 20 * s, background: bg }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16 * s, fontWeight: 500 }}>{n}</div>
              <div style={{ fontSize: 13 * s, color: "#7A7A84" }}>{d}</div>
            </div>
            <div style={{ fontSize: 16 * s, fontWeight: 500, color: a.startsWith("+") ? "#7CE3A1" : "#fff" }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// the wallet as a Figma frame floating on the stage: name label, selection, a slight 3D tilt, a deep soft shadow
export const Artboard: React.FC<{ w: number; anim?: WAnim; sel?: number; motion?: number; rx?: number; ry?: number; style?: React.CSSProperties }> = ({ w, anim, sel = 0, motion = 0, rx = 0, ry = 0, style }) => {
  const c = motion ? F.purple : F.blue;
  const r = 34 * (w / 390);
  return (
    <div style={{ position: "absolute", width: w, transform: `perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg)`, ...style }}>
      <div style={{ position: "absolute", left: 0, top: -36, display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontSize: 18, fontWeight: 500, color: sel ? c : L.gray }}>
        Halo — Home
        {motion ? <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: F.purple, padding: "3px 10px", borderRadius: 999, opacity: motion }}>Motion</span> : null}
      </div>
      <div style={{ borderRadius: r, overflow: "hidden", boxShadow: "0 60px 120px rgba(20,20,45,0.28), 0 18px 40px rgba(20,20,45,0.16)" }}>
        <WalletScreen w={w} anim={anim} />
      </div>
      {sel ? <div style={{ position: "absolute", inset: -6, borderRadius: r + 6, border: `3px solid ${c}`, opacity: sel }} /> : null}
    </div>
  );
};

// ---------- the Motion timeline, as a large glass panel ----------
export const ROWS = ["Balance", "Card / Graphite", "Card / Aurora", "Card / Pearl", "Activity"];
export type Key = { row: number; t: number; pop?: number };
export const TLG = { head: 76, ruler: 40, row: 58, labelW: 250, dur: 1.6 };
export const tlPx = (w: number) => (w - TLG.labelW - 56) / TLG.dur;
export const Timeline: React.FC<{ w: number; playhead: number; keys: Key[]; bars?: number[]; status?: string }> = ({ w, playhead, keys, bars, status = "Ease out · 560 ms" }) => {
  const px = tlPx(w), x0 = TLG.labelW + 24;
  const h = TLG.head + TLG.ruler + ROWS.length * TLG.row + 14;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 28, ...GLASS, background: "rgba(255,255,255,0.96)", fontFamily: SANS, color: L.ink, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, height: TLG.head, padding: "0 26px", borderBottom: `1px solid ${L.line}` }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: F.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={18} height={18} viewBox="0 0 16 16"><path d={I.play} fill="#fff" /></svg>
        </div>
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>Motion</span>
        <span style={{ fontFamily: MONO, fontSize: 19, color: L.gray, marginLeft: 10 }}>{playhead.toFixed(2)}s</span>
        <span style={{ marginLeft: "auto", fontSize: 18, color: "#8F8F8F" }}>{status}</span>
      </div>
      <div style={{ position: "absolute", left: x0, top: TLG.head, right: 0, height: TLG.ruler, borderBottom: `1px solid ${L.line}` }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: i * 0.2 * px + 8, top: 11, fontFamily: MONO, fontSize: 14, color: L.gray }}>{(i * 0.2).toFixed(1)}</div>
        ))}
      </div>
      {ROWS.map((r, i) => (
        <div key={r} style={{ position: "absolute", left: 0, right: 0, top: TLG.head + TLG.ruler + i * TLG.row, height: TLG.row, display: "flex", alignItems: "center", borderBottom: i < ROWS.length - 1 ? "1px solid rgba(15,17,21,0.05)" : undefined }}>
          <div style={{ width: TLG.labelW, paddingLeft: 26, fontSize: 19, fontWeight: 500, color: L.ink2 }}>{r}</div>
          {bars && bars[i] > 0 ? <div style={{ position: "absolute", left: x0 + startOf(i) * px, width: DUR_MOVE * px * bars[i], height: 8, borderRadius: 4, background: "rgba(151,71,255,0.22)" }} /> : null}
        </div>
      ))}
      {keys.map((k, i) => {
        const p = k.pop ?? 1;
        if (p <= 0) return null;
        const over = 0.3 * Math.max(0, 1 - Math.abs(p - 0.75) * 4);
        return (
          <div key={i} style={{ position: "absolute", left: x0 + k.t * px - 10, top: TLG.head + TLG.ruler + k.row * TLG.row + TLG.row / 2 - 10, width: 20, height: 20, transform: `rotate(45deg) scale(${0.4 + 0.6 * Math.min(1, p) + over})`, background: "#fff", border: `3px solid ${F.purple}`, borderRadius: 3, opacity: Math.min(1, p * 2), boxShadow: "0 2px 6px rgba(151,71,255,0.3)" }} />
        );
      })}
      <div style={{ position: "absolute", left: x0 + playhead * px - 1.5, top: TLG.head, bottom: 0, width: 3, background: F.red }}>
        <div style={{ position: "absolute", top: 0, left: -8, width: 19, height: 16, borderRadius: 4, background: F.red }} />
      </div>
    </div>
  );
};
// the animation: rows start 120 ms apart; each move lasts 560 ms
export const DUR_MOVE = 0.56;
export const startOf = (r: number) => r * 0.12;
export const tlX0 = TLG.labelW + 24;

// ---------- the Motion switch: one big glass control ----------
export const MotionSwitch: React.FC<{ on: number; label?: string; sub?: string }> = ({ on, label = "Motion", sub = "Frame · Halo — Home" }) => (
  <div style={{ ...GLASS, width: 640, borderRadius: 40, padding: "34px 40px", fontFamily: SANS }}>
    <div style={{ fontSize: 20, color: "#8F8F8F", fontWeight: 500 }}>{sub}</div>
    <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
      <svg width={46} height={46} viewBox="0 0 16 16" style={{ marginRight: 18 }}><path d={I.play} fill={on > 0.5 ? F.purple : L.ink2} /></svg>
      <span style={{ fontSize: 50, fontWeight: 500, letterSpacing: "-0.02em", color: L.ink }}>{label}</span>
      <div style={{ marginLeft: "auto", width: 124, height: 70, borderRadius: 35, background: on > 0 ? `rgba(151,71,255,${0.25 + 0.75 * on})` : "rgba(15,17,21,0.12)", position: "relative", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ position: "absolute", top: 6, left: 6 + 54 * on, width: 58, height: 58, borderRadius: 29, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }} />
      </div>
    </div>
  </div>
);

// ---------- Design / Dev: the segmented switch ----------
export const ModeSwitch: React.FC<{ dev: number }> = ({ dev }) => (
  <div style={{ ...GLASS, position: "relative", display: "flex", padding: 10, borderRadius: 999, fontFamily: SANS }}>
    <div style={{ position: "absolute", top: 10, bottom: 10, left: 10 + dev * 340, width: 340, borderRadius: 999, background: dev > 0.5 ? "#141416" : "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.14)" }} />
    {["Design", "Dev Mode"].map((l, i) => (
      <div key={l} style={{ position: "relative", width: 340, height: 104, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em", color: i === 1 ? (dev > 0.5 ? "#fff" : L.gray) : dev > 0.5 ? L.gray : L.ink }}>
        {i === 1 ? <svg width={34} height={34} viewBox="0 0 16 16"><path d={I.code} stroke={dev > 0.5 ? "#7CFFB2" : L.gray} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
        {l}
      </div>
    ))}
  </div>
);

// ---------- the agent composer (Pine's glass prompt) ----------
export const Composer: React.FC<{ text: string; caret: boolean; ready: boolean; press: number; status?: React.ReactNode }> = ({ text, caret, ready, press, status }) => (
  <div style={{ ...GLASS, position: "relative", width: 1180, height: 250, borderRadius: 56, display: "flex", alignItems: "center", padding: "0 170px 0 64px", boxSizing: "border-box", fontFamily: SANS }}>
    <div style={{ position: "absolute", left: 64, top: 34, display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 600, color: F.purple }}>
      <svg width={20} height={20} viewBox="0 0 16 16"><path d={I.sparkle} stroke={F.purple} strokeWidth={1.6} strokeLinecap="round" fill="none" /></svg>
      Figma agent
    </div>
    <div style={{ fontSize: 56, fontWeight: 400, color: L.ink2, letterSpacing: "-0.02em", lineHeight: 1.25, marginTop: 26 }}>
      {status ?? (text ? text : <span style={{ color: "#B8BBC2" }}>Describe an animation…</span>)}
      {caret ? <span style={{ display: "inline-block", width: 4, height: 58, marginLeft: 4, background: L.ink, verticalAlign: "middle", borderRadius: 2 }} /> : null}
    </div>
    <div style={{ position: "absolute", right: 44, top: "50%", width: 104, height: 104, marginTop: -52, borderRadius: 52, background: ready ? L.ink : "rgba(15,17,21,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press * 0.1})`, boxShadow: ready ? "0 10px 30px rgba(0,0,0,0.25)" : undefined }}>
      <svg width={42} height={42} viewBox="0 0 14 14"><path d="M7 12V2M3 6l4-4 4 4" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  </div>
);

// a large, crisp pointer
export const Pointer: React.FC<{ x: number; y: number; press?: number; size?: number; dark?: boolean }> = ({ x, y, press = 0, size = 44, dark }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 50 }}>
    {press > 0 ? <div style={{ position: "absolute", left: -34, top: -34, width: 68, height: 68, borderRadius: 34, background: `rgba(151,71,255,${0.22 * press})`, transform: `scale(${0.6 + 0.6 * press})` }} /> : null}
    <svg width={size * 0.75} height={size} viewBox="0 0 22 30" style={{ position: "absolute", left: -2, top: -2, transform: `scale(${1 - press * 0.1})`, transformOrigin: "0 0", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.28))" }}>
      <path d="M2 2v22l6-5.5 4 9 3.6-1.6-4-8.8H20z" fill={dark ? "#fff" : L.ink} stroke={dark ? L.ink : "#fff"} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  </div>
);
