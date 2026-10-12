// The Pine Pro launch film (src/pine-launch, 46s, untouched) replayed at speed inside "Motion designers are cooked".
// A speed per shot: normal speed for the details (the Ember film, the "Make the title hit harder" edit, the montage prompts,
// the logo), faster only through transitions (particle open, floaters, toggle, agent steps). Every speed change sits on a
// hard cut, so it is invisible. Scenes come from ./pine (typed prompt, new "steeped" shot). `t` is film-local seconds on the new (sped-up) clock.
// SPEED and FILM_CUES (below) are parsed by scripts/compose-pine-cooked.mjs, so keep each on one JSON line.
import React from "react";
import { AbsoluteFill, Freeze, useVideoConfig } from "remotion";
import { PineMark } from "../pine-pro/PineMark";
import * as S from "./pine/scenes";

// [original seconds where the shot starts, playback speed]; the last entry closes the film (original length 46s).
export const SPEED: [number, number][] = [[0,2],[4,1.8],[5.7333,2.4],[8.5,2.2],[10,2.2],[16,2.5],[20,1.8],[23,1.3],[30,1.25],[36,1.8],[38,1.15],[42,1.6],[44,1],[46,0]];
const NEW_AT = SPEED.reduce<number[]>((acc, [o, sp], i) => (i === 0 ? [0] : [...acc, acc[i - 1] + (o - SPEED[i - 1][0]) / SPEED[i - 1][1]]), []);
export const FILM_LEN = NEW_AT[NEW_AT.length - 1];
// Shot starts on the new clock (the edit timeline draws these).
export const FILM_SHOTS = NEW_AT;
export const toOrig = (t: number) => {
  const tt = Math.min(FILM_LEN - 1e-3, Math.max(0, t));
  let i = 0;
  while (i < NEW_AT.length - 2 && tt >= NEW_AT[i + 1]) i++;
  return SPEED[i][0] + (tt - NEW_AT[i]) * SPEED[i][1];
};
export const toNew = (orig: number) => {
  let i = 0;
  while (i < SPEED.length - 2 && orig >= SPEED[i + 1][0]) i++;
  return NEW_AT[i] + (orig - SPEED[i][0]) / SPEED[i][1];
};

// Is the film light behind the watermark? Measured from renders every 0.1s of film time (brightness of the band just
// above the Breeders credit); past the end it is dark (space CTA, black logo). Re-measure if the film changes.
const FILM_LIGHT = "000000000000000000001111111100000000000000000000111111111111111111111111111111111111111111111111111111110000000000001111111111100000000000000111111111000000000000111111110000000000000000000011110001111111111111000000000011111111111111111111111111111111111";
// Samples sit at k·0.1 + 0.05s; if a cut falls between `t` and its sample, use the neighbouring sample on t's side, so the
// watermark flips exactly on the cut. Cuts: every shot start plus the Ember film's internal cuts (units 690 + FILM_CUTS).
const CUTS = [...SPEED.map(([o]) => toNew(o)), ...[15, 30, 75, 120, 165].map((u) => toNew((690 + u) / 30))];
export const filmLight = (t: number) => {
  let k = Math.floor(t * 10);
  const at = k * 0.1 + 0.05;
  if (CUTS.some((c) => c > Math.min(t, at) && c <= Math.max(t, at))) k += t < at ? -1 : 1;
  return FILM_LIGHT[k] === "1";
};

// Palette the Claude chat uses around the film (Pine gold / orange / leaf).
export const G = { pink: "#FF8A1F", rind: "#3DBE6E", lime: "#FFC93C", seed: "#FFF4D6", night: "#04080E" };
export const DISPLAY = "Anton, 'Inter Tight', sans-serif"; // the hook only
export const GTIGHT = "'Inter Tight', Inter, sans-serif";

export const PineFilm: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Freeze frame={Math.round(toOrig(t) * fps)}>
        <S.Open />
        <S.Blocks />
        <S.Great />
        <S.Toggle />
        <S.Voice />
        <S.Steps />
        <S.Answer />
        <S.Film />
        <S.Refine />
        <S.Tagline />
        <S.Montage />
        <S.Cta />
        <S.Logo />
      </Freeze>
    </AbsoluteFill>
  );
};

export const FilmBox: React.FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => (
  <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${w / 1920}, ${h / 1080})`, transformOrigin: "0 0" }}>
      <PineFilm t={t} />
    </div>
  </div>
);

export const Mark: React.FC<{ size: number }> = ({ size }) => <PineMark size={size * 0.72} />;

// The sound design Claude "adds" in the edit, on the film's own frames: [original 30fps units, kind].
// Unit times are the moments in src/pine-launch/scenes.tsx (the same cues the original Pine soundtrack used, plus every cut).
export const FILM_CUES: [number, string][] = [[0,"sub"],[64,"swell"],[90,"chime"],[120,"impact"],[121,"pop"],[125,"pop"],[129,"pop"],[172,"whoosh"],[255,"whoosh"],[269,"tick"],[271,"chime"],[300,"whoosh"],[314,"tick"],[460,"pop"],[480,"tick"],[494,"tick"],[508,"tick"],[522,"tick"],[536,"tick"],[600,"whoosh"],[656,"tick"],[690,"riser"],[690,"sub"],[705,"impact"],[728,"impact"],[736,"tick"],[742,"tick"],[748,"tick"],[765,"whoosh"],[767,"swell"],[799,"chime"],[799,"impact"],[810,"whoosh"],[812,"pop"],[817,"pop"],[821,"pop"],[855,"impact"],[900,"whoosh"],[939,"tick"],[941,"pop"],[986,"pop"],[1000,"impact"],[1000,"sub"],[1016,"chime"],[1080,"sub"],[1084,"tick"],[1140,"impact"],[1142,"pop"],[1170,"whoosh"],[1172,"pop"],[1200,"whoosh"],[1202,"pop"],[1230,"whoosh"],[1232,"pop"],[1260,"whoosh"],[1276,"pop"],[1320,"riser"],[1335,"impact"],[1335,"sub"],[1336,"swell"]];
// The same cues on the new clock, in seconds: [film seconds, kind].
export const FILM_SFX: [number, string][] = FILM_CUES.map(([u, k]) => [toNew(u / 30), k]);
