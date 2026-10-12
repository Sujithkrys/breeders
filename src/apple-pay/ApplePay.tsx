// "Worth the wait." Apple Pay India concept launch film (not affiliated with Apple): the world map waits for India,
// 2026 dives into a dot-built Indian city, then real places where people tap to pay and turn gold, then back out to
// the map and the end card, then the Breeders end card.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { springAt, track } from "../sarvam-live/kit";
import { ease, ramp } from "../utils";
import { DotCanvas } from "./dotworld";
import { skyline } from "./dotscenes";
import { ActFinale, ActWait, Caption, WorldMap } from "./film";
import { loadSF, SFD, SFT } from "./fonts";
import { INDIA_AT } from "./map";
import { PayMark } from "./logo";
import { CAFE, FUEL, METRO_COUNTER, ONLINE, Place, STORE, WRIST } from "./places";

loadSF();
const inR = (s: number, a: number, b: number) => s >= a && s < b;
const MAP_X = 80;
const MAP_Y = 232.5; // film.tsx WorldMap placement

// The places in order: [place, start, lead, punch]
const SCENES: [Place, number, string, string][] = [
  [METRO_COUNTER, 13.0, "At the", "metro counter."],
  [CAFE, 16.6, "Your", "morning coffee."],
  [FUEL, 19.6, "A", "full tank."],
  [STORE, 22.2, "Weekend", "shopping."],
  [WRIST, 24.6, "Or just", "your wrist."],
  [ONLINE, 27.6, "In apps and", "online."],
];
// A day in India, morning to night: the clock, what it cost, the light (a faint sky tint), where the receipt pops up.
const DAY: { time: string; amount: string; sky: string; pill: { x: number; y: number } }[] = [
  { time: "8:40 AM", amount: "₹40", sky: "#EDF3FB", pill: { x: 930, y: 560 } },
  { time: "9:15 AM", amount: "₹180", sky: "#FFF6EA", pill: { x: 1120, y: 560 } },
  { time: "1:30 PM", amount: "₹2,000", sky: "#FFFFFF", pill: { x: 1180, y: 570 } },
  { time: "6:45 PM", amount: "₹3,499", sky: "#FCEEDF", pill: { x: 860, y: 560 } },
  { time: "8:30 PM", amount: "₹250", sky: "#F0EDF7", pill: { x: 1180, y: 330 } },
  { time: "11:10 PM", amount: "₹1,299", sky: "#E8ECF3", pill: { x: 960, y: 735 } },
];
const skyOf = (i: number) => `linear-gradient(180deg, ${DAY[i].sky} 0%, ${DAY[i].sky} 30%, #FFFFFF 92%)`;
const MONTAGE = { at: 26.1, step: 0.3, order: [0, 1, 2, 3, 4] };
export const T = { dive: 9.2, city: 10.0, finale: 30.3, outro: 39.3, end: 39.3 + OUTRO_LEN };
export const APPLE_PAY = { fps: 60, width: 1920, height: 1080, seconds: T.end };
const FINALE_OFFSET = T.finale - 35; // ActFinale was authored from 35s

// The receipt: a white pill with a gold tick and what it cost, popping up over the tap.
const CHECK_LEN = 27;
const Paid: React.FC<{ s: number; at: number; out: number; x: number; y: number; amount: string; scale?: number }> = ({ s, at, out, x, y, amount, scale = 1 }) => {
  if (s < at || s > out + 0.3) return null;
  const p = springAt(s, at, { damping: 13, stiffness: 190, mass: 0.6 });
  const g = ramp(s, [out, out + 0.25], [0, 1], ease.in);
  const tick = ramp(s, [at + 0.1, at + 0.42], [0, 1], ease.out);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) translateY(${(1 - p) * 28 - g * 12}px) scale(${scale * (0.82 + 0.18 * p)})`, opacity: Math.min(1, p * 1.6) * (1 - g) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 30px 13px 14px", background: "#fff", borderRadius: 999, boxShadow: "0 14px 44px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.05)", whiteSpace: "nowrap" }}>
        <svg width={46} height={46} viewBox="0 0 44 44">
          <circle cx={22} cy={22} r={22} fill="#E89E22" />
          <path d="M13 22.5l6 6 12-13" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHECK_LEN} strokeDashoffset={CHECK_LEN * (1 - tick)} />
        </svg>
        <span style={{ fontFamily: SFD, fontWeight: 600, fontSize: 46, letterSpacing: "-0.02em", color: "#1D1D1F", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{amount}</span>
        <span style={{ fontFamily: SFT, fontWeight: 500, fontSize: 24, color: "#6E6E73", lineHeight: 1 }}>Paid</span>
      </div>
    </div>
  );
};

const PlaceLayer: React.FC<{ s: number; i: number }> = ({ s, i }) => {
  const [p, t0, lead, punch] = SCENES[i];
  const prev = i > 0 ? SCENES[i - 1] : null;
  const ring = prev ? ramp(s, [t0 - 0.35, t0 + 0.05], [0, 2300], ease.in) : 2300;
  const at = prev ? prev[0].at : { x: 960, y: 540 };
  const next = SCENES[i + 1]?.[1] ?? T.finale;
  const d = DAY[i];
  const clock = ramp(s, [t0 + 0.1, t0 + 0.45], [0, 1], ease.out) * (1 - ramp(s, [next - 0.45, next - 0.25]));
  return (
    <AbsoluteFill style={{ background: skyOf(i), clipPath: ring < 2300 ? `circle(${ring}px at ${at.x}px ${at.y}px)` : undefined }}>
      <DotCanvas field={p.field(s, t0)} seed={p.name} />
      <div style={{ position: "absolute", left: 143, top: 66, opacity: clock, transform: `translateY(${(1 - clock) * 10}px)`, fontFamily: SFT, fontWeight: 600, fontSize: 24, letterSpacing: "0.04em", color: "#86868B", fontVariantNumeric: "tabular-nums" }}>{d.time}</div>
      <div style={{ position: "absolute", left: 140, top: 110 }}>
        <Caption s={s} at={t0 + 0.2} out={next - 0.45} lead={lead} punch={punch} size={104} color="#1D1D1F" />
      </div>
      <Paid s={s} at={t0 + p.tap + 0.25} out={next - 0.5} x={d.pill.x} y={d.pill.y} amount={d.amount} />
    </AbsoluteFill>
  );
};

// Finale: every payment of the day flies home into India on the map, and India fills up gold, one payer at a time.
const HOME = { at: T.finale + 0.15, step: 0.1, hold: 0.3, fly: 0.55 };
const HOME_FROM = [[330, 300], [820, 190], [1560, 230], [1700, 800], [420, 820], [1180, 900]] as const; // where each receipt appears on screen
const landedAt = (i: number) => HOME.at + i * HOME.step + HOME.hold + HOME.fly;
const FIN_MAP_X = 80; // film.tsx centres the map: (1920 - 1760) / 2
const FIN_MAP_Y = 232.5;
const indiaOnScreen = (s: number) => {
  const l = s - FINALE_OFFSET; // ActFinale's local time
  const ix = FIN_MAP_X + INDIA_AT.x, iy = FIN_MAP_Y + INDIA_AT.y;
  const sc = track(l, [[35, 1.3], [36.6, 1.0]]);
  const fx = track(l, [[35, ix], [36.6, 960]]);
  const fy = track(l, [[35, iy], [36.6, 540]]);
  return { x: 960 + (ix - fx) * sc, y: 540 + (iy - fy) * sc };
};
const PayersHome: React.FC<{ s: number }> = ({ s }) => {
  if (s < HOME.at || s > landedAt(DAY.length - 1) + 0.6) return null;
  const home = indiaOnScreen(s);
  return (
    <AbsoluteFill>
      {DAY.map((d, i) => {
        const t = HOME.at + i * HOME.step;
        if (s < t) return null;
        const [ox, oy] = HOME_FROM[i];
        const u = ramp(s, [t + HOME.hold, t + HOME.hold + HOME.fly], [0, 1], ease.in);
        // a gentle arc: the control point sits above the straight line
        const cx = (ox + home.x) / 2, cy = Math.min(oy, home.y) - 160;
        const x = (1 - u) ** 2 * ox + 2 * (1 - u) * u * cx + u * u * home.x;
        const y = (1 - u) ** 2 * oy + 2 * (1 - u) * u * cy + u * u * home.y;
        const landed = s >= landedAt(i);
        const flash = landed ? 1 - ramp(s, [landedAt(i), landedAt(i) + 0.45]) : 0;
        return (
          <React.Fragment key={i}>
            {!landed ? <Paid s={s} at={t} out={landedAt(i) - 0.12} x={x} y={y} amount={d.amount} scale={0.8 * (1 - u * 0.8)} /> : null}
            {u > 0.55 && !landed ? <div style={{ position: "absolute", left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: 7, background: "#E89E22", boxShadow: "0 0 18px 6px rgba(245,166,35,0.45)" }} /> : null}
            {flash > 0 ? <div style={{ position: "absolute", left: home.x - 60 * (2 - flash), top: home.y - 60 * (2 - flash), width: 120 * (2 - flash), height: 120 * (2 - flash), borderRadius: "50%", border: `3px solid rgba(232,158,34,${flash * 0.8})` }} /> : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const Montage: React.FC<{ s: number }> = ({ s }) => {
  const k = Math.min(MONTAGE.order.length - 1, Math.floor((s - MONTAGE.at) / MONTAGE.step));
  const [p, t0] = SCENES[MONTAGE.order[k]];
  return (
    <AbsoluteFill style={{ background: skyOf(MONTAGE.order[k]) }}>
      <DotCanvas field={p.field(t0 + p.tap + 0.45 + (s - MONTAGE.at - k * MONTAGE.step), t0)} seed={p.name} />
    </AbsoluteFill>
  );
};

export const ApplePayIndia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const ix = MAP_X + INDIA_AT.x;
  const iy = MAP_Y + INDIA_AT.y;
  const dive = ramp(s, [T.dive, T.dive + 1.5], [0, 1], ease.in);
  const cityIn = ramp(s, [T.city, T.city + 0.7], [0, 1], ease.out);
  const firstAt = SCENES[0][1];
  const sceneIdx = SCENES.findIndex(([, t0], k) => s >= t0 - 0.35 && s < (SCENES[k + 1]?.[1] ?? T.finale));
  const montage = inR(s, MONTAGE.at, SCENES[5][1] - 0.35);
  const finaleRing = ramp(s, [T.finale - 0.35, T.finale + 0.4], [0, 2300], ease.in);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Audio src={staticFile("applepay/mix.wav")} />
      {s < T.dive + 0.1 ? <ActWait s={s} ring={false} /> : null}
      {/* 2026: dive into India */}
      {inR(s, T.dive, T.city + 0.8) ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(s, [T.city, T.city + 0.7]) }}>
          <WorldMap s={99} sc={1.7 + dive * 10} fx={ix} fy={iy} indiaLit={1} pulse={0} />
        </AbsoluteFill>
      ) : null}
      {/* the city: Finally. → Apple Pay, now in India */}
      {inR(s, T.city, firstAt + 0.1) ? (
        <AbsoluteFill style={{ opacity: cityIn * (1 - ramp(s, [firstAt - 0.3, firstAt + 0.05])), transform: `scale(${1.45 - 0.45 * ramp(s, [T.city, T.city + 2.6], [0, 1], ease.out)})`, transformOrigin: "50% 78%" }}>
          <DotCanvas field={skyline(s)} seed="sky" />
        </AbsoluteFill>
      ) : null}
      {inR(s, T.city, firstAt) ? (
        <AbsoluteFill>
          {/* a soft white veil so the titles sit in clear air, never on the buildings */}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 760px 300px at 50% 440px, #fff 45%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,0) 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 340 }}>
            <Caption s={s} at={10.45} out={11.55} punch="Finally." size={170} align="center" color="#1D1D1F" />
          </div>
          <div style={{ position: "absolute", top: 320, left: 0, right: 0, textAlign: "center", opacity: ramp(s, [11.8, 12.2]) * (1 - ramp(s, [12.75, 12.95])) }}>
            <div style={{ transform: `translateY(${(1 - ramp(s, [11.8, 12.3], [0, 1], ease.out)) * 24}px)` }}>
              <PayMark size={150} />
            </div>
            <div style={{ fontFamily: SFD, fontWeight: 500, fontSize: 52, letterSpacing: "-0.01em", color: "#6E6E73", marginTop: 14, opacity: ramp(s, [12.05, 12.4]) }}>Now in India.</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* places, each opening from the last payment's spot */}
      {sceneIdx >= 0 && !montage ? (
        <>
          {sceneIdx > 0 && s < SCENES[sceneIdx][1] + 0.05 ? <PlaceLayer s={s} i={sceneIdx - 1} /> : null}
          <PlaceLayer s={s} i={sceneIdx} />
        </>
      ) : null}
      {montage ? <Montage s={s} /> : null}
      {/* finale opens from the online payment */}
      {inR(s, T.finale - 0.35, T.outro) ? (
        <AbsoluteFill style={{ clipPath: finaleRing < 2300 ? `circle(${finaleRing}px at ${ONLINE.at.x}px ${ONLINE.at.y}px)` : undefined }}>
          <ActFinale s={s} o={FINALE_OFFSET} fill={DAY.filter((_, i) => s >= landedAt(i)).length / DAY.length} />
          <PayersHome s={s} />
        </AbsoluteFill>
      ) : null}
      {inR(s, T.outro, T.end) ? <BreedersOutro t={s - T.outro} /> : null}
      <Watermark opacity={(1 - ramp(s, [T.outro - 0.4, T.outro], [0, 1])) * (1 - ramp(s, [T.finale + 4.6, T.finale + 5.0], [0, 1]) * (1 - ramp(s, [T.outro, T.outro + 0.3], [0, 1])))} font={SFT} dark={0} />
    </AbsoluteFill>
  );
};
