// Realistic pieces for the Apple Pay film, matched to Apple's press image for the India launch
// (assets/applepay-press): the iPhone's frame proportions, the Wallet screen, the Axis Bank Horizon card and the Watch
// (public/applepay/watch.png, cut from that image). Sizes scale with the `w` prop so they stay sharp at 4K.
import React, { useId } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { springAt } from "../sarvam-live/kit";
import { ease, ramp } from "../utils";
import { SFD, SFT } from "./fonts";
import { UI } from "./theme";
const HEAD = SFD;

export const BLUE = "#1A8CFF";
const SF = SFT;

// ---------- iPhone: proportions measured from the press render ----------
export const phoneH = (w: number) => w * 2.087;
export const phoneGeom = (w: number) => {
  const rim = w * 0.0156;
  const bezel = w * 0.019;
  const inset = rim + bezel;
  return { h: phoneH(w), r: w * 0.17, rim, bezel, inset, sw: w - inset * 2, sh: phoneH(w) - inset * 2, sr: w * 0.17 - inset };
};
const BTN = "linear-gradient(90deg, #8E8E93, #E5E5EA 45%, #A1A1A6)";
export const IPhone: React.FC<{ w: number; children?: React.ReactNode; power?: number; shadow?: boolean; screen?: string }> = ({ w, children, power = 0, shadow = true, screen = "#F3F2F7" }) => {
  const g = phoneGeom(w);
  const b = (side: "l" | "r", y0: number, y1: number, glow = 0) => (
    <div style={{ position: "absolute", [side === "l" ? "left" : "right"]: -w * 0.007 + (side === "r" ? glow * w * 0.004 : 0), top: g.h * y0, width: w * 0.012, height: g.h * (y1 - y0), borderRadius: w * 0.005, background: BTN, boxShadow: glow > 0 ? `0 0 ${w * 0.05 * glow}px rgba(26,140,255,${0.9 * glow})` : undefined }} />
  );
  return (
    <div style={{ position: "relative", width: w, height: g.h, filter: shadow ? `drop-shadow(0 ${w * 0.08}px ${w * 0.12}px rgba(0,0,0,0.22))` : undefined }}>
      {b("l", 0.2, 0.245)}
      {b("l", 0.285, 0.367)}
      {b("l", 0.38, 0.457)}
      {b("r", 0.307, 0.426, power)}
      <div style={{ position: "absolute", inset: 0, borderRadius: g.r, background: "linear-gradient(90deg, #9A9A9E, #E8E8EC 18%, #C2C2C6 50%, #E8E8EC 82%, #9A9A9E)" }} />
      <div style={{ position: "absolute", inset: g.rim, borderRadius: g.r - g.rim, background: "#000" }} />
      <div style={{ position: "absolute", inset: g.inset, borderRadius: g.sr, background: screen, overflow: "hidden" }}>
        {children}
        <div style={{ position: "absolute", left: "50%", top: g.sw * 0.034, width: g.sw * 0.27, height: g.sw * 0.082, marginLeft: -g.sw * 0.135, borderRadius: g.sw * 0.05, background: "#000" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

// ---------- status bar (9:41, signal, wifi, battery) ----------
export const StatusBar: React.FC<{ sw: number; dark?: boolean }> = ({ sw, dark = false }) => {
  const c = dark ? "#fff" : "#000";
  const s = sw / 393;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 14 * s, height: 32 * s, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${30 * s}px 0 ${44 * s}px`, fontFamily: SF, fontWeight: 600, fontSize: 17 * s, color: c }}>
      <span>9:41</span>
      <svg width={78 * s} height={13 * s} viewBox="0 0 78 13">
        {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 5} y={9 - i * 3} width={3.4} height={4 + i * 3} rx={1} fill={c} />)}
        <path d="M 30 4.2 A 9 9 0 0 1 44 4.2 L 42.4 5.8 A 6.8 6.8 0 0 0 31.6 5.8 Z M 33.4 7.4 A 5 5 0 0 1 40.6 7.4 L 39 9 A 2.8 2.8 0 0 0 35 9 Z M 37 12 L 35.6 10.6 A 2 2 0 0 1 38.4 10.6 Z" fill={c} />
        <rect x={52} y={1} width={22} height={11} rx={3} fill="none" stroke={c} strokeOpacity={0.4} />
        <rect x={54} y={3} width={18} height={7} rx={1.6} fill={c} />
        <rect x={75} y={4.5} width={1.6} height={4} rx={0.8} fill={c} fillOpacity={0.4} />
      </svg>
    </div>
  );
};

// ---------- Axis Bank Horizon credit card (as shown in Apple's press image) ----------
export const HorizonCard: React.FC<{ w: number; sheen?: number; digits?: string; glow?: number }> = ({ w, sheen = -1, digits = "•••• 1234", glow = 1 }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = w * 0.63;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.045, overflow: "hidden", background: `radial-gradient(ellipse 60% 42% at 51% 42%, rgba(255,150,220,${glow}) 0%, rgba(255,40,160,${0.9 * glow}) 1.6%, rgba(150,10,80,${0.85 * glow}) 6%, #3A0520 18%, #12000A 42%, #050003 72%)`, boxShadow: `0 ${w * 0.03}px ${w * 0.07}px rgba(0,0,0,0.35)` }}>
      <svg width={w} height={h} viewBox="0 0 100 63" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`arc${id}`} x1="0" x2="1" y1="1" y2="0">
            <stop offset="0" stopColor="#FF3BA7" stopOpacity={0} />
            <stop offset="0.45" stopColor="#FF4FB5" stopOpacity={0.9} />
            <stop offset="1" stopColor="#FF3BA7" stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <path d="M 8 63 Q 38 24 100 9" fill="none" stroke={`url(#arc${id})`} strokeWidth={0.45} />
        <path d="M 8 63 Q 38 24 100 9" fill="none" stroke={`url(#arc${id})`} strokeWidth={2} opacity={0.22} />
        {/* Axis mark: a slanted A */}
        <path d="M 5.4 12.6 L 9.2 6.2 L 10.6 6.2 L 12.4 9.3 L 10.1 12.6 Z M 10.1 12.6 L 12.4 9.3 L 14.4 12.6 Z" fill="#fff" />
        <text x={15.6} y={11.6} fontFamily={SF} fontWeight={500} fontSize={4.6} fill="#fff" letterSpacing={0.15}>AXIS BANK</text>
        <text x={95} y={11.2} textAnchor="end" fontFamily={SF} fontWeight={800} fontStyle="italic" fontSize={3.4} fill="#fff" letterSpacing={0.1}>HORIZON</text>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${89.6 + i * 1.6} ${17.6 - i * 1.0} q ${1.6 + i * 0.6} ${3.0 + i * 1.0} 0 ${6.0 + i * 2.0}`} fill="none" stroke="#fff" strokeWidth={0.55} strokeLinecap="round" />
        ))}
        <text x={95} y={40} textAnchor="end" fontFamily={SF} fontWeight={400} fontSize={3.6} fill="#fff" opacity={0.92}>world</text>
        <clipPath id={`mc${id}`}>
          <circle cx={83.6} cy={50.4} r={5.4} />
        </clipPath>
        <circle cx={83.6} cy={50.4} r={5.4} fill="#EB001B" />
        <circle cx={90.4} cy={50.4} r={5.4} fill="#F79E1B" />
        <circle cx={90.4} cy={50.4} r={5.4} fill="#FF5F00" clipPath={`url(#mc${id})`} />
        <text x={6.2} y={56.2} fontFamily={SF} fontWeight={500} fontSize={4} fill="#fff" letterSpacing={0.4}>{digits}</text>
      </svg>
      {sheen > -1 ? <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sheen * 100 - 18}%, rgba(255,255,255,0.28) ${sheen * 100}%, transparent ${sheen * 100 + 18}%)` }} /> : null}
    </div>
  );
};

// ---------- a neutral premium credit card (no bank branding): graphite with a soft light band, Mastercard ----------
export const ClassicCard: React.FC<{ w: number; sheen?: number; digits?: string }> = ({ w, sheen = -1, digits = "•••• 4821" }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = w * 0.63;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.045, overflow: "hidden", background: "linear-gradient(140deg, #3A3D46 0%, #1E2027 45%, #0E0F13 100%)", boxShadow: `0 ${w * 0.03}px ${w * 0.07}px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)` }}>
      <svg width={w} height={h} viewBox="0 0 100 63" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`band${id}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.09} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d="M -10 50 Q 40 20 110 30 L 110 46 Q 40 34 -10 64 Z" fill={`url(#band${id})`} />
        <rect x={7} y={21} width={11} height={8.6} rx={1.6} fill="#D9C27E" />
        <path d="M 7 25.3 H 18 M 12.5 21 V 29.6" stroke="#B49A52" strokeWidth={0.4} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${89.6 + i * 1.6} ${17.6 - i * 1.0} q ${1.6 + i * 0.6} ${3.0 + i * 1.0} 0 ${6.0 + i * 2.0}`} fill="none" stroke="#fff" strokeWidth={0.55} strokeLinecap="round" opacity={0.85} />
        ))}
        <clipPath id={`mc${id}`}>
          <circle cx={83.6} cy={51.4} r={5.4} />
        </clipPath>
        <circle cx={83.6} cy={51.4} r={5.4} fill="#EB001B" />
        <circle cx={90.4} cy={51.4} r={5.4} fill="#F79E1B" />
        <circle cx={90.4} cy={51.4} r={5.4} fill="#FF5F00" clipPath={`url(#mc${id})`} />
        <text x={7} y={56.4} fontFamily={SF} fontWeight={500} fontSize={4} fill="#fff" letterSpacing={0.4} opacity={0.9}>{digits}</text>
        <text x={7} y={12} fontFamily={SF} fontWeight={600} fontSize={3.6} fill="#fff" opacity={0.75} letterSpacing={0.6}>CREDIT</text>
      </svg>
      {sheen > -1 ? <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sheen * 100 - 18}%, rgba(255,255,255,0.28) ${sheen * 100}%, transparent ${sheen * 100 + 18}%)` }} /> : null}
    </div>
  );
};

// ---------- blue Done tick (Apple Pay confirmation) ----------
export const DoneTick: React.FC<{ p: number; size: number; color?: string }> = ({ p, size, color = BLUE }) => {
  const c = ramp(p, [0, 0.55], [0, 1], ease.inOut);
  const k = ramp(p, [0.45, 1], [0, 1], ease.out);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <circle cx={50} cy={50} r={45} fill="none" stroke={color} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c} transform="rotate(-90 50 50)" strokeLinecap="round" />
      <path d="M 31 51 L 45 65 L 70 37" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
    </svg>
  );
};

// ---------- Face ID glyph: brackets + face, then it turns into a tick ----------
export const FaceIdGlyph: React.FC<{ p: number; size: number; color?: string }> = ({ p, size, color = BLUE }) => {
  const draw = ramp(p, [0, 0.5], [0, 1], ease.inOut);
  const spin = ramp(p, [0.55, 0.8], [0, 1], ease.inOut);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, opacity: 1 - spin, transform: `scale(${1 - spin * 0.2}) rotate(${spin * 40}deg)` }}>
        {["M 6 28 V 16 Q 6 6 16 6 H 28", "M 72 6 H 84 Q 94 6 94 16 V 28", "M 94 72 V 84 Q 94 94 84 94 H 72", "M 28 94 H 16 Q 6 94 6 84 V 72"].map((d) => (
          <path key={d} d={d} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ))}
        {["M 33 36 V 43", "M 67 36 V 43", "M 51 36 V 57 Q 51 61 45 61", "M 35 70 Q 50 80 65 70"].map((d) => (
          <path key={d} d={d} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(draw, [0.35, 1])} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: spin }}>
        <DoneTick p={ramp(p, [0.7, 1], [0, 1], ease.linear)} size={size} color={color} />
      </div>
    </div>
  );
};

// ---------- Wallet screen (light): status bar, card, middle content, pass stack ----------
export const WalletScreen: React.FC<{ sw: number; sh: number; cardY?: number; cardSheen?: number; children?: React.ReactNode; dim?: number; over?: React.ReactNode }> = ({ sw, sh, cardY = 0, cardSheen = -1, children, dim = 0, over }) => (
  <AbsoluteFill style={{ background: "#F3F2F7" }}>
    <StatusBar sw={sw} />
    <div style={{ position: "absolute", left: sw * 0.045, top: sw * 0.2 + cardY }}>
      <ClassicCard w={sw * 0.91} sheen={cardSheen} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: sw * 0.2 + sw * 0.91 * 0.63 + sw * 0.1, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    {/* other passes peeking at the bottom (blue, green, gold) */}
    {[
      ["#3D9AD9", 0],
      ["#4CB948", sw * 0.022],
    ].map(([c, dy]) => (
      <div key={c as string} style={{ position: "absolute", left: sw * 0.09, right: sw * 0.09, top: sh - sw * 0.27 + (dy as number), height: sw * 0.3, borderRadius: sw * 0.03, background: c as string }} />
    ))}
    <div style={{ position: "absolute", left: sw * 0.06, right: sw * 0.06, top: sh - sw * 0.225, height: sw * 0.3, borderRadius: sw * 0.035, background: "linear-gradient(120deg, #E8D08A, #C9A646 45%, #E3C77A 70%, #B8933A)" }} />
    <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
    {over}
  </AbsoluteFill>
);

// ---------- card machine (POS), lit like a product shot ----------
export const Terminal: React.FC<{ w: number; amount: string; merchant: string; done?: number; tilt?: number }> = ({ w, amount, merchant, done = 0, tilt = 0 }) => {
  const h = w * 1.75;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: `perspective(1400px) rotateX(${tilt}deg)`, filter: `drop-shadow(0 ${w * 0.1}px ${w * 0.12}px rgba(0,0,0,0.35))` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.12, background: "linear-gradient(160deg, #4A4A4F 0%, #1F1F22 40%, #0F0F11 100%)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", left: w * 0.08, right: w * 0.08, top: w * 0.09, height: w * 0.78, borderRadius: w * 0.05, background: done > 0 ? `linear-gradient(180deg, #0F2A1A, #0B1F14)` : "linear-gradient(180deg, #0B1220, #060A12)", overflow: "hidden", boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: w * 0.07, textAlign: "center", fontFamily: SF, fontSize: w * 0.07, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.02em" }}>{merchant}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: w * 0.19, textAlign: "center", fontFamily: HEAD, fontSize: w * 0.19, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{amount}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: w * 0.47, display: "flex", justifyContent: "center", opacity: 1 - done }}>
          <svg width={w * 0.22} height={w * 0.22} viewBox="0 0 24 24">
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M ${6 + i * 3.4} ${7 - i * 1.6} q ${3 + i} ${5 + i * 1.6} 0 ${10 + i * 3.2}`} fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
            ))}
          </svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: w * 0.43, display: "flex", justifyContent: "center", opacity: done }}>
          <DoneTick p={done} size={w * 0.3} color="#34C759" />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(130deg, rgba(255,255,255,0.12), transparent 40%)" }} />
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: w * (0.14 + (i % 3) * 0.26), top: w * (0.98 + Math.floor(i / 3) * 0.17), width: w * 0.2, height: w * 0.12, borderRadius: w * 0.04, background: "linear-gradient(180deg, #3A3A3E, #232326)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }} />
      ))}
    </div>
  );
};

// ---------- the real Apple Watch (cut from the press image; 371×596, screen shows the Horizon card + Done) ----------
export const WATCH = { w: 371, h: 596 };
export const RealWatch: React.FC<{ w: number }> = ({ w }) => (
  <Img src={staticFile("applepay/watch.png")} style={{ width: w, height: (w * WATCH.h) / WATCH.w, maxWidth: "none", filter: `drop-shadow(0 ${w * 0.08}px ${w * 0.1}px rgba(0,0,0,0.25))` }} />
);

// ---------- Pine-style kinetic slam ----------
export const Slam: React.FC<{ s: number; at: number; out?: number; size: number; color?: string; weight?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ s, at, out = Infinity, size, color = "#fff", weight = 800, children, style }) => {
  if (s < at || s >= out) return null;
  const p = springAt(s, at, { damping: 12, stiffness: 260, mass: 0.55 });
  const blur = (1 - Math.min(1, p)) * 18;
  return (
    <div style={{ fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.045em", color, whiteSpace: "nowrap", transform: `scale(${1.45 - 0.45 * p})`, opacity: Math.min(1, p * 2.2), filter: blur > 0.3 ? `blur(${blur}px)` : undefined, ...style }}>
      {children}
    </div>
  );
};

// Letters rising one by one (for brand lines).
export const Letters: React.FC<{ s: number; at: number; text: string; size: number; color: string; weight?: number; step?: number; style?: React.CSSProperties }> = ({ s, at, text, size, color, weight = 700, step = 0.035, style }) => (
  <div style={{ display: "flex", fontFamily: HEAD, fontWeight: weight, fontSize: size, letterSpacing: "-0.04em", color, lineHeight: 1.05, whiteSpace: "pre", ...style }}>
    {text.split("").map((ch, i) => {
      const p = ramp(s, [at + i * step, at + i * step + 0.5], [0, 1], ease.out);
      return (
        <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * size * 0.5}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined }}>
          {ch}
        </span>
      );
    })}
  </div>
);

export { UI };
