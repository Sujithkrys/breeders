import React from "react";
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";
import * as S from "./scenes";

// Storyboard-driven Pine Pro launch. Soundtrack is composed and mastered offline by scripts/compose-pine.mjs.
export const PinePro: React.FC = () => (
  <AbsoluteFill>
    <S.LightBg />
    <Html5Audio src={staticFile("audio/pine-pro-25.wav")} volume={() => 1} />
    <S.Logo />
    <S.Ideas />
    <S.Field />
    <S.Prompt />
    <S.PinePro />
    <S.Turn />
    <S.Creates />
    <S.Styles />
    <S.Cinematic />
    <S.AnyStyle />
    <S.Poster />
    <S.UseCases />
    <S.Creators />
    <S.Workflow />
    <S.Sphere />
    <S.Fast />
    <S.Control />
    <S.Outcome />
    <S.Cta />
    <S.Brand />
    <S.Final />
  </AbsoluteFill>
);
