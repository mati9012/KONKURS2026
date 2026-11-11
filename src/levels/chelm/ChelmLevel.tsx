'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  HILL_PROLOGUE,
  HILL_ROUNDS,
  ARMS_PROLOGUE,
  ARMS_ROUNDS,
  TUNNEL_ROUNDS,
  TUNNEL_PROLOGUE,
} from '@/content/chelm'
import type { LevelGameProps } from '@/levels/level-game'
import { useSavedStage } from '@/levels/use-saved-stage'
import { HillStage } from '@/levels/chelm/HillStage'
import { ArmsStage } from '@/levels/chelm/ArmsStage'
import { TunnelStage } from '@/levels/chelm/TunnelStage'
import { sceneLayout } from '@/levels/chelm/scene-layout'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1800

type Stage =
  | { kind: 'hill-prologue' }
  | { kind: 'hill'; step: number }
  | { kind: 'hill-facts'; step: number }
  | { kind: 'arms-prologue' }
  | { kind: 'arms'; step: number }
  | { kind: 'arms-facts'; step: number }
  | { kind: 'tunnel-prologue' }
  | { kind: 'tunnel'; step: number }
  | { kind: 'tunnel-facts'; step: number }
  | { kind: 'finished' }

type Scene = 'hill' | 'arms' | 'tunnel'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('hill')) return 'hill'
  if (stage.kind.startsWith('arms')) return 'arms'
  return 'tunnel'
}

function stepOf(stage: Stage) {
  return 'step' in stage ? stage.step : 0
}

export function ChelmLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useSavedStage<Stage>({ kind: 'hill-prologue' })
  const scene = sceneOf(stage)
  const step = stepOf(stage)

  const onHill = useCallback(
    (done: number) => setStage({ kind: 'hill-facts', step: done }),
    [setStage],
  )
  const onArms = useCallback(
    (done: number) => setStage({ kind: 'arms-facts', step: done }),
    [setStage],
  )
  const onTunnel = useCallback(
    (done: number) => setStage({ kind: 'tunnel-facts', step: done }),
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
          {scene === 'hill' && (
            <HillStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'hill'}
              onRound={onHill}
            />
          )}
          {scene === 'arms' && (
            <ArmsStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'arms'}
              onRound={onArms}
            />
          )}
          {scene === 'tunnel' && (
            <TunnelStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'tunnel'}
              onRound={onTunnel}
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
        {curtainOpen && stage.kind === 'hill-prologue' && (
          <NarratorConversation
            key="hill-prologue"
            lines={HILL_PROLOGUE}
            doneLabel="Wchodzimy na wzgórze!"
            onDone={() => setStage({ kind: 'hill', step: 0 })}
          />
        )}
        {stage.kind === 'hill-facts' && (
          <NarratorConversation
            key={`hill-facts-${stage.step}`}
            lines={HILL_ROUNDS[stage.step].facts}
            doneLabel={stage.step + 1 < HILL_ROUNDS.length ? 'Wyżej!' : 'Ratujemy herb'}
            onDone={() =>
              setStage(
                stage.step + 1 < HILL_ROUNDS.length
                  ? { kind: 'hill', step: stage.step + 1 }
                  : { kind: 'arms-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'arms-prologue' && (
          <NarratorConversation
            key="arms-prologue"
            lines={ARMS_PROLOGUE}
            doneLabel="Składamy herb!"
            onDone={() => setStage({ kind: 'arms', step: 0 })}
          />
        )}
        {stage.kind === 'arms-facts' && (
          <NarratorConversation
            key={`arms-facts-${stage.step}`}
            lines={ARMS_ROUNDS[stage.step].facts}
            doneLabel={stage.step + 1 < ARMS_ROUNDS.length ? 'Dalej' : 'Schodzimy do podziemi'}
            onDone={() =>
              setStage(
                stage.step + 1 < ARMS_ROUNDS.length
                  ? { kind: 'arms', step: stage.step + 1 }
                  : { kind: 'tunnel-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'tunnel-prologue' && (
          <NarratorConversation
            key="tunnel-prologue"
            lines={TUNNEL_PROLOGUE}
            doneLabel="Zapalamy latarkę!"
            onDone={() => setStage({ kind: 'tunnel', step: 0 })}
          />
        )}
        {stage.kind === 'tunnel-facts' && (
          <NarratorConversation
            key={`tunnel-facts-${stage.step}`}
            lines={TUNNEL_ROUNDS[stage.step].facts}
            doneLabel={stage.step + 1 < TUNNEL_ROUNDS.length ? 'Głębiej' : 'Wychodzimy na górę'}
            onDone={() =>
              setStage(
                stage.step + 1 < TUNNEL_ROUNDS.length
                  ? { kind: 'tunnel', step: stage.step + 1 }
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
