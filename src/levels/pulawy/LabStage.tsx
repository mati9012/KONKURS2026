'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { LAB_HINTS, LAB_ROUNDS, NEED_LABELS, TOOL_NAMES } from '@/content/pulawy'
import type { ToolId } from '@/content/pulawy'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { CropArt } from '@/levels/pulawy/art/CropArt'
import type { CropKind } from '@/levels/pulawy/art/CropArt'
import { FieldBackdrop } from '@/levels/pulawy/art/FieldBackdrop'
import { ToolIcon } from '@/levels/pulawy/art/ToolIcon'
import type { SceneLayout } from '@/levels/pulawy/scene-layout'

const RIPE = 3
const SHAKE_MS = 450
const FIRST_NEED_MS = 700
const NEED_GAP_MS = 900
const NEED_SPREAD_MS = 1100
const TICK_MS = 200
const KINDS: readonly CropKind[] = ['sunflower', 'rapeseed', 'bean']

type Plot = { growth: number; need: ToolId | null; readyAt: number }

type LabStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function chooseNeed(plot: Plot, tools: readonly ToolId[]): ToolId {
  if (plot.growth === RIPE - 1 && tools.includes('bees')) return 'bees'
  const basic = tools.filter((tool) => tool !== 'bees')
  return basic[Math.floor(Math.random() * basic.length)]
}

function freshPlots(count: number): Plot[] {
  return Array.from({ length: count }, (_, index) => ({
    growth: 0,
    need: null,
    readyAt: FIRST_NEED_MS * (index + 1),
  }))
}

export function LabStage({ layout, round, playing, onRound }: LabStageProps) {
  const { world, unit, ground, portrait } = layout
  const plan = LAB_ROUNDS[Math.min(round, LAB_ROUNDS.length - 1)]
  const [plots, setPlots] = useState<Plot[]>(() => freshPlots(plan.plants))
  const current = useRef(plots)
  const started = useRef(0)
  const clock = useRef(0)
  const done = useRef(false)
  const [hint, setHint] = useState<string>(LAB_HINTS.start)
  const [shaking, setShaking] = useState<number | null>(null)
  const backdrop = useMemo(() => <FieldBackdrop layout={layout} />, [layout])
  const span = world.width * (portrait ? 0.92 : 0.7)
  const slot = span / plan.plants
  const scale = Math.min(unit * (portrait ? 1.9 : 1.5), slot / (portrait ? 80 : 110))
  const ripe = plots.filter((plot) => plot.growth >= RIPE).length
  const drag = useCardDrag(drop)
  const tool = drag.selected as ToolId | null
  const draggedId = drag.drag?.moved ? (drag.drag.id as ToolId) : null
  const showTargets = playing && Boolean(drag.drag?.moved)
  const cards = plan.tools.map((option) => ({
    id: option,
    label: TOOL_NAMES[option],
    icon: <ToolIcon id={option} className="size-10 sm:size-12" />,
  }))

  function drop(card: string, target: string) {
    const index = Number(target.replace('plot-', ''))
    if (Number.isNaN(index)) return
    tend(index, card as ToolId)
  }

  function commit(next: Plot[]) {
    current.current = next
    setPlots(next)
    if (!done.current && next.every((plot) => plot.growth >= RIPE)) {
      done.current = true
      onRound(round)
    }
  }

  useEffect(() => {
    if (!playing) return
    if (started.current === 0) started.current = performance.now()
    const timer = setInterval(() => {
      const elapsed = performance.now() - started.current
      clock.current = elapsed
      const before = current.current
      let changed = false
      const next = before.map((plot) => {
        if (plot.need || plot.growth >= RIPE || elapsed < plot.readyAt) return plot
        changed = true
        return { ...plot, need: chooseNeed(plot, plan.tools) }
      })
      if (changed) commit(next)
    }, TICK_MS)
    return () => clearInterval(timer)
  })

  useEffect(() => {
    if (shaking === null) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function tend(index: number, used: ToolId | null) {
    if (!playing) return
    const plot = current.current[index]
    if (!plot || plot.growth >= RIPE) return
    if (!used) {
      setHint(LAB_HINTS.noTool)
      return
    }
    if (!plot.need) {
      setHint(LAB_HINTS.idle)
      return
    }
    if (plot.need !== used) {
      setShaking(index)
      setHint(LAB_HINTS.wrong)
      return
    }
    const elapsed = clock.current
    const next = current.current.map((entry, position) =>
      position === index
        ? {
            growth: entry.growth + 1,
            need: null,
            readyAt: elapsed + NEED_GAP_MS + Math.random() * NEED_SPREAD_MS,
          }
        : entry,
    )
    setHint(LAB_HINTS.good)
    commit(next)
  }

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {plots.map((plot, index) => {
          const x = world.width / 2 - span / 2 + slot * (index + 0.5)
          const label = plot.need
            ? `Roślina ${index + 1}: ${NEED_LABELS[plot.need]}`
            : `Roślina ${index + 1}`
          return (
            <g key={index} transform={`translate(${x} ${ground + 30 * unit})`}>
              <motion.g
                role="button"
                tabIndex={0}
                aria-label={label}
                data-plot={index}
                data-need={plot.need ?? ''}
                data-growth={plot.growth}
                data-target={`plot-${index}`}
                className="cursor-pointer outline-none"
                animate={shaking === index ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                onClick={() => tend(index, tool)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  tend(index, tool)
                }}
              >
                <g transform={`scale(${scale})`}>
                  <rect
                    x={-55}
                    y={-230}
                    width={110}
                    height={250}
                    rx={12}
                    fill="#ffe7a3"
                    fillOpacity={drag.hovered === `plot-${index}` ? 0.45 : 0}
                    stroke="#1f5c50"
                    strokeOpacity={showTargets && plot.need ? 0.8 : 0}
                    strokeWidth={3}
                    strokeDasharray="10 7"
                  />
                  {plot.growth >= RIPE && (
                    <ellipse cx={0} cy={-80} rx={60} ry={100} fill="#fff4b0" opacity={0.35} />
                  )}
                  <g filter={PAINT}>
                    <CropArt
                      kind={KINDS[index % KINDS.length]}
                      growth={plot.growth}
                      thirsty={plot.need === 'water'}
                      weedy={plot.need === 'hoe'}
                    />
                  </g>
                  {plot.need && (
                    <g transform="translate(0 -200)">
                      <motion.g
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <path d="M0 34L-8 22H8Z" fill="#fbf0d6" stroke="#b8894f" strokeWidth={2} />
                        <circle r={28} fill="#fbf0d6" stroke="#b8894f" strokeWidth={3} />
                        <g transform="translate(-20 -20)">
                          <ToolIcon id={plot.need} size={40} />
                        </g>
                      </motion.g>
                    </g>
                  )}
                </g>
              </motion.g>
            </g>
          )
        })}
      </svg>

      {draggedId && drag.drag && (
        <DragGhost position={drag.position} over={drag.hovered !== null}>
          <ToolIcon id={draggedId} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && (
          <CardTray
            key={`tools-${round}`}
            label="Narzędzia"
            cards={cards}
            selected={drag.selected}
            shaking={null}
            dragged={draggedId}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="lab-panel"
            aria-label="Poletko doświadczalne"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<ToolIcon id="water" className="size-6" />}
              counter={`Dojrzałe: ${ripe} / ${plan.plants}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
