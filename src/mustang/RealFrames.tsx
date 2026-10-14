// Look frames with the real car: 0 hero (matches reference 4), 1 side profile close, 2 low front.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RealMustang } from "./real";
import { Cam, ContactShadow, Stage } from "./studio";

const CREAM = "#FBF3E4";
const Bg: React.FC = () => <AbsoluteFill style={{ background: `linear-gradient(180deg, #FDF7EC 0%, ${CREAM} 60%, #F6EAD5 100%)` }} />;

const SHOTS: { pos: [number, number, number]; target: [number, number, number]; fov: number }[] = [
  { pos: [9.5, 2.2, 12.5], target: [0.1, 0.55, 0], fov: 15 },
  { pos: [0.4, 0.75, 7.2], target: [0.2, 0.62, 0], fov: 26 },
  { pos: [4.6, 0.32, 2.6], target: [0.6, 0.55, 0], fov: 32 },
];

export const MustangRealFrames: React.FC = () => {
  const f = Math.min(useCurrentFrame(), SHOTS.length - 1);
  const s = SHOTS[f];
  return (
    <AbsoluteFill>
      <Bg />
      <Stage shadow={0.28} keyPos={[2, 10, 4]} sun={1.2} look={{ hdri: "studio", envIntensity: 1.1 }}>
        <Cam pos={s.pos} target={s.target} fov={s.fov} />
        <ContactShadow size={[5.2, 2.3]} opacity={0.9} />
        <RealMustang lights={0.15} />
      </Stage>
    </AbsoluteFill>
  );
};
