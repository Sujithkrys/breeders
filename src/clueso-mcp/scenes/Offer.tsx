import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, kf, pop, ramp, SPRING_SOFT, u, useT } from "../../utils";
import { Icon } from "../icons";
import { C, FONT } from "../theme";
import { Background, Camera, Caption, Chip, gradientText, Reveal } from "../ui";

// 0:37–0:40 — free-minutes offer: ring timer fills while the count climbs to 10.
const R = 150;
const TICKS = 60;

export const Offer: React.FC = () => {
  const t = useT();
  const fill = ramp(t, [6, 40], [0, 1], ease.inOut);
  const count = Math.round(fill * 10);
  const ring = pop(t, 0, SPRING_SOFT);
  const chip = pop(t, 2);
  const done = t > 40 ? ramp(t, [40, 56], [1, 0]) : 0;
  const circ = 2 * Math.PI * R;

  return (
    <Background glowY={40}>
      <Camera scale={kf(t, [0, 90], [1, 1.04], ease.linear)}>
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 150, opacity: Math.min(1, chip * 1.6), transform: `translateY(${(1 - chip) * 20}px)` }}>
            <Chip style={{ fontSize: 20, padding: "8px 16px", color: C.text, borderRadius: 999 }}>
              <Icon name="sparkles" size={18} color={C.pink} /> Now on Clueso
            </Chip>
          </div>
          <div
            style={{
              position: "absolute",
              top: 440 - R - 20,
              width: 2 * R + 40,
              height: 2 * R + 40,
              opacity: Math.min(1, ring * 1.6),
              transform: `scale(${0.85 + 0.15 * ring})`,
            }}
          >
            <svg width={2 * R + 40} height={2 * R + 40} viewBox={`${-R - 20} ${-R - 20} ${2 * R + 40} ${2 * R + 40}`} style={{ position: "absolute", overflow: "visible" }}>
              <defs>
                <linearGradient id="offer-ring" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={C.pink} />
                  <stop offset="1" stopColor={C.magenta} />
                </linearGradient>
              </defs>
              {Array.from({ length: TICKS }, (_, i) => {
                const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
                const lit = i / TICKS < fill;
                const long = i % 6 === 0;
                return (
                  <line
                    key={i}
                    x1={Math.cos(a) * (R + 12)}
                    y1={Math.sin(a) * (R + 12)}
                    x2={Math.cos(a) * (R + (long ? 26 : 19))}
                    y2={Math.sin(a) * (R + (long ? 26 : 19))}
                    stroke={lit ? C.pink : C.surface4}
                    strokeWidth={long ? 3 : 2}
                    strokeLinecap="round"
                  />
                );
              })}
              <circle r={R} fill={C.surface} stroke={C.line} strokeWidth={1} />
              <circle r={R - 14} fill="none" stroke={C.surface3} strokeWidth={10} />
              <circle
                r={R - 14}
                fill="none"
                stroke="url(#offer-ring)"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${(circ - 88) * fill} ${circ}`}
                transform="rotate(-90)"
                style={{ filter: `drop-shadow(0 0 ${8 + 16 * done}px ${C.pink}88)` }}
              />
            </svg>
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", ...gradientText }}>
                {count}
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.2em", color: C.muted, marginTop: u(1) }}>MIN</span>
            </AbsoluteFill>
          </div>
        </AbsoluteFill>
      </Camera>
      <Caption y={720}>
        <Reveal text="10 free minutes of AI editing." start={14} size={80} accent={["free"]} />
      </Caption>
      <Caption y={812}>
        <Reveal text="Connect your AI agent and start building — on us." start={24} size={32} weight={500} family={FONT.sans} color={C.muted} letterSpacing="-0.01em" stagger={1.5} />
      </Caption>
    </Background>
  );
};
