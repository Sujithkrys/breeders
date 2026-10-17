// Character design sheet for "Thalaivar" (thalaivar.ts), shown the way he'll live in the film: rendered as dots on a
// white page. Frame 0: the face. 1: standing, khaki auto uniform. 2: the sunglasses moment. 3: the Baba sign. 4: the walk.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { drawFigure, drawHead, POSES } from "./thalaivar";

const W = 1080, H = 1920, RES = 2;
export const SHEET = { fps: 30, width: W, height: H, frames: 5 };
const GRID = 11;

// draw a vector scene offscreen, then rebuild it as dots: size from coverage and darkness, colour from the drawing
const Dots: React.FC<{ draw: (g: CanvasRenderingContext2D) => void; grid?: number }> = ({ draw, grid = GRID }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const og = off.getContext("2d")!;
    draw(og);
    const px = og.getImageData(0, 0, W, H).data;
    const cv = ref.current!, g = cv.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(RES, 0, 0, RES, 0, 0);
    for (let y = grid / 2; y < H; y += grid)
      for (let x = grid / 2; x < W; x += grid) {
        // average a small cell so edges get partial dots
        let a = 0, r = 0, gg = 0, b = 0, n = 0;
        for (let oy = -2; oy <= 2; oy += 2)
          for (let ox = -2; ox <= 2; ox += 2) {
            const i = ((Math.round(y + oy) * W) + Math.round(x + ox)) * 4;
            const al = px[i + 3] / 255;
            a += al; r += px[i] * al; gg += px[i + 1] * al; b += px[i + 2] * al; n++;
          }
        a /= n;
        if (a < 0.05) {
          g.fillStyle = "rgba(11,11,11,0.13)";
          g.beginPath(); g.arc(x, y, grid * 0.07, 0, Math.PI * 2); g.fill();
          continue;
        }
        r /= a * n; gg /= a * n; b /= a * n;
        const lum = (0.3 * r + 0.59 * gg + 0.11 * b) / 255;
        const size = a * (0.62 + 0.38 * (1 - lum));
        g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
        g.beginPath(); g.arc(x, y, (grid / 2) * 0.95 * size, 0, Math.PI * 2); g.fill();
      }
  });
  return <canvas ref={ref} width={W * RES} height={H * RES} style={{ position: "absolute", inset: 0, width: W, height: H }} />;
};

export const ThalaivarSheet: React.FC = () => {
  const f = useCurrentFrame();
  const draw = (g: CanvasRenderingContext2D) => {
    if (f === 0) {
      g.save(); g.translate(W / 2, H / 2 + 40); g.scale(1.3, 1.3);
      // shoulders and collar under the face
      g.fillStyle = "#151515";
      g.beginPath(); g.moveTo(-260, 420); g.bezierCurveTo(-240, 300, -120, 250, -60, 230); g.lineTo(60, 230); g.bezierCurveTo(120, 250, 240, 300, 260, 420); g.closePath(); g.fill();
      g.fillStyle = "#6A4129"; g.fillRect(-58, 170, 116, 80);
      drawHead(g, true);
      g.restore();
    } else {
      const pose = [POSES.stand, POSES.shades, POSES.baba, POSES.walk][f - 1];
      drawFigure(g, W / 2, H / 2 + 520, 1100, pose);
    }
  };
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Dots draw={draw} grid={f === 0 ? 12 : 10} />
    </AbsoluteFill>
  );
};
