'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { toWorld } from '@/components/watercolor/useWorld'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { STONE_HINTS, STONE_PIECES } from '@/content/roztocze'
import { Brush } from '@/levels/roztocze/art/Brush'
import { DevilCoal } from '@/levels/roztocze/art/DevilCoal'
import { DuskBackdrop } from '@/levels/roztocze/art/DuskBackdrop'
import { PetrifiedPiece } from '@/levels/roztocze/art/PetrifiedPiece'
import { RoztoczeIcon } from '@/levels/roztocze/art/RoztoczeIcon'
import { SandMound } from '@/levels/roztocze/art/SandMound'
import { placeSpots } from '@/levels/roztocze/scene-layout'
import type { SceneLayout, Spot } from '@/levels/roztocze/scene-layout'

const PIECE_TOTAL = STONE_PIECES.length
const PLACE_MS = 1100
const DIG_STEP = 0.34
const UNCOVERED = 0.22
const TAP_SLOP = 6
const LATE_FROM = 3

type FindKind = 'piece' | 'coal'

type MoundPlan = { kind: FindKind; late: boolean }

const MOUND_PLAN: readonly MoundPlan[] = [
  { kind: 'coal', late: false },
  { kind: 'piece', late: false },
  { kind: 'piece', late: false },
  { kind: 'coal', late: false },
  { kind: 'piece', late: false },
  { kind: 'piece', late: false },
  { kind: 'coal', late: false },
  { kind: 'coal', late: true },
  { kind: 'coal', late: true },
]

const WIDE_SPOTS = [
  [0.04, 0.2],
  [0.27, 0.08],
  [0.5, 0.3],
  [0.73, 0.06],
  [0.96, 0.28],
  [0.16, 0.78],
  [0.42, 0.82],
  [0.68, 0.7],
  [0.9, 0.86],
] as const

const TALL_SPOTS = [
  [0.05, 0.05],
  [0.5, 0.0],
  [0.95, 0.12],
  [0.25, 0.32],
  [0.75, 0.38],
  [0.05, 0.62],
  [0.5, 0.66],
  [0.95, 0.72],
  [0.3, 0.95],
] as const

type Dig = { sand: number; taken: boolean }

type Mound = Spot & Dig & { id: number; kind: FindKind; late: boolean }

type StonesStageProps = {
  layout: SceneLayout
  playing: boolean
  onPiece: (count: number) => void
}

function trunkGeometry(layout: SceneLayout) {
  const { world, horizon, unit } = layout
  const length = Math.min(560 * unit, world.width * 0.84)
  const thickness = Math.min(64 * unit, length * 0.13)
  const y = horizon + (world.height - horizon) * 0.13
  const start = world.width / 2 - length / 2
  const segment = length / PIECE_TOTAL
  const slots = Array.from({ length: PIECE_TOTAL }, (_, index) => ({
    x: start + segment * (index + 0.5),
    y,
  }))
  return { length, thickness, segment, slots, y }
}

function moundSize(layout: SceneLayout) {
  return { rx: 74 * layout.unit, ry: 36 * layout.unit }
}

function moundSpots(layout: SceneLayout, trunkY: number) {
  const fractions = layout.portrait ? TALL_SPOTS : WIDE_SPOTS
  return placeSpots(layout, fractions, trunkY + 110 * layout.unit)
}

export function StonesStage({ layout, playing, onPiece }: StonesStageProps) {
  const svg = useRef<SVGSVGElement>(null)
  const trunk = useMemo(() => trunkGeometry(layout), [layout])
  const size = moundSize(layout)
  const spots = useMemo(() => moundSpots(layout, trunk.y), [layout, trunk.y])
  const [digs, setDigs] = useState<Dig[]>(() => MOUND_PLAN.map(() => ({ sand: 1, taken: false })))
  const mounds: Mound[] = MOUND_PLAN.map((plan, id) => ({ ...plan, ...spots[id], ...digs[id], id }))
  const [placed, setPlaced] = useState<Spot[]>([])
  const [hint, setHint] = useState<string>(STONE_HINTS.start)
  const [brush, setBrush] = useState<Spot | null>(null)
  const [shaking, setShaking] = useState<number | null>(null)
  const pointer = useRef<{ x: number; y: number; travel: number } | null>(null)
  const backdrop = useMemo(() => <DuskBackdrop layout={layout} />, [layout])

  useEffect(() => {
    if (shaking === null) return
    const timer = setTimeout(() => setShaking(null), 450)
    return () => clearTimeout(timer)
  }, [shaking])

  const active = (mound: Mound) => !mound.taken && (!mound.late || placed.length >= LATE_FROM)

  function moundAt(point: Spot) {
    return mounds.find(
      (mound) =>
        active(mound) &&
        mound.sand > UNCOVERED &&
        ((point.x - mound.x) / size.rx) ** 2 +
          ((point.y - mound.y + size.ry * 0.3) / size.ry) ** 2 <
          1.4,
    )
  }

  function dig(id: number, amount: number) {
    const sand = Math.max(0, digs[id].sand - amount)
    if (sand <= UNCOVERED) setHint(STONE_HINTS.uncovered)
    setDigs((current) =>
      current.map((item, index) =>
        index === id ? { ...item, sand: sand <= UNCOVERED ? 0 : sand } : item,
      ),
    )
  }

  function take(id: number) {
    setDigs((current) =>
      current.map((item, index) => (index === id ? { ...item, taken: true } : item)),
    )
  }

  function worldPoint(event: ReactPointerEvent<SVGSVGElement>) {
    return svg.current ? toWorld(svg.current, event.clientX, event.clientY) : null
  }

  function handleDown(event: ReactPointerEvent<SVGSVGElement>) {
    const point = worldPoint(event)
    if (!point || !playing) return
    pointer.current = { ...point, travel: 0 }
    setBrush(moundAt(point) ? point : null)
  }

  function handleMove(event: ReactPointerEvent<SVGSVGElement>) {
    const point = worldPoint(event)
    if (!point || !playing) return
    const mound = moundAt(point)
    const last = pointer.current
    if (event.pointerType === 'mouse' || last) setBrush(mound ? point : null)
    if (!last) return
    const step = Math.hypot(point.x - last.x, point.y - last.y)
    pointer.current = { ...point, travel: last.travel + step }
    if (mound) dig(mound.id, step / (size.rx * 6))
  }

  function handleUp(event: ReactPointerEvent<SVGSVGElement>) {
    const point = worldPoint(event)
    const last = pointer.current
    pointer.current = null
    if (event.pointerType !== 'mouse') setBrush(null)
    if (!point || !last || !playing || last.travel > TAP_SLOP) return
    const mound = moundAt(point)
    if (mound) dig(mound.id, DIG_STEP)
  }

  function pick(mound: Mound) {
    if (!playing || mound.taken) return
    if (mound.kind === 'coal') {
      setShaking(mound.id)
      setHint(STONE_HINTS.coal)
      take(mound.id)
      return
    }
    const count = placed.length + 1
    setPlaced((current) => [...current, { x: mound.x, y: mound.y }])
    take(mound.id)
    setHint(STONE_HINTS.piece)
    setTimeout(() => onPiece(count), PLACE_MS)
  }

  return (
    <>
      <svg
        ref={svg}
        viewBox={`0 0 ${layout.world.width} ${layout.world.height}`}
        className="absolute inset-0 size-full touch-none select-none"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={() => setBrush(null)}
      >
        <WatercolorDefs />
        {backdrop}
        <g aria-label="Kamienny pień" role="img">
          <ellipse
            cx={layout.world.width / 2}
            cy={trunk.y + trunk.thickness * 0.7}
            rx={trunk.length * 0.62}
            ry={trunk.thickness * 0.45}
            fill="#6b5340"
            opacity={0.3}
          />
          {trunk.slots.map((slot, index) => (
            <rect
              key={`slot-${index}`}
              x={slot.x - trunk.segment / 2}
              y={slot.y - trunk.thickness / 2}
              width={trunk.segment}
              height={trunk.thickness}
              rx={6}
              fill="#fff3d6"
              fillOpacity={0.22}
              stroke="#fff3d6"
              strokeWidth={2.5}
              strokeDasharray="9 7"
              className={index === placed.length ? 'zw-pulse' : undefined}
            />
          ))}
          {placed.map((from, index) => (
            <motion.g
              key={`piece-${index}`}
              initial={{ x: from.x, y: from.y, scale: 0.7, rotate: -20 }}
              animate={{ x: trunk.slots[index].x, y: trunk.slots[index].y, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            >
              <PetrifiedPiece
                length={trunk.segment * 1.02}
                thickness={trunk.thickness}
                seed={index}
              />
            </motion.g>
          ))}
        </g>
        <AnimatePresence>
          {mounds
            .filter((mound) => active(mound))
            .map((mound) => (
              <motion.g
                key={mound.id}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: mound.kind === 'coal' ? 0.2 : 1.2 }}
                style={{ x: mound.x, y: mound.y }}
              >
                <motion.g
                  animate={shaking === mound.id ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {mound.sand === 0 && (
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label="Znalezisko"
                      data-find={mound.kind}
                      className="cursor-pointer outline-none"
                      onClick={() => pick(mound)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        pick(mound)
                      }}
                    >
                      <ellipse
                        cx={0}
                        cy={-size.ry * 0.2}
                        rx={size.rx * 0.9}
                        ry={size.ry * 1.1}
                        fill="#fff3c4"
                        opacity={0.35}
                        className="zw-pulse"
                      />
                      {mound.kind === 'piece' ? (
                        <g transform="rotate(-12)">
                          <PetrifiedPiece
                            length={size.rx * 1.3}
                            thickness={size.ry * 1.05}
                            seed={mound.id}
                          />
                        </g>
                      ) : (
                        <DevilCoal size={size.ry * 1.3} />
                      )}
                    </g>
                  )}
                  {mound.sand > 0 && (
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Kopczyk piasku ${mound.id + 1}`}
                      data-mound={mound.id}
                      className="cursor-pointer outline-none"
                      opacity={0.35 + mound.sand * 0.65}
                      onClick={(event) => {
                        if (event.detail === 0 && playing) dig(mound.id, DIG_STEP)
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        if (playing) dig(mound.id, DIG_STEP)
                      }}
                    >
                      <g transform={`scale(1 ${0.45 + mound.sand * 0.55})`}>
                        <SandMound rx={size.rx} ry={size.ry} />
                      </g>
                    </g>
                  )}
                </motion.g>
              </motion.g>
            ))}
        </AnimatePresence>
        {brush && (
          <g transform={`translate(${brush.x} ${brush.y})`} pointerEvents="none">
            <Brush size={46 * layout.unit} />
          </g>
        )}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="stones-panel"
            aria-label="Kamienny Las"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Kamienny Las"
              icon={<RoztoczeIcon name="log" className="size-6" />}
              counter={`Pień: ${placed.length} / ${PIECE_TOTAL}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
