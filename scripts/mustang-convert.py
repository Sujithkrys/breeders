# Blender (CLI): turns Mark Peters' 1967 Fastback FBX (CC BY 4.0) into a GLB with named, separately movable parts
# for the Mustang film: shell, glass, nose, tail, trimL, trimR, trim, wheelFL/FR/RL/RR (origin at each hub).
# usage: blender -b --factory-startup -P scripts/mustang-convert.py -- <fbx> <out.glb>
import bpy, sys
from mathutils import Vector
argv = sys.argv[sys.argv.index("--") + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=argv[0])
src = [o for o in bpy.data.objects if o.type == "MESH"][0]
bpy.context.view_layer.objects.active = src
src.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")

def info(o):
    vs = [o.matrix_world @ v.co for v in o.data.vertices]
    if not vs:
        return None
    mn = Vector([min(v[i] for v in vs) for i in range(3)])
    mx = Vector([max(v[i] for v in vs) for i in range(3)])
    mat = o.material_slots[o.data.polygons[0].material_index].material.name if o.data.polygons and o.material_slots else None
    return mn, mx, (mn + mx) / 2, mat

parts = [o for o in bpy.data.objects if o.type == "MESH"]
shell = max(parts, key=lambda o: len(o.data.polygons) if info(o) and info(o)[3] == "FordMustang_MTL" else 0)
# hubs from the four big tyres
tyres = sorted(parts, key=lambda o: -len(o.data.polygons) if info(o) and info(o)[3] == "FordMustangWheels_MTL" else 0)[:4]
hubs = {}
for t in tyres:
    c = info(t)[2]
    hubs[("wheelF" if c.y > 0 else "wheelR") + ("L" if c.x > 0 else "R")] = c

groups = {}
for o in parts:
    i = info(o)
    if i is None:
        bpy.data.objects.remove(o)
        continue
    mn, mx, c, mat = i
    if o == shell or mat == "Blackout_MTL":
        g = "shell"
    elif mat == "FordMustangWheels_MTL":
        g = min(hubs, key=lambda k: (Vector((c.x, c.y)) - Vector((hubs[k].x, hubs[k].y))).length)
    elif mat == "FordMustangWindow_MTL":
        g = "glass"
    elif c.y > 1.65:
        g = "nose"
    elif c.y < -1.75:
        g = "tail"
    elif c.x > 0.6:
        g = "trimL"
    elif c.x < -0.6:
        g = "trimR"
    else:
        g = "trim"
    groups.setdefault(g, []).append(o)

for g, objs in groups.items():
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    j = bpy.context.view_layer.objects.active
    j.name = g
    j.data.name = g
    # wheels pivot on their hub, everything else on its own centre
    pivot = hubs[g] if g in hubs else info(j)[2]
    bpy.context.scene.cursor.location = pivot
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    print("GROUP", g, len(objs), "parts", len(j.data.polygons), "faces", tuple(round(v, 3) for v in pivot))

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=argv[1], export_format="GLB", export_image_format="NONE", use_selection=True)
print("EXPORTED", argv[1])
