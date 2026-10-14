---
name: typography-realism-first
description: "Type (font/size/alignment/tracking/leading) decides quality — match Pine Pro's type exactly; realistic, isolated UI elements over drawn/cheap graphics; calm readable shots"
metadata:
  type: feedback
---

**Typography makes or breaks the video.** Font choice, size, alignment, letter spacing and line spacing matter most. Design the type system first, deliberately, and match the reference films' type exactly: sizes relative to the frame, tracking and placement.

**Pine Pro is the benchmark film** (src/pine-launch, src/pine-pro; kit in src/pine-launch/kit.tsx, theme.ts). When the user says "Pine's font and sizes", use exactly these:

| Use | Font and size | Notes |
|---|---|---|
| Big block words | Inter Tight Bold 300px | −0.045em tracking |
| Words on dark | Inter SemiBold 66px | White, a new word every ~5 units |
| Agent steps | Inter 36px | With 42px app icons |
| Answer text | Inter 30px | Line-height 1.45 |
| Composer prompt | Inter 19px | Camera at 2.2–2.9× |
| Toggle labels | Inter Medium 50px | |
| Small labels | Inter 15–19px | #8F8F8F |

**Realism and clarity (lessons from many rejected Claude Sonnet versions):**

Rejected:
- flat colours
- heavy bouncy type
- artificial UI mocks
- full-screen "screen-recording" app shots
- 3D without soul
- too-fast unclear cuts
- copying Pine shot-for-shot

Approved:
- isolated UI elements, big on clean backgrounds
- calm shots of 2.5–4s, each readable
- outputs shown full screen as designed pieces
- our own design built on Pine's qualities: real, tangible, bold brand colours, rhythm, rich sound

**Why:** the Pine film worked because of tight cuts, strong type and rich sound. Hand-drawn stand-ins looked cheap.
**How to apply:**
- Start from look frames (stills) for sign-off.
- Spend the effort on type, cutting and sound.
- Use drawn graphics only as accents.

Related: [[discuss-before-building]], [[no-serif-fonts]], [[made-in-claude-only]].
