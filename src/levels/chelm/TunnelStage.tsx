'use client'

import { AnimatePresence, animate, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { TUNNEL_HINTS, TUNNEL_ROUNDS } from '@/content/chelm'
import type { TunnelItemKind } from '@/content/chelm'
import { BearArt } from '@/levels/chelm/art/BearArt'
import { TunnelBackdrop } from '@/levels/chelm/art/TunnelBackdrop'
import { TunnelItemArt } from '@/levels/chelm/art/TunnelItemArt'
import type { SceneLayout } from '@/levels/chelm/scene-layout'

const BLOW_MS = 6000
const FINISH_MS = 2600
const DARK_RADIUS = 46
const DARKNESS = 'rgba(12,10,8,0.985)'
const WARM = '255,216,138'

const ITEM_SPOTS = [
  [
    [0.2, 0.62],
    [0.55, 0.84],
    [0.84, 0.5],
  ],
  [
    [0.12, 0.8],
    [0.46, 0.56],
    [0.82, 0.78],
  ],
  [
    [0.28, 0.5],
    [0.72, 0.62],
    [0.5, 0.86],
  ],
] as const

const GLOW_SPOTS = [
  [0.16, 0.46],
  [0.84, 0.72],
  [0.5, 0.48],
  [0.3, 0.84],
  [0.76, 0.42],
] as const

type TunnelStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

export function TunnelStage({ layout, round, playing, onRound }: TunnelStageProps) {
  const { world, unit, portrait } = layout
  const plan = TUNNEL_ROUNDS[Math.min(round, TUNNEL_ROUNDS.length - 1)]
  const spots = ITEM_SPOTS[Math.min(round, ITEM_SPOTS.length - 1)]
  const [found, setFound] = useState<TunnelItemKind[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const darknessRef = useRef<HTMLDivElement>(null)
  const litRadius = portrait ? 200 : 190
  const lampRef = useRef({ x: 0.5, y: 0.6, radius: litRadius, lit: true })
  const [dark, setDark] = useState(false)
  const [blows, setBlows] = useState(0)
  const [hint, setHint] = useState<string>(TUNNEL_HINTS.start)
  const backdrop = useMemo(() => <TunnelBackdrop layout={layout} depth={round} />, [layout, round])
  const done = found.length >= plan.items.length
  const itemScale = unit * (portrait ? 1.1 : 0.95)
  const glowSpot = GLOW_SPOTS[(blows + round * 2) % GLOW_SPOTS.length]
  const glow = { x: glowSpot[0] * world.width, y: glowSpot[1] * world.height }
  const eyes = { x: (1 - glowSpot[0]) * world.width, y: world.height * 0.4 }

  const paintLamp = useCallback(() => {
    const container = containerRef.current
    const darkness = darknessRef.current
    if (!container || !darkness) return
    const { clientWidth, clientHeight } = container
    const scale = (clientWidth / world.width) * unit
    const { x, y, radius, lit } = lampRef.current
    const at = `circle at ${x * clientWidth}px ${y * clientHeight}px`
    const size = radius * scale
    const layers = [
      `radial-gradient(${at}, rgba(${WARM},0.35), rgba(${WARM},0) ${size}px)`,
      `radial-gradient(${at}, transparent ${size * 0.55}px, ${DARKNESS} ${size}px)`,
    ]
    if (lit) {
      const dot = 8 * scale
      layers.unshift(
        `radial-gradient(${at}, #ffe8a8 ${dot - 2}px, #8a6a3a ${dot - 2}px ${dot}px, transparent ${dot}px)`,
      )
    }
    darkness.style.background = layers.join(',')
  }, [world.width, unit])

  useEffect(() => {
    const lamp = lampRef.current
    lamp.lit = !dark
    paintLamp()
    const controls = animate(lamp.radius, dark ? DARK_RADIUS : litRadius, {
      duration: dark ? 0.25 : 0.6,
      onUpdate: (value) => {
        lamp.radius = value
        paintLamp()
      },
    })
    return () => controls.stop()
  }, [dark, litRadius, paintLamp])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(paintLamp)
    observer.observe(container)
    return () => observer.disconnect()
  }, [paintLamp])

  useEffect(() => {
    if (!playing || dark || done) return
    const timer = setTimeout(() => {
      setDark(true)
      setHint(TUNNEL_HINTS.dark)
    }, BLOW_MS)
    return () => clearTimeout(timer)
  }, [playing, dark, done, found.length])

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => onRound(round), FINISH_MS)
    return () => clearTimeout(timer)
  }, [done, round, onRound])

  function moveLamp(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    lampRef.current.x = (event.clientX - rect.left) / rect.width
    lampRef.current.y = (event.clientY - rect.top) / rect.height
    paintLamp()
  }

  function pointLampAt(x: number, y: number) {
    lampRef.current.x = x
    lampRef.current.y = y
    paintLamp()
  }

  function collect(kind: TunnelItemKind) {
    if (!playing || found.includes(kind)) return
    if (dark) {
      setHint(TUNNEL_HINTS.dark)
      return
    }
    const item = plan.items.find((entry) => entry.id === kind)
    setFound([...found, kind])
    setHint(item?.fact ?? TUNNEL_HINTS.start)
  }

  function relight() {
    if (!dark) return
    setDark(false)
    setBlows(blows + 1)
    setHint(TUNNEL_HINTS.lit)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-none touch-none select-none"
      data-tunnel
      data-dark={dark}
      onPointerMove={moveLamp}
      onPointerDown={moveLamp}
    >
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full transform-gpu"
      >
        <WatercolorDefs />
        {backdrop}
        {spots.map(([sx, sy], index) => {
          const item = plan.items[index]
          if (!item || found.includes(item.id)) return null
          const x = sx * world.width
          const y = sy * world.height
          return (
            <g
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              data-item={item.id}
              className="outline-none"
              transform={`translate(${x} ${y}) scale(${itemScale})`}
              onClick={() => collect(item.id)}
              onFocus={() => pointLampAt(sx, sy)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                collect(item.id)
              }}
            >
              <circle r={64} fill="#000" fillOpacity={0} />
              <TunnelItemArt kind={item.id} />
            </g>
          )
        })}
      </svg>
      <div
        ref={darknessRef}
        className="pointer-events-none absolute inset-0 transform-gpu"
        style={{ background: DARKNESS }}
      />
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="pointer-events-none absolute inset-0 size-full"
      >
        <AnimatePresence>
          {dark && (
            <motion.g
              key={`eyes-${blows}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, times: [0, 0.2, 0.7, 1] }}
              pointerEvents="none"
            >
              <g transform={`translate(${eyes.x} ${eyes.y}) scale(${unit})`}>
                <ellipse cx={-18} cy={0} rx={10} ry={6} fill="#e8402a" />
                <ellipse cx={18} cy={0} rx={10} ry={6} fill="#e8402a" />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
        {dark && playing && (
          <g
            role="button"
            tabIndex={0}
            aria-label="Poświata Bielucha"
            data-glow
            pointerEvents="auto"
            className="cursor-pointer outline-none"
            onClick={relight}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              relight()
            }}
          >
            <circle cx={glow.x} cy={glow.y} r={110 * unit} fill="#e8f0ff" opacity={0.12} />
            <motion.g
              animate={{ opacity: [0.45, 0.95, 0.45] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <g
                transform={`translate(${glow.x - 10 * unit} ${glow.y + 50 * unit}) scale(${unit * 0.8})`}
              >
                <BearArt fur="#f4f8ff" shade="#c8d4ea" ink="#9aaac4" />
              </g>
            </motion.g>
          </g>
        )}
      </svg>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="tunnel-panel"
            aria-label="Podziemia kredowe"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">🔦</span>}
              counter={`Znalezione: ${found.length} / ${plan.items.length}`}
              hint={hint}
            >
              <div className="mt-2 flex items-center gap-2" aria-hidden="true">
                {plan.items.map((item) => (
                  <svg
                    key={item.id}
                    viewBox="-55 -55 110 110"
                    className={`size-8 rounded-lg bg-[#3a3228] p-0.5 sm:size-10 ${found.includes(item.id) ? '' : 'opacity-30 grayscale'}`}
                  >
                    {found.includes(item.id) ? (
                      <TunnelItemArt kind={item.id} />
                    ) : (
                      <text y={18} textAnchor="middle" fontSize={56} fill="#e8e0cc">
                        ?
                      </text>
                    )}
                  </svg>
                ))}
              </div>
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
