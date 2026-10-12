import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../brand/Breeders";
import { VOICE_DUR } from "./vo/voice";
import { ease, ramp } from "../utils";
import { Audience, Everything, Lockup, Outro } from "./scenes/Close";
import { Library } from "./scenes/Library";
import { Hook, Meet } from "./scenes/Opening";
import { Clone, Tts } from "./scenes/Voice";
import { Dubbing, Workspace } from "./scenes/Workspace";
import { C, FONT, SCENES } from "./theme";

const ORDER: [keyof typeof SCENES, React.FC, string][] = [
  ["hook", Hook, "0:00 Hook — Content Studio, live"],
  ["meet", Meet, "0:04 Meet every product"],
  ["workspace", Workspace, "0:08 Workspace"],
  ["dubbing", Dubbing, "0:12 Dubbing"],
  ["tts", Tts, "0:22 Text to Speech"],
  ["clone", Clone, "0:30 Voice cloning"],
  ["library", Library, "0:36 Voice Library + Speech to Text"],
  ["everything", Everything, "0:42 Everything, one workflow"],
  ["audience", Audience, "0:46 Audience + offer"],
  ["lockup", Lockup, "0:50 Sarvam lockup"],
  ["outro", Outro, "0:54 Breeders end card"],
];

// The voice speaks over the opening; the music ducks under it. public/sarvam-live/voice.mp3 is the original read with its
// first line cut, so it starts VOICE_TRIM into the take ("Sarvam just flipped the switch…").
const VOICE_AT = 0.5;
const VOICE_TRIM = 2.2;

// Every boundary is a hard cut on a 2s bar; motion inside each scene carries the transitions.
export const SarvamLive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const credit = 1 - ramp(sec, [53.5, 54], [0, 1], ease.inOut);
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <Audio
        src={staticFile("audio/sarvam-live-60.wav")}
        volume={(f) => 1 - 0.55 * ramp(f / fps, [VOICE_AT - 0.3, VOICE_AT], [0, 1]) * (1 - ramp(f / fps, [VOICE_AT + VOICE_DUR, VOICE_AT + VOICE_DUR + 0.8], [0, 1]))}
      />
      <Sequence from={Math.round((VOICE_AT + VOICE_TRIM) * fps)} name="Voice (ElevenLabs)">
        <Audio src={staticFile("sarvam-live/voice.mp3")} />
      </Sequence>
      {ORDER.map(([key, Scene, name]) => {
        const [a, b] = SCENES[key];
        return (
          <Sequence key={key} from={Math.round(a * fps)} durationInFrames={Math.round((b - a) * fps)} name={name}>
            <Scene />
          </Sequence>
        );
      })}
      <Watermark opacity={credit} font={FONT.ui} />
    </AbsoluteFill>
  );
};
