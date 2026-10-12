import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, ramp } from "../../utils";
import { AppStage, Cam } from "../AppStage";
import { cursorAt, Cursor, Roller, springAt, Stage, TopCaption, track, useS } from "../kit";
import { AppFrame, Credits, DubbingHeader, DubbingPage, Feedback, GiftPopup, HomePage, NAV_Y } from "../mock/Studio";
import { C, FONT } from "../theme";

// Continuity between the workspace and dubbing scenes: the camera and cursor hand over exactly.
const HANDOFF_CAM: Cam = { z: 1.06, fx: 500, fy: 331 };
const DUB_ROW: [number, number] = [158, NAV_Y(1) + 8];

// 0:08–0:12 — the app floats in; products drop into the sidebar; the cursor finds Content Studio.
export const Workspace: React.FC = () => {
  const t = useS();
  const enter = ramp(t, [0, 0.75], [0, 1], ease.out);
  const cam: Cam = { z: track(t, [[0, 1], [4, HANDOFF_CAM.z]]), fx: track(t, [[0, 571], [4, HANDOFF_CAM.fx]]), fy: 331 };
  const cur = cursorAt(t, [
    [1.0, 1010, 740],
    [1.85, 36, 236],
    [2.9, 36, 236],
    [3.6, DUB_ROW[0], DUB_ROW[1]],
  ]);
  const tip = ramp(t, [1.95, 2.2], [0, 1], ease.out) * (1 - ramp(t, [2.85, 3.05], [0, 1]));
  return (
    <AbsoluteFill>
      <AppStage cam={cam} enter={enter}>
        <AppFrame page="home" title="Home" t={t} navAt={0.45} tooltip={tip} hoverNav={t > 3.5 ? 1 : -1} headerRight={<><Credits /><Feedback /></>}>
          <HomePage />
        </AppFrame>
        <Cursor {...cur} opacity={ramp(t, [1.0, 1.2], [0, 1])} size={26} />
      </AppStage>
      <TopCaption text="One workspace. Every language." t={t} at={0.5} out={3.45} />
    </AbsoluteFill>
  );
};

export const DUB_LANGS = ["हिंदी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "ଓଡ଼ିଆ"];
export const DUB = { click: 0.3, popup: 0.6, start: 2.05, grab: 2.9, drop: 3.7, upload: 4.2, card: 4.4, gen: 5.0, ready: 6.2, roll: 6.7, step: 0.3 };

const Mp4File: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <div style={{ position: "absolute", left: x - 34, top: y - 44, width: 68, height: 86, opacity: o, transform: `scale(${s}) rotate(-6deg)`, zIndex: 40 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(180deg,#8A8A90,#5E5E64)", boxShadow: "0 14px 30px rgba(0,0,0,0.25)" }} />
    <div style={{ position: "absolute", right: 0, top: 0, width: 20, height: 20, background: "#B7B7BD", borderBottomLeftRadius: 8 }} />
    <div style={{ position: "absolute", left: 14, bottom: 12, padding: "2px 7px", borderRadius: 5, background: "#1E1E22", color: "#fff", fontFamily: FONT.ui, fontSize: 13, fontWeight: 600 }}>.MP4</div>
  </div>
);

// 0:12–0:22 — Dubbing: gift popup → drag an MP4 in → Upload → "Generating…" → the dub rolls through languages.
export const Dubbing: React.FC = () => {
  const t = useS();
  const D = DUB;
  const page = t >= D.click + 0.03 ? "dub" : "home";
  const popup = springAt(t, D.popup, { damping: 14, stiffness: 170, mass: 0.7 }) * (1 - ramp(t, [D.start + 0.2, D.start + 0.45], [0, 1], ease.in));
  const cam: Cam = {
    z: track(t, [[0, HANDOFF_CAM.z], [0.55, HANDOFF_CAM.z], [1.25, 1.32], [2.3, 1.32], [2.95, 1.12], [4.3, 1.16]]),
    fx: track(t, [[0, HANDOFF_CAM.fx], [0.55, HANDOFF_CAM.fx], [1.25, 571], [2.3, 571], [2.95, 650]]),
    fy: track(t, [[0.55, 331], [1.25, 332], [2.3, 332], [2.95, 318]]),
  };
  const cur = cursorAt(
    t,
    [
      [0, DUB_ROW[0], DUB_ROW[1]],
      [0.9, DUB_ROW[0], DUB_ROW[1]],
      [1.75, 700, 468],
      [2.2, 700, 468],
      [2.85, 1175, 540],
      [2.95, 1175, 540],
      [3.6, 728, 302],
      [3.75, 728, 302],
      [4.1, 700, 362],
    ],
    [D.click, D.start, D.upload],
  );
  const held = t >= D.grab && t < D.drop;
  const fileIn = ramp(t, [2.4, 2.7], [0, 1], ease.out);
  const dropP = ramp(t, [D.drop, D.drop + 0.25], [0, 1], ease.in);
  const fx = held || t >= D.drop ? cur.x + 26 : 1201;
  const fy = held || t >= D.drop ? cur.y + 30 : 570;
  const dragOver = ramp(t, [3.3, 3.6], [0, 1]) * (1 - ramp(t, [D.drop + 0.1, D.drop + 0.4], [0, 1]));
  const appOut = ramp(t, [4.35, 4.8], [0, 1], ease.in);

  return (
    <AbsoluteFill>
      {t < 4.85 ? (
        <AppStage cam={cam} opacity={1 - appOut} filter={appOut > 0.01 ? `blur(${appOut * 6}px)` : undefined}>
          <AppFrame page={page} title={page === "dub" ? "Dubbing" : "Home"} hoverNav={t < D.click ? 1 : -1} headerRight={page === "dub" ? <DubbingHeader /> : <><Credits /><Feedback /></>}>
            {page === "dub" ? <DubbingPage dragOver={dragOver} /> : <HomePage />}
          </AppFrame>
          <GiftPopup p={popup} press={cur.press * (t < 2.3 ? 1 : 0)} />
          {t > 2.3 ? <Mp4File x={fx} y={fy} s={(held ? 1.08 : 1) * (1 - dropP * 0.5)} o={fileIn * (1 - dropP)} /> : null}
          <Cursor {...cur} size={26} />
        </AppStage>
      ) : (
        <Stage />
      )}
      {t > D.card ? <DubCard t={t} /> : null}
      <TopCaption text="Dub any video into 12 Indian languages." t={t} at={0.45} out={4.1} />
      <TopCaption text="One video. Many languages. Same voice." t={t} at={6.4} out={9.5} />
    </AbsoluteFill>
  );
};

const DubCard: React.FC<{ t: number }> = ({ t }) => {
  const D = DUB;
  const grow = springAt(t, D.card, { damping: 16, stiffness: 120, mass: 0.9 });
  const shift = ramp(t, [D.ready, D.ready + 0.65], [0, 1], ease.inOut);
  const leave = ramp(t, [9.5, 9.9], [0, 1], ease.in);
  const gen = t >= D.gen && t < D.ready;
  const prog = ramp(t, [D.gen, D.ready - 0.1], [0, 1], ease.inOut);
  const play = ramp(t, [D.ready, D.ready + 0.3], [0, 1], ease.out);
  const k = Math.max(0, (t - D.roll) / D.step);
  const idx = Math.min(DUB_LANGS.length - 1, Math.floor(k));
  const pos = Math.min(DUB_LANGS.length - 1, idx + ease.inOut(Math.min(1, (k - idx) / 0.6)));
  const rollIn = ramp(t, [D.roll - 0.3, D.roll + 0.1], [0, 1], ease.out);
  const W = 1040, H = 585;
  return (
    <AbsoluteFill style={{ opacity: 1 - leave }}>
      <div
        style={{
          position: "absolute",
          left: 960 - W / 2,
          top: 575 - H / 2,
          width: W,
          height: H,
          borderRadius: 34,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.orange1} 0%, #F08A36 45%, ${C.orange2} 100%)`,
          boxShadow: "0 40px 90px rgba(180,80,10,0.22)",
          transform: `translateX(${-300 * shift}px) scale(${(0.5 + 0.5 * grow) * (1 - 0.2 * shift)})`,
          opacity: Math.min(1, grow * 1.6),
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(255,255,255,0.22), transparent 70%)" }} />
        {gen ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: "rgba(90,40,5,0.18)" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" style={{ transform: `rotate(${t * 360}deg)` }}>
              <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.4" />
              <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: FONT.ui, fontSize: 30, fontWeight: 500, color: "#fff" }}>Generating...</span>
          </div>
        ) : null}
        {t >= D.ready ? (
          <div style={{ position: "absolute", left: W / 2 - 60, top: H / 2 - 60, width: 120, height: 120, borderRadius: 60, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * play})`, opacity: play }}>
            <svg width="46" height="46" viewBox="0 0 24 24">
              <path d="M8 5.5v13l10.5-6.5z" fill={C.orange2} />
            </svg>
          </div>
        ) : null}
        {t >= D.ready ? (
          <div style={{ position: "absolute", left: 60, top: 48, display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 24, background: "rgba(255,255,255,0.92)", fontFamily: FONT.ui, fontSize: 26, fontWeight: 500, color: C.ink, opacity: play }}>
            <span style={{ color: C.muted }}>Dubbed in</span> {DUB_LANGS[Math.round(pos)]}
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.35)" }}>
          <div style={{ width: `${(gen ? prog : t >= D.ready ? ramp(t, [D.ready, 9.9], [0.02, 0.6], (v) => v) : 0) * 100}%`, height: 7, borderRadius: 4, background: "#fff" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1290, top: 575, width: 560, transform: "translateY(-50%)", opacity: rollIn }}>
        <Roller items={DUB_LANGS} pos={pos} size={84} />
      </div>
    </AbsoluteFill>
  );
};
