'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { GORGE_HINTS, GORGE_LEGS } from '@/content/kazimierz-dolny'
import { GorgeView, gorgeGeometry } from '@/levels/kazimierz-dolny/art/GorgeView'
import { RoosterArt } from '@/levels/kazimierz-dolny/art/RoosterArt'
import type { SceneLayout } from '@/levels/kazimierz-dolny/scene-layout'
import { shuffled } from '@/lib/shuffle'

const WALK_MS = 900
const SLIDE_MS = 1400
const ARRIVE_MS = 1300

type Phase =
  | { kind: 'choose' }
  | { kind: 'walk'; answer: number }
  | { kind: 'slide'; answer: number }
  | { kind: 'arrived'; answer: number }

type GorgeStageProps = {
  layout: SceneLayout
  leg: number
  playing: boolean
  onLeg: (leg: number) => void
}

function phaseDelay(phase: Phase) {
  if (phase.kind === 'walk') return WALK_MS
  if (phase.kind === 'slide') return SLIDE_MS
  return ARRIVE_MS
}

export function GorgeStage({ layout, leg, playing, onLeg }: GorgeStageProps) {
  const { world, unit, portrait } = layout
  const plan = GORGE_LEGS[Math.min(leg, GORGE_LEGS.length - 1)]
  const [orders] = useState(() =>
    plan.forks.map((fork) => shuffled(fork.answers.map((_, index) => index))),
  )
  const [forkIndex, setForkIndex] = useState(0)
  const [blocked, setBlocked] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>({ kind: 'choose' })
  const [hint, setHint] = useState<string>(GORGE_HINTS.start)
  const fork = plan.forks[Math.min(forkIndex, plan.forks.length - 1)]
  const order = orders[Math.min(forkIndex, orders.length - 1)]
  const geometry = gorgeGeometry(layout, order.length)
  const view = useMemo(
    () => <GorgeView layout={layout} geometry={gorgeGeometry(layout, order.length)} />,
    [layout, order.length],
  )
  const roosterScale = unit * (portrait ? 1.5 : 1.3)
  const home = { x: world.width / 2, y: world.height - 70 * unit }

  useEffect(() => {
    if (phase.kind === 'choose') return
    const timer = setTimeout(() => {
      if (phase.kind === 'walk') {
        const correct = phase.answer === fork.correctIndex
        setPhase(
          correct
            ? { kind: 'arrived', answer: phase.answer }
            : { kind: 'slide', answer: phase.answer },
        )
        setHint(correct ? fork.fact : GORGE_HINTS.wrong)
        return
      }
      if (phase.kind === 'slide') {
        setBlocked((current) => [...current, phase.answer])
        setPhase({ kind: 'choose' })
        return
      }
      if (forkIndex + 1 >= plan.forks.length) {
        onLeg(leg)
        return
      }
      setForkIndex(forkIndex + 1)
      setBlocked([])
      setPhase({ kind: 'choose' })
      setHint(GORGE_HINTS.start)
    }, phaseDelay(phase))
    return () => clearTimeout(timer)
  }, [phase, fork, forkIndex, plan.forks.length, leg, onLeg])

  function choose(answer: number) {
    if (!playing || phase.kind !== 'choose' || blocked.includes(answer)) return
    setPhase({ kind: 'walk', answer })
  }

  const target = phase.kind === 'choose' ? null : geometry.openings[order.indexOf(phase.answer)]
  const roosterAt =
    phase.kind === 'choose' || !target
      ? { x: home.x, y: home.y, scale: 1 }
      : phase.kind === 'slide'
        ? {
            x: home.x + (target.x - home.x) * 0.4,
            y: home.y + (geometry.backBottom - home.y) * 0.4,
            scale: 0.8,
          }
        : { x: target.x, y: geometry.backBottom - 10 * unit, scale: 0.45 }
  const pose = phase.kind === 'walk' ? 'run' : phase.kind === 'arrived' ? 'crow' : 'stand'

  return (
    <div className="absolute inset-0 select-none" data-gorge data-fork={forkIndex}>
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        <AnimatePresence initial={false}>
          <motion.g
            key={forkIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {view}
          </motion.g>
        </AnimatePresence>
        {geometry.openings.map((opening, slot) => {
          const answer = order[slot]
          const sliding = phase.kind === 'slide' && phase.answer === answer
          if (!blocked.includes(answer) && !sliding) return null
          return (
            <motion.g
              key={`${forkIndex}-${answer}`}
              initial={sliding ? { y: -260 * unit, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeIn' }}
            >
              <path
                d={`M${opening.x - opening.width * 0.62} ${geometry.backBottom + 6 * unit}C${opening.x - opening.width * 0.5} ${opening.top + opening.width * 0.2} ${opening.x + opening.width * 0.5} ${opening.top + opening.width * 0.1} ${opening.x + opening.width * 0.62} ${geometry.backBottom + 6 * unit}Z`}
                fill="#d8b46c"
                stroke="#8a6a3a"
                strokeWidth={3}
              />
              {[-0.3, 0, 0.28].map((share) => (
                <circle
                  key={share}
                  cx={opening.x + opening.width * share}
                  cy={geometry.backBottom - opening.width * (0.25 + Math.abs(share) * 0.2)}
                  r={opening.width * 0.08}
                  fill="#c09450"
                />
              ))}
            </motion.g>
          )
        })}
        <motion.g
          initial={false}
          animate={{ x: roosterAt.x, y: roosterAt.y, scale: roosterAt.scale }}
          transition={{
            duration: phase.kind === 'slide' ? 0.4 : WALK_MS / 1000,
            ease: 'easeInOut',
          }}
        >
          <g transform={`scale(${roosterScale})`}>
            <RoosterArt pose={pose} />
          </g>
        </motion.g>
      </svg>

      {playing && phase.kind === 'choose' && (
        <div className="pointer-events-none absolute inset-0">
          {geometry.openings.map((opening, slot) => {
            const answer = order[slot]
            const closed = blocked.includes(answer)
            return (
              <button
                key={`${forkIndex}-${answer}`}
                type="button"
                disabled={closed}
                data-answer={answer}
                className="pointer-events-auto absolute -translate-x-1/2 rounded-xl border-2 border-[#7a4e28] bg-[#fbf0d6] px-2 py-1.5 text-center font-display text-xs leading-tight font-bold text-[#4a2f1a] shadow-lg hover:bg-[#fff6e2] disabled:opacity-40 sm:text-sm"
                style={{
                  left: `${(opening.x / world.width) * 100}%`,
                  top: `${((opening.top + (geometry.backBottom - opening.top) * 0.3) / world.height) * 100}%`,
                  width: `${(Math.max(opening.width * 1.1, 120 * unit) / world.width) * 100}%`,
                }}
                onClick={() => choose(answer)}
              >
                {closed ? 'Zasypane' : fork.answers[answer]}
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {playing && (
          <motion.section
            key="gorge-panel"
            aria-label="Wąwóz lessowy"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">🐓</span>}
              counter={`Rozwidlenie ${Math.min(forkIndex + 1, plan.forks.length)} / ${plan.forks.length}`}
              hint={hint}
            >
              <p className="mt-2 text-sm font-bold text-[#5a4630] sm:text-base">{fork.question}</p>
              <div className="mt-1.5 flex items-center gap-1.5" aria-hidden="true">
                {plan.forks.map((_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 flex-1 rounded-full ${index < forkIndex || (index === forkIndex && phase.kind === 'arrived') ? 'bg-[#1f5c50]' : index === forkIndex ? 'bg-[#d8a83a]' : 'bg-[#e8d8b4]'}`}
                  />
                ))}
              </div>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
