'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { PARK_BUILDING_IDS, PARK_HINTS, PARK_RIDDLES } from '@/content/pulawy'
import type { ParkBuildingId } from '@/content/pulawy'
import { ParkBackdrop } from '@/levels/pulawy/art/ParkBackdrop'
import { ParkBuildingArt } from '@/levels/pulawy/art/ParkBuildingArt'
import type { SceneLayout } from '@/levels/pulawy/scene-layout'
import { shuffled } from '@/lib/shuffle'

const REVEAL_MS = 1300
const SHAKE_MS = 450
const INK = '#2a1e16'

type ParkStageProps = {
  layout: SceneLayout
  playing: boolean
  onFound: (building: ParkBuildingId, count: number) => void
}

function riddle(id: ParkBuildingId) {
  return PARK_RIDDLES.find((entry) => entry.building === id) ?? PARK_RIDDLES[0]
}

function buildingSpots(layout: SceneLayout) {
  const { world, unit, ground, portrait } = layout
  if (portrait) {
    const scale = Math.min(unit * 0.95, (world.width / 3) * 0.0036)
    return [0, 1, 2, 3, 4, 5].map((index) => ({
      x: world.width * [0.18, 0.5, 0.82][index % 3],
      y: index < 3 ? ground - 250 * unit : ground + 40 * unit,
      scale,
    }))
  }
  const scale = Math.min(unit * 0.95, (world.width / 6) * 0.0038)
  return [0, 1, 2, 3, 4, 5].map((index) => ({
    x: world.width * (0.09 + index * 0.164),
    y: ground + (index % 2 === 0 ? 10 : 70) * unit,
    scale,
  }))
}

export function ParkStage({ layout, playing, onFound }: ParkStageProps) {
  const { unit } = layout
  const [order] = useState(() => shuffled(PARK_BUILDING_IDS))
  const [placement] = useState(() => shuffled(PARK_BUILDING_IDS))
  const [found, setFound] = useState<ParkBuildingId[]>([])
  const [revealing, setRevealing] = useState<ParkBuildingId | null>(null)
  const [shaking, setShaking] = useState<ParkBuildingId | null>(null)
  const [hint, setHint] = useState<string>(PARK_HINTS.start)
  const backdrop = useMemo(() => <ParkBackdrop layout={layout} />, [layout])
  const spots = buildingSpots(layout)
  const target = order[Math.min(found.length, order.length - 1)]
  const drawOrder = placement
    .map((id, index) => ({ id, spot: spots[index], index }))
    .sort((a, b) => a.spot.y - b.spot.y)

  useEffect(() => {
    if (!shaking) return
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

  function pick(id: ParkBuildingId) {
    if (!playing || revealing || found.includes(id)) return
    if (id !== target) {
      setShaking(id)
      setHint(PARK_HINTS.wrong)
      return
    }
    setFound((current) => [...current, id])
    setRevealing(id)
    setHint(`${PARK_HINTS.good} ${riddle(id).name}.`)
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${layout.world.width} ${layout.world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {drawOrder.map(({ id, spot, index }) => {
          const done = found.includes(id)
          return (
            <g key={id} transform={`translate(${spot.x} ${spot.y})`}>
              <motion.g
                role="button"
                tabIndex={0}
                aria-label={done ? riddle(id).name : `Budowla ${index + 1}`}
                data-building={id}
                className="cursor-pointer outline-none"
                animate={shaking === id ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                onClick={() => pick(id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  pick(id)
                }}
              >
                <g transform={`scale(${spot.scale})`}>
                  <rect x={-130} y={-240} width={260} height={250} fill="transparent" />
                  {done && (
                    <ellipse
                      cx={0}
                      cy={-90}
                      rx={140}
                      ry={120}
                      fill="#fff4b0"
                      opacity={0.4}
                      className={revealing === id ? 'zw-pulse' : undefined}
                    />
                  )}
                  <ellipse cx={0} cy={4} rx={120} ry={14} fill="#4a6a3a" opacity={0.3} />
                  <g filter={PAINT}>
                    <ParkBuildingArt building={id} />
                  </g>
                </g>
              </motion.g>
              {done && (
                <g pointerEvents="none">
                  {revealing === id && (
                    <motion.g
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -60 * unit, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <g transform={`translate(0 ${-180 * spot.scale})`}>
                        <rect
                          x={-26 * unit}
                          y={-18 * unit}
                          width={52 * unit}
                          height={34 * unit}
                          rx={5 * unit}
                          fill="#a8642a"
                          stroke={INK}
                          strokeWidth={2}
                        />
                        <path
                          d={`M${-26 * unit} ${-4 * unit}H${26 * unit}`}
                          stroke="#d8a83a"
                          strokeWidth={4 * unit}
                        />
                        <circle r={5 * unit} cy={-4 * unit} fill="#f4d47a" stroke={INK} />
                      </g>
                    </motion.g>
                  )}
                  <g transform={`translate(0 ${30 * unit})`}>
                    <rect
                      x={-100 * unit}
                      y={-15 * unit}
                      width={200 * unit}
                      height={28 * unit}
                      rx={8 * unit}
                      fill="#fbf0d6"
                      stroke="#b8894f"
                      strokeWidth={2}
                    />
                    <text
                      y={5 * unit}
                      textAnchor="middle"
                      fontSize={17 * unit}
                      fontWeight={700}
                      fill="#4a2f1a"
                      fontFamily="var(--font-alegreya), Georgia, serif"
                    >
                      {riddle(id).name}
                    </text>
                  </g>
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="park-panel"
            aria-label="Park romantyczny"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Park romantyczny"
              icon={<span aria-hidden="true">🗝️</span>}
              counter={`Skarby: ${found.length} / ${PARK_BUILDING_IDS.length}`}
              hint={hint}
            >
              <p className="mt-2 text-sm text-[#5a4630] italic sm:text-base">
                „{riddle(revealing ?? target).riddle}”
              </p>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
