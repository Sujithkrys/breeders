import React from "react";
import { CluesoMark } from "../brand/Logos";
import { AcmeTitleCard, APP_H, APP_W, AppShot, EXPORT_BTN } from "../clueso-mcp/mock/AppShot";
import { ease, kf, ramp } from "../utils";
import { Pointer } from "../pine-launch/kit";
import { SANS } from "../pine-launch/theme";
import { MAG } from "./theme";

// The feature video Clueso generates in the demo: Acme "Bulk export" launch.
// 1920×1080, driven by explicit local time `t` (30fps units) so the editor preview and montage can play it too.
export const FILM_LEN = 210;
export const CAPTIONS: Record<string, string> = {
  EN: "Tick the reports you need, or select them all in one click.",
  ES: "Marca los informes que necesitas, o selecciónalos todos con un clic.",
  DE: "Wähle die Berichte, die du brauchst, oder alle mit einem Klick.",
  FR: "Cochez les rapports utiles, ou sélectionnez-les tous en un clic.",
  PT: "Marque os relatórios que precisa, ou selecione todos com um clique.",
};
const S = 1920 / APP_W;
const NAVY = "#0B1230";

export const Caption: React.FC<{ text: string; progress: number; size?: number }> = ({ text, progress, size = 34 }) => {
  const words = text.split(" ");
  const active = Math.min(words.length - 1, Math.floor(progress * words.length));
  return (
    <div style={{ maxWidth: 1300, padding: "14px 26px", borderRadius: 16, background: "rgba(12,12,20,0.78)", fontFamily: SANS, fontSize: size, fontWeight: 600, lineHeight: 1.35, textAlign: "center", letterSpacing: "-0.01em" }}>
      {words.map((w, i) => (
        <span key={i} style={{ color: i <= active ? "#fff" : "rgba(255,255,255,0.45)", background: i === active ? MAG : "transparent", borderRadius: 8, padding: "0 6px", margin: "0 1px" }}>
          {w}
        </span>
      ))}
    </div>
  );
};

const App: React.FC<{ k: number; lang: string }> = ({ k, lang }) => {
  const Z = [0, 36, 56, 64, 80, 120];
  const z = kf(k, Z, [1, 1, 2.1, 2.1, 1.35, 1.35], ease.inOut);
  const half = [960 / (S * z), 540 / (S * z)];
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const fx = clamp(kf(k, Z, [640, 640, EXPORT_BTN.cx, EXPORT_BTN.cx, 640, 640], ease.inOut), half[0], APP_W - half[0]);
  const fy = clamp(kf(k, Z, [360, 360, EXPORT_BTN.cy + 80, EXPORT_BTN.cy + 80, 380, 380], ease.inOut), half[1], APP_H - half[1]);
  const cx = kf(k, [8, 30, 44, 60], [760, 420, 700, EXPORT_BTN.cx], ease.inOut);
  const cy = kf(k, [8, 30, 44, 60], [520, 300, 420, EXPORT_BTN.cy], ease.inOut);
  const press = ramp(k, [60, 62], [0, 1]) * ramp(k, [62, 66], [1, 0]);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, transformOrigin: "0 0", transform: `translate(${960 - fx * S * z}px, ${540 - fy * S * z}px) scale(${S * z})` }}>
        <AppShot selected={Math.floor(ramp(k, [14, 34], [0, 4], ease.linear))} exportPressed={k >= 60 && k < 66} modal={ramp(k, [64, 72], [0, 1], ease.out)} progress={ramp(k, [74, 108], [0, 1], ease.inOut)} />
        <Pointer x={cx} y={cy} size={20} press={press} opacity={ramp(k, [6, 10]) * ramp(k, [100, 106], [1, 0])} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: ramp(k, [2, 6]) }}>
        <Caption text={CAPTIONS[lang] ?? CAPTIONS.EN} progress={ramp(k, [4, 110], [0, 1], ease.linear)} />
      </div>
    </div>
  );
};

const End: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", inset: 0, background: NAVY, overflow: "hidden", fontFamily: SANS }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 80% 10%, #3D6BFF88 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 10% 110%, #6A4CFF55 0%, transparent 60%)" }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ width: 84, height: 84, borderRadius: 22, background: "#2F5BEA", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ramp(k, [0, 8], [0.6, 1], ease.outBack)})`, opacity: ramp(k, [0, 4]) }}>
        <svg width={46} height={46} viewBox="0 0 24 24">
          <path d="M12 3L22 20H2z" fill="#fff" />
        </svg>
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontFamily: "Geist, Inter, sans-serif", fontWeight: 700, fontSize: 150, color: "#fff", letterSpacing: "-0.045em", lineHeight: 1, transform: `translateY(${(1 - ramp(k, [4, 16], [0, 1], ease.out)) * 105}%)` }}>Bulk export</div>
      </div>
      <div style={{ fontSize: 38, color: "#B9C6E8", opacity: ramp(k, [12, 20]), transform: `translateY(${ramp(k, [12, 22], [14, 0])}px)` }}>Live today for every Acme workspace.</div>
    </div>
    <div style={{ position: "absolute", right: 56, bottom: 44, display: "flex", alignItems: "center", gap: 10, fontSize: 20, color: "rgba(255,255,255,0.6)", opacity: ramp(k, [18, 26]) }}>
      <CluesoMark size={22} /> Made with Clueso
    </div>
  </div>
);

export const CluesoFilm: React.FC<{ t: number; lang?: string }> = ({ t, lang = "EN" }) => (
  <div style={{ position: "relative", width: 1920, height: 1080, overflow: "hidden", background: NAVY }}>
    {t < 30 ? (
      <div style={{ position: "absolute", inset: 0, transform: `scale(${kf(t, [0, 30], [1.06, 1], ease.out)})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, transform: `scale(${S})`, transformOrigin: "0 0" }}>
          <AcmeTitleCard reveal={ramp(t, [0, 10], [0, 1], ease.inOut)} />
        </div>
      </div>
    ) : t < 150 ? (
      <App k={t - 30} lang={lang} />
    ) : (
      <End k={t - 150} />
    )}
  </div>
);
