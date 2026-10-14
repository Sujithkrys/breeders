// Breeders brand: the one place the page's identity lives. Every film imports its watermark, avatar, accent and end
// card from here. Sources: logo/Blue Geometric Play Emblem.png (traced into emblem-paths.ts) and the wordmark
// screenshot in logo/ (redrawn below as vector geometry, so both stay sharp at 4K).
import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, ramp } from "../utils";
import { EMBLEM_H, EMBLEM_PIECES, EMBLEM_W } from "./emblem-paths";

export const BRAND = { name: "Breeders", handle: "@breeders" };
export const BLUE = "#0067FC"; // sampled from the emblem
// accent used by the films' big punch words (was the old page's red; kept until the brand colours are set)
export const ACCENT = "#D2232A";
const INK = "#0F0F10";
export const LOGO_FONT = "'Inter Tight', Inter, sans-serif";

// ---- emblem: the play-button B. `piece(i)` lets an animation move each of the five shards on its own.
type PieceT = { x?: number; y?: number; s?: number; o?: number };
export const Emblem: React.FC<{ height: number; color?: string; piece?: (i: number) => PieceT }> = ({ height, color = BLUE, piece }) => (
  <svg width={(height * EMBLEM_W) / EMBLEM_H} height={height} viewBox={`0 0 ${EMBLEM_W} ${EMBLEM_H}`} style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
    {EMBLEM_PIECES.map((p, i) => {
      const { x = 0, y = 0, s = 1, o = 1 } = piece?.(i) ?? {};
      return <path key={i} d={p.d} fill={color} opacity={o} transform={`translate(${x} ${y}) translate(${p.cx} ${p.cy}) scale(${s}) translate(${-p.cx} ${-p.cy})`} />;
    })}
  </svg>
);

// ---- wordmark: BREEDERS in the logo's stemless geometric letters, drawn in the screenshot's own pixel units
// (cap height 63, stroke 8.5). The B and second R lose their stems, the second E and D share one.
const WM = { x: 20.5, y: 64.75, w: 423, h: 63 };
const SW = 8.5;
const bar = (x0: number, x1: number, yc: number, cut = false) =>
  cut ? `M${x0} ${yc - SW / 2}H${x1}V${yc + SW / 2}H${x0 + SW}Z` : `M${x0} ${yc - SW / 2}H${x1}V${yc + SW / 2}H${x0}Z`;
const stem = (x: number, y0: number, y1: number) => `M${x} ${y0}H${x + 8.6}V${y1}H${x}Z`;
const TOP = 69, MID = 96, RMID = 100.5, BOT = 123.5, CAP0 = 64.75, CAP1 = 127.75;
const WM_FILL = [
  // B, as a stemless 3
  bar(21, 54.25, TOP, true), bar(21, 54.25, MID, true), bar(21, 54.25, BOT),
  // R
  stem(80, CAP0, CAP1), bar(88, 113.5, TOP), bar(88, 113.5, RMID), "M106.4 104H116.9L133 127.75H122.5Z",
  // E
  stem(142, CAP0, CAP1), bar(150, 187.5, TOP), bar(150, 187.5, MID), bar(150, 187.5, BOT),
  // E+D: half stem, the E's middle arm inside the D
  stem(195, MID - SW / 2, CAP1), bar(195, 251, TOP), bar(203, 234.5, MID), bar(195, 251, BOT),
  // E
  stem(290, CAP0, CAP1), bar(298, 334.5, TOP), bar(298, 334.5, MID), bar(298, 334.5, BOT),
  // R, stemless
  bar(342, 368.5, TOP, true), bar(342, 368.5, RMID, true), "M362.7 104H372.7L388 127.75H378Z",
].join("");
const WM_STROKE = [
  "M54.25 69A13.5 13.5 0 0 1 54.25 96", "M54.25 96A13.75 13.75 0 0 1 54.25 123.5", // B bowls
  "M113.5 69A15.75 15.75 0 0 1 113.5 100.5", // R bowl
  "M251 69A27.25 27.25 0 0 1 251 123.5", // D bowl
  "M368.5 69A15.75 15.75 0 0 1 368.5 100.5", // R bowl
  "M435 69H412A12.25 12.25 0 0 0 412 93.5L426 97.5A13 13 0 0 1 426 123.5H397", // S
].join("");
// `reveal` 0..1 wipes the letters in from the left.
export const Wordmark: React.FC<{ height: number; color?: string; reveal?: number }> = ({ height, color = INK, reveal = 1 }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={(height * WM.w) / WM.h} height={height} viewBox={`${WM.x} ${WM.y} ${WM.w} ${WM.h}`} style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      {reveal < 1 ? (
        <defs>
          <clipPath id={id}>
            <rect x={WM.x - 2} y={WM.y - 2} width={(WM.w + 4) * reveal} height={WM.h + 4} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={reveal < 1 ? `url(#${id})` : undefined}>
        <path d={WM_FILL} fill={color} />
        <path d={WM_STROKE} fill="none" stroke={color} strokeWidth={SW} />
      </g>
    </svg>
  );
};

// emblem + wordmark side by side; the emblem stands 2.4x the wordmark's cap height.
export const Lockup: React.FC<{ height: number; color?: string }> = ({ height, color = INK }) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * 0.28 }}>
    <Emblem height={height} />
    <Wordmark height={height / 2.4} color={color} />
  </div>
);

// Square mark for avatars and app tiles. `bg` puts the emblem on a rounded tile.
export const Mark: React.FC<{ size: number; color?: string; bg?: string }> = ({ size, color = BLUE, bg }) =>
  bg ? (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Emblem height={size * 0.62} color={color} />
    </div>
  ) : (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Emblem height={size} color={color} />
    </div>
  );

// Small persistent credit, bottom centre. `dark` > 0.5 means the film behind it is dark.
export const Watermark: React.FC<{ opacity: number; font?: string; dark?: number }> = ({ opacity, dark = 0 }) =>
  opacity <= 0 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity, pointerEvents: "none", filter: dark > 0.5 ? "drop-shadow(0 1px 8px rgba(0,0,0,0.6))" : "drop-shadow(0 1px 6px rgba(255,255,255,0.8))" }}>
      <Emblem height={28} />
      <Wordmark height={13} color={dark > 0.5 ? "rgba(255,255,255,0.92)" : "rgba(15,15,16,0.85)"} />
    </div>
  );

// Round profile avatar for mock UIs (in place of a user photo).
export const BrandAvatar: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: INK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Emblem height={size * 0.56} />
  </div>
);

// End card. The five emblem shards drift in from just outside and lock together, then the wordmark wipes in
// beside it. `t` is seconds since the card began.
export const OUTRO_LEN = 3;
// where each shard comes from, in emblem units (left stems from the left, the play wedge from the right)
const SHARD_FROM: [number, number][] = [[-150, -40], [170, -110], [-150, 60], [130, 20], [150, 110]];
export const BreedersOutro: React.FC<{ t: number }> = ({ t }) => {
  const H = 190;
  const out = ramp(t, [OUTRO_LEN - 0.4, OUTRO_LEN], [0, 1], ease.in);
  const word = ramp(t, [0.75, 1.45], [0, 1], ease.inOut);
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
      {/* the emblem forms dead centre, then the row slides left to make room as the name wipes in */}
      <div style={{ display: "flex", alignItems: "center", gap: H * 0.3, transform: `translateX(${((1 - word) * (H * 0.3 + (H / 2.4) * (WM.w / WM.h))) / 2}px)` }}>
        <Emblem
          height={H}
          piece={(i) => {
            const k = ramp(t, [0.05 + i * 0.07, 0.85 + i * 0.07], [0, 1], ease.out);
            return { x: SHARD_FROM[i][0] * (1 - k), y: SHARD_FROM[i][1] * (1 - k), s: 0.85 + 0.15 * k, o: ramp(t, [0.05 + i * 0.07, 0.35 + i * 0.07]) };
          }}
        />
        <Wordmark height={H / 2.4} reveal={word} />
      </div>
    </AbsoluteFill>
  );
};
