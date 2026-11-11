'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import {
  COLUMN_NAMES,
  FACADE_HINTS,
  FACADE_ROUNDS,
  PLAN_NAMES,
  PLAN_ROUND,
  PLAN_SHAPES,
} from '@/content/kock'
import type { ColumnKind, PlanShape } from '@/content/kock'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { ColumnArt } from '@/levels/kock/art/ColumnArt'
import { ColumnIcon } from '@/levels/kock/art/ColumnIcon'
import { PalaceBackdrop } from '@/levels/kock/art/PalaceBackdrop'
import { PlanShapeArt } from '@/levels/kock/art/PlanShapeArt'
import { palaceLayout } from '@/levels/kock/palace-layout'
import type { SceneLayout } from '@/levels/kock/scene-layout'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450

type FacadeStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function cardsFor(round: number) {
  const plan = FACADE_ROUNDS[round]
  const kinds: ColumnKind[] = [
    ...Array.from({ length: 4 }, () => plan.column),
    ...plan.decoys.flatMap((kind) => [kind, kind]),
  ]
  return shuffled(kinds.map((kind, index) => ({ id: `${kind}-${index}`, kind })))
}

export function FacadeStage({ layout, round, playing, onRound }: FacadeStageProps) {
  const { world, unit } = layout
  const columnRound = round < FACADE_ROUNDS.length
  const plan = FACADE_ROUNDS[Math.min(round, FACADE_ROUNDS.length - 1)]
  const palace = useMemo(() => palaceLayout(layout), [layout])
  const [placed, setPlaced] = useState<(ColumnKind | null)[]>(() =>
    columnRound ? [null, null, null, null] : Array(4).fill(plan.column),
  )
  const [used, setUsed] = useState<string[]>([])
  const [hint, setHint] = useState<string>(columnRound ? plan.task : PLAN_ROUND.task)
  const [shaking, setShaking] = useState<string | null>(null)
  const [cards] = useState(() => (columnRound ? cardsFor(round) : []))
  const backdrop = useMemo(
    () => <PalaceBackdrop layout={layout} palace={palace} garden={round > 0} />,
    [layout, palace, round],
  )
  const drag = useCardDrag(drop)
  const dragged = drag.drag?.moved ? cards.find((card) => card.id === drag.drag?.id) : null

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function drop(cardId: string, target: string) {
    if (!playing || !columnRound) return
    const card = cards.find((item) => item.id === cardId)
    const slot = Number(target.replace('slot-', ''))
    if (!card || Number.isNaN(slot) || placed[slot]) return
    if (card.kind !== plan.column) {
      setShaking(card.id)
      setHint(plan.wrong)
      return
    }
    const next = placed.map((kind, index) => (index === slot ? card.kind : kind))
    setPlaced(next)
    setUsed((current) => [...current, card.id])
    setHint(FACADE_HINTS.good)
    if (next.every(Boolean)) onRound(round)
  }

  function choosePlan(shape: PlanShape) {
    if (!playing || columnRound) return
    if (shape !== 'horseshoe') {
      setHint(PLAN_ROUND.wrong)
      return
    }
    onRound(round)
  }

  const showTargets = playing && columnRound && (drag.selected || drag.drag?.moved)

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {palace.slots.map((x, index) => {
          const kind = placed[index]
          const target = `slot-${index}`
          return (
            <g key={target} transform={`translate(${x} ${palace.base})`}>
              {kind ? (
                <motion.g
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <ColumnArt kind={kind} height={palace.columnHeight} />
                </motion.g>
              ) : (
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Miejsce na kolumnę ${index + 1}`}
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
                    x={-palace.columnHeight * 0.1}
                    y={-palace.columnHeight}
                    width={palace.columnHeight * 0.2}
                    height={palace.columnHeight}
                    rx={6}
                    fill="#ffe7a3"
                    fillOpacity={drag.hovered === target ? 0.7 : showTargets ? 0.4 : 0.18}
                    stroke={drag.hovered === target ? '#1f5c50' : '#f2b84b'}
                    strokeWidth={3 * Math.max(unit, 0.6)}
                    strokeDasharray="10 7"
                    className={drag.hovered === target ? undefined : 'zw-pulse'}
                  />
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {dragged && drag.drag && (
        <DragGhost position={drag.position} over={drag.hovered !== null}>
          <ColumnIcon kind={dragged.kind} className="h-20 w-12" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && columnRound && (
          <CardTray
            key={`tray-${round}`}
            label="Kolumny"
            cards={cards
              .filter((card) => !used.includes(card.id))
              .map((card) => ({
                id: card.id,
                label: COLUMN_NAMES[card.kind],
                caption: 'Kolumna',
                icon: (
                  <ColumnIcon kind={card.kind} top className="h-12 w-[2.6rem] sm:h-14 sm:w-12" />
                ),
              }))}
            selected={drag.selected}
            shaking={shaking}
            dragged={drag.drag?.moved ? drag.drag.id : null}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => {
              if (playing) drag.start(id, event)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="facade-panel"
            aria-label="Pałac księżnej"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={columnRound ? plan.title : 'Plan pałacu'}
              icon={<ColumnIcon kind="ionic" className="h-7 w-4" />}
              counter={
                columnRound
                  ? `Kolumny: ${placed.filter(Boolean).length} / 4`
                  : `Etap ${round + 1} / ${FACADE_ROUNDS.length + 1}`
              }
              hint={hint}
            >
              {!columnRound && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {PLAN_SHAPES.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      aria-label={PLAN_NAMES[shape]}
                      className="flex flex-col items-center rounded-xl border-2 border-[#b8894f] bg-[#fbf0d6] px-2 pt-1 pb-0.5 font-display text-xs font-bold text-[#4a2f1a] hover:bg-[#fff6e2]"
                      onClick={() => choosePlan(shape)}
                    >
                      <PlanShapeArt shape={shape} className="size-12" />
                      {PLAN_NAMES[shape]}
                    </button>
                  ))}
                </div>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
