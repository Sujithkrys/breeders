import React, { useId } from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { ClaudeMark, CluesoMark, CluesoWordmark, OpenAIMark } from "../brand/Logos";
import { cluesoWord } from "../brand/paths";
import { Icon } from "../clueso-mcp/icons";
import { AcmeTitleCard, APP_W, AppShot } from "../clueso-mcp/mock/AppShot";
import { CluesoEditor, ED_W } from "../clueso-mcp/mock/CluesoEditor";
import { AICursor, AppIcon, Cam, Composer, Cut, path, Pointer, press, Shimmer, Space, Sparkle, Words } from "../pine-launch/kit";
import { GRAY, INK, LINE, SANS, TIGHT } from "../pine-launch/theme";
import { ease, kf, pop, ramp } from "../utils";
import { CAPTIONS, Caption, CluesoFilm } from "./CluesoFilm";
import { GRAD, MAG, PINK, SHOT, TINT } from "./theme";

// Scaled snapshot of a fixed-size mock (AppShot 1280 wide, editor 1600 wide).
const Mini: React.FC<{ w: number; base: number; children: React.ReactNode }> = ({ w, base, children }) => (
  <div style={{ transform: `scale(${w / base})`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 }}>{children}</div>
);
const Tile: React.FC<{ children: React.ReactNode; bg?: string; size?: number }> = ({ children, bg = "#1C1B22", size = 52 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(0,0,0,0.35)" }}>{children}</div>
);
const GradIcon: React.FC<{ name: Parameters<typeof AppIcon>[0]["name"]; size?: number }> = ({ name, size = 42 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)", flexShrink: 0 }}>
    <Icon name={name} size={size * 0.52} color="#fff" stroke={2.2} />
  </div>
);

// Help-center article Clueso drafts alongside the video.
const Doc: React.FC<{ w: number; h: number; t?: number }> = ({ w, h, t = 99 }) => {
  const k = w / 1500;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, padding: `${70 * k}px ${110 * k}px`, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ fontSize: 15 * k * 1.3, color: GRAY, marginBottom: 10 * k }}>Help Center › Reports</div>
      <div style={{ fontSize: 46 * k * 1.3, fontWeight: 700, color: INK, letterSpacing: "-0.03em" }}>How to bulk export reports</div>
      <div style={{ display: "flex", gap: 40 * k, marginTop: 34 * k }}>
        <div style={{ flex: 1 }}>
          {["Open Reports and tick the reports you need.", "Or select them all in one click.", "Hit Export and pick CSV, XLSX or PDF.", "Your download starts right away."].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14 * k, alignItems: "center", marginBottom: 22 * k, opacity: ramp(t, [2 + i * 4, 6 + i * 4]) }}>
              <div style={{ width: 34 * k, height: 34 * k, borderRadius: 17 * k, background: GRAD, color: "#fff", fontSize: 17 * k, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 22 * k * 1.2, color: INK }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ width: 560 * k, height: 315 * k, borderRadius: 14 * k, overflow: "hidden", position: "relative", border: `1px solid ${LINE}`, flexShrink: 0 }}>
          <Mini w={560 * k} base={APP_W}>
            <AppShot selected={3} />
          </Mini>
        </div>
      </div>
    </div>
  );
};

// ---------- 0:00 cold open ----------
export const Open = () => (
  <Cut span={SHOT.open} name="0:00 Open" render={(t) => (
    <AbsoluteFill>
      <Space t0={SHOT.open[0]} tone="clueso" />
      {t < 50 ? <Words text="Every feature needs a video" t={t} at={10} step={5} /> : t >= 54 ? <Words text="introducing Clueso MCP" t={t} at={56} step={5} dissolveFrom={1} /> : null}
    </AbsoluteFill>
  )} />
);

// ---------- 0:04 "you can just" ----------
const BLOCKS = [
  { x: 148, y: 340, w: 844, h: 900, c: "#DCDADF", at: 0 },
  { x: 728, y: -20, w: 632, h: 940, c: "#F4E1EF", at: 3 },
  { x: 728, y: 340, w: 264, h: 580, c: "#FBEEF7", at: 3 },
  { x: 1068, y: -20, w: 528, h: 620, c: "#E6DBF6", at: 7 },
  { x: 1360, y: -20, w: 236, h: 620, c: "#D5C2EC", at: 7 },
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
        <Space t0={SHOT.blocks[0]} tone="clueso" />
        {BLOCKS.map((b, i) => (gone(i) ? null : <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, background: b.c, clipPath: `inset(${(1 - ramp(t, [b.at, b.at + 6], [0, 1], ease.out)) * 100}% 0 0 0)` }} />))}
        {BIG.map(([w, x, y, at], i) =>
          gone(i) ? null : (
            <div key={w} style={{ position: "absolute", left: x, top: y, fontFamily: TIGHT, fontWeight: 700, fontSize: 300, lineHeight: 1, letterSpacing: "-0.045em", color: INK, opacity: ramp(t, [at, at + 2]), transform: `scale(${ramp(t, [at, at + 6], [1.06, 1])})`, transformOrigin: "0 60%" }}>
              {w}
            </div>
          ),
        )}
        {t < 44 && (
          <div style={{ position: "absolute", left: 330, top: 150, width: 560, height: 84, borderRadius: 16, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", boxSizing: "border-box", fontFamily: SANS, opacity: ramp(t, [12, 16]), transform: `translateY(${ramp(t, [12, 20], [16, 0])}px)` }}>
            <GradIcon name="film" size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: INK }}>Bulk_export_launch.mp4</div>
              <div style={{ fontSize: 15, color: GRAY }}>Video · 0:48 · 1080p</div>
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
              <span style={{ flex: 1 }}>Add captions in Spanish</span>
              <Icon name="mic" size={18} color={GRAY} />
              <div style={{ width: 36, height: 36, borderRadius: 18, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="arrowUp" size={18} color="#fff" stroke={2.4} />
              </div>
            </div>
          </div>
        )}
        <AICursor x={cur.x} y={cur.y} opacity={ramp(t, [12, 16])} tint={TINT} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:05.7 "ask your agent for the video" ----------
type Kind = "title" | "app" | "doc" | "caption" | "editor";
type Floater = { kind: Kind; x: number; y: number; w: number; h: number; dx: number; dy: number; at: number };
const FLOATERS: Floater[] = [
  { kind: "title", x: 1300, y: -60, w: 640, h: 360, dx: 0, dy: -1, at: 6 },
  { kind: "caption", x: -80, y: 720, w: 560, h: 315, dx: -1, dy: 0, at: 9 },
  { kind: "doc", x: 1500, y: 720, w: 480, h: 300, dx: 1, dy: 1, at: 8 },
  { kind: "app", x: 30, y: 60, w: 400, h: 225, dx: -1, dy: 0, at: 12 },
  { kind: "editor", x: 1580, y: 360, w: 400, h: 225, dx: 1, dy: 0, at: 14 },
  { kind: "title", x: 700, y: 880, w: 520, h: 292, dx: 0, dy: 1, at: 11 },
  { kind: "doc", x: 470, y: -110, w: 360, h: 225, dx: 0, dy: -1, at: 16 },
];
const Output: React.FC<{ kind: Kind; w: number; h: number }> = ({ kind, w, h }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", overflow: "hidden" }}>
    {kind === "title" && (
      <Mini w={w} base={APP_W}>
        <AcmeTitleCard />
      </Mini>
    )}
    {kind === "app" && (
      <Mini w={w} base={APP_W}>
        <AppShot selected={3} />
      </Mini>
    )}
    {kind === "caption" && (
      <>
        <Mini w={w} base={APP_W}>
          <AppShot selected={2} />
        </Mini>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: h * 0.07, display: "flex", justifyContent: "center", transform: `scale(${w / 1400})`, transformOrigin: "50% 100%" }}>
          <Caption text={CAPTIONS.EN} progress={0.45} />
        </div>
      </>
    )}
    {kind === "doc" && <Doc w={w} h={h} />}
    {kind === "editor" && (
      <Mini w={w} base={ED_W}>
        <CluesoEditor clips={1} zooms={1} captions={1} voice={1} music={1} brand={1} playhead={0.4} app={{ selected: 3 }} />
      </Mini>
    )}
  </div>
);
const ICONS: [React.ReactNode, number, number, number][] = [
  [<ClaudeMark key="c" size={28} color="#F4F4F6" />, 560, 260, 10],
  [<OpenAIMark key="o" size={28} color="#F4F4F6" />, 1360, 320, 13],
  [<Icon key="cap" name="captions" size={26} color="#fff" />, 1250, 690, 15],
  [<Icon key="lang" name="languages" size={26} color="#fff" />, 380, 640, 17],
  [<CluesoMark key="m" size={28} />, 1560, 240, 19],
];
const FloatField: React.FC<{ t: number; out?: number }> = ({ t, out = 0 }) => (
  <>
    {FLOATERS.map((f, i) => {
      const p = ramp(t, [f.at, f.at + 12], [0, 1], ease.out);
      const drift = t * 0.35 + out * 500;
      return (
        <div key={i} style={{ position: "absolute", left: f.x + f.dx * ((1 - p) * 140 + drift), top: f.y + f.dy * ((1 - p) * 140 + drift), width: f.w, height: f.h, borderRadius: 12, overflow: "hidden", opacity: p * (1 - out), boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Output kind={f.kind} w={f.w} h={f.h} />
        </div>
      );
    })}
    {ICONS.map(([node, x, y, at], i) => (
      <div key={i} style={{ position: "absolute", left: x + Math.sin(t / 20 + i) * 6, top: y + Math.cos(t / 24 + i) * 6, transform: `scale(${pop(t, at)})`, opacity: 1 - out }}>
        <Tile bg={i === 2 || i === 3 ? GRAD : "#1C1B22"}>{node}</Tile>
      </div>
    ))}
  </>
);
export const Great = () => (
  <Cut span={SHOT.great} name="0:05 Ask your agent" render={(t) => {
    const cur = path(t, [0, 30, 60, 83], [700, 560, 900, 960], [600, 590, 930, 950]);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.great[0]} tone="clueso" />
        <AbsoluteFill style={{ transform: `scale(${kf(t, [0, 83], [1, 1.04], ease.linear)})` }}>
          <FloatField t={t} />
          <div style={{ position: "absolute", left: 700, top: 880, width: 520, height: 292, borderRadius: 12, boxShadow: `0 0 0 3px rgba(248,129,229,${ramp(t, [58, 64]) * 0.9})`, opacity: t > 58 ? 1 : 0 }} />
        </AbsoluteFill>
        <Words text="ask your AI agent for the video" t={t} at={4} step={5} />
        <AICursor x={cur.x} y={cur.y} tint={TINT} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:08.5 connect ----------
export const Connect = () => (
  <Cut span={SHOT.connect} name="0:08 Connect Clueso" render={(t) => {
    const on = ramp(t, [14, 22], [0, 1], ease.inOut);
    const cur = path(t, [0, 12], [1420, 1180], [800, 562]);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.connect[0]} tone="clueso" />
        <div style={{ position: "absolute", left: 960 - 380, top: 540 - 68, width: 760, height: 136, borderRadius: 68, background: "#fff", boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 ${on * 50}px rgba(248,129,229,${on * 0.35})`, display: "flex", alignItems: "center", padding: "0 34px 0 40px", boxSizing: "border-box", gap: 24, fontFamily: SANS }}>
          <CluesoMark size={62} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 44, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>Clueso MCP</div>
            <div style={{ fontSize: 20, color: on > 0.5 ? "#12A150" : GRAY }}>{on > 0.5 ? "Connected · 5 tools" : "Not connected"}</div>
          </div>
          <div style={{ width: 128, height: 70, borderRadius: 35, background: on > 0 ? `linear-gradient(225deg, rgba(248,129,229,${on}) 0%, rgba(201,59,183,${on}) 100%), #E4E4E7` : "#E4E4E7", position: "relative" }}>
            <div style={{ position: "absolute", top: 6, left: 6 + on * 58, width: 58, height: 58, borderRadius: 29, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
        <Sparkle t={t} at={16} x={960} y={540} w={800} h={170} dur={30} n={90} />
        <Pointer x={cur.x + (t > 14 ? on * 30 : 0)} y={cur.y} size={40} light press={press(t, 14)} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:10 voice prompt ----------
export const PROMPT = "Turn this recording into a launch video for bulk export, with voiceover, captions and our brand kit.";
const MIC = { x: 1273, y: 593 };
const SEND = { x: 1327, y: 593 };
const Attachment = () => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: 6, paddingRight: 16, marginBottom: 12, borderRadius: 14, border: `1px solid ${LINE}`, fontSize: 15 }}>
    <div style={{ width: 64, height: 36, borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <Mini w={64} base={APP_W}>
        <AppShot selected={1} />
      </Mini>
    </div>
    <div>
      <div style={{ fontWeight: 600, color: INK }}>export-reports.mov</div>
      <div style={{ color: GRAY, fontSize: 13 }}>Screen recording · 0:42</div>
    </div>
  </div>
);
const ConnectorChip = () => (
  <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 15, color: INK, padding: "6px 12px", borderRadius: 16, background: "#F5F5F5" }}>
    <CluesoMark size={16} /> Clueso
    <span style={{ width: 7, height: 7, borderRadius: 4, background: "#12A150" }} />
  </span>
);
const TrayNode = () => (
  <>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="plug" size={16} color="#6B6B6B" /> Clueso MCP
    </span>
    <span>5 tools · create_video, edit_video, add_captions…</span>
  </>
);
export const Voice = () => (
  <Cut span={SHOT.voice} name="0:10 Voice prompt" render={(t) => {
    const rec = t >= 11 && t < 110 ? { elapsed: t - 11 } : null;
    const words = PROMPT.split(" ");
    const n = t < 112 ? 0 : Math.min(words.length, Math.floor((t - 112) * 0.75) + 1);
    const s = kf(t, [0, 110, 124, 136, 154], [2.9, 2.7, 2.2, 2.2, 1.25], ease.inOut);
    const fx = kf(t, [0, 11, 110, 124, 136, 154], [1190, 1190, 1020, 820, 900, 960], ease.inOut);
    const fy = kf(t, [0, 110, 124, 136, 154], [577, 577, 530, 540, 560], ease.inOut);
    const cur = path(t, [0, 8, 100, 107, 140, 158], [1380, MIC.x, MIC.x + 30, MIC.x, MIC.x + 60, SEND.x], [650, MIC.y, MIC.y + 30, MIC.y, MIC.y + 70, SEND.y]);
    return (
      <AbsoluteFill style={{ opacity: ramp(t, [170, 180], [1, 0], ease.in) }}>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 550, top: 440 }}>
            <Composer text={n ? words.slice(0, n).join(" ") : undefined} placeholder=" " rec={rec} sendPress={press(t, 160)} model={!rec} micHover={ramp(t, [4, 8])} attach={<Attachment />} modelNode={<ConnectorChip />} trayNode={<TrayNode />} />
          </div>
          <Pointer x={cur.x} y={cur.y} size={22} press={press(t, 9) + press(t, 109) + press(t, 160)} />
        </Cam>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:16 agent steps ----------
const STEPS: [Parameters<typeof AppIcon>[0]["name"], string][] = [
  ["film", "Cutting the recording into scenes"],
  ["type", "Writing the voiceover script"],
  ["mic", "Generating the AI voiceover"],
  ["captions", "Adding captions and auto-zooms"],
  ["palette", "Applying the Acme brand kit"],
];
const STEP_AT = [0, 14, 28, 42, 56];
export const Steps = () => (
  <Cut span={SHOT.steps} name="0:16 Working" render={(t) => {
    const shown = STEP_AT.filter((a) => t >= a).length;
    const lift = STEP_AT.reduce((acc, a) => acc + ramp(t, [a, a + 8], [0, 1], ease.out), 0);
    const exit = ramp(t, [94, 104], [0, 1], ease.in);
    return (
      <AbsoluteFill style={{ background: "#fff" }}>
        <div style={{ position: "absolute", left: 600, top: 540 - lift * 34, transform: `translateX(${-exit * 1500}px) scale(${kf(t, [0, 94], [1.12, 1.18], ease.linear)})`, transformOrigin: "0 50%" }}>
          {STEPS.slice(0, shown).map(([ic, label], i) => {
            const p = ramp(t, [STEP_AT[i], STEP_AT[i] + 8], [0, 1], ease.out);
            return (
              <div key={label} style={{ position: "absolute", left: 0, top: i * 68 - (1 - p) * 68, display: "flex", alignItems: "center", gap: 22, opacity: i === 0 ? p : ramp(t, [STEP_AT[i] + 2, STEP_AT[i] + 7]), whiteSpace: "nowrap" }}>
                <GradIcon name={ic} />
                <Shimmer t={t + i * 9} style={{ fontFamily: SANS, fontSize: 36, letterSpacing: "-0.01em" }}>
                  {label}
                </Shimmer>
              </div>
            );
          })}
        </div>
        {t > 100 && (
          <div style={{ position: "absolute", left: 600, top: 520, fontFamily: SANS, fontSize: 22, opacity: ramp(t, [100, 104]) }}>
            <Shimmer t={t} period={24}>Working with Clueso</Shimmer>
          </div>
        )}
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:20 answer + video card ----------
export const ANSWER = "Your bulk export launch video is ready: 48 seconds, with AI voiceover, captions and your brand kit. I also drafted the help-center article.";
const THUMB = { x: 560, y: 600, w: 560, h: 315 };
export const Answer = () => (
  <Cut span={SHOT.answer} name="0:20 Answer" render={(t) => {
    const words = ANSWER.split(" ");
    const n = Math.min(words.length, Math.max(0, Math.floor((t - 3) * 1.3)));
    const s = kf(t, [0, 22, 38], [1.3, 1.3, 1], ease.inOut);
    const fx = kf(t, [0, 22, 38], [900, 900, 960], ease.inOut);
    const fy = kf(t, [0, 22, 38], [420, 430, 580], ease.inOut);
    const cur = path(t, [36, 52], [1300, THUMB.x + THUMB.w / 2 + 6], [1000, THUMB.y + THUMB.h / 2 + 8]);
    const g = ramp(t, [58, 84], [0, 1], ease.inOut);
    const cardIn = ramp(t, [26, 36], [0, 1], ease.out);
    return (
      <AbsoluteFill>
        <Cam s={s} fx={fx} fy={fy}>
          <div style={{ position: "absolute", left: 560, top: 330, width: 820, fontFamily: SANS }}>
            <div style={{ fontSize: 19, color: GRAY, marginBottom: 16 }}>Worked for 1m 12s</div>
            <div style={{ fontSize: 30, lineHeight: 1.45, color: INK, letterSpacing: "-0.01em" }}>{words.slice(0, n).join(" ")}</div>
          </div>
          <div style={{ position: "absolute", left: THUMB.x, top: THUMB.y, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 20}px)`, display: "flex", gap: 20 }}>
            <div>
              <div style={{ width: THUMB.w, height: THUMB.h, borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Mini w={THUMB.w} base={1920}>
                  <CluesoFilm t={26} />
                </Mini>
                <div style={{ position: "absolute", left: THUMB.w / 2 - 34, top: THUMB.h / 2 - 34, width: 68, height: 68, borderRadius: 34, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press(t, 56) * 0.1})` }}>
                  <Icon name="play" size={28} color={INK} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontFamily: SANS }}>
                <GradIcon name="film" size={34} />
                <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>Bulk_export_launch.mp4</div>
                <div style={{ fontSize: 15, color: GRAY }}>0:48 · 1080p</div>
              </div>
            </div>
            <div style={{ width: 250, height: 110, borderRadius: 14, border: `1px solid ${LINE}`, padding: 16, boxSizing: "border-box", fontFamily: SANS, opacity: ramp(t, [30, 38]) }}>
              <Icon name="book" size={20} color={MAG} />
              <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginTop: 8 }}>How to bulk export reports</div>
              <div style={{ fontSize: 13, color: GRAY }}>Help-center article</div>
            </div>
          </div>
          <Pointer x={cur.x} y={cur.y} size={26} press={press(t, 56)} opacity={ramp(t, [36, 40]) * (1 - g)} />
        </Cam>
        {t >= 58 && (
          <div style={{ position: "absolute", left: interpolate(g, [0, 1], [THUMB.x, 0]), top: interpolate(g, [0, 1], [THUMB.y, 0]), width: interpolate(g, [0, 1], [THUMB.w, 1920]), height: interpolate(g, [0, 1], [THUMB.h, 1080]), borderRadius: 16 * (1 - g), overflow: "hidden", background: "#0B1230" }}>
            <Mini w={interpolate(g, [0, 1], [THUMB.w, 1920])} base={1920}>
              <div style={{ opacity: 1 - ramp(t, [60, 74]) }}>
                <CluesoFilm t={26} />
              </div>
            </Mini>
          </div>
        )}
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:23 the generated video ----------
export const Film = () => <Cut span={SHOT.film} name="0:23 Generated video" render={(t) => <CluesoFilm t={t} />} />;

// ---------- 0:30 refine in the Clueso editor ----------
const REFINE = "Translate the captions to Spanish and German";
const PV = { x: 460.8, y: 96, w: 1036.8, h: 583.2 };
export const Refine = () => (
  <Cut span={SHOT.refine} name="0:30 Refine" render={(t) => {
    const lang = t < 104 ? "EN" : t < 140 ? "ES" : "DE";
    const s = kf(t, [0, 16, 38, 132, 162], [1, 1, 1.6, 1.6, 1], ease.inOut);
    const fx = kf(t, [0, 16, 38, 132, 162], [960, 960, 980, 980, 960], ease.inOut);
    const fy = kf(t, [0, 16, 38, 132, 162], [540, 540, 520, 520, 540], ease.inOut);
    const cur = path(t, [8, 36, 74, 84, 110, 150], [1560, 720, 720, 1236, 1300, 1500], [900, 622, 622, 498, 700, 880]);
    const open = ramp(t, [41, 47], [0, 1], ease.out) * ramp(t, [98, 103], [1, 0], ease.in);
    const typed = REFINE.slice(0, Math.max(0, Math.floor((t - 48) * 1.35)));
    const cap = ((t * 0.012) % 1) * 0.999;
    return (
      <Cam s={s} fx={fx} fy={fy} bg="#0B0B0E">
        <Mini w={1920} base={ED_W}>
          <CluesoEditor clips={1} zooms={1} captions={1} voice={1} music={1} brand={1} playhead={0.28 + t * 0.0015} app={{ selected: 3 }} />
        </Mini>
        <div style={{ position: "absolute", left: PV.x, width: PV.w, top: PV.y + PV.h - 92, display: "flex", justifyContent: "center" }}>
          <Caption text={CAPTIONS[lang]} progress={cap} size={22} />
        </div>
        {t >= 104 && (
          <div style={{ position: "absolute", left: PV.x + PV.w - 210, top: PV.y + 18, display: "flex", gap: 8, fontFamily: SANS }}>
            {["EN", "ES", "DE"].map((l, i) => (
              <div key={l} style={{ padding: "6px 12px", borderRadius: 10, fontSize: 15, fontWeight: 600, color: l === lang ? "#fff" : "#C9C9D1", background: l === lang ? MAG : "rgba(20,20,26,0.8)", transform: `scale(${i === 0 ? 1 : pop(t, 104 + (i - 1) * 6)})` }}>
                {l}
              </div>
            ))}
          </div>
        )}
        {t >= 116 && (
          <div style={{ position: "absolute", left: PV.x + PV.w / 2 - 120, top: PV.y + 20, width: 240, height: 44, borderRadius: 22, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: SANS, fontSize: 16, fontWeight: 500, color: INK, transform: `scale(${pop(t, 116)})`, opacity: ramp(t, [150, 158], [1, 0]) }}>
            <Icon name="check" size={16} color="#12A150" stroke={2.6} /> 2 languages added
          </div>
        )}
        {t >= 41 && t < 104 && (
          <>
            <div style={{ position: "absolute", left: 706, top: 610, width: 22, height: 22, borderRadius: 11, background: "#2F7BFF", boxShadow: "0 0 0 6px rgba(47,123,255,0.22)", transform: `scale(${pop(t, 41)})` }} />
            <div style={{ position: "absolute", left: 740, top: 452, width: 540, height: 104, borderRadius: 18, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,0.35)", padding: "14px 14px 12px 18px", boxSizing: "border-box", fontFamily: SANS, opacity: open, transform: `scale(${0.95 + 0.05 * open})`, transformOrigin: "0 100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, color: typed ? INK : "#A8A8A8", height: 30, whiteSpace: "nowrap" }}>
                <Icon name="languages" size={16} color={GRAY} />
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
        {t > 104 && t < 150 && <Sparkle t={t} at={104} x={PV.x + PV.w - 110} y={PV.y + 34} w={240} h={70} n={40} dur={40} color={PINK} />}
        <Pointer x={cur.x} y={cur.y} size={24} light press={press(t, 39) + press(t, 86)} />
      </Cam>
    );
  }} />
);

// ---------- 0:36 tagline ----------
export const Tagline = () => (
  <Cut span={SHOT.tagline} name="0:36 Tagline" render={(t) => (
    <AbsoluteFill>
      <Space t0={SHOT.tagline[0]} tone="clueso" />
      <Words text="Describe the video. Your agent builds it." t={t} at={3} step={5} />
    </AbsoluteFill>
  )} />
);

// ---------- 0:38 range montage ----------
const PromptPill: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <div style={{ position: "absolute", left: 960 - 340, top: 950, width: 680, height: 76, borderRadius: 38, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,0.14)", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 14, padding: "0 12px 0 22px", boxSizing: "border-box", fontFamily: SANS, fontSize: 21, color: INK, opacity: ramp(t, [0, 3]) }}>
    <CluesoMark size={22} />
    <span style={{ flex: 1 }}>{text.slice(0, Math.max(0, Math.floor((t - 2) * 2.2)))}</span>
    <div style={{ width: 50, height: 50, borderRadius: 25, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="arrowUp" size={22} color="#fff" stroke={2.4} />
    </div>
  </div>
);
const Slack: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS }}>
    <div style={{ height: 70, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 40px", fontSize: 24, fontWeight: 700, color: INK }}># product-launches</div>
    <div style={{ display: "flex", gap: 20, padding: "34px 40px", opacity: ramp(t, [2, 6]), transform: `translateY(${ramp(t, [2, 10], [20, 0])}px)` }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="sparkles" size={28} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 22, color: INK }}>
          <b>Clueso Agent</b> <span style={{ color: GRAY, fontSize: 17 }}>2:41 PM</span>
        </div>
        <div style={{ fontSize: 22, color: INK, marginTop: 6 }}>Bulk export is live. Here's the launch video and the help article.</div>
        <div style={{ width: 720, height: 405, borderRadius: 14, overflow: "hidden", marginTop: 16, position: "relative" }}>
          <Mini w={720} base={APP_W}>
            <AcmeTitleCard />
          </Mini>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {[["heart", 24], ["check", 18], ["sparkles", 12]].map(([ic, n], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 16, border: `1px solid ${LINE}`, fontSize: 17, color: INK, transform: `scale(${pop(t, 10 + i * 3)})` }}>
              <Icon name={ic as "heart"} size={16} color={MAG} /> {Math.round((n as number) * ramp(t, [10, 26]))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
const MONTAGE: { prompt: string; cursor: [number, number] }[] = [
  { prompt: "Make a 30-second support video", cursor: [1180, 330] },
  { prompt: "Draft the help-center article", cursor: [1360, 420] },
  { prompt: "Translate it into 12 languages", cursor: [1500, 180] },
  { prompt: "Post it to #product-launches", cursor: [1080, 600] },
];
const LANGS = ["EN", "ES", "DE", "FR", "PT"];
export const Montage = () => (
  <Cut span={SHOT.montage} name="0:38 Any video" render={(t) => {
    const i = Math.min(3, Math.floor(t / 30));
    const k = t - i * 30;
    const m = MONTAGE[i];
    const lang = LANGS[Math.min(4, Math.floor(k / 6))];
    return (
      <AbsoluteFill style={{ background: "#F4F4F5" }}>
        <AbsoluteFill style={{ transform: `scale(${kf(k, [0, 30], [1, 1.06], ease.linear)})` }}>
          <div style={{ position: "absolute", left: 210, top: 80, width: 1500, height: 844, borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: `1px solid ${LINE}` }}>
            {(i === 0 || i === 2) && (
              <Mini w={1500} base={1920}>
                <CluesoFilm t={i === 0 ? 40 + k * 2 : 75} lang={i === 2 ? lang : "EN"} />
              </Mini>
            )}
            {i === 2 && <div style={{ position: "absolute", right: 30, top: 26, padding: "10px 18px", borderRadius: 14, background: MAG, color: "#fff", fontFamily: SANS, fontSize: 22, fontWeight: 700 }}>{lang}</div>}
            {i === 1 && <Doc w={1500} h={844} t={k} />}
            {i === 3 && <Slack t={k} />}
          </div>
        </AbsoluteFill>
        <PromptPill t={k} text={m.prompt} />
        <AICursor x={m.cursor[0] + Math.sin(k / 6) * 10} y={m.cursor[1] + Math.cos(k / 7) * 8 + (1 - ramp(k, [0, 10], [0, 1], ease.out)) * 60} tint={TINT} />
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:42 CTA + offer ----------
export const Cta = () => (
  <Cut span={SHOT.cta} name="0:42 Try Clueso MCP" render={(t) => {
    const out = ramp(t, [74, 90], [0, 1], ease.in);
    return (
      <AbsoluteFill>
        <Space t0={SHOT.cta[0]} tone="clueso" />
        <FloatField t={t + 30} out={out} />
        <div style={{ opacity: 1 - out }}>
          <Words text="Try Clueso MCP" t={t} at={2} step={5} size={78} y={470} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: SANS, fontSize: 32, color: "rgba(255,255,255,0.78)", opacity: ramp(t, [22, 28]), transform: `translateY(${ramp(t, [22, 30], [12, 0])}px)` }}>
            10 free minutes of AI editing, on us.
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 628, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily: SANS, fontSize: 22, color: "rgba(255,255,255,0.55)", opacity: ramp(t, [36, 44]) }}>
            Works with <ClaudeMark size={24} color="#F4F4F6" /> <span style={{ color: "#F4F4F6" }}>Claude</span> <OpenAIMark size={24} color="#F4F4F6" /> <span style={{ color: "#F4F4F6" }}>ChatGPT</span> and any MCP client
          </div>
        </div>
      </AbsoluteFill>
    );
  }} />
);

// ---------- 0:45 logo ----------
const PARTS = Array.from({ length: 520 }, (_, i) => ({ a: random(`la${i}`) * Math.PI * 2, r: 150 + random(`lr${i}`) * 750, s: 0.8 + random(`ls${i}`) * 1.8, e: 10 + random(`le${i}`) * 40, pink: random(`lp${i}`) < 0.45 }));
const WORD_W = 18 + (70 * cluesoWord.w) / cluesoWord.h;
export const Logo = () => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <Cut span={SHOT.logo} name="0:45 Logo" render={(t) => {
      const c = ramp(t, [0, 20], [0, 1], ease.inOut);
      const form = ramp(t, [14, 32], [0, 1], ease.out);
      const word = ramp(t, [30, 44], [0, 1], ease.inOut);
      return (
        <AbsoluteFill>
          <Space t0={SHOT.logo[0]} tone="clueso" black={ramp(t, [0, 16], [0, 1])} />
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
              return <circle key={i} cx={960 + Math.cos(a) * r} cy={540 + Math.sin(a) * r * 0.9} r={p.s} fill={p.pink ? PINK : "#fff"} opacity={(0.25 + 0.75 * c) * (1 - form)} />;
            })}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ filter: form < 0.995 ? `url(#lg${id})` : undefined, opacity: Math.min(1, form * 2) }}>
              <CluesoMark size={96} />
            </div>
            <div style={{ width: WORD_W * word, overflow: "hidden" }}>
              <div style={{ paddingLeft: 18, opacity: word }}>
                <CluesoWordmark height={70} color="#F4F4F6" />
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: SANS, fontSize: 24, color: "rgba(255,255,255,0.6)", opacity: ramp(t, [40, 48]) }}>clueso.io/mcp</div>
        </AbsoluteFill>
      );
    }} />
  );
};
