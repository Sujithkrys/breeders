# Breeders

Remotion project for code-built motion graphics videos.

## Commands

```console
npm i
npm run dev                     # Remotion Studio preview
npx remotion render src/index.ts <CompositionId> out/<name>.mp4
```

In a Claude Code cloud container, Remotion can't download its own Chrome, so point it at the pre-installed one:

```console
npx remotion render src/index.ts CluesoMCP45 out/clueso-mcp-45s.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Layout

- `src/utils.ts` — reusable across videos: easings, `ramp`/`kf` keyframes, spring presets, zoom-punch, typewriter, 8px grid unit `u()`, self-hosted font loading. Animations are authored in 30fps "units" (`useT()`), so the render fps can change without re-timing.
- `src/brand/` — vector traces of the supplied Clueso, Claude and OpenAI logo files.
- `public/fonts/` — self-hosted Inter, Geist, Geist Mono (SIL OFL, licenses alongside).
- `src/clueso-mcp/` — the Clueso MCP launch video. `theme.ts` holds colors, fps, scene timings and the quote placeholder; one file per scene in `scenes/`.
- `src/clueso-mcp/mock/` — fictional UIs used in the video: `AppShot` (the "Acme Analytics" product being recorded), `CluesoEditor`, `AgentApp`. These are invented, not real Clueso screens — swap in real UI before publishing if accuracy matters.

Rendering note: keep zoom on 3D-transformed layers at ≤ 1×. Chrome rasterizes those layers at their own scale, so upscaling them blurs text. `Camera` in `ui.tsx` puts rotation on an outer layer and zoom in a 2D transform inside it for this reason.

## Clueso MCP — 45s (`CluesoMCP45`, 1920×1080, 60fps)

| Time | Scene file |
| --- | --- |
| 0:00–0:04 | `ColdOpen.tsx` |
| 0:04–0:10 | `Problem.tsx` (dissolves into the next scene) |
| 0:10–0:18 | `Mcp.tsx` |
| 0:18–0:25 | `Describe.tsx` |
| 0:25–0:30 | `Ship.tsx` |
| 0:30–0:37 | `Proof.tsx` |
| 0:37–0:40 | `Offer.tsx` (10 free minutes of AI editing) |
| 0:40–0:45 | `Finale.tsx` (lockup + tagline, logo outro) |

To re-render only part of the video, render a frame range and join it onto the earlier render. Re-encode both parts to the same timescale first, or the concat demuxer mis-times the second part:

```console
npx remotion render src/index.ts CluesoMCP45 out/tail.mp4 --frames=2220-2699 --browser-executable=...
npx remotion ffmpeg -i out/previous.mp4 -frames:v 2220 -c:v libx264 -crf 12 out/head.mp4
npx remotion ffmpeg -i out/tail.mp4 -c:v libx264 -crf 12 -video_track_timescale 15360 out/tail-norm.mp4
npx remotion ffmpeg -f concat -safe 0 -i out/concat.txt -c:v libx264 -crf 16 out/final.mp4
```

Before publishing:

- The render is silent. Cuts are timed to the brief's beat map (drop at 0:10 = frame 600 at 60fps), so a track can be laid under it without re-timing.

### Changes needed for a 1080×1920 vertical cut

- `Problem`: stack the editor and docs panels vertically and whip-pan on Y instead of X.
- `Mcp`: move the agent tiles into a row above the chat panel instead of a column to its left.
- `Ship`: stack the three workflow cards vertically with downward arrows.
- `Proof`: switch the chip grid from 3×2 to 2×3 (or 1×6).
- `Describe`, `Offer`, `Finale`: narrow panels to ~960px wide and drop headline sizes ~15%.
- Captions sit at y≈820–950 today; move them to the lower third of the taller frame (~y 1500).
