# Blender Cycles look test for the Mustang film: path-traced light, real motion blur, rendered with a transparent
# film so the page cream is composited afterwards, exact. Two scenes, matching the user's reference stills:
#   hero  — reference 4: the car small on cream, three-quarter front, soft studio light, a real contact shadow
#   track — reference 1: a floating piece of race track (kerbs, edge lines) curving away, the car at speed,
#           camera panning with it so the asphalt streaks
# usage: blender -b --factory-startup -P scripts/blender/mustang_look.py -- <scene> <out.png> [samples] [width]
# Car: "1967 Ford Mustang Fastback" by Mark Peters (CC BY 4.0). Asphalt + HDRI: Poly Haven (CC0).
import math
import sys

import bpy
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1:]
SCENE, OUT = ARGS[0], ARGS[1]
SAMPLES = int(ARGS[2]) if len(ARGS) > 2 else 96
WIDTH = int(ARGS[3]) if len(ARGS) > 3 else 1920
ROOT = "E:/Breeders"
FBX = "C:/Users/LENOVO/Downloads/1967-ford-mustang-fastback-4096px2/source/Ford Mustang.fbx"
TEX = f"{ROOT}/public/mustang/tex"
PH = f"{ROOT}/public/mustang/ph"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------- render ----------
scene.render.engine = "CYCLES"
# CPU: the laptop's MX250 driver is too old for Blender 5.2's CUDA kernels ("Invalid kernel image")
scene.cycles.device = "CPU"
scene.render.threads_mode = "AUTO"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 8
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.render.film_transparent = True
scene.render.resolution_x = WIDTH
scene.render.resolution_y = WIDTH * 9 // 16
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = float(ARGS[4]) if len(ARGS) > 4 else -2.0


def img(path, colour=True):
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = "sRGB" if colour else "Non-Color"
    return im


# ---------- world: the studio HDRI lights and reflects; the camera never sees it ----------
world = bpy.data.worlds.new("w")
scene.world = world
world.use_nodes = True
wn = world.node_tree.nodes
wl = world.node_tree.links
env = wn.new("ShaderNodeTexEnvironment")
env.image = img(f"{ROOT}/public/mustang/hdri/{'studio_small_09' if SCENE == 'hero' else 'kloofendal_48d_partly_cloudy_puresky'}_2k.hdr")
wl.new(env.outputs["Color"], wn["Background"].inputs["Color"])
# light: an even white dome (soft, short shadows right under the car, like a photo cove);
# reflections: the real studio HDRI, so paint and chrome mirror actual soft boxes
lp = wn.new("ShaderNodeLightPath")
mixw = wn.new("ShaderNodeMix")
mixw.data_type = "RGBA"
mixw.inputs[6].default_value = (1.0, 0.985, 0.96, 1)
wl.new(env.outputs["Color"], mixw.inputs[7])
wl.new(lp.outputs["Is Glossy Ray"], mixw.inputs["Factor"])
wl.new(mixw.outputs[2], wn["Background"].inputs["Color"])
wn["Background"].inputs["Strength"].default_value = 1.0

# ---------- the car ----------
bpy.ops.import_scene.fbx(filepath=FBX)
car = [o for o in bpy.data.objects if o.type == "MESH"][0]
car.name = "Mustang"


DBG = ARGS[5] if len(ARGS) > 5 else ""


def pbr(name, base, mr, normal, coat=0.0, emission=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes
    l = m.node_tree.links
    bsdf = n["Principled BSDF"]
    t_base = n.new("ShaderNodeTexImage"); t_base.image = img(base)
    t_mr = n.new("ShaderNodeTexImage"); t_mr.image = img(mr, False)
    t_n = n.new("ShaderNodeTexImage"); t_n.image = img(normal, False)
    sep = n.new("ShaderNodeSeparateColor")
    nm = n.new("ShaderNodeNormalMap")
    l.new(t_base.outputs["Color"], bsdf.inputs["Base Color"])
    l.new(t_mr.outputs["Color"], sep.inputs["Color"])
    l.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
    l.new(sep.outputs["Blue"], bsdf.inputs["Metallic"])
    l.new(t_n.outputs["Color"], nm.inputs["Color"])
    if not (DBG == "nonormal" and name == "wheels"):
        l.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    if coat:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.03
    if emission:
        t_e = n.new("ShaderNodeTexImage"); t_e.image = img(emission)
        l.new(t_e.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = 1.5
    return m


body = pbr("body", f"{TEX}/FordMustang_MTL_base.png", f"{TEX}/FordMustang_MTL_mr.png", f"{TEX}/FordMustang_MTL_normal.png", coat=1.0, emission=f"{TEX}/FordMustang_MTL_emission.png")
wheels = pbr("wheels", f"{TEX}/FordMustangWheels_MTL_base.png", f"{TEX}/FordMustangWheels_MTL_mr.png", f"{TEX}/FordMustangWheels_MTL_normal.png")
glass = bpy.data.materials.new("glass")
glass.use_nodes = True
g = glass.node_tree.nodes["Principled BSDF"]
g.inputs["Base Color"].default_value = (0.02, 0.022, 0.025, 1)
g.inputs["Roughness"].default_value = 0.02
g.inputs["Transmission Weight"].default_value = 0.65
g.inputs["IOR"].default_value = 1.5
black = bpy.data.materials.new("blackout")
black.use_nodes = True
black.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.01, 0.01, 0.01, 1)
black.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.8
swap = {"FordMustang_MTL": body, "FordMustangWheels_MTL": wheels, "FordMustangWindow_MTL": glass, "Blackout_MTL": black}
for slot in car.material_slots:
    if slot.material and slot.material.name in swap:
        slot.material = swap[slot.material.name]
bpy.context.view_layer.objects.active = car
car.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
# the car's nose points along +Y, wheels sit on z = 0


def look_at(cam, target):
    d = Vector(target) - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens):
    c = bpy.data.cameras.new("cam")
    c.lens = lens
    c.sensor_width = 36
    o = bpy.data.objects.new("cam", c)
    scene.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    scene.camera = o
    return o


def shadow_floor(size=60):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    f = bpy.context.active_object
    f.is_shadow_catcher = True
    return f


if SCENE == "hero":
    shadow_floor()
    # a long soft box overhead for the classic clean stripe down the hood and roof
    # one big soft box straight overhead: even light and a short, soft shadow right under the car
    bpy.ops.object.light_add(type="AREA", location=(0, 0, 9))
    key = bpy.context.active_object
    key.data.shape = "RECTANGLE"
    key.data.size, key.data.size_y = 9.0, 14.0
    key.data.energy = 250
    env_map = wn.new("ShaderNodeMapping")
    coord = wn.new("ShaderNodeTexCoord")
    wl.new(coord.outputs["Generated"], env_map.inputs["Vector"])
    wl.new(env_map.outputs["Vector"], env.inputs["Vector"])
    env_map.inputs["Rotation"].default_value[2] = math.radians(130)
    # the model's nose points to -Y: shoot from the front-left three-quarter
    if DBG:
        camera((-4.0, -3.2, 0.7), (-0.7, -1.3, 0.35), 50)
    else:
        camera((-13.5, -15.5, 2.3), (0.15, -0.35, 0.55), 50)

else:  # track
    # ---------- the floating piece of circuit ----------
    def catmull(pts, n):
        out = []
        P = [pts[0]] + pts + [pts[-1]]
        for i in range(1, len(P) - 2):
            for k in range(n):
                t = k / n
                p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
                out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in range(2)))
        out.append(pts[-1])
        return out

    # x, y on the ground; the car will drive toward the camera along this line
    CTRL = [(-70, 60), (-40, 40), (-18, 30), (-2, 26), (10, 20), (14, 8), (6, -4), (-8, -10), (-14, -20), (-4, -32), (16, -36), (40, -34)]
    PTS = catmull(CTRL, 40)
    # arc length
    S = [0.0]
    for i in range(1, len(PTS)):
        S.append(S[-1] + math.dist(PTS[i], PTS[i - 1]))
    L = S[-1]

    def strip(a, b, lateral, name, mat, z=0.0):
        verts, faces, uvs = [], [], []
        for i, (p, s) in enumerate(zip(PTS, S)):
            q = PTS[min(i + 1, len(PTS) - 1)] if i < len(PTS) - 1 else PTS[i]
            r = PTS[i - 1] if i > 0 else PTS[i]
            tx, ty = q[0] - r[0], q[1] - r[1]
            ln = math.hypot(tx, ty) or 1
            nx, ny = -ty / ln, tx / ln
            for j in range(lateral + 1):
                off = a + (b - a) * j / lateral
                verts.append((p[0] + nx * off, p[1] + ny * off, z))
                uvs.append((off, s))
        R = lateral + 1
        for i in range(len(PTS) - 1):
            for j in range(lateral):
                q0 = i * R + j
                faces.append((q0, q0 + 1, q0 + R + 1, q0 + R))
        me = bpy.data.meshes.new(name)
        me.from_pydata(verts, [], faces)
        uv = me.uv_layers.new(name="UVMap")
        for poly in me.polygons:
            for li, vi in zip(poly.loop_indices, poly.vertices):
                uv.data[li].uv = uvs[vi]
        o = bpy.data.objects.new(name, me)
        scene.collection.objects.link(o)
        o.data.materials.append(mat)
        return o

    def fade(n, l, shader):
        # fade the far ends of the island into nothing
        uvn = n.new("ShaderNodeUVMap")
        sep = n.new("ShaderNodeSeparateXYZ")
        l.new(uvn.outputs["UV"], sep.inputs["Vector"])
        a = n.new("ShaderNodeMapRange"); a.inputs["From Min"].default_value = 0; a.inputs["From Max"].default_value = 18
        b = n.new("ShaderNodeMapRange"); b.inputs["From Min"].default_value = L; b.inputs["From Max"].default_value = L - 30
        l.new(sep.outputs["Y"], a.inputs["Value"]); l.new(sep.outputs["Y"], b.inputs["Value"])
        mn = n.new("ShaderNodeMath"); mn.operation = "MINIMUM"
        l.new(a.outputs["Result"], mn.inputs[0]); l.new(b.outputs["Result"], mn.inputs[1])
        tr = n.new("ShaderNodeBsdfTransparent")
        mix = n.new("ShaderNodeMixShader")
        l.new(mn.outputs["Value"], mix.inputs["Fac"])
        l.new(tr.outputs["BSDF"], mix.inputs[1])
        l.new(shader, mix.inputs[2])
        l.new(mix.outputs["Shader"], n["Material Output"].inputs["Surface"])
        return sep

    # asphalt: scanned Poly Haven track surface, painted white edge lines
    asph = bpy.data.materials.new("asphalt")
    asph.use_nodes = True
    n, l = asph.node_tree.nodes, asph.node_tree.links
    bs = n["Principled BSDF"]
    uvn = n.new("ShaderNodeUVMap")
    mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1 / 3, 1 / 3, 1)
    l.new(uvn.outputs["UV"], mp.inputs["Vector"])
    d = n.new("ShaderNodeTexImage"); d.image = img(f"{PH}/asphalt_track/textures/asphalt_track_diff_2k.jpg")
    arm = n.new("ShaderNodeTexImage"); arm.image = img(f"{PH}/asphalt_track/textures/asphalt_track_arm_2k.jpg", False)
    nr = n.new("ShaderNodeTexImage"); nr.image = img(f"{PH}/asphalt_track/textures/asphalt_track_nor_gl_2k.jpg", False)
    for t in (d, arm, nr):
        l.new(mp.outputs["Vector"], t.inputs["Vector"])
    sp = n.new("ShaderNodeSeparateColor"); l.new(arm.outputs["Color"], sp.inputs["Color"])
    l.new(sp.outputs["Green"], bs.inputs["Roughness"])
    nmap = n.new("ShaderNodeNormalMap"); l.new(nr.outputs["Color"], nmap.inputs["Color"]); l.new(nmap.outputs["Normal"], bs.inputs["Normal"])
    # white lines at |u| = 5.4 m
    sep_uv = n.new("ShaderNodeSeparateXYZ"); l.new(uvn.outputs["UV"], sep_uv.inputs["Vector"])
    ab = n.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; l.new(sep_uv.outputs["X"], ab.inputs[0])
    sub = n.new("ShaderNodeMath"); sub.operation = "SUBTRACT"; sub.inputs[1].default_value = 5.4; l.new(ab.outputs["Value"], sub.inputs[0])
    ab2 = n.new("ShaderNodeMath"); ab2.operation = "ABSOLUTE"; l.new(sub.outputs["Value"], ab2.inputs[0])
    lt = n.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = 0.11; l.new(ab2.outputs["Value"], lt.inputs[0])
    mixc = n.new("ShaderNodeMix"); mixc.data_type = "RGBA"
    l.new(lt.outputs["Value"], mixc.inputs["Factor"])
    l.new(d.outputs["Color"], mixc.inputs[6])
    mixc.inputs[7].default_value = (0.85, 0.84, 0.81, 1)
    l.new(mixc.outputs[2], bs.inputs["Base Color"])
    fade(n, l, bs.outputs["BSDF"])

    # kerbs: red / white blocks along the length
    kerb = bpy.data.materials.new("kerb")
    kerb.use_nodes = True
    n, l = kerb.node_tree.nodes, kerb.node_tree.links
    bs = n["Principled BSDF"]
    bs.inputs["Roughness"].default_value = 0.45
    sep = fade(n, l, bs.outputs["BSDF"])
    dv = n.new("ShaderNodeMath"); dv.operation = "DIVIDE"; dv.inputs[1].default_value = 2.2; l.new(sep.outputs["Y"], dv.inputs[0])
    fr = n.new("ShaderNodeMath"); fr.operation = "FRACT"; l.new(dv.outputs["Value"], fr.inputs[0])
    gt = n.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.5; l.new(fr.outputs["Value"], gt.inputs[0])
    mk = n.new("ShaderNodeMix"); mk.data_type = "RGBA"
    l.new(gt.outputs["Value"], mk.inputs["Factor"])
    mk.inputs[6].default_value = (0.86, 0.85, 0.83, 1)
    mk.inputs[7].default_value = (0.62, 0.03, 0.04, 1)
    l.new(mk.outputs[2], bs.inputs["Base Color"])

    road = strip(-5.6, 5.6, 8, "road", asph)
    k1 = strip(5.6, 6.9, 2, "kerbL", kerb, 0.02)
    k2 = strip(-6.9, -5.6, 2, "kerbR", kerb, 0.02)
    # a low barrier along the far stretch, as in the reference
    # (the asphalt, kerbs and barrier are the only ground: everywhere else stays transparent → cream)

    # ---------- the car on the line, moving toward the camera, camera panning with it ----------
    def at_s(s):
        i = max(1, min(len(S) - 1, next((k for k in range(len(S)) if S[k] >= s), len(S) - 1)))
        t = (s - S[i - 1]) / ((S[i] - S[i - 1]) or 1)
        x = PTS[i - 1][0] + (PTS[i][0] - PTS[i - 1][0]) * t
        y = PTS[i - 1][1] + (PTS[i][1] - PTS[i - 1][1]) * t
        hx, hy = PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]
        h = math.hypot(hx, hy) or 1
        return x, y, hx / h, hy / h

    s0 = 0.45 * L
    speed = 30.0  # m/s
    scene.render.fps = 30
    scene.render.use_motion_blur = True
    scene.render.motion_blur_shutter = 0.5
    scene.frame_start, scene.frame_end = 1, 3
    cam = camera((0, 0, 0), (0, 0, 0), 85)
    wheel_r = 0.33
    for f in (1, 2, 3):
        s = s0 - speed * (f - 2) / 30  # toward the start of the line = toward camera
        x, y, dx, dy = at_s(s)
        # the car's nose (+Y) faces the direction of travel (toward decreasing s)
        yaw = math.atan2(-dx, -dy)
        car.location = (x - 1.6 * dy, y + 1.6 * dx, 0)  # inside lane
        car.rotation_euler = (0, 0, -yaw)
        car.keyframe_insert("location", frame=f)
        car.keyframe_insert("rotation_euler", frame=f)
        # camera: ahead of the car, right of it, elevated, panning with it (so the ground streaks)
        fwd = Vector((-dx, -dy, 0))
        right = Vector((fwd.y, -fwd.x, 0))
        cam.location = Vector(car.location) + fwd * 26 + right * 13 + Vector((0, 0, 6.5))
        look_at(cam, Vector(car.location) + Vector((0, 0, 0.6)) - right * 4)
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
    scene.frame_set(2)

scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("RENDERED", OUT)
