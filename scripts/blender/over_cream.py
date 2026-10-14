# Composite a transparent Cycles render (car + shadow-catcher shadow) over the page cream.
# usage: python scripts/blender/over_cream.py <in.png> <out.png>
import sys
from PIL import Image
src = Image.open(sys.argv[1]).convert("RGBA")
bg = Image.new("RGBA", src.size, (251, 243, 228, 255))
Image.alpha_composite(bg, src).convert("RGB").save(sys.argv[2])
