'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  CRANE_PROLOGUE,
  CRANE_ROUNDS,
  FACADE_PROLOGUE,
  FACADE_ROUNDS,
  GORGE_LEGS,
  GORGE_PROLOGUE,
} from '@/content/kazimierz-dolny'
import type { LevelGameProps } from '@/levels/level-game'
import { CraneStage } from '@/levels/kazimierz-dolny/CraneStage'
import { FacadeStage } from '@/levels/kazimierz-dolny/FacadeStage'
import { GorgeStage } from '@/levels/kazimierz-dolny/GorgeStage'
import { sceneLayout } from '@/levels/kazimierz-dolny/scene-layout'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1800

type Stage =
  | { kind: 'crane-prologue' }
  | { kind: 'crane'; step: number }
  | { kind: 'crane-facts'; step: number }
  | { kind: 'facade-prologue' }
  | { kind: 'facade'; step: number }
  | { kind: 'facade-facts'; step: number }
  | { kind: 'gorge-prologue' }
  | { kind: 'gorge'; step: number }
  | { kind: 'gorge-facts'; step: number }
  | { kind: 'finished' }

type Scene = 'crane' | 'facade' | 'gorge'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('crane')) return 'crane'
  if (stage.kind.startsWith('facade')) return 'facade'
  return 'gorge'
}

function stepOf(stage: Stage) {
  return 'step' in stage ? stage.step : 0
}

export function KazimierzLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'crane-prologue' })
  const scene = sceneOf(stage)
  const step = stepOf(stage)

  const onCrane = useCallback((done: number) => setStage({ kind: 'crane-facts', step: done }), [])
  const onFacade = useCallback((done: number) => setStage({ kind: 'facade-facts', step: done }), [])
  const onGorge = useCallback((done: number) => setStage({ kind: 'gorge-facts', step: done }), [])

  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (stage.kind !== 'finished') return
    const timer = setTimeout(onComplete, FINISH_MS)
    return () => clearTimeout(timer)
  }, [stage, onComplete])

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#3a3a2a]">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          {scene === 'crane' && (
            <CraneStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'crane'}
              onRound={onCrane}
            />
          )}
          {scene === 'facade' && (
            <FacadeStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'facade'}
              onRound={onFacade}
            />
          )}
          {scene === 'gorge' && (
            <GorgeStage
              key={step}
              layout={layout}
              leg={step}
              playing={stage.kind === 'gorge'}
              onLeg={onGorge}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{ backgroundImage: PAPER_GRAIN }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(30, 30, 25, 0.36) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {curtainOpen && stage.kind === 'crane-prologue' && (
          <NarratorConversation
            key="crane-prologue"
            lines={CRANE_PROLOGUE}
            doneLabel="Ładujemy zboże!"
            onDone={() => setStage({ kind: 'crane', step: 0 })}
          />
        )}
        {stage.kind === 'crane-facts' && (
          <NarratorConversation
            key={`crane-facts-${stage.step}`}
            lines={CRANE_ROUNDS[stage.step].facts}
            doneLabel={
              stage.step + 1 < CRANE_ROUNDS.length ? 'Następne statki' : 'Idziemy na rynek'
            }
            onDone={() =>
              setStage(
                stage.step + 1 < CRANE_ROUNDS.length
                  ? { kind: 'crane', step: stage.step + 1 }
                  : { kind: 'facade-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'facade-prologue' && (
          <NarratorConversation
            key="facade-prologue"
            lines={FACADE_PROLOGUE}
            doneLabel="Naprawiamy!"
            onDone={() => setStage({ kind: 'facade', step: 0 })}
          />
        )}
        {stage.kind === 'facade-facts' && (
          <NarratorConversation
            key={`facade-facts-${stage.step}`}
            lines={FACADE_ROUNDS[stage.step].facts}
            doneLabel={stage.step + 1 < FACADE_ROUNDS.length ? 'Dalej' : 'Idziemy do wąwozu'}
            onDone={() =>
              setStage(
                stage.step + 1 < FACADE_ROUNDS.length
                  ? { kind: 'facade', step: stage.step + 1 }
                  : { kind: 'gorge-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'gorge-prologue' && (
          <NarratorConversation
            key="gorge-prologue"
            lines={GORGE_PROLOGUE}
            doneLabel="Szukamy drogi!"
            onDone={() => setStage({ kind: 'gorge', step: 0 })}
          />
        )}
        {stage.kind === 'gorge-facts' && (
          <NarratorConversation
            key={`gorge-facts-${stage.step}`}
            lines={GORGE_LEGS[stage.step].facts}
            doneLabel={
              stage.step + 1 < GORGE_LEGS.length ? 'Następny wąwóz' : 'Wychodzimy z wąwozu'
            }
            onDone={() =>
              setStage(
                stage.step + 1 < GORGE_LEGS.length
                  ? { kind: 'gorge', step: stage.step + 1 }
                  : { kind: 'finished' },
              )
            }
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} closeFromAway />
      </div>
    </div>
  )
}
