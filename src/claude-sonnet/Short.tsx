// "Done before ten." — Claude Sonnet 5.5, 28s, horizontal (the user films it off the screen and adds the hook).
// Premium night look: near-black with a warm desk-lamp glow and a cool blue fill, film grain and vignette; Claude's clay
// only as an accent; Geist type revealed line by line out of masks (Apple-style), warm gradient on key words; real
// app windows (title bar, layered soft shadows) floating in 3D with depth; whip-cuts with directional motion blur; light
// sweeps across the numbers. Story: 9:47 PM, board deck due at 9 → hand it to Claude → spreadsheet, deck, email build →
// one line fixes a slide → 30%+ faster / up to 30% less per task / same price → Terminal-Bench 10.3% → 70.6% → 9:58,
// lamp off, "Done before ten." → Claude Sonnet 5.5, hard cut to black (loops).
// Facts from Anthropic's announcement (Sept 28, 2026). Music + SFX: scripts/compose-sonnet-short.mjs (timing in T).
import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../brand/Breeders";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { springAt } from "../sarvam-live/kit";
import { ease, ramp } from "../utils";

// ---------- type & colour ----------
const F = "Geist, Inter, sans-serif";
const SZ = { display: 220, title: 112, body: 44, cap: 26 };
const C = { bg: "#09090B", text: "#F4F1EB", sub: "#8F8C85", faint: "#5D5B57", clay: "#E08A6A", clayDeep: "#C9694B", paper: "#FBFAF7", ink: "#17171A", line: "rgba(0,0,0,0.08)", green: "#4CB782" };
const WARM: React.CSSProperties = { backgroundImage: "linear-gradient(180deg, #FFE9DC 0%, #F2A788 70%, #E08A6A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

// ---------- timeline (seconds) ----------
export const T = { clock: 0, chaos: 2.0, claude: 4.5, work: 6.0, sheet: 7.3, deck: 8.8, email: 10.4, fix: 12.0, fast: 14.5, less: 16.0, price: 17.5, bench: 19.0, done: 22.0, drop2: 23.44, end: 26.0, total: 28.0 };
export const SHORT = { fps: 60, width: 1920, height: 1080, seconds: T.total };
const inR = (s: number, a: number, b: number) => s >= a && s < b;

// ---------- atmosphere ----------
const Night: React.FC<{ lamp?: number; cool?: number }> = ({ lamp = 1, cool = 1 }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 52% 62% at 80% 8%, rgba(255,178,132,${0.2 * lamp}), rgba(255,178,132,0) 72%), radial-gradient(ellipse 60% 70% at 6% 100%, rgba(72,98,168,${0.2 * cool}), rgba(72,98,168,0) 70%)` }} />
  </AbsoluteFill>
);
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.16 }}>
    <svg width={1920} height={1080}>
      <filter id={`g${f % 6}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 6} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1920} height={1080} filter={`url(#g${f % 6})`} />
    </svg>
  </AbsoluteFill>
);
const Vignette: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />;

// ---------- a shot: enters with a whip (horizontal motion blur + slide), drifts slowly while it holds ----------
const Shot: React.FC<{ s: number; at: number; until: number; children: React.ReactNode; whip?: 1 | -1 | 0; drift?: number }> = ({ s, at, until, children, whip = 1, drift = 0.035 }) => {
  if (!inR(s, at, until)) return null;
  const k = whip ? ramp(s, [at, at + 0.22], [0, 1], ease.out) : 1;
  const blur = (1 - k) * 46;
  const id = `w${at.toFixed(2).replace(".", "_")}`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${(1 - k) * 260 * whip}px) scale(${1 + ramp(s, [at, until], [0, drift])})`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- type: lines rise out of masks ----------
const Rise: React.FC<{ s: number; at: number; size: number; weight?: number; color?: string; warm?: boolean; tracking?: string; align?: "left" | "center"; children: string; lh?: number }> = ({ s, at, size, weight = 600, color = C.text, warm, tracking, align = "left", children, lh = 1.04 }) => {
  const k = ramp(s, [at, at + 0.75], [0, 1], ease.out);
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12, textAlign: align }}>
      <div style={{ fontFamily: F, fontSize: size, fontWeight: weight, letterSpacing: tracking ?? (size > 150 ? "-0.055em" : size > 80 ? "-0.04em" : "-0.015em"), lineHeight: lh, color, whiteSpace: "nowrap", transform: `translateY(${(1 - k) * 105}%)`, filter: k < 0.95 ? `blur(${(1 - k) * 6}px)` : undefined, ...(warm ? WARM : {}) }}>
        {children}
      </div>
    </div>
  );
};
const Cap: React.FC<{ s: number; at: number; children: string; color?: string }> = ({ s, at, children, color = C.sub }) => (
  <div style={{ fontFamily: F, fontSize: SZ.cap, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color, opacity: ramp(s, [at, at + 0.35]), transform: `translateY(${(1 - ramp(s, [at, at + 0.5], [0, 1], ease.out)) * 10}px)` }}>{children}</div>
);
// a soft light band sweeping across whatever it covers
const Sweep: React.FC<{ s: number; at: number; dur?: number }> = ({ s, at, dur = 0.9 }) => {
  const p = ramp(s, [at, at + dur], [-0.4, 1.4], ease.inOut);
  if (s < at || s > at + dur) return null;
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `linear-gradient(105deg, rgba(255,255,255,0) ${p * 100 - 12}%, rgba(255,235,220,0.28) ${p * 100}%, rgba(255,255,255,0) ${p * 100 + 12}%)` }} />;
};

// ---------- a real-looking app window ----------
const SHADOW = "0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 6px rgba(0,0,0,0.25), 0 40px 80px -20px rgba(0,0,0,0.65), 0 90px 180px -40px rgba(0,0,0,0.6)";
const Win: React.FC<{ title: string; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, w, h, children, style }) => (
  <div style={{ width: w, height: h, borderRadius: 18, background: C.paper, overflow: "hidden", boxShadow: SHADOW, border: "1px solid rgba(255,255,255,0.08)", fontFamily: F, position: "relative", ...style }}>
    <div style={{ height: 48, display: "flex", alignItems: "center", padding: "0 18px", background: "linear-gradient(180deg, #F3F1EC, #ECE9E3)", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", gap: 9 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
        ))}
      </div>
      <div style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 500, color: "#6E6C66", marginRight: 60 }}>{title}</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 48, bottom: 0 }}>{children}</div>
  </div>
);
// a 3D stage: tilt + depth
const Tilt: React.FC<{ rx?: number; ry?: number; z?: number; x?: number; y?: number; children: React.ReactNode; blur?: number; opacity?: number }> = ({ rx = 0, ry = 0, z = 0, x = 0, y = 0, children, blur = 0, opacity = 1 }) => (
  <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "50% 45%" }}>
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", transformStyle: "preserve-3d", transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`, filter: blur ? `blur(${blur}px)` : undefined, opacity }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// ---------- 0–2 · 9:47 PM ----------
const Clock: React.FC<{ s: number; time: string; at: number; size?: number; top?: number; progress?: number }> = ({ s, time, at, size = 260, top = 330, progress }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "baseline", fontFamily: F, fontWeight: 400, fontSize: size, letterSpacing: "-0.06em", color: C.text, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
      {time.split("").map((ch, i) => {
        const k = ramp(s, [at + i * 0.06, at + i * 0.06 + 0.6], [0, 1], ease.out);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", height: size * 1.02 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - k) * 100}%)`, filter: k < 0.95 ? `blur(${(1 - k) * 5}px)` : undefined }}>{ch}</span>
          </span>
        );
      })}
      <span style={{ fontSize: SZ.body, fontWeight: 500, letterSpacing: "0.02em", color: C.sub, marginLeft: 22, opacity: ramp(s, [at + 0.4, at + 0.7]) }}>PM</span>
    </div>
    {progress !== undefined ? (
      <div style={{ width: 620, height: 2, marginTop: 34, background: "rgba(255,255,255,0.1)", opacity: ramp(s, [at + 0.4, at + 0.7]) }}>
        <div style={{ width: `${progress * 100}%`, height: 2, background: "linear-gradient(90deg, rgba(224,138,106,0.2), #E08A6A)", boxShadow: "0 0 12px rgba(224,138,106,0.8)" }} />
      </div>
    ) : null}
  </div>
);

// ---------- 2–4.5 · the mess, as real windows; a calendar notification ----------
const Grid: React.FC<{ s: number; filled?: number; rows?: string[][]; cursor?: boolean }> = ({ s, filled = 0, rows, cursor }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: F }}>
    {Array.from({ length: 9 }, (_, r) => (
      <div key={r} style={{ display: "flex", height: 70, borderBottom: `1px solid ${C.line}`, background: r === 0 ? "#F4F2ED" : r === 5 && rows ? "rgba(224,138,106,0.10)" : undefined }}>
        <div style={{ width: 56, display: "grid", placeItems: "center", fontSize: 16, color: "#A9A69E", borderRight: `1px solid ${C.line}`, background: "#F4F2ED" }}>{r || ""}</div>
        {Array.from({ length: 4 }, (_, c) => {
          const v = rows?.[r]?.[c] ?? (r === 0 ? ["A", "B", "C", "D"][c] : "");
          const idx = r * 4 + c;
          const show = !rows || r === 0 || idx < filled;
          return (
            <div key={c} style={{ flex: c ? 1 : 1.2, display: "flex", alignItems: "center", justifyContent: c ? "flex-end" : "flex-start", padding: "0 22px", borderRight: `1px solid ${C.line}`, fontSize: rows ? 26 : 18, fontWeight: r === 0 || r === 5 ? 600 : 500, color: rows ? (r === 5 && c === 1 ? C.clayDeep : C.ink) : "#A9A69E", fontVariantNumeric: "tabular-nums", opacity: show ? 1 : 0, background: rows && idx === filled - 1 && r > 0 ? "rgba(224,138,106,0.18)" : undefined }}>
              {v}
              {cursor && r === 1 && c === 0 ? <span style={{ width: 2, height: 30, background: "#1A73E8", opacity: Math.floor(s * 3) % 2 }} /> : null}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);
const Notification: React.FC<{ s: number; at: number }> = ({ s, at }) => {
  const k = springAt(s, at, { damping: 18, stiffness: 160, mass: 0.8 });
  return (
    <div style={{ position: "absolute", right: 60, top: 60, width: 560, borderRadius: 22, padding: "20px 22px", display: "flex", gap: 18, background: "rgba(38,38,42,0.78)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", fontFamily: F, transform: `translateX(${(1 - k) * 640}px)`, zIndex: 20 }}>
      <div style={{ width: 58, height: 58, borderRadius: 14, background: "#FBFAF7", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ width: "100%", height: 16, background: "#E5554B", fontSize: 10, color: "#fff", textAlign: "center", fontWeight: 700, lineHeight: "16px" }}>OCT</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: "40px" }}>10</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#A8A59E" }}>
          <span>CALENDAR</span>
          <span>now</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, color: "#F4F1EB", marginTop: 4 }}>Board deck due</div>
        <div style={{ fontSize: 22, color: "#C9C6BF", marginTop: 2 }}>Tomorrow, 9:00 AM</div>
      </div>
    </div>
  );
};
const MAILS = [
  ["Priya", "Re: Q3 numbers?", "Can you send the final figures tonight?"],
  ["Board", "Deck for tomorrow", "Please share before 9 AM."],
  ["Arjun", "Slides status", "Where are we with the deck?"],
  ["Finance", "Updated costs", "One more change to September."],
];
const MailList: React.FC<{ s: number; at: number }> = ({ s, at }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: F }}>
    <div style={{ height: 70, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 26, fontWeight: 600, color: C.ink, borderBottom: `1px solid ${C.line}` }}>
      Inbox <span style={{ marginLeft: 12, fontWeight: 500, color: C.clayDeep, fontVariantNumeric: "tabular-nums" }}>{48 + Math.min(4, Math.floor((s - at) * 6))} unread</span>
    </div>
    {MAILS.map(([from, subj, prev], i) => {
      const k = springAt(s, at + 0.05 + i * 0.13, { damping: 18, stiffness: 220, mass: 0.6 });
      return (
        <div key={subj} style={{ height: 96, padding: "14px 28px", boxSizing: "border-box", borderBottom: `1px solid ${C.line}`, display: "flex", gap: 16, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * -30}px)` }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "#1A73E8", marginTop: 12 }} />
          <div>
            <div style={{ fontSize: 21, fontWeight: 600, color: C.ink }}>
              {from} <span style={{ fontWeight: 500, color: "#55534E", marginLeft: 8 }}>{subj}</span>
            </div>
            <div style={{ fontSize: 18, color: "#8B8881", marginTop: 4 }}>{prev}</div>
          </div>
        </div>
      );
    })}
  </div>
);

// ---------- Claude ----------
const PROMPT = "Turn our Q3 numbers into a board deck, a spreadsheet and a summary email.";
const Composer: React.FC<{ text: string; caret?: boolean; send?: number; w?: number }> = ({ text, caret, send = 0, w = 1160 }) => (
  <div style={{ width: w, borderRadius: 28, background: "rgba(251,250,247,0.97)", padding: "28px 26px 20px 34px", boxSizing: "border-box", boxShadow: SHADOW, fontFamily: F }}>
    <div style={{ minHeight: 80, fontSize: 34, lineHeight: "44px", color: text ? C.ink : "#A9A69E", fontWeight: 500, letterSpacing: "-0.01em" }}>
      {text || "How can I help you tonight?"}
      {caret ? <span style={{ display: "inline-block", width: 2, height: 38, marginLeft: 2, background: C.clayDeep, verticalAlign: "-6px" }} /> : null}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
      <div style={{ height: 48, padding: "0 16px", borderRadius: 12, background: "#F1EEE8", display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 500, color: "#55534E" }}>
        <Icon name="grid" size={20} color="#3E9A63" stroke={2} /> Q3_numbers.csv
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 22, color: "#77746D", fontWeight: 500 }}>Sonnet 5.5</div>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(180deg, #E8957A, ${C.clayDeep})`, display: "grid", placeItems: "center", transform: `scale(${1 - send * 0.12})`, boxShadow: "0 6px 16px rgba(201,105,75,0.45)" }}>
        <Icon name="arrowUp" size={26} color="#fff" stroke={2.6} />
      </div>
    </div>
  </div>
);
const MarkGlow: React.FC<{ s: number; at: number; size: number }> = ({ s, at, size }) => {
  const k = springAt(s, at, { damping: 14, stiffness: 120, mass: 0.9 });
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", inset: -size * 0.9, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(224,138,106,${0.45 * k}), rgba(224,138,106,0))` }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${k}) rotate(${(1 - k) * -140 + (s - at) * 8}deg)`, filter: "drop-shadow(0 10px 30px rgba(224,138,106,0.5))" }}>
        <ClaudeMark size={size} color={C.clay} />
      </div>
    </div>
  );
};

// ---------- the work ----------
const SHEET_ROWS = [
  ["Month", "Revenue", "Costs", "Margin"],
  ["July", "412,000", "289,000", "29.9%"],
  ["August", "468,000", "318,000", "32.1%"],
  ["September", "531,000", "352,000", "33.7%"],
  ["", "", "", ""],
  ["Q3", "1,411,000", "959,000", "32.0%"],
];
const Slide: React.FC<{ kind: 0 | 1 | 2; punch?: number; w?: number }> = ({ kind, punch = 0, w = 900 }) => {
  const h = (w * 9) / 16;
  const u = w / 900;
  return (
    <div style={{ width: w, height: h, borderRadius: 14 * u, background: kind === 0 ? "linear-gradient(160deg, #1D1C20, #121114)" : C.paper, boxShadow: SHADOW, position: "relative", overflow: "hidden", fontFamily: F, border: "1px solid rgba(255,255,255,0.06)" }}>
      {kind === 0 ? (
        <>
          <div style={{ position: "absolute", left: 56 * u, top: 50 * u }}>
            <ClaudeMark size={40 * u} color={C.clay} />
          </div>
          <div style={{ position: "absolute", left: 56 * u, bottom: 70 * u, fontSize: 86 * u, fontWeight: 600, letterSpacing: "-0.05em", ...WARM }}>Q3 Review</div>
          <div style={{ position: "absolute", left: 58 * u, bottom: 40 * u, fontSize: 22 * u, color: C.sub }}>Board meeting · October</div>
        </>
      ) : kind === 1 ? (
        <>
          <div style={{ position: "absolute", left: 56 * u, top: 50 * u, fontSize: 22 * u, letterSpacing: "0.14em", color: "#99958D" }}>REVENUE</div>
          <div style={{ position: "absolute", left: 56 * u, top: 84 * u, fontSize: 60 * u, fontWeight: 600, letterSpacing: "-0.04em", color: C.ink }}>Up 29% in Q3</div>
          <div style={{ position: "absolute", left: 56 * u, right: 56 * u, bottom: 50 * u, height: 220 * u, display: "flex", alignItems: "flex-end", gap: 34 * u }}>
            {[0.55, 0.72, 1].map((hh, i) => (
              <div key={i} style={{ flex: 1, height: `${hh * 100}%`, borderRadius: `${8 * u}px ${8 * u}px 0 0`, background: i === 2 ? `linear-gradient(180deg, #EFA084, ${C.clayDeep})` : "#E3DFD6" }} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 56 * u, top: 50 * u, fontSize: 22 * u, letterSpacing: "0.14em", color: "#99958D" }}>MARGIN</div>
          <div style={{ position: "absolute", left: 56 * u, top: 84 * u, fontSize: (54 + punch * 30) * u, fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1.02, color: C.ink, ...(punch > 0.5 ? WARM : {}), width: 560 * u }}>{punch > 0.5 ? "Record margins." : "Margin overview"}</div>
          <div style={{ position: "absolute", left: 56 * u, right: 56 * u, bottom: 50 * u, height: (170 + punch * 50) * u, display: "flex", alignItems: "flex-end", gap: 20 * u }}>
            {[0.6, 0.66, 0.74, 0.86, 1].map((hh, i) => (
              <div key={i} style={{ flex: 1, height: `${hh * 100}%`, borderRadius: `${6 * u}px ${6 * u}px 0 0`, background: punch > 0.5 ? (i === 4 ? `linear-gradient(180deg, #EFA084, ${C.clayDeep})` : "#2A292D") : "#E3DFD6" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
const EMAIL = "Hi all, the Q3 deck and numbers are attached. Revenue grew 29% over the quarter and margins reached 33.7% in September. Happy to walk through it tomorrow.";

// ---------- the numbers ----------
const Hairlines: React.FC<{ s: number }> = ({ s }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 26 }, (_, i) => {
      const y = 120 + random(`hy${i}`) * 840;
      const len = 260 + random(`hl${i}`) * 520;
      const sp = 1800 + random(`hs${i}`) * 2200;
      const x = (((s * sp + random(`hx${i}`) * 2600) % 2600) + 2600) % 2600 - 400;
      return (
        <line key={i} x1={x} y1={y} x2={x - len} y2={y} stroke={`url(#hl)`} strokeWidth={1.2} opacity={0.35 + random(`ho${i}`) * 0.4} />
      );
    })}
    <defs>
      <linearGradient id="hl" x1="1" x2="0">
        <stop offset="0" stopColor="#FFD9C8" />
        <stop offset="1" stopColor="#FFD9C8" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);
const Stat: React.FC<{ s: number; at: number; big: string; small: string; pre?: string }> = ({ s, at, big, small, pre }) => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", paddingLeft: 180 }}>
    {pre ? <Cap s={s} at={at}>{pre}</Cap> : null}
    <div style={{ height: pre ? 18 : 0 }} />
    <Rise s={s} at={at + 0.05} size={SZ.display + 40} warm>{big}</Rise>
    <div style={{ height: 22 }} />
    <Rise s={s} at={at + 0.3} size={SZ.body} weight={500} color={C.sub}>{small}</Rise>
  </AbsoluteFill>
);

// ---------- 22–26 · the laptop closes ----------
const Laptop: React.FC<{ s: number; at: number }> = ({ s, at }) => {
  const close = ramp(s, [at, at + 0.45], [0, 1], ease.in);
  const glow = 1 - close;
  return (
    <div style={{ position: "absolute", left: 960 - 400, top: 600, width: 800, height: 380, perspective: 1600 }}>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 20, height: 340, transformOrigin: "50% 100%", transform: `rotateX(${close * 86}deg)`, borderRadius: "18px 18px 4px 4px", background: "#1C1C1F", border: "1px solid #3A3A3E", boxShadow: `0 0 ${140 * glow}px rgba(255,190,160,${0.35 * glow})` }}>
        <div style={{ position: "absolute", inset: 14, borderRadius: 8, background: `linear-gradient(160deg, rgba(251,250,247,${0.95 * glow}), rgba(240,170,140,${0.6 * glow}))` }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 22, borderRadius: "3px 3px 16px 16px", background: "linear-gradient(180deg, #4A4A4F, #2A2A2E)" }} />
    </div>
  );
};

export const ClaudeSonnetShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const typedN = Math.max(0, Math.min(PROMPT.length, Math.floor((s - T.work - 0.05) * 80)));
  const sendAt = T.work + 0.05 + PROMPT.length / 80 + 0.1;
  const lamp = 1 - ramp(s, [22.7, 22.74]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("sonnet/short-mix.wav")} />

      {/* 0–2 · 9:47 PM */}
      <Shot s={s} at={T.clock} until={T.chaos} whip={0} drift={0.05}>
        <Night />
        <Clock s={s} time="9:47" at={0.12} progress={ramp(s, [0.5, 2.0])} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 260 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Cap s={s} at={0.5}>Thursday night</Cap>
          </div>
        </div>
      </Shot>

      {/* 2–4.5 · the mess: three windows, whip-cut; the deadline as a calendar notification */}
      <Shot s={s} at={T.chaos} until={T.chaos + 0.8} whip={1}>
        <Night />
        <Tilt ry={-16} rx={6} x={260} z={-80}>
          <Win title="Q3_numbers.xlsx" w={1040} h={680}>
            <Grid s={s} cursor />
          </Win>
        </Tilt>
        <div style={{ position: "absolute", left: 140, top: 640 }}>
          <Cap s={s} at={T.chaos + 0.1}>Numbers</Cap>
          <div style={{ height: 14 }} />
          <Rise s={s} at={T.chaos + 0.12} size={SZ.title}>Not done.</Rise>
        </div>
      </Shot>
      <Shot s={s} at={T.chaos + 0.8} until={T.chaos + 1.6} whip={-1}>
        <Night />
        <Tilt ry={14} rx={5} x={-240} z={-80}>
          <Win title="Board deck.key" w={1080} h={660}>
            <div style={{ position: "absolute", inset: 40, borderRadius: 10, border: "2px dashed #D6D2C8", display: "grid", placeItems: "center", fontSize: 44, color: "#B3AFA5" }}>
              <span>
                Click to add title<span style={{ display: "inline-block", width: 3, height: 46, marginLeft: 6, background: C.ink, verticalAlign: "-8px", opacity: Math.floor(s * 3) % 2 }} />
              </span>
            </div>
          </Win>
        </Tilt>
        <div style={{ position: "absolute", right: 140, top: 640, textAlign: "right" }}>
          <Cap s={s} at={T.chaos + 0.9}>Slides</Cap>
          <div style={{ height: 14 }} />
          <Rise s={s} at={T.chaos + 0.92} size={SZ.title}>Empty.</Rise>
        </div>
      </Shot>
      <Shot s={s} at={T.chaos + 1.6} until={T.claude} whip={1}>
        <Night />
        <Tilt ry={-12} rx={6} x={260} z={-60}>
          <Win title="Mail" w={1000} h={520}>
            <MailList s={s} at={T.chaos + 1.65} />
          </Win>
        </Tilt>
        <div style={{ position: "absolute", left: 140, top: 640 }}>
          <Cap s={s} at={T.chaos + 1.7}>Inbox</Cap>
          <div style={{ height: 14 }} />
          <Rise s={s} at={T.chaos + 1.72} size={SZ.title}>Waiting.</Rise>
        </div>
      </Shot>
      {inR(s, T.chaos + 0.15, T.claude) ? <Notification s={s} at={T.chaos + 0.15} /> : null}

      {/* 4.5–6 · hand it to Claude */}
      <Shot s={s} at={T.claude} until={T.work} whip={0} drift={0.04}>
        <Night lamp={1.2} />
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 70 }}>
          <MarkGlow s={s} at={T.claude + 0.05} size={150} />
          <div style={{ opacity: ramp(s, [T.claude + 0.35, T.claude + 0.6]), transform: `translateY(${(1 - ramp(s, [T.claude + 0.35, T.claude + 0.85], [0, 1], ease.out)) * 50}px)` }}>
            <Composer text="" />
          </div>
        </AbsoluteFill>
      </Shot>

      {/* 6–7.3 · the prompt, close */}
      <Shot s={s} at={T.work} until={T.sheet} whip={0} drift={0.06}>
        <Night lamp={1.2} />
        <Tilt rx={8} z={160}>
          <Composer text={PROMPT.slice(0, typedN)} caret={s < sendAt} send={s > sendAt - 0.05 && s < sendAt + 0.12 ? 1 : 0} />
        </Tilt>
      </Shot>

      {/* 7.3–8.8 · the spreadsheet fills; the chart beside it */}
      <Shot s={s} at={T.sheet} until={T.deck} whip={1}>
        <Night />
        <Tilt ry={-10 + ramp(s, [T.sheet, T.deck], [0, 5])} rx={6} x={-180} z={-40}>
          <Win title="Q3_numbers.xlsx" w={1080} h={500}>
            <Grid s={s} rows={SHEET_ROWS} filled={Math.floor((s - T.sheet - 0.05) * 24)} />
          </Win>
        </Tilt>
        <Tilt ry={-18} rx={6} x={720} y={60} z={-200}>
          <Win title="Revenue" w={460} h={420}>
            <div style={{ position: "absolute", left: 36, right: 36, bottom: 36, top: 36, display: "flex", alignItems: "flex-end", gap: 26 }}>
              {[0.55, 0.72, 1].map((hh, i) => (
                <div key={i} style={{ flex: 1, height: `${hh * 100 * ramp(s, [T.sheet + 0.6, T.sheet + 1.2], [0, 1], ease.out)}%`, borderRadius: "8px 8px 0 0", background: i === 2 ? `linear-gradient(180deg, #EFA084, ${C.clayDeep})` : "#E3DFD6" }} />
              ))}
            </div>
          </Win>
        </Tilt>
        <div style={{ position: "absolute", left: 140, top: 90 }}>
          <Cap s={s} at={T.sheet + 0.05} color={C.clay}>01 · Spreadsheet</Cap>
        </div>
      </Shot>

      {/* 8.8–10.4 · the deck: three slides fan out in depth */}
      <Shot s={s} at={T.deck} until={T.email} whip={-1}>
        <Night />
        {[0, 2, 1].map((i) => {
          const k = springAt(s, T.deck + 0.05 + i * 0.22, { damping: 18, stiffness: 140, mass: 0.8 });
          const side = i - 1;
          return (
            <Tilt key={i} ry={side * -26 * k} x={side * 520 * k} z={side === 0 ? 60 : -380} y={(1 - k) * 600} opacity={Math.min(1, k * 2)}>
              <Slide kind={i as 0 | 1 | 2} w={side === 0 ? 880 : 760} />
            </Tilt>
          );
        })}
        <div style={{ position: "absolute", left: 140, top: 90 }}>
          <Cap s={s} at={T.deck + 0.05} color={C.clay}>02 · Deck</Cap>
        </div>
      </Shot>

      {/* 10.4–12 · the email writes itself */}
      <Shot s={s} at={T.email} until={T.fix} whip={1}>
        <Night />
        <Tilt ry={8} rx={6} x={120} z={-40}>
          <Win title="New message" w={1100} h={560}>
            <div style={{ padding: "30px 40px", fontFamily: F }}>
              <div style={{ fontSize: 20, color: "#8B8881" }}>To: Board</div>
              <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em", color: C.ink, marginTop: 8 }}>Q3 review, ready for tomorrow</div>
              <div style={{ height: 1, background: C.line, margin: "22px 0" }} />
              <div style={{ fontSize: 26, lineHeight: "40px", color: "#3E3C38", minHeight: 170 }}>{EMAIL.slice(0, Math.max(0, Math.floor((s - T.email - 0.1) * 120)))}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
                {["Q3 Review.key", "Q3_numbers.xlsx"].map((f) => (
                  <div key={f} style={{ height: 46, padding: "0 16px", borderRadius: 12, background: "#F1EEE8", display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 500, color: "#55534E" }}>
                    <Icon name="file" size={18} color={C.clayDeep} stroke={2} /> {f}
                  </div>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ height: 50, padding: "0 30px", borderRadius: 25, background: `linear-gradient(180deg, #E8957A, ${C.clayDeep})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 21, fontWeight: 600, boxShadow: s > T.email + 1.4 ? "0 0 0 8px rgba(224,138,106,0.22)" : "0 6px 14px rgba(201,105,75,0.4)" }}>Send</div>
              </div>
            </div>
          </Win>
        </Tilt>
        <div style={{ position: "absolute", left: 140, top: 90 }}>
          <Cap s={s} at={T.email + 0.05} color={C.clay}>03 · Email</Cap>
        </div>
      </Shot>

      {/* 12–14.5 · one line fixes slide 3 */}
      <Shot s={s} at={T.fix} until={T.fast} whip={-1}>
        <Night />
        <Tilt ry={-8} rx={5} x={-200} z={20}>
          <Slide kind={2} w={980} punch={ramp(s, [T.fix + 1.15, T.fix + 1.5], [0, 1], ease.out)} />
        </Tilt>
        <div style={{ position: "absolute", right: 110, top: 560, padding: "22px 28px", borderRadius: "24px 24px 6px 24px", background: "rgba(251,250,247,0.97)", boxShadow: SHADOW, fontFamily: F, fontSize: 30, fontWeight: 500, color: C.ink, opacity: ramp(s, [T.fix + 0.1, T.fix + 0.25]) }}>
          {"Make slide 3 hit harder.".slice(0, Math.max(0, Math.floor((s - T.fix - 0.15) * 40)))}
        </div>
        {s > T.fix + 1.5 ? (
          <div style={{ position: "absolute", right: 120, top: 700, display: "flex", alignItems: "center", gap: 14, fontFamily: F, fontSize: SZ.body, fontWeight: 600, letterSpacing: "-0.02em", color: C.text, opacity: ramp(s, [T.fix + 1.5, T.fix + 1.7]) }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: C.green, display: "grid", placeItems: "center", transform: `scale(${springAt(s, T.fix + 1.5, { damping: 10, stiffness: 240, mass: 0.5 })})`, boxShadow: "0 0 30px rgba(76,183,130,0.5)" }}>
              <Icon name="check" size={30} color="#fff" stroke={3} />
            </div>
            Updated
          </div>
        ) : null}
      </Shot>

      {/* 14.5–19 · the numbers */}
      <Shot s={s} at={T.fast} until={T.less} whip={1}>
        <Night lamp={1.3} />
        <Hairlines s={s} />
        <Stat s={s} at={T.fast} pre="Sonnet 5.5" big="30%+ faster" small="outputs than Sonnet 5." />
        <Sweep s={s} at={T.fast + 0.55} />
      </Shot>
      <Shot s={s} at={T.less} until={T.price} whip={-1}>
        <Night lamp={1.1} cool={1.4} />
        <Stat s={s} at={T.less} pre="Up to" big="30% less" small="cost per task." />
        <Sweep s={s} at={T.less + 0.55} />
      </Shot>
      <Shot s={s} at={T.price} until={T.bench} whip={1}>
        <Night lamp={1.2} />
        <Stat s={s} at={T.price} pre="And" big="Same price." small="$2 / $10 per million tokens." />
        <Sweep s={s} at={T.price + 0.55} />
      </Shot>

      {/* 19–22 · Terminal-Bench */}
      <Shot s={s} at={T.bench} until={T.done} whip={0} drift={0.03}>
        <Night cool={1.3} />
        {(() => {
          const k = ramp(s, [T.bench + 0.35, T.bench + 1.7], [0, 1], ease.out);
          const v = 10.3 + (70.6 - 10.3) * k;
          return (
            <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Cap s={s} at={T.bench + 0.05}>Terminal-Bench 4.0</Cap>
              <div style={{ fontFamily: F, fontSize: SZ.display + 60, fontWeight: 500, letterSpacing: "-0.06em", lineHeight: 1.05, fontVariantNumeric: "tabular-nums", marginTop: 20, ...WARM }}>{v.toFixed(1)}%</div>
              <div style={{ position: "relative", width: 1000, height: 2, marginTop: 40, background: "rgba(255,255,255,0.12)" }}>
                <div style={{ width: `${v}%`, height: 2, background: "linear-gradient(90deg, rgba(224,138,106,0.3), #F2A788)", boxShadow: "0 0 18px rgba(242,167,136,0.9)" }} />
                <div style={{ position: "absolute", left: "10.3%", top: -10, width: 1, height: 22, background: C.sub }} />
              </div>
              <div style={{ width: 1000, display: "flex", justifyContent: "space-between", marginTop: 20, fontFamily: F, fontSize: SZ.cap, color: C.sub }}>
                <span>Sonnet 5 · 10.3%</span>
                <span style={{ color: C.text, opacity: ramp(k, [0.9, 1]) }}>Sonnet 5.5 · 70.6%</span>
              </div>
              <Sweep s={s} at={T.bench + 1.75} />
            </AbsoluteFill>
          );
        })()}
      </Shot>

      {/* 22–26 · 9:58, the laptop closes, the lamp clicks off; silence; "Done before ten." */}
      <Shot s={s} at={T.done} until={T.end} whip={0} drift={0.02}>
        <Night lamp={lamp} cool={1 + (1 - lamp) * 0.8} />
        {s < T.drop2 ? (
          <>
            <Clock s={s} time="9:58" at={T.done + 0.05} top={150} size={200} />
            <Laptop s={s} at={22.25} />
          </>
        ) : (
          <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Rise s={s} at={T.drop2} size={SZ.display + 30} align="center">Done</Rise>
            <Rise s={s} at={T.drop2 + 0.18} size={SZ.display + 30} align="center" warm>before ten.</Rise>
            <Sweep s={s} at={T.drop2 + 0.6} dur={1.1} />
          </AbsoluteFill>
        )}
      </Shot>

      {/* 26–28 · Claude Sonnet 5.5, then a hard cut to black (loops into 9:47) */}
      <Shot s={s} at={T.end} until={T.total - 0.12} whip={0} drift={0.03}>
        <Night lamp={0.7} />
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50 }}>
          <MarkGlow s={s} at={T.end + 0.05} size={130} />
          <Rise s={s} at={T.end + 0.25} size={SZ.title} align="center">Claude Sonnet 5.5</Rise>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: F, fontSize: 15, color: C.faint, opacity: ramp(s, [T.end + 0.6, T.end + 0.9]) }}>
          Concept film by Breeders. Not affiliated with Anthropic. Figures from Anthropic's announcement, Sept 28, 2026.
        </div>
      </Shot>

      <Vignette />
      <Grain f={frame} />
      <Watermark opacity={inR(s, T.end, T.total) ? 0 : 0.85} font={F} dark={1} />
    </AbsoluteFill>
  );
};
