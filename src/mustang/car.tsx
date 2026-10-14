// The '67 Fastback, built part by part so it can come apart. Every assembly is its own group with a rest pose and an
// exploded offset; `explode(id)` returns how far (0..1) that assembly has travelled.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { buildBody, depthMaterial, DIM, PART, paintMaterial } from "./body";

export const PAINT = "#A0121B"; // Candyapple Red

// ---------- shared materials ----------
const useMats = () =>
  useMemo(() => {
    const chrome = new THREE.MeshPhysicalMaterial({ color: "#F2F2F2", metalness: 1, roughness: 0.08 });
    const satin = new THREE.MeshPhysicalMaterial({ color: "#B9BCC0", metalness: 1, roughness: 0.32 });
    const rubber = new THREE.MeshPhysicalMaterial({ color: "#1A1A1B", roughness: 0.82, metalness: 0, sheen: 0.4, sheenColor: new THREE.Color("#4A4A4A") });
    const black = new THREE.MeshPhysicalMaterial({ color: "#121213", roughness: 0.55, metalness: 0.2 });
    const iron = new THREE.MeshPhysicalMaterial({ color: "#2E3033", roughness: 0.6, metalness: 0.6 });
    const engineBlue = new THREE.MeshPhysicalMaterial({ color: "#1F3E73", roughness: 0.42, metalness: 0.25, clearcoat: 0.5 });
    const vinyl = new THREE.MeshPhysicalMaterial({ color: "#1C1A1A", roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 });
    const red = new THREE.MeshPhysicalMaterial({ color: "#B3121C", roughness: 0.2, metalness: 0, clearcoat: 1, transmission: 0, emissive: new THREE.Color("#FF1A1A"), emissiveIntensity: 0 });
    const lens = new THREE.MeshPhysicalMaterial({ color: "#F4F1E8", roughness: 0.05, metalness: 0, clearcoat: 1, emissive: new THREE.Color("#FFF4DC"), emissiveIntensity: 0 });
    const grille = new THREE.MeshPhysicalMaterial({ color: "#0E0E0F", roughness: 0.6, metalness: 0.3 });
    const paint = new THREE.MeshPhysicalMaterial({ color: PAINT, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.035 });
    const liner = new THREE.MeshStandardMaterial({ color: "#0B0B0C", roughness: 0.9, side: THREE.DoubleSide });
    return { chrome, satin, rubber, black, iron, engineBlue, vinyl, red, lens, grille, paint, liner };
  }, []);
type Mats = ReturnType<typeof useMats>;

const rbox = (w: number, h: number, d: number, r = 0.02, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
type V3 = [number, number, number];

// ---------- body panels (one lofted surface, cut by part in the shader) ----------
const BODY = { geo: null as THREE.BufferGeometry | null };
const bodyGeo = () => (BODY.geo ??= buildBody());
const Panel: React.FC<{ part: number; lights?: number }> = ({ part }) => {
  const geo = useMemo(bodyGeo, []);
  const mat = useMemo(() => paintMaterial(PAINT, part), [part]);
  const depth = useMemo(() => depthMaterial(part), [part]);
  return <mesh geometry={geo} material={mat} customDepthMaterial={depth} castShadow receiveShadow />;
};

// ---------- wheel ----------
const tyreGeo = () => {
  const R = DIM.tyreR, rIn = 0.19, w = 0.1;
  const pts: THREE.Vector2[] = [];
  const prof: [number, number][] = [
    [rIn, -w * 0.82], [rIn + 0.02, -w * 0.95], [R - 0.06, -w], [R - 0.02, -w * 0.93], [R - 0.004, -w * 0.72], [R, -w * 0.4],
    [R + 0.002, 0], [R, w * 0.4], [R - 0.004, w * 0.72], [R - 0.02, w * 0.93], [R - 0.06, w], [rIn + 0.02, w * 0.95], [rIn, w * 0.82],
  ];
  prof.forEach(([r, y]) => pts.push(new THREE.Vector2(r, y)));
  const g = new THREE.LatheGeometry(new THREE.SplineCurve(pts).getPoints(60), 72);
  g.rotateX(Math.PI / 2);
  return g;
};
const rimGeo = () => {
  const pts: [number, number][] = [
    [0.0, 0.07], [0.05, 0.068], [0.055, 0.05], [0.11, 0.045], [0.15, 0.035], [0.165, 0.055], [0.178, 0.075], [0.19, 0.078], [0.192, 0.06], [0.185, -0.08],
  ];
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  g.rotateX(Math.PI / 2);
  return g;
};
// Magnum-500-style wheel: chrome lip, five broad chrome spokes over a dark dish, chrome cap
const spokeGeo = () => {
  const sh = new THREE.Shape();
  sh.moveTo(0.05, -0.022);
  sh.lineTo(0.15, -0.034);
  sh.quadraticCurveTo(0.162, 0, 0.15, 0.034);
  sh.lineTo(0.05, 0.022);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3 });
  return g;
};
export const Wheel: React.FC<{ m: Mats; side: 1 | -1; spin: number }> = ({ m, side, spin }) => {
  const tyre = useMemo(tyreGeo, []);
  const rim = useMemo(rimGeo, []);
  const spoke = useMemo(spokeGeo, []);
  const lip = useMemo(() => new THREE.TorusGeometry(0.178, 0.011, 12, 72), []);
  return (
    <group scale={[1, 1, side]}>
      <group rotation={[0, 0, -spin]}>
        <mesh geometry={tyre} material={m.rubber} castShadow receiveShadow />
        <mesh geometry={rim} material={m.iron} castShadow receiveShadow />
        <mesh geometry={lip} material={m.chrome} position={[0, 0, 0.074]} />
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} geometry={spoke} material={m.chrome} position={[0, 0, 0.04]} rotation={[0, 0, (i / 5) * Math.PI * 2]} />
        ))}
        <mesh position={[0, 0, 0.066]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
          <cylinderGeometry args={[0.052, 0.058, 0.03, 40]} />
        </mesh>
        <mesh position={[0, 0, 0.082]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
          <cylinderGeometry args={[0.026, 0.026, 0.004, 32]} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- nose: grille, headlights, bumper ----------
const Nose: React.FC<{ m: Mats; lights: number }> = ({ m, lights }) => {
  const grille = useMemo(() => rbox(0.03, 0.27, 1.0, 0.06, 6), []);
  const surround = useMemo(() => {
    const s = new THREE.Shape();
    const rr = (sh: THREE.Shape | THREE.Path, w: number, h: number, r: number) => {
      sh.moveTo(-w / 2 + r, -h / 2);
      sh.lineTo(w / 2 - r, -h / 2);
      sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      sh.lineTo(w / 2, h / 2 - r);
      sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      sh.lineTo(-w / 2 + r, h / 2);
      sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      sh.lineTo(-w / 2, -h / 2 + r);
      sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    };
    rr(s, 1.04, 0.31, 0.08);
    const hole = new THREE.Path();
    rr(hole, 1.0, 0.27, 0.065);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 });
    g.rotateY(Math.PI / 2);
    return g;
  }, []);
  const bezel = useMemo(() => new THREE.TorusGeometry(0.085, 0.014, 16, 48), []);
  const bumper = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.12, 0.42, -0.86), new THREE.Vector3(2.3, 0.42, -0.74), new THREE.Vector3(2.39, 0.42, -0.3),
      new THREE.Vector3(2.4, 0.42, 0), new THREE.Vector3(2.39, 0.42, 0.3), new THREE.Vector3(2.3, 0.42, 0.74), new THREE.Vector3(2.12, 0.42, 0.86),
    ]);
    const shape = new THREE.Shape();
    shape.moveTo(-0.045, 0);
    shape.quadraticCurveTo(-0.05, 0.03, -0.02, 0.035);
    shape.lineTo(0.02, 0.03);
    shape.quadraticCurveTo(0.03, 0, 0.02, -0.03);
    shape.lineTo(-0.02, -0.035);
    shape.quadraticCurveTo(-0.05, -0.03, -0.045, 0);
    return new THREE.ExtrudeGeometry(shape, { steps: 120, extrudePath: curve, bevelEnabled: false });
  }, []);
  m.lens.emissiveIntensity = lights * 2.4;
  return (
    <group>
      <mesh geometry={grille} material={m.grille} position={[2.335, 0.62, 0]} />
      {[-0.32, -0.16, 0, 0.16, 0.32].map((z, i) => (
        <mesh key={i} position={[2.352, 0.62, z * 1.3]} material={m.black}>
          <boxGeometry args={[0.006, 0.24, 0.008]} />
        </mesh>
      ))}
      <mesh geometry={surround} material={m.chrome} position={[2.345, 0.62, 0]} />
      {/* corral bar and centre emblem */}
      <mesh position={[2.36, 0.62, 0]} material={m.chrome}>
        <boxGeometry args={[0.01, 0.012, 0.62]} />
      </mesh>
      <mesh position={[2.362, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
        <cylinderGeometry args={[0.05, 0.05, 0.012, 32]} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[2.33, 0.69, s * 0.655]}>
          <mesh geometry={bezel} material={m.chrome} rotation={[0, Math.PI / 2, 0]} />
          <mesh material={m.lens} rotation={[0, 0, Math.PI / 2]} position={[0.006, 0, 0]}>
            <cylinderGeometry args={[0.078, 0.078, 0.02, 40]} />
          </mesh>
        </group>
      ))}
      <mesh geometry={bumper} material={m.chrome} castShadow />
    </group>
  );
};

// ---------- tail: three-bar lamps, fuel cap, bumper ----------
const Tail: React.FC<{ m: Mats; lights: number }> = ({ m, lights }) => {
  const seg = useMemo(() => rbox(0.03, 0.15, 0.125, 0.025, 4), []);
  const bez = useMemo(() => rbox(0.02, 0.19, 0.44, 0.04, 4), []);
  const bumper = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.08, 0.46, -0.84), new THREE.Vector3(-2.28, 0.46, -0.74), new THREE.Vector3(-2.37, 0.46, -0.3),
      new THREE.Vector3(-2.38, 0.46, 0), new THREE.Vector3(-2.37, 0.46, 0.3), new THREE.Vector3(-2.28, 0.46, 0.74), new THREE.Vector3(-2.08, 0.46, 0.84),
    ]);
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.035, 0.03, 0, Math.PI * 2, false, 0);
    return new THREE.ExtrudeGeometry(shape, { steps: 120, extrudePath: curve, bevelEnabled: false });
  }, []);
  m.red.emissiveIntensity = 0.15 + lights * 1.6;
  return (
    <group>
      {[1, -1].map((s) => (
        <group key={s} position={[-2.335, 0.75, s * 0.44]}>
          <mesh geometry={bez} material={m.chrome} />
          {[-1, 0, 1].map((k) => (
            <mesh key={k} geometry={seg} material={m.red} position={[-0.012, 0, k * 0.14]} />
          ))}
        </group>
      ))}
      <mesh position={[-2.34, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 40]} />
      </mesh>
      <mesh geometry={bumper} material={m.chrome} castShadow />
    </group>
  );
};

// ---------- wheel-well liners (seen through the cut arches) ----------
const Liners: React.FC<{ m: Mats }> = ({ m }) => {
  const g = useMemo(() => {
    const geo = new THREE.CylinderGeometry(DIM.archR - 0.005, DIM.archR - 0.005, 0.42, 48, 1, true, -Math.PI * 0.1, Math.PI * 1.2);
    geo.rotateX(Math.PI / 2);
    geo.rotateZ(Math.PI * 0.5 - Math.PI * 0.6 + Math.PI / 2);
    return geo;
  }, []);
  return (
    <group>
      {[DIM.frontAxle, DIM.rearAxle].flatMap((x) => [1, -1].map((s) => <mesh key={`${x}${s}`} geometry={g} material={m.liner} position={[x, DIM.archY, s * 0.68]} />))}
    </group>
  );
};

// ---------- cabin ----------
const Seat: React.FC<{ m: Mats; position: V3; width?: number }> = ({ m, position, width = 0.5 }) => {
  const base = useMemo(() => rbox(0.5, 0.14, width, 0.06, 4), [width]);
  const back = useMemo(() => rbox(0.13, 0.55, width - 0.04, 0.06, 4), [width]);
  return (
    <group position={position}>
      <mesh geometry={base} material={m.vinyl} castShadow />
      <mesh geometry={back} material={m.vinyl} position={[-0.24, 0.27, 0]} rotation={[0, 0, 0.18]} castShadow />
    </group>
  );
};
const Cabin: React.FC<{ m: Mats }> = ({ m }) => {
  const dash = useMemo(() => rbox(0.3, 0.2, 1.5, 0.06, 4), []);
  return (
    <group>
      <Seat m={m} position={[-0.25, 0.42, 0.36]} />
      <Seat m={m} position={[-0.25, 0.42, -0.36]} />
      <Seat m={m} position={[-0.95, 0.42, 0]} width={1.25} />
      <mesh geometry={dash} material={m.vinyl} position={[0.42, 0.82, 0]} />
      <group position={[0.16, 0.86, -0.36]} rotation={[0, Math.PI / 2, 0.45]}>
        <mesh material={m.black}>
          <torusGeometry args={[0.19, 0.016, 12, 48]} />
        </mesh>
        <mesh material={m.satin}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 20]} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- the V8 and drivetrain ----------
const Engine: React.FC<{ m: Mats }> = ({ m }) => {
  const block = useMemo(() => rbox(0.6, 0.34, 0.42, 0.04, 3), []);
  const cover = useMemo(() => rbox(0.56, 0.06, 0.13, 0.025, 4), []);
  const fin = useMemo(() => rbox(0.5, 0.012, 0.01, 0.004, 2), []);
  return (
    <group position={[1.55, 0.56, 0]}>
      <mesh geometry={block} material={m.engineBlue} castShadow receiveShadow />
      {[1, -1].map((s) => (
        <group key={s} position={[0, 0.2, s * 0.17]} rotation={[s * 0.55, 0, 0]}>
          <mesh geometry={cover} material={m.chrome} castShadow />
          {[-0.035, 0, 0.035].map((z) => (
            <mesh key={z} geometry={fin} material={m.satin} position={[0, 0.034, z]} />
          ))}
        </group>
      ))}
      {/* air cleaner */}
      <mesh position={[0.02, 0.3, 0]} material={m.chrome} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.07, 56]} />
      </mesh>
      <mesh position={[0.02, 0.34, 0]} material={m.satin}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 24]} />
      </mesh>
      {/* headers */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, -0.05, s * 0.27]} material={m.iron}>
          <boxGeometry args={[0.5, 0.07, 0.05]} />
        </mesh>
      ))}
      {/* pulleys, fan, radiator */}
      <mesh position={[0.33, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.satin}>
        <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
      </mesh>
      <mesh position={[0.38, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} material={m.black}>
        <cylinderGeometry args={[0.2, 0.2, 0.012, 7]} />
      </mesh>
      <mesh position={[0.5, 0.06, 0]} material={m.black} castShadow>
        <boxGeometry args={[0.05, 0.42, 0.72]} />
      </mesh>
      {/* gearbox */}
      <mesh position={[-0.45, -0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={m.satin} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.36, 28]} />
      </mesh>
    </group>
  );
};
const Drivetrain: React.FC<{ m: Mats }> = ({ m }) => (
  <group>
    {/* driveshaft */}
    <mesh position={[-0.3, 0.33, 0]} rotation={[0, 0, Math.PI / 2]} material={m.iron} castShadow>
      <cylinderGeometry args={[0.035, 0.035, 2.0, 20]} />
    </mesh>
    {/* rear axle and pumpkin */}
    <mesh position={[DIM.rearAxle, DIM.tyreR, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.iron} castShadow>
      <cylinderGeometry args={[0.045, 0.045, 1.36, 24]} />
    </mesh>
    <mesh position={[DIM.rearAxle + 0.02, DIM.tyreR, 0]} material={m.iron} castShadow>
      <sphereGeometry args={[0.14, 32, 20]} />
    </mesh>
    {/* leaf springs */}
    {[1, -1].map((s) => (
      <mesh key={s} position={[DIM.rearAxle, 0.27, s * 0.55]} material={m.black} castShadow>
        <boxGeometry args={[1.2, 0.03, 0.06]} />
      </mesh>
    ))}
    {/* dual exhaust */}
    {[1, -1].map((s) => (
      <group key={s}>
        <mesh position={[-0.6, 0.24, s * 0.3]} rotation={[0, 0, Math.PI / 2]} material={m.iron}>
          <cylinderGeometry args={[0.028, 0.028, 2.6, 16]} />
        </mesh>
        <mesh position={[-2.05, 0.27, s * 0.3]} rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
          <cylinderGeometry args={[0.034, 0.034, 0.3, 20]} />
        </mesh>
      </group>
    ))}
  </group>
);
const FrontSuspension: React.FC<{ m: Mats }> = ({ m }) => {
  const coil = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      pts.push(new THREE.Vector3(Math.cos(t * Math.PI * 12) * 0.06, t * 0.3, Math.sin(t * Math.PI * 12) * 0.06));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.012, 8);
  }, []);
  return (
    <group>
      {[1, -1].map((s) => (
        <group key={s} position={[DIM.frontAxle, 0.5, s * 0.5]}>
          <mesh geometry={coil} material={m.satin} castShadow />
          <mesh position={[0, -0.12, 0.05 * s]} material={m.black}>
            <boxGeometry args={[0.1, 0.03, 0.3]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
const Floor: React.FC<{ m: Mats }> = ({ m }) => {
  const pan = useMemo(() => rbox(3.9, 0.05, 1.5, 0.02, 2), []);
  return <mesh geometry={pan} material={m.black} position={[0, 0.24, 0]} receiveShadow castShadow />;
};

// ---------- assembly ----------
export type PartId =
  | "body" | "hood" | "deck" | "doorL" | "doorR" | "wheelFL" | "wheelFR" | "wheelRL" | "wheelRR"
  | "engine" | "cabin" | "nose" | "tail" | "drivetrain" | "suspension";
// where each assembly flies to when the car comes apart (offset metres, extra rotation)
export const EXPLODE: Record<PartId, { d: V3; r?: V3 }> = {
  body: { d: [0, 1.25, 0] },
  hood: { d: [0.35, 2.35, 0], r: [0, 0, -0.18] },
  deck: { d: [-0.4, 1.95, 0], r: [0, 0, 0.2] },
  doorL: { d: [0, 1.25, 1.05] },
  doorR: { d: [0, 1.25, -1.05] },
  nose: { d: [0.75, 1.25, 0] },
  tail: { d: [-0.75, 1.25, 0] },
  engine: { d: [0.15, 0.62, 0] },
  cabin: { d: [0, 0.5, 0] },
  wheelFL: { d: [0, 0, 0.75] },
  wheelFR: { d: [0, 0, -0.75] },
  wheelRL: { d: [0, 0, 0.75] },
  wheelRR: { d: [0, 0, -0.75] },
  drivetrain: { d: [0, -0.0, 0] },
  suspension: { d: [0, 0.2, 0] },
};

const Part: React.FC<{ id: PartId; k: number; children: React.ReactNode }> = ({ id, k, children }) => {
  const e = EXPLODE[id];
  const r = e.r ?? [0, 0, 0];
  // rotations pivot about the part's own neighbourhood: good enough for lids that tilt as they lift
  return (
    <group position={[e.d[0] * k, e.d[1] * k, e.d[2] * k]} rotation={[r[0] * k, r[1] * k, r[2] * k]}>
      {children}
    </group>
  );
};

export const Mustang: React.FC<{ explode?: (id: PartId) => number; spin?: number; lights?: number; steer?: number }> = ({ explode = () => 0, spin = 0, lights = 0, steer = 0 }) => {
  const m = useMats();
  const wheel = (id: PartId, x: number, s: 1 | -1, front: boolean) => (
    <Part id={id} k={explode(id)}>
      <group position={[x, DIM.tyreR, s * DIM.track]} rotation={[0, front ? steer : 0, 0]}>
        <Wheel m={m} side={s} spin={spin} />
      </group>
    </Part>
  );
  return (
    <group>
      <Part id="body" k={explode("body")}>
        <Panel part={PART.shell} />
        <Liners m={m} />
      </Part>
      <Part id="hood" k={explode("hood")}>
        <Panel part={PART.hood} />
      </Part>
      <Part id="deck" k={explode("deck")}>
        <Panel part={PART.deck} />
      </Part>
      <Part id="doorL" k={explode("doorL")}>
        <Panel part={PART.doorL} />
      </Part>
      <Part id="doorR" k={explode("doorR")}>
        <Panel part={PART.doorR} />
      </Part>
      <Part id="nose" k={explode("nose")}>
        <Nose m={m} lights={lights} />
      </Part>
      <Part id="tail" k={explode("tail")}>
        <Tail m={m} lights={lights} />
      </Part>
      <Part id="engine" k={explode("engine")}>
        <Engine m={m} />
      </Part>
      <Part id="cabin" k={explode("cabin")}>
        <Cabin m={m} />
      </Part>
      <Part id="suspension" k={explode("suspension")}>
        <FrontSuspension m={m} />
      </Part>
      <Part id="drivetrain" k={explode("drivetrain")}>
        <Drivetrain m={m} />
        <Floor m={m} />
      </Part>
      {wheel("wheelFL", DIM.frontAxle, 1, true)}
      {wheel("wheelFR", DIM.frontAxle, -1, true)}
      {wheel("wheelRL", DIM.rearAxle, 1, false)}
      {wheel("wheelRR", DIM.rearAxle, -1, false)}
    </group>
  );
};
