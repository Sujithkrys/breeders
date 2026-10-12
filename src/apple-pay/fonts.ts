// Apple's SF Pro (Display for headlines, Text for iOS UI), loaded from public/fonts/sf (not in git: Apple's licence).
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const SFD = "'SF Pro Display', 'Inter Tight', Inter, sans-serif";
export const SFT = "'SF Pro Text', Inter, sans-serif";
const FILES: [string, string, string][] = [
  ["SF Pro Display", "300", "SF-Pro-Display-Light.otf"],
  ["SF Pro Display", "400", "SF-Pro-Display-Regular.otf"],
  ["SF Pro Display", "500", "SF-Pro-Display-Medium.otf"],
  ["SF Pro Display", "600", "SF-Pro-Display-Semibold.otf"],
  ["SF Pro Display", "700", "SF-Pro-Display-Bold.otf"],
  ["SF Pro Text", "400", "SF-Pro-Text-Regular.otf"],
  ["SF Pro Text", "500", "SF-Pro-Text-Medium.otf"],
  ["SF Pro Text", "600", "SF-Pro-Text-Semibold.otf"],
];
let loaded = false;
export const loadSF = () => {
  if (loaded) return;
  loaded = true;
  for (const [family, weight, file] of FILES) loadFont({ family, weight, url: staticFile(`fonts/sf/${file}`) });
};
