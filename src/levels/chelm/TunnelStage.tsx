'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
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
  const [lamp, setLamp] = useState({ x: world.width / 2, y: world.height * 0.6 })
  const [dark, setDark] = useState(false)
  const [blows, setBlows] = useState(0)
  const [hint, setHint] = useState<string>(TUNNEL_HINTS.start)
  const backdrop = useMemo(() => <TunnelBackdrop layout={layout} depth={round} />, [layout, round])
  const done = found.length >= plan.items.length
  const itemScale = unit * (portrait ? 1.1 : 0.95)
  const radius = (dark ? 46 : portrait ? 200 : 190) * unit
  const glowSpot = GLOW_SPOTS[(blows + round * 2) % GLOW_SPOTS.length]
  const glow = { x: glowSpot[0] * world.width, y: glowSpot[1] * world.height }
  const eyes = { x: (1 - glowSpot[0]) * world.width, y: world.height * 0.4 }

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
    setLamp({
      x: ((event.clientX - rect.left) / rect.width) * world.width,
      y: ((event.clientY - rect.top) / rect.height) * world.height,
    })
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
      className="absolute inset-0 cursor-none touch-none select-none"
      data-tunnel
      data-dark={dark}
      onPointerMove={moveLamp}
      onPointerDown={moveLamp}
    >
      <svg viewBox={`0 0 ${world.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        <defs>
          <radialGradient id="ch-lamp-hole">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.55" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <radialGradient id="ch-lamp-warm">
            <stop offset="0" stopColor="#ffd88a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
          </radialGradient>
          <mask id="ch-lamp-mask">
            <rect width={world.width} height={world.height} fill="#fff" />
            <motion.circle
              initial={false}
              animate={{ cx: lamp.x, cy: lamp.y, r: radius }}
              transition={{ duration: 0.12, r: { duration: dark ? 0.25 : 0.6 } }}
              fill="url(#ch-lamp-hole)"
            />
          </mask>
        </defs>
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
              onFocus={() => setLamp({ x, y })}
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
        <circle cx={lamp.x} cy={lamp.y} r={radius} fill="url(#ch-lamp-warm)" pointerEvents="none" />
        <rect
          width={world.width}
          height={world.height}
          fill="#0c0a08"
          opacity={0.985}
          mask="url(#ch-lamp-mask)"
          pointerEvents="none"
        />
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
        {!dark && (
          <circle
            cx={lamp.x}
            cy={lamp.y}
            r={8 * unit}
            fill="#ffe8a8"
            stroke="#8a6a3a"
            strokeWidth={2}
            pointerEvents="none"
          />
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
