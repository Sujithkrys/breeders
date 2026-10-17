// HukumDemo: a 7 s look test for the Rajinikanth tribute, pure motion graphics (no text, no images).
// Song bars 7–10 of "Hukum" (31.44 s → 38.50 s, 136.02 BPM): the Baba sign is constructed from gold line work over two
// bars, a blackout beat, then the drop: the sunglasses slam together from geometry, with shockwaves and light.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp } from "../utils";

const BEAT = 60 / 136.02;
const W = 1080, H = 1920;
export const HUKUM_DEMO = { fps: 30, width: W, height: H, seconds: 16 * BEAT + 0.5 };
const GOLD = "#F2C14E";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// stroke reveal: draw a path from 0 to `k` of its length (pathLength normalised to 1)
const drawn = (k: number): React.SVGProps<SVGPathElement> => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, Math.min(1, k)) });

// the Baba sign: palm, index and little finger raised, middle and ring folded under the thumb
const HAND = {
  palm: "M380 1180 C370 1040 380 960 400 900 L680 900 C700 960 710 1040 700 1180 C690 1300 640 1360 540 1370 C440 1360 390 1300 380 1180 Z",
  index: "M410 905 L410 560 C410 520 470 520 470 560 L470 905",
  little: "M620 905 L630 640 C632 605 682 605 684 640 L690 910",
  midFold: "M480 905 C480 830 540 820 548 870 L548 960",
  ringFold: "M552 905 C552 840 610 832 616 880 L612 960",
  thumb: "M400 1060 C450 1000 560 990 640 1010 C668 1018 664 1056 636 1058 C560 1062 480 1080 420 1120",
};
const Hand: React.FC<{ b: number; fill: number }> = ({ b, fill }) => {
  const parts: [keyof typeof HAND, number][] = [["palm", 0], ["index", 0.8], ["little", 1.6], ["midFold", 2.4], ["ringFold", 2.8], ["thumb", 3.2]];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1C2" />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor="#8A5A12" />
        </linearGradient>
        <filter id="hglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* construction lines: a grid and arcs the hand is drafted on */}
      <g stroke="rgba(242,193,78,0.22)" strokeWidth="1.5" fill="none">
        {[410, 470, 540, 620, 690].map((x, i) => <line key={x} x1={x} x2={x} y1={300} y2={1500} {...drawn(ramp(b, [i * 0.25, i * 0.25 + 1.2]))} />)}
        {[560, 640, 905, 1180, 1370].map((y, i) => <line key={y} y1={y} y2={y} x1={200} x2={880} {...drawn(ramp(b, [0.4 + i * 0.25, 1.6 + i * 0.25]))} />)}
        <circle cx={540} cy={960} r={420} {...drawn(ramp(b, [0.5, 3]))} />
      </g>
      {/* the hand: gold outline drawn on the beats, then filled */}
      <g filter="url(#hglow)">
        <g fill="url(#hg)" opacity={fill}>
          <path d={HAND.palm} />
          <path d={HAND.index + " Z"} />
          <path d={HAND.little + " Z"} />
        </g>
        {parts.map(([k, at]) => (
          <path key={k} d={HAND[k]} fill="none" stroke={fill > 0.5 ? "#3B2406" : GOLD} strokeWidth={fill > 0.5 ? 8 : 6} strokeLinecap="round" strokeLinejoin="round" {...drawn(ramp(b, [at, at + 1.1], [0, 1], ease.inOut))} />
        ))}
      </g>
    </svg>
  );
};
// a halftone field of dots that breathes on every beat
const Halftone: React.FC<{ b: number; amp: number }> = ({ b, amp }) => {
  const pulse = Math.exp(-(b - Math.floor(b)) * 5);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 22 * 38 }, (_, i) => {
        const cx = (i % 22) * 50 + 15, cy = Math.floor(i / 22) * 52 + 10;
        const d = Math.hypot(cx - 540, cy - 960) / 1100;
        const r = Math.max(0, (1 - d) * 7 * amp * (0.55 + 0.45 * pulse));
        return r > 0.3 ? <circle key={i} cx={cx} cy={cy} r={r} fill={GOLD} opacity={0.18 + 0.3 * (1 - d)} /> : null;
      })}
    </svg>
  );
};
// the sunglasses, built from two lens shards and a bridge that slam together from off-screen
const LENS_L = "M150 860 L470 860 L450 1010 C440 1060 400 1080 340 1080 L250 1080 C190 1080 165 1050 160 1000 Z";
const LENS_R = "M610 860 L930 860 L920 1000 C915 1050 890 1080 830 1080 L740 1080 C680 1080 640 1060 630 1010 Z";
const Shades: React.FC<{ k: number; glint: number }> = ({ k, glint }) => {
  const e = ease.out(Math.min(1, k));
  const off = (1 - e) * 900;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="lensG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B2620" />
          <stop offset="0.6" stopColor="#050404" />
          <stop offset="1" stopColor="#1A1612" />
        </linearGradient>
        <linearGradient id="rimG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1C2" />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor="#7A4E12" />
        </linearGradient>
        <clipPath id="lensClip">
          <path d={LENS_L} transform={`translate(${-off} 0)`} />
          <path d={LENS_R} transform={`translate(${off} 0)`} />
        </clipPath>
      </defs>
      <g transform={`translate(${-off} 0) rotate(${(1 - e) * -25} 310 970)`}>
        <path d={LENS_L} fill="url(#lensG)" stroke="url(#rimG)" strokeWidth="10" />
        <path d="M150 870 L40 840" stroke="url(#rimG)" strokeWidth="12" strokeLinecap="round" />
      </g>
      <g transform={`translate(${off} 0) rotate(${(1 - e) * 25} 770 970)`}>
        <path d={LENS_R} fill="url(#lensG)" stroke="url(#rimG)" strokeWidth="10" />
        <path d="M930 870 L1040 840" stroke="url(#rimG)" strokeWidth="12" strokeLinecap="round" />
      </g>
      <path d="M470 900 Q540 860 610 900" stroke="url(#rimG)" strokeWidth="12" fill="none" strokeLinecap="round" opacity={e} />
      <g clipPath="url(#lensClip)">
        <rect x={-300 + glint * 1700} y={700} width={90} height={500} fill="rgba(255,236,190,0.7)" transform="skewX(-28)" />
        <rect x={-180 + glint * 1700} y={700} width={22} height={500} fill="rgba(255,236,190,0.45)" transform="skewX(-28)" />
      </g>
    </svg>
  );
};
// shockwave rings and light rays from the centre on a hit
const Shock: React.FC<{ u: number }> = ({ u }) =>
  u < 0 || u > 1.6 ? null : (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {[0, 0.12, 0.24].map((d, i) => {
        const k = Math.max(0, u - d);
        return <circle key={i} cx={540} cy={970} r={80 + k * 1100} fill="none" stroke={GOLD} strokeWidth={14 * (1 - Math.min(1, k / 1.2))} opacity={Math.max(0, 1 - k / 1.2)} />;
      })}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2 + hash(i) * 0.2, len = 300 + hash(i + 3) * 900;
        const k = ease.out(Math.min(1, u * 2.2));
        const r0 = 120 + k * 200, r1 = r0 + len * k;
        return <line key={i} x1={540 + Math.cos(a) * r0} y1={970 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={970 + Math.sin(a) * r1} stroke="#FFE7A8" strokeWidth={3 + 5 * hash(i + 5)} opacity={Math.max(0, 1 - u * 1.1)} strokeLinecap="round" />;
      })}
    </svg>
  );
// gold sparks drifting up after the drop
const Sparks: React.FC<{ u: number }> = ({ u }) =>
  u < 0 ? null : (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 90 }, (_, i) => {
        const a = hash(i) * Math.PI * 2, sp = 200 + hash(i + 1) * 900;
        const x = 540 + Math.cos(a) * sp * Math.min(1, u * 1.4), y = 970 + Math.sin(a) * sp * Math.min(1, u * 1.4) - u * u * 120 * hash(i + 2);
        return <circle key={i} cx={x} cy={y} r={1.5 + 3 * hash(i + 4)} fill="#FFE2A0" opacity={Math.max(0, 1 - u * 0.5) * (0.4 + 0.6 * hash(i + 6))} />;
      })}
    </svg>
  );

export const HukumDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = t / BEAT; // 0–8: the build; beat 7 is silent black; 8: the drop
  const DROP = 8;
  const build = b < 7;
  const shake = build ? ramp(b, [4, 7]) * Math.sin(t * 80) * 10 : b >= DROP ? Math.exp(-(b - DROP) * 4) * Math.sin(t * 90) * 22 : 0;
  const zoom = build ? 1 + 0.08 * ramp(b, [0, 7], [0, 1], ease.in) : b >= DROP ? 1.18 - 0.18 * ramp(b, [DROP, DROP + 1.2], [0, 1], ease.out) : 1;
  const pulse = b >= DROP ? 1 + 0.03 * Math.exp(-(b - Math.floor(b)) * 8) : 1;
  const flash = b >= DROP ? ramp(b, [DROP, DROP + 0.5], [0.9, 0]) : 0;
  return (
    <AbsoluteFill style={{ background: "#050403", overflow: "hidden" }}>
      <Audio src={staticFile("hukum/demo.wav")} />
      {b < 7 || b >= DROP ? (
        <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px) scale(${zoom * pulse})` }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 45% at 50% 50%, rgba(140,92,24,${build ? 0.35 + 0.3 * ramp(b, [3, 7]) : 0.6}) 0%, transparent 70%)` }} />
          <Halftone b={b} amp={build ? ramp(b, [0, 4]) : 1.3} />
          {build ? <Hand b={b} fill={ramp(b, [4.4, 5.2], [0, 1], ease.out)} /> : null}
          {b >= DROP ? (
            <>
              <Shock u={b - DROP} />
              <Shades k={ramp(b, [DROP, DROP + 0.35])} glint={ramp(b, [DROP + 1.5, DROP + 3.5])} />
              <Sparks u={b - DROP} />
            </>
          ) : null}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: "#FFF1C8", opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};
