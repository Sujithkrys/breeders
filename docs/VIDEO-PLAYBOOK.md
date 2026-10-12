# Video Playbook — how the Clueso MCP launch video was built

This is the complete record of how `CluesoMCP45` (final: **44s, 1920×1080, 60fps, stereo audio**) was made with Claude Code + Remotion in a cloud session, including the updated brief, the exact sound and music timeline, the audio pipeline, and the gotchas we hit. Use Part 3 as the starting prompt for new videos.

---

## Part 1 — The pipeline (what actually happens)

```
Brief (your prompt) ──► Claude writes Remotion code (React/TSX) ──► stills review ──► full render (mp4, silent)
                                                                                         │
Reference video (optional) ──► Claude analyzes it numerically ─┐                         │
Royalty-free samples (npm) ──► scripts/compose-audio.mjs ──────┴──► soundtrack.wav ──────┴──► ffmpeg mux ──► final mp4
```

1. **Setup (once):** `npx create-video@latest --yes --blank --no-tailwind <name>` → `npm install`.
2. **Brief:** give Claude the prompt (Part 2/3). Include logos as uploaded files.
3. **Build:** Claude writes one component per scene in `src/<video>/scenes/`, a `theme.ts` with colors + scene timings, shared helpers in `src/utils.ts`, and registers the composition in `src/Root.tsx`.
4. **Review without a browser:** in the cloud container there is no Remotion Studio you can open, so Claude renders **stills** at key frames, looks at them, fixes issues, then renders the full mp4 and sends it in chat.
5. **Iterate:** you give timestamped feedback ("0:18 too fast"); Claude edits and re-renders. For changes near the end only, Claude renders just that frame range and joins it to the previous render (much faster).
6. **Sound:** Claude cannot hear or generate audio with the model itself, so the soundtrack is **built by code** from royalty-free recorded samples (Part 4), mixed and mastered in a Node script, measured against a reference, then muxed onto the video with ffmpeg (no video re-render needed).

### Commands

```bash
npm run dev                                   # Studio (local machine only)
npx remotion render src/index.ts CluesoMCP45 out/video.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell   # cloud container
node scripts/compose-audio.mjs [path/to/unpacked/sample/packages]   # build the soundtrack
STEM=sfx node scripts/compose-audio.mjs       # SFX-only stem, for checking sync
npx remotion ffmpeg -i out/video.mp4 -i public/audio/clueso-mcp-45.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k out/final.mp4
```

---

## Part 2 — The updated brief (what the final video actually is)

This is your original brief, updated with every decision and change made during production. Paste it to reproduce or adapt this video.

```markdown
You are generating a 44-second, high-end SaaS launch video announcing Clueso MCP. Output production-ready
Remotion (React) code rendering 1920×1080 at 60fps. Author all timings in 30fps "units" (useT() helper) so fps
can change without re-timing. Comment the code by scene.

BRAND CONTEXT
Clueso turns screen recordings into polished product videos and docs. Clueso MCP is a hosted connector that lets
AI agents (Claude, ChatGPT, any MCP client) create and edit videos through conversation — no timeline editing,
no API keys. Core message: "Describe the video. Your AI agent builds it."

ASSETS (uploaded as PNG; trace to SVG paths, recolor the black wordmark to off-white for the dark background)
- Clueso full logo (gradient mark #F881E5 → #C93BB7 + wordmark)
- Claude mark and ChatGPT mark — monochrome off-white "works with" treatment, never larger than the Clueso mark
- Fonts: Inter (UI/body), Geist (headlines, 500–700, tracking −0.035em), Geist Mono (technical accents).
  Self-host from npm (@fontsource/inter, @fontsource/geist-sans, @fontsource/geist-mono) into public/fonts.

VISUAL IDENTITY
- Background: near-black charcoal #0B0B0E with a soft, slowly drifting magenta glow and a vignette.
- Realistic, detailed but fictional UI (no gray placeholder bars): a light-theme product "Acme Analytics"
  (Reports table, owners, statuses, Export button) as the thing being recorded; a detailed Clueso editor
  (script panel, preview, brand-kit panel, multi-track timeline); a generic AI-agent chat app with the
  Clueso connector and a live tool-call card. The Clueso UI is invented — replace with real screens if accuracy matters.
- Clueso effects are pink; the Acme product is blue (#2F5BEA) so the two brands never blur.
- 8px spacing grid everywhere.

STRUCTURE (44s)
0:00–0:04  Cold open — particles converge to a point of light; the Clueso mark swings in in 3D while its outline
           traces, locks at 1.47s with a horizontal light streak and a sheen. Headline: "Every feature ships with a video."
0:04–0:09  Problem — wide canvas with a traditional video editor (media bin, stuck "Rendering preview… 62%",
           cluttered timeline, editing clock racing) and a Help Center doc being typed with reviewer comments.
           Captions: "Record it. Edit it." → whip-pan (horizontal motion blur) → "Write the docs." → pull-out to a
           tilted split → FREEZE at 8.2s (desaturate, flash, punch) on "Repeat for every feature." Hold 0.8s.
0:09–0:17  What MCP is — single soft dissolve. The mark morphs into a chat-bubble connector card "Clueso MCP"
           (toggle flips to Connected, five tools cascade in: create_video, edit_video, add_captions,
           translate_video, create_article). Claude, ChatGPT and "Any MCP client" tiles dock from the left with
           curved connection lines and flowing particles. Captions: "MCP — the open standard that lets your AI
           agent plug straight into Clueso." → "One video engine. Any agent."
0:17–0:24  Payoff — agent chat: attached recording, prompt typed with human rhythm "Turn this into a feature
           announcement video", send, streaming reply, tool card with five steps ticking. Caption "Describe it."
           Then five fast camera cuts inside the Clueso editor (clips assembling, voiceover + karaoke captions,
           auto-zoom on Export with a cursor click, brand kit applied + title card, "Your video is ready").
           Caption "It builds it."
0:24–0:29  Workflow — three cards on a tilted plane, camera tracking: ticket moves to Done → video generates
           (progress ring → play) → posted to #product-launches with reactions.
           Caption "Ship a feature, ship its video — automatically."
0:29–0:36  Use cases — six cards with live mini-thumbnails fly in from depth 0.15s apart: Feature launches,
           Support videos, Sales recaps, Training, Onboarding, Translations (captions cycle ES/FR/DE).
0:36–0:39  Offer — "Now on Clueso" chip, ring timer counting 0→10 MIN.
           "10 free minutes of AI editing." / "Connect your AI agent and start building — on us."
0:39–0:44  Finale — Clueso lockup with sheen, tagline "Describe the video. Your AI agent builds it." and
           clueso.io/mcp; text drops away, wordmark retracts into the mark, mark centers and flares with the
           same light streak as the opening (bookend) at 42.93s, fade to black.
No testimonials.

MOTION LANGUAGE
- Hard cuts everywhere except one dissolve (Problem → MCP). Continuous camera moves; nothing sits still.
- Text: words rise out of a mask while sharpening from blur (not bouncy).
- Cursor with ease-in-out paths, press + ripple on click. Streaming text for AI replies.
- Crispness rule: never scale up a 3D-transformed layer (Chrome rasterizes it at 1× and blurs). Keep 3D rotation
  on an outer layer and zoom as a 2D transform inside; drop per-element 3D transforms once animations settle.

SOUND — see Part 4 (music built from royalty-free samples at 120 BPM so every cut lands on the beat;
effects are few, recorded, and placed on exact visual frames).

DELIVERABLE
Render 1920×1080 60fps. Verify with stills before full renders. Note changes needed for a 1080×1920 vertical cut.
```

---

## Part 3 — Reusable template prompt for new videos

Fill the brackets. The more exact the scene timings and copy, the fewer correction rounds.

```markdown
Build a [DURATION]s product video in Remotion, 1920×1080, 60fps (author timings in 30fps units).
Reuse src/utils.ts (easings, springs, useT, Seq, fonts) and src/clueso-mcp/ui.tsx patterns (Camera, Reveal,
Panel, Cursor, Scrim). Put the video in src/[video-name]/ with theme.ts (colors, SCENES timings) and one file
per scene; register it in Root.tsx.

BRAND: [company, product, one-line message]. Logos attached: [list]. Colors: [hex]. Fonts: [names].
STYLE: [dark/light], [reference videos you like and what you like about them].
UI: [real screenshots attached] OR [invent realistic fictional UI for: ...].

SCENES (start–end, what's on screen, exact on-screen text, motion):
0:00–0:0X  ...
...

TEMPO: [BPM, e.g. 120 so a bar = 2s] — place every cut on a bar or beat.
SOUND: follow docs/VIDEO-PLAYBOOK.md Part 4 — music from royalty-free samples in scripts/compose-audio.mjs,
recorded SFX only on real on-screen actions, every cue on its exact visual frame, verify with STEM=sfx.
REFERENCE AUDIO (optional): [attach mp4] — analyze its structure (section loudness, band balance, where hits land)
and match it; do not copy its audio.

PROCESS: render stills at key frames and check them before full renders; send me the mp4 each round.
```

**Tips that saved rounds on this project**
- Give reference videos early — the Kimi K3 reference changed the whole sound approach.
- Say what to keep ("keep the music, change only the SFX").
- Timestamped feedback is the fastest ("0:08 hold too long").
- If only the ending changes, ask for a partial render + join (see Part 5).

---

## Part 4 — Sound: the process, the music, and every cue

### Why a process is needed
The model writes code and text; it does not produce audio. And in this cloud container, music/SFX websites
(Pixabay, Freesound, ElevenLabs…) are blocked by the network policy. So the soundtrack is **composed by code**
(`scripts/compose-audio.mjs`) from **royalty-free recorded samples installed from npm**, then mixed and mastered
in the same script, and muxed onto the video with ffmpeg.

### Sample sources (all royalty-free; files copied into `assets/samples/`)
| Source | npm package | License |
| --- | --- | --- |
| Sonic Pi sample library — kicks, snaps, hats, swooshes, impacts, cinematic boom, UI blips, textures | `supersonic-scsynth-samples` | CC0 (public domain) |
| Salamander Grand Piano V3 (real concert grand) | `@audio-samples/piano-mp3-velocity8`, `-velocity12` | CC BY 3.0 — **credit required** |

Credit line for the video description: *"Piano: Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0."*

Get them with `npm pack <package>` and unpack; run `node scripts/compose-audio.mjs <unpacked-dir>` once to copy
the used files into `assets/samples/`.

### How the reference was used (Kimi K3 launch video)
The reference mp4 was analyzed numerically (Claude can't listen): onset detection per frequency band, tempo,
loudness per section, band balance, stereo width, and frames pulled at every sound onset. Findings that shaped the mix:
- Highlights come from the **music's structure** (drops, breakdowns, returns), with cuts on the beat.
- Added effects are **few, short, crisp, recorded** — mainly clicks on real UI actions (e.g. the send button).
- Quiet sections (title, ending) are **piano/mid-range led and ~5–8 dB below** the grooves.
- Loud master: about **−14 dBFS RMS**, peaks near 0 dBFS.

### Music (120 BPM, A minor, Am–F–C–G, bar = 2s) — final 44s timeline
| Time | Section | What plays |
| --- | --- | --- |
| 0:00–0:04 | Intro | Solo grand-piano motif, supersaw pad with filter opening, soft glass texture |
| 0:04–0:08.2 | Build | Kick (half-time → four-on-the-floor at 0:06), finger snaps from 0:06, hats, sub pulses, piano stabs, snare roll 0:07–0:08.2 |
| 0:08.2 | Freeze | Music **stops dead** on "Repeat" (reverb tails ring) |
| 0:08.25–0:09.0 | Swell | Reverse piano chord drawn into the drop |
| 0:09.0–0:17 | Groove A | Kick (bd_haus + bd_pure), snaps + snare on 2 & 4, swung 16th hats, open hat, sub bass line, piano stabs + motif, splash on the drop, kick sidechain pump |
| 0:17–0:21 | Breakdown | Piano motif + low piano chords + snaps, soft hats; ~−19 dB (like Kimi's title break) |
| 0:21–0:35 | Groove B | Full groove + ride; splash at 0:21 |
| 0:35–0:37 | Dip | Everything low-pass muffled, opens up at 0:36.6–0:37; splash at 0:37 |
| 0:37–0:39 | Return | Full groove under the "10 free minutes" landing |
| 0:39–0:42.9 | Outro | Piano motif + pad, quiet (Kimi-style ending) |
| 0:42.93 | Final chord | Big A-minor grand-piano chord + sub, rings out, fade by 0:44 |

### Sound effects — every cue (final 44s timeline, all placed on exact frames)
| Time | Visual moment | Sample (Sonic Pi) |
| --- | --- | --- |
| 0:01.47 | Logo locks | `misc_cineboom` (peak-aligned, it swells in for 3.36s) + `perc_impact2` |
| 0:05.77 | Whip-pan at max camera speed | `perc_swoosh`, panned right → left |
| 0:05.95–0:07.10 | Docs typing | `tbd_perc_tap_1/2` ×6, soft |
| 0:07.73 | Pull-out to split, fastest point | `ambi_swoosh` (peak-aligned) |
| 0:08.20 | Freeze on "Repeat" | `perc_impact1` |
| 0:10.43 | Toggle → Connected | `elec_tick` |
| 0:10.53 / 0:10.83 / 0:11.13 | Claude / ChatGPT / + tiles dock | `elec_plip` ×3, panned left |
| 0:17.2–0:18.4 | Prompt typing (synced to the on-screen typing rhythm) | `tbd_perc_tap_1/2`, soft |
| 0:18.53 | Prompt sent | `elec_blip` + `perc_swash` |
| 0:19.67–0:20.53 | Tool steps complete | `elec_tick` ×5, rising |
| 0:20.67 | Fast-forward build begins | `perc_swash` |
| 0:22.33 | Cursor clicks Export | `elec_tick` |
| 0:23.47 | "Your video is ready" | `elec_chime` |
| 0:24.50 | Ticket → Done | `elec_tick` |
| 0:26.07 | Generated video ready | `elec_ping` |
| 0:29.13–0:29.88 | Six use-case cards land | `tbd_perc_tap_1` ×6, panned by column |
| 0:36.25–0:37.15 | Counter climbs | `elec_tick` ×10, rising |
| 0:37.18 | Counter hits 10 | `elec_bell` + `elec_chime` |
| 0:42.93 | Final logo flare | `misc_cineboom` (peak-aligned) |

The SFX bus sits ~4.6 dB above the music bus sends so effects read clearly over the loud master.

### How sync is guaranteed
- Cue times are computed from the **animation code** (scene start + in-scene unit ÷ 30), not guessed.
- Samples that build up (booms, swooshes) are placed by their **measured peak**, not their start.
- Typing sounds replay the same seeded random rhythm the typing animation uses (`random()` from Remotion).
- `STEM=sfx node scripts/compose-audio.mjs` renders effects alone; onset/peak detection confirms each cue lands
  within a few milliseconds of its frame.

### Mixing and mastering (inside the script)
Buses: kick, drums, bass, pad, keys, texture, sfx → automated low-pass filters per section → kick-keyed sidechain
pump on pad/bass/keys → dotted-8th ping-pong delay on piano → stereo reverb send → high-shelf "air" lift →
2:1 glue compressor → loudness normalize to ~−14 dBFS RMS → 5ms-lookahead limiter at −1 dBFS.

### Reusing it for a new video
Change in `scripts/compose-audio.mjs`: the chord progression/tempo if needed, the section function (`SECTION`)
to match your scenes, and the SFX cue list (compute times from your scene timings). Run, check the stem, mux.

---

## Part 5 — Gotchas we hit (and fixes)

| Problem | Fix |
| --- | --- |
| No live Studio preview in the cloud | Review rendered stills + mp4 sent in chat |
| Remotion can't download Chrome in the container | `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` |
| Music/SFX sites and clueso.io blocked | Upload files in chat, or use npm sample packages |
| `⌘`, `→`, emoji render as boxes | Font subsets lack them — use `/`, `›`, plain text |
| Blurry UI when zooming 3D-tilted layers | Rotation on outer layer, 2D zoom inside; never upscale composited layers |
| Only the ending changed | Render `--frames=<start>-<end>`, cut the old head with `-frames:v`, re-encode both parts with the same settings and `-video_track_timescale 15360`, then concat |
| Joined file had wrong duration | Parts had different timebases — normalize timescale before concat |
| Remotion's bundled ffmpeg is minimal | No `f32le` / some filters — decode to WAV and process in JS |
| Sound effects felt fake | Fewer, recorded, frame-exact sounds; let the music carry the highlights |

## Files
- `src/clueso-mcp/` — the video (theme, scenes, mock UIs, audio component)
- `src/utils.ts` — reusable helpers
- `scripts/compose-audio.mjs` — soundtrack composer/mixer
- `assets/samples/` — samples + `LICENSES.md`
- `public/audio/clueso-mcp-45.wav` — the rendered soundtrack (44s)
