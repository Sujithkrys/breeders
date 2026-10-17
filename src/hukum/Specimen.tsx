// Look frames for the Rajinikanth tribute in the OpenAI-specimen system: white page, everything small and centred
// with lots of air, hairline construction, one accent colour (Baasha auto yellow). Rajinikanth appears as a geometric
// pictogram (Otl Aicher Olympic style): circles and rounded bars, dressed per film. No text.
//   0: Baasha — the auto on a hairline road, the pictogram in khaki auto-driver uniform beside it
//   1: Baba — the sign constructed on a grid
//   2: the drop — inverted to black, yellow sunglasses on the pictogram, a dot-matrix ring
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const W = 1080, H = 1920;
const INK = "#0A0A0A", PAPER = "#FFFFFF", YEL = "#FFC20E", KHAKI = "#B49A63", LINE = "#C9C9C9";
export const SPECIMEN = { fps: 30, width: W, height: H, frames: 3 };
const CX = W / 2, CY = H / 2;

// page furniture: tiny registration cross and corner ticks, like a specimen sheet
const Page: React.FC<{ ink: string }> = ({ ink }) => (
  <g stroke={ink} strokeWidth={1.5} fill="none" opacity={0.55}>
    <line x1={CX - 10} x2={CX + 10} y1={150} y2={150} />
    <line x1={CX} x2={CX} y1={140} y2={160} />
    <line x1={80} x2={104} y1={H - 150} y2={H - 150} />
    <line x1={W - 104} x2={W - 80} y1={H - 150} y2={H - 150} />
  </g>
);
const DotRing: React.FC<{ r: number; n: number; dot: number; fill: string; cx?: number; cy?: number; big?: (i: number) => boolean }> = ({ r, n, dot, fill, cx = CX, cy = CY, big }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={big && big(i) ? dot * 2.2 : dot} fill={fill} />;
    })}
  </g>
);

// ---------- the pictogram (Aicher-style): parts separated by white gaps ----------
type Pose = "stand" | "point";
const Figure: React.FC<{ x: number; y: number; s: number; suit: string; skin: string; gap: string; shades?: string; pose?: Pose }> = ({ x, y, s, suit, skin, gap, shades, pose = "stand" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinecap="round">
    {/* legs */}
    <line x1={-14} y1={70} x2={-20} y2={170} stroke={suit} strokeWidth={24} />
    <line x1={14} y1={70} x2={22} y2={170} stroke={suit} strokeWidth={24} />
    {/* torso */}
    <line x1={0} y1={-20} x2={0} y2={68} stroke={gap} strokeWidth={56} />
    <line x1={0} y1={-20} x2={0} y2={68} stroke={suit} strokeWidth={46} />
    {/* arms: one on the hip, one relaxed (or pointing) */}
    <path d="M-24 -10 L-52 30 L-26 58" stroke={gap} strokeWidth={26} fill="none" strokeLinejoin="round" />
    <path d="M-24 -10 L-52 30 L-26 58" stroke={suit} strokeWidth={18} fill="none" strokeLinejoin="round" />
    {pose === "point" ? (
      <>
        <path d="M24 -10 L70 -46" stroke={gap} strokeWidth={26} />
        <path d="M24 -10 L70 -46" stroke={suit} strokeWidth={18} />
        <circle cx={78} cy={-52} r={9} fill={skin} />
      </>
    ) : (
      <>
        <path d="M24 -10 L40 46" stroke={gap} strokeWidth={26} />
        <path d="M24 -10 L40 46" stroke={suit} strokeWidth={18} />
      </>
    )}
    {/* head, with the signature hair volume */}
    <circle cx={0} cy={-58} r={30} fill={gap} />
    <circle cx={0} cy={-58} r={26} fill={skin} />
    <path d="M-27 -66 Q-24 -96 4 -94 Q30 -92 28 -64 Q16 -78 -2 -76 Q-18 -76 -27 -66 Z" fill={skin} />
    {shades ? (
      <g fill={shades}>
        <path d="M-25 -64 L-3 -64 L-5 -54 Q-6 -49 -12 -49 L-19 -49 Q-24 -49 -24 -54 Z" />
        <path d="M25 -64 L3 -64 L5 -54 Q6 -49 12 -49 L19 -49 Q24 -49 24 -54 Z" />
        <rect x={-4} y={-64} width={8} height={3} />
      </g>
    ) : null}
  </g>
);

// ---------- the auto-rickshaw, side view (nose to the left): curved canopy over an open cabin, yellow body ----------
const Auto: React.FC<{ x: number; y: number; s: number; body: string; ink: string; gap: string }> = ({ x, y, s, body, ink, gap }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* canopy: a long curved hood, dipping to the windscreen at the front */}
    <path d="M-150 -40 L-150 -150 Q-140 -200 -60 -206 L110 -206 Q170 -204 176 -150 L176 -40 L160 -40 L160 -146 Q154 -186 108 -188 L-56 -188 Q-120 -184 -130 -146 L-130 -40 Z" fill={ink} />
    {/* windscreen pillar and the open cabin's back panel */}
    <line x1={-140} y1={-160} x2={-170} y2={-46} stroke={ink} strokeWidth={14} strokeLinecap="round" />
    <rect x={60} y={-150} width={104} height={110} rx={14} fill={ink} />
    {/* body: low tub with a rounded rear */}
    <path d="M-190 -46 L150 -46 Q196 -44 196 4 L196 18 Q196 40 172 40 L-180 40 Q-206 40 -206 16 L-206 -16 Q-206 -46 -190 -46 Z" fill={body} />
    {/* the front cab: a narrow nose with the headlight */}
    <path d="M-206 -46 L-240 -30 Q-252 -20 -252 6 L-252 24 Q-252 40 -234 40 L-206 40 Z" fill={body} />
    <circle cx={-244} cy={-36} r={10} fill={ink} />
    <line x1={-196} y1={-70} x2={-196} y2={-46} stroke={ink} strokeWidth={6} strokeLinecap="round" />
    {/* one front wheel, one rear wheel visible */}
    {[-214, 130].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={52} r={36} fill={gap} />
        <circle cx={wx} cy={52} r={30} fill={ink} />
        <circle cx={wx} cy={52} r={9} fill={gap} />
      </g>
    ))}
    {/* the meter flag on the canopy edge */}
    <rect x={-176} y={-232} width={30} height={22} rx={4} fill={ink} />
    <line x1={-161} y1={-210} x2={-150} y2={-196} stroke={ink} strokeWidth={6} />
  </g>
);

// ---------- frame 0: Baasha ----------
const FrameBaasha: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill={PAPER} />
    <Page ink={INK} />
    {/* the hairline road with distance ticks */}
    <g stroke={LINE} strokeWidth={1.5}>
      <line x1={140} x2={W - 140} y1={CY + 64} y2={CY + 64} />
      {Array.from({ length: 17 }, (_, i) => <line key={i} x1={140 + i * 50} x2={140 + i * 50} y1={CY + 64} y2={CY + 64 + (i % 4 === 0 ? 16 : 8)} />)}
    </g>
    {/* motion: three fading speed hairlines behind the auto */}
    <g stroke={INK} strokeWidth={1.5} strokeLinecap="round">
      {[0, 1, 2].map((i) => <line key={i} x1={CX + 150 + i * 10} x2={CX + 250 + i * 24} y1={CY - 34 + i * 24} y2={CY - 34 + i * 24} opacity={0.5 - i * 0.12} />)}
    </g>
    <Auto x={CX + 40} y={CY + 6} s={0.52} body={YEL} ink={INK} gap={PAPER} />
    <Figure x={CX - 170} y={CY - 44} s={0.6} suit={KHAKI} skin={INK} gap={PAPER} />
    {/* one construction circle and a single accent dot */}
    <circle cx={CX} cy={CY} r={260} fill="none" stroke={LINE} strokeWidth={1.5} />
    <circle cx={CX + 260} cy={CY} r={6} fill={YEL} />
  </svg>
);

// ---------- frame 1: Baba, constructed ----------
const Hand: React.FC<{ s: number; ink: string; gap: string }> = ({ s, ink, gap }) => (
  <g transform={`translate(${CX} ${CY + 40}) scale(${s})`} strokeLinecap="round">
    {/* palm */}
    <rect x={-70} y={-40} width={140} height={150} rx={52} fill={ink} />
    {/* index and little finger raised */}
    <line x1={-46} y1={-40} x2={-46} y2={-220} stroke={gap} strokeWidth={44} />
    <line x1={-46} y1={-40} x2={-46} y2={-220} stroke={ink} strokeWidth={36} />
    <line x1={50} y1={-40} x2={56} y2={-180} stroke={gap} strokeWidth={40} />
    <line x1={50} y1={-40} x2={56} y2={-180} stroke={ink} strokeWidth={32} />
    {/* middle and ring folded: two knuckles */}
    <circle cx={-6} cy={-46} r={21} fill={gap} />
    <circle cx={-6} cy={-46} r={17} fill={ink} />
    <circle cx={28} cy={-44} r={20} fill={gap} />
    <circle cx={28} cy={-44} r={16} fill={ink} />
    {/* thumb across the folded fingers */}
    <line x1={-74} y1={8} x2={30} y2={-18} stroke={gap} strokeWidth={40} />
    <line x1={-74} y1={8} x2={30} y2={-18} stroke={ink} strokeWidth={32} />
  </g>
);
const FrameBaba: React.FC = () => {
  const box = 420;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill={PAPER} />
      <Page ink={INK} />
      {/* the construction grid, OpenAI-specimen style */}
      <g stroke={LINE} strokeWidth={1.2} fill="none">
        <rect x={CX - box / 2} y={CY - box / 2 - 30} width={box} height={box} />
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={CX - box / 2 + (i + 1) * (box / 10)} x2={CX - box / 2 + (i + 1) * (box / 10)} y1={CY - box / 2 - 30} y2={CY + box / 2 - 30} />)}
        {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} y1={CY - box / 2 - 30 + (i + 1) * (box / 10)} y2={CY - box / 2 - 30 + (i + 1) * (box / 10)} x1={CX - box / 2} x2={CX + box / 2} />)}
        <circle cx={CX} cy={CY - 30} r={150} />
        <circle cx={CX} cy={CY - 30} r={90} />
      </g>
      {/* measurement callouts: a dot on each raised fingertip with a leader */}
      <g stroke={INK} strokeWidth={1.5} fill="none">
        <line x1={CX - 37} y1={CY - 140} x2={CX - 180} y2={CY - 260} />
        <line x1={CX + 52} y1={CY - 120} x2={CX + 190} y2={CY - 230} />
      </g>
      <circle cx={CX - 180} cy={CY - 260} r={5} fill={INK} />
      <circle cx={CX + 190} cy={CY - 230} r={5} fill={YEL} />
      <Hand s={0.55} ink={INK} gap={PAPER} />
    </svg>
  );
};

// ---------- frame 2: the drop ----------
const FrameDrop: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill={INK} />
    <Page ink={PAPER} />
    {/* short radial ticks around the figure */}
    <g stroke={PAPER} strokeWidth={1.5} opacity={0.6}>
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const r0 = 230, r1 = i % 5 === 0 ? 262 : 248;
        return <line key={i} x1={CX + Math.cos(a) * r0} y1={CY + Math.sin(a) * r0} x2={CX + Math.cos(a) * r1} y2={CY + Math.sin(a) * r1} />;
      })}
    </g>
    <DotRing r={300} n={72} dot={3} fill={PAPER} big={(i) => i % 12 === 0} />
    <circle cx={CX} cy={CY - 300} r={7} fill={YEL} />
    <Figure x={CX} y={CY + 10} s={0.95} suit={PAPER} skin={PAPER} gap={INK} shades={YEL} pose="point" />
  </svg>
);

export const RajiniSpecimen: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>{f === 0 ? <FrameBaasha /> : f === 1 ? <FrameBaba /> : <FrameDrop />}</AbsoluteFill>;
};
