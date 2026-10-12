// Content Studio, rebuilt from the live screenshots (Sep 2026) at their native 1142×663 layout.
// The user's name and photo are replaced with the Breeders name and mark.
import React from "react";
import { BrandAvatar } from "../../brand/Breeders";
import { ease, ramp } from "../../utils";
import { graphemes, PixelArt, VOICE_HUES, VoiceAvatar } from "../kit";
import { C, FONT } from "../theme";

export const APP_W = 1142;
export const APP_H = 663;

const ui = (size: number, weight = 400, color: string = C.ink): React.CSSProperties => ({ fontFamily: FONT.ui, fontSize: size, fontWeight: weight, color, lineHeight: 1.3 });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });

// ---------- line icons ----------
const Ico: React.FC<{ d: string; size?: number; color?: string; sw?: number }> = ({ d, size = 16, color = C.ink2, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const I = {
  home: "M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z",
  tts: "M4 10h3l4-3.5v11L7 14H4zM15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10",
  dub: "M5 8.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.5a2 2 0 0 1 2-2zM9 4.5l3 3.5 3-3.5",
  library: "M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h11M10 8.5v4l3.2-2z",
  clone: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 15c1-2 2.2-3 4-3s3 1 4 3M12 7.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM17 6.5l1.2 1.2",
  stt: "M4 6V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v1M20 18v1a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-1M8 10h8M8 14h5",
  news: "M4 10v4l3 .5L15 19V5L7 9.5zM15 9a3 3 0 0 1 0 6M7 14.5l1.2 4.5",
  usage: "M12 3a9 9 0 1 0 9 9h-9zM14 3.3A9 9 0 0 1 20.7 10H14z",
  docs: "M6 4h9l3 3v13H6zM9 10h6M9 14h6M9 17h4",
  sidebar: "M4 5h16v14H4zM9.5 5v14",
  wallet: "M4 8h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 8l11-3.5V8M16.5 13.5h.5",
  chat: "M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8.5 10.5h.5M12 10.5h.5M15.5 10.5h.5",
  history: "M4 12a8 8 0 1 0 2.4-5.7M4 4v3.5h3.5M12 8v4.5l3 2",
  chevron: "M7 10l5 5 5-5",
  upload: "M12 16V5M7.5 9.5L12 5l4.5 4.5M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16",
  gift: "M4 10h16v3H4zM5 13h14v7H5zM12 10v10M12 10c-1-3-5-4.5-5.5-2S10 10 12 10zM12 10c1-3 5-4.5 5.5-2S14 10 12 10z",
  close: "M6 6l12 12M18 6L6 18",
  heart: "M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z",
  gear: "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8",
  search: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20",
  mic: "M9 4.5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM6 10.5a6 6 0 0 0 12 0M12 16.5V20",
  play: "M8 5.5v13l10.5-6.5z",
  plus: "M12 5v14M5 12h14",
  copy: "M9 9h10v10H9zM5 15V5h10",
  check: "M5 12.5l4.5 4.5L19 7.5",
  refresh: "M19 12a7 7 0 1 1-2.1-5M19 4v4h-4",
  calendar: "M5 6h14v14H5zM5 10h14M9 4v4M15 4v4",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14",
};

// Pill button
const Pill: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ children, dark, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 36,
      padding: "0 16px",
      borderRadius: 18,
      background: dark ? C.ink : C.white,
      border: dark ? "none" : `1px solid ${C.line}`,
      ...ui(14.5, 500, dark ? C.white : C.ink),
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- rail + sidebar ----------
const RAIL_ART = [
  ["..aaa..", ".aaaaa.", "aa.a.aa", "aaaaaaa", ".a.a.a.", ".aaaaa.", "..a.a.."],
  ["..aa.aa..", ".a.....a.", ".a.....a.", "a.......a", ".a.....a.", ".a.....a.", "..aa.aa.."].map((r) => r.slice(1, 8)),
  ["..aaa..", ".aaaaa.", "aa.a.aa", "aaaaaaa", "aaaaa.a", ".aaa.a.", "..a...."],
  ["a..a..a", ".a.a.a.", "..aaa..", "aaaaaaa", "..aaa..", ".a.a.a.", "a..a..a"],
  ["aa...aa", "a.....a", "a.....a", "a.....a", "a.....a", "a.....a", "aa...aa"],
];
const STUDIO_FLOWER = [
  "..a.a..",
  ".abbba.",
  "abcccba",
  ".bcwcb.",
  "abcccba",
  ".abbba.",
  "..a.a..",
];

export const NAV = ["Text to Speech", "Dubbing", "Voice Library", "Voice Cloning", "Speech to Text"] as const;
export type Page = "home" | "tts" | "dub" | "library" | "clone" | "stt";
const NAV_PAGE: Page[] = ["tts", "dub", "library", "clone", "stt"];
const NAV_ICON = [I.tts, I.dub, I.library, I.clone, I.stt];

export const NAV_Y = (i: number) => 188 + i * 38; // centre y of each product row

export const AppFrame: React.FC<{
  page: Page;
  t?: number;
  navAt?: number;
  tooltip?: number;
  hoverNav?: number;
  headerRight?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ page, t = 99, navAt = -99, tooltip = 0, hoverNav = -1, headerRight, title, children }) => (
  <div style={{ position: "relative", width: APP_W, height: APP_H, background: C.stage, borderRadius: 18, overflow: "hidden" }}>
    {/* rail */}
    <div style={abs(8, 8, { width: 56, height: 647, background: C.white, borderRadius: 14 })}>
      <div style={abs(14, 18, { width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      </div>
      {RAIL_ART.map((p, i) => {
        const yy = [96, 140, 184, 272, 316][i];
        return (
          <div key={i} style={abs(18, yy - 8)}>
            <PixelArt pattern={p} palette={{ a: "#B9B9BE" }} cell={2.9} />
          </div>
        );
      })}
      <div style={abs(8, 208, { width: 40, height: 40, borderRadius: 12, background: "#F3F3F3", display: "flex", alignItems: "center", justifyContent: "center" })}>
        <PixelArt pattern={STUDIO_FLOWER} palette={{ a: "#F3A6C4", b: "#E86C9E", c: "#D8467F", w: "#FFFFFF" }} cell={3.3} />
      </div>
      <div style={abs(19, 566)}>
        <Ico d={I.wallet} size={18} color={C.muted} />
      </div>
      <div style={abs(14, 612)}>
        <BrandAvatar size={30} />
      </div>
    </div>
    {tooltip > 0 ? (
      <div
        style={abs(68, 219, {
          padding: "7px 12px",
          borderRadius: 8,
          background: C.ink,
          ...ui(13, 500, C.white),
          opacity: tooltip,
          transform: `translateX(${(1 - tooltip) * -6}px)`,
          whiteSpace: "nowrap",
        })}
      >
        Content Studio
      </div>
    ) : null}
    {/* sidebar + main card */}
    <div style={abs(66, 8, { width: 1068, height: 647, background: C.white, borderRadius: 14, overflow: "hidden" })}>
      <div style={abs(0, 0, { width: 250, height: 647, borderRight: `1px solid ${C.line}` })}>
        <div style={abs(24, 20, { ...ui(20, 400), letterSpacing: "-0.01em" })}>Content Studio</div>
        <div style={abs(207, 24)}>
          <Ico d={I.sidebar} size={17} color={C.ink2} />
        </div>
        <NavRow top={76} icon={I.home} label="Home" active={page === "home"} hover={false} p={1} />
        <div style={abs(24, 133, ui(14.5, 400, C.muted))}>Products</div>
        {NAV.map((label, i) => {
          const p = ramp(t, [navAt + i * 0.1, navAt + i * 0.1 + 0.4], [0, 1], ease.out);
          return <NavRow key={label} top={NAV_Y(i) - 18} icon={NAV_ICON[i]} label={label} active={page === NAV_PAGE[i]} hover={hoverNav === i} p={p} />;
        })}
        <div style={abs(24, 534, { display: "flex", alignItems: "center", gap: 8 })}>
          <Ico d={I.news} />
          <span style={ui(14.5)}>What&apos;s new</span>
          <span style={{ ...ui(11.5, 500, C.newText), background: C.newBg, borderRadius: 10, padding: "2px 8px" }}>New</span>
        </div>
        <div style={abs(24, 571, { display: "flex", alignItems: "center", gap: 8 })}>
          <Ico d={I.usage} />
          <span style={ui(14.5)}>Usage</span>
        </div>
        <div style={abs(24, 607, { display: "flex", alignItems: "center", gap: 8 })}>
          <Ico d={I.docs} />
          <span style={ui(14.5)}>Documentation</span>
        </div>
      </div>
      <div style={abs(277, 22, ui(16, 400))}>{title}</div>
      <div style={abs(0, 14, { right: 28, left: "auto", display: "flex", gap: 8 })}>{headerRight}</div>
      <div style={abs(250, 0, { width: 818, height: 647 })}>{children}</div>
    </div>
  </div>
);

const NavRow: React.FC<{ top: number; icon: string; label: string; active: boolean; hover: boolean; p: number }> = ({ top, icon, label, active, hover, p }) => (
  <div
    style={abs(12, top, {
      width: 224,
      height: 36,
      borderRadius: 18,
      background: active ? "#EDEDED" : hover ? C.hover : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 8,
      paddingLeft: 12,
      opacity: p,
      transform: `translateX(${(1 - p) * -14}px)`,
    })}
  >
    <Ico d={icon} />
    <span style={ui(14.5)}>{label}</span>
  </div>
);

export const Credits = () => (
  <Pill>
    <Ico d={I.wallet} size={17} /> 3,688 Credits
  </Pill>
);
export const Feedback = () => (
  <Pill>
    <Ico d={I.chat} size={17} /> Feedback
  </Pill>
);
export const HistoryBtn = () => (
  <Pill>
    <Ico d={I.history} size={17} /> History
  </Pill>
);

// ---------- pages ----------
const PRODUCT_ART: { pattern: string[]; pal: Record<string, string> }[] = [
  { pattern: ["aaaaaaaaa", "a.......a", "a.bbbbb.a", "a.......a", "aaaaaaaaa", "..a...a..", ".aaaaaaa."], pal: { a: "#D95B8C", b: "#E98DB0" } },
  { pattern: ["...aa....", "..aaaa...", "..aaaa...", "...aa....", ".bbbbbb..", "b.b..b.b.", ".b.bb.b.."], pal: { a: "#4F8A3A", b: "#7AB25F" } },
  { pattern: ["aa.......", "aa.bbbbb.", "aa.......", "aaaa.....", "aa.bbbb..", "aa.......", "aa.bbb..."], pal: { a: "#E77C3C", b: "#F2A775" } },
  { pattern: ["aaaaaaa..", "a.....a.b", "a.bbb.a..", "a.....a.b", "aaaaaaa..", "...a.....", "..aaa...."], pal: { a: "#B8487A", b: "#DB84AA" } },
];

export const HomePage: React.FC = () => (
  <>
    <div style={abs(147, 113, { width: 522, height: 238, borderRadius: 20, border: `1px solid ${C.line}`, overflow: "hidden" })}>
      <div style={abs(28, 86, { ...ui(25, 400), letterSpacing: "-0.01em" })}>Video Dubbing</div>
      <div style={abs(28, 126, ui(14.5, 400, "#55555B"))}>Dub any video into 12 Indian languages with AI-powered dubbing.</div>
      <Pill dark style={abs(28, 174)}>Get Started</Pill>
      <div style={abs(424, 36, { width: 110, height: 150, borderRadius: 8, border: `1px solid ${C.line}`, overflow: "hidden", background: "#fff" })}>
        <div style={abs(6, 20, { width: 98, height: 100, borderRadius: 4, background: "linear-gradient(135deg, #C98E5E 0%, #8E5A36 45%, #D8B48C 100%)" })} />
      </div>
      <div style={abs(380, 188, { width: 160, height: 40, background: "radial-gradient(ellipse at 60% 100%, rgba(120,120,255,0.18), transparent 70%)" })} />
    </div>
    <div style={abs(147, 402, ui(17, 600))}>Start creating</div>
    {[
      ["Video...", "Dub any video into 12 Indian languages."],
      ["Voice...", "Clone your voice in just 3 simple steps."],
      ["Speech to...", "Upload audio and get text in any Indian"],
      ["Text to...", "Type anything and hear it in your"],
    ].map(([h, b], i) => (
      <div key={h} style={abs(147 + i * 133, 445, { width: 125, height: 200, borderRadius: 16, border: `1px solid ${C.line}`, padding: "18px 18px" })}>
        <PixelArt pattern={PRODUCT_ART[i].pattern} palette={PRODUCT_ART[i].pal} cell={4.4} />
        <div style={{ ...ui(15, 600), marginTop: 16 }}>{h}</div>
        <div style={{ ...ui(14.5, 400, "#55555B"), marginTop: 8, lineHeight: 1.45 }}>{b}</div>
      </div>
    ))}
  </>
);

export const TTS_TEXT =
  "नमस्ते! Sarvam AI में आपका स्वागत है।\n\nहम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।\n\nआप अपना text type कर सकते हैं या different voices को try करने के लिए किसी भी voice card पर play button पर click कर सकते हैं। तो चलिए, अपनी भाषा में AI की ताकत experience करें!";
export const TTS_LEN = graphemes(TTS_TEXT).length;

export const VOICES: { name: string; g: "Male" | "Female"; d: string; hue: keyof typeof VOICE_HUES }[] = [
  { name: "Shubh", g: "Male", d: "Friendly default voice...", hue: "indigo" },
  { name: "Ritu", g: "Female", d: "Warm voice for customer...", hue: "green" },
  { name: "Amit", g: "Male", d: "Formal voice for business...", hue: "crimson" },
  { name: "Sumit", g: "Male", d: "Balanced warmth with...", hue: "mustard" },
  { name: "Pooja", g: "Female", d: "Encouraging voice for...", hue: "orange" },
  { name: "Manan", g: "Male", d: "Calm and composed voice...", hue: "crimson" },
];

export const TTSPage: React.FC<{ chars: number; voice: number; hoverVoice?: number; generating?: number; t?: number }> = ({ chars, voice, hoverVoice = -1, generating = 0, t = 0 }) => {
  const shown = graphemes(TTS_TEXT).slice(0, chars).join("");
  const count = Math.round(384 * (chars / TTS_LEN));
  return (
    <>
      <div style={abs(24, 88, { width: 158, height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" })}>
        <span style={ui(15)}>Hindi</span>
        <Ico d={I.chevron} size={16} color={C.muted} />
      </div>
      <div style={abs(203, 97, ui(14.5, 400, "#6B6B72"))}>{count}/32,000 · 3,500/line</div>
      <div style={abs(24, 172, { height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 30px 0 12px" })}>
        <VoiceAvatar hue={VOICE_HUES[VOICES[voice].hue]} size={20} />
        <span style={ui(15)}>{VOICES[voice].name}</span>
      </div>
      <div style={abs(163, 172, { width: 318, ...ui(15, 400), lineHeight: "22px", whiteSpace: "pre-wrap" })}>
        {shown}
        {chars < TTS_LEN && chars > 0 ? <span style={{ display: "inline-block", width: 1.5, height: 18, background: C.ink, verticalAlign: "-3px", opacity: Math.floor(t * 3) % 2 ? 0.2 : 1 }} /> : null}
      </div>
      <div style={abs(24, 470, ui(14.5, 400, C.muted))}>Try out some examples</div>
      <div style={abs(24, 498, { display: "flex", gap: 8 })}>
        {["Podcast intro", "Interview", "Ad reel", "Learning tip"].map((x) => (
          <div key={x} style={{ ...ui(14.5), background: C.pill, borderRadius: 16, padding: "6px 12px" }}>
            {x}
          </div>
        ))}
      </div>
      <div style={abs(24, 546, { width: 448, height: 68, borderRadius: 34, border: `1px solid ${C.line}` })}>
        <div style={abs(16, 16, { width: 36, height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
          <Ico d={I.gear} size={17} />
        </div>
        <div style={abs(64, 15, { width: 368, height: 38, borderRadius: 19, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, ...ui(14.5, 500, C.white) })}>
          {generating > 0 ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ transform: `rotate(${t * 400}deg)` }}>
                <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </div>
      </div>
      {/* voices panel */}
      <div style={abs(500, 64, { width: 318, height: 583, borderLeft: `1px solid ${C.line}` })}>
        <div style={abs(26, 34, ui(18, 500))}>Voices</div>
        <div style={abs(270, 38)}>
          <Ico d={I.close} size={16} />
        </div>
        <div style={abs(14, 84, { width: 288, height: 40, borderBottom: `1px solid ${C.line}` })}>
          <div style={abs(12, 8, ui(15, 500))}>Explore Voices</div>
          <div style={abs(0, 38, { width: 120, height: 2, background: C.ink })} />
          <div style={abs(133, 8, ui(15, 400, "#55555B"))}>My Voices</div>
        </div>
        <div style={abs(14, 148, { display: "flex", gap: 8 })}>
          <Pill style={{ height: 38 }}>
            All genres <Ico d={I.chevron} size={14} color={C.muted} />
          </Pill>
          <Pill style={{ height: 38 }}>
            <Ico d={I.heart} size={16} /> Favorites
          </Pill>
        </div>
        {VOICES.map((v, i) => (
          <div
            key={v.name}
            style={abs(14, 208 + i * 69, {
              width: 278,
              height: 64,
              borderRadius: 12,
              background: i === voice ? C.hover : i === hoverVoice ? "#F8F8F8" : "transparent",
              borderBottom: i === voice ? "none" : `1px solid ${C.line}`,
            })}
          >
            <div style={abs(12, 12)}>
              <VoiceAvatar hue={VOICE_HUES[v.hue]} size={40} seed={v.name} />
            </div>
            <div style={abs(64, 10, { display: "flex", alignItems: "center", gap: 6 })}>
              <span style={ui(13.5, 600)}>{v.name}</span>
              <span style={{ ...ui(11.5, 500, v.g === "Male" ? C.maleText : C.femaleText), background: v.g === "Male" ? C.maleBg : C.femaleBg, borderRadius: 8, padding: "1px 7px" }}>{v.g}</span>
            </div>
            <div style={abs(64, 33, ui(14, 400, "#6B6B72"))}>{v.d}</div>
            {i === voice ? (
              <div style={abs(248, 22)}>
                <Ico d={I.check} size={16} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};

export const DubbingPage: React.FC<{ dragOver?: number }> = ({ dragOver = 0 }) => (
  <>
    <div style={abs(27, 91, ui(17, 600))}>Start a dub</div>
    <div
      style={abs(27, 139, {
        width: 762,
        height: 292,
        borderRadius: 24,
        border: `1.5px dashed ${dragOver > 0.5 ? "#9A9AA2" : "#D6D6DA"}`,
        background: dragOver > 0 ? `rgba(240,240,244,${0.6 + dragOver * 0.4})` : "#FAFAFA",
      })}
    >
      <div style={abs(362, 62, { width: 38, height: 38, borderRadius: 10, background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center" })}>
        <Ico d={I.upload} size={18} />
      </div>
      <div style={abs(0, 120, { width: 762, textAlign: "center", ...ui(14.5, 500) })}>Drag and drop or</div>
      <div style={abs(0, 143, { width: 762, textAlign: "center", ...ui(14.5, 400, "#55555B") })}>Audio or video file, up to 2GB or 1 hour</div>
      <Pill dark style={abs(342, 195, { height: 36 })}>Upload</Pill>
    </div>
    <div style={abs(27, 494, ui(17, 600))}>See dubbing in action</div>
    {["linear-gradient(160deg,#6E7B62,#2E3A2C)", "linear-gradient(160deg,#4E6E9E,#1F2F4A)", "linear-gradient(160deg,#8C7A6A,#3B332D)"].map((bg, i) => (
      <div key={i} style={abs(27 + i * 259, 542, { width: 245, height: 110, borderRadius: 12, background: bg })}>
        <div style={abs(104, 70, { width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" })}>
          <Ico d={I.play} size={14} color="#fff" />
        </div>
      </div>
    ))}
  </>
);

export const DubbingHeader = () => (
  <>
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 30, marginTop: 3, padding: "0 12px", borderRadius: 15, background: C.offerBg, ...ui(14, 500, C.offerText) }}>
      <Ico d={I.gift} size={15} color={C.offerText} /> 30 min free dubbed output
    </div>
    <Feedback />
    <Pill dark>
      <Ico d={I.plus} size={16} color="#fff" /> New dub
    </Pill>
  </>
);

export const GiftPopup: React.FC<{ p: number; press?: number }> = ({ p, press = 0 }) =>
  p <= 0 ? null : (
    <>
      <div style={abs(0, 0, { width: APP_W, height: APP_H, background: `rgba(120,120,120,${0.32 * Math.min(1, p)})`, backdropFilter: `blur(${4 * Math.min(1, p)}px)` })} />
      <div
        style={abs(347, 157, {
          width: 448,
          height: 350,
          borderRadius: 22,
          background: C.white,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
          transform: `scale(${0.9 + 0.1 * p}) translateY(${(1 - p) * 20}px)`,
          opacity: Math.min(1, p * 1.5),
        })}
      >
        <div style={abs(0, 0, { width: 448, height: 150, background: "#EDEDED" })}>
          <div style={abs(200, 51, { width: 48, height: 48, borderRadius: 24, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" })}>
            <Ico d={I.gift} size={24} />
          </div>
          <div style={abs(406, 27)}>
            <Ico d={I.close} size={16} />
          </div>
        </div>
        <div style={abs(24, 172, { ...ui(25, 400), letterSpacing: "-0.01em" })}>You got 30 free minutes</div>
        <div style={abs(24, 212, { width: 380, ...ui(15, 400, "#55555B"), lineHeight: 1.45 })}>Congrats! Your account includes 30 minutes of free dubbing time. Upload a video to try it.</div>
        <Pill style={abs(202, 290, { background: C.pill, border: "none" })}>Got it</Pill>
        <Pill dark style={abs(276, 290, { transform: `scale(${1 - press * 0.05})` })}>
          Start dubbing now
        </Pill>
      </div>
    </>
  );

const FEATURED: { title: string; sub: string; bg: string; pattern: string[]; pal: Record<string, string> }[] = [
  { title: "Swami an...", sub: "English ·...", bg: "#FFF7F3", pattern: ["..a....", "..a....", ".aaa...", ".aaa.b.", ".aaabbb", ".aaa.b.", ".aaa...", ".aaa..."], pal: { a: "#E4602E", b: "#F29A6B" } },
  { title: "Godan", sub: "Hindi · Ritu", bg: "#FFF4D9", pattern: [".aaaaa.", "aaaaaaa", "aaaaaaa", "...b...", "...b...", "..bbb..", ".bbbbb."], pal: { a: "#C99A1E", b: "#E0B84F" } },
  { title: "Pather...", sub: "Bengali ·...", bg: "#F6F6FF", pattern: ["..aaa..", ".a...a.", "a.bbb.a", "a.bbb.a", "a.bbb.a", ".a...a.", "..aaa.."], pal: { a: "#3B45C4", b: "#6C79E8" } },
  { title: "Ponniyin...", sub: "Tamil ·...", bg: "#FFF1F4", pattern: ["a.a.a.a", "aaaaaaa", "aaaaaaa", ".aaaaa.", "..aaa..", "...a...", "......."], pal: { a: "#B3264F" } },
];
const LIB_TABS = ["Audiobooks", "Podcasts", "Education", "Marketing"];

export const LibraryPage: React.FC<{ hover?: number; t?: number; cardsAt?: number }> = ({ hover = -1, t = 99, cardsAt = -99 }) => (
  <>
    <div style={abs(147, 113, { width: 130, ...ui(17, 600), lineHeight: 1.3 })}>Featured voices</div>
    <div style={abs(277, 120, { display: "flex", gap: 4 })}>
      {LIB_TABS.map((x, i) => (
        <div key={x} style={{ ...ui(14.5), padding: "7px 16px", borderRadius: 18, background: i === 0 ? C.pill : "transparent" }}>
          {x}
        </div>
      ))}
    </div>
    {FEATURED.map((f, i) => {
      const p = ramp(t, [cardsAt + i * 0.09, cardsAt + i * 0.09 + 0.45], [0, 1], ease.out);
      const lift = i === hover ? -6 : 0;
      return (
        <div
          key={f.title}
          style={abs(147 + i * 133, 179, {
            width: 125,
            height: 238,
            borderRadius: 14,
            border: `1px solid ${C.line}`,
            overflow: "hidden",
            background: C.white,
            opacity: p,
            transform: `translateY(${(1 - p) * 24 + lift}px)`,
            boxShadow: i === hover ? "0 14px 30px rgba(0,0,0,0.10)" : "none",
          })}
        >
          <div style={abs(0, 0, { width: 125, height: 148, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center" })}>
            <PixelArt pattern={f.pattern} palette={f.pal} cell={5} t={t} at={cardsAt + i * 0.09} spread={0.4} seed={f.title} />
          </div>
          <div style={abs(20, 166, ui(15, 600))}>{f.title}</div>
          <div style={abs(20, 196, ui(14.5, 400, "#6B6B72"))}>{f.sub}</div>
        </div>
      );
    })}
    <div style={abs(147, 467, ui(17, 600))}>Voices</div>
    <div style={abs(147, 504, { width: 522, height: 42, borderBottom: `1px solid ${C.line}` })}>
      <div style={abs(0, 10, ui(15, 500))}>Explore voices</div>
      <div style={abs(0, 40, { width: 120, height: 2, background: C.ink })} />
      <div style={abs(132, 10, ui(15, 400, "#55555B"))}>My voices</div>
    </div>
    <div style={abs(147, 570, { width: 240, height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 14px" })}>
      <Ico d={I.search} size={16} color={C.muted} />
      <span style={ui(15, 400, C.muted)}>Search</span>
    </div>
    {[399, 531].map((x) => (
      <div key={x} style={abs(x, 570, { width: 120, height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" })}>
        <span style={ui(15)}>All</span>
        <Ico d={I.chevron} size={14} color={C.muted} />
      </div>
    ))}
  </>
);

export const ClonePage: React.FC<{ card: number; t?: number }> = ({ card, t = 99 }) => (
  <>
    <div style={abs(119, 136, { width: 64, height: 64, borderRadius: 32, background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center" })}>
      <Ico d={I.plus} size={22} />
    </div>
    {card > 0 ? (
      <div
        style={abs(284, 92, {
          width: 248,
          height: 170,
          borderRadius: 14,
          background: "#F7F7F7",
          opacity: Math.min(1, card * 1.4),
          transform: `translateY(${(1 - card) * 26}px) scale(${0.94 + 0.06 * card})`,
        })}
      >
        <div style={abs(20, 20)}>
          <VoiceAvatar hue={VOICE_HUES.indigo} size={40} t={t} at={0} seed="breeders" />
        </div>
        <div style={abs(20, 82, ui(15, 600))}>Breeders</div>
        <div style={abs(20, 110, ui(14.5, 400, "#55555B"))}>Telugu · Conversational</div>
        <div style={abs(20, 142, { display: "flex", alignItems: "center", gap: 6 })}>
          <span style={ui(14, 400, "#8A8A90")}>Voice ID</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 13.5, color: "#8A8A90" }}>svc-3f5eb2c2-...</span>
          <span style={{ marginLeft: 16 }}>
            <Ico d={I.copy} size={15} />
          </span>
        </div>
      </div>
    ) : null}
  </>
);

export const STT_TEXT = "नमस्ते! Sarvam AI में आपका स्वागत है। हम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं।";

export const STTPage: React.FC<{ rec?: number; chars?: number; t?: number }> = ({ rec = 0, chars = 0, t = 0 }) => (
  <>
    <div style={abs(43, 116, { width: 720, height: 293, borderRadius: 24, border: "1.5px dashed #D6D6DA", background: "#FAFAFA" })}>
      <div style={abs(341, 62, { width: 38, height: 38, borderRadius: 10, background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center" })}>
        <Ico d={I.upload} size={18} />
      </div>
      <div style={abs(0, 120, { width: 720, textAlign: "center", ...ui(14.5, 500) })}>Drag and drop or click to upload</div>
      <div style={abs(0, 143, { width: 720, textAlign: "center", ...ui(14.5, 400, "#55555B") })}>Audio file, up to 100 MB or 1 hour</div>
      <Pill dark style={abs(322, 195)}>Upload</Pill>
    </div>
    <div style={abs(0, 420, { width: 806, textAlign: "center", ...ui(14.5, 400, C.muted) })}>or</div>
    <div style={abs(0, 452, { width: 806, display: "flex", justifyContent: "center" })}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 16px", borderRadius: 18, background: rec > 0 ? "#FDECEC" : "transparent", ...ui(14.5, 500, rec > 0 ? "#C62828" : C.ink) }}>
        {rec > 0 ? <div style={{ width: 9, height: 9, borderRadius: 5, background: "#E53935", opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * 5)) }} /> : <Ico d={I.mic} size={17} />}
        {rec > 0 ? `Recording  0:0${Math.min(9, Math.floor(rec * 4))}` : "Record audio"}
      </div>
    </div>
    <div style={abs(43, 513, ui(17, 600))}>Try some examples</div>
    {[
      { p: ["aaaaa", "a.a.a", "aaaaa", "a.a.a", "aaaaa", "a.a.a", "aaaaa"], c: "#3B45C4" },
      { p: ["...aa", "..aa.", ".aaa.", "aaa..", "aa...", "a....", "....."], c: "#4F8A3A" },
      { p: [".aaa.", ".aaa.", "aaaaa", "aaaaa", ".aaa.", ".aaa.", "....."], c: "#C7327A" },
    ].map((x, i) => (
      <div key={i} style={abs(43 + i * 245, 552, { width: 235, height: 110, borderRadius: 16, border: `1px solid ${C.line}`, padding: 24 })}>
        <PixelArt pattern={x.p} palette={{ a: x.c }} cell={6} />
      </div>
    ))}
    {chars > 0 ? (
      <div
        style={abs(43, 116, {
          width: 720,
          height: 293,
          borderRadius: 24,
          background: C.white,
          border: `1px solid ${C.line}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
          padding: 28,
        })}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={ui(15, 600)}>Transcript</span>
          <span style={{ ...ui(12.5, 500, C.newText), background: C.newBg, borderRadius: 9, padding: "2px 9px" }}>Hindi</span>
        </div>
        <div style={{ ...ui(19, 400), lineHeight: 1.6 }}>{graphemes(STT_TEXT).slice(0, chars).join("")}</div>
      </div>
    ) : null}
  </>
);
export const STT_LEN = graphemes(STT_TEXT).length;

const HISTORY_ROWS = [
  ["Hello everyone! Ee dress first look lone...", "Roopa · 39.0s · 26 Sep, 4:18 PM"],
  ["Hello everyone! Ee dress first look-lone...", "Roopa · 44.0s · 26 Sep, 4:17 PM"],
  ["Hi everyone! Ee dress choodataniki...", "Roopa · 33.0s · 26 Sep, 4:14 PM"],
  ["Hi everyone! Ee dress choodataniki...", "Roopa · 37.0s · 26 Sep, 4:13 PM"],
  ["Hi everyone! Ee dress choodataniki...", "Rupali · 39.0s · 26 Sep, 4:13 PM"],
  ["Hi everyone! Ee dress choodataniki...", "Tanya · 42.0s · 26 Sep, 4:12 PM"],
  ["Hi everyone! Ee dress choodataniki...", "Roopa · 35.0s · 26 Sep, 4:12 PM"],
];

export const HistoryDrawer: React.FC<{ p: number; t?: number; at?: number }> = ({ p, t = 99, at = 0 }) =>
  p <= 0 ? null : (
    <>
      <div style={abs(0, 0, { width: APP_W, height: APP_H, background: `rgba(120,120,120,${0.3 * p})`, backdropFilter: `blur(${3 * p}px)` })} />
      <div style={abs(534, 8, { width: 600, height: 647, borderRadius: 14, background: C.white, transform: `translateX(${(1 - p) * 620}px)`, overflow: "hidden", boxShadow: "-20px 0 60px rgba(0,0,0,0.08)" })}>
        <div style={abs(17, 17, ui(18, 500))}>History</div>
        <div style={abs(558, 21)}>
          <Ico d={I.close} size={16} />
        </div>
        <div style={abs(0, 57, { width: 600, height: 1, background: C.line })} />
        <div style={abs(31, 84, { width: 538, height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 14px" })}>
          <Ico d={I.search} size={16} color={C.muted} />
          <span style={ui(15, 400, C.muted)}>Search by text, voice...</span>
        </div>
        <div style={abs(31, 128, { display: "flex", alignItems: "center", gap: 4, background: "#F2F2F2", borderRadius: 18, padding: 3 })}>
          {["All", "Sarvam", "Cloned"].map((x, i) => (
            <div key={x} style={{ ...ui(14.5), padding: "5px 12px", borderRadius: 15, background: i === 0 ? C.white : "transparent" }}>
              {x}
            </div>
          ))}
        </div>
        <div style={abs(229, 128, { height: 36, borderRadius: 18, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 20, padding: "0 14px" })}>
          <span style={ui(15)}>All languages</span>
          <Ico d={I.chevron} size={14} color={C.muted} />
        </div>
        <div style={abs(483, 137, { display: "flex", alignItems: "center", gap: 6, ...ui(12.5, 400, C.muted) })}>
          18 results <Ico d={I.refresh} size={14} />
        </div>
        <div style={abs(31, 182, ui(12, 400, C.muted))}>2d ago</div>
        {HISTORY_ROWS.map(([a, b], i) => {
          const rp = ramp(t, [at + i * 0.06, at + i * 0.06 + 0.35], [0, 1], ease.out);
          return (
            <div key={i} style={abs(17, 202 + i * 59, { width: 566, height: 58, borderBottom: `1px solid ${C.line}`, opacity: rp, transform: `translateY(${(1 - rp) * 10}px)` })}>
              <div style={abs(14, 16, { width: 28, height: 28, borderRadius: 14, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
                <Ico d={I.play} size={11} />
              </div>
              <div style={abs(52, 9, ui(15, 500))}>&ldquo;{a}</div>
              <div style={abs(52, 32, ui(12.5, 400, C.muted))}>{b}</div>
              <div style={abs(368, 17, { ...ui(12.5, 500), border: `1px solid ${C.line}`, borderRadius: 12, padding: "2px 10px", background: "#FAFAFA" })}>Sarvam</div>
              <div style={abs(436, 17, { ...ui(12.5, 400, C.muted), border: `1px solid ${C.line}`, borderRadius: 12, padding: "2px 10px" })}>Telugu</div>
            </div>
          );
        })}
      </div>
    </>
  );
