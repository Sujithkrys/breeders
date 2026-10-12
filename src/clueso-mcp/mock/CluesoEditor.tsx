import React from "react";
import { random } from "remotion";
import { CluesoMark } from "../../brand/Logos";
import { Icon, IconName } from "../icons";
import { C, FONT, GRADIENT } from "../theme";
import { Avatar, Bar, Chip, Cursor, Dot, Toggle, Waveform } from "../ui";
import { AcmeTitleCard, APP_H, APP_W, AppShot, EXPORT_BTN } from "./AppShot";

// Fictional Clueso editor. Designed at 1600×900; region constants let cameras frame parts of it.
export const ED_W = 1600;
export const ED_H = 900;
export const REGIONS = {
  timeline: { cx: 800, cy: 766 },
  script: { cx: 176, cy: 344 },
  preview: { cx: 816, cy: 323 },
  right: { cx: 1440, cy: 344 },
};
const PREVIEW = { x: 384, y: 80, w: 864, h: 486 };
const PREVIEW_SCALE = PREVIEW.w / APP_W;
const TRACK_X = 136;
const TRACK_W = 1448;

const SCRIPT = [
  { title: "Intro", text: "Meet bulk export — the fastest way to get your data out of Acme." },
  { title: "Select reports", text: "Tick the reports you need, or select them all in one click." },
  { title: "Export", text: "Hit Export, pick a format, and you're done." },
  { title: "Outro", text: "Bulk export is live today for every workspace." },
];

export const CAPTION_WORDS = "Tick the reports you need, or select them all in one click.".split(" ");

export type EditorState = {
  clips?: number;
  zooms?: number;
  captions?: number;
  voice?: number;
  music?: number;
  playhead?: number;
  previewZoom?: number;
  previewOrigin?: [number, number];
  showCaption?: number;
  activeWord?: number;
  titleCard?: number;
  brand?: number;
  scriptActive?: number;
  scriptProgress?: number;
  app?: { selected?: number; modal?: number; progress?: number; exportPressed?: boolean };
  previewCursor?: { x: number; y: number; press?: number; ripple?: number };
  exported?: number;
};

export const CluesoEditor: React.FC<EditorState> = (s) => {
  const {
    clips = 0,
    zooms = 0,
    captions = 0,
    voice = 0,
    music = 0,
    playhead = 0,
    previewZoom = 1,
    previewOrigin = [APP_W / 2, APP_H / 2],
    showCaption = 0,
    activeWord = -1,
    titleCard = 0,
    brand = 0,
    scriptActive = 1,
    scriptProgress = 1,
    app = {},
    previewCursor,
    exported = 0,
  } = s;

  const seconds = Math.round(playhead * 48);
  const tc = `00:${String(seconds).padStart(2, "0")}`;

  return (
    <div style={{ position: "relative", width: ED_W, height: ED_H, backgroundColor: "#0E0E12", fontFamily: FONT.sans, color: C.text, overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 14 }}>
        <CluesoMark size={24} />
        <span style={{ fontSize: 14, color: C.muted }}>Projects</span>
        <Icon name="chevronRight" size={14} color={C.faint} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Bulk export launch</span>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", padding: 3, borderRadius: 9, backgroundColor: C.surface2, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 500 }}>
          <div style={{ padding: "5px 16px", borderRadius: 7, backgroundColor: C.surface4, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="film" size={14} /> Video
          </div>
          <div style={{ padding: "5px 16px", color: C.muted, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="book" size={14} /> Article
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex" }}>
            <Avatar name="Maya Chen" size={28} />
            <div style={{ marginLeft: -8 }}>
              <Avatar name="Leo Park" size={28} />
            </div>
          </div>
          <div style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="share" size={14} /> Share
          </div>
          <div style={{ padding: "7px 16px", borderRadius: 8, backgroundImage: GRADIENT, fontSize: 13, fontWeight: 600, color: "#fff", display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="download" size={14} stroke={2.4} /> Export
          </div>
        </div>
      </div>

      {/* Script */}
      <div style={{ position: "absolute", left: 0, top: 56, width: 352, height: 576, borderRight: `1px solid ${C.line}`, padding: 20, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Script</span>
          <Chip style={{ fontSize: 12 }}>
            <Icon name="mic" size={13} color={C.pink} /> AI voice · Aria
          </Chip>
        </div>
        {SCRIPT.map((sec, i) => {
          const active = i === scriptActive;
          const visible = Math.max(0, Math.min(1, scriptProgress * SCRIPT.length - i));
          return (
            <div
              key={sec.title}
              style={{
                marginBottom: 12,
                padding: "12px 14px",
                borderRadius: 10,
                backgroundColor: active ? C.surface2 : "transparent",
                border: `1px solid ${active ? C.line : "transparent"}`,
                boxShadow: active ? `inset 3px 0 0 ${C.pink}` : undefined,
                opacity: 0.25 + 0.75 * visible,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 11, color: active ? C.pink : C.faint }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? C.text : C.text2 }}>{sec.title}</span>
                <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: 11, color: C.faint }}>0:{String(i * 12).padStart(2, "0")}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: active ? C.text2 : C.muted }}>
                {sec.text.slice(0, Math.round(sec.text.length * visible))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div style={{ position: "absolute", left: PREVIEW.x, top: PREVIEW.y, width: PREVIEW.w, height: PREVIEW.h, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.line}`, backgroundColor: "#fff" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: APP_W,
            height: APP_H,
            transformOrigin: "0 0",
            transform: `scale(${PREVIEW_SCALE}) translate(${previewOrigin[0]}px, ${previewOrigin[1]}px) scale(${previewZoom}) translate(${-previewOrigin[0]}px, ${-previewOrigin[1]}px)`,
          }}
        >
          <AppShot {...app} />
          {previewCursor ? <Cursor {...previewCursor} size={34} /> : null}
          {zooms > 0 && previewZoom > 1.02 ? (
            <div
              style={{
                position: "absolute",
                left: EXPORT_BTN.x - 10,
                top: EXPORT_BTN.y - 10,
                width: EXPORT_BTN.w + 20,
                height: EXPORT_BTN.h + 20,
                borderRadius: 12,
                border: `3px solid ${C.pink}`,
                boxShadow: `0 0 0 9999px rgba(10,10,20,${0.25 * (previewZoom - 1)})`,
              }}
            />
          ) : null}
        </div>
        {titleCard > 0 ? (
          <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "0 0" }}>
            <AcmeTitleCard reveal={titleCard} />
          </div>
        ) : null}
        {showCaption > 0 ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 28,
              transform: `translate(-50%, ${(1 - showCaption) * 20}px)`,
              opacity: showCaption,
              padding: "8px 16px",
              borderRadius: 10,
              backgroundColor: "rgba(10,10,14,0.82)",
              fontFamily: FONT.display,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {CAPTION_WORDS.map((w, i) => (
              <span
                key={i}
                style={{
                  color: i < activeWord ? "#fff" : i === activeWord ? "#fff" : "rgba(255,255,255,0.45)",
                  backgroundColor: i === activeWord ? C.magenta : "transparent",
                  borderRadius: 5,
                  padding: "0 3px",
                }}
              >
                {w}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {/* Transport */}
      <div style={{ position: "absolute", left: PREVIEW.x, width: PREVIEW.w, top: 580, height: 40, display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: C.muted }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="play" size={16} color={C.bg} />
        </div>
        <span style={{ fontFamily: FONT.mono, color: C.text }}>{tc}</span>
        <span style={{ fontFamily: FONT.mono }}>/ 00:48</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Chip>16:9</Chip>
          <Chip>1080p</Chip>
          <Chip>
            <Icon name="volume" size={13} /> 100%
          </Chip>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ position: "absolute", left: 1280, top: 56, width: 320, height: 576, borderLeft: `1px solid ${C.line}`, padding: 20, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", gap: 18, fontSize: 13, fontWeight: 600, borderBottom: `1px solid ${C.line}`, paddingBottom: 12 }}>
          <span style={{ color: C.muted }}>Style</span>
          <span style={{ color: C.text, borderBottom: `2px solid ${C.pink}`, paddingBottom: 11, marginBottom: -13 }}>Brand</span>
          <span style={{ color: C.muted }}>Captions</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#2F5BEA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={22} height={22} viewBox="0 0 24 24">
              <path d="M12 3L22 20H2z" fill="#fff" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Acme brand kit</span>
            <span style={{ fontSize: 12, color: C.muted }}>Logo, colors, fonts, intro</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Colors</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["#2F5BEA", "#0B1230", "#8FB0FF", "#FFFFFF", "#6A4CFF"].map((col, i) => {
              const on = brand > 0.15 + i * 0.12;
              return (
                <div key={col} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: col, border: `2px solid ${on ? C.pink : C.line}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 1 : 0.9})` }}>
                  {on ? <Icon name="check" size={16} color={col === "#FFFFFF" || col === "#8FB0FF" ? "#0B1230" : "#fff"} stroke={3} /> : null}
                </div>
              );
            })}
          </div>
        </div>
        {[
          { label: "Logo watermark", icon: "grid" as IconName, at: 0.3 },
          { label: "Intro & outro", icon: "film" as IconName, at: 0.5 },
          { label: "Brand font · Inter", icon: "type" as IconName, at: 0.7 },
          { label: "Background music", icon: "wave" as IconName, at: 0.85 },
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: brand > row.at ? C.text : C.muted }}>
            <Icon name={row.icon} size={18} color={brand > row.at ? C.pink : C.faint} />
            {row.label}
            <div style={{ marginLeft: "auto" }}>
              <Toggle on={Math.max(0, Math.min(1, (brand - row.at) * 8))} size={0.85} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: 14, borderRadius: 10, backgroundColor: C.surface2, border: `1px solid ${C.line}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Icon name="sparkles" size={18} color={C.pink} />
          <span style={{ fontSize: 13, lineHeight: 1.45, color: C.text2 }}>Applied by your AI agent via Clueso MCP</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 632, bottom: 0, borderTop: `1px solid ${C.line}`, backgroundColor: "#0B0B0F" }}>
        <div style={{ height: 40, display: "flex", alignItems: "center", gap: 18, padding: "0 20px", color: C.muted, borderBottom: `1px solid ${C.lineSoft}` }}>
          {(["scissors", "zoom", "captions", "type", "mic"] as IconName[]).map((ic) => (
            <Icon key={ic} name={ic} size={17} />
          ))}
          <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: 12 }}>{tc} / 00:48</span>
        </div>
        {/* Ruler */}
        <div style={{ position: "absolute", left: TRACK_X, width: TRACK_W, top: 44, height: 20 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: `${(i * 5 * 100) / 48}%`, top: 0, fontFamily: FONT.mono, fontSize: 11, color: C.faint, borderLeft: `1px solid ${C.line}`, paddingLeft: 4, height: 14 }}>
              0:{String(i * 5).padStart(2, "0")}
            </div>
          ))}
        </div>
        <Track y={68} h={60} label="Video" icon="film">
          {Array.from({ length: 6 }, (_, i) => {
            const p = Math.max(0, Math.min(1, clips * 6 - i));
            const x = i * (100 / 6);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `calc(${x}% + 2px)`,
                  width: `calc(${100 / 6}% - 4px)`,
                  top: 0,
                  bottom: 0,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `1.5px solid ${i === 0 ? "#3D6BFF" : "#3A3A46"}`,
                  display: "flex",
                  opacity: p,
                  transform: `translateX(${(1 - p) * 220}px)`,
                }}
              >
                {Array.from({ length: 4 }, (_, k) => (
                  <Thumb key={k} dark={i === 0} seed={`${i}${k}`} />
                ))}
              </div>
            );
          })}
        </Track>
        <Track y={134} h={28} label="Zoom" icon="zoom">
          {[0.14, 0.41, 0.7].map((x, i) => {
            const p = Math.max(0, Math.min(1, zooms * 3 - i));
            return (
              <div key={i} style={{ position: "absolute", left: `${x * 100}%`, width: "9%", top: 0, bottom: 0, borderRadius: 6, backgroundColor: `${C.magenta}CC`, fontFamily: FONT.mono, fontSize: 11, color: "#fff", display: "flex", alignItems: "center", paddingLeft: 8, opacity: p, transform: `scaleX(${p})`, transformOrigin: "0 50%" }}>
                1.6×
              </div>
            );
          })}
        </Track>
        <Track y={168} h={28} label="Captions" icon="captions">
          {Array.from({ length: 9 }, (_, i) => {
            const p = Math.max(0, Math.min(1, captions * 9 - i));
            return (
              <div key={i} style={{ position: "absolute", left: `${i * 11 + 0.5}%`, width: "10%", top: 0, bottom: 0, borderRadius: 6, backgroundColor: "#2B3A55", border: "1px solid #3B4F74", opacity: p, display: "flex", alignItems: "center", padding: "0 6px", overflow: "hidden" }}>
                <Bar w={`${55 + random(`cap${i}`) * 40}%`} h={5} color="#6F8BC0" />
              </div>
            );
          })}
        </Track>
        <Track y={202} h={28} label="Voice" icon="mic">
          <div style={{ position: "absolute", inset: 0, borderRadius: 6, backgroundColor: voice > 0 ? "#2C2233" : "transparent", display: "flex", alignItems: "center", padding: "0 6px", overflow: "hidden" }}>
            <Waveform width={TRACK_W - 12} height={22} seed="voice" progress={voice} color={C.pink} barW={2} gap={2} />
          </div>
        </Track>
        <Track y={236} h={24} label="Music" icon="wave">
          <div style={{ position: "absolute", inset: 0, borderRadius: 6, backgroundColor: music > 0 ? "#1F2A26" : "transparent", display: "flex", alignItems: "center", padding: "0 6px", overflow: "hidden" }}>
            <Waveform width={TRACK_W - 12} height={16} seed="music" progress={music} color="#5FB38A" barW={2} gap={3} />
          </div>
        </Track>
        {/* Playhead */}
        <div style={{ position: "absolute", left: TRACK_X + TRACK_W * playhead, top: 40, bottom: 0, width: 2, backgroundColor: C.text }}>
          <div style={{ position: "absolute", left: -6, top: 0, width: 14, height: 14, borderRadius: 3, backgroundColor: C.text }} />
        </div>
      </div>

      {/* Export ready dialog */}
      {exported > 0 ? (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(5,5,8,${0.6 * exported})` }}>
          <div
            style={{
              position: "absolute",
              left: ED_W / 2 - 300,
              top: ED_H / 2 - 250,
              width: 600,
              borderRadius: 18,
              backgroundColor: C.surface2,
              border: `1px solid ${C.line}`,
              boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
              padding: 24,
              opacity: exported,
              transform: `translateY(${(1 - exported) * 30}px) scale(${0.94 + 0.06 * exported})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.ok, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={16} color={C.bg} stroke={3} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 600 }}>Your video is ready</span>
            </div>
            <div style={{ position: "relative", width: 552, height: 310, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ transform: `scale(${552 / APP_W})`, transformOrigin: "0 0" }}>
                <AcmeTitleCard />
              </div>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="play" size={26} color="#fff" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, fontSize: 13, color: C.muted }}>
              <span>0:48</span>
              <Dot color={C.faint} size={4} />
              <span>1080p</span>
              <Dot color={C.faint} size={4} />
              <span>Captions · EN, ES, DE</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <div style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.line}`, color: C.text, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                  <Icon name="link" size={14} /> Copy link
                </div>
                <div style={{ padding: "8px 14px", borderRadius: 8, backgroundImage: GRADIENT, color: "#fff", fontWeight: 600 }}>Publish</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Track: React.FC<{ y: number; h: number; label: string; icon: IconName; children: React.ReactNode }> = ({ y, h, label, icon, children }) => (
  <>
    <div style={{ position: "absolute", left: 20, top: y, height: h, display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500, color: C.muted }}>
      <Icon name={icon} size={14} />
      {label}
    </div>
    <div style={{ position: "absolute", left: TRACK_X, width: TRACK_W, top: y, height: h }}>{children}</div>
  </>
);

// Tiny frame of the recording for the filmstrip.
const Thumb: React.FC<{ dark: boolean; seed: string }> = ({ dark, seed }) => (
  <div style={{ flex: 1, backgroundColor: dark ? "#0B1230" : "#fff", borderRight: "1px solid rgba(0,0,0,0.15)", position: "relative", overflow: "hidden" }}>
    {dark ? (
      <div style={{ position: "absolute", left: 6, top: 18, width: "60%", height: 8, borderRadius: 2, backgroundColor: "#fff" }} />
    ) : (
      <>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "18%", backgroundColor: "#F1F3F6" }} />
        <div style={{ position: "absolute", left: "24%", top: 8, width: "40%", height: 5, borderRadius: 2, backgroundColor: "#CBD2DC" }} />
        <div style={{ position: "absolute", right: 5, top: 7, width: "16%", height: 7, borderRadius: 2, backgroundColor: "#2F5BEA" }} />
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ position: "absolute", left: "24%", right: 5, top: 22 + r * 8, height: 3, borderRadius: 1, backgroundColor: random(seed + r) > 0.7 ? "#DCE5FF" : "#E8EBF0" }} />
        ))}
      </>
    )}
  </div>
);
