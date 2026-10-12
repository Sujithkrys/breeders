// "Claude Sonnet 5.5" concept launch film (not affiliated with Anthropic). Shot like a product film: one hero object —
// Claude's mark sculpted in clay ceramic — in a warm cream studio, real-time 3D (three.tsx), and one type family at
// four sizes (type.ts). Facts from Anthropic's announcement (Sept 28, 2026): outputs 30%+ faster than Sonnet 5; up to
// 30% less per task at the same price ($2 / $10 per million tokens); strongest at everyday tasks and polished
// documents, slides and spreadsheets; Terminal-Bench 4.0 70.6% (Sonnet 5: 10.3%); available on all platforms.
// Then the Breeders end card. Times in seconds; voice lines placed by scripts/compose-sonnet.mjs.
import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { springAt } from "../sarvam-live/kit";
import { ease, ramp } from "../utils";
import { Bar3D, Camera, Mark3D, project, Sheet3D, SheetKind, Studio, Tile3D, useFontsReady } from "./three";
import { COLOR, loadInstrument, SANS, SIZE, TRACK } from "./type";

loadInstrument();

// ---------- timeline (seconds) ----------
export const T = { fast: 4.0, cost: 7.6, work: 11.0, bench: 19.0, everywhere: 23.0, end: 27.0, outro: 31.5, total: 31.5 + OUTRO_LEN };
export const SONNET = { fps: 60, width: 1920, height: 1080, seconds: T.total };
const inR = (s: number, a: number, b: number) => s >= a && s < b;
type V3 = [number, number, number];

// ---------- type: four sizes only; words rise out of a soft blur ----------
const Rise: React.FC<{ s: number; at: number; out?: number; size: keyof typeof SIZE; color?: string; weight?: number; align?: "left" | "center"; step?: number; children: string; accent?: string }> = ({ s, at, out = Infinity, size, color = COLOR.ink, weight = 500, align = "left", step = 0.06, children, accent }) => {
  if (s < at || s > out + 0.35) return null;
  const gone = Number.isFinite(out) ? ramp(s, [out, out + 0.3], [0, 1], ease.in) : 0;
  const px = SIZE[size];
  return (
    <div style={{ fontFamily: SANS, fontSize: px, fontWeight: weight, letterSpacing: TRACK[size], lineHeight: size === "hero" ? 0.98 : size === "headline" ? 1.05 : 1.3, color, textAlign: align, whiteSpace: "nowrap", opacity: 1 - gone, filter: gone > 0.02 ? `blur(${gone * 8}px)` : undefined }}>
      {children.split(" ").map((w, i) => {
        const p = ramp(s, [at + i * step, at + i * step + 0.5], [0, 1], ease.out);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.25em", opacity: p, transform: `translateY(${(1 - p) * px * 0.3}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined, color: accent && w.startsWith(accent) ? COLOR.clay : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};
const Paper: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 30% 20%, #FBF9F4 0%, ${COLOR.paper} 55%, #E9E4D9 100%)` }} />;
// the key light drifts slowly across every scene, so highlights and shadows are always alive
const keyAt = (s: number): V3 => [-6 + Math.sin(s * 0.35) * 2.5, 8.5, 7 + Math.cos(s * 0.3) * 1.5];

// ---------- 0–7.6s · the mark: it spins in beside the title, then moves centre and spins up ("30%+ faster") ----------
const MarkScene: React.FC<{ s: number }> = ({ s }) => {
  const k = springAt(s, 0.2, { damping: 16, stiffness: 70, mass: 1 });
  const toCentre = ramp(s, [3.6, 4.5], [0, 1], ease.inOut);
  // spin: settles from the entrance, then speeds up for "faster" and settles again
  const spinV = (t: number) => (t < 4.2 ? 0 : t < 5.4 ? ((t - 4.2) / 1.2) * 14 : t < 6.6 ? 14 : Math.max(0, 14 * (1 - (t - 6.6) / 0.8)));
  let spin = 0;
  for (let t = 4.2; t < s; t += 1 / 60) spin += spinV(t) / 60;
  const pos: V3 = [2.35 + (1.95 - 2.35) * toCentre, 0.05, 0];
  const rot = (sp: number): V3 => [-0.22 + 0.1 * toCentre, (1 - k) * -2.6 - 0.55 * (1 - toCentre) - 0.2 * toCentre + Math.sin(s * 0.6) * 0.06, 0.12 + sp];
  const size = (3.2 + 1.0 * k) * (1 - 0.14 * toCentre);
  const fast = spinV(s) / 14;
  const cam: V3 = [0, 0.2, 10 - ramp(s, [4.0, 7.4]) * 0.9];
  const ctr = project(pos, cam, [0, 0.05, 0]);
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-2.6} shadow={0.18} keyPos={keyAt(s)}>
        <Camera pos={cam} target={[0, 0.05, 0]} />
        {/* motion trails while it spins fast */}
        {fast > 0.2 ? [1, 2, 3].map((g) => <Mark3D key={g} size={size} position={pos} rotation={rot(spin - g * 0.16 * fast)} opacity={0.22 / g} shadow={false} />) : null}
        <Mark3D size={size} position={pos} rotation={rot(spin)} />
      </Studio>
      {/* light streaks of speed */}
      {fast > 0.05 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: fast }}>
          {Array.from({ length: 48 }, (_, i) => {
            const a = random(`ang${i}`) * Math.PI * 2;
            const ph = (s * (1.2 + random(`sp${i}`)) + random(`ph${i}`)) % 1;
            const r0 = 330 + ph * 700;
            const r1 = r0 + 60 + 160 * fast;
            return <line key={i} x1={ctr.x + Math.cos(a) * r0} y1={ctr.y + Math.sin(a) * r0 * 0.9} x2={ctr.x + Math.cos(a) * r1} y2={ctr.y + Math.sin(a) * r1 * 0.9} stroke={i % 3 ? "rgba(210,116,84,0.5)" : "rgba(20,20,19,0.25)"} strokeWidth={2} strokeLinecap="round" opacity={1 - ph} />;
          })}
        </svg>
      ) : null}
      {/* title */}
      <div style={{ position: "absolute", left: 140, top: 330 }}>
        <Rise s={s} at={0.7} out={3.4} size="label" color={COLOR.faint}>Introducing</Rise>
        <div style={{ height: 28 }} />
        <Rise s={s} at={0.95} out={3.45} size="hero">Claude</Rise>
        <Rise s={s} at={1.15} out={3.5} size="hero" accent="5.5">Sonnet 5.5</Rise>
      </div>
      {/* 30%+ faster */}
      <div style={{ position: "absolute", left: 140, top: 360 }}>
        <Rise s={s} at={4.35} out={7.25} size="hero" accent="faster">30%+</Rise>
        <Rise s={s} at={4.5} out={7.25} size="hero" color={COLOR.clay}>faster</Rise>
        <div style={{ height: 26 }} />
        <Rise s={s} at={4.8} out={7.25} size="sub" color={COLOR.sub}>outputs than Sonnet 5.</Rise>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7.6–11s · up to 30% less per task: ten tiles settle to seven ----------
const CostScene: React.FC<{ s: number }> = ({ s }) => {
  const l = s - T.cost;
  const go = ramp(l, [1.5, 2.2], [0, 1], ease.in);
  const close = ramp(l, [2.0, 2.7], [0, 1], ease.inOut);
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-2.4} shadow={0.17} keyPos={keyAt(s)}>
        <Camera pos={[0, 0.4, 10]} target={[0, -0.2, 0]} />
        {Array.from({ length: 10 }, (_, i) => {
          const drop = ramp(l, [0.15 + i * 0.07, 0.75 + i * 0.07], [0, 1], ease.out);
          const leaving = i >= 7;
          // ten across, then the seven close up around the centre
          const x10 = -3.83 + i * 0.85;
          const x7 = -2.55 + Math.min(i, 6) * 0.85;
          const x = leaving ? x10 : x10 + (x7 - x10) * close;
          const y = -0.55 + (1 - drop) * 4 + (leaving ? go * 2.4 : 0);
          return <Tile3D key={i} size={0.74} position={[x, y, 0]} rotation={[0.18, -0.25 + (leaving ? go * 1.4 : 0), (1 - drop) * 0.6 + (leaving ? go * 0.8 : 0)]} opacity={leaving ? 1 - go : 1} />;
        })}
      </Studio>
      <div style={{ position: "absolute", left: 140, top: 140 }}>
        <Rise s={s} at={T.cost + 0.1} size="headline">Up to 30% less per task.</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800 }}>
        <Rise s={s} at={T.cost + 2.3} size="sub" color={COLOR.sub} align="center">Same price: $2 / $10 per million tokens.</Rise>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 11–19s · the everyday work flies in around the mark ----------
const SHEETS: { kind: SheetKind; h: number; pos: V3; rot: V3; at: number }[] = [
  { kind: "deck", h: 1.75, pos: [0.1, 0.35, -1.7], rot: [0.03, 0, 0], at: 0.35 },
  { kind: "memo", h: 2.2, pos: [-3.55, -0.55, -0.8], rot: [0.02, 0.3, -0.03], at: 0.6 },
  { kind: "sheet", h: 1.4, pos: [1.95, -1.5, 0.5], rot: [-0.04, -0.18, -0.02], at: 0.85 },
  { kind: "email", h: 1.5, pos: [-1.85, -1.55, 0.55], rot: [-0.05, 0.16, 0.02], at: 1.1 },
  { kind: "research", h: 2.1, pos: [3.7, -0.45, -0.9], rot: [0.02, -0.32, 0.03], at: 1.35 },
];
const WorkScene: React.FC<{ s: number }> = ({ s }) => {
  const ok = useFontsReady();
  const l = s - T.work;
  const orbit = ramp(l, [0, 8], [-0.7, 0.7], ease.inOut);
  const push = ramp(l, [3.2, 7.4], [0, 1], ease.inOut);
  const leave = ramp(l, [7.3, 8.0], [0, 1], ease.in);
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-5} shadow={0.1} keyPos={keyAt(s)}>
        <Camera pos={[orbit, 0.5 - push * 0.2, 11 - push * 1.6]} target={[0, 0.0, 0]} />
        {ok
          ? SHEETS.map((sh, i) => {
              const p = ramp(l, [sh.at, sh.at + 0.9], [0, 1], ease.out);
              const from: V3 = [sh.pos[0] * 2.2, sh.pos[1] + (i % 2 ? -3 : 3), sh.pos[2] - 14];
              const pos: V3 = [from[0] + (sh.pos[0] - from[0]) * p, from[1] + (sh.pos[1] - from[1]) * p + Math.sin(s * 0.8 + i) * 0.04, from[2] + (sh.pos[2] - from[2]) * p + leave * 9];
              const rot: V3 = [sh.rot[0] + (1 - p) * 0.6, sh.rot[1] + (1 - p) * (i % 2 ? 0.9 : -0.9), sh.rot[2]];
              return <Sheet3D key={sh.kind} kind={sh.kind} h={sh.h} position={pos} rotation={rot} opacity={Math.min(1, p * 2) * (1 - leave)} />;
            })
          : null}
        <Mark3D size={1.25} position={[0.05, -0.65, 1.7 + leave * 4]} rotation={[-0.2, 0.4 + Math.sin(l * 0.5) * 0.25, l * 0.45]} opacity={1 - leave} />
      </Studio>
      <div style={{ position: "absolute", left: 0, right: 0, top: 96 }}>
        <Rise s={s} at={T.work + 0.15} out={T.work + 3.0} size="headline" align="center">Hand it the everyday work.</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 96 }}>
        <Rise s={s} at={T.work + 3.3} out={T.bench - 0.6} size="headline" align="center">Documents, decks and spreadsheets.</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220 }}>
        <Rise s={s} at={T.work + 3.7} out={T.bench - 0.6} size="sub" color={COLOR.sub} align="center">Polished, and ready to share.</Rise>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 19–23s · Terminal-Bench 4.0 ----------
const BCAM = { pos: [1.9, 0.5, 9.5] as V3, target: [1.9, 0.2, 0] as V3 };
const FLOOR = -3.6;
const H55 = 4.9;
const H5 = (10.3 / 70.6) * (H55 - 1.0) + 1.0;
const BenchScene: React.FC<{ s: number }> = ({ s }) => {
  const l = s - T.bench;
  const g5 = ramp(l, [0.3, 1.0], [0, 1], ease.out);
  const g55 = ramp(l, [0.6, 2.0], [0, 1], ease.out);
  const h5 = 1.0 + (H5 - 1.0) * g5;
  const h55 = 1.0 + (H55 - 1.0) * g55;
  const l5 = project([2.55, FLOOR + h5 + 0.05, 0.6], BCAM.pos, BCAM.target);
  const l55 = project([4.25, FLOOR + h55 + 0.05, 0.6], BCAM.pos, BCAM.target);
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-2.4} shadow={0.16} keyPos={keyAt(s)}>
        <Camera pos={[BCAM.pos[0] - 0.3 + l * 0.08, BCAM.pos[1], BCAM.pos[2]]} target={BCAM.target} />
        <Bar3D x={2.55} h={h5} floorY={FLOOR} />
        <Bar3D x={4.25} h={h55} hero floorY={FLOOR} />
      </Studio>
      <div style={{ position: "absolute", left: 140, top: 250 }}>
        <Rise s={s} at={T.bench + 0.1} size="sub" color={COLOR.sub}>Terminal-Bench 4.0</Rise>
        <div style={{ height: 18 }} />
        <div style={{ fontFamily: SANS, fontSize: SIZE.hero, fontWeight: 500, letterSpacing: TRACK.hero, lineHeight: 0.98, color: COLOR.ink, fontVariantNumeric: "tabular-nums", opacity: ramp(l, [0.5, 0.8]) }}>{(70.6 * g55).toFixed(1)}%</div>
        <div style={{ height: 26 }} />
        <Rise s={s} at={T.bench + 1.9} size="sub" color={COLOR.sub}>Up from 10.3% on Sonnet 5.</Rise>
      </div>
      <div style={{ position: "absolute", left: l5.x, top: l5.y - 36, transform: "translateX(-50%)", fontFamily: SANS, fontSize: SIZE.label, fontWeight: 500, color: COLOR.faint, opacity: g5 }}>Sonnet 5</div>
      <div style={{ position: "absolute", left: l55.x, top: l55.y - 36, transform: "translateX(-50%)", fontFamily: SANS, fontSize: SIZE.label, fontWeight: 500, color: COLOR.ink, opacity: ramp(g55, [0.2, 0.5]) }}>Sonnet 5.5</div>
      <div style={{ position: "absolute", left: 140, bottom: 70, fontFamily: SANS, fontSize: SIZE.label, color: COLOR.faint, opacity: ramp(l, [1.6, 2.0]) }}>As reported by Anthropic, September 28, 2026</div>
    </AbsoluteFill>
  );
};

// ---------- 23–27s · available everywhere: the platforms orbit the mark ----------
const PLACES = ["Claude apps", "Claude Platform", "Amazon Web Services", "Google Cloud", "Microsoft Azure"];
const ECAM = { pos: [0, 0.6, 10] as V3, target: [0, 0.2, 0] as V3 };
const EverywhereScene: React.FC<{ s: number }> = ({ s }) => {
  const l = s - T.everywhere;
  const k = springAt(s, T.everywhere + 0.1, { damping: 16, stiffness: 90, mass: 1 });
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-3} shadow={0.15} keyPos={keyAt(s)}>
        <Camera pos={ECAM.pos} target={ECAM.target} />
        <Mark3D size={2.2 * k} position={[0, 0.1, 0]} rotation={[-0.15, 0.3 + Math.sin(l * 0.7) * 0.25, l * 0.5]} />
      </Studio>
      {PLACES.map((p, i) => {
        const a = (i / PLACES.length) * Math.PI * 2 + l * 0.45 - Math.PI / 2;
        const world: V3 = [Math.cos(a) * 3.3, 0.1 + Math.sin(a) * 0.55, Math.sin(a) * 2.2];
        const sc = project(world, ECAM.pos, ECAM.target);
        const depth = (Math.sin(a) + 1) / 2; // 0 back … 1 front
        const inP = ramp(l, [0.4 + i * 0.12, 0.9 + i * 0.12], [0, 1], ease.out);
        return (
          <div key={p} style={{ position: "absolute", left: sc.x, top: sc.y, transform: `translate(-50%, -50%) scale(${0.8 + depth * 0.25})`, fontFamily: SANS, fontSize: SIZE.sub, fontWeight: 500, letterSpacing: TRACK.sub, color: COLOR.ink, opacity: inP * (depth < 0.38 ? 0.1 + depth * 0.4 : 0.35 + depth * 0.65), whiteSpace: "nowrap", zIndex: Math.round(depth * 10) }}>
            {p}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 96 }}>
        <Rise s={s} at={T.everywhere + 0.15} size="headline" align="center">Available everywhere you build.</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, textAlign: "center", fontFamily: SANS, fontSize: SIZE.label, color: COLOR.faint, letterSpacing: TRACK.label, opacity: ramp(l, [1.4, 1.8]) }}>Model ID: claude-sonnet-5-5</div>
    </AbsoluteFill>
  );
};

// ---------- 27–31.5s · end card ----------
const EndScene: React.FC<{ s: number }> = ({ s }) => {
  const l = s - T.end;
  const k = springAt(s, T.end + 0.15, { damping: 15, stiffness: 70, mass: 1 });
  return (
    <AbsoluteFill>
      <Paper />
      <Studio wallZ={-2.6} shadow={0.16} keyPos={keyAt(s)}>
        <Camera pos={[0, 0.3, 10]} target={[0, 0.2, 0]} />
        <Mark3D size={1.9 * k} position={[0, 1.15, 0]} rotation={[-0.12, (1 - k) * -2.4 + Math.sin(l * 0.6) * 0.18, 0.1 + l * 0.3]} />
      </Studio>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560 }}>
        <Rise s={s} at={T.end + 0.5} size="hero" align="center" step={0.1} accent="5.5">Claude Sonnet 5.5</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 750 }}>
        <Rise s={s} at={T.end + 1.1} size="sub" color={COLOR.sub} align="center">Faster, for everyday work.</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, textAlign: "center", fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: COLOR.faint, opacity: ramp(l, [1.6, 2.1]) }}>
        <div>A concept film by Breeders, made for education, with love for motion design and for AI. Figures from Anthropic's announcement, September 28, 2026.</div>
        <div>Not affiliated with or endorsed by Anthropic. Claude and the Claude logo are trademarks of Anthropic, shown for illustration only.</div>
      </div>
    </AbsoluteFill>
  );
};

// soft fade between scenes (cream to cream, so it reads as a breath, not a dip)
const cut = (s: number, at: number) => 1 - Math.min(ramp(s, [at - 0.18, at]), 1 - ramp(s, [at, at + 0.22]));

export const ClaudeSonnet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const fade = [T.cost, T.work, T.bench, T.everywhere, T.end].reduce((m, at) => Math.min(m, cut(s, at)), 1);
  return (
    <AbsoluteFill style={{ background: COLOR.paper }}>
      <Audio src={staticFile("sonnet/mix.wav")} />
      <AbsoluteFill style={{ opacity: fade }}>
        {s < T.cost ? <MarkScene s={s} /> : null}
        {inR(s, T.cost, T.work) ? <CostScene s={s} /> : null}
        {inR(s, T.work, T.bench) ? <WorkScene s={s} /> : null}
        {inR(s, T.bench, T.everywhere) ? <BenchScene s={s} /> : null}
        {inR(s, T.everywhere, T.end) ? <EverywhereScene s={s} /> : null}
        {inR(s, T.end, T.outro) ? <EndScene s={s} /> : null}
      </AbsoluteFill>
      {s >= T.outro ? <BreedersOutro t={s - T.outro} /> : null}
      <Watermark opacity={(1 - ramp(s, [T.outro - 0.4, T.outro], [0, 1])) * (inR(s, T.end + 1.4, T.outro) || inR(s, T.bench, T.everywhere) ? 0 : 1)} font={SANS} dark={0} />
    </AbsoluteFill>
  );
};
