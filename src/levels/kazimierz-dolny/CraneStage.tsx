'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { CRANE_HINTS, CRANE_ROUNDS } from '@/content/kazimierz-dolny'
import { BoatArt } from '@/levels/kazimierz-dolny/art/BoatArt'
import { CraneBackdrop, craneRig } from '@/levels/kazimierz-dolny/art/CraneBackdrop'
import { RoosterArt } from '@/levels/kazimierz-dolny/art/RoosterArt'
import { SackArt } from '@/levels/kazimierz-dolny/art/SackArt'
import type { SceneLayout } from '@/levels/kazimierz-dolny/scene-layout'

const GRAVITY = 2200
const RESPAWN_SECONDS = 0.5
const SPLASH_SECONDS = 0.7
const CHEER_SECONDS = 0.9
const BOAT_GAP = 560
const CATCH = 95

type Boat = { id: number; x: number; sacks: number }

type Dock = {
  clock: number
  boats: Boat[]
  nextId: number
  sackY: number
  falling: boolean
  vy: number
  readyAt: number
  loaded: number
  splashUntil: number
  cheerUntil: number
}

type CraneStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function startDock(layout: SceneLayout): Dock {
  const rig = craneRig(layout)
  return {
    clock: 0,
    boats: [{ id: 0, x: -200 * layout.unit, sacks: 0 }],
    nextId: 1,
    sackY: rig.hookY,
    falling: false,
    vy: 0,
    readyAt: 0,
    loaded: 0,
    splashUntil: 0,
    cheerUntil: 0,
  }
}

export function CraneStage({ layout, round, playing, onRound }: CraneStageProps) {
  const { world, unit } = layout
  const plan = CRANE_ROUNDS[Math.min(round, CRANE_ROUNDS.length - 1)]
  const rig = craneRig(layout)
  const boatScale = unit * 0.9
  const [frame, setFrame] = useState<Dock>(() => startDock(layout))
  const dock = useRef(frame)
  const done = useRef(false)
  const [hint, setHint] = useState<string>(CRANE_HINTS.start)
  const backdrop = useMemo(() => <CraneBackdrop layout={layout} />, [layout])

  function drop() {
    if (!playing) return
    const current = dock.current
    if (current.falling || current.clock < current.readyAt) return
    dock.current = { ...current, falling: true, vy: 0 }
  }

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const speed = plan.speed * unit
    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const current = dock.current
      const clock = current.clock + dt
      let boats = current.boats
        .map((boat) => ({ ...boat, x: boat.x + speed * dt }))
        .filter((boat) => boat.x < world.width + 300 * unit)
      let nextId = current.nextId
      const lastBoat = boats[boats.length - 1]
      if (!lastBoat || lastBoat.x > -200 * unit + BOAT_GAP * unit) {
        boats = [...boats, { id: nextId, x: -200 * unit, sacks: 0 }]
        nextId += 1
      }
      let { sackY, falling, vy, readyAt, loaded, splashUntil, cheerUntil } = current
      if (falling) {
        vy += GRAVITY * unit * dt
        sackY += vy * dt
        if (sackY >= rig.deckY) {
          const catcher = boats.find(
            (boat) => Math.abs(boat.x - rig.x) < CATCH * unit && boat.sacks < plan.capacity,
          )
          if (catcher) {
            boats = boats.map((boat) =>
              boat.id === catcher.id ? { ...boat, sacks: boat.sacks + 1 } : boat,
            )
            loaded += 1
            cheerUntil = clock + CHEER_SECONDS
            setHint(CRANE_HINTS.good)
          } else {
            splashUntil = clock + SPLASH_SECONDS
            setHint(CRANE_HINTS.miss)
          }
          falling = false
          vy = 0
          sackY = rig.hookY
          readyAt = clock + RESPAWN_SECONDS
        }
      }
      dock.current = {
        clock,
        boats,
        nextId,
        sackY,
        falling,
        vy,
        readyAt,
        loaded,
        splashUntil,
        cheerUntil,
      }
      setFrame(dock.current)
      if (loaded >= plan.sacks) {
        if (!done.current) {
          done.current = true
          onRound(round)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [
    playing,
    plan.speed,
    plan.sacks,
    plan.capacity,
    unit,
    world.width,
    rig.x,
    rig.hookY,
    rig.deckY,
    round,
    onRound,
  ])

  useEffect(() => {
    if (!playing) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== ' ' && event.key !== 'ArrowDown') return
      event.preventDefault()
      drop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const fallTime = Math.sqrt((2 * (rig.deckY - rig.hookY)) / (GRAVITY * unit))
  const aligned = frame.boats.some(
    (boat) =>
      boat.sacks < plan.capacity &&
      Math.abs(boat.x + plan.speed * unit * fallTime - rig.x) < CATCH * unit * 0.5,
  )
  const ready = !frame.falling && frame.clock >= frame.readyAt
  const splashing = frame.clock < frame.splashUntil
  const cheering = frame.clock < frame.cheerUntil

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      data-crane
      data-aligned={aligned && ready}
      onPointerDown={drop}
    >
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        {backdrop}
        {frame.boats.map((boat) => (
          <g
            key={boat.id}
            transform={`translate(${boat.x} ${rig.deckY + 20 * unit}) scale(${boatScale})`}
          >
            <BoatArt sacks={boat.sacks} capacity={plan.capacity} />
          </g>
        ))}
        {(ready || frame.falling) && (
          <g>
            {!frame.falling && (
              <path
                d={`M${rig.x} ${rig.hookY - 56 * unit}V${frame.sackY - 50 * unit}`}
                stroke="#5a4632"
                strokeWidth={3}
              />
            )}
            <g transform={`translate(${rig.x} ${frame.sackY}) scale(${unit})`}>
              <SackArt splash={false} />
            </g>
          </g>
        )}
        {splashing && (
          <g transform={`translate(${rig.x} ${rig.deckY + 40 * unit}) scale(${unit})`}>
            <SackArt splash />
          </g>
        )}
        <g
          transform={`translate(${rig.granaryRight + 20 * unit} ${layout.ground - 46 * unit}) scale(${unit * 0.9})`}
        >
          <RoosterArt pose={cheering ? 'crow' : 'stand'} />
        </g>
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="crane-panel"
            aria-label="Spichlerze nad Wisłą"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Spichlerze nad Wisłą"
              icon={<span aria-hidden="true">🌾</span>}
              counter={`Worki: ${Math.min(frame.loaded, plan.sacks)} / ${plan.sacks}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
      {playing && (
        <button
          type="button"
          className="pointer-events-auto absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] h-20 w-32 rounded-2xl border-2 border-[#7a4e28] bg-[#fbf0d6] font-display text-lg font-bold text-[#4a2f1a] shadow-lg active:translate-y-1"
          onPointerDown={(event) => {
            event.stopPropagation()
            drop()
          }}
          onClick={(event) => {
            if (event.detail === 0) drop()
          }}
        >
          Puść worek!
        </button>
      )}
    </div>
  )
}
