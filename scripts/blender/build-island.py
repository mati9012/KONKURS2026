import json
import math
import sys
from pathlib import Path

import bpy
import bmesh
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[2]
ISLAND_DIR = ROOT / "assets-src" / "island"
MODELS_DIR = ISLAND_DIR / "models"
TEXTURES_DIR = ROOT / "public" / "textures"


def scene_args():
    if "--" not in sys.argv:
        return {}
    pairs = sys.argv[sys.argv.index("--") + 1 :]
    return dict(pair.split("=", 1) for pair in pairs)


def to_blender(position, centroid):
    x, y, z = position
    return (x - centroid[0], -(z - centroid[1]), y)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    return scene


def collection(name, parent=None):
    created = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(created)
    return created


def mesh_from_geometry(name, geometry, centroid, target):
    attributes = geometry["attributes"]
    positions = attributes["position"]["array"]
    vertex_count = len(positions) // 3
    vertices = [
        to_blender(positions[i * 3 : i * 3 + 3], centroid) for i in range(vertex_count)
    ]
    index = geometry["index"] or list(range(vertex_count))
    faces = [
        (index[i], index[i + 2], index[i + 1]) for i in range(0, len(index), 3)
    ]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    for attribute_name, attribute in attributes.items():
        if attribute_name in ("position", "normal", "uv"):
            continue
        values = attribute["array"]
        size = attribute["itemSize"]
        if attribute_name == "color":
            layer = mesh.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
            for i in range(vertex_count):
                layer.data[i].color = (*values[i * size : i * size + 3], 1.0)
        else:
            layer = mesh.attributes.new(attribute_name, "FLOAT", "POINT")
            layer.data.foreach_set("value", values[:vertex_count])
    obj = bpy.data.objects.new(name, mesh)
    target.objects.link(obj)
    return obj


def add_point_attributes(obj, channels):
    for name, values in channels.items():
        layer = obj.data.attributes.new(name, "FLOAT", "POINT")
        layer.data.foreach_set("value", values)


def surface_to_faces(obj):
    mesh = obj.data
    point_values = [0.0] * len(mesh.vertices)
    mesh.attributes["surface"].data.foreach_get("value", point_values)
    face_layer = mesh.attributes.new("surface_face", "FLOAT", "FACE")
    face_layer.data.foreach_set(
        "value", [point_values[polygon.vertices[0]] for polygon in mesh.polygons]
    )
    mesh.attributes.remove(mesh.attributes["surface"])
    face_layer.name = "surface"


def top_down_uv(obj):
    mesh = obj.data
    xs = [vertex.co.x for vertex in mesh.vertices]
    ys = [vertex.co.y for vertex in mesh.vertices]
    low_x, low_y = min(xs), min(ys)
    span = max(max(xs) - low_x, max(ys) - low_y)
    layer = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        co = mesh.vertices[loop.vertex_index].co
        layer.data[loop.index].uv = ((co.x - low_x) / span, (co.y - low_y) / span)
    return low_x, low_y, span


def weld(obj, distance=1e-4):
    data = bmesh.new()
    data.from_mesh(obj.data)
    bmesh.ops.remove_doubles(data, verts=data.verts, dist=distance)
    data.to_mesh(obj.data)
    data.free()


TRIANGLE_BUDGETS = {
    "village-house": 900,
    "windmill": 1200,
    "horse": 1500,
    "deer": 1500,
}


def decimate(mesh, budget):
    triangles = sum(len(polygon.vertices) - 2 for polygon in mesh.polygons)
    if triangles <= budget:
        return mesh
    holder = bpy.data.objects.new(f"decimate-{mesh.name}", mesh)
    bpy.context.scene.collection.objects.link(holder)
    modifier = holder.modifiers.new("decimate", "DECIMATE")
    modifier.ratio = budget / triangles
    modifier.use_collapse_triangulate = True
    reduced = bpy.data.meshes.new_from_object(holder.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    name = mesh.name
    bpy.data.objects.remove(holder, do_unlink=True)
    bpy.data.meshes.remove(mesh)
    reduced.name = name
    return reduced


TREE_PALETTES = {
    "oak": [("#2c5a1d", "#76ad36"), ("#30601e", "#84b83c"), ("#355f1c", "#93c044"), ("#6a561a", "#d4a336")],
    "pine": [("#1c4626", "#468236"), ("#204a22", "#4f8c38"), ("#1a4224", "#3f7a32")],
    "birch": [("#4a6e22", "#a3c84a"), ("#527524", "#b0cf50"), ("#7e631c", "#e0bd45")],
}
TRUNKS = {"oak": "#6b4a2e", "pine": "#5a3d26", "birch": "#ece6d8"}


def wobble(bm, amount, seed):
    for vertex in bm.verts:
        co = vertex.co
        offset = math.sin(co.x * 13.1 + seed) * math.cos(co.y * 11.7 - seed) * math.sin(co.z * 9.3 + seed * 0.5)
        vertex.co += vertex.normal * offset * amount


def tree_colors(mesh, trunk_top, trunk, dark, light):
    mesh.calc_loop_triangles()
    heights = [vertex.co.z for vertex in mesh.vertices]
    top = max(heights)
    layer = mesh.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
    trunk_color, dark_color, light_color = srgb(trunk), srgb(dark), srgb(light)
    for vertex in mesh.vertices:
        if vertex.co.z < trunk_top and math.hypot(vertex.co.x, vertex.co.y) < 0.07:
            layer.data[vertex.index].color = trunk_color
            continue
        t = (vertex.co.z - trunk_top) / max(1e-4, top - trunk_top)
        mix = min(1.0, max(0.0, t * 0.55 + vertex.normal.z * 0.35 + 0.15))
        layer.data[vertex.index].color = tuple(d + (l - d) * mix for d, l in zip(dark_color, light_color))


def trunk(bm, height, radius):
    bmesh.ops.create_cone(bm, cap_ends=False, segments=6, radius1=radius, radius2=radius * 0.65, depth=height, matrix=Matrix.Translation((0, 0, height / 2)))


def leafy_tree(name, seed, kind, palette):
    rnd = __import__("random").Random(seed)
    bm = bmesh.new()
    trunk_height = 0.42 if kind == "oak" else 0.5
    trunk(bm, trunk_height, 0.055 if kind == "oak" else 0.04)
    blobs = 4 if kind == "oak" else 3
    for index in range(blobs):
        angle = index / blobs * math.tau + rnd.uniform(-0.4, 0.4)
        spread = 0.0 if index == 0 else rnd.uniform(0.12, 0.2)
        radius = rnd.uniform(0.24, 0.32) if kind == "oak" else rnd.uniform(0.18, 0.24)
        center = (math.cos(angle) * spread, math.sin(angle) * spread, trunk_height + radius * rnd.uniform(0.55, 0.95) + (0.12 if index == 0 else 0))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=radius, matrix=Matrix.Translation(center))
    bm.normal_update()
    wobble(bm, 0.035, seed)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.shade_smooth()
    tree_colors(mesh, trunk_height * 0.85, TRUNKS[kind], *palette)
    return mesh


def pine_tree(name, seed, palette):
    rnd = __import__("random").Random(seed)
    bm = bmesh.new()
    trunk(bm, 0.3, 0.045)
    base, radius = 0.18, 0.3
    for layer in range(4):
        depth = 0.36 - layer * 0.04
        rotation = Matrix.Rotation(rnd.uniform(0, math.tau), 4, "Z")
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=radius, radius2=0.0, depth=depth, matrix=Matrix.Translation((0, 0, base + depth / 2)) @ rotation)
        base += depth * 0.55
        radius *= 0.76
    bm.normal_update()
    wobble(bm, 0.015, seed)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.shade_smooth()
    tree_colors(mesh, 0.2, TRUNKS["pine"], *palette)
    return mesh


AUTUMN_SHARE = 0.08


def pick_tree(variants, index):
    if name_hash(index, 0.7548777) < AUTUMN_SHARE:
        return variants[-1]
    return variants[int(name_hash(index, 0.5698403) * (len(variants) - 1))]


def name_hash(index, step):
    return (index * step) % 1


def stylized_trees(material):
    variants = {
        "oak": [leafy_tree(f"oak-{i}", 100 + i, "oak", palette) for i, palette in enumerate(TREE_PALETTES["oak"])],
        "pine": [pine_tree(f"pine-{i}", 200 + i, palette) for i, palette in enumerate(TREE_PALETTES["pine"])],
        "birch": [leafy_tree(f"birch-{i}", 300 + i, "birch", palette) for i, palette in enumerate(TREE_PALETTES["birch"])],
    }
    for meshes in variants.values():
        for mesh in meshes:
            mesh.materials.append(material)
    return variants


def import_model(name, base_cut, library):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(MODELS_DIR / f"{name}.glb"))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    source = next(obj for obj in imported if obj.type == "MESH")
    mesh = source.data.copy()
    mesh.transform(source.matrix_world)
    mesh.name = name
    for obj in imported:
        bpy.data.objects.remove(obj, do_unlink=True)
    if base_cut > 0:
        heights = [vertex.co.z for vertex in mesh.vertices]
        low, high = min(heights), max(heights)
        cut = low + (high - low) * base_cut
        data = bmesh.new()
        data.from_mesh(mesh)
        doomed = [face for face in data.faces if max(v.co.z for v in face.verts) < cut]
        bmesh.ops.delete(data, geom=doomed, context="FACES")
        data.to_mesh(mesh)
        data.free()
    if name in TRIANGLE_BUDGETS:
        mesh = decimate(mesh, TRIANGLE_BUDGETS[name])
    proto = bpy.data.objects.new(f"proto-{name}", mesh)
    library.objects.link(proto)
    return mesh


TREE_MODELS = ("pine", "oak", "birch")


def place_instances(base, centroid, target, tree_ratio):
    meshes = {}
    trees = stylized_trees(vertex_color_material("trees"))
    library = collection("library")
    library.hide_render = True
    library.hide_viewport = True
    groups = {}
    for index, instance in enumerate(base["instances"]):
        name = instance["model"]
        is_tree = name in TREE_MODELS
        if is_tree and (index * 0.618034) % 1 > tree_ratio:
            continue
        if is_tree and name not in groups:
            groups[name] = bpy.data.objects.new(f"instances-{name}", None)
            target.objects.link(groups[name])
        if not is_tree and name not in meshes:
            meshes[name] = import_model(name, base["baseCuts"].get(name, 0), library)
            groups[name] = bpy.data.objects.new(f"instances-{name}", None)
            target.objects.link(groups[name])
        sx, sy, sz = instance["scale"]
        mesh = pick_tree(trees[name], index) if is_tree else meshes[name]
        obj = bpy.data.objects.new(name, mesh)
        obj.location = to_blender(instance["position"], centroid)
        obj.rotation_euler = (0, 0, instance["rotation"])
        obj.scale = (sx, sz, sy)
        obj.parent = groups[name]
        target.objects.link(obj)
    return meshes


def add_anchors(base, centroid, target):
    for place in base["places"]:
        anchor = bpy.data.objects.new(f"place-{place['id']}", None)
        anchor.location = to_blender(place["position"], centroid)
        anchor.rotation_euler = (0, 0, place["rotation"])
        anchor["model"] = place["model"]
        anchor["width"] = place["width"]
        target.objects.link(anchor)
    for fall in base["waterfalls"]:
        anchor = bpy.data.objects.new(f"waterfall-{fall['id']}", None)
        anchor.location = to_blender(fall["position"], centroid)
        anchor.rotation_euler = (0, 0, fall["rotation"])
        anchor["width"] = fall["width"]
        target.objects.link(anchor)


def basic_material(name, color, roughness=0.9):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes["Principled BSDF"]
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Roughness"].default_value = roughness
    return material


def vertex_color_material(name):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    shader = nodes["Principled BSDF"]
    shader.inputs["Roughness"].default_value = 0.95
    color = nodes.new("ShaderNodeVertexColor")
    color.layer_name = "Col"
    material.node_tree.links.new(color.outputs["Color"], shader.inputs["Base Color"])
    return material


FIELD_ANGLE = 0.45


class Graph:
    def __init__(self, material):
        material.use_nodes = True
        self.tree = material.node_tree
        self.tree.nodes.clear()

    def node(self, kind, inputs=None, **props):
        created = self.tree.nodes.new(kind)
        for key, value in props.items():
            setattr(created, key, value)
        for key, value in (inputs or {}).items():
            self.connect(value, created.inputs[key])
        return created

    def connect(self, value, socket):
        if hasattr(value, "is_output"):
            self.tree.links.new(value, socket)
        else:
            socket.default_value = value

    def math(self, operation, a, b=0.0, c=0.0):
        created = self.node("ShaderNodeMath", operation=operation)
        for socket, value in zip(created.inputs, (a, b, c)):
            self.connect(value, socket)
        return created.outputs[0]

    def mix(self, factor, a, b, blend="MIX"):
        created = self.node("ShaderNodeMix", data_type="RGBA", blend_type=blend, clamp_result=True)
        self.connect(factor, created.inputs[0])
        self.connect(a, created.inputs[6])
        self.connect(b, created.inputs[7])
        return created.outputs[2]

    def smooth(self, low, high, value):
        created = self.node("ShaderNodeMapRange", interpolation_type="SMOOTHSTEP")
        self.connect(value, created.inputs["Value"])
        created.inputs["From Min"].default_value = low
        created.inputs["From Max"].default_value = high
        return created.outputs["Result"]

    def noise(self, vector, scale, detail=2.0, roughness=0.5):
        return self.node(
            "ShaderNodeTexNoise",
            {"Vector": vector, "Scale": scale, "Detail": detail, "Roughness": roughness},
        ).outputs["Fac"]

    def voronoi(self, vector, scale, feature="F1"):
        created = self.node("ShaderNodeTexVoronoi", {"Vector": vector, "Scale": scale}, feature=feature)
        return created.outputs["Distance"]


def srgb(hex_color):
    channels = [int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return (*linear, 1.0)


GROUND = {
    "meadow": "#7fb83a",
    "meadow_deep": "#4c8a26",
    "upland": "#5b9529",
    "marsh": "#7c9c46",
    "forest_floor": "#3a6e22",
    "bank": "#a9c066",
    "sunlit": "#c4d65a",
    "shadow": "#3f7a3a",
    "wheat_light": "#f0cf62",
    "wheat_dark": "#c9952f",
    "young": "#b3d15a",
    "lavender_light": "#c7a0ec",
    "lavender_dark": "#7a4fb0",
    "hedge": "#3c6f22",
}


def field_mask(base, uv_frame, size):
    low_x, low_y, span = uv_frame
    centroid = base["centroid"]
    fields = base["fields"]
    cos, sin = math.cos(fields["angle"]), math.sin(fields["angle"])
    lookup = {(cu, cv): kind for cu, cv, kind in fields["cells"]}
    coords = (np.arange(size, dtype=np.float32) + 0.5) / size * span
    grid_x, grid_y = np.meshgrid(low_x + coords, low_y + coords)
    x3 = grid_x + centroid[0]
    z3 = -grid_y + centroid[1]
    u = (x3 * cos - z3 * sin) / fields["width"]
    v = (x3 * sin + z3 * cos) / fields["depth"]
    cell_u, cell_v = np.floor(u).astype(np.int32), np.floor(v).astype(np.int32)
    kinds = np.full((size, size), -1, dtype=np.int8)
    for (cu, cv), kind in lookup.items():
        kinds[(cell_u == cu) & (cell_v == cv)] = kind
    inset_u = np.minimum(u - cell_u, 1 - (u - cell_u)) * fields["width"]
    inset_v = np.minimum(v - cell_v, 1 - (v - cell_v)) * fields["depth"]
    inset = np.minimum(inset_u, inset_v)
    inner = np.clip((inset - 0.03) / 0.02, 0, 1)
    hedge = np.clip(1 - np.abs(inset - 0.012) / 0.012, 0, 1) * (kinds >= 0)
    pixels = np.zeros((size, size, 4), dtype=np.float32)
    for channel in range(3):
        pixels[..., channel] = (kinds == channel) * inner
    pixels[..., 3] = hedge
    image = bpy.data.images.new("fields", size, size, alpha=True, float_buffer=False)
    image.colorspace_settings.name = "Non-Color"
    image.pixels.foreach_set(pixels.ravel())
    return image, kinds


def painted_ground(graph, fields_image):
    position = graph.node("ShaderNodeTexCoord").outputs["Object"]
    uv = graph.node("ShaderNodeUVMap", uv_map="UVMap").outputs["UV"]
    attribute = lambda name: graph.node("ShaderNodeAttribute", attribute_name=name).outputs["Fac"]
    wetness, forest, lowland = attribute("wetness"), attribute("forest"), attribute("lowland")
    height = graph.node("ShaderNodeSeparateXYZ", {"Vector": position}).outputs["Z"]
    field_texture = graph.node("ShaderNodeTexImage", {"Vector": uv}, image=fields_image, interpolation="Cubic")
    field_channels = graph.node("ShaderNodeSeparateColor", {"Color": field_texture.outputs["Color"]}).outputs
    wheat, lavender, young = field_channels[0], field_channels[1], field_channels[2]
    hedge = field_texture.outputs["Alpha"]
    separated = graph.node("ShaderNodeSeparateXYZ", {"Vector": position}).outputs
    along = graph.math(
        "ADD",
        graph.math("MULTIPLY", separated["X"], math.cos(FIELD_ANGLE)),
        graph.math("MULTIPLY", separated["Y"], math.sin(FIELD_ANGLE)),
    )

    color = graph.mix(graph.smooth(-0.1, 0.9, graph.noise(position, 0.45, 3.0)), srgb(GROUND["meadow"]), srgb(GROUND["meadow_deep"]))
    color = graph.mix(graph.smooth(0.75, 1.15, height), color, srgb(GROUND["upland"]))
    color = graph.mix(graph.math("MULTIPLY", lowland, 0.5), color, srgb(GROUND["marsh"]))
    color = graph.mix(graph.smooth(0.3, 0.7, forest), color, srgb(GROUND["forest_floor"]))
    sunny = graph.smooth(0.5, 0.78, graph.noise(position, 0.3, 3.0))
    color = graph.mix(graph.math("MULTIPLY", sunny, 0.45), color, srgb(GROUND["sunlit"]))
    dabs = graph.smooth(0.42, 0.72, graph.noise(position, 2.6, 4.0, 0.7))
    color = graph.mix(graph.math("MULTIPLY", dabs, 0.45), color, srgb(GROUND["shadow"]))
    strokes = graph.smooth(0.55, 0.85, graph.noise(graph.node("ShaderNodeMapping", {"Vector": position, "Scale": (1.0, 4.0, 1.0)}).outputs[0], 9.0, 3.0))
    color = graph.mix(graph.math("MULTIPLY", strokes, 0.4), color, srgb(GROUND["sunlit"]))
    grain = graph.smooth(0.35, 0.7, graph.noise(position, 40.0, 4.0))
    color = graph.mix(graph.math("MULTIPLY", grain, 0.12), color, (0.0, 0.0, 0.0, 1), "MIX")
    color = graph.mix(graph.math("MULTIPLY", graph.smooth(0.85, 1.0, wetness), 0.45), color, srgb(GROUND["bank"]))

    wheat_rows = graph.math("MULTIPLY_ADD", graph.math("SINE", graph.math("MULTIPLY", along, 75.0)), 0.5, 0.5)
    wheat_color = graph.mix(wheat_rows, srgb(GROUND["wheat_dark"]), srgb(GROUND["wheat_light"]))
    young_rows = graph.math("MULTIPLY_ADD", graph.math("SINE", graph.math("MULTIPLY", along, 75.0)), 0.5, 0.5)
    young_color = graph.mix(young_rows, graph.mix(1.0, srgb(GROUND["young"]), (0.8, 0.85, 0.75, 1), "MULTIPLY"), srgb(GROUND["young"]))
    lavender_rows = graph.smooth(0.25, 0.75, graph.math("MULTIPLY_ADD", graph.math("SINE", graph.math("MULTIPLY", along, 62.0)), 0.5, 0.5))
    bloom = graph.mix(graph.smooth(0.35, 0.75, graph.noise(position, 60.0, 3.0)), srgb(GROUND["lavender_dark"]), srgb(GROUND["lavender_light"]))
    lavender_color = graph.mix(lavender_rows, srgb(GROUND["forest_floor"]), bloom)

    color = graph.mix(hedge, color, srgb(GROUND["hedge"]))
    color = graph.mix(wheat, color, wheat_color)
    color = graph.mix(young, color, young_color)
    color = graph.mix(lavender, color, lavender_color)
    return color


def bake_terrain(obj, base, uv_frame, size):
    material = bpy.data.materials.new("terrain-bake")
    graph = Graph(material)
    fields_image, kinds = field_mask(base, uv_frame, size)
    emission = graph.node("ShaderNodeEmission", {"Color": painted_ground(graph, fields_image)})
    graph.node("ShaderNodeOutputMaterial", {"Surface": emission.outputs[0]})
    image = bpy.data.images.new("terrain", size, size, alpha=False)
    target = graph.node("ShaderNodeTexImage", image=image)
    graph.tree.nodes.active = target
    obj.data.materials.clear()
    obj.data.materials.append(material)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 1
    scene.render.bake.margin = 4
    for other in bpy.context.view_layer.objects:
        other.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.bake(type="EMIT")
    image.pack()
    final = bpy.data.materials.new("terrain")
    final_graph = Graph(final)
    texture = final_graph.node("ShaderNodeTexImage", image=image)
    shader = final_graph.node(
        "ShaderNodeBsdfPrincipled", {"Base Color": texture.outputs["Color"], "Roughness": 0.95}
    )
    final_graph.node("ShaderNodeOutputMaterial", {"Surface": shader.outputs[0]})
    obj.data.materials.clear()
    obj.data.materials.append(final)
    return kinds


LIP_PROFILE = [(0.0, 0.0), (0.06, -0.025), (0.1, -0.09), (0.11, -0.17), (0.08, -0.25), (0.02, -0.31)]
LIP_COLORS = [(0.36, 0.62, 0.14), (0.32, 0.58, 0.12), (0.26, 0.5, 0.1), (0.2, 0.42, 0.08), (0.15, 0.34, 0.07), (0.12, 0.28, 0.06)]


def ring_with_normals(base):
    centroid = base["centroid"]
    ring = [(x - centroid[0], -(z - centroid[1])) for x, z in base["boundary"]]
    area = sum(ax * by - bx * ay for (ax, ay), (bx, by) in zip(ring, ring[1:] + ring[:1]))
    side = 1 if area < 0 else -1
    normals = []
    for i, (x, y) in enumerate(ring):
        px, py = ring[i - 1]
        nx_, ny_ = ring[(i + 1) % len(ring)]
        tx, ty = nx_ - px, ny_ - py
        length = math.hypot(tx, ty) or 1
        normals.append((side * ty / length, -side * tx / length))
    return ring, normals


def grass_lip(base, target):
    ring, normals = ring_with_normals(base)
    height = base["rimHeight"]
    vertices = []
    colors = []
    for (x, y), (nx, ny) in zip(ring, normals):
        for level, (out, down) in enumerate(LIP_PROFILE):
            sag = 0.0
            if level == len(LIP_PROFILE) - 1:
                sag = -0.12 * max(0.0, math.sin(x * 7.1 + y * 5.3) * math.sin(x * 2.3 - y * 3.7))
            vertices.append((x + nx * out, y + ny * out, height + down + sag))
            colors.append(LIP_COLORS[level])
    levels = len(LIP_PROFILE)
    faces = []
    for i in range(len(ring)):
        j = (i + 1) % len(ring)
        for level in range(levels - 1):
            a, b = i * levels + level, j * levels + level
            faces.append((a, b, b + 1, a + 1))
    mesh = bpy.data.meshes.new("grass-lip")
    mesh.from_pydata(vertices, [], faces)
    layer = mesh.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
    for i, color in enumerate(colors):
        layer.data[i].color = (*color, 1.0)
    mesh.shade_smooth()
    obj = bpy.data.objects.new("grass-lip", mesh)
    target.objects.link(obj)
    obj.data.materials.append(vertex_color_material("grass-lip"))
    return obj


def golden_rim(base, target):
    ring, normals = ring_with_normals(base)
    height = base["rimHeight"] + 0.004
    vertices = []
    for (x, y), (nx, ny) in zip(ring, normals):
        vertices.append((x - nx * 0.01, y - ny * 0.01, height))
        vertices.append((x + nx * 0.045, y + ny * 0.045, height - 0.012))
    faces = []
    for i in range(len(ring)):
        j = (i + 1) % len(ring)
        faces.append((i * 2, j * 2, j * 2 + 1, i * 2 + 1))
    mesh = bpy.data.meshes.new("golden-rim")
    mesh.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new("golden-rim", mesh)
    target.objects.link(obj)
    material = bpy.data.materials.new("golden-rim")
    graph = Graph(material)
    shader = graph.node(
        "ShaderNodeBsdfPrincipled",
        {
            "Base Color": (1.0, 0.78, 0.32, 1),
            "Emission Color": (1.0, 0.72, 0.28, 1),
            "Emission Strength": 0.9,
            "Roughness": 0.6,
        },
    )
    graph.node("ShaderNodeOutputMaterial", {"Surface": shader.outputs[0]})
    obj.data.materials.append(material)
    return obj


FOLIAGE = {
    "grass_root": "#2f6a1c",
    "grass_tip": "#a6d24a",
    "grass_tip_warm": "#cfd85a",
    "stem": "#3f7a24",
    "pink": "#f28dbd",
    "white": "#fff4e6",
    "violet": "#b98ae8",
    "wheat_root": "#b8862c",
    "wheat_tip": "#f6d978",
    "lavender_bush": "#3b5e2a",
    "lavender": "#a777e0",
    "pebble_light": "#e8e1d4",
    "pebble_dark": "#9c958a",
}


class MeshBuilder:
    def __init__(self):
        self.vertices = []
        self.faces = []
        self.colors = []

    def vertex(self, position, color):
        self.vertices.append(position)
        self.colors.append(srgb(color) if isinstance(color, str) else color)
        return len(self.vertices) - 1

    def blade(self, x, y, angle, lean, width, height, root, tip):
        dx, dy = math.cos(angle), math.sin(angle)
        px, py = -dy * width / 2, dx * width / 2
        mid_color = tuple((a + b) / 2 for a, b in zip(srgb(root), srgb(tip)))
        a = self.vertex((x - px, y - py, 0), root)
        b = self.vertex((x + px, y + py, 0), root)
        c = self.vertex((x + px * 0.6 + dx * lean * 0.4, y + py * 0.6 + dy * lean * 0.4, height * 0.55), mid_color)
        d = self.vertex((x - px * 0.6 + dx * lean * 0.4, y - py * 0.6 + dy * lean * 0.4, height * 0.55), mid_color)
        e = self.vertex((x + dx * lean, y + dy * lean, height), tip)
        self.faces += [(a, b, c, d), (d, c, e)]

    def gem(self, center, radius, height, color, sides=4):
        cx, cy, cz = center
        top = self.vertex((cx, cy, cz + height), color)
        bottom = self.vertex((cx, cy, cz - height * 0.4), color)
        ring = [
            self.vertex((cx + math.cos(i / sides * math.tau) * radius, cy + math.sin(i / sides * math.tau) * radius, cz), color)
            for i in range(sides)
        ]
        for i in range(sides):
            j = (i + 1) % sides
            self.faces += [(ring[i], ring[j], top), (ring[j], ring[i], bottom)]

    def build(self, name):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(self.vertices, [], self.faces)
        layer = mesh.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
        for i, color in enumerate(self.colors):
            layer.data[i].color = color
        mesh.shade_smooth()
        return mesh


def grass_tuft(seed, tip):
    rnd = __import__("random").Random(seed)
    builder = MeshBuilder()
    for _ in range(9):
        r = rnd.uniform(0, 0.012)
        angle = rnd.uniform(0, math.tau)
        builder.blade(math.cos(angle) * r, math.sin(angle) * r, angle, rnd.uniform(0.008, 0.02), 0.012, rnd.uniform(0.045, 0.075), FOLIAGE["grass_root"], FOLIAGE[tip])
    return builder.build(f"grass-tuft-{seed}")


def flower_clump(seed, petal):
    rnd = __import__("random").Random(seed)
    builder = MeshBuilder()
    for _ in range(5):
        angle = rnd.uniform(0, math.tau)
        builder.blade(0, 0, angle, rnd.uniform(0.006, 0.015), 0.01, rnd.uniform(0.035, 0.05), FOLIAGE["grass_root"], FOLIAGE["grass_tip"])
    for _ in range(4):
        angle = rnd.uniform(0, math.tau)
        r = rnd.uniform(0.005, 0.02)
        builder.gem((math.cos(angle) * r, math.sin(angle) * r, rnd.uniform(0.04, 0.06)), 0.011, 0.012, srgb(FOLIAGE[petal]))
    return builder.build(f"flowers-{petal}")


def wheat_clump(seed):
    rnd = __import__("random").Random(seed)
    builder = MeshBuilder()
    for _ in range(7):
        angle = rnd.uniform(0, math.tau)
        r = rnd.uniform(0, 0.014)
        x, y = math.cos(angle) * r, math.sin(angle) * r
        lean = rnd.uniform(0.004, 0.012)
        height = rnd.uniform(0.06, 0.08)
        builder.blade(x, y, angle, lean, 0.006, height, FOLIAGE["wheat_root"], FOLIAGE["wheat_tip"])
        builder.gem((x + math.cos(angle) * lean, y + math.sin(angle) * lean, height), 0.006, 0.022, srgb(FOLIAGE["wheat_tip"]))
    return builder.build("wheat")


def lavender_bush(seed):
    rnd = __import__("random").Random(seed)
    builder = MeshBuilder()
    builder.gem((0, 0, 0.015), 0.035, 0.03, srgb(FOLIAGE["lavender_bush"]), sides=7)
    for _ in range(9):
        angle = rnd.uniform(0, math.tau)
        r = rnd.uniform(0.005, 0.028)
        builder.gem((math.cos(angle) * r, math.sin(angle) * r, rnd.uniform(0.05, 0.065)), 0.008, 0.028, srgb(FOLIAGE["lavender"]))
    return builder.build("lavender")


def pebble(seed):
    rnd = __import__("random").Random(seed)
    builder = MeshBuilder()
    for _ in range(3):
        angle = rnd.uniform(0, math.tau)
        r = rnd.uniform(0, 0.03)
        color = FOLIAGE["pebble_light"] if rnd.random() < 0.6 else FOLIAGE["pebble_dark"]
        builder.gem((math.cos(angle) * r, math.sin(angle) * r, 0.0), rnd.uniform(0.012, 0.022), rnd.uniform(0.008, 0.016), srgb(color), sides=6)
    return builder.build(f"pebbles-{seed}")


def surface_points(terrain, count, seed):
    mesh = terrain.data
    mesh.calc_loop_triangles()
    tris = np.array([tri.vertices[:] for tri in mesh.loop_triangles], dtype=np.int64)
    co = np.empty(len(mesh.vertices) * 3, dtype=np.float64)
    mesh.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    a, b, c = co[tris[:, 0]], co[tris[:, 1]], co[tris[:, 2]]
    areas = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
    rng = np.random.default_rng(seed)
    picked = rng.choice(len(tris), size=count, p=areas / areas.sum())
    u, v = rng.random(count), rng.random(count)
    flip = u + v > 1
    u[flip], v[flip] = 1 - u[flip], 1 - v[flip]
    w = 1 - u - v
    points = a[picked] * w[:, None] + b[picked] * u[:, None] + c[picked] * v[:, None]

    def sample(name):
        values = np.empty(len(mesh.vertices), dtype=np.float64)
        mesh.attributes[name].data.foreach_get("value", values)
        t = tris[picked]
        return values[t[:, 0]] * w + values[t[:, 1]] * u + values[t[:, 2]] * v

    data = {name: sample(name) for name in ("wetness", "forest", "edge")}
    return points, data, rng


def field_kind_at(points, kinds, uv_frame):
    low_x, low_y, span = uv_frame
    size = kinds.shape[0]
    columns = np.clip(((points[:, 0] - low_x) / span * size).astype(np.int64), 0, size - 1)
    rows = np.clip(((points[:, 1] - low_y) / span * size).astype(np.int64), 0, size - 1)
    return kinds[rows, columns]


def clear_of_places(points, base, padding):
    keep = np.ones(len(points), dtype=bool)
    centroid = base["centroid"]
    for place in base["places"]:
        px, py, _ = to_blender(place["position"], centroid)
        radius = place["width"] / 2 + padding
        keep &= np.hypot(points[:, 0] - px, points[:, 1] - py) > radius
    return keep


def scatter(points, rng, variants, target, name, scale_range):
    group = bpy.data.objects.new(f"scatter-{name}", None)
    target.objects.link(group)
    for point in points:
        mesh = variants[rng.integers(len(variants))]
        obj = bpy.data.objects.new(name, mesh)
        obj.location = point
        obj.rotation_euler = (0, 0, rng.uniform(0, math.tau))
        obj.scale = (rng.uniform(*scale_range),) * 3
        obj.parent = group
        target.objects.link(obj)


def foliage_material():
    material = vertex_color_material("foliage")
    material.use_backface_culling = False
    return material


def add_ground_cover(base, terrain, kinds, uv_frame, target, density):
    material = foliage_material()
    meshes = {
        "grass": [grass_tuft(seed, tip) for seed, tip in ((1, "grass_tip"), (2, "grass_tip_warm"), (3, "grass_tip"))],
        "flowers": [flower_clump(10, "pink"), flower_clump(11, "white"), flower_clump(12, "violet"), flower_clump(13, "pink")],
        "wheat": [wheat_clump(20), wheat_clump(21)],
        "lavender": [lavender_bush(30), lavender_bush(31)],
        "pebbles": [pebble(40), pebble(41)],
    }
    for variants in meshes.values():
        for mesh in variants:
            mesh.materials.append(material)

    points, data, rng = surface_points(terrain, int(60000 * density), 1637)
    field = field_kind_at(points, kinds, uv_frame)
    open_ground = (field < 0) & clear_of_places(points, base, 0.12) & (data["edge"] > 0.06)
    meadow = open_ground & (data["forest"] < 0.45) & (data["wetness"] < 0.45)
    flower_patch = np.sin(points[:, 0] * 1.7 + np.cos(points[:, 1] * 1.3) * 2) * np.sin(points[:, 1] * 2.1) > 0.45
    grass_pick = meadow & (rng.random(len(points)) < 0.4)
    flower_pick = meadow & flower_patch & (rng.random(len(points)) < 0.14)
    pebble_pick = open_ground & (data["wetness"] > 0.55) & (data["wetness"] < 0.92) & (rng.random(len(points)) < 0.18)
    wheat_pick = (field == 0) & (rng.random(len(points)) < 0.55)
    lavender_pick = (field == 2) & (rng.random(len(points)) < 0.5)
    scatter(points[grass_pick], rng, meshes["grass"], target, "grass", (0.8, 1.4))
    scatter(points[flower_pick & ~grass_pick], rng, meshes["flowers"], target, "flowers", (0.8, 1.2))
    scatter(points[pebble_pick & ~grass_pick], rng, meshes["pebbles"], target, "pebbles", (0.7, 1.3))
    scatter(points[wheat_pick], rng, meshes["wheat"], target, "wheat", (0.85, 1.15))
    scatter(points[lavender_pick], rng, meshes["lavender"], target, "lavender", (0.85, 1.15))
    return {
        "grass": int(grass_pick.sum()),
        "flowers": int((flower_pick & ~grass_pick).sum()),
        "pebbles": int((pebble_pick & ~grass_pick).sum()),
        "wheat": int(wheat_pick.sum()),
        "lavender": int(lavender_pick.sum()),
    }


ROAD_WIDTH = 0.07


def road_ribbons(base, terrain, water, target):
    centroid = base["centroid"]
    ground = BVHTree.FromObject(terrain, bpy.context.evaluated_depsgraph_get())
    river = BVHTree.FromObject(water, bpy.context.evaluated_depsgraph_get())
    vertices, faces = [], []
    for road in base["roads"]:
        points = [(x - centroid[0], -(z - centroid[1])) for x, z in road]
        previous = None
        for index, (x, y) in enumerate(points):
            hit = ground.ray_cast((x, y, 10.0), (0, 0, -1))
            wet = river.ray_cast((x, y, 10.0), (0, 0, -1))[0] is not None
            if hit[0] is None or wet:
                previous = None
                continue
            nx_, ny_ = points[min(index + 1, len(points) - 1)]
            px, py = points[max(index - 1, 0)]
            tx, ty = nx_ - px, ny_ - py
            length = math.hypot(tx, ty) or 1
            side = (-ty / length * ROAD_WIDTH / 2, tx / length * ROAD_WIDTH / 2)
            z = hit[0].z + 0.012
            left = len(vertices)
            vertices.append((x + side[0], y + side[1], z))
            vertices.append((x - side[0], y - side[1], z))
            if previous is not None:
                faces.append((previous, previous + 1, left + 1, left))
            previous = left
    mesh = bpy.data.meshes.new("roads")
    mesh.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new("roads", mesh)
    target.objects.link(obj)
    obj.data.materials.append(basic_material("roads", srgb("#d8b47c")[:3], 1.0))
    return obj


def preview_camera(scene, width, height, distance, focus):
    camera = bpy.data.objects.new("preview-camera", bpy.data.cameras.new("preview-camera"))
    scene.collection.objects.link(camera)
    camera.data.sensor_fit = "VERTICAL"
    camera.data.angle = math.radians(40)
    camera.location = (focus[0], focus[1] - distance * 0.8, focus[2] + distance * 0.6)
    target = bpy.data.objects.new("preview-target", None)
    target.location = focus
    scene.collection.objects.link(target)
    constraint = camera.constraints.new("TRACK_TO")
    constraint.target = target
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"
    scene.camera = camera
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    sun = bpy.data.objects.new("preview-sun", bpy.data.lights.new("preview-sun", "SUN"))
    sun.data.energy = 4.0
    sun.data.color = (1.0, 0.82, 0.6)
    sun.data.angle = math.radians(2)
    scene.collection.objects.link(sun)
    direction = (26, 6, 19)
    sun.rotation_euler = (
        math.atan2(math.hypot(direction[0], direction[1]), direction[2]),
        0,
        math.atan2(direction[0], -direction[1]) + math.pi,
    )
    world = bpy.data.worlds.new("preview-world")
    world.use_nodes = True
    background = world.node_tree.nodes["Background"]
    background.inputs["Color"].default_value = (0.62, 0.66, 0.9, 1)
    background.inputs["Strength"].default_value = 0.9
    scene.world = world
    scene.render.engine = "BLENDER_EEVEE"
    scene.view_settings.view_transform = "Standard"


def rename_attribute(obj, old, new):
    obj.data.attributes[old].name = new


def export_island(path, scene):
    for obj in list(bpy.data.collections["library"].objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_extras=True,
        export_attributes=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_image_format="JPEG",
        export_jpeg_quality=92,
    )


def build():
    args = scene_args()
    base = json.loads((ISLAND_DIR / "base.json").read_text())
    centroid = base["centroid"]
    scene = reset_scene()
    island = collection("island")
    terrain = mesh_from_geometry("terrain", base["terrain"], centroid, island)
    add_point_attributes(terrain, base["terrainSamples"])
    surface_to_faces(terrain)
    weld(terrain)
    terrain.data.shade_smooth()
    uv_frame = top_down_uv(terrain)
    kinds = bake_terrain(terrain, base, uv_frame, int(args.get("texture", "4096")))
    terrain.data.color_attributes.remove(terrain.data.color_attributes["Col"])
    low = args.get("detail") == "low"
    print("SCATTER", add_ground_cover(base, terrain, kinds, uv_frame, island, 0.45 if low else 1.0))
    grass_lip(base, island)
    golden_rim(base, island)
    water = mesh_from_geometry("water", base["water"], centroid, island)
    water.data.materials.append(basic_material("water", (0.1, 0.5, 0.7), 0.1))
    rename_attribute(water, "edge", "_edge")
    rename_attribute(water, "flow", "_flow")
    road_ribbons(base, terrain, water, island)
    cone = mesh_from_geometry("cliff-cone", base["cliffCone"], centroid, island)
    cone.data.materials.append(vertex_color_material("cliff-cone"))
    place_instances(base, centroid, island, 0.4 if low else 1.0)
    anchors = collection("anchors")
    add_anchors(base, centroid, anchors)
    if "out" in args:
        export_island(args["out"], scene)
    if "save" in args:
        bpy.ops.wm.save_as_mainfile(filepath=args["save"])
    if "preview" in args:
        focus = tuple(float(v) for v in args.get("focus", "0,-0.8,-3.2").split(","))
        preview_camera(scene, 1440, 1080, float(args.get("distance", "30")), focus)
        scene.render.filepath = args["preview"]
        bpy.ops.render.render(write_still=True)


build()
