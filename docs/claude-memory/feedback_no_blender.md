---
name: no-blender
description: "Don't use Blender — renders too slow; do high-end 3D in Remotion (Three.js / @remotion/three) so it previews live in Studio"
metadata:
  type: feedback
---

The user rejected Blender because "it takes so much time to render" (about 5–20s per frame on the laptop's MX250).

**Why:** fast iteration matters more than offline render quality, and the user believes high-end motion graphics can be done without Blender.
**How to apply:**
- Build everything in Remotion.
- For a 3D look use real-time WebGL (Three.js through @remotion/three: PBR materials, environment reflections, soft shadows), plus CSS 3D, canvas and SVG. An example is src/claude-sonnet/three.tsx.
- Everything must preview live in Studio.
- WebGL stills need `GL=angle`.
