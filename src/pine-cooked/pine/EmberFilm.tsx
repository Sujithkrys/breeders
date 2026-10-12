// Copy of src/pine-launch/EmberFilm.tsx with a redesigned "steeped for 18 hours" shot (a cold-brew glass filling up
// beside a rolling odometer); every other shot is unchanged.
import React, { useId } from "react";
import { random } from "remotion";
import { ease, kf, pop, punch, ramp } from "../../utils";
import { TIGHT } from "../../pine-launch/theme";

// "Ember Cold Brew" launch film — the video Pine Pro generates in the demo.
// Drawn at 1920×1080 and driven by an explicit local time `t` (30fps units) so it can also play inside the editor preview.
// Cut on a 120 BPM grid: one beat = 15 units.
export const ESP = "#170C07";
export const EMB = "#FF4F1F";
export const AMB = "#FF9A3C";
export const CRM = "#F4E7D4";
const ICE = "#D8ECF2";
export const FILM_LEN = 210;

const Stage: React.FC<{ bg: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ bg, children, style }) => (
  <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden", ...style }}>{children}</div>
);

const Tag: React.FC<{ children: React.ReactNode; color: string; pos: React.CSSProperties }> = ({ children, color, pos }) => (
  <div style={{ position: "absolute", fontFamily: TIGHT, fontWeight: 600, fontSize: 20, letterSpacing: "0.28em", color, ...pos }}>{children}</div>
);

// Letters rise out of a mask, staggered.
const Rise: React.FC<{ text: string; t: number; at: number; size: number; color: string; weight?: number; stagger?: number; tracking?: string }> = ({ text, t, at, size, color, weight = 800, stagger = 1.2, tracking = "-0.055em" }) => (
  <div style={{ display: "flex", overflow: "hidden", paddingBottom: size * 0.04, fontFamily: TIGHT, fontWeight: weight, fontSize: size, lineHeight: 0.9, color, letterSpacing: tracking }}>
    {text.split("").map((ch, i) => {
      const p = ramp(t, [at + i * stagger, at + i * stagger + 9], [0, 1], ease.out);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${(1 - p) * 105}%)` }}>
          {ch}
        </span>
      );
    })}
  </div>
);

export const Can: React.FC<{ w: number; t: number; body?: [string, string, string]; label?: string; ink?: string; name?: string }> = ({ w, t, body = ["#B8290A", EMB, "#FF8A55"], label = CRM, ink = ESP, name = "COLD BREW" }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = w * 1.86;
  const scroll = (t * 3.2) % (w * 1.4);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.22" stopColor={body[1]} />
          <stop offset="0.45" stopColor={body[2]} />
          <stop offset="0.6" stopColor={body[1]} />
          <stop offset="1" stopColor={body[0]} />
        </linearGradient>
        <linearGradient id={`m${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#7C7C7C" />
          <stop offset="0.4" stopColor="#F2F2F2" />
          <stop offset="0.7" stopColor="#B5B5B5" />
          <stop offset="1" stopColor="#6E6E6E" />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.42" />
          <stop offset="0.28" stopColor="#000" stopOpacity="0" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <clipPath id={`l${id}`}>
          <rect x={0} y={h * 0.3} width={w} height={h * 0.42} />
        </clipPath>
      </defs>
      <ellipse cx={w / 2} cy={h + w * 0.02} rx={w * 0.55} ry={w * 0.07} fill="#000" opacity={0.28} />
      <rect x={w * 0.04} y={h * 0.035} width={w * 0.92} height={h * 0.07} rx={w * 0.06} fill={`url(#m${id})`} />
      <rect x={0} y={h * 0.08} width={w} height={h * 0.87} rx={w * 0.09} fill={`url(#b${id})`} />
      <rect x={0} y={h * 0.3} width={w} height={h * 0.42} fill={label} />
      <g clipPath={`url(#l${id})`}>
        {[0, 1].map((k) => (
          <text key={k} x={w * 0.5 - scroll + k * w * 1.4} y={h * 0.53} textAnchor="middle" fontFamily={TIGHT} fontWeight={800} fontSize={w * 0.3} letterSpacing={-w * 0.012} fill={ink}>
            EMBER
          </text>
        ))}
        {[0, 1].map((k) => (
          <text key={k} x={w * 0.5 - scroll + k * w * 1.4} y={h * 0.62} textAnchor="middle" fontFamily={TIGHT} fontWeight={600} fontSize={w * 0.07} letterSpacing={w * 0.02} fill={ink}>
            {name}
          </text>
        ))}
      </g>
      <rect x={0} y={h * 0.08} width={w} height={h * 0.87} rx={w * 0.09} fill={`url(#s${id})`} />
      <rect x={w * 0.02} y={h * 0.93} width={w * 0.96} height={h * 0.05} rx={w * 0.05} fill={`url(#m${id})`} />
      {Array.from({ length: 34 }, (_, i) => {
        const y = h * (0.12 + random(`dy${i}`) * 0.8);
        if (y > h * 0.3 && y < h * 0.72 && i % 3) return null;
        return <ellipse key={i} cx={w * (0.08 + random(`dx${i}`) * 0.84)} cy={y} rx={w * (0.006 + random(`dr${i}`) * 0.012)} ry={w * (0.009 + random(`dr${i}`) * 0.016)} fill="#fff" opacity={0.45} />;
      })}
    </svg>
  );
};

const Ice: React.FC<{ s: number; rot: number }> = ({ s, rot }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.2, background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(200,230,240,0.45) 55%, rgba(170,210,225,0.6))", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "inset -6px -8px 14px rgba(120,170,190,0.35), 0 12px 24px rgba(60,30,10,0.18)", transform: `rotate(${rot}deg)` }} />
);

export const Flame: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <defs>
      <linearGradient id="emberFlame" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={EMB} />
        <stop offset="1" stopColor={AMB} />
      </linearGradient>
    </defs>
    <path d="M52 2 C60 30 92 46 92 84 C92 110 74 128 50 128 C26 128 8 110 8 84 C8 62 22 52 30 34 C35 52 44 58 50 60 C43 40 45 20 52 2 Z" fill="url(#emberFlame)" />
    <path d="M50 70 C58 84 70 90 70 104 C70 116 61 124 50 124 C39 124 30 116 30 104 C30 94 38 88 42 80 C45 88 49 90 52 90 C49 84 48 76 50 70 Z" fill={CRM} opacity={0.9} />
  </svg>
);

// ---------- scenes ----------
const Title: React.FC<{ t: number; punchy: boolean }> = ({ t, punchy }) => {
  if (t < 15) {
    return (
      <Stage bg={ESP}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Rise text="COLD" t={t} at={0} size={430} color={CRM} />
        </div>
        <Tag color="rgba(244,231,212,0.6)" pos={{ left: 70, top: 60 }}>EMBER COFFEE CO.</Tag>
        <Tag color="rgba(244,231,212,0.6)" pos={{ right: 70, bottom: 60 }}>001 — COLD BREW</Tag>
      </Stage>
    );
  }
  const k = t - 15;
  const wipe = ramp(k, [0, 8], [0, 1], ease.out);
  const shake = punchy && k < 12 ? (1 - k / 12) * 16 : 0;
  return (
    <Stage bg={ESP}>
      <div style={{ position: "absolute", left: 960 - 1200 * wipe, top: 540 - 1200 * wipe, width: 2400 * wipe, height: 2400 * wipe, borderRadius: "50%", background: EMB }} />
      {punchy && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(255,210,120,0.55), transparent 60%)", opacity: kf(k, [0, 2, 12], [0, 1, 0]) }} />}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${Math.sin(k * 3.1) * shake}px, ${Math.cos(k * 2.3) * shake}px)` }}>
        <div style={{ display: "flex", fontFamily: TIGHT, fontWeight: 800, fontSize: 430, lineHeight: 0.9, color: ESP, letterSpacing: "-0.055em" }}>
          {"BREW".split("").map((ch, i) => {
            const p = pop(k, i * (punchy ? 0.8 : 1.2), { damping: punchy ? 11 : 15, stiffness: punchy ? 260 : 200, mass: 0.6 });
            const from = punchy ? 2.6 : 1.5;
            return (
              <span key={i} style={{ display: "inline-block", transform: `scale(${from + (1 - from) * p})`, opacity: Math.min(1, p * 2.5), filter: p < 0.9 ? `blur(${(1 - p) * 14}px)` : undefined }}>
                {ch}
              </span>
            );
          })}
        </div>
      </div>
      <Tag color="rgba(23,12,7,0.65)" pos={{ left: 70, top: 60 }}>EMBER COFFEE CO.</Tag>
      <Tag color="rgba(23,12,7,0.65)" pos={{ right: 70, bottom: 60 }}>001 — COLD BREW</Tag>
    </Stage>
  );
};

const Product: React.FC<{ t: number }> = ({ t }) => {
  const drop = pop(t, 0, { damping: 13, stiffness: 150, mass: 0.9 });
  const cubes = [
    { x: -330, y: 250, s: 120, at: 6, r: -14 },
    { x: 270, y: 280, s: 104, at: 9, r: 18 },
    { x: -190, y: 330, s: 86, at: 12, r: 32 },
    { x: 370, y: 190, s: 76, at: 15, r: -24 },
    { x: 140, y: 350, s: 70, at: 18, r: 8 },
  ];
  return (
    <Stage bg={CRM}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${punch(t, 30, 0.07)})` }}>
        <div style={{ position: "absolute", top: 250, left: 0, whiteSpace: "nowrap", fontFamily: TIGHT, fontWeight: 800, fontSize: 560, lineHeight: 1, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "2px rgba(23,12,7,0.12)", transform: `translateX(${-200 - t * 9}px)` }}>
          EMBER EMBER EMBER
        </div>
        <div style={{ position: "absolute", left: 960 - 250, top: 540 - 820 + 60, width: 500, height: 1000, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,120,60,0.28), transparent 65%)" }} />
        <div style={{ position: "absolute", left: 960 - 150, top: 110 - (1 - drop) * 1100, transform: `rotate(${(1 - drop) * -8}deg)` }}>
          <Can w={300} t={t} />
        </div>
        {cubes.map((c, i) => {
          const p = pop(t, c.at, { damping: 12, stiffness: 170, mass: 0.7 });
          return (
            <div key={i} style={{ position: "absolute", left: 960 + c.x - c.s / 2, top: 540 + c.y - c.s / 2 - (1 - p) * 900, opacity: t >= c.at ? 1 : 0 }}>
              <Ice s={c.s} rot={c.r + (1 - p) * 60} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 170, top: 400 }}>
          <Rise text="Slow-steeped." t={t} at={12} size={78} color={ESP} weight={700} stagger={0.5} tracking="-0.035em" />
        </div>
        <div style={{ position: "absolute", right: 170, top: 620 }}>
          <Rise text="Seriously smooth." t={t} at={20} size={78} color={ESP} weight={700} stagger={0.5} tracking="-0.035em" />
        </div>
      </div>
    </Stage>
  );
};

// Odometer column: `v` is the value this column shows (fractional while rolling); digits slide with a speed blur.
const Roll: React.FC<{ digits: string; v: number; size: number; color: string; speed: number }> = ({ digits, v, size, color, speed }) => (
  <div style={{ height: size, overflow: "hidden", lineHeight: 1 }}>
    <div style={{ transform: `translateY(${-v * size}px)`, filter: speed > 0.05 ? `blur(${Math.min(5, speed * 12)}px)` : undefined }}>
      {digits.split("").map((d, i) => (
        <div key={i} style={{ height: size, fontFamily: TIGHT, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.05em", color, fontVariantNumeric: "tabular-nums" }}>{d}</div>
      ))}
    </div>
  </div>
);
// A tapered glass fills with cold brew over the shot; ice rides the surface, bubbles rise, a warm light glows behind.
const GX = 600, GTOP = 250, GBOT = 830, WT = 170, WB = 140;
const glassPath = `M ${GX - WT} ${GTOP} L ${GX - WB} ${GBOT - 24} Q ${GX - WB} ${GBOT} ${GX - WB + 24} ${GBOT} L ${GX + WB - 24} ${GBOT} Q ${GX + WB} ${GBOT} ${GX + WB} ${GBOT - 24} L ${GX + WT} ${GTOP}`;
const ICE_CUBES: [number, number, number][] = [[-62, -14, 0], [48, 10, 1], [-4, 22, 2]];
const Steep: React.FC<{ t: number }> = ({ t }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = ramp(t, [2, 34], [0, 1], ease.inOut);
  const v = 18 * p;
  const dv = 18 * (ramp(t + 1, [2, 34], [0, 1], ease.inOut) - p); // digits per unit → roll blur
  const level = GBOT - 30 - p * (GBOT - GTOP - 110);
  const wave = Array.from({ length: 25 }, (_, i) => {
    const x = GX - WT - 10 + i * ((2 * WT + 20) / 24);
    return `L ${x.toFixed(1)} ${(level + Math.sin(i * 0.8 + t * 0.35) * 5 * (1 - p * 0.5)).toFixed(1)}`;
  }).join(" ");
  const inP = ramp(t, [0, 8], [0, 1], ease.out);
  const hit = t >= 34 ? kf(t, [34, 36, 44], [0, 1, 0]) : 0;
  return (
    <Stage bg={ESP}>
      <div style={{ position: "absolute", left: GX - 560, top: 80, width: 1120, height: 1000, background: `radial-gradient(ellipse 42% 48% at 50% 55%, rgba(255,120,40,${0.22 + 0.2 * p + 0.25 * hit}), transparent 70%)` }} />
      {Array.from({ length: 36 }, (_, i) => {
        const sp = 2 + random(`es${i}`) * 4;
        const y = ((random(`ey${i}`) * 1200 - t * sp) % 1200 + 1200) % 1200;
        const s = 2 + random(`ez${i}`) * 4;
        return <div key={i} style={{ position: "absolute", left: random(`ex${i}`) * 1920, top: y - 60, width: s, height: s, borderRadius: s, background: AMB, opacity: 0.18 + 0.3 * random(`eo${i}`), boxShadow: `0 0 ${s * 3}px ${EMB}` }} />;
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: inP, transform: `translateY(${(1 - inP) * 40}px)` }}>
        <defs>
          <clipPath id={`g${id}`}>
            <path d={`${glassPath} Z`} />
          </clipPath>
          <linearGradient id={`l${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8A4418" />
            <stop offset="0.2" stopColor="#3A1808" />
            <stop offset="1" stopColor="#140703" />
          </linearGradient>
          <linearGradient id={`h${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#g${id})`}>
          <rect x={GX - 200} y={GTOP} width={400} height={GBOT - GTOP} fill="rgba(244,231,212,0.05)" />
          <path d={`M ${GX - WT - 10} ${GBOT + 10} ${wave} L ${GX + WT + 10} ${GBOT + 10} Z`} fill={`url(#l${id})`} />
          <path d={`M ${GX - WT - 10} ${level} ${wave}`} fill="none" stroke="rgba(255,170,90,0.6)" strokeWidth={3} />
          {Array.from({ length: 16 }, (_, i) => {
            const by = GBOT - 30 - ((t * (1.5 + random(`bs${i}`) * 2) + random(`bo${i}`) * 500) % 500);
            return by > level + 8 ? <circle key={i} cx={GX - 110 + random(`bx${i}`) * 220} cy={by} r={1.5 + random(`br${i}`) * 3} fill="rgba(255,200,150,0.35)" /> : null;
          })}
          {ICE_CUBES.map(([dx, dy, k]) => (
            <rect key={k} x={GX + dx - 42} y={level - 40 + dy + Math.sin(t / 7 + k) * 5} width={84} height={76} rx={14} fill={ICE} fillOpacity={0.5} stroke="rgba(255,255,255,0.75)" strokeWidth={2} transform={`rotate(${14 * (k - 1) + Math.sin(t / 9 + k) * 5} ${GX + dx} ${level + dy})`} />
          ))}
        </g>
        <path d={glassPath} fill="none" stroke="rgba(244,231,212,0.5)" strokeWidth={4} strokeLinejoin="round" />
        <path d={`M ${GX - WT + 36} ${GTOP + 34} L ${GX - WB + 30} ${GBOT - 50}`} stroke={`url(#h${id})`} strokeWidth={14} strokeLinecap="round" opacity={0.5} />
        <ellipse cx={GX} cy={GTOP} rx={WT} ry={16} fill="none" stroke="rgba(244,231,212,0.35)" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 940, top: 290 }}>
        <Tag color={AMB} pos={{ position: "relative", marginBottom: 26, opacity: ramp(t, [0, 6]) }}>EMBER COLD BREW</Tag>
        <Rise text="Slow-steeped for" t={t} at={1} size={64} color={CRM} weight={500} stagger={0.35} tracking="-0.025em" />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 14, transform: `scale(${punch(t, 34, 0.06)})`, transformOrigin: "0 100%" }}>
          <div style={{ display: "flex" }}>
            <Roll digits="01" v={Math.min(1, Math.max(0, v - 9))} size={250} color={CRM} speed={v > 9 && v < 10 ? dv : 0} />
            <Roll digits="0123456789012345678" v={v} size={250} color={CRM} speed={dv} />
          </div>
          <div style={{ fontFamily: TIGHT, fontWeight: 700, fontSize: 96, letterSpacing: "-0.04em", color: AMB, paddingBottom: 24, opacity: ramp(t, [6, 12]) }}>hours</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} style={{ width: 26, height: 8, borderRadius: 4, background: v >= i + 1 ? (i === 17 ? AMB : EMB) : "rgba(244,231,212,0.14)", boxShadow: v >= i + 1 ? `0 0 ${10 + hit * 16}px rgba(255,90,30,0.7)` : undefined }} />
          ))}
        </div>
      </div>
    </Stage>
  );
};

const TILES: { bg: string; kind: "can" | "word"; word?: string; body?: [string, string, string]; label?: string; ink?: string; name?: string; fg?: string }[] = [
  { bg: EMB, kind: "can", body: ["#2A140B", "#4A2616", "#7A4A30"], label: CRM, name: "MOCHA" },
  { bg: CRM, kind: "word", word: "BOLD", fg: ESP },
  { bg: ESP, kind: "can" },
  { bg: ESP, kind: "word", word: "COLD", fg: CRM },
  { bg: ICE, kind: "can", body: ["#C9B79C", "#F4E7D4", "#FFFFFF"], label: EMB, ink: CRM, name: "VANILLA" },
  { bg: EMB, kind: "word", word: "SMOOTH", fg: ESP },
];
const Grid: React.FC<{ t: number }> = ({ t }) => (
  <Stage bg={ESP}>
    {TILES.map((tile, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const p = ramp(t, [i * 2.2, i * 2.2 + 8], [0, 1], ease.out);
      const dir = i % 2 ? 1 : -1;
      return (
        <div key={i} style={{ position: "absolute", left: col * 640, top: row * 540, width: 640, height: 540, overflow: "hidden", clipPath: `inset(${dir > 0 ? (1 - p) * 100 : 0}% 0 ${dir < 0 ? (1 - p) * 100 : 0}% 0)` }}>
          <div style={{ position: "absolute", inset: 0, background: tile.bg, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1.15 - 0.15 * p})` }}>
            {tile.kind === "can" ? (
              <div style={{ transform: `translateY(${Math.sin(t / 9 + i) * 8}px) rotate(${(i - 2) * 3}deg)` }}>
                <Can w={170} t={t + i * 30} body={tile.body} label={tile.label} ink={tile.ink} name={tile.name} />
              </div>
            ) : (
              <div style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: tile.word!.length > 4 ? 170 : 220, letterSpacing: "-0.05em", color: tile.fg }}>{tile.word}</div>
            )}
          </div>
        </div>
      );
    })}
    <div style={{ position: "absolute", left: 0, right: 0, top: 540 - 55, height: 110, background: ESP, overflow: "hidden", transform: `scaleY(${ramp(t, [22, 28], [0, 1], ease.out)})` }}>
      <div style={{ whiteSpace: "nowrap", fontFamily: TIGHT, fontWeight: 700, fontSize: 64, lineHeight: "110px", color: CRM, letterSpacing: "-0.02em", transform: `translateX(${-t * 14}px)` }}>
        {"EMBER COLD BREW  ●  ".repeat(8)}
      </div>
    </div>
  </Stage>
);

const End: React.FC<{ t: number }> = ({ t }) => {
  const m = pop(t, 0, { damping: 13, stiffness: 180, mass: 0.7 });
  return (
    <Stage bg={ESP}>
      <div style={{ position: "absolute", left: 960 - 500, top: 300 - 400, width: 1000, height: 800, background: "radial-gradient(ellipse, rgba(255,80,30,0.3), transparent 62%)", opacity: m }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <div style={{ transform: `scale(${m}) translateY(${(1 - m) * 40}px)`, marginBottom: 6 }}>
          <Flame size={120} />
        </div>
        <Rise text="EMBER" t={t} at={4} size={190} color={CRM} stagger={1} tracking="-0.04em" />
        <div style={{ fontFamily: TIGHT, fontWeight: 500, fontSize: 40, color: "rgba(244,231,212,0.72)", letterSpacing: "-0.01em", opacity: ramp(t, [12, 18]), transform: `translateY(${ramp(t, [12, 20], [14, 0])}px)` }}>Cold brew, slow-steeped.</div>
        <div style={{ marginTop: 18, padding: "18px 40px", borderRadius: 40, background: EMB, color: ESP, fontFamily: TIGHT, fontWeight: 700, fontSize: 30, transform: `scale(${pop(t, 20)})` }}>Now pouring</div>
      </div>
    </Stage>
  );
};

export const EmberFilm: React.FC<{ t: number; punchy?: boolean }> = ({ t, punchy = false }) => (
  <div style={{ position: "relative", width: 1920, height: 1080, overflow: "hidden", background: ESP }}>
    {t < 30 ? <Title t={t} punchy={punchy} /> : t < 75 ? <Product t={t - 30} /> : t < 120 ? <Steep t={t - 75} /> : t < 165 ? <Grid t={t - 120} /> : <End t={t - 165} />}
  </div>
);

// Film-internal cut points (units), used by the soundtrack for its hits.
export const FILM_CUTS = [0, 15, 30, 75, 120, 165];
