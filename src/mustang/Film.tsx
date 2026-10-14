// MustangBeatIt: a Candyapple Red '67 Fastback. Five quick studio cuts, the car bursts apart and slams back together
// on Beat It's band entry, then 22 cuts across seven places (circuit, desert, canyon, coast, salt flat, hairpins,
// bridge), every cut on the song's beat grid (138.68 BPM), and back to the studio for the title.
// Sound: public/mustang/mix.wav from scripts/compose-mustang.mjs (Beat It from 18.766s, so the slam at beat 12 lands
// on the band entry at 23.958s). Car: "1967 Ford Mustang Fastback" by Mark Peters (CC BY 4.0). Scans: Poly Haven (CC0).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { FilmFinish } from "./look";
import { CREDIT, RealMustang, RealPart } from "./real";
import { Cam, ContactShadow, Cyc, INK, Stage } from "./studio";
import { BRIDGE, BridgeWorld, carOn, CLIFF, CliffWorld, COAST, CoastWorld, CREAM, DESERT, DesertWorld, HAIRPIN, HairpinWorld, SALT, SaltWorld, TRACK, TrackWorld } from "./world";

export const BEAT = 0.43264;
const b = (n: number) => n * BEAT; // beats → seconds
const BODY_BEATS = 60;
export const SONG_FROM = 18.766;
export const MUSTANG = { fps: 30, width: 1920, height: 1080, seconds: b(BODY_BEATS) + OUTRO_LEN };
const SLAM = b(12);

const TIGHT = "'Inter Tight', Inter, sans-serif";
const MONO = "'Geist Mono', monospace";
type V3 = [number, number, number];
const lerp3 = (a: V3, c: V3, k: number): V3 => [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
const orbit = (r: number, yawDeg: number, h: number): V3 => [r * Math.cos((yawDeg * Math.PI) / 180), h, r * Math.sin((yawDeg * Math.PI) / 180)];
const add = (a: V3, c: V3): V3 => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];

// ---------- the burst: every part out on beat 8, back home on beat 12 ----------
const APART: Record<RealPart, V3> = {
  nose: [1.9, 0.6, 0],
  tail: [-1.9, 0.6, 0],
  trimL: [0, 0.8, 1.5],
  trimR: [0, 0.8, 1.5],
  glass: [0, 1.7, 0],
  trim: [0, 2.6, 0],
  wheelFL: [0.3, 0.1, 1.3],
  wheelFR: [0.3, 0.1, 1.3],
  wheelRL: [-0.3, 0.1, 1.3],
  wheelRR: [-0.3, 0.1, 1.3],
  shell: [0, 1.05, 0],
};
const burstK = (s: number) => {
  const out = ramp(s, [b(8), b(8) + 0.22], [0, 1], ease.out);
  const drift = 1 + 0.12 * ramp(s, [b(8) + 0.22, SLAM - 0.12], [0, 1], ease.inOut);
  const home = ramp(s, [SLAM - 0.12, SLAM], [1, 0], ease.in);
  return out * drift * home;
};
const burstPose = (s: number) => (p: RealPart) => {
  // stagger: wheels and trims fly a touch later than nose and tail
  const lag = p.startsWith("wheel") ? 0.05 : p.startsWith("trim") ? 0.03 : 0;
  const k = burstK(s - lag);
  const d = APART[p];
  return { d: [d[0] * k, d[1] * k, d[2] * k] as V3 };
};
const shake = (s: number): V3 => {
  const u = s - SLAM;
  if (u < 0 || u > 0.5) return [0, 0, 0];
  const a = 0.14 * Math.exp(-u * 9);
  return [Math.sin(u * 91) * a, Math.sin(u * 77 + 1) * a, Math.sin(u * 63 + 2) * a];
};

// ---------- studio ----------
type StudioCut = { from: number; to: number; camA: V3; camB: V3; target: V3; fov: number; lights?: (s: number) => number; car?: (u: number) => { x: number; yaw: number; spin: number } };
const STUDIO: StudioCut[] = [
  { from: 0, to: 2, camA: orbit(14, 36, 2.0), camB: orbit(12.5, 40, 1.9), target: [0.1, 0.55, 0], fov: 17 },
  { from: 2, to: 3, camA: orbit(5.2, 8, 0.45), camB: orbit(4.8, 12, 0.45), target: [1.6, 0.62, 0], fov: 30, lights: (s) => (s > b(2.5) ? 1.3 : 0.1) },
  { from: 3, to: 4, camA: [1.4, 0.4, 2.6], camB: [1.0, 0.4, 2.6], target: [1.35, 0.35, 0.75], fov: 32 },
  { from: 4, to: 6, camA: orbit(9, 92, 0.75), camB: orbit(9, 82, 0.75), target: [0.0, 0.6, 0], fov: 26 },
  { from: 6, to: 8, camA: orbit(7, 205, 1.1), camB: orbit(6.4, 212, 1.0), target: [-1.4, 0.7, 0], fov: 28, lights: () => 0.9 },
  // the burst, one cut: out on 8, a slow quarter orbit, home on 12
  { from: 8, to: 12, camA: orbit(13.5, 28, 3.2), camB: orbit(12.5, 58, 2.6), target: [0.1, 1.0, 0], fov: 24 },
  // the slam lands: low front, lamps on, the car shakes, then it's gone on beat 14
  { from: 12, to: 14, camA: orbit(7.5, 18, 0.55), camB: orbit(7.2, 18, 0.55), target: [0.8, 0.6, 0], fov: 30, lights: () => 1.2, car: (u) => ({ x: u > b(1.4) ? (u - b(1.4)) ** 2 * 60 : 0, yaw: 0, spin: u * 20 }) },
  // the stop: back in the studio, sliding in and dead on beat 58
  { from: 56, to: 60, camA: orbit(12, 32, 1.6), camB: orbit(11.2, 34, 1.5), target: [0.2, 0.6, 0], fov: 18, lights: () => 0.9, car: (u) => { const k = ramp(u, [0, b(2)], [0, 1], ease.out); return { x: -12 * (1 - k), yaw: 0.4 * (1 - k), spin: 30 * k }; } },
];
const StudioShot: React.FC<{ s: number; c: StudioCut }> = ({ s, c }) => {
  const u = s - b(c.from);
  const k = ramp(s, [b(c.from), b(c.to)], [0, 1], ease.inOut);
  const car = c.car?.(u);
  const burst = c.from === 8 || c.from === 12;
  return (
    <AbsoluteFill>
      <Cyc horizon={0.64} />
      <Stage shadow={0.26} keyPos={[2, 10, 4]} focus={[car?.x ?? 0, 0, 0]} sun={1.1} look={{ hdri: "studio", envIntensity: 1.1 }}>
        <Cam pos={add(lerp3(c.camA, c.camB, k), shake(s))} target={c.target} fov={c.fov} />
        <group position={[car?.x ?? 0, 0, 0]} rotation={[0, car?.yaw ?? 0, 0]}>
          <ContactShadow size={[5.2, 2.3]} opacity={0.9 * (1 - 0.6 * (burst ? burstK(s) : 0))} />
          <RealMustang lights={c.lights?.(s) ?? 0.12} pose={burst ? burstPose(s) : undefined} spin={car?.spin ?? 0} />
        </group>
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- the road ----------
const PLACES = {
  track: { curve: TRACK, World: TrackWorld, name: "Circuit" },
  desert: { curve: DESERT, World: DesertWorld, name: "Desert" },
  canyon: { curve: CLIFF, World: CliffWorld, name: "Canyon" },
  coast: { curve: COAST, World: CoastWorld, name: "Coast" },
  salt: { curve: SALT, World: SaltWorld, name: "Salt flat" },
  hairpin: { curve: HAIRPIN, World: HairpinWorld, name: "Hairpins" },
  bridge: { curve: BRIDGE, World: BridgeWorld, name: "Bridge" },
} as const;
type Place = keyof typeof PLACES;
type RoadCut = {
  at: number; // beat the cut starts on (each lasts 2 beats)
  place: Place;
  t0: number;
  speed: number;
  lane?: number;
  camA: V3; // [ahead, left, up] from the car (or from the start point when fixed)
  camB?: V3;
  aim: V3;
  fov: number;
  fixed?: boolean;
  slip?: number;
  hop?: boolean;
  ramp?: boolean; // speed ramp: fast in, slow middle, fast out
};
// the car always drives toward t = 0
const DRIVE: RoadCut[] = [
  { at: 14, place: "track", t0: 0.42, speed: 38, camA: [26, -5.5, 0.8], aim: [0, 0, 0], fov: 28, fixed: true },
  { at: 16, place: "track", t0: 0.34, speed: 32, camA: [60, -20, 9], camB: [56, -22, 8], aim: [-2, -4, -0.5], fov: 12 },
  { at: 18, place: "track", t0: 0.3, speed: 34, camA: [1.5, -6.2, 0.8], camB: [-1.5, -6.2, 0.8], aim: [0.4, 0, 0.6], fov: 32, ramp: true },
  { at: 20, place: "desert", t0: 0.32, speed: 30, camA: [70, -10, 17], camB: [64, -12, 15], aim: [-12, -2, -3], fov: 12 },
  { at: 22, place: "desert", t0: 0.5, speed: 34, lane: 1.7, camA: [0.8, -6.5, 0.7], aim: [0.4, 0, 0.6], fov: 30, ramp: true },
  { at: 24, place: "desert", t0: 0.6, speed: 32, camA: [-3, 0.5, 34], camB: [3, 0.5, 30], aim: [0, 0, 0], fov: 22 },
  { at: 26, place: "canyon", t0: 0.42, speed: 26, camA: [64, -16, 12], camB: [60, -18, 11], aim: [-3, -3, -1], fov: 13 },
  { at: 28, place: "canyon", t0: 0.38, speed: 28, camA: [9, 1.2, 0.9], camB: [7, -1.2, 0.9], aim: [0, 0, 0.6], fov: 30 },
  { at: 30, place: "coast", t0: 0.55, speed: 30, camA: [40, -26, 6], camB: [36, -28, 7], aim: [-4, -6, -2], fov: 16 },
  { at: 32, place: "coast", t0: 0.45, speed: 32, camA: [0.6, -7, 1.2], aim: [0.4, 0, 0.5], fov: 30, ramp: true },
  { at: 34, place: "salt", t0: 0.5, speed: 40, camA: [90, -30, 8], camB: [84, -30, 8], aim: [0, -6, 0], fov: 10 },
  { at: 36, place: "salt", t0: 0.55, speed: 44, camA: [8, 2, 0.6], camB: [6, -2, 0.6], aim: [0, 0, 0.55], fov: 28 },
  { at: 38, place: "hairpin", t0: 0.62, speed: 22, camA: [-6, 0.5, 80], camB: [-6, 0.5, 70], aim: [-2, 0, 0], fov: 30 },
  { at: 40, place: "hairpin", t0: 0.44, speed: 20, camA: [16, -12, 7], aim: [-1, 1, 0], fov: 24, slip: 0.6 },
  { at: 42, place: "bridge", t0: 0.62, speed: 36, camA: [70, -38, 10], camB: [64, -40, 12], aim: [-10, 0, 3], fov: 16 },
  { at: 44, place: "bridge", t0: 0.55, speed: 38, camA: [0.8, -7.5, 1.0], aim: [0.4, 0, 0.6], fov: 30, ramp: true },
  { at: 46, place: "track", t0: 0.66, speed: 24, camA: [18, -13, 8], aim: [-1, 1, 0], fov: 22, slip: 0.55 },
  { at: 48, place: "desert", t0: 0.7, speed: 30, camA: [3, -9, 0.7], aim: [0.5, 0, 0.9], fov: 28, hop: true },
  { at: 50, place: "coast", t0: 0.3, speed: 34, camA: [10, 0.5, 1.1], camB: [8, 0.5, 1.0], aim: [0, 0, 0.6], fov: 28 },
  { at: 52, place: "salt", t0: 0.45, speed: 46, camA: [-2, 0.5, 26], camB: [2, 0.5, 26], aim: [0, 0, 0], fov: 24 },
  { at: 54, place: "canyon", t0: 0.55, speed: 30, camA: [2, 6.0, 0.8], aim: [0.4, 0, 0.6], fov: 32, ramp: true },
];
const local = (pos: V3, yaw: number, v: V3): V3 => {
  const fx = Math.cos(yaw), fz = -Math.sin(yaw);
  const lx = -Math.sin(yaw), lz = -Math.cos(yaw);
  return [pos[0] + fx * v[0] + lx * v[1], v[2], pos[2] + fz * v[0] + lz * v[1]];
};
const RoadShot: React.FC<{ s: number; c: RoadCut }> = ({ s, c }) => {
  const P = PLACES[c.place];
  const L = b(2);
  const u = s - b(c.at);
  const len = P.curve.getLength();
  // speed ramp: 1.45x at the ends, 0.55x in the middle
  const dist = c.speed * (c.ramp ? u + (0.45 * L * Math.sin((2 * Math.PI * u) / L)) / (2 * Math.PI) : u);
  const lane = c.lane ?? 1.6;
  const { pos: p0, yaw: y0 } = carOn(P.curve, c.t0 - dist / len, lane);
  const yaw = y0 + Math.PI;
  const air = c.hop ? Math.max(0, Math.sin((Math.PI * u) / 0.62)) : 0;
  const land = c.hop && u > 0.62 ? Math.exp(-(u - 0.62) * 14) * Math.sin((u - 0.62) * 40) * 0.05 : 0;
  const pitch = c.hop ? (u < 0.62 ? 0.12 - 0.3 * (u / 0.62) : land * 2) : 0;
  const slip = (c.slip ?? 0) * ramp(u, [0, 0.4], [0.3, 1], ease.out);
  const pos: V3 = [p0[0], air * 1.1 + land, p0[2]];
  const start = carOn(P.curve, c.t0, lane);
  const ref = c.fixed ? { pos: start.pos, yaw: start.yaw + Math.PI } : { pos: p0, yaw };
  const k = ramp(u, [0, L], [0, 1], ease.inOut);
  const camV = c.camB ? lerp3(c.camA, c.camB, k) : c.camA;
  const camPos = local(ref.pos, ref.yaw, camV);
  const target = c.fixed ? ([pos[0], 0.7, pos[2]] as V3) : local(ref.pos, ref.yaw, c.aim);
  const W = P.World;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: CREAM }} />
      <Stage focus={[pos[0], 0, pos[2]]} keyPos={[-4, 10, 6]} fog={[CREAM, 60, 170]} shadow={0.3} sun={2.0} floor={c.place !== "bridge" && c.place !== "coast"} look={{ hdri: "sky", envIntensity: 0.9 }}>
        <Cam pos={camPos} target={target} fov={c.fov} />
        <W />
        <group position={pos} rotation={[0, yaw + slip, 0]}>
          <group rotation={[0, 0, pitch]}>
            <RealMustang lights={0.25} spin={dist / 0.335} steer={-slip * 0.6} />
          </group>
        </group>
        <group position={[p0[0], 0.01, p0[2]]} rotation={[0, yaw + slip, 0]}>
          <ContactShadow size={[5.2, 2.3]} opacity={0.85 / (1 + air * 1.5)} />
        </group>
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- whip pan: a horizontal smear across each drive cut ----------
const Whip: React.FC<{ amount: number }> = ({ amount }) =>
  amount <= 0.01 ? null : (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="whip" x="-10%" y="0" width="120%" height="100%">
        <feGaussianBlur stdDeviation={`${amount * 60} 0`} />
      </filter>
    </svg>
  );
const whipAt = (s: number) => {
  const x = s / BEAT;
  const cut = Math.round(x / 2) * 2; // drive cuts sit on even beats from 14 to 56
  if (cut < 14 || cut > 56) return 0;
  return Math.max(0, 1 - (Math.abs(x - cut) * BEAT) / 0.09);
};

// ---------- type ----------
const Line: React.FC<{ s: number; from: number; to: number; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ s, from, to, children, size = 72, style }) => {
  const k = ramp(s, [from, from + 0.22], [0, 1], ease.out) * (1 - ramp(s, [to - 0.14, to], [0, 1], ease.in));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", fontFamily: TIGHT, fontWeight: 700, fontSize: size, letterSpacing: "-0.035em", lineHeight: 1, color: INK, opacity: k, transform: `translateY(${(1 - k) * 16}px)`, ...style }}>
      {children}
    </div>
  );
};
const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; opacity?: number }> = ({ children, style, opacity = 1 }) => (
  <div style={{ position: "absolute", fontFamily: MONO, fontSize: 17, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7E7568", opacity, ...style }}>{children}</div>
);
// the place's name, small, the first time we arrive there
const PlaceTag: React.FC<{ s: number }> = ({ s }) => {
  const seen = new Set<Place>();
  const firsts = DRIVE.filter((c) => (seen.has(c.place) ? false : (seen.add(c.place), true)));
  const c = firsts.find((x) => s >= b(x.at) && s < b(x.at + 2));
  if (!c) return null;
  const n = Object.keys(PLACES).indexOf(c.place) + 1;
  const k = ramp(s, [b(c.at) + 0.05, b(c.at) + 0.25]) * (1 - ramp(s, [b(c.at + 2) - 0.15, b(c.at + 2)]));
  return (
    <Label style={{ left: 96, bottom: 96 }} opacity={k}>
      <span style={{ color: "#A0121B" }}>{String(n).padStart(2, "0")}</span>&nbsp;&nbsp;{PLACES[c.place].name}
    </Label>
  );
};

const Shot: React.FC<{ s: number }> = ({ s }) => {
  const beat = s / BEAT;
  const studio = STUDIO.find((c) => beat >= c.from && beat < c.to);
  if (studio) return <StudioShot s={s} c={studio} />;
  const road = DRIVE.find((c) => beat >= c.at && beat < c.at + 2);
  if (road) return <RoadShot s={s} c={road} />;
  return null;
};

export const MustangBeatIt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const end = b(BODY_BEATS);
  const flash = s >= SLAM ? ramp(s, [SLAM, SLAM + 0.16], [0.75, 0]) : 0;
  const whip = whipAt(s);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Audio src={staticFile("mustang/mix.wav")} />
      <Whip amount={whip} />
      {s < end ? (
        <>
          <AbsoluteFill style={{ filter: whip > 0.01 ? "url(#whip)" : undefined }}>
            <Shot s={s} />
          </AbsoluteFill>
          <Label style={{ left: 96, top: 84 }} opacity={1 - ramp(s, [b(1.7), b(2)])}>1967 · Fastback</Label>
          <Label style={{ right: 96, top: 84 }} opacity={1 - ramp(s, [b(1.7), b(2)])}>Candyapple Red</Label>
          <Line s={s} from={b(4)} to={b(6)} style={{ left: 96, bottom: 140 }}>Every legend</Line>
          <Line s={s} from={b(6)} to={b(8)} style={{ left: 96, bottom: 140 }}>is just parts.</Line>
          <PlaceTag s={s} />
          <Line s={s} from={b(58)} to={end + 0.2} size={110} style={{ left: 0, right: 0, bottom: 150, textAlign: "center" }}>Beat it.</Line>
          <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash, pointerEvents: "none" }} />
          <FilmFinish frame={frame} />
          <Watermark opacity={1 - ramp(s, [end - 0.3, end])} dark={0} />
        </>
      ) : (
        <>
          <BreedersOutro t={s - end} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center", fontFamily: MONO, fontSize: 15, letterSpacing: "0.04em", color: "#9A9187", opacity: ramp(s - end, [0.6, 1.0]) * (1 - ramp(s - end, [OUTRO_LEN - 0.4, OUTRO_LEN])) }}>
            Car model: {CREDIT}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
