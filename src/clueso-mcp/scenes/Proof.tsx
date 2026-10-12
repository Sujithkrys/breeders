import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { ease, kf, pop, ramp, SPRING_SOFT, useT } from "../../utils";
import { Icon, IconName } from "../icons";
import { AcmeTitleCard, APP_W, AppShot } from "../mock/AppShot";
import { C, FONT } from "../theme";
import { Background, Camera } from "../ui";

// 0:30–0:37 — six use-case cards with live thumbnails fly in from depth (0.15s apart).
const CARD_W = 480;
const THUMB_H = 270;
const CARD_H = THUMB_H + 76;
const GAP = 32;
const STAGGER = 4.5;

const CARDS: { label: string; icon: IconName; dur: string; Thumb: React.FC<{ t: number }> }[] = [
  { label: "Feature launches", icon: "sparkles", dur: "0:48", Thumb: () => <Scaled><AcmeTitleCard /></Scaled> },
  { label: "Support videos", icon: "lifebuoy", dur: "1:12", Thumb: SupportThumb },
  { label: "Sales recaps", icon: "chart", dur: "2:05", Thumb: SalesThumb },
  { label: "Training", icon: "cap", dur: "6:30", Thumb: TrainingThumb },
  { label: "Onboarding", icon: "flag", dur: "1:40", Thumb: OnboardingThumb },
  { label: "Translations", icon: "languages", dur: "0:48", Thumb: TranslationThumb },
];

export const Proof: React.FC = () => {
  const t = useT();
  const gridW = 3 * CARD_W + 2 * GAP;
  const left0 = (1920 - gridW) / 2;
  const top0 = 540 - CARD_H - GAP / 2;

  return (
    <Background glowY={50}>
      <Camera ry={kf(t, [0, 210], [-9, 7], ease.linear)} rx={kf(t, [0, 210], [9, 3], ease.linear)} scale={kf(t, [0, 60, 210], [0.9, 0.96, 1.02])}>
        {CARDS.map((card, i) => {
          const delay = 4 + i * STAGGER;
          const s = pop(t, delay, SPRING_SOFT);
          const col = i % 3;
          const row = Math.floor(i / 3);
          const glow = ramp(t, [delay + 8, delay + 26], [1, 0]);
          const { Thumb } = card;
          return (
            <div
              key={card.label}
              style={{
                position: "absolute",
                left: left0 + col * (CARD_W + GAP),
                top: top0 + row * (CARD_H + GAP),
                width: CARD_W,
                height: CARD_H,
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: C.surface,
                border: `1px solid ${glow > 0.05 ? `${C.pink}AA` : C.line}`,
                boxShadow: `0 1px 0 rgba(255,255,255,0.07) inset, 0 30px 70px rgba(0,0,0,0.5), 0 0 ${40 * glow}px ${C.pink}55`,
                opacity: Math.min(1, s * 1.8),
                transform: s < 0.995 ? `perspective(1400px) translate3d(0, ${(1 - s) * 220}px, ${(1 - s) * -700}px) rotateX(${(1 - s) * 40}deg)` : undefined,
              }}
            >
              <div style={{ position: "relative", height: THUMB_H, overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
                <Thumb t={t - delay} />
              </div>
              <div style={{ height: 76, display: "flex", alignItems: "center", gap: 14, padding: "0 20px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={card.icon} size={20} color={C.pink} />
                </div>
                <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: C.text, letterSpacing: "-0.02em" }}>{card.label}</span>
                <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: 15, color: C.muted }}>{card.dur}</span>
              </div>
            </div>
          );
        })}
      </Camera>
    </Background>
  );
};

const Scaled: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: 720, transform: `scale(${CARD_W / APP_W})`, transformOrigin: "0 0" }}>{children}</div>
);

function SupportThumb({ t }: { t: number }) {
  const step = Math.floor(Math.max(0, t) / 14) % 3;
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", fontFamily: FONT.sans, padding: "22px 26px", color: "#1B1F29" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#2F5BEA", letterSpacing: "0.06em" }}>HELP CENTER · ACCOUNT</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 14px", letterSpacing: "-0.02em" }}>Reset your password</div>
      {["Open Settings › Security", "Click “Reset password”", "Check your inbox for the link"].map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, height: 36, padding: "0 10px", borderRadius: 8, backgroundColor: i === step ? "#EEF2FF" : "transparent", fontSize: 14 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: i === step ? "#2F5BEA" : "#E5E8EE", color: i === step ? "#fff" : "#5A6272", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
          {s}
        </div>
      ))}
      <div style={{ position: "absolute", right: 18, bottom: 16, display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, backgroundColor: "#0F172A", color: "#fff", fontSize: 12, fontWeight: 600 }}>
        <Icon name="play" size={11} color="#fff" /> Watch 1:12
      </div>
    </AbsoluteFill>
  );
}

function SalesThumb({ t }: { t: number }) {
  const bars = [0.42, 0.55, 0.5, 0.68, 0.74, 0.92];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0F1A", fontFamily: FONT.sans, padding: "22px 26px" }}>
      <div style={{ fontSize: 12, color: "#8C93A8", fontWeight: 500 }}>Weekly recap · Sales</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Q3 pipeline</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.ok }}>+18% QoQ</span>
      </div>
      <div style={{ position: "absolute", left: 26, right: 26, bottom: 22, height: 150, display: "flex", alignItems: "flex-end", gap: 14, borderBottom: "1px solid #2A2F45" }}>
        {bars.map((b, i) => {
          const g = ramp(t, [4 + i * 3, 20 + i * 3], [0, 1], ease.out);
          return <div key={i} style={{ flex: 1, height: `${b * 100 * g}%`, borderRadius: "6px 6px 0 0", background: i === bars.length - 1 ? "linear-gradient(180deg, #7FA0FF, #3D6BFF)" : "#2A3352" }} />;
        })}
      </div>
    </AbsoluteFill>
  );
}

function TrainingThumb({ t }: { t: number }) {
  const lessons = ["What is a report?", "Filters & segments", "Scheduling", "Exporting"];
  const progress = ramp(t, [0, 60], [0.25, 0.5], ease.linear);
  return (
    <AbsoluteFill style={{ backgroundColor: "#15121E", fontFamily: FONT.sans, padding: "22px 26px", color: "#fff" }}>
      <div style={{ fontSize: 12, color: "#B79CFF", fontWeight: 600, letterSpacing: "0.05em" }}>ACME ACADEMY · MODULE 2</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 12px", letterSpacing: "-0.02em" }}>Reports basics</div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: "#2B2640", marginBottom: 12 }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 3, backgroundColor: "#B79CFF" }} />
      </div>
      {lessons.map((l, i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, height: 30, fontSize: 14, color: i < 2 ? "#fff" : "#8A84A3" }}>
          {i < 2 ? <Icon name="check" size={15} color={C.ok} stroke={3} /> : <div style={{ width: 11, height: 11, margin: 2, borderRadius: 6, border: "2px solid #4A4466" }} />}
          {l}
        </div>
      ))}
    </AbsoluteFill>
  );
}

function OnboardingThumb({ t }: { t: number }) {
  const items = ["Connect your data source", "Invite your team", "Build your first report", "Schedule a digest"];
  const done = Math.floor(ramp(t, [6, 60], [1, 4], ease.linear));
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", fontFamily: FONT.sans, padding: "22px 26px", color: "#1B1F29" }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Welcome to Acme, Jordan</div>
      <div style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 12px" }}>{done} of 4 steps complete</div>
      {items.map((it, i) => (
        <div key={it} style={{ display: "flex", alignItems: "center", gap: 10, height: 34, fontSize: 14, color: i < done ? "#9AA1AE" : "#1B1F29", textDecoration: i < done ? "line-through" : "none" }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: i < done ? "#12A150" : "transparent", border: i < done ? "none" : "2px solid #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {i < done ? <Icon name="check" size={12} color="#fff" stroke={3.4} /> : null}
          </div>
          {it}
        </div>
      ))}
    </AbsoluteFill>
  );
}

function TranslationThumb({ t }: { t: number }) {
  const langs = [
    ["ES", "Exporta todos tus informes en un clic."],
    ["FR", "Exportez tous vos rapports en un clic."],
    ["DE", "Exportiere alle Berichte mit einem Klick."],
  ];
  const idx = Math.floor(Math.max(0, t) / 16) % langs.length;
  const local = (Math.max(0, t) % 16) / 16;
  const inP = interpolate(local, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Scaled>
        <AppShot selected={3} />
      </Scaled>
      <div style={{ position: "absolute", right: 14, top: 12, padding: "4px 10px", borderRadius: 999, backgroundColor: "#0F172A", color: "#fff", fontFamily: FONT.mono, fontSize: 13, fontWeight: 500 }}>
        {langs[idx][0]}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          transform: `translate(-50%, ${(1 - inP) * 10}px)`,
          opacity: inP,
          padding: "6px 12px",
          borderRadius: 8,
          backgroundColor: "rgba(10,10,14,0.85)",
          color: "#fff",
          fontFamily: FONT.display,
          fontWeight: 600,
          fontSize: 16,
          whiteSpace: "nowrap",
        }}
      >
        {langs[idx][1]}
      </div>
    </AbsoluteFill>
  );
}
