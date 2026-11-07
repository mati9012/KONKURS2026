import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { createRandom } from '@/lib/island/noise'

export function createPaintTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla tekstury terenu')
  context.fillStyle = '#ececec'
  context.fillRect(0, 0, size, size)
  const random = createRandom(7)
  for (let i = 0; i < 1400; i++) {
    const x = random() * size
    const y = random() * size
    const radius = 4 + random() * 22
    const light = random() > 0.5
    const alpha = 0.05 + random() * 0.09
    context.fillStyle = light ? `rgba(255, 252, 225, ${alpha})` : `rgba(70, 90, 40, ${alpha})`
    for (const [ox, oy] of [
      [0, 0],
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ]) {
      context.beginPath()
      context.ellipse(
        x + ox,
        y + oy,
        radius,
        radius * (0.4 + random() * 0.4),
        random() * Math.PI,
        0,
        Math.PI * 2,
      )
      context.fill()
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
