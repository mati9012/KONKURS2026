'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { FOREST_FINDS, FOREST_HINTS, TREE_NAMES } from '@/content/roztocze'
import type { TreeId } from '@/content/roztocze'
import { DawnBackdrop } from '@/levels/roztocze/art/DawnBackdrop'
import { FindItem } from '@/levels/roztocze/art/FindItem'
import { ForestTree } from '@/levels/roztocze/art/ForestTree'
import { RoztoczeIcon } from '@/levels/roztocze/art/RoztoczeIcon'
import type { SceneLayout } from '@/levels/roztocze/scene-layout'

const SOLVE_MS = 1300
const SHAKE_MS = 450
const FIND_TOTAL = FOREST_FINDS.length

const HILL_ORDER: readonly TreeId[] = ['spruce', 'beech', 'yew', 'fir', 'sycamore']
const WIDE_SPOTS = [
  [0.11, 150],
  [0.3, 80],
  [0.5, 60],
  [0.7, 80],
  [0.89, 140],
] as const
const TALL_SPOTS = [
  [0.18, 60],
  [0.5, 0],
  [0.82, 40],
  [0.32, 300],
  [0.7, 320],
] as const

type ForestStageProps = {
  layout: SceneLayout
  playing: boolean
  finale: boolean
  onSolved: (count: number) => void
}

export function ForestStage({ layout, playing, finale, onSolved }: ForestStageProps) {
  const { world, unit, portrait } = layout
  const [solved, setSolved] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const [hint, setHint] = useState<string>(FOREST_HINTS.start)
  const [shaking, setShaking] = useState<TreeId | null>(null)
  const [glowing, setGlowing] = useState<TreeId | null>(null)
  const hill = layout.horizon + 150 * unit
  const progress = finale ? 1 : solved / FIND_TOTAL
  const find = FOREST_FINDS[Math.min(solved, FIND_TOTAL - 1)]
  const scale = unit * (portrait ? 1.1 : 1.15)
  const trees = useMemo(
    () =>
      HILL_ORDER.map((tree, index) => {
        const [u, offset] = (portrait ? TALL_SPOTS : WIDE_SPOTS)[index]
        return { tree, x: world.width * u, y: hill + offset * unit }
      }).sort((a, b) => a.y - b.y),
    [world.width, hill, unit, portrait],
  )
  const backdrop = useMemo(
    () => <DawnBackdrop layout={layout} progress={progress} hill={hill} />,
    [layout, progress, hill],
  )

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function choose(tree: TreeId) {
    if (!playing || waiting) return
    if (tree !== find.tree) {
      setShaking(tree)
      setHint(find.wrong)
      return
    }
    const count = solved + 1
    setWaiting(true)
    setGlowing(tree)
    setHint(FOREST_HINTS.right)
    setTimeout(() => {
      setSolved(count)
      setGlowing(null)
      setWaiting(false)
      setHint(FOREST_HINTS.start)
      onSolved(count)
    }, SOLVE_MS)
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        {trees.map(({ tree, x, y }) => (
          <g key={tree} transform={`translate(${x} ${y})`}>
            <motion.g
              animate={shaking === tree ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <g
                role="button"
                tabIndex={0}
                aria-label={TREE_NAMES[tree]}
                data-tree={tree}
                className="cursor-pointer outline-none"
                transform={`scale(${scale})`}
                onClick={() => choose(tree)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  choose(tree)
                }}
              >
                {glowing === tree && (
                  <ellipse
                    cx={0}
                    cy={-150}
                    rx={150}
                    ry={190}
                    fill="#fff2b0"
                    opacity={0.55}
                    className="zw-pulse"
                  />
                )}
                <rect x={-110} y={-320} width={220} height={330} fill="transparent" />
                <ForestTree tree={tree} />
              </g>
            </motion.g>
          </g>
        ))}
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="forest-panel"
            aria-label="Bukowa Góra"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Bukowa Góra"
              icon={<RoztoczeIcon name="leaf" className="size-6" />}
              counter={`Drzewa: ${solved} / ${FIND_TOTAL}`}
              hint={hint}
            >
              <div className="mt-2 flex items-center gap-3">
                <FindItem
                  tree={find.tree}
                  className="size-14 shrink-0 rounded-xl bg-[#fbf0d6] p-1 shadow-inner"
                />
                <div>
                  <p className="font-display text-sm font-bold text-[#4a2f1a]">{find.item}</p>
                  <p className="text-sm text-[#5a4630] italic">{find.clue}</p>
                </div>
              </div>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
