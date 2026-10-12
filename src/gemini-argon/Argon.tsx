// "Gemini 4 Argon" concept launch film (not affiliated with Google), built like OpenAI's "ChatGPT Work" film: a starfield
// with words typing in, kinetic words on pastel blocks, app windows drifting in space, then the real product on white
// (the Gemini chat page, prompt, thinking steps, answer) and the work itself (a pull request, a report), with the camera
// gliding over the UI and a glowing cursor doing the work. Facts are Google's (blog.google, Sept 30, 2026).
// Shots are in 30fps units (1s = 30). Audio is pre-mixed by scripts/compose-argon.mjs into public/argon/mix.wav.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { Icon } from "../clueso-mcp/icons";
import { AICursor, Cam, Cut, Dissolve, path, Pointer, press, Sparkle } from "../pine-launch/kit";
import { Aurora, CodeWall, ThreatNet, TokenRiver } from "./bg";
import { ease, kf, pop, ramp } from "../utils";
import { GS, loadGoogleSans, Spark } from "./kit";
import { AskBox, G, Greeting, Page, PrCard, PrPage, ReportPage, SparkAvatar, StepRow, ThinkSteps, UserBubble } from "./ui";

loadGoogleSans();

// ---------- timeline (30fps units) ----------
// Cut to the voiceover (public/argon/vo, the ElevenLabs read at 1.15x, one clip per line, placed by compose-argon.mjs).
// Some shots were authored longer and now play faster: their render time is scaled by PACE so every move still lands.
export const SHOT = {
  open: [0, 90],
  blocks: [90, 147],
  space: [147, 195],
  picker: [195, 249],
  prompt: [249, 444],
  steps: [444, 570],
  answer: [570, 666],
  pr: [666, 774],
  report: [774, 855],
  tagline: [855, 900],
  tokens: [900, 1008],
  logo: [1008, 1122],
} as const;
const PACE = { prompt: 240 / 195, answer: 105 / 96, pr: 120 / 108, report: 100 / 81, tagline: 60 / 45 };
const FILM_END = SHOT.logo[1] / 30; // seconds
export const T = { outro: FILM_END, total: FILM_END + OUTRO_LEN };
export const ARGON = { fps: 60, width: 1920, height: 1080, seconds: T.total };

// Gemini-blue glowing cursor (the ChatGPT film's is purple)
const BLUE_TINT: [string, string, string] = ["#D2E3FC", "#4285F4", "80,140,255"];

// words typing in one by one over the starfield, Google Sans (the kit's Words is Inter)
const TypeWords: React.FC<{ text: string; t: number; at: number; step?: number; size?: number; y?: number; dissolveFrom?: number; weight?: number }> = ({ text, t, at, step = 5, size = 54, y = 540, dissolveFrom, weight = 500 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.62, display: "flex", justifyContent: "center", fontFamily: GS, fontSize: size, fontWeight: weight, color: "#FFFFFF", letterSpacing: "-0.015em", whiteSpace: "pre" }}>
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

// ---------- 0:00 "With Gemini" → "powered by Gemini 4 Argon" ----------
const Open = () => (
  <Cut span={SHOT.open} name="0:00 Open" render={(t) => (
    <AbsoluteFill>
      <Aurora t={t + SHOT.open[0]} />
      {t < 34 ? <TypeWords text="With Gemini" t={t} at={5} step={6} /> : t >= 36 ? <TypeWords text="powered by Gemini 4 Argon" t={t} at={37} step={4} dissolveFrom={2} /> : null}
    </AbsoluteFill>
  )} />
);

// ---------- 0:04 "find it first.": the words land over a wall of code; a scan line catches one line red ----------
const BIG: [string, number][] = [
  ["find", 1],
  ["it", 6],
  ["first.", 11],
];
const Blocks = () => (
  <Cut span={SHOT.blocks} name="0:04 Find it first" render={(t) => {
    const cur = path(t, [14, 34, 52], [1500, 1250, 1060], [980, 830, 800]);
    return (
      <AbsoluteFill>
        <Aurora t={t + SHOT.blocks[0]} />
        <CodeWall t={t} scanAt={3} catchAt={30} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 60, fontFamily: GS, fontWeight: 700, fontSize: 230, lineHeight: 1, letterSpacing: "-0.05em" }}>
          {BIG.map(([w, at], i) => {
            const p = ramp(t, [at, at + 6], [0, 1], ease.out);
            return (
              <span key={w} style={{ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 40}px) scale(${1.08 - 0.08 * p})`, filter: p < 0.98 ? `blur(${(1 - p) * 12}px)` : undefined, ...(i === 2 ? { backgroundImage: "linear-gradient(90deg, #4285F4, #9B72CB 55%, #D96570)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : { color: "#FFFFFF" }) }}>
                {w}
              </span>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 960 - 330, top: 700, opacity: ramp(t, [16, 22]), transform: `translateY(${ramp(t, [16, 26], [16, 0])}px)` }}>
          <div style={{ width: 660, height: 78, borderRadius: 39, background: G.input, boxShadow: "0 20px 50px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", gap: 14, padding: "0 16px 0 24px", boxSizing: "border-box", fontFamily: GS, fontSize: 21, color: G.ink }}>
            <Spark size={26} />
            <span style={{ flex: 1 }}>Find the flaw before attackers do</span>
            <Icon name="mic" size={20} color={G.sub} />
            <div style={{ width: 44, height: 44, borderRadius: 22, background: G.tonal, display: "grid", placeItems: "center" }}>
              <Icon name="arrowUp" size={20} color={G.blue} stroke={2.4} />
            </div>
          </div>
        </div>
        <AICursor x={cur.x} y={cur.y} opacity={ramp(t, [14, 18])} tint={BLUE_TINT} outline="#EAF1FF" />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:05.8 apps drifting in space: "catch threats faster" ----------
const SpaceApps = () => (
  <Cut span={SHOT.space} name="0:05.8 Catch threats faster" render={(t) => (
    <AbsoluteFill>
      <Aurora t={t + SHOT.space[0]} />
      <AbsoluteFill style={{ transform: `scale(${kf(t, [0, 85], [1.04, 1], ease.out)})` }}>
        <ThreatNet t={t} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - 520, top: 540 - 120, width: 1040, height: 240, background: "radial-gradient(closest-side, rgba(5,6,8,0.85), rgba(5,6,8,0))" }} />
      <TypeWords text="catch threats, faster" t={t} at={4} step={6} size={64} />
    </AbsoluteFill>
  )} />
);

// ---------- 0:08.7 the model picker: select 4 Argon ----------
const MODELS: [string, string, boolean][] = [
  ["Fast", "Answers quickly", false],
  ["Thinking", "Solves complex problems", false],
  ["4 Argon", "Deep, long-horizon work", true],
];
const Picker = () => (
  <Cut span={SHOT.picker} name="0:08.7 Choose 4 Argon" render={(t) => {
    const inn = pop(t, 0);
    const sel = t >= 22;
    const cur = path(t, [0, 18], [1380, 1090], [860, 640]);
    const menu = { x: 960 - 330, y: 540 - 190, w: 660 };
    return (
      <AbsoluteFill>
        <Aurora t={t + SHOT.picker[0]} />
        <div style={{ position: "absolute", left: menu.x, top: menu.y, width: menu.w, borderRadius: 28, background: "#FFFFFF", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", padding: "18px 0", fontFamily: GS, transform: `scale(${0.92 + 0.08 * inn})`, opacity: Math.min(1, inn * 1.4) }}>
          <div style={{ padding: "6px 30px 14px", fontSize: 18, color: G.faint }}>Choose your model</div>
          {MODELS.map(([name, sub, hero], i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 18, height: 96, padding: "0 30px", background: hero && sel ? `rgba(211,227,253,${ramp(t, [22, 26])})` : "transparent" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, color: G.ink }}>
                  {name}
                  {hero ? <span style={{ fontSize: 15, fontWeight: 500, padding: "4px 12px", borderRadius: 12, background: G.tonal, color: G.blue }}>New</span> : null}
                </div>
                <div style={{ fontSize: 19, color: G.faint, marginTop: 4 }}>{sub}</div>
              </div>
              {(hero && sel) || (!hero && i === 0 && !sel) ? <Icon name="check" size={30} color={G.blue} stroke={2.6} /> : null}
            </div>
          ))}
        </div>
        <Sparkle t={t} at={23} x={960} y={menu.y + 18 + 46 + 2 * 96 + 48} w={700} h={110} dur={30} />
        <Pointer x={cur.x} y={cur.y} size={40} light press={press(t, 21)} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:10.5 the Gemini chat page: the prompt types in a huge close-up, the camera pulls out, send ----------
const PROMPT = "Audit payments-api for critical vulnerabilities, fix what you find, and open a pull request.";
const BOX = { x: 580, y: 500, w: 760 };
const SEND = { x: BOX.x + BOX.w - 38, y: BOX.y + 98 };
const Prompt = () => (
  <Cut span={SHOT.prompt} name="0:10.5 Prompt" render={(t0) => {
    const t = t0 * PACE.prompt;
    const n = Math.max(0, Math.min(PROMPT.length, Math.floor((t - 12) * 0.62)));
    const s = kf(t, [0, 150, 196, 240], [2.6, 2.35, 1.0, 1.0], ease.inOut);
    const typedEnd = 12 + PROMPT.length / 0.62;
    const fx = kf(t, [0, 60, 150, 196], [BOX.x + 230, BOX.x + 420, BOX.x + 560, 960], ease.inOut);
    const fy = kf(t, [0, 150, 196], [BOX.y + 40, BOX.y + 50, 520], ease.inOut);
    const cur = path(t, [0, 196, 222], [1500, 1400, SEND.x], [900, 780, SEND.y]);
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [232, 240], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy}>
          <Page>
            <div style={{ position: "absolute", left: BOX.x + 10, top: 380, opacity: ramp(t, [150, 190]) }}>
              <Greeting p={ramp(t, [160, 200], [0, 1], ease.out)} />
            </div>
            <div style={{ position: "absolute", left: BOX.x, top: BOX.y }}>
              <AskBox width={BOX.w} text={n ? PROMPT.slice(0, n) : undefined} caret={t < typedEnd + 20 && Math.floor(t / 8) % 2 === 0} sendPress={press(t, 226)} />
            </div>
          </Page>
          {t > 196 ? <AICursor x={cur.x} y={cur.y} size={30} tint={BLUE_TINT} outline="#EAF1FF" press={press(t, 226)} /> : null}
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:18.5 thinking: steps tick through ----------
const STEPS: [Parameters<typeof Icon>[0]["name"], string][] = [
  ["git", "Reading the payments-api repository"],
  ["search", "Tracing user input across services"],
  ["eye", "Reproducing the issue in a sandbox"],
  ["pen", "Writing and testing the fix"],
];
const STEP_AT = [10, 32, 54, 76];
const CONVO = { x: 560, w: 800 };
const ANSWER = "I found one critical vulnerability: a SQL injection in getUser. I confirmed it in a sandbox, fixed it with a parameterized query, and every test passes. Here's the pull request.";
const Conversation: React.FC<{ t: number; stepsDoneAt?: number; answerN?: number; card?: number; cardPress?: number }> = ({ t, stepsDoneAt = Infinity, answerN = 0, card = 0, cardPress = 0 }) => {
  const rows: StepRow[] = STEPS.map(([icon, text], i) => ({ icon, text, state: t < STEP_AT[i] ? "wait" : t < (STEP_AT[i + 1] ?? stepsDoneAt) ? "run" : "done" }));
  return (
    <Page>
      <div style={{ position: "absolute", left: CONVO.x, top: 120, width: CONVO.w }}>
        <UserBubble text={PROMPT} />
        <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
          <SparkAvatar spin={t < stepsDoneAt ? t * 6 : 0} />
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: G.sub, marginBottom: 18 }}>
              Show thinking <Icon name="chevronDown" size={16} color={G.sub} stroke={2} />
            </div>
            <ThinkSteps rows={rows} shimmerT={t / 30} />
            {answerN > 0 ? (
              <div style={{ marginTop: 30, fontSize: 18, lineHeight: "30px", color: G.ink }}>
                {ANSWER.split(" ").slice(0, answerN).join(" ")}
              </div>
            ) : null}
            {card > 0 ? (
              <div style={{ marginTop: 24, opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
                <PrCard press={cardPress} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Page>
  );
};
const Steps = () => (
  <Cut span={SHOT.steps} name="0:18.5 Thinking" render={(t) => {
    const s = kf(t, [0, 120], [1.35, 1.5], ease.inOut);
    return (
      <Cam s={s} fx={kf(t, [0, 120], [960, 920], ease.inOut)} fy={kf(t, [0, 120], [380, 420], ease.inOut)}>
        <Conversation t={t} />
      </Cam>
    );
  }} />
);
const Answer = () => (
  <Cut span={SHOT.answer} name="0:22.5 Answer" render={(t0) => {
    const t = t0 * PACE.answer;
    const local = t + 120; // the thinking shot's clock carries on
    const n = Math.max(0, Math.floor((t - 4) * 0.62));
    const words = ANSWER.split(" ").length;
    const cardAt = 4 + words / 0.62 + 2;
    const card = ramp(t, [cardAt, cardAt + 8], [0, 1], ease.out);
    const OPEN = { x: CONVO.x + 52 + 600 - 60, y: 120 + 108 + 40 + 220 + 120 + 24 + 38 };
    const s = kf(t, [0, 60, 105], [1.5, 1.25, 1.6], ease.inOut);
    const fx = kf(t, [0, 60, 105], [920, 960, OPEN.x - 120], ease.inOut);
    const fy = kf(t, [0, 60, 105], [420, 520, OPEN.y], ease.inOut);
    const cur = path(t, [0, 84, 96], [1500, 1300, OPEN.x], [900, 820, OPEN.y]);
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [100, 105], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy}>
          <Conversation t={local} stepsDoneAt={STEP_AT[3] + 22} answerN={Math.min(words, n)} card={card} cardPress={press(t, 98)} />
          {t > 78 ? <AICursor x={cur.x} y={cur.y} size={26} tint={BLUE_TINT} outline="#EAF1FF" press={press(t, 98)} /> : null}
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:26 the pull request: title → the diff → checks pass ----------
const Pr = () => (
  <Cut span={SHOT.pr} name="0:26 Pull request" render={(t0) => {
    const t = t0 * PACE.pr;
    const s = kf(t, [0, 30, 70, 100, 120], [1.7, 1.55, 1.85, 1.35, 1.3], ease.inOut);
    const fx = kf(t, [0, 30, 70, 100], [640, 760, 820, 900], ease.inOut);
    const fy = kf(t, [0, 30, 70, 100], [230, 300, 555, 760], ease.inOut);
    const cur = path(t, [0, 40, 70, 100], [1300, 900, 740, 1580], [700, 540, 560, 790]);
    return (
      <Cam s={s} fx={fx} fy={fy}>
        <PrPage checks={ramp(t, [80, 92])} />
        <AICursor x={cur.x} y={cur.y} size={24} tint={BLUE_TINT} outline="#EAF1FF" />
      </Cam>
    );
  }} />
);

// ---------- 0:30 the report: summary highlighted, critical issues 1 → 0, a comment ----------
const COMMENT = "Great work. Sharing with the team.";
const Report = () => (
  <Cut span={SHOT.report} name="0:30 Report" render={(t0) => {
    const t = t0 * PACE.report;
    const s = kf(t, [0, 40, 100], [1.6, 1.45, 1.3], ease.inOut);
    const fx = kf(t, [0, 40, 100], [800, 900, 1180], ease.inOut);
    const fy = kf(t, [0, 40, 100], [300, 560, 420], ease.inOut);
    const cur = path(t, [0, 30, 60, 80], [700, 980, 1200, 1560], [380, 410, 600, 330]);
    const typed = COMMENT.slice(0, Math.max(0, Math.floor((t - 66) * 1.4)));
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [94, 100], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy} bg="#F9FBFD">
          <ReportPage highlight={ramp(t, [8, 22])} bar={ramp(t, [36, 54], [0, 1], ease.inOut)} commentP={ramp(t, [60, 68], [0, 1], ease.out)} comment={typed} />
          <AICursor x={cur.x} y={cur.y} size={24} tint={BLUE_TINT} outline="#EAF1FF" />
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:33.3 tagline · 0:35.3 1M tokens · 0:38.3 the spark ----------
const Tagline = () => (
  <Cut span={SHOT.tagline} name="0:33 Let Argon find it first" render={(t0) => { const t = t0 * PACE.tagline; return (
    <AbsoluteFill>
      <Aurora t={t0 + SHOT.tagline[0]} />
      <TypeWords text="Let Argon find it first." t={t} at={4} step={5} />
    </AbsoluteFill>
  ); }} />
);
const Tokens = () => (
  <Cut span={SHOT.tokens} name="0:35 1M output tokens" render={(t) => (
    <AbsoluteFill>
      <Aurora t={t + SHOT.tokens[0]} />
      <TokenRiver t={t} opacity={ramp(t, [0, 10]) * (1 - ramp(t, [94, 108]))} />
      <TypeWords text="1M output tokens. In one go." t={t} at={6} step={5} dissolveFrom={0} weight={500} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: GS, fontSize: 26, color: "rgba(255,255,255,0.6)", opacity: ramp(t, [40, 50]) }}>Up from 64K.</div>
    </AbsoluteFill>
  )} />
);
const Logo = () => (
  <Cut span={SHOT.logo} name="0:38.3 Gemini 4 Argon" render={(t) => {
    const k = pop(t, 6);
    return (
      <AbsoluteFill>
        <Aurora t={t + SHOT.logo[0]} black={ramp(t, [0, 20], [0, 0.45])} calm={ramp(t, [0, 30])} />
        <div style={{ position: "absolute", left: 960 - 300, top: 440 - 300, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(80,140,255,${0.35 * k}), rgba(80,140,255,0))` }} />
        <Spark size={150} style={{ position: "absolute", left: 960 - 75, top: 440 - 75, transform: `scale(${k}) rotate(${(1 - k) * -120}deg)` }} />
        <Sparkle t={t} at={8} x={960} y={440} w={260} h={260} n={60} dur={40} />
        <TypeWords text="Gemini 4 Argon" t={t} at={20} step={4} size={64} y={640} dissolveFrom={0} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontFamily: GS, fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.55)", opacity: ramp(t, [40, 55]) }}>
          <div>A concept film by Breeders, made for education, with love for motion design and for AI.</div>
          <div>Not affiliated with or endorsed by Google. Google, Gemini and the Gemini logo are trademarks of Google LLC, shown for illustration only.</div>
        </div>
      </AbsoluteFill>
    );
  }} />
);

const inR = (s: number, a: number, b: number) => s >= a && s < b;

export const GeminiArgon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const dark = s < SHOT.prompt[0] / 30 || inR(s, SHOT.tagline[0] / 30, T.outro) ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("argon/mix.wav")} />
      <Open />
      <Blocks />
      <SpaceApps />
      <Picker />
      <Prompt />
      <Steps />
      <Answer />
      <Pr />
      <Report />
      <Tagline />
      <Tokens />
      <Logo />
      {s >= T.outro ? <BreedersOutro t={s - T.outro} /> : null}
      <Watermark opacity={(1 - ramp(s, [T.outro - 0.4, T.outro], [0, 1])) * (inR(s, SHOT.logo[0] / 30 + 1.2, T.outro) ? 0 : 1)} font={GS} dark={dark} />
    </AbsoluteFill>
  );
};
