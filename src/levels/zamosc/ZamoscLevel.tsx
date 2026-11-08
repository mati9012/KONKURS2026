'use client'

import { Canvas } from '@react-three/fiber'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { BUILD_FINALE, BUILD_STEPS, BUILDING_IDS, ZAMOSC_PROLOGUE } from '@/content/zamosc'
import type { BuildingId, HejnalDirection } from '@/content/zamosc'
import type { LevelGameProps } from '@/levels/level-game'
import { BuildPanel } from '@/levels/zamosc/BuildPanel'
import { CityModel } from '@/levels/zamosc/CityModel'
import { HejnalPanel } from '@/levels/zamosc/HejnalPanel'
import { ZamoscCamera } from '@/levels/zamosc/ZamoscCamera'
import type { CityShot } from '@/levels/zamosc/ZamoscCamera'
import { useZamoscCity } from '@/levels/zamosc/useZamoscCity'
import { useGameStore } from '@/store/game-store'

const CURTAIN_HOLD_MS = 1300
const RISE_TO_FACTS_MS = 1500
const SHAKE_MS = 450
const TURN_SETTLE_MS = 700
const FIRST_HINT = 'Wybierzcie budowlę z kart na dole, a potem kliknijcie świecące miejsce.'

type Stage =
  | { kind: 'prologue' }
  | { kind: 'task'; step: number }
  | { kind: 'rising'; step: number }
  | { kind: 'facts'; step: number }
  | { kind: 'finale' }
  | { kind: 'hejnal' }

function shotFor(stage: Stage): CityShot {
  if (stage.kind === 'rising' || stage.kind === 'facts') {
    return { kind: 'building', id: BUILD_STEPS[stage.step].building }
  }
  if (stage.kind === 'hejnal' || stage.kind === 'finale') return { kind: 'tower' }
  return { kind: 'overview' }
}

type CitySceneProps = {
  stage: Stage
  built: readonly BuildingId[]
  sockets: readonly BuildingId[]
  facing: HejnalDirection
  onPick: (id: BuildingId) => void
  onReady: () => void
}

function CityScene({ stage, built, sockets, facing, onPick, onReady }: CitySceneProps) {
  const city = useZamoscCity()
  const shot = useMemo(() => shotFor(stage), [stage])

  useEffect(onReady, [onReady])

  return (
    <>
      <CityModel city={city} built={built} sockets={sockets} facing={facing} onPick={onPick} />
      <ZamoscCamera city={city} shot={shot} />
    </>
  )
}

export function ZamoscLevel({ onComplete }: LevelGameProps) {
  const reduceMotion = useReducedMotion() ?? false
  const high = useGameStore((state) => state.settings.quality === 'high')
  const [ready, setReady] = useState(false)
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'prologue' })
  const [built, setBuilt] = useState<BuildingId[]>([])
  const [selected, setSelected] = useState<BuildingId | null>(null)
  const [shaking, setShaking] = useState<BuildingId | null>(null)
  const [hint, setHint] = useState(FIRST_HINT)
  const [facing, setFacing] = useState<HejnalDirection>('west')
  const [rhythmActive, setRhythmActive] = useState(false)
  const [sceneResting, setSceneResting] = useState(false)
  const markReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const timer = setTimeout(() => setSceneResting(rhythmActive), rhythmActive ? TURN_SETTLE_MS : 0)
    return () => clearTimeout(timer)
  }, [rhythmActive])

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [ready])

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

  const remaining = useMemo(() => BUILDING_IDS.filter((id) => !built.includes(id)), [built])
  const sockets = stage.kind === 'task' ? remaining : []

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
    <div className="absolute inset-0 overflow-hidden bg-[#a9b8e6]">
      <Canvas
        className="absolute inset-0 touch-none"
        shadows={high ? 'percentage' : false}
        dpr={high ? [1, 2] : [1, 1.25]}
        flat
        frameloop={sceneResting ? 'demand' : 'always'}
        camera={{ position: [0, 15, 16], fov: 40, near: 0.1, far: 200 }}
      >
        <color attach="background" args={['#b9c3ec']} />
        <fog attach="fog" args={['#c9c8ec', 30, 70]} />
        <hemisphereLight args={['#eef0ff', '#7d6a4f', 1.4]} />
        <directionalLight
          position={[10, 16, 8]}
          intensity={3.2}
          color="#ffe6c4"
          castShadow={high}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
        />
        <Suspense fallback={null}>
          <CityScene
            stage={stage}
            built={built}
            sockets={sockets}
            facing={facing}
            onPick={pick}
            onReady={markReady}
          />
        </Suspense>
      </Canvas>

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
            onRoundChange={setRhythmActive}
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
