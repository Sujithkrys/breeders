# Low-memory Demucs stem split for this laptop: one thread, 4 s chunks, written straight to wav.
# usage: python scripts/stems-split.py <in.wav> <out dir>
import os, sys
import numpy as np
import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model

torch.set_num_threads(1)
torch.backends.mkldnn.enabled = False  # oneDNN segfaults when this laptop is low on RAM
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
model = get_model("htdemucs")
model.eval()
wav, sr = sf.read(src, dtype="float32", always_2d=True)
x = torch.from_numpy(wav.T.copy())
ref = x.mean(0)
x = (x - ref.mean()) / (ref.std() + 1e-8)
with torch.inference_mode():
    y = apply_model(model, x[None], segment=4.0, overlap=0.1, split=True, shifts=0, num_workers=0, progress=False)[0]
y = y * (ref.std() + 1e-8) + ref.mean()
for name, stem in zip(model.sources, y):
    sf.write(os.path.join(out, f"{name}.wav"), stem.numpy().T, sr)
print("ok", src, model.sources)
