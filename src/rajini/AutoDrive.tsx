// AutoDrive: one real auto-rickshaw, driving. The photo ("Go slow" by Rakesh.5suthar, CC BY-SA 3.0) stays small at
// the centre of a white page while the camera tracks it: the wheels (cut from the photo) spin at the road speed with a
// little blur, the body rides on its suspension, the road's ticks stream past, and the shadow sits under it.
// Build on the Hukum bars, a held beat of silence, then the drop: it surges.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp } from "../utils";
import META from "./autoWheels.json";

const BEAT = 60 / 136.02;
const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
export const AUTO_DRIVE = { fps: 30, width: W, height: H, seconds: 7.6 };
const AW = 220, S = AW / META.w, AH = META.h * S; // the auto on the page, and photo → page scale
const LINE = "#D2D2D2", YEL = "#FFC20E";

// distance travelled (page px) at time t: a steady cruise that builds, holds on the silent beat, then surges
const speedAt = (b: number) => (b < 7 ? 90 + 70 * ramp(b, [0, 7], [0, 1], ease.in) : b < 8 ? 0 : 420 * ramp(b, [8, 8.6], [0, 1], ease.out) + 160);
const distance = (t: number, fps: number) => {
  let d = 0;
  for (let f = 0; f < Math.round(t * fps); f++) d += speedAt(f / fps / BEAT) / fps;
  return d;
};

const Wheel: React.FC<{ name: "front" | "rear"; angle: number; blur: number }> = ({ name, angle, blur }) => {
  const w = META.wheels[name];
  const d = w.ry * 2 * S; // texture is round at the vertical diameter, then squashed to the wheel's ellipse
  const copies = blur > 0.05 ? [0, 1, 2] : [0];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: AW, height: AH, WebkitMaskImage: `url(${staticFile(`rajini/auto/wheelmask_${name}.png`)})`, maskImage: `url(${staticFile(`rajini/auto/wheelmask_${name}.png`)})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
      <div style={{ position: "absolute", left: w.cx * S - d / 2, top: w.cy * S - d / 2, width: d, height: d, transform: `scaleX(${w.rx / w.ry})` }}>
        {copies.map((i) => (
          <Img key={i} src={staticFile(`rajini/auto/wheel_${name}.png`)} style={{ position: "absolute", inset: 0, width: d, height: d, transform: `rotate(${angle + i * blur * 14}deg)`, opacity: i === 0 ? 1 : 0.35 }} />
        ))}
      </div>
    </div>
  );
};

export const AutoDrive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = t / BEAT;
  const v = speedAt(b);
  const dist = distance(t, fps);
  // moving left: the wheels turn anticlockwise, angle = distance / radius
  const angle = -(dist / (META.wheels.front.ry * S)) * (180 / Math.PI);
  const blur = Math.min(1, v / 400);
  const bounce = v > 0 ? Math.sin(t * 17) * 0.7 + Math.sin(t * 29 + 1) * 0.4 : 0;
  const pitch = v > 0 ? Math.sin(t * 11) * 0.25 : 0;
  const surge = b >= 8 ? Math.exp(-(b - 8) * 3) : 0;
  const shake = surge * Math.sin(t * 80) * 5;
  const x = CX - 6 * surge, y = CY;
  const roadY = y + AH / 2 - 1;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Audio src={staticFile("hukum/demo.wav")} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {/* the road: a hairline with ticks streaming past (the camera tracks the auto) */}
          <line x1={CX - 340} x2={CX + 340} y1={roadY} y2={roadY} stroke={LINE} strokeWidth={1.5} />
          {Array.from({ length: 26 }, (_, i) => {
            const tx = CX - 340 + ((i * 28 + dist) % 728);
            return tx < CX + 340 ? <line key={i} x1={tx} x2={tx} y1={roadY} y2={roadY + (i % 5 === 0 ? 14 : 8)} stroke={LINE} strokeWidth={1.5} /> : null;
          })}
          <circle cx={CX} cy={CY} r={250} fill="none" stroke="#E6E6E6" strokeWidth={1.5} />
          <circle cx={CX + 250} cy={CY} r={5} fill={YEL} />
          {/* speed hairlines trailing the auto, longer as it goes faster */}
          {[0, 1, 2].map((i) => (
            <line key={i} x1={x + AW / 2 + 12 + i * 6} x2={x + AW / 2 + 12 + i * 6 + (20 + v * 0.18) * (1 - i * 0.2)} y1={y - 22 + i * 18} y2={y - 22 + i * 18} stroke="#111" strokeWidth={1.3} opacity={Math.min(0.5, v / 500) * (1 - i * 0.25)} />
          ))}
        </svg>
        {/* contact shadow */}
        <div style={{ position: "absolute", left: x - AW * 0.46, top: roadY - 9, width: AW * 0.92, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.32), transparent 70%)" }} />
        {/* the auto: body on its suspension, wheels spinning underneath the mask */}
        <div style={{ position: "absolute", left: x - AW / 2, top: y - AH / 2, width: AW, height: AH }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${bounce}px) rotate(${pitch}deg)`, transformOrigin: "50% 90%" }}>
            {/* a faint ghost behind at speed, a touch of motion blur */}
            {blur > 0.3 ? <Img src={staticFile("rajini/auto/photo.png")} style={{ position: "absolute", left: 6 * blur, top: 0, width: AW, height: AH, opacity: 0.25 * blur }} /> : null}
            <Img src={staticFile("rajini/auto/photo.png")} style={{ position: "absolute", inset: 0, width: AW, height: AH }} />
          </div>
          <Wheel name="front" angle={angle} blur={blur} />
          <Wheel name="rear" angle={angle} blur={blur} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
