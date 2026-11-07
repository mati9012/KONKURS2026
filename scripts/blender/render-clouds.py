import math
import random
import sys

import bpy
import bmesh
import numpy as np
from mathutils import Matrix

WIDTHS = [1.7, 1.3, 1.9, 1.15]


def scene_args():
    if "--" not in sys.argv:
        return {}
    pairs = sys.argv[sys.argv.index("--") + 1 :]
    return dict(pair.split("=", 1) for pair in pairs)


def cloud_blobs(seed, width):
    rnd = random.Random(seed)
    blobs = []
    for _ in range(18):
        angle = rnd.uniform(0, math.tau)
        distance = math.sqrt(rnd.random())
        radius = rnd.uniform(0.38, 0.62)
        blobs.append((math.cos(angle) * distance * width, math.sin(angle) * distance * 0.55, radius * 0.5, radius))
    for _ in range(14):
        t = rnd.random() ** 0.8
        spread = (1 - t * 0.7) * width * 0.6
        angle = rnd.uniform(0, math.tau)
        radius = rnd.uniform(0.32, 0.55) * (1 - t * 0.3)
        blobs.append((math.cos(angle) * spread * rnd.random(), math.sin(angle) * spread * 0.4 * rnd.random(), 0.4 + t * 1.15, radius))
    for _ in range(60):
        x, y, z, radius = rnd.choice(blobs)
        theta = rnd.uniform(0, math.tau)
        phi = rnd.uniform(0, math.pi * 0.5)
        blobs.append((
            x + radius * math.sin(phi) * math.cos(theta),
            y + radius * math.sin(phi) * math.sin(theta) * 0.8,
            z + radius * math.cos(phi) * 0.9,
            radius * rnd.uniform(0.3, 0.5),
        ))
    return [(x, y, max(z, 0.0), radius) for x, y, z, radius in blobs]


def blob_mesh(name, blobs):
    bm = bmesh.new()
    for x, y, z, radius in blobs:
        bmesh.ops.create_icosphere(bm, subdivisions=2, radius=radius, matrix=Matrix.Translation((x, y, z)))
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.hide_render = True
    return obj


def cloud_material():
    material = bpy.data.materials.new("cloud")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    volume = nodes.new("ShaderNodeVolumePrincipled")
    volume.inputs["Color"].default_value = (1, 1, 1, 1)
    volume.inputs["Anisotropy"].default_value = 0.35
    density = nodes.new("ShaderNodeAttribute")
    density.attribute_name = "density"
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 7.0
    noise.inputs["Detail"].default_value = 10.0
    noise.inputs["Roughness"].default_value = 0.62
    noise.inputs["Distortion"].default_value = 0.3
    erode = nodes.new("ShaderNodeMapRange")
    erode.inputs["From Min"].default_value = 0.38
    erode.inputs["From Max"].default_value = 0.62
    multiply = nodes.new("ShaderNodeMath")
    multiply.operation = "MULTIPLY"
    scale = nodes.new("ShaderNodeMath")
    scale.operation = "MULTIPLY"
    scale.inputs[1].default_value = 14.0
    links.new(noise.outputs["Fac"], erode.inputs["Value"])
    links.new(density.outputs["Fac"], multiply.inputs[0])
    links.new(erode.outputs["Result"], multiply.inputs[1])
    links.new(multiply.outputs[0], scale.inputs[0])
    links.new(scale.outputs[0], volume.inputs["Density"])
    links.new(volume.outputs[0], output.inputs["Volume"])
    return material


def cloud_volume(index, material):
    blobs = cloud_blobs(31 + index * 17, WIDTHS[index])
    source = blob_mesh(f"cloud-source-{index}", blobs)
    volume = bpy.data.objects.new(f"cloud-{index}", bpy.data.volumes.new(f"cloud-{index}"))
    bpy.context.scene.collection.objects.link(volume)
    to_volume = volume.modifiers.new("to-volume", "MESH_TO_VOLUME")
    to_volume.object = source
    to_volume.resolution_mode = "VOXEL_SIZE"
    to_volume.voxel_size = 0.02
    to_volume.interior_band_width = 0.25
    to_volume.density = 1.0
    texture = bpy.data.textures.new(f"cloud-billow-{index}", "CLOUDS")
    texture.noise_scale = 0.32
    texture.noise_depth = 4
    texture.noise_basis = "IMPROVED_PERLIN"
    displace = volume.modifiers.new("billow", "VOLUME_DISPLACE")
    displace.texture = texture
    displace.strength = 0.32
    displace.texture_mid_level = (0.5, 0.5, 0.5)
    volume.data.materials.append(material)
    return volume


def setup(scene, size):
    camera = bpy.data.objects.new("camera", bpy.data.cameras.new("camera"))
    scene.collection.objects.link(camera)
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 5.6
    camera.location = (0, -10, 1.35)
    camera.rotation_euler = (math.radians(90), 0, 0)
    scene.camera = camera
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 7.5
    sun.data.angle = math.radians(2)
    sun.rotation_euler = (math.radians(40), math.radians(35), math.radians(25))
    scene.collection.objects.link(sun)
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.3, 0.33, 0.45, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8
    scene.world = world
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.cycles.volume_bounces = 6
    scene.cycles.volume_step_rate = 2.0
    scene.cycles.volume_max_steps = 512
    scene.render.film_transparent = True
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "Standard"


def pack_atlas(scene, folder, size, target):
    tiles = []
    for index in range(len(WIDTHS)):
        image = bpy.data.images.load(f"{folder}/cloud-{index}.png")
        pixels = np.empty(size * size * 4, dtype=np.float32)
        image.pixels.foreach_get(pixels)
        tiles.append(pixels.reshape(size, size, 4))
    atlas = np.concatenate(
        [np.concatenate(tiles[0:2], axis=1), np.concatenate(tiles[2:4], axis=1)], axis=0
    )
    image = bpy.data.images.new("cloud-atlas", size * 2, size * 2, alpha=True)
    image.pixels.foreach_set(atlas.ravel())
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.quality = 88
    image.save_render(target, scene=scene)


def render():
    args = scene_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    setup(scene, int(args.get("size", "1024")))
    material = cloud_material()
    clouds = [cloud_volume(index, material) for index in range(len(WIDTHS))]
    only = [int(value) for value in args.get("only", "0,1,2,3").split(",") if value]
    for index in only:
        for other, cloud in enumerate(clouds):
            cloud.hide_render = other != index
        scene.render.filepath = f"{args['out']}/cloud-{index}.png"
        bpy.ops.render.render(write_still=True)
    if "atlas" in args:
        pack_atlas(scene, args["out"], int(args.get("size", "1024")), args["atlas"])


render()
