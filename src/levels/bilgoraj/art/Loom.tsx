import { motion } from 'motion/react'
import { PAINT } from '@/components/watercolor/WatercolorDefs'

const INK = '#3a2614'
const WOOD = '#a8743f'
const WOOD_DARK = '#7a4e28'
const HAIR = '#e6d6b0'

type LoomProps = {
  width: number
  height: number
  warp: number
  rows: number
  total: number
  pressed: 'L' | 'R' | null
  beatMs: number
}

export function Loom({ width, height, warp, rows, total, pressed, beatMs }: LoomProps) {
  const half = width / 2
  const top = -height
  const clothTop = top + height * 0.16
  const clothBottom = -height * 0.3
  const threads = Array.from(
    { length: warp },
    (_, index) => -half * 0.78 + (index * half * 1.56) / (warp - 1),
  )
  const rowGap = (clothBottom - clothTop) / (total + 1)
  const woven = Array.from({ length: rows }, (_, index) => clothBottom - rowGap * (index + 0.6))
  const front = rows > 0 ? woven[rows - 1] - rowGap * 0.6 : clothBottom - rowGap * 0.2
  const shuttleX = rows % 2 === 0 ? -half * 0.62 : half * 0.62

  return (
    <g>
      <ellipse cx={0} cy={6} rx={half * 1.15} ry={height * 0.05} fill="#3a2614" opacity={0.25} />
      <g filter={PAINT}>
        <rect x={-half - 14} y={top} width={22} height={height} rx={6} fill={WOOD_DARK} />
        <rect x={half - 8} y={top} width={22} height={height} rx={6} fill={WOOD_DARK} />
      </g>
      <rect
        x={-half - 14}
        y={top}
        width={22}
        height={height}
        rx={6}
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      <rect
        x={half - 8}
        y={top}
        width={22}
        height={height}
        rx={6}
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      <rect
        x={-half - 24}
        y={top - 6}
        width={width + 48}
        height={26}
        rx={10}
        fill={WOOD}
        stroke={INK}
        strokeWidth={2}
      />
      <rect
        x={-half}
        y={clothBottom}
        width={width}
        height={22}
        rx={8}
        fill={WOOD}
        stroke={INK}
        strokeWidth={2}
      />
      {threads.map((x) => (
        <path key={x} d={`M${x} ${top + 20}V${clothBottom}`} stroke={HAIR} strokeWidth={1.6} />
      ))}
      {woven.map((y, index) => (
        <g key={y}>
          <path
            d={`M${-half * 0.8} ${y}H${half * 0.8}`}
            stroke="#c9b48a"
            strokeWidth={Math.max(2, rowGap * 0.45)}
          />
          {threads.map((x, thread) =>
            (thread + index) % 2 === 0 ? (
              <rect
                key={x}
                x={x - 2.5}
                y={y - rowGap * 0.28}
                width={5}
                height={rowGap * 0.56}
                fill="#f1e4c4"
                stroke="#a8946c"
                strokeWidth={0.6}
              />
            ) : null,
          )}
        </g>
      ))}
      <g className="bj-slam" style={{ animationDuration: `${beatMs}ms` }}>
        <rect
          x={-half - 4}
          y={front - 12}
          width={width + 8}
          height={14}
          rx={5}
          fill={WOOD}
          stroke={INK}
          strokeWidth={2}
        />
      </g>
      <motion.g animate={{ x: shuttleX }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
        <path
          d={`M-34 ${front - 26}Q0 ${front - 40} 34 ${front - 26}Q0 ${front - 14} -34 ${front - 26}Z`}
          fill="#c98a4a"
          stroke={INK}
          strokeWidth={2}
        />
        <ellipse cx={0} cy={front - 27} rx={9} ry={3.5} fill={HAIR} stroke={INK} strokeWidth={1} />
      </motion.g>
      {(['L', 'R'] as const).map((side) => {
        const x = side === 'L' ? -half * 0.45 : half * 0.45
        const down = pressed === side
        return (
          <g key={side} transform={`translate(${x} ${-height * 0.08})`}>
            <path d={`M0 ${-height * 0.22}V${down ? 0 : -12}`} stroke={INK} strokeWidth={2} />
            <motion.rect
              x={-half * 0.28}
              width={half * 0.56}
              height={16}
              rx={5}
              fill={down ? '#e0a860' : WOOD}
              stroke={INK}
              strokeWidth={2}
              animate={{ y: down ? -2 : -14 }}
              transition={{ duration: 0.12 }}
            />
          </g>
        )
      })}
    </g>
  )
}
