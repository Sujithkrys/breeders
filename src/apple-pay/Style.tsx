// Style frames for the Apple Pay film's typography, on real shots from the reference ads (dev only).
// Type system: Inter Tight (closest free cut to SF Pro Display). Small lead 46/500/-0.01em, big punch 132/600/-0.035em,
// both on one baseline, left-aligned at a 140px margin in the lower third over footage; centred titles over white.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

const F = "'Inter Tight', Inter, sans-serif";
export const T = {
  small: { fontFamily: F, fontSize: 46, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1 } as React.CSSProperties,
  big: { fontFamily: F, fontSize: 132, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 0.95 } as React.CSSProperties,
  shadow: "0 2px 28px rgba(0,0,0,0.35)",
};
const Mixed: React.FC<{ lead: string; punch: string; color: string; shadow?: boolean }> = ({ lead, punch, color, shadow }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 20, color, textShadow: shadow ? T.shadow : undefined }}>
    <span style={T.small}>{lead}</span>
    <span style={T.big}>{punch}</span>
  </div>
);

export const ApplePayStyle: React.FC = () => {
  const f = useCurrentFrame();
  if (f === 0)
    return (
      <AbsoluteFill>
        <Img src={staticFile("applepay/ref/pro_7.4.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 140, bottom: 150 }}>
          <Mixed lead="Pay without" punch="PIN or OTP." color="#fff" shadow />
        </div>
      </AbsoluteFill>
    );
  if (f === 1)
    return (
      <AbsoluteFill style={{ background: "#F5F5F7" }}>
        <Img src={staticFile("applepay/ref/duo_56.6.jpg")} style={{ position: "absolute", left: 0, top: 230, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, textAlign: "center", color: "#1D1D1F" }}>
          <div style={{ ...T.big, fontSize: 112 }}>Apple Pay</div>
          <div style={{ ...T.small, fontSize: 44, color: "#6E6E73", marginTop: 14 }}>Now in India.</div>
        </div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill>
      <Img src={staticFile("applepay/ref/pro_9.2.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 140, bottom: 170 }}>
        <Mixed lead="Just" punch="double-click." color="#fff" shadow />
      </div>
    </AbsoluteFill>
  );
};
