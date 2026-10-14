// The Mustang's roads, all built in code and faded into the cream page with fog:
//   track  — race-circuit asphalt, red/white kerbs, white edge lines, a red/white barrier
//   desert — two-lane blacktop with a double yellow centre line, sandy shoulders, rocks and dry grass
//   cliff  — canyon road with a steel guardrail and scanned granite cliffs on the inside of the bend
//   coast  — a road on the lip of a sea cliff that drops away into the cream
//   salt   — a dead-straight road across a white salt flat
//   hairpin — switchbacks climbing past granite cliffs
//   bridge — a deck with railings and cables over nothing
// A road is a curve on the ground; `carOn(curve, t)` places the car on it.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ModelName, Surface, SurfaceName, useModel, useSurface } from "./assets";

export const CREAM = "#FBF3E4";
type V2 = [number, number];

// ---------- curves ----------
// points are (x, z) on the ground; y is added by the road's own height
export const roadCurve = (pts: V2[], y = 0) => new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, y, z)), false, "centripetal");
export const carOn = (curve: THREE.CatmullRomCurve3, t: number, lane = 0) => {
  const p = curve.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
  const tan = curve.getTangentAt(THREE.MathUtils.clamp(t, 0, 1));
  const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  p.addScaledVector(side, lane);
  // car's nose is +x: yaw so +x points along the tangent
  const yaw = Math.atan2(-tan.z, tan.x);
  return { pos: [p.x, p.y, p.z] as [number, number, number], yaw };
};

// ---------- ribbon geometry along a curve ----------
// a strip between lateral offsets a..b (metres, + is the left side), u across 0..1, v = metres along
const ribbon = (curve: THREE.CatmullRomCurve3, a: number, b: number, segs: number, lift = 0, lateralSegs = 1, metric = false) => {
  const len = curve.getLength();
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    for (let j = 0; j <= lateralSegs; j++) {
      const u = j / lateralSegs;
      const off = a + (b - a) * u;
      pos.push(p.x + side.x * off, p.y + lift, p.z + side.z * off);
      uv.push(metric ? off : u, t * len);
    }
  }
  const R = lateralSegs + 1;
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < lateralSegs; j++) {
      const q = i * R + j;
      idx.push(q, q + 1, q + R, q + 1, q + R + 1, q + R);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

// ---------- asphalt shader: grain, wear, tyre darkening, painted lines ----------
export type LineSpec = { at: number; w: number; color: string; dash?: [number, number] }; // at: lateral offset (m)
const asphalt = (half: number, lines: LineSpec[], tone = "#55524E", surf?: Surface, gain = 1) => {
  const m = new THREE.MeshStandardMaterial({ color: tone, roughness: 1, metalness: 0, map: surf?.map ?? null, normalMap: surf?.normal ?? null, roughnessMap: surf?.rough ?? null });
  if (surf) m.normalScale.set(0.8, 0.8);
  // always win against the sand shoulder underneath
  m.polygonOffset = true;
  m.polygonOffsetFactor = -2;
  m.polygonOffsetUnits = -2;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uHalf = { value: half };
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vR;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvR = uv;");
    const lineCode = lines
      .map((l) => {
        const c = new THREE.Color(l.color);
        const dash = l.dash ? `* step(fract(vR.y / ${(l.dash[0] + l.dash[1]).toFixed(2)}), ${(l.dash[0] / (l.dash[0] + l.dash[1])).toFixed(3)})` : "";
        return `{ float d = abs(x - (${l.at.toFixed(3)})); float a = (1.0 - smoothstep(${(l.w / 2).toFixed(3)} - fw, ${(l.w / 2).toFixed(3)} + fw, d)) ${dash};
          a *= 0.88 + 0.12 * hash(floor(vR * vec2(60.0, 6.0)));
          col = mix(col, vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)}), a); }`;
      })
      .join("\n");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vR;
        uniform float uHalf;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float x = vR.x;
        float fw = fwidth(x) * 0.8;
        vec3 col = diffuseColor.rgb;
        // aggregate grain and slow patches of wear
        float g = hash(floor(vec2(x, vR.y) * 90.0));
        float patchy = vnoise(vec2(x * 0.35, vR.y * 0.12));
        col *= ${surf ? `${gain.toFixed(2)} * (0.92 + 0.16 * patchy)` : "0.8 + 0.2 * g + 0.22 * patchy"};
        // tyre streaks: long dark bands where wheels run, broken up along the road
        float streak = vnoise(vec2(x * 3.0, vR.y * 0.05));
        float lanes = exp(-pow((abs(x) - uHalf * 0.38) / 0.6, 2.0));
        col *= 1.0 - 0.22 * lanes * smoothstep(0.35, 0.8, streak);
        // rubber laid down on the racing line
        col *= 1.0 - 0.1 * exp(-pow(x / (uHalf * 0.3), 2.0));
        ${lineCode}
        diffuseColor.rgb = col;`,
      )
      .replace("#include <roughnessmap_fragment>", surf ? "#include <roughnessmap_fragment>" : "#include <roughnessmap_fragment>\nroughnessFactor = 0.82 + 0.15 * g;");
  };
  m.customProgramCacheKey = () => `asphalt-${half}-${lines.map((l) => `${l.at}${l.color}${l.dash ?? ""}`).join("|")}-${tone}-${surf ? "scan" : "proc"}-${gain}`;
  return m;
};

// red/white kerb stripes along v
const kerbMat = (stripe = 1.1) => {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vR;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvR = uv;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vR;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float s = step(0.5, fract(vR.y / ${(stripe * 2).toFixed(2)}));
        diffuseColor.rgb = mix(vec3(0.93, 0.92, 0.9), vec3(0.78, 0.07, 0.09), s);
        diffuseColor.rgb *= 0.9 + 0.1 * smoothstep(0.0, 0.25, vR.x) * smoothstep(1.0, 0.75, vR.x);`,
      );
  };
  m.customProgramCacheKey = () => `kerb-${stripe}`;
  return m;
};

const Road: React.FC<{ curve: THREE.CatmullRomCurve3; half: number; lines: LineSpec[]; segs?: number; tone?: string; surface: SurfaceName; gain?: number; wet?: boolean }> = ({ curve, half, lines, segs = 600, tone, surface, gain = 1, wet = false }) => {
  const surf = useSurface(surface);
  const geo = useMemo(() => ribbon(curve, -half, half, segs, 0.004, 8, true), [curve, half, segs]);
  const mat = useMemo(() => {
    if (!surf) return null;
    const m = asphalt(half, lines, tone ?? "#FFFFFF", surf, gain);
    if (wet) {
      // rain-soaked: the surface turns to a dark mirror that catches the sky and the car
      m.roughnessMap = null;
      m.roughness = 0.1;
      m.envMapIntensity = 1.8;
      m.normalScale.set(0.25, 0.25);
    }
    return m;
  }, [half, lines, tone, surf, gain, wet]);
  if (!mat) return null;
  return <mesh geometry={geo} material={mat} receiveShadow />;
};

// ---------- track ----------
export const TRACK = roadCurve([
  [-60, 30], [-30, 14], [-8, 4], [8, 3], [22, -6], [26, -20], [14, -30], [-6, -32], [-24, -38], [-30, -52], [-10, -62], [30, -60], [80, -58],
]);
const TRACK_LINES: LineSpec[] = [
  { at: 5.4, w: 0.22, color: "#F2F0EA" },
  { at: -5.4, w: 0.22, color: "#F2F0EA" },
];
const Barrier: React.FC<{ curve: THREE.CatmullRomCurve3; off: number; from: number; to: number }> = ({ curve, off, from, to }) => {
  const geo = useMemo(() => {
    // a thin vertical band following the curve
    const segs = 300;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const len = curve.getLength();
    for (let i = 0; i <= segs; i++) {
      const t = from + ((to - from) * i) / segs;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const q = p.clone().addScaledVector(side, off);
      pos.push(q.x, 0.25, q.z, q.x, 1.0, q.z);
      uv.push(0, t * len, 1, t * len);
    }
    for (let i = 0; i < segs; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [curve, off, from, to]);
  const mat = useMemo(() => {
    const m = kerbMat(2.4);
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
};
export const TrackWorld: React.FC = () => {
  const kerbs = useMemo(() => [ribbon(TRACK, 5.55, 6.9, 600, 0.012, 2), ribbon(TRACK, -6.9, -5.55, 600, 0.012, 2)], []);
  const km = useMemo(() => kerbMat(1.1), []);
  return (
    <group>
      <Road curve={TRACK} half={6.9} lines={TRACK_LINES} surface="track" tone="#FFFFFF" gain={2.4} />
      {kerbs.map((g, i) => (
        <mesh key={i} geometry={g} material={km} receiveShadow />
      ))}
      <Barrier curve={TRACK} off={-13} from={0.62} to={1} />
    </group>
  );
};

// ---------- desert ----------
export const DESERT = roadCurve([
  [-30, 40], [-10, 22], [4, 12], [6, 0], [-6, -14], [-4, -30], [12, -42], [14, -60], [-2, -78], [4, -100], [20, -120], [16, -150],
]);
const DESERT_LINES: LineSpec[] = [
  { at: 0.12, w: 0.11, color: "#E2A72E" },
  { at: -0.12, w: 0.11, color: "#E2A72E" },
  { at: 3.35, w: 0.14, color: "#ECEAE4" },
  { at: -3.35, w: 0.14, color: "#ECEAE4" },
];
// seeded random so every frame scatters identically
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
// sand shoulder: a soft-edged band whose colour fades into the cream ground
const sandMat = (surf: Surface) => {
  const m = new THREE.MeshStandardMaterial({ color: "#FFF4DF", roughness: 1, transparent: true, depthWrite: false, map: surf.map, normalMap: surf.normal });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uW = { value: m.userData.w ?? 7.5 };
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vR;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvR = uv;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vR;\nuniform float uW;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float edge = abs(vR.x) / uW;
        float n = hash(floor(vR * vec2(240.0, 40.0)));
        diffuseColor.a = (1.0 - smoothstep(0.55 + 0.15 * sin(vR.y * 0.7), 1.0, edge)) * 0.8;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.78, 0.64), 0.45);
        diffuseColor.rgb *= 0.95 + 0.06 * n;`,
      );
  };
  m.customProgramCacheKey = () => "sand";
  return m;
};
const Sand: React.FC<{ curve: THREE.CatmullRomCurve3; w: number; tint?: string }> = ({ curve, w, tint }) => {
  const surf = useSurface("sand");
  const geo = useMemo(() => ribbon(curve, -w, w, 600, 0.001, 8, true), [curve, w]);
  const mat = useMemo(() => {
    if (!surf) return null;
    const m = sandMat(surf);
    m.userData.w = w;
    if (tint) m.color.set(tint);
    return m;
  }, [surf, w, tint]);
  return mat ? <mesh geometry={geo} material={mat} receiveShadow /> : null;
};
// scanned models scattered with seeded randomness; each instance is a clone sharing geometry and materials
const Placed: React.FC<{ model: ModelName; items: { p: [number, number, number]; s: number; r: number }[]; tint?: string }> = ({ model, items, tint }) => {
  const g = useModel(model);
  const clones = useMemo(() => {
    if (!g) return [];
    const tinted = new Map<THREE.Material, THREE.Material>();
    return items.map(() => {
      const c = g.scene.clone();
      if (tint)
        c.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const m = mesh.material as THREE.MeshStandardMaterial;
          if (!tinted.has(m)) {
            const t = m.clone();
            t.color.set(tint);
            tinted.set(m, t);
          }
          mesh.material = tinted.get(m)!;
        });
      return c;
    });
  }, [g, items, tint]);
  return (
    <group>
      {clones.map((c, i) => (
        <primitive key={i} object={c} position={items[i].p} scale={items[i].s} rotation={[0, items[i].r, 0]} />
      ))}
    </group>
  );
};
const along = (curve: THREE.CatmullRomCurve3, seed: number, n: number, band: [number, number], scale: [number, number], from = 0, to = 1, sideOnly?: 1 | -1) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const t = from + r() * (to - from);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const sgn = sideOnly ?? (r() < 0.5 ? 1 : -1);
    const q = p.addScaledVector(side, sgn * (band[0] + r() * (band[1] - band[0])));
    return { p: [q.x, 0, q.z] as [number, number, number], s: scale[0] + r() * r() * (scale[1] - scale[0]), r: r() * Math.PI * 2 };
  });
};
export const DesertWorld: React.FC = () => {
  const rocks = useMemo(() => along(DESERT, 11, 70, [4.4, 7], [0.06, 0.3]), []);
  const rocks2 = useMemo(() => along(DESERT, 12, 50, [4.4, 7], [0.05, 0.22]), []);
  return (
    <group>
      <Sand curve={DESERT} w={7.5} />
      <Road curve={DESERT} half={3.8} lines={DESERT_LINES} surface="road" tone="#B8B3AC" />
      <Placed model="boulder2" items={rocks} />
      <Placed model="boulder4" items={rocks2} />
    </group>
  );
};

// ---------- cliff ----------
export const CLIFF = roadCurve([
  [-26, 24], [-14, 14], [-4, 8], [6, 4], [14, -4], [12, -14], [2, -20], [-8, -26], [-6, -36], [6, -44],
]);
const CLIFF_LINES: LineSpec[] = [
  { at: 0.12, w: 0.11, color: "#E2A72E" },
  { at: -0.12, w: 0.11, color: "#E2A72E" },
  { at: 3.2, w: 0.14, color: "#ECEAE4" },
  { at: -3.2, w: 0.14, color: "#ECEAE4" },
];
const Guardrail: React.FC<{ curve: THREE.CatmullRomCurve3; off: number }> = ({ curve, off }) => {
  const { rail, posts } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const posts: THREE.Vector3[] = [];
    const len = curve.getLength();
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      pts.push(p.clone().addScaledVector(side, off).setY(0.62));
    }
    for (let s = 0; s < len; s += 2.2) {
      const t = s / len;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      posts.push(p.clone().addScaledVector(side, off + 0.12));
    }
    const shape = new THREE.Shape();
    shape.moveTo(-0.16, -0.02);
    shape.lineTo(-0.06, -0.035);
    shape.lineTo(0.06, -0.035);
    shape.lineTo(0.16, -0.02);
    shape.lineTo(0.16, 0.02);
    shape.lineTo(0.06, 0.035);
    shape.lineTo(-0.06, 0.035);
    shape.lineTo(-0.16, 0.02);
    const rail = new THREE.ExtrudeGeometry(shape, { steps: 400, extrudePath: new THREE.CatmullRomCurve3(pts), bevelEnabled: false });
    return { rail, posts };
  }, [curve, off]);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C9CDD1", metalness: 0.85, roughness: 0.35 }), []);
  const postGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.75, 0.1), []);
  return (
    <group>
      <mesh geometry={rail} material={steel} castShadow receiveShadow />
      {posts.map((p, i) => (
        <mesh key={i} geometry={postGeo} material={steel} position={[p.x, 0.37, p.z]} castShadow />
      ))}
    </group>
  );
};
export const CliffWorld: React.FC = () => {
  const cliffs = useMemo(() => {
    const out: { p: [number, number, number]; s: number; r: number }[] = [];
    for (let t = 0.26; t < 0.66; t += 0.07) {
      const p = CLIFF.getPointAt(t);
      const tan = CLIFF.getTangentAt(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const q = p.addScaledVector(side, 9.5);
      // face the cliff's front (its -z side) toward the road
      out.push({ p: [q.x, -0.4, q.z], s: 1.1 + 0.25 * Math.sin(t * 40), r: Math.atan2(-side.x, -side.z) });
    }
    return out;
  }, []);
  const boulders = useMemo(() => along(CLIFF, 51, 26, [4.2, 6.5], [0.25, 0.7], 0.2, 0.7, 1), []);
  return (
    <group>
      <Sand curve={CLIFF} w={5.2} />
      <Road curve={CLIFF} half={3.6} lines={CLIFF_LINES} surface="road" tone="#B8B3AC" />
      <Guardrail curve={CLIFF} off={-4.3} />
      <Placed model="cliff2" items={cliffs.filter((_, i) => i % 2 === 0)} />
      <Placed model="cliff1" items={cliffs.filter((_, i) => i % 2 === 1)} />
      <Placed model="boulder4" items={boulders} />

    </group>
  );
};


// ---------- coast ----------
export const COAST = roadCurve([
  [-60, 10], [-30, 2], [-8, -2], [12, -1], [34, 4], [56, 2], [80, -6],
]);
const COAST_LINES: LineSpec[] = CLIFF_LINES;
export const CoastWorld: React.FC = () => {
  const cliffs = useMemo(() => {
    const out: { p: [number, number, number]; s: number; r: number }[] = [];
    [0.18, 0.62].forEach((t) => {
      const p = COAST.getPointAt(t);
      const tan = COAST.getTangentAt(t);
      const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      // the cliff's top sits just under the road's right edge; its face drops into the fog
      const q = p.addScaledVector(side, -12);
      out.push({ p: [q.x, -9.9, q.z], s: 1, r: Math.atan2(tan.x, tan.z) + Math.PI / 2 });
    });
    return out;
  }, []);
  return (
    <group>
      <Sand curve={COAST} w={5.2} />
      <Road curve={COAST} half={3.6} lines={COAST_LINES} surface="road" tone="#B8B3AC" />
      <Guardrail curve={COAST} off={-4.3} />
      <Placed model="coast" items={cliffs} />
      <Placed model="boulder2" items={along(COAST, 71, 18, [4.6, 7], [0.15, 0.45], 0, 1, 1)} />
    </group>
  );
};

// ---------- salt flat ----------
export const SALT = roadCurve([
  [-200, 0], [-60, 0], [0, 0], [60, 0], [200, 0],
]);
const SALT_LINES: LineSpec[] = [
  { at: 0, w: 0.14, color: "#E2A72E", dash: [3, 6] },
  { at: 3.35, w: 0.14, color: "#ECEAE4" },
  { at: -3.35, w: 0.14, color: "#ECEAE4" },
];
const saltMat = () => {
  const m = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.95, transparent: true, depthWrite: false });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vW;").replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vW;\nfloat hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // polygon crust: cells of salt with darker cracks between them
        vec2 g = vW.xz * 0.55; vec2 i = floor(g); vec2 f = fract(g); float d1 = 9.0, d2 = 9.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
          vec2 o = vec2(float(x), float(y)); vec2 c = o + vec2(hash(i + o), hash(i + o + 7.1)) - f; float d = dot(c, c);
          if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
        }
        float crack = 1.0 - smoothstep(0.0, 0.06, sqrt(d2) - sqrt(d1));
        diffuseColor.rgb = mix(vec3(0.97, 0.95, 0.91), vec3(0.78, 0.74, 0.68), crack * 0.6);
        float r = length(vW.xz - vec2(0.0, 0.0));
        diffuseColor.a = 1.0 - smoothstep(30.0, 90.0, abs(vW.z) * 1.6 + abs(vW.x) * 0.25);`,
      );
  };
  m.customProgramCacheKey = () => "salt";
  return m;
};
export const SaltWorld: React.FC = () => {
  const mat = useMemo(saltMat, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]} material={mat} receiveShadow>
        <planeGeometry args={[400, 200]} />
      </mesh>
      <Road curve={SALT} half={3.8} lines={SALT_LINES} surface="road" tone="#B8B3AC" />
    </group>
  );
};

// ---------- hairpins ----------
export const HAIRPIN = roadCurve([
  [-60, 46], [-20, 42], [18, 38], [32, 27], [18, 16], [-18, 12], [-32, 1], [-18, -10], [18, -14], [32, -25], [18, -36], [-20, -40], [-60, -44],
]);
export const HairpinWorld: React.FC = () => {
  const cliffs = useMemo(() => {
    const pts: [number, number, number][] = [[0, 0, 27], [0, 0, 1], [0, 0, -25]];
    return pts.map((p, i) => ({ p: [p[0], -0.3, p[2]] as [number, number, number], s: 0.55, r: i * 2.1 }));
  }, []);
  return (
    <group>
      <Sand curve={HAIRPIN} w={5.0} />
      <Road curve={HAIRPIN} half={3.4} lines={CLIFF_LINES} surface="road" tone="#B8B3AC" segs={900} />
      <Guardrail curve={HAIRPIN} off={-4.1} />
      <Placed model="cliff1" items={cliffs} />
      <Placed model="boulder4" items={along(HAIRPIN, 81, 30, [4.4, 7], [0.2, 0.6])} />
    </group>
  );
};

// ---------- bridge over nothing ----------
export const BRIDGE = roadCurve([
  [-120, 0], [-40, 0], [0, 0], [40, 0], [120, 0],
]);
export const BridgeWorld: React.FC = () => {
  const deck = useMemo(() => new THREE.BoxGeometry(240, 0.9, 10.5), []);
  const deckMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D9D3C8", roughness: 0.8 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#B23A2E", roughness: 0.45, metalness: 0.6 }), []);
  const towers = [-36, 36];
  return (
    <group>
      <mesh geometry={deck} material={deckMat} position={[0, -0.46, 0]} receiveShadow castShadow />
      <Road curve={BRIDGE} half={3.8} lines={SALT_LINES} surface="road" tone="#B8B3AC" />
      {[-5.0, 5.0].map((z) => (
        <mesh key={z} position={[0, 0.55, z]} material={steel} castShadow>
          <boxGeometry args={[240, 0.08, 0.08]} />
        </mesh>
      ))}
      {Array.from({ length: 120 }, (_, i) => -119 + i * 2).flatMap((x) =>
        [-5.0, 5.0].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.28, z]} material={steel}>
            <boxGeometry args={[0.06, 0.55, 0.06]} />
          </mesh>
        )),
      )}
      {towers.map((x) => (
        <group key={x}>
          {[-5.6, 5.6].map((z) => (
            <mesh key={z} position={[x, 9, z]} material={steel} castShadow>
              <boxGeometry args={[1.2, 22, 1.2]} />
            </mesh>
          ))}
          <mesh position={[x, 19, 0]} material={steel} castShadow>
            <boxGeometry args={[1.2, 1.2, 12.4]} />
          </mesh>
          {/* cables: straight stays from the tower top to the deck */}
          {[-1, 1].flatMap((dir) =>
            [6, 12, 18, 24, 30].flatMap((d) =>
              [-5.6, 5.6].map((z) => {
                const a = new THREE.Vector3(x, 19.5, z), b = new THREE.Vector3(x + dir * d, 0.6, z * 0.9);
                const mid = a.clone().add(b).multiplyScalar(0.5);
                const len = a.distanceTo(b);
                const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
                return (
                  <mesh key={`${dir}${d}${z}`} position={mid} quaternion={q} material={steel}>
                    <cylinderGeometry args={[0.04, 0.04, len, 6]} />
                  </mesh>
                );
              }),
            ),
          )}
        </group>
      ))}
    </group>
  );
};

// ---------- drag strip: start lights, a white start line, burnout smoke ----------
export const DRAG = roadCurve([
  [-300, 0], [-100, 0], [0, 0], [100, 0], [300, 0],
]);
const DRAG_LINES: LineSpec[] = [
  { at: 0, w: 0.16, color: "#F2F0EA" },
  { at: 5.2, w: 0.2, color: "#F2F0EA" },
  { at: -5.2, w: 0.2, color: "#F2F0EA" },
];
// `green` 0 = amber stage lights on, 1 = green
export const DragWorld: React.FC<{ green: number }> = ({ green }) => {
  const bulb = useMemo(() => new THREE.SphereGeometry(0.16, 24, 16), []);
  const amber = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A2A10", emissive: new THREE.Color("#FFB020"), emissiveIntensity: 0 }), []);
  const greenM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#10301A", emissive: new THREE.Color("#30FF70"), emissiveIntensity: 0 }), []);
  const pole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C1C1E", roughness: 0.5, metalness: 0.4 }), []);
  amber.emissiveIntensity = green < 1 ? 3.5 : 0.2;
  greenM.emissiveIntensity = green >= 1 ? 5 : 0;
  return (
    <group>
      <Sand curve={DRAG} w={9} tint="#F4ECDF" />
      <Road curve={DRAG} half={5.6} lines={DRAG_LINES} surface="track" tone="#FFFFFF" gain={2.2} />
      {/* start line across both lanes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.4, 11]} />
        <meshBasicMaterial color="#F2F0EA" toneMapped={false} />
      </mesh>
      {/* the christmas tree, between the lanes just past the line */}
      <group position={[2.2, 0, 0]}>
        <mesh position={[0, 1.4, 0]} material={pole} castShadow>
          <boxGeometry args={[0.14, 2.8, 0.14]} />
        </mesh>
        <mesh position={[0, 2.3, 0]} material={pole} castShadow>
          <boxGeometry args={[0.3, 1.6, 0.6]} />
        </mesh>
        {[2.85, 2.55, 2.25].map((y) => [-0.17, 0.17].map((z) => <mesh key={`${y}${z}`} geometry={bulb} material={amber} position={[-0.16, y, z]} />))}
        {[-0.17, 0.17].map((z) => (
          <mesh key={z} geometry={bulb} material={greenM} position={[-0.16, 1.85, z]} />
        ))}
      </group>
    </group>
  );
};

// ---------- smoke and spray: soft camera-facing puffs ----------
const puffTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,0.9)");
    grd.addColorStop(0.5, "rgba(255,255,255,0.35)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();
// puffs released over time `u` (car-local), drifting backward and up, growing and fading
export const Puffs: React.FC<{ u: number; rate: number; life: number; size: number; color?: string; opacity?: number; spread?: number; drift?: [number, number, number]; origin?: [number, number, number]; seed?: number }> = ({ u, rate, life, size, color = "#F2EEE8", opacity = 0.7, spread = 0.6, drift = [-3, 0.8, 0], origin = [0, 0.25, 0], seed = 3 }) => {
  const tex = useMemo(puffTex, []);
  const jit = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 400 }, () => [r() - 0.5, r() - 0.5, r() - 0.5, r()]);
  }, [seed]);
  const n = Math.min(400, Math.floor(u * rate));
  const items: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const age = u - i / rate;
    if (age > life || age < 0) continue;
    const k = age / life;
    const [jx, jy, jz, js] = jit[i];
    const sc = size * (0.4 + 1.6 * k) * (0.7 + 0.6 * js);
    items.push(
      <sprite key={i} position={[origin[0] + drift[0] * age + jx * spread, origin[1] + drift[1] * age + jy * spread * 0.4, origin[2] + drift[2] * age + jz * spread]} scale={[sc, sc, sc]}>
        <spriteMaterial map={tex} color={color} transparent opacity={opacity * (1 - k) * Math.min(1, age * 8)} depthWrite={false} />
      </sprite>,
    );
  }
  return <group>{items}</group>;
};

// ---------- wet road in the rain ----------
export const WET = roadCurve([
  [-80, 20], [-40, 8], [-10, 2], [20, 0], [50, -6], [90, -20],
]);
export const WetWorld: React.FC = () => (
  <group>
    <Sand curve={WET} w={6} tint="#CFC6B8" />
    <Road curve={WET} half={3.8} lines={CLIFF_LINES} surface="road" tone="#6E6A66" wet />
    <Guardrail curve={WET} off={-4.6} />
  </group>
);
// rain: thin streaks falling at an angle, drawn over the frame
export const Rain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.55 }) => (
  <div
    style={{
      position: "absolute",
      inset: -200,
      pointerEvents: "none",
      opacity,
      backgroundImage: "repeating-linear-gradient(104deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 22px, rgba(255,255,255,0.55) 23px, rgba(255,255,255,0) 24px)",
      backgroundSize: "260px 90px",
      transform: `translate(${(frame * 9) % 260}px, ${(frame * 64) % 90}px)`,
      mixBlendMode: "screen",
    }}
  />
);

// ---------- snow pass: white peaks around a dark road ----------
export const SNOW = roadCurve([
  [-80, 30], [-40, 14], [-10, 6], [20, 4], [50, -4], [90, -18],
]);
export const SnowWorld: React.FC = () => {
  const peaks = useMemo(() => {
    const spots: [number, number, number, number][] = [[-40, -110, 6.5, 0.4], [40, -130, 8, 2.2], [120, -100, 6, 4.1], [-120, -90, 5.5, 1.3], [-20, 120, 6, 3.3], [90, 115, 5, 5.2]];
    return spots.map(([x, z, sc, r]) => ({ p: [x, -2, z] as [number, number, number], s: sc, r }));
  }, []);
  return (
    <group>
      <Sand curve={SNOW} w={7.5} tint="#FFFFFF" />
      <Road curve={SNOW} half={3.6} lines={CLIFF_LINES} surface="road" tone="#9E9A95" />
      <Guardrail curve={SNOW} off={-4.3} />
      <Placed model="cliff2" items={peaks} tint="#F1F4F8" />
      <Placed model="boulder4" items={along(SNOW, 91, 24, [5, 8], [0.3, 0.8])} tint="#EEF1F5" />
    </group>
  );
};

// ---------- tunnel: a dark concrete tube with ceiling light strips ----------
export const TUNNEL = roadCurve([
  [-200, 0], [-60, 0], [0, 0], [60, 0], [200, 0],
]);
export const TunnelWorld: React.FC = () => {
  const tube = useMemo(() => {
    const g = new THREE.CylinderGeometry(6.4, 6.4, 220, 48, 1, true, -Math.PI / 2, Math.PI);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2B2926", roughness: 0.85, side: THREE.BackSide }), []);
  const lamp = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFE7B8").multiplyScalar(4), toneMapped: false }), []);
  return (
    <group>
      <Road curve={TUNNEL} half={4.2} lines={DRAG_LINES} surface="road" tone="#5E5A56" />
      <mesh geometry={tube} material={wall} />
      {Array.from({ length: 36 }, (_, i) => -105 + i * 6).map((x) => (
        <mesh key={x} position={[x, 6.1, 2.6]} material={lamp}>
          <boxGeometry args={[3.2, 0.1, 0.28]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- red dunes: wind-shaped sand rising away from a winding road ----------
export const DUNES = roadCurve([
  [-120, 40], [-70, 22], [-30, 14], [0, 2], [30, -6], [70, -2], [120, -16],
]);
export const DunesWorld: React.FC = () => {
  const surf = useSurface("sand");
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 240, 220, 170);
    g.rotateX(-Math.PI / 2);
    const pts = DUNES.getSpacedPoints(240);
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      let d = 1e9;
      for (const q of pts) d = Math.min(d, (q.x - x) ** 2 + (q.z - z) ** 2);
      d = Math.sqrt(d);
      const rise = THREE.MathUtils.smoothstep(d, 7, 24);
      // crescent dunes: sharp crests from two crossing swells
      const w = Math.abs(Math.sin(x * 0.045 + z * 0.02)) * 0.6 + Math.abs(Math.sin(z * 0.06 - x * 0.015 + 1.3)) * 0.4;
      p.setY(i, rise * (2 + 9 * Math.pow(w, 1.6)) - 0.05);
      uv.setXY(i, x / 2.5, z / 2.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => {
    if (!surf) return null;
    const map = surf.map.clone();
    map.repeat.set(1, 1);
    map.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map, color: "#E58A5A", roughness: 1 });
  }, [surf]);
  return (
    <group>
      {mat ? <mesh geometry={geo} material={mat} receiveShadow castShadow /> : null}
      <Road curve={DUNES} half={3.6} lines={CLIFF_LINES} surface="road" tone="#B8B3AC" />
    </group>
  );
};

// ---------- a launch ramp on the bridge for "kick me" ----------
export const RAMP_T = 0.5; // where on BRIDGE the ramp's lip sits
export const Ramp: React.FC<{ lane: number }> = ({ lane }) => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(5, 0);
    sh.lineTo(5, 0.9);
    sh.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 3.4, bevelEnabled: false });
    g.translate(-5, 0, -1.7);
    return g;
  }, []);
  const p = BRIDGE.getPointAt(RAMP_T);
  // the car drives toward -x on the bridge, so the ramp rises toward -x
  return (
    <mesh geometry={geo} position={[p.x, 0, p.z - lane]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#D8D2C6" roughness={0.7} />
    </mesh>
  );
};
