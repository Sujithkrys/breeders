---
name: render-on-request
description: "Final videos are always 4K (user, 2026-10-14). Render only when asked; review in Studio and stills first. The chunked render recipe for this low-RAM laptop."
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4f638691-014a-49a2-b0db-ebd044a464bb
  modified: 2026-10-14T08:57:28.954Z
---

**Every final video is 4K** (3840×2160, `--scale=2`). The user said "our video should be 4k everytime" on 2026-10-14. Don't hand over 1080p as the final.

Still render only when the user asks. Until then, keep changes reviewable in Remotion Studio (port 3011) and check them yourself with stills.
- Start Studio detached: `Start-Process cmd.exe -ArgumentList '/k','cd /d E:\Breeders && npx remotion studio --port=3011'`. Port 3000 belongs to another app; 3001 is the user's E:\AgentV project.

**Why:** the laptop (MX250 2 GB, 8 GB RAM, often <500 MB free) can't do a one-shot render. Chrome runs out of memory, and x264 at 4K fails to allocate memory when it runs beside Chrome.

**How to apply (the recipe that works):**
1. Render image sequences in pieces of about 100–150 frames, each a fresh `npx remotion render <Comp> <dir> --sequence --image-format=jpeg --jpeg-quality=95 --frames=a-b --scale=2 --concurrency=1`. Retry each piece up to 3 times. The output dir must have no dots in its path (not out/.tmp/...).
2. For WebGL films, split pieces at shot boundaries, and check frames aren't blank (no car pixels means WebGL failed). Heavy scanned-model shots may need about 10-frame sub-pieces.
3. Encoding: ffmpeg on this machine dies with "Cannot allocate memory" after about 339 4K frames in one encode, whatever the input method. So:
   - Put all frames in one numbered sequence (`seq/%04d.jpeg`).
   - Encode **300-frame segments** (`-start_number N -frames:v 300`, `-preset medium -crf 16 -threads 2 -x264-params rc-lookahead=10:ref=3:keyint=60`).
   - Join them with the concat demuxer and `-c:v copy` (concat lists use `E:/` paths, not `/e/`), adding the mix wav with `-c:a aac -b:a 320k -shortest`.
4. Keep temp files on E: (`TEMP/TMP=E:\Breeders\out\.tmp`).
5. For DOM films, avoid 3D tilt at deep camera zooms (>~3×), or Chrome rasterises the whole magnified page.

Related: [[discuss-before-building]], [[use-d-drive]].
