// Claude Sonnet 5.5 — 30s, built from the Pine Pro film's own components (pine-launch/kit): starfield, words typing in
// with the particle dissolve, big black words on pastel blocks, rich cards floating in space, the toggle, the voice
// composer, agent steps with app icons, the answer card that opens into the generated work, and the particle logo.
// What Claude makes here is a board deck, and we play that deck as its own bold mini-film (like Pine's Ember film).
// Shots in 30fps units, cut on the beat of the music (musicdream, 136 BPM, from its second drop at 1:42.4, like Pine).
// Facts from Anthropic's announcement (Sept 28, 2026).
import React, { useId } from "react";
import { AbsoluteFill, Audio, interpolate, random, staticFile } from "remotion";
import { Watermark } from "../brand/Breeders";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { AICursor, AppIcon, Cam, Composer, Cut, Dissolve, path, Pointer, press, Shimmer, Space, Sparkle } from "../pine-launch/kit";
import { GRAY, INK, LINE, SANS, TIGHT } from "../pine-launch/theme";
import { ease, kf, pop, ramp, useT } from "../utils";

// ---------- beat grid: 136 BPM → a beat is 13.235 units, a bar 52.94 ----------
const BEAT = 30 * (60 / 136);
const b = (n: number) => Math.round(n * BEAT);
export const SHOT = {
  open: [0, b(8)],
  blocks: [b(8), b(12)],
  space: [b(12), b(16)],
  toggle: [b(16), b(18)],
  voice: [b(18), b(28)],
  steps: [b(28), b(34)],
  answer: [b(34), b(38)],
  film: [b(38), b(52)],
  stat1: [b(52), b(56)],
  stat2: [b(56), b(60)],
  stat3: [b(60), b(64)],
  logo: [b(64), 900],
} as const;
export const CLAUDE30 = { fps: 60, width: 1920, height: 1080, units: 900 };

const CLAY = "#D97757";
const CLAY_D = "#B85A3D";
const CREAM = "#F2EBDD";
const ESP = "#191714";
const SKY = "#CFE0F4";
const CLAUDE_TINT: [string, string, string] = ["#FFD9C8", "#D97757", "217,119,87"];

// ---------- words over the starfield (Pine's Words, sized for this film) ----------
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

// ---------- 0:00 cold open ----------
const Open = () => (
  <Cut span={SHOT.open} name="0:00 Open" render={(t) => (
    <AbsoluteFill>
      <Space t0={SHOT.open[0]} />
      {t < 26 ? <Words text="It's 9:47 PM." t={t} at={4} step={4} /> : t < 50 ? <Words text="The deck is due at 9." t={t} at={27} step={3} /> : t >= 53 ? <Words text="Meet Claude Sonnet 5.5" t={t} at={55} step={5} dissolveFrom={1} /> : null}
    </AbsoluteFill>
  )} />
);

// ---------- 0:03.5 "hand it over" on pastel blocks ----------
const BLOCKS = [
  { x: 148, y: 340, w: 844, h: 900, c: "#E6E1D6", at: 0 },
  { x: 728, y: -20, w: 632, h: 940, c: "#F3DCCD", at: 3 },
  { x: 728, y: 340, w: 264, h: 580, c: "#F8E9DF", at: 3 },
  { x: 1068, y: -20, w: 560, h: 620, c: SKY, at: 7 },
  { x: 1360, y: -20, w: 268, h: 620, c: "#B7CBE2", at: 7 },
];
const BIG: [string, number, number, number][] = [
  ["hand", 190, 330, 1],
  ["it", 945, 440, 5],
  ["over", 1150, 210, 9],
];
const Blocks = () => (
  <Cut span={SHOT.blocks} name="0:03 Hand it over" render={(t) => {
    const gone = (i: number) => (i === 0 ? t >= 50 : t >= 44);
    const cur = path(t, [10, 26, 40, 50], [1560, 1275, 1210, 700], [960, 748, 760, 600]);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.blocks[0]} />
        {BLOCKS.map((bk, i) => (gone(i) ? null : <div key={i} style={{ position: "absolute", left: bk.x, top: bk.y, width: bk.w, height: bk.h, background: bk.c, clipPath: `inset(${(1 - ramp(t, [bk.at, bk.at + 6], [0, 1], ease.out)) * 100}% 0 0 0)` }} />))}
        {BIG.map(([w, x, y, at], i) =>
          gone(i) ? null : (
            <div key={w} style={{ position: "absolute", left: x, top: y, fontFamily: TIGHT, fontWeight: 700, fontSize: 300, lineHeight: 1, letterSpacing: "-0.045em", color: INK, opacity: ramp(t, [at, at + 2]), transform: `scale(${ramp(t, [at, at + 6], [1.06, 1])})`, transformOrigin: "0 60%" }}>
              {w}
            </div>
          ),
        )}
        {t < 50 && (
          <div style={{ position: "absolute", left: 330, top: 150, width: 560, height: 84, borderRadius: 16, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", boxSizing: "border-box", fontFamily: SANS, opacity: ramp(t, [10, 14]), transform: `translateY(${ramp(t, [10, 18], [16, 0])}px)` }}>
            <AppIcon name="grid" bg="#1E8E5A" size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: INK }}>Q3_numbers.csv</div>
              <div style={{ fontSize: 15, color: GRAY }}>Spreadsheet · 412 rows</div>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 18, border: `1px solid ${LINE}`, fontSize: 16, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
              Open <Icon name="chevronDown" size={14} color={GRAY} />
            </div>
          </div>
        )}
        {t < 44 && (
          <div style={{ position: "absolute", left: 1250, top: 700, opacity: ramp(t, [14, 18]), transform: `translateY(${ramp(t, [14, 22], [14, 0])}px)` }}>
            <div style={{ position: "absolute", left: -34, top: 26, width: 20, height: 20, borderRadius: 10, background: CLAY, boxShadow: "0 0 0 5px rgba(217,119,87,0.25)" }} />
            <div style={{ width: 560, height: 74, borderRadius: 20, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px 0 20px", boxSizing: "border-box", fontFamily: SANS, fontSize: 19, color: INK }}>
              <ClaudeMark size={20} color={CLAY} />
              <span style={{ flex: 1 }}>Build the board deck from this</span>
              <Icon name="mic" size={18} color={GRAY} />
              <div style={{ width: 36, height: 36, borderRadius: 10, background: CLAY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="arrowUp" size={18} color="#fff" stroke={2.4} />
              </div>
            </div>
          </div>
        )}
        <AICursor x={cur.x} y={cur.y} opacity={ramp(t, [10, 14])} tint={CLAUDE_TINT} outline="#FFF1EA" />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:05.3 the everyday work floating in space: rich cards ----------
type Card = { kind: "title" | "chart" | "sheet" | "mail" | "cal" | "notes" | "pie"; x: number; y: number; w: number; h: number; dx: number; dy: number; at: number };
const CARDS: Card[] = [
  { kind: "title", x: 1300, y: -50, w: 640, h: 300, dx: 0, dy: -1, at: 4 },
  { kind: "sheet", x: -70, y: 730, w: 540, h: 310, dx: -1, dy: 0, at: 7 },
  { kind: "chart", x: 1520, y: 740, w: 380, h: 310, dx: 1, dy: 1, at: 6 },
  { kind: "mail", x: 40, y: 60, w: 300, h: 330, dx: -1, dy: 0, at: 10 },
  { kind: "pie", x: 1660, y: 330, w: 240, h: 330, dx: 1, dy: 0, at: 12 },
  { kind: "notes", x: 700, y: 880, w: 520, h: 300, dx: 0, dy: 1, at: 9 },
  { kind: "cal", x: 400, y: -70, w: 300, h: 220, dx: 0, dy: -1, at: 14 },
];
const CardArt: React.FC<{ kind: Card["kind"]; w: number; h: number }> = ({ kind, w, h }) => {
  const base: React.CSSProperties = { width: w, height: h, position: "relative", overflow: "hidden", fontFamily: SANS };
  if (kind === "title")
    return (
      <div style={{ ...base, background: `linear-gradient(135deg, ${ESP}, #2B2622)` }}>
        <div style={{ position: "absolute", left: 30, top: 28 }}>
          <ClaudeMark size={30} color={CLAY} />
        </div>
        <div style={{ position: "absolute", left: 30, bottom: 34, fontFamily: TIGHT, fontWeight: 700, fontSize: 88, letterSpacing: "-0.05em", color: CREAM }}>Q3 Review</div>
        <div style={{ position: "absolute", right: -60, top: -60, width: 260, height: 260, borderRadius: 130, background: CLAY, opacity: 0.85 }} />
      </div>
    );
  if (kind === "chart")
    return (
      <div style={{ ...base, background: CREAM, padding: 26, boxSizing: "border-box" }}>
        <div style={{ fontFamily: TIGHT, fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", color: INK }}>+29%</div>
        <div style={{ position: "absolute", left: 26, right: 26, bottom: 26, height: 170, display: "flex", alignItems: "flex-end", gap: 18 }}>
          {[0.45, 0.6, 0.72, 1].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: "8px 8px 0 0", background: i === 3 ? CLAY : "#D8CDBA" }} />
          ))}
        </div>
      </div>
    );
  if (kind === "sheet")
    return (
      <div style={{ ...base, background: "#fff" }}>
        <div style={{ height: 44, background: "#1E8E5A", display: "flex", alignItems: "center", padding: "0 18px", color: "#fff", fontSize: 17, fontWeight: 600 }}>Q3 numbers</div>
        {[["July", "412,000", "29.9%"], ["August", "468,000", "32.1%"], ["September", "531,000", "33.7%"], ["Q3", "1,411,000", "32.0%"]].map((r, i) => (
          <div key={i} style={{ display: "flex", height: 52, borderBottom: "1px solid #EEE", alignItems: "center", padding: "0 18px", fontSize: 18, fontWeight: i === 3 ? 700 : 500, color: i === 3 ? CLAY_D : INK, background: i === 3 ? "#FBEDE6" : "#fff" }}>
            <span style={{ flex: 1.2 }}>{r[0]}</span>
            <span style={{ flex: 1, textAlign: "right" }}>{r[1]}</span>
            <span style={{ flex: 0.8, textAlign: "right" }}>{r[2]}</span>
          </div>
        ))}
      </div>
    );
  if (kind === "mail")
    return (
      <div style={{ ...base, background: "#fff", padding: 24, boxSizing: "border-box" }}>
        <div style={{ fontSize: 14, color: GRAY }}>To: Board</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1.2 }}>Q3 review, ready for tomorrow</div>
        {[1, 0.92, 0.97, 0.7, 0.85].map((v, i) => (
          <div key={i} style={{ height: 10, width: `${v * 100}%`, borderRadius: 5, background: "#ECE7DE", marginTop: 14 }} />
        ))}
        <div style={{ position: "absolute", left: 24, bottom: 24, padding: "10px 22px", borderRadius: 20, background: CLAY, color: "#fff", fontSize: 16, fontWeight: 600 }}>Send</div>
      </div>
    );
  if (kind === "pie")
    return (
      <div style={{ ...base, background: SKY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 150, height: 150, borderRadius: 75, background: `conic-gradient(${CLAY} 0 34%, ${ESP} 34% 62%, #FFFFFF 62% 100%)` }} />
        <div style={{ fontFamily: TIGHT, fontWeight: 700, fontSize: 30, color: INK }}>Margin 33.7%</div>
      </div>
    );
  if (kind === "notes")
    return (
      <div style={{ ...base, background: "#F8E9DF", padding: 28, boxSizing: "border-box" }}>
        <div style={{ fontFamily: TIGHT, fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", color: INK }}>Next quarter</div>
        {["Two new markets", "Self-serve plan", "Hold margins"].map((x) => (
          <div key={x} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: INK, marginTop: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: CLAY }} />
            {x}
          </div>
        ))}
      </div>
    );
  return (
    <div style={{ ...base, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 50, background: "#E5534B", color: "#fff", fontWeight: 700, fontSize: 20, display: "grid", placeItems: "center" }}>FRIDAY</div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", fontFamily: TIGHT, fontWeight: 700, fontSize: 92, color: INK }}>9:00</div>
    </div>
  );
};
const ICONS: [Parameters<typeof AppIcon>[0]["name"], string, number, number, number][] = [
  ["grid", "#1E8E5A", 560, 260, 8],
  ["layers", CLAY, 1360, 320, 11],
  ["message", "#2F7BFF", 1250, 690, 13],
  ["chart", "#7A5CFF", 380, 640, 15],
  ["file", ESP, 1560, 240, 17],
];
const Field: React.FC<{ t: number; out?: number }> = ({ t, out = 0 }) => (
  <>
    {CARDS.map((f, i) => {
      const p = ramp(t, [f.at, f.at + 12], [0, 1], ease.out);
      const drift = t * 0.35 + out * 500;
      return (
        <div key={i} style={{ position: "absolute", left: f.x + f.dx * ((1 - p) * 140 + drift), top: f.y + f.dy * ((1 - p) * 140 + drift), width: f.w, height: f.h, borderRadius: 12, overflow: "hidden", opacity: p * (1 - out), boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <CardArt kind={f.kind} w={f.w} h={f.h} />
        </div>
      );
    })}
    {ICONS.map(([n, bg, x, y, at], i) => (
      <div key={n + x} style={{ position: "absolute", left: x + Math.sin(t / 20 + i) * 6, top: y + Math.cos(t / 24 + i) * 6, transform: `scale(${pop(t, at)})`, opacity: 1 - out }}>
        <AppIcon name={n} bg={bg} size={52} />
      </div>
    ))}
  </>
);
const SpaceCards = () => (
  <Cut span={SHOT.space} name="0:05 Decks, sheets, emails" render={(t) => {
    const cur = path(t, [0, 26, 52], [700, 640, 900], [600, 590, 930]);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.space[0]} />
        <AbsoluteFill style={{ transform: `scale(${kf(t, [0, 53], [1, 1.04], ease.linear)})` }}>
          <Field t={t} />
        </AbsoluteFill>
        <Words text="decks, sheets, emails" t={t} at={3} step={5} />
        <AICursor x={cur.x} y={cur.y} tint={CLAUDE_TINT} outline="#FFF1EA" />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:07 the toggle: Sonnet 5 → Sonnet 5.5 ----------
const Toggle = () => (
  <Cut span={SHOT.toggle} name="0:07 Sonnet 5.5" render={(t) => {
    const k = ramp(t, [9, 15], [0, 1], ease.inOut);
    const cur = path(t, [0, 8], [1420, 1150], [800, 572]);
    const kx = 960 - 380 + 10 + k * 370;
    return (
      <AbsoluteFill>
        <Space t0={SHOT.toggle[0]} />
        <div style={{ position: "absolute", left: 960 - 380, top: 540 - 68, width: 760, height: 136, borderRadius: 68, background: "#EDEDED", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }} />
        <div style={{ position: "absolute", left: kx, top: 540 - 58, width: 370, height: 116, borderRadius: 58, background: "#FFFFFF", boxShadow: `0 4px 14px rgba(0,0,0,0.12), 0 0 ${ramp(t, [11, 18]) * 40}px rgba(255,255,255,${ramp(t, [11, 18]) * 0.55})` }} />
        {["Sonnet 5", "Sonnet 5.5"].map((l, i) => (
          <div key={l} style={{ position: "absolute", left: 960 - 380 + 10 + i * 370, top: 540 - 58, width: 370, height: 116, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: SANS, fontSize: 46, fontWeight: 500, color: INK, letterSpacing: "-0.01em" }}>
            {i === 1 ? <ClaudeMark size={34} color={CLAY} /> : null}
            {l}
          </div>
        ))}
        <Sparkle t={t} at={11} x={kx + 185} y={540} w={390} h={136} dur={20} />
        <Pointer x={cur.x} y={cur.y} size={40} light press={press(t, 9)} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:08 voice prompt in the composer ----------
const PROMPT = "Turn our Q3 numbers into a board deck, a spreadsheet and a summary email.";
const MIC = { x: 1275, y: 541 };
const SEND = { x: 1327, y: 541 };
const Tray = () => (
  <>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="grid" size={16} color="#1E8E5A" /> Q3_numbers.csv
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="layers" size={16} color={CLAY} /> Board template
    </span>
  </>
);
const Model = () => (
  <span style={{ fontSize: 15, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
    <ClaudeMark size={15} color={CLAY} /> Sonnet 5.5 <Icon name="chevronDown" size={15} color={GRAY} />
  </span>
);
const Voice = () => (
  <Cut span={SHOT.voice} name="0:08 Voice prompt" render={(t) => {
    const len = SHOT.voice[1] - SHOT.voice[0];
    const rec = t >= 8 && t < 68 ? { elapsed: t - 8 } : null;
    const words = PROMPT.split(" ");
    const n = t < 70 ? 0 : Math.min(words.length, Math.floor((t - 70) * 0.9) + 1);
    const s = kf(t, [0, 66, 80, 96, 116], [2.9, 2.7, 2.2, 2.2, 1.25], ease.inOut);
    const fx = kf(t, [0, 8, 66, 80, 96, 116], [1190, 1190, 1020, 820, 900, 960], ease.inOut);
    const fy = kf(t, [0, 66, 80, 96, 116], [525, 525, 490, 500, 530], ease.inOut);
    const cur = path(t, [0, 6, 60, 66, 104, 120], [1380, MIC.x, MIC.x + 30, MIC.x, MIC.x + 60, SEND.x], [600, MIC.y, MIC.y + 30, MIC.y, MIC.y + 70, SEND.y]);
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [len - 6, len], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 550, top: 440 }}>
            <Composer text={n ? words.slice(0, n).join(" ") : undefined} placeholder=" " rec={rec} sendPress={press(t, 123)} micHover={ramp(t, [2, 6])} trayNode={<Tray />} modelNode={<Model />} />
          </div>
          <Pointer x={cur.x} y={cur.y} size={22} press={press(t, 7) + press(t, 67) + press(t, 123)} />
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:12.4 agent steps ----------
const STEPS: [Parameters<typeof AppIcon>[0]["name"], string, string][] = [
  ["grid", "#1E8E5A", "Reading Q3_numbers.csv"],
  ["chart", "#7A5CFF", "Building the spreadsheet"],
  ["layers", CLAY, "Designing 8 slides"],
  ["message", "#2F7BFF", "Drafting the summary email"],
];
const STEP_AT = [0, 14, 28, 42];
const Steps = () => (
  <Cut span={SHOT.steps} name="0:12 Working" render={(t) => {
    const len = SHOT.steps[1] - SHOT.steps[0];
    const shown = STEP_AT.filter((a) => t >= a).length;
    const lift = STEP_AT.reduce((acc, a) => acc + ramp(t, [a, a + 8], [0, 1], ease.out), 0);
    const exit = ramp(t, [len - 10, len], [0, 1], ease.in);
    return (
      <AbsoluteFill style={{ background: "#fff" }}>
        <div style={{ position: "absolute", left: 620, top: 540 - lift * 34, transform: `translateX(${-exit * 1500}px) scale(${kf(t, [0, len], [1.12, 1.18], ease.linear)})`, transformOrigin: "0 50%" }}>
          {STEPS.slice(0, shown).map(([ic, bg, label], i) => {
            const p = ramp(t, [STEP_AT[i], STEP_AT[i] + 8], [0, 1], ease.out);
            return (
              <div key={label} style={{ position: "absolute", left: 0, top: i * 68 - (1 - p) * 68, display: "flex", alignItems: "center", gap: 22, opacity: i === 0 ? p : ramp(t, [STEP_AT[i] + 2, STEP_AT[i] + 7]), whiteSpace: "nowrap" }}>
                <AppIcon name={ic} bg={bg} size={42} />
                <Shimmer t={t + i * 9} style={{ fontFamily: SANS, fontSize: 36, letterSpacing: "-0.01em" }}>
                  {label}
                </Shimmer>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }} />
);

// ---------- the board deck, played as its own mini-film ----------
const tag: React.CSSProperties = { fontFamily: SANS, fontSize: 22, fontWeight: 700, letterSpacing: "0.16em" };
export const DeckFilm: React.FC<{ t: number }> = ({ t }) => {
  // a: "Q3" on espresso · b: clay circle wipe, REVIEW pops · c: +29% with growing bars · d: tile grid · e: end card
  if (t < 30) {
    const k = ramp(t, [0, 10], [0, 1], ease.out);
    return (
      <AbsoluteFill style={{ background: ESP }}>
        <div style={{ position: "absolute", left: 70, top: 60, ...tag, color: CLAY }}>ACME CO. · BOARD REVIEW</div>
        <div style={{ position: "absolute", right: 70, bottom: 60, ...tag, color: "#8C857A" }}>001 — Q3 2026</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 540 - 330, textAlign: "center", fontFamily: TIGHT, fontWeight: 800, fontSize: 620, letterSpacing: "-0.07em", lineHeight: 1, color: CREAM, transform: `scale(${1.25 - 0.25 * k})`, opacity: k }}>Q3</div>
      </AbsoluteFill>
    );
  }
  if (t < 55) {
    const l = t - 30;
    const r = ramp(l, [0, 9], [0, 1300], ease.in);
    return (
      <AbsoluteFill style={{ background: ESP }}>
        <div style={{ position: "absolute", left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: CLAY }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 540 - 170, display: "flex", justifyContent: "center", fontFamily: TIGHT, fontWeight: 800, fontSize: 300, letterSpacing: "-0.05em", color: ESP, lineHeight: 1 }}>
          {"REVIEW".split("").map((ch, i) => (
            <span key={i} style={{ display: "inline-block", transform: `scale(${pop(l, 7 + i * 2)})` }}>{ch}</span>
          ))}
        </div>
      </AbsoluteFill>
    );
  }
  if (t < 100) {
    const l = t - 55;
    const v = Math.round(ramp(l, [4, 24], [0, 29], ease.out));
    const grow = ramp(l, [8, 26], [0, 1], ease.out);
    return (
      <AbsoluteFill style={{ background: CREAM }}>
        <div style={{ position: "absolute", left: 90, top: 90, ...tag, color: CLAY_D }}>REVENUE · JUL — SEP</div>
        <div style={{ position: "absolute", left: 80, top: 230, fontFamily: TIGHT, fontWeight: 800, fontSize: 380, letterSpacing: "-0.06em", lineHeight: 1, color: ESP, fontVariantNumeric: "tabular-nums", filter: l < 22 ? `blur(${(1 - ramp(l, [4, 22])) * 3}px)` : undefined }}>+{v}%</div>
        <div style={{ position: "absolute", right: 120, bottom: 140, width: 640, height: 600, display: "flex", alignItems: "flex-end", gap: 40 }}>
          {[0.58, 0.72, 1].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h * 100 * ramp(l, [8 + i * 4, 26 + i * 4], [0, 1], ease.out)}%`, borderRadius: "16px 16px 0 0", background: i === 2 ? CLAY : "#D8CDBA" }} />
          ))}
        </div>
        <div style={{ position: "absolute", right: 120, bottom: 90, width: 640, display: "flex", gap: 40, ...tag, color: "#8C857A" }}>
          {["JUL", "AUG", "SEP"].map((m) => (
            <span key={m} style={{ flex: 1, textAlign: "center" }}>{m}</span>
          ))}
        </div>
        <div style={{ position: "absolute", left: 90, bottom: 90, fontFamily: SANS, fontSize: 40, fontWeight: 600, color: ESP, opacity: grow }}>$1.41M this quarter</div>
      </AbsoluteFill>
    );
  }
  if (t < 140) {
    const l = t - 100;
    const tiles: { bg: string; fg: string; big: string; small: string }[] = [
      { bg: CLAY, fg: ESP, big: "33.7%", small: "MARGIN" },
      { bg: ESP, fg: CREAM, big: "Q3", small: "BOARD REVIEW" },
      { bg: CREAM, fg: ESP, big: "+29%", small: "REVENUE" },
      { bg: SKY, fg: ESP, big: "On track", small: "PLAN" },
      { bg: "#2B2622", fg: CREAM, big: "$1.41M", small: "QUARTER" },
      { bg: "#F8E9DF", fg: CLAY_D, big: "Ready", small: "FOR 9 AM" },
    ];
    const tick = (l * 9) % 520;
    return (
      <AbsoluteFill style={{ background: ESP }}>
        {tiles.map((tl, i) => {
          const c = i % 3, r = Math.floor(i / 3);
          const p = ramp(l, [i * 2.5, i * 2.5 + 7], [0, 1], ease.out);
          return (
            <div key={i} style={{ position: "absolute", left: c * 640, top: r * 540, width: 640, height: 540, background: tl.bg, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: 60, boxSizing: "border-box" }}>
              <div style={{ ...tag, color: tl.fg, opacity: 0.7 }}>{tl.small}</div>
              <div style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: 130, letterSpacing: "-0.05em", color: tl.fg, lineHeight: 1.05 }}>{tl.big}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 540 - 32, height: 64, background: CREAM, overflow: "hidden", display: "flex", alignItems: "center", opacity: ramp(l, [10, 14]) }}>
          <div style={{ whiteSpace: "nowrap", transform: `translateX(${-tick}px)`, ...tag, fontSize: 28, color: ESP }}>
            {Array.from({ length: 8 }, () => "Q3 BOARD REVIEW  ●  ").join("")}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  const l = t - 140;
  return (
    <AbsoluteFill style={{ background: ESP, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: 150, letterSpacing: "-0.05em", color: CREAM, opacity: ramp(l, [0, 6]), transform: `translateY(${(1 - ramp(l, [0, 10], [0, 1], ease.out)) * 30}px)` }}>Ready for the board.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 40, background: CLAY, fontFamily: SANS, fontSize: 30, fontWeight: 600, color: "#fff", transform: `scale(${pop(l, 8)})` }}>
        <ClaudeMark size={28} color="#fff" /> Made with Claude
      </div>
    </AbsoluteFill>
  );
};

// ---------- 0:15 the answer: the deck card opens into the deck ----------
const ANSWER = "Here's your Q3 board deck, the spreadsheet behind it, and a summary email, ready for tomorrow.";
const THUMB = { x: 560, y: 560, w: 560, h: 315 };
const Answer = () => (
  <Cut span={SHOT.answer} name="0:15 Answer" render={(t) => {
    const len = SHOT.answer[1] - SHOT.answer[0];
    const words = ANSWER.split(" ");
    const n = Math.min(words.length, Math.max(0, Math.floor((t - 1) * 1.6)));
    const s = kf(t, [0, 14, 26], [1.3, 1.3, 1], ease.inOut);
    const fx = kf(t, [0, 14, 26], [900, 900, 960], ease.inOut);
    const fy = kf(t, [0, 14, 26], [420, 430, 560], ease.inOut);
    const cur = path(t, [22, 34], [1300, THUMB.x + THUMB.w / 2 + 6], [980, THUMB.y + THUMB.h / 2 + 8]);
    const g = ramp(t, [38, len], [0, 1], ease.inOut);
    const cardIn = ramp(t, [16, 24], [0, 1], ease.out);
    return (
      <AbsoluteFill>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 560, top: 330, width: 820, fontFamily: SANS }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, color: GRAY, marginBottom: 16 }}>
              <ClaudeMark size={20} color={CLAY} /> Claude Sonnet 5.5
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.45, color: INK, letterSpacing: "-0.01em" }}>{words.slice(0, n).join(" ")}</div>
          </div>
          <div style={{ position: "absolute", left: THUMB.x, top: THUMB.y, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 20}px)` }}>
            <div style={{ width: THUMB.w, height: THUMB.h, borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ transform: `scale(${THUMB.w / 1920})`, transformOrigin: "0 0", width: 1920, height: 1080, position: "relative" }}>
                <DeckFilm t={5} />
              </div>
              <div style={{ position: "absolute", left: THUMB.w / 2 - 34, top: THUMB.h / 2 - 34, width: 68, height: 68, borderRadius: 34, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press(t, 36) * 0.1})` }}>
                <Icon name="play" size={28} color={INK} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontFamily: SANS }}>
              <AppIcon name="layers" bg={CLAY} size={34} />
              <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>Q3_Board_Review.pptx</div>
              <div style={{ fontSize: 15, color: GRAY }}>8 slides</div>
            </div>
          </div>
          <Pointer x={cur.x} y={cur.y} size={26} press={press(t, 36)} opacity={ramp(t, [22, 26]) * (1 - g)} />
        </Cam>
        {t >= 38 && (
          <div style={{ position: "absolute", left: interpolate(g, [0, 1], [THUMB.x, 0]), top: interpolate(g, [0, 1], [THUMB.y, 0]), width: interpolate(g, [0, 1], [THUMB.w, 1920]), height: interpolate(g, [0, 1], [THUMB.h, 1080]), borderRadius: 16 * (1 - g), overflow: "hidden", background: ESP }}>
            <div style={{ transform: `scale(${interpolate(g, [0, 1], [THUMB.w, 1920]) / 1920})`, transformOrigin: "0 0", width: 1920, height: 1080, position: "relative" }}>
              <DeckFilm t={5} />
            </div>
          </div>
        )}
      </AbsoluteFill>
    );
  }} />
);
const Film = () => <Cut span={SHOT.film} name="0:17 The deck" render={(t) => <DeckFilm t={t + 5} />} />;

// ---------- 0:23 the numbers, Pine-block style ----------
const STAT_BLOCKS = [
  [
    { x: 120, y: 300, w: 900, h: 800, c: "#E6E1D6", at: 0 },
    { x: 860, y: -20, w: 980, h: 640, c: "#F3DCCD", at: 3 },
  ],
  [
    { x: 120, y: 260, w: 1080, h: 860, c: SKY, at: 0 },
    { x: 1080, y: -20, w: 760, h: 520, c: "#E6E1D6", at: 3 },
  ],
  [
    { x: 200, y: 220, w: 1520, h: 900, c: CLAY, at: 0 },
    { x: 1200, y: -20, w: 640, h: 360, c: "#F8E9DF", at: 3 },
  ],
] as const;
const STATS: [string, string, string][] = [
  ["30%+", "faster", "outputs than Sonnet 5"],
  ["30%", "less", "per task, at the same price"],
  ["70.6%", "Terminal-Bench 4.0", "up from 10.3% on Sonnet 5"],
];
const Stat: React.FC<{ i: number }> = ({ i }) => {
  const t = useT();
  const [big, word, note] = STATS[i];
  const dark = i === 2;
  return (
    <AbsoluteFill>
      <Space t0={SHOT.stat1[0] + i * 53} />
      {STAT_BLOCKS[i].map((bk, k) => (
        <div key={k} style={{ position: "absolute", left: bk.x, top: bk.y, width: bk.w, height: bk.h, background: bk.c, clipPath: `inset(${(1 - ramp(t, [bk.at, bk.at + 6], [0, 1], ease.out)) * 100}% 0 0 0)` }} />
      ))}
      <div style={{ position: "absolute", left: 220, top: 330, fontFamily: TIGHT, fontWeight: 700, fontSize: 330, lineHeight: 1, letterSpacing: "-0.05em", color: INK, opacity: ramp(t, [2, 4]), transform: `scale(${ramp(t, [2, 8], [1.06, 1])})`, transformOrigin: "0 60%" }}>
        {big}
      </div>
      <div style={{ position: "absolute", left: 240, top: 690, fontFamily: TIGHT, fontWeight: 700, fontSize: 110, letterSpacing: "-0.04em", color: dark ? "#fff" : CLAY_D, opacity: ramp(t, [7, 9]), transform: `scale(${ramp(t, [7, 13], [1.06, 1])})`, transformOrigin: "0 60%" }}>
        {word}
      </div>
      <div style={{ position: "absolute", left: 246, top: 830, fontFamily: SANS, fontSize: 32, fontWeight: 600, color: dark ? "#FFE9DD" : "#4A4640", opacity: ramp(t, [12, 16]) }}>{note}</div>
    </AbsoluteFill>
  );
};
const Stats = () => (
  <>
    <Cut span={SHOT.stat1} name="0:23 30%+ faster" render={() => <Stat i={0} />} />
    <Cut span={SHOT.stat2} name="0:24.7 30% less" render={() => <Stat i={1} />} />
    <Cut span={SHOT.stat3} name="0:26.5 70.6%" render={() => <Stat i={2} />} />
  </>
);

// ---------- 0:28 the logo: stars swirl into Claude's mark ----------
const PARTS = Array.from({ length: 520 }, (_, i) => ({ a: random(`la${i}`) * Math.PI * 2, r: 150 + random(`lr${i}`) * 750, s: 0.8 + random(`ls${i}`) * 1.8, e: 10 + random(`le${i}`) * 40 }));
const Logo = () => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <Cut span={SHOT.logo} name="0:28 Claude" render={(t) => {
      const c = ramp(t, [0, 16], [0, 1], ease.inOut);
      const form = ramp(t, [10, 26], [0, 1], ease.out);
      return (
        <AbsoluteFill>
          <Space t0={SHOT.logo[0]} black={ramp(t, [0, 14], [0, 1])} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id={`lg${id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={Math.floor(t * 2) % 97} />
                <feDisplacementMap in="SourceGraphic" scale={(1 - form) * 110} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            {PARTS.map((p, i) => {
              const r = interpolate(c, [0, 1], [p.r, p.e]);
              const a = p.a + c * 1.4;
              return <circle key={i} cx={960 + Math.cos(a) * r} cy={460 + Math.sin(a) * r * 0.9} r={p.s} fill={i % 3 ? "#fff" : "#F4B49C"} opacity={(0.25 + 0.75 * c) * (1 - form)} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 960 - 75, top: 460 - 75, filter: form < 0.995 ? `url(#lg${id})` : undefined, opacity: Math.min(1, form * 2) }}>
            <ClaudeMark size={150} color={CLAY} />
          </div>
          <Words text="Claude Sonnet 5.5" t={t} at={18} step={4} y={680} size={72} dissolveFrom={0} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.45)", opacity: ramp(t, [26, 34]) }}>
            Concept film by Breeders. Not affiliated with Anthropic. Figures from Anthropic's announcement, Sept 28, 2026.
          </div>
        </AbsoluteFill>
      );
    }} />
  );
};

export const ClaudeSonnet30: React.FC = () => {
  const t = useT();
  const dark = t < SHOT.voice[0] || t >= SHOT.stat1[0];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("sonnet/claude30-mix.wav")} />
      <Open />
      <Blocks />
      <SpaceCards />
      <Toggle />
      <Voice />
      <Steps />
      <Answer />
      <Film />
      <Stats />
      <Logo />
      <Watermark opacity={t < SHOT.logo[0] ? 0.85 : 0} font={SANS} dark={dark ? 1 : 0} />
    </AbsoluteFill>
  );
};
