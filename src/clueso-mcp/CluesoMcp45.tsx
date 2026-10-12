import React from "react";
import { AbsoluteFill } from "remotion";
import { ramp, useT } from "../utils";
import { CluesoMcp45Sfx } from "./CluesoMcp45-Sfx";
import { ColdOpen } from "./scenes/ColdOpen";
import { Describe } from "./scenes/Describe";
import { Finale } from "./scenes/Finale";
import { Mcp } from "./scenes/Mcp";
import { Offer } from "./scenes/Offer";
import { Problem } from "./scenes/Problem";
import { Proof } from "./scenes/Proof";
import { Ship } from "./scenes/Ship";
import { C, DISSOLVE, SCENES } from "./theme";
import { Seq } from "./ui";

const FadeIn: React.FC<{ units: number; children: React.ReactNode }> = ({ units, children }) => {
  const t = useT();
  return <AbsoluteFill style={{ opacity: ramp(t, [0, units], [0, 1], (x) => x) }}>{children}</AbsoluteFill>;
};

// Every boundary is a hard cut except problem → mcp, the brief's single dissolve.
export const CluesoMcp45: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <CluesoMcp45Sfx />
    <Seq from={SCENES.coldOpen.from} dur={SCENES.coldOpen.dur} name="0:00 Cold open">
      <ColdOpen />
    </Seq>
    <Seq from={SCENES.problem.from} dur={SCENES.problem.dur + DISSOLVE} name="0:04 Problem">
      <Problem />
    </Seq>
    <Seq from={SCENES.mcp.from} dur={SCENES.mcp.dur} name="0:10 What MCP is">
      <FadeIn units={DISSOLVE}>
        <Mcp />
      </FadeIn>
    </Seq>
    <Seq from={SCENES.describe.from} dur={SCENES.describe.dur} name="0:18 Describe it">
      <Describe />
    </Seq>
    <Seq from={SCENES.ship.from} dur={SCENES.ship.dur} name="0:25 Ship it">
      <Ship />
    </Seq>
    <Seq from={SCENES.proof.from} dur={SCENES.proof.dur} name="0:30 Use cases">
      <Proof />
    </Seq>
    <Seq from={SCENES.offer.from} dur={SCENES.offer.dur} name="0:37 Free minutes offer">
      <Offer />
    </Seq>
    <Seq from={SCENES.finale.from} dur={SCENES.finale.dur} name="0:40 Lockup + logo outro">
      <Finale />
    </Seq>
  </AbsoluteFill>
);
