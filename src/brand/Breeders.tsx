// Breeders brand: the one place the page's identity lives. Every film imports its watermark, avatar, accent and end
// card from here, so the final logo drops in by editing this file alone.
// PLACEHOLDER: the wordmark below stands in until the logo is chosen.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, ramp } from "../utils";

export const BRAND = { name: "Breeders", handle: "@breeders" };
// accent used by the films' big punch words (was the old page's red; kept until the brand colours are set)
export const ACCENT = "#D2232A";
const INK = "#0F0F10";
export const LOGO_FONT = "'Inter Tight', Inter, sans-serif";

// the mark: placeholder monogram until the logo is chosen
export const Mark: React.FC<{ size: number; color?: string; bg?: string }> = ({ size, color = "#FFFFFF", bg = INK }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: LOGO_FONT, fontWeight: 800, fontSize: size * 0.62, letterSpacing: "-0.05em", color, lineHeight: 1, flexShrink: 0 }}>
    B
  </div>
);

// Small persistent credit, bottom centre.
export const Watermark: React.FC<{ opacity: number; font?: string; dark?: number }> = ({ opacity, dark = 0 }) =>
  opacity <= 0 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity, pointerEvents: "none" }}>
      <Mark size={28} color={dark > 0.5 ? INK : "#FFFFFF"} bg={dark > 0.5 ? "rgba(255,255,255,0.9)" : "rgba(15,15,16,0.85)"} />
      <span style={{ fontFamily: LOGO_FONT, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: dark > 0.5 ? "rgba(255,255,255,0.9)" : "rgba(15,15,16,0.82)", textShadow: dark > 0.5 ? "0 0 3px rgba(0,0,0,0.85), 0 1px 14px rgba(0,0,0,0.7)" : "0 1px 8px rgba(255,255,255,0.7)" }}>
        {BRAND.name}
      </span>
    </div>
  );

// Round profile avatar for mock UIs (in place of a user photo).
export const BrandAvatar: React.FC<{ size: number }> = ({ size }) => <Mark size={size} />;

// End card: mark pops, name slides out beside it. `t` is seconds since the card began.
export const OUTRO_LEN = 3;
export const BreedersOutro: React.FC<{ t: number }> = ({ t }) => {
  const m = ramp(t, [0, 0.45], [0, 1], ease.out);
  const w = ramp(t, [0.35, 0.95], [0, 1], ease.inOut);
  const out = ramp(t, [OUTRO_LEN - 0.4, OUTRO_LEN], [0, 1], ease.in);
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * m})`, opacity: m }}>
          <Mark size={140} />
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontFamily: LOGO_FONT, fontWeight: 800, fontSize: 136, letterSpacing: "-0.045em", color: INK, lineHeight: 1.1, transform: `translateX(${(1 - w) * -100}%)` }}>{BRAND.name}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
