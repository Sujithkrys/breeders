// "Motion designers are cooked" — 63.4s, 1920×1080. Hook → rewind → Claude Code builds the Guava Pro launch film →
// first cut plays → "add sound effects" edit → the full sound-designed film (narrated) → the question → the Breeders end
// card. One voice track (public/guava/voice.wav); all audio is pre-mixed in public/guava/mix.wav.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { ChatFlow, T } from "./chat";
import { FilmAt, Hook, Punch, Rewind, SfxEdit } from "./scenes";
import { WORDS } from "./voice";

// Timeline anchors after the chat (seconds). Mirrored in scripts/compose-guava-pro.mjs.
export const END = { v2: 32, punch: 51, outro: 53.9, total: 53.9 + OUTRO_LEN };
export const COOKED = { fps: 60, width: 1920, height: 1080, seconds: END.total };
const inR = (s: number, a: number, b: number) => s >= a && s < b;

// While the film plays full-frame the commentary shows as top captions (the film owns the bottom).
const FilmCaptions: React.FC<{ s: number }> = ({ s }) => {
  const words = WORDS.filter((w) => w.s >= END.v2 && w.s < END.punch);
  const lines: (typeof words)[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    const prev = last?.[last.length - 1];
    if (prev && w.s - prev.e < 0.3 && !/[.?!]$/.test(prev.w)) last.push(w);
    else lines.push([w]);
  }
  const line = lines.find((l) => s >= l[0].s - 0.1 && s < l[l.length - 1].e + 0.35);
  if (!line) return null;
  const inP = ramp(s, [line[0].s - 0.1, line[0].s + 0.08], [0, 1], ease.out);
  const out = ramp(s, [line[line.length - 1].e + 0.15, line[line.length - 1].e + 0.35], [0, 1], ease.in);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 56, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ padding: "10px 26px 12px", borderRadius: 18, background: "rgba(8,8,12,0.42)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", opacity: inP * (1 - out), transform: `translateY(${(1 - inP) * -10}px)`, whiteSpace: "nowrap" }}>
        {line.map((w, i) => {
          const said = s >= w.s;
          return (
            <span key={i} style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 40, letterSpacing: "-0.02em", color: said ? "#fff" : "rgba(255,255,255,0.32)" }}>
              {w.w}
              {i < line.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Cooked: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const dark = inR(s, 0, 4.4) || inR(s, T.expand + 0.1, 26) || inR(s, 31.6, END.punch) ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <Audio src={staticFile("guava/mix.wav")} />
      {inR(s, 0, 3) ? <Hook s={s} /> : null}
      {inR(s, 3, 4.5) ? <Rewind s={s} /> : null}
      {inR(s, 4.4, T.full) ? <ChatFlow s={s} /> : null}
      {inR(s, T.full, 26) ? <FilmAt t={s - (T.expand - 0.2)} label="guava-pro.mp4 · first cut" /> : null}
      {inR(s, 26, END.v2) ? <SfxEdit s={s} /> : null}
      {inR(s, END.v2, END.punch) ? <FilmAt t={s - END.v2} label="guava-pro.mp4 · with sound design" /> : null}
      {inR(s, END.v2, END.punch) ? <FilmCaptions s={s} /> : null}
      {inR(s, END.punch, END.outro) ? <Punch s={s} /> : null}
      {inR(s, END.outro, END.total) ? <BreedersOutro t={s - END.outro} /> : null}
      <Watermark opacity={1 - ramp(s, [END.outro - 0.45, END.outro], [0, 1])} font="Figtree, sans-serif" dark={dark} />
    </AbsoluteFill>
  );
};
