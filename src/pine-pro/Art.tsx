import React, { useId } from "react";
import { random } from "remotion";
import { useT } from "../utils";

// Procedural, resolution-independent "Pine Pro outputs" that replace the photo slots.
// Every piece is drawn in the card's own pixel space (w×h) and animates on global time, so it stays crisp at any scale.
type P = { w: number; h: number; t: number; id: string };
type Stop = [number, string, number?];
const TAU = Math.PI * 2;
const n1 = (v: number) => v.toFixed(1);
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// Ridge silhouette; `sharp` folds the sine into peaks. Frequency follows height so wide cards don't stretch the peaks.
const ridge = (w: number, h: number, y0: number, amp: number, seed: number, shift: number, sharp = true) => {
  let d = `M0 ${h}`;
  for (let i = 0; i <= 72; i++) {
    const x = (i / 72) * w;
    const u = (x / h) * 1.5 + shift;
    const a = sharp ? 1 - Math.abs(Math.sin(u * 1.2 + seed)) : 0.5 + 0.5 * Math.sin(u * 1.2 + seed);
    const y = y0 - amp * (0.6 * a + 0.28 * (0.5 + 0.5 * Math.sin(u * 3.1 + seed * 1.7)) + 0.12 * (0.5 + 0.5 * Math.sin(u * 7.3 + seed * 2.3)));
    d += ` L${n1(x)} ${n1(y)}`;
  }
  return `${d} L${w} ${h} Z`;
};

const stopsOf = (stops: Stop[]) => stops.map(([o, c, op], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />);
const Lin: React.FC<{ id: string; stops: Stop[]; x2?: number; y2?: number }> = ({ id, stops, x2 = 0, y2 = 1 }) => (
  <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>{stopsOf(stops)}</linearGradient>
);
const Rad: React.FC<{ id: string; stops: Stop[]; cx?: number; cy?: number; fx?: number; fy?: number }> = ({ id, stops, cx = 0.5, cy = 0.5, fx, fy }) => (
  <radialGradient id={id} cx={cx} cy={cy} fx={fx ?? cx} fy={fy ?? cy}>{stopsOf(stops)}</radialGradient>
);
const Svg: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, display: "block" }}>{children}</svg>
);
// Soft mesh gradient as stacked CSS radial gradients: cheap to render, no blur filters.
const Mesh: React.FC<{ w: number; h: number; base: string; blobs: [number, number, number, string][] }> = ({ w, h, base, blobs }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: base,
      backgroundImage: blobs.map(([x, y, r, c]) => `radial-gradient(circle ${Math.max(w, h) * r}px at ${x * w}px ${y * h}px, ${c}, transparent)`).join(", "),
    }}
  />
);

const landscape =
  (sky: Stop[], sunC: string, glow: string, layers: [string, number, number][], sunX: number, sunY: number, birds = false) =>
  ({ w, h, t, id }: P) => {
    const sr = Math.min(w, h) * 0.13;
    const sy = h * sunY + Math.sin(t / 50) * h * 0.01;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Lin id={`s${id}`} stops={sky} />
          <Rad id={`g${id}`} stops={[[0, glow, 0.9], [1, glow, 0]]} />
          <Lin id={`hz${id}`} stops={[[0, "#fff", 0], [1, "#fff", 0.4]]} />
        </defs>
        <rect width={w} height={h} fill={`url(#s${id})`} />
        <circle cx={w * sunX} cy={sy} r={sr * 3} fill={`url(#g${id})`} />
        <circle cx={w * sunX} cy={sy} r={sr} fill={sunC} />
        {birds &&
          range(4).map((i) => {
            const bx = (w * 0.15 + i * sr * 0.9 + t * 1.1) % (w * 1.1);
            const by = h * (0.2 + 0.04 * Math.sin(i * 2.3));
            const s = sr * 0.2 * (1 - i * 0.12);
            const flap = Math.sin(t * 0.5 + i) * s * 0.4;
            return <path key={i} d={`M${bx - s} ${by - flap} Q${bx - s * 0.4} ${by - s * 0.2} ${bx} ${by} Q${bx + s * 0.4} ${by - s * 0.2} ${bx + s} ${by - flap}`} stroke="#3A3552" strokeWidth={Math.max(1.2, s * 0.14)} fill="none" strokeLinecap="round" />;
          })}
        {layers.map(([c, y, a], i) => (
          <g key={i}>
            <path d={ridge(w, h, h * y, h * a, 1.3 + i * 1.9, t * 0.0015 * (i + 1))} fill={c} />
            {i < layers.length - 1 && <rect y={h * y} width={w} height={h * (1 - y)} fill={`url(#hz${id})`} opacity={0.5} />}
          </g>
        ))}
      </Svg>
    );
  };

const cup = (cx: number, cy: number, R: number, t: number, id: string) => {
  let spiral = "";
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * 5 * Math.PI;
    const r = R * 0.66 * (1 - a / (5.6 * Math.PI));
    spiral += `${i ? "L" : "M"}${n1(cx + Math.cos(a) * r)} ${n1(cy + Math.sin(a) * r)} `;
  }
  return (
    <g>
      <defs>
        <Rad id={`sh${id}`} stops={[[0, "#000", 0.5], [1, "#000", 0]]} />
        <Rad id={`sa${id}`} fx={0.38} fy={0.32} stops={[[0, "#FFFFFF"], [1, "#D6CBBF"]]} />
        <Rad id={`rm${id}`} fx={0.4} fy={0.35} stops={[[0, "#FFFFFF"], [1, "#DED3C7"]]} />
        <Rad id={`cf${id}`} stops={[[0, "#9C5A2C"], [0.7, "#6B3417"], [1, "#3A1A0A"]]} />
        <Rad id={`bn${id}`} fx={0.35} fy={0.3} stops={[[0, "#8E4C23"], [1, "#351707"]]} />
      </defs>
      {range(9).map((i) => {
        const a = (i / 9) * TAU + t * 0.004 + random(`ba${i}`) * 0.4;
        const d = R * (1.85 + random(`bd${i}`) * 0.7);
        const s = R * (0.12 + random(`bs${i}`) * 0.05);
        return (
          <g key={i} transform={`translate(${n1(cx + Math.cos(a) * d)} ${n1(cy + Math.sin(a) * d)}) rotate(${n1(random(`br${i}`) * 360 + t * 0.3)})`}>
            <ellipse rx={s * 1.1} ry={s * 0.9} cx={s * 0.15} cy={s * 0.25} fill="#000" opacity={0.3} />
            <ellipse rx={s} ry={s * 0.68} fill={`url(#bn${id})`} />
            <path d={`M${-s * 0.8} 0 C${-s * 0.3} ${-s * 0.25} ${s * 0.3} ${s * 0.25} ${s * 0.8} 0`} stroke="#241005" strokeWidth={s * 0.12} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx={cx + R * 0.12} cy={cy + R * 0.18} r={R * 1.75} fill={`url(#sh${id})`} />
      <circle cx={cx} cy={cy} r={R * 1.42} fill={`url(#sa${id})`} />
      <circle cx={cx} cy={cy} r={R * 1.1} fill="none" stroke="#CDBFB0" strokeWidth={R * 0.025} />
      <rect x={cx + R * 0.88} y={cy - R * 0.16} width={R * 0.55} height={R * 0.32} rx={R * 0.16} fill="#F2EBE3" transform={`rotate(-28 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#rm${id})`} />
      <circle cx={cx} cy={cy} r={R * 0.84} fill={`url(#cf${id})`} />
      <g transform={`rotate(${n1(t * 0.9)} ${cx} ${cy})`}>
        <path d={spiral} stroke="#E9C49A" strokeWidth={R * 0.055} fill="none" strokeLinecap="round" opacity={0.92} />
        <path d={spiral} stroke="#FBE6CC" strokeWidth={R * 0.018} fill="none" strokeLinecap="round" transform={`rotate(14 ${cx} ${cy})`} opacity={0.7} />
      </g>
      <ellipse cx={cx - R * 0.38} cy={cy - R * 0.5} rx={R * 0.32} ry={R * 0.07} fill="#fff" opacity={0.35} transform={`rotate(-35 ${cx - R * 0.38} ${cy - R * 0.5})`} />
    </g>
  );
};

const ARTS: Record<string, (p: P) => React.ReactNode> = {
  mountain_hero: landscape(
    [[0, "#5E5BD8"], [0.5, "#C99BE3"], [1, "#FFD2B0"]],
    "#FFF3DC",
    "#FFC58A",
    [["#E6CDEF", 0.56, 0.2], ["#C3A1E2", 0.66, 0.22], ["#9676D0", 0.76, 0.22], ["#624FAE", 0.86, 0.2], ["#342A6E", 0.97, 0.16]],
    0.64,
    0.46,
  ),
  hiker: landscape(
    [[0, "#FFE6BF"], [1, "#FFB896"]],
    "#FFFBF0",
    "#FFD9A0",
    [["#CDE8D5", 0.58, 0.18], ["#9ED3BA", 0.68, 0.2], ["#5FAE8E", 0.78, 0.2], ["#2F7F6A", 0.88, 0.18], ["#17504A", 0.98, 0.14]],
    0.35,
    0.5,
    true,
  ),

  city: ({ w, h, t, id }) => {
    const hz = h * 0.6, sr = Math.min(w, h) * 0.3, sx = w / 2, sy = hz - sr * 0.35;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Lin id={`s${id}`} stops={[[0, "#0E0A2A"], [0.55, "#3B1C6E"], [1, "#FF6FA8"]]} />
          <Lin id={`u${id}`} stops={[[0, "#FFE66E"], [0.55, "#FF9A5A"], [1, "#FF4F9A"]]} />
          <Lin id={`gr${id}`} stops={[[0, "#2A0E4A"], [1, "#0B0620"]]} />
          <Rad id={`gl${id}`} stops={[[0, "#FF6FA8", 0.7], [1, "#FF6FA8", 0]]} />
          <mask id={`m${id}`}>
            <rect width={w} height={h} fill="#fff" />
            {range(7).map((k) => <rect key={k} y={sy + sr * 0.05 + k * sr * 0.14} width={w} height={sr * 0.02 + k * sr * 0.018} fill="#000" />)}
          </mask>
        </defs>
        <rect width={w} height={hz} fill={`url(#s${id})`} />
        {range(40).map((i) => <circle key={i} cx={random(`cx${i}`) * w} cy={random(`cy${i}`) * hz * 0.7} r={0.6 + random(`cr${i}`) * 1.2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t / 10 + i))} />)}
        <ellipse cx={sx} cy={hz} rx={w * 0.6} ry={h * 0.2} fill={`url(#gl${id})`} />
        <circle cx={sx} cy={sy} r={sr} fill={`url(#u${id})`} mask={`url(#m${id})`} />
        <path d={ridge(w, h, hz + 1, h * 0.07, 4.2, 0)} fill="#1C0D3A" />
        <rect y={hz} width={w} height={h - hz} fill={`url(#gr${id})`} />
        {range(13).map((k) => <line key={`v${k}`} x1={sx + (k - 6) * w * 0.03} y1={hz} x2={sx + (k - 6) * w * 0.35} y2={h} stroke="#FF6FB5" strokeWidth={1.4} opacity={0.75} />)}
        {range(12).map((k) => {
          const p = (k + ((t * 0.05) % 1)) / 12, y = hz + (h - hz) * p * p;
          return <line key={`h${k}`} x1={0} x2={w} y1={y} y2={y} stroke="#FF6FB5" strokeWidth={1 + p * 2.5} opacity={0.25 + 0.75 * p} />;
        })}
        <line x1={0} x2={w} y1={hz} y2={hz} stroke="#FFC2DE" strokeWidth={2} />
      </Svg>
    );
  },

  castle: ({ w, h, t, id }) => {
    const yb = h * 0.9, aw0 = Math.min(w * 0.8, h * 0.62);
    const cols = ["#F4A98A", "#FFD2BE", "#EE9474", "#FFDFD0", "#E57F5F", "#FFC7AE"];
    const r = aw0 * 0.12, bx = w / 2 + Math.sin(t / 18) * aw0 * 0.18;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Lin id={`b${id}`} stops={[[0, "#FFE9DC"], [1, "#F8C6AC"]]} />
          <Rad id={`o${id}`} fx={0.35} fy={0.3} stops={[[0, "#FFFFFF"], [0.5, "#FFD27A"], [1, "#FF8A1F"]]} />
        </defs>
        <rect width={w} height={h} fill={`url(#b${id})`} />
        <rect y={yb} width={w} height={h - yb} fill="#E88E6E" />
        {range(6).map((i) => {
          const k = 1 - i * 0.15, aw = aw0 * k, ah = Math.max(aw * 0.75, h * 0.78 * k), x = w / 2 - aw / 2, yB = yb - i * h * 0.035, rr = aw / 2;
          const d = `M${x} ${yB} L${x} ${yB - ah + rr} A${rr} ${rr} 0 0 1 ${x + aw} ${yB - ah + rr} L${x + aw} ${yB} Z`;
          return (
            <g key={i}>
              <path d={d} fill="#B85A3E" opacity={0.2} transform={`translate(${aw * 0.035} 0)`} />
              <path d={d} fill={cols[i]} />
            </g>
          );
        })}
        <ellipse cx={bx} cy={yb - h * 0.175} rx={r * 1.1} ry={r * 0.2} fill="#9C4A30" opacity={0.3} />
        <circle cx={bx} cy={yb - h * 0.175 - r} r={r} fill={`url(#o${id})`} />
      </Svg>
    );
  },

  cinematic_tile: ({ w, h, t, id }) => {
    const R = Math.max(w, h) * 0.9, cx = w / 2, fy = h * 0.66, cy = fy + R, m = Math.min(w, h);
    const fx = w * 0.5 + Math.sin(t / 30) * w * 0.08;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Lin id={`b${id}`} stops={[[0, "#05060A"], [1, "#0D1422"]]} />
          <Rad id={`a${id}`} stops={[[0, "#FF9A4A", 0.6], [0.5, "#FF6A2A", 0.15], [1, "#FF6A2A", 0]]} />
          <Lin id={`f${id}`} x2={1} y2={0} stops={[[0, "#9FD4FF", 0], [0.5, "#EAF6FF", 1], [1, "#9FD4FF", 0]]} />
          <Rad id={`c${id}`} stops={[[0, "#FFFFFF", 1], [0.3, "#BFE3FF", 0.6], [1, "#6FB8FF", 0]]} />
          <filter id={`bl${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#b${id})`} />
        {range(50).map((i) => <circle key={i} cx={random(`sx${i}`) * w} cy={random(`sy${i}`) * fy} r={0.5 + random(`sr${i}`)} fill="#fff" opacity={0.2 + 0.6 * random(`so${i}`)} />)}
        <ellipse cx={cx} cy={fy} rx={w * 0.9} ry={h * 0.22} fill={`url(#a${id})`} />
        <circle cx={cx} cy={cy} r={R} fill="#06080E" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#FFB070" strokeWidth={m * 0.025} filter={`url(#bl${id})`} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#FFE2BF" strokeWidth={1.5} />
        <rect x={fx - w * 0.6} y={fy - 1} width={w * 1.2} height={2} fill={`url(#f${id})`} />
        <rect x={fx - w * 0.45} y={fy - h * 0.012} width={w * 0.9} height={h * 0.024} fill={`url(#f${id})`} opacity={0.25} />
        <circle cx={fx} cy={fy} r={m * 0.07} fill={`url(#c${id})`} />
        <rect width={w} height={h * 0.07} fill="#000" />
        <rect y={h * 0.93} width={w} height={h * 0.07} fill="#000" />
      </Svg>
    );
  },

  tile_3d: ({ w, h, t, id }) => {
    const s = Math.min(w, h) * 0.1, ox = w / 2, oy = h / 2 + 0.6 * s, k8 = s * 0.866;
    const face = (x: number, y: number, c: [string, string, string], key: string) => (
      <g key={key}>
        <path d={`M${x} ${y - s * 0.5} L${x + k8} ${y} L${x} ${y + s * 0.5} L${x - k8} ${y} Z`} fill={c[0]} />
        <path d={`M${x - k8} ${y} L${x} ${y + s * 0.5} L${x} ${y + s * 1.5} L${x - k8} ${y + s} Z`} fill={c[1]} />
        <path d={`M${x + k8} ${y} L${x} ${y + s * 0.5} L${x} ${y + s * 1.5} L${x + k8} ${y + s} Z`} fill={c[2]} />
      </g>
    );
    const cubes: [number, number, number][] = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3 - Math.max(i, j); k++) cubes.push([i, j, k]);
    cubes.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2]);
    const col = (i: number, j: number): [string, string, string] =>
      i === 2 && j === 0 ? ["#D6F7EC", "#8EE5C6", "#5FCFA9"] : i === 0 && j === 2 ? ["#E3ECFF", "#AFC6FF", "#8FB2FF"] : ["#F1EFFF", "#C5C0FF", "#9A92F2"];
    const bob = Math.sin(t / 12) * s * 0.2;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Rad id={`b${id}`} cy={0.4} stops={[[0, "#FBFAFF"], [1, "#DDD8FF"]]} />
        </defs>
        <rect width={w} height={h} fill={`url(#b${id})`} />
        <ellipse cx={ox} cy={oy + 3.6 * s} rx={s * 3} ry={s * 0.6} fill="#5B4FE0" opacity={0.1} />
        {cubes.map(([i, j, k]) => face(ox + (i - j) * k8, oy + (i + j) * 0.5 * s - k * s, col(i, j), `${i}${j}${k}`))}
        <ellipse cx={ox} cy={oy - 2 * s} rx={s * 0.5 * (1 - bob / s)} ry={s * 0.22} fill="#5B4FE0" opacity={0.18} />
        {face(ox, oy - 4.2 * s + bob, ["#FFE27A", "#FFC93C", "#FF8A1F"], "gold")}
      </Svg>
    );
  },

  tile_bottle: ({ w, h, t, id }) => {
    const bw = Math.min(w * 0.3, h * 0.2), bh = bw * 2.2, cx = w / 2, base = h * 0.74, top = base - bh;
    const x0 = cx - bw / 2, x1 = cx + bw / 2, nx0 = cx - bw * 0.17, nx1 = cx + bw * 0.17, yn = top + bh * 0.08, ys = top + bh * 0.34, r = bw * 0.14;
    const d = `M${nx0} ${yn} L${nx0} ${top + bh * 0.18} C${nx0} ${top + bh * 0.26} ${x0} ${top + bh * 0.26} ${x0} ${ys} L${x0} ${base - r} Q${x0} ${base} ${x0 + r} ${base} L${x1 - r} ${base} Q${x1} ${base} ${x1} ${base - r} L${x1} ${ys} C${x1} ${top + bh * 0.26} ${nx1} ${top + bh * 0.26} ${nx1} ${top + bh * 0.18} L${nx1} ${yn} Z`;
    const bob = Math.sin(t / 20) * h * 0.008;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Lin id={`b${id}`} stops={[[0, "#E6F7F0"], [1, "#BFE6D6"]]} />
          <Lin id={`g${id}`} x2={1} y2={0} stops={[[0, "#2E8C6E"], [0.18, "#7FD6B6"], [0.45, "#E9FFF6"], [0.7, "#8EDDC0"], [1, "#2A7A60"]]} />
          <Lin id={`p${id}`} x2={1} y2={0} stops={[[0, "#D3EFE3"], [0.5, "#FFFFFF"], [1, "#C4E8D9"]]} />
        </defs>
        <rect width={w} height={h} fill={`url(#b${id})`} />
        <rect x={cx - bw * 1.3} y={base} width={bw * 2.6} height={h - base} fill={`url(#p${id})`} />
        <ellipse cx={cx} cy={base} rx={bw * 1.3} ry={bw * 0.22} fill="#FFFFFF" />
        <ellipse cx={cx} cy={base} rx={bw * 0.62} ry={bw * 0.1} fill="#2F7A62" opacity={0.25} />
        <g transform={`translate(0 ${bob - Math.abs(bob)})`}>
          <path d={d} fill={`url(#g${id})`} />
          <rect x={x0} y={top + bh * 0.5} width={bw} height={bh * 0.24} fill="#FFFFFF" opacity={0.92} />
          <circle cx={cx} cy={top + bh * 0.6} r={bw * 0.08} fill="#FFC93C" />
          <rect x={cx - bw * 0.25} y={top + bh * 0.67} width={bw * 0.5} height={bw * 0.03} rx={bw * 0.015} fill="#0F1115" opacity={0.7} />
          <rect x={x0 + bw * (0.18 + 0.06 * Math.sin(t / 25))} y={ys} width={bw * 0.06} height={bh * 0.14} rx={bw * 0.03} fill="#fff" opacity={0.75} />
          <rect x={nx0 - bw * 0.03} y={top} width={nx1 - nx0 + bw * 0.06} height={bh * 0.1} rx={bw * 0.03} fill="#0F1115" />
        </g>
      </Svg>
    );
  },

  tile_illustration: ({ w, h, t }) => {
    const m = Math.min(w, h), sr = m * 0.16, sx = w * 0.68, sy = h * 0.3;
    const cloud = (x: number, y: number, s: number, key: number) => (
      <g key={key} fill="#FFFFFF">
        <circle cx={x} cy={y} r={s * 0.5} />
        <circle cx={x + s * 0.55} cy={y - s * 0.2} r={s * 0.62} />
        <circle cx={x + s * 1.15} cy={y} r={s * 0.45} />
        <rect x={x} y={y - s * 0.05} width={s * 1.15} height={s * 0.5} />
      </g>
    );
    return (
      <Svg w={w} h={h}>
        <rect width={w} height={h} fill="#FFE2A6" />
        <circle cx={sx} cy={sy} r={sr * (1.55 + 0.08 * Math.sin(t / 8))} fill="#FFC56B" />
        <circle cx={sx} cy={sy} r={sr} fill="#FF8A1F" />
        {cloud(((w * 0.1 + t * 0.35) % (w * 1.3)) - w * 0.15, h * 0.22, m * 0.13, 0)}
        {cloud(((w * 0.75 + t * 0.22) % (w * 1.3)) - w * 0.15, h * 0.38, m * 0.09, 1)}
        <path d={ridge(w, h, h * 0.64, h * 0.12, 1.1, t * 0.001, false)} fill="#9BE0B2" />
        <path d={ridge(w, h, h * 0.74, h * 0.1, 3.4, t * 0.002, false)} fill="#3DBE6E" />
        <rect x={w * 0.28 - m * 0.012} y={h * 0.66} width={m * 0.024} height={h * 0.08} fill="#7A4A2A" />
        <circle cx={w * 0.28} cy={h * 0.64} r={m * 0.06} fill="#1F7A45" />
        <path d={ridge(w, h, h * 0.86, h * 0.07, 5.2, t * 0.003, false)} fill="#238A51" />
      </Svg>
    );
  },

  cup_white: ({ w, h, t, id }) => {
    const m = Math.min(w, h), r = m * 0.26, cx = w * 0.46, cy = h * 0.5 + Math.sin(t / 22) * m * 0.02;
    const a = t * 0.05, rot = (-18 * Math.PI) / 180;
    const ox = Math.cos(a) * r * 1.55, oy = Math.sin(a) * r * 0.42;
    const px = cx + ox * Math.cos(rot) - oy * Math.sin(rot), py = cy + ox * Math.sin(rot) + oy * Math.cos(rot);
    const sat = <circle cx={px} cy={py} r={r * 0.16} fill={`url(#o${id})`} />;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Rad id={`b${id}`} cx={0.4} cy={0.3} stops={[[0, "#FBF8F4"], [1, "#E7DDD2"]]} />
          <Rad id={`sh${id}`} stops={[[0, "#7A5C40", 0.35], [1, "#7A5C40", 0]]} />
          <Rad id={`sp${id}`} fx={0.35} fy={0.3} stops={[[0, "#FFFFFF"], [0.55, "#F3ECE4"], [1, "#CDBBA8"]]} />
          <Rad id={`o${id}`} fx={0.35} fy={0.3} stops={[[0, "#FFE0B0"], [1, "#FF7A1A"]]} />
          <Lin id={`pl${id}`} stops={[[0, "#FFB24D"], [1, "#FF7A1A"]]} />
        </defs>
        <rect width={w} height={h} fill={`url(#b${id})`} />
        <ellipse cx={cx} cy={h * 0.5 + r * 1.25} rx={r * 0.95} ry={r * 0.14} fill={`url(#sh${id})`} />
        <ellipse cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.42} transform={`rotate(-18 ${cx} ${cy})`} fill="none" stroke="#0F1115" strokeWidth={1.2} opacity={0.35} />
        {Math.sin(a) < 0 && sat}
        <circle cx={cx} cy={cy} r={r} fill={`url(#sp${id})`} />
        {Math.sin(a) >= 0 && sat}
        <ellipse cx={w * 0.8} cy={h * 0.8} rx={r * 0.5} ry={r * 0.07} fill={`url(#sh${id})`} />
        <rect x={w * 0.8 - r * 0.45} y={h * 0.72 - r * 0.17} width={r * 0.9} height={r * 0.34} rx={r * 0.17} fill={`url(#pl${id})`} transform={`rotate(-28 ${w * 0.8} ${h * 0.72})`} />
      </Svg>
    );
  },

  coffee_beans: ({ w, h, t, id }) => {
    const N = 30;
    return (
      <Svg w={w} h={h}>
        <defs>
          <Lin id={`b${id}`} stops={[[0, "#0A0D1C"], [1, "#171C3A"]]} />
          <Rad id={`g${id}`} stops={[[0, "#5B4FE0", 0.5], [1, "#5B4FE0", 0]]} />
          <linearGradient id={`l${id}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={w} y2={0}>
            {stopsOf([[0, "#B9B4FF"], [0.5, "#8FB2FF"], [1, "#5FE0B4"]])}
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#b${id})`} />
        <ellipse cx={w / 2} cy={h / 2} rx={w * 0.5} ry={h * 0.45} fill={`url(#g${id})`} />
        {range(N).map((i) => {
          let d = "";
          for (let k = 0; k <= 60; k++) {
            const x = (k / 60) * w;
            const y = h * (0.18 + (0.64 * i) / (N - 1)) + h * 0.13 * Math.sin((x / w) * TAU * 0.8 + t * 0.045 + i * 0.16) * Math.sin((i / N) * Math.PI + t * 0.01 + 0.6);
            d += `${k ? "L" : "M"}${n1(x)} ${n1(y)} `;
          }
          return <path key={i} d={d} stroke={`url(#l${id})`} strokeWidth={1.2 + (i / N) * 1.4} fill="none" opacity={0.3 + (0.7 * i) / N} />;
        })}
      </Svg>
    );
  },

  coffee_pour: ({ w, h, t, id }) => {
    const m = Math.min(w, h), cx = w / 2, cy = h / 2;
    return (
      <>
        <Mesh
          w={w}
          h={h}
          base="#FFF4E6"
          blobs={[
            [0.5, 0.5, 0.3, "#FFFFFF"],
            [0.22 + 0.06 * Math.sin(t / 40), 0.3, 0.5, "#FFD36E"],
            [0.78, 0.25 + 0.06 * Math.cos(t / 35), 0.45, "#FF9F5A"],
            [0.65 + 0.05 * Math.sin(t / 30), 0.85, 0.5, "#FF9EC4"],
            [0.18, 0.85, 0.45, "#C9B8FF"],
          ]}
        />
        <Svg w={w} h={h}>
          <defs>
            <Rad id={`o${id}`} fx={0.3} fy={0.25} stops={[[0, "#FFFFFF", 0.95], [0.45, "#FFE3C4", 0.55], [1, "#FF8A1F", 0.35]]} />
            <Rad id={`hl${id}`} stops={[[0, "#FFFFFF", 0.9], [1, "#FFFFFF", 0]]} />
          </defs>
          {range(3).map((i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={m * (0.36 + i * 0.08)} ry={m * (0.1 + i * 0.03)} transform={`rotate(${n1(t * 0.35 + i * 55)} ${cx} ${cy})`} fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeDasharray={`${m * 0.3} ${m * 0.06}`} opacity={0.75} />
          ))}
          <circle cx={cx} cy={cy + Math.sin(t / 20) * m * 0.015} r={m * 0.24} fill={`url(#o${id})`} stroke="#FFFFFF" strokeWidth={1.5} strokeOpacity={0.9} />
          <ellipse cx={cx - m * 0.08} cy={cy - m * 0.11} rx={m * 0.08} ry={m * 0.04} transform={`rotate(-30 ${cx - m * 0.08} ${cy - m * 0.11})`} fill={`url(#hl${id})`} />
        </Svg>
      </>
    );
  },

  coffee_splash: ({ w, h, t, id }) => (
    <Svg w={w} h={h}>
      <defs>
        <Rad id={`b${id}`} cx={0.7} stops={[[0, "#8C4E26"], [0.55, "#4A2511"], [1, "#1E0F07"]]} />
      </defs>
      <rect width={w} height={h} fill={`url(#b${id})`} />
      {cup(w * 0.68, h * 0.52, Math.min(h * 0.28, w * 0.2), t, id)}
    </Svg>
  ),

  coffee_warm: ({ w, h, t, id }) => (
    <>
      <Mesh
        w={w}
        h={h}
        base="#1A0D06"
        blobs={[
          [0.8 + 0.03 * Math.sin(t / 30), 0.3, 0.5, "#C2561C"],
          [0.95, 0.8 + 0.04 * Math.cos(t / 26), 0.35, "#FFB347"],
          [0.45, 0.95, 0.5, "#6B2A10"],
          [0.6, 0.1, 0.3, "#8A3A14"],
        ]}
      />
      <Svg w={w} h={h}>
        <defs>
          <Rad id={`k${id}`} stops={[[0, "#FFD08A", 0.5], [1, "#FFD08A", 0]]} />
        </defs>
        {range(16).map((i) => {
          const r = h * (0.015 + random(`kr${i}`) * 0.04);
          const y = ((random(`ky${i}`) * h - t * (0.4 + random(`kv${i}`) * 0.6)) % (h + 2 * r) + h + 2 * r) % (h + 2 * r) - r;
          return <circle key={i} cx={w * (0.4 + random(`kx${i}`) * 0.6)} cy={y} r={r} fill={`url(#k${id})`} />;
        })}
        {cup(w * 0.72, h * 0.52, h * 0.26, t, id)}
      </Svg>
    </>
  ),

  mountain_editor: ({ w, h, t, id }) => {
    const u = h, s = u * 0.36, hs = Math.max(4, u * 0.025);
    const gx = w * 0.68, gy = h * 0.42, grot = 8 + Math.sin(t / 24) * 6;
    const hr = u * 0.24;
    return (
      <Svg w={w} h={h}>
        <defs>
          <pattern id={`d${id}`} width={u * 0.08} height={u * 0.08} patternUnits="userSpaceOnUse">
            <circle cx={u * 0.04} cy={u * 0.04} r={1} fill="#D9D4CC" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="#FAF8F4" />
        <rect width={w} height={h} fill={`url(#d${id})`} />
        <circle cx={w * 0.24} cy={h * 0.56 + Math.sin(t / 20) * u * 0.03} r={u * 0.3} fill="#FF8A1F" />
        <g transform={`translate(${w * 0.46} ${h * 0.74}) rotate(${n1(Math.sin(t / 28) * 12)})`}>
          <path d={`M${-hr} 0 A${hr} ${hr} 0 0 1 ${hr} 0 Z`} fill="#5B4FE0" />
        </g>
        <rect x={w * 0.56 + Math.sin(t / 18) * u * 0.05} y={h * 0.8} width={u * 0.55} height={u * 0.13} rx={u * 0.065} fill="#5FE0B4" />
        {range(3).map((i) => (
          <line key={i} x1={w * 0.84} y1={h * (0.22 + i * 0.08)} x2={w * 0.84 + u * (0.2 + 0.08 * Math.sin(t / 15 + i))} y2={h * (0.22 + i * 0.08)} stroke="#0F1115" strokeWidth={u * 0.02} strokeLinecap="round" />
        ))}
        <circle cx={w * 0.9} cy={h * 0.72} r={u * 0.05} fill="#0F1115" />
        <g transform={`translate(${gx} ${gy}) rotate(${n1(grot)})`}>
          <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.14} fill="#FFC93C" />
          <rect x={-s / 2 - hs} y={-s / 2 - hs} width={s + hs * 2} height={s + hs * 2} fill="none" stroke="#5B4FE0" strokeWidth={1.5} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
            <rect key={i} x={a * (s / 2 + hs) - hs} y={b * (s / 2 + hs) - hs} width={hs * 2} height={hs * 2} fill="#FFFFFF" stroke="#5B4FE0" strokeWidth={1.5} />
          ))}
        </g>
      </Svg>
    );
  },
};

export const Art: React.FC<{ name: string; w: number; h: number }> = ({ name, w, h }) => {
  const t = useT();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{(ARTS[name] ?? ARTS.coffee_pour)({ w, h, t, id })}</div>;
};
