import React from "react";
import { interpolate } from "remotion";
import { ClaudeMark, CluesoMark, OpenAIMark } from "../../brand/Logos";
import { ease, kf, pop, ramp, u, useT } from "../../utils";
import { Icon, IconName } from "../icons";
import { C, FONT, GRADIENT, MARK_COLOR } from "../theme";
import { Background, Camera, Caption, Chip, Reveal, Seq, Toggle } from "../ui";

// 0:10–0:18 — mark morphs into the Clueso MCP connector card; agents dock with live connections.
const PANEL = { cx: 1200, cy: 410, w: 760, h: 470 };
const MARK_START = { cx: 960, cy: 410, size: 220 };
const TILE = 104;
const TILE_X = 560;
const DOCKS = [
  { y: 290, at: 46, label: "Claude" },
  { y: 410, at: 55, label: "ChatGPT" },
  { y: 530, at: 64, label: "Any MCP client" },
];
const TOOLS: [IconName, string, string][] = [
  ["film", "create_video", "Turn a recording into a finished video"],
  ["pen", "edit_video", "Trim, zoom and restyle by instruction"],
  ["captions", "add_captions", "Captions and AI voiceover"],
  ["globe", "translate_video", "Localize voice and captions"],
  ["book", "create_article", "Step-by-step docs from the video"],
];
const TOGGLE_AT = 40;
const BEAT = 130;

export const Mcp: React.FC = () => {
  const t = useT();

  const m = ramp(t, [8, 36], [0, 1], ease.inOut);
  const shell = {
    cx: interpolate(m, [0, 1], [MARK_START.cx, PANEL.cx]),
    w: interpolate(m, [0, 1], [190, PANEL.w]),
    h: interpolate(m, [0, 1], [190, PANEL.h]),
  };
  const panelLeft = PANEL.cx - PANEL.w / 2;
  const panelTop = PANEL.cy - PANEL.h / 2;
  const avatar = { cx: panelLeft + u(3) + 22, cy: panelTop + 38 };
  const markSize = interpolate(m, [0, 1], [MARK_START.size, 44]);
  const markCx = interpolate(m, [0, 1], [MARK_START.cx, avatar.cx]);
  const markCy = interpolate(m, [0, 1], [MARK_START.cy, avatar.cy]);
  const shellShow = ramp(t, [8, 14], [0, 1]);
  const gradientFade = ramp(t, [16, 34], [1, 0]);
  const content = ramp(t, [28, 42], [0, 1]);
  const toggle = ramp(t, [TOGGLE_AT, TOGGLE_AT + 6], [0, 1], ease.inOut);

  return (
    <Background glowX={60} glowY={40}>
      <Camera
        ry={kf(t, [0, 240], [-5, 5], ease.linear)}
        rx={kf(t, [0, 240], [4, 1], ease.linear)}
        scale={kf(t, [0, 60, 240], [1.03, 1, 1.05])}
        y={-20}
      >
        {/* Curved connectors with flowing particles */}
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="wire" x1="0" x2="1">
              <stop offset="0" stopColor={C.line} />
              <stop offset="1" stopColor={C.pink} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {DOCKS.map((d, i) => {
            const x0 = TILE_X + TILE / 2 + 6;
            const y1 = PANEL.cy + (i - 1) * 60;
            const x1 = panelLeft;
            const path = `M${x0} ${d.y} C${x0 + 110} ${d.y}, ${x1 - 110} ${y1}, ${x1} ${y1}`;
            const draw = ramp(t, [d.at + 8, d.at + 22], [0, 1], ease.inOut);
            if (draw <= 0) return null;
            const live = t > d.at + 22;
            const speed = t > BEAT ? 22 : 36;
            return (
              <g key={i}>
                <path d={path} fill="none" stroke="url(#wire)" strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
                {live
                  ? [0, 1, 2].map((k) => {
                      const ph = (((t - d.at) / speed + k / 3 + i * 0.13) % 1 + 1) % 1;
                      return (
                        <path
                          key={k}
                          d={path}
                          fill="none"
                          stroke={C.pink}
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          pathLength={1}
                          strokeDasharray="0.06 1"
                          strokeDashoffset={-ph}
                          opacity={Math.sin(ph * Math.PI)}
                          style={{ filter: `drop-shadow(0 0 6px ${C.pink})` }}
                        />
                      );
                    })
                  : null}
              </g>
            );
          })}
        </svg>

        {/* Agent tiles */}
        {DOCKS.map((d, i) => {
          const s = pop(t, d.at);
          const hit = t > BEAT ? ramp(t, [BEAT + i * 3, BEAT + i * 3 + 14], [1, 0]) : 0;
          const offset = (1 - s) * -380;
          return (
            <div key={i} style={{ opacity: Math.min(1, s * 2) }}>
              <div
                style={{
                  position: "absolute",
                  left: TILE_X - TILE / 2,
                  top: d.y - TILE / 2,
                  width: TILE,
                  height: TILE,
                  borderRadius: 26,
                  background: `linear-gradient(180deg, ${C.surface3}, ${C.surface2})`,
                  border: i === 2 ? `2px dashed ${C.surface4}` : `1px solid ${C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: s < 0.995 ? `translateX(${offset}px) perspective(800px) rotateY(${(1 - s) * 50}deg)` : undefined,
                  boxShadow: `0 1px 0 rgba(255,255,255,0.06) inset, 0 20px 40px rgba(0,0,0,0.45), 0 0 ${30 * hit}px ${C.pink}99`,
                }}
              >
                {i === 0 ? <ClaudeMark size={52} color={MARK_COLOR} /> : null}
                {i === 1 ? <OpenAIMark size={52} color={MARK_COLOR} /> : null}
                {i === 2 ? <Icon name="plus" size={36} color={C.muted} /> : null}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 1920 - (TILE_X - TILE / 2 - u(3)),
                  top: d.y,
                  transform: `translate(${offset}px, -50%)`,
                  fontFamily: FONT.sans,
                  fontSize: 22,
                  fontWeight: 500,
                  color: C.text2,
                  whiteSpace: "nowrap",
                }}
              >
                {d.label}
              </div>
            </div>
          );
        })}

        {/* Morphing shell → connector card */}
        <div
          style={{
            position: "absolute",
            left: shell.cx - shell.w / 2,
            top: PANEL.cy - shell.h / 2,
            width: shell.w,
            height: shell.h,
            borderRadius: 24,
            backgroundColor: C.surface,
            border: `1px solid ${C.line}`,
            opacity: shellShow,
            boxShadow: "0 1px 0 rgba(255,255,255,0.07) inset, 0 50px 120px rgba(0,0,0,0.6)",
          }}
        >
          <svg width={44} height={30} viewBox="0 0 44 30" style={{ position: "absolute", left: 56, bottom: -28, opacity: content }}>
            <path d="M0 0 L44 0 L6 29 Z" fill={C.surface} />
            <path d="M44 0 L6 29 L0 0" fill="none" stroke={C.line} strokeWidth={1} />
          </svg>
          <div style={{ position: "absolute", inset: 0, borderRadius: 24, backgroundImage: GRADIENT, opacity: gradientFade }} />
          <div style={{ position: "absolute", inset: 0, opacity: content, overflow: "hidden", borderRadius: 24, fontFamily: FONT.sans }}>
            <div style={{ height: 76, display: "flex", alignItems: "center", padding: `0 ${u(3)}px 0 ${u(3) + 44 + 16}px`, borderBottom: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: C.text }}>Clueso MCP</span>
                <span style={{ fontSize: 14, color: C.muted }}>Remote MCP server · no API keys</span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: toggle > 0.5 ? C.ok : C.muted }}>{toggle > 0.5 ? "Connected" : "Off"}</span>
                <Toggle on={toggle} size={1.1} />
              </div>
            </div>
            <div style={{ padding: "10px 16px" }}>
              {TOOLS.map(([icon, name, desc], i) => {
                const s = pop(t, TOGGLE_AT + 6 + i * 4);
                return (
                  <div
                    key={name}
                    style={{
                      height: 70,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "0 10px",
                      borderRadius: 12,
                      opacity: Math.min(1, s * 1.6),
                      transform: `translateY(${(1 - s) * 16}px)`,
                      backgroundColor: i === 0 && t > BEAT ? `${C.magenta}14` : "transparent",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: C.surface3, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={icon} size={20} color={C.pink} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontFamily: FONT.mono, fontSize: 17, color: C.text }}>{name}</span>
                      <span style={{ fontSize: 14, color: C.muted }}>{desc}</span>
                    </div>
                    <Chip style={{ marginLeft: "auto", fontSize: 12 }}>tool</Chip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", left: markCx - markSize / 2, top: markCy - markSize / 2 }}>
          <CluesoMark size={markSize} />
        </div>
      </Camera>

      <Seq from={38} dur={BEAT - 38}>
        <Caption y={850} maxWidth={1300}>
          <Reveal
            text="MCP — the open standard that lets your AI agent plug straight into Clueso."
            size={46}
            weight={500}
            family={FONT.sans}
            stagger={1.5}
            letterSpacing="-0.02em"
            lineHeight={1.3}
            accent={["MCP"]}
          />
        </Caption>
      </Seq>
      <Seq from={BEAT}>
        <Caption y={870}>
          <Reveal text="One video engine. Any agent." size={88} accent={["Any", "agent."]} />
        </Caption>
      </Seq>
    </Background>
  );
};
