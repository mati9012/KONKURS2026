'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { TRIAL_HINTS, TRIAL_ROUNDS } from '@/content/lublin'
import type { TrialEvidenceId } from '@/content/lublin'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { CourtroomBackdrop } from '@/levels/lublin/art/CourtroomBackdrop'
import { EvidenceIcon } from '@/levels/lublin/art/EvidenceIcon'
import { JusticeScales } from '@/levels/lublin/art/JusticeScales'
import type { SceneLayout } from '@/levels/lublin/scene-layout'
import { DevilSprite } from '@/levels/zwierzyniec/art/DevilSprite'
import { GoatSprite } from '@/levels/zwierzyniec/art/GoatSprite'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const FINISH_MS = 2600
const PAW_MS = 4200
const TABLE = 'table'

type TrialStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function PawMark() {
  return (
    <g>
      <ellipse cx={0} cy={10} rx={30} ry={22} fill="#1a0e08" />
      {[-30, -11, 11, 30].map((x, index) => (
        <g key={x}>
          <ellipse
            cx={x}
            cy={index === 0 || index === 3 ? -18 : -28}
            rx={9}
            ry={12}
            fill="#1a0e08"
          />
          <path
            d={`M${x} ${index === 0 || index === 3 ? -30 : -40}l-3 -14`}
            stroke="#1a0e08"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      ))}
      <ellipse cx={0} cy={0} rx={56} ry={40} fill="#e8602a" opacity={0.25} />
    </g>
  )
}

export function TrialStage({ layout, round, playing, onRound }: TrialStageProps) {
  const { world, unit, portrait } = layout
  const plan = TRIAL_ROUNDS[Math.min(round, TRIAL_ROUNDS.length - 1)]
  const final = round >= TRIAL_ROUNDS.length - 1
  const [deck] = useState(() => shuffled(plan.charges))
  const [refuted, setRefuted] = useState<TrialEvidenceId[]>([])
  const [shaking, setShaking] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const drag = useCardDrag(drop)
  const backdrop = useMemo(() => <CourtroomBackdrop layout={layout} />, [layout])
  const done = refuted.length >= plan.charges.length
  const charge = done ? null : plan.charges[refuted.length]
  const total = TRIAL_ROUNDS.reduce((sum, entry) => sum + entry.charges.length, 0)
  const settled = round * plan.charges.length + refuted.length
  const tilt = 16 - (32 * settled) / total
  const tableTop = world.height * (portrait ? 0.58 : 0.6)
  const tableLeft = world.width * (portrait ? 0.06 : 0.2)
  const tableWidth = world.width - tableLeft * 2
  const tableHeight = 90 * unit
  const devilScale = unit * (portrait ? 2.6 : 2.4)
  const cards = deck
    .filter((entry) => !refuted.includes(entry.id))
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      icon: <EvidenceIcon id={entry.id} className="size-10 sm:size-12" />,
    }))
  const dragged = drag.drag?.moved
    ? plan.charges.find((entry) => entry.id === drag.drag?.id)
    : undefined
  const showTarget = playing && !done && (drag.selected || drag.drag?.moved)
  const hovered = drag.hovered === TABLE

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => onRound(round), final ? PAW_MS : FINISH_MS)
    return () => clearTimeout(timer)
  }, [done, final, round, onRound])

  function drop(card: string, target: string) {
    if (!playing || !charge || target !== TABLE) return
    if (card !== charge.id) {
      setShaking(card)
      setMessage(TRIAL_HINTS.wrong)
      return
    }
    setRefuted([...refuted, charge.id])
    setMessage(charge.fact)
  }

  return (
    <div className="absolute inset-0" data-trial data-refuted={settled} {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full transform-gpu select-none"
      >
        <WatercolorDefs />
        {backdrop}
      </svg>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <motion.g
          initial={false}
          animate={
            shaking
              ? { y: [0, -14 * unit, 0, -8 * unit, 0] }
              : done && final
                ? { y: [0, -40 * unit, 10 * unit, 0] }
                : { y: 0 }
          }
          transition={{ duration: done && final ? 0.7 : 0.45 }}
        >
          <g
            transform={`translate(${world.width / 2} ${tableTop + 10 * unit}) scale(${devilScale})`}
          >
            <DevilSprite cracking={false} />
          </g>
        </motion.g>
        <g
          role="button"
          tabIndex={0}
          aria-label="Stół sędziowski"
          data-target={TABLE}
          className="cursor-pointer outline-none"
          onClick={() => drag.pick(TABLE)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            drag.pick(TABLE)
          }}
        >
          <g filter={PAINT}>
            <rect
              x={tableLeft}
              y={tableTop}
              width={tableWidth}
              height={tableHeight}
              fill="#7a4a2a"
              stroke="#2a1c14"
              strokeWidth={4}
            />
            <rect
              x={tableLeft - 14 * unit}
              y={tableTop - 12 * unit}
              width={tableWidth + 28 * unit}
              height={16 * unit}
              fill="#9a6238"
              stroke="#2a1c14"
              strokeWidth={4}
            />
            <rect
              x={tableLeft + 20 * unit}
              y={tableTop + tableHeight}
              width={tableWidth - 40 * unit}
              height={world.height * 0.12}
              fill="#5a3420"
              stroke="#2a1c14"
              strokeWidth={4}
            />
          </g>
          <rect
            x={tableLeft - 14 * unit}
            y={tableTop - 12 * unit}
            width={tableWidth + 28 * unit}
            height={tableHeight + 12 * unit}
            fill="#ffe7a3"
            fillOpacity={hovered ? 0.45 : showTarget ? 0.25 : 0}
            stroke={showTarget ? '#f2b84b' : 'transparent'}
            strokeWidth={4}
            strokeDasharray="12 8"
          />
        </g>
        <g
          transform={`translate(${tableLeft + tableWidth * 0.86} ${tableTop - 160 * unit * (portrait ? 0.9 : 1)}) scale(${unit * (portrait ? 0.9 : 1)})`}
          pointerEvents="none"
        >
          <JusticeScales tilt={tilt} />
        </g>
        <g
          transform={`translate(${tableLeft + tableWidth * 0.1} ${tableTop - 6 * unit}) scale(${unit * (portrait ? 1.4 : 1.6)})`}
          pointerEvents="none"
        >
          <GoatSprite />
        </g>
        <AnimatePresence>
          {done && final && (
            <motion.g
              key="paw"
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              pointerEvents="none"
              data-paw
            >
              <g
                transform={`translate(${world.width / 2} ${tableTop + tableHeight * 0.45}) scale(${unit * 0.9})`}
              >
                <PawMark />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {dragged && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y} over={drag.hovered !== null}>
          <EvidenceIcon id={dragged.id} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && !done && (
          <CardTray
            key={`evidence-${round}`}
            label="Dowody z wyprawy"
            cards={cards}
            selected={drag.selected}
            shaking={shaking}
            dragged={dragged?.id ?? null}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="trial-panel"
            aria-label="Trybunał Koronny"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">⚖️</span>}
              counter={`Obalone kłamstwa: ${refuted.length} / ${plan.charges.length}`}
              hint={message ?? TRIAL_HINTS.start}
            >
              {charge && (
                <p className="mt-2 text-sm font-bold text-[#8a2a1a] sm:text-base">
                  Diabeł: „{charge.lie}”
                </p>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
