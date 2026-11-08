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
ROOF = (0.70, 0.27, 0.18)
ROOF_DARK = (0.55, 0.20, 0.14)
PLASTER = (0.95, 0.89, 0.76)
STONE = (0.82, 0.77, 0.68)
BRICK = (0.66, 0.36, 0.25)
DOOR = (0.28, 0.18, 0.12)
WINDOW = (0.22, 0.26, 0.34)
ARCH = (0.30, 0.22, 0.18)
COPPER = (0.33, 0.55, 0.48)
GOLD = (0.88, 0.70, 0.28)
FACADES = [
    (0.93, 0.70, 0.36),
    (0.86, 0.52, 0.48),
    (0.55, 0.70, 0.78),
    (0.66, 0.78, 0.50),
    (0.95, 0.83, 0.48),
    (0.82, 0.62, 0.80),
]
TRUMPETER_COAT = (0.20, 0.36, 0.62)
SKIN = (0.93, 0.76, 0.62)

FORTRESS_RADIUS = 8.6
GROUND_RADIUS = 12.5
MARKET = (3.0, 0.0)
MARKET_HALF = 1.7
TOWER_TOP = 3.1
BELFRY = 0.8


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

    def sphere(self, center, radius, color, scale=(1.0, 1.0, 1.0)):
        result = bmesh.ops.create_uvsphere(self.bm, u_segments=10, v_segments=6, radius=radius)
        matrix = Matrix.Translation(Vector(center)) @ Matrix.Diagonal((*scale, 1.0))
        return self.add(result["verts"], color, matrix)

    def gable_roof(self, center, size, color, rotation=0.0):
        x, y, z = center
        w, d, h = size
        verts = [
            self.bm.verts.new(p)
            for p in [
                (-w / 2, -d / 2, 0),
                (w / 2, -d / 2, 0),
                (w / 2, d / 2, 0),
                (-w / 2, d / 2, 0),
                (-w / 2, 0, h),
                (w / 2, 0, h),
            ]
        ]
        faces = [
            self.bm.faces.new((verts[0], verts[1], verts[5], verts[4])),
            self.bm.faces.new((verts[2], verts[3], verts[4], verts[5])),
            self.bm.faces.new((verts[0], verts[4], verts[3])),
            self.bm.faces.new((verts[1], verts[2], verts[5])),
            self.bm.faces.new((verts[3], verts[2], verts[1], verts[0])),
        ]
        matrix = Matrix.Translation((x, y, z)) @ Matrix.Rotation(rotation, 4, "Z")
        bmesh.ops.transform(self.bm, matrix=matrix, verts=verts)
        self.paint(faces, color)
        return faces

    def hip_roof(self, center, size, color):
        x, y, z = center
        w, d, h = size
        inset = min(w, d) * 0.35
        verts = [
            self.bm.verts.new(p)
            for p in [
                (x - w / 2, y - d / 2, z),
                (x + w / 2, y - d / 2, z),
                (x + w / 2, y + d / 2, z),
                (x - w / 2, y + d / 2, z),
                (x - w / 2 + inset, y, z + h),
                (x + w / 2 - inset, y, z + h),
            ]
        ]
        faces = [
            self.bm.faces.new((verts[0], verts[1], verts[5], verts[4])),
            self.bm.faces.new((verts[2], verts[3], verts[4], verts[5])),
            self.bm.faces.new((verts[0], verts[4], verts[3])),
            self.bm.faces.new((verts[1], verts[2], verts[5])),
            self.bm.faces.new((verts[3], verts[2], verts[1], verts[0])),
        ]
        self.paint(faces, color)
        return faces

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

    def ring(self, radius_in, radius_out, bottom, top, color, segments):
        inner = [
            (radius_in * math.cos(a), radius_in * math.sin(a))
            for a in (2 * math.pi * i / segments for i in range(segments))
        ]
        outer = [
            (radius_out * math.cos(a), radius_out * math.sin(a))
            for a in (2 * math.pi * i / segments for i in range(segments))
        ]
        faces = []
        for i in range(segments):
            j = (i + 1) % segments
            quad = [
                self.bm.verts.new((*inner[i], top)),
                self.bm.verts.new((*outer[i], top)),
                self.bm.verts.new((*outer[j], top)),
                self.bm.verts.new((*inner[j], top)),
            ]
            faces.append(self.bm.faces.new(quad))
        self.paint(faces, color)
        return faces

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
        b.cylinder((x, y, 0.18), 0.05, 0.36, DOOR, segments=5)
        b.cylinder((x, y, 0.36 + size * 0.7), size, size * 1.6, GRASS_DARK, segments=7, radius_top=0.02)
    return b.to_object("ground", material)


def palace(material):
    root = building_root("palace", (-6.2, 0.0))
    b = Builder()
    b.box((0, 0, 0.6), (2.0, 3.0, 1.2), PLASTER)
    b.hip_roof((0, 0, 1.2), (2.1, 3.1, 0.75), ROOF)
    b.box((0.95, 0, 0.75), (0.5, 1.1, 1.5), STONE)
    b.gable_roof((0.95, 0, 1.5), (0.5, 1.15, 0.45), ROOF_DARK, rotation=math.pi / 2)
    b.box((1.21, 0, 0.3), (0.04, 0.34, 0.6), DOOR)
    for row in (0.45, 0.9):
        for y in (-1.15, -0.75, 0.75, 1.15):
            b.box((1.01, y, row), (0.03, 0.16, 0.24), WINDOW)
    for x in (-0.7, -0.25, 0.25, 0.7):
        for y in (-1.51, 1.51):
            b.box((x, y, 0.75), (0.16, 0.03, 0.24), WINDOW)
    b.box((1.9, 0, 0.02), (1.6, 0.9, 0.04), PAVING)
    return b.to_object("palace-mesh", material, root)


def grodzka(material):
    root = building_root("grodzka", (0.0, 0.0))
    b = Builder()
    b.box((1.1, 0, 0.025), (12.2, 0.75, 0.05), COBBLE)
    b.box((MARKET[0], 0, 0.02), (0.65, 2 * FORTRESS_RADIUS * 0.82, 0.04), COBBLE)
    for x in range(-4, 8):
        b.box((x + 0.5, 0, 0.055), (0.05, 0.55, 0.01), PAVING_DARK)
    return b.to_object("grodzka-mesh", material, root)


def market(material):
    root = building_root("market", MARKET)
    b = Builder()
    b.box((0, 0, 0.04), (2 * MARKET_HALF, 2 * MARKET_HALF, 0.08), PAVING)
    for i in range(-3, 4):
        b.box((i * 0.48, 0, 0.085), (0.03, 2 * MARKET_HALF - 0.1, 0.01), PAVING_DARK)
        b.box((0, i * 0.48, 0.085), (2 * MARKET_HALF - 0.1, 0.03, 0.01), PAVING_DARK)
    for dy in (3.35, -3.35):
        b.box((0, dy, 0.035), (1.6, 1.3, 0.07), PAVING_DARK)
    b.cylinder((0, -3.35, 0.16), 0.32, 0.22, STONE, segments=10)
    b.cylinder((0, -3.35, 0.22), 0.25, 0.12, WATER, segments=10)
    b.box((0.35, 3.35, 0.2), (0.5, 0.35, 0.3), (0.85, 0.85, 0.82))
    b.box((-0.35, 3.45, 0.15), (0.4, 0.3, 0.22), (0.85, 0.85, 0.82))
    return b.to_object("market-mesh", material, root)


def townhall(material):
    root = building_root("townhall", (MARKET[0], 1.15))
    b = Builder()
    b.box((0, 0, 0.5), (1.7, 0.85, 1.0), (0.96, 0.86, 0.62))
    b.gable_roof((0, 0, 1.0), (1.75, 0.95, 0.45), ROOF)
    b.box((0, 0, 1.6), (0.48, 0.48, 3.2), (0.97, 0.88, 0.66))
    b.box((0, -0.25, 2.5), (0.22, 0.02, 0.22), (0.95, 0.95, 0.9))
    b.box((0, -0.26, 2.5), (0.02, 0.01, 0.1), DOOR)
    b.box((0, 0, TOWER_TOP + 0.04), (0.66, 0.66, 0.08), STONE)
    for px in (-0.27, 0.27):
        for py in (-0.27, 0.27):
            b.box((px, py, TOWER_TOP + BELFRY / 2 + 0.08), (0.07, 0.07, BELFRY), STONE)
    roof = TOWER_TOP + BELFRY + 0.08
    b.box((0, 0, roof + 0.04), (0.66, 0.66, 0.08), STONE)
    b.sphere((0, 0, roof + 0.3), 0.26, COPPER, scale=(1, 1, 0.9))
    b.cylinder((0, 0, roof + 0.6), 0.08, 0.2, COPPER, segments=8)
    b.sphere((0, 0, roof + 0.78), 0.13, COPPER)
    b.cylinder((0, 0, roof + 1.0), 0.02, 0.3, GOLD, segments=6)
    for step in range(5):
        width = 1.5 - step * 0.2
        b.box((0, -0.5 - (4 - step) * 0.09, 0.05 + step * 0.1), (width, 0.12, 0.1), STONE)
    for x in (-0.6, -0.3, 0.3, 0.6):
        b.box((x, -0.435, 0.65), (0.14, 0.02, 0.22), WINDOW)
    b.box((0, -0.435, 0.35), (0.22, 0.02, 0.36), DOOR)
    return b.to_object("townhall-mesh", material, root)


def arcaded_house(b, center, rotation, color, height, seed):
    x, y = center
    turn = Matrix.Rotation(rotation, 4, "Z")

    def at(dx, dy, dz):
        offset = turn @ Vector((dx, dy, dz))
        return (x + offset.x, y + offset.y, offset.z)

    b.box(at(0, 0, height / 2), (0.54, 0.8, height), color, rotation)
    b.gable_roof(at(0, 0.05, height), (0.56, 0.7, 0.3), ROOF if seed % 3 else ROOF_DARK, rotation + math.pi / 2)
    b.box(at(0, -0.36, height + 0.08), (0.56, 0.06, 0.18), color, rotation)
    for dx in (-0.14, 0.14):
        b.box(at(dx, -0.405, 0.2), (0.17, 0.02, 0.3), ARCH, rotation)
        b.box(at(dx, -0.405, height * 0.68), (0.11, 0.02, 0.18), WINDOW, rotation)


def houses(material):
    root = building_root("houses", MARKET)
    b = Builder()
    edge = MARKET_HALF + 0.42
    slots = [-1.35, -0.8, 0.8, 1.35]
    index = 0
    for side, rotation in ((0, 0.0), (1, math.pi / 2), (2, math.pi), (3, -math.pi / 2)):
        for offset in slots:
            if side == 2 and abs(offset) < 1.0:
                continue
            local = Vector((offset, -edge, 0))
            position = Matrix.Rotation(rotation, 4, "Z") @ local
            height = 0.95 + (index % 3) * 0.12
            arcaded_house(b, (position.x, position.y), rotation, FACADES[index % len(FACADES)], height, index)
            index += 1
    rng = random.Random(11)
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
        for i in range(3):
            height = rng.uniform(0.7, 1.0)
            color = FACADES[rng.randrange(len(FACADES))]
            px = bx + (i - 1) * 0.62
            b.box((px, by, height / 2), (0.58, 0.9, height), color)
            b.gable_roof((px, by, height), (0.6, 0.95, 0.3), ROOF if i % 2 else ROOF_DARK, math.pi / 2)
    return b.to_object("houses-mesh", material, root)


def collegiate(material):
    root = building_root("collegiate", (-1.6, -2.15))
    b = Builder()
    b.box((0, 0, 0.6), (2.4, 1.0, 1.2), (0.96, 0.92, 0.84))
    b.gable_roof((0, 0, 1.2), (2.45, 1.05, 0.55), ROOF_DARK, 0.0)
    b.cylinder((1.3, 0, 0.5), 0.45, 1.0, (0.96, 0.92, 0.84), segments=10)
    b.cylinder((1.3, 0, 1.12), 0.47, 0.24, ROOF_DARK, segments=10, radius_top=0.05)
    b.box((-1.28, 0, 0.95), (0.16, 1.1, 1.9), (0.98, 0.94, 0.86))
    b.gable_roof((-1.28, 0, 1.9), (0.18, 1.1, 0.4), (0.98, 0.94, 0.86), 0.0)
    b.box((-1.37, 0, 0.35), (0.02, 0.34, 0.6), DOOR)
    b.box((-1.37, 0, 1.25), (0.02, 0.22, 0.22), WINDOW)
    for x in (-0.6, 0.0, 0.6):
        for y in (-0.51, 0.51):
            b.box((x, y, 0.75), (0.16, 0.02, 0.4), WINDOW)
    b.box((-0.1, -1.0, 0.8), (0.45, 0.45, 1.6), (0.96, 0.92, 0.84))
    b.cylinder((-0.1, -1.0, 1.8), 0.3, 0.4, COPPER, segments=8, radius_top=0.02)
    return b.to_object("collegiate-mesh", material, root)


def academy(material):
    root = building_root("academy", (-1.6, 2.2))
    b = Builder()
    for center, size in (
        ((0, -0.7, 0.5), (2.4, 0.55, 1.0)),
        ((0, 0.7, 0.5), (2.4, 0.55, 1.0)),
        ((-0.95, 0, 0.5), (0.5, 0.9, 1.0)),
        ((0.95, 0, 0.5), (0.5, 0.9, 1.0)),
    ):
        b.box(center, size, (0.93, 0.84, 0.70))
    b.gable_roof((0, -0.7, 1.0), (2.45, 0.6, 0.35), ROOF, math.pi / 2 * 0)
    b.gable_roof((0, 0.7, 1.0), (2.45, 0.6, 0.35), ROOF, 0.0)
    b.gable_roof((-0.95, 0, 1.0), (0.55, 0.85, 0.3), ROOF_DARK, math.pi / 2)
    b.gable_roof((0.95, 0, 1.0), (0.55, 0.85, 0.3), ROOF_DARK, math.pi / 2)
    b.box((0, 0, 0.03), (1.4, 0.85, 0.06), GRASS)
    for x in (-0.8, -0.4, 0.0, 0.4, 0.8):
        for z in (0.35, 0.72):
            b.box((x, -0.98, z), (0.16, 0.02, 0.2), WINDOW)
    b.box((0, -0.985, 0.2), (0.24, 0.02, 0.36), DOOR)
    return b.to_object("academy-mesh", material, root)


def fortress(material):
    root = building_root("fortress", (0.0, 0.0))
    b = Builder()
    corners = heptagon(FORTRESS_RADIUS)
    for i, (x0, y0) in enumerate(corners):
        x1, y1 = corners[(i + 1) % 7]
        length = math.hypot(x1 - x0, y1 - y0)
        angle = math.atan2(y1 - y0, x1 - x0)
        b.box(((x0 + x1) / 2, (y0 + y1) / 2, 0.32), (length - 1.2, 0.32, 0.64), BRICK, angle)
        b.box(((x0 + x1) / 2, (y0 + y1) / 2, 0.68), (length - 1.2, 0.36, 0.08), STONE, angle)
    for x, y in corners:
        outward = math.atan2(y, x)
        points = []
        for local in ((-0.7, 0.0), (0.0, -0.75), (1.0, -0.55), (1.45, 0.0), (1.0, 0.55), (0.0, 0.75)):
            rotated = Matrix.Rotation(outward, 2) @ Vector(local)
            points.append((x + rotated.x - math.cos(outward) * 0.2, y + rotated.y - math.sin(outward) * 0.2))
        b.polygon_slab(points, 0.0, 0.78, GRASS_DARK, BRICK)
        tip = Matrix.Rotation(outward, 2) @ Vector((1.2, 0.0))
        b.cylinder((x + tip.x, y + tip.y, 1.0), 0.12, 0.45, STONE, segments=6)
    for gate_angle in (math.pi / 2, -math.pi / 2):
        gx = 0.0
        gy = FORTRESS_RADIUS * 0.9 * math.sin(gate_angle)
        b.box((gx + MARKET[0], gy, 0.55), (0.9, 0.6, 1.1), STONE)
        b.gable_roof((gx + MARKET[0], gy, 1.1), (0.95, 0.65, 0.35), ROOF_DARK, math.pi / 2)
        b.box((gx + MARKET[0], gy, 0.3), (0.35, 0.62, 0.55), DOOR)
    return b.to_object("fortress-mesh", material, root)


def trumpeter(material):
    root = empty("trumpeter", (MARKET[0], 1.15, TOWER_TOP + 0.08))
    b = Builder()
    b.cylinder((0, 0, 0.2), 0.11, 0.4, TRUMPETER_COAT, segments=8, radius_top=0.08)
    b.sphere((0, 0, 0.48), 0.1, SKIN)
    b.cylinder((0, 0, 0.6), 0.12, 0.05, ROOF_DARK, segments=8)
    b.cylinder((0, 0, 0.66), 0.07, 0.1, ROOF_DARK, segments=8)
    trumpet = bmesh.ops.create_cone(b.bm, cap_ends=True, segments=8, radius1=0.015, radius2=0.07, depth=0.32)
    b.add(trumpet["verts"], GOLD, Matrix.Translation((0, -0.26, 0.47)) @ Matrix.Rotation(math.pi / 2, 4, "X"))
    b.box((0.08, -0.08, 0.32), (0.05, 0.18, 0.05), TRUMPETER_COAT)
    return b.to_object("trumpeter-mesh", material, root)


SOCKETS = {
    "palace": ((-6.2, 0.0), 1.5),
    "grodzka": ((-1.6, 0.0), 0.75),
    "market": (MARKET, 1.3),
    "townhall": ((MARKET[0], 1.25), 0.55),
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
    ground(material)
    palace(material)
    grodzka(material)
    market(material)
    townhall(material)
    houses(material)
    collegiate(material)
    academy(material)
    fortress(material)
    trumpeter(material)
    sockets()
    export(args.get("out", str(ROOT / "public" / "models" / "zamosc-city.glb")))


build()
