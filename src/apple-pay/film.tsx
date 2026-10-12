// "Worth the wait." Apple Pay India concept launch film. Absolute seconds `s`, 120 BPM (a beat every 0.5s).
// Act 1 the wait (world map lights up from 2014, India waits) · Act 2 Finally (2026, India ignites, reveal) ·
// Act 3 your iPhone can finally tap · Act 4 everywhere (colour worlds cut by tap rings, accelerating) · Act 5 online ·
// Act 6 finale (every dot folds into one ring → Done → end card).
import React from "react";
import { AbsoluteFill, OffthreadVideo, random, staticFile } from "remotion";
import { springAt, track } from "../sarvam-live/kit";
import { ease, ramp } from "../utils";
import { SFD, SFT } from "./fonts";
import { COUNTRIES, DOTS, INDIA, INDIA_AT, MAP } from "./map";
import { PayMark } from "./logo";
import { BLUE, ClassicCard, DoneTick, FaceIdGlyph, IPhone, phoneGeom, RealWatch, StatusBar, Terminal, WalletScreen, WATCH } from "./real";

const INK = "#1D1D1F";
const GRAY = "#86868B";
const PAPER = "#F5F5F7";

// ---------- typography ----------
// Lead (small) + punch (big) on one baseline: Display 500/44/-0.01em and Display 600/128/-0.032em.
const appear = (s: number, at: number) => ramp(s, [at, at + 0.38], [0, 1], ease.out);
export const Caption: React.FC<{ s: number; at: number; out?: number; lead?: string; punch: string; color?: string; size?: number; align?: "left" | "center"; shadow?: boolean }> = ({
  s,
  at,
  out = Infinity,
  lead,
  punch,
  color = INK,
  size = 128,
  align = "left",
  shadow,
}) => {
  if (s < at || s >= (Number.isFinite(out) ? out + 0.25 : Infinity)) return null;
  const gone = Number.isFinite(out) ? ramp(s, [out, out + 0.22], [0, 1], ease.in) : 0;
  const a = appear(s, at);
  const b = appear(s, at + (lead ? 0.16 : 0));
  const word = (p: number): React.CSSProperties => ({ display: "inline-block", opacity: p * (1 - gone), transform: `translateY(${(1 - p) * 26 - gone * 10}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 7}px)` : undefined });
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: align === "center" ? "center" : "flex-start", gap: size * 0.16, color, textShadow: shadow ? "0 2px 30px rgba(0,0,0,0.35)" : undefined, whiteSpace: "nowrap" }}>
      {lead ? <span style={{ ...word(a), fontFamily: SFD, fontWeight: 500, fontSize: size * 0.344, letterSpacing: "-0.01em", lineHeight: 1 }}>{lead}</span> : null}
      <span style={{ ...word(b), fontFamily: SFD, fontWeight: 600, fontSize: size, letterSpacing: "-0.032em", lineHeight: 0.95 }}>{punch}</span>
    </div>
  );
};
const LowerLeft: React.FC<{ children: React.ReactNode; bottom?: number }> = ({ children, bottom = 150 }) => <div style={{ position: "absolute", left: 140, bottom }}>{children}</div>;

// Circle reveal: children shown inside a circle growing from (x, y).
const Reveal: React.FC<{ s: number; at: number; dur?: number; x: number; y: number; children: React.ReactNode; ring?: string }> = ({ s, at, dur = 0.42, x, y, children, ring = "rgba(255,255,255,0.9)" }) => {
  if (s < at) return null;
  const r = ramp(s, [at, at + dur], [0, 2300], ease.in);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${x}px ${y}px)` }}>{children}</AbsoluteFill>
      {r < 2250 ? <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", boxShadow: `0 0 0 3px ${ring}, 0 0 40px 6px rgba(255,255,255,0.35)` }} /> : null}
    </AbsoluteFill>
  );
};
const Clip: React.FC<{ src: string; from?: number }> = ({ src, from = 0 }) => (
  <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(from * 60)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
);

// ---------- the world map ----------
const yearAt = (y: number) => (y === 2014 ? 1.0 : 2.0 + (y - 2015) * 0.5);
const LIGHT: number[] = (() => {
  const t = new Array(DOTS.length).fill(Infinity);
  const perYear: Record<number, number> = {};
  for (const c of COUNTRIES) {
    const k = (perYear[c.year] = (perYear[c.year] ?? -1) + 1);
    const t0 = yearAt(c.year) + k * 0.07;
    for (const i of c.dots) t[i] = Math.min(t[i], t0 + random(`lt${i}`) * 0.28);
  }
  return t;
})();
const INDIA_SET = new Set(INDIA);
const MAP_X = (1920 - MAP.w) / 2;
const MAP_Y = (1080 - MAP.h) / 2 + 20;
export const WorldMap: React.FC<{ s: number; sc: number; fx: number; fy: number; indiaLit: number; pulse: number; converge?: number; wave?: number }> = ({ s, sc, fx, fy, indiaLit, pulse, converge = 0, wave = -1 }) => {
  const ix = MAP_X + INDIA_AT.x;
  const iy = MAP_Y + INDIA_AT.y;
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - fx * sc}px, ${540 - fy * sc}px) scale(${sc})` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="mapglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={3.2} />
          </filter>
        </defs>
        {DOTS.map(([x, y], i) => {
          const india = INDIA_SET.has(i);
          if (india || LIGHT[i] <= s) return null;
          return <circle key={i} cx={MAP_X + x} cy={MAP_Y + y} r={2.3} fill="#D6D6DB" opacity={1 - converge} />;
        })}
        {[0, 1].map((layer) => (
          <g key={layer} opacity={layer === 0 ? 0 : 1}>
            {DOTS.map(([x, y], i) => {
              if (INDIA_SET.has(i) || LIGHT[i] > s) return null;
              const k = ramp(s, [LIGHT[i], LIGHT[i] + 0.3], [0, 1], ease.out);
              let px = MAP_X + x;
              let py = MAP_Y + y;
              if (converge > 0) {
                const a = Math.atan2(py - 540, px - 960);
                const c = ramp(converge, [random(`cv${i}`) * 0.35, random(`cv${i}`) * 0.35 + 0.65], [0, 1], ease.inOut);
                px = px + (960 + Math.cos(a) * 150 - px) * c;
                py = py + (540 + Math.sin(a) * 150 - py) * c;
              }
              const d = wave >= 0 ? Math.hypot(px - ix, py - iy) : 0;
              const w = wave >= 0 ? Math.max(0, 1 - Math.abs(d - wave) / 120) : 0;
              return <circle key={i} cx={px} cy={py} r={2.4 + k * 0.4 + w * 1.6} fill={`rgb(${Math.round(29 + w * -19)},${Math.round(29 + w * 103)},${Math.round(31 + w * 224)})`} opacity={k * (0.85 + w * 0.15)} />;
            })}
          </g>
        ))}
        {/* India: amber while it waits, then it ignites */}
        {INDIA.map((i) => {
          const [x, y] = DOTS[i];
          let px = MAP_X + x;
          let py = MAP_Y + y;
          if (converge > 0) {
            const a = Math.atan2(py - 540, px - 960);
            const c = ramp(converge, [0.3, 0.95], [0, 1], ease.inOut);
            px = px + (960 + Math.cos(a) * 150 - px) * c;
            py = py + (540 + Math.sin(a) * 150 - py) * c;
          }
          const wait = 0.35 + 0.45 * pulse;
          const col = indiaLit > 0 ? `rgb(${Math.round(245 - 13 * indiaLit)},${Math.round(166 - 6 * indiaLit)},${Math.round(35 + 25 * indiaLit)})` : "#F5A623";
          return <circle key={i} cx={px} cy={py} r={2.6 + indiaLit * 0.8} fill={col} opacity={indiaLit > 0 ? 1 : wait} />;
        })}
        {indiaLit > 0 ? (
          <g filter="url(#mapglow)" opacity={0.9 * (1 - converge)}>
            {INDIA.map((i) => (
              <circle key={i} cx={MAP_X + DOTS[i][0]} cy={MAP_Y + DOTS[i][1]} r={4.6} fill="rgba(245,166,35,0.55)" />
            ))}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the year counter ----------
const Counter: React.FC<{ s: number; year: number; changedAt: number; dim?: number }> = ({ s, year, changedAt, dim = 0 }) => {
  const k = ramp(s, [changedAt, changedAt + 0.16], [0, 1], ease.out);
  const big: React.CSSProperties = { fontFamily: SFD, fontWeight: 600, fontSize: 150, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: INK };
  return (
    <div style={{ position: "absolute", left: 140, bottom: 120, opacity: 1 - dim * 0.5 }}>
      <div style={{ fontFamily: SFT, fontWeight: 500, fontSize: 28, color: GRAY, letterSpacing: "0.01em", marginBottom: 6 }}>Apple Pay</div>
      <div style={{ height: 150, overflow: "hidden", position: "relative" }}>
        <div style={{ ...big, transform: `translateY(${-(1 - k) * 0}px)` }}>
          <div style={{ transform: `translateY(${(1 - k) * 150}px)`, filter: k < 0.98 ? `blur(${(1 - k) * 6}px)` : undefined }}>{year}</div>
        </div>
        {k < 1 ? <div style={{ ...big, position: "absolute", top: 0, transform: `translateY(${-k * 150}px)`, opacity: 1 - k }}>{year - 1}</div> : null}
      </div>
    </div>
  );
};

// ================= ACT 1 + 2 opening (0–9.75s): the wait =================
export const ActWait: React.FC<{ s: number; ring?: boolean }> = ({ s, ring = true }) => {
  const ix = MAP_X + INDIA_AT.x;
  const iy = MAP_Y + INDIA_AT.y;
  const sc = track(s, [[0, 1.0], [3, 1.02], [7, 1.28], [8.6, 1.62], [9.75, 1.7]]);
  const fx = track(s, [[0, 960], [3, 980], [7, ix - 60], [8.6, ix], [9.75, ix]]);
  const fy = track(s, [[0, 540], [3, 540], [7, iy + 30], [8.6, iy], [9.75, iy]]);
  const year = s < 1.0 ? 2014 : s < 2.0 ? 2014 : s < 9.15 ? Math.min(2025, 2015 + Math.floor((s - 2.0) / 0.5)) : 2026;
  const changedAt = year === 2014 ? 0.6 : year === 2026 ? 9.15 : 2.0 + (year - 2015) * 0.5;
  const speed = ramp(s, [2.5, 8.6], [0, 1], ease.linear);
  const pulse = s < 2.5 ? 0 : 0.5 + 0.5 * Math.sin(s * (5 + speed * 14));
  const lit = ramp(s, [9.2, 9.45], [0, 1], ease.out);
  const label = ramp(s, [3.0, 3.4]) * (1 - ramp(s, [9.1, 9.3]));
  // screen position of India (for the label and the ring), after the camera
  const sx = 960 + (ix - fx) * sc;
  const sy = 540 + (iy - fy) * sc;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <AbsoluteFill style={{ opacity: ramp(s, [0, 0.5]) }}>
      <WorldMap s={s} sc={sc} fx={fx} fy={fy} indiaLit={lit} pulse={pulse} />
      <div style={{ position: "absolute", left: sx + 46, top: sy - 70, opacity: label }}>
        <div style={{ position: "absolute", left: -40, top: 58, width: 40, height: 1.5, background: "rgba(217,130,43,0.7)", transform: "rotate(-40deg)", transformOrigin: "0 0" }} />
        <div style={{ fontFamily: SFT, fontWeight: 600, fontSize: 26, color: "#D9822B", letterSpacing: "0.01em" }}>India</div>
      </div>
      {s >= 0.6 ? <Counter s={s} year={year} changedAt={changedAt} dim={ramp(s, [8.6, 9.0]) * (1 - ramp(s, [9.1, 9.2]))} /> : null}
      <div style={{ position: "absolute", left: 140, top: 130 }}>
        <Caption s={s} at={1.0} out={2.6} lead="In 2014," punch="the world began to tap." size={96} />
        <Caption s={s} at={3.0} out={4.8} lead="Then," punch="country after country." size={96} />
        <Caption s={s} at={5.1} out={6.7} lead="Over" punch="80 countries." size={96} />
        <Caption s={s} at={7.0} out={8.65} lead="And India?" punch="Still waiting." size={96} />
      </div>
      </AbsoluteFill>
      {/* 2026: India ignites and a ring takes the screen */}
      {ring && s >= 9.3 ? (
        <div style={{ position: "absolute", left: sx - ramp(s, [9.3, 9.75], [0, 2300], ease.in), top: sy - ramp(s, [9.3, 9.75], [0, 2300], ease.in), width: ramp(s, [9.3, 9.75], [0, 4600], ease.in), height: ramp(s, [9.3, 9.75], [0, 4600], ease.in), borderRadius: "50%", background: "#fff", boxShadow: "0 0 80px 20px rgba(255,190,110,0.7)" }} />
      ) : null}
    </AbsoluteFill>
  );
};

// ================= ACT 2 (9.75–13s): Finally. → Apple Pay, now in India =================
export const ActFinally: React.FC<{ s: number }> = ({ s }) => {
  const w = 440;
  const g = phoneGeom(w);
  const rise = springAt(s, 10.85, { damping: 17, stiffness: 120, mass: 0.9 });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {s < 10.9 ? (
        <AbsoluteFill style={{ opacity: ramp(s, [9.75, 9.95]) }}>
          <Clip src="applepay/ref/smoke.mp4" from={0.4} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 520 }}>
            <Caption s={s} at={9.95} punch="Finally." size={170} align="center" shadow />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "#fff", opacity: ramp(s, [10.75, 10.9]) }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: PAPER }}>
          <div style={{ position: "absolute", left: 960 - w / 2, top: 360 + (1 - rise) * 760 }}>
            <IPhone w={w}>
              <WalletScreen sw={g.sw} sh={g.sh} cardY={-(1 - springAt(s, 11.25)) * g.sw * 1.3} cardSheen={ramp(s, [11.6, 12.4], [-0.3, 1.3])}>
                <DoneTick p={ramp(s, [11.75, 12.25], [0, 1], ease.linear)} size={g.sw * 0.16} />
                <div style={{ fontFamily: SFT, fontSize: g.sw * 0.06, color: GRAY, marginTop: g.sw * 0.03, opacity: ramp(s, [12.0, 12.2]) }}>Done</div>
              </WalletScreen>
            </IPhone>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center" }}>
            <Caption s={s} at={11.0} punch="Apple Pay" color={INK} size={120} align="center" />
            <div style={{ height: 14 }} />
            <Caption s={s} at={11.45} punch="Now in India." color={GRAY} size={48} align="center" />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ================= ACT 3 (13–19s): your iPhone can finally tap =================
const PW = 560;
const PG = phoneGeom(PW);
const P0 = { x: 1000, y: 0 };
const BTN = { x: P0.x + PW, y: P0.y + PG.h * 0.366 };
const bump = (s: number, at: number, len = 0.35) => ramp(s, [at, at + 0.05], [0, 1]) * (1 - ramp(s, [at + 0.07, at + len], [0, 1]));
export const ActTap: React.FC<{ s: number }> = ({ s }) => {
  if (s < 14.0)
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Clip src="applepay/ref/titanium.mp4" from={0.2} />
        <LowerLeft>
          <Caption s={s} at={13.1} lead="Your iPhone can" punch="finally tap." shadow />
        </LowerLeft>
      </AbsoluteFill>
    );
  if (s >= 18.0) {
    const wIn = springAt(s, 18.0, { damping: 15, stiffness: 140, mass: 0.8 });
    const ww = 430;
    const k = ww / WATCH.w;
    return (
      <AbsoluteFill style={{ background: PAPER }}>
        <div style={{ position: "absolute", left: 1240, top: 170 + (1 - wIn) * 800, transform: `rotate(${(1 - wIn) * 10 - 4}deg)` }}>
          <RealWatch w={ww} />
          {/* our own watch screen over the press image's: a card and Done */}
          <div style={{ position: "absolute", left: 36 * k, top: 168 * k, width: 300 * k, height: 320 * k, borderRadius: 50 * k, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 * k }}>
            <ClassicCard w={268 * k} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 * k, fontFamily: SFT, fontWeight: 600, fontSize: 34 * k, color: "#fff", opacity: ramp(s, [18.45, 18.6]) }}>
              <DoneTick p={ramp(s, [18.4, 18.8], [0, 1], ease.linear)} size={34 * k} color="#fff" />
              Done
            </div>
          </div>
        </div>
        <LowerLeft>
          <Caption s={s} at={18.1} lead="Or just" punch="raise your wrist." color={INK} />
        </LowerLeft>
      </AbsoluteFill>
    );
  }
  const sc = track(s, [[14.0, 1.6], [14.9, 1.62], [15.15, 1.12], [15.9, 1.14], [16.1, 0.98], [16.9, 1.0], [17.1, 1.1], [18, 1.13]]);
  const fx = track(s, [[14.0, BTN.x - 500], [14.9, BTN.x - 490], [15.15, 1280], [15.9, 1280], [16.1, 1080], [16.9, 1080], [17.1, 1280], [18, 1280]]);
  const fy = track(s, [[14.0, BTN.y], [14.9, BTN.y], [15.15, 560], [15.9, 560], [16.1, 560], [16.9, 560], [17.1, 600], [18, 600]]);
  const press = Math.max(bump(s, 14.35), bump(s, 14.62));
  const tilt = ramp(s, [16.05, 16.45], [0, 1], ease.inOut) * (1 - ramp(s, [16.95, 17.25], [0, 1], ease.inOut));
  const term = springAt(s, 16.05, { damping: 15, stiffness: 150, mass: 0.8 }) * (1 - ramp(s, [17.0, 17.35], [0, 1], ease.in));
  const stage = s < 15 ? "lock" : s < 16 ? "face" : s < 17 ? "hold" : "done";
  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - fx * sc}px, ${540 - fy * sc}px) scale(${sc})` }}>
        <div style={{ position: "absolute", left: 640, top: 400 + (1 - term) * 900, opacity: term > 0.01 ? 1 : 0 }}>
          <Terminal w={300} merchant="Blue Tokai · Bengaluru" amount="₹240.00" done={ramp(s, [16.6, 17.0], [0, 1], ease.linear)} />
        </div>
        {[0, 1, 2].map((i) => {
          const k = ramp(s, [16.5 + i * 0.12, 16.5 + i * 0.12 + 0.8], [0, 1], ease.out);
          const r = 40 + k * 340;
          return k > 0 && k < 1 ? <div key={i} style={{ position: "absolute", left: 920 - r, top: 560 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `3px solid rgba(26,140,255,${0.7 * (1 - k)})` }} /> : null;
        })}
        <div style={{ position: "absolute", left: P0.x - tilt * 120, top: P0.y + tilt * 60, transform: `rotate(${-tilt * 14}deg)`, transformOrigin: "30% 50%" }}>
          <IPhone w={PW} power={press}>
            <WalletScreen
              sw={PG.sw}
              sh={PG.sh}
              over={
                stage === "lock" ? (
                  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 20%, #2A2F4A 0%, #0B0D16 70%)" }}>
                    <StatusBar sw={PG.sw} dark />
                    <div style={{ position: "absolute", left: 0, right: 0, top: PG.sw * 0.14, textAlign: "center", fontFamily: SFT, fontWeight: 500, fontSize: PG.sw * 0.052, color: "rgba(255,255,255,0.8)" }}>Wednesday 30 September</div>
                    <div style={{ position: "absolute", left: 0, right: 0, top: PG.sw * 0.2, textAlign: "center", fontFamily: SFD, fontWeight: 600, fontSize: PG.sw * 0.27, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.92)" }}>9:41</div>
                    <div style={{ position: "absolute", right: PG.sw * 0.03, top: PG.h * 0.307 - PG.inset, height: PG.h * 0.119, display: "flex", alignItems: "center", gap: PG.sw * 0.03 }}>
                      <span style={{ fontFamily: SFT, fontSize: PG.sw * 0.05, fontWeight: 600, color: "#fff", opacity: ramp(s, [14.1, 14.3]) }}>Double Click to Pay</span>
                      <div style={{ width: PG.sw * 0.016, height: "100%", borderRadius: PG.sw * 0.01, background: BLUE, opacity: 0.35 + 0.65 * press, boxShadow: `0 0 ${PG.sw * 0.05 * press}px rgba(26,140,255,0.9)` }} />
                    </div>
                  </AbsoluteFill>
                ) : null
              }
            >
              {stage === "face" ? <FaceIdGlyph p={ramp(s, [15.1, 15.95], [0, 1], ease.linear)} size={PG.sw * 0.31} /> : null}
              {stage === "hold" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: PG.sw * 0.04 }}>
                  <svg width={PG.sw * 0.18} height={PG.sw * 0.18} viewBox="0 0 24 24">
                    {[0, 1, 2, 3].map((i) => (
                      <path key={i} d={`M ${6 + i * 3.4} ${7 - i * 1.6} q ${3 + i} ${5 + i * 1.6} 0 ${10 + i * 3.2}`} fill="none" stroke={BLUE} strokeWidth={1.7} strokeLinecap="round" opacity={0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s * 14 - i * 1.2))} />
                    ))}
                  </svg>
                  <div style={{ fontFamily: SFT, fontSize: PG.sw * 0.062, fontWeight: 600, color: INK }}>Hold Near Reader</div>
                </div>
              ) : null}
              {stage === "done" ? (
                <>
                  <DoneTick p={ramp(s, [17.05, 17.6], [0, 1], ease.linear)} size={PG.sw * 0.2} />
                  <div style={{ fontFamily: SFT, fontSize: PG.sw * 0.062, color: GRAY, marginTop: PG.sw * 0.03, opacity: ramp(s, [17.35, 17.55]) }}>Done</div>
                </>
              ) : null}
            </WalletScreen>
          </IPhone>
        </div>
      </AbsoluteFill>
      <LowerLeft bottom={420}>
        <Caption s={s} at={14.0} out={14.85} lead="Just" punch="double-click." color={INK} size={110} />
        <Caption s={s} at={15.0} out={15.85} lead="A" punch="glance." color={INK} size={110} />
        <Caption s={s} at={16.0} out={16.85} punch="Tap." color={INK} size={110} />
        <Caption s={s} at={17.0} punch="Done." color={INK} size={110} />
      </LowerLeft>
    </AbsoluteFill>
  );
};

// ================= ACT 4 (19–31s): everywhere =================
type Spot = { at: number; dur: number; place?: string; amount: string; bg: string; fg: string };
const SPOTS: Spot[] = [
  { at: 19.0, dur: 1.0, place: "Filter coffee · Bengaluru", amount: "₹240", bg: "#2B1A12", fg: "#F3E3D3" },
  { at: 20.0, dur: 1.0, place: "Weekend shopping · Mumbai", amount: "₹4,999", bg: "#B3135E", fg: "#FFE3F0" },
  { at: 21.0, dur: 1.0, place: "Fuel · Delhi", amount: "₹2,000", bg: "#F5A623", fg: "#2A1700" },
  { at: 22.0, dur: 1.0, place: "Dinner · Hyderabad", amount: "₹3,450", bg: "#7A1420", fg: "#FFE1D6" },
  { at: 23.0, dur: 0.5, place: "Movie night · Pune", amount: "₹540", bg: "#1C1F4A", fg: "#E4E6FF" },
  { at: 23.5, dur: 0.5, place: "Groceries · Chennai", amount: "₹1,840", bg: "#1E7A3C", fg: "#E6FFEC" },
  { at: 24.0, dur: 0.5, place: "Books · Kolkata", amount: "₹899", bg: "#0F5E63", fg: "#DDFBF7" },
  { at: 24.5, dur: 0.5, place: "Sneakers · Delhi", amount: "₹7,499", bg: "#111111", fg: "#FFFFFF" },
  { at: 25.0, dur: 0.5, place: "Gelato · Goa", amount: "₹180", bg: "#F7A8C4", fg: "#4A0F25" },
  { at: 25.5, dur: 0.5, place: "Flowers · Jaipur", amount: "₹650", bg: "#6C2BD9", fg: "#F1E8FF" },
  ...["₹99", "₹1,250", "₹60", "₹2,300", "₹450", "₹15,000", "₹30", "₹780"].map((amount, i): Spot => {
    const pal: [string, string][] = [["#2B1A12", "#F3E3D3"], ["#B3135E", "#FFE3F0"], ["#F5A623", "#2A1700"], ["#1C1F4A", "#E4E6FF"], ["#1E7A3C", "#E6FFEC"], ["#7A1420", "#FFE1D6"], ["#0F5E63", "#DDFBF7"], ["#6C2BD9", "#F1E8FF"]];
    return { at: 26.0 + i * 0.25, dur: 0.25, amount, bg: pal[i][0], fg: pal[i][1] };
  }),
];
const TAP = { x: 1430, y: 560 }; // where the phone in each spot taps (rings start here)
const MiniPay: React.FC<{ s: number; at: number; spot: Spot; w: number }> = ({ s, at, spot, w }) => {
  const g = phoneGeom(w);
  const done = ramp(s, [at + spot.dur * 0.35, at + spot.dur * 0.75], [0, 1], ease.linear);
  return (
    <IPhone w={w} screen="#000" shadow>
      <AbsoluteFill style={{ background: "#000" }}>
        <StatusBar sw={g.sw} dark />
        <div style={{ position: "absolute", left: g.sw * 0.06, top: g.sw * 0.22 }}>
          <ClassicCard w={g.sw * 0.88} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: g.sw * 0.9, display: "flex", flexDirection: "column", alignItems: "center", gap: g.sw * 0.03 }}>
          <div style={{ fontFamily: SFT, fontWeight: 500, fontSize: g.sw * 0.055, color: "rgba(255,255,255,0.7)" }}>{spot.place?.split(" · ")[0] ?? "Apple Pay"}</div>
          <div style={{ fontFamily: SFD, fontWeight: 600, fontSize: g.sw * 0.12, color: "#fff", letterSpacing: "-0.02em" }}>{spot.amount}</div>
          <div style={{ marginTop: g.sw * 0.04 }}>
            <DoneTick p={done} size={g.sw * 0.17} color="#fff" />
          </div>
        </div>
      </AbsoluteFill>
    </IPhone>
  );
};
const SpotScene: React.FC<{ s: number; spot: Spot }> = ({ s, spot }) => {
  const k = s - spot.at;
  const big = spot.dur >= 0.5;
  const amtIn = appear(s, spot.at + (big ? 0.06 : 0));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 90% at 70% 50%, ${spot.bg} 0%, ${spot.bg} 40%, ${shade(spot.bg)} 100%)`, overflow: "hidden" }}>
      {big ? (
        <>
          <div style={{ position: "absolute", left: TAP.x - 160, top: 210 + (1 - springAt(s, spot.at, { damping: 16, stiffness: 170, mass: 0.7 })) * 300, transform: `rotate(${-6 + k * 2}deg)` }}>
            <MiniPay s={s} at={spot.at} spot={spot} w={320} />
          </div>
          <div style={{ position: "absolute", left: 140, top: 330 }}>
            <div style={{ fontFamily: SFT, fontWeight: 500, fontSize: 36, letterSpacing: "-0.005em", color: spot.fg, opacity: 0.75 * appear(s, spot.at), transform: `translateY(${(1 - appear(s, spot.at)) * 16}px)` }}>{spot.place}</div>
            <div style={{ fontFamily: SFD, fontWeight: 600, fontSize: 250, letterSpacing: "-0.04em", lineHeight: 1, color: spot.fg, marginTop: 10, opacity: amtIn, transform: `translateY(${(1 - amtIn) * 30}px) scale(${1.04 - 0.04 * amtIn})`, transformOrigin: "0 100%", fontVariantNumeric: "tabular-nums" }}>{spot.amount}</div>
          </div>
        </>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: SFD, fontWeight: 600, fontSize: 300, letterSpacing: "-0.045em", color: spot.fg, transform: `scale(${1.12 - 0.12 * ramp(k, [0, 0.2], [0, 1], ease.out)})` }}>{spot.amount}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.62);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
export const ActEverywhere: React.FC<{ s: number }> = ({ s }) => {
  const i = SPOTS.findIndex((p) => s >= p.at && s < p.at + p.dur);
  if (s < 28.0 && i >= 0) {
    const cur = SPOTS[i];
    const next = SPOTS[i + 1];
    const wipeAt = cur.at + cur.dur - Math.min(0.2, cur.dur * 0.5);
    return (
      <AbsoluteFill>
        <SpotScene s={s} spot={cur} />
        {next ? (
          <Reveal s={s} at={wipeAt} dur={cur.at + cur.dur - wipeAt} x={next.dur >= 0.5 ? TAP.x : 960} y={TAP.y}>
            <SpotScene s={s} spot={next} />
          </Reveal>
        ) : null}
      </AbsoluteFill>
    );
  }
  // 28–29: every ring at once → white; 29–31: wherever you see contactless
  const burst = ramp(s, [28.0, 28.9], [0, 1], ease.out);
  return (
    <AbsoluteFill style={{ background: s < 28.9 ? "#000" : PAPER }}>
      {s < 28.9
        ? Array.from({ length: 14 }, (_, j) => {
            const k = ramp(burst, [j * 0.04, j * 0.04 + 0.5], [0, 1], ease.out);
            const x = 240 + random(`bx${j}`) * 1440;
            const y = 160 + random(`by${j}`) * 760;
            const r = 20 + k * 900;
            return <div key={j} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${4 - k * 3}px solid rgba(255,255,255,${0.9 * (1 - k)})` }} />;
          })
        : null}
      {s < 28.9 ? <AbsoluteFill style={{ background: "#fff", opacity: ramp(s, [28.55, 28.9]) }} /> : null}
      {s >= 28.9 ? (
        <>
          <svg style={{ position: "absolute", left: 1220, top: 300 }} width={480} height={480} viewBox="0 0 24 24">
            {[0, 1, 2, 3].map((j) => (
              <path key={j} d={`M ${6 + j * 3.4} ${7 - j * 1.6} q ${3 + j} ${5 + j * 1.6} 0 ${10 + j * 3.2}`} fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(s, [29.05 + j * 0.12, 29.45 + j * 0.12], [0, 1], ease.out)} />
            ))}
          </svg>
          <LowerLeft bottom={440}>
            <Caption s={s} at={29.2} lead="Wherever you see" punch="contactless." color={INK} />
          </LowerLeft>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ================= ACT 5 (31–35s): apps and online =================
export const ActOnline: React.FC<{ s: number }> = ({ s }) => {
  const w = 440;
  const g = phoneGeom(w);
  const inP = springAt(s, 31.0, { damping: 16, stiffness: 140, mass: 0.8 });
  const sheet = springAt(s, 31.55, { damping: 18, stiffness: 170, mass: 0.8 });
  const face = ramp(s, [32.2, 33.0], [0, 1], ease.linear);
  return (
    <AbsoluteFill style={{ background: PAPER, opacity: 1 - ramp(s, [34.6, 35.0]) }}>
      <div style={{ position: "absolute", left: 1180, top: 110 + (1 - inP) * 900 }}>
        <IPhone w={w}>
          <AbsoluteFill style={{ background: "#fff", fontFamily: SFT, color: INK }}>
            <StatusBar sw={g.sw} />
            <div style={{ position: "absolute", left: g.sw * 0.06, right: g.sw * 0.06, top: g.sw * 0.2 }}>
              <div style={{ fontSize: g.sw * 0.075, fontWeight: 700, letterSpacing: "-0.02em" }}>Your bag</div>
              <div style={{ marginTop: g.sw * 0.05, height: g.sw * 0.55, borderRadius: g.sw * 0.05, background: "linear-gradient(135deg, #E9E4FF, #B9A7FF)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: g.sw * 0.04, fontSize: g.sw * 0.05, fontWeight: 600 }}>
                <span>Wireless headphones</span>
                <span>₹2,499</span>
              </div>
            </div>
            <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)", opacity: ramp(s, [31.5, 31.75]) }} />
            <div style={{ position: "absolute", left: g.sw * 0.02, right: g.sw * 0.02, bottom: g.sw * 0.02, height: g.sh * 0.5, borderRadius: g.sw * 0.09, background: "#1C1C1E", transform: `translateY(${(1 - sheet) * g.sh * 0.55}px)`, padding: g.sw * 0.06, boxSizing: "border-box", color: "#fff" }}>
              <div style={{ fontFamily: SFD, fontWeight: 600, fontSize: g.sw * 0.07, letterSpacing: "-0.01em" }}>Apple Pay</div>
              <div style={{ display: "flex", alignItems: "center", gap: g.sw * 0.04, marginTop: g.sw * 0.06 }}>
                <ClassicCard w={g.sw * 0.22} />
                <div style={{ fontSize: g.sw * 0.045, color: "rgba(255,255,255,0.8)" }}>Credit •••• 4821</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: g.sw * 0.07, fontSize: g.sw * 0.05, fontWeight: 600 }}>
                <span>Pay</span>
                <span>₹2,499</span>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: g.sw * 0.1, display: "flex", flexDirection: "column", alignItems: "center", gap: g.sw * 0.03 }}>
                <FaceIdGlyph p={face} size={g.sw * 0.17} color={face > 0.6 ? BLUE : "#fff"} />
                <div style={{ fontSize: g.sw * 0.04, color: "rgba(255,255,255,0.7)" }}>{face < 0.7 ? "Confirm with Face ID" : "Done"}</div>
              </div>
            </div>
          </AbsoluteFill>
        </IPhone>
      </div>
      <LowerLeft bottom={440}>
        <Caption s={s} at={31.3} lead="In apps and online," punch="no OTP." color={INK} />
      </LowerLeft>
      <div style={{ position: "absolute", left: 140, bottom: 360, fontFamily: SFT, fontWeight: 500, fontSize: 30, color: GRAY, opacity: appear(s, 32.2) }}>Just a glance at checkout.</div>
    </AbsoluteFill>
  );
};

// ================= ACT 6 (35–44s): finale =================
// `fill` (0..1): how much of India has lit gold so far (the film's payers land one by one).
export const ActFinale: React.FC<{ s: number; o?: number; fill?: number }> = ({ s: abs, o = 0, fill = 1 }) => {
  const s = abs - o;
  const sc = track(s, [[35, 1.3], [36.6, 1.0]]);
  const fx = track(s, [[35, MAP_X + INDIA_AT.x], [36.6, 960]]);
  const fy = track(s, [[35, MAP_Y + INDIA_AT.y], [36.6, 540]]);
  const converge = ramp(s, [37.4, 39.0], [0, 1], ease.inOut);
  const wave = s >= 36.4 && s < 37.6 ? ramp(s, [36.4, 37.6], [0, 1600], ease.linear) : -1;
  const tick = ramp(s, [39.0, 39.6], [0, 1], ease.linear);
  const lift = ramp(s, [39.8, 40.3], [0, 1], ease.inOut);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
    <AbsoluteFill style={{ opacity: 1 - ramp(s, [43.4, 44]) }}>
      {s < 39.1 ? <WorldMap s={99} sc={sc} fx={fx} fy={fy} indiaLit={fill} pulse={fill < 1 ? 0.5 + 0.5 * Math.sin(abs * 9) : 0} converge={converge} wave={wave} /> : null}
      {s >= 38.6 ? (
        // end-card stack (measured): tick 120 · 56 · Pay 133 · 30 · subline 39, centred a touch above the middle
        <div style={{ position: "absolute", left: 960 - 150, top: 540 - 150 - lift * 140, transform: `scale(${1 - lift * 0.582})`, opacity: ramp(s, [38.6, 39.0]) }}>
          <DoneTick p={tick} size={300} color={BLUE} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 505 }}>
        <div style={{ display: "flex", justifyContent: "center", opacity: appear(s, 40.0), transform: `translateY(${(1 - appear(s, 40.0)) * 26}px)`, filter: appear(s, 40.0) < 0.98 ? `blur(${(1 - appear(s, 40.0)) * 7}px)` : undefined }}>
          <PayMark size={140} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 674 }}>
        <Caption s={s} at={40.5} out={41.55} punch="Now in India." color={GRAY} size={52} align="center" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 674 }}>
        <Caption s={s} at={41.85} punch="Worth the wait." color={INK} size={52} align="center" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontFamily: SFT, fontSize: 17, lineHeight: 1.55, letterSpacing: "0.005em", color: "#6E6E73", opacity: ramp(s, [41.0, 41.6]) }}>
        <div>A concept film by Breeders, made for education, with love for motion design and for Apple.</div>
        <div>Not affiliated with or endorsed by Apple Inc. Apple, Apple Pay and the Apple logo are trademarks of Apple Inc., shown here for illustration only.</div>
      </div>
    </AbsoluteFill>
    </AbsoluteFill>
  );
};
