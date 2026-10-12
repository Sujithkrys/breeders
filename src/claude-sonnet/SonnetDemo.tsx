// Claude Sonnet 5.5 — 30s product demo in Pine Pro's exact type and components, one isolated element per shot, each
// held long enough to read: announce → switch the model (toggle) → the prompt (composer close-up) → Claude works
// (steps) → the answer and its card → the deck, full screen → a second task (prompt → trip plan, full screen) → the
// numbers → the name. Type: Inter Tight Bold for statements, Inter for UI (Pine's sizes). Shots in 30fps units.
// Facts from Anthropic's announcement (Sept 28, 2026); task contents are example data.
import React from "react";
import { AbsoluteFill, Audio, interpolate, random, staticFile } from "remotion";
import { Watermark } from "../brand/Breeders";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { AppIcon, Cam, Composer, Cut, Dissolve, path, Pointer, press, Shimmer, Sparkle } from "../pine-launch/kit";
import { GRAY, INK, SANS, TIGHT } from "../pine-launch/theme";
import { ease, kf, ramp, useT } from "../utils";
import { DeckFilm } from "./ClaudePine";

const CLAY = "#D97757";
const CLAY_D = "#B85A3D";
const CREAM = "#F2EBDD";
const ESP = "#191714";

export const SHOT = {
  open: [0, 90],
  toggle: [90, 165],
  prompt: [165, 240],
  steps: [240, 345],
  answer: [345, 435],
  deck: [435, 600],
  prompt2: [600, 675],
  trip: [675, 765],
  stats: [765, 855],
  logo: [855, 900],
} as const;
export const SONNET_DEMO = { fps: 60, width: 1920, height: 1080, units: 900 };

// our own dark ground for the type shots: warm near-black with a soft clay glow and drifting embers
const Ember: React.FC<{ t: number; black?: number }> = ({ t, black = 0 }) => (
  <AbsoluteFill style={{ background: "#0E0C0B" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 58%, rgba(217,119,87,0.22), rgba(217,119,87,0) 70%)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = random(`ex${i}`) * 1920;
        const y = (((random(`ey${i}`) * 1200 - t * (0.4 + random(`ev${i}`) * 0.9)) % 1200) + 1200) % 1200 - 60;
        return <circle key={i} cx={x} cy={y} r={0.8 + random(`er${i}`) * 1.8} fill={i % 4 ? "#F2C2AE" : "#FFFFFF"} opacity={0.15 + random(`eo${i}`) * 0.45} />;
      })}
    </svg>
    {black > 0 ? <AbsoluteFill style={{ background: "#000", opacity: black }} /> : null}
  </AbsoluteFill>
);
// Pine's words: Inter SemiBold 66px, white, one word every 5 units
const Words: React.FC<{ text: string; t: number; at: number; step?: number; size?: number; y?: number; dissolveFrom?: number }> = ({ text, t, at, step = 5, size = 66, y = 540, dissolveFrom }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.62, display: "flex", justifyContent: "center", fontFamily: SANS, fontSize: size, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.018em", whiteSpace: "pre" }}>
    {text.split(" ").map((w, i) => {
      const a = at + i * step;
      if (dissolveFrom !== undefined && i >= dissolveFrom)
        return (
          <span key={i}>
            {i ? " " : ""}
            <Dissolve text={w} t={t} at={a} />
          </span>
        );
      return (
        <span key={i} style={{ opacity: ramp(t, [a, a + 1.5], [0, 1], ease.linear) }}>
          {i ? " " : ""}
          {w}
        </span>
      );
    })}
  </div>
);

// ---------- 0:00 announce ----------
const Open = () => (
  <Cut span={SHOT.open} name="0:00 Announce" render={(t) => (
    <AbsoluteFill>
      <Ember t={t} />
      {t < 40 ? <Words text="Claude has a new model." t={t} at={6} step={5} /> : <Words text="Claude Sonnet 5.5" t={t} at={44} step={5} dissolveFrom={0} size={84} />}
    </AbsoluteFill>
  )} />
);

// ---------- 0:03 switch the model ----------
const Toggle = () => (
  <Cut span={SHOT.toggle} name="0:03 Switch to Sonnet 5.5" render={(t) => {
    const k = ramp(t, [26, 36], [0, 1], ease.inOut);
    const kx = 960 - 400 + 10 + k * 390;
    const cur = path(t, [0, 22], [1500, 1190], [860, 572]);
    return (
      <AbsoluteFill style={{ background: "#FFFFFF" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: SANS, fontSize: 19, color: GRAY, opacity: ramp(t, [2, 8]) }}>Choose a model</div>
        <div style={{ transform: `scale(${kf(t, [0, 12], [0.96, 1], ease.out)})`, opacity: ramp(t, [0, 6]) }}>
          <div style={{ position: "absolute", left: 960 - 400, top: 540 - 68, width: 800, height: 136, borderRadius: 68, background: "#EDEDED", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }} />
          <div style={{ position: "absolute", left: kx, top: 540 - 58, width: 390, height: 116, borderRadius: 58, background: "#FFFFFF", boxShadow: `0 4px 14px rgba(0,0,0,0.12), 0 0 ${ramp(t, [30, 40]) * 30}px rgba(255,255,255,0.5)` }} />
          {["Sonnet 5", "Sonnet 5.5"].map((l, i) => {
            const on = i === 1 ? k : 1 - k;
            return (
              <div key={l} style={{ position: "absolute", left: 960 - 400 + 10 + i * 390, top: 540 - 58, width: 390, height: 116, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: SANS, fontSize: 50, fontWeight: 500, letterSpacing: "-0.01em", color: `rgb(${Math.round(154 - on * 141)},${Math.round(154 - on * 141)},${Math.round(154 - on * 140)})` }}>
                {i === 1 ? <ClaudeMark size={38} color={CLAY} /> : null}
                {l}
              </div>
            );
          })}
        </div>
        <Sparkle t={t} at={32} x={960 - 400 + 10 + 390 + 195} y={540} w={410} h={136} dur={34} color="#E9A58C" />
        <Pointer x={cur.x} y={cur.y} size={40} press={press(t, 25)} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:05.5 the prompt, close ----------
const CLAUDE_MODEL = () => (
  <span style={{ fontSize: 15, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
    <ClaudeMark size={15} color={CLAY} /> Sonnet 5.5 <Icon name="chevronDown" size={15} color={GRAY} />
  </span>
);
const Tray: React.FC<{ files: [string, Parameters<typeof Icon>[0]["name"], string][] }> = ({ files }) => (
  <>
    {files.map(([f, ic, c]) => (
      <span key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={ic} size={16} color={c} /> {f}
      </span>
    ))}
  </>
);
const SEND = { x: 1327, y: 541 };
const PromptShot: React.FC<{ span: readonly [number, number]; name: string; text: string; files: [string, Parameters<typeof Icon>[0]["name"], string][]; rate?: number }> = ({ span, name, text, files, rate = 0.9 }) => (
  <Cut span={span} name={name} render={(t) => {
    const len = span[1] - span[0];
    const n = Math.max(0, Math.min(text.length, Math.floor((t - 6) * rate)));
    const done = 6 + text.length / rate;
    const sendT = Math.min(len - 6, done + 8);
    // close on the words while they type (the whole line stays in frame), then ease out to the full box for the send
    const s = kf(t, [0, done, done + 8, len], [2.5, 2.42, 2.08, 2.02], ease.inOut);
    const fx = kf(t, [0, done, done + 8], [900, 905, 960], ease.inOut);
    const fy = kf(t, [0, done + 8], [520, 530], ease.inOut);
    const cur = path(t, [done - 4, sendT - 1], [1500, SEND.x - 6], [760, SEND.y + 4]);
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [len - 4, len], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 550, top: 440 }}>
            <Composer text={n ? text.slice(0, n) + (t < done + 4 && Math.floor(t / 8) % 2 === 0 ? "|" : "") : undefined} placeholder="How can I help you today?" sendPress={press(t, sendT)} trayNode={<Tray files={files} />} modelNode={<CLAUDE_MODEL />} />
          </div>
          {t > done - 4 ? <Pointer x={cur.x} y={cur.y} size={22} press={press(t, sendT)} /> : null}
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:10 Claude works ----------
const STEPS: [Parameters<typeof AppIcon>[0]["name"], string, string][] = [
  ["file", CLAY, "Reading Q3 notes.pdf"],
  ["grid", "#1E8E5A", "Pulling figures from Q3_numbers.csv"],
  ["layers", "#7A5CFF", "Designing 6 slides"],
  ["check", "#2F7BFF", "Checking every number"],
];
const STEP_AT = [4, 24, 44, 64];
const Steps = () => (
  <Cut span={SHOT.steps} name="0:08 Working" render={(t) => {
    const len = SHOT.steps[1] - SHOT.steps[0];
    const shown = STEP_AT.filter((a) => t >= a).length;
    const lift = STEP_AT.reduce((acc, a) => acc + ramp(t, [a, a + 8], [0, 1], ease.out), 0);
    const exit = ramp(t, [len - 8, len], [0, 1], ease.in);
    return (
      <AbsoluteFill style={{ background: "#fff" }}>
        <div style={{ position: "absolute", left: 600, top: 520 - lift * 34, transform: `translateX(${-exit * 1500}px) scale(${kf(t, [0, len], [1.12, 1.18], ease.linear)})`, transformOrigin: "0 50%" }}>
          {STEPS.slice(0, shown).map(([ic, bg, label], i) => {
            const p = ramp(t, [STEP_AT[i], STEP_AT[i] + 8], [0, 1], ease.out);
            return (
              <div key={label} style={{ position: "absolute", left: 0, top: i * 68 - (1 - p) * 68, display: "flex", alignItems: "center", gap: 22, opacity: i === 0 ? p : ramp(t, [STEP_AT[i] + 2, STEP_AT[i] + 7]), whiteSpace: "nowrap" }}>
                <AppIcon name={ic} bg={bg} size={42} />
                {t < (STEP_AT[i + 1] ?? STEP_AT[i] + 24) ? (
                  <Shimmer t={t + i * 9} style={{ fontFamily: SANS, fontSize: 36, letterSpacing: "-0.01em" }}>
                    {label}
                  </Shimmer>
                ) : (
                  <span style={{ fontFamily: SANS, fontSize: 36, letterSpacing: "-0.01em", color: INK }}>{label}</span>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:13 the answer and its card, opening into the deck ----------
const ANSWER = "Here's your Q3 board deck: six slides, every figure checked against your numbers.";
const THUMB = { x: 560, y: 520, w: 560, h: 315 };
const Answer = () => (
  <Cut span={SHOT.answer} name="0:11.5 Answer" render={(t) => {
    const len = SHOT.answer[1] - SHOT.answer[0];
    const words = ANSWER.split(" ");
    const n = Math.min(words.length, Math.max(0, Math.floor((t - 1) * 1.4)));
    const s = kf(t, [0, 16, 30], [1.25, 1.25, 1], ease.inOut);
    const fx = kf(t, [0, 16, 30], [900, 900, 960], ease.inOut);
    const fy = kf(t, [0, 16, 30], [420, 430, 540], ease.inOut);
    const cur = path(t, [28, 44], [1300, THUMB.x + THUMB.w / 2 + 6], [960, THUMB.y + THUMB.h / 2 + 8]);
    const g = ramp(t, [50, len], [0, 1], ease.inOut);
    const cardIn = ramp(t, [18, 28], [0, 1], ease.out);
    return (
      <AbsoluteFill style={{ background: "#fff" }}>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 560, top: 300, width: 820, fontFamily: SANS }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, color: GRAY, marginBottom: 16 }}>
              <ClaudeMark size={20} color={CLAY} /> Sonnet 5.5
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.45, color: INK, letterSpacing: "-0.01em" }}>{words.slice(0, n).join(" ")}</div>
          </div>
          <div style={{ position: "absolute", left: THUMB.x, top: THUMB.y, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 20}px)` }}>
            <div style={{ width: THUMB.w, height: THUMB.h, borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.08)" }}>
              <div style={{ transform: `scale(${THUMB.w / 1920})`, transformOrigin: "0 0", width: 1920, height: 1080, position: "relative" }}>
                <DeckFilm t={20} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontFamily: SANS }}>
              <AppIcon name="layers" bg={CLAY} size={34} />
              <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>Q3 Board Review.pptx</div>
              <div style={{ fontSize: 15, color: GRAY }}>6 slides</div>
            </div>
          </div>
          <Pointer x={cur.x} y={cur.y} size={26} press={press(t, 48)} opacity={ramp(t, [28, 32]) * (1 - g)} />
        </Cam>
        {t >= 50 && (
          <div style={{ position: "absolute", left: interpolate(g, [0, 1], [THUMB.x, 0]), top: interpolate(g, [0, 1], [THUMB.y, 0]), width: interpolate(g, [0, 1], [THUMB.w, 1920]), height: interpolate(g, [0, 1], [THUMB.h, 1080]), borderRadius: 16 * (1 - g), overflow: "hidden", background: ESP }}>
            <div style={{ transform: `scale(${interpolate(g, [0, 1], [THUMB.w, 1920]) / 1920})`, transformOrigin: "0 0", width: 1920, height: 1080, position: "relative" }}>
              <DeckFilm t={20} />
            </div>
          </div>
        )}
      </AbsoluteFill>
    );
  }} />
);
// the deck, full screen (its own slides: Q3 · REVIEW · +29% · the tile grid)
const Deck = () => <Cut span={SHOT.deck} name="0:14.5 The deck" render={(t) => <DeckFilm t={20 + t} />} />;

// ---------- 0:22.5 the trip plan, full screen ----------
const DAYS: [string, string, [string, string, string][]][] = [
  ["Day 1", "North Goa", [["9:00", "Fort Aguada at sunrise", "Free"], ["13:00", "Lunch at Baga", "₹1,600"], ["18:30", "Sunset at Vagator", "Free"]]],
  ["Day 2", "Old Goa & Panjim", [["10:00", "Basilica of Bom Jesus", "Free"], ["15:00", "Fontainhas walk", "Free"], ["20:00", "Dinner in Panjim", "₹2,400"]]],
  ["Day 3", "South Goa", [["8:30", "Kayak at Palolem", "₹1,500"], ["12:30", "Butterfly Beach", "₹1,200"], ["19:00", "Beach shack dinner", "₹1,800"]]],
];
const Trip = () => (
  <Cut span={SHOT.trip} name="0:22.5 The trip plan" render={(t) => {
    const len = SHOT.trip[1] - SHOT.trip[0];
    const glide = kf(t, [0, len], [1.04, 1.0], ease.out);
    return (
      <AbsoluteFill style={{ background: CREAM, transform: `scale(${glide})` }}>
        <div style={{ position: "absolute", left: 120, top: 90, fontFamily: SANS, fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", color: CLAY_D, opacity: ramp(t, [0, 6]) }}>TRIP PLAN · MARCH 14–16</div>
        <div style={{ position: "absolute", left: 112, top: 140, fontFamily: TIGHT, fontWeight: 700, fontSize: 120, letterSpacing: "-0.045em", color: ESP, lineHeight: 1, opacity: ramp(t, [2, 8]), transform: `translateY(${(1 - ramp(t, [2, 14], [0, 1], ease.out)) * 30}px)` }}>3 days in Goa</div>
        <div style={{ position: "absolute", left: 120, right: 120, top: 330, display: "flex", gap: 30 }}>
          {DAYS.map(([d, area, items], i) => {
            const p = ramp(t, [8 + i * 7, 20 + i * 7], [0, 1], ease.out);
            return (
              <div key={d} style={{ flex: 1, borderRadius: 24, background: "#FFFFFF", padding: "30px 32px", opacity: p, transform: `translateY(${(1 - p) * 50}px)`, boxShadow: "0 10px 30px rgba(25,23,20,0.06)" }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, letterSpacing: "0.14em", color: CLAY_D }}>{d.toUpperCase()}</div>
                <div style={{ fontFamily: TIGHT, fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", color: ESP, marginTop: 6 }}>{area}</div>
                {items.map(([tm, what, cost]) => (
                  <div key={what} style={{ display: "flex", gap: 16, marginTop: 22, fontFamily: SANS, fontSize: 24 }}>
                    <span style={{ width: 70, color: GRAY, fontVariantNumeric: "tabular-nums" }}>{tm}</span>
                    <span style={{ flex: 1, color: ESP }}>{what}</span>
                    <span style={{ color: "#6B655C" }}>{cost}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, right: 120, top: 860, height: 110, borderRadius: 24, background: ESP, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", opacity: ramp(t, [34, 42]), transform: `translateY(${(1 - ramp(t, [34, 46], [0, 1], ease.out)) * 30}px)` }}>
          <span style={{ fontFamily: SANS, fontSize: 28, color: "#D8D0C2" }}>For two · stay, scooter, food and activities</span>
          <span style={{ fontFamily: TIGHT, fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", color: CREAM }}>₹38,400</span>
        </div>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:25.5 the numbers on colour blocks (Inter Tight Bold 300px) ----------
const STATS: { big: string; word: string; note: string; blocks: { x: number; y: number; w: number; h: number; c: string }[]; ink: string }[] = [
  { big: "30%+", word: "faster", note: "outputs than Sonnet 5", ink: INK, blocks: [{ x: 0, y: 0, w: 1920, h: 1080, c: "#FFFFFF" }, { x: 1100, y: -20, w: 840, h: 640, c: "#F3DCCD" }] },
  { big: "30%", word: "less", note: "cost per task, same price", ink: INK, blocks: [{ x: 0, y: 0, w: 1920, h: 1080, c: CREAM }, { x: 1000, y: 460, w: 940, h: 640, c: "#CFE0F4" }] },
  { big: "70.6%", word: "Terminal-Bench 4.0", note: "up from 10.3% on Sonnet 5", ink: INK, blocks: [{ x: 0, y: 0, w: 1920, h: 1080, c: CLAY }, { x: 1300, y: -20, w: 640, h: 380, c: "#F8E9DF" }] },
];
const Stats = () => (
  <Cut span={SHOT.stats} name="0:25.5 The numbers" render={(t) => {
    const i = Math.min(2, Math.floor(t / 30));
    const l = t - i * 30;
    const st = STATS[i];
    return (
      <AbsoluteFill>
        {st.blocks.map((bk, k) => (
          <div key={k} style={{ position: "absolute", left: bk.x, top: bk.y, width: bk.w, height: bk.h, background: bk.c, clipPath: k ? `inset(${(1 - ramp(l, [2, 8], [0, 1], ease.out)) * 100}% 0 0 0)` : undefined }} />
        ))}
        <div style={{ position: "absolute", left: 200, top: 290, fontFamily: TIGHT, fontWeight: 700, fontSize: 300, lineHeight: 1, letterSpacing: "-0.045em", color: st.ink, opacity: ramp(l, [0, 2]), transform: `scale(${ramp(l, [0, 6], [1.06, 1])})`, transformOrigin: "0 60%" }}>{st.big}</div>
        <div style={{ position: "absolute", left: 214, top: 640, fontFamily: TIGHT, fontWeight: 700, fontSize: 110, letterSpacing: "-0.04em", color: i === 2 ? "#FFFFFF" : CLAY_D, opacity: ramp(l, [5, 7]), transform: `scale(${ramp(l, [5, 11], [1.06, 1])})`, transformOrigin: "0 60%" }}>{st.word}</div>
        <div style={{ position: "absolute", left: 220, top: 790, fontFamily: SANS, fontSize: 32, fontWeight: 600, color: i === 2 ? "#FFF1EA" : "#4A4640", opacity: ramp(l, [10, 14]) }}>{st.note}</div>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:28.5 the name ----------
const Logo = () => (
  <Cut span={SHOT.logo} name="0:28.5 Claude Sonnet 5.5" render={(t) => (
    <AbsoluteFill>
      <Ember t={t + 400} />
      <div style={{ position: "absolute", left: 960 - 60, top: 360 - 60, transform: `scale(${ramp(t, [0, 10], [0.6, 1], ease.out)}) rotate(${(1 - ramp(t, [0, 14], [0, 1], ease.out)) * -90}deg)`, opacity: ramp(t, [0, 6]) }}>
        <ClaudeMark size={120} color={CLAY} />
      </div>
      <Words text="Claude Sonnet 5.5" t={t} at={4} step={4} size={84} y={560} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: SANS, fontSize: 30, color: "rgba(255,255,255,0.65)", opacity: ramp(t, [18, 26]) }}>Available now on claude.ai</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.4)", opacity: ramp(t, [20, 30]) }}>
        Concept demo by Breeders. Not affiliated with Anthropic. Figures from Anthropic's announcement, Sept 28, 2026. Task contents are examples.
      </div>
    </AbsoluteFill>
  )} />
);

export const ClaudeSonnetDemo: React.FC = () => {
  const t = useT();
  const dark = t < SHOT.toggle[0] || t >= SHOT.logo[0];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Audio src={staticFile("sonnet/sonnet-demo-mix.wav")} />
      <Open />
      <Toggle />
      <PromptShot span={SHOT.prompt} name="0:05.5 The prompt" text="Turn these Q3 notes into a board deck." files={[["Q3 notes.pdf", "file", CLAY], ["Q3_numbers.csv", "grid", "#1E8E5A"]]} rate={0.85} />
      <Steps />
      <Answer />
      <Deck />
      <PromptShot span={SHOT.prompt2} name="0:20 Second task" text="Plan 3 days in Goa for two, under ₹40,000." files={[["Ideas.txt", "file", "#2F7BFF"]]} rate={1.3} />
      <Trip />
      <Stats />
      <Logo />
      <Watermark opacity={t < SHOT.logo[0] ? 0.85 : 0} font={SANS} dark={dark ? 1 : 0} />
    </AbsoluteFill>
  );
};
