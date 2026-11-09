'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PAPER_GRAIN, PARCHMENT_FILL, PARCHMENT_SHADOW } from '@/components/ui/parchment'
import { DIRECTION_NAMES, HEJNAL_DIRECTIONS, HEJNAL_WEST_WARNING } from '@/content/zamosc'
import type { HejnalDirection } from '@/content/zamosc'
import { playTrumpetNote } from '@/lib/audio/trumpet'
import { useGameStore } from '@/store/game-store'

const BEATS = [0, 1, 2, 3, 4.5, 5, 6, 7]
const MELODY = [349.2, 440, 523.3, 523.3, 440, 523.3, 698.5, 523.3]
const BEAT_SECONDS = 0.5
const LEAD_IN_SECONDS = 2
const TRAVEL_SECONDS = 2
const HIT_WINDOW_SECONDS = 0.18
const ROUND_TAIL_SECONDS = 0.6
const HITS_TO_PASS = 5
const REQUIRED: readonly HejnalDirection[] = ['north', 'east', 'south']

type Round = {
  direction: HejnalDirection
  startedAt: number
}

type HejnalPanelProps = {
  onFace: (direction: HejnalDirection) => void
  onRoundChange: (active: boolean) => void
  onBlow: () => void
  onComplete: () => void
}

function clockSeconds() {
  return performance.now() / 1000
}

function noteTime(index: number) {
  return LEAD_IN_SECONDS + BEATS[index] * BEAT_SECONDS
}

const ROUND_END = noteTime(BEATS.length - 1) + ROUND_TAIL_SECONDS

function closestNote(time: number, hit: readonly number[]) {
  let best = -1
  let bestGap = HIT_WINDOW_SECONDS
  BEATS.forEach((_, index) => {
    const gap = Math.abs(noteTime(index) - time)
    if (!hit.includes(index) && gap <= bestGap) {
      best = index
      bestGap = gap
    }
  })
  return best
}

export function HejnalPanel({ onFace, onRoundChange, onBlow, onComplete }: HejnalPanelProps) {
  const volume = useGameStore((state) => state.settings.sfxVolume)
  const [played, setPlayed] = useState<HejnalDirection[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [hit, setHit] = useState<number[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [message, setMessage] = useState('Wybierzcie stronę świata, w którą zagra trębacz.')
  const hitRef = useRef<number[]>([])
  const playedRef = useRef<HejnalDirection[]>([])

  const endRound = useCallback((direction: HejnalDirection) => {
    const hits = hitRef.current.length
    setRound(null)
    if (hits < HITS_TO_PASS) {
      setMessage(
        `Trębacz zafałszował (${hits} z ${BEATS.length} nut). Spróbujcie jeszcze raz w tę samą stronę.`,
      )
      return
    }
    const next = [...playedRef.current, direction]
    playedRef.current = next
    setPlayed(next)
    setMessage(
      REQUIRED.every((required) => next.includes(required))
        ? 'Hejnał popłynął na trzy strony świata!'
        : `Brawo, hejnał zabrzmiał na ${DIRECTION_NAMES[direction].toLowerCase()}! Wybierzcie kolejną stronę.`,
    )
  }, [])

  useEffect(() => {
    if (REQUIRED.every((direction) => played.includes(direction))) onComplete()
  }, [played, onComplete])

  useEffect(() => onRoundChange(round !== null), [round, onRoundChange])

  useEffect(() => {
    if (!round) return
    let frame = 0
    const tick = () => {
      const time = clockSeconds() - round.startedAt
      setElapsed(time)
      if (time > ROUND_END) {
        endRound(round.direction)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [round, endRound])

  const blow = useCallback(() => {
    if (!round) return
    const best = closestNote(clockSeconds() - round.startedAt, hitRef.current)
    if (best < 0) return
    playTrumpetNote(MELODY[best], volume)
    hitRef.current = [...hitRef.current, best]
    setHit(hitRef.current)
    onBlow()
  }, [round, volume, onBlow])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      if (!round) return
      event.preventDefault()
      blow()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [blow, round])

  function choose(direction: HejnalDirection) {
    if (round) return
    onFace(direction)
    if (direction === 'west') {
      setMessage(HEJNAL_WEST_WARNING.text)
      return
    }
    if (played.includes(direction)) {
      setMessage('Tę stronę świata już obdzieliliście hejnałem. Wybierzcie inną.')
      return
    }
    setMessage('Dmijcie, gdy nuta dotknie złotego kręgu! Spacja, Enter albo przycisk „Dmij”.')
    hitRef.current = []
    setHit([])
    setElapsed(0)
    setRound({ direction, startedAt: clockSeconds() })
  }

  return (
    <motion.section
      aria-label="Hejnał z wieży ratusza"
      className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl px-4 pt-4 pb-4 sm:px-6"
        style={{
          backgroundImage: `${PAPER_GRAIN}, ${PARCHMENT_FILL}`,
          boxShadow: `${PARCHMENT_SHADOW}, 0 18px 40px rgba(40, 25, 70, 0.35)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-[#4a2f1a] sm:text-2xl">Hejnał</h2>
          <p className="font-display text-sm font-semibold text-[#6b4a2e]">
            Zagrane strony: {played.length} / {REQUIRED.length}
          </p>
        </div>
        <p
          aria-live="polite"
          className="mt-2 min-h-[2.5rem] text-sm font-semibold text-[#3d4f3a] sm:text-base"
        >
          <span className="font-display font-bold text-[#1f5c50]">Szaro: </span>
          {message}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {HEJNAL_DIRECTIONS.map((direction) => {
            const done = played.includes(direction)
            return (
              <button
                key={direction}
                type="button"
                disabled={Boolean(round)}
                aria-pressed={round?.direction === direction}
                className={`rounded-xl border-2 px-2 py-2 font-display text-sm font-bold transition disabled:opacity-60 sm:text-base ${done ? 'border-[#1f5c50] bg-[#1f5c50] text-[#f6e7c8]' : 'border-[#b8894f] bg-[#fbf0d6] text-[#4a2f1a] hover:bg-[#fff6e2]'}`}
                onClick={() => choose(direction)}
              >
                {done && <span aria-hidden="true">✓ </span>}
                {DIRECTION_NAMES[direction]}
              </button>
            )
          })}
        </div>
        <AnimatePresence>
          {round && (
            <motion.div
              className="mt-4 flex items-center gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div
                className="relative h-14 flex-1 touch-none overflow-hidden rounded-full bg-[#4a2f1a]/15"
                onPointerDown={blow}
              >
                <div className="absolute top-1/2 left-6 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#d9a441] bg-[#ffe8a8]/40" />
                {BEATS.map((_, index) => {
                  const left = (noteTime(index) - elapsed) / TRAVEL_SECONDS
                  if (left > 1.05 || left < -0.2 || hit.includes(index)) return null
                  const missed = elapsed > noteTime(index) + HIT_WINDOW_SECONDS
                  return (
                    <span
                      key={index}
                      className={`absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${missed ? 'border-[#8a5a2b]/40 bg-[#8a5a2b]/20' : 'border-[#7a4a12] bg-[#d9a441]'}`}
                      style={{ left: `calc(1.5rem + ${left} * (100% - 2rem))` }}
                    />
                  )
                })}
              </div>
              <button
                type="button"
                className="rounded-full bg-[#1f5c50] px-5 py-3 font-display text-base font-bold text-[#f6e7c8] shadow active:scale-95"
                onPointerDown={blow}
              >
                Dmij!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
