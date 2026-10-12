// Gemini's web app UI (light), rebuilt in code at full detail: the chat page with its gradient "Hello" greeting, the
// "Ask Gemini" input (+, Tools, model, mic, send), the user bubble, "Show thinking" steps, the response with the spark,
// plus the documents the agent produces (a pull request diff, a security report). Sizes are the app's at 100% zoom.
import React from "react";
import { Icon } from "../clueso-mcp/icons";
import { GCODE, GS, Spark } from "./kit";

export const G = {
  ink: "#1F1F1F",
  sub: "#444746",
  faint: "#747775",
  line: "#E3E3E3",
  input: "#F0F4F9",
  bubble: "#E9EEF6",
  blue: "#0B57D0",
  tonal: "#D3E3FD",
  green: "#146C2E",
  red: "#B3261E",
};
export const GREETING = "linear-gradient(74deg, #4285F4 0%, #9B72CB 9%, #D96570 20%, #D96570 24%, #9B72CB 35%, #4285F4 44%, #9B72CB 50%, #D96570 56%, #FFFFFF 75%, #FFFFFF 100%)";

// ---------- the input box ----------
export const AskBox: React.FC<{ width?: number; text?: string; caret?: boolean; sendPress?: number; model?: string; focus?: number }> = ({ width = 760, text, caret, sendPress = 0, model = "4 Argon", focus = 0 }) => {
  const has = !!text;
  return (
    <div style={{ width, borderRadius: 32, background: G.input, padding: "20px 18px 12px 26px", boxSizing: "border-box", fontFamily: GS, boxShadow: focus ? `0 0 0 ${focus * 1.5}px rgba(11,87,208,0.25)` : undefined }}>
      <div style={{ minHeight: 30, fontSize: 18, lineHeight: "28px", color: has ? G.ink : G.faint, paddingRight: 10 }}>
        {has ? text : "Ask Gemini"}
        {caret ? <span style={{ display: "inline-block", width: 2, height: 22, marginLeft: 1, background: G.blue, verticalAlign: "-4px" }} /> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, height: 40 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, display: "grid", placeItems: "center", marginLeft: -12 }}>
          <Icon name="plus" size={22} color={G.sub} stroke={2} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 20, fontSize: 15, fontWeight: 500, color: G.sub }}>
          <Icon name="sliders" size={18} color={G.sub} stroke={2} /> Tools
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 36, padding: "0 12px", borderRadius: 18, fontSize: 15, fontWeight: 500, color: G.sub }}>
          {model} <Icon name="chevronDown" size={16} color={G.sub} stroke={2} />
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, display: "grid", placeItems: "center" }}>
          <Icon name="mic" size={21} color={G.sub} stroke={2} />
        </div>
        {has ? (
          <div style={{ width: 40, height: 40, borderRadius: 20, background: G.tonal, display: "grid", placeItems: "center", transform: `scale(${1 - sendPress * 0.12})` }}>
            <svg width={20} height={20} viewBox="0 0 24 24">
              <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.99.99 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" fill={G.blue} />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------- the chat page frame (rail, top bar) ----------
export const Page: React.FC<{ children: React.ReactNode; model?: string }> = ({ children, model = "4 Argon" }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, background: "#FFFFFF", fontFamily: GS }}>
    {/* left rail */}
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 72, background: "#F0F4F9", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, gap: 26 }}>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={G.sub} strokeWidth={2} strokeLinecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
      <Icon name="pen" size={22} color={G.sub} stroke={2} />
    </div>
    {/* top bar */}
    <div style={{ position: "absolute", left: 100, top: 20, display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 22, color: G.ink }}>Gemini</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: G.sub }}>
        {model} <Icon name="chevronDown" size={14} color={G.sub} stroke={2} />
      </div>
    </div>
    <div style={{ position: "absolute", right: 28, top: 22, width: 36, height: 36, borderRadius: 18, background: "#C2185B", color: "#fff", display: "grid", placeItems: "center", fontSize: 17, fontWeight: 500 }}>D</div>
    {children}
  </div>
);
export const Greeting: React.FC<{ name?: string; p?: number }> = ({ name = "Dev", p = 1 }) => (
  <div style={{ fontFamily: GS, fontSize: 56, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.2, backgroundImage: GREETING, backgroundSize: "400% 100%", backgroundPosition: `${(1 - p) * 100}% 0`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", opacity: Math.min(1, p * 2) }}>
    Hello, {name}
  </div>
);

// ---------- the conversation ----------
export const UserBubble: React.FC<{ text: string; width?: number }> = ({ text, width = 560 }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <div style={{ maxWidth: width, background: G.bubble, borderRadius: "24px 4px 24px 24px", padding: "14px 20px", fontFamily: GS, fontSize: 16, lineHeight: "26px", color: G.ink }}>{text}</div>
  </div>
);
export type StepRow = { icon: Parameters<typeof Icon>[0]["name"]; text: string; state: "wait" | "run" | "done" };
export const ThinkSteps: React.FC<{ rows: StepRow[]; shimmerT: number }> = ({ rows, shimmerT }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: GS }}>
    {rows.map((r, i) => {
      const p = ((shimmerT * 0.9 + i * 0.2) % 1) * 200 - 50;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 17, opacity: r.state === "wait" ? 0 : 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, display: "grid", placeItems: "center", background: r.state === "done" ? G.tonal : "#F0F4F9" }}>
            {r.state === "done" ? <Icon name="check" size={16} color={G.blue} stroke={2.6} /> : <Icon name={r.icon} size={16} color={G.sub} stroke={2} />}
          </div>
          <span
            style={
              r.state === "run"
                ? { backgroundImage: `linear-gradient(90deg, #8E918F ${p - 20}%, #1F1F1F ${p}%, #8E918F ${p + 20}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                : { color: G.sub }
            }
          >
            {r.text}
          </span>
        </div>
      );
    })}
  </div>
);
export const SparkAvatar: React.FC<{ spin?: number }> = ({ spin = 0 }) => <Spark size={30} style={{ transform: `rotate(${spin}deg)` }} />;

export const PrCard: React.FC<{ press?: number }> = ({ press = 0 }) => (
  <div style={{ width: 600, borderRadius: 20, border: `1px solid ${G.line}`, background: "#fff", padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, fontFamily: GS, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
    <div style={{ width: 46, height: 46, borderRadius: 12, background: "#E6F4EA", display: "grid", placeItems: "center" }}>
      <Icon name="git" size={24} color={G.green} stroke={2.2} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 17, fontWeight: 500, color: G.ink }}>Fix SQL injection in getUser</div>
      <div style={{ fontSize: 14, color: G.faint, marginTop: 2 }}>
        Pull request · payments-api · <span style={{ color: G.green }}>+1</span> <span style={{ color: G.red }}>−1</span>
      </div>
    </div>
    <div style={{ height: 38, padding: "0 18px", borderRadius: 19, background: G.blue, color: "#fff", fontSize: 15, fontWeight: 500, display: "grid", placeItems: "center", transform: `scale(${1 - press * 0.08})` }}>Open</div>
  </div>
);

// ---------- the pull request page ----------
const DIFF: { o?: number; n?: number; t: string; k?: "-" | "+" }[] = [
  { o: 39, n: 39, t: "" },
  { o: 40, n: 40, t: "export async function getUser(req) {" },
  { o: 41, n: 41, t: "  const id = req.query.id;" },
  { o: 42, t: '  const rows = await db.query("SELECT * FROM users WHERE id = " + id);', k: "-" },
  { n: 42, t: '  const rows = await db.query("SELECT * FROM users WHERE id = ?", [id]);', k: "+" },
  { o: 43, n: 43, t: "  return rows[0];" },
  { o: 44, n: 44, t: "}" },
];
export const PrPage: React.FC<{ checks?: number }> = ({ checks = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, background: "#fff", fontFamily: GS }}>
    <div style={{ height: 64, borderBottom: `1px solid ${G.line}`, display: "flex", alignItems: "center", gap: 14, padding: "0 40px", fontSize: 17, color: G.sub }}>
      <Icon name="git" size={22} color={G.sub} stroke={2} /> acme / <b style={{ color: G.ink, fontWeight: 500 }}>payments-api</b>
    </div>
    <div style={{ padding: "34px 120px 0" }}>
      <div style={{ fontSize: 38, color: G.ink, letterSpacing: "-0.01em" }}>
        Fix SQL injection in getUser <span style={{ color: G.faint }}>#482</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, fontSize: 17, color: G.sub }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 16, background: "#1F883D", color: "#fff", fontSize: 15, fontWeight: 500 }}>
          <Icon name="git" size={15} color="#fff" stroke={2.2} /> Open
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Spark size={18} /> <b style={{ color: G.ink, fontWeight: 500 }}>Gemini 4 Argon</b> wants to merge 1 commit into main
        </span>
      </div>
      <div style={{ display: "flex", gap: 34, marginTop: 26, borderBottom: `1px solid ${G.line}`, fontSize: 16, color: G.sub }}>
        {["Conversation", "Commits 1", "Checks", "Files changed 1"].map((x, i) => (
          <div key={x} style={{ paddingBottom: 12, borderBottom: i === 3 ? "2px solid #FD8C73" : "2px solid transparent", color: i === 3 ? G.ink : G.sub }}>{x}</div>
        ))}
      </div>
      <div style={{ marginTop: 26, border: `1px solid ${G.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ height: 48, background: "#F6F8FA", borderBottom: `1px solid ${G.line}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 12, fontFamily: GCODE, fontSize: 15, color: G.ink }}>
          handlers/user.ts <span style={{ fontFamily: GS, color: G.green }}>+1</span>
          <span style={{ fontFamily: GS, color: G.red }}>−1</span>
        </div>
        {DIFF.map((l, i) => (
          <div key={i} style={{ display: "flex", height: 34, alignItems: "center", fontFamily: GCODE, fontSize: 16, whiteSpace: "pre", background: l.k === "-" ? "#FFEBE9" : l.k === "+" ? "#E6FFEC" : "#fff" }}>
            <span style={{ width: 60, textAlign: "right", paddingRight: 12, color: "#8C959F", background: l.k === "-" ? "#FFD7D5" : l.k === "+" ? "#CCFFD8" : undefined, height: "100%", lineHeight: "34px" }}>{l.o ?? ""}</span>
            <span style={{ width: 60, textAlign: "right", paddingRight: 12, color: "#8C959F", background: l.k === "-" ? "#FFD7D5" : l.k === "+" ? "#CCFFD8" : undefined, height: "100%", lineHeight: "34px" }}>{l.n ?? ""}</span>
            <span style={{ width: 26, textAlign: "center", color: l.k === "-" ? "#CF222E" : "#1A7F37" }}>{l.k ?? " "}</span>
            <span style={{ color: "#1F2328" }}>{l.t}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 26, border: `1px solid ${G.line}`, borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, opacity: checks }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#1F883D", display: "grid", placeItems: "center" }}>
          <Icon name="check" size={22} color="#fff" stroke={2.8} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: G.ink }}>All checks have passed</div>
          <div style={{ fontSize: 15, color: G.faint, marginTop: 2 }}>Unit tests, integration tests and security scan</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ height: 44, padding: "0 22px", borderRadius: 8, background: "#1F883D", color: "#fff", fontSize: 16, fontWeight: 500, display: "grid", placeItems: "center" }}>Merge pull request</div>
      </div>
    </div>
  </div>
);

// ---------- the security report (a document) ----------
export const ReportPage: React.FC<{ bar?: number; comment?: string; commentP?: number; highlight?: number }> = ({ bar = 1, comment = "", commentP = 0, highlight = 0 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, background: "#F9FBFD", fontFamily: GS }}>
    <div style={{ height: 64, background: "#fff", borderBottom: `1px solid ${G.line}`, display: "flex", alignItems: "center", gap: 14, padding: "0 30px" }}>
      <div style={{ width: 30, height: 38, borderRadius: 4, background: "#4285F4", position: "relative" }}>
        {[12, 18, 24].map((y) => (
          <div key={y} style={{ position: "absolute", left: 7, right: 7, top: y, height: 2.5, background: "#fff", borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ fontSize: 19, color: G.ink }}>Security review: payments-api</div>
      <div style={{ flex: 1 }} />
      <div style={{ height: 40, padding: "0 22px", borderRadius: 20, background: G.tonal, color: "#041E49", fontSize: 15, fontWeight: 500, display: "grid", placeItems: "center" }}>Share</div>
    </div>
    <div style={{ position: "absolute", left: 460, top: 100, width: 1000, height: 1100, background: "#fff", boxShadow: "0 1px 3px rgba(60,64,67,0.15)", padding: "70px 90px", boxSizing: "border-box" }}>
      <div style={{ fontSize: 40, color: G.ink, letterSpacing: "-0.01em" }}>Security review: payments-api</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 16, color: G.faint }}>
        <Spark size={16} /> Prepared by Gemini 4 Argon
      </div>
      <div style={{ marginTop: 34, fontSize: 18, lineHeight: "30px", color: G.sub }}>
        <span style={{ background: `rgba(255,214,102,${0.6 * highlight})` }}>One critical vulnerability was found in the user lookup and patched the same day.</span> The fix uses a parameterized query, and every test passes.
      </div>
      <div style={{ marginTop: 34, fontSize: 20, fontWeight: 500, color: G.ink }}>Open critical issues</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 70, height: 230, marginTop: 20, paddingLeft: 30, borderBottom: `1px solid ${G.line}` }}>
        {[
          ["Before", 1],
          ["After", 1 - bar],
        ].map(([l, v]) => (
          <div key={l as string} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: G.ink }}>{Math.round(v as number)}</div>
            <div style={{ width: 120, height: 170 * (v as number) + 4, borderRadius: "8px 8px 0 0", background: l === "Before" ? "#EA4335" : "#34A853" }} />
            <div style={{ fontSize: 16, color: G.faint, paddingBottom: 10 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
    {commentP > 0 ? (
      <div style={{ position: "absolute", left: 1490, top: 250, width: 360, borderRadius: 14, background: "#fff", boxShadow: "0 4px 16px rgba(60,64,67,0.2)", padding: 18, opacity: Math.min(1, commentP * 2), transform: `translateX(${(1 - commentP) * 24}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: G.ink, fontWeight: 500 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: "#C2185B", color: "#fff", display: "grid", placeItems: "center", fontSize: 14 }}>D</div>
          Dev
        </div>
        <div style={{ marginTop: 12, minHeight: 50, borderRadius: 10, border: `1.5px solid ${G.blue}`, padding: "10px 12px", fontSize: 16, color: G.ink }}>
          {comment}
          <span style={{ display: "inline-block", width: 2, height: 18, background: G.blue, marginLeft: 1, verticalAlign: "-3px" }} />
        </div>
      </div>
    ) : null}
  </div>
);

// ---------- small app windows that float over the starfield ----------
export const MiniWindow: React.FC<{ kind: "code" | "sheet" | "mail" | "term" | "doc" | "chart"; w: number; h: number }> = ({ kind, w, h }) => {
  const bar = (
    <div style={{ height: 30, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", background: kind === "code" || kind === "term" ? "#2B2D31" : "#F1F3F4" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <span key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c }} />
      ))}
    </div>
  );
  const dark = kind === "code" || kind === "term";
  return (
    <div style={{ width: w, height: h, borderRadius: 12, overflow: "hidden", background: dark ? "#1E1F22" : "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: GS }}>
      {bar}
      {kind === "code" ? (
        <div style={{ padding: 16, fontFamily: GCODE, fontSize: 13, lineHeight: "22px", whiteSpace: "pre" }}>
          {[["#C792EA", "export async function "], ["#82AAFF", "getUser"], ["#BFC7D5", "(req) {"]].map(([c, t], i) => (
            <span key={i} style={{ color: c }}>{t}</span>
          ))}
          <div style={{ color: "#BFC7D5" }}>  const id = req.query.id;</div>
          <div style={{ color: "#F78C6C", background: "rgba(255,80,80,0.15)" }}>  db.query(sql + id)</div>
          <div style={{ color: "#C3E88D", background: "rgba(80,255,120,0.12)" }}>  db.query(sql, [id])</div>
          <div style={{ color: "#BFC7D5" }}>  return rows[0];</div>
          <div style={{ color: "#BFC7D5" }}>{"}"}</div>
        </div>
      ) : kind === "term" ? (
        <div style={{ padding: 16, fontFamily: GCODE, fontSize: 13, lineHeight: "22px", color: "#BFC7D5", whiteSpace: "pre" }}>
          <div>$ npm test</div>
          <div style={{ color: "#C3E88D" }}>✓ users.getUser</div>
          <div style={{ color: "#C3E88D" }}>✓ users.list</div>
          <div style={{ color: "#C3E88D" }}>✓ payments.charge</div>
          <div style={{ color: "#82AAFF" }}>All tests passed</div>
        </div>
      ) : kind === "sheet" ? (
        <div style={{ padding: 12, fontSize: 12 }}>
          <div style={{ fontWeight: 500, color: G.ink, marginBottom: 8, fontSize: 14 }}>Vulnerability tracker</div>
          {[["Issue", "Severity", "Status"], ["SQL injection", "Critical", "Fixed"], ["Open redirect", "Medium", "Fixed"], ["Old TLS", "Low", "Fixed"]].map((r, i) => (
            <div key={i} style={{ display: "flex", borderTop: `1px solid ${G.line}`, height: 26, alignItems: "center", fontWeight: i ? 400 : 500, background: i ? undefined : "#F1F3F4" }}>
              {r.map((c, k) => (
                <span key={k} style={{ flex: k ? 0.8 : 1.4, paddingLeft: 6, color: c === "Fixed" ? "#188038" : c === "Critical" ? "#C5221F" : G.sub }}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      ) : kind === "mail" ? (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: G.ink }}>Security alert: critical issue fixed</div>
          <div style={{ fontSize: 12, color: G.faint, marginTop: 4 }}>to security-team</div>
          {[1, 0.9, 0.7].map((wv, i) => (
            <div key={i} style={{ height: 8, borderRadius: 4, background: "#E8EAED", marginTop: 12, width: `${wv * 100}%` }} />
          ))}
        </div>
      ) : kind === "doc" ? (
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 16, color: G.ink }}>Security review</div>
          {[1, 0.95, 0.85, 1, 0.6].map((wv, i) => (
            <div key={i} style={{ height: 7, borderRadius: 4, background: "#E8EAED", marginTop: 11, width: `${wv * 100}%` }} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 13, color: G.sub }}>Open critical issues</div>
          <svg width={w - 28} height={h - 80} viewBox="0 0 200 100" preserveAspectRatio="none">
            <polyline points="0,20 40,24 80,22 120,50 160,85 200,92" fill="none" stroke="#4285F4" strokeWidth={3} />
          </svg>
        </div>
      )}
    </div>
  );
};
