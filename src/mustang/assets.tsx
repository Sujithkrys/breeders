// Scanned CC0 assets from Poly Haven (public/mustang/ph): asphalt, sand, Namaqualand boulders and cliffs, a wild
// rooibos bush. Loaded once and shared; every hook holds the frame until the asset is on the canvas.
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const cache = new Map<string, Promise<unknown>>();
const once = <T,>(key: string, make: () => Promise<T>) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as Promise<T>;
};

// hold the render until `load` resolves, then draw once more (the canvas only redraws on frame changes)
export const useAsset = <T,>(key: string, load: () => Promise<T>): T | null => {
  const [val, setVal] = useState<T | null>(null);
  const [handle] = useState(() => delayRender(`asset ${key}`, { timeoutInMilliseconds: 240000 }));
  const { advance } = useThree();
  useEffect(() => {
    once(key, load).then((v) => setVal(() => v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (val === null) return;
    const id = requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(handle);
    });
    return () => cancelAnimationFrame(id);
  }, [val, handle, advance]);
  return val;
};

// ---------- surfaces ----------
export type Surface = { map: THREE.Texture; normal: THREE.Texture; rough: THREE.Texture };
const loadTex = (url: string, srgb: boolean, tile: number) =>
  new Promise<THREE.Texture>((res, rej) =>
    new THREE.TextureLoader().load(
      staticFile(url),
      (t) => {
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1 / tile, 1 / tile);
        t.anisotropy = 16;
        res(t);
      },
      undefined,
      rej,
    ),
  );
// tile: metres covered by one copy of the texture
const SURFACES = {
  track: { dir: "asphalt_track", rough: "arm", tile: 3 },
  road: { dir: "asphalt_02", rough: "rough", tile: 3 },
  sand: { dir: "sandy_gravel_02", rough: "arm", tile: 2.5 },
} as const;
export type SurfaceName = keyof typeof SURFACES;
export const useSurface = (name: SurfaceName) =>
  useAsset<Surface>(`surface-${name}`, async () => {
    const s = SURFACES[name];
    const p = (k: string) => `mustang/ph/${s.dir}/textures/${s.dir}_${k}_2k.jpg`;
    const [map, normal, rough] = await Promise.all([loadTex(p("diff"), true, s.tile), loadTex(p("nor_gl"), false, s.tile), loadTex(p(s.rough), false, s.tile)]);
    return { map, normal, rough };
  });

// ---------- models ----------
export const MODELS = {
  cliff1: "namaqualand_cliff_01",
  cliff2: "namaqualand_cliff_02",
  boulder2: "namaqualand_boulder_02",
  boulder4: "namaqualand_boulder_04",
  bush: "wild_rooibos_bush",
  coast: "coastal_cliff_01",
} as const;
export type ModelName = keyof typeof MODELS;
export const useModel = (name: ModelName) =>
  useAsset<GLTF>(`model-${name}`, async () => {
    const dir = MODELS[name];
    const g = await new GLTFLoader().loadAsync(staticFile(`mustang/ph/${dir}/${dir}_2k.gltf`));
    g.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return g;
  });
