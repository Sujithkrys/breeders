---
name: breeders-films
description: "Which films exist in E:\\Breeders, where they live, their state, and the last one built (Claude Sonnet 5.5 demo)"
metadata:
  type: project
---

Films in E:\Breeders, as of 2026-10-12. Each one ends on the Breeders end card:

| Composition | Folder | Sound script | Notes |
|---|---|---|---|
| GeminiArgon | src/gemini-argon | compose-argon.mjs | "Gemini 4 Argon" concept launch, ChatGPT-Work style, voiceover |
| ApplePayIndia | src/apple-pay | compose-applepay.mjs | Dot-matrix world, no voice; needs the local SF fonts |
| GuavaCooked60, PineCooked | src/guava, src/pine-cooked | compose-guava-pro.mjs, compose-pine-cooked.mjs | "Motion designers are cooked": Claude builds a launch film; narrated |
| SarvamLive60 | src/sarvam-live | compose-sarvam-live.mjs | Content Studio launch; voice in public/sarvam-live/voice.mp3 |
| PineLaunch46, PinePro25 | src/pine-launch, src/pine-pro | | **The benchmark films** |
| CluesoLaunch47, CluesoMCP45 | src/clueso-launch, src/clueso-mcp | | |
| ClaudeSonnetDemo | src/claude-sonnet/SonnetDemo.tsx | compose-sonnet-demo.mjs | The current Claude Sonnet 5.5 30s product demo |

**ClaudeSonnetDemo details:**
- Look frames approved: SonnetDemoFrames.
- Shots: announce → model toggle → prompt close-up → steps → answer card → deck full screen → Goa trip plan → stats on colour blocks → name.
- Facts are from Anthropic's Sept 28, 2026 announcement:
  - 30%+ faster than Sonnet 5
  - up to 30% less per task, same price ($2/$10 per million tokens)
  - Terminal-Bench 4.0 70.6% (Sonnet 5: 10.3%)
- A half-resolution preview was shown to the user; awaiting their notes.

**Earlier rejected Claude attempts** (ClaudeSonnet, ClaudeSonnet28, ClaudeSonnet30, ClaudeDemo30, SonnetStyle) remain in src/claude-sonnet for reusable parts: DeckFilm in ClaudePine.tsx, WebsiteOut/SalesOut/TripOut in Demo.tsx, and three.tsx.

**How to apply:** facts in films must be verified from official sources; example data is labelled as such. Related: [[breeders-page]], [[typography-realism-first]].

**MustangBeatIt (in progress, 2026-10-14):** the user's idea. A Candyapple Red '67 Fastback on a cream background, about 40% of the frame wide. It comes apart into parts, snaps back together, then drives with stunts (race track with red/white kerbs, winding desert road, cliff road). Cut to Michael Jackson "Beat It" (audio/music/Michael Jackson - Beat It.mp3).
- The user says Instagram allows the song, so bake it in.
- Beat It runs at 138.7 BPM: beat 0.4326s, bar 1.73s, first beat at 0.163s. The full band enters at about 24s.
- The user's 5 look references are in the conversation (photoreal red Fastback on cream).
- My code-built car (src/mustang/body.ts, car.tsx, Frames.tsx) was rejected as "absolutely shit"; it looked like a toy.
- The car now in use is Mark Peters' "1967 Ford Mustang Fastback" from Sketchfab (CC BY 4.0, legit download). The credit line is required on every post.
  - Converted by scripts/mustang-convert.py (Blender CLI) into public/mustang/mustang.glb, with named parts: shell, glass, nose, tail, trim, trimL, trimR, wheelFL/FR/RL/RR (hub pivots).
  - Repainted red by scripts/mustang-textures.py into public/mustang/tex.
  - Loaded by src/mustang/real.tsx; look frames comp is MustangRealFrames.
  - The model has no interior or underside.
- A ripped 3DStarving model (from 3D Ripper) was refused as pirated; the user accepted that.
- Render stills one process each. The ThreeCanvas only redraws on a frame change, so async-loaded models must call advance() before continueRender (done in useRealCar).
- 2026-10-14: the three road worlds are built in src/mustang/world.tsx with look frames in MustangWorldFrames:
  - race track: kerbs, edge lines, barrier
  - desert S-road: yellow centre lines, sand shoulders, boulders
  - cliff road: guardrail and scanned cliffs
  - CC0 Poly Haven scans live in public/mustang/ph (asphalt_track, asphalt_02, sandy_gravel_02, namaqualand cliffs and boulders, wild_rooibos_bush) and are loaded via src/mustang/assets.tsx (useSurface / useModel, which hold the render and advance()).
  - The rooibos bush renders as black silhouettes, so it isn't used.
  - Fog in the CREAM colour fades every world into the page.
  - Cameras are set in the car's frame ([ahead, left, up]); the car drives toward camera.
- 2026-10-14: the full film is built. Composition **MustangBeatIt** (src/mustang/Film.tsx) runs 15 bars (25.96s) plus a 3s outro, at 30fps.
  - Sound: scripts/compose-mustang.mjs writes public/mustang/mix.wav, with Beat It from 11.844s. Bar 7 (12.11s) is the slam on the band entry.
  - Shots, by bar:
    - 0–1: hero
    - 2–3: parts leave, one per beat
    - 4–5: exploded orbit / top-down
    - 6: riser
    - 7: slam
    - 8: low track pass
    - 9: track bend
    - 10: desert S
    - 11: side tracking
    - 12: cliff
    - 13: drift, then jump
    - 14: studio stop and "Beat it."
  - The outro carries the CC BY car credit.
  - Awaiting the user's review in Studio.
- 2026-10-14, v2 after the user's feedback ("not premium, parts too slow, remove left text, many more cuts and places, better motion"):
  - The breakdown is now one cut: burst on beat 8, slam home on beat 12 = the band entry. The song starts at 18.766s.
  - 22 drive cuts, every 2 beats, across 7 places: circuit, desert, canyon, coast, salt flat, hairpins, bridge.
  - Whip-pan SVG blur on the cuts, speed ramps, small place tags.
  - New look: Poly Haven HDRIs in public/mustang/hdri, bloom and neutral tone mapping (look.tsx), CSS grain and vignette (FilmFinish).
  - Postprocessing DepthOfField makes the canvas opaque, so it isn't used. The canvas stays transparent over the CSS cream.
  - The user chose to upgrade three.js over Blender rendering.
- 2026-10-14, v3 **MustangBeatMe** (src/mustang/BeatMe.tsx; sound from scripts/compose-beatme.mjs into public/mustang/beatme-mix.wav):
  - The user switched to the "Beat me, hate me" verse of MJ "They Don't Care About Us". The audio comes from the gym edit reference (#81, saved as audio/music/beat-me-verse (gym edit reference).wav); the user will tag and credit the owner.
  - The two slurs are muted under impacts.
  - One cut per lyric phrase (word times in the W const); 14.1s + 3s BREEDERS outro.
  - The car is kept small (~1/5 of the width) like the references. The plate now reads BREEDERS (painted in scripts/mustang-textures.py).
  - New worlds: drag strip with start lights and smoke, wet road with rain and spray, tunnel, red dunes, bridge ramp.
  - The snow pass was dropped: procedural peaks looked blocky, and tinting the scanned rock white doesn't work (the tint multiplies the brown texture).
- 2026-10-14, **Mustang project paused by the user** ("leave this project, we will do later").
  - The 4K render of MustangBeatMe (out/MustangBeatMe-4K.mp4) was judged "worst". The feedback:
    - The car must be 20–40% of the screen.
    - Scenes should be small floating islands on cream like the references, not full-frame worlds.
    - The car should be faster, the cuts better.
    - The browser 3D looks "10 years back".
  - Next step when resumed: the Blender Cycles look test in scripts/blender/mustang_look.py (hero + track island; composited over cream by scripts/blender/over_cream.py).
  - Cycles must run on the CPU: the MX250 driver is too old for Blender 5.2 CUDA. That costs about 5 min per 1080p frame at 96 samples.
  - Lighting that worked: an even white world for diffuse, the studio HDRI only for glossy rays (Light Path "Is Glossy Ray"), plus an overhead area light, at exposure about -0.5 to -1.2.
  - Open bugs: tyres render white (testing whether the wheel normal map is the cause), and speckle noise on the shadow catcher (needs more samples or clamping).

**SpotifyStems (built 2026-10-14):** a concept launch for a made-up "Stems" feature in the Spotify desktop app (split any song into vocals, drums, bass and melody; solo, mute, 0.75× speed).
- Code: src/spotify-stems (ui.tsx = rebuilt desktop UI; StemsFilm.tsx = shots and camera); composition SpotifyStems; 27.3s + 3s outro.
- The user asked for **no large text**. Only the app's own small labels, plus "Stems · Concept" at the end.
- Music: "Phonk" by The_Mountain (Pixabay, audio/music/the_mountain-phonk-phonk-music-496450.mp3), 123.18 BPM, drop at 15.066s.
  - Split with Demucs, installed in the D:\tools\demucs-venv venv, with model weights in D:\torch-cache; stems in out/stems/htdemucs/phonk48.
  - scripts/compose-stems.mjs remixes the stems so the solos, mutes and slow-down are real. scripts/stems-analyse.py writes analysis.json (per-frame envelopes and peaks).
- Chrome runs out of RAM at concurrency 2 on this laptop; render with --concurrency=1.
- **v2 (DJ-set middle) delivered in 4K as out/SpotifyStems-4K.mp4.**
  - The user found the solo/mute/slow-down sections irritating, so the middle became a DJ set: drums pulled out underwater (low-pass) and slammed back on b28, a vocal chop on pads (b32–40), one silent beat, the bass drop on b41, a tape stop into the final drop on b44.
  - The song start was corrected to 9.735s (the drop's first kick is at 15.59s, not 15.07s).
  - A 9.2s visual sync offset was fixed.
