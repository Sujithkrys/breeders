// HukumReel: a 30s vertical fan tribute for Superstar Rajinikanth and Jailer 2, cut to our remix of "Hukum"
// (Anirudh Ravichander). The story: a classified prison file on the Jailer, tense and dark for six bars, one silent beat,
// then the file can't hold him: it shatters on "Hukum" into a mass montage, a chant, and a gold SUPERSTAR seal.
// Every shot sits on the remix's grid (136.02 BPM, 17 bars); sound: scripts/compose-hukum.mjs → public/hukum/mix.wav.
// Everything is drawn in code: silhouettes and props only, no photos or film footage.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BreedersOutro, OUTRO_LEN, Watermark } from "../brand/Breeders";
import { ease, ramp } from "../utils";
import { Bars, Beam, Bust, C, DISPLAY, Dust, Fingerprint, Flash, Gold, H, Keys, MONO, Paper, PaperDefs, Redact, Seal, Shades, Shards, Stamp, W, Walker } from "./kit";

export const BEAT = 60 / 136.02;
const BODY_BEATS = 68;
export const HUKUM = { fps: 30, width: W, height: H, seconds: BODY_BEATS * BEAT + OUTRO_LEN };

const VIGNETTE = "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 45%, rgba(0,0,0,0.75) 100%)";
const Dark: React.FC<{ children?: React.ReactNode; warm?: number }> = ({ children, warm = 1 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 50% at 50% 40%, rgba(70,48,22,${0.55 * warm}) 0%, ${C.black} 70%)` }}>{children}</AbsoluteFill>
);
// a shot's camera: push from s0 to s1 over the shot, plus a shake
const Cam: React.FC<{ k: number; s0?: number; s1?: number; rot?: number; shake?: number; t: number; children: React.ReactNode; y?: number }> = ({ k, s0 = 1, s1 = 1.08, rot = 0, shake = 0, t, children, y = 0 }) => {
  const sx = shake * Math.sin(t * 91) * 14, sy = shake * Math.sin(t * 77 + 1) * 12;
  return <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy + y}px) scale(${s0 + (s1 - s0) * k}) rotate(${rot * k}deg)` }}>{children}</AbsoluteFill>;
};
const Center: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 0 }) => <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;

// ---------- the build: beats 0–23 ----------
const SealOpen: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const lamp = ramp(b, [1, 1.3]) * (0.92 + 0.08 * Math.sin(t * 30));
  return (
    <Dark warm={lamp}>
      <Beam x={W / 2} top={-200} width={900} opacity={lamp} />
      <Dust t={t} opacity={lamp} />
      <Cam k={ramp(b, [0, 8])} s0={1.15} s1={1} t={t}>
        <Center y={-40}>
          <div style={{ transform: `perspective(1200px) rotateY(${-24 + 40 * ramp(b, [0, 8], [0, 1], ease.inOut)}deg) rotateX(12deg)`, filter: `brightness(${0.2 + 0.8 * lamp})` }}>
            <Seal size={520} text="FILE 001 · CLASSIFIED" sweep={ramp(b, [2, 7])} />
          </div>
        </Center>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", fontFamily: MONO, fontSize: 30, letterSpacing: "0.32em", color: "#C9A86A", opacity: ramp(b, [4, 5]) * lamp }}>EYES ONLY</div>
      </Cam>
    </Dark>
  );
};
const LINES = ["FILE No. 001", "SUBJECT ...... THE JAILER", "STATUS ....... ACTIVE", "THREAT ....... ██████████"];
const FileShot: React.FC<{ b: number; t: number; stamps: number; shake: number }> = ({ b, t, stamps, shake }) => {
  const open = ramp(b, [8, 9], [0, 1], ease.out);
  const typed = (i: number) => {
    const st = 8.6 + i * 0.75;
    return LINES[i].slice(0, Math.max(0, Math.floor((b - st) * 14)));
  };
  const words = ["CLASSIFIED", "DANGEROUS", "DO NOT PROVOKE", "TIGER"];
  return (
    <Dark>
      <Beam x={W / 2 - 60} top={-260} width={1000} opacity={0.9} angle={4} />
      <Cam k={ramp(b, [8, 16])} s0={1.02} s1={1.14} t={t} shake={shake}>
        <Center>
          <div style={{ position: "relative", width: 860, height: 1180, transform: `perspective(1600px) rotateX(${16 - 10 * open}deg)` }}>
            <Paper w={860} h={1180} style={{ left: 0, top: 0 }}>
              <div style={{ position: "absolute", left: 70, top: 90, right: 70 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 64, color: "#3A2A14", letterSpacing: "0.04em" }}>PRISON DEPT. · CONFIDENTIAL</div>
                <div style={{ height: 3, background: "#3A2A14", opacity: 0.6, margin: "22px 0 40px" }} />
                {LINES.map((_, i) => (
                  <div key={i} style={{ fontFamily: MONO, fontSize: 36, color: "#2A1E10", marginBottom: 26, whiteSpace: "pre" }}>
                    {typed(i)}
                    <span style={{ opacity: Math.floor(t * 4) % 2 && typed(i).length < LINES[i].length && b > 8.6 + i * 0.75 ? 1 : 0 }}>▌</span>
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", right: 70, top: 470, width: 250, height: 310, background: "#1B140C", boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 25, top: 34 }}>
                  <Bust w={200} rim={0.6} />
                </div>
              </div>
            </Paper>
            {words.map((w, i) => (
              <div key={w} style={{ position: "absolute", left: [60, 300, 70, 330][i], top: [560, 690, 830, 960][i] }}>
                <Stamp text={w} press={ramp(b, [12 + i, 12 + i + 0.5]) * (stamps > i ? 1 : 0)} size={i === 3 ? 140 : 92} rotate={[-9, 6, -4, -12][i]} />
              </div>
            ))}
          </div>
        </Center>
      </Cam>
      <Dust t={t} opacity={0.6} />
    </Dark>
  );
};
const Evidence: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const k = b - Math.floor(b);
  if (b < 17) {
    // redaction peels off the line
    return (
      <Dark>
        <Cam k={k} s0={1.0} s1={1.08} t={t}>
          <Center>
            <Paper w={980} h={420} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 60, top: 70, fontFamily: MONO, fontSize: 34, color: "#2A1E10" }}>KNOWN AS</div>
              <div style={{ position: "absolute", left: 60, top: 140, width: 860, height: 150 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 132, color: "#1A1208", letterSpacing: "0.02em" }}>TIGER</div>
                <Redact w={860} h={150} peel={ramp(b, [16.1, 16.7], [0, 1], ease.inOut)} />
              </div>
            </Paper>
          </Center>
        </Cam>
      </Dark>
    );
  }
  if (b < 18) {
    // the polaroid drops, a camera flash, the red string pulls tight
    const drop = ramp(b, [17, 17.35], [0, 1], ease.out);
    return (
      <Dark>
        <Flash k={ramp(b, [17.05, 17.4], [0.8, 0])} />
        <Cam k={k} s0={1.1} s1={1.2} t={t} rot={-2}>
          <Center>
            <div style={{ transform: `translateY(${(1 - drop) * -500}px) rotate(${-6 + 10 * (1 - drop)}deg)`, background: "#F1EADB", padding: "34px 34px 120px", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
              <div style={{ width: 560, height: 640, background: "linear-gradient(180deg,#3A2A16,#120C06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 80, top: 60 }}>
                  <Bust w={400} glint={ramp(b, [17.2, 17.9])} />
                </div>
                {/* height chart lines */}
                {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 40 + i * 70, height: 2, background: "rgba(232,182,74,0.25)" }} />)}
              </div>
            </div>
          </Center>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <path d={`M0 420 Q ${W / 2} ${520 - 120 * ramp(b, [17.3, 17.7])} ${W} 360`} stroke={C.red} strokeWidth={6} fill="none" />
          </svg>
        </Cam>
      </Dark>
    );
  }
  // b18–20: fingerprint scan
  return (
    <Dark>
      <Cam k={ramp(b, [18, 20])} s0={1.3} s1={1.55} t={t}>
        <Center>
          <Paper w={720} h={900} style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 50, top: 50, fontFamily: MONO, fontSize: 28, color: "#2A1E10" }}>RIGHT THUMB · MATCH</div>
            <div style={{ position: "absolute", left: 160, top: 160 }}>
              <Fingerprint size={400} reveal={ramp(b, [18, 18.8])} scan={ramp(b, [18.4, 19.8])} />
            </div>
            <div style={{ position: "absolute", left: 50, bottom: 50, fontFamily: DISPLAY, fontSize: 70, color: C.red, opacity: ramp(b, [19.6, 19.8]) }}>100% MATCH</div>
          </Paper>
        </Center>
      </Cam>
    </Dark>
  );
};
const ShadesTension: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const slide = ramp(b, [20, 21], [0, 1], ease.out);
  const shake = ramp(b, [21, 23], [0, 1], ease.in);
  const flicker = b > 21.5 ? (Math.sin(t * 60) > 0.2 ? 1 : 0.35) : 1;
  return (
    <Dark warm={flicker}>
      <Beam x={W / 2} top={-200} width={900} opacity={flicker} />
      <Dust t={t} opacity={flicker} />
      <Cam k={ramp(b, [20, 23])} s0={1.05} s1={1.35} t={t} shake={shake}>
        <Center y={60}>
          <div style={{ transform: `translateX(${(1 - slide) * -900}px)`, filter: `brightness(${0.4 + 0.6 * flicker})` }}>
            <Shades w={840} glint={ramp(b, [20.6, 22.4])} />
          </div>
        </Center>
      </Cam>
    </Dark>
  );
};

// ---------- the drop and the montage: beats 24–52 ----------
const HukumWord: React.FC<{ b: number; t: number; at: number; chrome?: boolean; small?: string; pump?: number }> = ({ b, t, at, chrome, small = "TIGER KA", pump = 0 }) => {
  const u = b - at;
  const hit = Math.exp(-u * 6);
  return (
    <Dark warm={0.6}>
      <Beam x={W / 2} top={-260} width={1300} opacity={0.6 + 0.4 * hit} />
      <Cam k={ramp(u, [0, 2])} s0={1.18 + 0.1 * pump} s1={1.0} t={t} shake={hit * 1.4}>
        <Center y={-40}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 70, letterSpacing: "0.5em", color: "#E7D2A0", marginBottom: 20, marginLeft: "0.5em", opacity: ramp(u, [0.15, 0.4]) }}>{small}</div>
            <Gold size={330} sweep={ramp(u, [0, 1.4])} chrome={chrome} glow={0.35 + 0.5 * hit}>HUKUM</Gold>
          </div>
        </Center>
      </Cam>
      <Dust t={t} n={110} />
    </Dark>
  );
};
const Twirl: React.FC<{ b: number; t: number; at: number }> = ({ b, t, at }) => {
  const u = b - at;
  // speed ramp: a slow turn, then a snap
  const k = u < 0.7 ? 0.3 * (u / 0.7) : 0.3 + 0.7 * ramp(u, [0.7, 1], [0, 1], ease.in);
  return (
    <Dark>
      <Beam x={W / 2 + 120} top={-260} width={900} opacity={0.9} angle={-6} />
      <Cam k={u} s0={1.2} s1={1.3} t={t}>
        <Center>
          <div style={{ transform: `rotateZ(${-30 + 50 * k}deg)` }}>
            <Shades w={900} turn={-70 + 140 * k} glint={k} />
          </div>
        </Center>
      </Cam>
    </Dark>
  );
};
const KeysShot: React.FC<{ b: number; t: number; at: number; close?: boolean }> = ({ b, t, at, close }) => {
  const u = b - at;
  return (
    <Dark>
      <Beam x={W / 2} top={-200} width={700} opacity={0.8} />
      <Cam k={u} s0={close ? 1.7 : 1.1} s1={close ? 1.85 : 1.2} t={t}>
        <Center y={-80}>
          <Keys size={520} swing={22 * Math.cos(u * Math.PI * 1.6) * Math.exp(-u * 0.8)} />
        </Center>
      </Cam>
      <Dust t={t} />
    </Dark>
  );
};
const WalkShot: React.FC<{ b: number; t: number; at: number }> = ({ b, t, at }) => {
  const u = b - at;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 35% at 50% 38%, #FFE3AE 0%, #C88F2E 30%, #1A1208 70%, #050403 100%)" }}>
      <Bars light={1} />
      <Cam k={u} s0={1.0} s1={1.12} t={t}>
        <Center y={-60}>
          <div style={{ transform: `scale(${0.92 + 0.12 * u})` }}>
            <Walker h={900} t={t} />
          </div>
        </Center>
        {/* the long shadow, thrown toward us across the floor */}
        <div style={{ position: "absolute", left: W / 2 - 160, top: 1330, width: 320, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,0.85), transparent)", transform: "perspective(500px) rotateX(55deg)", transformOrigin: "50% 0" }} />
      </Cam>
    </AbsoluteFill>
  );
};
const StampShot: React.FC<{ b: number; t: number; at: number; text: string; color?: string }> = ({ b, t, at, text, color }) => {
  const u = b - at;
  return (
    <Dark>
      <Cam k={u} s0={1.25} s1={1.12} t={t} shake={Math.exp(-u * 8) * 1.3}>
        <Center>
          <Paper w={900} h={1200} style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 70, top: 80, fontFamily: MONO, fontSize: 32, color: "#2A1E10", lineHeight: 1.9 }}>
              ORDER No. 001<br />ISSUED BY ...... THE JAILER<br />EFFECTIVE ...... IMMEDIATELY
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 480, display: "flex", justifyContent: "center" }}>
              <Stamp text={text} press={ramp(u, [0, 0.45])} size={170} rotate={-10} color={color} />
            </div>
          </Paper>
        </Center>
      </Cam>
    </Dark>
  );
};
const Stare: React.FC<{ b: number; t: number; at: number }> = ({ b, t, at }) => {
  const u = b - at;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 50% 40%, #6E4A18 0%, #1A1208 55%, #050403 100%)" }}>
      <Cam k={u} s0={1.25} s1={1.4} t={t}>
        <Center y={80}>
          <Bust w={860} glint={ramp(u, [0.2, 0.9])} />
        </Center>
      </Cam>
      <Flash k={ramp(u, [0.45, 0.52]) * (1 - ramp(u, [0.52, 0.66])) * 0.25} />
    </AbsoluteFill>
  );
};
// SUPERSTAR, a marquee of bulbs and gold letters, one letter on every half beat
const Marquee: React.FC<{ b: number; t: number; at: number }> = ({ b, t, at }) => {
  const u = b - at;
  const word = "SUPERSTAR";
  return (
    <Dark warm={0.5}>
      <Beam x={W / 2} top={-260} width={1300} opacity={0.7} />
      <Cam k={ramp(u, [0, 4])} s0={1.15} s1={1.0} t={t}>
        <Center>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 26px", transform: "rotate(-4deg)" }}>
            {word.split("").map((ch, i) => {
              const on = ramp(u, [i * 0.44, i * 0.44 + 0.12], [0, 1], ease.out);
              return (
                <div key={i} style={{ position: "relative", opacity: on, transform: `scale(${1.3 - 0.3 * on})` }}>
                  <Gold size={250} sweep={ramp(u, [i * 0.44, i * 0.44 + 1.2])} glow={0.6}>{ch}</Gold>
                </div>
              );
            })}
          </div>
        </Center>
      </Cam>
      <Dust t={t} n={90} />
    </Dark>
  );
};

// the montage, one shot per beat
type ShotFn = (b: number, t: number, at: number) => React.ReactElement;
const SHOTS: Record<number, ShotFn> = {
  26: (b, t, a) => <Twirl b={b} t={t} at={a} />,
  27: (b, t, a) => <KeysShot b={b} t={t} at={a} />,
  28: (b, t, a) => <WalkShot b={b} t={t} at={a} />,
  29: (b, t, a) => <StampShot b={b} t={t} at={a} text="APPROVED" color="#1E6B3A" />,
  30: (b, t, a) => <Stare b={b} t={t} at={a} />,
  31: (b, t, a) => <HukumWord b={b} t={t} at={a} chrome small="THALAIVAR" />,
  32: (b, t, a) => <Twirl b={b} t={t} at={a} />,
  33: (b, t, a) => <KeysShot b={b} t={t} at={a} close />,
  34: (b, t, a) => <Marquee b={b} t={t} at={a} />,
  38: (b, t, a) => <WalkShot b={b} t={t} at={a} />,
  39: (b, t, a) => <Stare b={b} t={t} at={a} />,
  45: (b, t, a) => <Twirl b={b} t={t} at={a} />,
  46: (b, t, a) => <KeysShot b={b} t={t} at={a} />,
  47: (b, t, a) => <StampShot b={b} t={t} at={a} text="TIGER" />,
  48: (b, t, a) => <WalkShot b={b} t={t} at={a} />,
  49: (b, t, a) => <Stare b={b} t={t} at={a} />,
  50: (b, t, a) => <HukumWord b={b} t={t} at={a} />,
  51: (b, t, a) => <Twirl b={b} t={t} at={a} />,
};
// the stutter (beats 40–45, matching the remix's chop): HUKUM pumped on every hit
const Stutter: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const at = b < 44 ? Math.floor(b) : b < 45 ? 44 + Math.floor((b - 44) * 2) / 2 : 45;
  const n = b < 44 ? Math.floor(b) - 40 : 4;
  const inv = n % 2 === 1;
  return (
    <AbsoluteFill style={{ background: inv ? "linear-gradient(180deg,#F4C65A,#A9741F)" : C.black }}>
      <Cam k={ramp(b - at, [0, 0.5])} s0={1.18 + 0.05 * n} s1={0.96 + 0.05 * n} t={t} shake={Math.exp(-(b - at) * 7)}>
        <Center>
          {inv ? (
            <div style={{ fontFamily: DISPLAY, fontSize: 290, color: C.black, lineHeight: 0.92 }}>HUKUM</div>
          ) : (
            <Gold size={290} sweep={b - at}>HUKUM</Gold>
          )}
        </Center>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------- the chant: beats 52–64, type on every half beat ----------
const CHANT = ["TIGER", "KA", "HUKUM", "JAI", "THALAIVAR", "JAI", "SUPERSTAR", "HUKUM", "TIGER", "KA", "HUKUM", "JAI", "SUPER", "STAR", "JAI", "HUKUM"];
const Chant: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  if (b >= 60) {
    // the last bar: the words collapse into the seal forming
    const k = ramp(b, [60, 63.5], [0, 1], ease.inOut);
    return (
      <Dark>
        <Beam x={W / 2} top={-260} width={1100} opacity={0.4 + 0.6 * k} />
        <Center>
          <div style={{ transform: `rotate(${(1 - k) * 200}deg) scale(${0.4 + 0.6 * k})`, opacity: k }}>
            <Seal size={680} text="SUPERSTAR" sweep={k} />
          </div>
        </Center>
        <Dust t={t} n={100} />
      </Dark>
    );
  }
  const i = Math.floor((b - 52) * 2);
  const w = CHANT[i % CHANT.length];
  const inv = i % 3 === 1;
  const u = (b - 52) * 2 - i;
  const size = w.length > 6 ? 200 : 300;
  return (
    <AbsoluteFill style={{ background: inv ? "linear-gradient(180deg,#F4C65A,#A9741F)" : C.black }}>
      <Cam k={u} s0={1.25} s1={1.0} t={t} shake={Math.exp(-u * 6) * 0.8} rot={i % 2 ? 3 : -3}>
        <Center>{inv ? <div style={{ fontFamily: DISPLAY, fontSize: size, color: C.black, lineHeight: 0.92 }}>{w}</div> : <Gold size={size} sweep={u}>{w}</Gold>}</Center>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------- the end: beats 64–68 ----------
const Final: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const press = ramp(b, [64, 64.5]);
  const sub = ramp(b, [65.2, 65.8]);
  return (
    <Dark>
      <Beam x={W / 2} top={-260} width={1100} opacity={0.9} />
      <Dust t={t} />
      <Cam k={ramp(b, [64, 68])} s0={1.06} s1={1.0} t={t} shake={Math.exp(-(b - 64) * 6) * 0.9}>
        <Center y={-80}>
          <div style={{ position: "relative", width: 860, height: 1120 }}>
            <Paper w={860} h={1120} tone="#B9925A" style={{ left: 0, top: 0 }}>
              <div style={{ position: "absolute", left: 70, top: 80, fontFamily: DISPLAY, fontSize: 60, color: "#3A2410", letterSpacing: "0.06em" }}>FILE No. 001 · CLOSED</div>
            </Paper>
            <div style={{ position: "absolute", left: 140, top: 300 }}>
              <Seal size={580} text="SUPERSTAR" press={press} sweep={ramp(b, [64.5, 66.5])} />
            </div>
          </div>
        </Center>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", opacity: sub }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 64, letterSpacing: "0.2em", color: "#E7D2A0" }}>JAILER 2</div>
          <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.3em", color: "#A88B57", marginTop: 14 }}>A FAN TRIBUTE</div>
        </div>
      </Cam>
    </Dark>
  );
};

const Shot: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  if (b < 8) return <SealOpen b={b} t={t} />;
  if (b < 16) return <FileShot b={b} t={t} stamps={b < 12 ? 0 : 4} shake={b >= 12 ? Math.exp(-(b - Math.floor(b)) * 7) * 0.9 : 0} />;
  if (b < 20) return <Evidence b={b} t={t} />;
  if (b < 23) return <ShadesTension b={b} t={t} />;
  if (b < 24) return <AbsoluteFill style={{ background: "#000" }} />; // the silent beat
  if (b < 26) return <HukumWord b={b} t={t} at={24} />;
  if (b >= 40 && b < 45) return <Stutter b={b} t={t} />;
  if (b < 52) {
    const keys = Object.keys(SHOTS).map(Number).filter((k) => k <= b);
    const at = Math.max(...keys);
    const until = at === 34 ? 38 : at + 1;
    return b < until ? SHOTS[at](b, t, at) : SHOTS[Math.max(...keys)](b, t, at);
  }
  if (b < 64) return <Chant b={b} t={t} />;
  return <Final b={b} t={t} />;
};

export const HukumReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = t / BEAT;
  const end = BODY_BEATS * BEAT;
  // a beat pulse on the whole frame in the mass section, flashes on the big hits
  const inMass = b >= 24 && b < 64;
  const pulse = inMass ? 1 + 0.035 * Math.exp(-(b - Math.floor(b)) * 9) : 1;
  const flash = Math.max(b >= 24 ? ramp(b, [24, 24.5], [0.95, 0]) : 0, b >= 52 ? ramp(b, [52, 52.4], [0.6, 0]) : 0, b >= 64 ? ramp(b, [64, 64.4], [0.5, 0]) : 0);
  // a horizontal smear on every cut in the montage
  const cut = inMass ? Math.max(0, 1 - Math.abs(b - Math.round(b)) * BEAT / 0.05) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("hukum/mix.wav")} />
      <PaperDefs />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="hsmear" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${cut * 26} 0`} />
        </filter>
      </svg>
      {t < end ? (
        <>
          <AbsoluteFill style={{ transform: `scale(${pulse})`, filter: cut > 0.05 ? "url(#hsmear)" : undefined }}>
            <Shot b={b} t={t} />
            <Shards k={ramp(b, [24, 26.5])} />
          </AbsoluteFill>
          <Flash k={flash} />
          <AbsoluteFill style={{ background: VIGNETTE, pointerEvents: "none" }} />
          <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.07, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")`, transform: `translate(${(frame * 37) % 40}px, ${(frame * 53) % 40}px)` }} />
          <Watermark opacity={(1 - ramp(t, [end - 0.3, end])) * 0.85} dark={1} />
        </>
      ) : (
        <BreedersOutro t={t - end} />
      )}
    </AbsoluteFill>
  );
};
