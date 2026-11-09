'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { BUILD_FINALE, BUILD_STEPS, BUILDING_IDS, ZAMOSC_PROLOGUE } from '@/content/zamosc'
import type { BuildingId, HejnalDirection } from '@/content/zamosc'
import type { LevelGameProps } from '@/levels/level-game'
import { CityArt } from '@/levels/zamosc/art/CityArt'
import { TowerScene } from '@/levels/zamosc/art/TowerScene'
import { BuildPanel } from '@/levels/zamosc/BuildPanel'
import { cityLayout } from '@/levels/zamosc/city-layout'
import { CitySockets } from '@/levels/zamosc/CitySockets'
import { HejnalPanel } from '@/levels/zamosc/HejnalPanel'

const CURTAIN_HOLD_MS = 700
const RISE_TO_FACTS_MS = 1500
const SHAKE_MS = 450
const NOTE_LIFE_MS = 1400
const FIRST_HINT = 'Wybierzcie budowlę z kart na dole, a potem kliknijcie świecące miejsce.'

type Stage =
  | { kind: 'prologue' }
  | { kind: 'task'; step: number }
  | { kind: 'rising'; step: number }
  | { kind: 'facts'; step: number }
  | { kind: 'finale' }
  | { kind: 'hejnal' }

function focusOf(stage: Stage): BuildingId | null {
  if (stage.kind === 'rising' || stage.kind === 'facts') return BUILD_STEPS[stage.step].building
  return null
}

export function ZamoscLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const container = useRef<HTMLDivElement>(null)
  const world = useWorld(container)
  const layout = useMemo(() => cityLayout(world), [world])
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'prologue' })
  const [built, setBuilt] = useState<BuildingId[]>([])
  const [selected, setSelected] = useState<BuildingId | null>(null)
  const [shaking, setShaking] = useState<BuildingId | null>(null)
  const [hint, setHint] = useState(FIRST_HINT)
  const [facing, setFacing] = useState<HejnalDirection>('south')
  const [playing, setPlaying] = useState(false)
  const [notes, setNotes] = useState<{ id: number }[]>([])
  const noteId = useRef(0)
  const onTower = stage.kind === 'hejnal'

  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (stage.kind !== 'rising') return
    const timer = setTimeout(() => setStage({ kind: 'facts', step: stage.step }), RISE_TO_FACTS_MS)
    return () => clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  const blow = useCallback(() => {
    const id = ++noteId.current
    setNotes((current) => [...current, { id }])
    setTimeout(() => setNotes((current) => current.filter((note) => note.id !== id)), NOTE_LIFE_MS)
  }, [])

  const remaining = useMemo(() => BUILDING_IDS.filter((id) => !built.includes(id)), [built])
  const sockets = stage.kind === 'task' ? remaining : []
  const cityArt = useMemo(() => <CityArt layout={layout} built={built} />, [layout, built])

  function startTask(step: number) {
    setSelected(null)
    setHint(BUILD_STEPS[step].task.text)
    setStage({ kind: 'task', step })
  }

  function pick(socket: BuildingId) {
    if (stage.kind !== 'task') return
    const step = BUILD_STEPS[stage.step]
    if (!selected) {
      setHint('Najpierw wybierzcie budowlę z kart na dole.')
      return
    }
    if (selected !== step.building) {
      setShaking(selected)
      setSelected(null)
      setHint(step.wrongBuilding)
      return
    }
    if (socket !== step.building) {
      setHint(step.wrongPlace)
      return
    }
    setBuilt((current) => [...current, step.building])
    setSelected(null)
    setStage({ kind: 'rising', step: stage.step })
  }

  function afterFacts(step: number) {
    if (step + 1 < BUILD_STEPS.length) startTask(step + 1)
    else setStage({ kind: 'finale' })
  }

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden bg-[#e9dfbf]">
      <AnimatePresence initial={false}>
        <motion.div
          key={onTower ? 'tower' : 'city'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {onTower ? (
            <TowerScene world={world} facing={facing} playing={playing} notes={notes} />
          ) : (
            <>
              <svg
                viewBox={`0 0 ${world.width} ${world.height}`}
                className="absolute inset-0 size-full"
                aria-hidden="true"
              >
                <WatercolorDefs />
                {cityArt}
              </svg>
              <CitySockets layout={layout} sockets={sockets} focus={focusOf(stage)} onPick={pick} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage: `${PAPER_GRAIN}, radial-gradient(ellipse at center, transparent 55%, rgba(90, 60, 30, 0.28) 100%)`,
        }}
      />

      <AnimatePresence mode="wait">
        {curtainOpen && stage.kind === 'prologue' && (
          <NarratorConversation
            key="prologue"
            lines={ZAMOSC_PROLOGUE}
            doneLabel="Budujemy!"
            onDone={() => startTask(0)}
          />
        )}
        {stage.kind === 'task' && (
          <BuildPanel
            key="build"
            hint={hint}
            progress={built.length}
            total={BUILD_STEPS.length}
            cards={remaining}
            selected={selected}
            shaking={shaking}
            onSelect={(id) => setSelected((current) => (current === id ? null : id))}
          />
        )}
        {stage.kind === 'facts' && (
          <NarratorConversation
            key={`facts-${stage.step}`}
            lines={BUILD_STEPS[stage.step].facts}
            doneLabel={stage.step + 1 < BUILD_STEPS.length ? 'Budujemy dalej' : 'Dalej'}
            onDone={() => afterFacts(stage.step)}
          />
        )}
        {stage.kind === 'finale' && (
          <NarratorConversation
            key="finale"
            lines={BUILD_FINALE}
            doneLabel="Na wieżę!"
            onDone={() => setStage({ kind: 'hejnal' })}
          />
        )}
        {stage.kind === 'hejnal' && (
          <HejnalPanel
            key="hejnal"
            onFace={setFacing}
            onRoundChange={setPlaying}
            onBlow={blow}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} closeFromAway />
      </div>
    </div>
  )
}
