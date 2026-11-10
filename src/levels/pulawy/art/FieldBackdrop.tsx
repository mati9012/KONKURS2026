import { blobPath } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/pulawy/scene-layout'

const INK = '#2a1e16'

const TREES = {
  fir: ['#5a7e52', '#648a5a'],
  beech: ['#7aa05a', '#88ac64', '#6e9450'],
  trunk: '#5a4632',
}

export function FieldBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const horizon = ground - 200 * unit
  const palaceX = width * 0.78
  return (
    <g>
      <defs>
        <linearGradient id="pu-field-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ab8dc" />
          <stop offset="1" stopColor="#eef0dc" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#pu-field-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.25} />
      <circle cx={width * 0.16} cy={horizon * 0.42} r={46 * unit} fill="#fff4c8" />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.46, height * 0.14, 130 * unit, 18 * unit, 41, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <TreeLine
        width={width}
        baseY={horizon + 30 * unit}
        height={90 * unit}
        seed={64}
        palette={TREES}
        density={0.5}
        filter={PAINT_SOFT}
        opacity={0.85}
      />
      <g
        transform={`translate(${palaceX} ${horizon + 34 * unit}) scale(${unit * 0.9})`}
        filter={PAINT_SOFT}
        opacity={0.9}
      >
        <rect
          x={-170}
          y={-90}
          width={340}
          height={90}
          fill="#f2e8d0"
          stroke={INK}
          strokeWidth={2}
        />
        <path d="M-180 -90H180L160 -112H-160Z" fill="#8a6a5a" stroke={INK} strokeWidth={2} />
        <path
          d="M-50 -90V-0M-30 -90V0M-10 -90V0M10 -90V0M30 -90V0M50 -90V0"
          stroke="#d8ccb0"
          strokeWidth={6}
        />
        <path d="M-60 -112L0 -146L60 -112Z" fill="#f2e8d0" stroke={INK} strokeWidth={2} />
        {[-140, -110, -80, 80, 110, 140].map((x) => (
          <rect key={x} x={x - 8} y={-70} width={16} height={26} fill="#7a9aaa" />
        ))}
      </g>
      <rect y={horizon + 30 * unit} width={width} height={height} fill="#a8b46a" filter={PAINT} />
      {Array.from({ length: 6 }, (_, index) => {
        const y = horizon + 40 * unit + index * index * 10 * unit
        return (
          <path
            key={index}
            d={`M-20 ${y}H${width + 20}`}
            stroke={index % 2 === 0 ? '#c8c47a' : '#8a9a52'}
            strokeWidth={(6 + index * 3) * unit}
            opacity={0.7}
          />
        )
      })}
      <rect
        y={ground - 30 * unit}
        width={width}
        height={height - ground + 30 * unit}
        fill="#8a6a42"
        filter={PAINT}
      />
      {Array.from({ length: 4 }, (_, index) => (
        <path
          key={index}
          d={`M-20 ${ground + (index * 30 - 10) * unit}H${width + 20}`}
          stroke="#6a4a2a"
          strokeWidth={4 * unit}
          opacity={0.5}
        />
      ))}
      {!portrait && (
        <g transform={`translate(${width * 0.06} ${ground - 30 * unit})`}>
          <path d={`M0 0V${-110 * unit}`} stroke="#6a4a2a" strokeWidth={6 * unit} />
          <rect
            x={-10 * unit}
            y={-150 * unit}
            width={170 * unit}
            height={46 * unit}
            rx={6 * unit}
            fill="#e8d4a4"
            stroke={INK}
            strokeWidth={2}
          />
          <text
            x={75 * unit}
            y={-120 * unit}
            textAnchor="middle"
            fontSize={18 * unit}
            fontWeight={700}
            fill="#4a2f1a"
            fontFamily="var(--font-alegreya), Georgia, serif"
          >
            Pole doświadczalne
          </text>
        </g>
      )}
    </g>
  )
}
