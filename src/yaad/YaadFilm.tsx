// Yaad launch film (~50s): an AI voice phones your parent in her own language, asks if she took her medicine,
// retries, and tells the family. Built from the product's own UI (yaad video reference/screenshots).
// Story: 7 PM → 600 km apart → meet Yaad → set a reminder → Amma's phone rings → the call in Telugu → "yes" flies
// back → dashboard confirms → if she misses: retry, alert → end mark. Cuts land on the voiceover (audio/yaad-vo.mp3).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp } from "../utils";
import { Button, Card, CallRow, Chip, CITY, Cursor, DotMap, KeypadPhone, Label, MONO, proj, SANS, Status, TELUGU, TODAY, Wave, Y, YaadMark } from "./ui";

export const T = { clock: 0, map: 1.85, meet: 6.7, setup: 7.7, ring: 15.25, call: 20.4, back: 24.8, dash: 25.95, miss: 29.5, end: 36.35, total: 41.5 };
export const YAAD = { fps: 30, width: 1920, height: 1080, seconds: T.total };

const NIGHT = "radial-gradient(ellipse 70% 65% at 50% 42%, #2A211B 0%, #17120F 55%, #0D0A08 100%)";
const Night: React.FC<{ children?: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ background: NIGHT }}>{children}</AbsoluteFill>;
const Page: React.FC<{ children?: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ background: Y.page }}>{children}</AbsoluteFill>;

// ---------- 1 · 7:00 PM ----------
const Flap: React.FC<{ a: string; b: string; k: number }> = ({ a, b, k }) => (
  <div style={{ position: "relative", width: 150, height: 210, perspective: 900 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "linear-gradient(180deg,#2B2520,#1C1815)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 300, fontSize: 150, color: "#F6E9DB" }}>{k > 0.5 ? b : a}</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 104, height: 2, background: "#0D0A08" }} />
    {k > 0 && k < 1 ? <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 105, borderRadius: "18px 18px 0 0", background: "linear-gradient(180deg,#332C26,#241F1B)", transformOrigin: "bottom", transform: `rotateX(${-180 * k}deg)`, opacity: 0.9 }} /> : null}
  </div>
);
const Clock: React.FC<{ s: number }> = ({ s }) => {
  const k = ramp(s, [0.3, 0.6], [0, 1], ease.inOut);
  const k2 = ramp(s, [0.38, 0.68], [0, 1], ease.inOut);
  const glow = ramp(s, [0.5, 1.5], [0, 1], ease.out);
  return (
    <Night>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,170,110,${0.18 * glow}) 0%, transparent 45%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1.04 - 0.04 * ramp(s, [0, 1.85])})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Flap a="6" b="7" k={k} />
          <div style={{ fontFamily: SANS, fontSize: 110, color: "#6E5F52", margin: "0 6px" }}>:</div>
          <Flap a="5" b="0" k={k2} />
          <Flap a="9" b="0" k={k2} />
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.1em", color: "#B8A697", alignSelf: "flex-end", marginLeft: 16, marginBottom: 20 }}>PM</div>
        </div>
      </AbsoluteFill>
    </Night>
  );
};

// ---------- 2 · 600 km ----------
const MAPW = 1500;
const P = proj(MAPW);
const arc = (k: number, rev = false) => {
  const a = P(CITY.you), b = P(CITY.amma);
  const c: [number, number] = [(a[0] + b[0]) / 2 - 90, (a[1] + b[1]) / 2 - 60];
  const q = (t: number): [number, number] => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const pts = Array.from({ length: 60 }, (_, i) => q(i / 59));
  return { pts, at: (t: number) => q(rev ? 1 - t : t), a, b, d: (k2: number) => pts.slice(0, Math.max(2, Math.round(k2 * 59) + 1)).map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ") };
};
const MapShot: React.FC<{ s: number; back?: boolean }> = ({ s, back }) => {
  const A = arc(1, back);
  const draw = back ? 1 : ramp(s, [0.5, 2.4], [0, 1], ease.inOut);
  const pulse = back ? ramp(s, [0.0, 0.75], [0, 1], ease.inOut) : (s * 0.55) % 1;
  const [px, py] = A.at(pulse);
  const km = Math.round(600 * ramp(s, [0.6, 2.6], [0, 1], ease.out));
  const mid: [number, number] = [(A.a[0] + A.b[0]) / 2, (A.a[1] + A.b[1]) / 2];
  const arrive = back ? ramp(s, [0.75, 1.0], [0, 1], ease.out) : 0;
  return (
    <Night>
      <div style={{ position: "absolute", left: 960 - mid[0], top: 560 - mid[1], transform: `scale(${1.35 + 0.05 * ramp(s, [0, 4])})`, transformOrigin: `${mid[0]}px ${mid[1]}px` }}>
        <DotMap w={MAPW} reveal={back ? 1 : ramp(s, [0, 1.4], [0, 1], ease.out)} />
        <svg width={MAPW} height={MAPW} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d={A.d(draw)} stroke={Y.orange} strokeWidth={3} fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(244,96,42,0.8))" }} />
          <circle cx={px} cy={py} r={7} fill="#FFD9C4" style={{ filter: "drop-shadow(0 0 10px #F4602A)" }} />
          {[A.a, A.b].map((c, i) => (
            <g key={i}>
              <circle cx={c[0]} cy={c[1]} r={9 + (i === 0 ? arrive * 10 : 0)} fill={i === 0 && back ? Y.green : Y.orange} opacity={0.95} />
              <circle cx={c[0]} cy={c[1]} r={20 + ((s * 0.8 + i * 0.5) % 1) * 26} fill="none" stroke={Y.orange} strokeWidth={1.5} opacity={1 - ((s * 0.8 + i * 0.5) % 1)} />
            </g>
          ))}
        </svg>
        <div style={{ position: "absolute", left: A.a[0] - 250, top: A.a[1] + 18, width: 230, textAlign: "right", fontFamily: SANS, fontSize: 19, color: "#F6E9DB" }}>
          You<div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em", color: "#B8A697" }}>BENGALURU</div>
        </div>
        <div style={{ position: "absolute", left: A.b[0] + 22, top: A.b[1] - 26, fontFamily: SANS, fontSize: 19, color: "#F6E9DB" }}>
          Amma<div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em", color: "#B8A697" }}>VIJAYAWADA</div>
        </div>
      </div>
      {!back ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.12em", color: "#F6E9DB", opacity: ramp(s, [0.8, 1.2]) }}>{km} KM</div> : null}
      {back ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, display: "flex", justifyContent: "center", opacity: arrive }}><Chip s="confirmed" /></div> : null}
    </Night>
  );
};

// ---------- 3 · meet Yaad ----------
const Meet: React.FC<{ s: number }> = ({ s }) => {
  const wipe = ramp(s, [0.05, 0.5], [0, 1], ease.inOut);
  const mk = ramp(s, [0.15, 0.55], [0, 1], ease.out);
  const word = ramp(s, [0.35, 0.75], [0, 1], ease.out);
  return (
    <AbsoluteFill>
      <Night />
      <AbsoluteFill style={{ background: Y.page, clipPath: `circle(${wipe * 1200}px at 50% 50%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", opacity: 1 - ramp(s, [0.05, 0.3]) }}>
          <Wave t={s} width={900} height={90} bars={72} talking={ramp(s, [0, 0.4])} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: mk, transform: `scale(${0.85 + 0.15 * mk})` }}>
          <YaadMark size={130} waves={ramp(s, [0.4, 1.0])} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 92, letterSpacing: "-0.03em", color: Y.ink, opacity: word, transform: `translateX(${(1 - word) * -20}px)` }}>Yaad</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 4 · set a reminder ----------
const Field: React.FC<{ label: string; children: React.ReactNode; focus?: number; w?: number }> = ({ label, children, focus = 0, w }) => (
  <div style={{ width: w }}>
    <Label style={{ marginBottom: 10 }}>{label}</Label>
    <div style={{ height: 62, borderRadius: 14, border: `1.5px solid ${focus > 0.5 ? Y.blue : Y.line}`, boxShadow: focus > 0.5 ? "0 0 0 4px rgba(47,68,212,0.12)" : undefined, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: SANS, fontSize: 24, color: Y.ink, background: "#fff" }}>{children}</div>
  </div>
);
const Setup: React.FC<{ s: number }> = ({ s }) => {
  const typed = (txt: string, a: number, cps = 14) => txt.slice(0, Math.max(0, Math.floor((s - a) * cps)));
  const who = s > 0.45, lang = s > 1.75, time = s > 4.95 ? "19:00" : "", what = typed("BP tablet", 6.1, 18);
  const hear = ramp(s, [6.5, 6.9], [0, 1], ease.out);
  const press = ramp(s, [7.15, 7.25]) * (1 - ramp(s, [7.25, 7.4]));
  const saved = ramp(s, [7.3, 7.5], [0, 1], ease.out);
  const cur = s < 1.2 ? [560, 230] : s < 3.0 ? [960, 540] : s < 5.6 ? [400, 540] : s < 6.9 ? [560, 360] : [1110, 1000];
  const camK = ramp(s, [0, 7.5], [0, 1], ease.inOut);
  return (
    <Page>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <AbsoluteFill style={{ transform: `rotateX(${6 - 4 * camK}deg) rotateY(${-6 + 8 * camK}deg) scale(${0.96 + 0.05 * camK})` }}>
          <div style={{ position: "absolute", left: 300, top: 70, width: 1080 }}>
            <Card style={{ padding: "34px 40px", opacity: 1 - saved * 0.0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 28, color: Y.ink, marginBottom: 26 }}>New reminder<span style={{ color: Y.sub }}>✕</span></div>
              <div style={{ display: "grid", gap: 24 }}>
                <Field label="Who should we call" focus={s > 0.2 && s < 1.2 ? 1 : 0}>{who ? "Amma · Mother" : <span style={{ color: Y.mute }}>Choose a person</span>}</Field>
                <Field label="What is it for" focus={s > 5.6 && s < 7.0 ? 1 : 0}>{what}<span style={{ opacity: s > 5.6 && s < 7.0 && Math.floor(s * 3) % 2 ? 1 : 0 }}>|</span></Field>
                <div style={{ display: "flex", gap: 24 }}>
                  <Field label="Time" w={490} focus={s > 4.4 && s < 5.6 ? 1 : 0}>{time}</Field>
                  <Field label="Language" w={490} focus={s > 1.2 && s < 3.0 ? 1 : 0}>{lang ? "Telugu" : <span style={{ color: Y.mute }}>Choose</span>}</Field>
                </div>
                <div style={{ borderRadius: 18, background: Y.well, padding: "22px 26px", opacity: hear }}>
                  <Label>What they will hear</Label>
                  <div style={{ fontFamily: TELUGU, fontSize: 27, color: Y.ink, marginTop: 10 }}>Amma, నమస్కారం. BP tablet సమయం అయింది. మీరు వేసుకున్నారా?</div>
                  <div style={{ fontFamily: SANS, fontSize: 20, color: Y.sub, marginTop: 8 }}>Amma, hello. It's time for your BP tablet. Have you taken it?</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 26 }}>
                <div style={{ padding: "14px 26px", borderRadius: 999, border: `1px solid ${Y.line}`, fontFamily: SANS, fontSize: 22 }}>Cancel</div>
                <Button press={press}>{saved > 0.5 ? "✓ Saved" : "Save reminder"}</Button>
              </div>
            </Card>
            <Cursor x={cur[0] - 300} y={cur[1] - 70} press={press} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Page>
  );
};

// ---------- 5 · Amma's phone rings ----------
const PhoneScreen: React.FC<{ s: number; status: string; sub?: string }> = ({ s, status, sub }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
    <div style={{ transform: `scale(${1 + 0.06 * Math.abs(Math.sin(s * 9))})` }}>
      <YaadMark size={64} waves={(s * 1.6) % 1.3} />
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: "#2A1D14" }}>Yaad</div>
    <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.1em", color: "#8A6248" }}>{status}</div>
    {sub ? <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: "#A07A60" }}>{sub}</div> : null}
  </div>
);
const Ring: React.FC<{ s: number; status?: string; sub?: string; dead?: boolean }> = ({ s, status = "CALLING", sub = "7:00 PM", dead }) => {
  const buzz = dead ? 0 : Math.sin(s * 70) * 4 * (Math.floor(s * 2.2) % 2 === 0 ? 1 : 0);
  return (
    <Night>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, rgba(255,160,100,0.16) 0%, transparent 40%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {!dead
          ? [0, 1, 2].map((i) => {
              const k = (s * 0.7 + i / 3) % 1;
              return <div key={i} style={{ position: "absolute", width: 300 + k * 900, height: 300 + k * 900, borderRadius: "50%", border: `2px solid rgba(244,96,42,${0.5 * (1 - k)})` }} />;
            })
          : null}
        <div style={{ transform: `scale(${1.02 + 0.06 * ramp(s, [0, 4])}) rotate(-4deg)` }}>
          <KeypadPhone w={300} buzz={buzz} lit={dead ? 0.35 : 1} screen={<PhoneScreen s={dead ? 0 : s} status={status} sub={sub} />} />
        </div>
      </AbsoluteFill>
    </Night>
  );
};

// ---------- 6 · the call ----------
const LINES = [
  { at: 0.1, who: "Yaad", c: Y.orange, te: "Amma, నమస్కారం. BP tablet సమయం అయింది. మీరు వేసుకున్నారా?", en: "Amma, hello. It's time for your BP tablet. Have you taken it?" },
  { at: 2.0, who: "Amma", c: "#7D8CFF", te: "అవును, వేసుకున్నాను.", en: "Yes, I took it." },
  { at: 3.3, who: "Yaad", c: Y.orange, te: "చాలా మంచిది. జాగ్రత్తగా ఉండండి.", en: "Very good. Take care." },
];
const Words: React.FC<{ txt: string; s: number; at: number; font: string; size: number; color: string }> = ({ txt, s, at, font, size, color }) => (
  <div style={{ fontFamily: font, fontSize: size, color, lineHeight: 1.45 }}>
    {txt.split(" ").map((w, i) => {
      const k = ramp(s, [at + i * 0.08, at + i * 0.08 + 0.18], [0, 1], ease.out);
      return <span key={i} style={{ opacity: k, display: "inline-block", transform: `translateY(${(1 - k) * 8}px)`, marginRight: "0.28em" }}>{w}</span>;
    })}
  </div>
);
const Call: React.FC<{ s: number }> = ({ s }) => {
  const speaking = [...LINES].reverse().find((l) => s >= l.at);
  const talking = speaking ? 1 - ramp(s, [speaking.at + 1.6, speaking.at + 2.0]) : 0;
  return (
    <Night>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * ramp(s, [0, 4.4])})` }}>
        <div style={{ position: "absolute", left: 300, top: 150, display: "flex", alignItems: "center", gap: 18 }}>
          <YaadMark size={46} waves={(s * 1.2) % 1.2} />
          <div style={{ fontFamily: SANS, fontSize: 24, color: "#F6E9DB" }}>Amma · BP tablet</div>
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "0.1em", color: "#B8A697", marginLeft: 16 }}>0:{String(Math.floor(s)).padStart(2, "0")} · TELUGU · BULBUL V4</div>
        </div>
        <div style={{ position: "absolute", left: 300, top: 230 }}>
          <Wave t={s} width={1320} height={110} bars={110} color={speaking?.c ?? Y.orange} talking={talking} seed={speaking ? LINES.indexOf(speaking) + 1 : 1} />
        </div>
        <div style={{ position: "absolute", left: 300, top: 420, width: 1320, display: "grid", gap: 34 }}>
          {LINES.map((l, i) =>
            s >= l.at - 0.05 ? (
              <div key={i} style={{ display: "flex", gap: 22, opacity: speaking === l ? 1 : 0.45 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.c, marginTop: 18 }} />
                <div>
                  <Words txt={l.te} s={s} at={l.at} font={TELUGU} size={34} color="#F6E9DB" />
                  <div style={{ fontFamily: SANS, fontSize: 21, color: "#B8A697", marginTop: 4, opacity: ramp(s, [l.at + 0.4, l.at + 0.8]) }}>{l.en}</div>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </AbsoluteFill>
    </Night>
  );
};

// ---------- 7 · dashboard ----------
const Dash: React.FC<{ s: number; status: Status; note: string; flipAt?: number; count?: [number, number] }> = ({ s, status, note, flipAt = 0.8, count = [5, 6] }) => {
  const flip = flipAt >= 0 ? Math.max(0, 1 - Math.abs((s - flipAt) / 0.18)) : 0;
  const after = s >= flipAt;
  const n = Math.round(count[0] + (count[1] - count[0]) * ramp(s, [flipAt, flipAt + 0.6]));
  const cam = ramp(s, [0, 5], [0, 1], ease.inOut);
  const rows = TODAY;
  return (
    <Page>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <AbsoluteFill style={{ transform: `rotateX(${6 - 3 * cam}deg) rotateY(${8 - 10 * cam}deg) scale(${1.02 + 0.08 * cam})` }}>
          <div style={{ position: "absolute", left: 180, top: 70, fontFamily: SANS, fontSize: 40, color: Y.ink }}>Good evening, Pavan</div>
          <Label style={{ position: "absolute", left: 182, top: 128 }}>Wednesday 14 October · {n} calls confirmed</Label>
          <Card style={{ position: "absolute", left: 180, top: 190, width: 900, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 24px 16px", fontFamily: SANS, fontSize: 26, color: Y.ink }}>
              Today's calls <Label>{n} / 9 confirmed</Label>
            </div>
            {rows.map((r, i) => (i === rows.length - 1 ? <CallRow key={i} r={r} status={after ? status : "calling"} note={after ? note : "NOW"} hi={1} flip={flip} /> : <CallRow key={i} r={r} />))}
          </Card>
          <Card style={{ position: "absolute", left: 1120, top: 190, width: 620, padding: 34 }}>
            <Label>Reminders taken</Label>
            <div style={{ fontFamily: SANS, fontSize: 96, color: Y.ink, letterSpacing: "-0.03em", marginTop: 8 }}>{status === "confirmed" ? Math.round(84 + ramp(s, [flipAt, flipAt + 0.8])) : 84}<span style={{ fontSize: 44, color: Y.sub }}>%</span></div>
            <Label style={{ marginTop: 6 }}>Last 14 days · 4 people</Label>
            <div style={{ display: "flex", gap: 6, marginTop: 30 }}>
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 70, borderRadius: 8, background: i === 13 ? (after ? (status === "confirmed" ? Y.blue : status === "missed" ? Y.red : Y.amber) : Y.well) : i % 5 === 2 ? "#B9C0F2" : Y.blue, opacity: i === 13 ? 0.4 + 0.6 * ramp(s, [flipAt, flipAt + 0.3]) : 1 }} />
              ))}
            </div>
          </Card>
        </AbsoluteFill>
      </AbsoluteFill>
    </Page>
  );
};

// ---------- 8 · the family alert ----------
const Alert: React.FC<{ s: number }> = ({ s }) => {
  const k = ramp(s, [0.15, 0.5], [0, 1], ease.out);
  return (
    <Page>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 470, height: 960, borderRadius: 70, background: "#0E1017", padding: 14, boxShadow: "0 60px 120px rgba(14,16,23,0.25)", transform: `translateY(${120 - 80 * ramp(s, [0, 3])}px) rotate(3deg)` }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 58, background: "linear-gradient(180deg,#FBE9DD,#F3EEF7)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: 96, color: Y.ink }}>7:21</div>
            <div style={{ position: "absolute", left: 18, right: 18, top: 300 - (1 - k) * 60, opacity: k, background: "rgba(255,255,255,0.92)", borderRadius: 28, padding: "20px 22px", boxShadow: "0 12px 30px rgba(14,16,23,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <YaadMark size={30} />
                <Label style={{ fontSize: 13 }}>Yaad · now</Label>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 21, color: Y.ink, marginTop: 10 }}>Amma missed her BP tablet</div>
              <div style={{ fontFamily: SANS, fontSize: 18, color: Y.sub, marginTop: 4 }}>No answer after 2 calls. Call her now?</div>
              <Button style={{ marginTop: 14, fontSize: 17, padding: "10px 20px" }}>Call Amma</Button>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Page>
  );
};

// ---------- 9 · end ----------
const End: React.FC<{ s: number }> = ({ s }) => {
  const mk = ramp(s, [0.15, 0.7], [0, 1], ease.out);
  const line = ramp(s, [0.6, 1.1], [0, 1], ease.out);
  const foot = ramp(s, [1.8, 2.4], [0, 1], ease.out);
  return (
    <Page>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", opacity: 1 - ramp(s, [0.2, 0.7]), transform: `scaleX(${1 - ramp(s, [0, 0.7], [0, 1], ease.in)})` }}>
          <Wave t={s} width={900} height={80} bars={72} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: mk, transform: `scale(${0.9 + 0.1 * mk})`, marginTop: -40 }}>
          <YaadMark size={112} waves={ramp(s, [1.0, 1.8])} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 84, letterSpacing: "-0.03em", color: Y.ink }}>Yaad</div>
        </div>
        <div style={{ position: "absolute", top: 640, fontFamily: SANS, fontSize: 30, color: Y.sub, opacity: line }}>A voice that remembers.</div>
        <div style={{ position: "absolute", bottom: 90, display: "flex", gap: 26, fontFamily: MONO, fontSize: 17, letterSpacing: "0.1em", color: Y.sub, opacity: foot }}>
          <span>BUILT ON SARVAM BULBUL</span>
          <span style={{ color: Y.orange }}>YAAD-ALPHA.VERCEL.APP</span>
        </div>
      </AbsoluteFill>
    </Page>
  );
};

// ---------- cut list ----------
const Shot: React.FC<{ s: number }> = ({ s }) => {
  if (s < T.map) return <Clock s={s} />;
  if (s < T.meet) return <MapShot s={s - T.map} />;
  if (s < T.setup) return <Meet s={s - T.meet} />;
  if (s < T.ring) return <Setup s={s - T.setup} />;
  if (s < T.call) return <Ring s={s - T.ring} />;
  if (s < T.back) return <Call s={s - T.call} />;
  if (s < T.dash) return <MapShot s={s - T.back} back />;
  if (s < T.miss) return <Dash s={s - T.dash} status="confirmed" note="7:00 PM · 0:24" flipAt={0.1} />;
  // if she misses: no answer → retry in 10 → second ring → missed → alert
  const m = s - T.miss;
  if (m < 1.0) return <Ring s={m} status="NO ANSWER" sub="7:00 PM" dead />;
  if (m < 1.9) return <Dash s={m - 1.0} status="retry" note="IN 10 MIN" flipAt={0.15} count={[6, 6]} />;
  if (m < 3.7) return <Ring s={m - 1.9} status="CALLING AGAIN" sub="7:10 PM · 2ND TRY" />;
  if (m < 5.1) return <Dash s={m - 3.7} status="missed" note="NO ANSWER" flipAt={0.1} count={[6, 6]} />;
  if (s < T.end) return <Alert s={m - 5.1} />;
  return <End s={s - T.end} />;
};

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.5'/></svg>")`;
const CUTS = [T.map, T.meet, T.setup, T.ring, T.call, T.back, T.dash, T.miss, T.miss + 1.0, T.miss + 1.9, T.miss + 3.7, T.miss + 5.1, T.end];

export const YaadFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const whip = Math.max(0, ...CUTS.map((c) => 1 - Math.abs(s - c) / 0.07));
  return (
    <AbsoluteFill style={{ background: Y.night }}>
      <Audio src={staticFile("yaad/mix.wav")} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="yw" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${whip * 30} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: whip > 0.02 ? "url(#yw)" : undefined }}>
        <Shot s={s} />
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 60%, rgba(30,18,10,0.22) 100%)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: GRAIN, opacity: 0.06, mixBlendMode: "overlay", transform: `translate(${(frame * 37) % 40}px, ${(frame * 53) % 40}px)` }} />
    </AbsoluteFill>
  );
};
