---
name: breeders-page
description: "Breeders — Instagram motion-design page the user runs with a friend; code-built Remotion films, horizontal 16:9, ≤30s; repo Sujithkrys/breeders (private), local E:\\Breeders"
metadata:
  type: project
---

Breeders is the user's Instagram page, run with a friend. It posts motion-design videos built entirely as Remotion code: concept launch films for AI products and apps, "made in Claude". Repo: github.com/Sujithkrys/breeders (**private**); local copy: E:\Breeders.

**Format:**
- **Horizontal 1920×1080 only**, **≤30 seconds**, more motion graphics and more cuts, premium.
- The user films the finished video off the monitor with a phone (so it posts as a phone-native clip) and writes the hook text in Instagram.
- No mascot and no comment call-to-action. Every film carries the small Breeders credit at the bottom centre and ends on the 3s Breeders end card.

**Brand:**
- Everything lives in `src/brand/Breeders.tsx`: `Watermark`, `BrandAvatar` (profile picture in mock UIs), `BreedersOutro` + `OUTRO_LEN` (end card), `ACCENT`.
- **Logo set 2026-10-13** (sources in E:\Breeders\logo): blue play-button "B" emblem (#0067FC) traced into `src/brand/emblem-paths.ts` (5 shards, animatable via `Emblem piece=`), and the stemless geometric "BREEDERS" wordmark redrawn as vector in `Wordmark` (source was a low-res 453px screenshot). `Lockup`, `Mark`, `BLUE` also exported. End card: shards assemble centre, row slides left as the name wipes in. Review sheet: `LogoCheck` composition. Awaiting the user's feedback on the Apple Pay end card.

**Voice:** the narrator is the user's ElevenLabs voice "Bunty – Warm and Clear". Voice takes live under public/<film>/.

**Open items (2026-10-12):**
- Add the Breeders watermark to PineLaunch46, PinePro25, CluesoLaunch47 and CluesoMCP45, which have no credit yet.
- Render 4K finals when the user asks.
- Apple SF Pro fonts (assets/fonts, public/fonts/sf) stay local only, because Apple's licence forbids sharing them. The Apple Pay film needs them, so a fresh clone can't render it until they are installed locally.

**Why:** short, phone-filmed ≤30s clips with strong hooks get reach; long uploads didn't.
**How to apply:** default to 1920×1080, ≤30s. The video is filmed off a screen, so use big, high-contrast type, keep key action near the centre, show a new visual every 1–2s, and put nothing important in tiny text. See [[discuss-before-building]], [[typography-realism-first]], [[made-in-claude-only]].
