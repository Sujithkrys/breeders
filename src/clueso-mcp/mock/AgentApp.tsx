import React from "react";
import { CluesoMark } from "../../brand/Logos";
import { Icon, IconName } from "../icons";
import { C, FONT, GRADIENT } from "../theme";
import { Avatar, Chip, Dot, Spinner } from "../ui";

// Fictional, generic AI-agent chat app with the Clueso connector enabled. Designed at 1440×810.
export const AGENT_W = 1440;
export const AGENT_H = 810;
export const PROMPT = "Turn this into a feature announcement video";
export const REPLY = "On it. Building a feature announcement from your recording with Clueso.";

const HISTORY = ["Bulk export launch", "Q3 roadmap review", "Release notes v4.2", "Support macros cleanup", "Onboarding email draft"];
export const STEPS: [IconName, string][] = [
  ["captions", "Transcribed recording"],
  ["pen", "Wrote script · 4 scenes"],
  ["mic", "Generated AI voiceover"],
  ["zoom", "Added zooms & captions"],
  ["palette", "Applied Acme brand kit"],
];

export type AgentState = {
  t: number;
  typed: string;
  caret: boolean;
  sent: boolean;
  userBubble: number;
  sendPress: number;
  reply: string;
  tool: number;
  stepsDone: number;
};

const FileCard: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: compact ? "8px 12px" : "10px 14px", borderRadius: 12, backgroundColor: C.surface3, border: `1px solid ${C.line}`, width: "fit-content" }}>
    <div style={{ width: 56, height: 36, borderRadius: 6, backgroundColor: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, backgroundColor: "#F1F3F6" }} />
      <div style={{ position: "absolute", left: 14, top: 6, width: 22, height: 4, borderRadius: 2, backgroundColor: "#CBD2DC" }} />
      <div style={{ position: "absolute", right: 4, top: 5, width: 10, height: 6, borderRadius: 2, backgroundColor: "#2F5BEA" }} />
      {[0, 1, 2].map((r) => (
        <div key={r} style={{ position: "absolute", left: 14, right: 4, top: 15 + r * 6, height: 3, borderRadius: 1, backgroundColor: "#E8EBF0" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.15)" }}>
        <Icon name="play" size={14} color="#fff" />
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>bulk-export-demo.mp4</span>
      <span style={{ fontSize: 12, color: C.muted }}>Screen recording · 2:14</span>
    </div>
  </div>
);

export const AgentApp: React.FC<AgentState> = ({ t, typed, caret, sent, userBubble, sendPress, reply, tool, stepsDone }) => (
  <div style={{ position: "relative", width: AGENT_W, height: AGENT_H, backgroundColor: "#0F0F13", fontFamily: FONT.sans, color: C.text, overflow: "hidden" }}>
    {/* Sidebar */}
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 264, backgroundColor: "#0B0B0E", borderRight: `1px solid ${C.line}`, padding: 16, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontWeight: 500 }}>
        <Icon name="plus" size={16} /> New chat
      </div>
      <div style={{ fontSize: 12, color: C.faint, margin: "22px 12px 8px", fontWeight: 500 }}>Recent</div>
      {HISTORY.map((h, i) => (
        <div key={h} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 14, color: i === 0 ? C.text : C.muted, backgroundColor: i === 0 ? C.surface3 : "transparent", marginBottom: 2 }}>
          {h}
        </div>
      ))}
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
        <Avatar name="Jordan Diaz" size={32} hue={210} />
        Jordan Diaz
      </div>
    </div>

    {/* Header */}
    <div style={{ position: "absolute", left: 264, right: 0, top: 0, height: 60, borderBottom: `1px solid ${C.lineSoft}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
      <span style={{ fontSize: 16, fontWeight: 600 }}>Bulk export launch</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <Chip style={{ fontSize: 13, padding: "5px 10px" }}>
          <CluesoMark size={16} />
          Clueso
          <Dot color={C.ok} size={7} glow />
        </Chip>
        <Icon name="more" size={20} color={C.muted} />
      </div>
    </div>

    {/* Conversation */}
    <div style={{ position: "absolute", left: 264 + 178, width: 820, top: 88, display: "flex", flexDirection: "column", gap: 22 }}>
      {sent ? (
        <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, opacity: Math.min(1, userBubble * 1.5), transform: `translateY(${(1 - userBubble) * 140}px)` }}>
          <FileCard compact />
          <div style={{ padding: "12px 18px", borderRadius: 18, backgroundColor: C.surface3, fontSize: 17, lineHeight: 1.5 }}>{PROMPT}</div>
        </div>
      ) : null}
      {reply.length > 0 ? (
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sparkles" size={17} color={C.text} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ fontSize: 17, lineHeight: 1.6, color: C.text2, paddingTop: 4 }}>
              {reply}
              {reply.length < REPLY.length ? <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 5, marginLeft: 6, backgroundColor: C.text }} /> : null}
            </div>
            {tool > 0 ? (
              <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, backgroundColor: C.surface, overflow: "hidden", opacity: Math.min(1, tool * 1.5), transform: `translateY(${(1 - tool) * 24}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${C.line}` }}>
                  <CluesoMark size={20} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Clueso</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.pink }}>create_video</span>
                  <div style={{ marginLeft: "auto" }}>
                    {stepsDone >= STEPS.length ? (
                      <Chip style={{ color: C.ok }}>
                        <Icon name="check" size={13} stroke={3} /> Done
                      </Chip>
                    ) : (
                      <Chip>
                        <Spinner size={13} t={t} color={C.pink} /> Running
                      </Chip>
                    )}
                  </div>
                </div>
                <div style={{ padding: "12px 16px", fontFamily: FONT.mono, fontSize: 13, color: C.muted, lineHeight: 1.7, borderBottom: `1px solid ${C.lineSoft}` }}>
                  <span style={{ color: C.faint }}>source</span> <span style={{ color: C.text2 }}>bulk-export-demo.mp4</span>
                  {"   "}
                  <span style={{ color: C.faint }}>style</span> <span style={{ color: C.text2 }}>feature announcement</span>
                  {"   "}
                  <span style={{ color: C.faint }}>brand</span> <span style={{ color: C.text2 }}>Acme</span>
                </div>
                <div style={{ padding: "8px 16px 12px" }}>
                  {STEPS.map(([icon, label], i) => {
                    const done = i < stepsDone;
                    const current = i === stepsDone;
                    return (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, height: 34, fontSize: 15, color: done ? C.text : current ? C.text2 : C.faint }}>
                        {done ? (
                          <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.ok, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="check" size={12} color={C.bg} stroke={3.4} />
                          </div>
                        ) : current ? (
                          <Spinner size={20} t={t} color={C.pink} />
                        ) : (
                          <div style={{ width: 16, height: 16, margin: 2, borderRadius: 8, border: `2px solid ${C.surface4}` }} />
                        )}
                        <Icon name={icon} size={16} color={done ? C.muted : C.faint} />
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>

    {/* Composer */}
    <div style={{ position: "absolute", left: 264 + 178, width: 820, bottom: 28, borderRadius: 20, border: `1px solid ${sent ? C.line : "#4A3A4A"}`, backgroundColor: C.surface2, padding: 14, boxSizing: "border-box", boxShadow: sent ? undefined : `0 0 0 4px ${C.magenta}1F` }}>
      {!sent ? (
        <div style={{ marginBottom: 12 }}>
          <FileCard />
        </div>
      ) : null}
      <div style={{ minHeight: 30, fontSize: 18, padding: "0 6px", display: "flex", alignItems: "center", color: sent || typed.length === 0 ? C.faint : C.text }}>
        {sent || typed.length === 0 ? "Ask anything" : typed}
        {!sent && caret ? <span style={{ width: 2, height: 24, marginLeft: 2, backgroundColor: C.text, display: "inline-block" }} /> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, color: C.muted, padding: "0 4px" }}>
        <Icon name="paperclip" size={19} />
        <Chip style={{ fontSize: 12 }}>
          <Icon name="plug" size={13} /> Clueso
        </Chip>
        <div
          style={{
            marginLeft: "auto",
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundImage: typed.length > 0 && !sent ? GRADIENT : undefined,
            backgroundColor: C.surface4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - sendPress * 0.12})`,
          }}
        >
          <Icon name="arrowUp" size={19} color="#fff" stroke={2.6} />
        </div>
      </div>
    </div>
  </div>
);
