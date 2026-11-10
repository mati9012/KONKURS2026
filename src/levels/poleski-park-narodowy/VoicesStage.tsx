'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { BIRD_IDS, BIRD_NAMES, VOICE_HINTS, VOICES } from '@/content/poleski-park-narodowy'
import type { BirdId } from '@/content/poleski-park-narodowy'
import { playMarshCall } from '@/lib/audio/marsh-calls'
import { shuffled } from '@/lib/shuffle'
import { BirdArt } from '@/levels/poleski-park-narodowy/art/BirdArt'
import { BirdIcon } from '@/levels/poleski-park-narodowy/art/BirdIcon'
import { CraneFlock } from '@/levels/poleski-park-narodowy/art/CraneFlock'
import { DuskBackdrop } from '@/levels/poleski-park-narodowy/art/DuskBackdrop'
import { PoleskiIcon } from '@/levels/poleski-park-narodowy/art/PoleskiIcon'
import type { SceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'
import { voicePerch } from '@/levels/poleski-park-narodowy/voice-perches'
import { useGameStore } from '@/store/game-store'

const REVEAL_MS = 1400

type VoicesStageProps = {
  layout: SceneLayout
  playing: boolean
  finale: boolean
  onFound: (bird: BirdId, count: number) => void
}

export function VoicesStage({ layout, playing, finale, onFound }: VoicesStageProps) {
  const { world, unit, horizon } = layout
  const volume = useGameStore((state) => state.settings.sfxVolume)
  const [choices] = useState(() => shuffled(BIRD_IDS))
  const [found, setFound] = useState<BirdId[]>([])
  const [revealing, setRevealing] = useState<BirdId | null>(null)
  const [wrong, setWrong] = useState<BirdId | null>(null)
  const [hint, setHint] = useState<string>(VOICE_HINTS.listen)
  const backdrop = useMemo(() => <DuskBackdrop layout={layout} />, [layout])
  const voice = VOICES[Math.min(found.length, VOICES.length - 1)]
  const call = voice.bird
  const origin = voicePerch(voice.bird, layout)
  const listening = playing && !revealing && found.length < VOICES.length

  useEffect(() => {
    if (!listening) return
    playMarshCall(call, volume)
  }, [listening, call, volume])

  useEffect(() => {
    if (!revealing) return
    const timer = setTimeout(() => {
      setRevealing(null)
      onFound(revealing, found.length)
    }, REVEAL_MS)
    return () => clearTimeout(timer)
  }, [revealing, found.length, onFound])

  function answer(bird: BirdId) {
    if (!listening) return
    if (bird !== voice.bird) {
      setWrong(bird)
      setHint(VOICE_HINTS.wrong)
      return
    }
    setWrong(null)
    setFound((current) => [...current, bird])
    setRevealing(bird)
    setHint(VOICE_HINTS.good)
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {listening && (
          <g transform={`translate(${origin.x} ${origin.y - 60 * unit})`} pointerEvents="none">
            {[0, 1, 2].map((ring) => (
              <circle
                key={ring}
                r={40 * unit}
                fill="none"
                stroke="#ffe8b0"
                strokeWidth={4 * unit}
                className="pl-ripple"
                style={{ animationDelay: `${ring * 0.5}s` }}
              />
            ))}
          </g>
        )}
        {found.map((bird) => {
          const perch = voicePerch(bird, layout)
          return (
            <motion.g
              key={bird}
              data-bird={bird}
              initial={{ opacity: 0, y: 30 * unit }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              pointerEvents="none"
            >
              <g transform={`translate(${perch.x} ${perch.y}) scale(${unit * 1.4})`}>
                <BirdArt bird={bird} />
              </g>
            </motion.g>
          )
        })}
        {finale && <CraneFlock x={world.width * 0.1} y={horizon * 0.5} scale={unit * 1.3} />}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="voices-panel"
            aria-label="Głosy mokradeł"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Wieczór: głosy mokradeł"
              icon={<PoleskiIcon name="note" className="size-6" />}
              counter={`Ptaki: ${found.length} / ${VOICES.length}`}
              hint={hint}
            >
              <p className="mt-2 text-sm text-[#5a4630] italic sm:text-base">„{voice.clue}”</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-full border-2 border-[#1f5c50] bg-[#e3efe0] px-3 py-1 font-display text-sm font-bold text-[#1f3f36] hover:bg-[#eef6ec]"
                  onClick={() => playMarshCall(call, volume)}
                >
                  Posłuchaj jeszcze raz
                </button>
                {choices.map((bird) => (
                  <motion.button
                    key={bird}
                    type="button"
                    data-choice={bird}
                    disabled={found.includes(bird)}
                    animate={wrong === bird ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                    className="flex items-center gap-1 rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] py-0.5 pr-3 pl-1 font-display text-sm font-bold text-[#4a2f1a] hover:bg-[#fff6e2] disabled:opacity-40"
                    onClick={() => answer(bird)}
                  >
                    <BirdIcon bird={bird} className="size-8" />
                    {BIRD_NAMES[bird]}
                  </motion.button>
                ))}
              </div>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
