// "Motion designers are cooked" — Pine Pro edition, 81.1s, 1920×1080. Hook → rewind → Claude Code builds the Pine Pro
// launch film → first cut plays → "add sound effects" edit → the whole Pine film (speed per shot), music and effects only →
// "made by Claude" on the logo → the question → the Breeders end card. One voice track (public/pine/voice.wav); all
// audio is pre-mixed in public/pine/mix.wav.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ramp } from "../utils";
import { ChatFlow, T } from "./chat";
import { FILM_LEN, filmLight, toNew } from "./film";
import { E, FilmAt, Hook, Premiere, Punch, Rewind, SfxEdit } from "./scenes";

// Timeline anchors (seconds). Mirrored in scripts/compose-pine-cooked.mjs.
const V2 = E.full;
export const END = { edit: 26.5, v2: V2, filmEnd: V2 + FILM_LEN, flare: V2 + toNew(44.5), punch: 69.04, outro: 71.54, total: 71.54 + OUTRO_LEN };
export const PINE_COOKED = { fps: 60, width: 1920, height: 1080, seconds: END.total };
const inR = (s: number, a: number, b: number) => s >= a && s < b;

export const PineCooked: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  // the Pine film alternates dark and light shots; the watermark follows whichever is on screen
  const filmDark = (ft: number) => !filmLight(ft);
  const dark = inR(s, 0, 4.4) || (inR(s, T.expand + 0.1, END.edit) && filmDark(s - (T.expand - 0.2))) || inR(s, E.expand + 0.6, V2) || (inR(s, V2, END.punch) && filmDark(s - V2)) ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }} from={243}>
      <Audio src={staticFile("pine/mix.wav")} />
      {inR(s, 0, 3) ? <Hook s={s} /> : null}
      {inR(s, 3, 4.5) ? <Rewind s={s} /> : null}
      {inR(s, 4.4, T.full) ? <ChatFlow s={s} /> : null}
      {inR(s, T.full, END.edit) ? <FilmAt t={s - (T.expand - 0.2)} label="pine-pro.mp4 · first cut" /> : null}
      {inR(s, END.edit, V2) ? <SfxEdit s={s} /> : null}
      {inR(s, E.expand, V2) ? <Premiere s={s} /> : null}
      {inR(s, V2, END.punch) ? <FilmAt t={s - V2} label="pine-pro.mp4 · with sound design" /> : null}
      {inR(s, END.punch, END.outro) ? <Punch s={s} /> : null}
      {inR(s, END.outro, END.total) ? <BreedersOutro t={s - END.outro} /> : null}
      <Watermark opacity={1 - ramp(s, [END.outro - 0.45, END.outro], [0, 1])} font="Figtree, sans-serif" dark={dark} />
    </AbsoluteFill>
  );
};
