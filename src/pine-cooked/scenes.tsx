// Scenes for "Motion designers are cooked" (Pine Pro edition). Every component takes absolute timeline seconds `s`.
import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { ACCENT } from "../brand/Breeders";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { Cam, Shimmer } from "../pine-launch/kit";
import { ease, ramp } from "../utils";
import { cursorAt, Cursor, springAt, track } from "../sarvam-live/kit";
import { PineMark } from "../pine-pro/PineMark";
import { K, MONO, PROMPT, UI } from "./chat";
import { DISPLAY, FILM_LEN, FILM_SFX, FILM_SHOTS, FilmBox, G, GTIGHT, PineFilm, toNew } from "./film";
import { WORDS } from "./voice";

const wordAt = (w: string, after = 0) => WORDS.find((x) => x.w.replace(/[^\w]/g, "").toLowerCase() === w && x.s >= after)?.s ?? after;

// ---------- 0:00 hook ----------
// Background cuts: [timeline s, film t] (film moments picked in original Pine seconds). A new shot about every 0.4s, landing on the words; each gets a hit in the mix.
export const HOOK: [number, number][] = [
  [0, toNew(25.1)],
  [0.52, toNew(39.1)],
  [0.94, toNew(7.9)],
  [1.33, toNew(32.1)],
  [1.72, toNew(28.5)],
  [2.06, toNew(43)],
  [2.5, toNew(17.3)],
];
const Slam: React.FC<{ s: number; at: number; children: React.ReactNode; style?: React.CSSProperties; rgb?: boolean }> = ({ s, at, children, style, rgb = true }) => {
  const p = springAt(s, at, { damping: 11, stiffness: 260, mass: 0.55 });
  const split = rgb ? 16 * ramp(s, [at, at + 0.22], [1, 0]) : 0;
  const base: React.CSSProperties = { fontFamily: DISPLAY, lineHeight: 1.02, textTransform: "uppercase", whiteSpace: "nowrap", ...style };
  if (s < at) return <div style={{ ...base, opacity: 0 }}>{children}</div>;
  return (
    <div style={{ position: "relative", opacity: Math.min(1, p * 2.5), transform: `scale(${1.45 - 0.45 * p})` }}>
      {split > 0.5 ? (
        <>
          <div style={{ ...base, position: "absolute", inset: 0, color: "#00E5FF", WebkitTextStroke: "0", transform: `translateX(${-split}px)`, mixBlendMode: "screen", opacity: 0.8 }}>{children}</div>
          <div style={{ ...base, position: "absolute", inset: 0, color: "#FF2E4D", WebkitTextStroke: "0", transform: `translateX(${split}px)`, mixBlendMode: "screen", opacity: 0.8 }}>{children}</div>
        </>
      ) : null}
      <div style={{ ...base, position: "relative" }}>{children}</div>
    </div>
  );
};
export const Hook: React.FC<{ s: number }> = ({ s }) => {
  const i = HOOK.reduce((acc, [c], j) => (s >= c ? j : acc), 0);
  const [c0, f0] = HOOK[i];
  const k = s - c0;
  const aMotion = wordAt("motion");
  const aAre = wordAt("are");
  const aCooked = wordAt("cooked");
  const hitCooked = s >= aCooked ? 1 - ramp(s, [aCooked, aCooked + 0.35], [0, 1]) : 0;
  const shake = [aMotion, aAre, aCooked].reduce((acc, a, j) => (s >= a && s < a + 0.25 ? acc + Math.sin((s - a) * 110) * (j === 2 ? 26 : 10) * (1 - (s - a) / 0.25) : acc), 0);
  const flash = s >= aCooked ? ramp(s, [aCooked, aCooked + 0.12], [0.85, 0]) : 0;
  const glow = s >= aCooked ? 0.6 + 0.4 * Math.sin((s - aCooked) * 14) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 + 0.1 * ramp(k, [0, 0.3], [1, 0], ease.out)})`, filter: "blur(9px) saturate(1.3) brightness(0.7)" }}>
        <PineFilm t={f0 + k} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.45), rgba(0,0,0,0.85))" }} />
      {s >= aCooked ? <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 45% at 50% 70%, rgba(210,35,42,${0.45 * glow}), transparent 70%)` }} /> : null}
      {s >= aCooked
        ? Array.from({ length: 70 }, (_, j) => {
            const life = (s - aCooked) * (0.6 + random(`e${j}`) * 0.8);
            const x = 960 + (random(`ex${j}`) - 0.5) * 1500 + Math.sin(life * 4 + j) * 20;
            const y = 900 - life * (380 + random(`ev${j}`) * 520);
            const sz = 4 + random(`es${j}`) * 5;
            return <div key={j} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: 4, background: random(`ec${j}`) < 0.5 ? "#FF7A1A" : "#FFC24A", boxShadow: "0 0 10px #FF7A1A", opacity: Math.max(0, 1 - life * 0.8) }} />;
          })
        : null}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Slam s={s} at={aMotion} style={{ fontSize: 176, color: "#fff", letterSpacing: "0.01em" }}>
          Motion designers
        </Slam>
        <Slam s={s} at={aAre} rgb={false} style={{ fontSize: 92, color: "transparent", WebkitTextStroke: "2.5px #fff", letterSpacing: "0.12em" }}>
          are officially
        </Slam>
        <Slam s={s} at={aCooked} style={{ fontSize: 330, color: ACCENT, letterSpacing: "0.005em", textShadow: `0 0 ${40 + 50 * glow}px rgba(255,60,40,${0.7 * glow}), 0 0 ${120 * glow}px rgba(255,120,30,${0.4 * glow})` }}>
          Cooked.
        </Slam>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(flash, i > 0 ? ramp(k, [0, 0.08], [0.35, 0]) : 0) }} />
      <AbsoluteFill style={{ background: `rgba(210,35,42,${0.25 * hitCooked})`, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

// ---------- 0:03 rewind ----------
export const Rewind: React.FC<{ s: number }> = ({ s }) => {
  const k = ramp(s, [3.0, 4.2], [0, 1], (v) => v * v);
  const ft = 9 - k * 8.8;
  const white = ramp(s, [4.15, 4.3], [0, 1]) * (1 - ramp(s, [4.3, 4.5], [0, 1]));
  const jitter = (random(`rw${Math.floor(s * 30)}`) - 0.5) * 18;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translateY(${jitter}px)` }}>
        <AbsoluteFill style={{ opacity: 0.6, transform: "translateX(-10px)", mixBlendMode: "screen", filter: "hue-rotate(-40deg) saturate(2)" }}>
          <PineFilm t={ft} />
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: 0.75, mixBlendMode: "screen" }}>
          <PineFilm t={ft} />
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380 + ((s * 900) % 700), height: 26, background: "rgba(255,255,255,0.12)", filter: "blur(6px)" }} />
      <div style={{ position: "absolute", left: 70, top: 60, fontFamily: MONO, fontSize: 44, color: "#fff", letterSpacing: "0.08em", textShadow: "0 0 12px rgba(255,255,255,0.6)", opacity: Math.floor(s * 4) % 2 ? 1 : 0.6 }}>◀◀ REWIND</div>
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
    </AbsoluteFill>
  );
};

// ---------- the film, full frame ----------
export const FilmAt: React.FC<{ t: number; label?: string }> = ({ t, label }) => (
  <AbsoluteFill>
    <PineFilm t={Math.min(FILM_LEN - 0.01, Math.max(0, t))} />
    {label ? (
      <div style={{ position: "absolute", left: 40, top: 36, display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 20, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.15)", fontFamily: UI, fontSize: 18, color: "rgba(255,255,255,0.85)", opacity: ramp(t, [0.1, 0.4]) * (1 - ramp(t, [2.6, 3])) }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: "#FF3B30" }} /> {label}
      </div>
    ) : null}
  </AbsoluteFill>
);

// All the markers land within 2.2s, however many cues the film has. Mirrored in scripts/compose-pine-cooked.mjs.
export const MSTEP = 2.2 / FILM_SFX.length;

// ---------- 0:26.5 edit: "Add sound effects to every cut." ----------
const EDIT = "Add sound effects to every cut. Make it hit.";
export const E: { type: [number, number]; send: number; markers: number; rerender: number; done: number; expand: number; full: number } = {
  type: [26.7, 28.1],
  send: 28.3,
  markers: 28.7,
  rerender: 31.1,
  done: 31.9,
  // on "Now watch the magic…" the preview (the film's starfield) opens to full screen; the Premiere card plays on it until the film
  expand: wordAt("now", 33) - 0.15,
  full: 38.85,
};
const KIND: Record<string, [string, string]> = {
  whoosh: ["WHOOSH", "#7A5CFF"],
  impact: ["IMPACT", "#FF4D6D"],
  riser: ["RISER", "#F2A13B"],
  pop: ["POP", "#1DB38A"],
  glitch: ["GLITCH", "#2F7BFF"],
  sub: ["SUB DROP", "#E0457B"],
  tick: ["TICK", "#8E8A84"],
  chime: ["CHIME", "#7CC94A"],
  swell: ["SWELL", "#C792EA"],
};
const PLAYER = { x: 200, y: 96, w: 760, h: 428 };
export const SfxEdit: React.FC<{ s: number }> = ({ s }) => {
  const chars = Math.floor(ramp(s, E.type, [0, EDIT.length], (v) => v));
  const sent = s >= E.send + 0.1;
  const panelIn = ramp(s, [E.send + 0.2, E.markers], [0, 1], ease.out);
  const placed = FILM_SFX.filter((_, i) => s >= E.markers + i * MSTEP).length;
  const rr = ramp(s, [E.rerender, E.done], [0, 1], ease.inOut);
  const done = s >= E.done;
  const expand = ramp(s, [E.expand, E.expand + 0.7], [0, 1], ease.inOut);
  const cs = track(s, [[26.5, 1.12], [E.send, 1.12], [E.send + 0.4, 1], [E.expand, 1]]);
  const fx = track(s, [[26.5, 1000], [E.send, 1000], [E.send + 0.4, 960], [E.expand, 960]]);
  const fy = track(s, [[26.5, 520], [E.send, 520], [E.send + 0.4, 540], [E.expand, 540]]);
  const cur = cursorAt(s, [[26.6, 1500, 1000], [28.1, 1690, 915], [E.send, 1695, 912]], [E.send]);
  return (
    <AbsoluteFill>
      <Cam s={cs} fx={fx} fy={fy} bg={K.bg}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 64, borderBottom: `1px solid ${K.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 32px", fontFamily: UI }}>
          <ClaudeMark size={24} color={K.accent} />
          <span style={{ fontSize: 18, fontWeight: 600, color: K.ink }}>Claude Code</span>
          <span style={{ fontSize: 15, color: K.muted, marginLeft: 10 }}>~/pine-pro</span>
        </div>
        <div style={{ position: "absolute", left: PLAYER.x, top: PLAYER.y, width: PLAYER.w, height: PLAYER.h, borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 24px 70px rgba(40,25,10,0.18)" }}>
          <FilmBox w={PLAYER.w} h={PLAYER.h} t={done ? 0.2 : toNew(23.2) + ((s - 26.5) % 3.0)} />
          {s >= E.rerender && !done ? (
            <AbsoluteFill style={{ background: "rgba(10,8,6,0.72)", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: MONO, color: "#fff" }}>
              <span style={{ fontSize: 20 }}>Re-rendering {Math.round(rr * 960).toLocaleString("en-US")} / 960</span>
              <div style={{ width: 380, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ width: `${rr * 100}%`, height: "100%", background: `linear-gradient(90deg, ${K.accent}, ${G.pink})` }} />
              </div>
            </AbsoluteFill>
          ) : null}
        </div>
        <div style={{ position: "absolute", left: 1000, top: 110, width: 720, fontFamily: UI, fontSize: 17, lineHeight: 1.5, color: K.ink }}>
          <div style={{ marginLeft: 120, background: "#EFEBE5", borderRadius: 16, padding: "12px 16px" }}>{PROMPT}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 6px", color: K.muted, fontSize: 15 }}>
            <ClaudeMark size={18} color={K.accent} /> Worked for 3m 48s
          </div>
          <div>Here&apos;s your launch film for Pine Pro: 13 shots, cut to a 120 BPM track.</div>
          {sent ? (
            <div style={{ opacity: ramp(s, [E.send, E.send + 0.25]) }}>
              <div style={{ marginLeft: 260, marginTop: 18, background: "#EFEBE5", borderRadius: 16, padding: "12px 16px" }}>{EDIT}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                <ClaudeMark size={18} color={K.accent} />
                {!done ? (
                  <Shimmer t={s * 30} base="#9B958F" hi="#E8E2DB">
                    {s < E.rerender ? `Designing sound: ${placed} of ${FILM_SFX.length} effects placed…` : "Re-rendering…"}
                  </Shimmer>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="check" size={16} color="#1DB38A" stroke={2.6} /> Added {FILM_SFX.length} sound effects, each on its exact frame.
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div style={{ position: "absolute", left: 1000, top: 880, width: 720, height: 64, borderRadius: 20, border: `1px solid ${K.line}`, background: "#fff", display: "flex", alignItems: "center", padding: "0 10px 0 20px", fontFamily: UI, fontSize: 17, color: !sent && chars ? K.ink : "#A8A39D" }}>
          <span style={{ flex: 1 }}>{!sent && chars ? EDIT.slice(0, chars) : "Reply to Claude…"}</span>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: !sent && chars === EDIT.length ? K.accent : "#E9D5CB", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - cur.press * 0.1})` }}>
            <Icon name="arrowUp" size={20} color="#fff" stroke={2.4} />
          </div>
        </div>
        {/* sound-design timeline */}
        <div style={{ position: "absolute", left: 200, top: 560, width: 1520, height: 300, borderRadius: 18, background: K.code, boxShadow: "0 24px 70px rgba(40,25,10,0.2)", opacity: panelIn, transform: `translateY(${(1 - panelIn) * 40}px)`, fontFamily: MONO, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px 0", fontSize: 14, color: "#9C968E" }}>
            <span>pine-pro · timeline</span>
            <span style={{ color: placed ? G.lime : "#9C968E" }}>
              {placed} / {FILM_SFX.length} sound effects
            </span>
          </div>
          {["VIDEO", "MUSIC", "SFX"].map((row, r) => (
            <div key={row} style={{ position: "absolute", left: 24, top: [66, 138, 222][r], fontSize: 13, color: "#6B6760" }}>
              {row}
            </div>
          ))}
          <div style={{ position: "absolute", left: 100, top: 44, width: 1390, height: 64, display: "flex", gap: 4 }}>
            {FILM_SHOTS.slice(0, -1).map((a, i) => {
              const w = ((FILM_SHOTS[i + 1] - a) / FILM_LEN) * 1390 - 4;
              return (
                <div key={i} style={{ width: w, height: 64, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                  <FilmBox w={w} h={64} t={a + 0.9} />
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 100, top: 122, width: 1390, height: 50, borderRadius: 6, background: "rgba(93,179,58,0.14)", display: "flex", alignItems: "center", gap: 2, padding: "0 6px", overflow: "hidden" }}>
            {Array.from({ length: 300 }, (_, i) => (
              <div key={i} style={{ width: 2.6, flexShrink: 0, borderRadius: 2, background: G.rind, height: 4 + 30 * Math.abs(Math.sin(i * 0.31)) * (0.4 + 0.6 * random(`mw${i}`)) }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 100, top: 190, width: 1390, height: 90, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
          {FILM_SFX.map(([ft, kind], i) => {
            const at = E.markers + i * MSTEP;
            if (s < at) return null;
            const p = springAt(s, at, { damping: 10, stiffness: 260, mass: 0.5 });
            const [label, c] = KIND[kind];
            const lane = i % 3;
            return (
              <div key={i} style={{ position: "absolute", left: 100 + (ft / FILM_LEN) * 1390, top: 196 + lane * 26 - (1 - p) * 60, transform: `translateX(-4px) scale(${0.6 + 0.4 * p})`, transformOrigin: "0 50%", opacity: Math.min(1, p * 2), display: "flex", alignItems: "center", gap: 5, padding: "2px 8px 2px 4px", borderRadius: 10, background: `${c}33`, border: `1px solid ${c}`, fontSize: 11, color: "#fff", whiteSpace: "nowrap" }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: c }} />
                {label}
              </div>
            );
          })}
        </div>
        {s < E.send + 0.5 ? <Cursor {...cur} size={30} tag="You" /> : null}
      </Cam>
      {expand > 0 ? (
        <div style={{ position: "absolute", left: interpolate(expand, [0, 1], [PLAYER.x, 0]), top: interpolate(expand, [0, 1], [PLAYER.y, 0]), width: interpolate(expand, [0, 1], [PLAYER.w, 1920]), height: interpolate(expand, [0, 1], [PLAYER.h, 1080]), borderRadius: 16 * (1 - expand), overflow: "hidden", background: "#000" }}>
          <FilmBox w={interpolate(expand, [0, 1], [PLAYER.w, 1920])} h={interpolate(expand, [0, 1], [PLAYER.h, 1080])} t={0} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- premiere: the Pine Pro title card on the film's starfield while the voice says "Now watch the magic made by
// Claude… a brand new feature launch for Pine Pro." Set like an OpenAI/ChatGPT launch card: small grey "Introducing",
// the name large in regular-weight Inter, a quiet sentence-case subtitle, soft blur-up fades. Logo + label on "magic",
// the name on "brand", the subtitle on "feature"; it fades out just before the film starts on the same starfield. ----------
const FadeUp: React.FC<{ p: number; blur?: number; lift?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ p, blur = 10, lift = 18, style, children }) => (
  <div style={{ opacity: p, transform: `translateY(${(1 - p) * lift}px)`, filter: p < 0.99 ? `blur(${(1 - p) * blur}px)` : undefined, ...style }}>{children}</div>
);
export const Premiere: React.FC<{ s: number }> = ({ s }) => {
  const magic = wordAt("magic", 33);
  const brand = wordAt("brand", 33);
  const feature = wordAt("feature", 33);
  const intro = ramp(s, [magic - 0.1, magic + 0.6], [0, 1], ease.out);
  const name = ramp(s, [brand - 0.1, brand + 0.7], [0, 1], ease.out);
  const sub = ramp(s, [feature, feature + 0.6], [0, 1], ease.out);
  const fade = ramp(s, [E.expand + 0.5, E.expand + 0.9]) * (1 - ramp(s, [E.full - 0.35, E.full], [0, 1], ease.in));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 34% at 50% 50%, rgba(255,255,255,${0.05 * intro}), transparent 72%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: "Inter, sans-serif", transform: `scale(${1 + 0.04 * ramp(s, [E.expand, E.full])})` }}>
        <FadeUp p={intro} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <PineMark size={34} />
          <span style={{ fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.01em" }}>Introducing</span>
        </FadeUp>
        <FadeUp p={name} blur={16} lift={24} style={{ marginTop: 26, fontSize: 168, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.045em", color: "#fff" }}>
          Pine Pro
        </FadeUp>
        <FadeUp p={sub} style={{ marginTop: 30, fontSize: 36, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.62)" }}>
          Feature launch
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 1:09.0 punch ----------
export const Punch: React.FC<{ s: number }> = ({ s }) => {
  const so = wordAt("so", 68.5);
  const are = wordAt("are", 68.5);
  const cooked = wordAt("cooked", 68.5);
  const hit = springAt(s, cooked, { damping: 9, stiffness: 240, mass: 0.6 });
  const shake = s >= cooked && s < cooked + 0.25 ? Math.sin(s * 80) * 14 * (1 - (s - cooked) / 0.25) : 0;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: GTIGHT, fontWeight: 600, fontSize: 84, letterSpacing: "-0.03em", color: K.ink, opacity: ramp(s, [so, so + 0.2]), display: "flex", gap: 26 }}>
        <span>So…</span>
        <span style={{ opacity: ramp(s, [are, are + 0.2]) }}>are motion designers</span>
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 330, lineHeight: 1, textTransform: "uppercase", color: ACCENT, marginTop: 10, opacity: Math.min(1, hit * 2), transform: `translate(${shake}px, ${shake * 0.4}px) scale(${1.5 - 0.5 * hit})`, filter: hit < 0.95 ? `blur(${(1 - hit) * 10}px)` : undefined }}>
        Cooked?
      </div>
    </AbsoluteFill>
  );
};

