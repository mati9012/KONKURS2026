import { blobPath } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/wlodawa/scene-layout'

const INK = '#2a1e16'

const TREES = {
  fir: ['#5f8a5a', '#6a945e'],
  beech: ['#86a85a', '#94b466', '#7a9a50'],
  trunk: '#5a4632',
}

const HOUSES = ['#e8c8a0', '#d8b890', '#f0d8b4', '#c8b498', '#e4c4a4']

export function marketStall(layout: SceneLayout) {
  const { world, unit, ground } = layout
  return { x: world.width / 2, y: ground, width: 300 * unit }
}

export function MarketBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const top = ground - 230 * unit
  const rise = (portrait ? 200 : 0) * unit
  const awning = ground - 138 * unit
  const bay = 150 * unit
  const bays = Math.ceil(width / bay) + 1
  const stall = marketStall(layout)

  return (
    <g>
      <defs>
        <linearGradient id="wl-market-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc4dc" />
          <stop offset="1" stopColor="#f6ead0" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#wl-market-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.24, height * 0.14, 150 * unit, 22 * unit, 3, 0.3)}
          fill="#fffaf0"
        />
        <path
          d={blobPath(width * 0.76, height * 0.2, 120 * unit, 18 * unit, 8, 0.3)}
          fill="#fffaf0"
        />
      </g>
      {Array.from({ length: Math.ceil(width / (130 * unit)) + 1 }, (_, index) => {
        const x = index * 130 * unit
        const tall = (90 + ((index * 37) % 50)) * unit + rise
        return (
          <g key={index} filter={PAINT_SOFT} opacity={0.85}>
            <rect
              x={x}
              y={top - tall + 40 * unit}
              width={124 * unit}
              height={tall}
              fill={HOUSES[index % HOUSES.length]}
            />
            <path
              d={`M${x - 6 * unit} ${top - tall + 40 * unit}L${x + 62 * unit} ${top - tall - 10 * unit}L${x + 130 * unit} ${top - tall + 40 * unit}Z`}
              fill="#a8604a"
            />
            {Array.from({ length: Math.max(1, Math.floor(tall / (56 * unit)) - 1) }, (_, row) =>
              [30, 80].map((dx) => (
                <rect
                  key={`${row}-${dx}`}
                  x={x + dx * unit}
                  y={top - tall + (64 + row * 56) * unit}
                  width={16 * unit}
                  height={24 * unit}
                  fill="#7a8a94"
                />
              )),
            )}
          </g>
        )
      })}
      <TreeLine
        width={width}
        baseY={top + 30 * unit}
        height={90 * unit}
        seed={71}
        palette={TREES}
        density={0.5}
        filter={PAINT_SOFT}
      />
      <g filter={PAINT}>
        <path
          d={`M-20 ${top}L${width * 0.02} ${top - 50 * unit}H${width * 0.98}L${width + 20} ${top}Z`}
          fill="#a85a3a"
          stroke={INK}
          strokeWidth={2}
        />
        <rect x={-20} y={top} width={width + 40} height={ground - top} fill="#f2e4c4" />
      </g>
      {Array.from({ length: Math.ceil(width / (60 * unit)) }, (_, index) => (
        <path
          key={index}
          d={`M${index * 60 * unit} ${top - 4 * unit}l${14 * unit} ${-40 * unit}`}
          stroke="#8a4a2e"
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      <path d={`M-20 ${top}H${width + 20}`} stroke={INK} strokeWidth={3} />
      {Array.from({ length: bays }, (_, index) => {
        const x = width / 2 + (index - Math.floor(bays / 2)) * bay
        if (Math.abs(x - stall.x) < bay / 2) return null
        const half = bay * 0.34
        const archTop = top + 40 * unit
        return (
          <path
            key={index}
            d={`M${x - half} ${ground}V${archTop + half}A${half} ${half} 0 0 1 ${x + half} ${archTop + half}V${ground}Z`}
            fill="#8a6a4a"
            stroke={INK}
            strokeWidth={2}
          />
        )
      })}
      <g>
        <path
          d={`M${stall.x - stall.width / 2} ${ground}V${ground - 110 * unit}A${stall.width / 2} ${stall.width / 2.4} 0 0 1 ${stall.x + stall.width / 2} ${ground - 110 * unit}V${ground}Z`}
          fill="#6a4a30"
          stroke={INK}
          strokeWidth={2.4}
        />
        <path
          d={`M${stall.x - stall.width * 0.56} ${awning}H${stall.x + stall.width * 0.56}L${stall.x + stall.width * 0.5} ${awning + 38 * unit}H${stall.x - stall.width * 0.5}Z`}
          fill="#c8402f"
          stroke={INK}
          strokeWidth={2}
        />
        {[-0.4, -0.2, 0, 0.2, 0.4].map((share) => (
          <path
            key={share}
            d={`M${stall.x + stall.width * share - 12 * unit} ${awning}h${24 * unit}l${-2 * unit} ${38 * unit}h${-20 * unit}Z`}
            fill="#f8efe0"
          />
        ))}
        <rect
          x={stall.x - stall.width * 0.46}
          y={ground - 70 * unit}
          width={stall.width * 0.92}
          height={70 * unit}
          fill="#a87a4a"
          stroke={INK}
          strokeWidth={2}
        />
        <path
          d={`M${stall.x - stall.width * 0.5} ${ground - 70 * unit}H${stall.x + stall.width * 0.5}`}
          stroke="#5a3a22"
          strokeWidth={8 * unit}
          strokeLinecap="round"
        />
        {[-0.3, 0, 0.3].map((share) => (
          <path
            key={share}
            d={`M${stall.x + stall.width * share} ${ground - 60 * unit}V${ground}`}
            stroke="#7a5432"
            strokeWidth={2}
          />
        ))}
      </g>
      <rect x={0} y={ground} width={width} height={height - ground} fill="#b8a888" filter={PAINT} />
      {Array.from({ length: Math.ceil(width / (34 * unit)) * 3 }, (_, index) => {
        const row = Math.floor(index / Math.ceil(width / (34 * unit)))
        const column = index % Math.ceil(width / (34 * unit))
        return (
          <path
            key={index}
            d={blobPath(
              column * 34 * unit + (row % 2) * 17 * unit,
              ground + (24 + row * 34) * unit,
              14 * unit,
              8 * unit,
              index + 200,
              0.2,
              8,
            )}
            fill="#a89878"
            opacity={0.7}
          />
        )
      })}
    </g>
  )
}
