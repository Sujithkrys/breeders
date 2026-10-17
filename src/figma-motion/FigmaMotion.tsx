// FigmaMotion: a launch film for Figma Motion (Config 2026, open beta), in Figma's own film language (references:
// "new references/videos/figma ref1 (1|2).mp4"): regular-weight titles on black over drifting code, or top-left on
// flat colour blocks; Figma frames, multiplayer cursors, the agent prompt box, code tiles; a cut about every second.
// The design being animated is "Loop", an original record-store app (loop.tsx). Unofficial; made by Breeders.
// Cut to the voiceover (word times in out/.tmp/figma_words.json, shifted by VO). Sound: scripts/compose-figma.mjs.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, kf, ramp } from "../utils";
import { Arrow, C, CodeBg, CodeTile, Frame, Key, LEN, MONO, MotionPanel, NameCursor, PromptBox, ROWS, START, Timeline, Title, TITLE, tlPx, tlX0, TL, Toolbar, UI } from "./fig";
import { LoopAnim, LoopBrowse, LoopHome, LoopTicket, Vinyl, COVERS } from "./loop";
import { FigmaMark } from "./ui";

export const W = 1920, H = 1080;
export const VO = 0.3;
// cut times (seconds); the sound script mirrors these
export const CUTS = [0, 1.0, 1.45, 1.9, 3.2, 4.15, 4.9, 5.75, 6.75, 7.9, 8.35, 9.3, 9.95, 11.33, 12.1, 12.9, 14.6, 15.35, 16.7, 17.6, 18.6, 20.35, 21.0, 21.75, 22.5, 23.6, 23.9, 24.2, 24.5];
export const BODY = 27.0;
export const FIGMA = { fps: 30, width: W, height: H, seconds: BODY + OUTRO_LEN };

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lin = (t: number, a: number, b: number) => ramp(t, [a, b], [0, 1], ease.linear);
const press = (t: number, at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.09);
const path = (t: number, pts: [number, number, number][]): [number, number] => {
  const ts = pts.map((p) => p[0]);
  return [kf(t, ts, pts.map((p) => p[1])), kf(t, ts, pts.map((p) => p[2]))];
};
const AH = (w: number) => 844 * (w / 390);

// ---------- the animation the timeline holds ----------
const KEYS: Key[] = ROWS.flatMap((_, r) => [{ row: r, t: START[r] }, { row: r, t: START[r] + LEN[r] }]);
const BY_TIME = [...KEYS].sort((a, b) => a.t - b.t || a.row - b.row);
const kOf = (p: number, r: number) => ease.out(clamp((p - START[r]) / LEN[r]));
const animAt = (p: number): LoopAnim => ({ header: kOf(p, 0), sleeve: kOf(p, 1), vinyl: kOf(p, 2), spin: kOf(p, 2) * 240 + Math.max(0, p - START[2] - LEN[2]) * 200, list: kOf(p, 3), play: kOf(p, 4) });
const keysPop = (t: number, t0: number, t1: number): Key[] => BY_TIME.map((k, i) => ({ ...k, pop: lin(t, t0 + ((t1 - t0) * i) / BY_TIME.length, t0 + ((t1 - t0) * i) / BY_TIME.length + 0.2) }));
const barsOf = (keys: Key[]) => ROWS.map((_, r) => Math.min(...keys.filter((k) => k.row === r).map((k) => k.pop ?? 1)));
const ALL = ROWS.map(() => 1);

const Bg: React.FC<{ c: string }> = ({ c }) => <AbsoluteFill style={{ background: c }} />;
const Canvas: React.FC = () => <AbsoluteFill style={{ background: C.canvas, backgroundImage: "radial-gradient(#D2D2D2 1.3px, transparent 1.5px)", backgroundSize: "28px 28px" }} />;
const Push: React.FC<{ t: number; a: number; b: number; from?: number; to?: number; ox?: string; children: React.ReactNode }> = ({ t, a, b, from = 1, to = 1.04, ox = "50% 50%", children }) => (
  <AbsoluteFill style={{ transform: `scale(${lerp(from, to, lin(t, a, b))})`, transformOrigin: ox }}>{children}</AbsoluteFill>
);
const Abs: React.FC<{ x: number; y: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, style, children }) => <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>;
// a block title, top-left, as on Figma's colour cards
const Card: React.FC<{ t: number; words: [string, number][]; color: string; size?: number }> = ({ t, words, color, size = 84 }) => <Title t={t} lines={[words]} size={size} color={color} align="left" style={{ left: 90, top: 70 }} />;

const CSS = ["@keyframes spin-out {", "  from { transform: translateX(0) rotate(0); }", "  to   { transform: translateX(120px) rotate(240deg); }", "}", ".vinyl {", "  animation: spin-out 750ms", "    cubic-bezier(0.16, 1, 0.3, 1) 350ms both;", "}"];
const REACT = ["export function Vinyl() {", "  return (", "    <div className=\"vinyl\">", "      <Record label=\"Night Swim\" />", "    </div>", "  );", "}"];
const MOTION = ["import { animate } from \"motion\";", "", "animate(\".vinyl\",", "  { x: [0, 120], rotate: [0, 240] },", "  { duration: 0.75, delay: 0.35,", "    ease: [0.16, 1, 0.3, 1] }", ");"];

type Shot = { el: React.ReactNode; dark?: boolean };
const shot = (n: number, t: number): Shot => {
  switch (n) {
    // ---------- 0:00 Your designs … were never meant to sit still ----------
    case 0:
      return { dark: true, el: <><CodeBg t={t} /><Title t={t} lines={[[["Your", 0.3], ["designs", 0.66]]]} size={104} style={{ left: 0, right: 0, top: 470 }} /></> };
    case 1: // three screens, perfectly still
      return {
        el: (
          <>
            <Canvas />
            {[0, 1, 2].map((i) => (
              <Frame key={i} name={["Loop / Home", "Loop / Browse", "Loop / Ticket"][i]} w={330} h={AH(330)} style={{ left: 330 + i * 450, top: 120 }}>
                {i === 0 ? <LoopHome w={330} /> : i === 1 ? <LoopBrowse w={330} /> : <LoopTicket w={330} />}
              </Frame>
            ))}
          </>
        ),
      };
    case 2: // close on the record, still
      return {
        el: (
          <>
            <Bg c={C.lav} />
            <Frame name="Loop / Home" w={700} h={AH(700)} scale={2} style={{ left: 610, top: 60 }}>
              <LoopHome w={700} />
            </Frame>
          </>
        ),
      };
    case 3:
      return { dark: true, el: <><CodeBg t={t} /><Title t={t} lines={[[["Never", 1.9], ["meant", 1.97], ["to", 2.04]], [["sit", 2.15], ["still.", 2.28]]]} size={104} style={{ left: 0, right: 0, top: 410 }} /></> };
    // ---------- 0:03 Meet Figma Motion ----------
    case 4: {
      const k = (i: number) => ramp(t, [3.22 + i * 0.06, 3.62 + i * 0.06], [0, 1], ease.outBack);
      const from: [number, number][] = [[-120, -90], [130, -110], [-150, 10], [150, 40], [-90, 140]];
      return {
        dark: true,
        el: (
          <>
            <CodeBg t={t} />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 48 }}>
              <FigmaMark size={150} parts={(i) => ({ x: from[i][0] * (1 - k(i)), y: from[i][1] * (1 - k(i)), s: 0.5 + 0.5 * k(i), o: Math.min(1, k(i) * 3) })} />
              <div style={{ position: "relative", width: 760, height: 130 }}>
                <Title t={t} lines={[[["Figma", 3.42], ["Motion", 3.88]]]} size={128} style={{ left: 0, top: 0 }} />
              </div>
            </AbsoluteFill>
          </>
        ),
      };
    }
    case 5: { // the new Motion tool in the UI3 toolbar
      const [x, y] = path(t, [[4.15, 1500, 900], [4.5, 1366, 600], [4.9, 1366, 600]]);
      return {
        el: (
          <>
            <Bg c={C.lime} />
            <Push t={t} a={4.15} b={4.9} from={1} to={1.05}>
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                <Toolbar active={t > 4.55 ? 7 : 0} scale={2.2} />
              </AbsoluteFill>
              <Arrow x={x} y={y} size={60} press={press(t, 4.55)} />
            </Push>
          </>
        ),
      };
    }
    // ---------- 0:05 switch any frame to Motion ----------
    case 6: {
      const [x, y] = path(t, [[4.9, 1500, 900], [5.3, 1000, 520], [5.75, 1060, 560]]);
      return {
        el: (
          <>
            <Canvas />
            <Push t={t} a={4.9} b={5.75} from={1.04} to={1.1}>
              <Frame name="Loop / Home" w={380} h={AH(380)} sel={ramp(t, [5.3, 5.36])} size="390 × 844" style={{ left: 770, top: 70 }}>
                <LoopHome w={380} />
              </Frame>
              <NameCursor x={x} y={y} name="Maya" color="#E8458B" press={press(t, 5.3)} />
            </Push>
          </>
        ),
      };
    }
    case 7: {
      const [x, y] = path(t, [[5.75, 1250, 900], [5.98, 1158, 512], [6.4, 1170, 560]]);
      return {
        el: (
          <>
            <Bg c={C.lav} />
            <Push t={t} a={5.75} b={6.75}>
              <Abs x={656} y={150}><MotionPanel on={ramp(t, [6.02, 6.2])} preset={t > 6.45 ? 1 : -1} scale={1.6} /></Abs>
              <Arrow x={x} y={y} size={56} press={press(t, 6.02) + press(t, 6.45)} />
            </Push>
          </>
        ),
      };
    }
    case 8: { // … and a timeline appears
      const k = ease.out(ramp(t, [6.95, 7.45]));
      return {
        el: (
          <>
            <Bg c={C.lime} />
            <Frame name="Loop / Home" w={300} h={AH(300)} sel={1} motion={1} style={{ left: 810, top: 40 - 260 * k, opacity: 1 - 0.3 * k }}>
              <LoopHome w={300} />
            </Frame>
            <Abs x={160} y={lerp(1100, 420, k)}><Timeline w={1600} playhead={0} keys={[]} label="No keyframes yet" /></Abs>
          </>
        ),
      };
    }
    case 9: { // multiplayer on the canvas
      const [ax, ay] = path(t, [[7.9, 640, 300], [8.35, 700, 360]]);
      const [bx, by] = path(t, [[7.9, 1500, 260], [8.35, 1440, 330]]);
      return {
        el: (
          <>
            <Canvas />
            <Push t={t} a={7.9} b={8.35} from={1.25} to={1.3} ox="40% 30%">
            <Frame name="Loop / Home" w={280} h={AH(280)} sel={1} motion={1} style={{ left: 200, top: 90 }}><LoopHome w={280} /></Frame>
            <Frame name="Loop / Ticket" w={280} h={AH(280)} style={{ left: 560, top: 90 }}><LoopTicket w={280} /></Frame>
            <Abs x={930} y={330}><Timeline w={900} playhead={0.3} keys={KEYS} bars={ALL} /></Abs>
            <NameCursor x={ax} y={ay} name="Leo" color="#14AE5C" />
            <NameCursor x={bx} y={by} name="Ines" color={C.blue} />
            </Push>
          </>
        ),
      };
    }
    // ---------- 0:08 Right inside Figma ----------
    case 10:
      return { el: <><Bg c={C.green} /><Card t={t} color={C.greenText} words={[["Right", 8.38], ["inside", 8.56], ["Figma", 8.92]]} size={96} /></> };
    case 11: { // close on the frame, Motion badge, toolbar
      return {
        el: (
          <>
            <Canvas />
            <Push t={t} a={9.3} b={9.95} from={1.12} to={1.2} ox="50% 40%">
              <Frame name="Loop / Home" w={420} h={AH(420)} sel={1} motion={1} size="390 × 844" style={{ left: 750, top: 50 }}><LoopHome w={420} anim={animAt(lin(t, 9.35, 9.95) * 1.4)} /></Frame>
              <NameCursor x={1240} y={420} name="Kenji" color="#FF7A1A" />
            </Push>
          </>
        ),
      };
    }
    // ---------- 0:10 Set keyframes · Scrub · Ease ----------
    case 12: {
      const t0 = 10.0, t1 = 10.95, end = 1.3;
      const keys = KEYS.map((k) => ({ ...k, pop: lin(t, t0 + (k.t / end) * (t1 - t0), t0 + (k.t / end) * (t1 - t0) + 0.18) }));
      return {
        el: (
          <>
            <Bg c={C.lav} />
            <Card t={t} color={C.ink} words={[["Set", 10.0], ["keyframes", 10.14]]} />
            <Push t={t} a={9.95} b={11.33} from={1} to={1.03} ox="50% 70%">
              <Abs x={160} y={330}><Timeline w={1600} playhead={lin(t, t0, t1) * end} keys={keys} bars={barsOf(keys)} /></Abs>
            </Push>
          </>
        ),
      };
    }
    case 13: {
      const p = kf(t, [11.38, 11.62, 11.84, 12.08], [0.05, 1.3, 0.4, 1.1]);
      const TX = 640, TY = 380, TW = 1180;
      return {
        el: (
          <>
            <Bg c={C.lime} />
            <Card t={t} color={C.ink} words={[["Scrub", 11.38]]} />
            <Frame name="Loop / Home" w={320} h={AH(320)} sel={1} motion={1} style={{ left: 200, top: 210 }}><LoopHome w={320} anim={animAt(p)} /></Frame>
            <Abs x={TX} y={TY}><Timeline w={TW} playhead={p} keys={KEYS} bars={ALL} /></Abs>
            <Arrow x={TX + tlX0 + p * tlPx(TW) + 4} y={TY + TL.head + 8} size={52} press={0.6} />
          </>
        ),
      };
    }
    case 14: {
      const k = ease.inOut(ramp(t, [12.18, 12.62]));
      const SZ = 560, X = 1100, Y = 250;
      const h1 = [0.33 - 0.25 * k, 0.33 + 0.62 * k], h2 = [0.67 - 0.1 * k, 1];
      const P = (x: number, y: number) => `${x * SZ} ${(1 - y) * SZ}`;
      return {
        dark: true,
        el: (
          <>
            <Bg c="#000" />
            <Card t={t} color="#fff" words={[["Ease", 12.16]]} />
            <Abs x={X} y={Y}>
              <svg width={SZ} height={SZ} style={{ overflow: "visible" }}>
                <rect width={SZ} height={SZ} fill="#111" stroke="#333" rx={14} />
                {[0.25, 0.5, 0.75].map((g) => <g key={g} stroke="#222"><line x1={g * SZ} x2={g * SZ} y1={0} y2={SZ} /><line y1={g * SZ} y2={g * SZ} x1={0} x2={SZ} /></g>)}
                <line x1={0} y1={SZ} x2={h1[0] * SZ} y2={(1 - h1[1]) * SZ} stroke={C.purple} strokeWidth={2} />
                <line x1={SZ} y1={0} x2={h2[0] * SZ} y2={(1 - h2[1]) * SZ} stroke={C.purple} strokeWidth={2} />
                <path d={`M${P(0, 0)} C${P(h1[0], h1[1])} ${P(h2[0], h2[1])} ${P(1, 1)}`} stroke="#fff" strokeWidth={4} fill="none" />
                <circle cx={h1[0] * SZ} cy={(1 - h1[1]) * SZ} r={10} fill="#000" stroke={C.purple} strokeWidth={3} />
                <circle cx={h2[0] * SZ} cy={(1 - h2[1]) * SZ} r={10} fill="#000" stroke={C.purple} strokeWidth={3} />
              </svg>
              <div style={{ fontFamily: MONO, fontSize: 26, color: "#BDBDBD", marginTop: 28 }}>cubic-bezier({h1[0].toFixed(2)}, {Math.min(1, h1[1]).toFixed(2)}, {h2[0].toFixed(2)}, 1)</div>
            </Abs>
            <Abs x={300} y={540}><Vinyl size={360} label={COVERS[0].label} rot={ramp((t - 12.15) % 0.75, [0, 0.7], [0, 1], (x) => lerp(x, ease.out(x), k)) * 300} /></Abs>
            <Arrow x={X + h1[0] * SZ} y={Y + (1 - h1[1]) * SZ} size={52} press={k > 0 && k < 1 ? 1 : 0} />
          </>
        ),
      };
    }
    // ---------- 0:13 Or just describe it, and Figma's agent animates it for you ----------
    case 15: {
      const TEXT = "Slide the record out of its sleeve and give it a spin.";
      const n = Math.floor(ramp(t, [13.1, 14.3], [0, TEXT.length], ease.linear));
      const [x, y] = path(t, [[13.9, 1700, 900], [14.4, 1532, 640], [14.6, 1532, 640]]);
      return {
        el: (
          <>
            <Bg c={C.lav} />
            <Push t={t} a={12.9} b={14.6} from={1} to={1.04}>
              <Abs x={410} y={330}><PromptBox w={1100} size={48} text={TEXT.slice(0, n)} caret={t < 14.5 && Math.floor(t * 3.5) % 2 === 0} ready={n >= TEXT.length} press={press(t, 14.48)} chip="Loop / Home" /></Abs>
              {t > 13.9 ? <Arrow x={x} y={y} size={56} press={press(t, 14.48)} /> : null}
            </Push>
          </>
        ),
      };
    }
    case 16: {
      const keys = keysPop(t, 14.7, 15.25);
      return {
        el: (
          <>
            <Bg c={C.green} />
            <Card t={t} color={C.greenText} words={[["Figma's", 14.6], ["agent", 14.88]]} />
            <Abs x={160} y={340}><Timeline w={1600} playhead={0} keys={keys} bars={barsOf(keys)} label="✦ Agent added 10 keyframes" /></Abs>
          </>
        ),
      };
    }
    case 17: {
      const p = lin(t, 15.45, 16.6) * 1.5;
      return {
        el: (
          <>
            <Canvas />
            <Frame name="Loop / Home" w={410} h={AH(410)} sel={1} motion={1} size="390 × 844" style={{ left: 755, top: 40 }}><LoopHome w={410} anim={t < 15.45 ? animAt(0) : animAt(p)} /></Frame>
            <NameCursor x={1230} y={300} name="Figma agent" color={C.purple} />
          </>
        ),
      };
    }
    // ---------- 0:17 When it's ready, developers get the code ----------
    case 18:
      return { dark: true, el: <><CodeBg t={t} /><Title t={t} lines={[[["When", 16.78], ["it's", 16.96], ["ready", 17.14]]]} size={104} style={{ left: 0, right: 0, top: 470 }} /></> };
    case 19: {
      const ROWSD: [string, string][] = [["Layer", "Vinyl"], ["Duration", "750 ms"], ["Delay", "350 ms"], ["Easing", "Ease out · cubic-bezier(0.16, 1, 0.3, 1)"], ["Keyframes", "x 0 → 120 · rotate 0° → 240°"]];
      return {
        dark: true,
        el: (
          <>
            <Bg c="#000" />
            <Push t={t} a={17.6} b={18.6} from={1} to={1.03}>
              <Abs x={260} y={170} style={{ width: 1400, borderRadius: 22, background: "#2C2C2C", border: "1px solid #3A3A3A", fontFamily: UI, color: "#EDEDED", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, height: 92, padding: "0 40px", borderBottom: "1px solid #3A3A3A" }}>
                  <svg width={30} height={30} viewBox="0 0 16 16"><path d="M5 3L1 8l4 5M11 3l4 5-4 5" stroke="#7CFFB2" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontSize: 32, fontWeight: 500 }}>Dev Mode</span>
                  <span style={{ marginLeft: "auto", fontSize: 22, color: "#9A9A9A" }}>Inspect · Motion</span>
                </div>
                <div style={{ padding: "24px 40px 30px" }}>
                  {ROWSD.map(([k, v], i) => {
                    const o = ramp(t, [17.7 + i * 0.1, 17.9 + i * 0.1]);
                    return (
                      <div key={k} style={{ display: "flex", alignItems: "center", height: 74, fontSize: 32, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, borderBottom: i < ROWSD.length - 1 ? "1px solid #353535" : undefined }}>
                        <span style={{ width: 280, color: "#9A9A9A" }}>{k}</span>
                        <span style={{ fontFamily: MONO, fontSize: 30 }}>{v}</span>
                      </div>
                    );
                  })}
                </div>
              </Abs>
            </Push>
          </>
        ),
      };
    }
    case 20:
    case 21:
    case 22: {
      const i = n - 20;
      const tabs = ["CSS", "React", "motion.dev"];
      const bg = [C.lime, C.lav, C.green][i];
      const tile = [C.plum, C.plum, "#0A3D20"][i];
      const at = [18.7, 20.38, 21.02][i];
      const lines = [CSS, REACT, MOTION][i];
      const file = ["vinyl.css", "Vinyl.tsx", "spin.js"][i];
      const pulse = Math.exp(-Math.max(0, t - [19.52, 20.38, 21.02][i]) * 6) * (t >= [19.52, 20.38, 21.02][i] ? 1 : 0);
      return {
        el: (
          <>
            <Bg c={bg} />
            <Abs x={260} y={110} style={{ display: "flex", gap: 14 }}>
              {tabs.map((tb, j) => (
                <div key={tb} style={{ padding: "14px 30px", borderRadius: 999, fontFamily: UI, fontSize: 30, fontWeight: 500, background: j === i ? "#000" : "rgba(0,0,0,0.08)", color: j === i ? "#fff" : i === 2 ? C.greenText : C.ink, transform: `scale(${j === i ? 1 + 0.06 * pulse : 1})` }}>{tb}</div>
              ))}
            </Abs>
            <Abs x={260} y={230}><CodeTile file={file} lines={lines} w={1400} t={t} at={at} bg={tile} size={34} /></Abs>
          </>
        ),
      };
    }
    case 23: { // copy
      const done = t > 21.92;
      const [x, y] = path(t, [[21.75, 1300, 800], [21.9, 1010, 560], [22.5, 1030, 590]]);
      return {
        dark: true,
        el: (
          <>
            <CodeBg t={t} />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "30px 56px", borderRadius: 999, background: done ? C.lime : "#fff", fontFamily: UI, fontSize: 56, fontWeight: 500, color: "#000", transform: `scale(${1 - 0.06 * press(t, 21.9)})` }}>
                {done ? "✓ Copied" : "Copy code"}
              </div>
            </AbsoluteFill>
            <Arrow x={x} y={y} size={64} press={press(t, 21.9)} />
          </>
        ),
      };
    }
    // ---------- 0:22 Figma Motion. Design that moves. ----------
    case 24: {
      const k = (i: number) => ramp(t, [22.5 + i * 0.05, 22.85 + i * 0.05], [0, 1], ease.outBack);
      return {
        el: (
          <>
            <Bg c="#fff" />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 44 }}>
              <FigmaMark size={140} parts={(i) => ({ x: 0, y: (1 - k(i)) * 20, s: k(i), o: Math.min(1, k(i) * 2) })} />
              <div style={{ position: "relative", width: 700, height: 130 }}>
                <Title t={t} lines={[[["Figma", 22.58], ["Motion", 22.78]]]} size={124} color="#000" align="left" style={{ left: 0, top: 0 }} />
              </div>
            </AbsoluteFill>
          </>
        ),
      };
    }
    case 25: {
      const u = clamp((t - 23.6) / 0.3);
      return { el: <><Bg c={C.lav} /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><div style={{ borderRadius: 30, overflow: "hidden", boxShadow: "0 30px 80px rgba(40,20,80,0.25)" }}><LoopBrowse w={430} k={u * 1.2} /></div></AbsoluteFill></> };
    }
    case 26: {
      const u = ease.out(clamp((t - 23.9) / 0.3));
      return { el: <><Bg c={C.green} /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><div style={{ borderRadius: 30, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}><LoopTicket w={430} slide={u} /></div></AbsoluteFill></> };
    }
    case 27: {
      const u = clamp((t - 24.2) / 0.3);
      return { dark: true, el: <><Bg c="#000" /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><Vinyl size={760} label={COVERS[0].label} rot={u * 220} /></AbsoluteFill></> };
    }
    default: {
      const out = ramp(t, [BODY - 0.35, BODY], [0, 1], ease.in);
      return {
        dark: true,
        el: (
          <>
            <CodeBg t={t} />
            <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
              <Title t={t} lines={[[["Design", 24.5], ["that", 24.6], ["moves.", 24.7]]]} size={120} style={{ left: 0, right: 0, top: 440 }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 610, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: ramp(t, [25.1, 25.4]), fontFamily: TITLE, fontSize: 36, color: C.yellow, letterSpacing: "-0.02em" }}>
                <FigmaMark size={40} /> Figma Motion · Open beta
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, textAlign: "center", fontFamily: UI, fontSize: 17, color: "rgba(255,255,255,0.45)", opacity: ramp(t, [25.5, 25.9]) }}>Unofficial film by Breeders · not affiliated with Figma</div>
            </div>
          </>
        ),
      };
    }
  }
};

export const FigmaMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t >= BODY) return <AbsoluteFill><Audio src={staticFile("figma-motion/mix.wav")} /><BreedersOutro t={t - BODY} /></AbsoluteFill>;
  let n = CUTS.length - 1;
  while (n > 0 && t < CUTS[n]) n--;
  const s = shot(n, t);
  // every cut lands with a short settle
  const settle = n === 0 ? 1 : 1 + 0.025 * (1 - ease.out(ramp(t - CUTS[n], [0, 0.25])));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("figma-motion/mix.wav")} />
      <AbsoluteFill style={{ transform: `scale(${settle})` }}>{s.el}</AbsoluteFill>
      <Watermark opacity={0.7 * (1 - ramp(t, [BODY - 0.35, BODY]))} dark={s.dark ? 1 : 0} />
    </AbsoluteFill>
  );
};
