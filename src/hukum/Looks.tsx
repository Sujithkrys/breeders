// Look frames for the Rajinikanth tribute: a Swiss, yellow-and-black graphic system (Baasha's auto-rickshaw
// colours), no text. Frame 0: the Baasha auto. Frame 1: the Baba sign. Frame 2: the drop.
// Rich through structure: grids, construction lines, dot matrices, hazard stripes, scale contrast, inversion.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const W = 1080, H = 1920;
const Y = "#FFC512", K = "#0B0B0B";
export const LOOKS = { fps: 30, width: W, height: H, frames: 3 };

// hairline construction marks: crop marks in the corners, a baseline grid, centre cross
const Marks: React.FC<{ c: string; o?: number }> = ({ c, o = 1 }) => (
  <g stroke={c} strokeWidth={2} fill="none" opacity={o}>
    {[[60, 60, 1, 1], [W - 60, 60, -1, 1], [60, H - 60, 1, -1], [W - 60, H - 60, -1, -1]].map(([x, y, sx, sy], i) => (
      <g key={i}>
        <line x1={x} y1={y} x2={x + 46 * sx} y2={y} />
        <line x1={x} y1={y} x2={x} y2={y + 46 * sy} />
      </g>
    ))}
    <circle cx={W - 110} cy={110} r={16} />
    <line x1={W - 134} x2={W - 86} y1={110} y2={110} />
    <line x1={W - 110} x2={W - 110} y1={86} y2={134} />
  </g>
);
const Grid: React.FC<{ c: string; o?: number; step?: number }> = ({ c, o = 0.18, step = 90 }) => (
  <g stroke={c} strokeWidth={1.2} opacity={o}>
    {Array.from({ length: Math.ceil(W / step) + 1 }, (_, i) => <line key={`v${i}`} x1={i * step} x2={i * step} y1={0} y2={H} />)}
    {Array.from({ length: Math.ceil(H / step) + 1 }, (_, i) => <line key={`h${i}`} y1={i * step} y2={i * step} x1={0} x2={W} />)}
  </g>
);
// a dot matrix disc (OpenAI-specimen style); `pick` chooses which dots go big
const DotDisc: React.FC<{ cx: number; cy: number; r: number; c: string; step?: number; pick?: (x: number, y: number, i: number) => number }> = ({ cx, cy, r, c, step = 34, pick }) => {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (let y = cy - r; y <= cy + r; y += step)
    for (let x = cx - r; x <= cx + r; x += step) {
      if (Math.hypot(x - cx, y - cy) > r) continue;
      const k = pick ? pick(x, y, i) : 0;
      out.push(<circle key={i} cx={x} cy={y} r={3 + k * 9} fill={c} />);
      i++;
    }
  return <g>{out}</g>;
};
const Hazard: React.FC<{ x: number; y: number; w: number; h: number; c1?: string; c2?: string; angle?: number; id: string }> = ({ x, y, w, h, c1 = K, c2 = Y, angle = 45, id }) => (
  <g>
    <defs>
      <pattern id={id} width={64} height={64} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
        <rect width={64} height={64} fill={c2} />
        <rect width={32} height={64} fill={c1} />
      </pattern>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </g>
);

// ---------- frame 0: the Baasha auto, front view, built from primitives ----------
const Auto: React.FC<{ s?: number; ink?: string; bg?: string }> = ({ s = 1, ink = K, bg = Y }) => (
  <g transform={`scale(${s})`}>
    {/* canopy */}
    <path d="M-300 -330 Q-300 -470 0 -480 Q300 -470 300 -330 L300 -300 L-300 -300 Z" fill={ink} />
    {/* windscreen */}
    <rect x={-250} y={-290} width={500} height={250} rx={18} fill={ink} />
    <rect x={-226} y={-268} width={452} height={206} rx={10} fill={bg} />
    <line x1={-226} y1={-165} x2={226} y2={-165} stroke={ink} strokeWidth={10} />
    {/* body */}
    <path d="M-280 -30 L280 -30 L240 260 Q236 300 196 300 L-196 300 Q-236 300 -240 260 Z" fill={ink} />
    {/* headlight */}
    <circle cx={0} cy={80} r={78} fill={bg} />
    <circle cx={0} cy={80} r={52} fill={ink} />
    <circle cx={0} cy={80} r={22} fill={bg} />
    {/* handlebar and mirrors */}
    <line x1={-330} y1={-40} x2={330} y2={-40} stroke={ink} strokeWidth={16} strokeLinecap="round" />
    <circle cx={-350} cy={-110} r={34} fill={ink} />
    <circle cx={350} cy={-110} r={34} fill={ink} />
    <line x1={-340} y1={-80} x2={-320} y2={-40} stroke={ink} strokeWidth={8} />
    <line x1={340} y1={-80} x2={320} y2={-40} stroke={ink} strokeWidth={8} />
    {/* mudguard and wheel */}
    <path d="M-120 300 Q0 250 120 300 L110 330 L-110 330 Z" fill={ink} />
    <rect x={-46} y={330} width={92} height={170} rx={30} fill={ink} />
  </g>
);
const FrameAuto: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill={Y} />
    <Grid c={K} o={0.12} />
    {/* scale contrast: a vast headlight disc cropped by the frame */}
    <circle cx={W + 40} cy={300} r={520} fill="none" stroke={K} strokeWidth={2} />
    <circle cx={W + 40} cy={300} r={430} fill="none" stroke={K} strokeWidth={2} strokeDasharray="4 14" />
    <DotDisc cx={W + 40} cy={300} r={380} c={K} pick={(x, y) => (Math.hypot(x - W - 40, y - 300) < 160 ? 1 : 0)} />
    {/* construction: centre axis, the auto's measured width, a ring around the headlight */}
    <g stroke={K} strokeWidth={2} fill="none">
      <line x1={W / 2} x2={W / 2} y1={420} y2={1720} strokeDasharray="10 10" />
      <line x1={190} x2={890} y1={1640} y2={1640} />
      <line x1={190} x2={190} y1={1620} y2={1660} />
      <line x1={890} x2={890} y1={1620} y2={1660} />
      <circle cx={W / 2} cy={1150} r={130} />
      <circle cx={W / 2} cy={1150} r={200} strokeDasharray="3 10" />
    </g>
    <g transform={`translate(${W / 2} 1070)`}>
      <Auto s={1.0} />
    </g>
    <Hazard x={0} y={H - 150} w={W} h={150} id="hz0" />
    <Marks c={K} />
  </svg>
);

// ---------- frame 1: the Baba sign, solid forms crossing an inverted split ----------
const HandShape: React.FC<{ fill?: string; stroke?: string; sw?: number }> = ({ fill = K, stroke, sw = 0 }) => (
  <g fill={fill} stroke={stroke} strokeWidth={sw}>
    <rect x={-150} y={-60} width={300} height={360} rx={120} />
    <rect x={-150} y={-470} width={86} height={480} rx={43} />
    <rect x={64} y={-380} width={78} height={400} rx={39} />
    <rect x={-58} y={-130} width={68} height={150} rx={34} />
    <rect x={8} y={-112} width={62} height={130} rx={31} />
    <rect x={-160} y={-40} width={250} height={78} rx={39} transform="rotate(-8 -35 -1)" />
  </g>
);
const FrameBaba: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <clipPath id="top">
        <rect width={W} height={H * 0.52} />
      </clipPath>
      <clipPath id="bot">
        <rect y={H * 0.52} width={W} height={H} />
      </clipPath>
    </defs>
    {/* split world: yellow above, black below; the hand inverts as it crosses */}
    <rect width={W} height={H} fill={Y} />
    <rect y={H * 0.52} width={W} height={H} fill={K} />
    <Grid c={K} o={0.12} />
    {/* the halo: a dot matrix ring and construction circles */}
    <g clipPath="url(#top)">
      <DotDisc cx={W / 2} cy={860} r={460} c={K} step={30} pick={(x, y) => { const d = Math.hypot(x - W / 2, y - 860); return d > 380 && d < 450 ? 1 : 0; }} />
    </g>
    <g stroke={K} strokeWidth={2} fill="none" clipPath="url(#top)">
      <circle cx={W / 2} cy={860} r={520} />
      <circle cx={W / 2} cy={860} r={600} strokeDasharray="4 14" />
    </g>
    <g stroke={Y} strokeWidth={2} fill="none" clipPath="url(#bot)" opacity={0.6}>
      <circle cx={W / 2} cy={860} r={520} />
      <circle cx={W / 2} cy={860} r={600} strokeDasharray="4 14" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={120 + i * 105} x2={120 + i * 105} y1={1100} y2={1800} />)}
    </g>
    {/* the sign: black on yellow, yellow on black */}
    <g clipPath="url(#top)">
      <g transform={`translate(${W / 2} 1060)`}>
        <HandShape fill={K} />
      </g>
    </g>
    <g clipPath="url(#bot)">
      <g transform={`translate(${W / 2} 1060)`}>
        <HandShape fill={Y} />
      </g>
    </g>
    <line x1={0} x2={W} y1={H * 0.52} y2={H * 0.52} stroke={Y} strokeWidth={0} />
    <Marks c={K} />
    <g clipPath="url(#bot)">
      <Marks c={Y} />
    </g>
  </svg>
);

// ---------- frame 2: the drop, full-frame choreography ----------
const Lens: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <path transform={`translate(${x} 0) scale(${flip ? -1 : 1} 1)`} d="M0 0 L470 0 L440 230 Q425 300 340 300 L120 300 Q30 300 18 220 Z" />
);
const FrameDrop: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill={K} />
    {/* radial burst of hairlines from the bridge */}
    <g stroke={Y} strokeWidth={2} opacity={0.55}>
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return <line key={i} x1={W / 2 + Math.cos(a) * 260} y1={900 + Math.sin(a) * 260} x2={W / 2 + Math.cos(a) * 1600} y2={900 + Math.sin(a) * 1600} />;
      })}
    </g>
    {/* a strip window of repeated autos crossing behind */}
    <rect x={0} y={1290} width={W} height={300} fill={Y} />
    <g>
      {[-1, 0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${130 + i * 270} 1460)`}>
          <Auto s={0.26} />
        </g>
      ))}
    </g>
    <Hazard x={0} y={1590} w={W} h={70} id="hz2" angle={-45} />
    {/* the sunglasses, huge, cropped by the frame: yellow rims, black lenses with a single hard reflection */}
    <g transform="translate(0 760)">
      <g fill={K} stroke={Y} strokeWidth={14}>
        <Lens x={20} />
        <Lens x={1060} flip />
      </g>
      <path d="M490 40 Q540 -10 590 40" stroke={Y} strokeWidth={18} fill="none" strokeLinecap="round" />
      <g fill={Y}>
        <path d="M120 30 L200 30 L110 290 L60 260 Z" opacity={0.95} />
        <path d="M640 30 L700 30 L620 280 L580 270 Z" opacity={0.95} />
      </g>
    </g>
    {/* dot matrix arc above */}
    <DotDisc cx={W / 2} cy={330} r={250} c={Y} step={28} pick={(x, y) => (Math.hypot(x - W / 2, y - 330) > 200 ? 1 : 0)} />
    <Marks c={Y} />
  </svg>
);

export const RajiniLooks: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>{f === 0 ? <FrameAuto /> : f === 1 ? <FrameBaba /> : <FrameDrop />}</AbsoluteFill>;
};
