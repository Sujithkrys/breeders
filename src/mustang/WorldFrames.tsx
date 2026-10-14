// Look frames for the three road worlds, framed like the user's references 1, 2 and 5.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RealMustang } from "./real";
import { Cam, ContactShadow, Stage } from "./studio";
import { carOn, CLIFF, CliffWorld, CREAM, DESERT, DesertWorld, TRACK, TrackWorld } from "./world";

const Bg: React.FC = () => <AbsoluteFill style={{ background: CREAM }} />;

// cam and aim are [ahead, left, up] in metres in the car's own frame
type Shot = { world: "track" | "desert" | "cliff"; t: number; lane: number; cam: [number, number, number]; aim: [number, number, number]; fov: number };
const SHOTS: Shot[] = [
  { world: "track", t: 0.32, lane: 1.6, cam: [60, -20, 9], aim: [-2, -4, -0.5], fov: 12 },
  { world: "desert", t: 0.3, lane: 1.7, cam: [70, -10, 17], aim: [-12, -2, -3], fov: 12 },
  { world: "cliff", t: 0.4, lane: 1.6, cam: [64, -16, 12], aim: [-3, -3, -1], fov: 13 },
];
const local = (pos: [number, number, number], yaw: number, v: [number, number, number]): [number, number, number] => {
  const fx = Math.cos(yaw), fz = -Math.sin(yaw); // forward (+x local)
  const lx = -Math.sin(yaw), lz = -Math.cos(yaw); // left (+z local)
  return [pos[0] + fx * v[0] + lx * v[1], v[2], pos[2] + fz * v[0] + lz * v[1]];
};

export const MustangWorldFrames: React.FC = () => {
  const s = SHOTS[Math.min(useCurrentFrame(), SHOTS.length - 1)];
  const curve = s.world === "track" ? TRACK : s.world === "desert" ? DESERT : CLIFF;
  // the car drives toward the camera: it travels the curve backwards
  const { pos, yaw: y0 } = carOn(curve, s.t, s.lane);
  const yaw = y0 + Math.PI;
  return (
    <AbsoluteFill>
      <Bg />
      <Stage focus={pos} keyPos={[-4, 10, 6]} fog={[CREAM, 60, 150]} shadow={0.3} floor sun={2.6}>
        <Cam pos={local(pos, yaw, s.cam)} target={local(pos, yaw, s.aim)} fov={s.fov} />
        {s.world === "track" ? <TrackWorld /> : s.world === "desert" ? <DesertWorld /> : <CliffWorld />}
        <group position={pos} rotation={[0, yaw, 0]}>
          <ContactShadow size={[5.2, 2.3]} opacity={0.85} />
          <RealMustang lights={0.15} spin={1} />
        </group>
      </Stage>
    </AbsoluteFill>
  );
};
