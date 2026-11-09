import { motion } from 'motion/react'
import { useMemo } from 'react'
import { blobPath, scatter } from '@/components/watercolor/paint'
import { PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import { BUILDING_IDS } from '@/content/zamosc'
import type { BuildingId } from '@/content/zamosc'
import { sketchBlock } from '@/levels/zamosc/art/block-shapes'
import type { Piece } from '@/levels/zamosc/art/block-shapes'
import { buildingArt, quarterBlocks, quarterPieces } from '@/levels/zamosc/art/city-pieces'
import { insidePolygon, polygonPath, project, unproject } from '@/levels/zamosc/city-layout'
import type { CityLayout, PlanPoint } from '@/levels/zamosc/city-layout'

export const CITY_PAINT = 'url(#zm-paint)'

const FIELD_COLORS = ['#c9cf8a', '#dcd08c', '#b5c47e', '#e3d49a', '#a9bd7a', '#d4c27e']
const TREE_COLORS = ['#5f8a4f', '#6f9a58', '#4f7a48', '#7aa262']

type CityArtProps = {
  layout: CityLayout
  built: readonly BuildingId[]
}

function CityDefs() {
  return (
    <defs>
      <filter id="zm-paint" x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" />
        <feDisplacementMap
          in="SourceGraphic"
          scale="3.5"
          xChannelSelector="R"
          yChannelSelector="G"
          result="shape"
        />
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.35 1.05" result="grain" />
        <feComposite in="shape" in2="grain" operator="in" result="pigment" />
        <feMorphology in="shape" operator="erode" radius="1.2" />
        <feGaussianBlur stdDeviation="1.4" result="core" />
        <feComposite in="shape" in2="core" operator="out" />
        <feColorMatrix values="0.5 0 0 0 0  0 0.45 0 0 0  0 0 0.45 0 0  0 0 0 0.5 0" result="rim" />
        <feMerge>
          <feMergeNode in="pigment" />
          <feMergeNode in="rim" />
        </feMerge>
      </filter>
    </defs>
  )
}

function Countryside({ layout }: { layout: CityLayout }) {
  const { width, height } = layout.world
  const fields = useMemo(
    () =>
      scatter(5, 26, { x: -80, y: -80, width: width + 160, height: height + 160 }).map(
        (field, index) => ({
          ...field,
          path: blobPath(
            field.x,
            field.y,
            layout.scale * (0.28 + field.size * 0.2),
            layout.scale * (0.16 + field.tone * 0.12),
            index * 13 + 2,
            0.22,
            9,
          ),
          color: FIELD_COLORS[index % FIELD_COLORS.length],
        }),
      ),
    [width, height, layout.scale],
  )
  const trees = useMemo(() => {
    const ring = layout.walls.map(([x, y]): PlanPoint => [x * 1.3, y * 1.36])
    return scatter(17, 140, { x: -40, y: -40, width: width + 80, height: height + 80 })
      .filter((tree) => !insidePolygon(ring, unproject(layout, tree)))
      .map((tree, index) => ({
        ...tree,
        r: layout.scale * 0.035 * tree.size,
        color: TREE_COLORS[index % TREE_COLORS.length],
        seed: index * 7 + 1,
      }))
      .sort((a, b) => a.y - b.y)
  }, [layout, width, height])
  const roads: PlanPoint[][] = [
    [
      [-1.1, 0.02],
      [-1.6, 0.1],
      [-2.4, 0.05],
    ],
    [
      [1.06, 0.04],
      [1.6, 0.12],
      [2.4, 0.3],
    ],
    [
      [0.3, 0.68],
      [0.4, 1.1],
      [0.3, 1.8],
    ],
  ]
  const stream: PlanPoint[] = [
    [-2.4, 0.95],
    [-1.4, 0.82],
    [-0.6, 0.96],
    [0.4, 0.86],
    [1.2, 0.98],
    [2.4, 0.9],
  ]
  const curve = (points: readonly PlanPoint[]) =>
    points
      .map((point, index) => {
        const { x, y } = project(layout, point)
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join('')

  return (
    <>
      <rect width={width} height={height} fill="#e9dfbf" />
      <g filter={PAINT_SOFT} opacity={0.85}>
        {fields.map((field) => (
          <path key={field.path} d={field.path} fill={field.color} opacity={0.75} />
        ))}
      </g>
      <g filter={PAINT_SOFT} fill="none" strokeLinecap="round">
        <path d={curve(stream)} stroke="#8cb4c2" strokeWidth={layout.scale * 0.05} />
        {roads.map((road) => (
          <path
            key={curve(road)}
            d={curve(road)}
            stroke="#d8c08f"
            strokeWidth={layout.scale * 0.03}
          />
        ))}
      </g>
      <g filter={CITY_PAINT}>
        {trees.map((tree) => (
          <g key={tree.seed}>
            <ellipse
              cx={tree.x + tree.r * 0.4}
              cy={tree.y + tree.r * 0.2}
              rx={tree.r}
              ry={tree.r * 0.5}
              fill="#4b3b2b"
              opacity={0.18}
            />
            <path
              d={blobPath(tree.x, tree.y - tree.r * 0.7, tree.r, tree.r * 0.95, tree.seed, 0.2, 9)}
              fill={tree.color}
            />
          </g>
        ))}
      </g>
    </>
  )
}

function Compass({ layout }: { layout: CityLayout }) {
  const { width, height } = layout.world
  const size = Math.min(width, height) * 0.06
  const x = width - size * 2.6
  const y = height * 0.25 + size * 2
  const turn = layout.upright ? -90 : 0
  const labels = [
    { text: 'Pn', angle: -90 },
    { text: 'Pd', angle: 90 },
    { text: 'Wsch', angle: 0 },
    { text: 'Zach', angle: 180 },
  ]
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.88}>
      <circle r={size * 1.05} fill="#f5ead0" stroke="#8a5a2b" strokeWidth={1.2} />
      <g transform={`rotate(${turn})`}>
        <path d={`M${-size} 0L0 ${size * 0.18}L${size} 0L0 ${-size * 0.18}Z`} fill="#c99a5b" />
        <path d={`M0 ${-size}L${size * 0.18} 0L0 ${size}L${-size * 0.18} 0Z`} fill="#8a5a2b" />
        <path d={`M0 ${-size}L${size * 0.18} 0L${-size * 0.18} 0Z`} fill="#b03a2e" />
      </g>
      {labels.map((label) => {
        const radians = ((label.angle + turn) * Math.PI) / 180
        const reach = Math.abs(Math.cos(radians)) > 0.5 ? size * 1.75 : size * 1.4
        return (
          <text
            key={label.text}
            x={Math.cos(radians) * reach}
            y={Math.sin(radians) * reach + size * 0.14}
            textAnchor="middle"
            fontSize={size * 0.4}
            fontWeight={700}
            fill="#5a3a1e"
            className="font-display"
          >
            {label.text}
          </text>
        )
      })}
    </g>
  )
}

function PieceArt({ piece, fresh }: { piece: Piece; fresh: boolean }) {
  return (
    <motion.g
      initial={fresh ? { opacity: 0, y: -28 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1.2, 0.36, 1] }}
    >
      <g filter={CITY_PAINT}>{piece.body}</g>
      {piece.ink}
    </motion.g>
  )
}

export function CityArt({ layout, built }: CityArtProps) {
  const countryside = useMemo(() => <Countryside layout={layout} />, [layout])
  const art = useMemo(
    () =>
      Object.fromEntries(BUILDING_IDS.map((id) => [id, buildingArt(layout, id)])) as Record<
        BuildingId,
        ReturnType<typeof buildingArt>
      >,
    [layout],
  )
  const quarters = useMemo(() => quarterPieces(layout), [layout])
  const sketches = useMemo(() => quarterBlocks(layout), [layout])
  const townDone = built.includes('houses')
  const latest = built[built.length - 1]
  const groundOrder: BuildingId[] = ['fortress', 'grodzka', 'market']

  const pieces = [
    ...built.flatMap((id) => art[id].pieces.map((piece) => ({ piece, id }))),
    ...(townDone ? quarters.map((piece) => ({ piece, id: 'houses' as BuildingId })) : []),
  ].sort((a, b) => a.piece.depth - b.piece.depth)

  return (
    <>
      <CityDefs />
      {countryside}
      <path
        d={polygonPath(layout, layout.walls)}
        fill="#d8d6a2"
        filter={PAINT_WASH}
        opacity={0.8}
      />
      {groundOrder
        .filter((id) => built.includes(id))
        .map((id) => {
          const ground = art[id].ground
          if (!ground) return null
          return (
            <motion.g
              key={`ground-${id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
            >
              <g filter={CITY_PAINT}>{ground.body}</g>
              {ground.ink}
            </motion.g>
          )
        })}
      {!townDone && (
        <g>
          {sketches.map((block) => (
            <g key={`${block.x}-${block.y}`}>{sketchBlock(block)}</g>
          ))}
        </g>
      )}
      {pieces.map(({ piece, id }) => (
        <PieceArt key={piece.key} piece={piece} fresh={id === latest} />
      ))}
      <Compass layout={layout} />
    </>
  )
}
