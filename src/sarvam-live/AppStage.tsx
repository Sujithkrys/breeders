import React from "react";
import { AbsoluteFill } from "remotion";
import { APP_H, APP_W } from "./mock/Studio";
import { C } from "./theme";

export const APP_SCALE = 1.2;
const CX = 960;
const CY = 572;

export type Cam = { z: number; fx: number; fy: number };
export const CAM_HOME: Cam = { z: 1, fx: APP_W / 2, fy: APP_H / 2 };

// The app window floating on the grey stage. The camera zooms around a focus point given in app coordinates,
// as a plain 2D transform so text stays crisp at any zoom.
export const AppStage: React.FC<{
  cam?: Cam;
  enter?: number;
  x?: number;
  opacity?: number;
  filter?: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
  bare?: boolean;
}> = ({ cam = CAM_HOME, enter = 1, x = 0, opacity = 1, filter, children, overlay, bare }) => {
  const s = APP_SCALE * cam.z * (0.965 + 0.035 * enter);
  return (
    <AbsoluteFill style={{ backgroundColor: bare ? undefined : C.stage, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: APP_W,
          height: APP_H,
          transformOrigin: "0 0",
          transform: `translate(${CX + x}px, ${CY + (1 - enter) * 70}px) scale(${s}) translate(${-cam.fx}px, ${-cam.fy}px)`,
          opacity: opacity * Math.min(1, enter * 1.4),
          filter,
          borderRadius: 18,
          boxShadow: "0 30px 90px rgba(0,0,0,0.10), 0 6px 20px rgba(0,0,0,0.05)",
        }}
      >
        {children}
      </div>
      {/* Keeps the caption band clean when the camera is pushed in. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.stage} 0px, ${C.stage} 120px, rgba(240,240,240,0) 190px, rgba(240,240,240,0) 900px, ${C.stage} 1000px)`,
          opacity: Math.min(1, (cam.z - 1) * 6),
        }}
      />
      {overlay}
    </AbsoluteFill>
  );
};
