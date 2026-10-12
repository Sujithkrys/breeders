import React from "react";
import { AbsoluteFill, random } from "remotion";
import { ease, ramp } from "../../utils";
import { AppStage, Cam } from "../AppStage";
import { Center, cursorAt, Cursor, PixelArt, springAt, TextWipe, TopCaption, track, useS, WaveBars, White } from "../kit";
import { AppFrame, ClonePage, Feedback, HistoryBtn, HistoryDrawer, TTS_LEN, TTSPage } from "../mock/Studio";
import { C, FONT } from "../theme";

export const TTS = { typeFrom: 0.45, typeTo: 2.9, pick: 3.95, gen: 5.05, wave: 5.55, waveOut: 6.85, history: 6.95 };

// 0:22–0:30 — Text to Speech: Hindi script streams in, pick Ritu, Generate, the voice plays, History slides in.
export const Tts: React.FC = () => {
  const t = useS();
  const T = TTS;
  const enter = ramp(t, [0, 0.45], [0, 1], ease.out);
  const cam: Cam = {
    z: track(t, [[0, 1.3], [3.0, 1.3], [3.65, 1.04]]),
    fx: track(t, [[0, 640], [3.0, 640], [3.65, 600]]),
    fy: track(t, [[0, 300], [3.0, 300], [3.65, 331]]),
  };
  const chars = Math.round(ramp(t, [T.typeFrom, T.typeTo], [0, TTS_LEN], (v) => v));
  const cur = cursorAt(
    t,
    [
      [3.0, 1190, 720],
      [3.75, 960, 381],
      [4.35, 960, 381],
      [4.95, 588, 590],
    ],
    [T.pick, T.gen],
  );
  const generating = t >= T.gen && t < T.wave + 0.1 ? 1 : 0;
  const veil = ramp(t, [T.wave - 0.05, T.wave + 0.25], [0, 1], ease.out) * (1 - ramp(t, [T.waveOut, T.waveOut + 0.25], [0, 1], ease.in));
  const tilt = ramp(t, [T.wave + 0.05, T.wave + 0.55], [1, 0], ease.out);
  const waveIn = ramp(t, [T.wave, T.wave + 0.3], [0, 1], ease.out);
  const drawer = ramp(t, [T.history, T.history + 0.4], [0, 1], ease.out);
  return (
    <AbsoluteFill>
      <AppStage cam={cam} enter={enter}>
        <AppFrame page="tts" title="Text to Speech" headerRight={<><HistoryBtn /><Feedback /></>}>
          <TTSPage chars={chars} voice={t >= T.pick + 0.02 ? 1 : 0} hoverVoice={t > 3.7 && t < T.pick ? 1 : -1} generating={generating} t={t} />
        </AppFrame>
        <HistoryDrawer p={drawer} t={t} at={T.history + 0.12} />
        <Cursor {...cur} opacity={ramp(t, [3.0, 3.2], [0, 1]) * (1 - ramp(t, [5.4, 5.6], [0, 1]))} size={26} />
      </AppStage>
      {veil > 0 ? (
        <AbsoluteFill style={{ background: `rgba(255,255,255,${0.93 * veil})`, alignItems: "center", justifyContent: "center" }}>
          <div style={{ opacity: waveIn * veil, transform: `scale(${0.85 + 0.15 * waveIn})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
            <WaveBars t={t} height={320} barW={20} gap={24} tilt={tilt} seed="ritu" />
            <span style={{ fontFamily: FONT.ui, fontSize: 30, color: C.muted }}>
              <span style={{ color: C.ink, fontWeight: 500 }}>Ritu</span> · Hindi
            </span>
          </div>
        </AbsoluteFill>
      ) : null}
      <TopCaption text="Type it. Hear it. In your language." t={t} at={0.3} out={7.5} />
    </AbsoluteFill>
  );
};

const CLONE_FIGURE = [
  "....aaa.....",
  "...aaaaa....",
  "...abbba....",
  "...aaaaa....",
  "....aaa.....",
  "..aaaaaaa...",
  ".aa.aaa.aa..",
  ".a..aaa..a..",
  "....a.a.....",
  "..c.c.c.c.c.",
  ".c.c.c.c.c..",
  "..c.c.c.c.c.",
];

export const CLONE = { click: 1.35, recFrom: 2.0, recTo: 3.8, card: 4.2 };
const READ = "I really love walking beside the river in the evening, when the day begins to cool down. The water stays calm and clear, and the fresh air carries the smell of wet earth.";

// 0:30–0:36 — Voice cloning: Start cloning → read a line → your cloned voice lands, named Breeders.
export const Clone: React.FC = () => {
  const t = useS();
  const K = CLONE;
  const intro = 1 - ramp(t, [1.5, 1.85], [0, 1], ease.in);
  const btn = springAt(t, 0.8);
  const cur = cursorAt(t, [[0.55, 1480, 900], [1.15, 972, 604]], [K.click]);
  const rec = ramp(t, [1.75, 2.1], [0, 1], ease.out) * (1 - ramp(t, [3.95, 4.25], [0, 1], ease.in));
  const bars = ramp(t, [K.recFrom, K.recTo], [0, 1], (v) => v);
  const card = springAt(t, K.card, { damping: 14, stiffness: 140, mass: 0.8 });
  const leave = ramp(t, [5.6, 5.95], [0, 1], ease.in);
  const N = 84;
  const secs = Math.min(4, Math.floor(bars * 4.9));
  return (
    <AbsoluteFill>
      <White />
      <AbsoluteFill style={{ opacity: 1 - leave }}>
        {intro > 0 ? (
          <AbsoluteFill style={{ opacity: intro, transform: `translateY(${(1 - intro) * -30}px)` }}>
            <Center y={332}>
              <PixelArt pattern={CLONE_FIGURE} palette={{ a: "#4E8F3A", b: "#A5D08C", c: "#7DB463" }} cell={10} t={t} at={0.05} spread={0.55} seed="clone" />
            </Center>
            <Center y={482}>
              <TextWipe text="Clone your voice" t={t} at={0.35} size={50} font={FONT.ui} weight={500} per={0.025} />
            </Center>
            <Center y={540}>
              <TextWipe text="Powered by Sarvam's voice synthesis in 12 Indian languages." t={t} at={0.55} size={25} font={FONT.ui} color={C.muted} per={0.008} dur={0.3} letterSpacing="0" />
            </Center>
            <Center y={622}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 34px", borderRadius: 34, background: C.ink, color: "#fff", fontFamily: FONT.ui, fontSize: 24, fontWeight: 500, opacity: btn, transform: `scale(${(0.8 + 0.2 * btn) * (1 - cur.press * 0.05)})` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 4.5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM6 10.5a6 6 0 0 0 12 0M12 16.5V20" />
                </svg>
                Start cloning
              </div>
            </Center>
            <Cursor {...cur} opacity={ramp(t, [0.55, 0.75], [0, 1])} size={34} />
          </AbsoluteFill>
        ) : null}
        {rec > 0 ? (
          <AbsoluteFill style={{ opacity: rec, transform: `translateY(${(1 - rec) * 30}px)` }}>
            <div style={{ position: "absolute", left: 460, top: 250, width: 1000 }}>
              <div style={{ fontFamily: FONT.ui, fontSize: 22, color: C.muted, marginBottom: 16 }}>Read this out loud</div>
              <div style={{ fontFamily: FONT.ui, fontSize: 34, lineHeight: 1.45, color: C.ink }}>{READ}</div>
            </div>
            <div style={{ position: "absolute", left: 460, top: 560, width: 1000, height: 200, borderRadius: 24, background: C.white, border: `1px solid ${C.line}`, boxShadow: "0 24px 60px rgba(0,0,0,0.08)" }}>
              <div style={{ position: "absolute", left: 60, right: 60, top: 38, height: 90, display: "flex", alignItems: "center", gap: 4 }}>
                {Array.from({ length: N }, (_, i) => {
                  const on = i / N < bars;
                  const h = 16 + 70 * Math.abs(Math.sin(i * 0.37 + random(`r${i}`) * 2)) * (0.45 + 0.55 * random(`rr${i}`));
                  return <div key={i} style={{ width: 6, height: on ? h : 3, borderRadius: 3, background: on ? C.record : "#E4E4E4", flexShrink: 0 }} />;
                })}
              </div>
              <div style={{ position: "absolute", left: 30, bottom: 22, fontFamily: FONT.ui, fontSize: 18, color: C.muted }}>Selected language: English</div>
              <div style={{ position: "absolute", right: 30, bottom: 16, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT.ui, fontSize: 18, color: C.ink2 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 5, background: "#E53935", opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 5)) }} />
                  0:0{secs} / 0:20
                </span>
                <span>Cancel</span>
                <span style={{ padding: "6px 16px", borderRadius: 16, background: C.pill, color: C.muted }}>Finish</span>
              </div>
            </div>
          </AbsoluteFill>
        ) : null}
        {card > 0 ? (
          <div style={{ position: "absolute", left: 960 - 408 * 2.1, top: 560 - 177 * 2.1, width: 818, height: 647, transform: "scale(2.1)", transformOrigin: "0 0", opacity: Math.min(1, card * 1.5) }}>
            <ClonePage card={card} t={t - K.card} />
          </div>
        ) : null}
      </AbsoluteFill>
      <TopCaption text="Record once. Reuse the voice." t={t} at={1.8} out={5.45} />
    </AbsoluteFill>
  );
};
