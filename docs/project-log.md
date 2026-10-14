# Breeders project log

A running history of what was made, what was decided and why, so nothing depends on one machine.
Working notes (preferences, recipes, lessons) live in [`docs/claude-memory/`](claude-memory/). That folder is a copy of
Claude's memory for this project, refreshed whenever the log is updated.

## 2026-10-13 · Brand

- **Logo set.** The blue play-button "B" emblem (`#0067FC`) is traced from `logo/Blue Geometric Play Emblem.png` into
  `src/brand/emblem-paths.ts`. The emblem has five shards that can animate apart.
- **Wordmark.** "BREEDERS" is redrawn as vector geometry in `src/brand/Breeders.tsx`, because the source was a 453 px
  screenshot.
- **End card.** The shards assemble in the centre, then the wordmark wipes in. Every film imports its watermark and
  end card from `src/brand/Breeders.tsx`.

## 2026-10-14 · New references

- **What was added.** 97 videos and 19 images in `new references/`.
- **Where the notes are.** The learnings are in `docs/new-references.md`; the per-file notes are in
  `docs/new-references-catalog.md`.
- **Top picks.**
  - Wispr Flow: story structure.
  - OpenAI type specimen: Swiss type.
  - The exploded record player: technical breakdown.
  - The agent-as-machine piece.
  - The "Ma" and Replit one-colour films.
- **Audience.** Breeders is international: no Indian-language or India-only concepts.

## 2026-10-14 · Mustang (paused)

The idea: a red '67 Fastback on cream, coming apart and driving through many places, cut to music.

**What was built**
- **v1: Beat It.** The car was coded from scratch and rejected as toy-like.
- **v2: real model.** It uses Mark Peters' "1967 Ford Mustang Fastback" from Sketchfab (CC BY 4.0); see
  `public/mustang/CREDITS.md`.
  - The FBX was split into named parts in Blender (`scripts/mustang-convert.py`).
  - The car was repainted Candyapple Red with a BREEDERS plate (`scripts/mustang-textures.py`).
  - Poly Haven CC0 scans were used for roads and cliffs, with HDRI light.
- **v3: MustangBeatMe.** "Beat me, hate me" (They Don't Care About Us, via a gym-edit reference), one cut per lyric,
  12 places. Rendered in 4K.

**Feedback**
- The user judged it "10 years back".
- The car must be 20–40% of the frame.
- The places should be small floating islands like the reference stills.
- It needs more speed and better cuts.

**Next step when resumed**
- A Blender Cycles look test (`scripts/blender/mustang_look.py`).
- Cycles has to run on the CPU, because the MX250 driver is too old for Blender 5.2's CUDA.
- Open bugs: the tyres render white, and the shadow catcher is noisy.

**Refused:** a 3DStarving model ripped with 3D Ripper. It's paid work, so it can't be used.

## 2026-10-14 · Spotify Stems (delivered)

The film is a concept launch for a made-up Spotify desktop feature that splits any song into vocals, drums, bass
and melody. Final file: `out/SpotifyStems-4K.mp4` (kept local, not in Git).

**Music:** "Phonk" by The_Mountain (Pixabay), split with Demucs (venv in `D:\tools\demucs-venv`).
- `scripts/stems-analyse.py` drives the visuals.
- `scripts/compose-stems.mjs` remixes the stems like a live DJ set:
  - the drums pulled out underwater, then slammed back
  - a vocal chop on pads
  - a silent beat into the bass drop
  - a tape stop into the final drop

**Rules the user set**
- No large text: only the app's own small labels.
- Every final is 4K.
- Sound changes must build and pay off, never just switch layers on and off.

## Rendering on this laptop

The full recipe is in [`docs/claude-memory/feedback_render_on_request.md`](claude-memory/feedback_render_on_request.md).

- **Rendering:** render image sequences in pieces, each in a fresh browser, with concurrency 1.
- **Encoding:** encode 300-frame segments and join them losslessly, because ffmpeg runs out of memory after about 339
  4K frames.
- **Storage:** keep temp files on E:, and installs and caches on D:. C: is nearly full.
