'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { blobPath, ridgePath } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { GORGE_HINTS, GORGE_LEGS } from '@/content/kazimierz-dolny'
import { GorgeObstacleArt } from '@/levels/kazimierz-dolny/art/GorgeObstacleArt'
import { RoosterArt } from '@/levels/kazimierz-dolny/art/RoosterArt'
import { gorgeCourse, ROOT_HEIGHT } from '@/levels/kazimierz-dolny/gorge-course'
import type { SceneLayout } from '@/levels/kazimierz-dolny/scene-layout'

const GRAVITY = 2600
const JUMP = 1000
const DUCK_SECONDS = 0.75
const BUMP_SECONDS = 0.7
const BUMP_SLOW = 0.35
const HIT_HALF = 44
const BUTTON =
  'pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] h-20 w-28 rounded-2xl border-2 border-[#7a4e28] bg-[#fbf0d6] font-display text-lg font-bold text-[#4a2f1a] shadow-lg active:translate-y-1'

const TREES = {
  fir: ['#5a7e52', '#648a5a'],
  beech: ['#7aa05a', '#88ac64', '#6e9450'],
  trunk: '#5a4632',
}

type Runner = {
  clock: number
  offset: number
  height: number
  lift: number
  duckUntil: number
  bumpUntil: number
  hits: number[]
}

const START: Runner = {
  clock: 0,
  offset: 0,
  height: 0,
  lift: 0,
  duckUntil: 0,
  bumpUntil: 0,
  hits: [],
}

type GorgeStageProps = {
  layout: SceneLayout
  leg: number
  playing: boolean
  onLeg: (leg: number) => void
}

function Walls({ layout, offset }: { layout: SceneLayout; offset: number }) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const top = ground - (portrait ? 640 : 420) * unit
  const far = useMemo(
    () => (
      <g>
        <path d={ridgePath(width, top - 20 * unit, 30 * unit, 7, ground, 0.004)} fill="#e0c88a" />
        {[0.2, 0.45, 0.7].map((share) => (
          <path
            key={share}
            d={`M-20 ${top + (ground - top) * share}C${width * 0.3} ${top + (ground - top) * share - 10 * unit} ${width * 0.6} ${top + (ground - top) * share + 12 * unit} ${width + 20} ${top + (ground - top) * share}`}
            stroke="#c8ac6a"
            strokeWidth={4 * unit}
            fill="none"
            opacity={0.6}
          />
        ))}
      </g>
    ),
    [width, top, ground, unit],
  )
  const crest = useMemo(
    () => (
      <g>
        <TreeLine
          width={width}
          baseY={top + 10 * unit}
          height={120 * unit}
          seed={91}
          palette={TREES}
          density={0.9}
          filter={PAINT_SOFT}
        />
        {Array.from({ length: Math.ceil(width / (70 * unit)) }, (_, index) => (
          <path
            key={index}
            d={`M${index * 70 * unit} ${top}C${index * 70 * unit - 6 * unit} ${top + 40 * unit} ${index * 70 * unit + 8 * unit} ${top + 80 * unit} ${index * 70 * unit + (index % 2 ? 4 : -6) * unit} ${top + (60 + (index % 3) * 30) * unit}`}
            stroke="#7a5a34"
            strokeWidth={3 * unit}
            fill="none"
            opacity={0.8}
          />
        ))}
      </g>
    ),
    [width, top, unit],
  )
  const layer = (content: ReactNode, factor: number) => {
    const shift = -((offset * unit * factor) % width)
    return (
      <g transform={`translate(${shift} 0)`}>
        {content}
        <g transform={`translate(${width} 0)`}>{content}</g>
      </g>
    )
  }
  return (
    <g>
      <rect width={width} height={height} fill="#cfe0e8" />
      <path
        d={blobPath(width * 0.5, top * 0.4, 160 * unit, 22 * unit, 81, 0.3)}
        fill="#fffaf0"
        opacity={0.8}
      />
      {layer(far, 0.15)}
      {layer(crest, 0.4)}
      <rect y={ground} width={width} height={height - ground} fill="#c8a86a" filter={PAINT} />
      <rect y={ground + 4 * unit} width={width} height={30 * unit} fill="#a8884a" opacity={0.6} />
    </g>
  )
}

export function GorgeStage({ layout, leg, playing, onLeg }: GorgeStageProps) {
  const { world, unit, ground } = layout
  const plan = GORGE_LEGS[Math.min(leg, GORGE_LEGS.length - 1)]
  const course = useMemo(() => gorgeCourse(leg, plan.distance), [leg, plan.distance])
  const runnerX = world.width * 0.24
  const [frame, setFrame] = useState<Runner>(START)
  const state = useRef(frame)
  const done = useRef(false)
  const [hint, setHint] = useState<string>(GORGE_HINTS.start)

  function jump() {
    if (!playing) return
    const current = state.current
    if (current.height > 0 || current.lift > 0) return
    state.current = { ...current, lift: JUMP, duckUntil: 0 }
  }

  function duck() {
    if (!playing) return
    const current = state.current
    if (current.height > 0) return
    state.current = { ...current, duckUntil: current.clock + DUCK_SECONDS }
  }

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const current = state.current
      const clock = current.clock + dt
      const slow = clock < current.bumpUntil ? BUMP_SLOW : 1
      const offset = current.offset + plan.speed * slow * dt
      let lift = current.lift - GRAVITY * dt
      let height = Math.max(0, current.height + lift * dt)
      if (height === 0 && lift < 0) lift = 0
      const ducking = clock < current.duckUntil
      let { bumpUntil, hits } = current
      for (const obstacle of course) {
        if (hits.includes(obstacle.id)) continue
        if (Math.abs(obstacle.pos - offset) >= HIT_HALF) continue
        const hit = obstacle.kind === 'root' ? height < ROOT_HEIGHT : !ducking
        if (!hit) continue
        hits = [...hits, obstacle.id]
        bumpUntil = clock + BUMP_SECONDS
        height = 0
        lift = 0
        setHint(obstacle.kind === 'root' ? GORGE_HINTS.root : GORGE_HINTS.branch)
      }
      state.current = { ...current, clock, offset, height, lift, bumpUntil, hits }
      setFrame(state.current)
      if (offset >= plan.distance) {
        if (!done.current) {
          done.current = true
          onLeg(leg)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, course, plan.distance, plan.speed, leg, onLeg])

  useEffect(() => {
    if (!playing) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowUp' || event.key === ' ') jump()
      else if (event.key === 'ArrowDown') duck()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const ducking = frame.clock < frame.duckUntil
  const airborne = frame.height > 0
  const stumbling = frame.clock < frame.bumpUntil
  const next = course.find((obstacle) => obstacle.pos - frame.offset > -HIT_HALF)
  const nextGap = next ? Math.round(next.pos - frame.offset) : -1
  const progress = Math.min(1, frame.offset / plan.distance)
  const pose = ducking ? 'duck' : airborne ? 'jump' : 'run'

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      data-gorge
      data-next-gap={nextGap}
      data-next-kind={next?.kind ?? ''}
      data-airborne={airborne}
      data-ducking={ducking}
    >
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        <Walls layout={layout} offset={frame.offset} />
        {course.map((obstacle) => {
          const x = runnerX + (obstacle.pos - frame.offset) * unit
          if (x < -150 * unit || x > world.width + 150 * unit) return null
          return (
            <g
              key={obstacle.id}
              transform={`translate(${x} ${ground + 10 * unit}) scale(${unit})`}
              opacity={frame.hits.includes(obstacle.id) ? 0.5 : 1}
            >
              <GorgeObstacleArt kind={obstacle.kind} />
            </g>
          )
        })}
        <g
          transform={`translate(${runnerX} ${ground + 10 * unit - frame.height * unit}) scale(${unit})${stumbling ? ' rotate(-8)' : ''}`}
        >
          <RoosterArt pose={pose} />
        </g>
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="gorge-panel"
            aria-label="Wąwóz lessowy"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Wąwóz lessowy"
              icon={<span aria-hidden="true">🐓</span>}
              counter={`Odcinek ${leg + 1} / ${GORGE_LEGS.length}`}
              hint={hint}
            >
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8d8b4]">
                <div
                  className="h-full rounded-full bg-[#1f5c50]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
      {playing && (
        <>
          <button
            type="button"
            className={`${BUTTON} left-4`}
            onPointerDown={(event) => {
              event.stopPropagation()
              duck()
            }}
            onClick={(event) => {
              if (event.detail === 0) duck()
            }}
          >
            Schyl się
          </button>
          <button
            type="button"
            className={`${BUTTON} right-4`}
            onPointerDown={(event) => {
              event.stopPropagation()
              jump()
            }}
            onClick={(event) => {
              if (event.detail === 0) jump()
            }}
          >
            Skok!
          </button>
        </>
      )}
    </div>
  )
}
