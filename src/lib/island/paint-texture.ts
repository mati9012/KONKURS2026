import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { createRandom } from '@/lib/island/noise'

const WRAP_OFFSETS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

export function createPaintTexture(size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla tekstury terenu')
  context.fillStyle = '#ececE2'
  context.fillRect(0, 0, size, size)
  const random = createRandom(7)
  const wrapped = (draw: (ox: number, oy: number) => void) => {
    for (const [ox, oy] of WRAP_OFFSETS) draw(ox * size, oy * size)
  }

  for (let i = 0; i < 900; i++) {
    const x = random() * size
    const y = random() * size
    const radius = 20 + random() * 60
    const light = random() > 0.5
    const alpha = 0.05 + random() * 0.07
    context.fillStyle = light
      ? `rgba(255, 250, 215, ${alpha})`
      : `rgba(90, 115, 55, ${alpha * 0.7})`
    const rotation = random() * Math.PI
    const squash = 0.35 + random() * 0.4
    wrapped((ox, oy) => {
      context.beginPath()
      context.ellipse(x + ox, y + oy, radius, radius * squash, rotation, 0, Math.PI * 2)
      context.fill()
    })
  }

  context.lineCap = 'round'
  for (let i = 0; i < 26000; i++) {
    const x = random() * size
    const y = random() * size
    const length = 5 + random() * 11
    const lean = (random() - 0.5) * 0.9
    const shade = random()
    context.lineWidth = 1 + random() * 1.6
    context.strokeStyle =
      shade > 0.62
        ? `rgba(255, 255, 230, ${0.25 + random() * 0.3})`
        : shade > 0.3
          ? `rgba(120, 150, 70, ${0.18 + random() * 0.2})`
          : `rgba(70, 100, 40, ${0.12 + random() * 0.14})`
    wrapped((ox, oy) => {
      context.beginPath()
      context.moveTo(x + ox, y + oy)
      context.quadraticCurveTo(
        x + ox + lean * length * 0.4,
        y + oy - length * 0.6,
        x + ox + lean * length,
        y + oy - length,
      )
      context.stroke()
    })
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
