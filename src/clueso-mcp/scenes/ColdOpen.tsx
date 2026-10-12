import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { CluesoMark } from "../../brand/Logos";
import { ease, punch, ramp, u, useT } from "../../utils";
import { C } from "../theme";
import { Background, Camera, Caption, Reveal } from "../ui";

// 0:00–0:04 — particles converge → mark swings in and traces → lock hit + light streak → headline.
const LOCK = 44;
const PARTICLES = 46;

export const ColdOpen: React.FC = () => {
  const t = useT();

  const enter = ramp(t, [12, LOCK], [0, 1], ease.out);
  const scale = interpolate(enter, [0, 1], [0.3, 1]) * punch(t, LOCK, 0.05);
  const blur = interpolate(enter, [0, 0.7, 1], [14, 2, 0]);
  const trace = ramp(t, [8, LOCK - 4], [0, 1], ease.inOut);
  const fill = ramp(t, [26, LOCK + 2], [0, 1]);
  const outline = ramp(t, [LOCK + 2, LOCK + 18], [1, 0]);
  const lift = ramp(t, [56, 78], [0, -u(9)], ease.inOut);
  const bloom = ramp(t, [0, 20], [0, 1]) * ramp(t, [LOCK, LOCK + 50], [1, 0.45]);
  const streak = ramp(t, [LOCK, LOCK + 4], [0, 1]) * ramp(t, [LOCK + 4, LOCK + 34], [1, 0]);
  const sheen = ramp(t, [LOCK + 8, LOCK + 34], [-0.3, 1.3], ease.inOut);

  return (
    <Background glowY={45}>
      <Camera scale={ramp(t, [0, 120], [1, 1.05], ease.linear)}>
        {/* Converging particles */}
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: PARTICLES }, (_, i) => {
            const angle = random(`a${i}`) * Math.PI * 2;
            const dist = 420 + random(`d${i}`) * 700;
            const start = random(`s${i}`) * 14;
            const p = ramp(t, [start, start + 30], [0, 1], ease.in);
            if (p <= 0 || p >= 1) return null;
            const r = dist * (1 - p);
            const tail = Math.min(140, 18 + p * 160);
            const x = 960 + Math.cos(angle) * r;
            const y = 540 + Math.sin(angle) * r;
            const x2 = 960 + Math.cos(angle) * (r + tail);
            const y2 = 540 + Math.sin(angle) * (r + tail);
            return (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x2}
                y2={y2}
                stroke={i % 3 === 0 ? "#fff" : C.pink}
                strokeWidth={1.5 + random(`w${i}`) * 1.5}
                strokeLinecap="round"
                opacity={Math.sin(p * Math.PI) * 0.9}
              />
            );
          })}
        </svg>

        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              width: 1000,
              height: 1000,
              borderRadius: "50%",
              transform: `translateY(${lift}px)`,
              opacity: bloom,
              background: `radial-gradient(circle, ${C.pink}50 0%, ${C.magenta}1E 26%, transparent 60%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 1700,
              height: 3,
              transform: `translateY(${lift}px) scaleX(${0.2 + 0.8 * streak})`,
              opacity: streak,
              background: `linear-gradient(90deg, transparent, ${C.pink}AA 30%, #fff 50%, ${C.pink}AA 70%, transparent)`,
              boxShadow: `0 0 24px 4px ${C.pink}66`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#fff",
              opacity: ramp(t, [2, 10], [0, 1]) * ramp(t, [26, 40], [1, 0]),
              boxShadow: `0 0 50px 20px ${C.pink}`,
            }}
          />
          <div style={{ perspective: 900, transform: `translateY(${lift}px)` }}>
            <div
              style={{
                transform:
                  enter < 0.999
                    ? `scale(${scale}) rotateY(${interpolate(enter, [0, 1], [-70, 0])}deg) rotateX(${interpolate(enter, [0, 1], [24, 0])}deg)`
                    : `scale(${scale})`,
                filter: blur > 0.2 ? `blur(${blur}px)` : `drop-shadow(0 20px 60px ${C.magenta}55)`,
              }}
            >
              <CluesoMark size={240} strokeProgress={trace} strokeOpacity={outline} fillOpacity={fill} sheen={t > LOCK ? sheen : undefined} />
            </div>
          </div>
        </AbsoluteFill>
      </Camera>
      <Caption y={710}>
        <Reveal text="Every feature ships with a video." start={60} size={84} accent={["video."]} />
      </Caption>
    </Background>
  );
};
