import type { ReactNode } from 'react'

export const INK = '#3a2614'

export type Block = {
  x: number
  y: number
  w: number
  d: number
  h: number
  wall: string
  roof: string
  kind: 'hip' | 'attic' | 'flat'
  windows?: number
  floors?: number
  arcade?: boolean
}

export type Piece = {
  key: string
  depth: number
  body: ReactNode
  ink: ReactNode
}

export function shade(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16)
  const channel = (shift: number) => {
    const base = (value >> shift) & 255
    const target = amount < 0 ? 0 : 255
    return Math.round(base + (target - base) * Math.abs(amount))
  }
  const mixed = (channel(16) << 16) | (channel(8) << 8) | channel(0)
  return `#${mixed.toString(16).padStart(6, '0')}`
}

function points(...coordinates: number[]) {
  const pairs: string[] = []
  for (let index = 0; index < coordinates.length; index += 2) {
    pairs.push(`${coordinates[index].toFixed(1)},${coordinates[index + 1].toFixed(1)}`)
  }
  return pairs.join(' ')
}

function roofShapes(block: Block, top: number, backTop: number) {
  const { x, w, d, roof, kind } = block
  const left = x - w / 2
  const right = x + w / 2
  if (kind === 'flat') {
    return <rect x={left} y={backTop} width={w} height={top - backTop} fill={roof} />
  }
  if (kind === 'attic') {
    const teeth = Math.max(2, Math.round(w / (d * 0.5)))
    const step = w / teeth
    const crest = Math.min(block.h * 0.28, step * 0.9)
    let crown = `M${left} ${top}`
    for (let index = 0; index < teeth; index++) {
      const start = left + index * step
      crown += `L${start} ${top - crest * 0.55}Q${start + step / 2} ${top - crest * 1.25} ${start + step} ${top - crest * 0.55}`
    }
    crown += `L${right} ${top}Z`
    return (
      <>
        <rect x={left} y={backTop} width={w} height={top - backTop} fill={shade(roof, 0.25)} />
        <path d={crown} fill={block.wall} />
      </>
    )
  }
  const inset = Math.min(w * 0.32, (top - backTop) * 0.7)
  const ridge = (top + backTop) / 2 - Math.min(d * 0.45, w * 0.25)
  return (
    <>
      <polygon
        points={points(left, backTop, right, backTop, right - inset, ridge, left + inset, ridge)}
        fill={shade(roof, 0.18)}
      />
      <polygon
        points={points(left, backTop, left + inset, ridge, left, top)}
        fill={shade(roof, -0.12)}
      />
      <polygon
        points={points(right, backTop, right - inset, ridge, right, top)}
        fill={shade(roof, -0.2)}
      />
      <polygon
        points={points(left, top, left + inset, ridge, right - inset, ridge, right, top)}
        fill={roof}
      />
    </>
  )
}

export function blockBody(block: Block) {
  const { x, y, w, d, h, wall } = block
  const front = y + d / 2
  const top = front - h
  const backTop = y - d / 2 - h
  const pad = 10
  return (
    <>
      <rect
        x={x - w / 2 - pad}
        y={backTop - d - pad}
        width={w + pad * 2}
        height={front - backTop + d + pad * 2}
        fill="none"
      />
      <ellipse
        cx={x + w * 0.08}
        cy={front - d * 0.15}
        rx={w * 0.56}
        ry={d * 0.5 + h * 0.05}
        fill="#4b3b2b"
        opacity={0.1}
      />
      <rect x={x - w / 2} y={top} width={w} height={h} fill={wall} />
      <rect
        x={x - w / 2}
        y={front - h * 0.12}
        width={w}
        height={h * 0.12}
        fill={shade(wall, -0.18)}
      />
      {roofShapes(block, top, backTop)}
    </>
  )
}

export function blockInk(block: Block) {
  const { x, y, w, d, h, windows = 0, floors = 2, arcade = false } = block
  const front = y + d / 2
  const top = front - h
  const left = x - w / 2
  const marks: ReactNode[] = []
  const column = windows > 0 ? w / windows : 0
  const floorHeight = h / (floors + (arcade ? 1 : 0.4))
  const glass = Math.min(column * 0.42, floorHeight * 0.5)
  for (let col = 0; col < windows; col++) {
    const cx = left + column * (col + 0.5)
    for (let floor = 0; floor < floors; floor++) {
      const cy = top + floorHeight * (floor + 0.3)
      marks.push(
        <rect
          key={`w-${col}-${floor}`}
          x={cx - glass / 2}
          y={cy}
          width={glass}
          height={glass * 1.35}
          rx={glass * 0.2}
          fill={INK}
          opacity={0.55}
        />,
      )
    }
    if (arcade) {
      const span = column * 0.72
      const base = front - h * 0.12
      const rise = Math.min(floorHeight * 0.85, span)
      marks.push(
        <path
          key={`a-${col}`}
          d={`M${cx - span / 2} ${base}V${base - rise + span / 2}A${span / 2} ${span / 2} 0 0 1 ${cx + span / 2} ${base - rise + span / 2}V${base}Z`}
          fill={INK}
          opacity={0.5}
        />,
      )
    }
  }
  return (
    <>
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        fill="none"
        stroke={INK}
        strokeWidth={0.9}
        opacity={0.45}
      />
      {marks}
    </>
  )
}

export function blockPiece(key: string, block: Block): Piece {
  return { key, depth: block.y + block.d / 2, body: blockBody(block), ink: blockInk(block) }
}

export function sketchBlock(block: Block) {
  const { x, y, w, d, h } = block
  const front = y + d / 2
  const top = front - h
  const backTop = y - d / 2 - h
  return (
    <path
      d={`M${x - w / 2} ${front}V${top}H${x + w / 2}V${front}ZM${x - w / 2} ${top}L${x - w / 2} ${backTop}H${x + w / 2}V${top}`}
      fill="none"
      stroke="#8a6a48"
      strokeWidth={1}
      strokeDasharray="5 4"
      opacity={0.55}
    />
  )
}
