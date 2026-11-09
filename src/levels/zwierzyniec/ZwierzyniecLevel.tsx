'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import {
  BRIDGE_PROLOGUE,
  BRIDGE_SECTIONS,
  HERD_HINTS,
  HERD_PROLOGUE,
  HERD_WAVES,
} from '@/content/zwierzyniec'
import type { LevelGameProps } from '@/levels/level-game'
import { MeadowBackdrop } from '@/levels/zwierzyniec/art/MeadowBackdrop'
import { MeadowForeground } from '@/levels/zwierzyniec/art/MeadowForeground'
import { PondBackdrop } from '@/levels/zwierzyniec/art/PondBackdrop'
import { WatercolorDefs } from '@/levels/zwierzyniec/art/WatercolorDefs'
import { BridgeStage } from '@/levels/zwierzyniec/BridgeStage'
import { bridgeLayout } from '@/levels/zwierzyniec/bridge-layout'
import { HerdStage } from '@/levels/zwierzyniec/HerdStage'
import { herdLayout } from '@/levels/zwierzyniec/herd-layout'
import { StagePanel } from '@/levels/zwierzyniec/StagePanel'
import { useWorld } from '@/levels/zwierzyniec/useWorld'

const CURTAIN_HOLD_MS = 700
const FINISH_MS = 1600
const HORSE_TOTAL = HERD_WAVES.reduce((sum, wave) => sum + wave.count, 0)

type Stage =
  | { kind: 'prologue' }
  | { kind: 'herd'; wave: number }
  | { kind: 'herd-facts'; wave: number }
  | { kind: 'bridge-prologue' }
  | { kind: 'bridge'; section: number }
  | { kind: 'bridge-facts'; section: number }
  | { kind: 'procession' }
  | { kind: 'finished' }

function onMeadow(stage: Stage) {
  return stage.kind === 'prologue' || stage.kind === 'herd' || stage.kind === 'herd-facts'
}

function currentWave(stage: Stage) {
  return stage.kind === 'herd' || stage.kind === 'herd-facts' ? stage.wave : 0
}

function currentSection(stage: Stage) {
  if (stage.kind === 'bridge' || stage.kind === 'bridge-facts') return stage.section
  return stage.kind === 'bridge-prologue' ? 0 : BRIDGE_SECTIONS.length - 1
}

export function ZwierzyniecLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const herd = useMemo(() => herdLayout(world), [world])
  const bridge = useMemo(() => bridgeLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'prologue' })
  const [penned, setPenned] = useState(0)
  const [herdHint, setHerdHint] = useState<string>(HERD_HINTS.start)
  const meadow = onMeadow(stage)
  const lit = stage.kind === 'procession' || stage.kind === 'finished'

  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (stage.kind !== 'finished') return
    const timer = setTimeout(onComplete, FINISH_MS)
    return () => clearTimeout(timer)
  }, [stage, onComplete])

  const finishWave = useCallback(
    () =>
      setStage((current) =>
        current.kind === 'herd' ? { kind: 'herd-facts', wave: current.wave } : current,
      ),
    [],
  )
  const finishSection = useCallback(
    () =>
      setStage((current) =>
        current.kind === 'bridge' ? { kind: 'bridge-facts', section: current.section } : current,
      ),
    [],
  )
  const finishProcession = useCallback(() => setStage({ kind: 'finished' }), [])

  const meadowArt = useMemo(() => <MeadowBackdrop layout={herd} />, [herd])
  const pondArt = useMemo(() => <PondBackdrop layout={bridge} lit={lit} />, [bridge, lit])

  function afterWaveFacts(wave: number) {
    if (wave + 1 < HERD_WAVES.length) {
      setHerdHint(HERD_HINTS.start)
      setStage({ kind: 'herd', wave: wave + 1 })
    } else {
      setStage({ kind: 'bridge-prologue' })
    }
  }

  function afterSectionFacts(section: number) {
    if (section + 1 < BRIDGE_SECTIONS.length) setStage({ kind: 'bridge', section: section + 1 })
    else setStage({ kind: 'procession' })
  }

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#e8dcc0]">
      <AnimatePresence initial={false}>
        <motion.div
          key={meadow ? 'meadow' : 'pond'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          <svg
            viewBox={`0 0 ${world.width} ${world.height}`}
            className="absolute inset-0 size-full"
            aria-hidden="true"
          >
            <WatercolorDefs />
            {meadow ? meadowArt : pondArt}
          </svg>
          {meadow && (
            <HerdStage
              layout={herd}
              wave={currentWave(stage)}
              playing={stage.kind === 'herd'}
              onPenned={setPenned}
              onHint={setHerdHint}
              onWaveDone={finishWave}
            />
          )}
          {meadow && <MeadowForeground layout={herd} />}
          {!meadow && (
            <BridgeStage
              layout={bridge}
              section={currentSection(stage)}
              playing={stage.kind === 'bridge'}
              procession={stage.kind === 'procession' || stage.kind === 'finished'}
              onSectionDone={finishSection}
              onProcessionDone={finishProcession}
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
            'radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(70, 45, 20, 0.35) 100%)',
        }}
      />

      <AnimatePresence mode="wait">
        {stage.kind === 'herd' && (
          <motion.section
            key="herd"
            aria-label="Zagroda koników"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Zagroda Ordynata"
              icon="konik"
              counter={`W zagrodzie: ${penned} / ${HORSE_TOTAL}`}
              hint={herdHint}
            />
          </motion.section>
        )}
        {curtainOpen && stage.kind === 'prologue' && (
          <NarratorConversation
            key="prologue"
            lines={HERD_PROLOGUE}
            doneLabel="Zaganiamy!"
            onDone={() => setStage({ kind: 'herd', wave: 0 })}
          />
        )}
        {stage.kind === 'herd-facts' && (
          <NarratorConversation
            key={`herd-facts-${stage.wave}`}
            lines={HERD_WAVES[stage.wave].facts}
            doneLabel={stage.wave + 1 < HERD_WAVES.length ? 'Następne koniki' : 'Nad staw!'}
            onDone={() => afterWaveFacts(stage.wave)}
          />
        )}
        {stage.kind === 'bridge-prologue' && (
          <NarratorConversation
            key="bridge-prologue"
            lines={BRIDGE_PROLOGUE}
            doneLabel="Układamy kładki!"
            onDone={() => setStage({ kind: 'bridge', section: 0 })}
          />
        )}
        {stage.kind === 'bridge-facts' && (
          <NarratorConversation
            key={`bridge-facts-${stage.section}`}
            lines={BRIDGE_SECTIONS[stage.section].facts}
            doneLabel={
              stage.section + 1 < BRIDGE_SECTIONS.length ? 'Budujemy dalej' : 'Zapalamy lampiony'
            }
            onDone={() => afterSectionFacts(stage.section)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} closeFromAway />
      </div>
    </div>
  )
}
