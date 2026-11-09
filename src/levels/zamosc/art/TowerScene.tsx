import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import type { World } from '@/components/watercolor/useWorld'
import {
  PAINT,
  PAINT_SOFT,
  PAINT_WASH,
  WatercolorDefs,
} from '@/components/watercolor/WatercolorDefs'
import type { HejnalDirection } from '@/content/zamosc'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { Trumpeter } from '@/levels/zamosc/art/Trumpeter'

const INK = '#3a2614'
const HOUSE_COLORS = ['#d8714f', '#e8b84a', '#6fa3a0', '#c4566b', '#8fae62', '#e59a61', '#7f8fc4']
const TOWER_WALL = '#f2cdb3'
const TOWER_SHADE = '#d9a98e'
const COPPER = '#5f6f6a'
const DISTANT = '#b8b3a4'
const FOREST = {
  fir: ['#6f8f72', '#7d9c78', '#62806a'],
  beech: ['#8fa978', '#9db584', '#86a06f'],
  trunk: '#6b5a48',
}
const BIRDS = [
  [0.18, 0.16, 1],
  [0.24, 0.13, 0.8],
  [0.74, 0.22, 0.9],
  [0.8, 0.19, 0.7],
  [0.69, 0.18, 0.6],
] as const

type Note = { id: number }

type TowerSceneProps = {
  world: World
  facing: HejnalDirection
  playing: boolean
  notes: readonly Note[]
}

function towerGeometry({ width, height }: World) {
  const tower = Math.min(width * 0.2, height * 0.12)
  return { x: width / 2, gallery: height * 0.4, tower }
}

function Backdrop({ world }: { world: World }) {
  const { width, height } = world
  const { x, gallery, tower } = towerGeometry(world)
  const clouds = scatter(31, 7, { x: 0, y: height * 0.05, width, height: height * 0.25 })
  const facadeTop = gallery + tower * 1.7
  const houseTop = gallery + tower * 2.1
  const houseWidth = Math.max(tower * 0.75, 70)
  const houses = []
  for (let left = -houseWidth * 0.3, index = 0; left < width; left += houseWidth, index++) {
    const center = left + houseWidth / 2
    if (Math.abs(center - x) < tower * 1.7) continue
    houses.push({ left, index, top: houseTop + (index % 3) * tower * 0.12 })
  }

  return (
    <>
      <defs>
        <linearGradient id="zm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc0dc" />
          <stop offset="0.6" stopColor="#d9e4e4" />
          <stop offset="1" stopColor="#f3e3c0" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#zm-sky)" />
      <g filter={PAINT_SOFT} fill="#fbf6ec" opacity={0.85}>
        {clouds.map((cloud, index) => (
          <path
            key={index}
            d={blobPath(cloud.x, cloud.y, 120 * cloud.size, 34 * cloud.size, index + 9, 0.25, 11)}
          />
        ))}
      </g>
      <g filter={PAINT_WASH}>
        <path d={ridgePath(width, height * 0.5, height * 0.06, 3, height)} fill="#b9c8b2" />
        <path d={ridgePath(width, height * 0.56, height * 0.04, 8, height)} fill="#a3b892" />
      </g>
      <g filter={PAINT_SOFT} fill={DISTANT} opacity={0.85}>
        {[
          { at: 0.16, tall: 1.5, dome: true },
          { at: 0.86, tall: 1.2, dome: false },
        ].map((spire) => {
          const left = width * spire.at - tower * 0.18
          const top = height * 0.6 - tower * spire.tall
          return (
            <g key={spire.at}>
              <rect x={left} y={top} width={tower * 0.36} height={tower * spire.tall} />
              {spire.dome ? (
                <path
                  d={`M${left - tower * 0.04} ${top}Q${left + tower * 0.18} ${top - tower * 0.5} ${left + tower * 0.4} ${top}Z`}
                />
              ) : (
                <path
                  d={`M${left - tower * 0.04} ${top}L${left + tower * 0.18} ${top - tower * 0.6}L${left + tower * 0.4} ${top}Z`}
                />
              )}
            </g>
          )
        })}
      </g>
      <TreeLine
        width={width}
        baseY={height * 0.6}
        height={height * 0.07}
        seed={23}
        palette={FOREST}
        filter={PAINT_SOFT}
        opacity={0.85}
      />
      <g stroke="#4a3a30" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6}>
        {BIRDS.map(([bx, by, size]) => (
          <path
            key={`${bx}-${by}`}
            d={`M${width * bx - 9 * size} ${height * by}q${4.5 * size} ${-6 * size} ${9 * size} 0q${4.5 * size} ${-6 * size} ${9 * size} 0`}
          />
        ))}
      </g>
      <g filter={PAINT}>
        <rect
          x={x - tower * 1.6}
          y={facadeTop}
          width={tower * 3.2}
          height={height - facadeTop}
          fill={TOWER_WALL}
        />
        <path
          d={`M${x - tower * 1.75} ${facadeTop}L${x - tower * 1.2} ${facadeTop - tower * 0.45}H${x + tower * 1.2}L${x + tower * 1.75} ${facadeTop}Z`}
          fill={COPPER}
        />
        <rect
          x={x - tower / 2}
          y={gallery}
          width={tower}
          height={facadeTop - gallery}
          fill={TOWER_WALL}
        />
        <rect
          x={x + tower * 0.28}
          y={gallery}
          width={tower * 0.22}
          height={facadeTop - gallery}
          fill={TOWER_SHADE}
        />
        <rect
          x={x - tower * 0.4}
          y={gallery - tower * 1.15}
          width={tower * 0.8}
          height={tower * 1.15}
          fill={TOWER_WALL}
        />
        <path
          d={`M${x - tower * 0.5} ${gallery - tower * 1.15}H${x + tower * 0.5}L${x + tower * 0.34} ${gallery - tower * 1.35}H${x - tower * 0.34}Z`}
          fill={COPPER}
        />
        <path
          d={`M${x - tower * 0.32} ${gallery - tower * 1.35}C${x - tower * 0.5} ${gallery - tower * 1.75} ${x - tower * 0.05} ${gallery - tower * 1.85} ${x} ${gallery - tower * 2.1}C${x + tower * 0.05} ${gallery - tower * 1.85} ${x + tower * 0.5} ${gallery - tower * 1.75} ${x + tower * 0.32} ${gallery - tower * 1.35}Z`}
          fill={COPPER}
        />
        <rect
          x={x - tower * 0.09}
          y={gallery - tower * 2.35}
          width={tower * 0.18}
          height={tower * 0.28}
          fill={COPPER}
        />
        <path
          d={`M${x - tower * 0.12} ${gallery - tower * 2.35}Q${x} ${gallery - tower * 2.6} ${x + tower * 0.12} ${gallery - tower * 2.35}Z`}
          fill="#4f5d58"
        />
        {houses.map((house) => (
          <g key={house.left}>
            <rect
              x={house.left}
              y={house.top}
              width={houseWidth}
              height={height - house.top}
              fill={HOUSE_COLORS[house.index % HOUSE_COLORS.length]}
            />
            <path
              d={`M${house.left} ${house.top}Q${house.left + houseWidth / 4} ${house.top - houseWidth * 0.32} ${house.left + houseWidth / 2} ${house.top}Q${house.left + (houseWidth * 3) / 4} ${house.top - houseWidth * 0.32} ${house.left + houseWidth} ${house.top}Z`}
              fill={HOUSE_COLORS[house.index % HOUSE_COLORS.length]}
            />
          </g>
        ))}
      </g>
      <g fill={INK} opacity={0.5}>
        {[0, 1].map((side) => (
          <path
            key={side}
            d={`M${x - tower * 0.3 + side * tower * 0.34} ${gallery}V${gallery - tower * 0.62}A${tower * 0.13} ${tower * 0.13} 0 0 1 ${x - tower * 0.04 + side * tower * 0.34} ${gallery - tower * 0.62}V${gallery}Z`}
          />
        ))}
        {houses.map((house) =>
          [0.22, 0.58].map((at) => (
            <rect
              key={`${house.left}-${at}`}
              x={house.left + houseWidth * at}
              y={house.top + houseWidth * 0.2}
              width={houseWidth * 0.2}
              height={houseWidth * 0.28}
              rx={houseWidth * 0.04}
            />
          )),
        )}
        {[-1.25, -0.75, 0.75, 1.25].map((at) => (
          <path
            key={at}
            d={`M${x + tower * at - tower * 0.12} ${facadeTop + tower * 0.68}v${-tower * 0.3}a${tower * 0.12} ${tower * 0.12} 0 0 1 ${tower * 0.24} 0v${tower * 0.3}Z`}
          />
        ))}
        {[-1.5, -1.05, 1.05, 1.5].map((at) => (
          <path
            key={`dormer-${at}`}
            d={`M${x + tower * at - tower * 0.09} ${facadeTop - tower * 0.08}v${-tower * 0.12}l${tower * 0.09} ${-tower * 0.1}l${tower * 0.09} ${tower * 0.1}v${tower * 0.12}Z`}
            opacity={0.5}
          />
        ))}
      </g>
      <g stroke={INK} strokeWidth={1.4} fill="none" opacity={0.5}>
        <path
          d={`M${x - tower * 1.62} ${facadeTop + tower * 0.12}H${x + tower * 1.62}M${x - tower * 0.55} ${gallery + tower * 0.12}H${x + tower * 0.55}M${x - tower * 0.5} ${gallery + tower * 1.1}H${x + tower * 0.5}M${x - tower * 0.42} ${gallery - tower * 1.05}H${x + tower * 0.42}`}
        />
        <path
          d={`M${x - tower * 0.42} ${gallery + tower * 0.12}V${facadeTop}M${x + tower * 0.42} ${gallery + tower * 0.12}V${facadeTop}`}
          strokeDasharray="2 5"
        />
        {[-1.25, -0.75, 0.75, 1.25].map((at) => (
          <path
            key={at}
            d={`M${x + tower * at - tower * 0.16} ${facadeTop + tower * 0.72}h${tower * 0.32}`}
            strokeWidth={2.2}
            stroke="#fff4e0"
            opacity={0.9}
          />
        ))}
      </g>
      <circle
        cx={x}
        cy={gallery + tower * 0.6}
        r={tower * 0.28}
        fill="#fff4d8"
        stroke={INK}
        strokeWidth={2}
      />
      <g stroke={INK} strokeWidth={1.6} strokeLinecap="round">
        {Array.from({ length: 12 }, (_, hour) => {
          const angle = (hour / 12) * Math.PI * 2
          const inner = tower * (hour % 3 === 0 ? 0.19 : 0.22)
          const outer = tower * 0.25
          const cy = gallery + tower * 0.6
          return (
            <path
              key={hour}
              d={`M${x + Math.sin(angle) * inner} ${cy - Math.cos(angle) * inner}L${x + Math.sin(angle) * outer} ${cy - Math.cos(angle) * outer}`}
            />
          )
        })}
      </g>
      <circle
        cx={x}
        cy={gallery + tower * 0.6}
        r={tower * 0.31}
        fill="none"
        stroke="#c99a5b"
        strokeWidth={3}
      />
      <path
        d={`M${x} ${gallery + tower * 0.6}v${-tower * 0.2}M${x} ${gallery + tower * 0.6}h${tower * 0.14}`}
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <g transform={`translate(${Math.max(tower * 0.6, width * 0.07)} ${height * 0.5})`}>
        <path d="M0 0V90" stroke="#6b4a2e" strokeWidth={6} />
        <path d="M-56 -22H36V10H-56L-74 -6Z" fill="#d9b27a" stroke={INK} strokeWidth={1.6} />
        <text
          x={-16}
          y={0}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="#5a3a1e"
          className="font-display"
        >
          Kraków
        </text>
      </g>
    </>
  )
}

function Balustrade({ world }: { world: World }) {
  const { x, gallery, tower } = towerGeometry(world)
  const width = tower * 1.35
  const posts = 7
  return (
    <g>
      <rect
        x={x - width / 2}
        y={gallery - tower * 0.05}
        width={width}
        height={tower * 0.12}
        fill="#e7c0a5"
        stroke={INK}
        strokeWidth={1.2}
      />
      {Array.from({ length: posts }, (_, index) => (
        <rect
          key={index}
          x={x - width / 2 + (width / (posts - 1)) * index - tower * 0.025}
          y={gallery - tower * 0.32}
          width={tower * 0.05}
          height={tower * 0.28}
          fill="#f0cfb6"
          stroke={INK}
          strokeWidth={0.8}
        />
      ))}
      <rect
        x={x - width / 2 - tower * 0.04}
        y={gallery - tower * 0.38}
        width={width + tower * 0.08}
        height={tower * 0.07}
        rx={tower * 0.02}
        fill="#e7c0a5"
        stroke={INK}
        strokeWidth={1.2}
      />
    </g>
  )
}

const FLIGHT: Record<
  HejnalDirection,
  { dx: number; dy: number; scale: number; from: [number, number] }
> = {
  east: { dx: 1, dy: -0.35, scale: 1, from: [0.75, -0.72] },
  west: { dx: -1, dy: -0.35, scale: 1, from: [-0.75, -0.72] },
  south: { dx: 0.25, dy: 0.5, scale: 1.8, from: [0, -0.68] },
  north: { dx: -0.15, dy: -1, scale: 0.5, from: [0, -1.05] },
}

function NotePath({ size }: { size: number }) {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={size * 0.32} ry={size * 0.24} fill={INK} transform="rotate(-20)" />
      <path
        d={`M${size * 0.28} ${-size * 0.05}V${-size}Q${size * 0.6} ${-size * 0.8} ${size * 0.7} ${-size * 0.5}`}
        stroke={INK}
        strokeWidth={size * 0.09}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

export function TowerScene({ world, facing, playing, notes }: TowerSceneProps) {
  const backdrop = useMemo(() => <Backdrop world={world} />, [world])
  const { x, gallery, tower } = towerGeometry(world)
  const flight = FLIGHT[facing]
  const reach = Math.min(world.width, world.height) * 0.35
  const size = tower * 0.95

  return (
    <svg
      viewBox={`0 0 ${world.width} ${world.height}`}
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <WatercolorDefs />
      {backdrop}
      <Trumpeter x={x} y={gallery - tower * 0.04} size={size} facing={facing} playing={playing} />
      <Balustrade world={world} />
      <AnimatePresence>
        {notes.map((note) => (
          <motion.g
            key={note.id}
            initial={{
              x: x + flight.from[0] * size,
              y: gallery + flight.from[1] * size,
              opacity: 1,
              scale: 0.6,
            }}
            animate={{
              x: x + flight.from[0] * size + flight.dx * reach,
              y: gallery + flight.from[1] * size + flight.dy * reach,
              opacity: 0,
              scale: flight.scale,
            }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            <NotePath size={tower * 0.32} />
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  )
}
