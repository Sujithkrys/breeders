// Style frames for the Sonnet 5.5 film (one second each): 0 the hero mark, 1 everyday work, 2 the benchmark.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bar3D, Camera, Mark3D, project, Sheet3D, Studio, useFontsReady } from "./three";
import { COLOR, loadInstrument, SANS, SIZE, TRACK } from "./type";

loadInstrument();

const Paper: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 30% 20%, #FBF9F4 0%, ${COLOR.paper} 55%, #E9E4D9 100%)` }} />;
const T: React.FC<{ size: keyof typeof SIZE; color?: string; weight?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = COLOR.ink, weight = 500, children, style }) => (
  <div style={{ fontFamily: SANS, fontSize: SIZE[size], fontWeight: weight, letterSpacing: TRACK[size], lineHeight: size === "hero" ? 0.98 : size === "headline" ? 1.04 : 1.3, color, ...style }}>{children}</div>
);

const Hero: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <Studio wallZ={-2.6} shadow={0.18} keyPos={[-4, 7, 8]}>
      <Camera pos={[0, 0.2, 10]} target={[0, 0, 0]} />
      <Mark3D size={4.2} position={[2.35, 0.05, 0]} rotation={[-0.22, -0.55, 0.12]} />
    </Studio>
    <div style={{ position: "absolute", left: 140, top: 330 }}>
      <T size="label" color={COLOR.faint} style={{ marginBottom: 28 }}>Introducing</T>
      <T size="hero">Claude</T>
      <T size="hero">
        Sonnet <span style={{ color: COLOR.clay }}>5.5</span>
      </T>
    </div>
  </AbsoluteFill>
);

const Work: React.FC = () => {
  useFontsReady();
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-5} shadow={0.1} keyPos={[-3, 9, 10]}>
        <Camera pos={[0, 0.6, 11]} target={[0, 0.2, 0]} />
        <Sheet3D kind="deck" h={1.75} position={[0.1, 0.45, -1.7]} rotation={[0.03, 0, 0]} />
        <Sheet3D kind="memo" h={2.2} position={[-3.55, -0.45, -0.8]} rotation={[0.02, 0.3, -0.03]} />
        <Sheet3D kind="email" h={1.5} position={[-1.85, -1.45, 0.55]} rotation={[-0.05, 0.16, 0.02]} />
        <Sheet3D kind="sheet" h={1.4} position={[1.95, -1.4, 0.5]} rotation={[-0.04, -0.18, -0.02]} />
        <Sheet3D kind="research" h={2.1} position={[3.7, -0.35, -0.9]} rotation={[0.02, -0.32, 0.03]} />
        <Mark3D size={1.25} position={[0.05, -0.55, 1.7]} rotation={[-0.2, 0.45, 0.1]} />
      </Studio>
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center" }}>
        <T size="headline">Hand it the everyday work.</T>
      </div>
    </AbsoluteFill>
  );
};

const BCAM = { pos: [1.9, 0.5, 9.5] as [number, number, number], target: [1.9, 0.2, 0] as [number, number, number] };
const FLOOR = -3.6; // below the frame: the bars rise out of the bottom edge
const H55 = 4.9;
const H5 = (10.3 / 70.6) * H55 + 1.0; // +1.0: the part hidden below the frame
const Bench: React.FC = () => {
  const l5 = project([2.55, FLOOR + H5 + 0.05, 0.6], BCAM.pos, BCAM.target);
  const l55 = project([4.25, FLOOR + H55 + 0.05, 0.6], BCAM.pos, BCAM.target);
  return (
  <AbsoluteFill>
    <Paper />
    <Studio wallZ={-2.4} shadow={0.16} keyPos={[-5, 9, 7]}>
      <Camera pos={BCAM.pos} target={BCAM.target} />
      <Bar3D x={2.55} h={H5} floorY={FLOOR} />
      <Bar3D x={4.25} h={H55} hero floorY={FLOOR} />
    </Studio>
    <div style={{ position: "absolute", left: 140, top: 250 }}>
      <T size="sub" color={COLOR.sub}>Terminal-Bench 4.0</T>
      <T size="hero" style={{ marginTop: 18 }}>70.6%</T>
      <T size="sub" color={COLOR.sub} style={{ marginTop: 26, maxWidth: 760 }}>
        Up from 10.3% on Sonnet 5.
      </T>
    </div>
    <div style={{ position: "absolute", left: l5.x, top: l5.y - 40, transform: "translateX(-50%)" }}>
      <T size="label" color={COLOR.faint}>Sonnet 5</T>
    </div>
    <div style={{ position: "absolute", left: l55.x, top: l55.y - 40, transform: "translateX(-50%)" }}>
      <T size="label" color={COLOR.ink}>Sonnet 5.5</T>
    </div>
    <div style={{ position: "absolute", left: 140, bottom: 70 }}>
      <T size="label" color={COLOR.faint} weight={400}>As reported by Anthropic, September 28, 2026</T>
    </div>
  </AbsoluteFill>
  );
};

export const SonnetStyle: React.FC = () => {
  const f = useCurrentFrame();
  const scene = Math.floor(f / 30);
  return scene === 0 ? <Hero /> : scene === 1 ? <Work /> : <Bench />;
};
