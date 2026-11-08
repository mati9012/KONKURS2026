import math
import random
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]

GRASS = (0.42, 0.62, 0.27)
GRASS_DARK = (0.30, 0.50, 0.22)
SOIL = (0.46, 0.30, 0.19)
SOIL_DARK = (0.33, 0.21, 0.14)
WATER = (0.33, 0.62, 0.80)
COBBLE = (0.66, 0.60, 0.52)
PAVING = (0.84, 0.77, 0.64)
PAVING_DARK = (0.74, 0.67, 0.55)
STONE = (0.82, 0.77, 0.68)
BRICK = (0.66, 0.36, 0.25)
TRUNK = (0.28, 0.18, 0.12)

FORTRESS_RADIUS = 8.6
GROUND_RADIUS = 12.5
MARKET = (3.0, 0.0)
MARKET_HALF = 1.7
TOWNHALL = (MARKET[0], 1.0)
BELFRY_FLOOR = 3.02
TRUMPETER_SCALE = 0.65
PROP_SCALE = 0.6
HOUSE_VARIANTS = ["a", "b", "c", "d"]
MODELS_DIR = ROOT / "assets-src" / "zamosc" / "models"


def scene_args():
    if "--" not in sys.argv:
        return {}
    pairs = sys.argv[sys.argv.index("--") + 1 :]
    return dict(pair.split("=", 1) for pair in pairs)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def vertex_color_material():
    material = bpy.data.materials.new("zamosc")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    shader = nodes["Principled BSDF"]
    shader.inputs["Roughness"].default_value = 0.92
    color = nodes.new("ShaderNodeVertexColor")
    color.layer_name = "Col"
    material.node_tree.links.new(color.outputs["Color"], shader.inputs["Base Color"])
    return material


class Builder:
    def __init__(self):
        self.bm = bmesh.new()
        self.color = self.bm.loops.layers.color.new("Col")

    def paint(self, faces, color):
        for face in faces:
            for loop in face.loops:
                loop[self.color] = (*color, 1.0)

    def add(self, geometry, color, matrix):
        verts = [v for v in geometry if isinstance(v, bmesh.types.BMVert)]
        bmesh.ops.transform(self.bm, matrix=matrix, verts=verts)
        faces = {f for v in verts for f in v.link_faces}
        self.paint(faces, color)
        return faces

    def box(self, center, size, color, rotation=0.0):
        result = bmesh.ops.create_cube(self.bm, size=1.0)
        matrix = (
            Matrix.Translation(Vector(center))
            @ Matrix.Rotation(rotation, 4, "Z")
            @ Matrix.Diagonal((*size, 1.0))
        )
        return self.add(result["verts"], color, matrix)

    def cylinder(self, center, radius, depth, color, segments=12, radius_top=None):
        result = bmesh.ops.create_cone(
            self.bm,
            cap_ends=True,
            segments=segments,
            radius1=radius,
            radius2=radius if radius_top is None else radius_top,
            depth=depth,
        )
        return self.add(result["verts"], color, Matrix.Translation(Vector(center)))

    def polygon_slab(self, points, bottom, top, top_color, side_color):
        lower = [self.bm.verts.new((x, y, bottom)) for x, y in points]
        upper = [self.bm.verts.new((x, y, top)) for x, y in points]
        top_face = self.bm.faces.new(upper)
        bottom_face = self.bm.faces.new(list(reversed(lower)))
        sides = []
        count = len(points)
        for i in range(count):
            j = (i + 1) % count
            sides.append(self.bm.faces.new((lower[i], lower[j], upper[j], upper[i])))
        self.paint([top_face], top_color)
        self.paint([bottom_face, *sides], side_color)
        return [top_face, bottom_face, *sides]

    def to_object(self, name, material, parent=None):
        bmesh.ops.remove_doubles(self.bm, verts=self.bm.verts, dist=1e-5)
        mesh = bpy.data.meshes.new(name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        mesh.materials.append(material)
        mesh.color_attributes.active_color = mesh.color_attributes["Col"]
        mesh.color_attributes.render_color_index = mesh.color_attributes.active_color_index
        for polygon in mesh.polygons:
            polygon.use_smooth = False
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        if parent:
            obj.parent = parent
        return obj


def empty(name, location, extras=None, parent=None):
    obj = bpy.data.objects.new(name, None)
    obj.location = location
    for key, value in (extras or {}).items():
        obj[key] = value
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    return obj


def heptagon(radius, phase=math.pi):
    return [
        (radius * math.cos(phase + 2 * math.pi * i / 7), radius * math.sin(phase + 2 * math.pi * i / 7))
        for i in range(7)
    ]


def building_root(name, origin):
    return empty(f"building-{name}", (*origin, 0.0))


def ground(material):
    b = Builder()
    circle = [
        (GROUND_RADIUS * math.cos(2 * math.pi * i / 48), GROUND_RADIUS * math.sin(2 * math.pi * i / 48))
        for i in range(48)
    ]
    b.polygon_slab(circle, -1.6, -0.05, GRASS, SOIL)
    b.polygon_slab(
        [(x * 0.82, y * 0.82) for x, y in circle], -2.4, -1.55, SOIL_DARK, SOIL_DARK
    )
    b.polygon_slab(heptagon(FORTRESS_RADIUS + 1.35), -0.12, -0.04, WATER, WATER)
    b.polygon_slab(heptagon(FORTRESS_RADIUS + 0.45), -0.08, 0.0, GRASS_DARK, GRASS_DARK)
    rng = random.Random(7)
    for _ in range(60):
        angle = rng.uniform(0, 2 * math.pi)
        distance = rng.uniform(FORTRESS_RADIUS + 2.0, GROUND_RADIUS - 0.6)
        x, y = distance * math.cos(angle), distance * math.sin(angle)
        size = rng.uniform(0.28, 0.5)
        b.cylinder((x, y, 0.18), 0.05, 0.36, TRUNK, segments=5)
        b.cylinder((x, y, 0.36 + size * 0.7), size, size * 1.6, GRASS_DARK, segments=7, radius_top=0.02)
    return b.to_object("ground", material)


class ModelLibrary:
    def __init__(self):
        self.templates = {}

    def template(self, name):
        if name not in self.templates:
            before = set(bpy.data.objects)
            bpy.ops.import_scene.gltf(filepath=str(MODELS_DIR / f"zamosc-{name}.glb"))
            created = [obj for obj in bpy.data.objects if obj not in before]
            mesh = next(obj for obj in created if obj.type == "MESH")
            data = mesh.data
            for obj in created:
                bpy.data.objects.remove(obj, do_unlink=True)
            self.templates[name] = data
        return self.templates[name]

    def place(self, name, parent, location, rotation=0.0, scale=1.0):
        obj = bpy.data.objects.new(f"{parent.name}-{name}", self.template(name))
        bpy.context.scene.collection.objects.link(obj)
        obj.parent = parent
        obj.location = location
        obj.rotation_euler = (0.0, 0.0, rotation)
        obj.scale = (scale, scale, scale)
        return obj


def palace(library):
    root = building_root("palace", (-6.2, 0.0))
    library.place("palace", root, (0, 0, 0), math.pi / 2)
    return root


def grodzka(material):
    root = building_root("grodzka", (0.0, 0.0))
    b = Builder()
    b.box((1.1, 0, 0.025), (12.2, 0.75, 0.05), COBBLE)
    b.box((MARKET[0], 0, 0.02), (0.65, 2 * FORTRESS_RADIUS * 0.82, 0.04), COBBLE)
    for x in range(-4, 8):
        b.box((x + 0.5, 0, 0.055), (0.05, 0.55, 0.01), PAVING_DARK)
    return b.to_object("grodzka-mesh", material, root)


def market(material, library):
    root = building_root("market", MARKET)
    b = Builder()
    b.box((0, 0, 0.04), (2 * MARKET_HALF, 2 * MARKET_HALF, 0.08), PAVING)
    for i in range(-3, 4):
        b.box((i * 0.48, 0, 0.085), (0.03, 2 * MARKET_HALF - 0.1, 0.01), PAVING_DARK)
        b.box((0, i * 0.48, 0.085), (2 * MARKET_HALF - 0.1, 0.03, 0.01), PAVING_DARK)
    for dy in (3.35, -3.35):
        b.box((0, dy, 0.035), (1.6, 1.3, 0.07), PAVING_DARK)
    b.to_object("market-mesh", material, root)
    library.place("props-well", root, (0, -3.35, 0.07), 0.0, PROP_SCALE)
    library.place("props-stall-red", root, (-0.4, 3.35, 0.07), 0.0, PROP_SCALE)
    library.place("props-stall-green", root, (0.4, 3.35, 0.07), 0.0, PROP_SCALE)
    library.place("props-cart", root, (1.2, -1.15, 0.08), math.pi / 2, PROP_SCALE)
    return root


def townhall(library):
    root = building_root("townhall", TOWNHALL)
    library.place("townhall", root, (0, 0, 0))
    return root


def house_variant(index):
    return f"house-{HOUSE_VARIANTS[index % len(HOUSE_VARIANTS)]}"


def houses(library):
    root = building_root("houses", MARKET)
    edge = MARKET_HALF + 0.42
    slots = [-1.35, -0.8, 0.8, 1.35]
    index = 0
    for side, rotation in ((0, 0.0), (1, math.pi / 2), (2, math.pi), (3, -math.pi / 2)):
        for offset in slots:
            if side == 2 and abs(offset) < 1.0:
                continue
            position = Matrix.Rotation(rotation, 4, "Z") @ Vector((offset, -edge, 0))
            library.place(house_variant(index), root, (position.x, position.y, 0), rotation + math.pi)
            index += 1
    blocks = [
        (6.1, 1.9),
        (6.1, -1.9),
        (6.1, 4.1),
        (6.1, -4.1),
        (4.4, 5.2),
        (4.4, -5.2),
        (0.6, 4.4),
        (0.6, -4.4),
        (-1.5, 4.6),
        (-1.5, -4.6),
        (-3.4, 4.2),
        (-3.4, -4.2),
    ]
    for bx, by in blocks:
        facing = 0.0 if by > 0 else math.pi
        for i in range(3):
            local = (bx - MARKET[0] + (i - 1) * 0.6, by - MARKET[1], 0)
            library.place(house_variant(index), root, local, facing)
            index += 1
    return root


def collegiate(library):
    root = building_root("collegiate", (-1.6, -2.15))
    library.place("collegiate", root, (0, 0, 0))
    return root


def academy(library):
    root = building_root("academy", (-1.6, 2.2))
    library.place("academy", root, (0, 0, 0))
    return root


def fortress(material, library):
    root = building_root("fortress", (0.0, 0.0))
    b = Builder()
    corners = heptagon(FORTRESS_RADIUS)
    for i, (x0, y0) in enumerate(corners):
        x1, y1 = corners[(i + 1) % 7]
        length = math.hypot(x1 - x0, y1 - y0)
        angle = math.atan2(y1 - y0, x1 - x0)
        b.box(((x0 + x1) / 2, (y0 + y1) / 2, 0.32), (length - 1.2, 0.32, 0.64), BRICK, angle)
        b.box(((x0 + x1) / 2, (y0 + y1) / 2, 0.68), (length - 1.2, 0.36, 0.08), STONE, angle)
    b.to_object("fortress-mesh", material, root)
    for x, y in corners:
        outward = math.atan2(y, x)
        inset = 0.35
        library.place(
            "bastion",
            root,
            (x - math.cos(outward) * inset, y - math.sin(outward) * inset, 0),
            outward + math.pi / 2,
        )
    for side in (1, -1):
        library.place("gate", root, (MARKET[0], side * FORTRESS_RADIUS * 0.9, 0), 0.0)
    return root


def trumpeter(library):
    root = empty("trumpeter", (TOWNHALL[0], TOWNHALL[1], BELFRY_FLOOR))
    library.place("trumpeter", root, (0, 0, 0), 0.0, TRUMPETER_SCALE)
    return root


SOCKETS = {
    "palace": ((-6.2, 0.0), 1.5),
    "grodzka": ((-1.6, 0.0), 0.75),
    "market": (MARKET, 1.3),
    "townhall": ((TOWNHALL[0], TOWNHALL[1] + 0.25), 0.55),
    "houses": ((MARKET[0] + 2.2, -2.2), 0.6),
    "collegiate": ((-1.6, -2.15), 0.95),
    "academy": ((-1.6, 2.2), 0.95),
    "fortress": ((FORTRESS_RADIUS * math.cos(math.pi * 9 / 7), FORTRESS_RADIUS * math.sin(math.pi * 9 / 7)), 1.0),
}


def sockets():
    for name, ((x, y), radius) in SOCKETS.items():
        empty(f"socket-{name}", (x, y, 0.06), {"radius": radius})


def export(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_extras=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_vertex_color="ACTIVE",
        export_all_vertex_colors=False,
    )


def build():
    args = scene_args()
    reset_scene()
    material = vertex_color_material()
    library = ModelLibrary()
    ground(material)
    palace(library)
    grodzka(material)
    market(material, library)
    townhall(library)
    houses(library)
    collegiate(library)
    academy(library)
    fortress(material, library)
    trumpeter(library)
    sockets()
    export(args.get("out", str(ROOT / "public" / "models" / "zamosc-city.glb")))


build()
