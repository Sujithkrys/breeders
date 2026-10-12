// Copy of src/pine-launch/scenes.tsx for the Pine Pro edition of "Motion designers are cooked" (the original film stays
// untouched). Changes: the prompt is typed into the chat box instead of spoken, and the Ember film has a new "steeped" shot.
import React, { useId } from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { Icon } from "../../clueso-mcp/icons";
import { Art } from "../../pine-pro/Art";
import { PineMark } from "../../pine-pro/PineMark";
import { ease, kf, pop, ramp } from "../../utils";
import { EmberFilm, EMB, ESP, CRM, FILM_LEN } from "./EmberFilm";
import { AICursor, AppIcon, Cam, Composer, Cut, path, Pointer, press, Shimmer, Space, Sparkle, Words } from "../../pine-launch/kit";
import { GRAY, INK, LINE, SANS, SHOT, TIGHT } from "../../pine-launch/theme";

// ---------- 0:00 cold open ----------
export const Open = () => (
  <Cut span={SHOT.open} name="0:00 Open" render={(t) => (
    <AbsoluteFill>
      <Space t0={SHOT.open[0]} />
      {t < 50 ? <Words text="Motion design with Pineapple" t={t} at={12} step={5} /> : t >= 54 ? <Words text="powered by Pine Pro" t={t} at={56} step={5} dissolveFrom={2} /> : null}
    </AbsoluteFill>
  )} />
);

// ---------- 0:04 "you can just" ----------
const BLOCKS = [
  { x: 148, y: 340, w: 844, h: 900, c: "#D9D9DB", at: 0 },
  { x: 728, y: -20, w: 632, h: 940, c: "#EFE6CC", at: 3 },
  { x: 728, y: 340, w: 264, h: 580, c: "#F9F2DC", at: 3 },
  { x: 1068, y: -20, w: 528, h: 620, c: "#CFE0F4", at: 7 },
  { x: 1360, y: -20, w: 236, h: 620, c: "#B7CBE2", at: 7 },
];
const BIG: [string, number, number, number][] = [
  ["you", 262, 330, 1],
  ["can", 790, 440, 5],
  ["just", 1110, 210, 9],
];
export const Blocks = () => (
  <Cut span={SHOT.blocks} name="0:04 You can just" render={(t) => {
    const gone = (i: number) => (i === 0 ? t >= 44 : t >= 38);
    const cur = path(t, [14, 30, 44, 52], [1560, 1275, 1210, 700], [960, 748, 760, 600]);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.blocks[0]} />
        {BLOCKS.map((b, i) =>
          gone(i) ? null : (
            <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, background: b.c, clipPath: `inset(${(1 - ramp(t, [b.at, b.at + 6], [0, 1], ease.out)) * 100}% 0 0 0)` }} />
          ),
        )}
        {BIG.map(([w, x, y, at], i) =>
          gone(i) ? null : (
            <div key={w} style={{ position: "absolute", left: x, top: y, fontFamily: TIGHT, fontWeight: 700, fontSize: 300, lineHeight: 1, letterSpacing: "-0.045em", color: INK, opacity: ramp(t, [at, at + 2]), transform: `scale(${ramp(t, [at, at + 6], [1.06, 1])})`, transformOrigin: "0 60%" }}>
              {w}
            </div>
          ),
        )}
        {t < 44 && (
          <div style={{ position: "absolute", left: 330, top: 150, width: 560, height: 84, borderRadius: 16, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", boxSizing: "border-box", fontFamily: SANS, opacity: ramp(t, [12, 16]), transform: `translateY(${ramp(t, [12, 20], [16, 0])}px)` }}>
            <AppIcon name="film" bg={EMB} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: INK }}>Ember_Launch.mp4</div>
              <div style={{ fontSize: 15, color: GRAY }}>Video · MP4 · 4K</div>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 18, border: `1px solid ${LINE}`, fontSize: 16, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
              Open <Icon name="chevronDown" size={14} color={GRAY} />
            </div>
          </div>
        )}
        {t < 38 && (
          <div style={{ position: "absolute", left: 1250, top: 700, opacity: ramp(t, [16, 20]), transform: `translateY(${ramp(t, [16, 24], [14, 0])}px)` }}>
            <div style={{ position: "absolute", left: -34, top: 26, width: 20, height: 20, borderRadius: 10, background: "#2F7BFF", boxShadow: "0 0 0 5px rgba(47,123,255,0.2)" }} />
            <div style={{ width: 560, height: 74, borderRadius: 20, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px 0 20px", boxSizing: "border-box", fontFamily: SANS, fontSize: 19, color: INK }}>
              <Icon name="sliders" size={18} color={GRAY} />
              <span style={{ flex: 1 }}>Animate our new logo</span>
              <Icon name="mic" size={18} color={GRAY} />
              <div style={{ width: 36, height: 36, borderRadius: 18, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="arrowUp" size={18} color="#fff" stroke={2.4} />
              </div>
            </div>
          </div>
        )}
        <AICursor x={cur.x} y={cur.y} opacity={ramp(t, [12, 16])} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:05.7 "turn ideas into motion" ----------
type Floater = { art: string; x: number; y: number; w: number; h: number; dx: number; dy: number; at: number };
export const FLOATERS: Floater[] = [
  { art: "mountain_hero", x: 1300, y: -50, w: 640, h: 240, dx: 0, dy: -1, at: 6 },
  { art: "coffee_beans", x: -70, y: 730, w: 540, h: 310, dx: -1, dy: 0, at: 9 },
  { art: "city", x: 1520, y: 740, w: 380, h: 310, dx: 1, dy: 1, at: 8 },
  { art: "tile_3d", x: 40, y: 70, w: 250, h: 330, dx: -1, dy: 0, at: 12 },
  { art: "castle", x: 1660, y: 330, w: 240, h: 330, dx: 1, dy: 0, at: 14 },
  { art: "coffee_splash", x: 700, y: 880, w: 520, h: 300, dx: 0, dy: 1, at: 11 },
  { art: "cup_white", x: 400, y: -70, w: 300, h: 220, dx: 0, dy: -1, at: 16 },
];
const ICONS: [Parameters<typeof AppIcon>[0]["name"], string, number, number, number][] = [
  ["film", EMB, 560, 260, 10],
  ["sparkles", "#7A5CFF", 1360, 320, 13],
  ["wave", "#1DB38A", 1250, 690, 15],
  ["layers", "#2F7BFF", 380, 640, 17],
  ["type", "#1C1C1E", 1560, 240, 19],
];
const FloatField: React.FC<{ t: number; out?: number }> = ({ t, out = 0 }) => (
  <>
    {FLOATERS.map((f, i) => {
      const p = ramp(t, [f.at, f.at + 12], [0, 1], ease.out);
      const drift = t * 0.35 + out * 500;
      return (
        <div key={i} style={{ position: "absolute", left: f.x + f.dx * ((1 - p) * 140 + drift), top: f.y + f.dy * ((1 - p) * 140 + drift), width: f.w, height: f.h, borderRadius: 12, overflow: "hidden", opacity: p * (1 - out), boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Art name={f.art} w={f.w} h={f.h} />
        </div>
      );
    })}
    {ICONS.map(([n, bg, x, y, at], i) => {
      const p = pop(t, at);
      return (
        <div key={n} style={{ position: "absolute", left: x + Math.sin(t / 20 + i) * 6, top: y + Math.cos(t / 24 + i) * 6, transform: `scale(${p})`, opacity: 1 - out }}>
          <AppIcon name={n} bg={bg} size={52} />
        </div>
      );
    })}
  </>
);
export const Great = () => (
  <Cut span={SHOT.great} name="0:05 Turn ideas into motion" render={(t) => {
    const cur = path(t, [0, 30, 60, 83], [700, 610, 900, 960], [600, 590, 930, 950]);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.great[0]} />
        <AbsoluteFill style={{ transform: `scale(${kf(t, [0, 83], [1, 1.04], ease.linear)})` }}>
          <FloatField t={t} />
          <div style={{ position: "absolute", left: 700, top: 880, width: 520, height: 300, borderRadius: 12, boxShadow: `0 0 0 3px rgba(178,120,255,${ramp(t, [58, 64]) * 0.9})`, opacity: t > 58 ? 1 : 0 }} />
        </AbsoluteFill>
        <Words text="turn ideas into motion" t={t} at={4} step={6} />
        <AICursor x={cur.x} y={cur.y} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:08.5 mode toggle ----------
export const Toggle = () => (
  <Cut span={SHOT.toggle} name="0:08 Motion mode" render={(t) => {
    const k = ramp(t, [14, 22], [0, 1], ease.inOut);
    const cur = path(t, [0, 12], [1420, 1150], [800, 572]);
    const kx = 960 - 350 + 10 + k * 340;
    return (
      <AbsoluteFill>
        <Space t0={SHOT.toggle[0]} />
        <div style={{ position: "absolute", left: 960 - 350, top: 540 - 68, width: 700, height: 136, borderRadius: 68, background: "#EDEDED", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }} />
        <div style={{ position: "absolute", left: kx, top: 540 - 58, width: 340, height: 116, borderRadius: 58, background: "#FFFFFF", boxShadow: `0 4px 14px rgba(0,0,0,0.12), 0 0 ${ramp(t, [16, 24]) * 40}px rgba(255,255,255,${ramp(t, [16, 24]) * 0.55})` }} />
        {["Image", "Motion"].map((l, i) => (
          <div key={l} style={{ position: "absolute", left: 960 - 350 + 10 + i * 340, top: 540 - 58, width: 340, height: 116, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 50, fontWeight: 500, color: INK, letterSpacing: "-0.01em" }}>
            {l}
          </div>
        ))}
        <Sparkle t={t} at={16} x={kx + 170} y={540} w={360} h={136} dur={30} />
        <Pointer x={cur.x} y={cur.y} size={40} light press={press(t, 14)} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:10 voice prompt ----------
const PROMPT = "Make a 15-second launch film for Ember Cold Brew. Bold kinetic type, warm tones, cut to the beat.";
const SEND = { x: 1327, y: 541 };
// Typed, not spoken: the camera follows the caret along the prompt, then pulls back as the cursor hits send.
export const TYPE_AT: [number, number] = [14, 138];
export const Voice = () => (
  <Cut span={SHOT.voice} name="0:10 Typed prompt" render={(t) => {
    const n = Math.floor(ramp(t, TYPE_AT, [0, PROMPT.length], (v) => v));
    const typing = t >= TYPE_AT[0] && n < PROMPT.length;
    const caret = typing || Math.floor(t / 8) % 2 === 0;
    // the whole chat box (x 550–1370) stays in frame: a slow push in while typing, then ease back for the send
    const s = kf(t, [0, 16, 138, 158], [1.45, 1.5, 1.62, 1.3], ease.inOut);
    const fx = kf(t, [0, 158], [960, 960], ease.inOut);
    const fy = kf(t, [0, 16, 138, 158], [530, 520, 520, 530], ease.inOut);
    const cur = path(t, [0, 12, 138, 156], [1380, 1250, 1250, SEND.x], [700, 640, 640, SEND.y]);
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [170, 180], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 550, top: 440 }}>
            <Composer
              text={n ? <>{PROMPT.slice(0, n)}{caret ? <span style={{ display: "inline-block", width: 2, height: "1.1em", background: INK, verticalAlign: "-0.18em", marginLeft: 1 }} /> : null}</> : undefined}
              sendPress={press(t, 160)}
            />
          </div>
          <Pointer x={cur.x} y={cur.y} size={22} press={press(t, 160)} />
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:16 agent steps ----------
const STEPS: [Parameters<typeof AppIcon>[0]["name"], string, string][] = [
  ["palette", EMB, "Reading the Ember brand kit"],
  ["layers", "#7A5CFF", "Writing the storyboard"],
  ["grid", "#2F7BFF", "Designing 6 scenes"],
  ["wave", "#1DB38A", "Timing every cut to the music"],
  ["film", "#1C1C1E", "Rendering in 4K"],
];
const STEP_AT = [0, 14, 28, 42, 56];
export const Steps = () => (
  <Cut span={SHOT.steps} name="0:16 Working" render={(t) => {
    const shown = STEP_AT.filter((a) => t >= a).length;
    const lift = STEP_AT.reduce((acc, a) => acc + ramp(t, [a, a + 8], [0, 1], ease.out), 0);
    const exit = ramp(t, [94, 104], [0, 1], ease.in);
    return (
      <AbsoluteFill style={{ background: "#fff" }}>
        <div style={{ position: "absolute", left: 620, top: 540 - lift * 34, transform: `translateX(${-exit * 1500}px) scale(${kf(t, [0, 94], [1.12, 1.18], ease.linear)})`, transformOrigin: "0 50%" }}>
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
        {t > 100 && (
          <div style={{ position: "absolute", left: 620, top: 520, fontFamily: SANS, fontSize: 22, opacity: ramp(t, [100, 104]) }}>
            <Shimmer t={t} period={24}>Working</Shimmer>
          </div>
        )}
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:20 answer + video card ----------
const ANSWER = "Here's your 15-second launch film for Ember Cold Brew, in your brand colors, with kinetic type cut to a 120 BPM track.";
const THUMB = { x: 560, y: 560, w: 560, h: 315 };
export const Answer = () => (
  <Cut span={SHOT.answer} name="0:20 Answer" render={(t) => {
    const words = ANSWER.split(" ");
    const n = Math.min(words.length, Math.max(0, Math.floor((t - 3) * 1.25)));
    const s = kf(t, [0, 22, 38], [1.3, 1.3, 1], ease.inOut);
    const fx = kf(t, [0, 22, 38], [900, 900, 960], ease.inOut);
    const fy = kf(t, [0, 22, 38], [420, 430, 560], ease.inOut);
    const cur = path(t, [36, 52], [1300, THUMB.x + THUMB.w / 2 + 6], [980, THUMB.y + THUMB.h / 2 + 8]);
    const g = ramp(t, [58, 84], [0, 1], ease.inOut);
    const cardIn = ramp(t, [26, 36], [0, 1], ease.out);
    return (
      <AbsoluteFill>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 560, top: 330, width: 820, fontFamily: SANS }}>
            <div style={{ fontSize: 19, color: GRAY, marginBottom: 16 }}>Worked for 48s</div>
            <div style={{ fontSize: 30, lineHeight: 1.45, color: INK, letterSpacing: "-0.01em" }}>{words.slice(0, n).join(" ")}</div>
          </div>
          <div style={{ position: "absolute", left: THUMB.x, top: THUMB.y, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 20}px)` }}>
            <div style={{ width: THUMB.w, height: THUMB.h, borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ transform: `scale(${THUMB.w / 1920})`, transformOrigin: "0 0" }}>
                <EmberFilm t={186} />
              </div>
              <div style={{ position: "absolute", left: THUMB.w / 2 - 34, top: THUMB.h / 2 - 34, width: 68, height: 68, borderRadius: 34, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press(t, 56) * 0.1})` }}>
                <Icon name="play" size={28} color={INK} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontFamily: SANS }}>
              <AppIcon name="film" bg={EMB} size={34} />
              <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>Ember_Cold_Brew_Launch.mp4</div>
              <div style={{ fontSize: 15, color: GRAY }}>0:15 · 4K</div>
            </div>
          </div>
          <Pointer x={cur.x} y={cur.y} size={26} press={press(t, 56)} opacity={ramp(t, [36, 40]) * (1 - g)} />
        </Cam>
        {t >= 58 && (
          <div style={{ position: "absolute", left: interpolate(g, [0, 1], [THUMB.x, 0]), top: interpolate(g, [0, 1], [THUMB.y, 0]), width: interpolate(g, [0, 1], [THUMB.w, 1920]), height: interpolate(g, [0, 1], [THUMB.h, 1080]), borderRadius: 16 * (1 - g), overflow: "hidden", background: ESP }}>
            <div style={{ transform: `scale(${interpolate(g, [0, 1], [THUMB.w, 1920]) / 1920})`, transformOrigin: "0 0", opacity: 1 - ramp(t, [60, 74]) }}>
              <EmberFilm t={186} />
            </div>
          </div>
        )}
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:23 the generated film ----------
export const Film = () => <Cut span={SHOT.film} name="0:23 Ember film" render={(t) => <EmberFilm t={t} />} />;

// ---------- 0:30 refine in the editor ----------
const REFINE = "Make the title hit harder";
const TL = { x: 600, w: 1160, y: 800 };
const CUTS = [0, 30, 75, 120, 165, FILM_LEN];
const SCENE_NAMES = ["Title", "Product", "Steeped", "Lineup", "End card"];
const SCENE_COLORS = [EMB, CRM, ESP, "#E7D8C1", "#2A1810"];
export const Refine = () => (
  <Cut span={SHOT.refine} name="0:30 Refine" render={(t) => {
    const filmT = t < 100 ? 27 : t < 135 ? 12 + (t - 100) * 0.55 : 31 + (t - 135) * 0.9;
    const punchy = t >= 100;
    const s = kf(t, [0, 16, 38, 132, 162], [1, 1, 1.65, 1.65, 1], ease.inOut);
    const fx = kf(t, [0, 16, 38, 132, 162], [960, 960, 1190, 1190, 960], ease.inOut);
    const fy = kf(t, [0, 16, 38, 132, 162], [540, 540, 440, 440, 540], ease.inOut);
    const cur = path(t, [8, 36, 74, 84, 110, 150], [1560, 1004, 1004, 1428, 1500, 1640], [940, 402, 402, 452, 560, 900]);
    const open = ramp(t, [41, 47], [0, 1], ease.out) * ramp(t, [98, 103], [1, 0], ease.in);
    const typed = REFINE.slice(0, Math.max(0, Math.floor((t - 48) * 0.95)));
    const px = TL.x + (Math.min(filmT, FILM_LEN) / FILM_LEN) * TL.w;
    return (
      <Cam s={s} fx={fx} fy={fy} bg="#F9F9F9">
        <div style={{ position: "absolute", left: 80, top: 50, width: 1760, height: 980, borderRadius: 22, background: "#fff", border: `1px solid ${LINE}`, boxShadow: "0 20px 60px rgba(0,0,0,0.06)", overflow: "hidden", fontFamily: SANS }}>
          <div style={{ height: 58, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 14, fontSize: 16 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
            ))}
            <span style={{ marginLeft: 14, fontWeight: 600, color: INK }}>Ember launch film</span>
            <span style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 18, background: INK, color: "#fff", fontSize: 15 }}>Export</span>
          </div>
          <div style={{ position: "absolute", left: 0, top: 58, bottom: 0, width: 440, borderRight: `1px solid ${LINE}`, padding: 26, boxSizing: "border-box", fontSize: 15, lineHeight: 1.5, color: INK }}>
            <div style={{ marginLeft: 50, background: "#F3F3F3", borderRadius: 18, padding: "12px 16px" }}>{PROMPT}</div>
            <div style={{ color: GRAY, fontSize: 13, margin: "22px 0 8px" }}>Worked for 48s</div>
            <div>{ANSWER}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: 10, border: `1px solid ${LINE}`, borderRadius: 12 }}>
              <AppIcon name="film" bg={EMB} size={30} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Ember_Cold_Brew_Launch.mp4</span>
            </div>
            {t > 90 && (
              <div style={{ opacity: ramp(t, [90, 96]) }}>
                <div style={{ marginLeft: 150, marginTop: 22, background: "#F3F3F3", borderRadius: 18, padding: "12px 16px" }}>{REFINE}</div>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  {t < 116 ? (
                    <Shimmer t={t}>Updating scene 1…</Shimmer>
                  ) : (
                    <>
                      <Icon name="check" size={16} color="#1DB38A" stroke={2.6} /> Updated scene 1: bigger slam, camera shake, glow.
                    </>
                  )}
                </div>
              </div>
            )}
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, height: 54, borderRadius: 27, border: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 8px 0 20px", color: "#A8A8A8" }}>
              <span style={{ flex: 1 }}>Ask for changes</span>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="arrowUp" size={18} color="#fff" stroke={2.4} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 660, top: 150, width: 1040, height: 585, borderRadius: 14, overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}>
          <div style={{ transform: `scale(${1040 / 1920})`, transformOrigin: "0 0" }}>
            <EmberFilm t={filmT} punchy={punchy} />
          </div>
        </div>
        {t >= 116 && (
          <div style={{ position: "absolute", left: 1180 - 105, top: 172, width: 210, height: 44, borderRadius: 22, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: SANS, fontSize: 16, fontWeight: 500, color: INK, transform: `scale(${pop(t, 116)})`, opacity: ramp(t, [150, 158], [1, 0]) }}>
            <Icon name="check" size={16} color="#1DB38A" stroke={2.6} /> Scene 1 updated
          </div>
        )}
        {t >= 41 && t < 104 && (
          <>
            <div style={{ position: "absolute", left: 990, top: 392, width: 22, height: 22, borderRadius: 11, background: "#2F7BFF", boxShadow: "0 0 0 6px rgba(47,123,255,0.22)", transform: `scale(${pop(t, 41)})` }} />
            <div style={{ position: "absolute", left: 1024, top: 380, width: 450, height: 104, borderRadius: 18, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,0.2)", padding: "14px 14px 12px 18px", boxSizing: "border-box", fontFamily: SANS, opacity: open, transform: `scale(${0.95 + 0.05 * open})`, transformOrigin: "0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, color: typed ? INK : "#A8A8A8", height: 30 }}>
                <Icon name="sliders" size={16} color={GRAY} />
                {typed || "Describe a change"}
                {t < 84 && Math.floor(t / 8) % 2 === 0 && <span style={{ width: 2, height: 20, background: INK }} />}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 8 }}>
                <Icon name="mic" size={16} color={GRAY} />
                <div style={{ width: 34, height: 34, borderRadius: 17, background: INK, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press(t, 86) * 0.12})` }}>
                  <Icon name="arrowUp" size={16} color="#fff" stroke={2.4} />
                </div>
              </div>
            </div>
          </>
        )}
        <div style={{ position: "absolute", left: TL.x - 40, top: TL.y - 40, width: TL.w + 80, height: 230, fontFamily: SANS }}>
          <div style={{ position: "absolute", left: 40, top: 6, right: 40, display: "flex", justifyContent: "space-between", fontSize: 12, color: GRAY, fontVariantNumeric: "tabular-nums" }}>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i}>0:{String(i * 2).padStart(2, "0")}</span>
            ))}
          </div>
        </div>
        {CUTS.slice(0, -1).map((c, i) => {
          const x = TL.x + (c / FILM_LEN) * TL.w;
          const w = ((CUTS[i + 1] - c) / FILM_LEN) * TL.w - 6;
          const hot = i === 0 && t >= 100 && t < 150;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: TL.y, width: w, height: 70, borderRadius: 10, background: SCENE_COLORS[i], boxShadow: hot ? "0 0 0 3px #A46BFF, 0 0 24px rgba(164,107,255,0.5)" : undefined, display: "flex", alignItems: "flex-end", padding: 10, boxSizing: "border-box", fontFamily: SANS, fontSize: 13, fontWeight: 600, color: i === 1 || i === 3 ? ESP : CRM }}>
              {SCENE_NAMES[i]}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: TL.x, top: TL.y + 84, width: TL.w, height: 50, display: "flex", alignItems: "center", gap: 3, overflow: "hidden" }}>
          {Array.from({ length: 290 }, (_, i) => (
            <div key={i} style={{ width: 1, height: 6 + (i % 8 === 0 ? 34 : random(`tw${i}`) * 22), background: "#C9C9C9", borderRadius: 1, flexShrink: 0 }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: px - 1, top: TL.y - 14, width: 2, height: 164, background: INK }} />
        <div style={{ position: "absolute", left: px - 7, top: TL.y - 22, width: 14, height: 14, borderRadius: 4, background: INK }} />
        {t > 104 && t < 150 && <Sparkle t={t} at={104} x={TL.x + 110} y={TL.y + 35} w={230} h={80} n={40} dur={40} color="#A46BFF" />}
        <Pointer x={cur.x} y={cur.y} size={24} press={press(t, 39) + press(t, 86)} />
      </Cam>
    );
  }} />
);

// ---------- 0:36 tagline ----------
export const Tagline = () => (
  <Cut span={SHOT.tagline} name="0:36 Tagline" render={(t) => (
    <AbsoluteFill>
      <Space t0={SHOT.tagline[0]} />
      <Words text="Let Pine Pro handle the keyframes" t={t} at={3} step={5} />
    </AbsoluteFill>
  )} />
);

// ---------- 0:38 range montage ----------
const PromptPill: React.FC<{ t: number; text: string }> = ({ t, text }) => {
  const shown = text.slice(0, Math.max(0, Math.floor((t - 2) * 2.2)));
  return (
    <div style={{ position: "absolute", left: 960 - 330, top: 950, width: 660, height: 76, borderRadius: 38, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,0.14)", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 14, padding: "0 12px 0 26px", boxSizing: "border-box", fontFamily: SANS, fontSize: 21, color: INK, opacity: ramp(t, [0, 3]) }}>
      <Icon name="sparkles" size={20} color="#A46BFF" />
      <span style={{ flex: 1 }}>{shown}</span>
      <div style={{ width: 50, height: 50, borderRadius: 25, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="arrowUp" size={22} color="#fff" stroke={2.4} />
      </div>
    </div>
  );
};
const Chart: React.FC<{ t: number }> = ({ t }) => {
  const vals = [42, 58, 51, 74, 88, 112];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", padding: "80px 110px", boxSizing: "border-box", fontFamily: SANS }}>
      <div style={{ fontSize: 30, fontWeight: 600, color: INK }}>Ember sales, launch quarter</div>
      <div style={{ fontSize: 18, color: GRAY, marginTop: 6 }}>Cans sold per week (thousands)</div>
      <div style={{ position: "absolute", left: 110, right: 110, bottom: 90, height: 470, display: "flex", alignItems: "flex-end", gap: 34, borderBottom: `2px solid ${INK}` }}>
        {vals.map((v, i) => {
          const p = ramp(t, [2 + i * 2.5, 14 + i * 2.5], [0, 1], ease.out);
          return (
            <div key={i} style={{ flex: 1, height: `${(v / 120) * 100 * p}%`, background: i === vals.length - 1 ? EMB : "#E9DCC6", borderRadius: "10px 10px 0 0", position: "relative" }}>
              <div style={{ position: "absolute", top: -34, left: 0, right: 0, textAlign: "center", fontSize: 20, fontWeight: 600, color: INK, opacity: p }}>{Math.round(v * p)}k</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const MONTAGE: { prompt: string; cursor: [number, number] }[] = [
  { prompt: "Animate our logo reveal", cursor: [1240, 470] },
  { prompt: "Turn this chart into motion", cursor: [1500, 330] },
  { prompt: "Cut a 9:16 version for Reels", cursor: [1110, 330] },
  { prompt: "Make it an isometric 3D explainer", cursor: [1020, 330] },
];
export const Montage = () => (
  <Cut span={SHOT.montage} name="0:38 Any style" render={(t) => {
    const i = Math.min(3, Math.floor(t / 30));
    const k = t - i * 30;
    const m = MONTAGE[i];
    const z = kf(k, [0, 30], [1, 1.06], ease.linear);
    return (
      <AbsoluteFill style={{ background: "#F4F4F5" }}>
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          <div style={{ position: "absolute", left: 210, top: 80, width: 1500, height: 820, borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: `1px solid ${LINE}` }}>
            {i === 0 && <Art name="mountain_editor" w={1500} h={820} />}
            {i === 1 && <Chart t={k} />}
            {i === 2 && (
              <div style={{ position: "absolute", inset: 0, background: "#111" }}>
                <div style={{ position: "absolute", inset: 0, opacity: 0.35, filter: "blur(18px)" }}>
                  <Art name="city" w={1500} h={820} />
                </div>
                <div style={{ position: "absolute", left: 750 - 225, top: 30, width: 450, height: 760, borderRadius: 46, overflow: "hidden", border: "10px solid #0A0A0A", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", transform: `scale(${0.92 + 0.08 * pop(k, 0)})` }}>
                  <Art name="city" w={430} h={740} />
                  <div style={{ position: "absolute", left: 30, bottom: 60, fontFamily: TIGHT, fontWeight: 800, fontSize: 64, lineHeight: 0.95, color: "#fff", letterSpacing: "-0.04em" }}>
                    NEW
                    <br />
                    DROP
                  </div>
                </div>
              </div>
            )}
            {i === 3 && <Art name="tile_3d" w={1500} h={820} />}
          </div>
        </AbsoluteFill>
        <PromptPill t={k} text={m.prompt} />
        <AICursor x={m.cursor[0] + Math.sin(k / 6) * 10} y={m.cursor[1] + Math.cos(k / 7) * 8 + (1 - ramp(k, [0, 10], [0, 1], ease.out)) * 60} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:42 CTA ----------
export const Cta = () => (
  <Cut span={SHOT.cta} name="0:42 Try Pine Pro" render={(t) => (
    <AbsoluteFill>
      <Space t0={SHOT.cta[0]} />
      <FloatField t={t + 30} out={ramp(t, [44, 60], [0, 1], ease.in)} />
      <div style={{ opacity: ramp(t, [48, 58], [1, 0]) }}>
        <Words text="Try Pine Pro" t={t} at={2} step={5} size={76} />
      </div>
    </AbsoluteFill>
  )} />
);

// ---------- 0:44 logo ----------
const PARTS = Array.from({ length: 520 }, (_, i) => ({ a: random(`la${i}`) * Math.PI * 2, r: 150 + random(`lr${i}`) * 750, s: 0.8 + random(`ls${i}`) * 1.8, e: 10 + random(`le${i}`) * 40 }));
export const Logo = () => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <Cut span={SHOT.logo} name="0:44 Logo" render={(t) => {
      const c = ramp(t, [0, 20], [0, 1], ease.inOut);
      const form = ramp(t, [14, 32], [0, 1], ease.out);
      return (
        <AbsoluteFill>
          <Space t0={SHOT.logo[0]} black={ramp(t, [0, 16], [0, 1])} />
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
              return <circle key={i} cx={960 + Math.cos(a) * r} cy={520 + Math.sin(a) * r * 0.9} r={p.s} fill="#fff" opacity={(0.25 + 0.75 * c) * (1 - form)} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 960 - 70, top: 520 - 100, filter: form < 0.995 ? `url(#lg${id})` : undefined, opacity: Math.min(1, form * 2) }}>
            <PineMark size={140} mono />
          </div>
        </AbsoluteFill>
      );
    }} />
  );
};
