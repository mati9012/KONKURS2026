import math
import sys
from pathlib import Path

import bpy
import bmesh
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets-src" / "models-original" / "balloon.glb"
TARGET = ROOT / "assets-src" / "models" / "balloon.glb"
BASKET_FLOOR = 0.115
BASKET_RADIUS = 0.09
GRASS_TOP = 0.2
FLAG_REACH = 0.2
GROUND_TOP = 0.32
ENVELOPE_START = 0.5


def balloon_axis(mesh):
    top = [vertex.co for vertex in mesh.vertices if vertex.co.z > ENVELOPE_START]
    return sum(co.x for co in top) / len(top), sum(co.y for co in top) / len(top)


def base_color_pixels(obj):
    material = obj.data.materials[0]
    shader = next(node for node in material.node_tree.nodes if node.type == "BSDF_PRINCIPLED")
    image = shader.inputs["Base Color"].links[0].from_node.image
    width, height = image.size
    pixels = np.empty(width * height * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    return pixels.reshape(height, width, 4)


def is_grassy(face, uv_layer, pixels):
    height, width = pixels.shape[:2]
    u = sum(loop[uv_layer].uv.x for loop in face.loops) / len(face.loops)
    v = sum(loop[uv_layer].uv.y for loop in face.loops) / len(face.loops)
    r, g, b, _ = pixels[int(v % 1 * (height - 1)), int(u % 1 * (width - 1))]
    return g > r * 1.15 and g > b * 1.2


def is_ground(face, axis, uv_layer, pixels):
    center = face.calc_center_median()
    if center.z < GROUND_TOP and is_grassy(face, uv_layer, pixels):
        return True
    distance = math.hypot(center.x - axis[0], center.y - axis[1])
    if center.z < BASKET_FLOOR:
        return True
    if distance > BASKET_RADIUS and center.z < GRASS_TOP:
        return True
    return distance > FLAG_REACH and center.z < GROUND_TOP


def strip():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    obj = next(candidate for candidate in bpy.data.objects if candidate.type == "MESH")
    world = obj.matrix_world.copy()
    obj.data.transform(world)
    obj.matrix_world.identity()
    axis = balloon_axis(obj.data)
    pixels = base_color_pixels(obj)
    data = bmesh.new()
    data.from_mesh(obj.data)
    uv_layer = data.loops.layers.uv.active
    doomed = [face for face in data.faces if is_ground(face, axis, uv_layer, pixels)]
    bmesh.ops.delete(data, geom=doomed, context="FACES")
    data.to_mesh(obj.data)
    data.free()
    for other in list(bpy.data.objects):
        if other != obj:
            bpy.data.objects.remove(other, do_unlink=True)
    out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else str(TARGET)
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=92)


strip()
