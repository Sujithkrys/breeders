import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, ramp } from "../../utils";
import { AppStage, Cam } from "../AppStage";
import { cursorAt, Cursor, TopCaption, track, useS } from "../kit";
import { AppFrame, Feedback, HistoryBtn, LibraryPage, STT_LEN, STTPage } from "../mock/Studio";

export const LIB = { cards: 0.2, hovers: [0.9, 1.3, 1.7, 2.1], whip: 2.85, rec: 3.75, text: 4.7 };
const CARD_X = [525, 658, 791, 924];

// Horizontal-only blur for the whip-pan.
const HBlur: React.FC<{ id: string; amount: number }> = ({ id, amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-20%" y="0" width="140%" height="100%">
      <feGaussianBlur stdDeviation={`${amount} 0`} />
    </filter>
  </svg>
);

// 0:36–0:42 — Voice Library's featured voices, then a whip-pan to Speech to Text: record, and the transcript streams in.
export const Library: React.FC = () => {
  const t = useS();
  const L = LIB;
  const enter = ramp(t, [0, 0.45], [0, 1], ease.out);
  const libX = track(t, [[L.whip, 0], [L.whip + 0.3, -2200]], ease.in);
  const sttX = track(t, [[L.whip + 0.12, 2200], [L.whip + 0.45, 0]], ease.out);
  const blurA = ramp(t, [L.whip, L.whip + 0.3], [0, 60], ease.in);
  const blurB = ramp(t, [L.whip + 0.12, L.whip + 0.45], [60, 0], ease.out);
  const libCam: Cam = { z: track(t, [[0, 1.12], [2.8, 1.2]]), fx: 724, fy: 330 };
  const sttCam: Cam = { z: track(t, [[3.3, 1.14], [6, 1.2]]), fx: 719, fy: 360 };
  const cur = cursorAt(t, [
    [0.6, 1200, 720],
    [L.hovers[0], CARD_X[0], 306],
    [L.hovers[0] + 0.2, CARD_X[0], 306],
    [L.hovers[1], CARD_X[1], 306],
    [L.hovers[1] + 0.2, CARD_X[1], 306],
    [L.hovers[2], CARD_X[2], 306],
    [L.hovers[2] + 0.2, CARD_X[2], 306],
    [L.hovers[3], CARD_X[3], 306],
  ]);
  const hover = t < L.hovers[0] - 0.1 ? -1 : CARD_X.reduce((best, x, i) => (Math.abs(cur.x - x) < Math.abs(cur.x - CARD_X[best]) ? i : best), 0);
  const sCur = cursorAt(t, [[3.35, 960, 640], [3.65, 719, 478]], [L.rec]);
  const rec = ramp(t, [L.rec, L.text - 0.05], [0.01, 1], (v) => v);
  const chars = Math.round(ramp(t, [L.text, L.text + 0.9], [0, STT_LEN], (v) => v));
  return (
    <AbsoluteFill>
      <HBlur id="whipA" amount={blurA} />
      <HBlur id="whipB" amount={blurB} />
      {t < L.whip + 0.32 ? (
        <AppStage cam={libCam} enter={enter} x={libX} filter={blurA > 0.5 ? "url(#whipA)" : undefined}>
          <AppFrame page="library" title="Voice library" headerRight={<Feedback />}>
            <LibraryPage hover={hover} t={t} cardsAt={L.cards} />
          </AppFrame>
          <Cursor {...cur} opacity={ramp(t, [0.6, 0.8], [0, 1])} size={26} />
        </AppStage>
      ) : null}
      {t >= L.whip + 0.12 ? (
        <AbsoluteFill>
          <AppStage cam={sttCam} x={sttX} bare={t < L.whip + 0.32} filter={blurB > 0.5 ? "url(#whipB)" : undefined}>
            <AppFrame page="stt" title="Speech to Text" headerRight={<><HistoryBtn /><Feedback /></>}>
              <STTPage rec={t >= L.rec && t < L.text ? rec : 0} chars={chars} t={t} />
            </AppFrame>
            <Cursor {...sCur} opacity={ramp(t, [3.35, 3.5], [0, 1]) * (1 - ramp(t, [4.5, 4.7], [0, 1]))} size={26} />
          </AppStage>
        </AbsoluteFill>
      ) : null}
      <TopCaption text="Voices for every story." t={t} at={0.3} out={2.6} />
      <TopCaption text="Speech to text, too." t={t} at={3.4} out={5.6} />
    </AbsoluteFill>
  );
};
