// Prototype of the dot world (dev): dive from the India map into a dot city, then a metro station where a commuter
// taps the gate reader and turns gold.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp } from "../utils";
import { DotCanvas } from "./dotworld";
import { metro, METRO, skyline } from "./dotscenes";
import { Caption, WorldMap } from "./film";
import { loadSF, SFD } from "./fonts";
import { INDIA_AT } from "./map";

loadSF();
const MAP_X = 80, MAP_Y = 232.5; // matches film.tsx
export const DotsProto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const ix = MAP_X + INDIA_AT.x, iy = MAP_Y + INDIA_AT.y;
  const dive = ramp(s, [0, 1.9], [0, 1], ease.in);
  const cityIn = ramp(s, [1.35, 2.1], [0, 1], ease.out);
  const cityZoom = 1.9 - 0.9 * ramp(s, [1.35, 3.2], [0, 1], ease.out);
  const toMetro = ramp(s, [3.35, 3.75], [0, 1], ease.inOut);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {s < 2.0 ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(s, [1.4, 1.95]) }}>
          <WorldMap s={99} sc={1.7 + dive * 9} fx={ix} fy={iy} indiaLit={1} pulse={0} />
        </AbsoluteFill>
      ) : null}
      {s >= 1.35 && s < 3.75 ? (
        <AbsoluteFill style={{ opacity: cityIn * (1 - toMetro), transform: `scale(${cityZoom})`, transformOrigin: "50% 80%" }}>
          <DotCanvas field={skyline(s)} seed="sky" />
        </AbsoluteFill>
      ) : null}
      {s >= 3.35 ? (
        <AbsoluteFill style={{ opacity: toMetro }}>
          <DotCanvas field={metro(s, 3.5)} seed="metro" />
          <div style={{ position: "absolute", left: 140, top: 120 }}>
            <Caption s={s} at={3.9} lead="At the" punch="metro." size={110} />
          </div>
          <div style={{ position: "absolute", left: METRO.reader.x - 90, top: 420, opacity: ramp(s, [METRO.tap + 0.3, METRO.tap + 0.6]) * (1 - ramp(s, [7.6, 7.9])) }}>
            <div style={{ fontFamily: SFD, fontWeight: 600, fontSize: 64, letterSpacing: "-0.02em", color: "#fff", whiteSpace: "nowrap" }}>{""}Pay</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// Each place at its gold moment (dev): frame i shows place i.
import { AIRPORT, CAFE, FUEL, METRO_COUNTER, ONLINE, STORE, WRIST } from "./places";
const PLACES = [METRO_COUNTER, CAFE, FUEL, STORE, AIRPORT, WRIST, ONLINE];
export const PlacesProof: React.FC = () => {
  const f = useCurrentFrame();
  const p = PLACES[Math.min(PLACES.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DotCanvas field={p.field(p.tap + 0.45, 0)} seed={p.name} />
    </AbsoluteFill>
  );
};
