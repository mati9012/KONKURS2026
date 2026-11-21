'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  PIEROG_PROLOGUE,
  PIEROG_STEPS,
  SIFT_PROLOGUE,
  SIFT_TASKS,
  WEAVE_PROLOGUE,
  WEAVE_ROUNDS,
} from '@/content/bilgoraj'
import type { LevelGameProps } from '@/levels/level-game'
import { useSavedStage } from '@/levels/use-saved-stage'
import { PierogStage } from '@/levels/bilgoraj/PierogStage'
import type { PierogStep } from '@/levels/bilgoraj/PierogStage'
import { roomLayout } from '@/levels/bilgoraj/room-layout'
import { SiftStage } from '@/levels/bilgoraj/SiftStage'
import { WeaveStage } from '@/levels/bilgoraj/WeaveStage'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1600

type Stage =
  | { kind: 'weave-prologue' }
  | { kind: 'weave' }
  | { kind: 'weave-facts'; round: number }
  | { kind: 'sift-prologue' }
  | { kind: 'sift'; task: number }
  | { kind: 'sift-facts'; task: number }
  | { kind: 'pierog-prologue' }
  | { kind: 'pierog' }
  | { kind: 'pierog-facts'; step: PierogStep }
  | { kind: 'finished' }

type Scene = 'weave' | 'sift' | 'pierog'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('weave')) return 'weave'
  if (stage.kind.startsWith('sift')) return 'sift'
  return 'pierog'
}

function siftTask(stage: Stage) {
  if (stage.kind === 'sift' || stage.kind === 'sift-facts') return stage.task
  return 0
}

export function BilgorajLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => roomLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useSavedStage<Stage>({ kind: 'weave-prologue' })
  const scene = sceneOf(stage)
  const task = siftTask(stage)

  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (stage.kind !== 'finished') return
    const timer = setTimeout(onComplete, FINISH_MS)
    return () => clearTimeout(timer)
  }, [stage, onComplete])

  function afterWeave(round: number) {
    setStage(round + 1 < WEAVE_ROUNDS.length ? { kind: 'weave' } : { kind: 'sift-prologue' })
  }

  function afterSift(done: number) {
    setStage(
      done + 1 < SIFT_TASKS.length ? { kind: 'sift', task: done + 1 } : { kind: 'pierog-prologue' },
    )
  }

  function afterPierog(step: PierogStep) {
    setStage(step === 'baked' ? { kind: 'finished' } : { kind: 'pierog' })
  }

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#6b4a30]">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {scene === 'weave' && (
            <WeaveStage
              layout={layout}
              playing={stage.kind === 'weave'}
              onRound={(round) => setStage({ kind: 'weave-facts', round })}
            />
          )}
          {scene === 'sift' && (
            <SiftStage
              key={task}
              layout={layout}
              task={task}
              playing={stage.kind === 'sift'}
              onTask={(done) => setStage({ kind: 'sift-facts', task: done })}
            />
          )}
          {scene === 'pierog' && (
            <PierogStage
              layout={layout}
              playing={stage.kind === 'pierog'}
              onStep={(step) => setStage({ kind: 'pierog-facts', step })}
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
            'radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(50, 28, 14, 0.4) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {curtainOpen && stage.kind === 'weave-prologue' && (
          <NarratorConversation
            key="weave-prologue"
            lines={WEAVE_PROLOGUE}
            doneLabel="Plećmy!"
            onDone={() => setStage({ kind: 'weave' })}
          />
        )}
        {stage.kind === 'weave-facts' && (
          <NarratorConversation
            key={`weave-facts-${stage.round}`}
            lines={WEAVE_ROUNDS[stage.round].facts}
            doneLabel={stage.round + 1 < WEAVE_ROUNDS.length ? 'Następna siatka' : 'Do kuchni!'}
            onDone={() => afterWeave(stage.round)}
          />
        )}
        {stage.kind === 'sift-prologue' && (
          <NarratorConversation
            key="sift-prologue"
            lines={SIFT_PROLOGUE}
            doneLabel="Przesiewamy!"
            onDone={() => setStage({ kind: 'sift', task: 0 })}
          />
        )}
        {stage.kind === 'sift-facts' && (
          <NarratorConversation
            key={`sift-facts-${stage.task}`}
            lines={SIFT_TASKS[stage.task].facts}
            doneLabel={stage.task + 1 < SIFT_TASKS.length ? 'Następne sito' : 'Pieczemy pieróg!'}
            onDone={() => afterSift(stage.task)}
          />
        )}
        {stage.kind === 'pierog-prologue' && (
          <NarratorConversation
            key="pierog-prologue"
            lines={PIEROG_PROLOGUE}
            doneLabel="Do roboty!"
            onDone={() => setStage({ kind: 'pierog' })}
          />
        )}
        {stage.kind === 'pierog-facts' && (
          <NarratorConversation
            key={`pierog-facts-${stage.step}`}
            lines={PIEROG_STEPS[stage.step]}
            doneLabel={stage.step === 'baked' ? 'Smacznego!' : 'Dalej'}
            onDone={() => afterPierog(stage.step)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} />
      </div>
    </div>
  )
}
