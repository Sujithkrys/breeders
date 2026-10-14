// Review sheet for the logo: redrawn wordmark (red) over the source screenshot, plus lockups on light and dark.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Emblem, Lockup, Wordmark } from "./Breeders";

export const LogoCheck: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <div style={{ position: "absolute", left: 60, top: 40, width: 453 * 3.6, height: 200 * 3.6, background: "#000" }}>
      <Img src={staticFile("brand/wordmark-source.png")} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
      <div style={{ position: "absolute", left: 20.5 * 3.6, top: 64.75 * 3.6, opacity: 0.55 }}>
        <Wordmark height={63 * 3.6} color="#ff2a2a" />
      </div>
    </div>
    <div style={{ position: "absolute", left: 60, top: 790, width: 860, height: 250, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee" }}>
      <Lockup height={120} />
    </div>
    <div style={{ position: "absolute", left: 960, top: 790, width: 900, height: 250, background: "#0F0F10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Lockup height={120} color="#fff" />
    </div>
    <div style={{ position: "absolute", right: 60, top: 60 }}><Emblem height={160} /></div>
  </AbsoluteFill>
);
