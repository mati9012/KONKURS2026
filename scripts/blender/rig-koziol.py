import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Quaternion, Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets-src" / "koziol" / "koziolek-source.glb"
FPS = 30

BONES = {
    "root": ((0, 0, 0), (0, 0, 0.08), None),
    "hips": ((0, 0, 0.4), (0, 0, 0.48), "root"),
    "spine": ((0, 0, 0.48), (0, 0, 0.6), "hips"),
    "neck": ((0, 0, 0.6), (0, -0.01, 0.7), "spine"),
    "head": ((0, -0.01, 0.7), (0, -0.01, 0.9), "neck"),
    "jaw": ((0, -0.08, 0.742), (0, -0.18, 0.722), "head"),
    "ear.L": ((0.13, 0.04, 0.79), (0.26, 0.05, 0.775), "head"),
    "ear.R": ((-0.13, 0.04, 0.79), (-0.26, 0.05, 0.775), "head"),
    "upperarm.L": ((0.14, 0.012, 0.635), (0.28, 0.012, 0.636), "spine"),
    "forearm.L": ((0.28, 0.012, 0.636), (0.4, 0.012, 0.634), "upperarm.L"),
    "hand.L": ((0.4, 0.012, 0.634), (0.47, 0.012, 0.628), "forearm.L"),
    "upperarm.R": ((-0.14, 0.012, 0.635), (-0.28, 0.012, 0.636), "spine"),
    "forearm.R": ((-0.28, 0.012, 0.636), (-0.4, 0.012, 0.634), "upperarm.R"),
    "hand.R": ((-0.4, 0.012, 0.634), (-0.47, 0.012, 0.628), "forearm.R"),
    "thigh.L": ((0.068, 0, 0.42), (0.072, -0.005, 0.27), "hips"),
    "shin.L": ((0.072, -0.005, 0.27), (0.087, 0.02, 0.14), "thigh.L"),
    "foot.L": ((0.087, 0.02, 0.14), (0.115, -0.01, 0.025), "shin.L"),
    "thigh.R": ((-0.068, 0, 0.42), (-0.072, -0.005, 0.27), "hips"),
    "shin.R": ((-0.072, -0.005, 0.27), (-0.087, 0.02, 0.14), "thigh.R"),
    "foot.R": ((-0.087, 0.02, 0.14), (-0.115, -0.01, 0.025), "shin.R"),
    "tail": ((0, 0.11, 0.37), (0, 0.17, 0.4), "hips"),
}

MOUTH_FRONT_Y = -0.17
MOUTH_CORNER_Y = -0.118
MOUTH_HALF_WIDTH = 0.062
CHIN_BOTTOM_Z = 0.655


def scene_args():
    if "--" not in sys.argv:
        return {}
    pairs = sys.argv[sys.argv.index("--") + 1 :]
    return dict(pair.split("=", 1) for pair in pairs)


def mouth_line(y):
    return 0.727 + 0.216 * (y - MOUTH_FRONT_Y)


def in_jaw(co):
    return (
        co.y < MOUTH_CORNER_Y
        and abs(co.x) < MOUTH_HALF_WIDTH
        and CHIN_BOTTOM_Z < co.z < mouth_line(co.y)
    )


def smoothstep(edge0, edge1, x):
    t = min(1.0, max(0.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)


def jaw_share(co):
    if co.z > mouth_line(co.y) or co.y > -0.09 or abs(co.x) > 0.09:
        return 0.0
    return (
        smoothstep(0.09, 0.05, abs(co.x))
        * smoothstep(-0.095, -0.13, co.y)
        * smoothstep(0.635, 0.68, co.z)
    )


def override_weights(co):
    base = body_weights(co)
    jaw = jaw_share(co)
    if jaw <= 0:
        return base
    blended = {bone: weight * (1 - jaw) for bone, weight in (base or {"head": 1.0}).items()}
    blended["jaw"] = jaw
    return blended


def body_weights(co):
    side = "L" if co.x > 0 else "R"
    reach = abs(co.x)
    if co.z > 0.72 and reach > 0.125 and co.z < 0.86 and co.y > -0.06:
        ear = smoothstep(0.125, 0.165, reach)
        return {f"ear.{side}": ear, "head": 1 - ear}
    if co.z > 0.72:
        return {"head": 1.0}
    radial = math.hypot(co.x, co.y + 0.01)
    if 0.6 < co.z <= 0.72 and radial < 0.075:
        head = smoothstep(0.66, 0.72, co.z)
        return {"head": head, "neck": 1 - head}
    if 0.55 < co.z < 0.71 and reach < 0.21:
        arm = smoothstep(0.14, 0.21, reach)
        return {f"upperarm.{side}": arm, "spine": 1 - arm}
    return None


def import_goat():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    body = next(obj for obj in bpy.data.objects if obj.type == "MESH")
    body.data.transform(body.matrix_world)
    body.matrix_world = Matrix.Identity(4)
    for obj in list(bpy.data.objects):
        if obj is not body:
            bpy.data.objects.remove(obj, do_unlink=True)
    body.name = body.data.name = "koziol"
    return body


def split_lips(body):
    bm = bmesh.new()
    bm.from_mesh(body.data)
    seam = []
    for edge in bm.edges:
        faces = edge.link_faces
        if len(faces) != 2:
            continue
        sides = [in_jaw(face.calc_center_median()) for face in faces]
        middle = (edge.verts[0].co + edge.verts[1].co) / 2
        if sides[0] != sides[1] and middle.y < MOUTH_CORNER_Y - 0.004 and abs(middle.z - mouth_line(middle.y)) < 0.01:
            seam.append(edge)
    bmesh.ops.split_edges(bm, edges=seam)
    bm.to_mesh(body.data)
    bm.free()
    return len(seam)


def mouth_interior(body):
    material = bpy.data.materials.new("mouth")
    material.use_nodes = True
    shader = material.node_tree.nodes["Principled BSDF"]
    shader.inputs["Base Color"].default_value = (0.09, 0.02, 0.025, 1)
    shader.inputs["Roughness"].default_value = 0.9
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1)
    bmesh.ops.transform(
        bm, matrix=Matrix.Translation((0, -0.118, 0.733)) @ Matrix.Diagonal((0.042, 0.044, 0.012, 1)), verts=bm.verts
    )
    mesh = bpy.data.meshes.new("mouth")
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material)
    mesh.shade_smooth()
    mouth = bpy.data.objects.new("mouth", mesh)
    bpy.context.scene.collection.objects.link(mouth)
    return mouth


def build_armature():
    armature = bpy.data.armatures.new("koziol-rig")
    rig = bpy.data.objects.new("koziol-rig", armature)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for name, (head, tail, parent) in BONES.items():
        bone = armature.edit_bones.new(name)
        bone.head, bone.tail = head, tail
        if parent:
            bone.parent = armature.edit_bones[parent]
    bpy.ops.object.mode_set(mode="OBJECT")
    for bone in rig.pose.bones:
        bone.rotation_mode = "QUATERNION"
    return rig


def skin(body, mouth, rig):
    for obj in bpy.context.view_layer.objects:
        obj.select_set(False)
    body.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    for vertex in body.data.vertices:
        weights = override_weights(vertex.co)
        if weights is None:
            continue
        for group in body.vertex_groups:
            group.remove([vertex.index])
        for bone, weight in weights.items():
            if weight <= 0:
                continue
            group = body.vertex_groups.get(bone) or body.vertex_groups.new(name=bone)
            group.add([vertex.index], weight, "REPLACE")
    head = mouth.vertex_groups.new(name="head")
    head.add(list(range(len(mouth.data.vertices))), 1.0, "REPLACE")
    for obj in bpy.context.view_layer.objects:
        obj.select_set(False)
    body.select_set(True)
    mouth.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    return body


def world_turn(rig, bone, degrees):
    turn = Quaternion()
    for axis, angle in zip(((1, 0, 0), (0, 1, 0), (0, 0, 1)), degrees):
        turn = turn @ Quaternion(axis, math.radians(angle))
    rest = rig.data.bones[bone].matrix_local.to_quaternion()
    return rest.inverted() @ turn @ rest


def key(rig, frame, bone, rotation):
    pose = rig.pose.bones[bone]
    pose.rotation_quaternion = world_turn(rig, bone, rotation)
    pose.keyframe_insert("rotation_quaternion", frame=frame)


def aim(rig, frame, chain):
    parent_turn = Quaternion()
    for bone, direction in chain:
        rest_bone = rig.data.bones[bone]
        rest = rest_bone.matrix_local.to_quaternion()
        current = parent_turn @ (rest_bone.tail_local - rest_bone.head_local).normalized()
        total = current.rotation_difference(Vector(direction).normalized()) @ parent_turn
        pose = rig.pose.bones[bone]
        pose.rotation_quaternion = rest.inverted() @ parent_turn.inverted() @ total @ rest
        pose.keyframe_insert("rotation_quaternion", frame=frame)
        parent_turn = total


def arm(rig, frame, side, upper, lower, hand):
    aim(rig, frame, ((f"upperarm.{side}", upper), (f"forearm.{side}", lower), (f"hand.{side}", hand)))


def relaxed(rig, frame, side, swing=0.0):
    x = 1 if side == "L" else -1
    arm(rig, frame, side, (0.32 * x, -0.06 + swing, -1), (0.22 * x, -0.32 + swing, -1), (0.15 * x, -0.35, -1))


def reset_pose(rig):
    for bone in rig.pose.bones:
        bone.rotation_quaternion = (1, 0, 0, 0)
        bone.scale = (1, 1, 1)
        bone.location = (0, 0, 0)


def new_action(rig, name):
    reset_pose(rig)
    action = bpy.data.actions.new(name)
    action.use_fake_user = True
    rig.animation_data_create()
    rig.animation_data.action = action
    for leg in ("thigh", "shin", "foot"):
        for side in ("L", "R"):
            key(rig, 0, f"{leg}.{side}", (0, 0, 0))
    return action


def breathe(rig, frame, phase, sway=1.0):
    key(rig, frame, "hips", (0, 1.0 * phase * sway, 0))
    key(rig, frame, "spine", (-2 * phase, 1.5 * phase * sway, 0))
    key(rig, frame, "tail", (0, 0, 16 * phase))


def ears(rig, frames, flick_at=None):
    for side, mirror in (("L", 1), ("R", -1)):
        times = ((0, 0), (1, 0)) if flick_at is None else ((0, 0), (flick_at - 0.05, 0), (flick_at, 16 if side == "L" else 0), (flick_at + 0.08, 0), (1, 0))
        for t, angle in times:
            key(rig, round(t * frames), f"ear.{side}", (0, -angle * mirror, 0))


def idle_action(rig):
    frames = 4 * FPS
    new_action(rig, "idle")
    for t in (0, 0.25, 0.5, 0.75, 1):
        frame = round(t * frames)
        phase = math.sin(t * math.tau)
        breathe(rig, frame, phase)
        key(rig, frame, "neck", (2 * phase, 0, 0))
        key(rig, frame, "head", (3 * math.sin(t * math.tau + 0.6), -2 * phase, 5 * phase))
        key(rig, frame, "jaw", (0, 0, 0))
        relaxed(rig, frame, "L", 0.04 * phase)
        relaxed(rig, frame, "R", -0.04 * phase)
    ears(rig, frames, 0.6)


def talk_action(rig):
    frames = 2 * FPS
    new_action(rig, "talk")
    for i, openness in enumerate((0, 1, 0.3, 0.9, 0.1, 0.7, 0.2, 1, 0.4, 0.8, 0)):
        key(rig, round(i / 10 * frames), "jaw", (14 * openness, 0, 0))
    for t in (0, 0.25, 0.5, 0.75, 1):
        frame = round(t * frames)
        phase = math.sin(t * math.tau)
        breathe(rig, frame, phase, 0.5)
        key(rig, frame, "neck", (0, 0, 0))
        key(rig, frame, "head", (5 * math.sin(t * math.tau * 2), 3 * phase, 6 * phase))
        relaxed(rig, frame, "L")
        arm(rig, frame, "R", (-0.55, -0.7, -0.55), (-0.25, -1, 0.35 + 0.15 * phase), (-0.35, -1, 0.1))
    ears(rig, frames)


def present_action(rig):
    frames = 3 * FPS
    new_action(rig, "present")
    for t in (0, 0.25, 0.5, 0.75, 1):
        frame = round(t * frames)
        phase = math.sin(t * math.tau)
        breathe(rig, frame, phase, 0.6)
        key(rig, frame, "neck", (0, 0, 0))
        key(rig, frame, "head", (-3 + 2 * phase, 4, 12))
        key(rig, frame, "jaw", (8, 0, 0))
        relaxed(rig, frame, "R")
        arm(rig, frame, "L", (1, -0.55, -0.15 + 0.04 * phase), (1, -0.75, 0.2), (1, -0.6, 0.45))
    ears(rig, frames, 0.4)


def wave_action(rig):
    frames = round(2.4 * FPS)
    new_action(rig, "wave")
    for t in (0, 1):
        relaxed(rig, round(t * frames), "L")
        relaxed(rig, round(t * frames), "R")
    for i in range(8):
        t = 0.22 + i * (0.63 / 7)
        tilt = 0.35 if i % 2 else -0.35
        arm(rig, round(t * frames), "R", (-0.85, -0.25, 0.55), (-0.25 + tilt, -0.2, 1), (-0.15 + tilt, -0.2, 1))
    for t, amount in ((0, 0), (0.25, 1), (0.8, 1), (1, 0)):
        key(rig, round(t * frames), "head", (-4 * amount, 7 * amount, -8 * amount))
        key(rig, round(t * frames), "neck", (0, 0, 0))
        key(rig, round(t * frames), "jaw", (10 * amount, 0, 0))
    ears(rig, frames, 0.3)


def think_action(rig):
    frames = 3 * FPS
    new_action(rig, "think")
    for t in (0, 0.5, 1):
        frame = round(t * frames)
        phase = math.sin(t * math.tau)
        breathe(rig, frame, phase, 0.4)
        key(rig, frame, "neck", (0, 0, 0))
        key(rig, frame, "head", (-6, -10, -12 + 3 * phase))
        key(rig, frame, "jaw", (0, 0, 0))
        relaxed(rig, frame, "L")
        arm(rig, frame, "R", (0.08, -0.13, -0.085), (0.06, -0.03, 0.14), (0.02, -0.04, 0.06))
    ears(rig, frames)


def cheer_action(rig):
    frames = round(2.4 * FPS)
    new_action(rig, "cheer")
    for t in (0, 1):
        frame = round(t * frames)
        relaxed(rig, frame, "L")
        relaxed(rig, frame, "R")
        key(rig, frame, "head", (0, 0, 0))
        key(rig, frame, "neck", (0, 0, 0))
        key(rig, frame, "jaw", (0, 0, 0))
    for t in (0.25, 0.8):
        frame = round(t * frames)
        arm(rig, frame, "R", (-0.6, -0.55, -0.45), (-0.15, -0.45, 1), (-0.05, -0.35, 1))
        key(rig, frame, "head", (0, -8, -6))
        key(rig, frame, "neck", (0, 0, 0))
        key(rig, frame, "jaw", (9, 0, 0))
    ears(rig, frames, 0.35)


ACTIONS = {
    "idle": (idle_action, 4 * FPS),
    "talk": (talk_action, 2 * FPS),
    "present": (present_action, 3 * FPS),
    "wave": (wave_action, round(2.4 * FPS)),
    "think": (think_action, 3 * FPS),
    "cheer": (cheer_action, round(2.4 * FPS)),
}


def export(path, rig):
    rig.animation_data.action = None
    reset_pose(rig)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_force_sampling=True,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
        export_image_format="JPEG",
        export_jpeg_quality=90,
    )


def preview(scene, rig, action, out, frames, frame_range):
    if scene.camera is None:
        camera = bpy.data.objects.new("preview-camera", bpy.data.cameras.new("preview-camera"))
        scene.collection.objects.link(camera)
        camera.location = (-0.85, -2.35, 0.6)
        camera.rotation_euler = (math.radians(88), 0, math.radians(-20))
        camera.data.lens = 50
        scene.camera = camera
        sun = bpy.data.objects.new("preview-sun", bpy.data.lights.new("preview-sun", "SUN"))
        sun.data.energy = 3.2
        sun.data.color = (1, 0.9, 0.8)
        sun.rotation_euler = (math.radians(50), 0, math.radians(-35))
        scene.collection.objects.link(sun)
        world = bpy.data.worlds.new("preview-world")
        world.use_nodes = True
        world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.5, 0.56, 0.82, 1)
        world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
        scene.world = world
        scene.render.engine = "BLENDER_EEVEE"
        scene.render.resolution_x = 480
        scene.render.resolution_y = 600
        scene.view_settings.view_transform = "Standard"
    rig.animation_data.action = action
    scene.frame_start = int(frame_range[0] * frames)
    scene.frame_end = int(frame_range[1] * frames)
    scene.render.fps = FPS
    scene.render.filepath = f"{out}/{action.name}-"
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)


def build():
    args = scene_args()
    body = import_goat()
    seam = split_lips(body)
    mouth = mouth_interior(body)
    rig = build_armature()
    skin(body, mouth, rig)
    print("SEAM_EDGES", seam, "TRIANGLES", sum(len(p.vertices) - 2 for p in body.data.polygons))
    scene = bpy.context.scene
    scene.render.fps = FPS
    built = {}
    for name, (make, frames) in ACTIONS.items():
        make(rig)
        built[name] = (bpy.data.actions[name], frames)
    frame_range = [float(v) for v in args.get("range", "0,1").split(",")]
    if "preview" in args:
        for name in args.get("actions", ",".join(ACTIONS)).split(","):
            preview(scene, rig, built[name][0], args["preview"], built[name][1], frame_range)
    if "out" in args:
        export(args["out"], rig)


build()
