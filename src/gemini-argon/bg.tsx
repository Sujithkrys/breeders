// The film's own backgrounds and motion graphics (in place of ChatGPT's starfield and pastel blocks), in Gemini's colour
// language: a dark aurora of slow blue / purple / pink light over a faint dot grid; a wall of code with a scan line; a
// live network of services where red threats are intercepted by Argon's blue rings; a river of code tokens.
// All take `t` in 30fps units.
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { ease, ramp } from "../utils";
import { GCODE, GS } from "./kit";

// ---------- the aurora ----------
export const Aurora: React.FC<{ t: number; black?: number; calm?: number }> = ({ t, black = 0, calm = 0 }) => {
  const s = t / 30;
  const orb = (x: number, y: number, r: number, c: string, a: number) => `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(${c},${a}), rgba(${c},0))`;
  const k = 1 - calm * 0.5;
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      <AbsoluteFill
        style={{
          background: [
            orb(420 + Math.sin(s * 0.31) * 140, 820 + Math.cos(s * 0.27) * 60, 760, "66,133,244", 0.42 * k),
            orb(1500 + Math.cos(s * 0.23) * 160, 260 + Math.sin(s * 0.35) * 80, 700, "155,114,203", 0.36 * k),
            orb(1180 + Math.sin(s * 0.19 + 1) * 200, 980 + Math.cos(s * 0.29) * 50, 620, "217,101,112", 0.26 * k),
            orb(260 + Math.cos(s * 0.21) * 100, 120 + Math.sin(s * 0.33) * 60, 520, "66,133,244", 0.2 * k),
          ].join(", "),
        }}
      />
      {/* faint dot grid, drifting */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1.4px)", backgroundSize: "36px 36px", backgroundPosition: `${(-s * 6) % 36}px ${(-s * 3) % 36}px`, WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
      {black > 0 ? <AbsoluteFill style={{ background: "#000", opacity: black }} /> : null}
    </AbsoluteFill>
  );
};

// ---------- a wall of code, a scan line, one line caught red ----------
const CODE_LINES = [
  "import { db } from './db';",
  "import { verify } from './auth';",
  "",
  "export async function charge(req, res) {",
  "  const user = await verify(req.headers.token);",
  "  const amount = Number(req.body.amount);",
  "  if (!user || amount <= 0) return res.status(400).end();",
  "  const tx = await payments.create({ user, amount });",
  "  return res.json(tx);",
  "}",
  "",
  "export async function getUser(req) {",
  "  const id = req.query.id;",
  '  const rows = await db.query("SELECT * FROM users WHERE id = " + id);',
  "  return rows[0];",
  "}",
  "",
  "export async function listOrders(req) {",
  "  const page = parseInt(req.query.page ?? '1', 10);",
  "  return db.orders.find({ user: req.user.id }).skip(page * 20);",
  "}",
  "",
  "router.get('/user', getUser);",
  "router.post('/charge', limiter, charge);",
  "router.get('/orders', listOrders);",
];
export const FLAW_LINE = 13;
export const CodeWall: React.FC<{ t: number; scanAt?: number; catchAt?: number; opacity?: number }> = ({ t, scanAt = 6, catchAt = 22, opacity = 1 }) => {
  const lh = 46;
  const top = 120 - t * 1.4;
  const scanY = ramp(t, [scanAt, catchAt], [-40, top + FLAW_LINE * lh + lh / 2], ease.inOut);
  const caught = ramp(t, [catchAt, catchAt + 4]);
  return (
    <AbsoluteFill style={{ opacity }}>
      {[0, 1].map((col) => (
        <div key={col} style={{ position: "absolute", left: col ? 1010 : 90, top: top + (col ? -lh * 6 : 0), fontFamily: GCODE, fontSize: 25, lineHeight: `${lh}px`, whiteSpace: "pre", color: "rgba(232,234,237,0.16)" }}>
          {CODE_LINES.map((l, i) => {
            const flaw = !col && i === FLAW_LINE;
            return (
              <div key={i} style={{ position: "relative", color: flaw ? `rgba(242,${139 - caught * 60},${130 - caught * 50},${0.16 + caught * 0.84})` : undefined }}>
                {flaw && caught > 0 ? <div style={{ position: "absolute", left: -18, right: -18, top: 4, bottom: 4, borderRadius: 8, background: `rgba(242,86,75,${0.14 * caught})`, border: `1.5px solid rgba(242,86,75,${0.7 * caught})` }} /> : null}
                <span style={{ position: "relative" }}>{l || " "}</span>
              </div>
            );
          })}
        </div>
      ))}
      {t >= scanAt && t < catchAt + 10 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 2, background: "linear-gradient(90deg, rgba(100,156,251,0), rgba(140,180,255,0.95) 30%, rgba(140,180,255,0.95) 70%, rgba(100,156,251,0))", boxShadow: "0 0 34px 8px rgba(66,133,244,0.35)", opacity: 1 - ramp(t, [catchAt + 2, catchAt + 10]) }} />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- a live network: threats travel toward the database, Argon's rings stop them ----------
const NODES: Record<string, { x: number; y: number }> = {
  web: { x: 290, y: 290 },
  mobile: { x: 270, y: 810 },
  api: { x: 470, y: 640 },
  auth: { x: 1040, y: 230 },
  payments: { x: 1080, y: 860 },
  users: { x: 1440, y: 390 },
  db: { x: 1690, y: 690 },
  cdn: { x: 640, y: 170 },
};
const EDGES: [string, string][] = [
  ["web", "api"],
  ["mobile", "api"],
  ["cdn", "web"],
  ["api", "auth"],
  ["api", "payments"],
  ["api", "users"],
  ["auth", "users"],
  ["users", "db"],
  ["payments", "db"],
];
// threats: [edge index, start (units), where it's stopped (0..1 along the path)]
const THREATS: [number[], number, string][] = [
  [[0, 5, 7], 2, "users"],
  [[1, 4, 8], 10, "payments"],
  [[0, 3, 6, 7], 18, "auth"],
];
export const ThreatNet: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 1 }) => {
  const pulses = THREATS.map(([path, at, stopAt]) => {
    const pts = [NODES[EDGES[path[0]][0]], ...path.map((e) => NODES[EDGES[e][1]])];
    const names = [EDGES[path[0]][0], ...path.map((e) => EDGES[e][1])];
    const stopIdx = names.indexOf(stopAt);
    const k = ramp(t, [at, at + 22], [0, 1], ease.inOut) * stopIdx; // travels to its stop node
    const i = Math.min(stopIdx - 1, Math.floor(k));
    const f = k - i;
    const p = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
    return { p, hit: at + 22, node: NODES[stopAt] };
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="rgba(160,195,255,0.4)" strokeWidth={2.5} strokeDasharray="6 9" strokeDashoffset={-t * 1.2} />
        ))}
        {pulses.map(({ p, hit, node }, i) => {
          const live = t < hit;
          const r = ramp(t, [hit, hit + 14], [10, 120], ease.out);
          return (
            <g key={i}>
              {live && t > THREATS[i][1] ? (
                <>
                  <circle cx={p.x} cy={p.y} r={40} fill="rgba(242,86,75,0.16)" />
                  <circle cx={p.x} cy={p.y} r={22} fill="rgba(242,86,75,0.3)" />
                  <circle cx={p.x} cy={p.y} r={11} fill="#FF6B5E" />
                </>
              ) : null}
              {!live && t < hit + 16 ? <circle cx={node.x} cy={node.y} r={r} fill="none" stroke={`rgba(120,170,255,${1 - (r - 10) / 110})`} strokeWidth={6} /> : null}
            </g>
          );
        })}
      </svg>
      {Object.entries(NODES).map(([name, n], i) => {
        const guarded = pulses.some((q, k) => q.node === n && t >= q.hit && t < q.hit + 30 && k >= 0);
        const p = ramp(t, [i * 1.5, i * 1.5 + 8], [0, 1], ease.out);
        return (
          <div key={name} style={{ position: "absolute", left: n.x, top: n.y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * p})`, opacity: p, display: "flex", alignItems: "center", gap: 10, height: 64, padding: "0 26px 0 18px", borderRadius: 32, background: "rgba(20,24,34,0.82)", border: `1.5px solid ${guarded ? "rgba(100,156,251,0.95)" : "rgba(160,190,255,0.3)"}`, boxShadow: guarded ? "0 0 30px rgba(66,133,244,0.55)" : "0 10px 30px rgba(0,0,0,0.5)", fontFamily: GS, fontSize: 26, color: "#E8EAED", whiteSpace: "nowrap" }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: guarded ? "#64A0FF" : "#34A853" }} />
            {name}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- a river of code tokens flowing past ----------
const TOKS = ["const", "id", "=", "req.query", ".id", ";", "await", "db", ".query", "(", "sql", ",", "[id]", ")", "return", "rows", "[0]", "if", "!user", "verify", "token", "export", "async", "function", "=>", "{", "}", "patch", "test", "pass"];
export const TokenRiver: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 1 }) => (
  <AbsoluteFill style={{ opacity }}>
    {Array.from({ length: 7 }, (_, row) => {
      const y = 680 + row * 52 - (row % 2) * 6;
      const speed = 2.2 + random(`rs${row}`) * 2.4;
      const fade = 1 - Math.abs(row - 3) / 4.2;
      const SLOT = 170;
      const base = t * speed + row * 140;
      const k0 = Math.floor(base / SLOT);
      const out: React.ReactNode[] = [];
      for (let slot = 0; slot < 14; slot++) {
        const k = slot - k0; // each token keeps its identity as it moves right
        const x = (slot - 1) * SLOT + (base % SLOT);
        const tok = TOKS[Math.floor(random(`rt${row}_${k}`) * TOKS.length)];
        const hot = random(`rh${row}_${k}`) < 0.12;
        out.push(
          <div key={k} style={{ position: "absolute", left: x, top: y, height: 36, padding: "0 12px", borderRadius: 10, fontFamily: GCODE, fontSize: 18, lineHeight: "36px", color: hot ? "#FFFFFF" : "rgba(232,234,237,0.7)", background: hot ? "linear-gradient(90deg, rgba(66,133,244,0.55), rgba(155,114,203,0.55))" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>
            {tok}
          </div>,
        );
      }
      return (
        <div key={row} style={{ opacity: fade * 0.9 }}>
          {out}
        </div>
      );
    })}
  </AbsoluteFill>
);
