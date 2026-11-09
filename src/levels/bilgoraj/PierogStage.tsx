'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { INGREDIENT_NAMES, OVEN, PIEROG_HINTS, RECIPE } from '@/content/bilgoraj'
import type { IngredientId } from '@/content/bilgoraj'
import { BilgorajIcon } from '@/levels/bilgoraj/art/BilgorajIcon'
import { IngredientIcon } from '@/levels/bilgoraj/art/IngredientIcon'
import { KitchenBackdrop } from '@/levels/bilgoraj/art/KitchenBackdrop'
import { PierogTin } from '@/levels/bilgoraj/art/PierogTin'
import type { Crust } from '@/levels/bilgoraj/art/PierogTin'
import type { RoomLayout } from '@/levels/bilgoraj/room-layout'

export type PierogStep = 'filling' | 'crust' | 'baked'

const SHELF: readonly IngredientId[] = [
  'sugar',
  'potatoes',
  'jam',
  'quark',
  'kasza',
  'carrot',
  'eggs',
  'cream',
  'mint',
]
const BAKE_MS = 2600
const DRAG_THRESHOLD = 8
const SHAKE_MS = 450

type Drag = {
  id: IngredientId
  startX: number
  startY: number
  x: number
  y: number
  moved: boolean
}

type PierogStageProps = {
  layout: RoomLayout
  playing: boolean
  onStep: (step: PierogStep) => void
}

function overTin(x: number, y: number) {
  return document.elementsFromPoint(x, y).some((element) => element.closest('[data-drop]'))
}

export function PierogStage({ layout, playing, onStep }: PierogStageProps) {
  const { world, unit, floor, portrait } = layout
  const [added, setAdded] = useState<IngredientId[]>([])
  const [rejected, setRejected] = useState<IngredientId[]>([])
  const [crust, setCrust] = useState<Crust | null>(null)
  const [temp, setTemp] = useState(140)
  const [baking, setBaking] = useState(false)
  const [baked, setBaked] = useState(false)
  const [hint, setHint] = useState<string>(PIEROG_HINTS.start)
  const [selected, setSelected] = useState<IngredientId | null>(null)
  const [shaking, setShaking] = useState<IngredientId | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [hovering, setHovering] = useState(false)
  const dragging = useRef<Drag | null>(null)
  const filled = added.length === RECIPE.length
  const phase = !filled ? 'fill' : crust === null ? 'crust' : baked ? 'done' : 'oven'
  const backdrop = useMemo(
    () => <KitchenBackdrop layout={layout} fire={baking ? 1 : 0.35} />,
    [layout, baking],
  )
  const tableY = floor + 20 * unit
  const tin = {
    x: world.width * (portrait ? 0.4 : 0.42),
    y: tableY + 90 * unit,
    w: 320 * unit,
    h: 150 * unit,
  }
  const oven = { x: world.width * (portrait ? 0.7 : 0.82), y: floor - 90 * unit }

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function drop(id: IngredientId) {
    if (!playing || phase !== 'fill' || added.includes(id)) return
    setSelected(null)
    if (!RECIPE.includes(id)) {
      setShaking(id)
      setRejected((current) => [...current, id])
      setHint(PIEROG_HINTS.devil)
      return
    }
    const next = [...added, id]
    setAdded(next)
    setHint(PIEROG_HINTS.good)
    if (next.length === RECIPE.length) {
      setHint(PIEROG_HINTS.crust)
      onStep('filling')
    }
  }

  function chooseCrust(kind: Crust) {
    if (!playing || phase !== 'crust') return
    setCrust(kind)
    setHint(PIEROG_HINTS.oven)
    onStep('crust')
  }

  function bake() {
    if (!playing || phase !== 'oven' || baking) return
    if (temp < OVEN.from) {
      setHint(PIEROG_HINTS.cold)
      return
    }
    if (temp > OVEN.to) {
      setHint(PIEROG_HINTS.hot)
      return
    }
    setBaking(true)
    setHint(PIEROG_HINTS.baking)
    setTimeout(() => {
      setBaking(false)
      setBaked(true)
      onStep('baked')
    }, BAKE_MS)
  }

  function startDrag(id: IngredientId, event: ReactPointerEvent<HTMLButtonElement>) {
    if (!playing || phase !== 'fill') return
    event.currentTarget.setPointerCapture(event.pointerId)
    const { clientX: x, clientY: y } = event
    dragging.current = { id, startX: x, startY: y, x, y, moved: false }
    setDrag(dragging.current)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const current = dragging.current
    if (!current) return
    const { clientX: x, clientY: y } = event
    const moved =
      current.moved || Math.hypot(x - current.startX, y - current.startY) > DRAG_THRESHOLD
    dragging.current = { ...current, x, y, moved }
    setDrag(dragging.current)
    setHovering(moved && overTin(x, y))
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const current = dragging.current
    dragging.current = null
    setDrag(null)
    setHovering(false)
    if (!current) return
    if (!current.moved) {
      setSelected((chosen) => (chosen === current.id ? null : current.id))
      return
    }
    if (overTin(event.clientX, event.clientY)) drop(current.id)
  }

  const shelf = SHELF.filter((id) => !added.includes(id) && !rejected.includes(id))

  return (
    <div
      className="absolute inset-0"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={() => {
        dragging.current = null
        setDrag(null)
        setHovering(false)
      }}
    >
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        <motion.g
          animate={
            baking
              ? { x: oven.x - tin.x, y: oven.y - tin.y, scale: 0.55, opacity: 0.4 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ originX: `${tin.x}px`, originY: `${tin.y}px` }}
        >
          <g
            role="button"
            tabIndex={0}
            aria-label="Blaszka na pieróg"
            data-drop
            className="cursor-pointer outline-none"
            transform={`translate(${tin.x} ${tin.y})`}
            onClick={() => {
              if (selected) drop(selected)
            }}
            onKeyDown={(event) => {
              if ((event.key === 'Enter' || event.key === ' ') && selected) {
                event.preventDefault()
                drop(selected)
              }
            }}
          >
            {phase === 'fill' && (selected || drag?.moved) && (
              <rect
                x={-tin.w * 0.62}
                y={-tin.h * 0.7}
                width={tin.w * 1.24}
                height={tin.h * 1.5}
                rx={20}
                fill="#ffe7a3"
                opacity={hovering ? 0.55 : 0.3}
                className="zw-pulse"
              />
            )}
            <PierogTin width={tin.w} height={tin.h} added={added} crust={crust} baked={baked} />
          </g>
        </motion.g>
      </svg>

      {drag?.moved && (
        <div
          className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-3/4"
          style={{ left: drag.x, top: drag.y }}
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: hovering ? 1.15 : 1, rotate: hovering ? 0 : -6 }}
            className="rounded-2xl border-2 border-[#b8894f] bg-[#fbf0d6]/90 p-1.5 shadow-[0_14px_30px_rgba(40,25,20,0.35)]"
          >
            <IngredientIcon id={drag.id} className="size-16" />
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {playing && phase === 'fill' && (
          <motion.div
            key="shelf"
            aria-label="Spiżarnia"
            role="group"
            className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <AnimatePresence>
              {shelf.map((id) => (
                <motion.button
                  key={id}
                  type="button"
                  layout
                  aria-label={INGREDIENT_NAMES[id]}
                  aria-pressed={selected === id}
                  data-ingredient={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    shaking === id
                      ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
                      : {
                          opacity: drag?.moved && drag.id === id ? 0.35 : 1,
                          y: selected === id ? -8 : 0,
                          x: 0,
                        }
                  }
                  exit={{ opacity: 0, scale: 0.6 }}
                  className={`flex w-[5.2rem] cursor-grab touch-none flex-col items-center gap-0.5 rounded-xl border-2 px-1 pt-1 pb-1 font-display text-[0.7rem] leading-tight font-bold shadow-md select-none sm:w-24 sm:text-sm ${selected === id ? 'border-[#1f5c50] bg-[#e3efe0] text-[#1f3f36]' : 'border-[#b8894f] bg-[#fbf0d6] text-[#4a2f1a] hover:bg-[#fff6e2]'}`}
                  onPointerDown={(event) => startDrag(id, event)}
                  onClick={(event) => {
                    if (event.detail === 0) setSelected((chosen) => (chosen === id ? null : id))
                  }}
                >
                  <IngredientIcon id={id} className="size-10 sm:size-12" />
                  <span aria-hidden="true">{INGREDIENT_NAMES[id]}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="pierog-panel"
            aria-label="Pieróg biłgorajski"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Pieróg biłgorajski"
              icon={<BilgorajIcon name="pierog" className="size-6" />}
              counter={`Farsz: ${added.length} / ${RECIPE.length}`}
              hint={hint}
            >
              {phase === 'crust' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] px-4 py-1 font-display text-sm font-bold text-[#4a2f1a] hover:bg-[#fff6e2]"
                    onClick={() => chooseCrust('bald')}
                  >
                    Bez skórki
                  </button>
                  <button
                    type="button"
                    className="rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] px-4 py-1 font-display text-sm font-bold text-[#4a2f1a] hover:bg-[#fff6e2]"
                    onClick={() => chooseCrust('yeast')}
                  >
                    W skórce drożdżowej
                  </button>
                </div>
              )}
              {phase === 'oven' && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-label="Chłodniej"
                    disabled={baking || temp <= OVEN.min}
                    className="size-9 rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] font-display text-lg font-bold text-[#4a2f1a] disabled:opacity-40"
                    onClick={() => setTemp((value) => Math.max(OVEN.min, value - OVEN.step))}
                  >
                    −
                  </button>
                  <output
                    aria-label="Temperatura pieca"
                    className="min-w-20 rounded-lg bg-[#2a1a12] px-3 py-1 text-center font-display text-lg font-bold text-[#ffcf6a]"
                  >
                    {temp}°C
                  </output>
                  <button
                    type="button"
                    aria-label="Cieplej"
                    disabled={baking || temp >= OVEN.max}
                    className="size-9 rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] font-display text-lg font-bold text-[#4a2f1a] disabled:opacity-40"
                    onClick={() => setTemp((value) => Math.min(OVEN.max, value + OVEN.step))}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={baking}
                    className="rounded-full border-2 border-[#1f5c50] bg-[#e3efe0] px-4 py-1 font-display text-sm font-bold text-[#1f3f36] disabled:opacity-50"
                    onClick={bake}
                  >
                    Do pieca!
                  </button>
                </div>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
