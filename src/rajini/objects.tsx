// Real photographed objects for the Rajinikanth tribute, each rigged to move like the real thing.
// Photos (credits in public/rajini/obj/CREDITS.txt and public/rajini/auto/CREDITS.md) are cut out onto white.
//   RealAuto  — the yellow-and-black Chennai auto: its own wheels spin, suspension bounce, shadow
//   Coin      — the ₹1 coin flipping between its two real faces, tossed on an arc
//   Shades    — aviators turning in 3D (a squash on X) and spinning in the plane
//   Watch     — the watch ticking: a one-step jolt on every beat
//   Keys      — the bunch of keys swinging from the ring like a pendulum
import React from "react";
import { Img, staticFile } from "remotion";
import WHEELS from "./autoWheels.json";

const hard = (src: string): React.CSSProperties => ({ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" });
export const Shadow: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 1 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 8, width: w, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.3), transparent 70%)", opacity: o }} />
);

// ---------- the auto ----------
const AUTO_ASPECT = WHEELS.h / WHEELS.w;
const AutoWheel: React.FC<{ name: "front" | "rear"; w: number; angle: number; blur: number }> = ({ name, w, angle, blur }) => {
  const S = w / WHEELS.w, wh = WHEELS.wheels[name], d = wh.ry * 2 * S;
  const mask = `url(${staticFile(`rajini/auto/wheelmask_${name}.png`)})`;
  return (
    <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
      <div style={{ position: "absolute", left: wh.cx * S - d / 2, top: wh.cy * S - d / 2, width: d, height: d, transform: `scaleX(${wh.rx / wh.ry})` }}>
        {(blur > 0.05 ? [0, 1, 2] : [0]).map((i) => (
          <Img key={i} src={staticFile(`rajini/auto/wheel_${name}.png`)} style={{ position: "absolute", inset: 0, width: d, height: d, transform: `rotate(${angle + i * blur * 14}deg)`, opacity: i ? 0.35 : 1 }} />
        ))}
      </div>
    </div>
  );
};
// dist: page px travelled (wheels turn by it); speed: px/s (blur and bounce); t: seconds (bounce phase)
export const RealAuto: React.FC<{ x: number; y: number; w: number; dist: number; speed: number; t: number; shadow?: boolean }> = ({ x, y, w, dist, speed, t, shadow = true }) => {
  const h = w * AUTO_ASPECT;
  const angle = -(dist / (WHEELS.wheels.front.ry * (w / WHEELS.w))) * (180 / Math.PI);
  const blur = Math.min(1, speed / 400);
  const moving = speed > 1 ? 1 : 0;
  const bounce = moving * (Math.sin(t * 17) * 0.7 + Math.sin(t * 29 + 1) * 0.4) * (w / 220);
  return (
    <>
      {shadow ? <Shadow x={x} y={y + h / 2 - 1} w={w * 0.92} /> : null}
      <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${bounce}px) rotate(${moving * Math.sin(t * 11) * 0.25}deg)`, transformOrigin: "50% 90%" }}>
          {blur > 0.3 ? <Img src={staticFile("rajini/auto/photo.png")} style={{ position: "absolute", left: 6 * blur * (w / 220), top: 0, width: w, height: h, opacity: 0.25 * blur }} /> : null}
          <Img src={staticFile("rajini/auto/photo.png")} style={{ position: "absolute", inset: 0, width: w, height: h }} />
        </div>
        <AutoWheel name="front" w={w} angle={angle} blur={blur} />
        <AutoWheel name="rear" w={w} angle={angle} blur={blur} />
      </div>
    </>
  );
};
export const autoHeight = (w: number) => w * AUTO_ASPECT;

// ---------- the coin: flip (radians of turn about its horizontal axis) and a toss height ----------
export const Coin: React.FC<{ x: number; y: number; d: number; flip: number; lift?: number; spin?: number }> = ({ x, y, d, flip, lift = 0, spin = 0 }) => {
  const c = Math.cos(flip);
  const face = c >= 0 ? "coin_one" : "coin_lion";
  const sy = Math.max(0.04, Math.abs(c));
  return (
    <>
      <Shadow x={x} y={y + d / 2 + 6} w={d * (0.9 - Math.min(0.5, lift / 600))} o={1 - Math.min(0.7, lift / 400)} />
      <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2 - lift, width: d, height: d, transform: `rotate(${spin}deg) scaleY(${sy})` }}>
        {/* the coin's edge: a thin silver band seen when it's nearly edge-on */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(180deg,#E8E8E8,#9A9A9A)", transform: `translateY(${c >= 0 ? 3 : -3}px)`, opacity: 1 - sy }} />
        <Img src={staticFile(`rajini/obj/${face}.png`)} style={{ ...hard(face), filter: `brightness(${0.85 + 0.15 * sy})` }} />
      </div>
    </>
  );
};

// ---------- the sunglasses: turn (3D turn about the vertical axis, radians), spin (in-plane degrees) ----------
export const Shades: React.FC<{ x: number; y: number; w: number; turn?: number; spin?: number; shadow?: boolean }> = ({ x, y, w, turn = 0, spin = 0, shadow = true }) => {
  const h = w * (652 / 1271);
  const c = Math.cos(turn);
  return (
    <>
      {shadow ? <Shadow x={x} y={y + h * 0.75} w={w * 0.8 * Math.max(0.3, Math.abs(c))} o={0.7} /> : null}
      <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${spin}deg) scaleX(${Math.max(0.03, Math.abs(c)) * Math.sign(c || 1)})` }}>
        <Img src={staticFile("rajini/obj/shades.png")} style={{ ...hard("shades"), filter: `brightness(${0.8 + 0.2 * Math.abs(c)})` }} />
      </div>
    </>
  );
};

// ---------- the watch: tick = an integer that steps every beat ----------
export const Watch: React.FC<{ x: number; y: number; d: number; tick: number; jolt: number }> = ({ x, y, d, tick, jolt }) => (
  <>
    <Shadow x={x} y={y + d * 0.52} w={d * 0.7} o={0.6} />
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `rotate(${(tick % 2 ? 1.5 : -1.5) * jolt}deg) scale(${1 + 0.02 * jolt})` }}>
      <Img src={staticFile("rajini/obj/watch.png")} style={hard("watch")} />
    </div>
  </>
);

// ---------- the keys: swing angle in degrees, pivoting at the ring ----------
export const Keys: React.FC<{ x: number; y: number; h: number; swing: number }> = ({ x, y, h, swing }) => {
  const w = h * (212 / 277);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transformOrigin: "45% 6%", transform: `rotate(${swing}deg)` }}>
      <Img src={staticFile("rajini/obj/keys.png")} style={hard("keys")} />
    </div>
  );
};
