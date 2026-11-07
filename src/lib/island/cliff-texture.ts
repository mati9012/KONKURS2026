import {
  CanvasTexture,
  DataTexture,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three'
import { createRandom } from '@/lib/island/noise'

const STRATA = ['#c27c47', '#d38c52', '#a8683d', '#dfa36c', '#b5713f', '#c98a5a', '#9c5f37']

export function createCliffTextures(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla tekstury klifu')
  const random = createRandom(1569)

  let x = 0
  while (x < size) {
    const width = 6 + random() * 26
    const color = STRATA[Math.floor(random() * STRATA.length)]
    const gradient = context.createLinearGradient(0, 0, 0, size)
    gradient.addColorStop(0, color)
    gradient.addColorStop(0.5, STRATA[Math.floor(random() * STRATA.length)])
    gradient.addColorStop(1, color)
    context.fillStyle = gradient
    context.fillRect(x, 0, width + 1, size)
    x += width
  }

  for (let i = 0; i < 18; i++) {
    const y = random() * size
    context.fillStyle = `rgba(${random() > 0.5 ? '255, 220, 170' : '60, 30, 15'}, ${0.05 + random() * 0.08})`
    context.fillRect(0, y, size, 3 + random() * 12)
  }

  context.lineCap = 'round'
  for (let i = 0; i < 420; i++) {
    const sx = random() * size
    const sy = random() * size
    const length = 30 + random() * 160
    const dark = random() > 0.45
    context.strokeStyle = dark
      ? `rgba(55, 28, 14, ${0.25 + random() * 0.35})`
      : `rgba(255, 214, 160, ${0.15 + random() * 0.25})`
    context.lineWidth = dark ? 1 + random() * 2.5 : 1 + random() * 3
    for (const offset of [-size, 0, size]) {
      context.beginPath()
      context.moveTo(sx + offset, sy)
      let px = sx + offset
      let py = sy
      for (let step = 0; step < 6; step++) {
        px += (random() - 0.5) * 6
        py += length / 6
        context.lineTo(px, py)
      }
      context.stroke()
      context.beginPath()
      context.moveTo(sx + offset, sy - size)
      context.lineTo(sx + offset + (random() - 0.5) * 6, sy - size + length)
      context.stroke()
    }
  }

  const albedo = new CanvasTexture(canvas)
  albedo.wrapS = RepeatWrapping
  albedo.wrapT = RepeatWrapping
  albedo.colorSpace = SRGBColorSpace
  albedo.anisotropy = 8

  const pixels = context.getImageData(0, 0, size, size).data
  const luminance = (px: number, py: number) => {
    const wx = (px + size) % size
    const wy = (py + size) % size
    const index = (wy * size + wx) * 4
    return (pixels[index] * 0.3 + pixels[index + 1] * 0.59 + pixels[index + 2] * 0.11) / 255
  }
  const normals = new Uint8Array(size * size * 4)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = (luminance(px + 1, py) - luminance(px - 1, py)) * 4
      const dy = (luminance(px, py + 1) - luminance(px, py - 1)) * 4
      const length = Math.hypot(dx, dy, 1)
      const index = (py * size + px) * 4
      normals[index] = Math.round(((-dx / length) * 0.5 + 0.5) * 255)
      normals[index + 1] = Math.round(((dy / length) * 0.5 + 0.5) * 255)
      normals[index + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255)
      normals[index + 3] = 255
    }
  }
  const normal = new DataTexture(normals, size, size, RGBAFormat)
  normal.wrapS = RepeatWrapping
  normal.wrapT = RepeatWrapping
  normal.minFilter = LinearMipmapLinearFilter
  normal.generateMipmaps = true
  normal.needsUpdate = true

  return { albedo, normal }
}
