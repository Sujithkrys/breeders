import React from "react";
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";
import * as S from "./scenes";

// Soundtrack is composed and mastered offline by scripts/compose-launch.mjs.
// Pine Pro launch film, modeled on the ChatGPT Work launch: dark "space" brand beats cut against white product close-ups.
export const PineLaunch: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Html5Audio src={staticFile("audio/pine-launch-46.wav")} volume={() => 1} />
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
  </AbsoluteFill>
);
