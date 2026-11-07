import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type Vec3 = [number, number, number]

export type Placement = {
  at?: Vec3
  rotation?: Vec3
  scale?: Vec3
}

function gableGeometry() {
  const a = [-0.5, 0, -0.5]
  const b = [-0.5, 0, 0.5]
  const c = [-0.5, 1, 0]
  const d = [0.5, 0, -0.5]
  const e = [0.5, 0, 0.5]
  const f = [0.5, 1, 0]
  const faces = [a, b, c, d, f, e, a, c, f, a, f, d, b, e, f, b, f, c, a, d, e, a, e, b]
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(faces.flat()), 3))
  return geometry
}

export class ModelBuilder {
  private parts: BufferGeometry[] = []
  private matrix = new Matrix4()
  private quaternion = new Quaternion()
  private color = new Color()

  add(source: BufferGeometry, color: string, placement: Placement = {}) {
    const geometry = (source.index ? source.toNonIndexed() : source).clone()
    geometry.deleteAttribute('uv')
    geometry.deleteAttribute('normal')
    const { at = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = placement
    this.quaternion.setFromEuler(new Euler(...rotation))
    this.matrix.compose(new Vector3(...at), this.quaternion, new Vector3(...scale))
    geometry.applyMatrix4(this.matrix)
    this.color.set(color)
    const count = geometry.getAttribute('position').count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = this.color.r
      colors[i * 3 + 1] = this.color.g
      colors[i * 3 + 2] = this.color.b
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    this.parts.push(geometry)
    return this
  }

  box(size: Vec3, color: string, placement: Placement = {}) {
    return this.add(new BoxGeometry(...size), color, placement)
  }

  block(size: Vec3, color: string, base: Vec3, rotation?: Vec3) {
    return this.box(size, color, { at: [base[0], base[1] + size[1] / 2, base[2]], rotation })
  }

  cylinder(
    radiusTop: number,
    radiusBottom: number,
    height: number,
    segments: number,
    color: string,
    base: Vec3,
    rotation?: Vec3,
  ) {
    const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments)
    return this.add(geometry, color, { at: [base[0], base[1] + height / 2, base[2]], rotation })
  }

  cone(
    radius: number,
    height: number,
    segments: number,
    color: string,
    base: Vec3,
    rotation?: Vec3,
  ) {
    const geometry = new ConeGeometry(radius, height, segments)
    return this.add(geometry, color, { at: [base[0], base[1] + height / 2, base[2]], rotation })
  }

  dome(radius: number, color: string, base: Vec3, segments = 8) {
    const geometry = new SphereGeometry(
      radius,
      segments,
      Math.max(3, segments / 2),
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    )
    return this.add(geometry, color, { at: base })
  }

  ball(radius: number, color: string, center: Vec3, detail = 0, scale?: Vec3) {
    return this.add(new IcosahedronGeometry(radius, detail), color, { at: center, scale })
  }

  ring(radius: number, tube: number, color: string, center: Vec3, rotation?: Vec3) {
    return this.add(new TorusGeometry(radius, tube, 4, 12), color, { at: center, rotation })
  }

  gable(size: Vec3, color: string, base: Vec3, rotation?: Vec3) {
    return this.add(gableGeometry(), color, { at: base, rotation, scale: size })
  }

  house(base: Vec3, size: Vec3, roofHeight: number, wall: string, roof: string, rotationY = 0) {
    const [width, height, depth] = size
    const rotation: Vec3 = [0, rotationY, 0]
    this.block(size, wall, base, rotation)
    return this.gable(
      [width * 1.08, roofHeight, depth * 1.12],
      roof,
      [base[0], base[1] + height, base[2]],
      rotation,
    )
  }

  crenellation(start: Vec3, end: Vec3, count: number, size: number, color: string) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1)
      const at: Vec3 = [
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t,
      ]
      this.block([size, size, size], color, at)
    }
    return this
  }

  build() {
    const merged = mergeGeometries(this.parts)
    merged.computeVertexNormals()
    return merged
  }
}
