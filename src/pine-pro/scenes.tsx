import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { Icon } from "../clueso-mcp/icons";
import { Cursor, Seq } from "../clueso-mcp/ui";
import { ease, kf, pop, punch, ramp, SPRING_SOFT, useT } from "../utils";
import { Art } from "./Art";
import { PineMark } from "./PineMark";
import { DISPLAY, L, SANS, SHOTS } from "./theme";

const SHADOW = "0 30px 60px rgba(30,35,60,0.16), 0 8px 18px rgba(30,35,60,0.08)";
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), ${SHADOW}`,
};

// ---------- shared ----------
export const LightBg: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 120% 90% at 30% 15%, ${L.bg0} 0%, ${L.bg1} 58%, ${L.bg2} 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -300 + Math.sin(t / 90) * 60, top: 520, width: 1500, height: 700, borderRadius: "50%", background: "rgba(255,255,255,0.85)", filter: "blur(60px)", transform: "rotate(-12deg)" }} />
      <div style={{ position: "absolute", right: -200, top: -200 + Math.cos(t / 110) * 50, width: 900, height: 600, borderRadius: "50%", background: "rgba(214,212,255,0.35)", filter: "blur(90px)" }} />
      <Grain />
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.05, mixBlendMode: "multiply", pointerEvents: "none" }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const LEAD = 4;
// Each shot overlaps its neighbours by a few units: fades in while sharpening, and pushes forward while blurring out.
export const Shot: React.FC<{ span: readonly [number, number]; name: string; render: (tt: number, len: number) => React.ReactNode }> = ({ span, name, render }) => {
  const from = Math.max(0, span[0] - LEAD);
  return (
    <Seq from={from} dur={span[1] - from + LEAD} name={name}>
      <ShotBody start={span[0] - from} len={span[1] - span[0]} render={render} />
    </Seq>
  );
};
const ShotBody: React.FC<{ start: number; len: number; render: (tt: number, len: number) => React.ReactNode }> = ({ start, len, render }) => {
  const tt = useT() - start;
  const inP = ramp(tt, [-LEAD, 5], [0, 1], ease.out);
  const outP = ramp(tt, [len - 3, len + LEAD], [0, 1], ease.in);
  const blur = (1 - inP) * 10 + outP * 10;
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP), transform: `scale(${(0.965 + 0.035 * inP) * (1 + 0.05 * outP)})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {render(tt, len)}
    </AbsoluteFill>
  );
};

const Photo: React.FC<{ src: string; w: number; h: number; r?: number; kb?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ src, w, h, r = 22, kb = 0, style, children }) => (
  <div style={{ width: w, height: h, borderRadius: r, overflow: "hidden", boxShadow: SHADOW, position: "relative", background: "#EEE", ...style }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + kb})` }}>
      <Art name={src} w={w} h={h} />
    </div>
    {children}
  </div>
);

// Card floating in depth: manual perspective projection keeps the render crisp.
type Floater = { src: string; x: number; y: number; z: number; w: number; h: number; ry?: number };
const F = 1100;
const Float: React.FC<{ f: Floater; camZ: number; camX?: number; focus?: number; opacity?: number }> = ({ f, camZ, camX = 0, focus = 0, opacity = 1 }) => {
  const d = F + f.z - camZ;
  if (d < 60) return null;
  const s = F / d;
  const blur = Math.min(9, Math.abs(f.z - focus) / 140);
  return (
    <div
      style={{
        position: "absolute",
        left: 960 - f.w / 2,
        top: 540 - f.h / 2,
        opacity: opacity * Math.min(1, (d - 60) / 200),
        zIndex: Math.round(10000 - d),
        transform: `translate(${(f.x - camX) * s}px, ${f.y * s}px) scale(${s}) perspective(1400px) rotateY(${f.ry ?? 0}deg)`,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
      }}
    >
      <Photo src={f.src} w={f.w} h={f.h} />
    </div>
  );
};

const Mask: React.FC<{ tt: number; at: number; children: React.ReactNode; dur?: number }> = ({ tt, at, children, dur = 14 }) => {
  const p = ramp(tt, [at, at + dur], [0, 1], ease.out);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
      <div style={{ transform: `translateY(${(1 - p) * 105}%)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined }}>{children}</div>
    </div>
  );
};

const Caret: React.FC<{ tt: number; h: number; on?: boolean }> = ({ tt, h, on = true }) =>
  on && Math.floor(tt / 8) % 2 === 0 ? <span style={{ display: "inline-block", width: Math.max(3, h * 0.035), height: h, marginLeft: h * 0.06, background: L.ink, verticalAlign: "middle", borderRadius: 2 }} /> : null;

const Word: React.FC<{ children: React.ReactNode; size: number; weight?: number; color?: string; style?: React.CSSProperties }> = ({ children, size, weight = 400, color = L.ink2, style }) => (
  <div style={{ fontFamily: DISPLAY, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.04em", lineHeight: 1.02, whiteSpace: "pre", ...style }}>{children}</div>
);

// ---------- shots ----------
export const Logo = () => (
  <Shot span={SHOTS.logo} name="0:00 Logo" render={(tt) => {
    const p = ramp(tt, [8, 20], [0, 1], ease.out);
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${kf(tt, [0, 34], [1.05, 1])})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <PineMark size={112} build={ramp(tt, [0, 14], [0, 1], ease.out)} crown={ramp(tt, [6, 18], [0, 1], ease.out)} />
          <div style={{ clipPath: `inset(-10% ${(1 - p) * 100}% -10% 0)`, transform: `translateX(${(1 - p) * -24}px)` }}>
            <Word size={112} weight={700} color={L.ink}>Pineapple</Word>
          </div>
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const Ideas = () => (
  <Shot span={SHOTS.ideas} name="0:01 Ideas" render={(tt) => (
    <div style={{ position: "absolute", left: 560, top: 290, transform: `translateX(${kf(tt, [0, 34], [0, -24], ease.linear)}px)` }}>
      {[["Ideas", L.ink2], ["move", L.ink2], ["the world.", L.gray]].map(([w, c], i) => (
        <Mask key={w} tt={tt} at={i * 3}>
          <Word size={150} color={c}>{w}</Word>
        </Mask>
      ))}
    </div>
  )} />
);

const FIELD: Floater[] = [
  { src: "hiker", x: 0, y: 0, z: 0, w: 760, h: 420, ry: -6 },
  { src: "mountain_hero", x: -900, y: -330, z: 380, w: 520, h: 200, ry: 14 },
  { src: "city", x: 900, y: -300, z: 300, w: 300, h: 300, ry: -16 },
  { src: "castle", x: -1050, y: 250, z: 200, w: 220, h: 500, ry: 18 },
  { src: "coffee_beans", x: 1000, y: 330, z: 150, w: 480, h: 270, ry: -14 },
  { src: "cinematic_tile", x: -560, y: 520, z: -250, w: 220, h: 310, ry: 10 },
  { src: "cup_white", x: 620, y: -560, z: -200, w: 260, h: 290, ry: -8 },
  { src: "tile_3d", x: -620, y: -620, z: -380, w: 200, h: 290 },
  { src: "mountain_editor", x: 380, y: 640, z: -420, w: 460, h: 190 },
  { src: "tile_bottle", x: 1350, y: -40, z: 520, w: 220, h: 320, ry: -20 },
];
export const Field = () => (
  <Shot span={SHOTS.field} name="0:02 Ideas everywhere" render={(tt) => {
    const camZ = kf(tt, [-4, 34], [-1400, -80], ease.out);
    return <AbsoluteFill>{FIELD.map((f, i) => <Float key={i} f={f} camZ={camZ} focus={0} />)}</AbsoluteFill>;
  }} />
);

const PROMPT = "A product launch video for a coffee brand";
const promptChars = (tt: number) => {
  let acc = 6;
  for (let i = 0; i < PROMPT.length; i++) {
    acc += 0.62 + random(`pp${i}`) * 0.5 + (PROMPT[i] === " " ? 0.3 : 0);
    if (tt < acc) return i;
  }
  return PROMPT.length;
};
export const PROMPT_KEYS = Array.from({ length: PROMPT.length }, (_, i) => {
  let acc = 6;
  for (let k = 0; k <= i; k++) acc += 0.62 + random(`pp${k}`) * 0.5 + (PROMPT[k] === " " ? 0.3 : 0);
  return acc;
});
export const SEND_AT = 50;
export const Prompt = () => (
  <Shot span={SHOTS.prompt} name="0:03 Prompt" render={(tt) => {
    const n = promptChars(tt);
    const text = PROMPT.slice(0, n);
    const split = "A product launch video for".length;
    const press = ramp(tt, [SEND_AT - 2, SEND_AT], [0, 1]) * ramp(tt, [SEND_AT, SEND_AT + 5], [1, 0]);
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${kf(tt, [0, 64], [0.98, 1.04], ease.linear)})` }}>
        {FIELD.slice(1, 6).map((f, i) => (
          <Float key={i} f={{ ...f, z: f.z + 900 }} camZ={kf(tt, [0, 64], [-100, 40], ease.linear)} focus={-2000} opacity={0.35} />
        ))}
        <div style={{ ...GLASS, position: "relative", width: 1100, height: 250, borderRadius: 56, transform: `rotate(-5deg) translateY(${(1 - pop(tt, 0, SPRING_SOFT)) * 40}px)`, display: "flex", alignItems: "center", padding: "0 150px 0 64px", boxSizing: "border-box" }}>
          <div style={{ fontFamily: SANS, fontSize: 56, fontWeight: 400, color: L.ink2, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
            {text.slice(0, split)}
            {n > split ? <br /> : null}
            {text.slice(split + 1)}
            <Caret tt={tt} h={58} on={tt < SEND_AT} />
          </div>
          <div style={{ position: "absolute", right: 44, top: "50%", width: 104, height: 104, marginTop: -52, borderRadius: 52, background: L.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press * 0.1})`, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
            <Icon name="arrowUp" size={46} color="#fff" stroke={2.4} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const PINEPRO_KEYS = Array.from({ length: 8 }, (_, i) => 1 + i * 1.3);
export const PinePro = () => (
  <Shot span={SHOTS.pinepro} name="0:05 Pine Pro" render={(tt) => {
    const n = PINEPRO_KEYS.filter((k) => tt >= k).length;
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Word size={210} weight={600} color={L.ink}>{"Pine Pro".slice(0, n) || " "}</Word>
          <div style={{ width: 7, height: 190, marginLeft: 14, background: L.ink, borderRadius: 3, opacity: tt < 12 || Math.floor(tt / 8) % 2 === 0 ? 1 : 0 }} />
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const Turn = () => (
  <Shot span={SHOTS.turn} name="0:06 Value" render={(tt) => (
    <div style={{ position: "absolute", left: 330, top: 330, transform: `translateX(${kf(tt, [0, 34], [0, -20], ease.linear)}px)` }}>
      <Mask tt={tt} at={0}><Word size={104}>Turn your ideas</Word></Mask>
      <Mask tt={tt} at={3}><Word size={104}>into <b style={{ fontWeight: 700, color: L.ink }}>motion design</b></Word></Mask>
      <Mask tt={tt} at={6}><Word size={104} weight={700} color={L.ink}>videos.</Word></Mask>
    </div>
  )} />
);

export const Creates = () => (
  <Shot span={SHOTS.creates} name="0:07 AI creates" render={(tt) => {
    const s = pop(tt, 0, SPRING_SOFT);
    const small: [string, number, number, number, number, number][] = [
      ["hiker", 400, 330, 320, 190, 4],
      ["tile_bottle", 1660, 300, 190, 270, 7],
      ["city", 1560, 820, 220, 220, 10],
      ["cinematic_tile", 330, 780, 180, 250, 13],
      ["tile_illustration", 1700, 620, 150, 230, 16],
    ];
    return (
      <AbsoluteFill>
        {small.map(([src, x, y, w, h, d]) => {
          const p = pop(tt, d, SPRING_SOFT);
          return (
            <div key={src} style={{ position: "absolute", left: x - w / 2 - tt * 3, top: y - h / 2 + (1 - p) * 120, opacity: Math.min(1, p * 2), transform: `rotate(${(random(src) - 0.5) * 8}deg) scale(${0.9 + 0.1 * p})` }}>
              <Photo src={src} w={w} h={h} r={16} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 1000 - 430, top: 520 - 270, transform: `translateX(${(1 - s) * 560 - tt * 5}px) perspective(1600px) rotateY(${interpolate(s, [0, 1], [-32, -10])}deg)` }}>
          <Photo src="coffee_pour" w={860} h={540} r={26} kb={ramp(tt, [0, 34], [0.08, 0], ease.linear)} />
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const Styles = () => (
  <Shot span={SHOTS.styles} name="0:08 Multiple styles" render={(tt) => {
    const s = pop(tt, 0, SPRING_SOFT);
    const prog = ramp(tt, [0, 34], [0.1, 0.75], ease.linear);
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 300 - 210, top: 440 - 90, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * -200}px) perspective(1400px) rotateY(20deg)`, filter: "blur(2px)" }}>
          <Photo src="mountain_editor" w={420} h={176} r={16} />
        </div>
        <div style={{ position: "absolute", left: 1650 - 130, top: 430 - 130, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 200}px) perspective(1400px) rotateY(-20deg)`, filter: "blur(2px)" }}>
          <Photo src="city" w={260} h={260} r={16} />
        </div>
        <div style={{ position: "absolute", left: 960 - 460, top: 460 - 262, transform: `translateX(${(1 - s) * 200}px)` }}>
          <Photo src="coffee_beans" w={920} h={524} r={26} kb={ramp(tt, [0, 34], [0, 0.06], ease.linear)}>
            <div style={{ position: "absolute", left: 28, bottom: 26, width: 54, height: 54, borderRadius: 27, background: "rgba(255,255,255,0.3)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="play" size={22} color="#fff" />
            </div>
          </Photo>
        </div>
        <div style={{ ...GLASS, position: "absolute", left: 960 - 440, top: 770, width: 880, height: 22, borderRadius: 11 }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 11, background: `linear-gradient(90deg, ${L.lavender}, ${L.blue})` }} />
          <div style={{ position: "absolute", top: -7, left: `calc(${prog * 100}% - 18px)`, width: 36, height: 36, borderRadius: 18, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }} />
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const Cinematic = () => (
  <Shot span={SHOTS.cinematic} name="0:09 Cinematic" render={(tt) => {
    const s = pop(tt, 0, SPRING_SOFT);
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.62, 1])})` }}>
          <Photo src="mountain_hero" w={1560} h={580} r={30} kb={ramp(tt, [0, 34], [0.02, 0.1], ease.linear)}>
            <div style={{ position: "absolute", left: 44, right: 44, bottom: 38, display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 62, height: 62, borderRadius: 31, background: "rgba(255,255,255,0.28)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="play" size={24} color="#fff" />
              </div>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)" }}>
                <div style={{ width: `${ramp(tt, [0, 34], [5, 40], ease.linear)}%`, height: "100%", borderRadius: 2, background: "#fff" }} />
              </div>
            </div>
          </Photo>
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const AnyStyle = () => (
  <Shot span={SHOTS.anystyle} name="0:10 Any style" render={(tt) => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 46 }}>
      {[["cinematic_tile", "Cinematic"], ["tile_3d", "3D"], ["tile_bottle", "Minimal"], ["tile_illustration", "Illustration"]].map(([src, label], i) => {
        const p = pop(tt, i * 3, { damping: 15, stiffness: 190, mass: 0.7 });
        return (
          <div key={src} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 90}px) scale(${0.92 + 0.08 * p})` }}>
            <Photo src={src} w={260} h={370} r={24} />
            <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 500, color: L.ink2, letterSpacing: "-0.01em" }}>{label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  )} />
);

export const Poster = () => (
  <Shot span={SHOTS.poster} name="0:11 Example video" render={(tt) => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `scale(${punch(tt, 0, 0.04)})` }}>
        <Photo src="coffee_splash" w={1560} h={880} r={32} kb={ramp(tt, [0, 34], [0.12, 0.02], ease.out)}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,10,4,0.82) 0%, rgba(20,10,4,0.45) 45%, transparent 70%)" }} />
          <div style={{ position: "absolute", left: 110, top: 150 }}>
            {["GOOD", "IDEAS", "TASTE", "BETTER"].map((w, i) => {
              const p = pop(tt, i * 3, { damping: 14, stiffness: 240, mass: 0.6 });
              return (
                <div key={w} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 0.98, color: "#FFF6EC", letterSpacing: "-0.02em", transform: `skewX(-9deg) scale(${interpolate(p, [0, 1], [1.4, 1])})`, transformOrigin: "0 50%", opacity: Math.min(1, p * 2), filter: p < 0.95 ? `blur(${(1 - p) * 10}px)` : undefined, textShadow: "0 6px 30px rgba(0,0,0,0.35)" }}>
                  {w}
                </div>
              );
            })}
          </div>
        </Photo>
      </div>
    </AbsoluteFill>
  )} />
);

const CHIPS: [string, string, string, number, number][] = [
  ["Product Launch", "#ECEBFF", "#5B4FE0", 760, 360],
  ["Social Media Ad", "#FFE8EF", "#D9436F", 1200, 330],
  ["Explainer Video", "#E6F0FF", "#3567D8", 800, 520],
  ["YouTube Video", "#FFF1E2", "#D5701C", 1230, 500],
  ["Motion Graphic", "#E2F8EF", "#18916A", 830, 690],
  ["Brand Film", "#E9EDFF", "#3F53D2", 1240, 670],
];
export const UseCases = () => (
  <Shot span={SHOTS.usecases} name="0:12 Use cases" render={(tt) => (
    <AbsoluteFill style={{ transform: "rotate(-7deg)" }}>
      {CHIPS.map(([label, bg, fg, x, y], i) => {
        const p = pop(tt, i * 2.5, { damping: 14, stiffness: 200, mass: 0.6 });
        return (
          <div key={label} style={{ position: "absolute", left: x, top: y + Math.sin(tt / 12 + i) * 6, transform: `translate(-50%, -50%) scale(${p})`, opacity: Math.min(1, p * 2), padding: "22px 38px", borderRadius: 22, background: bg, color: fg, fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: "-0.01em", boxShadow: "0 18px 40px rgba(30,35,60,0.10), inset 0 1px 0 rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>
            {label}
          </div>
        );
      })}
    </AbsoluteFill>
  )} />
);

const COVER = ["castle", "hiker", "coffee_beans", "cup_white", "city", "cinematic_tile", "tile_illustration"];
export const Creators = () => (
  <Shot span={SHOTS.creators} name="0:13 Built for creators" render={(tt) => (
    <AbsoluteFill>
      {COVER.map((src, i) => {
        const x = (i - 3) * 340 - tt * 7 + 60;
        const k = Math.min(1, Math.abs(x) / 900);
        return (
          <div key={src} style={{ position: "absolute", left: 960 - 160 + x, top: 540 - 230, zIndex: 100 - Math.round(Math.abs(x)), transform: `perspective(1600px) rotateY(${Math.max(-38, Math.min(38, -x / 22))}deg) scale(${1.12 - 0.22 * k})`, filter: k > 0.5 ? `blur(${(k - 0.5) * 6}px)` : undefined }}>
            <Photo src={src} w={320} h={460} r={24} />
          </div>
        );
      })}
    </AbsoluteFill>
  )} />
);

export const STEP_AT = [8, 24, 40];
export const Workflow = () => (
  <Shot span={SHOTS.workflow} name="0:14 Workflow" render={(tt) => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${kf(tt, [0, 64], [0.98, 1.03], ease.linear)})` }}>
      <div style={{ ...GLASS, width: 780, borderRadius: 36, padding: 28, display: "flex", flexDirection: "column", gap: 12, transform: `translateY(${(1 - pop(tt, 0, SPRING_SOFT)) * 50}px)` }}>
        {["Type your idea", "AI creates", "Download & share"].map((label, i) => {
          const on = tt >= STEP_AT[i];
          const p = pop(tt, STEP_AT[i]);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 28, padding: "22px 26px", borderRadius: 22, background: on ? "#fff" : "transparent", boxShadow: on ? "0 10px 26px rgba(30,35,60,0.08)" : undefined, transform: `scale(${on ? 1 + (1 - p) * 0.03 : 1})` }}>
              <div style={{ width: 58, height: 58, borderRadius: 29, background: on ? L.ink : "rgba(15,17,21,0.06)", color: on ? "#fff" : L.ink2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 600, fontSize: 26 }}>
                {on ? <Icon name="check" size={26} color="#fff" stroke={3} /> : i + 1}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 500, color: on ? L.ink : L.gray, letterSpacing: "-0.015em" }}>{label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  )} />
);

const RING = ["mountain_hero", "city", "castle", "cup_white", "hiker", "tile_3d", "coffee_pour", "mountain_editor", "cinematic_tile", "tile_bottle", "coffee_warm", "tile_illustration", "coffee_splash", "mountain_hero"];
export const Sphere = () => (
  <Shot span={SHOTS.sphere} name="0:16 For everyone" render={(tt) => (
    <AbsoluteFill style={{ transform: `scale(${kf(tt, [0, 34], [1.12, 0.96])})` }}>
      {RING.map((src, i) => {
        const th = (i / RING.length) * Math.PI * 2 + tt * 0.02;
        const R = 820, x = Math.sin(th) * R, z = -Math.cos(th) * R + 400, y = [-190, 30, 230][i % 3];
        return <Float key={i} f={{ src, x, y, z, w: 300, h: 190, ry: (th * 180) / Math.PI }} camZ={-500} focus={-420} opacity={Math.cos(th) < -0.2 ? 1 : 0.55} />;
      })}
      <div style={{ position: "absolute", left: 960 - 290, top: 540 - 170, zIndex: 20000, transform: `scale(${pop(tt, 0, SPRING_SOFT)})` }}>
        <Photo src="coffee_splash" w={580} h={340} r={26} />
      </div>
    </AbsoluteFill>
  )} />
);

export const FAST_AT = [0, 10, 20];
export const Fast = () => (
  <Shot span={SHOTS.fast} name="0:17 Key benefits" render={(tt) => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      {[["Fast.", 700, L.ink], ["Beautiful.", 400, L.ink2], ["Limitless.", 400, L.ink2]].map(([w, wt, c], i) => (
        <Mask key={w as string} tt={tt} at={FAST_AT[i]} dur={12}>
          <Word size={124} weight={wt as number} color={c as string} style={{ textAlign: "center" }}>{w}</Word>
        </Mask>
      ))}
    </AbsoluteFill>
  )} />
);

export const DRAG: [number, number] = [6, 20];
export const Control = () => (
  <Shot span={SHOTS.control} name="0:18 Creative control" render={(tt) => {
    const d = ramp(tt, DRAG, [0, 1], ease.inOut);
    const pressed = tt >= DRAG[0] - 1 && tt < DRAG[1] + 1;
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...GLASS, position: "relative", width: 1400, height: 700, borderRadius: 36 }}>
          <div style={{ position: "absolute", left: 30, top: 60, display: "flex", flexDirection: "column", gap: 18 }}>
            {(["sparkles", "type", "layers", "palette", "wave", "film"] as const).map((ic, i) => (
              <div key={ic} style={{ width: 58, height: 58, borderRadius: 16, background: i === 2 ? L.ink : "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(30,35,60,0.08)" }}>
                <Icon name={ic} size={24} color={i === 2 ? "#fff" : L.ink2} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 150, top: 50 }}>
            <Photo src="mountain_editor" w={1080} h={455} r={20} kb={ramp(tt, [0, 34], [0, 0.05], ease.linear)} />
          </div>
          <div style={{ position: "absolute", left: 150, right: 60, top: 540, height: 110 }}>
            <div style={{ position: "absolute", left: 60, top: 6, width: 520, height: 38, borderRadius: 12, background: `linear-gradient(90deg, ${L.lavender}, ${L.blue})` }} />
            <div style={{ position: "absolute", left: 300 + d * 180, top: 58, width: 480, height: 38, borderRadius: 12, background: `linear-gradient(90deg, #7BE8C4, ${L.mint})`, boxShadow: pressed ? "0 8px 24px rgba(40,180,130,0.35)" : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={20} color="#fff" stroke={3} />
            </div>
            <Cursor x={540 + d * 180} y={72} press={pressed ? 1 : 0} size={38} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }} />
);

export const Outcome = () => (
  <Shot span={SHOTS.outcome} name="0:19 Outcome" render={(tt) => (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${kf(tt, [0, 64], [1.1, 1.0], ease.linear)})` }}>
        <Art name="coffee_warm" w={1920} h={1080} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(30,18,10,0.82) 0%, rgba(30,18,10,0.55) 38%, rgba(30,18,10,0) 70%)" }} />
      <div style={{ position: "absolute", left: 200, top: 290 }}>
        {[["From", 400], ["ideas to", 400], ["amazing", 700], ["videos.", 700]].map(([w, wt], i) => (
          <Mask key={w as string} tt={tt} at={2 + i * 3}>
            <Word size={112} weight={wt as number} color={wt === 700 ? "#FFFFFF" : "rgba(255,255,255,0.78)"}>{w}</Word>
          </Mask>
        ))}
      </div>
    </AbsoluteFill>
  )} />
);

export const CLICK_AT = 16;
export const Cta = () => (
  <Shot span={SHOTS.cta} name="0:21 Call to action" render={(tt) => {
    const cp = ramp(tt, [2, CLICK_AT - 1], [0, 1], ease.inOut);
    const press = ramp(tt, [CLICK_AT - 2, CLICK_AT], [0, 1]) * ramp(tt, [CLICK_AT, CLICK_AT + 5], [1, 0]);
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...GLASS, background: "#fff", width: 620, height: 140, borderRadius: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, transform: `scale(${pop(tt, 0, SPRING_SOFT) * (1 - press * 0.05)})` }}>
          <Word size={56} weight={600} color={L.ink}>Try Pine Pro</Word>
          <div style={{ transform: `translateX(${ramp(tt, [CLICK_AT, CLICK_AT + 10], [0, 12], ease.out)}px)` }}>
            <Icon name="arrowRight" size={50} color={L.ink} stroke={2.4} />
          </div>
        </div>
        <Cursor x={interpolate(cp, [0, 1], [1500, 1080])} y={interpolate(cp, [0, 1], [920, 560])} press={press} ripple={ramp(tt, [CLICK_AT, CLICK_AT + 10], [0, 1])} size={44} />
      </AbsoluteFill>
    );
  }} />
);

export const Brand = () => (
  <Shot span={SHOTS.brand} name="0:22 Brand close" render={(tt) => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, transform: `scale(${kf(tt, [0, 34], [1.04, 1])})` }}>
        <PineMark size={104} build={ramp(tt, [0, 10], [0.4, 1])} />
        <Word size={104} weight={700} color={L.ink}>Pineapple</Word>
      </div>
      <div style={{ display: "flex", fontFamily: SANS, fontSize: 24, fontWeight: 500, color: L.gray, letterSpacing: "0.55em" }}>
        {"CREATE · ANIMATE · INSPIRE".split("").map((ch, i) => (
          <span key={i} style={{ opacity: ramp(tt, [6 + i * 0.5, 10 + i * 0.5], [0, 1]), whiteSpace: "pre" }}>{ch}</span>
        ))}
      </div>
    </AbsoluteFill>
  )} />
);

export const Final = () => (
  <Shot span={SHOTS.final} name="0:23 Final frame" render={(tt) => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", transform: `scale(${kf(tt, [0, 60], [1, 1.03], ease.linear)})` }}>
      <Mask tt={tt} at={0}><Word size={170} weight={700} color={L.ink} style={{ textAlign: "center" }}>Pine Pro</Word></Mask>
      <div style={{ height: 18 }} />
      <Mask tt={tt} at={5}><Word size={70} weight={400} color={L.gray} style={{ textAlign: "center" }}>Now available.</Word></Mask>
    </AbsoluteFill>
  )} />
);
