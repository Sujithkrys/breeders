# Analyses the four Demucs stems of the Phonk track (The_Mountain, Pixabay) for the Spotify Stems film:
# per-video-frame loudness of each stem (drives every pulse and glow), and a dense peak list per stem (draws the
# waveforms). Window: song 9.735s onward, so film beat 12 lands on the drop's first kick at 15.58s.
# usage: python scripts/stems-analyse.py <stem dir> <out.json>
import json, subprocess, sys
import numpy as np
SR, FPS, FROM, LEN = 22050, 30, 9.735, 40.0
src, out = sys.argv[1], sys.argv[2]
def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(FROM), "-t", str(LEN), "-i", f"{src}/{name}.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
res = {"fps": FPS, "from": FROM, "env": {}, "peaks": {}, "peakRate": 100}
for k in ["vocals", "drums", "bass", "other"]:
    x = load(k)
    hop = SR // FPS
    env = [float(np.sqrt((x[i:i + hop] ** 2).mean())) for i in range(0, len(x) - hop, hop)]
    m = max(env) or 1
    res["env"][k] = [round(v / m, 3) for v in env]
    ph = SR // res["peakRate"]
    pk = [float(np.abs(x[i:i + ph]).max()) for i in range(0, len(x) - ph, ph)]
    mp = max(pk) or 1
    res["peaks"][k] = [round(v / mp, 3) for v in pk]
json.dump(res, open(out, "w"))
print("frames", len(res["env"]["drums"]), "peaks", len(res["peaks"]["drums"]))
