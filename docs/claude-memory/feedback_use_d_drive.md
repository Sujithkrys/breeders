---
name: use-d-drive
description: "C: is full — all downloads, installs, caches, models go on D:; project files on E:\\Breeders"
metadata:
  type: feedback
---

The user's C: drive is full. Any new download, driver, tool install, model, package cache or large temp file goes on **D:** (e.g. D:\tools, D:\downloads, D:\whisper-models). Project files go inside E:\Breeders. Never use C:. (User re-confirmed and locked this rule 2026-10-14.)

**Why:** C: has no space left; renders once filled it until temp was moved to E:.
**How to apply:**
- Set install and cache paths explicitly: winget `--location D:\...`, `PIP_CACHE_DIR=D:\...`, npm cache on D:, HF_HOME on D:.
- Keep render temp AND all my own scratch/temp files (frame sheets, stills, test renders) on E:\Breeders\out\.tmp — never the C: AppData scratchpad.
- Low RAM (8 GB, ~0.5 GB free) and a full C: mean the pagefile can't grow: big models crash with mkl_malloc. Use faster-whisper "base" (in D:\whisper-models), not "small"; don't run heavy jobs in parallel.
- faster-whisper is installed; its models are in D:\whisper-models.

Related: [[render-on-request]].

- 2026-10-14: moved ~19 GB of caches off C: to D:\caches (old npm cache, uv cache with UV_CACHE_DIR set, .gradle with GRADLE_USER_HOME set). C: went from 0 to 18 GB free. Docker (30 GB) can only be moved by the user in Docker Desktop settings (disk image location).
