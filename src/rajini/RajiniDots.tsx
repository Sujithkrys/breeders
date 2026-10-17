// RajiniDots: a 30 s vertical fan tribute to Superstar Rajinikanth for Jailer 2. Everything is one living field of
// dots on a white page (dots.tsx) — real, freely licensed photos of him and his icons, rebuilt as dots that take the
// photo's colour, moving, morphing, flying at the camera, cut on our Hukum remix (136.02 BPM, 17 bars).
// Chapters: the young Superstar · Baasha's auto · Sivaji's coin · Enthiran · the folded-hands greeting into the
// build · DROP: today's Thalaivar · a cut on every beat · the mosaic · everything swarms home.
// Credits: public/rajini/dots/CREDITS.txt.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { Cam, DotField, Fx, H, Layer, useSources, W } from "./dots";

export const BEAT = 60 / 136.02;
const BODY = 68;
export const RAJINI_DOTS = { fps: 30, width: W, height: H, seconds: BODY * BEAT + OUTRO_LEN };
const CX = W / 2, CY = H / 2;
const YEL = "#FFC20E";
const PAGE: Cam = { x: CX, y: CY, zoom: 1 };
const RED: [number, number, number] = [214, 32, 40];

type Frame = { layers: Layer[]; cam: Cam; fx?: Fx; ring?: number };

// one object per beat in the montage: u is 0..1 through the beat, n the beat number
const montage = (o: string, u: number, n: number): Frame => {
  const e = ease.out(u);
  switch (o) {
    case "shades": // flies at the camera and past it
      return { layers: [{ src: "shades", x: CX, y: CY, w: 420, mode: "color", tone: "full" }], cam: { x: CX, y: CY, zoom: 1 + 6 * Math.pow(u, 2.2) } };
    case "keys": // swings from the ring
      return { layers: [{ src: "keys", x: CX, y: CY, w: 300, rot: 26 * Math.cos(u * Math.PI * 2) * (n % 2 ? 1 : -1), mode: "color", tone: "full" }], cam: { ...PAGE, zoom: 1.3 } };
    case "auto": // dashes across the frame
      return { layers: [{ src: "auto", x: CX + 600 - 1200 * e, y: CY, w: 520, mode: "color", tone: "full" }], cam: PAGE, fx: { scatter: 0.04 } };
    case "coin": // flips in the air
      return { layers: [{ src: Math.cos(u * Math.PI * 2) >= 0 ? "coin_one" : "coin_lion", x: CX, y: CY - Math.sin(Math.PI * u) * 160, w: 380, sy: Math.cos(u * Math.PI * 2), mode: "mono" }], cam: PAGE };
    case "watch": // ticks
      return { layers: [{ src: "watch", x: CX, y: CY, w: 420, rot: (n % 2 ? 2 : -2) * Math.exp(-u * 7), mode: "color", tone: "full" }], cam: { ...PAGE, zoom: 1.1 + 0.05 * Math.exp(-u * 7) } };
    case "classic":
      return { layers: [{ src: "classic", x: CX, y: CY, w: 560, mode: "color" }], cam: { x: CX, y: CY - 60, zoom: 1.6 - 0.3 * e } };
    case "robot":
      return { layers: [{ src: "robot", x: CX, y: CY, w: 520, mode: "tint", tint: RED }], cam: { x: CX, y: CY - 80, zoom: 1.2 + 0.4 * e } };
    case "namaste":
      return { layers: [{ src: "namaste", x: CX, y: CY, w: 380, mode: "color" }], cam: { x: CX, y: CY - 120 * e, zoom: 1.2 } };
    default: // today, with the camera diving toward the glasses
      return { layers: [{ src: "today", x: CX, y: CY, w: 620, mode: "color" }], cam: { x: CX + 30, y: CY - 150, zoom: 1.1 + 2.2 * Math.pow(u, 2) } };
  }
};
const MONTAGE = ["shades", "keys", "auto", "coin", "today", "watch", "classic", "robot", "shades", "namaste", "auto", "coin", "keys", "today"];
const MONTAGE2 = ["auto", "coin", "watch", "classic", "shades", "keys", "today"];
const MOSAIC: string[] = ["classic", "auto", "coin_one", "robot", "shades", "namaste", "keys", "watch", "today"];

const scene = (b: number, t: number): Frame => {
  const u = b - Math.floor(b), n = Math.floor(b);
  // bars 0–1 · the voice alone: inside a disc, the young Superstar gathers from the centre out
  if (b < 8) {
    const k = ease.inOut(ramp(b, [0.5, 6.5]));
    return {
      layers: [{ src: "classic", x: CX, y: CY, w: 470, mode: "mono", o: k }],
      cam: { x: CX, y: CY, zoom: 1.08 - 0.08 * k },
      fx: { disc: { x: CX, y: CY, r: 120 + 220 * ease.out(ramp(b, [0, 2])) }, ripple: { x: CX, y: CY, t: u * BEAT, amp: 0.35 } },
    };
  }
  // bars 2–3 · Baasha: drums in, the auto drives in, holds, then becomes the young Superstar in colour
  if (b < 16) {
    const inK = ease.out(ramp(b, [8, 10]));
    const outK = ease.inOut(ramp(b, [13.5, 15.5]));
    const ax = CX + 900 * (1 - inK) - 40 * Math.sin(t * 2);
    return {
      layers: [
        { src: "auto", x: ax, y: CY + 30, w: 560, mode: "color", tone: "full", o: 1 - outK },
        { src: "classic", x: CX, y: CY, w: 560, mode: "color", o: outK },
      ],
      cam: { x: CX, y: CY, zoom: 1 + 0.6 * ease.inOut(ramp(b, [11, 13.5])) * (1 - outK) },
      fx: { ripple: { x: CX, y: CY, t: u * BEAT, amp: 0.25 }, scatter: b < 10 ? 0.25 * (1 - inK) : 0 },
    };
  }
  // bar 4 · Sivaji's coin (two beats), Enthiran in red (two beats)
  if (b < 18) {
    const k = ramp(b, [16, 17.9]);
    const flip = Math.cos(k * Math.PI * 4);
    return { layers: [{ src: flip >= 0 ? "coin_one" : "coin_lion", x: CX, y: CY - Math.sin(Math.PI * k) * 260, w: 420, sy: flip, mode: "mono" }], cam: PAGE };
  }
  if (b < 20) return { layers: [{ src: "robot", x: CX, y: CY + 40, w: 560, mode: "tint", tint: RED }], cam: { x: CX, y: CY - 60, zoom: 1.1 + 0.25 * ramp(b, [18, 20]) }, fx: { ripple: { x: CX, y: CY, t: u * BEAT, amp: 0.3 } } };
  // bar 5 · the build: the folded hands, the camera pushing in, dots loosening; the last beat is empty
  if (b < 23) {
    const k = ramp(b, [20, 23], [0, 1], ease.in);
    return { layers: [{ src: "namaste", x: CX, y: CY + 200, w: 520, mode: "color" }], cam: { x: CX, y: CY - 40 + 40 * k, zoom: 1 + 1.6 * k }, fx: { scatter: 0.12 * k } };
  }
  if (b < 24) return { layers: [], cam: PAGE, fx: { baseDot: 0.08 * (1 - ramp(b, [23, 23.3])) } };
  // bar 6 · DROP: today's Thalaivar, flung in from everywhere
  if (b < 26) {
    const k = ease.out(ramp(b, [24, 24.9]));
    return { layers: [{ src: "today", x: CX, y: CY, w: 640, mode: "color" }], cam: { x: CX, y: CY - 40, zoom: 1.35 - 0.3 * k }, fx: { burst: { x: CX, y: CY, k: 1 - k }, ripple: { x: CX, y: CY, t: (b - 25) * BEAT, amp: b >= 25 ? 0.4 : 0 } }, ring: ramp(b, [24, 24.8]) };
  }
  // bars 7–9 · a cut on every beat
  if (b < 40) return montage(MONTAGE[(n - 26) % MONTAGE.length], u, n);
  // bar 10 · the vocal chop: today's portrait punched in four times, flipping between ink and inverse
  if (b < 45) {
    const pop = Math.exp(-u * 8);
    return { layers: [{ src: "today", x: CX, y: CY, w: 640, mode: n % 2 ? "mono" : "color" }], cam: { x: CX, y: CY - 40, zoom: 1.05 + 0.25 * pop }, fx: { invert: n % 2 === 1, stutter: n === 44 && u > 0.5 } };
  }
  // bars 11–12 · more cuts
  if (b < 52) return montage(MONTAGE2[(n - 45) % MONTAGE2.length], u, n);
  // bars 13–15 · the mosaic: nine chapters in one field, the camera pulling back from the auto to all nine
  if (b < 64) {
    const cell = 330;
    const layers: Layer[] = MOSAIC.map((s, i) => ({
      src: s as Layer["src"],
      x: CX + ((i % 3) - 1) * cell,
      y: CY + (Math.floor(i / 3) - 1) * cell,
      w: s === "namaste" ? 140 : s.startsWith("coin") || s === "watch" ? 220 : 280,
      mode: (s === "robot" ? "tint" : "color") as Layer["mode"],
      tint: RED,
      tone: (["auto", "coin_one", "shades", "keys", "watch"].includes(s) ? "full" : "dark") as Layer["tone"],
      rot: s === "keys" ? 20 * Math.sin(b * Math.PI) : 0,
      sy: s === "coin_one" ? Math.cos(b * Math.PI) : 1,
      o: ramp(b, [52 + i * 0.4, 52.3 + i * 0.4]),
    }));
    const pull = ease.inOut(ramp(b, [52, 58]));
    return { layers, cam: { x: CX + 330 * (1 - pull), y: CY - 330 * (1 - pull), zoom: 2.6 - 1.6 * pull }, fx: { stutter: b >= 62 && Math.floor((b - 62) * 4) % 2 === 1, ripple: { x: CX, y: CY, t: u * BEAT, amp: 0.25 } } };
  }
  // bar 16 · the tape stop: every dot swarms home into today's portrait and settles, still
  const k = ease.out(ramp(b, [64, 66]));
  return { layers: [{ src: "today", x: CX, y: CY, w: 560, mode: "color" }], cam: { x: CX, y: CY, zoom: 1 }, fx: { burst: { x: CX, y: CY, k: (1 - k) * 0.8 } } };
};

export const RajiniDots: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const srcs = useSources();
  const t = frame / fps;
  const b = t / BEAT;
  const end = BODY * BEAT;
  if (!srcs) return <AbsoluteFill style={{ background: "#FFFFFF" }} />;
  const s = scene(b, t);
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Audio src={staticFile("rajini/mix.wav")} />
      {t < end ? (
        <>
          <DotField srcs={srcs} layers={s.layers} cam={s.cam} fx={s.fx} />
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {s.ring !== undefined ? <circle cx={CX} cy={CY} r={60 + s.ring * 520} fill="none" stroke={YEL} strokeWidth={8 * (1 - s.ring)} opacity={1 - s.ring} /> : null}
            <g stroke={s.fx?.invert ? "#555" : "#D0D0D0"} strokeWidth={1.5}>
              <line x1={CX - 10} x2={CX + 10} y1={150} y2={150} />
              <line x1={CX} x2={CX} y1={140} y2={160} />
            </g>
          </svg>
          <Watermark opacity={(1 - ramp(t, [end - 0.3, end])) * 0.7} dark={s.fx?.invert ? 1 : 0} />
        </>
      ) : (
        <BreedersOutro t={t - end} />
      )}
    </AbsoluteFill>
  );
};
