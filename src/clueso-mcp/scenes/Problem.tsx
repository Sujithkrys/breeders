import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { ease, kf, punch, ramp, typed, useT } from "../../utils";
import { Icon, IconName } from "../icons";
import { AppShot } from "../mock/AppShot";
import { C, FONT } from "../theme";
import { Avatar, Background, Caption, Chip, Cursor, HBlurFilter, Panel, Reveal, Seq, Spinner } from "../ui";

// 0:04–0:10 — editor ⇄ docs whip-pans, pull out to a split, freeze on "Repeat".
const FREEZE = 126;
const PANEL_W = 1360;
const PANEL_H = 720;
const PANEL_TOP = 116;

type Cam = { fx: number; s: number; swing: number; split: number };
const camAt = (t: number): Cam => {
  const whip = ramp(t, [48, 58], [0, 1], ease.inOut);
  const split = ramp(t, [104, 120], [0, 1], ease.inOut);
  const fx = t < 104 ? interpolate(whip, [0, 1], [960, 2880]) : interpolate(split, [0, 1], [2880, 1920]);
  // Kept ≤ 1: the 3840px world is composited, and upscaling it softens the UI text.
  const s = t < 104 ? kf(t, [0, 48, 58, 104], [0.96, 1, 0.97, 1]) : interpolate(split, [0, 1], [1, 0.52]);
  return { fx, s, swing: Math.sin(whip * Math.PI) * (t < 60 ? 1 : 0), split };
};
const screenX = ({ fx, s }: Cam) => 960 - fx * s;
const tilt = (deg: number) => (Math.abs(deg) > 0.01 ? `perspective(2400px) rotateY(${deg}deg)` : undefined);

export const Problem: React.FC = () => {
  const raw = useT();
  const t = Math.min(raw, FREEZE);
  const frozen = raw >= FREEZE;

  const cam = camAt(t);
  const velocity = Math.abs(screenX(cam) - screenX(camAt(t - 0.5))) * 2;
  const blur = frozen ? 0 : Math.min(60, velocity * 0.32);
  const freezePunch = punch(raw, FREEZE, 0.025);
  const flash = frozen ? ramp(raw, [FREEZE, FREEZE + 5], [0.28, 0]) : 0;

  return (
    <Background glowY={30}>
      <HBlurFilter id="whip-problem" amount={blur} />
      <AbsoluteFill style={{ transform: `scale(${freezePunch})`, filter: frozen ? "saturate(0.3) brightness(0.75)" : undefined }}>
        <div
          style={{
            position: "absolute",
            width: 3840,
            height: 1080,
            transformOrigin: "0 0",
            transform: `translate(${screenX(cam)}px, ${540 - 540 * cam.s}px) scale(${cam.s})`,
            filter: blur > 0.5 ? "url(#whip-problem)" : undefined,
          }}
        >
          <div style={{ position: "absolute", left: 960 - PANEL_W / 2, top: PANEL_TOP, transform: tilt(cam.split * 12 - cam.swing * 10) }}>
            <EditorPanel t={t} />
          </div>
          <div style={{ position: "absolute", left: 2880 - PANEL_W / 2, top: PANEL_TOP, transform: tilt(-cam.split * 12 - cam.swing * 10) }}>
            <DocsPanel t={t} />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />

      <Seq from={4} dur={44}>
        <Caption y={955}>
          <Reveal text="Record it. Edit it." size={60} start={0} />
        </Caption>
      </Seq>
      <Seq from={58} dur={46}>
        <Caption y={955}>
          <Reveal text="Write the docs." size={60} start={0} />
        </Caption>
      </Seq>
      <Seq from={116}>
        <Caption y={880}>
          <Reveal text="Repeat for every feature." size={92} accent={["Repeat"]} start={0} stagger={3} />
        </Caption>
      </Seq>
    </Background>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, height: 32 }}>
    <span style={{ color: C.muted }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: FONT.mono, color: C.text2, padding: "3px 8px", borderRadius: 6, backgroundColor: C.surface3 }}>{value}</span>
      <div style={{ width: 9, height: 9, transform: "rotate(45deg)", backgroundColor: C.warn }} />
    </div>
  </div>
);

const EditorPanel: React.FC<{ t: number }> = ({ t }) => {
  const seconds = 12 * 60 + 4 + Math.floor(t * 97);
  const clock = `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const stuck = t > 30;
  const playX = stuck ? 0.462 : 0.24 + Math.sin(t * 0.3) * 0.12 + t * 0.006;
  const cursorX = 330 + Math.sin(t * 0.25) * 60 + t * 3;
  const media: [IconName, string][] = [
    ["film", "screen_rec_01.mov"],
    ["film", "screen_rec_02.mov"],
    ["mic", "voiceover_take3.wav"],
    ["wave", "music_final_v2.mp3"],
    ["file", "logo_export@2x.png"],
  ];
  const tracks = ["V2", "V1", "A1", "A2"];

  return (
    <Panel style={{ position: "relative", width: PANEL_W, height: PANEL_H, backgroundColor: "#101014" }}>
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: `1px solid ${C.line}`, fontSize: 14, color: C.muted }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.surface4 }} />
        ))}
        <span style={{ marginLeft: 16, color: C.text2 }}>Untitled Project — launch_v7_FINAL (2)</span>
        <Chip style={{ marginLeft: "auto", color: C.warn, fontFamily: FONT.mono, fontSize: 14 }}>
          <Icon name="clock" size={15} /> Editing · {clock}
        </Chip>
      </div>
      {/* Media bin */}
      <div style={{ position: "absolute", left: 0, top: 48, width: 220, height: 444, borderRight: `1px solid ${C.line}`, padding: 14, boxSizing: "border-box" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.faint, marginBottom: 10 }}>MEDIA</div>
        {media.map(([icon, name]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, height: 34, fontSize: 13, color: C.text2 }}>
            <Icon name={icon} size={15} color={C.muted} />
            {name}
          </div>
        ))}
      </div>
      {/* Viewer */}
      <div style={{ position: "absolute", left: 236, top: 60, width: 768, height: 432, borderRadius: 8, overflow: "hidden", backgroundColor: "#fff" }}>
        <div style={{ transform: `scale(${768 / 1280})`, transformOrigin: "0 0" }}>
          <AppShot selected={2} />
        </div>
        <div style={{ position: "absolute", left: 12, bottom: 12, fontFamily: FONT.mono, fontSize: 14, color: "#fff", backgroundColor: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 5 }}>
          01:12:{String(8 + Math.floor(t / 3) % 20).padStart(2, "0")}
        </div>
        {stuck ? (
          <AbsoluteFill style={{ backgroundColor: "rgba(12,12,16,0.8)", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
            <Spinner size={52} t={t} />
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Rendering preview… 62%</div>
            <div style={{ width: 300, height: 6, borderRadius: 3, backgroundColor: C.surface4 }}>
              <div style={{ width: "62%", height: "100%", borderRadius: 3, backgroundColor: C.warn }} />
            </div>
            <div style={{ fontSize: 14, color: C.muted }}>About 2h 14m remaining</div>
          </AbsoluteFill>
        ) : null}
      </div>
      {/* Inspector */}
      <div style={{ position: "absolute", left: 1016, right: 16, top: 60, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.faint, marginBottom: 6 }}>TRANSFORM</div>
        <Field label="Position X" value="412.0" />
        <Field label="Position Y" value="188.5" />
        <Field label="Scale" value="118%" />
        <Field label="Rotation" value="0.0°" />
        <div style={{ fontSize: 12, fontWeight: 600, color: C.faint, margin: "14px 0 6px" }}>CROP</div>
        <Field label="Left" value="0 px" />
        <Field label="Right" value="24 px" />
        <Field label="Opacity" value="100%" />
      </div>
      {/* Timeline */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 504, bottom: 0, borderTop: `1px solid ${C.line}`, backgroundColor: "#0C0C10" }}>
        <div style={{ position: "absolute", left: 64, right: 12, top: 6, height: 18, display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: 11, color: C.faint }}>
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i}>01:{String(i * 8).padStart(2, "0")}:00</span>
          ))}
        </div>
        {tracks.map((name, ti) => (
          <div key={name} style={{ position: "absolute", left: 0, right: 12, top: 30 + ti * 44, height: 38, display: "flex" }}>
            <div style={{ width: 64, fontFamily: FONT.mono, fontSize: 12, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>{name}</div>
            <div style={{ position: "relative", flex: 1 }}>
              {Array.from({ length: 11 }, (_, i) => {
                const x = i * 9 + random(`px${ti}${i}`) * 2;
                const w = 3 + random(`pw${ti}${i}`) * 6;
                const audio = ti >= 2;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      width: `${w}%`,
                      top: 0,
                      bottom: 0,
                      borderRadius: 4,
                      backgroundColor: audio ? "#1F3A2E" : ti === 0 ? "#3B2B4A" : "#26344F",
                      border: `1px solid ${audio ? "#2F5A45" : ti === 0 ? "#5A4170" : "#3A4E75"}`,
                      overflow: "hidden",
                    }}
                  >
                    {ti === 0 && i % 3 === 0 ? <div style={{ position: "absolute", left: 6, top: 14, width: 8, height: 8, transform: "rotate(45deg)", backgroundColor: C.warn }} /> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", left: `calc(64px + ${playX} * (100% - 76px))`, top: 0, bottom: 0, width: 2, backgroundColor: C.danger }}>
          <div style={{ position: "absolute", left: -6, top: 0, width: 14, height: 12, borderRadius: 3, backgroundColor: C.danger }} />
        </div>
        <Cursor x={cursorX} y={stuck ? 70 : 64 + Math.sin(t * 0.4) * 6} press={stuck ? 0 : 1} />
      </div>
    </Panel>
  );
};

const TITLE = "How to export reports in bulk";
const BODY = "To export several reports at once, open Reports, tick the reports you need, then";

const DocsPanel: React.FC<{ t: number }> = ({ t }) => {
  const title = typed(TITLE, t, 58, 2.4);
  const body = typed(BODY, t, 72, 3);
  const caretOn = Math.floor(t / 8) % 2 === 0;
  const doneTyping = body.length >= BODY.length;
  const words = (title + " " + body).split(" ").filter(Boolean).length;
  return (
    <Panel style={{ position: "relative", width: PANEL_W, height: PANEL_H, backgroundColor: "#101014" }}>
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: `1px solid ${C.line}`, fontSize: 14, color: C.text2 }}>
        <Icon name="book" size={16} color={C.muted} />
        Help Center — Bulk export (draft)
        <Chip style={{ marginLeft: "auto" }}>
          <Spinner size={14} t={t} color={C.muted} /> Saving…
        </Chip>
      </div>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 18, padding: "0 20px", borderBottom: `1px solid ${C.line}`, color: C.muted, fontSize: 15, fontWeight: 600 }}>
        <span>B</span>
        <span style={{ fontStyle: "italic" }}>I</span>
        <span style={{ textDecoration: "underline" }}>U</span>
        <span style={{ color: C.line }}>|</span>
        <span>H1</span>
        <span>H2</span>
        <Icon name="link" size={16} />
        <Icon name="grid" size={16} />
      </div>
      {/* Page */}
      <div style={{ position: "absolute", left: 48, top: 116, width: 900, height: 560, borderRadius: 8, backgroundColor: "#FBFBFC", padding: "40px 56px", boxSizing: "border-box", fontFamily: FONT.sans, color: "#1B1F29" }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", minHeight: 44 }}>
          {title}
          {!body && caretOn ? <span style={{ display: "inline-block", width: 3, height: 36, marginLeft: 2, backgroundColor: C.magenta, verticalAlign: "middle" }} /> : null}
        </div>
        <div style={{ fontSize: 19, lineHeight: 1.6, color: "#3A4151", marginTop: 18, minHeight: 60 }}>
          {body}
          {body && caretOn ? <span style={{ display: "inline-block", width: 2, height: 24, marginLeft: 2, backgroundColor: C.magenta, verticalAlign: "middle" }} /> : null}
        </div>
        {[
          "Add screenshot: selecting reports",
          "Add GIF: export dialog",
        ].map((label, i) => (
          <div key={label} style={{ marginTop: i === 0 ? 24 : 14, height: 92, borderRadius: 8, border: "2px dashed #D5D9E0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#98A0AE", fontSize: 16 }}>
            <Icon name="grid" size={18} />
            {label}
          </div>
        ))}
      </div>
      {/* Comments */}
      <div style={{ position: "absolute", left: 980, right: 20, top: 116, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { who: "Maya Chen", when: "3h", text: "Screenshots are outdated — the export button moved." },
          { who: "Leo Park", when: "1h", text: "Can we re-record once the UI ships?" },
        ].map((c) => (
          <div key={c.who} style={{ padding: 14, borderRadius: 10, backgroundColor: C.surface2, border: `1px solid ${C.line}`, boxShadow: `inset 3px 0 0 ${C.warn}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13 }}>
              <Avatar name={c.who} size={22} />
              <span style={{ fontWeight: 600, color: C.text }}>{c.who}</span>
              <span style={{ color: C.faint }}>{c.when}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.45, color: C.text2 }}>{c.text}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 48, bottom: 14, fontSize: 13, color: C.faint }}>
        {words} words · {doneTyping ? "Paused" : "Typing"} · Last published 3 weeks ago
      </div>
    </Panel>
  );
};
