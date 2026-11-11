'use client'

import { AnimatePresence, motion, useMotionValue } from 'motion/react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { BRIDGE_HINTS } from '@/content/zwierzyniec'
import { DevilSprite } from '@/levels/zwierzyniec/art/DevilSprite'
import { PlankArt } from '@/levels/zwierzyniec/art/PlankArt'
import { WalkerArt } from '@/levels/zwierzyniec/art/WalkerArt'
import { GAP_NAMES, PLANK_NAMES, PLANK_SPAN } from '@/levels/zwierzyniec/bridge-layout'
import type { BridgeLayout, Gap } from '@/levels/zwierzyniec/bridge-layout'
import {
  FLOOD_SECONDS,
  initialPuzzle,
  puzzleReducer,
  sectionComplete,
} from '@/levels/zwierzyniec/bridge-puzzle'
import type { Card, Effect, Point } from '@/levels/zwierzyniec/bridge-puzzle'
import { Icon } from '@/levels/zwierzyniec/art/Icon'
import { StagePanel } from '@/components/ui/StagePanel'
import { toWorld } from '@/components/watercolor/useWorld'

const TICK_MS = 100
const SECTION_DONE_MS = 900
const EFFECT_MS = 1100
const SHAKE_MS = 450
const DRAG_THRESHOLD = 6
const DROP_RADIUS = 90
const WALK_SPEED = 70
const WALKER_GAP = 46
const WALKERS = [
  { coat: '#3f5f8a', scarf: '#c8402f' },
  { coat: '#8a3f3f', scarf: '#f3d35a' },
  { coat: '#4f7a46', scarf: '#f4ece0' },
  { coat: '#7a5a8a', scarf: '#e98f7c' },
  { coat: '#a8743a', scarf: '#3f5f8a' },
]

type Drag = {
  id: string
  startX: number
  startY: number
  moved: boolean
  pixels: number
}

type BridgeStageProps = {
  layout: BridgeLayout
  section: number
  playing: boolean
  procession: boolean
  onSectionDone: () => void
  onProcessionDone: () => void
}

function clockSeconds() {
  return performance.now() / 1000
}

function midpoint(layout: BridgeLayout, gap: Gap): Point {
  const a = layout.nodes[gap.from]
  const b = layout.nodes[gap.to]
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function gapTransform(layout: BridgeLayout, gap: Gap) {
  const a = layout.nodes[gap.from]
  const b = layout.nodes[gap.to]
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  const length = Math.hypot(b.x - a.x, b.y - a.y) / layout.unit
  return { transform: `translate(${a.x} ${a.y}) rotate(${angle}) scale(${layout.unit})`, length }
}

function pathLength(layout: BridgeLayout) {
  return layout.nodes
    .slice(1)
    .reduce(
      (sum, node, index) =>
        sum + Math.hypot(node.x - layout.nodes[index].x, node.y - layout.nodes[index].y),
      0,
    )
}

function swingLegs(node: SVGGElement, phase: number) {
  node.querySelectorAll<SVGElement>('[data-leg]').forEach((leg) => {
    const angle = Math.sin(phase + Number(leg.dataset.leg)) * 22
    leg.setAttribute('transform', `rotate(${angle.toFixed(1)} 0 -16)`)
  })
}

function pathPoint(layout: BridgeLayout, distance: number) {
  const { nodes } = layout
  let left = distance
  for (let index = 0; index < nodes.length - 1; index++) {
    const a = nodes[index]
    const b = nodes[index + 1]
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    if (left <= length) {
      const t = left / length
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        facing: b.x >= a.x ? 1 : -1,
        done: false,
      }
    }
    left -= length
  }
  const end = nodes[nodes.length - 1]
  return { x: end.x, y: end.y, facing: 1, done: true }
}

function Post({ x, y, unit, land }: { x: number; y: number; unit: number; land: boolean }) {
  const height = (land ? 16 : 30) * unit
  const width = 9 * unit
  return (
    <g>
      {!land && (
        <ellipse
          cx={x}
          cy={y + 4 * unit}
          rx={16 * unit}
          ry={5 * unit}
          fill="none"
          stroke="#e9f1ee"
          strokeWidth={1.5 * unit}
          opacity={0.7}
        />
      )}
      <path
        d={`M${x - width / 2} ${y + 4 * unit}V${y - height}L${x} ${y - height - 4 * unit}L${x + width / 2} ${y - height}V${y + 4 * unit}Z`}
        fill="#7a5232"
        stroke="#3a2614"
        strokeWidth={1.6 * unit}
        strokeLinejoin="round"
      />
      {!land && (
        <path
          d={`M${x - width / 2} ${y - 2 * unit}H${x + width / 2}`}
          stroke="#4e7c86"
          strokeWidth={4 * unit}
          opacity={0.6}
        />
      )}
    </g>
  )
}

function EffectMark({ effect, unit }: { effect: Effect; unit: number }) {
  const color = effect.kind === 'crack' ? '#4a3d33' : '#e9f6f8'
  return (
    <motion.g
      initial={{ opacity: 1, scale: 0.3 }}
      animate={{ opacity: 0, scale: effect.kind === 'wave' ? 2.4 : 1.6 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ originX: `${effect.x}px`, originY: `${effect.y}px` }}
    >
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2
        return (
          <circle
            key={index}
            cx={effect.x + Math.cos(angle) * 24 * unit}
            cy={effect.y + Math.sin(angle) * 10 * unit - 12 * unit}
            r={5 * unit}
            fill={color}
            stroke="#2f5560"
            strokeWidth={unit}
          />
        )
      })}
      <ellipse
        cx={effect.x}
        cy={effect.y}
        rx={40 * unit}
        ry={12 * unit}
        fill="none"
        stroke={color}
        strokeWidth={3 * unit}
      />
    </motion.g>
  )
}

function PlankCard({
  card,
  selected,
  shaking,
  onPointerDown,
  onKeyboardPick,
}: {
  card: Card
  selected: boolean
  shaking: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onKeyboardPick: () => void
}) {
  const span = PLANK_SPAN[card.length]
  const label = card.rotten
    ? `Deska poczerniała, ${PLANK_NAMES[card.length]}`
    : `Deska ${PLANK_NAMES[card.length]}`
  return (
    <motion.button
      type="button"
      layout
      aria-pressed={selected}
      aria-label={label}
      initial={{ opacity: 0, y: 24 }}
      animate={
        shaking ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0, x: 0 }
      }
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.35 }}
      className={`flex touch-none flex-col items-center gap-1 rounded-xl border-2 px-3 pt-2 pb-1.5 shadow-md select-none ${selected ? 'border-[#1f5c50] bg-[#dff0e6]' : 'border-[#b8894f] bg-[#fbf0d6] hover:bg-[#fff6e2]'}`}
      onPointerDown={onPointerDown}
      onClick={(event) => {
        if (event.detail === 0) onKeyboardPick()
      }}
    >
      <svg
        viewBox={`-4 -12 ${span + 8} 24`}
        className="h-5"
        style={{ width: `${(span + 8) * 0.8}px` }}
        aria-hidden="true"
      >
        <PlankArt span={span} rotten={card.rotten} />
      </svg>
      <span className="font-display text-xs font-bold text-[#4a2f1a]">
        {card.rotten ? 'poczerniała' : PLANK_NAMES[card.length]}
      </span>
    </motion.button>
  )
}

export function BridgeStage({
  layout,
  section,
  playing,
  procession,
  onSectionDone,
  onProcessionDone,
}: BridgeStageProps) {
  const svg = useRef<SVGSVGElement>(null)
  const walkers = useRef<(SVGGElement | null)[]>([])
  const doneFor = useRef(-1)
  const [puzzle, dispatch] = useReducer(puzzleReducer, undefined, initialPuzzle)
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const dragging = useRef<Drag | null>(null)
  const midpoints = useMemo(
    () => Object.fromEntries(layout.gaps.map((gap) => [gap.id, midpoint(layout, gap)])),
    [layout],
  )
  const complete = puzzle.section === section && sectionComplete(puzzle, layout.gaps)
  const flooding = playing && !procession && puzzle.section === section && !complete

  useEffect(() => {
    if (!playing || puzzle.section >= section) return
    const frame = requestAnimationFrame(() =>
      dispatch({ type: 'start', section, gaps: layout.gaps, seed: Math.random() * 1e9 }),
    )
    return () => cancelAnimationFrame(frame)
  }, [layout, playing, puzzle.section, section])

  useEffect(() => {
    if (!flooding) return
    const seconds = FLOOD_SECONDS[section]
    const timer = setInterval(
      () => dispatch({ type: 'tick', dt: TICK_MS / 1000, seconds, midpoints }),
      TICK_MS,
    )
    return () => clearInterval(timer)
  }, [flooding, midpoints, section])

  useEffect(() => {
    if (!complete || doneFor.current >= section) return
    doneFor.current = section
    const timer = setTimeout(onSectionDone, SECTION_DONE_MS)
    return () => clearTimeout(timer)
  }, [complete, onSectionDone, section])

  useEffect(() => {
    const timers = puzzle.effects.map((effect) =>
      setTimeout(() => dispatch({ type: 'clear-effect', id: effect.id }), EFFECT_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [puzzle.effects])

  useEffect(() => {
    if (!puzzle.shake) return
    const timer = setTimeout(() => dispatch({ type: 'clear-shake' }), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [puzzle.shake])

  useEffect(() => {
    if (!procession) return
    const start = clockSeconds()
    let frame = 0
    const total = pathLength(layout)
    const gap = WALKER_GAP * layout.unit
    function walk() {
      const travelled = (clockSeconds() - start) * WALK_SPEED * layout.unit
      let arrived = true
      walkers.current.forEach((node, index) => {
        if (!node) return
        const stop = total - index * gap * 0.55
        const distance = Math.min(stop, Math.max(0, travelled - index * gap))
        if (distance < stop) arrived = false
        const point = pathPoint(layout, distance)
        const moving = distance < stop
        const bob = moving ? Math.sin(travelled * 0.12 + index) * 1.5 * layout.unit : 0
        node.setAttribute(
          'transform',
          `translate(${point.x} ${point.y - 6 * layout.unit + bob}) scale(${layout.unit * point.facing} ${layout.unit})`,
        )
        swingLegs(node, moving ? travelled * 0.12 + index : 0)
      })
      if (arrived) {
        onProcessionDone()
        return
      }
      frame = requestAnimationFrame(walk)
    }
    frame = requestAnimationFrame(walk)
    return () => cancelAnimationFrame(frame)
  }, [layout, onProcessionDone, procession])

  function nearestGap(clientX: number, clientY: number) {
    if (!svg.current) return null
    const point = toWorld(svg.current, clientX, clientY)
    if (!point) return null
    let best: Gap | null = null
    let bestDistance = DROP_RADIUS * layout.unit
    for (const gap of layout.gaps) {
      if (gap.section !== section || puzzle.placed[gap.id]) continue
      const center = midpoints[gap.id]
      const distance = Math.hypot(center.x - point.x, center.y - point.y)
      if (distance < bestDistance) {
        best = gap
        bestDistance = distance
      }
    }
    return best
  }

  function startDrag(card: Card, event: ReactPointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const width = svg.current?.getBoundingClientRect().width ?? layout.world.width
    dragging.current = {
      id: card.id,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      pixels: (width / layout.world.width) * layout.unit,
    }
    dragX.set(event.clientX)
    dragY.set(event.clientY)
    setDrag(dragging.current)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const current = dragging.current
    if (!current) return
    dragX.set(event.clientX)
    dragY.set(event.clientY)
    if (current.moved) return
    if (
      Math.hypot(event.clientX - current.startX, event.clientY - current.startY) <= DRAG_THRESHOLD
    )
      return
    dragging.current = { ...current, moved: true }
    setDrag(dragging.current)
  }

  function cancelDrag() {
    dragging.current = null
    setDrag(null)
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragging.current
    if (!drag) return
    cancelDrag()
    if (!drag.moved) {
      dispatch({ type: 'select', id: drag.id })
      return
    }
    const gap = nearestGap(event.clientX, event.clientY)
    if (gap) dispatch({ type: 'place', cardId: drag.id, gap, at: midpoints[gap.id] })
  }

  function pickGap(gap: Gap) {
    if (!puzzle.selected) {
      dispatch({ type: 'hint', text: BRIDGE_HINTS.pickFirst })
      return
    }
    dispatch({ type: 'place', cardId: puzzle.selected, gap, at: midpoints[gap.id] })
  }

  const dragged = drag?.moved ? puzzle.tray.find((card) => card.id === drag.id) : null
  const placedCount = layout.gaps.filter((gap) => puzzle.placed[gap.id]).length
  const hint = procession ? BRIDGE_HINTS.procession : puzzle.hint
  const { unit, nodes } = layout

  return (
    <div
      className="absolute inset-0"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={cancelDrag}
    >
      <svg
        ref={svg}
        viewBox={`0 0 ${layout.world.width} ${layout.world.height}`}
        className="absolute inset-0 size-full touch-none"
      >
        {layout.gaps.map((gap) => {
          const card = puzzle.placed[gap.id]
          const { transform, length } = gapTransform(layout, gap)
          if (card) {
            return (
              <motion.g
                key={gap.id}
                initial={{ opacity: 0, y: -18 * unit }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <g transform={transform}>
                  <g transform="translate(-6 0)">
                    <PlankArt span={length + 12} rotten={false} />
                  </g>
                </g>
              </motion.g>
            )
          }
          const active =
            playing && !procession && gap.section === section && puzzle.section === section
          if (!active) return null
          return (
            <g
              key={gap.id}
              role="button"
              tabIndex={0}
              aria-label={`Przerwa ${gap.index + 1}: ${GAP_NAMES[gap.length]}`}
              className="cursor-pointer outline-none"
              onClick={() => pickGap(gap)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') pickGap(gap)
              }}
            >
              <g transform={transform}>
                <rect x={0} y={-16} width={length} height={32} fill="transparent" />
                <rect
                  className="zw-pulse"
                  x={4}
                  y={-9}
                  width={length - 8}
                  height={18}
                  rx={6}
                  fill={puzzle.selected ? '#fff3c4' : '#fff6dc'}
                  fillOpacity={0.35}
                  stroke="#fff3c4"
                  strokeWidth={2.4}
                  strokeDasharray="8 6"
                />
              </g>
            </g>
          )
        })}
        {nodes.map((node, index) => (
          <Post key={index} x={node.x} y={node.y} unit={unit} land={node.land} />
        ))}
        <AnimatePresence>
          {puzzle.effects.map((effect) => (
            <EffectMark key={effect.id} effect={effect} unit={unit} />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {puzzle.effects.some((effect) => effect.kind === 'wave') && (
            <motion.g
              key="devil"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              <g
                transform={`translate(${layout.world.width * 0.86} ${layout.world.height * 0.62}) scale(${unit * 1.2})`}
              >
                <ellipse
                  cx={0}
                  cy={0}
                  rx={40}
                  ry={10}
                  fill="#6f9a4e"
                  stroke="#3c5a2c"
                  strokeWidth={1.5}
                />
                <DevilSprite cracking={false} />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
        {procession && (
          <motion.rect
            x={-60}
            y={-60}
            width={layout.world.width + 120}
            height={layout.world.height + 120}
            fill="#1d2747"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.38 }}
            transition={{ duration: 2.5 }}
            pointerEvents="none"
          />
        )}
        {procession &&
          WALKERS.map((walker, index) => (
            <g
              key={index}
              ref={(node) => {
                walkers.current[index] = node
              }}
              transform={`translate(${nodes[0].x} ${nodes[0].y + 200 * unit})`}
            >
              <WalkerArt coat={walker.coat} scarf={walker.scarf} />
            </g>
          ))}
      </svg>

      <section
        aria-label="Kładki do kościółka"
        className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <StagePanel
          title="Kościółek na wodzie"
          icon={<Icon name="plank" className="size-6" />}
          counter={`Kładki: ${placedCount} / ${layout.gaps.length}`}
          hint={hint}
        >
          {!procession && (
            <div className="mt-2 flex items-center gap-2">
              <Icon name="wave" className="size-6 shrink-0" />
              <span className="font-display text-xs font-semibold text-[#6b4a2e]">Fala diabła</span>
              <div
                role="progressbar"
                aria-label="Fala diabła"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(puzzle.flood * 100)}
                className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e6d3ad] shadow-inner"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6fa6c4] to-[#2f6f8c] transition-[width] duration-100"
                  style={{ width: `${puzzle.flood * 100}%` }}
                />
              </div>
            </div>
          )}
        </StagePanel>
        {!procession && playing && (
          <div className="pointer-events-auto mx-auto flex flex-wrap justify-center gap-2 px-3">
            <AnimatePresence>
              {puzzle.tray.map((card) => (
                <PlankCard
                  key={card.id}
                  card={card}
                  selected={puzzle.selected === card.id}
                  shaking={puzzle.shake === card.id}
                  onPointerDown={(event) => startDrag(card, event)}
                  onKeyboardPick={() => dispatch({ type: 'select', id: card.id })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {dragged && (
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-40 will-change-transform"
          style={{ x: dragX, y: dragY }}
        >
          <svg
            aria-hidden="true"
            viewBox={`-4 -12 ${PLANK_SPAN[dragged.length] + 8} 24`}
            className="-translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
            style={{ width: `${(PLANK_SPAN[dragged.length] + 8) * (drag?.pixels ?? 1)}px` }}
          >
            <PlankArt span={PLANK_SPAN[dragged.length]} rotten={dragged.rotten} />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
