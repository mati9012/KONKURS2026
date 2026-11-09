'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { SIEVE_IDS, SIEVE_NAMES, SIFT_HINTS, SIFT_TASKS } from '@/content/bilgoraj'
import type { GrainKind, SieveId } from '@/content/bilgoraj'
import { createRandom } from '@/lib/noise'
import { BilgorajIcon } from '@/levels/bilgoraj/art/BilgorajIcon'
import { GrainArt } from '@/levels/bilgoraj/art/GrainArt'
import { KitchenBackdrop } from '@/levels/bilgoraj/art/KitchenBackdrop'
import { SieveArt } from '@/levels/bilgoraj/art/SieveArt'
import type { RoomLayout } from '@/levels/bilgoraj/room-layout'

const MESH: Record<SieveId, number> = { przetak: 5, medium: 2.5, fine: 1.5 }
const MESH_GAP: Record<SieveId, number> = { przetak: 16, medium: 10, fine: 6 }
const SIZE: Record<GrainKind, number> = {
  grain: 4,
  stone: 6,
  straw: 8,
  kasza: 3,
  sand: 2,
  flour: 1,
  clump: 2,
  worm: 3,
}
const COUNT: Record<GrainKind, number> = {
  grain: 20,
  stone: 6,
  straw: 5,
  kasza: 24,
  sand: 34,
  flour: 44,
  clump: 8,
  worm: 5,
}
const SHAKE_TRAVEL = 50
const RESET_MS = 1300

type Grain = {
  id: number
  kind: GrainKind
  x: number
  y: number
  turn: number
  bowlX: number
  bowlY: number
}

type SiftStageProps = {
  layout: RoomLayout
  task: number
  playing: boolean
  onTask: (task: number) => void
}

function grainsFor(task: number): Grain[] {
  const random = createRandom(task * 31 + 5)
  return SIFT_TASKS[task].mix
    .flatMap((kind) =>
      Array.from({ length: COUNT[kind] }, () => {
        const angle = random() * Math.PI * 2
        const radius = Math.sqrt(random())
        const bowlAngle = random() * Math.PI * 2
        const bowlRadius = Math.sqrt(random())
        return {
          id: 0,
          kind,
          x: Math.cos(angle) * radius * 0.8,
          y: Math.sin(angle) * radius * 0.8,
          turn: random() * 360,
          bowlX: Math.cos(bowlAngle) * bowlRadius * 0.75,
          bowlY: Math.sin(bowlAngle) * bowlRadius * 0.75,
        }
      }),
    )
    .map((grain, id) => ({ ...grain, id }))
}

export function SiftStage({ layout, task, playing, onTask }: SiftStageProps) {
  const { world, unit, floor, portrait } = layout
  const [sieve, setSieve] = useState<SieveId | null>(null)
  const [fallen, setFallen] = useState<number[]>([])
  const [shakes, setShakes] = useState(0)
  const [hint, setHint] = useState<string>(SIFT_HINTS.pick)
  const [locked, setLocked] = useState(false)
  const drag = useRef<{ x: number; dir: number; travel: number } | null>(null)
  const current = SIFT_TASKS[Math.min(task, SIFT_TASKS.length - 1)]
  const grains = useMemo(() => grainsFor(Math.min(task, SIFT_TASKS.length - 1)), [task])
  const backdrop = useMemo(() => <KitchenBackdrop layout={layout} fire={0.3} />, [layout])
  const tableY = floor + 20 * unit
  const bowl = { x: world.width * (portrait ? 0.42 : 0.5), y: tableY + 110 * unit, rx: 150 * unit }
  const held = { x: bowl.x, y: tableY - 70 * unit, rx: 150 * unit }
  const hooks = SIEVE_IDS.map((id, index) => ({
    id,
    x: world.width * (portrait ? 0.2 + index * 0.3 : 0.3 + index * 0.13),
    y: floor * (portrait ? 0.62 : 0.5),
  }))

  function reset() {
    setSieve(null)
    setFallen([])
    setShakes(0)
    setLocked(false)
    setHint(SIFT_HINTS.pick)
  }

  function pick(id: SieveId) {
    if (!playing || locked || sieve) return
    setSieve(id)
    setFallen([])
    setShakes(0)
    setHint(SIFT_HINTS.shake)
  }

  function shake() {
    if (!playing || locked || !sieve) return
    const passable = grains.filter((grain) => SIZE[grain.kind] < MESH[sieve])
    const waiting = passable.filter((grain) => !fallen.includes(grain.id))
    const batch = waiting.slice(0, Math.ceil(passable.length / 4)).map((grain) => grain.id)
    const nextFallen = [...fallen, ...batch]
    setFallen(nextFallen)
    setShakes((value) => value + 1)
    if (sieve !== current.sieve) {
      setLocked(true)
      setHint(MESH[sieve] > MESH[current.sieve] ? SIFT_HINTS.tooBig : SIFT_HINTS.tooSmall)
      setTimeout(reset, RESET_MS)
      return
    }
    if (nextFallen.length === passable.length) {
      setLocked(true)
      setHint(SIFT_HINTS.done)
      onTask(task)
    }
  }

  function startShake(event: ReactPointerEvent<SVGGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, dir: 0, travel: 0 }
  }

  function moveShake(event: ReactPointerEvent<SVGGElement>) {
    const current = drag.current
    if (!current) return
    const delta = event.clientX - current.x
    const dir = Math.sign(delta)
    const travel = dir === current.dir ? current.travel + Math.abs(delta) : Math.abs(delta)
    if (travel > SHAKE_TRAVEL) {
      shake()
      drag.current = { x: event.clientX, dir: -dir, travel: 0 }
      return
    }
    drag.current = { x: event.clientX, dir: dir || current.dir, travel }
  }

  const staying = grains.filter((grain) => !fallen.includes(grain.id))
  const dropped = grains.filter((grain) => fallen.includes(grain.id))

  return (
    <>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full touch-none select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {hooks.map((hook) => (
          <g key={hook.id} transform={`translate(${hook.x} ${hook.y})`}>
            <circle cx={0} cy={-62 * unit} r={5 * unit} fill="#3a2614" />
            {sieve !== hook.id && (
              <g
                role="button"
                tabIndex={0}
                aria-label={SIEVE_NAMES[hook.id]}
                data-sieve={hook.id}
                className="cursor-pointer outline-none"
                onClick={() => pick(hook.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  pick(hook.id)
                }}
              >
                <path
                  d={`M0 ${-62 * unit}L${-40 * unit} ${-10 * unit}M0 ${-62 * unit}L${40 * unit} ${-10 * unit}`}
                  stroke="#3a2614"
                  strokeWidth={2}
                />
                <g transform={`scale(${unit})`}>
                  <SieveArt rx={70} gap={MESH_GAP[hook.id]} wire={hook.id === 'przetak'} />
                </g>
                <rect
                  x={-80 * unit}
                  y={-70 * unit}
                  width={160 * unit}
                  height={110 * unit}
                  fill="transparent"
                />
              </g>
            )}
          </g>
        ))}
        <g transform={`translate(${bowl.x} ${bowl.y})`}>
          <ellipse
            cx={0}
            cy={60 * unit}
            rx={bowl.rx * 1.05}
            ry={18 * unit}
            fill="#3a2614"
            opacity={0.25}
          />
          <path
            d={`M${-bowl.rx} 0Q${-bowl.rx * 0.9} ${70 * unit} 0 ${70 * unit}Q${bowl.rx * 0.9} ${70 * unit} ${bowl.rx} 0Z`}
            fill="#c0603a"
            stroke="#3a2614"
            strokeWidth={2}
          />
          <ellipse
            cx={0}
            cy={0}
            rx={bowl.rx}
            ry={bowl.rx * 0.28}
            fill="#7a3a22"
            stroke="#3a2614"
            strokeWidth={2}
          />
          {dropped.map((grain) => (
            <motion.g
              key={grain.id}
              initial={{
                x: grain.x * held.rx,
                y: held.y - bowl.y + grain.y * held.rx * 0.38,
                opacity: 0.4,
              }}
              animate={{ x: grain.bowlX * bowl.rx, y: grain.bowlY * bowl.rx * 0.24, opacity: 1 }}
              transition={{ duration: 0.6, delay: (grain.id % 7) * 0.04, ease: 'easeIn' }}
            >
              <g transform={`scale(${unit * 1.6})`}>
                <GrainArt kind={grain.kind} turn={grain.turn} />
              </g>
            </motion.g>
          ))}
        </g>
        <AnimatePresence>
          {sieve && (
            <motion.g
              key={`${sieve}-${task}`}
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
            >
              <g transform={`translate(${held.x} ${held.y})`}>
                <motion.g
                  key={shakes}
                  animate={{ x: [0, -16 * unit, 16 * unit, -8 * unit, 0] }}
                  transition={{ duration: 0.35 }}
                >
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label="Potrząśnij sitem"
                    data-shake
                    className="cursor-grab outline-none"
                    onPointerDown={startShake}
                    onPointerMove={moveShake}
                    onPointerUp={() => {
                      drag.current = null
                    }}
                    onClick={(event) => {
                      if (event.detail === 0) shake()
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      shake()
                    }}
                  >
                    <g transform={`scale(${held.rx / 70})`}>
                      <SieveArt rx={70} gap={MESH_GAP[sieve]} wire={sieve === 'przetak'} />
                    </g>
                    {staying.map((grain) => (
                      <g
                        key={grain.id}
                        transform={`translate(${grain.x * held.rx} ${grain.y * held.rx * 0.38}) scale(${unit * 1.6})`}
                      >
                        <GrainArt kind={grain.kind} turn={grain.turn} />
                      </g>
                    ))}
                    <rect
                      x={-held.rx}
                      y={-held.rx * 0.5}
                      width={held.rx * 2}
                      height={held.rx}
                      fill="transparent"
                    />
                  </g>
                </motion.g>
              </g>
            </motion.g>
          )}
        </AnimatePresence>
        {!sieve && (
          <g transform={`translate(${held.x} ${held.y})`}>
            {grains.map((grain) => (
              <g
                key={grain.id}
                transform={`translate(${grain.x * held.rx * 0.6} ${grain.y * held.rx * 0.2 + 30 * unit}) scale(${unit * 1.6})`}
              >
                <GrainArt kind={grain.kind} turn={grain.turn} />
              </g>
            ))}
          </g>
        )}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="sift-panel"
            aria-label="Przesiewanie"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Przesiewanie"
              icon={<BilgorajIcon name="bowl" className="size-6" />}
              counter={`Zadania: ${task} / ${SIFT_TASKS.length}`}
              hint={hint}
            >
              <p className="mt-1 text-sm text-[#5a4630] italic">{current.goal}</p>
              {sieve && !locked && (
                <button
                  type="button"
                  className="mt-2 rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] px-4 py-1 font-display text-sm font-bold text-[#4a2f1a] hover:bg-[#fff6e2]"
                  onClick={shake}
                >
                  Potrząśnij
                </button>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
