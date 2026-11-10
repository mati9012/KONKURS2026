'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { PREDATOR_NAMES, TURTLE_HINTS, TURTLE_WAVES } from '@/content/poleski-park-narodowy'
import { HatchlingArt } from '@/levels/poleski-park-narodowy/art/HatchlingArt'
import { MorningBackdrop } from '@/levels/poleski-park-narodowy/art/MorningBackdrop'
import { PoleskiIcon } from '@/levels/poleski-park-narodowy/art/PoleskiIcon'
import { PredatorArt } from '@/levels/poleski-park-narodowy/art/PredatorArt'
import type { SceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'
import { turtlePath } from '@/levels/poleski-park-narodowy/turtle-path'
import { scare, startSim, stepSim } from '@/levels/poleski-park-narodowy/turtle-sim'
import type { TurtleSim } from '@/levels/poleski-park-narodowy/turtle-sim'

const PREDATOR_SPEED = [70, 82, 94]

type TurtleStageProps = {
  layout: SceneLayout
  wave: number
  playing: boolean
  onWave: (wave: number) => void
}

export function TurtleStage({ layout, wave, playing, onWave }: TurtleStageProps) {
  const { world, unit } = layout
  const plan = TURTLE_WAVES[Math.min(wave, TURTLE_WAVES.length - 1)]
  const settings = useMemo(
    () => ({
      hatchlings: plan.hatchlings,
      predatorEveryMs: plan.predatorEveryMs,
      speed: PREDATOR_SPEED[Math.min(wave, PREDATOR_SPEED.length - 1)],
    }),
    [plan, wave],
  )
  const path = useMemo(() => turtlePath(layout), [layout])
  const backdrop = useMemo(() => <MorningBackdrop layout={layout} path={path} />, [layout, path])
  const [frame, setFrame] = useState<TurtleSim>(startSim)
  const sim = useRef<TurtleSim>(frame)
  const [hint, setHint] = useState<string>(TURTLE_HINTS.start)
  const done = useRef(false)

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min(50, now - last)
      last = now
      const result = stepSim(sim.current, dt, settings, path, unit, Math.random)
      sim.current = result.sim
      setFrame(result.sim)
      if (result.caught) setHint(TURTLE_HINTS.caught)
      if (result.sim.saved >= settings.hatchlings) {
        if (!done.current) {
          done.current = true
          onWave(wave)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, settings, path, unit, wave, onWave])

  function shoo(id: number) {
    if (!playing) return
    sim.current = scare(sim.current, id, unit)
    setFrame(sim.current)
    setHint(TURTLE_HINTS.scared)
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full touch-none select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {frame.hatchlings.map((hatchling) => {
          const spot = path.at(hatchling.progress)
          const ahead = path.at(hatchling.progress + 0.02)
          const flip = ahead.x < spot.x ? -1 : 1
          return (
            <g
              key={hatchling.id}
              data-hatchling={hatchling.id}
              transform={`translate(${spot.x} ${spot.y}) scale(${unit * 1.3 * flip} ${unit * 1.3})`}
              pointerEvents="none"
            >
              <HatchlingArt hiding={hatchling.hiding > 0} step={hatchling.progress} />
            </g>
          )
        })}
        {frame.predators.map((predator) => (
          <g
            key={predator.id}
            role="button"
            tabIndex={0}
            aria-label={`Przegoń: ${PREDATOR_NAMES[predator.kind]}`}
            data-predator={predator.kind}
            data-fleeing={predator.fleeing > 0 ? 'true' : undefined}
            className="cursor-pointer outline-none"
            opacity={predator.fleeing > 0 ? Math.min(1, predator.fleeing / 400) : 1}
            transform={`translate(${predator.x} ${predator.y}) scale(${unit * 1.15 * predator.facing} ${unit * 1.15})`}
            onPointerDown={() => shoo(predator.id)}
            onClick={(event) => {
              if (event.detail === 0) shoo(predator.id)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              shoo(predator.id)
            }}
          >
            <rect x={-100} y={-70} width={200} height={90} fill="transparent" />
            <PredatorArt kind={predator.kind} />
          </g>
        ))}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="turtle-panel"
            aria-label="Mglisty poranek"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={`Mglisty poranek · fala ${wave + 1} / ${TURTLE_WAVES.length}`}
              icon={<PoleskiIcon name="turtle" className="size-6" />}
              counter={`Żółwie w wodzie: ${Math.min(frame.saved, plan.hatchlings)} / ${plan.hatchlings}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
