'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  CHASE_PROLOGUE,
  CHASE_ROUNDS,
  FRESCO_PROLOGUE,
  FRESCO_ROUNDS,
  TRIAL_PROLOGUE,
  TRIAL_ROUNDS,
} from '@/content/lublin'
import type { LevelGameProps } from '@/levels/level-game'
import { useSavedStage } from '@/levels/use-saved-stage'
import { ChaseStage } from '@/levels/lublin/ChaseStage'
import { FrescoStage } from '@/levels/lublin/FrescoStage'
import { TrialStage } from '@/levels/lublin/TrialStage'
import { sceneLayout } from '@/levels/lublin/scene-layout'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1800

type Stage =
  | { kind: 'chase-prologue' }
  | { kind: 'chase'; step: number }
  | { kind: 'chase-facts'; step: number }
  | { kind: 'fresco-prologue' }
  | { kind: 'fresco'; step: number }
  | { kind: 'fresco-facts'; step: number }
  | { kind: 'trial-prologue' }
  | { kind: 'trial'; step: number }
  | { kind: 'trial-facts'; step: number }
  | { kind: 'finished' }

type Scene = 'chase' | 'fresco' | 'trial'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('chase')) return 'chase'
  if (stage.kind.startsWith('fresco')) return 'fresco'
  return 'trial'
}

function stepOf(stage: Stage) {
  return 'step' in stage ? stage.step : 0
}

export function LublinLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useSavedStage<Stage>({ kind: 'chase-prologue' })
  const scene = sceneOf(stage)
  const step = stepOf(stage)

  const onChase = useCallback(
    (done: number) => setStage({ kind: 'chase-facts', step: done }),
    [setStage],
  )
  const onFresco = useCallback(
    (done: number) => setStage({ kind: 'fresco-facts', step: done }),
    [setStage],
  )
  const onTrial = useCallback(
    (done: number) => setStage({ kind: 'trial-facts', step: done }),
    [setStage],
  )

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
          {scene === 'chase' && (
            <ChaseStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'chase'}
              onRound={onChase}
            />
          )}
          {scene === 'fresco' && (
            <FrescoStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'fresco'}
              onRound={onFresco}
            />
          )}
          {scene === 'trial' && (
            <TrialStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'trial'}
              onRound={onTrial}
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
        {curtainOpen && stage.kind === 'chase-prologue' && (
          <NarratorConversation
            key="chase-prologue"
            lines={CHASE_PROLOGUE}
            doneLabel="Łapiemy diabła!"
            onDone={() => setStage({ kind: 'chase', step: 0 })}
          />
        )}
        {stage.kind === 'chase-facts' && (
          <NarratorConversation
            key={`chase-facts-${stage.step}`}
            lines={CHASE_ROUNDS[stage.step].facts}
            doneLabel={stage.step + 1 < CHASE_ROUNDS.length ? 'Dalej!' : 'Do kaplicy'}
            onDone={() =>
              setStage(
                stage.step + 1 < CHASE_ROUNDS.length
                  ? { kind: 'chase', step: stage.step + 1 }
                  : { kind: 'fresco-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'fresco-prologue' && (
          <NarratorConversation
            key="fresco-prologue"
            lines={FRESCO_PROLOGUE}
            doneLabel="Bierzemy pędzel!"
            onDone={() => setStage({ kind: 'fresco', step: 0 })}
          />
        )}
        {stage.kind === 'fresco-facts' && (
          <NarratorConversation
            key={`fresco-facts-${stage.step}`}
            lines={FRESCO_ROUNDS[stage.step].facts}
            doneLabel={stage.step + 1 < FRESCO_ROUNDS.length ? 'Dalej' : 'Do Trybunału'}
            onDone={() =>
              setStage(
                stage.step + 1 < FRESCO_ROUNDS.length
                  ? { kind: 'fresco', step: stage.step + 1 }
                  : { kind: 'trial-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'trial-prologue' && (
          <NarratorConversation
            key="trial-prologue"
            lines={TRIAL_PROLOGUE}
            doneLabel="Otwieramy rozprawę!"
            onDone={() => setStage({ kind: 'trial', step: 0 })}
          />
        )}
        {stage.kind === 'trial-facts' && (
          <NarratorConversation
            key={`trial-facts-${stage.step}`}
            lines={TRIAL_ROUNDS[stage.step].facts}
            doneLabel={
              stage.step + 1 < TRIAL_ROUNDS.length ? 'Następna rozprawa' : 'Koniec wyprawy'
            }
            onDone={() =>
              setStage(
                stage.step + 1 < TRIAL_ROUNDS.length
                  ? { kind: 'trial', step: stage.step + 1 }
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
