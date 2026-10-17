// RajiniReel: a 30 s vertical fan tribute to Superstar Rajinikanth for Jailer 2, cut to our stem remix of "Hukum"
// (scripts/compose-rajini.mjs → public/rajini/mix.wav, 136.02 BPM, 17 bars). OpenAI-specimen page: pure white, one
// real photographed object at a time, small at the centre, rigged to move like the real thing. No text, no drawings.
// Bars 0–1 a yellow dot breathes with the spoken intro · 2–3 the Baasha auto drives in · 4 the coin, the watch ·
// 5 the keys swing, then a silent beat · 6 DROP: the sunglasses twirl in · 7–12 a cut on every beat ·
// 13–15 the grid · 16 everything slows to the sunglasses, alone.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { autoHeight, Coin, Keys, RealAuto, Shades, Watch } from "./objects";

export const BEAT = 60 / 136.02;
const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const BODY = 68;
export const RAJINI = { fps: 30, width: W, height: H, seconds: BODY * BEAT + OUTRO_LEN };
const YEL = "#FFC20E", LINE = "#D4D4D4";

// ---------- page furniture ----------
const Page: React.FC<{ circle?: number; dot?: number; road?: { y: number; scroll: number } }> = ({ circle = 1, dot = 1, road }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <line x1={CX - 10} x2={CX + 10} y1={150} y2={150} stroke={LINE} strokeWidth={1.5} />
    <line x1={CX} x2={CX} y1={140} y2={160} stroke={LINE} strokeWidth={1.5} />
    <circle cx={CX} cy={CY} r={250} fill="none" stroke="#E6E6E6" strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} transform={`rotate(-90 ${CX} ${CY})`} />
    <circle cx={CX + 250} cy={CY} r={5} fill={YEL} opacity={dot} />
    {road ? (
      <g stroke={LINE} strokeWidth={1.5}>
        <line x1={CX - 330} x2={CX + 330} y1={road.y} y2={road.y} />
        {Array.from({ length: 24 }, (_, i) => {
          const x = CX - 330 + ((i * 28 + road.scroll) % 672);
          return <line key={i} x1={x} x2={x} y1={road.y} y2={road.y + (i % 5 === 0 ? 14 : 8)} />;
        })}
      </g>
    ) : null}
  </svg>
);

// ---------- one object performing, for montage and grid cells ----------
type Obj = "auto" | "coin" | "coinlion" | "shades" | "watch" | "keys";
const Perform: React.FC<{ o: Obj; u: number; t: number; x: number; y: number; s: number; beat: number }> = ({ o, u, t, x, y, s, beat }) => {
  switch (o) {
    case "auto": {
      // surging through: in from the right, past centre, out to the left within the beat
      const p = ease.inOut(u);
      return <RealAuto x={x + (1 - p) * 120 * s - p * 90 * s} y={y} w={220 * s} dist={600 * u * s} speed={420} t={t} />;
    }
    case "coin":
    case "coinlion":
      return <Coin x={x} y={y} d={150 * s} flip={(o === "coinlion" ? Math.PI : 0) + ease.out(u) * Math.PI * 2} lift={Math.sin(Math.PI * u) * 70 * s} spin={-8} />;
    case "shades":
      return <Shades x={x} y={y} w={240 * s} turn={(1 - ease.out(u)) * Math.PI * (beat % 2 ? 1 : -1)} spin={(1 - ease.out(u)) * 12} />;
    case "watch":
      return <Watch x={x} y={y} d={170 * s} tick={beat} jolt={Math.exp(-u * 7)} />;
    case "keys":
      return <Keys x={x} y={y} h={200 * s} swing={22 * Math.cos(u * Math.PI * 2) * Math.exp(-u * 1.2) * (beat % 2 ? 1 : -1)} />;
  }
};
const MONTAGE: Record<number, Obj> = {
  26: "auto", 27: "coin", 28: "shades", 29: "watch", 30: "keys", 31: "coinlion", 32: "auto", 33: "shades",
  34: "coin", 35: "watch", 36: "keys", 37: "auto", 38: "shades", 39: "coin",
  45: "auto", 46: "coinlion", 47: "watch", 48: "keys", 49: "shades", 50: "auto", 51: "coin",
};
const GRID9: Obj[] = ["auto", "coin", "shades", "watch", "keys", "coinlion", "shades", "auto", "watch"];
const GRID4: Obj[] = ["auto", "coin", "shades", "watch"];

const Shot: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const u = b - Math.floor(b);
  // bars 0–1: the dot breathes with the voice, the circle draws, then it swells
  if (b < 8) {
    const pulse = Math.exp(-u * 5);
    const swell = ramp(b, [7, 8], [0, 1], ease.in);
    return (
      <>
        <Page circle={ramp(b, [0.5, 6], [0, 1], ease.inOut)} dot={0} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <circle cx={CX} cy={CY} r={7 + 5 * pulse + 40 * swell} fill={YEL} opacity={1 - swell * 0.9} />
        </svg>
      </>
    );
  }
  // bars 2–3: the auto drives in and cruises; the camera tracks it, the road streams
  if (b < 16) {
    const inK = ramp(b, [8, 10], [0, 1], ease.out);
    const x = CX + 700 * (1 - inK);
    const cruise = Math.max(0, t - 10 * BEAT) * 150;
    const dist = 700 * inK + cruise;
    const speed = b < 10 ? 700 * (1 - inK) * 1.5 + 150 : 150;
    const ah = autoHeight(220);
    return (
      <>
        <Page road={{ y: CY + ah / 2 - 1, scroll: cruise }} />
        <RealAuto x={x} y={CY} w={220} dist={dist} speed={speed} t={t} />
      </>
    );
  }
  // bar 4: the coin is tossed (two beats), then the watch ticks (two beats)
  if (b < 18) return (<><Page /><Coin x={CX} y={CY + 20} d={150} flip={ease.inOut(ramp(b, [16, 17.8])) * Math.PI * 4} lift={Math.sin(Math.PI * ramp(b, [16, 17.8])) * 160} spin={-8} /></>);
  if (b < 20) return (<><Page /><Watch x={CX} y={CY} d={170} tick={Math.floor(b)} jolt={Math.exp(-u * 7)} /></>);
  // bar 5: the keys swing wider on every beat, then the page empties for the silent beat
  if (b < 23) {
    const amp = 10 + 14 * ramp(b, [20, 23]);
    return (<><Page /><Keys x={CX} y={CY} h={200} swing={amp * Math.sin(Math.PI * (b - 20))} /></>);
  }
  if (b < 24) return <AbsoluteFill style={{ background: "#FFFFFF" }} />;
  // bar 6: DROP — the sunglasses twirl in from edge-on and settle
  if (b < 26) {
    const k = ramp(b, [24, 25.4], [0, 1], ease.out);
    const ring = ramp(b, [24, 24.8]);
    return (
      <>
        <Page />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <circle cx={CX} cy={CY} r={60 + ring * 300} fill="none" stroke={YEL} strokeWidth={6 * (1 - ring)} opacity={1 - ring} />
        </svg>
        <Shades x={CX} y={CY} w={240} turn={(1 - k) * Math.PI * 3} spin={(1 - k) * -40} />
      </>
    );
  }
  // bars 7–9 and 11–12: one object per beat
  if (b < 40 || (b >= 45 && b < 52)) {
    const beat = Math.floor(b);
    return (<><Page /><Perform o={MONTAGE[beat]} u={u} t={t} x={CX} y={CY} s={1} beat={beat} /></>);
  }
  // bar 10 (beats 40–44, the vocal chop) and beat 44: the sunglasses punched in on every hit
  if (b < 45) {
    const beat = Math.floor(b);
    const pop = Math.exp(-u * 8);
    return (<><Page /><Shades x={CX} y={CY} w={240 * (1 + 0.18 * pop)} turn={beat % 2 ? Math.PI : 0} spin={(beat % 2 ? 4 : -4) * pop} /></>);
  }
  // bars 13–15: the grid — four cells, then nine, every object performing at once
  if (b < 64) {
    const nine = b >= 56;
    const n = nine ? 3 : 2, cell = 600 / n, list = nine ? GRID9 : GRID4;
    const s = nine ? 0.42 : 0.62;
    const ox = CX - (cell * n) / 2, oy = CY - (cell * n) / 2;
    return (
      <>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: n + 1 }, (_, i) => (
            <g key={i} stroke={LINE} strokeWidth={1.2}>
              <line x1={ox + i * cell} x2={ox + i * cell} y1={oy} y2={oy + cell * n} />
              <line y1={oy + i * cell} y2={oy + i * cell} x1={ox} x2={ox + cell * n} />
            </g>
          ))}
        </svg>
        {list.map((o, i) => {
          const appear = nine ? ramp(b, [56 + i * 0.5, 56.2 + i * 0.5]) : 1;
          if (appear <= 0) return null;
          const cxi = ox + (i % n) * cell + cell / 2, cyi = oy + Math.floor(i / n) * cell + cell / 2;
          // in the last bar the cells stutter on the half beats
          const off = b >= 60 && Math.floor((b - 60) * 2) % 2 === 1 && i % 2 === 0;
          return off ? null : (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: appear }}>
              <Perform o={o} u={(b + i * 0.13) % 1} t={t} x={cxi} y={cyi} s={s} beat={Math.floor(b) + i} />
            </div>
          );
        })}
      </>
    );
  }
  // bar 16: the tape stop — everything collapses to the sunglasses, turning slower and slower, then still
  const k = ramp(b, [64, 65.6], [0, 1], ease.out);
  return (
    <>
      <Page />
      <Shades x={CX} y={CY} w={240} turn={(1 - k) * Math.PI * 1.5} spin={0} />
    </>
  );
};

export const RajiniReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = t / BEAT;
  const end = BODY * BEAT;
  // a gentle push on every hit after the drop, a kick on the drop itself
  const kick = b >= 24 && b < 64 ? 1 + 0.025 * Math.exp(-(b - Math.floor(b)) * 8) + (b < 25 ? 0.05 * Math.exp(-(b - 24) * 5) : 0) : 1;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Audio src={staticFile("rajini/mix.wav")} />
      {t < end ? (
        <>
          <AbsoluteFill style={{ transform: `scale(${kick})` }}>
            <Shot b={b} t={t} />
          </AbsoluteFill>
          <Watermark opacity={(1 - ramp(t, [end - 0.3, end])) * 0.7} dark={0} />
        </>
      ) : (
        <BreedersOutro t={t - end} />
      )}
    </AbsoluteFill>
  );
};
