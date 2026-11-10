'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import {
  PAINT,
  PAINT_SOFT,
  PAINT_WASH,
  WatercolorDefs,
} from '@/components/watercolor/WatercolorDefs'
import { RIDE_HINTS, RIDE_LEGS } from '@/content/kock'
import { HorseArt } from '@/levels/kock/art/HorseArt'
import { ObstacleArt } from '@/levels/kock/art/ObstacleArt'
import { OBSTACLE_HEIGHT, rideCourse } from '@/levels/kock/ride-course'
import type { SceneLayout } from '@/levels/kock/scene-layout'

const GRAVITY = 2600
const JUMP = 1050
const BUMP_SECONDS = 0.7
const BUMP_SLOW = 0.35
const HIT_HALF = 46

const FOREST = {
  fir: ['#4f7a4a', '#5a844e', '#466e44'],
  beech: ['#7a9a52', '#86a45a'],
  trunk: '#5a4632',
}

type RideStageProps = {
  layout: SceneLayout
  leg: number
  playing: boolean
  onLeg: (leg: number) => void
}

type Motion = {
  offset: number
  height: number
  lift: number
  bumpUntil: number
  stumbling: boolean
  hits: number[]
}

function Scenery({ layout, offset }: { layout: SceneLayout; offset: number }) {
  const { world, unit, ground } = layout
  const { width, height } = world
  const far = useMemo(
    () => (
      <g>
        <path
          d={ridgePath(width, ground - 150 * unit, 50 * unit, 6, ground, 0.003)}
          fill="#9ab48a"
          filter={PAINT_SOFT}
        />
        <path
          d={`M${width * 0.62} ${ground - 150 * unit}v${-60 * unit}l${12 * unit} ${-26 * unit}l${12 * unit} ${26 * unit}v${60 * unit}Z`}
          fill="#b8a488"
          opacity={0.8}
        />
      </g>
    ),
    [width, ground, unit],
  )
  const near = useMemo(
    () => (
      <TreeLine
        width={width}
        baseY={ground - 20 * unit}
        height={120 * unit}
        seed={27}
        palette={FOREST}
        filter={PAINT}
      />
    ),
    [width, ground, unit],
  )
  const tufts = useMemo(
    () =>
      scatter(9, Math.round(width / 40), {
        x: 0,
        y: ground + 10 * unit,
        width,
        height: height - ground,
      }),
    [width, height, ground, unit],
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
      <defs>
        <linearGradient id="kk-ride-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8cce0" />
          <stop offset="1" stopColor="#f4e8c8" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#kk-ride-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.3, height * 0.16, 160 * unit, 24 * unit, 5, 0.3)}
          fill="#fffaf0"
        />
        <path
          d={blobPath(width * 0.8, height * 0.22, 120 * unit, 20 * unit, 7, 0.3)}
          fill="#fffaf0"
        />
      </g>
      {layer(far, 0.12)}
      {layer(near, 0.45)}
      <rect x={0} y={ground} width={width} height={height - ground} fill="#9ab86a" filter={PAINT} />
      <rect
        x={0}
        y={ground + 6 * unit}
        width={width}
        height={40 * unit}
        fill="#d8c08a"
        opacity={0.9}
      />
      {layer(
        <g>
          {tufts.map((tuft) => (
            <path
              key={`${tuft.x}-${tuft.y}`}
              d={`M${tuft.x} ${tuft.y + 50 * unit}l${-5 * unit} ${-14 * unit * tuft.size}M${tuft.x + 6 * unit} ${tuft.y + 50 * unit}l${2 * unit} ${-18 * unit * tuft.size}`}
              stroke="#5f8a40"
              strokeWidth={3 * unit}
              strokeLinecap="round"
            />
          ))}
        </g>,
        1,
      )}
    </g>
  )
}

export function RideStage({ layout, leg, playing, onLeg }: RideStageProps) {
  const { world, unit, ground } = layout
  const plan = RIDE_LEGS[Math.min(leg, RIDE_LEGS.length - 1)]
  const course = useMemo(() => rideCourse(leg, plan.distance), [leg, plan.distance])
  const horseX = world.width * 0.24
  const state = useRef<Motion>({
    offset: 0,
    height: 0,
    lift: 0,
    bumpUntil: 0,
    stumbling: false,
    hits: [],
  })
  const clock = useRef(0)
  const [frame, setFrame] = useState<Motion>({
    offset: 0,
    height: 0,
    lift: 0,
    bumpUntil: 0,
    stumbling: false,
    hits: [],
  })
  const [hint, setHint] = useState<string>(RIDE_HINTS.start)
  const done = useRef(false)

  function jump() {
    if (!playing) return
    const current = state.current
    if (current.height > 0 || current.lift > 0) return
    state.current = { ...current, lift: JUMP }
  }

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      clock.current += dt
      const current = state.current
      const slow = clock.current < current.bumpUntil ? BUMP_SLOW : 1
      const offset = current.offset + plan.speed * slow * dt
      let lift = current.lift - GRAVITY * dt
      let height = Math.max(0, current.height + lift * dt)
      if (height === 0 && lift < 0) lift = 0
      let { bumpUntil, hits } = current
      for (const obstacle of course) {
        if (hits.includes(obstacle.id)) continue
        const gap = obstacle.pos - offset
        if (Math.abs(gap) < HIT_HALF && height < OBSTACLE_HEIGHT[obstacle.kind]) {
          hits = [...hits, obstacle.id]
          bumpUntil = clock.current + BUMP_SECONDS
          height = 0
          lift = 0
          setHint(RIDE_HINTS.bump)
        }
      }
      state.current = {
        offset,
        height,
        lift,
        bumpUntil,
        stumbling: clock.current < bumpUntil,
        hits,
      }
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
      if (event.key !== ' ' && event.key !== 'ArrowUp') return
      event.preventDefault()
      jump()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const next = course.find((obstacle) => obstacle.pos - frame.offset > -HIT_HALF)
  const nextGap = next ? Math.round(next.pos - frame.offset) : -1
  const progress = Math.min(1, frame.offset / plan.distance)

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      data-ride
      data-next-gap={nextGap}
      data-airborne={frame.height > 0}
      onPointerDown={jump}
    >
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        <Scenery layout={layout} offset={frame.offset} />
        {course.map((obstacle) => {
          const x = horseX + (obstacle.pos - frame.offset) * unit
          if (x < -100 * unit || x > world.width + 100 * unit) return null
          return (
            <g
              key={obstacle.id}
              transform={`translate(${x} ${ground + 40 * unit}) scale(${unit})`}
              opacity={frame.hits.includes(obstacle.id) ? 0.5 : 1}
            >
              <ObstacleArt kind={obstacle.kind} />
            </g>
          )
        })}
        <g
          transform={`translate(${horseX + (plan.distance - frame.offset) * unit} ${ground + 40 * unit}) scale(${unit})`}
        >
          <path d="M0 0V-150" stroke="#5a4632" strokeWidth={5} />
          <path d="M2 -150L60 -136L2 -122Z" fill="#fff" stroke="#2a1e16" strokeWidth={1.6} />
          <path d="M2 -136L60 -136L2 -122Z" fill="#c8402f" />
          <path d="M20 0L60 -80L100 0Z" fill="#e8dcc0" stroke="#2a1e16" strokeWidth={2} />
          <path d="M52 0L60 -40L68 0Z" fill="#5a4632" />
        </g>
        <g
          transform={`translate(${horseX} ${ground + 40 * unit - frame.height * unit}) scale(${unit * 1.15})`}
        >
          <HorseArt airborne={frame.height > 0} stumbling={frame.stumbling} />
        </g>
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="ride-panel"
            aria-label="Konny meldunek"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Konny meldunek"
              icon={<span aria-hidden="true">✉️</span>}
              counter={`Odcinek ${leg + 1} / ${RIDE_LEGS.length}`}
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
        <button
          type="button"
          className="pointer-events-auto absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] h-20 w-28 rounded-2xl border-2 border-[#7a4e28] bg-[#fbf0d6] font-display text-xl font-bold text-[#4a2f1a] shadow-lg active:translate-y-1"
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
      )}
    </div>
  )
}
