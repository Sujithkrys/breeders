import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT } from "../theme";
import { Icon, IconName } from "../icons";
import { Avatar } from "../ui";

// Fictional light-theme SaaS app ("Acme Analytics") shown inside recordings. Designed at 1280×720.
export const APP_W = 1280;
export const APP_H = 720;
export const EXPORT_BTN = { x: 1136, y: 100, w: 112, h: 40, cx: 1192, cy: 120 };

const A = {
  bg: "#FFFFFF",
  side: "#F7F8FA",
  line: "#E6E8EC",
  text: "#0F172A",
  text2: "#475569",
  muted: "#94A3B8",
  blue: "#2F5BEA",
  blueSoft: "#EAF0FF",
  green: "#12A150",
  greenSoft: "#E7F7EE",
  amber: "#B7791F",
  amberSoft: "#FDF3E1",
};

const NAV: [IconName, string][] = [
  ["home", "Dashboard"],
  ["chart", "Reports"],
  ["users", "Customers"],
  ["plug", "Integrations"],
  ["sliders", "Settings"],
];

const ROWS = [
  { name: "Quarterly revenue", owner: "Maya Chen", run: "2h ago", rows: "12,480", status: "Ready" },
  { name: "Churn by cohort", owner: "Leo Park", run: "Yesterday", rows: "3,912", status: "Ready" },
  { name: "Pipeline velocity", owner: "Ana Silva", run: "Yesterday", rows: "8,205", status: "Scheduled" },
  { name: "Support SLA", owner: "Sam Wright", run: "Mon", rows: "1,764", status: "Ready" },
  { name: "Weekly active users", owner: "Priya Nair", run: "Mon", rows: "52,118", status: "Ready" },
  { name: "Regional sales", owner: "Tom Berg", run: "Sep 21", rows: "6,430", status: "Scheduled" },
  { name: "Onboarding funnel", owner: "Maya Chen", run: "Sep 20", rows: "9,877", status: "Ready" },
];

const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <div
    style={{
      width: 18,
      height: 18,
      borderRadius: 5,
      border: on ? "none" : `1.5px solid ${A.muted}`,
      backgroundColor: on ? A.blue : "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {on ? <Icon name="check" size={13} color="#fff" stroke={3} /> : null}
  </div>
);

export const AppShot: React.FC<{
  selected?: number;
  modal?: number;
  progress?: number;
  exportPressed?: boolean;
}> = ({ selected = 0, modal = 0, progress = 0, exportPressed = false }) => (
  <div style={{ position: "relative", width: APP_W, height: APP_H, backgroundColor: A.bg, fontFamily: FONT.sans, overflow: "hidden" }}>
    {/* Sidebar */}
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 232, backgroundColor: A.side, borderRight: `1px solid ${A.line}` }}>
      <div style={{ position: "absolute", left: 24, top: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: A.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24">
            <path d="M12 3L22 20H2z" fill="#fff" />
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: A.text, letterSpacing: "-0.01em" }}>Acme</span>
      </div>
      <div style={{ position: "absolute", left: 24, top: 76, fontSize: 11, fontWeight: 600, color: A.muted, letterSpacing: "0.06em" }}>WORKSPACE</div>
      {NAV.map(([icon, label], i) => {
        const active = label === "Reports";
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              top: 96 + i * 40,
              height: 36,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 12px",
              backgroundColor: active ? A.blueSoft : "transparent",
              color: active ? A.blue : A.text2,
              fontSize: 15,
              fontWeight: active ? 600 : 500,
            }}
          >
            <Icon name={icon} size={18} />
            {label}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 20, bottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name="Jordan Diaz" size={32} hue={210} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: A.text }}>Jordan Diaz</span>
          <span style={{ fontSize: 12, color: A.muted }}>Admin</span>
        </div>
      </div>
    </div>

    {/* Top bar */}
    <div style={{ position: "absolute", left: 232, right: 0, top: 0, height: 64, borderBottom: `1px solid ${A.line}` }}>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 14,
          width: 360,
          height: 36,
          borderRadius: 8,
          border: `1px solid ${A.line}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          color: A.muted,
          fontSize: 14,
        }}
      >
        <Icon name="search" size={16} />
        Search reports…
        <span style={{ marginLeft: "auto", fontSize: 12, border: `1px solid ${A.line}`, borderRadius: 5, padding: "1px 7px" }}>/</span>
      </div>
      <div style={{ position: "absolute", right: 72, top: 20, color: A.text2 }}>
        <Icon name="bell" size={22} />
      </div>
      <div style={{ position: "absolute", right: 24, top: 14 }}>
        <Avatar name="Jordan Diaz" size={36} hue={210} />
      </div>
    </div>

    {/* Page header */}
    <div style={{ position: "absolute", left: 264, top: 92, fontSize: 28, fontWeight: 600, color: A.text, letterSpacing: "-0.02em" }}>Reports</div>
    <div style={{ position: "absolute", left: 264, top: 134, fontSize: 14, color: A.text2 }}>142 reports · Updated 2 min ago</div>
    <div
      style={{
        position: "absolute",
        left: 1036,
        top: 100,
        width: 88,
        height: 40,
        borderRadius: 8,
        border: `1px solid ${A.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 500,
        color: A.text,
      }}
    >
      <Icon name="filter" size={15} />
      Filter
    </div>
    <div
      style={{
        position: "absolute",
        left: EXPORT_BTN.x,
        top: EXPORT_BTN.y,
        width: EXPORT_BTN.w,
        height: EXPORT_BTN.h,
        borderRadius: 8,
        backgroundColor: exportPressed ? "#2449C2" : A.blue,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#fff",
        boxShadow: "0 1px 2px rgba(15,23,42,0.2)",
      }}
    >
      <Icon name="download" size={16} stroke={2.4} />
      Export
    </div>

    {/* Tabs */}
    <div style={{ position: "absolute", left: 264, right: 32, top: 172, height: 36, borderBottom: `1px solid ${A.line}`, display: "flex", gap: 28, fontSize: 14, fontWeight: 500 }}>
      {["All reports", "Scheduled", "Shared with me"].map((tab, i) => (
        <div key={tab} style={{ color: i === 0 ? A.text : A.muted, borderBottom: i === 0 ? `2px solid ${A.text}` : "none", height: 35 }}>
          {tab}
        </div>
      ))}
    </div>

    {/* Table */}
    <div style={{ position: "absolute", left: 248, right: 16, top: 216 }}>
      <div style={{ height: 40, display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600, color: A.muted, letterSpacing: "0.04em", padding: "0 16px" }}>
        <div style={{ width: 36 }}>
          <Check on={selected >= ROWS.length} />
        </div>
        <div style={{ width: 340 }}>NAME</div>
        <div style={{ width: 220 }}>OWNER</div>
        <div style={{ width: 130 }}>LAST RUN</div>
        <div style={{ width: 120 }}>ROWS</div>
        <div>STATUS</div>
      </div>
      {ROWS.map((r, i) => {
        const sel = i < selected;
        const ready = r.status === "Ready";
        return (
          <div
            key={r.name}
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              borderTop: `1px solid ${A.line}`,
              backgroundColor: sel ? "#F3F6FF" : "transparent",
              fontSize: 15,
              color: A.text,
            }}
          >
            <div style={{ width: 36 }}>
              <Check on={sel} />
            </div>
            <div style={{ width: 340, display: "flex", alignItems: "center", gap: 12, fontWeight: 500 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: A.blueSoft, color: A.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="chart" size={16} />
              </div>
              {r.name}
            </div>
            <div style={{ width: 220, display: "flex", alignItems: "center", gap: 10, color: A.text2 }}>
              <Avatar name={r.owner} size={26} />
              {r.owner}
            </div>
            <div style={{ width: 130, color: A.text2 }}>{r.run}</div>
            <div style={{ width: 120, color: A.text2, fontVariantNumeric: "tabular-nums" }}>{r.rows}</div>
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                color: ready ? A.green : A.amber,
                backgroundColor: ready ? A.greenSoft : A.amberSoft,
              }}
            >
              {r.status}
            </div>
          </div>
        );
      })}
    </div>

    {/* Export modal */}
    {modal > 0 ? (
      <AbsoluteFill style={{ backgroundColor: `rgba(15,23,42,${0.35 * modal})` }}>
        <div
          style={{
            position: "absolute",
            left: 756 - 230,
            top: 360 - 160,
            width: 460,
            borderRadius: 14,
            backgroundColor: "#fff",
            boxShadow: "0 24px 60px rgba(15,23,42,0.3)",
            padding: 28,
            opacity: modal,
            transform: `translateY(${(1 - modal) * 20}px) scale(${0.96 + 0.04 * modal})`,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600, color: A.text }}>Export {Math.max(selected, 1)} reports</div>
          <div style={{ display: "flex", border: `1px solid ${A.line}`, borderRadius: 8, overflow: "hidden", fontSize: 14, fontWeight: 500 }}>
            {["CSV", "XLSX", "PDF"].map((fmt) => (
              <div
                key={fmt}
                style={{
                  flex: 1,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: fmt === "XLSX" ? A.blueSoft : "#fff",
                  color: fmt === "XLSX" ? A.blue : A.text2,
                  borderLeft: fmt === "CSV" ? "none" : `1px solid ${A.line}`,
                }}
              >
                {fmt}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: A.text2 }}>
            <Check on />
            Include charts and filters
          </div>
          <div style={{ height: 8, borderRadius: 4, backgroundColor: A.line, overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: A.blue }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, fontSize: 14, fontWeight: 600 }}>
            <div style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${A.line}`, color: A.text }}>Cancel</div>
            <div style={{ padding: "9px 16px", borderRadius: 8, backgroundColor: A.blue, color: "#fff" }}>
              {progress >= 1 ? "Downloaded" : "Export"}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    ) : null}
  </div>
);

// Branded intro card for the generated video, in Acme's colors. Designed at 1280×720.
export const AcmeTitleCard: React.FC<{ reveal?: number; subtitle?: boolean }> = ({ reveal = 1, subtitle = true }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      width: APP_W,
      height: APP_H,
      backgroundColor: "#0B1230",
      clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
      overflow: "hidden",
      fontFamily: FONT.display,
    }}
  >
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 90% at 85% 15%, #3D6BFF99 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 10% 110%, #6A4CFF66 0%, transparent 60%)" }} />
    <div style={{ position: "absolute", right: 80, top: 150, width: 560, height: 360, borderRadius: 18, overflow: "hidden", transform: "rotate(-4deg)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div style={{ transform: "scale(0.4375)", transformOrigin: "0 0" }}>
        <AppShot selected={3} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 72, top: 64, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#2F5BEA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={20} height={20} viewBox="0 0 24 24">
          <path d="M12 3L22 20H2z" fill="#fff" />
        </svg>
      </div>
      <span style={{ fontSize: 24, fontWeight: 600, color: "#fff" }}>Acme</span>
    </div>
    <div style={{ position: "absolute", left: 72, top: 300, width: 520 }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 18, color: "#8FB0FF", letterSpacing: "0.1em", marginBottom: 18 }}>NEW IN REPORTS</div>
      <div style={{ fontSize: 92, fontWeight: 700, color: "#fff", letterSpacing: "-0.045em", lineHeight: 0.95 }}>Bulk export</div>
      {subtitle ? <div style={{ fontFamily: FONT.sans, fontSize: 26, color: "#B9C6E8", marginTop: 22 }}>Every report, one click.</div> : null}
    </div>
  </div>
);
