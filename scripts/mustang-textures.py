# Prepares the Mustang's textures for the browser: 2K, glTF-packed metal/rough, and the paint recoloured.
# The source paint is near-black (lum ~6, roughness ~12 of 255); those pixels become Candyapple Red, keeping the
# texture's own shading variation. Everything else (chrome, rubber, lenses, badges, plates) is untouched.
# usage: python scripts/mustang-textures.py <textures dir> <out dir>
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
S = 2048
PAINT = np.array([160, 18, 27], np.float32)  # Candyapple Red, sRGB

def load(name, mode="RGB"):
    return Image.open(f"{src}/{name}").convert(mode)

def save(arr_or_img, name):
    im = arr_or_img if isinstance(arr_or_img, Image.Image) else Image.fromarray(arr_or_img)
    im.resize((S, S), Image.LANCZOS).save(f"{out}/{name}", optimize=True)

# The source plates read "MPETERS 67" (Texas). Both sit in the atlas rotated 90 degrees clockwise; each is
# repainted as a plain yellow plate reading BREEDERS, same size, rounded corners and bolt holes.
PLATES = [(1348, 768, 1435, 1017), (0, 2044, 97, 2293)]  # x0, y0, x1, y1 in the 4096 atlas
def plate_image(w, h):
    im = Image.new("RGB", (w, h), (236, 182, 26))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((2, 2, w - 3, h - 3), radius=h * 0.12, outline=(40, 34, 20), width=max(2, h // 30))
    for bx in (0.12, 0.88):
        for by in (0.16, 0.84):
            d.ellipse((bx * w - 4, by * h - 4, bx * w + 4, by * h + 4), fill=(150, 150, 150))
    size = int(h * 0.62)
    while True:  # largest size that leaves a margin either side
        f = ImageFont.truetype("bahnschrift.ttf", size)
        f.set_variation_by_name("Bold")
        tw = d.textlength("BREEDERS", font=f)
        if tw <= w * 0.8 or size < 8:
            break
        size -= 1
    top, bottom = f.getbbox("BREEDERS")[1], f.getbbox("BREEDERS")[3]
    d.text(((w - tw) / 2, (h - (bottom - top)) / 2 - top), "BREEDERS", font=f, fill=(24, 22, 20))
    return im
def paint_plates(base):
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
    for x0, y0, x1, y1 in PLATES:
        w, h = x1 - x0, y1 - y0
        img.paste(plate_image(h, w).rotate(-90, expand=True).resize((w, h)), (x0, y0))
    return np.asarray(img).astype(np.float32)

for mat, has_metal in [("FordMustang_MTL", True), ("FordMustangWheels_MTL", True), ("FordMustangWindow_MTL", False)]:
    base = np.asarray(load(f"{mat}_BaseColor.png")).astype(np.float32)
    rough = np.asarray(load(f"{mat}_Roughness.png", "L")).astype(np.float32)
    metal = np.asarray(load(f"{mat}_Metallic.png", "L")).astype(np.float32) if has_metal else np.zeros_like(rough)
    if mat == "FordMustang_MTL":
        lum = base.mean(2)
        sat = base.max(2) - base.min(2)
        paint = (lum > 2) & (lum < 20) & (sat < 8) & (metal < 30) & (rough > 4) & (rough < 40)
        k = np.clip(lum / 6.0, 0.6, 1.4)[..., None]
        base = np.where(paint[..., None], np.clip(PAINT * k, 0, 255), base)
        print("paint share", round(float(paint.mean()), 3))
        base = paint_plates(base)
    # glTF packs roughness in G and metalness in B
    mr = np.zeros(base.shape, np.uint8)
    mr[..., 1] = rough.astype(np.uint8)
    mr[..., 2] = metal.astype(np.uint8)
    save(base.astype(np.uint8), f"{mat}_base.png")
    save(mr, f"{mat}_mr.png")
    save(load(f"{mat}_Normal.png"), f"{mat}_normal.png")
save(load("FordMustang_MTL_Emission.png"), "FordMustang_MTL_emission.png")
print("done")
