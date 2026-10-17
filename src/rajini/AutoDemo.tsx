// AutoDemo: a 7.6 s test of the real-auto treatment on the Hukum build and drop (song bars 7–10, 136.02 BPM).
// White page, the auto small at the centre (~20% of the width). Build: scattered dots gather into the auto as a
// halftone, the paint turns yellow, hairline engraving resolves over it, quick cuts between duotone, engraving and
// dots. One silent beat of empty page. Drop: the real photo snaps in, then cuts on every beat between photo, duotone
// and engraving while it glides along a hairline road. Photo: "Go slow" by Rakesh.5suthar, CC BY-SA 3.0.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp } from "../utils";
import DOTS from "./autoDots.json";

const BEAT = 60 / 136.02;
const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
export const AUTO_DEMO = { fps: 30, width: W, height: H, seconds: 7.6 };
const AW = 220; // auto width on the page
const AH = AW * DOTS.aspect;
const YEL = "#FFC20E", INK = "#0C0C0C", LINE = "#CFCFCF";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// the auto as dots: `gather` 0 = scattered, 1 = on the grid; `size` scales the halftone; `colour` turns paint yellow
const Dots: React.FC<{ x: number; y: number; gather: number; size: number; colour: number; opacity?: number }> = ({ x, y, gather, size, colour, opacity = 1 }) => {
  const step = AW * DOTS.step;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
      {(DOTS.dots as number[][]).map(([u, v, k, yl], i) => {
        // each dot starts on a ring around the page centre and arrives in order across the auto, left to right
        const a = hash(i) * Math.PI * 2, rr = 380 + hash(i + 1) * 520;
        const lag = u * 0.45 + hash(i + 2) * 0.15;
        const g = ease.inOut(Math.max(0, Math.min(1, (gather - lag) / 0.4)));
        const tx = x - AW / 2 + u * AW, ty = y - AH / 2 + v * AW;
        const px = CX + Math.cos(a) * rr + (tx - CX - Math.cos(a) * rr) * g;
        const py = CY + Math.sin(a) * rr + (ty - CY - Math.sin(a) * rr) * g;
        const r = Math.max(0.6, step * 0.5 * (0.35 + 0.65 * k) * size);
        return <circle key={i} cx={px} cy={py} r={r} fill={yl && colour > 0.5 ? YEL : INK} />;
      })}
    </svg>
  );
};
const Pic: React.FC<{ src: string; x: number; y: number; scale?: number; opacity?: number; shadow?: boolean }> = ({ src, x, y, scale = 1, opacity = 1, shadow }) => (
  <>
    {shadow ? <div style={{ position: "absolute", left: x - AW * 0.42, top: y + AH * 0.42, width: AW * 0.84, height: 22, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.28), transparent 70%)", opacity }} /> : null}
    <Img src={staticFile(src)} style={{ position: "absolute", left: x - AW / 2, top: y - AH / 2, width: AW, height: AH, transform: `scale(${scale})`, opacity }} />
  </>
);

export const AutoDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = t / BEAT;
  const DROP = 8;
  // after the drop the auto glides left (its nose points left) along the road
  const glide = b >= DROP ? -70 * ease.out(ramp(b, [DROP, 17])) : 0;
  const x = CX + 35 + glide, y = CY;
  const pulse = b >= DROP ? 1 + 0.06 * Math.exp(-(b - Math.floor(b)) * 7) : 1;
  // the build's cut sequence after the dots have formed
  const buildCut = b < 3.5 ? "dots" : b < 5 ? "engrave" : (["duo", "engrave", "duo", "dots"] as const)[Math.min(3, Math.floor((b - 5) * 2))];
  // after the drop: a cut on every beat
  const dropCut = (["photo", "duo", "photo", "engrave", "photo", "duo", "photo", "photo", "photo"] as const)[Math.min(8, Math.floor(b - DROP))];
  const drawn = ramp(b, [0.5, 3.5], [0, 1], ease.inOut);
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Audio src={staticFile("hukum/demo.wav")} />
      {b < 7 || b >= DROP ? (
        <>
          {/* construction: a circle drawn during the build, a hairline road with ticks */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <circle cx={CX} cy={CY} r={250} fill="none" stroke={LINE} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} transform={`rotate(-90 ${CX} ${CY})`} />
            <line x1={CX - 330 * ramp(b, [1, 3])} x2={CX + 330 * ramp(b, [1, 3])} y1={CY + AH / 2 + 8} y2={CY + AH / 2 + 8} stroke={LINE} strokeWidth={1.5} />
            {Array.from({ length: 23 }, (_, i) => {
              const tx = CX - 330 + i * 30 + ((-glide * 1.6) % 30);
              return Math.abs(tx - CX) < 330 * ramp(b, [1, 3]) ? <line key={i} x1={tx} x2={tx} y1={CY + AH / 2 + 8} y2={CY + AH / 2 + (i % 5 === 0 ? 22 : 15)} stroke={LINE} strokeWidth={1.5} /> : null;
            })}
            <circle cx={CX + 250} cy={CY} r={5} fill={YEL} opacity={drawn} />
            {/* speed hairlines behind the auto after the drop */}
            {b >= DROP + 1
              ? [0, 1, 2].map((i) => <line key={i} x1={x + AW / 2 + 14 + i * 6} x2={x + AW / 2 + 70 + i * 14} y1={y - 14 + i * 16} y2={y - 14 + i * 16} stroke={INK} strokeWidth={1.4} opacity={0.45 - i * 0.1} />)
              : null}
          </svg>
          <AbsoluteFill style={{ transform: `scale(${pulse})`, transformOrigin: `${x}px ${y}px` }}>
            {b < 7 ? (
              buildCut === "dots" ? (
                <Dots x={x} y={y} gather={ramp(b, [0, 2.4])} size={1} colour={b > 2.4 ? 1 : 0} />
              ) : buildCut === "engrave" ? (
                <>
                  <Dots x={x} y={y} gather={1} size={1 - ramp(b, [3.5, 4.5])} colour={1} opacity={1 - ramp(b, [3.5, 4.6])} />
                  <Pic src="rajini/auto/engrave.png" x={x} y={y} opacity={ramp(b, [3.5, 4.2])} />
                </>
              ) : buildCut === "duo" ? (
                <Pic src="rajini/auto/duo.png" x={x} y={y} />
              ) : (
                <Dots x={x} y={y} gather={1} size={1} colour={1} />
              )
            ) : dropCut === "photo" ? (
              <Pic src="rajini/auto/photo.png" x={x} y={y} scale={b < DROP + 1 ? 1.12 - 0.12 * ramp(b, [DROP, DROP + 0.4], [0, 1], ease.out) : 1} shadow />
            ) : dropCut === "duo" ? (
              <Pic src="rajini/auto/duo.png" x={x} y={y} shadow />
            ) : (
              <Pic src="rajini/auto/engrave.png" x={x} y={y} />
            )}
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
