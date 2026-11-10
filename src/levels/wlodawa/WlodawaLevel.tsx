'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import {
  MARKET_PROLOGUE,
  MARKET_ROUNDS,
  RIVER_LEGS,
  RIVER_PROLOGUE,
  TEMPLE_PROLOGUE,
  TEMPLE_ROUNDS,
} from '@/content/wlodawa'
import type { LevelGameProps } from '@/levels/level-game'
import { MarketStage } from '@/levels/wlodawa/MarketStage'
import { RiverStage } from '@/levels/wlodawa/RiverStage'
import { sceneLayout } from '@/levels/wlodawa/scene-layout'
import { TempleStage } from '@/levels/wlodawa/TempleStage'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1800

type Stage =
  | { kind: 'market-prologue' }
  | { kind: 'market'; round: number }
  | { kind: 'market-facts'; round: number }
  | { kind: 'temple-prologue' }
  | { kind: 'temple'; round: number }
  | { kind: 'temple-facts'; round: number }
  | { kind: 'river-prologue' }
  | { kind: 'river'; leg: number }
  | { kind: 'river-facts'; leg: number }
  | { kind: 'finished' }

type Scene = 'market' | 'temple' | 'river'

function sceneOf(stage: Stage): Scene {
  if (stage.kind.startsWith('market')) return 'market'
  if (stage.kind.startsWith('temple')) return 'temple'
  return 'river'
}

function stepOf(stage: Stage) {
  if ('round' in stage) return stage.round
  if ('leg' in stage) return stage.leg
  return 0
}

export function WlodawaLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => sceneLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'market-prologue' })
  const scene = sceneOf(stage)
  const step = stepOf(stage)

  const onMarket = useCallback((round: number) => setStage({ kind: 'market-facts', round }), [])
  const onTemple = useCallback((round: number) => setStage({ kind: 'temple-facts', round }), [])
  const onRiver = useCallback((leg: number) => setStage({ kind: 'river-facts', leg }), [])

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
          {scene === 'market' && (
            <MarketStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'market'}
              onRound={onMarket}
            />
          )}
          {scene === 'temple' && (
            <TempleStage
              key={step}
              layout={layout}
              round={step}
              playing={stage.kind === 'temple'}
              onRound={onTemple}
            />
          )}
          {scene === 'river' && (
            <RiverStage
              key={step}
              layout={layout}
              leg={step}
              playing={stage.kind === 'river'}
              onLeg={onRiver}
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
        {curtainOpen && stage.kind === 'market-prologue' && (
          <NarratorConversation
            key="market-prologue"
            lines={MARKET_PROLOGUE}
            doneLabel="Otwieramy kramy!"
            onDone={() => setStage({ kind: 'market', round: 0 })}
          />
        )}
        {stage.kind === 'market-facts' && (
          <NarratorConversation
            key={`market-facts-${stage.round}`}
            lines={MARKET_ROUNDS[stage.round].facts}
            doneLabel={
              stage.round + 1 < MARKET_ROUNDS.length ? 'Następni klienci' : 'Idziemy do świątyń'
            }
            onDone={() =>
              setStage(
                stage.round + 1 < MARKET_ROUNDS.length
                  ? { kind: 'market', round: stage.round + 1 }
                  : { kind: 'temple-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'temple-prologue' && (
          <NarratorConversation
            key="temple-prologue"
            lines={TEMPLE_PROLOGUE}
            doneLabel="Porządkujemy!"
            onDone={() => setStage({ kind: 'temple', round: 0 })}
          />
        )}
        {stage.kind === 'temple-facts' && (
          <NarratorConversation
            key={`temple-facts-${stage.round}`}
            lines={TEMPLE_ROUNDS[stage.round].facts}
            doneLabel={
              stage.round + 1 < TEMPLE_ROUNDS.length ? 'Następna runda' : 'Idziemy nad Bug'
            }
            onDone={() =>
              setStage(
                stage.round + 1 < TEMPLE_ROUNDS.length
                  ? { kind: 'temple', round: stage.round + 1 }
                  : { kind: 'river-prologue' },
              )
            }
          />
        )}
        {stage.kind === 'river-prologue' && (
          <NarratorConversation
            key="river-prologue"
            lines={RIVER_PROLOGUE}
            doneLabel="Wiosłujemy!"
            onDone={() => setStage({ kind: 'river', leg: 0 })}
          />
        )}
        {stage.kind === 'river-facts' && (
          <NarratorConversation
            key={`river-facts-${stage.leg}`}
            lines={RIVER_LEGS[stage.leg].facts}
            doneLabel={stage.leg + 1 < RIVER_LEGS.length ? 'Płyniemy dalej' : 'Do brzegu!'}
            onDone={() =>
              setStage(
                stage.leg + 1 < RIVER_LEGS.length
                  ? { kind: 'river', leg: stage.leg + 1 }
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
