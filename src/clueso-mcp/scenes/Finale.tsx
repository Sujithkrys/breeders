import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CluesoMark, CluesoWordmark } from "../../brand/Logos";
import { cluesoWord } from "../../brand/paths";
import { ease, pop, punch, ramp, SPRING_SOFT, useT } from "../../utils";
import { C, FONT } from "../theme";
import { Background, Caption, Reveal } from "../ui";

// 0:40–0:45 — lockup + tagline, then the wordmark slides into the mark, which centers and flares.
const H = 132;
const MARK_MAX = 190;
const WORD_W = (H * cluesoWord.w) / cluesoWord.h;
const LOCKUP_W = H + WORD_W;
const START_X = 960 - LOCKUP_W / 2;
const EXIT = 92;
const MERGE: [number, number] = [96, 118];
const FLARE = 118;

export const Finale: React.FC = () => {
  const t = useT();
  const logo = pop(t, 0, SPRING_SOFT);
  const p = ramp(t, MERGE, [0, 1], ease.inOut);
  const exit = ramp(t, [EXIT, EXIT + 10], [0, 1], ease.in);

  const markSize = interpolate(p, [0, 1], [H, MARK_MAX]);
  const markCx = interpolate(p, [0, 1], [START_X + H / 2, 960]);
  const cy = interpolate(p, [0, 1], [410, 540]);
  const wordShift = p * WORD_W;

  const streak = ramp(t, [FLARE, FLARE + 4], [0, 1]) * ramp(t, [FLARE + 4, FLARE + 30], [1, 0]);
  const ring = ramp(t, [FLARE, FLARE + 26], [0, 1], ease.out);
  const fadeOut = ramp(t, [134, 146], [0, 1], ease.inOut);
  const sheen = t < MERGE[0] ? ramp(t, [10, 44], [-0.3, 1.3], ease.inOut) : ramp(t, [FLARE + 2, FLARE + 26], [-0.3, 1.3], ease.inOut);

  return (
    <Background glowY={45}>
      <div
        style={{
          position: "absolute",
          left: markCx - 520,
          top: cy - 360,
          width: 1040,
          height: 720,
          background: `radial-gradient(ellipse 45% 45% at 50% 50%, ${C.magenta}4A 0%, transparent 70%)`,
          opacity: ramp(t, [6, 40], [0, 1]) * (1 + 0.5 * streak),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 850,
          top: 540 - 1.5,
          width: 1700,
          height: 3,
          opacity: streak,
          transform: `scaleX(${0.2 + 0.8 * streak})`,
          background: `linear-gradient(90deg, transparent, ${C.pink}AA 30%, #fff 50%, ${C.pink}AA 70%, transparent)`,
          boxShadow: `0 0 24px 4px ${C.pink}66`,
        }}
      />
      {ring > 0 && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 960 - 300 * ring,
            top: 540 - 300 * ring,
            width: 600 * ring,
            height: 600 * ring,
            borderRadius: "50%",
            border: `2px solid ${C.pink}`,
            opacity: (1 - ring) * 0.8,
          }}
        />
      ) : null}

      <div style={{ opacity: Math.min(1, logo * 1.6), filter: logo < 0.9 ? `blur(${(1 - logo) * 8}px)` : undefined }}>
        {/* Wordmark slides left under the mark and is clipped where it passes behind it. */}
        <div
          style={{
            position: "absolute",
            left: markCx + markSize / 2,
            top: cy - H / 2,
            height: H,
            width: WORD_W,
            overflow: "hidden",
            opacity: 1 - p * p,
            transform: `scale(${0.96 + 0.04 * logo})`,
            transformOrigin: "0 50%",
          }}
        >
          <div style={{ transform: `translateX(${-wordShift}px)` }}>
            <CluesoWordmark height={H} color={C.text} sheen={t < MERGE[0] ? sheen * 1.5 - 0.35 : undefined} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: markCx - MARK_MAX / 2,
            top: cy - MARK_MAX / 2,
            width: MARK_MAX,
            height: MARK_MAX,
            transform: `scale(${(markSize / MARK_MAX) * punch(t, FLARE, 0.07)})`,
            filter: `drop-shadow(0 20px 60px ${C.magenta}66)`,
          }}
        >
          <CluesoMark size={MARK_MAX} sheen={t < MERGE[0] ? sheen * 3.2 - 0.3 : sheen} />
        </div>
      </div>

      <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 20}px)`, filter: exit > 0.02 ? `blur(${exit * 8}px)` : undefined }}>
        <Caption y={575}>
          <Reveal text="Describe the video. Your AI agent builds it." start={8} size={56} weight={500} accent={["builds"]} stagger={2} />
        </Caption>
        <Caption y={660}>
          <span
            style={{
              display: "inline-block",
              fontFamily: FONT.mono,
              fontSize: 32,
              color: C.pink,
              opacity: ramp(t, [18, 30], [0, 1]),
              transform: `translateY(${ramp(t, [18, 30], [16, 0])}px)`,
            }}
          >
            clueso.io/mcp
          </span>
        </Caption>
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: C.bg, opacity: fadeOut }} />
    </Background>
  );
};
