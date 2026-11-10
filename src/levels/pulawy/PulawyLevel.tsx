'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  LAB_PROLOGUE,
  LAB_ROUNDS,
  PARK_BUILDING_IDS,
  PARK_PROLOGUE,
  PARK_RIDDLES,
  SALON_PROLOGUE,
  SALON_ROUNDS,
} from '@/content/pulawy'
import type { ParkBuildingId } from '@/content/pulawy'
import type { LevelGameProps } from '@/levels/level-game'
import { LabStage } from '@/levels/pulawy/LabStage'
import { ParkStage } from '@/levels/pulawy/ParkStage'
import { SalonStage } from '@/levels/pulawy/SalonStage'
import { sceneLayout } from '@/levels/pulawy/scene-layout'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1800

type Stage =
  | { kind: 'park-prologue' }
  | { kind: 'park' }
  | { kind: 'park-facts'; building: ParkBuildingId; count: number }
  | { kind: 'salon-prologue' }
  | { kind: 'salon-intro'; round: number }
  | { kind: 'salon'; round: number }
  | { kind: 'salon-facts'; round: number }
  | { kind: 'lab-prologue' }
  | { kind: 'lab'; round: number }
  | { kind: 'lab-facts'; round: number }
  | { kind: 'finished' }

type Scene = 'park' | 'salon' | 'lab'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('park')) return 'park'
  if (stage.kind.startsWith('salon')) return 'salon'
  return 'lab'
}

function roundOf(stage: Stage) {
  return 'round' in stage ? stage.round : 0
}

function parkFacts(building: ParkBuildingId) {
  return PARK_RIDDLES.find((entry) => entry.building === building)?.facts ?? []
}

export function PulawyLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'park-prologue' })
  const scene = sceneOf(stage)
  const round = roundOf(stage)

  const onBuilding = useCallback(
    (building: ParkBuildingId, count: number) => setStage({ kind: 'park-facts', building, count }),
    [],
  )
  const onSalon = useCallback((done: number) => setStage({ kind: 'salon-facts', round: done }), [])
  const onLab = useCallback((done: number) => setStage({ kind: 'lab-facts', round: done }), [])

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
          {scene === 'park' && (
            <ParkStage layout={layout} playing={stage.kind === 'park'} onFound={onBuilding} />
          )}
          {scene === 'salon' && (
            <SalonStage
              key={round}
              layout={layout}
              round={round}
              playing={stage.kind === 'salon'}
              onRound={onSalon}
            />
          )}
          {scene === 'lab' && (
            <LabStage
              key={round}
              layout={layout}
              round={round}
              playing={stage.kind === 'lab'}
              onRound={onLab}
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
        {curtainOpen && stage.kind === 'park-prologue' && (
          <NarratorConversation
            key="park-prologue"
            lines={PARK_PROLOGUE}
            doneLabel="Szukamy skarbów!"
            onDone={() => setStage({ kind: 'park' })}
          />
        )}
        {stage.kind === 'park-facts' && (
          <NarratorConversation
            key={`park-facts-${stage.building}`}
            lines={parkFacts(stage.building)}
            doneLabel={
              stage.count < PARK_BUILDING_IDS.length ? 'Następna zagadka' : 'Idziemy do pałacu'
            }
            onDone={() =>
              setStage(
                stage.count < PARK_BUILDING_IDS.length
                  ? { kind: 'park' }
                  : { kind: 'salon-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'salon-prologue' && (
          <NarratorConversation
            key="salon-prologue"
            lines={SALON_PROLOGUE}
            doneLabel="Witamy gości!"
            onDone={() => setStage({ kind: 'salon-intro', round: 0 })}
          />
        )}
        {stage.kind === 'salon-intro' && (
          <NarratorConversation
            key={`salon-intro-${stage.round}`}
            lines={SALON_ROUNDS[stage.round].intro}
            doneLabel="Zapamiętane!"
            onDone={() => setStage({ kind: 'salon', round: stage.round })}
          />
        )}
        {stage.kind === 'salon-facts' && (
          <NarratorConversation
            key={`salon-facts-${stage.round}`}
            lines={SALON_ROUNDS[stage.round].facts}
            doneLabel={
              stage.round + 1 < SALON_ROUNDS.length ? 'Kolejni goście' : 'Idziemy na poletko'
            }
            onDone={() =>
              setStage(
                stage.round + 1 < SALON_ROUNDS.length
                  ? { kind: 'salon-intro', round: stage.round + 1 }
                  : { kind: 'lab-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'lab-prologue' && (
          <NarratorConversation
            key="lab-prologue"
            lines={LAB_PROLOGUE}
            doneLabel="Do roboty!"
            onDone={() => setStage({ kind: 'lab', round: 0 })}
          />
        )}
        {stage.kind === 'lab-facts' && (
          <NarratorConversation
            key={`lab-facts-${stage.round}`}
            lines={LAB_ROUNDS[stage.round].facts}
            doneLabel={stage.round + 1 < LAB_ROUNDS.length ? 'Następne poletko' : 'Koniec pracy!'}
            onDone={() =>
              setStage(
                stage.round + 1 < LAB_ROUNDS.length
                  ? { kind: 'lab', round: stage.round + 1 }
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
