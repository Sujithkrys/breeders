// Three look frames for the Sonnet 5.5 product demo, in Pine Pro's exact type and components (one per second):
// 0 the model toggle (Inter Medium 50px), 1 the composer close-up (Pine's Composer, Inter 19px at 2.5x),
// 2 an output full screen (the board deck, Inter Tight Bold).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { Cam, Composer, Pointer, Sparkle } from "../pine-launch/kit";
import { GRAY, INK, SANS } from "../pine-launch/theme";
import { DeckFilm } from "./ClaudePine";

const CLAY = "#D97757";

const ToggleFrame: React.FC = () => {
  const kx = 960 - 400 + 10 + 390;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: SANS, fontSize: 19, color: GRAY }}>Choose a model</div>
      <div style={{ position: "absolute", left: 960 - 400, top: 540 - 68, width: 800, height: 136, borderRadius: 68, background: "#EDEDED", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }} />
      <div style={{ position: "absolute", left: kx, top: 540 - 58, width: 390, height: 116, borderRadius: 58, background: "#FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.12), 0 0 30px rgba(255,255,255,0.5)" }} />
      {["Sonnet 5", "Sonnet 5.5"].map((l, i) => (
        <div key={l} style={{ position: "absolute", left: 960 - 400 + 10 + i * 390, top: 540 - 58, width: 390, height: 116, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: SANS, fontSize: 50, fontWeight: 500, color: i ? INK : "#9A9A9A", letterSpacing: "-0.01em" }}>
          {i === 1 ? <ClaudeMark size={38} color={CLAY} /> : null}
          {l}
        </div>
      ))}
      <Sparkle t={20} at={14} x={kx + 195} y={540} w={410} h={136} dur={30} color="#E9A58C" />
      <Pointer x={kx + 250} y={575} size={40} light={false} />
    </AbsoluteFill>
  );
};

const Tray = () => (
  <>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="file" size={16} color={CLAY} /> Q3 notes.pdf
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="grid" size={16} color="#1E8E5A" /> Q3_numbers.csv
    </span>
  </>
);
const Model = () => (
  <span style={{ fontSize: 15, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
    <ClaudeMark size={15} color={CLAY} /> Sonnet 5.5 <Icon name="chevronDown" size={15} color={GRAY} />
  </span>
);
const ComposerFrame: React.FC = () => (
  <Cam s={2.5} fx={890} fy={515}>
    <div style={{ position: "absolute", left: 550, top: 440 }}>
      <Composer text="Turn these Q3 notes into a board deck" placeholder=" " trayNode={<Tray />} modelNode={<Model />} />
    </div>
  </Cam>
);

const OutputFrame: React.FC = () => <DeckFilm t={78} />;

export const SonnetDemoFrames: React.FC = () => {
  const f = useCurrentFrame();
  const scene = Math.floor(f / 30);
  return scene === 0 ? <ToggleFrame /> : scene === 1 ? <ComposerFrame /> : <OutputFrame />;
};
