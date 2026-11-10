'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { BOG_HINTS, PLANT_IDS, PLANTS } from '@/content/poleski-park-narodowy'
import type { PlantId } from '@/content/poleski-park-narodowy'
import { shuffled } from '@/lib/shuffle'
import { BogBackdrop } from '@/levels/poleski-park-narodowy/art/BogBackdrop'
import { PlantArt } from '@/levels/poleski-park-narodowy/art/PlantArt'
import type { PlantKind } from '@/levels/poleski-park-narodowy/art/PlantArt'
import { PoleskiIcon } from '@/levels/poleski-park-narodowy/art/PoleskiIcon'
import type { SceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'

const REVEAL_MS = 1300
const SHAKE_MS = 450

const WIDE_SPOTS = [
  [0.1, 0.3],
  [0.42, 0.2],
  [0.76, 0.32],
  [0.2, 0.82],
  [0.55, 0.7],
  [0.88, 0.84],
] as const

const TALL_SPOTS = [
  [0.24, 0.18],
  [0.76, 0.26],
  [0.22, 0.52],
  [0.78, 0.6],
  [0.26, 0.88],
  [0.74, 0.94],
] as const

const KINDS: readonly PlantKind[] = [...PLANT_IDS, 'sedge', 'sedge']

type BogStageProps = {
  layout: SceneLayout
  playing: boolean
  onFound: (plant: PlantId, count: number) => void
}

function plant(id: PlantId) {
  return PLANTS.find((entry) => entry.id === id) ?? PLANTS[0]
}

function plantLabel(kind: PlantKind, index: number) {
  return kind === 'sedge' ? `Kępa turzycy ${index + 1}` : plant(kind).name
}

export function BogStage({ layout, playing, onFound }: BogStageProps) {
  const { world, unit, horizon, portrait } = layout
  const [order] = useState(() => shuffled(PLANT_IDS))
  const [kinds] = useState(() => shuffled(KINDS))
  const [found, setFound] = useState<PlantId[]>([])
  const [revealing, setRevealing] = useState<PlantId | null>(null)
  const [shaking, setShaking] = useState<number | null>(null)
  const [hint, setHint] = useState<string>(BOG_HINTS.start)
  const backdrop = useMemo(() => <BogBackdrop layout={layout} />, [layout])
  const target = order[Math.min(found.length, order.length - 1)]
  const top = horizon + 90 * unit
  const bottom = world.height - 30 * unit
  const margin = world.width * 0.08
  const spots = (portrait ? TALL_SPOTS : WIDE_SPOTS).map(([u, v]) => ({
    x: margin + u * (world.width - margin * 2),
    y: top + v * (bottom - top),
  }))

  useEffect(() => {
    if (shaking === null) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  useEffect(() => {
    if (!revealing) return
    const timer = setTimeout(() => {
      setRevealing(null)
      onFound(revealing, found.length)
    }, REVEAL_MS)
    return () => clearTimeout(timer)
  }, [revealing, found.length, onFound])

  function pick(kind: PlantKind, index: number) {
    if (!playing || revealing) return
    if (kind !== 'sedge' && found.includes(kind)) return
    if (kind !== target) {
      setShaking(index)
      setHint(BOG_HINTS.wrong)
      return
    }
    setFound((current) => [...current, target])
    setRevealing(target)
    setHint(BOG_HINTS.good)
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {kinds.map((kind, index) => {
          const spot = spots[index]
          const done = kind !== 'sedge' && found.includes(kind)
          return (
            <g key={index} transform={`translate(${spot.x} ${spot.y})`}>
              <motion.g
                role="button"
                tabIndex={0}
                aria-label={plantLabel(kind, index)}
                data-plant={kind}
                className="cursor-pointer outline-none"
                animate={shaking === index ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                onClick={() => pick(kind, index)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  pick(kind, index)
                }}
              >
                <g transform={`scale(${unit * 2})`}>
                  <rect x={-70} y={-100} width={140} height={120} fill="transparent" />
                  {done && (
                    <ellipse
                      cx={0}
                      cy={-20}
                      rx={74}
                      ry={56}
                      fill="#fff4b0"
                      opacity={0.45}
                      className={revealing === kind ? 'zw-pulse' : undefined}
                    />
                  )}
                  <PlantArt kind={kind} active={revealing === kind} />
                </g>
              </motion.g>
              {done && (
                <g transform={`translate(0 ${34 * unit})`} pointerEvents="none">
                  <rect
                    x={-110 * unit}
                    y={-16 * unit}
                    width={220 * unit}
                    height={30 * unit}
                    rx={8 * unit}
                    fill="#fbf0d6"
                    stroke="#b8894f"
                    strokeWidth={2}
                  />
                  <text
                    y={6 * unit}
                    textAnchor="middle"
                    fontSize={18 * unit}
                    fontWeight={700}
                    fill="#4a2f1a"
                    fontFamily="var(--font-alegreya), Georgia, serif"
                  >
                    {plant(kind).name}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="bog-panel"
            aria-label="Torfowisko w południe"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Torfowisko w południe"
              icon={<PoleskiIcon name="leaf" className="size-6" />}
              counter={`Rośliny: ${found.length} / ${PLANT_IDS.length}`}
              hint={hint}
            >
              <p className="mt-2 text-sm text-[#5a4630] italic sm:text-base">
                „{plant(revealing ?? target).riddle}”
              </p>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
