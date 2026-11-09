'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HERD_HINTS, HERD_WAVES } from '@/content/zwierzyniec'
import { DevilSprite } from '@/levels/zwierzyniec/art/DevilSprite'
import { GoatSprite } from '@/levels/zwierzyniec/art/GoatSprite'
import { KonikSprite } from '@/levels/zwierzyniec/art/KonikSprite'
import { PenFence } from '@/levels/zwierzyniec/art/PenFence'
import { depthScale } from '@/levels/zwierzyniec/herd-layout'
import type { HerdLayout } from '@/levels/zwierzyniec/herd-layout'
import { scatterFrom, spawnHorses, stepHerd } from '@/levels/zwierzyniec/herd-sim'
import type { HerdEvent, HerdState, Mover } from '@/levels/zwierzyniec/herd-sim'
import { toWorld } from '@/components/watercolor/useWorld'

const GOAT = 'goat'
const FENCE = 'fence'
const WAVE_DONE_MS = 900
const WHIP_EVERY = 14
const WHIP_CRACK = 0.8
const WHIP_GONE = 1.9
const HINT_COOLDOWN = 4
const LEG_SWING = 0.5
const KEY_DIRECTIONS: Record<string, readonly [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
}

type Sprite = { node: SVGGElement; legs: SVGGElement[]; alert: SVGElement | null }

type Devil = { x: number; y: number; cracking: boolean }

type HerdStageProps = {
  layout: HerdLayout
  wave: number
  playing: boolean
  onPenned: (count: number) => void
  onHint: (text: string) => void
  onWaveDone: () => void
}

function clockSeconds() {
  return performance.now() / 1000
}

function poseSprite(sprite: Sprite, mover: Mover, scale: number) {
  sprite.node.setAttribute(
    'transform',
    `translate(${mover.x.toFixed(1)} ${mover.y.toFixed(1)}) scale(${(scale * mover.facing).toFixed(3)} ${scale.toFixed(3)})`,
  )
  const swing = Math.min(1, Math.hypot(mover.vx, mover.vy) / 60) * LEG_SWING
  for (const leg of sprite.legs) {
    const phase = Number(leg.dataset.leg)
    const hip = leg.dataset.hip
    const angle = Math.sin(mover.gait + phase) * swing * (180 / Math.PI)
    leg.setAttribute('transform', `rotate(${angle.toFixed(1)} ${hip} -44)`)
  }
}

function drawOrder(state: HerdState, fenceY: number) {
  const items = state.horses.map((horse) => ({ id: String(horse.id), y: horse.y }))
  items.push({ id: GOAT, y: state.goat.y }, { id: FENCE, y: fenceY })
  return items.sort((a, b) => a.y - b.y).map((item) => item.id)
}

function freeCenter(state: HerdState) {
  const free = state.horses.filter((horse) => !horse.penned)
  if (free.length === 0) return null
  return {
    x: free.reduce((sum, horse) => sum + horse.x, 0) / free.length,
    y: free.reduce((sum, horse) => sum + horse.y, 0) / free.length,
  }
}

export function HerdStage({ layout, wave, playing, onPenned, onHint, onWaveDone }: HerdStageProps) {
  const svg = useRef<SVGSVGElement>(null)
  const marker = useRef<SVGGElement>(null)
  const sprites = useRef(new Map<string, Sprite>())
  const state = useRef<HerdState>({
    horses: [],
    goat: { ...layout.goatStart, vx: 0, vy: 0, facing: 1, gait: 0 },
    target: null,
    keys: { x: 0, y: 0 },
    time: 0,
  })
  const spawnedWave = useRef(-1)
  const waveDone = useRef(false)
  const keys = useRef(new Set<string>())
  const lastHint = useRef(0)
  const nextWhip = useRef(WHIP_EVERY)
  const devilAt = useRef<number | null>(null)
  const devilSpot = useRef({ x: 0, y: 0 })
  const [horseIds, setHorseIds] = useState<number[]>([])
  const [order, setOrder] = useState<string[]>([GOAT, FENCE])
  const [devil, setDevil] = useState<Devil | null>(null)

  const bind = useCallback(
    (id: string) => (node: SVGGElement | null) => {
      if (!node) {
        sprites.current.delete(id)
        return
      }
      sprites.current.set(id, {
        node,
        legs: Array.from(node.querySelectorAll<SVGGElement>('[data-leg]')),
        alert: node.querySelector<SVGElement>('[data-alert]'),
      })
    },
    [],
  )

  useEffect(() => {
    if (!playing || spawnedWave.current >= wave) return
    spawnedWave.current = wave
    waveDone.current = false
    const current = state.current
    const fresh = spawnHorses(layout, HERD_WAVES[wave].count, 31 + wave * 7, current.horses.length)
    current.horses.push(...fresh)
    current.target = null
    nextWhip.current = current.time + WHIP_EVERY
    const ids = current.horses.map((horse) => horse.id)
    requestAnimationFrame(() => setHorseIds(ids))
  }, [layout, playing, wave])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last = clockSeconds()
    const events: HerdEvent[] = []
    const pressed = keys.current

    function hint(text: string, now: number) {
      if (now - lastHint.current < HINT_COOLDOWN) return
      lastHint.current = now
      onHint(text)
    }

    function runDevil(current: HerdState, dt: number, now: number) {
      if (wave === 0) return
      if (devilAt.current === null) {
        if (current.time < nextWhip.current) return
        const center = freeCenter(current)
        if (!center || current.horses.filter((horse) => !horse.penned).length < 2) return
        const bush = layout.bushes.reduce((best, candidate) =>
          Math.hypot(candidate.x - center.x, candidate.y - center.y) <
          Math.hypot(best.x - center.x, best.y - center.y)
            ? candidate
            : best,
        )
        devilAt.current = current.time
        devilSpot.current = { x: bush.x, y: bush.y - bush.r * 0.4 }
        setDevil({ ...devilSpot.current, cracking: false })
        return
      }
      const since = current.time - devilAt.current
      if (since >= WHIP_CRACK && since - dt < WHIP_CRACK) {
        setDevil((shown) => (shown ? { ...shown, cracking: true } : shown))
        scatterFrom(current, layout, devilSpot.current.x, devilSpot.current.y)
        hint(HERD_HINTS.whip, now)
      }
      if (since >= WHIP_GONE) {
        devilAt.current = null
        nextWhip.current = current.time + WHIP_EVERY
        setDevil(null)
      }
    }

    function tick() {
      const now = clockSeconds()
      const dt = Math.min(0.05, now - last)
      last = now
      const current = state.current
      const held = pressed
      current.keys.x = 0
      current.keys.y = 0
      for (const key of held) {
        const direction = KEY_DIRECTIONS[key]
        if (!direction) continue
        current.keys.x += direction[0]
        current.keys.y += direction[1]
      }
      events.length = 0
      stepHerd(current, layout, dt, events)
      runDevil(current, dt, now)

      let penned = 0
      for (const horse of current.horses) {
        const sprite = sprites.current.get(String(horse.id))
        if (horse.penned) penned++
        if (!sprite) continue
        poseSprite(sprite, horse, depthScale(layout, horse.y))
        sprite.node.dataset.penned = String(horse.penned)
        sprite.alert?.setAttribute('opacity', horse.scared > 0 ? '1' : '0')
      }
      const goatSprite = sprites.current.get(GOAT)
      if (goatSprite) poseSprite(goatSprite, current.goat, depthScale(layout, current.goat.y))
      if (marker.current) {
        const target = current.target
        marker.current.setAttribute(
          'opacity',
          target && current.keys.x === 0 && current.keys.y === 0 ? '0.85' : '0',
        )
        if (target)
          marker.current.setAttribute(
            'transform',
            `translate(${target.x.toFixed(1)} ${target.y.toFixed(1)})`,
          )
      }

      if (events.includes('scared')) hint(HERD_HINTS.scared, now)
      if (events.includes('penned')) {
        onPenned(penned)
        hint(HERD_HINTS.penned, now)
      }

      const next = drawOrder(current, layout.pen.bottom)
      setOrder((shown) => (shown.join() === next.join() ? shown : next))

      const waveHorses = current.horses.slice(-HERD_WAVES[wave].count)
      if (!waveDone.current && waveHorses.length > 0 && waveHorses.every((horse) => horse.penned)) {
        waveDone.current = true
        setTimeout(onWaveDone, WAVE_DONE_MS)
      }
      frame = requestAnimationFrame(tick)
    }

    function down(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (!KEY_DIRECTIONS[key]) return
      event.preventDefault()
      pressed.add(key)
    }

    function up(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      pressed.delete(key)
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      pressed.clear()
    }
  }, [layout, playing, wave, onHint, onPenned, onWaveDone])

  function aim(event: React.PointerEvent<SVGSVGElement>) {
    if (!playing || !svg.current) return
    if (event.pointerType !== 'mouse' && event.buttons === 0 && event.type === 'pointermove') return
    const point = toWorld(svg.current, event.clientX, event.clientY)
    if (point) state.current.target = point
  }

  const { world, pen, unit } = layout

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${world.width} ${world.height}`}
      className="absolute inset-0 size-full touch-none"
      onPointerDown={aim}
      onPointerMove={aim}
    >
      <g ref={marker} opacity={0} pointerEvents="none">
        <ellipse
          rx={26 * unit}
          ry={9 * unit}
          fill="none"
          stroke="#fff6dc"
          strokeWidth={3 * unit}
          strokeDasharray={`${8 * unit} ${6 * unit}`}
        />
        <ellipse rx={6 * unit} ry={2.4 * unit} fill="#fff6dc" />
      </g>
      <rect
        data-gate
        x={pen.gateLeft}
        y={pen.bottom - 4}
        width={pen.gateRight - pen.gateLeft}
        height={8}
        fill="none"
      />
      {order.map((id) => {
        if (id === FENCE) return <PenFence key={FENCE} layout={layout} side="front" />
        if (id === GOAT) {
          return (
            <g key={GOAT} ref={bind(GOAT)} data-szaro aria-hidden="true">
              <GoatSprite />
            </g>
          )
        }
        if (!horseIds.includes(Number(id))) return null
        return (
          <g key={id} ref={bind(id)} data-konik data-penned="false" aria-hidden="true">
            <KonikSprite />
            <g data-alert opacity={0}>
              <circle cx={60} cy={-138} r={11} fill="#fff3d6" stroke="#3a2614" strokeWidth={2} />
              <path
                d="M60 -145V-136M60 -132V-131"
                stroke="#b8322a"
                strokeWidth={3.2}
                strokeLinecap="round"
              />
            </g>
          </g>
        )
      })}
      <AnimatePresence>
        {devil && (
          <motion.g
            key="devil"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            <g
              transform={`translate(${devil.x} ${devil.y}) scale(${depthScale(layout, devil.y) * 1.1})`}
            >
              <DevilSprite cracking={devil.cracking} />
              {devil.cracking && (
                <text
                  x={40}
                  y={-120}
                  className="font-display"
                  fontSize={30}
                  fontWeight={800}
                  fill="#b8322a"
                  stroke="#fff3d6"
                  strokeWidth={5}
                  paintOrder="stroke"
                >
                  TRZASK!
                </text>
              )}
            </g>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}
