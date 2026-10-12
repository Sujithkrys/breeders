// Render review stills from one bundle: node scripts/stills.mjs <CompositionId> <outDir> <sec> [sec...]
// Add SCALE=0.5 for half-size stills.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Bundles and per-still render folders go to E: (out/.tmp), not C:\...\Temp, and are removed at the end: each still
// leaves a ~10 MB folder behind, and a few hundred of them filled the system drive.
const TMP = join(ROOT, `out/.tmp-${process.pid}`); // per run: a locked file left by an earlier run cannot block this one
rmSync(TMP, { recursive: true, force: true, maxRetries: 3 });
mkdirSync(TMP, { recursive: true });
process.env.TEMP = process.env.TMP = TMP;
const [id, outDir, ...secs] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.ts"), webpackOverride: enableTailwind, rspack: true });
const composition = await selectComposition({ serveUrl, id });
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = join(outDir, `${id}-${String(s).replace(".", "_")}.png`);
  // GL=angle for compositions with WebGL (Three.js) content
  await renderStill({ serveUrl, composition, frame, output, scale: Number(process.env.SCALE ?? 0.5), ...(process.env.GL ? { chromiumOptions: { gl: process.env.GL } } : {}) });
  console.log(output);
}
rmSync(TMP, { recursive: true, force: true, maxRetries: 3 });
