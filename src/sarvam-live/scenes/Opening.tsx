import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, ramp } from "../../utils";
import { APP_ICONS, AppIcon, Center, GlowBg, GreenField, IconKind, SarvamWordmark, springAt, TextWipe, useS } from "../kit";
import { C, FONT } from "../theme";

export const LivePill: React.FC<{ t: number; at: number; label?: string; size?: number; dark?: boolean }> = ({ t, at, label = "Live now", size = 30, dark }) => {
  const p = springAt(t, at, { damping: 12, stiffness: 180, mass: 0.7 });
  const pulse = (t - at) % 1.2;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.45,
        padding: `${size * 0.38}px ${size * 0.8}px ${size * 0.38}px ${size * 0.62}px`,
        borderRadius: size * 2,
        background: dark ? "#F3F7EE" : "rgba(255,255,255,0.94)",
        border: dark ? "1px solid #DCEBCB" : "none",
        boxShadow: dark ? "none" : "0 10px 30px rgba(60,90,30,0.14)",
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${0.7 + 0.3 * p}) translateY(${(1 - p) * 16}px)`,
        fontFamily: FONT.ui,
        fontSize: size,
        fontWeight: 500,
        color: C.ink,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ position: "relative", width: size * 0.42, height: size * 0.42 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#3FA535" }} />
        {t > at ? (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#3FA535",
              transform: `scale(${1 + pulse * 1.6})`,
              opacity: 0.5 * (1 - pulse / 1.2),
            }}
          />
        ) : null}
      </span>
      {label}
    </div>
  );
};

// 0:00–0:04 — sarvam → Content Studio · Live now, on the film's green field.
export const Hook: React.FC = () => {
  const t = useS();
  const out = ramp(t, [3.55, 3.9], [1, 0], ease.in);
  return (
    <AbsoluteFill>
      <GreenField t={t} />
      <Center y={520}>
        <SarvamWordmark height={66} color="#FFFFFF" t={t} at={0.3} out={1.5} per={0.075} />
      </Center>
      <Center y={505}>
        <TextWipe text="Content Studio" t={t} at={1.8} out={3.45} size={132} color="#FFFFFF" per={0.03} />
      </Center>
      <Center y={660} style={{ opacity: out }}>
        <LivePill t={t} at={2.5} />
      </Center>
    </AbsoluteFill>
  );
};

export const ICON_ORDER: IconKind[] = ["tts", "dub", "library", "clone", "stt"];

// 0:04–0:08 — "Meet every product inside." with the five product tiles.
export const Meet: React.FC = () => {
  const t = useS();
  const leave = ramp(t, [3.25, 3.85], [0, 1], ease.in);
  const grey = ramp(t, [3.55, 4.0], [0, 1], ease.inOut);
  return (
    <AbsoluteFill>
      <GlowBg t={t + 4} />
      <AbsoluteFill style={{ transform: `scale(${1 + leave * 0.12})` }}>
        <Center y={372}>
          <TextWipe text="Meet every product inside." t={t} at={0.15} out={3.2} size={100} per={0.022} />
        </Center>
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, display: "flex", justifyContent: "center", gap: 64 }}>
          {ICON_ORDER.map((k, i) => {
            const p = springAt(t, 0.9 + i * 0.12, { damping: 13, stiffness: 150, mass: 0.8 });
            const lp = ramp(t, [1.1 + i * 0.12, 1.5 + i * 0.12], [0, 1], ease.out);
            const bob = Math.sin(t * 2 + i * 0.35) * 3;
            const up = leave * (120 + i * 18);
            return (
              <div
                key={k}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 22,
                  opacity: Math.min(1, p * 1.4) * (1 - leave),
                  transform: `translateY(${(1 - p) * 90 + bob - up}px) scale(${0.75 + 0.25 * p})`,
                  filter: leave > 0.02 ? `blur(${leave * 10}px)` : undefined,
                }}
              >
                <AppIcon kind={k} size={148} />
                <span style={{ fontFamily: FONT.ui, fontSize: 25, color: C.ink2, opacity: lp, transform: `translateY(${(1 - lp) * 8}px)` }}>{APP_ICONS[k].label}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: C.stage, opacity: grey }} />
    </AbsoluteFill>
  );
};
