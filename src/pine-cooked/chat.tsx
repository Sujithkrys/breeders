// Claude Code chat UI for "Motion designers are cooked" (Pine Pro edition). All timings are absolute timeline seconds.
import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { Cam, Shimmer } from "../pine-launch/kit";
import { ease, ramp } from "../utils";
import { cursorAt, Cursor, track } from "../sarvam-live/kit";
import { FILM_LEN, FilmBox, G, Mark, toNew } from "./film";

export const K = {
  bg: "#FAF9F7",
  panel: "#FFFFFF",
  ink: "#1F1E1D",
  muted: "#8A857F",
  line: "#E8E4DE",
  accent: "#D97757",
  code: "#1E1D1B",
};
export const UI = "Inter, sans-serif";
export const HEADING = "'Inter Tight', Inter, sans-serif"; // no serif fonts anywhere in Breeders videos
export const MONO = "'Geist Mono', monospace";

export const PROMPT = "Make a launch film for Pine Pro, our AI that turns ideas into motion. Cinematic, premium, kinetic type. Make it feel expensive.";
export const T = {
  appear: 4.4,
  drop: 6.0,
  typeFrom: 6.8,
  typeTo: 9.9,
  send: 10.2,
  think: 10.6,
  steps: [11.0, 11.8, 12.6, 13.4, 14.2, 15.0],
  render: 16.0,
  rendered: 18.3,
  play: 18.8,
  expand: 19.0,
  full: 19.6,
};
const STEPS: [Parameters<typeof Icon>[0]["name"], string, string][] = [
  ["palette", G.pink, "Reading the Pine brand kit"],
  ["film", "#1C1C1E", "Studying the reference film"],
  ["layers", "#7A5CFF", "Writing the storyboard"],
  ["grid", "#2F7BFF", "Designing 13 scenes"],
  ["wave", "#1DB38A", "Timing every cut to the music"],
  ["pen", K.accent, "Writing 2,694 lines of code"],
];
const FILES = ["PineLaunch.tsx", "scenes/Open.tsx", "scenes/Prompt.tsx", "scenes/EmberFilm.tsx", "scenes/Refine.tsx", "scenes/Montage.tsx", "theme.ts", "soundtrack.mjs"];

type Tok = [string, string];
const C = { kw: "#C792EA", fn: "#82AAFF", str: "#C3E88D", num: "#F78C6C", tag: "#FF5370", attr: "#FFCB6B", tx: "#D6D2CC", cm: "#6B6760" };
export const CODE: Tok[][] = [
  [[C.cm, "// Pine Pro — launch film, 13 shots @ 60fps"]],
  [[C.kw, "export const "], [C.fn, "PineLaunch"], [C.tx, " = () => ("]],
  [[C.tx, "  <"], [C.tag, "AbsoluteFill"], [C.attr, " style"], [C.tx, "={{ background: "], [C.str, '"#04080E"'], [C.tx, " }}>"]],
  [[C.tx, "    <"], [C.tag, "Open"], [C.attr, " title"], [C.tx, "="], [C.str, '"Motion design with Pineapple"'], [C.tx, " />"]],
  [[C.tx, "    <"], [C.tag, "Blocks"], [C.attr, " words"], [C.tx, "={["], [C.str, '"you"'], [C.tx, ", "], [C.str, '"can"'], [C.tx, ", "], [C.str, '"just"'], [C.tx, "]} />"]],
  [[C.tx, "    <"], [C.tag, "Prompt"], [C.attr, " voice"], [C.tx, " text={PROMPT} />"]],
  [[C.tx, "    <"], [C.tag, "EmberFilm"], [C.attr, " cuts"], [C.tx, "={CUTS} bpm={BPM} />"]],
  [[C.tx, "    <"], [C.tag, "Refine"], [C.attr, " ask"], [C.tx, "="], [C.str, '"Make the title hit harder"'], [C.tx, " />"]],
  [[C.tx, "  </"], [C.tag, "AbsoluteFill"], [C.tx, ">"]],
  [[C.tx, ");"]],
  [[C.tx, ""]],
  [[C.kw, "const "], [C.tx, "BPM = "], [C.num, "120"], [C.tx, "; "], [C.cm, "// every cut on the beat"]],
  [[C.kw, "const "], [C.tx, "CUTS = ["], [C.num, "0, 15, 30, 75, 120, 165"], [C.tx, "];"]],
  [[C.kw, "const "], [C.tx, "ease = "], [C.fn, "bezier"], [C.tx, "("], [C.num, "0.16, 1, 0.3, 1"], [C.tx, ");"]],
  [[C.tx, ""]],
  [[C.kw, "export const "], [C.fn, "Logo"], [C.tx, " = ({ t }) => {"]],
  [[C.kw, "  const "], [C.tx, "build = "], [C.fn, "spring"], [C.tx, "({ frame: t, damping: "], [C.num, "11"], [C.tx, " });"]],
  [[C.kw, "  return "], [C.tx, "<"], [C.tag, "PineMark"], [C.attr, " size"], [C.tx, "={"], [C.num, "220"], [C.tx, "} build={build} />;"]],
  [[C.tx, "};"]],
];

const Chip: React.FC<{ icon: React.ReactNode; name: string; sub: string; p: number }> = ({ icon, name, sub, p }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px 8px 8px", borderRadius: 14, border: `1px solid ${K.line}`, background: "#fff", opacity: p, transform: `scale(${0.8 + 0.2 * p}) translateY(${(1 - p) * 10}px)` }}>
    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#F2EFEA" }}>{icon}</div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: K.ink }}>{name}</div>
      <div style={{ fontSize: 13, color: K.muted }}>{sub}</div>
    </div>
  </div>
);
const Swatches = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: 48, height: 48 }}>
    {[G.lime, G.pink, "#04080E", G.rind].map((c) => (
      <div key={c} style={{ background: c }} />
    ))}
  </div>
);
const RefThumb = () => (
  <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#0B1020,#2A1631)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>▶</div>
);
const ATTACH: [React.ReactNode, string, string][] = [
  [<Mark key="m" size={40} />, "pine-logo.svg", "SVG · 6 KB"],
  [<Swatches key="s" />, "brand-colors.png", "PNG · 120 KB"],
  [<RefThumb key="r" />, "reference.mp4", "Video · 0:32"],
];

// ---------- 0:05 → 0:27 one continuous take inside Claude Code ----------
export const ChatFlow: React.FC<{ s: number }> = ({ s }) => {
  const appear = ramp(s, [T.appear, T.appear + 0.5], [0, 1], ease.out);
  const sent = s >= T.send + 0.15;
  const chars = Math.floor(ramp(s, [T.typeFrom, T.typeTo], [0, PROMPT.length], (v) => v));
  const chipP = (i: number) => ramp(s, [T.drop + 0.1 + i * 0.15, T.drop + 0.35 + i * 0.15], [0, 1], ease.out);
  const toThread = ramp(s, [T.send + 0.1, T.send + 0.6], [0, 1], ease.inOut);

  // camera: wide → push on the composer while typing → wide thread → push on the render panel → back
  const cs = track(s, [[T.appear, 1.06], [T.drop, 1.06], [T.typeFrom, 1.5], [T.send, 1.5], [T.send + 0.6, 1.12], [T.render, 1.12], [T.render + 0.6, 1.28], [T.rendered + 0.1, 1.28], [T.play - 0.1, 1.12]]);
  const cfx = track(s, [[T.appear, 960], [T.drop, 960], [T.typeFrom, 900], [T.send, 900], [T.send + 0.6, 975], [T.render, 975], [T.render + 0.6, 1400], [T.rendered + 0.1, 1400], [T.play - 0.1, 1400]]);
  const cfy = track(s, [[T.appear, 540], [T.drop, 540], [T.typeFrom, 560], [T.send, 560], [T.send + 0.6, 560], [T.render, 560], [T.render + 0.6, 560], [T.rendered + 0.1, 560], [T.play - 0.1, 560]]);

  // cursor: carries the file stack in, drops it, rests, then clicks send; later clicks play on the video
  const cur = cursorAt(
    s,
    [
      [T.appear + 0.3, 1980, 300],
      [T.drop, 900, 560],
      [T.drop + 0.4, 1000, 640],
      [T.send - 0.5, 1330, 700],
      [T.send, 1336, 660],
      [T.send + 0.6, 1500, 900],
      [T.play - 0.6, 1600, 800],
      [T.play, 1400, 560],
    ],
    [T.send, T.play],
  );
  const carrying = s < T.drop;
  const shown = STEPS.filter((_, i) => s >= T.steps[i]).length;
  const codeLines = Math.floor(ramp(s, [T.steps[2] + 0.2, T.render - 0.3], [0, CODE.length], (v) => v));
  const files = Math.floor(ramp(s, [T.steps[3], T.steps[5] + 0.6], [0, FILES.length], (v) => v));
  const renderP = ramp(s, [T.render + 0.5, T.rendered], [0, 1], ease.inOut);
  const panel = s < T.render ? "code" : s < T.rendered + 0.25 ? "render" : "video";
  const expand = ramp(s, [T.expand, T.full], [0, 1], ease.inOut);

  const composer = (
    <div style={{ position: "absolute", left: 560, top: sent ? interpolate(toThread, [0, 1], [470, 930]) : 470, width: 800, opacity: sent ? interpolate(toThread, [0, 0.4, 1], [1, 0, 1]) : 1 }}>
      <div style={{ background: "#fff", borderRadius: 26, border: `1px solid ${K.line}`, boxShadow: "0 10px 34px rgba(60,40,20,0.07)", padding: "18px 20px 14px 22px", fontFamily: UI }}>
        {!sent && s >= T.drop ? (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {ATTACH.map(([ic, n, sub], i) => (
              <Chip key={n} icon={ic} name={n} sub={sub} p={chipP(i)} />
            ))}
          </div>
        ) : null}
        <div style={{ minHeight: 56, fontSize: 19, lineHeight: 1.5, color: !sent && chars ? K.ink : "#A8A39D" }}>
          {!sent && chars ? (
            <>
              {PROMPT.slice(0, chars)}
              {chars < PROMPT.length ? <span style={{ display: "inline-block", width: 2, height: 22, background: K.ink, verticalAlign: -4, marginLeft: 1 }} /> : null}
            </>
          ) : (
            "Reply to Claude…"
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
          <Icon name="plus" size={20} color={K.muted} />
          <span style={{ fontSize: 14, color: K.muted, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="book" size={15} color={K.muted} /> pine-pro
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 15, color: K.ink }}>
            Opus 5.5 <span style={{ color: K.muted }}>▾</span>
          </span>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: chars >= PROMPT.length && !sent ? K.accent : "#E9D5CB", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - cur.press * 0.1})` }}>
            <Icon name="arrowUp" size={20} color="#fff" stroke={2.4} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: appear }}>
      <Cam s={cs} fx={cfx} fy={cfy} bg={K.bg}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 64, borderBottom: `1px solid ${K.line}`, background: K.bg, display: "flex", alignItems: "center", gap: 12, padding: "0 32px", fontFamily: UI }}>
          <ClaudeMark size={24} color={K.accent} />
          <span style={{ fontSize: 18, fontWeight: 600, color: K.ink }}>Claude Code</span>
          <span style={{ fontSize: 15, color: K.muted, marginLeft: 10 }}>~/pine-pro</span>
        </div>
        {!sent ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: 1 - ramp(s, [T.send, T.send + 0.2]) }}>
            <ClaudeMark size={46} color={K.accent} />
            <span style={{ fontFamily: HEADING, fontWeight: 500, fontSize: 56, letterSpacing: "-0.035em", color: K.ink }}>What are we making today?</span>
          </div>
        ) : null}
        {sent ? (
          <>
            {/* user turn */}
            <div style={{ position: "absolute", right: 140, top: 110, width: 760, fontFamily: UI, opacity: toThread, transform: `translateY(${(1 - toThread) * 30}px)` }}>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 10 }}>
                {ATTACH.map(([ic, n, sub]) => (
                  <Chip key={n} icon={ic} name={n} sub={sub} p={1} />
                ))}
              </div>
              <div style={{ marginLeft: 80, background: "#EFEBE5", borderRadius: 18, padding: "14px 20px", fontSize: 18, lineHeight: 1.5, color: K.ink }}>{PROMPT}</div>
            </div>
            {/* Claude turn: steps */}
            <div style={{ position: "absolute", left: 140, top: 300, width: 640, fontFamily: UI }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, fontSize: 18 }}>
                <ClaudeMark size={22} color={K.accent} />
                {s < T.render ? <Shimmer t={s * 30} base="#9B958F" hi="#E8E2DB">{s < T.steps[0] ? "Thinking…" : "Working…"}</Shimmer> : <span style={{ color: K.muted }}>Worked for 3m 48s</span>}
              </div>
              {STEPS.slice(0, shown).map(([ic, bg, label], i) => {
                const p = ramp(s, [T.steps[i], T.steps[i] + 0.3], [0, 1], ease.out);
                const done = i < shown - 1 || s >= T.render;
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, height: 58, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={ic} size={20} color="#fff" stroke={2.2} />
                    </div>
                    {done ? <span style={{ fontSize: 22, color: K.ink }}>{label}</span> : <Shimmer t={s * 30 + i * 9} base="#9B958F" hi="#EFE9E2" style={{ fontSize: 22 }}>{label}</Shimmer>}
                    {done ? <Icon name="check" size={20} color="#1DB38A" stroke={2.6} /> : null}
                  </div>
                );
              })}
              {s >= T.rendered ? (
                <div style={{ marginTop: 18, fontSize: 21, lineHeight: 1.5, color: K.ink, opacity: ramp(s, [T.rendered, T.rendered + 0.3]) }}>
                  Here&apos;s your launch film for Pine Pro: 13 shots, cut to a 120 BPM track.
                </div>
              ) : null}
            </div>
            {/* right panel: code → render → video */}
            <div style={{ position: "absolute", left: 900, top: 300, width: 900, height: 560, borderRadius: 18, overflow: "hidden", background: panel === "video" ? "#000" : K.code, boxShadow: "0 24px 70px rgba(40,25,10,0.18)", opacity: ramp(s, [T.steps[1], T.steps[1] + 0.4], [0, 1], ease.out), transform: `translateY(${(1 - ramp(s, [T.steps[1], T.steps[1] + 0.4], [0, 1], ease.out)) * 30}px)` }}>
              {panel === "code" ? (
                <div style={{ display: "flex", height: "100%", fontFamily: MONO }}>
                  <div style={{ width: 230, borderRight: "1px solid #2E2C29", padding: "18px 16px", fontSize: 14, color: "#9C968E" }}>
                    <div style={{ color: "#D6D2CC", marginBottom: 12 }}>▾ src/pine-launch</div>
                    {FILES.slice(0, files).map((f, i) => (
                      <div key={f} style={{ padding: "5px 0 5px 14px", color: i === 0 ? "#fff" : "#9C968E", opacity: ramp(s, [T.steps[3] + i * 0.3, T.steps[3] + i * 0.3 + 0.2]) }}>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: "18px 22px", fontSize: 15, lineHeight: 1.75, overflow: "hidden", position: "relative" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 6, background: "#2E2C29", color: "#fff", fontSize: 13 }}>PineLaunch.tsx</span>
                      <span style={{ marginLeft: "auto", color: "#6B6760", fontSize: 13 }}>{Math.round(ramp(s, [T.steps[2], T.render], [0, 2694], (v) => v))} lines</span>
                    </div>
                    <div style={{ transform: `translateY(${-Math.max(0, codeLines - 14) * 26}px)` }}>
                      {CODE.slice(0, codeLines).map((ln, i) => (
                        <div key={i} style={{ whiteSpace: "pre", display: "flex" }}>
                          <span style={{ width: 34, color: "#56524C" }}>{i + 1}</span>
                          {ln.map(([c, x], j) => (
                            <span key={j} style={{ color: c }}>
                              {x}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                    {s >= T.steps[4] && s < T.render ? (
                      <div style={{ position: "absolute", left: 22, right: 22, bottom: 16, height: 46, borderRadius: 10, background: "#2A2826", display: "flex", alignItems: "center", gap: 3, padding: "0 12px", overflow: "hidden" }}>
                        <span style={{ fontSize: 12, color: "#9C968E", marginRight: 10 }}>soundtrack.mjs</span>
                        {Array.from({ length: Math.floor(ramp(s, [T.steps[4], T.steps[5] + 0.8], [0, 110], (v) => v)) }, (_, i) => (
                          <div key={i} style={{ width: 3, borderRadius: 2, background: "#1DB38A", height: 4 + 26 * Math.abs(Math.sin(i * 0.9)) * (0.4 + 0.6 * random(`sw${i}`)) }} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {panel === "render" ? (
                <div style={{ padding: "34px 40px", fontFamily: MONO, color: "#D6D2CC" }}>
                  <div style={{ fontSize: 18 }}>
                    <span style={{ color: "#1DB38A" }}>$</span> npx remotion render PineLaunch out/pine-pro.mp4
                  </div>
                  <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", fontSize: 17 }}>
                    <span>{renderP < 1 ? "Rendering frames" : "✓ Rendered"}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(renderP * 2700).toLocaleString("en-US")} / 2,700</span>
                  </div>
                  <div style={{ marginTop: 12, height: 12, borderRadius: 6, background: "#2E2C29", overflow: "hidden" }}>
                    <div style={{ width: `${renderP * 100}%`, height: "100%", background: `linear-gradient(90deg, ${K.accent}, ${G.pink})` }} />
                  </div>
                  <div style={{ marginTop: 34, display: "flex", gap: 10 }}>
                    {Array.from({ length: 6 }, (_, i) => {
                      const on = renderP > (i + 0.5) / 6;
                      return (
                        <div key={i} style={{ width: 128, height: 72, borderRadius: 8, overflow: "hidden", background: "#2A2826", opacity: on ? 1 : 0.25, transform: `scale(${on ? 1 : 0.94})` }}>
                          {on ? <FilmBox w={128} h={72} t={toNew([3.2, 7.1, 25.1, 27.9, 39.1, 42.5][i])} /> : null}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 30, display: "flex", gap: 12, fontSize: 14, color: "#9C968E" }}>
                    <span style={{ padding: "5px 12px", borderRadius: 8, background: "#2A2826" }}>1920×1080</span>
                    <span style={{ padding: "5px 12px", borderRadius: 8, background: "#2A2826" }}>60 fps</span>
                    <span style={{ padding: "5px 12px", borderRadius: 8, background: "#2A2826" }}>h264</span>
                  </div>
                </div>
              ) : null}
              {panel === "video" && expand <= 0 ? (
                <>
                  <FilmBox w={900} h={560} t={toNew(3.4)} />
                  <div style={{ position: "absolute", left: 450 - 44, top: 280 - 44, width: 88, height: 88, borderRadius: 44, background: "rgba(255,255,255,0.94)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - cur.press * 0.1})` }}>
                    <Icon name="play" size={34} color={K.ink} />
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}
        {composer}
        {carrying && s > T.appear ? (
          <div style={{ position: "absolute", left: cur.x + 18, top: cur.y + 14 }}>
            {ATTACH.map(([ic, n], i) => (
              <div key={n} style={{ position: "absolute", left: i * 14, top: i * 10, transform: `rotate(${(i - 1) * 7}deg)`, width: 190, height: 64, borderRadius: 14, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 10, padding: 8, boxSizing: "border-box", fontFamily: UI, fontSize: 14, fontWeight: 600, color: K.ink }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#F2EFEA", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</div>
                {n}
              </div>
            ))}
          </div>
        ) : null}
        {s < T.expand ? <Cursor {...cur} size={30} tag="You" opacity={ramp(s, [T.appear + 0.3, T.appear + 0.5])} /> : null}
      </Cam>
      {expand > 0 ? <ExpandingFilm s={s} expand={expand} cs={cs} cfx={cfx} cfy={cfy} /> : null}
    </AbsoluteFill>
  );
};

// The video panel grows from its place in the (zoomed) chat to full frame, already playing.
const ExpandingFilm: React.FC<{ s: number; expand: number; cs: number; cfx: number; cfy: number }> = ({ s, expand, cs, cfx, cfy }) => {
  const x0 = 960 + (900 - cfx) * cs;
  const y0 = 540 + (300 - cfy) * cs;
  const w0 = 900 * cs;
  const h0 = 560 * cs;
  const w = interpolate(expand, [0, 1], [w0, 1920]);
  const h = interpolate(expand, [0, 1], [h0, 1080]);
  const filmT = Math.min(FILM_LEN - 0.01, Math.max(0, s - T.expand + 0.2));
  return (
    <div style={{ position: "absolute", left: interpolate(expand, [0, 1], [x0, 0]), top: interpolate(expand, [0, 1], [y0, 0]), width: w, height: h, borderRadius: 18 * (1 - expand), overflow: "hidden", background: "#000" }}>
      <FilmBox w={w} h={h} t={filmT} />
    </div>
  );
};
