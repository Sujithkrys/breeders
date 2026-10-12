// Claude Sonnet 5.5 — a 30s product demo, horizontal. No story: the new model is announced → we open Claude, switch the
// model to Sonnet 5.5 → and do four real tasks in fast cuts (a website, a board deck, a sales analysis with a chart,
// a trip plan), each output shown in Claude's artifact panel → the numbers → the name. The Claude app is rebuilt
// faithfully (light theme, sidebar, composer, model menu, artifact panel) with a real macOS pointer; the camera
// pushes, glides and whip-cuts on the beat (musicdream, 136 BPM, from its second drop). Facts from Anthropic's
// announcement (Sept 28, 2026); the tasks' contents are example data.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../brand/Breeders";
import { ClaudeMark } from "../brand/Logos";
import { Icon } from "../clueso-mcp/icons";
import { Cam, Pointer } from "../pine-launch/kit";
import { springAt } from "../sarvam-live/kit";
import { ease, kf, ramp } from "../utils";

// ---------- type & colour (the Claude app, light) ----------
const UI = "Inter, sans-serif";
const DISP = "'Inter Tight', Inter, sans-serif";
const C = { page: "#FAF9F5", side: "#F3F1EA", ink: "#141413", sub: "#5E5D59", faint: "#8F8D86", line: "#E7E4DC", clay: "#D97757", send: "#C96442", cream: "#F0EEE6", hover: "#ECE9E0" };

// ---------- beat grid ----------
const BEAT = 60 / 136;
const b = (n: number) => n * BEAT;
const TASK0 = b(15);
const TASK_LEN = b(9);
export const D = { intro: 0, open: b(6), model: b(9), tasks: TASK0, stats: b(51), end: b(60), total: 30 };
export const DEMO = { fps: 60, width: 1920, height: 1080, seconds: D.total };
const inR = (s: number, a: number, z: number) => s >= a && s < z;

// ---------- shots: whip-cut in (horizontal motion blur), slow drift while holding ----------
const Shot: React.FC<{ s: number; at: number; until: number; children: React.ReactNode; whip?: 1 | -1 | 0; bg?: string }> = ({ s, at, until, children, whip = 1, bg = C.page }) => {
  if (!inR(s, at, until)) return null;
  const k = whip ? ramp(s, [at, at + 0.2], [0, 1], ease.out) : 1;
  const blur = (1 - k) * 40;
  const id = `wd${Math.round(at * 100)}`;
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${(1 - k) * 240 * whip}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
// a line of display type rising out of a mask
const Rise: React.FC<{ s: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode; align?: "left" | "center" }> = ({ s, at, size, color = C.ink, weight = 600, children, align = "center" }) => {
  const k = ramp(s, [at, at + 0.55], [0, 1], ease.out);
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.14, marginBottom: -size * 0.14, textAlign: align }}>
      <div style={{ fontFamily: DISP, fontSize: size, fontWeight: weight, letterSpacing: size > 120 ? "-0.05em" : "-0.035em", lineHeight: 1.0, color, whiteSpace: "nowrap", transform: `translateY(${(1 - k) * 105}%)` }}>{children}</div>
    </div>
  );
};

// ---------- the browser and the Claude app ----------
const Browser: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 40, top: 30, width: 1840, height: 1020, borderRadius: 14, overflow: "hidden", background: C.page, boxShadow: "0 30px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)", fontFamily: UI }}>
    <div style={{ height: 52, background: "#EDEBE5", display: "flex", alignItems: "center", gap: 18, padding: "0 18px", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 14px", borderRadius: 9, background: "#FAF9F5", fontSize: 14, color: C.sub, width: 230 }}>
        <ClaudeMark size={14} color={C.clay} /> Claude
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 560, height: 32, borderRadius: 8, background: "#E3E0D8", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, color: C.sub }}>
          <Icon name="eye" size={13} color={C.faint} /> claude.ai
        </div>
      </div>
      <div style={{ width: 230 }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 52, bottom: 0 }}>{children}</div>
  </div>
);
const RECENTS = ["Kiln & Co. landing page", "Q3 board deck", "Regional sales review", "Goa trip, March", "Hiring plan"];
const Sidebar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 290, background: C.side, borderRight: `1px solid ${C.line}`, padding: "20px 14px", boxSizing: "border-box", fontFamily: UI }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", fontFamily: DISP, fontSize: 24, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}>Claude</div>
    <div style={{ marginTop: 24, height: 42, display: "flex", alignItems: "center", gap: 12, padding: "0 10px", fontSize: 15, fontWeight: 500, color: C.ink }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, background: C.clay, display: "grid", placeItems: "center" }}>
        <Icon name="plus" size={15} color="#fff" stroke={2.6} />
      </div>
      New chat
    </div>
    {[["message", "Chats"], ["layers", "Projects"], ["grid", "Artifacts"]].map(([ic, l]) => (
      <div key={l} style={{ height: 40, display: "flex", alignItems: "center", gap: 12, padding: "0 12px", fontSize: 15, color: C.sub }}>
        <Icon name={ic as "message"} size={18} color={C.sub} stroke={2} /> {l}
      </div>
    ))}
    <div style={{ marginTop: 18, padding: "0 12px", fontSize: 12, fontWeight: 600, color: C.faint }}>Recents</div>
    {RECENTS.map((r) => (
      <div key={r} style={{ height: 36, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 14, color: C.sub, whiteSpace: "nowrap", overflow: "hidden" }}>{r}</div>
    ))}
    <div style={{ position: "absolute", left: 14, right: 14, bottom: 18, display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderTop: `1px solid ${C.line}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: C.ink, color: "#fff", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600 }}>D</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Dev</div>
        <div style={{ fontSize: 12, color: C.faint }}>Max plan</div>
      </div>
    </div>
  </div>
);
const Composer: React.FC<{ text?: string; caret?: boolean; model: string; send?: number; width?: number; menuOpen?: boolean; modelHover?: number }> = ({ text, caret, model, send = 0, width = 820, modelHover = 0 }) => (
  <div style={{ width, borderRadius: 22, background: "#FFFFFF", border: `1px solid ${C.line}`, boxShadow: "0 4px 20px rgba(20,20,19,0.05)", padding: "18px 14px 12px 22px", boxSizing: "border-box", fontFamily: UI }}>
    <div style={{ minHeight: 52, fontSize: 18, lineHeight: "27px", color: text ? C.ink : C.faint }}>
      {text || "How can I help you today?"}
      {caret ? <span style={{ display: "inline-block", width: 2, height: 21, marginLeft: 1, background: C.ink, verticalAlign: "-4px" }} /> : null}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 34, marginTop: 6 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, display: "grid", placeItems: "center", marginLeft: -6 }}>
        <Icon name="plus" size={17} color={C.sub} stroke={2} />
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, display: "grid", placeItems: "center" }}>
        <Icon name="sliders" size={16} color={C.sub} stroke={2} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 32, padding: "0 10px", borderRadius: 8, background: modelHover ? `rgba(20,20,19,${0.06 * modelHover})` : undefined, fontSize: 15, color: C.ink }}>
        {model} <Icon name="chevronDown" size={15} color={C.sub} stroke={2} />
      </div>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: text ? C.send : "#E8C2B4", display: "grid", placeItems: "center", transform: `scale(${1 - send * 0.12})` }}>
        <Icon name="arrowUp" size={18} color="#fff" stroke={2.4} />
      </div>
    </div>
  </div>
);
const MODELS: [string, string, boolean][] = [
  ["Opus 5.5", "For complex, long-running work", false],
  ["Sonnet 5.5", "Fast and capable for everyday work", true],
  ["Haiku 4.5", "Fastest for quick answers", false],
];
const ModelMenu: React.FC<{ p: number; hover: number; picked: boolean }> = ({ p, hover, picked }) => (
  <div style={{ width: 380, borderRadius: 14, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 16px 40px rgba(20,20,19,0.14)", padding: 6, fontFamily: UI, opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 8}px) scale(${0.97 + 0.03 * p})`, transformOrigin: "50% 100%" }}>
    {MODELS.map(([name, sub, hero]) => (
      <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 9, background: hero ? `rgba(20,20,19,${0.05 * hover})` : undefined }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: C.ink }}>
            {name}
            {hero ? <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "#F6E2D9", color: C.send }}>New</span> : null}
          </div>
          <div style={{ fontSize: 13, color: C.faint, marginTop: 2 }}>{sub}</div>
        </div>
        {(hero && picked) || (name === "Opus 5.5" && !picked) ? <Icon name="check" size={18} color={C.send} stroke={2.4} /> : null}
      </div>
    ))}
    <div style={{ height: 1, background: C.line, margin: "4px 8px" }} />
    <div style={{ padding: "10px 12px", fontSize: 14, color: C.sub, display: "flex", justifyContent: "space-between" }}>
      More models <Icon name="chevronRight" size={14} color={C.faint} />
    </div>
  </div>
);

// ---------- the four tasks and their outputs ----------
type Task = { label: string; prompt: string; reply: string; file: string; kind: string; icon: "layers" | "grid" | "file" | "globe"; Out: React.FC<{ k: number }> };
const Vase: React.FC<{ w: number; h: number; c1: string; c2: string; neck?: number }> = ({ w, h, c1, c2, neck = 0.35 }) => (
  <div style={{ position: "relative", width: w, height: h }}>
    <div style={{ position: "absolute", left: w * (0.5 - neck / 2), top: 0, width: w * neck, height: h * 0.25, borderRadius: `${w * 0.06}px ${w * 0.06}px 0 0`, background: `linear-gradient(90deg, ${c2}, ${c1} 40%, ${c2})` }} />
    <div style={{ position: "absolute", left: 0, top: h * 0.18, width: w, height: h * 0.82, borderRadius: `${w * 0.48}px ${w * 0.48}px ${w * 0.3}px ${w * 0.3}px`, background: `radial-gradient(ellipse 60% 55% at 35% 35%, ${c1}, ${c2} 85%)`, boxShadow: `inset -${w * 0.08}px -${w * 0.05}px ${w * 0.15}px rgba(0,0,0,0.18)` }} />
  </div>
);
const WebsiteOut: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", inset: 0, background: "#F6F1EA", fontFamily: UI, overflow: "hidden" }}>
    <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 44px", gap: 30, fontSize: 15, color: "#3A3530" }}>
      <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em" }}>Kiln & Co.</span>
      <span style={{ flex: 1 }} />
      {["Shop", "Studio", "Workshops", "Journal"].map((x) => (
        <span key={x}>{x}</span>
      ))}
    </div>
    <div style={{ position: "absolute", left: 44, top: 140, width: 470, opacity: ramp(k, [0.05, 0.25]) }}>
      <div style={{ fontSize: 13, letterSpacing: "0.18em", color: "#9A6A4C" }}>HANDMADE CERAMICS</div>
      <div style={{ fontFamily: DISP, fontSize: 64, fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1.0, color: "#2A2420", marginTop: 14 }}>Made by hand, fired with care.</div>
      <div style={{ fontSize: 17, lineHeight: 1.6, color: "#6B625A", marginTop: 18 }}>Small-batch stoneware from our studio in Goa. Every piece is thrown, glazed and fired by hand.</div>
      <div style={{ display: "inline-block", marginTop: 26, padding: "14px 26px", borderRadius: 30, background: "#2A2420", color: "#F6F1EA", fontSize: 15, fontWeight: 600 }}>Shop the collection</div>
    </div>
    <div style={{ position: "absolute", right: 40, top: 110, width: 400, height: 430, borderRadius: 22, background: "linear-gradient(160deg, #E7D3BF, #D3B79C)", overflow: "hidden", opacity: ramp(k, [0.2, 0.4]) }}>
      <div style={{ position: "absolute", left: 60, bottom: 50 }}>
        <Vase w={150} h={250} c1="#F3EDE4" c2="#C9BBA8" />
      </div>
      <div style={{ position: "absolute", left: 220, bottom: 50 }}>
        <Vase w={120} h={170} c1="#C47A55" c2="#8E4B2E" neck={0.45} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(60,40,25,0.18))" }} />
    </div>
    <div style={{ position: "absolute", left: 44, right: 40, top: 590, display: "flex", gap: 20, opacity: ramp(k, [0.45, 0.65]) }}>
      {[["Sand bowl", "₹1,800", "#E9DCCB", "#BFA88C"], ["Ember mug", "₹1,200", "#D08A64", "#93532F"], ["Sea vase", "₹3,400", "#B9C9C5", "#7E9692"]].map(([n, p, a, z]) => (
        <div key={n} style={{ flex: 1, borderRadius: 16, background: "#EFE6DA", padding: 16 }}>
          <div style={{ height: 120, display: "grid", placeItems: "center" }}>
            <Vase w={90} h={110} c1={a} c2={z} neck={0.6} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#2A2420", marginTop: 10 }}>
            <span style={{ fontWeight: 600 }}>{n}</span>
            {p}
          </div>
        </div>
      ))}
    </div>
  </div>
);
const DeckOut: React.FC<{ k: number }> = ({ k }) => {
  const idx = Math.min(3, Math.floor(k * 4));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#E9E6DF", fontFamily: UI, display: "flex" }}>
      <div style={{ width: 150, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 70, borderRadius: 6, background: i === 0 ? "#1E1C1A" : "#fff", border: `2px solid ${i === idx ? C.clay : "transparent"}`, opacity: ramp(k, [i * 0.1, i * 0.1 + 0.1]) }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: "34px 30px 34px 10px" }}>
        <div style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", background: idx === 0 ? "#1E1C1A" : "#fff" }}>
          {idx === 0 ? (
            <div style={{ position: "absolute", left: 50, bottom: 60 }}>
              <ClaudeMark size={34} color={C.clay} />
              <div style={{ fontFamily: DISP, fontSize: 84, fontWeight: 600, letterSpacing: "-0.05em", color: "#F3EEE6", marginTop: 90 }}>Q3 Review</div>
              <div style={{ fontSize: 20, color: "#A39D93" }}>Board meeting · October 2026</div>
            </div>
          ) : idx === 1 ? (
            <div style={{ padding: 46 }}>
              <div style={{ fontSize: 15, letterSpacing: "0.16em", color: "#9A958C" }}>REVENUE</div>
              <div style={{ fontFamily: DISP, fontSize: 56, fontWeight: 600, letterSpacing: "-0.04em", color: C.ink }}>Up 29% in Q3</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 30, height: 230, marginTop: 30 }}>
                {[0.55, 0.72, 1].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h * 100 * ramp(k, [0.25, 0.45], [0, 1], ease.out)}%`, borderRadius: "8px 8px 0 0", background: i === 2 ? C.clay : "#DDD8CE" }} />
                ))}
              </div>
            </div>
          ) : idx === 2 ? (
            <div style={{ padding: 46, display: "flex", gap: 40 }}>
              <div>
                <div style={{ fontSize: 15, letterSpacing: "0.16em", color: "#9A958C" }}>MARGIN</div>
                <div style={{ fontFamily: DISP, fontSize: 130, fontWeight: 600, letterSpacing: "-0.05em", color: C.ink }}>33.7%</div>
                <div style={{ fontSize: 22, color: C.sub }}>September, a record month</div>
              </div>
              <div style={{ width: 240, height: 240, borderRadius: 120, marginTop: 30, background: `conic-gradient(${C.clay} 0 34%, #E7E2D8 34% 100%)` }} />
            </div>
          ) : (
            <div style={{ padding: 46 }}>
              <div style={{ fontFamily: DISP, fontSize: 56, fontWeight: 600, letterSpacing: "-0.04em", color: C.ink }}>Next quarter</div>
              {["Open two new markets", "Launch the self-serve plan", "Keep margins above 32%"].map((x, i) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: C.ink, marginTop: i ? 20 : 36 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 7, background: C.clay }} /> {x}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const REGIONS: [string, number][] = [["North", 312], ["South", 486], ["East", 228], ["West", 395]];
const SalesOut: React.FC<{ k: number }> = ({ k }) => {
  const max = 486;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: UI, padding: 36, boxSizing: "border-box" }}>
      <div style={{ fontSize: 14, letterSpacing: "0.14em", color: C.faint }}>REVENUE BY REGION · Q3 (₹ LAKH)</div>
      <div style={{ fontFamily: DISP, fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em", color: C.ink, marginTop: 6 }}>South leads, East needs attention</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 34, height: 360, marginTop: 40, borderBottom: `2px solid ${C.line}`, padding: "0 20px" }}>
        {REGIONS.map(([r, v], i) => {
          const g = ramp(k, [0.1 + i * 0.07, 0.45 + i * 0.07], [0, 1], ease.out);
          return (
            <div key={r} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 10, opacity: g, fontVariantNumeric: "tabular-nums" }}>{Math.round(v * g)}</div>
              <div style={{ width: "100%", height: `${(v / max) * 82 * g}%`, borderRadius: "10px 10px 0 0", background: r === "South" ? C.clay : r === "East" ? "#E9B9A6" : "#D9D4CA" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 34, padding: "12px 20px 0", fontSize: 17, color: C.sub }}>
        {REGIONS.map(([r]) => (
          <span key={r} style={{ flex: 1, textAlign: "center" }}>{r}</span>
        ))}
      </div>
      <div style={{ marginTop: 26, display: "flex", gap: 14, opacity: ramp(k, [0.6, 0.8]) }}>
        {["Total ₹14.2 Cr", "South +18% vs Q2", "East −6% vs Q2"].map((x, i) => (
          <div key={x} style={{ padding: "10px 16px", borderRadius: 10, background: i === 2 ? "#FBEAE3" : C.cream, fontSize: 16, fontWeight: 600, color: i === 2 ? C.send : C.ink }}>{x}</div>
        ))}
      </div>
    </div>
  );
};
const DAYS: [string, string, [string, string, string][]][] = [
  ["Day 1", "North Goa", [["9:00", "Fort Aguada at sunrise", "Free"], ["13:00", "Lunch at Baga", "₹1,600"], ["18:30", "Sunset, Vagator cliffs", "Free"]]],
  ["Day 2", "Old Goa & Panjim", [["10:00", "Basilica of Bom Jesus", "Free"], ["15:00", "Fontainhas walk", "Free"], ["20:00", "Dinner, Panjim", "₹2,400"]]],
  ["Day 3", "South Goa", [["8:30", "Kayak at Palolem", "₹1,500"], ["12:30", "Butterfly Beach", "₹1,200"], ["19:00", "Beach shack dinner", "₹1,800"]]],
];
const TripOut: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", inset: 0, background: "#FCFBF8", fontFamily: UI, padding: "30px 34px", boxSizing: "border-box" }}>
    <div style={{ fontFamily: DISP, fontSize: 40, fontWeight: 600, letterSpacing: "-0.035em", color: C.ink }}>3 days in Goa, for two</div>
    <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 15 }}>
      {["Mar 14–16", "2 travellers", "Budget ₹40,000"].map((x) => (
        <span key={x} style={{ padding: "6px 12px", borderRadius: 8, background: C.cream, color: C.sub }}>{x}</span>
      ))}
    </div>
    <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
      {DAYS.map(([d, area, items], i) => (
        <div key={d} style={{ flex: 1, borderRadius: 14, border: `1px solid ${C.line}`, background: "#fff", padding: 18, opacity: ramp(k, [0.1 + i * 0.12, 0.3 + i * 0.12]), transform: `translateY(${(1 - ramp(k, [0.1 + i * 0.12, 0.35 + i * 0.12], [0, 1], ease.out)) * 20}px)` }}>
          <div style={{ fontSize: 13, letterSpacing: "0.14em", color: C.clay, fontWeight: 600 }}>{d.toUpperCase()}</div>
          <div style={{ fontSize: 21, fontWeight: 600, color: C.ink, marginTop: 4 }}>{area}</div>
          {items.map(([tm, what, cost]) => (
            <div key={what} style={{ display: "flex", gap: 10, marginTop: 14, fontSize: 15 }}>
              <span style={{ width: 46, color: C.faint, fontVariantNumeric: "tabular-nums" }}>{tm}</span>
              <span style={{ flex: 1, color: C.ink }}>{what}</span>
              <span style={{ color: C.sub }}>{cost}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
    <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: 12, background: "#1E1C1A", color: "#F3EEE6", opacity: ramp(k, [0.55, 0.75]) }}>
      <span style={{ fontSize: 17 }}>Stay (2 nights, Assagao) + scooter + food + activities</span>
      <span style={{ fontFamily: DISP, fontSize: 28, fontWeight: 600 }}>₹38,400</span>
    </div>
  </div>
);
const TASKS: Task[] = [
  { label: "Website", prompt: "Build a landing page for my ceramics studio, Kiln & Co.", reply: "Here's a landing page for Kiln & Co.: a hero, your story, and a product grid.", file: "Kiln & Co. landing page", kind: "Website", icon: "globe", Out: WebsiteOut },
  { label: "Slide deck", prompt: "Turn these Q3 notes into a board deck.", reply: "Done. Four slides: title, revenue, margin, and next quarter.", file: "Q3 Review", kind: "Presentation", icon: "layers", Out: DeckOut },
  { label: "Analysis", prompt: "Chart revenue by region and tell me what stands out.", reply: "South leads with ₹4.86 Cr. East fell 6%, worth a closer look.", file: "Revenue by region", kind: "Chart", icon: "grid", Out: SalesOut },
  { label: "Trip plan", prompt: "Plan 3 days in Goa for two, under ₹40,000.", reply: "Here's a 3-day plan for ₹38,400, with time for beaches and Old Goa.", file: "Goa, 3 days", kind: "Document", icon: "file", Out: TripOut },
];

// one conversation view: user message, Claude's reply streaming, the artifact panel opening on the right
const Conversation: React.FC<{ task: Task; l: number; panel: number; outK: number }> = ({ task, l, panel, outK }) => {
  const replyN = Math.max(0, Math.floor((l - 0.15) * 70));
  return (
    <>
      <div style={{ position: "absolute", left: 340, top: 40, width: 620 + (1 - panel) * 280, fontFamily: UI }}>
        <div style={{ display: "flex", gap: 12, background: C.cream, borderRadius: 14, padding: "14px 16px", fontSize: 17, lineHeight: "26px", color: C.ink }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: C.ink, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>D</div>
          {task.prompt}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
          <div style={{ transform: `rotate(${l < 0.6 ? l * 200 : 0}deg)`, flexShrink: 0 }}>
            <ClaudeMark size={28} color={C.clay} />
          </div>
          <div style={{ fontSize: 17, lineHeight: "27px", color: C.ink }}>{task.reply.slice(0, replyN)}</div>
        </div>
        <div style={{ marginLeft: 42, marginTop: 20, width: 380, display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#fff", opacity: ramp(l, [0.5, 0.7]) }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, background: C.cream, display: "grid", placeItems: "center" }}>
            <Icon name={task.icon} size={20} color={C.send} stroke={2} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{task.file}</div>
            <div style={{ fontSize: 13, color: C.faint }}>{task.kind} · Click to open</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 790 }}>
          <Composer model="Sonnet 5.5" width={620 + (1 - panel) * 280} />
        </div>
      </div>
      {panel > 0 ? (
        <div style={{ position: "absolute", top: 20, bottom: 20, right: 20, width: 860 * panel, borderRadius: 14, border: `1px solid ${C.line}`, background: "#fff", overflow: "hidden", boxShadow: "0 10px 30px rgba(20,20,19,0.06)" }}>
          <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: `1px solid ${C.line}`, fontFamily: UI, fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
            <Icon name={task.icon} size={17} color={C.send} stroke={2} /> {task.file}
            <span style={{ flex: 1 }} />
            <span style={{ fontWeight: 500, color: C.faint, fontSize: 13 }}>Preview · Code</span>
          </div>
          <div style={{ position: "absolute", left: 0, top: 50, width: 860, bottom: 0 }}>
            <task.Out k={outK} />
          </div>
        </div>
      ) : null}
    </>
  );
};

// ---------- the four task segments: prompt (close) → reply + panel → the output (close glide) ----------
const TaskShots: React.FC<{ s: number }> = ({ s }) => (
  <>
    {TASKS.map((task, i) => {
      const t0 = TASK0 + i * TASK_LEN;
      const a = t0, m = t0 + b(3), z = t0 + b(6), e = t0 + TASK_LEN;
      const typed = task.prompt.slice(0, Math.max(0, Math.floor((s - a - 0.1) * 55)));
      const sendAt = a + 0.1 + task.prompt.length / 55 + 0.05;
      return (
        <React.Fragment key={task.label}>
          {/* the prompt, close on the composer */}
          <Shot s={s} at={a} until={m} whip={i % 2 ? -1 : 1}>
            <Cam s={kf(s, [a, m], [1.9, 2.05], ease.linear)} fx={kf(s, [a, m], [880, 1000], ease.linear)} fy={640}>
              <Browser>
                <Sidebar />
                <div style={{ position: "absolute", left: 640, top: 360 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34, marginLeft: 120 }}>
                    <ClaudeMark size={40} color={C.clay} />
                    <span style={{ fontFamily: DISP, fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", color: C.ink }}>What's next, Dev?</span>
                  </div>
                  <Composer text={typed} caret={s < sendAt} model="Sonnet 5.5" send={s > sendAt - 0.04 && s < sendAt + 0.1 ? 1 : 0} />
                </div>
              </Browser>
            </Cam>
            <div style={{ position: "absolute", left: 70, top: 64, display: "flex", alignItems: "center", gap: 14, fontFamily: DISP, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em", color: C.ink }}>
              <span style={{ fontFamily: UI, fontSize: 18, fontWeight: 600, color: "#fff", background: C.send, borderRadius: 8, padding: "4px 10px" }}>0{i + 1}</span>
              {task.label}
            </div>
          </Shot>
          {/* the reply streams, the panel opens */}
          <Shot s={s} at={m} until={z} whip={0}>
            <Cam s={kf(s, [m, z], [1.3, 1.38], ease.linear)} fx={kf(s, [m, z], [980, 1080], ease.inOut)} fy={kf(s, [m, z], [400, 430], ease.linear)}>
              <Browser>
                <Sidebar />
                <Conversation task={task} l={s - m} panel={ramp(s, [m + 0.55, m + 0.95], [0, 1], ease.inOut)} outK={ramp(s, [m + 0.8, e - 0.3], [0, 1], ease.linear)} />
              </Browser>
            </Cam>
          </Shot>
          {/* the output, close, gliding */}
          <Shot s={s} at={z} until={e} whip={i % 2 ? 1 : -1}>
            <Cam s={kf(s, [z, e], [1.75, 1.95], ease.inOut)} fx={kf(s, [z, e], [1300, 1420], ease.inOut)} fy={kf(s, [z, e], [430, 520], ease.inOut)}>
              <Browser>
                <Sidebar />
                <Conversation task={task} l={5} panel={1} outK={ramp(s, [m + 0.8, e - 0.3], [0, 1], ease.linear)} />
              </Browser>
            </Cam>
          </Shot>
        </React.Fragment>
      );
    })}
  </>
);

export const ClaudeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  // model switch timing
  const menuAt = D.model + b(1.5);
  const pickAt = D.model + b(4);
  const menuP = ramp(s, [menuAt, menuAt + 0.18], [0, 1], ease.out) * (1 - ramp(s, [pickAt + 0.25, pickAt + 0.4]));
  const picked = s >= pickAt;
  // world positions (the camera's space): the model button in the composer, and Sonnet 5.5 in the menu
  const BTN = { x: 1354, y: 535 };
  const ROW = { x: 1250, y: 385 };
  return (
    <AbsoluteFill style={{ background: C.page }}>
      <Audio src={staticFile("sonnet/demo-mix.wav")} />

      {/* 0 · the announcement */}
      <Shot s={s} at={D.intro} until={D.open} whip={0} bg={C.cream}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <div style={{ transform: `scale(${springAt(s, 0.1, { damping: 13, stiffness: 140, mass: 0.8 })}) rotate(${(1 - ramp(s, [0.1, 0.9], [0, 1], ease.out)) * -160}deg)` }}>
            <ClaudeMark size={120} color={C.clay} />
          </div>
          <Rise s={s} at={0.45} size={56} weight={500} color={C.sub}>Introducing</Rise>
          <Rise s={s} at={0.6} size={190}>Claude Sonnet 5.5</Rise>
          <div style={{ opacity: ramp(s, [1.4, 1.8]), fontFamily: UI, fontSize: 30, fontWeight: 500, color: C.sub, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#3FA66A", boxShadow: "0 0 0 6px rgba(63,166,106,0.18)" }} /> Available now in Claude
          </div>
        </AbsoluteFill>
      </Shot>

      {/* 1 · open Claude: the camera pushes into the app */}
      <Shot s={s} at={D.open} until={D.model} whip={1}>
        <Cam s={kf(s, [D.open, D.model], [0.92, 1.0], ease.out)} fx={960} fy={540}>
          <Browser>
            <Sidebar />
            <div style={{ position: "absolute", left: 640, top: 360 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34, marginLeft: 120 }}>
                <ClaudeMark size={40} color={C.clay} />
                <span style={{ fontFamily: DISP, fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", color: C.ink }}>What's next, Dev?</span>
              </div>
              <Composer model="Opus 5.5" />
            </div>
          </Browser>
        </Cam>
      </Shot>

      {/* 2 · switch the model, close up */}
      <Shot s={s} at={D.model} until={D.tasks} whip={0}>
        <Cam s={kf(s, [D.model, menuAt, pickAt + 0.4, D.tasks], [1.6, 2.4, 2.4, 2.1], ease.inOut)} fx={kf(s, [D.model, menuAt], [1150, 1300], ease.inOut)} fy={kf(s, [D.model, menuAt, pickAt + 0.4], [560, 460, 520], ease.inOut)}>
          <Browser>
            <Sidebar />
            <div style={{ position: "absolute", left: 640, top: 360 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34, marginLeft: 120 }}>
                <ClaudeMark size={40} color={C.clay} />
                <span style={{ fontFamily: DISP, fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", color: C.ink }}>What's next, Dev?</span>
              </div>
              <Composer model={picked ? "Sonnet 5.5" : "Opus 5.5"} modelHover={ramp(s, [menuAt - 0.3, menuAt - 0.1]) * (1 - ramp(s, [pickAt, pickAt + 0.2]))} />
              {menuP > 0.01 ? (
                <div style={{ position: "absolute", left: 820 - 380 - 40, bottom: 120 }}>
                  <ModelMenu p={menuP} hover={ramp(s, [menuAt + 0.4, menuAt + 0.6])} picked={picked} />
                </div>
              ) : null}
            </div>
          </Browser>
          <Pointer
            x={kf(s, [D.model, menuAt - 0.15, menuAt + 0.3, pickAt - 0.05], [1520, BTN.x, ROW.x + 60, ROW.x], ease.inOut)}
            y={kf(s, [D.model, menuAt - 0.15, menuAt + 0.3, pickAt - 0.05], [700, BTN.y, ROW.y + 40, ROW.y], ease.inOut)}
            size={24}
            press={(s > menuAt - 0.1 && s < menuAt + 0.05 ? 1 : 0) + (s > pickAt - 0.05 && s < pickAt + 0.1 ? 1 : 0)}
          />
        </Cam>
      </Shot>

      {/* 3 · four real tasks, fast */}
      <TaskShots s={s} />

      {/* 4 · the numbers */}
      {(
        [
          ["30%+", "faster outputs than Sonnet 5", C.ink, C.page],
          ["30% less", "cost per task, at the same price", C.page, C.ink],
          ["70.6%", "on Terminal-Bench 4.0, up from 10.3%", C.ink, C.cream],
        ] as const
      ).map(([big, small, fg, bg], i) => (
        <Shot key={big} s={s} at={D.stats + b(3 * i)} until={D.stats + b(3 * i + 3)} whip={i % 2 ? -1 : 1} bg={bg}>
          <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <Rise s={s} at={D.stats + b(3 * i) + 0.05} size={300} color={fg}>
              {i === 0 ? (
                <>
                  30%<span style={{ color: C.clay }}>+</span>
                </>
              ) : i === 1 ? (
                <>
                  30% <span style={{ color: C.clay }}>less</span>
                </>
              ) : (
                <span style={{ color: C.send }}>70.6%</span>
              )}
            </Rise>
            <Rise s={s} at={D.stats + b(3 * i) + 0.25} size={46} weight={500} color={i === 1 ? "#B9B6AE" : C.sub}>{small}</Rise>
          </AbsoluteFill>
        </Shot>
      ))}

      {/* 5 · the name */}
      <Shot s={s} at={D.end} until={D.total} whip={0} bg={C.cream}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
          <div style={{ transform: `scale(${springAt(s, D.end + 0.05, { damping: 13, stiffness: 140, mass: 0.8 })}) rotate(${(s - D.end) * 20}deg)` }}>
            <ClaudeMark size={110} color={C.clay} />
          </div>
          <Rise s={s} at={D.end + 0.25} size={150}>Claude Sonnet 5.5</Rise>
          <Rise s={s} at={D.end + 0.5} size={40} weight={500} color={C.sub}>Available now on claude.ai and everywhere you build</Rise>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontFamily: UI, fontSize: 14, color: C.faint, opacity: ramp(s, [D.end + 0.8, D.end + 1.2]) }}>
          Concept demo by Breeders. Not affiliated with Anthropic. Figures from Anthropic's announcement, Sept 28, 2026. Task contents are examples.
        </div>
      </Shot>

      <Watermark opacity={s < D.end ? 0.85 : 0} font={UI} dark={inR(s, D.stats + b(3), D.stats + b(6)) ? 1 : 0} />
    </AbsoluteFill>
  );
};
