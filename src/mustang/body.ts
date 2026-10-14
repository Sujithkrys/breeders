// The '67 Fastback body, lofted from cross-sections in code. Units are metres; x runs front (+) to back (−), y up,
// z out to the car's left side. Real proportions: 4.61 m long, 2.74 m wheelbase, 1.30 m tall, 1.79 m wide.
// Every vertex carries (x, v): v walks round the cross-section from the underside (0) to the roof centre (1), so the
// paint shader can cut panels (hood, doors, decklid), glass, chrome trim and the wheel arches by region.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const DIM = { frontAxle: 1.37, rearAxle: -1.37, track: 0.762, tyreR: 0.335, archR: 0.39, archY: 0.345, nose: 2.31, tail: -2.3 };

// keyframes: x, rocker y, beltline y, body half-width, top-centre y (hood / roof / deck), greenhouse half-width at top
type Key = [x: number, yb: number, belt: number, wB: number, top: number, wT: number];
const KEYS: Key[] = [
  [2.31, 0.37, 0.835, 0.78, 0.855, 0.6],
  [2.2, 0.31, 0.855, 0.83, 0.88, 0.66],
  [1.85, 0.27, 0.875, 0.865, 0.905, 0.7],
  [1.37, 0.245, 0.89, 0.88, 0.92, 0.72],
  [0.9, 0.225, 0.9, 0.886, 0.932, 0.73],
  [0.55, 0.215, 0.91, 0.89, 0.945, 0.71],
  [0.3, 0.212, 0.915, 0.89, 1.1, 0.63],
  [0.06, 0.212, 0.918, 0.89, 1.268, 0.565],
  [-0.2, 0.212, 0.92, 0.89, 1.3, 0.55],
  [-0.55, 0.214, 0.928, 0.89, 1.288, 0.55],
  [-0.9, 0.22, 0.938, 0.888, 1.215, 0.565],
  [-1.37, 0.24, 0.95, 0.882, 1.115, 0.6],
  [-1.75, 0.27, 0.962, 0.87, 1.045, 0.645],
  [-2.05, 0.3, 0.975, 0.85, 1.0, 0.68],
  [-2.24, 0.34, 0.995, 0.82, 0.998, 0.7],
  [-2.3, 0.4, 0.985, 0.8, 0.985, 0.7],
];

// Catmull-Rom through the keyframes so the surface stays smooth along the length
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
export const keyAt = (x: number): Key => {
  // keys run front to back (x decreasing)
  let i = KEYS.findIndex((k, j) => j < KEYS.length - 1 && x <= k[0] && x >= KEYS[j + 1][0]);
  if (i < 0) i = x > KEYS[0][0] ? 0 : KEYS.length - 2;
  const a = KEYS[Math.max(0, i - 1)], b = KEYS[i], c = KEYS[i + 1], d = KEYS[Math.min(KEYS.length - 1, i + 2)];
  const t = THREE.MathUtils.clamp((b[0] - x) / (b[0] - c[0]), 0, 1);
  return [x, 1, 2, 3, 4, 5].map((_, k) => (k === 0 ? x : cr(a[k], b[k], c[k], d[k], t))) as Key;
};

// section control points (half, +z side) and the v each one sits at
const V_KNOTS = [0, 0.08, 0.14, 0.32, 0.47, 0.52, 0.56, 0.78, 0.92, 1];
export const V = { rocker: 0.12, belt: 0.52, ghBase: 0.565, roofEdge: 0.9 };
const sectionPts = (k: Key): [number, number][] => {
  const [, yb, belt, wB, top, wT] = k;
  const g = top - belt;
  const ghB = wB - 0.085;
  return [
    [0, yb + 0.01],
    [wB - 0.13, yb],
    [wB - 0.025, yb + 0.06],
    [wB + 0.006, yb + 0.45 * (belt - yb)],
    [wB, belt - 0.06],
    [wB - 0.03, belt - 0.004],
    [ghB, belt + 0.012],
    [THREE.MathUtils.lerp(ghB, wT, 0.86), belt + 0.84 * g],
    [wT - 0.07, top - 0.004],
    [0, top + 0.018],
  ];
};
const sampleSection = (k: Key, n: number) => {
  const p = sectionPts(k);
  const out: { z: number; y: number; v: number }[] = [];
  for (let s = 0; s <= n; s++) {
    const v = s / n;
    let i = V_KNOTS.findIndex((kv, j) => j < V_KNOTS.length - 1 && v >= kv && v <= V_KNOTS[j + 1]);
    if (i < 0) i = V_KNOTS.length - 2;
    const t = (v - V_KNOTS[i]) / (V_KNOTS[i + 1] - V_KNOTS[i]);
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
    out.push({ z: cr(a[0], b[0], c[0], d[0], t), y: cr(a[1], b[1], c[1], d[1], t), v });
  }
  return out;
};

// x stations, with the ends rolled in to close the nose and tail
const stations = (n: number) => {
  const xs: { x: number; s: number }[] = [];
  const caps = [1, 0.985, 0.95, 0.88, 0.7, 0];
  const capDx = [0, 0.008, 0.016, 0.022, 0.028, 0.03];
  caps.slice(1).reverse().forEach((s, i) => xs.push({ x: DIM.nose + capDx[caps.length - 1 - i], s }));
  for (let i = 0; i <= n; i++) xs.push({ x: DIM.nose + ((DIM.tail - DIM.nose) * i) / n, s: 1 });
  caps.slice(1).forEach((s, i) => xs.push({ x: DIM.tail - capDx[i + 1], s }));
  return xs;
};

export const buildBody = () => {
  const NS = 120;
  const sts = stations(220);
  const half = (side: 1 | -1) => {
    const pos: number[] = [], car: number[] = [];
    sts.forEach(({ x, s }) => {
      const k = keyAt(THREE.MathUtils.clamp(x, DIM.tail, DIM.nose));
      const [, yb, , , top] = k;
      const cy = (yb + top) / 2 + 0.05;
      sampleSection(k, NS).forEach((p) => {
        const y = cy + (p.y - cy) * s;
        // shark nose: the front leans forward at the top; ducktail: the tail's top edge kicks up
        const lean = THREE.MathUtils.smoothstep(x, 1.85, DIM.nose + 0.03) * (y - 0.6) * 0.2;
        const kick = THREE.MathUtils.smoothstep(-x, 1.95, -DIM.tail + 0.02) * THREE.MathUtils.smoothstep(y, 0.88, 1.0) * 0.035;
        pos.push(x + lean, y + kick, side * p.z * s);
        car.push(x, s < 1 ? (x > 0 ? 2 : 3) + (1 - s) : p.v); // caps get v > 2 so the shader can tell nose / tail
      });
    });
    const idx: number[] = [];
    const R = NS + 1;
    for (let i = 0; i < sts.length - 1; i++)
      for (let j = 0; j < NS; j++) {
        const a = i * R + j, b = a + R, c = a + 1, d = b + 1;
        if (side === -1) idx.push(a, b, c, c, b, d);
        else idx.push(a, c, b, c, d, b);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("carUv", new THREE.Float32BufferAttribute(car, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  return mergeGeometries([half(1), half(-1)]);
};

// ---------- the paint shader: panels, glass, chrome, gaps, arches ----------
// part ids: 0 shell, 1 hood, 2 left door, 3 right door, 4 decklid
export const PART = { shell: 0, hood: 1, doorL: 2, doorR: 3, deck: 4 } as const;
export const PANELS = {
  hood: { x0: 0.6, x1: 2.2 },
  door: { x0: -0.5, x1: 0.66 },
  deck: { x0: -2.2, x1: -1.76 },
};

const GLSL_MASKS = /* glsl */ `
  varying vec2 vCar;
  varying vec3 vLocal;
  uniform float uPart;
  uniform float uLights;
  float band(float x, float a, float b, float s){ return smoothstep(a - s, a + s, x) * (1.0 - smoothstep(b - s, b + s, x)); }
  float lineAt(float x, float at, float w){ float f = fwidth(x) + 1e-5; return 1.0 - smoothstep(w, w + f * 1.2, abs(x - at)); }
  // region tests in (x, v)
  bool inHood(){ return vCar.y < 1.5 && vCar.x > ${PANELS.hood.x0.toFixed(3)} && vCar.x < ${PANELS.hood.x1.toFixed(3)} && vCar.y > ${(V.ghBase - 0.004).toFixed(3)}; }
  bool inDoor(){ return vCar.y < 1.5 && vCar.x > ${PANELS.door.x0.toFixed(3)} && vCar.x < ${PANELS.door.x1.toFixed(3)} && vCar.y > ${V.rocker.toFixed(3)} && vCar.y < ${V.belt.toFixed(3)}; }
  bool inDeck(){ return vCar.y < 1.5 && vCar.x > ${PANELS.deck.x0.toFixed(3)} && vCar.x < ${PANELS.deck.x1.toFixed(3)} && vCar.y > 0.6; }
  float partId(){
    if (inHood()) return 1.0;
    if (inDoor()) return vLocal.z > 0.0 ? 2.0 : 3.0;
    if (inDeck()) return 4.0;
    return 0.0;
  }
`;

export const paintMaterial = (color: string, part: number) => {
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.035, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPart = { value: part };
    sh.uniforms.uLights = { value: 0 };
    m.userData.shader = sh;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 carUv;\nvarying vec2 vCar;\nvarying vec3 vLocal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvCar = carUv;\nvLocal = position;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\n" + GLSL_MASKS + "\nfloat gGlass; float gChrome; float gDark; float gGap;")
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        // panels: each mesh keeps only its own part
        if (abs(partId() - uPart) > 0.5) discard;
        // wheel arches (cut through the sides)
        vec2 fa = vLocal.xy - vec2(${DIM.frontAxle.toFixed(3)}, ${DIM.archY.toFixed(3)});
        vec2 ra = vLocal.xy - vec2(${DIM.rearAxle.toFixed(3)}, ${DIM.archY.toFixed(3)});
        if (abs(vLocal.z) > 0.5 && vCar.y < 0.5 && (length(fa) < ${DIM.archR.toFixed(3)} || length(ra) < ${DIM.archR.toFixed(3)})) discard;
        float x = vCar.x, v = vCar.y;
        bool cab = v < 1.5;
        // glass
        float wind = cab ? band(x, 0.07, 0.53, 0.004) * band(v, 0.805, 1.01, 0.003) : 0.0;
        float sideTop = mix(0.66, 0.77, smoothstep(0.5, 0.15, x));
        float sideW = cab ? band(x, -0.66 + (v - 0.585) * 1.3, 0.47 - (v - 0.585) * 2.6, 0.004) * band(v, 0.587, 0.77, 0.003) : 0.0;
        float rear = cab ? band(x, -1.68, -0.66, 0.004) * band(v, 0.83, 1.01, 0.003) : 0.0;
        gGlass = clamp(wind + sideW + rear, 0.0, 1.0);
        // chrome: window surrounds, drip rail, rocker strip
        float surround = cab ? clamp(band(x, 0.05, 0.55, 0.003) * band(v, 0.79, 0.807, 0.002) + band(x, -1.7, -0.64, 0.003) * band(v, 0.815, 0.832, 0.002) + band(x, -0.68, 0.5, 0.003) * band(v, 0.572, 0.585, 0.002) + band(x, -0.68, 0.18, 0.003) * band(v, 0.772, 0.786, 0.002), 0.0, 1.0) : 0.0;
        float rockerStrip = cab ? band(x, -1.0, 0.95, 0.003) * band(v, 0.152, 0.166, 0.002) : 0.0;
        gChrome = clamp(surround + rockerStrip, 0.0, 1.0) * (1.0 - gGlass);
        // fastback sail louvers
        float louv = cab ? band(x, -1.16 + (v - 0.62) * 1.4, -0.9, 0.003) * band(v, 0.625, 0.735, 0.002) * smoothstep(0.35, 0.55, fract((v - 0.625) / 0.0275)) : 0.0;
        // side scoop ahead of the rear wheel
        float scoop = cab ? (lineAt(v, 0.405, 0.0012) * band(x, -0.98, -0.66, 0.002) + lineAt(x, -0.66, 0.0016) * band(v, 0.3, 0.405, 0.002)) : 0.0;
        // underside and nose / tail caps
        float under = cab ? 1.0 - smoothstep(0.05, 0.085, v) : 0.0;
        gDark = clamp(louv + under, 0.0, 1.0);
        // panel gaps
        float gx = 0.0;
        if (cab) {
          float inV = band(v, ${V.rocker.toFixed(3)} - 0.004, ${V.belt.toFixed(3)} + 0.004, 0.0005);
          gx += (lineAt(x, ${PANELS.door.x0.toFixed(3)}, 0.0016) + lineAt(x, ${PANELS.door.x1.toFixed(3)}, 0.0016)) * inV;
          gx += lineAt(v, ${V.rocker.toFixed(3)}, 0.0012) * band(x, ${PANELS.door.x0.toFixed(3)}, ${PANELS.door.x1.toFixed(3)}, 0.001);
          gx += lineAt(v, ${(V.ghBase - 0.004).toFixed(3)}, 0.0012) * band(x, ${PANELS.hood.x0.toFixed(3)}, ${PANELS.hood.x1.toFixed(3)}, 0.001);
          gx += lineAt(x, ${PANELS.hood.x0.toFixed(3)}, 0.0016) * step(${(V.ghBase - 0.004).toFixed(3)}, v);
          gx += (lineAt(x, ${PANELS.deck.x0.toFixed(3)}, 0.0016) + lineAt(x, ${PANELS.deck.x1.toFixed(3)}, 0.0016)) * step(0.6, v);
          gx += lineAt(v, 0.6, 0.0012) * band(x, ${PANELS.deck.x0.toFixed(3)}, ${PANELS.deck.x1.toFixed(3)}, 0.001);
          gx *= 1.0 - gGlass;
        }
        gGap = clamp(gx + scoop * 0.8, 0.0, 1.0);
        // character line: a soft crease along the flank from the front wheel back into the scoop
        float crease = cab ? band(x, -0.66, 1.05, 0.06) : 0.0;
        float below = crease * smoothstep(0.43, 0.405, v) * smoothstep(0.33, 0.4, v);
        float above = crease * smoothstep(0.43, 0.45, v) * smoothstep(0.5, 0.46, v);
        // twin hood vents
        float vents = cab ? band(x, 1.02, 1.32, 0.004) * (band(v, 0.86, 0.885, 0.003) + band(v, 0.935, 0.96, 0.003)) * step(${(V.ghBase).toFixed(3)}, v) : 0.0;
        gDark = clamp(gDark + vents, 0.0, 1.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.004, 0.005, 0.007), gGlass);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92), gChrome);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.03), gDark);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.25, gGap);
        diffuseColor.rgb *= 1.0 - 0.32 * below + 0.12 * above;
        if (!gl_FrontFacing) { diffuseColor.rgb = vec3(0.045, 0.04, 0.04); gGlass = 0.0; gChrome = 0.0; gDark = 1.0; }
        `,
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.04, gGlass); roughnessFactor = mix(roughnessFactor, 0.12, gChrome); roughnessFactor = mix(roughnessFactor, 0.7, gDark);")
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, gChrome); metalnessFactor = mix(metalnessFactor, 0.0, gGlass + gDark);");
  };
  m.customProgramCacheKey = () => `paint-${part}`;
  return m;
};

// shadows must respect the same cuts, or every panel would cast the whole car's shadow
export const depthMaterial = (part: number) => {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPart = { value: part };
    sh.uniforms.uLights = { value: 0 };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 carUv;\nvarying vec2 vCar;\nvarying vec3 vLocal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvCar = carUv;\nvLocal = position;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\n" + GLSL_MASKS)
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        if (abs(partId() - uPart) > 0.5) discard;
        vec2 fa = vLocal.xy - vec2(${DIM.frontAxle.toFixed(3)}, ${DIM.archY.toFixed(3)});
        vec2 ra = vLocal.xy - vec2(${DIM.rearAxle.toFixed(3)}, ${DIM.archY.toFixed(3)});
        if (abs(vLocal.z) > 0.5 && vCar.y < 0.5 && (length(fa) < ${DIM.archR.toFixed(3)} || length(ra) < ${DIM.archR.toFixed(3)})) discard;`,
      );
  };
  m.customProgramCacheKey = () => `paint-depth-${part}`;
  return m;
};
