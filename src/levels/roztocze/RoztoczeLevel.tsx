'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  FOREST_FINDS,
  FOREST_PROLOGUE,
  STONE_PIECES,
  STONES_PROLOGUE,
  TRACKS,
  TRACKS_PROLOGUE,
} from '@/content/roztocze'
import type { AnimalId } from '@/content/roztocze'
import type { LevelGameProps } from '@/levels/level-game'
import { useSavedStage } from '@/levels/use-saved-stage'
import { ForestStage } from '@/levels/roztocze/ForestStage'
import { sceneLayout } from '@/levels/roztocze/scene-layout'
import { StonesStage } from '@/levels/roztocze/StonesStage'
import { TracksStage } from '@/levels/roztocze/TracksStage'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 2800

type Stage =
  | { kind: 'stones-prologue' }
  | { kind: 'stones' }
  | { kind: 'stones-facts'; piece: number }
  | { kind: 'tracks-prologue' }
  | { kind: 'tracks' }
  | { kind: 'tracks-facts'; animal: AnimalId; count: number }
  | { kind: 'forest-prologue' }
  | { kind: 'forest' }
  | { kind: 'forest-facts'; find: number }
  | { kind: 'finished' }

type Scene = 'stones' | 'tracks' | 'forest'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('stones')) return 'stones'
  if (stage.kind.startsWith('tracks')) return 'tracks'
  return 'forest'
}

function trackFacts(animal: AnimalId) {
  return TRACKS.find((track) => track.animal === animal)?.facts ?? []
}

export function RoztoczeLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useSavedStage<Stage>({ kind: 'stones-prologue' })
  const scene = sceneOf(stage)

  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (stage.kind !== 'finished') return
    const timer = setTimeout(onComplete, FINISH_MS)
    return () => clearTimeout(timer)
  }, [stage, onComplete])

  function afterStones(piece: number) {
    setStage(piece + 1 < STONE_PIECES.length ? { kind: 'stones' } : { kind: 'tracks-prologue' })
  }

  function afterTracks(count: number) {
    setStage(count < TRACKS.length ? { kind: 'tracks' } : { kind: 'forest-prologue' })
  }

  function afterForest(find: number) {
    setStage(find + 1 < FOREST_FINDS.length ? { kind: 'forest' } : { kind: 'finished' })
  }

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#1c1a2c]">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          {scene === 'stones' && (
            <StonesStage
              layout={layout}
              playing={stage.kind === 'stones'}
              onPiece={(count) => setStage({ kind: 'stones-facts', piece: count - 1 })}
            />
          )}
          {scene === 'tracks' && (
            <TracksStage
              layout={layout}
              playing={stage.kind === 'tracks'}
              onFound={(count, animal) => setStage({ kind: 'tracks-facts', animal, count })}
            />
          )}
          {scene === 'forest' && (
            <ForestStage
              layout={layout}
              playing={stage.kind === 'forest'}
              finale={stage.kind === 'finished'}
              onSolved={(count) => setStage({ kind: 'forest-facts', find: count - 1 })}
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
            'radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(40, 25, 30, 0.4) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {curtainOpen && stage.kind === 'stones-prologue' && (
          <NarratorConversation
            key="stones-prologue"
            lines={STONES_PROLOGUE}
            doneLabel="Szukamy!"
            onDone={() => setStage({ kind: 'stones' })}
          />
        )}
        {stage.kind === 'stones-facts' && (
          <NarratorConversation
            key={`stones-facts-${stage.piece}`}
            lines={STONE_PIECES[stage.piece].facts}
            doneLabel={stage.piece + 1 < STONE_PIECES.length ? 'Kopiemy dalej' : 'Zapada noc'}
            onDone={() => afterStones(stage.piece)}
          />
        )}
        {stage.kind === 'tracks-prologue' && (
          <NarratorConversation
            key="tracks-prologue"
            lines={TRACKS_PROLOGUE}
            doneLabel="Zapalamy latarkę!"
            onDone={() => setStage({ kind: 'tracks' })}
          />
        )}
        {stage.kind === 'tracks-facts' && (
          <NarratorConversation
            key={`tracks-facts-${stage.animal}`}
            lines={trackFacts(stage.animal)}
            doneLabel={stage.count < TRACKS.length ? 'Tropimy dalej' : 'Idziemy na Bukową Górę'}
            onDone={() => afterTracks(stage.count)}
          />
        )}
        {stage.kind === 'forest-prologue' && (
          <NarratorConversation
            key="forest-prologue"
            lines={FOREST_PROLOGUE}
            doneLabel="Do dzieła!"
            onDone={() => setStage({ kind: 'forest' })}
          />
        )}
        {stage.kind === 'forest-facts' && (
          <NarratorConversation
            key={`forest-facts-${stage.find}`}
            lines={FOREST_FINDS[stage.find].facts}
            doneLabel={
              stage.find + 1 < FOREST_FINDS.length ? 'Następne znalezisko' : 'Wschód słońca!'
            }
            onDone={() => afterForest(stage.find)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} />
      </div>
    </div>
  )
}
