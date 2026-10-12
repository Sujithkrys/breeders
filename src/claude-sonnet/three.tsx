// The Sonnet film's 3D studio (Three.js inside Remotion, real-time, no offline renders): Claude's mark extruded from its
// own vector shape into a matte clay ceramic object, thin sheets of real everyday work (a memo, an email, a deck, a
// spreadsheet, a research summary) with crisp canvas-drawn content, and sculpted benchmark bars. Warm studio light,
// soft shadows caught on an invisible wall so the cream paper background stays CSS.
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { SANS } from "./type";

export const W3 = 1920;
export const H3 = 1080;

// ---------- studio ----------
const Env: React.FC<{ intensity?: number }> = ({ intensity = 0.55 }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = intensity;
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.type = THREE.VSMShadowMap;
  }, [gl, scene, intensity]);
  return null;
};
export const Camera: React.FC<{ pos: [number, number, number]; target: [number, number, number]; fov?: number }> = ({ pos, target, fov = 30 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = fov;
  cam.near = 0.05;
  cam.far = 200;
  cam.position.set(...pos);
  cam.lookAt(...target);
  cam.updateProjectionMatrix();
  return null;
};
export const Studio: React.FC<{ children: React.ReactNode; wallZ?: number; shadow?: number; keyPos?: [number, number, number]; floorY?: number }> = ({ children, wallZ = -3, shadow = 0.22, keyPos = [-5, 8, 7], floorY }) => (
  <ThreeCanvas width={W3} height={H3} shadows gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
    <Env />
    <hemisphereLight args={["#FFFFFF", "#D9CBB8", 0.3]} />
    <directionalLight castShadow position={keyPos} intensity={3.0} color="#FFF1E2" shadow-mapSize={[2048, 2048]} shadow-radius={16} shadow-blurSamples={20} shadow-bias={-0.0006} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={0.5} shadow-camera-far={40} />
    <directionalLight position={[7, 1, 4]} intensity={0.35} color="#FFE3D4" />
    <directionalLight position={[4, 5, -6]} intensity={1.6} color="#FFE0CC" />
    <mesh receiveShadow position={[0, 0, wallZ]}>
      <planeGeometry args={[80, 80]} />
      <shadowMaterial opacity={shadow} />
    </mesh>
    {floorY !== undefined ? (
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={shadow * 0.9} />
      </mesh>
    ) : null}
    {children}
  </ThreeCanvas>
);

// ---------- materials ----------
export const clayMat = () => new THREE.MeshPhysicalMaterial({ color: "#B5522F", roughness: 0.5, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.28, sheen: 0.5, sheenColor: new THREE.Color("#F2B49A"), sheenRoughness: 0.5 });
export const stoneMat = () => new THREE.MeshPhysicalMaterial({ color: "#BDB6A8", roughness: 0.62, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.4 });

// ---------- Claude's mark in 3D ----------
// Sculpted from clean geometry as ONE solid: twelve rounded rays, each with its own angle, length and width like the
// drawn mark. The outline runs out along each ray, round its tip, and back in to where its edge meets the next ray's
// edge near the centre, so the mark extrudes as a single continuous object (no stacked pieces, no seams).
let MARK_GEO: THREE.BufferGeometry | null = null;
const RAYS: [number, number, number][] = [
  [0, 1.0, 0.17], [31, 0.86, 0.16], [58, 0.97, 0.18], [92, 0.9, 0.165], [121, 1.0, 0.17], [149, 0.84, 0.16],
  [181, 0.98, 0.18], [209, 0.88, 0.16], [238, 1.0, 0.17], [268, 0.85, 0.165], [299, 0.96, 0.18], [329, 0.9, 0.16],
];
// where ray i's left edge (its +normal side) meets ray j's right edge (its −normal side)
const notch = (i: number, j: number) => {
  const [ai, , wi] = RAYS[i];
  const [aj, , wj] = RAYS[j];
  const ti = (ai * Math.PI) / 180, tj = (aj * Math.PI) / 180;
  const di = [Math.cos(ti), Math.sin(ti)], ni = [-Math.sin(ti), Math.cos(ti)];
  const dj = [Math.cos(tj), Math.sin(tj)], nj = [-Math.sin(tj), Math.cos(tj)];
  // ni*wi/2 + s*di = -nj*wj/2 + u*dj  →  s*di - u*dj = -nj*wj/2 - ni*wi/2
  const rx = -nj[0] * wj / 2 - ni[0] * wi / 2, ry = -nj[1] * wj / 2 - ni[1] * wi / 2;
  const det = di[0] * -dj[1] - -dj[0] * di[1];
  const sI = (rx * -dj[1] - -dj[0] * ry) / det;
  return [ni[0] * wi / 2 + sI * di[0], ni[1] * wi / 2 + sI * di[1]];
};
const markGeo = () => {
  if (MARK_GEO) return MARK_GEO;
  const n = RAYS.length;
  const sh = new THREE.Shape();
  RAYS.forEach(([deg, len, wid], i) => {
    const t = (deg * Math.PI) / 180;
    const d = [Math.cos(t), Math.sin(t)], nn = [-Math.sin(t), Math.cos(t)];
    const r = wid / 2;
    const start = notch((i - 1 + n) % n, i); // on this ray's right edge
    if (i === 0) sh.moveTo(start[0], start[1]);
    else sh.lineTo(start[0], start[1]);
    const tipC = [d[0] * (len - r), d[1] * (len - r)];
    sh.lineTo(tipC[0] - nn[0] * r, tipC[1] - nn[1] * r);
    sh.absarc(tipC[0], tipC[1], r, t - Math.PI / 2, t + Math.PI / 2, false);
    const end = notch(i, (i + 1) % n); // on this ray's left edge
    sh.lineTo(end[0], end[1]);
  });
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.04, bevelSegments: 8, curveSegments: 28 });
  geo.center();
  geo.scale(0.5, 0.5, 0.5);
  geo.computeVertexNormals();
  MARK_GEO = geo;
  return geo;
};
export const Mark3D: React.FC<{ size?: number; position?: [number, number, number]; rotation?: [number, number, number]; opacity?: number; shadow?: boolean }> = ({ size = 3, position = [0, 0, 0], rotation = [0, 0, 0], opacity = 1, shadow = true }) => {
  const geo = useMemo(markGeo, []);
  const mat = useMemo(() => {
    const m = clayMat();
    m.transparent = true;
    return m;
  }, []);
  mat.opacity = opacity;
  mat.depthWrite = opacity > 0.99;
  return <mesh geometry={geo} material={mat} castShadow={shadow} receiveShadow position={position} rotation={rotation} scale={[size, size, size]} />;
};
// a rounded clay tile (the "cost" tokens)
export const Tile3D: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; opacity?: number; size?: number }> = ({ position, rotation = [0, 0, 0], opacity = 1, size = 0.62 }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(size, size, size * 0.3, 6, size * 0.12), [size]);
  const mat = useMemo(() => {
    const m = clayMat();
    m.transparent = true;
    return m;
  }, []);
  mat.opacity = opacity;
  mat.depthWrite = opacity > 0.99;
  return <mesh geometry={geo} material={mat} castShadow={opacity > 0.5} receiveShadow position={position} rotation={rotation} />;
};

// ---------- sheets of everyday work, with crisp content drawn on a canvas ----------
export type SheetKind = "memo" | "email" | "deck" | "sheet" | "research";
const INK = "#141413";
const SUB = "#6B6A64";
const LINE = "#E6E3DA";
const CLAY = "#D27454";
const drawSheet = (kind: SheetKind, cw: number, ch: number) => {
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const g = c.getContext("2d")!;
  const font = (w: number, px: number) => `${w} ${px}px ${SANS}`;
  const bar = (x: number, y: number, w: number, h = 18, col = "#DDD8CD") => {
    g.fillStyle = col;
    g.beginPath();
    g.roundRect(x, y, w, h, h / 2);
    g.fill();
  };
  g.fillStyle = kind === "deck" ? INK : "#FFFFFF";
  g.fillRect(0, 0, cw, ch);
  const P = 70;
  if (kind === "memo") {
    g.fillStyle = SUB;
    g.font = font(500, 30);
    g.fillText("MEMO", P, P + 30);
    g.fillStyle = INK;
    g.font = font(500, 84);
    g.fillText("Q4 plan", P, P + 130);
    [0.92, 0.86, 0.95, 0.7, 0.9, 0.82, 0.6].forEach((w, i) => bar(P, P + 190 + i * 46, (cw - 2 * P) * w));
    g.fillStyle = CLAY;
    g.fillRect(P, P + 190 + 7 * 46 + 20, 6, 120);
    [0.8, 0.86, 0.5].forEach((w, i) => bar(P + 30, P + 190 + 7 * 46 + 26 + i * 40, (cw - 2 * P - 30) * w));
  } else if (kind === "email") {
    g.fillStyle = INK;
    g.font = font(500, 60);
    g.fillText("Launch recap", P, P + 60);
    g.fillStyle = SUB;
    g.font = font(400, 28);
    g.fillText("To: Team", P, P + 104);
    g.fillStyle = LINE;
    g.fillRect(P, P + 132, cw - 2 * P, 2);
    [0.94, 0.88, 0.9, 0.72, 0.85, 0.5].forEach((w, i) => bar(P, P + 172 + i * 44, (cw - 2 * P) * w));
    g.fillStyle = CLAY;
    g.beginPath();
    g.roundRect(P, ch - P - 70, 190, 70, 35);
    g.fill();
    g.fillStyle = "#FFFFFF";
    g.font = font(500, 30);
    g.fillText("Send", P + 62, ch - P - 24);
  } else if (kind === "deck") {
    g.fillStyle = CLAY;
    g.font = font(500, 30);
    g.fillText("Q3 REVIEW", P, P + 40);
    g.fillStyle = "#FFFFFF";
    g.font = font(500, 84);
    g.fillText("Growth, at a", P, ch * 0.55);
    g.fillText("glance.", P, ch * 0.55 + 94);
    const bx = cw - P - 300;
    [120, 180, 260].forEach((h, i) => {
      g.fillStyle = i === 2 ? CLAY : "#4A4945";
      g.beginPath();
      g.roundRect(bx + i * 105, ch - P - h, 70, h, 8);
      g.fill();
    });
  } else if (kind === "sheet") {
    const rows = [
      ["Month", "Revenue", "Margin"],
      ["July", "412,000", "29.9%"],
      ["August", "468,000", "32.1%"],
      ["September", "531,000", "33.7%"],
      ["Q3 total", "1,411,000", "32.0%"],
    ];
    const rh = (ch - 2 * P) / rows.length;
    rows.forEach((r, i) => {
      if (i === 0) {
        g.fillStyle = "#F4F1EA";
        g.fillRect(P, P, cw - 2 * P, rh);
      }
      if (i === 4) {
        g.fillStyle = "rgba(210,116,84,0.12)";
        g.fillRect(P, P + i * rh, cw - 2 * P, rh);
      }
      g.fillStyle = LINE;
      g.fillRect(P, P + (i + 1) * rh, cw - 2 * P, 2);
      r.forEach((cell, k) => {
        g.fillStyle = i === 4 && k === 1 ? CLAY : INK;
        g.font = font(i === 0 || i === 4 ? 600 : 500, 40);
        const x = k === 0 ? P + 24 : P + (cw - 2 * P) * (k === 1 ? 0.72 : 0.97);
        g.textAlign = k === 0 ? "left" : "right";
        g.fillText(cell, x, P + i * rh + rh * 0.62);
      });
    });
    g.textAlign = "left";
  } else {
    g.fillStyle = SUB;
    g.font = font(500, 30);
    g.fillText("RESEARCH", P, P + 30);
    g.fillStyle = INK;
    g.font = font(500, 70);
    g.fillText("Market summary", P, P + 116);
    [0, 1, 2].forEach((i) => {
      g.fillStyle = CLAY;
      g.beginPath();
      g.arc(P + 10, P + 186 + i * 60, 9, 0, Math.PI * 2);
      g.fill();
      bar(P + 40, P + 176 + i * 60, (cw - 2 * P - 40) * [0.86, 0.74, 0.8][i]);
    });
    g.strokeStyle = CLAY;
    g.lineWidth = 7;
    g.lineJoin = "round";
    g.beginPath();
    const pts = [0.1, 0.25, 0.2, 0.45, 0.55, 0.8];
    pts.forEach((v, i) => {
      const x = P + ((cw - 2 * P) * i) / (pts.length - 1);
      const y = ch - P - 30 - v * 220;
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    });
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
const SHEET_PX: Record<SheetKind, [number, number]> = { memo: [900, 1160], email: [1000, 780], deck: [1280, 720], sheet: [1100, 640], research: [900, 1100] };
export const SHEET_SIZE = (kind: SheetKind, h = 1.6): [number, number] => {
  const [cw, ch] = SHEET_PX[kind];
  return [(h * cw) / ch, h];
};
// Fonts must be ready before the canvases draw: hold the frame until then.
export const useFontsReady = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("sheet fonts"));
  useEffect(() => {
    Promise.all([400, 500].map((w) => document.fonts.load(`${w} 40px ${SANS}`))).then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};
export const Sheet3D: React.FC<{ kind: SheetKind; h?: number; position?: [number, number, number]; rotation?: [number, number, number]; opacity?: number }> = ({ kind, h = 1.6, position = [0, 0, 0], rotation = [0, 0, 0], opacity = 1 }) => {
  const [w] = SHEET_SIZE(kind, h);
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, 0.02, 4, 0.01), [w, h]);
  const mats = useMemo(() => {
    const [cw, ch] = SHEET_PX[kind];
    // the printed face is unlit so its colours stay true; the paper edges take the studio light
    const face = new THREE.MeshBasicMaterial({ map: drawSheet(kind, cw, ch), color: "#F7F5F0", toneMapped: false, transparent: true });
    const edge = new THREE.MeshPhysicalMaterial({ color: kind === "deck" ? "#262522" : "#F3F0EA", roughness: 0.6, transparent: true });
    return [edge, edge, edge, edge, face, edge];
  }, [kind]);
  mats.forEach((m) => (m.opacity = opacity));
  return <mesh geometry={geo} material={mats} castShadow receiveShadow position={position} rotation={rotation} />;
};

// ---------- sculpted bar ----------
export const Bar3D: React.FC<{ h: number; x: number; hero?: boolean; w?: number; floorY?: number }> = ({ h, x, hero, w = 1.2, floorY = -1.6 }) => {
  const hh = Math.max(0.04, h);
  const geo = useMemo(() => new RoundedBoxGeometry(w, hh, w, 6, 0.12), [w, hh]);
  const mat = useMemo(() => (hero ? clayMat() : stoneMat()), [hero]);
  return <mesh geometry={geo} material={mat} castShadow receiveShadow position={[x, floorY + hh / 2, 0]} />;
};

// Where a world point lands on screen (px) for a given camera, so HTML type can sit exactly on 3D objects.
export const project = (p: [number, number, number], camPos: [number, number, number], target: [number, number, number], fov = 30) => {
  const cam = new THREE.PerspectiveCamera(fov, W3 / H3, 0.05, 200);
  cam.position.set(...camPos);
  cam.lookAt(...target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * W3, y: ((1 - v.y) / 2) * H3 };
};
