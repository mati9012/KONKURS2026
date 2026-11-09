import { PAINT } from '@/components/watercolor/WatercolorDefs'
import { LogWall } from '@/levels/bilgoraj/art/LogWall'
import { WinterWindow } from '@/levels/bilgoraj/art/WinterWindow'
import type { RoomLayout } from '@/levels/bilgoraj/room-layout'

const INK = '#3a2614'

function PotShelf({ x, y, unit }: { x: number; y: number; unit: number }) {
  const pots = [
    { dx: 20, w: 46, h: 44, color: '#b8603a' },
    { dx: 80, w: 36, h: 56, color: '#8a6a4a' },
    { dx: 132, w: 50, h: 38, color: '#c98a4a' },
    { dx: 190, w: 34, h: 48, color: '#7a8a6a' },
  ]
  return (
    <g>
      {pots.map((pot) => (
        <g key={pot.dx} transform={`translate(${x + pot.dx * unit} ${y})`}>
          <path
            d={`M0 0C${-pot.w * 0.1 * unit} ${-pot.h * 0.5 * unit} ${pot.w * 0.1 * unit} ${-pot.h * unit} ${pot.w * 0.25 * unit} ${-pot.h * unit}H${pot.w * 0.75 * unit}C${pot.w * 0.9 * unit} ${-pot.h * unit} ${pot.w * 1.1 * unit} ${-pot.h * 0.5 * unit} ${pot.w * unit} 0Z`}
            fill={pot.color}
            stroke={INK}
            strokeWidth={2}
          />
          <rect
            x={pot.w * 0.2 * unit}
            y={-pot.h * unit - 6 * unit}
            width={pot.w * 0.6 * unit}
            height={7 * unit}
            rx={2}
            fill={pot.color}
            stroke={INK}
            strokeWidth={1.6}
          />
          <path
            d={`M${pot.w * 0.15 * unit} ${-pot.h * 0.45 * unit}H${pot.w * 0.85 * unit}`}
            stroke="#f2e2c4"
            strokeWidth={2.5 * unit}
            opacity={0.7}
          />
        </g>
      ))}
      <rect
        x={x}
        y={y}
        width={240 * unit}
        height={12 * unit}
        fill="#6a4426"
        stroke={INK}
        strokeWidth={2}
      />
    </g>
  )
}

function Herbs({ x, y, unit }: { x: number; y: number; unit: number }) {
  return (
    <g>
      <path d={`M${x - 70 * unit} ${y}H${x + 70 * unit}`} stroke={INK} strokeWidth={3 * unit} />
      {[-50, -15, 20, 55].map((dx, index) => (
        <g key={dx} transform={`translate(${x + dx * unit} ${y})`}>
          <path d={`M0 0V${14 * unit}`} stroke="#a8743f" strokeWidth={2 * unit} />
          <path
            d={`M0 ${12 * unit}L${-14 * unit} ${64 * unit}Q0 ${72 * unit} ${14 * unit} ${64 * unit}Z`}
            fill={index % 2 ? '#7a9a52' : '#8aa860'}
            stroke={INK}
            strokeWidth={1.6}
          />
          <path
            d={`M${-6 * unit} ${30 * unit}l${-6 * unit} ${4 * unit}M${6 * unit} ${40 * unit}l${6 * unit} ${4 * unit}M${-4 * unit} ${50 * unit}l${-6 * unit} ${5 * unit}`}
            stroke="#5a7a3a"
            strokeWidth={2 * unit}
          />
        </g>
      ))}
    </g>
  )
}

type KitchenBackdropProps = {
  layout: RoomLayout
  fire: number
}

export function KitchenBackdrop({ layout, fire }: KitchenBackdropProps) {
  const { world, unit, floor, portrait } = layout
  const { width, height } = world
  const ovenX = portrait ? width * 0.7 : width * 0.82
  const ovenW = 260 * unit
  const ovenH = 300 * unit
  const tableY = floor + 20 * unit

  return (
    <g>
      <LogWall layout={layout} warm={0.12 + fire * 0.18} />
      <WinterWindow x={width * 0.1} y={floor * 0.2} width={200 * unit} height={170 * unit} spring />
      <PotShelf
        x={portrait ? width * 0.08 : width * 0.32}
        y={floor * (portrait ? 0.64 : 0.36)}
        unit={unit}
      />
      <Herbs
        x={portrait ? width * 0.72 : width * 0.62}
        y={floor * (portrait ? 0.3 : 0.12)}
        unit={unit}
      />
      <g filter={PAINT}>
        <path
          d={`M${ovenX - ovenW / 2} ${floor}V${floor - ovenH * 0.7}Q${ovenX - ovenW / 2} ${floor - ovenH} ${ovenX} ${floor - ovenH}Q${ovenX + ovenW / 2} ${floor - ovenH} ${ovenX + ovenW / 2} ${floor - ovenH * 0.7}V${floor}Z`}
          fill="#efe4cc"
        />
        <rect
          x={ovenX - ovenW * 0.58}
          y={floor - 30 * unit}
          width={ovenW * 1.16}
          height={40 * unit}
          fill="#d9cbb0"
        />
      </g>
      <path
        d={`M${ovenX - ovenW * 0.22} ${floor - 40 * unit}V${floor - ovenH * 0.42}Q${ovenX} ${floor - ovenH * 0.6} ${ovenX + ovenW * 0.22} ${floor - ovenH * 0.42}V${floor - 40 * unit}Z`}
        fill="#2a1a12"
        stroke={INK}
        strokeWidth={2}
      />
      <g opacity={fire} style={{ transition: 'opacity 0.8s' }}>
        <ellipse
          cx={ovenX}
          cy={floor - 60 * unit}
          rx={ovenW * 0.18}
          ry={30 * unit}
          fill="#ff9a3a"
          opacity={0.7}
        />
        <path
          className="rz-flicker"
          d={`M${ovenX - 30 * unit} ${floor - 44 * unit}Q${ovenX - 20 * unit} ${floor - 100 * unit} ${ovenX} ${floor - 120 * unit}Q${ovenX + 20 * unit} ${floor - 90 * unit} ${ovenX + 30 * unit} ${floor - 44 * unit}Z`}
          fill="#ffcf6a"
        />
        <circle cx={ovenX} cy={floor - ovenH * 0.3} r={ovenW * 0.7} fill="#ffb060" opacity={0.15} />
      </g>
      {[0.15, 0.45, 0.75].map((share) => (
        <path
          key={share}
          d={`M${ovenX - ovenW / 2 + ovenW * share} ${floor - ovenH * 0.85}h${ovenW * 0.12}`}
          stroke="#c8b898"
          strokeWidth={3}
        />
      ))}
      <rect
        x={-20}
        y={tableY}
        width={width + 40}
        height={height - tableY + 20}
        fill="#8a5a32"
        filter={PAINT}
      />
      <rect x={-20} y={tableY} width={width + 40} height={12 * unit} fill="#a8743f" />
      <path d={`M-20 ${tableY + 50 * unit}H${width + 20}`} stroke="#6a4426" strokeWidth={2} />
    </g>
  )
}
