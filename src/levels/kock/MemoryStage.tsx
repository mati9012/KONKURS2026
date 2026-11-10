'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, PAINT_WASH, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { EXHIBITS, MEMORY_HINTS, MEMORY_ROUNDS } from '@/content/kock'
import type { ExhibitId } from '@/content/kock'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { ExhibitIcon } from '@/levels/kock/art/ExhibitIcon'
import type { SceneLayout } from '@/levels/kock/scene-layout'
import { useCardDrag } from '@/levels/kock/useCardDrag'

const SHAKE_MS = 450
const INK = '#2a1e16'

type MemoryStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function exhibit(id: ExhibitId) {
  return EXHIBITS.find((item) => item.id === id) ?? EXHIBITS[0]
}

function Room({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground } = layout
  const { width, height } = world
  const frames = [0.14, 0.86]
  return (
    <g>
      <rect width={width} height={height} fill="#c9c4ae" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.25} />
      <rect y={ground * 0.08} width={width} height={10 * unit} fill="#8a7a5a" />
      <rect y={ground} width={width} height={height - ground} fill="#8a6440" filter={PAINT} />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <path
          key={index}
          d={`M0 ${ground + (index + 1) * 24 * unit}H${width}`}
          stroke="#6a4a2e"
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      <rect y={ground - 14 * unit} width={width} height={14 * unit} fill="#6a5a40" />
      {frames.map((share) => (
        <g key={share} transform={`translate(${width * share} ${ground * 0.34})`}>
          <rect
            x={-70 * unit}
            y={-90 * unit}
            width={140 * unit}
            height={180 * unit}
            fill="#a8803a"
            stroke={INK}
            strokeWidth={2}
          />
          <rect
            x={-56 * unit}
            y={-76 * unit}
            width={112 * unit}
            height={152 * unit}
            fill="#e8e0cc"
          />
          <circle cx={0} cy={-20 * unit} r={26 * unit} fill="#8a8274" />
          <path
            d={`M${-44 * unit} ${70 * unit}C${-44 * unit} ${14 * unit} ${44 * unit} ${14 * unit} ${44 * unit} ${70 * unit}Z`}
            fill="#8a8274"
          />
        </g>
      ))}
      <g transform={`translate(${width / 2} ${ground * 0.42})`}>
        <path
          d={`M${-4 * unit} ${-60 * unit}V${120 * unit}`}
          stroke="#5a4632"
          strokeWidth={6 * unit}
        />
        <path
          d={`M0 ${-56 * unit}H${110 * unit}V${-20 * unit}H0Z`}
          fill="#fbfbf6"
          stroke={INK}
          strokeWidth={1.4}
        />
        <path
          d={`M0 ${-20 * unit}H${110 * unit}V${16 * unit}H0Z`}
          fill="#c8302a"
          stroke={INK}
          strokeWidth={1.4}
        />
      </g>
    </g>
  )
}

export function MemoryStage({ layout, round, playing, onRound }: MemoryStageProps) {
  const { world, unit, ground, portrait } = layout
  const plan = MEMORY_ROUNDS[Math.min(round, MEMORY_ROUNDS.length - 1)]
  const marks = useMemo(
    () =>
      plan.exhibits
        .map((id) => exhibit(id))
        .sort((a, b) => a.order - b.order)
        .map((item) => ({ order: item.order, when: item.when })),
    [plan.exhibits],
  )
  const [placed, setPlaced] = useState<Record<number, ExhibitId>>({})
  const [hint, setHint] = useState<string>(MEMORY_HINTS.start)
  const [shaking, setShaking] = useState<string | null>(null)
  const room = useMemo(() => <Room layout={layout} />, [layout])
  const drag = useCardDrag(drop)
  const railY = ground - 40 * unit
  const span = world.width * (portrait ? 0.84 : 0.66)
  const box = Math.min(70 * unit, (span / marks.length) * 0.42)
  const slots = marks.map((mark, index) => ({
    ...mark,
    x: world.width / 2 - span / 2 + (span * (index + 0.5)) / marks.length,
  }))
  const cards = plan.exhibits
    .filter((id) => !Object.values(placed).includes(id))
    .map((id) => ({
      id,
      label: exhibit(id).name,
      icon: <ExhibitIcon id={id} className="size-10 sm:size-12" />,
    }))
  const draggedId = drag.drag?.moved ? (drag.drag.id as ExhibitId) : null

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function drop(card: string, target: string) {
    if (!playing) return
    const order = Number(target.replace('when-', ''))
    const item = EXHIBITS.find((entry) => entry.id === card)
    if (!item || Number.isNaN(order) || placed[order]) return
    if (item.order !== order) {
      setShaking(item.id)
      setHint(MEMORY_HINTS.wrong)
      return
    }
    const next = { ...placed, [order]: item.id }
    setPlaced(next)
    setHint(`${MEMORY_HINTS.good} ${item.when}: ${item.label}.`)
    if (Object.keys(next).length === plan.exhibits.length) onRound(round)
  }

  const showTargets = playing && (drag.selected || drag.drag?.moved)

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {room}
        <rect
          x={world.width / 2 - span / 2 - 30 * unit}
          y={railY - 8 * unit}
          width={span + 60 * unit}
          height={16 * unit}
          rx={6}
          fill="#5a4026"
          stroke={INK}
          strokeWidth={2}
        />
        {slots.map((slot) => {
          const target = `when-${slot.order}`
          const item = placed[slot.order]
          return (
            <g key={slot.order} transform={`translate(${slot.x} ${railY})`}>
              <rect
                x={-box * 0.92}
                y={20 * unit}
                width={box * 1.84}
                height={42 * unit}
                rx={6}
                fill="#e8d8a8"
                stroke={INK}
                strokeWidth={2}
              />
              <text
                x={0}
                y={50 * unit}
                textAnchor="middle"
                fontSize={Math.min(26 * unit, box * 0.3)}
                fontWeight={700}
                fill="#4a2f1a"
                fontFamily="var(--font-alegreya), Georgia, serif"
              >
                {slot.when}
              </text>
              {item ? (
                <motion.g initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <rect
                    x={-box}
                    y={-box * 2.4}
                    width={box * 2}
                    height={box * 2.1}
                    rx={10}
                    fill="#f6ecd2"
                    stroke={INK}
                    strokeWidth={2}
                  />
                  <g transform={`translate(${-box * 0.8} ${-box * 2.25})`}>
                    <ExhibitIcon id={item} size={box * 1.6} />
                  </g>
                </motion.g>
              ) : (
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Data ${slot.when}`}
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
                    x={-box}
                    y={-box * 2.4}
                    width={box * 2}
                    height={box * 2.1}
                    rx={10}
                    fill="#ffe7a3"
                    fillOpacity={drag.hovered === target ? 0.7 : showTargets ? 0.4 : 0.15}
                    stroke={drag.hovered === target ? '#1f5c50' : '#f2b84b'}
                    strokeWidth={3}
                    strokeDasharray="10 7"
                    className={drag.hovered === target ? undefined : 'zw-pulse'}
                  />
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {draggedId && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y} over={drag.hovered !== null}>
          <ExhibitIcon id={draggedId} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && (
          <CardTray
            key={`tray-${round}`}
            label="Pamiątki"
            cards={cards}
            selected={drag.selected}
            shaking={shaking}
            dragged={draggedId}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="memory-panel"
            aria-label="Izba pamięci"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<ExhibitIcon id="wreath" className="size-6" />}
              counter={`Gablota ${round + 1} / ${MEMORY_ROUNDS.length}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
