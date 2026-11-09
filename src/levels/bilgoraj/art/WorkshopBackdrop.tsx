import { LogWall } from '@/levels/bilgoraj/art/LogWall'
import { SieveArt } from '@/levels/bilgoraj/art/SieveArt'
import { WinterWindow } from '@/levels/bilgoraj/art/WinterWindow'
import type { RoomLayout } from '@/levels/bilgoraj/room-layout'

const INK = '#3a2614'

function Shelf({
  x,
  y,
  width,
  unit,
  finished,
}: {
  x: number
  y: number
  width: number
  unit: number
  finished: number
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={12 * unit}
        fill="#6a4426"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d={`M${x + 16 * unit} ${y + 12 * unit}l${10 * unit} ${26 * unit}M${x + width - 16 * unit} ${y + 12 * unit}l${-10 * unit} ${26 * unit}`}
        stroke={INK}
        strokeWidth={4 * unit}
      />
      {[0, 1, 2, 3].map((index) => (
        <g key={index} transform={`translate(${x + width / 2} ${y - (10 + index * 16) * unit})`}>
          <SieveArt rx={width * 0.36} gap={10} />
        </g>
      ))}
      {Array.from({ length: finished }, (_, index) => (
        <g
          key={`done-${index}`}
          transform={`translate(${x + width / 2} ${y - (74 + index * 18) * unit})`}
        >
          <SieveArt rx={width * 0.36} gap={[14, 9, 6][index] ?? 6} />
        </g>
      ))}
    </g>
  )
}

function Hoops({ x, y, unit }: { x: number; y: number; unit: number }) {
  return (
    <g>
      <path d={`M${x} ${y - 14 * unit}V${y}`} stroke={INK} strokeWidth={3 * unit} />
      {[0, 1, 2].map((index) => (
        <ellipse
          key={index}
          cx={x}
          cy={y + (40 + index * 6) * unit}
          rx={(42 - index * 6) * unit}
          ry={(44 - index * 6) * unit}
          fill="none"
          stroke={index % 2 ? '#c99a62' : '#b8884e'}
          strokeWidth={7 * unit}
        />
      ))}
    </g>
  )
}

function HairBundles({ x, y, unit }: { x: number; y: number; unit: number }) {
  return (
    <g>
      <path d={`M${x - 60 * unit} ${y}H${x + 60 * unit}`} stroke={INK} strokeWidth={4 * unit} />
      {[-40, 0, 40].map((dx, index) => (
        <g key={dx} transform={`translate(${x + dx * unit} ${y})`}>
          <path
            d={`M${-8 * unit} 0C${-12 * unit} ${40 * unit} ${-16 * unit} ${80 * unit} ${-10 * unit} ${110 * unit}H${10 * unit}C${16 * unit} ${80 * unit} ${12 * unit} ${40 * unit} ${8 * unit} 0Z`}
            fill={['#e6d6b0', '#3a2a22', '#a8784a'][index]}
            stroke={INK}
            strokeWidth={1.6}
          />
          <rect x={-10 * unit} y={6 * unit} width={20 * unit} height={8 * unit} fill="#c8402f" />
        </g>
      ))}
    </g>
  )
}

export function WorkshopBackdrop({ layout, finished }: { layout: RoomLayout; finished: number }) {
  const { world, unit, floor, portrait } = layout
  const { width } = world
  const windowWidth = 220 * unit
  return (
    <g>
      <LogWall layout={layout} warm={0.18} />
      <WinterWindow
        x={portrait ? width * 0.08 : width * 0.08}
        y={floor * 0.24}
        width={windowWidth}
        height={windowWidth * 0.8}
      />
      {!portrait && <Hoops x={width * 0.3} y={floor * 0.18} unit={unit} />}
      {!portrait && <HairBundles x={width * 0.18} y={floor * 0.6} unit={unit} />}
      <Shelf
        x={portrait ? width * 0.78 : width * 0.76}
        y={floor * 0.62}
        width={(portrait ? 120 : 190) * unit}
        unit={unit}
        finished={finished}
      />
      <g transform={`translate(${width * 0.9} ${floor * 0.14})`}>
        <path d={`M0 0V${40 * unit}`} stroke={INK} strokeWidth={2} />
        <circle cx={0} cy={56 * unit} r={70 * unit} fill="#ffd27a" opacity={0.18} />
        <path
          d={`M${-14 * unit} ${40 * unit}h${28 * unit}l${-4 * unit} ${30 * unit}h${-20 * unit}Z`}
          fill="#e0b060"
          stroke={INK}
          strokeWidth={2}
        />
        <ellipse cx={0} cy={62 * unit} rx={6 * unit} ry={10 * unit} fill="#fff2b0" />
      </g>
    </g>
  )
}
