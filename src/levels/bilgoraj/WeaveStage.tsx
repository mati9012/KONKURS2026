'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { WEAVE_HINTS, WEAVE_ROUNDS } from '@/content/bilgoraj'
import { BilgorajIcon } from '@/levels/bilgoraj/art/BilgorajIcon'
import { Loom } from '@/levels/bilgoraj/art/Loom'
import { WorkshopBackdrop } from '@/levels/bilgoraj/art/WorkshopBackdrop'
import type { RoomLayout } from '@/levels/bilgoraj/room-layout'

type Side = 'L' | 'R'

const WINDOW_SHARE = 0.26
const PRESS_MS = 160
const DEVIL_ROUND = 2
const WARP = [14, 18, 24]

type Beat = { start: number; ms: number }

function BeatDot({ beat }: { beat: Beat }) {
  const [delay] = useState(() => -((Date.now() - beat.start) % beat.ms))
  return (
    <span
      aria-hidden="true"
      className="bj-beat size-4 shrink-0 rounded-full bg-[#c8402f]"
      style={{ animationDuration: `${beat.ms}ms`, animationDelay: `${delay}ms` }}
    />
  )
}

type WeaveStageProps = {
  layout: RoomLayout
  playing: boolean
  onRound: (round: number) => void
}

function beatFor(round: number, start: number): Beat {
  return { start, ms: 60000 / WEAVE_ROUNDS[Math.min(round, WEAVE_ROUNDS.length - 1)].bpm }
}

export function WeaveStage({ layout, playing, onRound }: WeaveStageProps) {
  const { world, unit, floor, portrait } = layout
  const [round, setRound] = useState(0)
  const [step, setStep] = useState(0)
  const [full, setFull] = useState(false)
  const [pressed, setPressed] = useState<Side | null>(null)
  const [hint, setHint] = useState<string>(WEAVE_HINTS.start)
  const [beat, setBeat] = useState<Beat>(() => beatFor(0, Date.now()))
  const [lastBeat, setLastBeat] = useState(-1)
  const shown = full && !playing ? round - 1 : round
  const current = WEAVE_ROUNDS[Math.min(round, WEAVE_ROUNDS.length - 1)]
  const showing = WEAVE_ROUNDS[Math.min(shown, WEAVE_ROUNDS.length - 1)]
  const rows = full ? (playing ? 0 : showing.pattern.length) : step
  const position = full ? 0 : step
  const loomWidth = Math.min(world.width * (portrait ? 0.62 : 0.4), 640 * unit)
  const loomHeight = Math.min(floor * 0.82, 560 * unit)
  const backdrop = useMemo(
    () => <WorkshopBackdrop layout={layout} finished={round} />,
    [layout, round],
  )

  useEffect(() => {
    if (!pressed) return
    const timer = setTimeout(() => setPressed(null), PRESS_MS)
    return () => clearTimeout(timer)
  }, [pressed])

  function press(side: Side) {
    if (!playing) return
    setPressed(side)
    const elapsed = Date.now() - beat.start
    const index = Math.round(elapsed / beat.ms)
    const offset = Math.abs(elapsed - index * beat.ms)
    if (offset > beat.ms * WINDOW_SHARE || index === lastBeat) {
      setHint(WEAVE_HINTS.early)
      return
    }
    setLastBeat(index)
    if (full) setFull(false)
    if (side !== current.pattern[position]) {
      if (round >= DEVIL_ROUND) {
        setStep(Math.max(0, position - 1))
        setHint(WEAVE_HINTS.wrong)
      } else {
        setHint(WEAVE_HINTS.miss)
      }
      return
    }
    const next = position + 1
    if (next < current.pattern.length) {
      setStep(next)
      setHint(WEAVE_HINTS.row)
      return
    }
    const done = round
    setRound(done + 1)
    setStep(0)
    setFull(true)
    setHint(WEAVE_HINTS.start)
    setLastBeat(-1)
    setBeat(beatFor(done + 1, Date.now()))
    onRound(done)
  }

  useEffect(() => {
    if (!playing) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') press('L')
      if (event.key === 'ArrowRight') press('R')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
        aria-hidden="true"
      >
        <WatercolorDefs />
        {backdrop}
        <g transform={`translate(${world.width * (portrait ? 0.42 : 0.5)} ${floor + 30 * unit})`}>
          <Loom
            key={beat.start}
            width={loomWidth}
            height={loomHeight}
            warp={WARP[Math.min(shown, WARP.length - 1)]}
            rows={rows}
            total={showing.pattern.length}
            pressed={pressed}
            beatMs={beat.ms}
          />
        </g>
      </svg>
      <div
        data-loom
        data-beat-start={beat.start}
        data-beat-ms={beat.ms}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {playing &&
          (['L', 'R'] as const).map((side) => (
            <button
              key={side}
              type="button"
              aria-label={side === 'L' ? 'Lewy podnóżek' : 'Prawy podnóżek'}
              className="pointer-events-auto flex h-20 w-32 touch-manipulation items-center justify-center rounded-2xl border-2 border-[#7a4e28] bg-[#fbf0d6] font-display text-3xl font-bold text-[#4a2f1a] shadow-lg active:translate-y-1 active:bg-[#f2d9a6] sm:w-40"
              onPointerDown={(event) => {
                event.preventDefault()
                press(side)
              }}
              onClick={(event) => {
                if (event.detail === 0) press(side)
              }}
            >
              {side === 'L' ? '◀' : '▶'}
            </button>
          ))}
      </div>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="weave-panel"
            aria-label="Krojs sitarski"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Krojs sitarski"
              icon={<BilgorajIcon name="sieve" className="size-6" />}
              counter={`Siatki: ${round} / ${WEAVE_ROUNDS.length}`}
              hint={hint}
            >
              <div className="mt-2 flex items-center gap-2">
                <BeatDot key={beat.start} beat={beat} />
                <span className="font-display text-xs font-semibold text-[#8a5a2b]">
                  {current.name}:
                </span>
                <ol aria-label="Wzór" className="flex flex-wrap gap-1">
                  {current.pattern.map((side, index) => (
                    <li
                      key={index}
                      className={`flex size-7 items-center justify-center rounded-md border text-sm font-bold ${index < position ? 'border-[#1f5c50] bg-[#cfe3d6] text-[#1f5c50]' : index === position ? 'border-[#c8402f] bg-[#ffe7a3] text-[#4a2f1a] shadow-[0_0_0_2px_rgba(200,64,47,0.5)]' : 'border-[#b8894f] bg-[#fbf0d6] text-[#6b4a2e]'}`}
                    >
                      {side === 'L' ? '◀' : '▶'}
                    </li>
                  ))}
                </ol>
              </div>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
