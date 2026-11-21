'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  BOG_PROLOGUE,
  PLANTS,
  TURTLE_PROLOGUE,
  TURTLE_WAVES,
  VOICES,
  VOICES_PROLOGUE,
} from '@/content/poleski-park-narodowy'
import type { BirdId, PlantId } from '@/content/poleski-park-narodowy'
import type { LevelGameProps } from '@/levels/level-game'
import { useSavedStage } from '@/levels/use-saved-stage'
import { BogStage } from '@/levels/poleski-park-narodowy/BogStage'
import { sceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'
import { TurtleStage } from '@/levels/poleski-park-narodowy/TurtleStage'
import { VoicesStage } from '@/levels/poleski-park-narodowy/VoicesStage'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 3400

type Stage =
  | { kind: 'turtle-prologue' }
  | { kind: 'turtle'; wave: number }
  | { kind: 'turtle-facts'; wave: number }
  | { kind: 'bog-prologue' }
  | { kind: 'bog' }
  | { kind: 'bog-facts'; plant: PlantId; count: number }
  | { kind: 'voices-prologue' }
  | { kind: 'voices' }
  | { kind: 'voices-facts'; bird: BirdId; count: number }
  | { kind: 'finished' }

type Scene = 'turtle' | 'bog' | 'voices'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('turtle')) return 'turtle'
  if (stage.kind.startsWith('bog')) return 'bog'
  return 'voices'
}

function waveOf(stage: Stage) {
  return stage.kind === 'turtle' || stage.kind === 'turtle-facts' ? stage.wave : 0
}

function plantFacts(plant: PlantId) {
  return PLANTS.find((entry) => entry.id === plant)?.facts ?? []
}

function voiceFacts(bird: BirdId) {
  return VOICES.find((entry) => entry.bird === bird)?.facts ?? []
}

export function PoleskiLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useSavedStage<Stage>({ kind: 'turtle-prologue' })
  const scene = sceneOf(stage)
  const wave = waveOf(stage)

  const onWave = useCallback(
    (done: number) => setStage({ kind: 'turtle-facts', wave: done }),
    [setStage],
  )
  const onPlant = useCallback(
    (plant: PlantId, count: number) => setStage({ kind: 'bog-facts', plant, count }),
    [setStage],
  )
  const onBird = useCallback(
    (bird: BirdId, count: number) => setStage({ kind: 'voices-facts', bird, count }),
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

  function afterWave(done: number) {
    setStage(
      done + 1 < TURTLE_WAVES.length
        ? { kind: 'turtle', wave: done + 1 }
        : { kind: 'bog-prologue' },
    )
  }

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#2a3a2a]">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          {scene === 'turtle' && (
            <TurtleStage
              key={wave}
              layout={layout}
              wave={wave}
              playing={stage.kind === 'turtle'}
              onWave={onWave}
            />
          )}
          {scene === 'bog' && (
            <BogStage layout={layout} playing={stage.kind === 'bog'} onFound={onPlant} />
          )}
          {scene === 'voices' && (
            <VoicesStage
              layout={layout}
              playing={stage.kind === 'voices'}
              finale={stage.kind === 'finished'}
              onFound={onBird}
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
            'radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(30, 35, 25, 0.38) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {curtainOpen && stage.kind === 'turtle-prologue' && (
          <NarratorConversation
            key="turtle-prologue"
            lines={TURTLE_PROLOGUE}
            doneLabel="Pilnujemy żółwików!"
            onDone={() => setStage({ kind: 'turtle', wave: 0 })}
          />
        )}
        {stage.kind === 'turtle-facts' && (
          <NarratorConversation
            key={`turtle-facts-${stage.wave}`}
            lines={TURTLE_WAVES[stage.wave].facts}
            doneLabel={
              stage.wave + 1 < TURTLE_WAVES.length ? 'Następne maluchy' : 'Idziemy na torfowisko'
            }
            onDone={() => afterWave(stage.wave)}
          />
        )}
        {stage.kind === 'bog-prologue' && (
          <NarratorConversation
            key="bog-prologue"
            lines={BOG_PROLOGUE}
            doneLabel="Szukamy roślin!"
            onDone={() => setStage({ kind: 'bog' })}
          />
        )}
        {stage.kind === 'bog-facts' && (
          <NarratorConversation
            key={`bog-facts-${stage.plant}`}
            lines={plantFacts(stage.plant)}
            doneLabel={stage.count < PLANTS.length ? 'Następna zagadka' : 'Czekamy na wieczór'}
            onDone={() =>
              setStage(stage.count < PLANTS.length ? { kind: 'bog' } : { kind: 'voices-prologue' })
            }
          />
        )}
        {stage.kind === 'voices-prologue' && (
          <NarratorConversation
            key="voices-prologue"
            lines={VOICES_PROLOGUE}
            doneLabel="Nasłuchujemy!"
            onDone={() => setStage({ kind: 'voices' })}
          />
        )}
        {stage.kind === 'voices-facts' && (
          <NarratorConversation
            key={`voices-facts-${stage.bird}`}
            lines={voiceFacts(stage.bird)}
            doneLabel={stage.count < VOICES.length ? 'Słuchamy dalej' : 'Dobranoc, mokradła!'}
            onDone={() =>
              setStage(stage.count < VOICES.length ? { kind: 'voices' } : { kind: 'finished' })
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
