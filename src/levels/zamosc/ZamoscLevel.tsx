'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PAPER_GRAIN } from '@/components/ui/parchment'
import { useWorld } from '@/components/watercolor/useWorld'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { BUILD_FINALE, BUILD_STEPS, BUILDING_IDS, ZAMOSC_PROLOGUE } from '@/content/zamosc'
import type { BuildingId, HejnalDirection } from '@/content/zamosc'
import type { LevelGameProps } from '@/levels/level-game'
import { CityArt } from '@/levels/zamosc/art/CityArt'
import { BuildingIcon } from '@/levels/zamosc/art/BuildingIcon'
import { TowerScene } from '@/levels/zamosc/art/TowerScene'
import { BuildPanel } from '@/levels/zamosc/BuildPanel'
import { cityLayout } from '@/levels/zamosc/city-layout'
import { CitySockets } from '@/levels/zamosc/CitySockets'
import { HejnalPanel } from '@/levels/zamosc/HejnalPanel'

const CURTAIN_HOLD_MS = 700
const SHAKE_MS = 450
const NOTE_LIFE_MS = 1400
const DRAG_THRESHOLD = 8
const FIRST_HINT = 'Przeciągnijcie budowlę z kart na dole na świecące miejsce na planie.'

type Drag = {
  id: BuildingId
  startX: number
  startY: number
  x: number
  y: number
  moved: boolean
}

function socketAt(x: number, y: number) {
  for (const element of document.elementsFromPoint(x, y)) {
    const socket = element.closest<SVGGElement>('[data-socket]')
    if (socket) return socket.dataset.socket as BuildingId
  }
  return null
}

type Stage =
  | { kind: 'prologue' }
  | { kind: 'task' }
  | { kind: 'facts'; building: BuildingId }
  | { kind: 'finale' }
  | { kind: 'hejnal' }

function focusOf(stage: Stage): BuildingId | null {
  return stage.kind === 'facts' ? stage.building : null
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
  const [drag, setDrag] = useState<Drag | null>(null)
  const [hovered, setHovered] = useState<BuildingId | null>(null)
  const dragging = useRef<Drag | null>(null)
  const onTower = stage.kind === 'hejnal'

  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

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

  function stepOf(building: BuildingId) {
    return BUILD_STEPS.find((step) => step.building === building) ?? BUILD_STEPS[0]
  }

  function startTask() {
    setSelected(null)
    setHint(FIRST_HINT)
    setStage({ kind: 'task' })
  }

  function choose(card: BuildingId) {
    setHint(stepOf(card).task.text)
  }

  function place(card: BuildingId, socket: BuildingId) {
    if (stage.kind !== 'task' || built.includes(card)) return
    if (card !== socket) {
      setShaking(card)
      setSelected(null)
      setHint(stepOf(card).wrongPlace)
      return
    }
    setBuilt((current) => [...current, card])
    setSelected(null)
    setStage({ kind: 'facts', building: card })
  }

  function pick(socket: BuildingId) {
    if (selected) place(selected, socket)
    else setHint('Przeciągnijcie na to miejsce kartę z budowlą.')
  }

  function startDrag(id: BuildingId, event: ReactPointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const { clientX: x, clientY: y } = event
    dragging.current = { id, startX: x, startY: y, x, y, moved: false }
    setDrag(dragging.current)
    choose(id)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const current = dragging.current
    if (!current) return
    const { clientX: x, clientY: y } = event
    const moved =
      current.moved || Math.hypot(x - current.startX, y - current.startY) > DRAG_THRESHOLD
    dragging.current = { ...current, x, y, moved }
    setDrag(dragging.current)
    setHovered(moved ? socketAt(x, y) : null)
  }

  function cancelDrag() {
    dragging.current = null
    setDrag(null)
    setHovered(null)
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const current = dragging.current
    if (!current) return
    cancelDrag()
    if (!current.moved) {
      setSelected((chosen) => (chosen === current.id ? null : current.id))
      return
    }
    const socket = socketAt(event.clientX, event.clientY)
    if (socket) place(current.id, socket)
  }

  function afterFacts() {
    if (built.length < BUILD_STEPS.length) startTask()
    else setStage({ kind: 'finale' })
  }

  return (
    <div
      ref={container}
      className="absolute inset-0 overflow-hidden bg-[#e9dfbf]"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={cancelDrag}
    >
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
              <CitySockets
                layout={layout}
                sockets={sockets}
                focus={focusOf(stage)}
                hovered={hovered}
                onPick={pick}
              />
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
            onDone={startTask}
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
            dragged={drag?.moved ? drag.id : null}
            onSelect={(id) => {
              choose(id)
              setSelected((current) => (current === id ? null : id))
            }}
            onDragStart={startDrag}
          />
        )}
        {stage.kind === 'facts' && (
          <NarratorConversation
            key={`facts-${stage.building}`}
            lines={stepOf(stage.building).facts}
            doneLabel={built.length < BUILD_STEPS.length ? 'Budujemy dalej' : 'Dalej'}
            onDone={afterFacts}
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

      {drag?.moved && (
        <div
          className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-3/4"
          style={{ left: drag.x, top: drag.y }}
        >
          <motion.div
            initial={{ scale: 0.6, rotate: 0 }}
            animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? 0 : -6 }}
            className="rounded-2xl border-2 border-[#b8894f] bg-[#fbf0d6]/90 p-1.5 shadow-[0_14px_30px_rgba(40,25,20,0.35)]"
          >
            <BuildingIcon id={drag.id} className="size-16 sm:size-20" />
          </motion.div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <CloudCurtain open={curtainOpen} reduceMotion={reduceMotion} closeFromAway />
      </div>
    </div>
  )
}
