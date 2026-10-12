import React from "react";
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";
import * as S from "./scenes";

// Clueso MCP launch, rebuilt in the Pine Pro launch grammar: magenta-tinted space for brand beats,
// white product close-ups, soundtrack from scripts/compose-clueso-launch.mjs, the video Clueso generates, an in-editor refinement, and a particle logo.
export const CluesoLaunch: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Html5Audio src={staticFile("audio/clueso-launch-47.wav")} volume={() => 1} />
    <S.Open />
    <S.Blocks />
    <S.Great />
    <S.Connect />
    <S.Voice />
    <S.Steps />
    <S.Answer />
    <S.Film />
    <S.Refine />
    <S.Tagline />
    <S.Montage />
    <S.Cta />
    <S.Logo />
  </AbsoluteFill>
);
