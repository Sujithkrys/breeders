import React from "react";
import { Html5Audio, staticFile } from "remotion";

// Music + SFX are composed, ducked and mastered offline by scripts/compose-audio.mjs (cue sheet lives there).
export const CluesoMcp45Sfx: React.FC = () => <Html5Audio src={staticFile("audio/clueso-mcp-45.wav")} volume={() => 1} />;
