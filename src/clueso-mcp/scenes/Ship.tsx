import React from "react";
import { AbsoluteFill } from "remotion";
import { CluesoMark } from "../../brand/Logos";
import { ease, kf, pop, punch, ramp, useT } from "../../utils";
import { Icon } from "../icons";
import { AcmeTitleCard, APP_W } from "../mock/AppShot";
import { C, FONT } from "../theme";
import { Avatar, Background, Camera, Caption, Chip, Cursor, Dot, Reveal } from "../ui";

// 0:25–0:30 — ticket closed → video generated → posted to the team. Camera tracks the chain.
const Y = 420;
const CARD_W = 460;
const CARD_H = 350;
const NODES = [
  { cx: 420, at: 0, label: "Ticket closed" },
  { cx: 960, at: 32, label: "Video generated" },
  { cx: 1500, at: 76, label: "Posted to #product-launches" },
];
const DONE_AT = 16;
const READY_AT = 62;

export const Ship: React.FC = () => {
  const t = useT();
  const fx = kf(t, [0, 24, 40, 64, 84, 110, 132], [470, 470, 960, 960, 1450, 1450, 960]);
  const scale = kf(t, [0, 110, 134], [1.34, 1.3, 0.94]);
  const fy = kf(t, [0, 110, 134], [Y + 10, Y + 10, Y + 60]);

  return (
    <Background glowY={36}>
      <Camera x={(960 - fx) * scale} y={(540 - fy) * scale} scale={scale} rx={kf(t, [0, 134], [12, 6])} ry={kf(t, [0, 150], [-4, 4], ease.linear)}>
        {[0, 1].map((i) => (
          <Connector key={i} x0={NODES[i].cx + CARD_W / 2 + 18} x1={NODES[i + 1].cx - CARD_W / 2 - 18} y={Y} t={t} at={NODES[i + 1].at - 12} />
        ))}
        {NODES.map((n, i) => {
          const s = pop(t, n.at);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: n.cx - CARD_W / 2,
                top: Y - CARD_H / 2,
                width: CARD_W,
                opacity: Math.min(1, s * 2),
                transform: `translateY(${(1 - s) * 80}px) scale(${(0.86 + 0.14 * s) * punch(t, n.at, 0.06)})`,
              }}
            >
              <div
                style={{
                  height: CARD_H,
                  borderRadius: 20,
                  backgroundColor: C.surface,
                  border: `1px solid ${C.line}`,
                  overflow: "hidden",
                  position: "relative",
                  fontFamily: FONT.sans,
                  boxShadow: "0 1px 0 rgba(255,255,255,0.07) inset, 0 40px 90px rgba(0,0,0,0.55)",
                }}
              >
                {i === 0 ? <TicketCard t={t} /> : null}
                {i === 1 ? <VideoCard t={t - n.at} /> : null}
                {i === 2 ? <MessageCard t={t - n.at} /> : null}
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily: FONT.mono, fontSize: 16, color: C.muted }}>
                <span style={{ color: C.pink }}>{i + 1}</span>
                {n.label}
              </div>
            </div>
          );
        })}
      </Camera>
      <Caption y={930}>
        <Reveal text="Ship a feature, ship its video — automatically." size={66} start={8} accent={["automatically."]} stagger={2} />
      </Caption>
    </Background>
  );
};

const Connector: React.FC<{ x0: number; x1: number; y: number; t: number; at: number }> = ({ x0, x1, y, t, at }) => {
  const draw = ramp(t, [at, at + 12], [0, 1], ease.inOut);
  if (draw <= 0) return null;
  const x = x0 + (x1 - x0) * draw;
  const pulse = ((t - at) % 24) / 24;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1={x0} x2={x} y1={y} y2={y} stroke={C.surface4} strokeWidth={3} strokeLinecap="round" />
      <line x1={x0} x2={x} y1={y} y2={y} stroke={C.pink} strokeWidth={3} strokeLinecap="round" strokeDasharray="10 12" strokeDashoffset={-t * 2} opacity={0.8} />
      {draw >= 1 ? <circle cx={x0 + (x1 - x0) * pulse} cy={y} r={6} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} /> : null}
      {draw >= 1 ? <path d={`M${x1 - 14} ${y - 10} L${x1} ${y} L${x1 - 14} ${y + 10}`} fill="none" stroke={C.pink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
};

const TicketCard: React.FC<{ t: number }> = ({ t }) => {
  const done = t >= DONE_AT;
  const cp = ramp(t, [2, 12], [0, 1], ease.inOut);
  return (
    <div style={{ padding: 24, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.mono, fontSize: 15, color: C.muted }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={done ? C.ok : C.warn} strokeWidth="2.4">
          <circle cx="12" cy="12" r="9" strokeDasharray={done ? undefined : "4 3"} />
          {done ? <path d="M8 12.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
        ACME-482
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Chip style={{ color: "#B79CFF" }}>Feature</Chip>
          <Chip>Reports</Chip>
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: "-0.015em" }}>Bulk export for reports</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.text2 }}>
        <Icon name="git" size={17} color={C.ok} />
        Pull request #1289 merged
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.text2 }}>
        <Icon name="check" size={17} color={C.ok} stroke={2.6} />
        QA passed · 12 checks
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.text2 }}>
        <Avatar name="Maya Chen" size={30} />
        Maya Chen
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            borderRadius: 9,
            fontWeight: 600,
            fontSize: 14,
            color: done ? C.ok : C.warn,
            backgroundColor: done ? `${C.ok}1F` : `${C.warn}1F`,
            border: `1px solid ${done ? C.ok : C.warn}55`,
            transform: `scale(${punch(t, DONE_AT, 0.15)})`,
          }}
        >
          <Dot color={done ? C.ok : C.warn} size={8} />
          {done ? "Done" : "In review"}
          <Icon name="chevronDown" size={14} />
        </div>
      </div>
      {t < DONE_AT + 10 ? (
        <Cursor x={260 + 140 * cp} y={200 + 70 * cp} press={ramp(t, [DONE_AT - 3, DONE_AT - 1], [0, 1]) * ramp(t, [DONE_AT, DONE_AT + 3], [1, 0])} ripple={ramp(t, [DONE_AT - 1, DONE_AT + 8], [0, 1])} />
      ) : null}
    </div>
  );
};

const VideoCard: React.FC<{ t: number }> = ({ t }) => {
  const readyT = READY_AT - NODES[1].at;
  const progress = ramp(t, [0, readyT], [0, 1], ease.inOut);
  const ready = t >= readyT;
  const r = 34;
  const circ = 2 * Math.PI * r;
  const thumbH = (CARD_W * 9) / 16;
  return (
    <>
      <div style={{ position: "relative", height: thumbH, overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ transform: `scale(${CARD_W / APP_W})`, transformOrigin: "0 0" }}>
          <AcmeTitleCard reveal={ramp(t, [readyT - 10, readyT], [0, 1], ease.out)} />
        </div>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: ready ? "transparent" : "rgba(12,12,16,0.7)" }}>
          {ready ? (
            <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, readyT)})` }}>
              <Icon name="play" size={26} color="#fff" />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <svg width={84} height={84} viewBox="0 0 84 84">
                <circle cx="42" cy="42" r={r} fill="none" stroke={C.surface4} strokeWidth="5" />
                <circle cx="42" cy="42" r={r} fill="none" stroke={C.pink} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${circ * progress} ${circ}`} transform="rotate(-90 42 42)" />
              </svg>
              <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.text2 }}>Generating · {Math.round(progress * 100)}%</span>
            </div>
          )}
        </AbsoluteFill>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <CluesoMark size={28} />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Bulk export — walkthrough</span>
          <span style={{ fontSize: 13, color: C.muted }}>0:48 · 1080p · Captions EN, ES, DE</span>
        </div>
      </div>
    </>
  );
};

const MessageCard: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 8, padding: "0 20px", borderBottom: `1px solid ${C.line}`, fontWeight: 600, fontSize: 17, color: C.text }}>
      <Icon name="hash" size={17} color={C.muted} />
      product-launches
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.muted, fontWeight: 500 }}>
        <Icon name="users" size={15} /> 48
      </div>
    </div>
    <div style={{ padding: "16px 20px", display: "flex", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <CluesoMark size={24} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Clueso</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, backgroundColor: C.surface3, padding: "2px 5px", borderRadius: 4 }}>APP</span>
          <span style={{ fontSize: 12, color: C.faint }}>just now</span>
        </div>
        <span style={{ fontSize: 15, lineHeight: 1.45, color: C.text2 }}>Bulk export is live. Here’s the 48s walkthrough for customers.</span>
        <div style={{ position: "relative", width: 232, height: 130, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.line}` }}>
          <div style={{ transform: `scale(${232 / APP_W})`, transformOrigin: "0 0" }}>
            <AcmeTitleCard subtitle={false} />
          </div>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="play" size={16} color="#fff" />
            </div>
          </AbsoluteFill>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { icon: "heart" as const, n: 12, at: 24 },
            { icon: "sparkles" as const, n: 8, at: 30 },
          ].map((r) => {
            const s = pop(t, r.at);
            return (
              <div key={r.icon} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, backgroundColor: `${C.magenta}22`, border: `1px solid ${C.magenta}55`, fontSize: 13, color: C.text, opacity: Math.min(1, s * 2), transform: `scale(${s})` }}>
                <Icon name={r.icon} size={14} color={C.pink} />
                {Math.round(r.n * Math.min(1, ramp(t, [r.at, r.at + 20], [0.2, 1])))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
