// Look frames for sign-off (one still per frame): 0 hero, 1 exploded, 2 on the road.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Mustang, PartId } from "./car";
import { Cam, ContactShadow, Cyc, INK, Stage } from "./studio";

const TIGHT = "'Inter Tight', Inter, sans-serif";
const MONO = "'Geist Mono', monospace";

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", fontFamily: MONO, fontSize: 17, letterSpacing: "0.08em", color: "#8A8175", textTransform: "uppercase", ...style }}>{children}</div>
);

const Hero: React.FC = () => (
  <AbsoluteFill>
    <Cyc />
    <Stage>
      <Cam pos={[5.2, 1.35, 11.5]} target={[0, 0.62, 0]} fov={22} />
      <ContactShadow />
      <Mustang lights={0.3} />
    </Stage>
    <Label style={{ left: 96, top: 84 }}>1967 · Fastback</Label>
    <Label style={{ right: 96, top: 84 }}>Candyapple Red</Label>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontFamily: TIGHT, fontWeight: 700, fontSize: 64, letterSpacing: "-0.035em", color: INK }}>
      Every legend is just parts.
    </div>
  </AbsoluteFill>
);

const ALL: PartId[] = ["body", "hood", "deck", "doorL", "doorR", "nose", "tail", "engine", "cabin", "suspension", "drivetrain", "wheelFL", "wheelFR", "wheelRL", "wheelRR"];
const Exploded: React.FC = () => (
  <AbsoluteFill>
    <Cyc horizon={0.7} />
    <Stage shadow={0.22}>
      <Cam pos={[8.6, 4.3, 10.2]} target={[0, 1.15, 0]} fov={26} />
      <ContactShadow size={[6, 3]} opacity={0.7} />
      <Mustang explode={(id) => (ALL.includes(id) ? 1 : 0)} />
    </Stage>
    <div style={{ position: "absolute", left: 96, top: 120, fontFamily: MONO, fontSize: 17, lineHeight: 2.05, letterSpacing: "0.06em", color: "#8A8175", textTransform: "uppercase" }}>
      {["Body shell", "Hood", "Decklid", "Doors", "V8 engine", "Cabin", "Front suspension", "Drivetrain", "Wheels"].map((t, i) => (
        <div key={t} style={{ color: i === 4 ? INK : undefined }}>
          <span style={{ display: "inline-block", width: 44, color: "#B5AB9D" }}>{String(i + 1).padStart(2, "0")}</span>
          {t}
        </div>
      ))}
    </div>
    <Label style={{ right: 96, bottom: 84 }}>Taken apart · 9 assemblies</Label>
  </AbsoluteFill>
);

const Road: React.FC = () => (
  <AbsoluteFill>
    <Cyc horizon={0.55} />
    <Stage keyPos={[-2, 9, 6]}>
      <Cam pos={[3.2, 0.7, 14.5]} target={[0.2, 0.7, 0]} fov={20} roll={-0.025} />
      {/* road: two charcoal edge lines and a dashed centre drawn straight on the biscuit floor */}
      {[-2.1, 2.1].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, z]}>
          <planeGeometry args={[200, 0.06]} />
          <meshBasicMaterial color="#3A3631" toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-40 + i * 2.2, 0.003, 0]}>
          <planeGeometry args={[1.1, 0.05]} />
          <meshBasicMaterial color="#3A3631" toneMapped={false} />
        </mesh>
      ))}
      <ContactShadow position={[0, 0.004, 0.0]} />
      <group position={[0, 0, 0.9]} rotation={[0.012, 0, -0.012]}>
        <Mustang spin={1.2} lights={1} />
      </group>
    </Stage>
    <div style={{ position: "absolute", left: 96, bottom: 120, fontFamily: TIGHT, fontWeight: 700, fontSize: 64, letterSpacing: "-0.035em", color: INK, lineHeight: 1.0 }}>
      Beat it.
    </div>
    <Label style={{ left: 96, bottom: 84 }}>1967 · Fastback</Label>
  </AbsoluteFill>
);

export const MustangFrames: React.FC = () => {
  const f = useCurrentFrame();
  return f === 0 ? <Hero /> : f === 1 ? <Exploded /> : <Road />;
};
