import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { ease, kf, pop, punch, ramp, u, useT } from "../../utils";
import { Icon } from "../icons";
import { AgentApp, AGENT_H, AGENT_W, PROMPT, REPLY, STEPS } from "../mock/AgentApp";
import { EXPORT_BTN } from "../mock/AppShot";
import { CAPTION_WORDS, CluesoEditor, ED_H, ED_W } from "../mock/CluesoEditor";
import { C, FONT } from "../theme";
import { Background, Camera, Caption, Chip, Reveal, Scrim, Seq } from "../ui";

// 0:18–0:25 — prompt in the agent app → tool call → 5 fast-forward cuts inside the Clueso editor.
const CUTS = 110;
const SHOT = 20;
const TYPE_START = 6;
const SEND = 46;

// Slightly irregular typing rhythm so it reads as a person, not a ticker.
const typedAt = (t: number) => {
  let acc = TYPE_START;
  for (let i = 0; i < PROMPT.length; i++) {
    acc += 0.55 + random(`k${i}`) * 0.6 + (PROMPT[i] === " " ? 0.4 : 0);
    if (t < acc) return i;
  }
  return PROMPT.length;
};

export const Describe: React.FC = () => (
  <Background glowY={30}>
    <Seq from={0} dur={CUTS}>
      <ChatPhase />
      <Scrim from={66} />
      <Caption y={985}>
        <Reveal text="Describe it." size={76} start={2} />
      </Caption>
    </Seq>
    <Seq from={CUTS}>
      <BuildPhase />
    </Seq>
  </Background>
);

const ChatPhase: React.FC = () => {
  const t = useT();
  const sendPress = ramp(t, [SEND - 3, SEND], [0, 1]) * ramp(t, [SEND, SEND + 4], [1, 0]);
  const replyLen = Math.floor(ramp(t, [56, 76], [0, REPLY.length], ease.linear));
  const stepsDone = Math.floor(ramp(t, [74, 106], [0, STEPS.length], ease.linear));

  const scale = kf(t, [0, 50, 110], [0.97, 1.02, 1.22]);
  const y = kf(t, [0, 50, 70, 110], [10, 0, -30, -190]);
  const x = kf(t, [0, 70, 110], [0, 0, -50]);

  return (
    <Camera scale={scale * punch(t, 0, 0.04)} y={y} x={x} rx={kf(t, [0, 110], [7, 2])} ry={kf(t, [0, 110], [-7, -1])}>
      <div style={{ position: "absolute", left: (1920 - AGENT_W) / 2, top: 470 - AGENT_H / 2, width: AGENT_W, height: AGENT_H, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: "0 1px 0 rgba(255,255,255,0.07) inset, 0 60px 140px rgba(0,0,0,0.6)" }}>
        <AgentApp
          t={t}
          typed={PROMPT.slice(0, typedAt(t))}
          caret={t < SEND && Math.floor(t / 7) % 2 === 0}
          sent={t >= SEND}
          userBubble={pop(t, SEND)}
          sendPress={sendPress}
          reply={REPLY.slice(0, replyLen)}
          tool={pop(t, 70)}
          stepsDone={stepsDone}
        />
      </div>
    </Camera>
  );
};

type Shot = { fx: number; fy: number; z: number; rx: number; ry: number };
// Focus point (editor coords) lands at screen (960, ANCHOR_Y), keeping the UI clear of the caption.
const ANCHOR_Y = 430;
const SHOTS: Shot[] = [
  { fx: 660, fy: 780, z: 1.2, rx: 6, ry: -4 },
  { fx: 580, fy: 360, z: 1.45, rx: 3, ry: 5 },
  { fx: 900, fy: 270, z: 1.75, rx: -2, ry: -3 },
  { fx: 1150, fy: 330, z: 1.45, rx: 3, ry: -5 },
  { fx: 800, fy: 460, z: 1.0, rx: 0, ry: 0 },
];
const LABELS = ["Assembling clips", "Voiceover & captions", "Auto-zoom", "Brand kit", "Ready"];

const BuildPhase: React.FC = () => {
  const T = useT();
  const cut = Math.min(SHOTS.length - 1, Math.floor(T / SHOT));
  const local = T - cut * SHOT;
  const shot = SHOTS[cut];
  const drift = ramp(local, [0, SHOT], [0, 1], ease.linear);
  const z = shot.z * (cut === 4 ? interpolate(drift, [0, 1], [1.02, 0.95]) : 1 + drift * 0.05) * punch(local, 0, cut === 4 ? 0.02 : 0.07);
  const S = 1.2 * z;

  // Editor state accumulates across cuts so the shots read as one continuous build.
  const cursorP = ramp(T, [42, 50], [0, 1], ease.inOut);
  const state = {
    clips: ramp(T, [0, 14], [0, 1], ease.linear),
    voice: ramp(T, [2, 40], [0, 1], ease.linear),
    music: ramp(T, [6, 30], [0, 1], ease.linear),
    captions: ramp(T, [18, 36], [0, 1], ease.linear),
    showCaption: ramp(T, [20, 24], [0, 1]) * (T < 40 ? 1 : 0),
    activeWord: Math.floor(ramp(T, [22, 40], [0, CAPTION_WORDS.length], ease.linear)),
    scriptActive: T < 20 ? 0 : 1,
    scriptProgress: ramp(T, [16, 34], [0.25, 1], ease.linear),
    zooms: ramp(T, [44, 56], [0, 1], ease.linear),
    previewZoom: T < 60 ? ramp(T, [48, 58], [1, 1.7], ease.inOut) : 1,
    // Origin chosen so the Export button stays fully inside the preview at 1.7×.
    previewOrigin: [1230, 150] as [number, number],
    previewCursor:
      T >= 40 && T < 60
        ? {
            x: interpolate(cursorP, [0, 1], [880, EXPORT_BTN.cx]),
            y: interpolate(cursorP, [0, 1], [420, EXPORT_BTN.cy]),
            press: ramp(T, [49, 50], [0, 1]) * ramp(T, [51, 53], [1, 0]),
            ripple: ramp(T, [50, 58], [0, 1], ease.out),
          }
        : undefined,
    app: { selected: Math.floor(ramp(T, [20, 40], [0, 4], ease.linear)) + 2, exportPressed: T > 50 && T < 54 },
    brand: ramp(T, [60, 76], [0, 1], ease.linear),
    titleCard: ramp(T, [64, 74], [0, 1], ease.out),
    playhead: ramp(T, [0, 100], [0.05, 0.62], ease.linear),
    exported: ramp(T, [84, 92], [0, 1], ease.out),
  };

  return (
    <AbsoluteFill>
      <Camera rx={shot.rx * (1 - drift * 0.5)} ry={shot.ry * (1 - drift * 0.5)}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: ED_W,
            height: ED_H,
            transformOrigin: "0 0",
            transform: `translate(${960 - shot.fx * S}px, ${ANCHOR_Y - shot.fy * S}px) scale(${S})`,
          }}
        >
          <CluesoEditor {...state} />
        </div>
      </Camera>
      <Scrim from={58} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg}D9 0%, transparent 16%)` }} />
      <div style={{ position: "absolute", left: u(6), top: u(5), display: "flex", gap: u(1.5) }}>
        <Chip style={{ fontSize: 18, padding: "8px 14px", color: C.pink, backgroundColor: "rgba(20,20,25,0.85)" }}>
          <Icon name="play" size={14} />
          <Icon name="play" size={14} style={{ marginLeft: -10 }} />
          8×
        </Chip>
        <Chip style={{ fontSize: 18, padding: "8px 14px", color: C.text, backgroundColor: "rgba(20,20,25,0.85)", fontFamily: FONT.mono }}>
          {String(cut + 1).padStart(2, "0")} · {LABELS[cut]}
        </Chip>
      </div>
      <Caption y={965}>
        <Reveal text="It builds it." size={80} accent={["builds"]} start={0} />
      </Caption>
    </AbsoluteFill>
  );
};
