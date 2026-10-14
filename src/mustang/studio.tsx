// The Mustang's studio: a biscuit cyclorama (CSS behind a transparent canvas), car-photography lighting built as an
// environment of soft boxes so the paint carries long clean highlights, and shadow catchers on the floor.
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Hdri, HdriName, Lens } from "./look";

export const W = 1920;
export const H = 1080;
export const BISCUIT = "#E9DDC9";
export const PAPER = "#F7F3EC";
export const INK = "#151413";

// soft boxes rendered into a PMREM environment: a long overhead box, two side strips, a warm floor bounce
const StudioEnv: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const env = new THREE.Scene();
    env.background = new THREE.Color("#4A443C");
    const box = (w: number, h: number, pos: [number, number, number], rot: [number, number, number], c: string, k: number) => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      env.add(mesh);
    };
    box(16, 1.6, [0, 9, 0], [Math.PI / 2, 0, 0], "#FFFFFF", 1.7); // long overhead strip: one clean stripe down hood and roof
    // the flank's horizon line: bright wall above, dark band below, on both sides
    box(40, 3.0, [0, 3.1, 9], [0, 0, 0], "#FFF6EA", 1.9);
    box(40, 1.6, [0, 0.8, 9], [0, 0, 0], "#2B2622", 1.0);
    box(40, 3.0, [0, 3.1, -9], [0, 0, 0], "#FFF6EA", 1.3);
    box(40, 1.6, [0, 0.8, -9], [0, 0, 0], "#2B2622", 1.0);
    box(1.2, 5, [10, 3, 0], [0, Math.PI / 2, 0], "#FFFFFF", 1.6); // front kicker
    box(1.2, 5, [-10, 3, 0], [0, Math.PI / 2, 0], "#FFFFFF", 1.0); // rear kicker
    box(40, 40, [0, -0.5, 0], [Math.PI / 2, 0, 0], "#B9AC98", 0.5); // floor bounce
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(env, 0.02).texture;
    scene.environmentIntensity = intensity;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.type = THREE.VSMShadowMap;
  }, [gl, scene, intensity]);
  return null;
};

export const Cam: React.FC<{ pos: [number, number, number]; target: [number, number, number]; fov?: number; roll?: number }> = ({ pos, target, fov = 24, roll = 0 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = fov;
  // a near plane well away from the lens keeps depth precise in the high aerial shots (no road/sand flicker)
  cam.near = 0.5;
  cam.far = 600;
  cam.position.set(...pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(...target);
  cam.updateProjectionMatrix();
  return null;
};

// a soft contact shadow under the car: a radial falloff texture laid on the floor
const contactTex = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, "rgba(40,30,20,0.55)");
    grd.addColorStop(0.55, "rgba(40,30,20,0.22)");
    grd.addColorStop(1, "rgba(40,30,20,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();
export const ContactShadow: React.FC<{ position?: [number, number, number]; size?: [number, number]; opacity?: number; rotY?: number }> = ({ position = [0, 0.002, 0], size = [5.4, 2.4], opacity = 1, rotY = 0 }) => {
  const tex = useMemo(contactTex, []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotY]} renderOrder={-1}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// Light follows `focus` (usually the car) so a tight shadow map stays sharp wherever the car is in a big world.
// `fog` fades the world into the page colour: [colour, near, far].
// `look` switches on the photographic stack (look.tsx): an HDRI for reflections, bloom and a neutral tone curve.
// The canvas stays transparent so the page colour behind it is exact.
export const Stage: React.FC<{
  children: React.ReactNode;
  shadow?: number;
  keyPos?: [number, number, number];
  focus?: [number, number, number];
  fog?: [string, number, number];
  sun?: number;
  floor?: boolean;
  look?: { hdri: HdriName; envIntensity?: number; envRotation?: number };
}> = ({ children, shadow = 0.32, keyPos = [3, 9, 5], focus = [0, 0, 0], fog, sun = 2.2, floor = true, look }) => {
  const light = useMemo(() => new THREE.DirectionalLight(), []);
  light.position.set(focus[0] + keyPos[0], focus[1] + keyPos[1], focus[2] + keyPos[2]);
  light.target.position.set(...focus);
  light.target.updateMatrixWorld();
  return (
    <ThreeCanvas width={W} height={H} shadows gl={{ antialias: !look, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      {look ? (
        <>
          <Hdri name={look.hdri} intensity={look.envIntensity ?? 1} rotation={look.envRotation ?? 0} />
          <Lens />
        </>
      ) : (
        <StudioEnv />
      )}
      {fog ? <fog attach="fog" args={fog} /> : null}
      <hemisphereLight args={["#FFFFFF", "#D8C8B0", 0.35]} />
      <primitive
        object={light}
        castShadow
        intensity={sun}
        color="#FFF4E6"
        shadow-mapSize={[2048, 2048]}
        shadow-radius={10}
        shadow-blurSamples={24}
        shadow-bias={-0.0004}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      <primitive object={light.target} />
      {floor ? (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[400, 400]} />
          <shadowMaterial opacity={shadow} />
        </mesh>
      ) : null}
      {children}
    </ThreeCanvas>
  );
};

// the cyclorama: white overhead falling to biscuit at the floor line
export const Cyc: React.FC<{ horizon?: number }> = ({ horizon = 0.62 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(180deg, ${PAPER} 0%, #F1EADF ${horizon * 70}%, ${BISCUIT} ${horizon * 100}%, #E4D6BF 100%)`,
    }}
  />
);
