// MustangBeatMe: the "Beat me, hate me" verse of Michael Jackson's "They Don't Care About Us" (audio from the gym
// edit the user referenced), one cut on every phrase. The Candyapple Red '67 Fastback stays small in the frame,
// about a fifth of the width, like the reference stills: a lone red car in big, empty places.
// Times are seconds into the verse audio (public/mustang/beatme-mix.wav, from scripts/compose-beatme.mjs).
// Car: "1967 Ford Mustang Fastback" by Mark Peters (CC BY 4.0). Scans and HDRIs: Poly Haven (CC0).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { FilmFinish } from "./look";
import { CREDIT, RealMustang, RealPart } from "./real";
import { Cam, ContactShadow, Cyc, Stage } from "./studio";
import {
  BRIDGE, BridgeWorld, carOn, CLIFF, CliffWorld, COAST, CoastWorld, CREAM, DESERT, DesertWorld, DRAG, DragWorld, DUNES, DunesWorld, HAIRPIN, HairpinWorld,
  Puffs, Rain, Ramp, RAMP_T, SALT, SaltWorld, SNOW, SnowWorld, TRACK, TrackWorld, TUNNEL, TunnelWorld, WET, WetWorld,
} from "./world";

// the lyric, word onsets snapped to the drum hits
export const W = {
  beat: 0, hate: 0.55, never1: 1.25, brk: 1.75, me1: 2.27, will: 2.59, thrill: 3.25, never2: 3.95, kill: 4.55, me2: 4.93,
  slur1: 5.21, sue: 5.94, everybody: 6.46, doMe: 6.94, kick: 7.91, slur2: 8.56, dont: 9.24, black: 9.58, white: 9.93, me3: 10.27,
  all: 10.52, care: 11.89, end: 14.1,
};
export const BEATME = { fps: 30, width: 1920, height: 1080, seconds: W.end + OUTRO_LEN };

type V3 = [number, number, number];
const lerp3 = (a: V3, c: V3, k: number): V3 => [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
const orbit = (r: number, yawDeg: number, h: number): V3 => [r * Math.cos((yawDeg * Math.PI) / 180), h, r * Math.sin((yawDeg * Math.PI) / 180)];
const add = (a: V3, c: V3): V3 => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];

// ---------- "you can never BREAK ME": out on break, home on me ----------
const APART: Record<RealPart, V3> = {
  nose: [1.9, 0.6, 0], tail: [-1.9, 0.6, 0], trimL: [0, 0.8, 1.5], trimR: [0, 0.8, 1.5], glass: [0, 1.7, 0], trim: [0, 2.6, 0],
  wheelFL: [0.3, 0.1, 1.3], wheelFR: [0.3, 0.1, 1.3], wheelRL: [-0.3, 0.1, 1.3], wheelRR: [-0.3, 0.1, 1.3], shell: [0, 1.05, 0],
};
const burstK = (s: number) => ramp(s, [W.brk, W.brk + 0.16], [0, 1], ease.out) * (1 + 0.1 * ramp(s, [W.brk + 0.16, W.me1 - 0.1])) * ramp(s, [W.me1 - 0.1, W.me1], [1, 0], ease.in);
const burstPose = (s: number) => (p: RealPart) => {
  const k = burstK(s - (p.startsWith("wheel") ? 0.03 : 0));
  const d = APART[p];
  return { d: [d[0] * k, d[1] * k, d[2] * k] as V3 };
};
const shake = (s: number, at: number, amp = 0.35): V3 => {
  const u = s - at;
  if (u < 0 || u > 0.45) return [0, 0, 0];
  const a = amp * Math.exp(-u * 10);
  return [Math.sin(u * 91) * a, Math.sin(u * 77 + 1) * a, Math.sin(u * 63 + 2) * a];
};

// ---------- studio: the car small, centred on cream ----------
const StudioBreak: React.FC<{ s: number }> = ({ s }) => {
  const k = ramp(s, [W.never1, W.will], [0, 1], ease.inOut);
  return (
    <AbsoluteFill>
      <Cyc horizon={0.64} />
      <Stage shadow={0.26} keyPos={[2, 10, 4]} sun={1.1} look={{ hdri: "studio", envIntensity: 1.1 }}>
        <Cam pos={add(orbit(44 - 6 * k, 30 + 14 * k, 9), shake(s, W.me1))} target={[0, 1.1, 0]} fov={14} />
        <ContactShadow size={[5.2, 2.3]} opacity={0.9 * (1 - 0.6 * burstK(s))} />
        <RealMustang lights={s > W.me1 ? 1.2 : 0.15} pose={burstPose(s)} />
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- the road ----------
type Place = "drag" | "wet" | "hairpin" | "desert" | "coast" | "canyon" | "track" | "snow" | "bridge" | "tunnel" | "salt" | "dunes";
const CURVES: Record<Place, THREE_Curve> = { drag: DRAG, wet: WET, hairpin: HAIRPIN, desert: DESERT, coast: COAST, canyon: CLIFF, track: TRACK, snow: SNOW, bridge: BRIDGE, tunnel: TUNNEL, salt: SALT, dunes: DUNES };
type THREE_Curve = typeof DRAG;
type Cut = {
  from: number;
  to: number;
  place: Place;
  t0: number; // curve position at the cut
  speed: number | ((u: number) => number); // metres travelled after u seconds
  lane?: number;
  camA: V3; // [ahead, left, up] in the car's frame (or the start point's, if fixed)
  camB?: V3;
  aim: V3;
  fov: number;
  fixed?: boolean;
  slip?: (u: number) => number;
  air?: (u: number) => { y: number; pitch: number };
  smoke?: boolean;
  spray?: boolean;
  lights?: number;
  sun?: number;
  fog?: [number, number];
  shakeAt?: number;
};
const local = (pos: V3, yaw: number, v: V3): V3 => {
  const fx = Math.cos(yaw), fz = -Math.sin(yaw);
  const lx = -Math.sin(yaw), lz = -Math.cos(yaw);
  return [pos[0] + fx * v[0] + lx * v[1], v[2], pos[2] + fz * v[0] + lz * v[1]];
};
const hop = (start: number, dur: number, height: number) => (u: number) => {
  const a = u - start;
  if (a < 0) return { y: 0, pitch: 0 };
  if (a < dur) return { y: Math.sin((Math.PI * a) / dur) * height, pitch: 0.14 - 0.34 * (a / dur) };
  const l = a - dur;
  const b = Math.exp(-l * 14) * Math.sin(l * 40) * 0.06;
  return { y: b, pitch: b * 2 };
};
// launch: stands still, then accelerates hard
const launch = (go: number, accel: number) => (u: number) => (u < go ? 0 : 0.5 * accel * (u - go) ** 2);
// brake to a dead stop at `stopAt` seconds having covered `dist` metres
const brake = (dist: number, stopAt: number) => (u: number) => {
  const k = Math.min(1, u / stopAt);
  return dist * (1 - (1 - k) ** 2);
};

const CUTS: Cut[] = [
  // BEAT ME: lights go green on the drum, the car launches out of its own smoke
  { from: W.beat, to: W.hate, place: "drag", t0: 0.5, lane: 2.6, speed: launch(0.28, 26), camA: [9, -7.5, 1.1], camB: [8.6, -7.6, 1.1], aim: [0, -1, 0.7], fov: 30, smoke: true, lights: 0.4 },
  // HATE ME: wet road, spray off the tyres, rain
  { from: W.hate, to: W.never1, place: "wet", t0: 0.5, speed: 30, camA: [5, 24, 2.6], camB: [0, 24, 2.6], aim: [0, 0, 0.6], fov: 22, spray: true, lights: 0.8, sun: 0.9 },
  // WILL ME: hairpins from straight above, the car a red dot
  { from: W.will, to: W.thrill, place: "hairpin", t0: 0.62, speed: 22, camA: [-6, 0.5, 92], camB: [-6, 0.5, 84], aim: [-2, 0, 0], fov: 30 },
  // THRILL ME: over the crest, airborne
  { from: W.thrill, to: W.never2, place: "desert", t0: 0.7, speed: 30, camA: [6, -26, 2.5], aim: [0, 0, 1.2], fov: 22, air: hop(0.05, 0.5, 1.3) },
  // YOU CAN NEVER KILL ME: drift on the cliff lip, dead stop on "me"
  { from: W.never2, to: W.slur1, place: "coast", t0: 0.42, speed: brake(22, W.me2 - W.never2), camA: [34, -30, 9], camB: [30, -32, 8], aim: [-2, -6, -1], fov: 18, slip: (u) => 0.75 * ramp(u, [0.1, 0.7], [0, 1], ease.out) },
  // [slur] hard cut: the canyon, front chase
  { from: W.slur1, to: W.sue, place: "canyon", t0: 0.4, speed: 30, camA: [22, 1.5, 2.2], camB: [20, 1.5, 2.0], aim: [0, 0, 0.6], fov: 22, shakeAt: 0 },
  // SUE ME: low pass at the kerb
  { from: W.sue, to: W.everybody, place: "track", t0: 0.42, speed: 40, camA: [34, -16, 1.6], aim: [0, 0, 0], fov: 22, fixed: true },
  // EVERYBODY: the canyon from high above, the car a red speck between the rocks
  { from: W.everybody, to: W.doMe, place: "canyon", t0: 0.45, speed: 28, camA: [64, -16, 12], camB: [60, -18, 11], aim: [-3, -3, -1], fov: 13 },
  // DO ME: alongside on the coast road, the cliff dropping away beyond
  { from: W.doMe, to: W.kick, place: "coast", t0: 0.6, speed: 32, camA: [5, 22, 3.2], camB: [0, 22, 3.2], aim: [0, -4, 0.2], fov: 24 },
  // KICK ME: off the ramp on the bridge
  { from: W.kick, to: W.slur2, place: "bridge", t0: RAMP_T + 8 / 240, speed: 34, camA: [6, -24, 3], aim: [-4, 0, 1.5], fov: 24, air: hop(0.24, 0.42, 1.6) },
  // [slur] hard cut into the tunnel
  { from: W.slur2, to: W.black, place: "tunnel", t0: 0.5, speed: 34, camA: [12, 1.4, 1.3], aim: [0, 0, 0.6], fov: 34, lights: 1.4, sun: 0.15, fog: [20, 110], shakeAt: 0 },
  // BLACK: the tunnel at its darkest, lamps streaking past
  { from: W.black, to: W.white, place: "tunnel", t0: 0.45, speed: 38, camA: [2.5, -3.2, 0.7], aim: [0.5, 0, 0.6], fov: 36, lights: 1.6, sun: 0.05, fog: [10, 70] },
  // WHITE (ME): blinding salt flat
  { from: W.white, to: W.all, place: "salt", t0: 0.5, speed: 44, camA: [26, -12, 3], camB: [22, -13, 3], aim: [0, 0, 0.5], fov: 22, sun: 3.2 },
  // ALL I WANNA SAY: red dunes, low and fast
  { from: W.all, to: W.care, place: "dunes", t0: 0.6, speed: 32, camA: [4, -9, 1.2], camB: [0, -9, 1.2], aim: [0, 0, 0.6], fov: 26 },
  // THEY DON'T REALLY CARE ABOUT US: the camera climbs away until the car is a red dot
  { from: W.care, to: W.end, place: "dunes", t0: 0.52, speed: 30, camA: [12, -14, 6], camB: [40, -40, 70], aim: [0, 0, 0], fov: 26 },
];

const World: React.FC<{ place: Place; s: number }> = ({ place, s }) => {
  switch (place) {
    case "drag":
      return <DragWorld green={s >= 0.28 ? 1 : 0} />;
    case "wet":
      return <WetWorld />;
    case "hairpin":
      return <HairpinWorld />;
    case "desert":
      return <DesertWorld />;
    case "coast":
      return <CoastWorld />;
    case "canyon":
      return <CliffWorld />;
    case "track":
      return <TrackWorld />;
    case "snow":
      return <SnowWorld />;
    case "bridge":
      return (
        <>
          <BridgeWorld />
          <Ramp lane={1.6} />
        </>
      );
    case "tunnel":
      return <TunnelWorld />;
    case "salt":
      return <SaltWorld />;
    case "dunes":
      return <DunesWorld />;
  }
};

const RoadShot: React.FC<{ s: number; c: Cut }> = ({ s, c }) => {
  const curve = CURVES[c.place];
  const u = s - c.from;
  const len = curve.getLength();
  const dist = typeof c.speed === "number" ? c.speed * u : c.speed(u);
  const lane = c.lane ?? 1.6;
  const { pos: p0, yaw: y0 } = carOn(curve, c.t0 - dist / len, lane);
  const yaw = y0 + Math.PI;
  const air = c.air?.(u) ?? { y: 0, pitch: 0 };
  const slip = c.slip?.(u) ?? 0;
  const pos: V3 = [p0[0], air.y, p0[2]];
  const start = carOn(curve, c.t0, lane);
  const ref = c.fixed ? { pos: start.pos, yaw: start.yaw + Math.PI } : { pos: p0, yaw };
  const k = ramp(u, [0, c.to - c.from], [0, 1], ease.inOut);
  const camV = c.camB ? lerp3(c.camA, c.camB, k) : c.camA;
  const camPos = add(local(ref.pos, ref.yaw, camV), c.shakeAt !== undefined ? shake(u, c.shakeAt, 0.5) : [0, 0, 0]);
  const target = c.fixed ? ([pos[0], 0.7, pos[2]] as V3) : local(ref.pos, ref.yaw, c.aim);
  const fog = c.fog ?? [70, 190];
  const bg = c.place === "tunnel" ? "#0C0B0A" : CREAM;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: bg }} />
      <Stage focus={[pos[0], 0, pos[2]]} keyPos={[-4, 10, 6]} fog={[bg, fog[0], fog[1]]} shadow={0.3} sun={c.sun ?? 2.0} floor={!["bridge", "coast", "tunnel", "dunes"].includes(c.place)} look={{ hdri: "sky", envIntensity: c.place === "tunnel" ? 0.15 : 0.9 }}>
        <Cam pos={camPos} target={target} fov={c.fov} />
        <World place={c.place} s={s} />
        <group position={pos} rotation={[0, yaw + slip, 0]}>
          <group rotation={[0, 0, air.pitch]}>
            <RealMustang lights={c.lights ?? 0.25} spin={dist / 0.335 + (c.smoke && u < 0.28 ? u * 60 : 0)} steer={-slip * 0.6} />
          </group>
          {c.smoke ? <Puffs u={u} rate={70} life={1.2} size={2.6} opacity={0.75} spread={1.2} drift={[-4, 0.9, 0]} origin={[-1.4, 0.3, 0]} seed={5} /> : null}
          {c.spray ? <Puffs u={u} rate={90} life={0.5} size={1.3} color="#DCE2E6" opacity={0.5} spread={0.7} drift={[-6, 0.6, 0]} origin={[-1.6, 0.2, 0]} seed={9} /> : null}
        </group>
        <group position={[p0[0], 0.01, p0[2]]} rotation={[0, yaw + slip, 0]}>
          <ContactShadow size={[5.2, 2.3]} opacity={0.85 / (1 + air.y * 1.5)} />
        </group>
      </Stage>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ s: number }> = ({ s }) => {
  if (s >= W.never1 && s < W.will) return <StudioBreak s={s} />;
  const c = CUTS.find((x) => s >= x.from && s < x.to);
  return c ? <RoadShot s={s} c={c} /> : null;
};

// a smear across each cut, strongest right on it
const CUT_TIMES = [...CUTS.map((c) => c.from), W.never1, W.will].filter((t) => t > 0);
const whipAt = (s: number) => Math.max(0, ...CUT_TIMES.map((t) => 1 - Math.abs(s - t) / 0.07));

export const MustangBeatMe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const flash = (at: number, peak = 0.8, len = 0.16) => (s >= at ? ramp(s, [at, at + len], [peak, 0]) : 0);
  // "white": the salt flat opens overexposed and settles
  const white = s >= W.white ? ramp(s, [W.white, W.white + 0.3], [0.85, 0]) : 0;
  const whip = whipAt(s);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Audio src={staticFile("mustang/beatme-mix.wav")} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whip" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${whip * 55} 0`} />
        </filter>
      </svg>
      {s < W.end ? (
        <>
          <AbsoluteFill style={{ filter: whip > 0.02 ? "url(#whip)" : undefined }}>
            <Shot s={s} />
          </AbsoluteFill>
          {s >= W.hate && s < W.never1 ? <Rain frame={frame} /> : null}
          <AbsoluteFill style={{ background: "#FFFFFF", opacity: Math.max(flash(W.me1), flash(W.slur1, 0.5, 0.1), flash(W.slur2, 0.5, 0.1), white), pointerEvents: "none" }} />
          <FilmFinish frame={frame} />
          <Watermark opacity={1 - ramp(s, [W.end - 0.3, W.end])} dark={s >= W.slur2 && s < W.white ? 1 : 0} />
        </>
      ) : (
        <>
          <BreedersOutro t={s - W.end} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center", fontFamily: "'Geist Mono', monospace", fontSize: 15, letterSpacing: "0.04em", color: "#9A9187", opacity: ramp(s - W.end, [0.6, 1.0]) * (1 - ramp(s - W.end, [OUTRO_LEN - 0.4, OUTRO_LEN])) }}>
            Car model: {CREDIT}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
