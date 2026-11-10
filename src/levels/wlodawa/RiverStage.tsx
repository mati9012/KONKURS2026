'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { blobPath, scatter } from '@/components/watercolor/paint'
import { PAINT_SOFT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { RIVER_HINTS, RIVER_LEGS } from '@/content/wlodawa'
import { KayakArt } from '@/levels/wlodawa/art/KayakArt'
import { RiverObstacleArt } from '@/levels/wlodawa/art/RiverObstacleArt'
import { LANES, riverCourse } from '@/levels/wlodawa/river-course'
import type { SceneLayout } from '@/levels/wlodawa/scene-layout'

const BUMP_SECONDS = 0.8
const BUMP_SLOW = 0.3
const HIT_HALF = 44
const STEER_RATE = 7
const STEER_BUTTON =
  'pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] h-20 w-20 rounded-2xl border-2 border-[#7a4e28] bg-[#fbf0d6] font-display text-3xl font-bold text-[#4a2f1a] shadow-lg active:translate-y-1'

type RiverStageProps = {
  layout: SceneLayout
  leg: number
  playing: boolean
  onLeg: (leg: number) => void
}

type Paddle = {
  offset: number
  x: number
  lane: number
  bumpUntil: number
  bumping: boolean
  hits: number[]
}

const START: Paddle = { offset: 0, x: 1, lane: 1, bumpUntil: 0, bumping: false, hits: [] }

function riverBand(layout: SceneLayout) {
  const { world, unit, portrait } = layout
  const width = Math.min(world.width * (portrait ? 0.84 : 0.46), 780 * unit * (portrait ? 1.4 : 1))
  const left = (world.width - width) / 2
  return { left, width, lane: width / LANES }
}

function Banks({ layout }: { layout: SceneLayout }) {
  const { world, unit } = layout
  const { width, height } = world
  const band = riverBand(layout)
  const right = band.left + band.width
  const trees = useMemo(
    () => [
      ...scatter(5, Math.round(height / (60 * unit)), {
        x: 0,
        y: 50 * unit,
        width: Math.max(0, band.left - 50 * unit),
        height: height - 100 * unit,
      }),
      ...scatter(6, Math.round(height / (60 * unit)), {
        x: right + 50 * unit,
        y: 50 * unit,
        width: Math.max(0, width - right - 50 * unit),
        height: height - 100 * unit,
      }),
    ],
    [width, height, unit, band.left, right],
  )
  const edge = (x: number, side: number) =>
    Array.from({ length: Math.ceil(height / (40 * unit)) + 1 }, (_, index) => (
      <path
        key={`${side}-${index}`}
        d={blobPath(x, index * 40 * unit, 26 * unit, 30 * unit, index * 3 + side, 0.3, 8)}
        fill={index % 3 === 0 ? '#d8c890' : '#7a9a4a'}
      />
    ))
  return (
    <g>
      <rect y={-2} width={band.left} height={height + 4} fill="#8aaa58" />
      <rect x={right} y={-2} width={width - right} height={height + 4} fill="#86a456" />
      <g filter={PAINT_SOFT}>
        {edge(band.left, 1)}
        {edge(right, 2)}
      </g>
      {trees.map((tree, index) => (
        <g key={index} filter={PAINT_SOFT}>
          <path
            d={blobPath(
              tree.x,
              tree.y,
              34 * unit * tree.size,
              30 * unit * tree.size,
              index + 40,
              0.25,
              9,
            )}
            fill={tree.tone > 0.5 ? '#4a6e3a' : '#5a7e40'}
          />
          <path
            d={blobPath(
              tree.x - 8 * unit,
              tree.y - 8 * unit,
              16 * unit * tree.size,
              14 * unit * tree.size,
              index + 90,
              0.25,
              8,
            )}
            fill="#7a9e52"
          />
        </g>
      ))}
    </g>
  )
}

function Ripples({ layout }: { layout: SceneLayout }) {
  const { world, unit } = layout
  const band = riverBand(layout)
  const marks = useMemo(
    () =>
      scatter(12, Math.round(world.height / (50 * unit)), {
        x: band.left + 30 * unit,
        y: 0,
        width: band.width - 60 * unit,
        height: world.height,
      }),
    [world.height, unit, band.left, band.width],
  )
  return (
    <g>
      {marks.map((mark, index) => (
        <path
          key={index}
          d={`M${mark.x} ${mark.y}c${8 * unit} ${-4 * unit} ${16 * unit} ${4 * unit} ${24 * unit} 0`}
          stroke="#d8eef4"
          strokeWidth={2.4 * unit}
          fill="none"
          opacity={0.35 + mark.tone * 0.4}
        />
      ))}
    </g>
  )
}

export function RiverStage({ layout, leg, playing, onLeg }: RiverStageProps) {
  const { world, unit } = layout
  const plan = RIVER_LEGS[Math.min(leg, RIVER_LEGS.length - 1)]
  const course = useMemo(() => riverCourse(leg, plan.distance), [leg, plan.distance])
  const band = riverBand(layout)
  const kayakY = world.height * 0.8
  const pace = unit * (layout.portrait ? 1.2 : 1)
  const [frame, setFrame] = useState<Paddle>(START)
  const state = useRef<Paddle>(frame)
  const clock = useRef(0)
  const done = useRef(false)
  const [hint, setHint] = useState<string>(RIVER_HINTS.start)
  const banks = useMemo(() => <Banks layout={layout} />, [layout])
  const ripples = useMemo(() => <Ripples layout={layout} />, [layout])

  function steer(direction: number) {
    if (!playing) return
    const current = state.current
    const lane = Math.max(0, Math.min(LANES - 1, current.lane + direction))
    state.current = { ...current, lane }
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
      const step = STEER_RATE * dt
      const x =
        Math.abs(current.lane - current.x) <= step
          ? current.lane
          : current.x + Math.sign(current.lane - current.x) * step
      let { bumpUntil, hits } = current
      for (const obstacle of course) {
        if (hits.includes(obstacle.id)) continue
        if (Math.abs(obstacle.pos - offset) < HIT_HALF && Math.abs(obstacle.lane - x) < 0.55) {
          hits = [...hits, obstacle.id]
          bumpUntil = clock.current + BUMP_SECONDS
          setHint(RIVER_HINTS.bump)
        }
      }
      state.current = {
        ...current,
        offset,
        x,
        bumpUntil,
        bumping: clock.current < bumpUntil,
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
      if (event.key === 'ArrowLeft') steer(-1)
      else if (event.key === 'ArrowRight') steer(1)
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const laneX = (lane: number) => band.left + band.lane * (lane + 0.5)
  const scroll = (frame.offset * pace) % world.height
  const progress = Math.min(1, frame.offset / plan.distance)
  const ahead = course.find((obstacle) => obstacle.pos - frame.offset > HIT_HALF)
  const blocked = course
    .filter((obstacle) => obstacle.pos === ahead?.pos)
    .map((obstacle) => obstacle.lane)
  const finishY = kayakY - (plan.distance - frame.offset) * pace

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      data-river
      data-lane={frame.lane}
      data-blocked={blocked.join(' ')}
      onPointerDown={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        steer(event.clientX < box.left + box.width / 2 ? -1 : 1)
      }}
    >
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        <defs>
          <linearGradient id="wl-river" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a7a8a" />
            <stop offset="0.5" stopColor="#6a9aa8" />
            <stop offset="1" stopColor="#4a7a8a" />
          </linearGradient>
        </defs>
        <rect width={world.width} height={world.height} fill="url(#wl-river)" />
        <g transform={`translate(0 ${scroll})`}>
          {ripples}
          <g transform={`translate(0 ${-world.height})`}>{ripples}</g>
        </g>
        <g transform={`translate(0 ${scroll})`}>
          {banks}
          <g transform={`translate(0 ${-world.height})`}>{banks}</g>
        </g>
        {finishY > -60 * unit && (
          <g transform={`translate(0 ${finishY})`}>
            <path
              d={`M${band.left} 0H${band.left + band.width}`}
              stroke="#fbf4e4"
              strokeWidth={14 * unit}
              strokeDasharray={`${18 * unit} ${18 * unit}`}
            />
            <path
              d={`M${band.left} 0H${band.left + band.width}`}
              stroke="#c8402f"
              strokeWidth={14 * unit}
              strokeDasharray={`${18 * unit} ${18 * unit}`}
              strokeDashoffset={18 * unit}
            />
          </g>
        )}
        {course.map((obstacle) => {
          const y = kayakY - (obstacle.pos - frame.offset) * pace
          if (y < -80 * unit || y > world.height + 80 * unit) return null
          return (
            <g
              key={obstacle.id}
              data-obstacle={obstacle.kind}
              transform={`translate(${laneX(obstacle.lane)} ${y}) scale(${(band.lane / 170) * 1.0})`}
              opacity={frame.hits.includes(obstacle.id) ? 0.5 : 1}
            >
              <RiverObstacleArt kind={obstacle.kind} />
            </g>
          )
        })}
        <g
          transform={`translate(${band.left + band.lane * (frame.x + 0.5)} ${kayakY}) scale(${Math.min(unit * 1.1, band.lane / 150)})`}
        >
          <KayakArt stroke={frame.offset / 40} wobble={frame.bumping} />
        </g>
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="river-panel"
            aria-label="Spływ Bugiem"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Spływ Bugiem"
              icon={<span aria-hidden="true">🛶</span>}
              counter={`Odcinek ${leg + 1} / ${RIVER_LEGS.length}`}
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
            aria-label="W lewo"
            className={`${STEER_BUTTON} left-4`}
            onPointerDown={(event) => {
              event.stopPropagation()
              steer(-1)
            }}
            onClick={(event) => {
              if (event.detail === 0) steer(-1)
            }}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="W prawo"
            className={`${STEER_BUTTON} right-4`}
            onPointerDown={(event) => {
              event.stopPropagation()
              steer(1)
            }}
            onClick={(event) => {
              if (event.detail === 0) steer(1)
            }}
          >
            ▶
          </button>
        </>
      )}
    </div>
  )
}
