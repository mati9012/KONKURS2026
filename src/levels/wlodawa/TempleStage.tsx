'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { blobPath } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import {
  PAINT,
  PAINT_SOFT,
  PAINT_WASH,
  WatercolorDefs,
} from '@/components/watercolor/WatercolorDefs'
import { TEMPLE_HINTS, TEMPLE_IDS, TEMPLE_NAMES, TEMPLE_ROUNDS } from '@/content/wlodawa'
import type { RelicId, TempleId } from '@/content/wlodawa'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { RelicIcon } from '@/levels/wlodawa/art/RelicIcon'
import { TempleArt } from '@/levels/wlodawa/art/TempleArt'
import type { SceneLayout } from '@/levels/wlodawa/scene-layout'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const INK = '#2a1e16'

const TREES = {
  fir: ['#4f7a4a', '#5a844e'],
  beech: ['#7a9a52', '#86a45a', '#6e9048'],
  trunk: '#5a4632',
}

type TempleStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function templeSpots(layout: SceneLayout) {
  const { world, unit, portrait } = layout
  const shares = portrait ? [0.18, 0.5, 0.82] : [0.2, 0.5, 0.8]
  const scale = Math.min(unit * 1.15, (world.width / 3) * (portrait ? 0.0031 : 0.0026))
  return TEMPLE_IDS.map((id, index) => ({ id, x: world.width * shares[index], scale }))
}

function Street({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground } = layout
  const { width, height } = world
  return (
    <g>
      <defs>
        <linearGradient id="wl-temple-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a4c8e0" />
          <stop offset="1" stopColor="#f8ecd4" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#wl-temple-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.35, height * 0.12, 140 * unit, 20 * unit, 13, 0.3)}
          fill="#fffaf0"
        />
        <path
          d={blobPath(width * 0.85, height * 0.18, 110 * unit, 16 * unit, 17, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <TreeLine
        width={width}
        baseY={ground - 20 * unit}
        height={120 * unit}
        seed={44}
        palette={TREES}
        density={0.6}
        filter={PAINT_SOFT}
        opacity={0.9}
      />
      <rect y={ground} width={width} height={height - ground} fill="#9ab86a" filter={PAINT} />
      <rect
        y={ground + 6 * unit}
        width={width}
        height={46 * unit}
        fill="#d8c8a4"
        filter={PAINT}
        opacity={0.95}
      />
    </g>
  )
}

export function TempleStage({ layout, round, playing, onRound }: TempleStageProps) {
  const { unit, ground } = layout
  const plan = TEMPLE_ROUNDS[Math.min(round, TEMPLE_ROUNDS.length - 1)]
  const [deck] = useState(() => shuffled(plan.relics))
  const [placed, setPlaced] = useState<RelicId[]>([])
  const [hint, setHint] = useState<string>(TEMPLE_HINTS.start)
  const [shaking, setShaking] = useState<string | null>(null)
  const street = useMemo(() => <Street layout={layout} />, [layout])
  const spots = templeSpots(layout)
  const drag = useCardDrag(drop)
  const remaining = deck.filter((relic) => !placed.includes(relic.id))
  const cards = remaining.map((relic) => ({
    id: relic.id,
    label: relic.name,
    icon: <RelicIcon id={relic.id} className="size-10 sm:size-12" />,
  }))
  const draggedId = drag.drag?.moved ? (drag.drag.id as RelicId) : null
  const showTargets = playing && (drag.selected || drag.drag?.moved)

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function drop(card: string, target: string) {
    if (!playing) return
    const relic = plan.relics.find((entry) => entry.id === card)
    const temple = target.replace('temple-', '') as TempleId
    if (!relic || placed.includes(relic.id) || !TEMPLE_IDS.includes(temple)) return
    if (relic.temple !== temple) {
      setShaking(relic.id)
      setHint(TEMPLE_HINTS.wrong)
      return
    }
    const next = [...placed, relic.id]
    setPlaced(next)
    setHint(`${TEMPLE_HINTS.good} ${relic.name}: ${TEMPLE_NAMES[temple]}.`)
    if (next.length === plan.relics.length) onRound(round)
  }

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${layout.world.width} ${layout.world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {street}
        {spots.map((spot) => {
          const target = `temple-${spot.id}`
          const hovered = drag.hovered === target
          const inside = plan.relics.filter(
            (relic) => relic.temple === spot.id && placed.includes(relic.id),
          )
          const halfWidth = 160 * spot.scale
          return (
            <g
              key={spot.id}
              role="button"
              tabIndex={0}
              aria-label={TEMPLE_NAMES[spot.id]}
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
                x={spot.x - halfWidth}
                y={ground - 380 * spot.scale}
                width={halfWidth * 2}
                height={380 * spot.scale + 90 * unit}
                rx={16 * unit}
                fill="#ffe7a3"
                fillOpacity={hovered ? 0.45 : showTargets ? 0.22 : 0}
                stroke={hovered ? '#1f5c50' : '#f2b84b'}
                strokeOpacity={showTargets ? 1 : 0}
                strokeWidth={3}
                strokeDasharray="10 7"
                className={showTargets && !hovered ? 'zw-pulse' : undefined}
              />
              <g
                transform={`translate(${spot.x} ${ground + 8 * unit}) scale(${spot.scale})`}
                filter={PAINT}
              >
                <TempleArt temple={spot.id} />
              </g>
              <g transform={`translate(${spot.x} ${ground + 44 * unit})`}>
                <rect
                  x={-halfWidth * 0.92}
                  y={-16 * unit}
                  width={halfWidth * 1.84}
                  height={34 * unit}
                  rx={8 * unit}
                  fill="#f6ecd2"
                  stroke={INK}
                  strokeWidth={2}
                />
                <text
                  y={8 * unit}
                  textAnchor="middle"
                  fontSize={Math.min(22 * unit, halfWidth * 0.17)}
                  fontWeight={700}
                  fill="#4a2f1a"
                  fontFamily="var(--font-alegreya), Georgia, serif"
                >
                  {TEMPLE_NAMES[spot.id]}
                </text>
              </g>
              {inside.map((relic) => (
                <g key={relic.id} transform={`translate(${spot.x} ${ground - 120 * spot.scale})`}>
                  <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}>
                    <circle r={40 * unit} fill="#fbf0d6" stroke="#1f5c50" strokeWidth={3} />
                    <g transform={`translate(${-36 * unit} ${-36 * unit})`}>
                      <RelicIcon id={relic.id} size={72 * unit} />
                    </g>
                  </motion.g>
                </g>
              ))}
            </g>
          )
        })}
      </svg>

      {draggedId && drag.drag && (
        <DragGhost position={drag.position} over={drag.hovered !== null}>
          <RelicIcon id={draggedId} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && (
          <CardTray
            key={`relics-${round}`}
            label="Wyposażenie świątyń"
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
            key="temple-panel"
            aria-label="Trzy świątynie"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<RelicIcon id="onion-dome" className="size-6" />}
              counter={`Runda ${round + 1} / ${TEMPLE_ROUNDS.length}`}
              hint={hint}
            >
              <ul className="mt-1.5 space-y-0.5 text-sm text-[#5a4630] sm:text-base">
                {remaining.map((relic) => (
                  <li key={relic.id}>
                    <span className="font-bold">{relic.name}</span>: {relic.clue}
                  </li>
                ))}
              </ul>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
