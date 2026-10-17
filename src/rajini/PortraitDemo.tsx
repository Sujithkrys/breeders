// PortraitDemo: 7.6 s look test, OpenAI-specimen style. A disc of dots on a white page assembles into Rajinikanth
// as the young Superstar, empties on the silent beat, and on the Hukum drop re-forms as today's Thalaivar.
// One shared grid of dots; each dot has a size for each portrait (scripts/rajini/portrait-dots.py), so the faces
// morph dot by dot. Photos: Wikimedia Commons, CC BY-SA 3.0 (Mperumal/Keyan20; Dani Charles, Silverscreen Media).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp } from "../utils";
import P from "./portraitDots.json";

const BEAT = 60 / 136.02;
const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
export const PORTRAIT_DEMO = { fps: 30, width: W, height: H, seconds: 7.6 };
const D = 460; // disc diameter on the page
const STEP = D / P.n;
const YEL = "#FFC20E", INK = "#0B0B0B";

export const PortraitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = t / BEAT;
  const DROP = 8;
  const u = b - Math.floor(b);
  const dots = P.dots as number[][];
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Audio src={staticFile("hukum/demo.wav")} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* page furniture: a registration cross above, a hairline ring around the disc, one yellow dot */}
        <g stroke="#D4D4D4" strokeWidth={1.5}>
          <line x1={CX - 10} x2={CX + 10} y1={150} y2={150} />
          <line x1={CX} x2={CX} y1={140} y2={160} />
        </g>
        <circle cx={CX} cy={CY} r={D / 2 + 34} fill="none" stroke="#E4E4E4" strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(b, [0, 3], [0, 1], ease.inOut)} transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX + D / 2 + 34} cy={CY} r={5} fill={YEL} opacity={ramp(b, [2.5, 3])} />
        {dots.map(([x, y, a, z], i) => {
          const dx = x - 0.5, dy = y - 0.5;
          const r01 = Math.sqrt(dx * dx + dy * dy) * 2; // 0 at the centre, 1 at the rim
          // the disc appears from the centre out
          const show = ramp(b, [r01 * 0.9, r01 * 0.9 + 0.3]);
          if (show <= 0) return null;
          let s: number;
          if (b < 7) {
            // the young Superstar forms from the centre outward, then breathes on each beat
            const k = ease.inOut(ramp(b, [1 + r01 * 2.5, 2.4 + r01 * 2.5]));
            s = 0.08 + (a - 0.08) * k;
            s *= 1 + 0.08 * Math.exp(-u * 6) * Math.cos(r01 * 6 - u * 8);
          } else if (b < DROP) {
            // the silent beat: everything drains back to the bare grid
            s = 0.08 + (a - 0.08) * (1 - ease.out(ramp(b, [7, 7.25])));
          } else {
            // the drop: today's Thalaivar bursts in with an overshoot, a ripple on every beat
            const k = ramp(b, [DROP + r01 * 0.35, DROP + r01 * 0.35 + 0.5]);
            const over = 1 + 0.35 * Math.sin(Math.PI * k) * (1 - k);
            s = (0.08 + (z - 0.08) * ease.out(k)) * over;
            const wave = Math.exp(-u * 5) * Math.max(0, Math.cos((r01 - u * 1.6) * 7));
            s *= 1 + 0.1 * wave;
          }
          const rr = Math.max(0.7, STEP * 0.56 * s) * show;
          return <circle key={i} cx={CX - D / 2 + x * D} cy={CY - D / 2 + y * D} r={rr} fill={INK} />;
        })}
        {/* the drop: one yellow ring flashing out from the centre */}
        {b >= DROP ? <circle cx={CX} cy={CY} r={40 + ramp(b, [DROP, DROP + 0.7]) * (D / 2 + 60)} fill="none" stroke={YEL} strokeWidth={5 * (1 - ramp(b, [DROP, DROP + 0.7]))} opacity={1 - ramp(b, [DROP, DROP + 0.7])} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
