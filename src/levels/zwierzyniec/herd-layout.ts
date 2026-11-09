export type World = { width: number; height: number }

export type Rect = { left: number; right: number; top: number; bottom: number }

type Circle = { x: number; y: number; r: number }

export type Pen = Rect & { gateLeft: number; gateRight: number }

export type HerdLayout = {
  world: World
  unit: number
  horizon: number
  field: Rect
  pen: Pen
  spawn: Rect
  bushes: Circle[]
  goatStart: { x: number; y: number }
}

export function herdLayout(world: World): HerdLayout {
  const { width, height } = world
  const unit = Math.min(width, height) / 900
  const portrait = width < height
  const horizon = height * (portrait ? 0.33 : 0.39)
  const field = {
    left: width * 0.04,
    right: width * 0.96,
    top: height * (portrait ? 0.4 : 0.47),
    bottom: height * 0.95,
  }
  const penLeft = width * (portrait ? 0.18 : 0.6)
  const penRight = width * (portrait ? 0.82 : 0.9)
  const penBottom = height * (portrait ? 0.55 : 0.66)
  const gateHalf = 85 * unit
  const gateCenter = (penLeft + penRight) / 2
  const pen = {
    left: penLeft,
    right: penRight,
    top: field.top,
    bottom: penBottom,
    gateLeft: gateCenter - gateHalf,
    gateRight: gateCenter + gateHalf,
  }
  const spawn = portrait
    ? { left: width * 0.1, right: width * 0.9, top: height * 0.7, bottom: height * 0.9 }
    : { left: width * 0.08, right: width * 0.46, top: height * 0.6, bottom: height * 0.9 }
  const bushes = portrait
    ? [
        { x: width * 0.24, y: height * 0.63, r: 46 * unit },
        { x: width * 0.78, y: height * 0.66, r: 40 * unit },
      ]
    : [
        { x: width * 0.5, y: height * 0.58, r: 44 * unit },
        { x: width * 0.3, y: height * 0.86, r: 40 * unit },
        { x: width * 0.66, y: height * 0.85, r: 48 * unit },
      ]

  return {
    world,
    unit,
    horizon,
    field,
    pen,
    spawn,
    bushes,
    goatStart: { x: portrait ? width * 0.5 : width * 0.2, y: height * (portrait ? 0.93 : 0.7) },
  }
}

export function depthScale(layout: HerdLayout, y: number) {
  const { top, bottom } = layout.field
  const t = Math.min(1, Math.max(0, (y - top) / (bottom - top)))
  return layout.unit * (0.78 + t * 0.34)
}

export function insidePen(pen: Rect, x: number, y: number, margin = 0) {
  return (
    x > pen.left - margin &&
    x < pen.right + margin &&
    y > pen.top - margin &&
    y < pen.bottom + margin
  )
}
