import React from "react";
import { AbsoluteFill } from "remotion";
import { BreedersOutro } from "../../brand/Breeders";
import { ease, ramp } from "../../utils";
import { AppIcon, Center, GlowBg, PixelArt, SarvamWordmark, springAt, TextWipe, useS, White } from "../kit";
import { C, FONT } from "../theme";
import { ICON_ORDER, LivePill } from "./Opening";

// 0:42–0:46 — the five tools pull together into "Everything.", then "one workflow."
export const Everything: React.FC = () => {
  const t = useS();
  const glow = ramp(t, [1.95, 2.5], [0, 1], ease.inOut);
  const draw = ramp(t, [2.1, 3.2], [0, 1], ease.inOut);
  return (
    <AbsoluteFill>
      <White />
      <AbsoluteFill style={{ opacity: glow }}>
        <GlowBg t={t + 42} />
      </AbsoluteFill>
      {ICON_ORDER.map((k, i) => {
        const pop = springAt(t, i * 0.03, { damping: 13, stiffness: 170, mass: 0.7 });
        const conv = ramp(t, [0.5, 0.88], [0, 1], ease.in);
        const x0 = (i - 2) * 230;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 960 - 75,
              top: 530 - 75,
              transform: `translateX(${x0 * (1 - conv)}px) scale(${(0.6 + 0.4 * pop) * (1 - conv * 0.75)}) rotate(${conv * (i - 2) * 25}deg)`,
              opacity: Math.min(1, pop * 1.5) * (1 - ramp(t, [0.75, 0.9], [0, 1])),
            }}
          >
            <AppIcon kind={k} size={150} />
          </div>
        );
      })}
      <Center y={520}>
        <TextWipe text="Everything." t={t} at={0.82} out={1.95} size={200} font={FONT.serif} letterSpacing="-0.01em" per={0.035} />
      </Center>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - ramp(t, [3.5, 3.9], [0, 1]) }}>
        {[
          { d: "M-40 600 C 300 470, 620 700, 960 560 S 1600 430, 1960 560", c: "#E8B9B3" },
          { d: "M-40 520 C 360 640, 700 430, 1000 540 S 1560 660, 1960 500", c: "#D2D2D6" },
        ].map((l, i) => (
          <path key={i} d={l.d} fill="none" stroke={l.c} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        ))}
      </svg>
      <Center y={528}>
        <TextWipe text="one workflow." t={t} at={2.25} out={3.5} size={120} per={0.03} />
      </Center>
    </AbsoluteFill>
  );
};

const FLOWER = [".a.a.", "aabaa", ".bcb.", "aabaa", ".a.a."];
const AUDIENCE: { at: number; text: string; rot: number; pal: Record<string, string> }[] = [
  { at: 0.05, text: "For Creators", rot: -6, pal: { a: "#E07A9A", b: "#C23B6B", c: "#8C1C44" } },
  { at: 0.75, text: "For Educators", rot: 0, pal: { a: "#8CC77A", b: "#4E8F3A", c: "#2E6B26" } },
  { at: 1.45, text: "For Agencies", rot: 3, pal: { a: "#F7A77A", b: "#E8672C", c: "#B84A17" } },
  { at: 2.15, text: "For Media Houses", rot: 0, pal: { a: "#A7A3F0", b: "#5B55D6", c: "#2F2A9E" } },
];
export const OFFER_AT = 2.95;

// 0:46–0:50 — who it's for, then the free-minutes offer.
export const Audience: React.FC = () => {
  const t = useS();
  return (
    <AbsoluteFill>
      <White />
      {AUDIENCE.map((a) => {
        const f = springAt(t, a.at, { damping: 11, stiffness: 190, mass: 0.6 });
        const fo = 1 - ramp(t, [a.at + 0.55, a.at + 0.7], [0, 1]);
        return (
          <React.Fragment key={a.text}>
            <Center y={380} style={{ opacity: Math.min(1, f * 1.5) * fo }}>
              <div style={{ transform: `scale(${0.5 + 0.5 * f}) rotate(${(1 - f) * 40}deg)` }}>
                <PixelArt pattern={FLOWER} palette={a.pal} cell={13} />
              </div>
            </Center>
            <Center y={530} style={{ transform: `translateY(-50%) rotate(${a.rot}deg)` }}>
              <TextWipe text={a.text} t={t} at={a.at} out={a.at + 0.5} size={120} per={0.018} dur={0.3} />
            </Center>
          </React.Fragment>
        );
      })}
      <Center y={530}>
        <TextWipe text="Dub your first 30 minutes free." t={t} at={OFFER_AT} out={3.72} size={92} per={0.016} />
      </Center>
    </AbsoluteFill>
  );
};

// 0:50–0:54 — lockup: sarvam, Content Studio, live now at sarvam.ai.
export const Lockup: React.FC = () => {
  const t = useS();
  const out = 1 - ramp(t, [3.4, 3.85], [0, 1], ease.in);
  return (
    <AbsoluteFill>
      <GlowBg t={t + 50} />
      <Center y={392}>
        <SarvamWordmark height={58} t={t} at={0.1} out={3.3} />
      </Center>
      <Center y={528}>
        <TextWipe text="Content Studio" t={t} at={0.62} out={3.3} size={140} per={0.03} />
      </Center>
      <Center y={690} style={{ opacity: out, gap: 26 }}>
        <LivePill t={t} at={1.35} dark />
        <span style={{ fontFamily: FONT.ui, fontSize: 32, color: C.muted, opacity: ramp(t, [1.6, 1.9], [0, 1]) }}>sarvam.ai</span>
      </Center>
    </AbsoluteFill>
  );
};

// 0:54–0:57 — the Breeders end card.
export const Outro: React.FC = () => {
  const t = useS();
  return (
    <AbsoluteFill>
      <BreedersOutro t={t} />
    </AbsoluteFill>
  );
};
