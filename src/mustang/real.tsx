// The film's Mustang: Mark Peters' 1967 Ford Mustang Fastback (Sketchfab, CC BY 4.0), converted by
// scripts/mustang-convert.py into named parts and repainted Candyapple Red by scripts/mustang-textures.py.
// Credit line for every post: '"1967 Ford Mustang Fastback" by Mark Peters (CC BY 4.0)'.
//
// Axes after loading: x forward (nose at +x), y up, z to the car's left — the same as the studio code.
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const CREDIT = '"1967 Ford Mustang Fastback" by Mark Peters (CC BY 4.0)';
export type RealPart = "shell" | "glass" | "nose" | "tail" | "trim" | "trimL" | "trimR" | "wheelFL" | "wheelFR" | "wheelRL" | "wheelRR";
export const WHEELS: RealPart[] = ["wheelFL", "wheelFR", "wheelRL", "wheelRR"];

// ---------- loading (one shared copy for every scene) ----------
type Loaded = { parts: Record<string, THREE.Object3D>; mats: Record<string, THREE.Material> };
let CACHE: Promise<Loaded> | null = null;
const tex = (loader: THREE.TextureLoader, name: string, srgb: boolean) =>
  new Promise<THREE.Texture>((res, rej) =>
    loader.load(
      staticFile(`mustang/tex/${name}`),
      (t) => {
        t.flipY = false; // glTF UV convention
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = 8;
        res(t);
      },
      undefined,
      rej,
    ),
  );
const load = () =>
  (CACHE ??= (async () => {
    const tl = new THREE.TextureLoader();
    const set = async (m: string, emissive = false) => ({
      map: await tex(tl, `${m}_base.png`, true),
      mr: await tex(tl, `${m}_mr.png`, false),
      normal: await tex(tl, `${m}_normal.png`, false),
      emissive: emissive ? await tex(tl, `${m}_emission.png`, true) : null,
    });
    const [body, wheels, win] = await Promise.all([set("FordMustang_MTL", true), set("FordMustangWheels_MTL"), set("FordMustangWindow_MTL")]);
    const mats: Record<string, THREE.Material> = {
      // paint, chrome and badges share one atlas: clearcoat gives the paint its deep lacquer
      FordMustang_MTL: new THREE.MeshPhysicalMaterial({
        map: body.map, roughnessMap: body.mr, metalnessMap: body.mr, normalMap: body.normal, emissiveMap: body.emissive,
        emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0, roughness: 1, metalness: 1,
        clearcoat: 1, clearcoatRoughness: 0.03,
      }),
      FordMustangWheels_MTL: new THREE.MeshPhysicalMaterial({ map: wheels.map, roughnessMap: wheels.mr, metalnessMap: wheels.mr, normalMap: wheels.normal, roughness: 1, metalness: 1 }),
      FordMustangWindow_MTL: new THREE.MeshPhysicalMaterial({
        map: win.map, roughnessMap: win.mr, normalMap: win.normal, color: "#9AA3A8", roughness: 1, metalness: 0,
        transparent: true, opacity: 0.42, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false, side: THREE.DoubleSide,
      }),
      Blackout_MTL: new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.9 }),
    };
    const gltf = await new GLTFLoader().loadAsync(staticFile("mustang/mustang.glb"));
    const parts: Record<string, THREE.Object3D> = {};
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const mapped = list.map((m) => mats[m.name] ?? m);
        mesh.material = Array.isArray(mesh.material) ? mapped : mapped[0];
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    gltf.scene.children.forEach((c) => (parts[c.name] = c));
    const bb = new THREE.Box3().setFromObject(gltf.scene);
    console.log("MUSTANG parts", Object.keys(parts).join(","), "bbox", bb.min.toArray().map((v) => v.toFixed(2)).join(" "), bb.max.toArray().map((v) => v.toFixed(2)).join(" "));
    return { parts, mats };
  })());

export const useRealCar = () => {
  const [car, setCar] = useState<Loaded | null>(null);
  const [handle] = useState(() => delayRender("mustang model", { timeoutInMilliseconds: 240000 }));
  useEffect(() => {
    load().then(setCar);
  }, []);
  // while rendering, the canvas only draws when the frame changes: draw once more with the car in it, then release
  const { advance } = useThree();
  useEffect(() => {
    if (!car) return;
    const id = requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(handle);
    });
    return () => cancelAnimationFrame(id);
  }, [car, handle, advance]);
  return car;
};

// ---------- the car ----------
export type PartPose = { d?: [number, number, number]; r?: [number, number, number] };
export const RealMustang: React.FC<{
  spin?: number; // wheel rotation, radians
  steer?: number; // front wheel steer, radians
  lights?: number; // 0..1 headlights / tail lamps
  pose?: (p: RealPart) => PartPose | undefined; // per-part offset for the breakdown
}> = ({ spin = 0, steer = 0, lights = 0, pose }) => {
  const car = useRealCar();
  // clone once per mounted car so several cars can share the loaded meshes
  const parts = useMemo(() => {
    if (!car) return null;
    const out: Record<string, { obj: THREE.Object3D; base: THREE.Vector3; baseQ: THREE.Quaternion }> = {};
    Object.entries(car.parts).forEach(([k, v]) => {
      const c = v.clone();
      out[k] = { obj: c, base: c.position.clone(), baseQ: c.quaternion.clone() };
    });
    return out;
  }, [car]);
  if (!car || !parts) return null;
  (car.mats.FordMustang_MTL as THREE.MeshPhysicalMaterial).emissiveIntensity = lights * 2.5;
  // pose offsets are [ahead, up, out] in metres: ahead toward the nose, out away from the car's centre line
  const ahead = Math.sign(parts.nose.base.z - parts.tail.base.z) || 1;
  Object.entries(parts).forEach(([k, { obj, base, baseQ }]) => {
    const p = pose?.(k as RealPart) ?? {};
    const d = p.d ?? [0, 0, 0];
    const r = p.r ?? [0, 0, 0];
    const out = Math.abs(base.x) > 0.05 ? Math.sign(base.x) : 0;
    obj.position.set(base.x + out * d[2], base.y + d[1], base.z + ahead * d[0]);
    obj.quaternion.copy(baseQ);
    if (k.startsWith("wheel")) {
      const front = k.startsWith("wheelF");
      obj.rotateY(front ? steer : 0);
      obj.rotateX(-spin);
    }
    obj.rotateX(r[2]);
    obj.rotateY(r[1]);
    obj.rotateZ(r[0]);
  });
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {Object.values(parts).map(({ obj }) => (
        <primitive key={obj.uuid} object={obj} />
      ))}
    </group>
  );
};
