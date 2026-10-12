import React, { useId } from "react";
import { claude, cluesoMark, cluesoWord, openai } from "./paths";

const useSafeId = (prefix: string) => prefix + useId().replace(/[^a-zA-Z0-9]/g, "");

const BRAND_PINK = "#F881E5";
const BRAND_MAGENTA = "#C93BB7";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Diagonal light band sweeping across a shape; `pos` runs roughly -0.3 → 1.3.
const Sheen: React.FC<{ id: string; d: string; pos: number; strength?: number }> = ({ id, d, pos, strength = 0.65 }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0.6">
        <stop offset={clamp01(pos - 0.18)} stopColor="#fff" stopOpacity="0" />
        <stop offset={clamp01(pos)} stopColor="#fff" stopOpacity={strength} />
        <stop offset={clamp01(pos + 0.18)} stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d={d} fill={`url(#${id})`} />
  </>
);

type MarkProps = {
  size: number;
  // 0..1 draws the outline stroke progressively; omit for no outline.
  strokeProgress?: number;
  strokeOpacity?: number;
  fillOpacity?: number;
  color?: string;
  sheen?: number;
  style?: React.CSSProperties;
};

export const CluesoMark: React.FC<MarkProps> = ({
  size,
  strokeProgress,
  strokeOpacity = 1,
  fillOpacity = 1,
  color,
  sheen,
  style,
}) => {
  const id = useSafeId("cg");
  const sid = useSafeId("cs");
  const fill = color ?? `url(#${id})`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${cluesoMark.w} ${cluesoMark.h}`} style={{ overflow: "visible", flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id={id} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND_PINK} />
          <stop offset="1" stopColor={BRAND_MAGENTA} />
        </linearGradient>
      </defs>
      <path d={cluesoMark.d} fill={fill} fillOpacity={fillOpacity} />
      {sheen !== undefined ? <Sheen id={sid} d={cluesoMark.d} pos={sheen} /> : null}
      {strokeProgress !== undefined && strokeOpacity > 0 ? (
        <path
          d={cluesoMark.d}
          fill="none"
          stroke={color ?? BRAND_PINK}
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - strokeProgress}
          strokeOpacity={strokeOpacity}
        />
      ) : null}
    </svg>
  );
};

export const CluesoWordmark: React.FC<{ height: number; color: string; sheen?: number; style?: React.CSSProperties }> = ({
  height,
  color,
  sheen,
  style,
}) => {
  const sid = useSafeId("ws");
  return (
    <svg height={height} width={(height * cluesoWord.w) / cluesoWord.h} viewBox={`0 0 ${cluesoWord.w} ${cluesoWord.h}`} style={style}>
      <path d={cluesoWord.d} fill={color} />
      {sheen !== undefined ? <Sheen id={sid} d={cluesoWord.d} pos={sheen} strength={0.5} /> : null}
    </svg>
  );
};

// Mark + wordmark with the original lockup spacing.
export const CluesoLogo: React.FC<{ height: number; wordColor: string; sheen?: number }> = ({ height, wordColor, sheen }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <CluesoMark size={height} sheen={sheen === undefined ? undefined : sheen * 3.2 - 0.3} />
    <CluesoWordmark height={height} color={wordColor} sheen={sheen === undefined ? undefined : sheen * 1.5 - 0.35} />
  </div>
);

export const ClaudeMark: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox={`0 0 ${claude.w} ${claude.h}`} style={{ flexShrink: 0 }}>
    <path d={claude.d} fill={color} />
  </svg>
);

export const OpenAIMark: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox={`0 0 ${openai.w} ${openai.h}`} style={{ flexShrink: 0 }}>
    <path d={openai.d} fill={color} />
  </svg>
);
