'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { ARMS_HINTS, ARMS_ROUNDS, ARMS_SLOT_NAMES } from '@/content/chelm'
import type { ArmsSlot } from '@/content/chelm'
import { ArmsPartIcon } from '@/levels/chelm/art/ArmsPartIcon'
import { ArmsShield } from '@/levels/chelm/art/ArmsShield'
import { BearArt } from '@/levels/chelm/art/BearArt'
import { HillScene, hillGeometry } from '@/levels/chelm/art/HillScene'
import type { SceneLayout } from '@/levels/chelm/scene-layout'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const FINISH_MS = 2200
const SHIELD_TOP = -290
const SHIELD_BOTTOM = 205

const SLOT_ZONES: Record<ArmsSlot, { x: number; y: number; width: number; height: number }> = {
  field: { x: -150, y: -170, width: 300, height: 225 },
  trees: { x: -150, y: 65, width: 300, height: 135 },
  bear: { x: -120, y: -50, width: 240, height: 150 },
  crown: { x: -110, y: -285, width: 220, height: 110 },
}

type ArmsStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function slotId(slot: ArmsSlot) {
  return `slot-${slot}`
}

export function ArmsStage({ layout, round, playing, onRound }: ArmsStageProps) {
  const { world, unit, portrait } = layout
  const plan = ARMS_ROUNDS[Math.min(round, ARMS_ROUNDS.length - 1)]
  const [deck] = useState(() => shuffled(plan.parts))
  const [placed, setPlaced] = useState<ArmsSlot[]>([])
  const [hint, setHint] = useState<string>(ARMS_HINTS.start)
  const [shaking, setShaking] = useState<string | null>(null)
  const drag = useCardDrag(drop)
  const backdrop = useMemo(
    () => <HillScene layout={layout} geometry={hillGeometry(layout)} built={() => true} />,
    [layout],
  )
  const wanted = plan.parts.flatMap((part) => (part.slot ? [part.slot] : []))
  const earlier = ARMS_ROUNDS.slice(0, round).flatMap((entry) =>
    entry.parts.flatMap((part) => (part.slot ? [part.slot] : [])),
  )
  const top = world.height * (portrait ? 0.24 : 0.27)
  const bottom = world.height * (portrait ? 0.78 : 0.76)
  const scale = Math.min((bottom - top) / (SHIELD_BOTTOM - SHIELD_TOP), (world.width * 0.8) / 320)
  const centerX = world.width / 2
  const centerY = top - SHIELD_TOP * scale
  const usedParts = deck
    .filter((part) => part.slot && placed.includes(part.slot))
    .map((part) => part.id)
  const cards = deck
    .filter((part) => !usedParts.includes(part.id))
    .map((part) => ({
      id: part.id,
      label: part.label,
      icon: <ArmsPartIcon kind={part.id} className="size-10 sm:size-12" />,
    }))
  const draggedPart = drag.drag?.moved
    ? plan.parts.find((part) => part.id === drag.drag?.id)
    : undefined
  const showTargets = playing && (drag.selected || drag.drag?.moved)
  const done = placed.length >= wanted.length
  const ghostShare = (earlier.length + placed.length) / 4

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => onRound(round), FINISH_MS)
    return () => clearTimeout(timer)
  }, [done, round, onRound])

  function drop(card: string, target: string) {
    if (!playing || done || !target.startsWith('slot-')) return
    const part = plan.parts.find((entry) => entry.id === card)
    if (!part) return
    if (!part.slot || slotId(part.slot) !== target || placed.includes(part.slot)) {
      setShaking(card)
      setHint(ARMS_HINTS.wrong)
      return
    }
    setPlaced([...placed, part.slot])
    setHint(`${ARMS_HINTS.good} ${part.label}.`)
  }

  return (
    <div className="absolute inset-0" data-arms {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        <rect width={world.width} height={world.height} fill="#2a2a4a" opacity={0.5} />
        <g
          transform={`translate(${centerX + (portrait ? 120 : 260) * unit} ${centerY + 190 * scale}) scale(${unit * (portrait ? 1 : 1.2)})`}
          opacity={0.15 + ghostShare * 0.7}
        >
          <BearArt ink="#9aaac4" />
        </g>
        <g transform={`translate(${centerX} ${centerY}) scale(${scale})`}>
          <g filter={PAINT}>
            <ArmsShield filled={(slot) => earlier.includes(slot) || placed.includes(slot)} />
          </g>
          {playing &&
            wanted
              .filter((slot) => !placed.includes(slot))
              .map((slot) => {
                const zone = SLOT_ZONES[slot]
                const target = slotId(slot)
                const hovered = drag.hovered === target
                return (
                  <g
                    key={target}
                    role="button"
                    tabIndex={0}
                    aria-label={`Miejsce w herbie: ${ARMS_SLOT_NAMES[slot]}`}
                    data-target={target}
                    className="cursor-pointer outline-none"
                    onClick={() => drag.pick(target)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      drag.pick(target)
                    }}
                  >
                    <rect
                      {...zone}
                      rx={14}
                      fill="#ffe7a3"
                      fillOpacity={hovered ? 0.7 : showTargets ? 0.45 : 0.22}
                      stroke={hovered ? '#1f5c50' : '#f2b84b'}
                      strokeWidth={4}
                      strokeDasharray="12 8"
                      className={hovered ? undefined : 'zw-pulse'}
                    />
                  </g>
                )
              })}
        </g>
      </svg>

      {draggedPart && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y} over={drag.hovered !== null}>
          <ArmsPartIcon kind={draggedPart.id} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && !done && (
          <CardTray
            key={`parts-${round}`}
            label="Części herbu"
            cards={cards}
            selected={drag.selected}
            shaking={shaking}
            dragged={draggedPart?.id ?? null}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="arms-panel"
            aria-label="Herb Chełma"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<ArmsPartIcon kind="bear-white" className="size-6" />}
              counter={`Części: ${placed.length} / ${wanted.length}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
