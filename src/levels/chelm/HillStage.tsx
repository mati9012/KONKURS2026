'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { HILL_HINTS, HILL_ROUNDS } from '@/content/chelm'
import type { HillPageId } from '@/content/chelm'
import { HillScene, hillGeometry } from '@/levels/chelm/art/HillScene'
import type { SceneLayout } from '@/levels/chelm/scene-layout'
import { GoatSprite } from '@/levels/zwierzyniec/art/GoatSprite'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const FINISH_MS = 3200

type HillStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

export function HillStage({ layout, round, playing, onRound }: HillStageProps) {
  const { world, unit, portrait } = layout
  const plan = HILL_ROUNDS[Math.min(round, HILL_ROUNDS.length - 1)]
  const [deck] = useState(() => shuffled(plan.pages))
  const [placed, setPlaced] = useState<HillPageId[]>([])
  const [shaking, setShaking] = useState<HillPageId | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const geometry = useMemo(() => hillGeometry(layout), [layout])
  const earlier = HILL_ROUNDS.slice(0, round).flatMap((entry) => entry.pages.map((page) => page.id))
  const builtKey = [...earlier, ...placed].join(',')
  const scene = useMemo(() => {
    const built = builtKey.split(',')
    return <HillScene layout={layout} geometry={geometry} built={(page) => built.includes(page)} />
  }, [layout, geometry, builtKey])
  const done = placed.length >= plan.pages.length
  const next = done ? null : plan.pages[placed.length]
  const step = Math.min(round * plan.pages.length + placed.length, geometry.waypoints.length - 1)
  const goat = geometry.waypoints[step]
  const previous = geometry.waypoints[Math.max(step - 1, 0)]
  const facing = step > 0 && goat.x < previous.x ? -1 : 1
  const goatScale = unit * (portrait ? 1.5 : 1.25)

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

  function choose(page: HillPageId) {
    if (!playing || !next || placed.includes(page)) return
    if (page !== next.id) {
      setShaking(page)
      setMessage(HILL_HINTS.wrong)
      return
    }
    setPlaced([...placed, page])
    setMessage(next.fact)
  }

  return (
    <div className="absolute inset-0 select-none" data-hill data-step={step}>
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        {scene}
        <motion.g
          initial={false}
          animate={{ x: goat.x, y: goat.y }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        >
          <g transform={`scale(${goatScale * facing} ${goatScale})`}>
            <GoatSprite />
          </g>
        </motion.g>
      </svg>

      <AnimatePresence>
        {playing && !done && (
          <motion.div
            key={`pages-${round}`}
            className="absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-2 px-3 sm:bottom-5 sm:gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {deck
              .filter((page) => !placed.includes(page.id))
              .map((page) => (
                <motion.button
                  key={page.id}
                  type="button"
                  data-page={page.id}
                  className="max-w-56 rounded-xl border-2 border-[#7a4e28] bg-[#fbf0d6] px-3 py-2 text-left font-display text-sm leading-tight font-bold text-[#4a2f1a] shadow-lg hover:bg-[#fff6e2] sm:text-base"
                  animate={shaking === page.id ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => choose(page.id)}
                >
                  <span aria-hidden="true" className="mr-1.5">
                    📜
                  </span>
                  {page.label}
                </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="hill-panel"
            aria-label="Góra Chełmska"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">📜</span>}
              counter={`Kartki: ${placed.length} / ${plan.pages.length}`}
              hint={message ?? 'Która kartka pasuje do wskazówki?'}
            >
              {next && (
                <p className="mt-2 text-sm font-bold text-[#5a4630] sm:text-base">
                  Wskazówka: {next.clue}
                </p>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
