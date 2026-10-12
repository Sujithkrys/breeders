import React, { useId } from "react";
import { L } from "./theme";

// Faceted pineapple: diamond facets (lit top-left, warm yellow → orange) inside an oval body, five-leaf crown.
// `build` 0..1 pops the facets in from the center outward; `crown` 0..1 grows the leaves.
const TILES: { x: number; y: number; d: number; r: number }[] = [];
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 7; c++) {
    const x = 22 + c * 26 + (r % 2 ? 13 : 0), y = 92 + r * 22;
    const d = Math.hypot((x - 100) / 70, (y - 170) / 82);
    if (d < 1.3) TILES.push({ x, y, d, r });
  }
}
const LEAVES = [
  { a: -44, len: 58 },
  { a: -22, len: 76 },
  { a: 0, len: 90 },
  { a: 22, len: 76 },
  { a: 44, len: 58 },
];

export const PineMark: React.FC<{ size: number; build?: number; crown?: number; mono?: boolean }> = ({ size, build = 1, crown = 1, mono = false }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: "visible", flexShrink: 0 }}>
      <defs>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE27A" />
          <stop offset="0.55" stopColor={L.gold} />
          <stop offset="1" stopColor={L.orange} />
        </linearGradient>
        <linearGradient id={`l${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1F8E4A" />
          <stop offset="1" stopColor="#5BD88A" />
        </linearGradient>
        <clipPath id={`c${id}`}>
          <ellipse cx="100" cy="170" rx="72" ry="84" />
        </clipPath>
      </defs>
      {LEAVES.map((l, i) => {
        const g = Math.max(0, Math.min(1, crown * 1.6 - Math.abs(i - 2) * 0.18));
        const len = l.len * g;
        return (
          <path
            key={i}
            d={`M100 94 C ${88} ${94 - len * 0.45}, ${94} ${94 - len * 0.85}, 100 ${94 - len} C ${106} ${94 - len * 0.85}, ${112} ${94 - len * 0.45}, 100 94 Z`}
            fill={mono ? "#FFFFFF" : `url(#l${id})`}
            stroke={mono ? "#000" : undefined}
            strokeWidth={mono ? 2 : undefined}
            transform={`rotate(${l.a} 100 98)`}
            opacity={g > 0 ? 1 : 0}
          />
        );
      })}
      <g clipPath={`url(#c${id})`}>
        {TILES.map((t, i) => {
          const s = Math.max(0, Math.min(1, (build * 1.4 - t.d * 0.5) * 2.2));
          const k = s < 1 ? s * (1 + 0.22 * Math.sin(s * Math.PI)) : 1;
          const shade = 1 - (t.r / 8) * 0.12;
          return (
            <g key={i} transform={`translate(${t.x} ${t.y}) scale(${k}) rotate(45)`} opacity={s > 0 ? 1 : 0}>
              <rect x={-12.5} y={-12.5} width={25} height={25} rx={3.5} fill={mono ? "#FFFFFF" : `url(#f${id})`} style={{ filter: `brightness(${shade})` }} stroke={mono ? "#000" : undefined} strokeWidth={mono ? 3 : undefined} />
              {!mono && <rect x={-12.5} y={-12.5} width={25} height={9} rx={3.5} fill="#fff" opacity={0.28} />}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
