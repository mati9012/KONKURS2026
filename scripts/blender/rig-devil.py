import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Quaternion, Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets-src" / "devil" / "diabelek-source.glb"
FPS = 30

BONES = {
    "root": ((0, 0, 0), (0, 0, 0.08), None),
    "hips": ((0, -0.04, 0.3), (0, -0.04, 0.4), "root"),
    "spine": ((0, -0.04, 0.4), (0, -0.05, 0.53), "hips"),
    "chest": ((0, -0.05, 0.53), (0, -0.05, 0.62), "spine"),
    "neck": ((0, -0.05, 0.62), (0, -0.06, 0.67), "chest"),
    "head": ((0, -0.06, 0.67), (0, -0.06, 0.95), "neck"),
    "jaw": ((0, -0.13, 0.7), (0, -0.23, 0.665), "head"),
    "ear.L": ((0.15, -0.04, 0.71), (0.23, -0.03, 0.72), "head"),
    "ear.R": ((-0.15, -0.04, 0.71), (-0.23, -0.03, 0.72), "head"),
    "upperarm.L": ((0.12, -0.05, 0.585), (0.29, -0.05, 0.585), "chest"),
    "forearm.L": ((0.29, -0.05, 0.585), (0.42, -0.06, 0.583), "upperarm.L"),
    "hand.L": ((0.42, -0.06, 0.583), (0.49, -0.07, 0.58), "forearm.L"),
    "upperarm.R": ((-0.12, -0.05, 0.585), (-0.29, -0.05, 0.585), "chest"),
    "forearm.R": ((-0.29, -0.05, 0.585), (-0.42, -0.06, 0.583), "upperarm.R"),
    "hand.R": ((-0.42, -0.06, 0.583), (-0.49, -0.07, 0.58), "forearm.R"),
    "wing.L": ((0.07, 0.03, 0.58), (0.24, 0.04, 0.6), "chest"),
    "wingtip.L": ((0.24, 0.04, 0.6), (0.43, 0.04, 0.42), "wing.L"),
    "wing.R": ((-0.07, 0.03, 0.58), (-0.24, 0.04, 0.6), "chest"),
    "wingtip.R": ((-0.24, 0.04, 0.6), (-0.43, 0.04, 0.42), "wing.R"),
    "thigh.L": ((0.065, -0.07, 0.32), (0.07, -0.08, 0.18), "hips"),
    "shin.L": ((0.07, -0.08, 0.18), (0.08, -0.09, 0.07), "thigh.L"),
    "foot.L": ((0.08, -0.09, 0.07), (0.09, -0.16, 0.01), "shin.L"),
    "thigh.R": ((-0.065, -0.07, 0.32), (-0.07, -0.08, 0.18), "hips"),
    "shin.R": ((-0.07, -0.08, 0.18), (-0.08, -0.09, 0.07), "thigh.R"),
    "foot.R": ((-0.08, -0.09, 0.07), (-0.09, -0.16, 0.01), "shin.R"),
    "tail1": ((0, 0.07, 0.31), (-0.03, 0.15, 0.27), "hips"),
    "tail2": ((-0.03, 0.15, 0.27), (-0.12, 0.22, 0.2), "tail1"),
    "tail3": ((-0.12, 0.22, 0.2), (-0.23, 0.25, 0.13), "tail2"),
    "tail4": ((-0.23, 0.25, 0.13), (-0.25, 0.25, 0.24), "tail3"),
}

TAIL = ("tail1", "tail2", "tail3", "tail4")
UPPER_LIP_Z = 0.703
CHIN_Z = 0.648
MOUTH_HALF_WIDTH = 0.075


def scene_args():
    if "--" not in sys.argv:
        return {}
    pairs = sys.argv[sys.argv.index("--") + 1 :]
    return dict(pair.split("=", 1) for pair in pairs)


def smoothstep(edge0, edge1, x):
    t = min(1.0, max(0.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)


def jaw_share(co):
    if co.y > -0.12 or abs(co.x) > MOUTH_HALF_WIDTH + 0.02 or not CHIN_Z - 0.02 < co.z < UPPER_LIP_Z:
        return 0.0
    return (
        smoothstep(MOUTH_HALF_WIDTH + 0.02, MOUTH_HALF_WIDTH - 0.02, abs(co.x))
        * smoothstep(UPPER_LIP_Z, UPPER_LIP_Z - 0.012, co.z)
        * smoothstep(CHIN_Z - 0.02, CHIN_Z + 0.008, co.z)
        * smoothstep(-0.12, -0.16, co.y)
    )


def wing_share(co):
    reach = abs(co.x)
    if co.y < -0.02 or reach < 0.09 or co.z > 0.63 or co.z < 0.36:
        return None
    if co.z > 0.545 and co.y < 0.02:
        return None
    side = "L" if co.x > 0 else "R"
    tip = smoothstep(0.2, 0.3, reach)
    root = smoothstep(0.09, 0.14, reach)
    return {f"wingtip.{side}": tip * root, f"wing.{side}": (1 - tip) * root, "chest": 1 - root}


def override_weights(co):
    wings = wing_share(co)
    jaw = jaw_share(co)
    if jaw > 0:
        return {"jaw": jaw, "head": 1 - jaw}
    return wings


def import_devil():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    body = next(obj for obj in bpy.data.objects if obj.type == "MESH")
    body.data.transform(body.matrix_world)
    body.matrix_world = Matrix.Identity(4)
    for obj in list(bpy.data.objects):
        if obj is not body:
            bpy.data.objects.remove(obj, do_unlink=True)
    body.name = body.data.name = "devil"
    return body


def build_armature():
    armature = bpy.data.armatures.new("devil-rig")
    rig = bpy.data.objects.new("devil-rig", armature)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for name, (head, tail, parent) in BONES.items():
        bone = armature.edit_bones.new(name)
        bone.head, bone.tail = head, tail
        if parent:
            bone.parent = armature.edit_bones[parent]
            bone.use_connect = Vector(head) == armature.edit_bones[parent].tail
    bpy.ops.object.mode_set(mode="OBJECT")
    for bone in rig.pose.bones:
        bone.rotation_mode = "QUATERNION"
    return rig


def segment_distance(point, head, tail):
    axis = tail - head
    t = max(0.0, min(1.0, (point - head).dot(axis) / axis.length_squared))
    return (point - (head + axis * t)).length


def allowed(bone, co):
    side = "L" if co.x > 0 else "R"
    if bone.endswith((".L", ".R")) and not bone.endswith(side):
        return False
    if bone.startswith(("thigh", "shin", "foot")):
        return co.z < 0.34 and abs(co.x) < 0.14 and co.y < 0.06
    if bone.startswith("tail"):
        return co.y > 0.05 and co.z < 0.36
    if bone.startswith(("upperarm", "forearm", "hand")):
        return abs(co.x) > 0.1 and co.z > 0.5
    if bone.startswith("wing"):
        return co.y > -0.02 and 0.36 < co.z < 0.66
    if bone.startswith("ear"):
        return co.z > 0.65 and abs(co.x) > 0.13
    if bone == "head":
        return co.z > 0.6
    return bone not in ("root", "jaw")


def distance_weights(co):
    if co.z > 0.68 and not (abs(co.x) > 0.15 and co.z < 0.76):
        return {"head": 1.0}
    scored = []
    for name, (head, tail, _) in BONES.items():
        if not allowed(name, co):
            continue
        distance = segment_distance(co, Vector(head), Vector(tail))
        scored.append((1 / (distance**4 + 1e-7), name))
    scored.sort(reverse=True)
    best = scored[:3]
    total = sum(score for score, _ in best)
    return {name: score / total for score, name in best}


def skin(body, rig):
    for name in BONES:
        body.vertex_groups.new(name=name)
    for vertex in body.data.vertices:
        weights = override_weights(vertex.co) or distance_weights(vertex.co)
        for bone, weight in weights.items():
            if weight > 0.01:
                body.vertex_groups[bone].add([vertex.index], weight, "REPLACE")
    body.parent = rig
    modifier = body.modifiers.new("rig", "ARMATURE")
    modifier.object = rig
    return sum(1 for vertex in body.data.vertices if not vertex.groups)


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


def lift(rig, frame, height):
    pose = rig.pose.bones["root"]
    pose.location = (0, height, 0)
    pose.keyframe_insert("location", frame=frame)


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


def mirror(side, vector):
    x, y, z = vector
    return (x if side == "L" else -x, y, z)


def relaxed(rig, frame, side, swing=0.0):
    arm(
        rig,
        frame,
        side,
        mirror(side, (0.42, -0.08 + swing, -1)),
        mirror(side, (0.3, -0.35 + swing, -1)),
        mirror(side, (0.2, -0.4, -1)),
    )


def wings(rig, frame, flap, fold=20):
    for side, sign in (("L", 1), ("R", -1)):
        key(rig, frame, f"wing.{side}", (0, -sign * flap, sign * fold))
        key(rig, frame, f"wingtip.{side}", (0, -sign * flap * 0.6, sign * fold * 0.4))


def tail(rig, frame, phase, strength=1.0):
    for index, bone in enumerate(TAIL):
        wave = math.sin(phase - index * 0.9)
        key(rig, frame, bone, (6 * strength * wave, 0, 14 * strength * wave))


def ears(rig, frame, angle):
    key(rig, frame, "ear.L", (0, -angle, 0))
    key(rig, frame, "ear.R", (0, angle, 0))


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


def loop_times(steps):
    return [index / steps for index in range(steps + 1)]


def idle_action(rig):
    frames = 4 * FPS
    new_action(rig, "Idle")
    for t in loop_times(8):
        frame = round(t * frames)
        phase = math.sin(t * math.tau)
        flap = math.sin(t * math.tau * 2)
        lift(rig, frame, 0.012 * flap)
        key(rig, frame, "spine", (-2 * phase, 1.5 * phase, 0))
        key(rig, frame, "chest", (-1.5 * phase, 0, 0))
        key(rig, frame, "neck", (2 * phase, 0, 0))
        key(rig, frame, "head", (3 * math.sin(t * math.tau + 0.6), -3 * phase, 6 * phase))
        key(rig, frame, "jaw", (0, 0, 0))
        relaxed(rig, frame, "L", 0.05 * phase)
        relaxed(rig, frame, "R", -0.05 * phase)
        wings(rig, frame, 18 * flap, 22)
        tail(rig, frame, t * math.tau)
        ears(rig, frame, 4 * phase)


def talk_action(rig):
    frames = 2 * FPS
    new_action(rig, "Talk")
    for index, openness in enumerate((0, 1, 0.3, 0.9, 0.1, 0.7, 0.2, 1, 0.4, 0.8, 0)):
        key(rig, round(index / 10 * frames), "jaw", (9 * openness, 0, 0))
    for t in loop_times(4):
        frame = round(t * frames)
        phase = math.sin(t * math.tau)
        flap = math.sin(t * math.tau * 2)
        lift(rig, frame, 0.008 * flap)
        key(rig, frame, "spine", (0, 1.5 * phase, 4 * phase))
        key(rig, frame, "chest", (0, 0, 0))
        key(rig, frame, "neck", (0, 0, 0))
        key(rig, frame, "head", (5 * math.sin(t * math.tau * 2), 4 * phase, 8 * phase))
        relaxed(rig, frame, "L")
        arm(
            rig,
            frame,
            "R",
            (-0.6, -0.7, -0.5),
            (-0.25, -1, 0.4 + 0.2 * phase),
            (-0.3, -1, 0.2),
        )
        wings(rig, frame, 14 * flap, 22)
        tail(rig, frame, t * math.tau, 0.8)
        ears(rig, frame, 3 * phase)


def laugh_action(rig):
    frames = 2 * FPS
    new_action(rig, "Laugh")
    for t in loop_times(12):
        frame = round(t * frames)
        shake = math.sin(t * math.tau * 6)
        flap = math.sin(t * math.tau * 4)
        lift(rig, frame, 0.015 * abs(shake))
        key(rig, frame, "spine", (-8 + 3 * shake, 0, 0))
        key(rig, frame, "chest", (-5 + 2 * shake, 0, 0))
        key(rig, frame, "neck", (-6, 0, 0))
        key(rig, frame, "head", (-12 + 4 * shake, 3 * math.sin(t * math.tau), 0))
        key(rig, frame, "jaw", (12 + 4 * shake, 0, 0))
        for side in ("L", "R"):
            arm(
                rig,
                frame,
                side,
                mirror(side, (0.55, -0.55, -0.65)),
                mirror(side, (-0.55, -0.75, 0.05 + 0.08 * shake)),
                mirror(side, (-0.7, -0.5, 0)),
            )
        wings(rig, frame, 26 * flap, 12)
        tail(rig, frame, t * math.tau * 2, 1.4)
        ears(rig, frame, 8 * shake)


def angry_action(rig):
    frames = 2 * FPS
    new_action(rig, "Angry")
    for t in loop_times(12):
        frame = round(t * frames)
        shake = math.sin(t * math.tau * 6)
        stomp = math.sin(t * math.tau * 2)
        lift(rig, frame, 0.01 * max(0.0, stomp))
        key(rig, frame, "spine", (8, 2 * shake, 0))
        key(rig, frame, "chest", (4, 0, 0))
        key(rig, frame, "neck", (4, 0, 0))
        key(rig, frame, "head", (6, 5 * shake, 4 * math.sin(t * math.tau * 3)))
        key(rig, frame, "jaw", (4 + 3 * abs(shake), 0, 0))
        for side, offset in (("L", 0.0), ("R", math.pi)):
            punch = math.sin(t * math.tau * 6 + offset)
            arm(
                rig,
                frame,
                side,
                mirror(side, (0.7, -0.55, -0.35 + 0.1 * punch)),
                mirror(side, (0.15, -0.55, 0.85)),
                mirror(side, (0.05, -0.4, 1)),
            )
        wings(rig, frame, 30 * math.sin(t * math.tau * 6), -4)
        tail(rig, frame, t * math.tau * 3, 1.6)
        ears(rig, frame, -10)


ACTIONS = {
    "Idle": (idle_action, 4 * FPS),
    "Talk": (talk_action, 2 * FPS),
    "Laugh": (laugh_action, 2 * FPS),
    "Angry": (angry_action, 2 * FPS),
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
        turn = float(scene_args().get("turn", "21"))
        camera.location = (2.47 * math.sin(math.radians(turn)), -2.47 * math.cos(math.radians(turn)), 0.65)
        camera.rotation_euler = (math.radians(88), 0, math.radians(turn))
        camera.data.lens = 45
        scene.camera = camera
        sun = bpy.data.objects.new("preview-sun", bpy.data.lights.new("preview-sun", "SUN"))
        sun.data.energy = 3.2
        sun.data.color = (1, 0.9, 0.8)
        sun.rotation_euler = (math.radians(50), 0, math.radians(25))
        scene.collection.objects.link(sun)
        world = bpy.data.worlds.new("preview-world")
        world.use_nodes = True
        world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.5, 0.56, 0.82, 1)
        scene.world = world
        scene.render.engine = "BLENDER_EEVEE"
        scene.render.resolution_x = 480
        scene.render.resolution_y = 600
        scene.view_settings.view_transform = "Standard"
    rig.animation_data.action = action
    scene.frame_start = int(frame_range[0] * frames)
    scene.frame_end = int(frame_range[1] * frames)
    scene.frame_step = int(frame_range[2]) if len(frame_range) > 2 else 1
    scene.render.fps = FPS
    scene.render.filepath = f"{out}/{action.name}-"
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)


def build():
    args = scene_args()
    body = import_devil()
    rig = build_armature()
    unweighted = skin(body, rig)
    print("UNWEIGHTED", unweighted, "TRIANGLES", sum(len(p.vertices) - 2 for p in body.data.polygons))
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
