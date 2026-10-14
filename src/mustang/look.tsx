// The film's photographic look, layered on every shot:
//   HDRI    — a real photographed light (Poly Haven, CC0) for reflections: a softbox studio, or open sky outdoors
//   lens    — a touch of bloom on chrome and lamps, a neutral tone curve
//   finish  — film grain and a soft vignette in CSS on top
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import React, { useEffect } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useAsset } from "./assets";

export const HDRIS = { studio: "studio_small_09", sky: "kloofendal_48d_partly_cloudy_puresky" } as const;
export type HdriName = keyof typeof HDRIS;

// the HDRI lights and reflects; the visible background stays the page colour
export const Hdri: React.FC<{ name: HdriName; intensity?: number; rotation?: number }> = ({ name, intensity = 1, rotation = 0 }) => {
  const { gl, scene } = useThree();
  const tex = useAsset(`hdri-${name}`, async () => {
    const t = await new RGBELoader().loadAsync(staticFile(`mustang/hdri/${HDRIS[name]}_2k.hdr`));
    t.mapping = THREE.EquirectangularReflectionMapping;
    return t;
  });
  useEffect(() => {
    if (!tex) return;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromEquirectangular(tex).texture;
    scene.environment = env;
    pmrem.dispose();
    return () => env.dispose();
  }, [tex, gl, scene]);
  scene.environmentIntensity = intensity;
  scene.environmentRotation.set(0, rotation, 0);
  gl.toneMapping = THREE.NoToneMapping; // the lens stack below does the tone curve
  gl.shadowMap.type = THREE.VSMShadowMap;
  return null;
};

// No depth of field: postprocessing's DOF writes an opaque frame, which would hide the page colour behind the canvas.
export const Lens: React.FC<{ bloom?: number }> = ({ bloom = 0.3 }) => (
  <EffectComposer multisampling={4}>
    <Bloom intensity={bloom} luminanceThreshold={0.9} luminanceSmoothing={0.15} mipmapBlur />
    {/* Khronos PBR Neutral keeps the paint red and the page cream, only rolling off the highlights */}
    <ToneMapping mode={ToneMappingMode.NEUTRAL} />
  </EffectComposer>
);

// grain and vignette live in CSS above the canvas, so the 3D pass keeps its transparency over the page colour
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.2 -0.1'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")`;
export const FilmFinish: React.FC<{ frame: number; grain?: number; vignette?: number }> = ({ frame, grain = 0.07, vignette = 0.16 }) => (
  <>
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(40,28,16,${vignette}) 100%)` }} />
    <div style={{ position: "absolute", inset: -60, pointerEvents: "none", backgroundImage: GRAIN, opacity: grain, mixBlendMode: "overlay", transform: `translate(${((frame * 37) % 60) - 30}px, ${((frame * 53) % 60) - 30}px)` }} />
  </>
);
