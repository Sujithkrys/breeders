// "Thalaivar": our own character of Rajinikanth, designed from reference photos (not traced). Drawn as clean vector
// geometry onto a canvas, then rendered as dots by the dot renderer. The Superstar-era look: tall swept hair with
// sideburns, thick moustache, aviator sunglasses, strong jaw, tanned skin. Built as a rig so he can pose:
// arms by angle, hands by shape (fist, open, Baba sign, holding shades), shades on the face or in the hand, a walk.

export type Hand = "fist" | "open" | "baba" | "shades";
export type Pose = {
  armL: [number, number]; // shoulder and elbow angles in degrees: 0 = hanging straight down, 90 = out to the side, 180 = straight up
  armR: [number, number];
  handL: Hand;
  handR: Hand;
  shadesOn: boolean; // sunglasses on the face
  walk?: number; // walk phase in radians, 0 = standing
  headTilt?: number; // degrees
  outfit?: "khaki" | "black" | "white";
};

export const C = {
  skin: "#8B5A3A",
  skinLight: "#A8744E",
  skinDark: "#6A4129",
  hair: "#121010",
  shades: "#0A0A0A",
  shine: "#5A5A5A",
  khaki: "#B39B66",
  khakiDark: "#8E784A",
  black: "#151515",
  blackLight: "#2B2B2B",
  white: "#EDEBE5",
  whiteDark: "#CFCBC2",
  pants: "#2A2A2E",
  shoe: "#0E0E0E",
};

type Ctx = CanvasRenderingContext2D;
const rad = (d: number) => (d * Math.PI) / 180;
const capsule = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round";
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
};
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient, rot = 0) => {
  g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill();
};

// ---------- the head, front view, centred on (0, 0): face ~300 wide, ~390 tall ----------
export const drawHead = (g: Ctx, shadesOn: boolean) => {
  // hair: a tall swept mass, fuller on his right, with sideburns
  g.fillStyle = C.hair;
  g.beginPath();
  g.moveTo(-150, 10);
  g.bezierCurveTo(-178, -120, -150, -250, -40, -282);
  g.bezierCurveTo(40, -306, 150, -292, 182, -210);
  g.bezierCurveTo(206, -150, 178, -60, 150, 10);
  g.lineTo(130, 40);
  g.lineTo(-130, 40);
  g.closePath();
  g.fill();
  // a swept wave lifting off the crown
  g.beginPath();
  g.moveTo(-90, -250);
  g.bezierCurveTo(-30, -330, 110, -340, 168, -268);
  g.bezierCurveTo(120, -290, 30, -296, -90, -250);
  g.fill();
  // sideburns
  g.fillRect(-150, -30, 22, 120);
  g.fillRect(128, -30, 22, 120);
  // ears
  ell(g, -150, 30, 20, 42, C.skinDark);
  ell(g, 150, 30, 20, 42, C.skinDark);
  // face: lit from his right (screen left)
  const fg = g.createLinearGradient(-150, 0, 150, 0);
  fg.addColorStop(0, C.skinLight); fg.addColorStop(0.6, C.skin); fg.addColorStop(1, C.skinDark);
  g.fillStyle = fg;
  g.beginPath();
  g.moveTo(-138, -100);
  g.bezierCurveTo(-140, -40, -142, 60, -112, 130);
  g.bezierCurveTo(-82, 186, -40, 206, 0, 208);
  g.bezierCurveTo(40, 206, 82, 186, 112, 130);
  g.bezierCurveTo(142, 60, 140, -40, 138, -100);
  // hairline: dips to a soft widow's peak
  g.bezierCurveTo(110, -150, 60, -160, 10, -140);
  g.bezierCurveTo(-50, -164, -110, -150, -138, -100);
  g.closePath();
  g.fill();
  // brows
  capsule(g, -98, -58, -28, -64, 14, C.hair);
  capsule(g, 28, -64, 98, -58, 14, C.hair);
  // nose: a shadow plane and nostrils
  g.fillStyle = C.skinDark;
  g.beginPath(); g.moveTo(6, -40); g.lineTo(26, 46); g.lineTo(4, 54); g.closePath(); g.fill();
  ell(g, -14, 56, 10, 6, C.skinDark);
  ell(g, 16, 56, 10, 6, C.skinDark);
  // the moustache: thick, curving down at the ends
  g.fillStyle = C.hair;
  g.beginPath();
  g.moveTo(-70, 104);
  g.bezierCurveTo(-60, 70, -20, 66, 0, 78);
  g.bezierCurveTo(20, 66, 60, 70, 70, 104);
  g.bezierCurveTo(56, 92, 30, 92, 0, 98);
  g.bezierCurveTo(-30, 92, -56, 92, -70, 104);
  g.fill();
  // mouth and chin line
  capsule(g, -26, 124, 26, 124, 6, C.skinDark);
  capsule(g, -24, 176, 24, 176, 5, C.skinDark);
  if (shadesOn) drawShades(g, 0, -20, 1);
  else {
    // eyes, when the shades are off
    ell(g, -60, -20, 16, 9, "#1A1210");
    ell(g, 60, -20, 16, 9, "#1A1210");
  }
};
// aviator sunglasses centred on (x, y), scale s
export const drawShades = (g: Ctx, x: number, y: number, s: number, tilt = 0) => {
  g.save();
  g.translate(x, y); g.rotate(rad(tilt)); g.scale(s, s);
  const lens = (sx: number) => {
    g.beginPath();
    g.moveTo(sx * 12, -34);
    g.lineTo(sx * 128, -34);
    g.bezierCurveTo(sx * 140, -34, sx * 142, -20, sx * 138, 0);
    g.bezierCurveTo(sx * 130, 40, sx * 104, 48, sx * 74, 46);
    g.bezierCurveTo(sx * 40, 44, sx * 14, 28, sx * 10, -6);
    g.closePath();
  };
  g.fillStyle = C.shades;
  lens(-1); g.fill(); lens(1); g.fill();
  // the bridge and temple arms
  capsule(g, -14, -26, 14, -26, 8, C.shades);
  capsule(g, -138, -28, -158, -24, 8, C.shades);
  capsule(g, 138, -28, 158, -24, 8, C.shades);
  // one hard reflection on each lens
  g.fillStyle = C.shine;
  g.beginPath(); g.moveTo(-112, -28); g.lineTo(-92, -28); g.lineTo(-118, 30); g.lineTo(-130, 18); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(34, -28); g.lineTo(52, -28); g.lineTo(30, 26); g.lineTo(20, 18); g.closePath(); g.fill();
  g.restore();
};

// ---------- hands ----------
const drawHand = (g: Ctx, x: number, y: number, ang: number, kind: Hand, s: number) => {
  g.save();
  g.translate(x, y); g.rotate(rad(ang)); g.scale(s, s);
  // the hand points along +y (down the forearm)
  ell(g, 0, 18, 26, 30, C.skin);
  if (kind === "open") {
    for (let i = 0; i < 4; i++) capsule(g, -15 + i * 10, 34, -18 + i * 12, 66, 9, C.skin);
    capsule(g, 22, 18, 36, 40, 10, C.skin);
  } else if (kind === "baba") {
    // index and little finger raised, middle and ring folded under the thumb
    capsule(g, -16, 30, -20, 84, 11, C.skin);
    capsule(g, 18, 30, 22, 74, 10, C.skin);
    ell(g, 0, 40, 13, 9, C.skinDark);
    capsule(g, -24, 30, 10, 42, 11, C.skinLight);
  } else if (kind === "shades") {
    capsule(g, -10, 34, 6, 50, 11, C.skin);
    g.restore();
    g.save();
    g.translate(x, y); g.rotate(rad(ang));
    drawShades(g, 0, 70 * s, 0.55 * s, 90);
  } else {
    ell(g, 0, 34, 22, 14, C.skinDark);
  }
  g.restore();
};

// ---------- the full figure: feet at (x, y), height ~h ----------
export const drawFigure = (g: Ctx, x: number, y: number, h: number, p: Pose) => {
  const s = h / 1500; // the design is drawn 1500 tall
  g.save();
  g.translate(x, y); g.scale(s, s);
  const outfit = p.outfit ?? "khaki";
  const shirt = outfit === "khaki" ? C.khaki : outfit === "black" ? C.black : C.white;
  const shirtDark = outfit === "khaki" ? C.khakiDark : outfit === "black" ? C.blackLight : C.whiteDark;
  const w = p.walk ?? 0, sw = Math.sin(w);
  // legs: hips at y −700, feet at 0
  const leg = (side: number, phase: number) => {
    const swing = side * 0 + phase * 16;
    const hx = side * 52, kneeX = hx + Math.sin(rad(swing)) * 340, kneeY = -700 + Math.cos(rad(swing)) * 340;
    const footX = kneeX + Math.sin(rad(swing * 0.4)) * 340, footY = Math.min(0, kneeY + Math.cos(rad(swing * 0.4)) * 340);
    capsule(g, hx, -700, kneeX, kneeY, 92, C.pants);
    capsule(g, kneeX, kneeY, footX, footY, 82, C.pants);
    g.fillStyle = C.shoe;
    g.beginPath(); g.ellipse(footX + 18, footY + 8, 62, 26, 0, 0, Math.PI * 2); g.fill();
  };
  leg(-1, sw);
  leg(1, -sw);
  // torso: a tapered shirt with an open collar
  g.fillStyle = shirt;
  g.beginPath();
  g.moveTo(-170, -1170); g.lineTo(170, -1170);
  g.bezierCurveTo(196, -1050, 160, -800, 128, -690);
  g.lineTo(-128, -690);
  g.bezierCurveTo(-160, -800, -196, -1050, -170, -1170);
  g.fill();
  g.fillStyle = shirtDark;
  g.beginPath(); g.moveTo(40, -1170); g.lineTo(170, -1170); g.bezierCurveTo(196, -1050, 160, -800, 128, -690); g.lineTo(60, -690); g.closePath(); g.fill();
  // the open collar showing the neck
  g.fillStyle = C.skin;
  g.beginPath(); g.moveTo(-44, -1190); g.lineTo(44, -1190); g.lineTo(0, -1080); g.closePath(); g.fill();
  g.fillStyle = shirtDark;
  g.beginPath(); g.moveTo(-70, -1186); g.lineTo(-6, -1090); g.lineTo(-30, -1180); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(70, -1186); g.lineTo(6, -1090); g.lineTo(30, -1180); g.closePath(); g.fill();
  // a belt line
  capsule(g, -128, -700, 128, -700, 20, C.black);
  // arms: shoulder at (±170, −1140); upper arm 300, forearm 280
  const arm = (side: number, [sh, el]: [number, number], hand: Hand) => {
    // angles from straight down, opening outward on that side (180 = straight up)
    const sx = side * 168, sy = -1140;
    const a1 = rad(sh), a2 = rad(sh + el);
    const elbowX = sx + side * Math.sin(a1) * 300, elbowY = sy + Math.cos(a1) * 300;
    const hx = elbowX + side * Math.sin(a2) * 280, hy = elbowY + Math.cos(a2) * 280;
    capsule(g, sx, sy, elbowX, elbowY, 74, shirt);
    capsule(g, elbowX, elbowY, hx, hy, 60, C.skin);
    const handAng = -Math.atan2(hx - elbowX, hy - elbowY) * (180 / Math.PI);
    drawHand(g, hx, hy, handAng, hand, 2.0);
  };
  arm(-1, p.armL, p.handL);
  arm(1, p.armR, p.handR);
  // neck and head
  g.fillStyle = C.skinDark;
  g.fillRect(-46, -1250, 92, 90);
  g.save();
  g.translate(0, -1400); g.rotate(rad(p.headTilt ?? 0)); g.scale(0.62, 0.62);
  drawHead(g, p.shadesOn);
  g.restore();
  g.restore();
};

export const POSES: Record<string, Pose> = {
  stand: { armL: [8, 0], armR: [8, 0], handL: "fist", handR: "fist", shadesOn: true, outfit: "khaki" },
  shades: { armL: [8, 0], armR: [150, -250], handL: "fist", handR: "shades", shadesOn: false, outfit: "black" },
  baba: { armL: [8, 0], armR: [160, 10], handL: "fist", handR: "baba", shadesOn: true, outfit: "white" },
  walk: { armL: [-18, 10], armR: [18, 10], handL: "fist", handR: "fist", shadesOn: true, walk: 1, outfit: "black" },
};
