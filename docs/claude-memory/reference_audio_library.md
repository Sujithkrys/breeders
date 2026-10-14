---
name: audio-library
description: "E:\\Breeders\\audio music/SFX library — which tracks are Instagram-safe, best SFX, and the compose-script pattern"
metadata:
  type: reference
---

The audio library is in `E:\Breeders\audio`: music/ and sfx/, about 680 files.

**Music that's safe to use** (royalty-free):
- `music/musicdream-dramatic-cinematic-documentary-609202.mp3` (Pixabay). This is Pine Pro's track.
  - 136 BPM; one beat is 0.441s.
  - Drops at 42.381s and 102.380s; a silence break at 39.5–41.5s; the ending tail starts at 190.6s.
  - Films usually start it at 102.38s so the second drop lands on frame 0.
- `sfx/mixkit-*` tracks (driving-ambition, trap, we-own-the-night, zay-zay, purple-js, eyes-in-the-puddle).
- Caleb Arredondo "Echo Sax End" (free with credit; confirm the terms).

**Not safe** (copyrighted; Instagram will likely mute or block the post): The Weeknd, Oppenheimer, Tyler the Creator, the phonk tracks (SLAY, GOAT, Andromeda, Luna Bala, Manasha, SKAI), the Blade Runner synthwave, Liga Mejores.

**Best SFX:**
- Impacts and booms: Grand Hit A/B, Universe Boom A/B, 05 Impact, Drop Disto Sub 1, Subdrop Low/*, Cinematic Sub Drop/*, Epic Cinematic Trailer Impact Pack 2.
- Whooshes: Swishes/* (Short whip, Sharp swoosh, Golden swoosh, Future zing, Fast swish), the Cinematic Whoosh packs.
- UI sounds: Digital HUD Interface Sounds/*, Clicks/*, Mouse Click, keyboard-typing-5997, Iphone Send, Message sound, Pop 1, Pop Bubble.
- Other: Glitch transition sounds, ES_Riser Suction 5, Bells/*, Lens flare transition.
- Skip the meme sounds.

**Compose-script pattern** (e.g. scripts/compose-sonnet-demo.mjs, compose-guava-pro.mjs):
- Decode with ffmpeg; buses MUSIC, FX, BIG and VOICE.
- `hit()` places each sound so its peak lands on the frame; `at()` plays from the file's start.
- Big hits dip the music; the voice ducks everything else.
- Then a compressor, loudness normalised over the body, and a lookahead limiter.
- Output is public/<film>/…mix.wav, which the composition plays with `<Audio>`.
- Every film ends with the Breeders end-card sounds (05 Impact + Golden swoosh + bells).

Related: [[instagram-reference-learnings]].
