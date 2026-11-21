'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  FACADE_PROLOGUE,
  FACADE_ROUNDS,
  MEMORY_PROLOGUE,
  MEMORY_ROUNDS,
  PLAN_ROUND,
  RIDE_LEGS,
  RIDE_PROLOGUE,
} from '@/content/kock'
import type { LevelGameProps } from '@/levels/level-game'
import { useSavedStage } from '@/levels/use-saved-stage'
import { FacadeStage } from '@/levels/kock/FacadeStage'
import { MemoryStage } from '@/levels/kock/MemoryStage'
import { RideStage } from '@/levels/kock/RideStage'
import { sceneLayout } from '@/levels/kock/scene-layout'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1400
const FACADE_TOTAL = FACADE_ROUNDS.length + 1

type Stage =
  | { kind: 'facade-prologue' }
  | { kind: 'facade'; round: number }
  | { kind: 'facade-facts'; round: number }
  | { kind: 'ride-prologue' }
  | { kind: 'ride'; leg: number }
  | { kind: 'ride-facts'; leg: number }
  | { kind: 'memory-prologue' }
  | { kind: 'memory'; round: number }
  | { kind: 'memory-facts'; round: number }
  | { kind: 'finished' }

type Scene = 'facade' | 'ride' | 'memory'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('facade')) return 'facade'
  if (stage.kind.startsWith('ride')) return 'ride'
  return 'memory'
}

function indexOf(stage: Stage) {
  if ('round' in stage) return stage.round
  if ('leg' in stage) return stage.leg
  return 0
}

function facadeFacts(round: number) {
  return round < FACADE_ROUNDS.length ? FACADE_ROUNDS[round].facts : PLAN_ROUND.facts
}

export function KockLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useSavedStage<Stage>({ kind: 'facade-prologue' })
  const scene = sceneOf(stage)
  const index = indexOf(stage)
  const finishLeg = useCallback((leg: number) => setStage({ kind: 'ride-facts', leg }), [setStage])

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
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#c9c4ae]">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {scene === 'facade' && (
            <FacadeStage
              key={index}
              layout={layout}
              round={index}
              playing={stage.kind === 'facade'}
              onRound={(round) => setStage({ kind: 'facade-facts', round })}
            />
          )}
          {scene === 'ride' && (
            <RideStage
              key={index}
              layout={layout}
              leg={index}
              playing={stage.kind === 'ride'}
              onLeg={finishLeg}
            />
          )}
          {scene === 'memory' && (
            <MemoryStage
              key={index}
              layout={layout}
              round={index}
              playing={stage.kind === 'memory'}
              onRound={(round) => setStage({ kind: 'memory-facts', round })}
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
            'radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(50, 35, 20, 0.35) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {curtainOpen && stage.kind === 'facade-prologue' && (
          <NarratorConversation
            key="facade-prologue"
            lines={FACADE_PROLOGUE}
            doneLabel="Odbudujmy pałac!"
            onDone={() => setStage({ kind: 'facade', round: 0 })}
          />
        )}
        {stage.kind === 'facade-facts' && (
          <NarratorConversation
            key={`facade-facts-${stage.round}`}
            lines={facadeFacts(stage.round)}
            doneLabel={stage.round + 1 < FACADE_TOTAL ? 'Dalej' : 'Na koń!'}
            onDone={() =>
              setStage(
                stage.round + 1 < FACADE_TOTAL
                  ? { kind: 'facade', round: stage.round + 1 }
                  : { kind: 'ride-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'ride-prologue' && (
          <NarratorConversation
            key="ride-prologue"
            lines={RIDE_PROLOGUE}
            doneLabel="W galop!"
            onDone={() => setStage({ kind: 'ride', leg: 0 })}
          />
        )}
        {stage.kind === 'ride-facts' && (
          <NarratorConversation
            key={`ride-facts-${stage.leg}`}
            lines={RIDE_LEGS[stage.leg].facts}
            doneLabel={stage.leg + 1 < RIDE_LEGS.length ? 'Jedziemy dalej' : 'Do izby pamięci'}
            onDone={() =>
              setStage(
                stage.leg + 1 < RIDE_LEGS.length
                  ? { kind: 'ride', leg: stage.leg + 1 }
                  : { kind: 'memory-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'memory-prologue' && (
          <NarratorConversation
            key="memory-prologue"
            lines={MEMORY_PROLOGUE}
            doneLabel="Układamy pamiątki"
            onDone={() => setStage({ kind: 'memory', round: 0 })}
          />
        )}
        {stage.kind === 'memory-facts' && (
          <NarratorConversation
            key={`memory-facts-${stage.round}`}
            lines={MEMORY_ROUNDS[stage.round].facts}
            doneLabel={stage.round + 1 < MEMORY_ROUNDS.length ? 'Następna gablota' : 'Dalej'}
            onDone={() =>
              setStage(
                stage.round + 1 < MEMORY_ROUNDS.length
                  ? { kind: 'memory', round: stage.round + 1 }
                  : { kind: 'finished' },
              )
            }
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} />
      </div>
    </div>
  )
}
