---
name: threeui
description: "ThreeUI (threeui.com, Meng To): Three.js component library reviewed 2026-10-13; reference only, don't buy or copy; the cut-plane build test was rejected"
metadata:
  node_type: memory
  type: reference
  originSessionId: 717e9ac4-0f92-4c9e-b386-e378d7feb5f1
  modified: 2026-10-13T15:58:40.653Z
---

ThreeUI (threeui.com, by Meng To / Design+Code) is a library of more than 100 Three.js components and landing sections. A few are free; the rest need Pro, which costs $199 a year or $299 lifetime.

The user asked about its "Country Towers" page (/three-js/japanese-tower). The original source is github.com/MengTo/towers (public, **no licence** = all rights reserved); its README explains the techniques in detail.

**Verdict (2026-10-13): reference only.**
- Its textures were made with GPT Image 2, which breaks [[made-in-claude-only]].
- The code is real-time: rAF, performance.now and unseeded Math.random, on Three.js r149. It would need rewriting to be frame-driven for Remotion ([[no-blender]], live preview).
- Using it would make the film "made in ThreeUI", not ours.

**Technique (tried and rejected by the user), the cut-plane build:**
- The whole model exists from frame one.
- A downward-facing THREE.Plane rises through it, and every material uses `clippingPlanes` (`renderer.localClippingEnabled = true`).
- A cap mesh at the plane's height makes the cut read as solid material.
- Scaffolding/wireframe ignores the plane and stays one step ahead.
- A stage caption and a big completion % sit in the corner, with build SFX per stage.

**Rejected:** a 6s test (a phone on a plinth building itself, a hot cut face, a big %) was built on 2026-10-13. The user called it the worst and it was deleted. Don't pitch the cut-plane build again unless the user brings it up.

**ThreeUI components worth studying for AI films:**
- Retro Metallic → Agent Selector (chrome shift gate across models and effort levels)
- Isometric Illustration (search, phone, browser)
- Grid Illustrations → Charts
- Structure Flow (particle sphere, dot matrix, data field)
- Warp Field / Keycap Drift
- Hourglass Loader → Keyboard (types LOADING)
- App Orbit (glass app icons)
- Halftone Keyboard → CRT

Related: [[bencho-finds]], [[breeders-films]].
