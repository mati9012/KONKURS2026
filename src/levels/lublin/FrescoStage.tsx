'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { FRESCO_HINTS, FRESCO_ROUNDS } from '@/content/lublin'
import type { FrescoSceneId } from '@/content/lublin'
import { ChapelBackdrop } from '@/levels/lublin/art/ChapelBackdrop'
import { FrescoArt } from '@/levels/lublin/art/FrescoArt'
import type { SceneLayout } from '@/levels/lublin/scene-layout'
import { createRandom } from '@/lib/noise'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const SOOT_SCALE = 3
const CLEAN_SHARE = 0.62
const CHECK_EVERY = 10
const PANEL_WIDTH = 200
const PANEL_HEIGHT = 250

type FrescoStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

type Panel = { id: FrescoSceneId; x: number; y: number; scale: number }

function panelLayout(layout: SceneLayout, ids: FrescoSceneId[]): Panel[] {
  const { world, portrait } = layout
  const width = Math.min(world.width * (portrait ? 0.29 : 0.24), world.height * 0.5 * 0.8)
  const scale = width / PANEL_WIDTH
  const shares = portrait ? [0.18, 0.5, 0.82] : [0.24, 0.5, 0.76]
  const y = world.height * (portrait ? 0.56 : 0.6)
  return ids.map((id, index) => ({ id, x: world.width * shares[index], y, scale }))
}

function sootContext(canvas: HTMLCanvasElement) {
  return canvas.getContext('2d', { willReadFrequently: true })
}

function paintSoot(canvas: HTMLCanvasElement, seed: number) {
  const context = sootContext(canvas)
  if (!context) return
  const random = createRandom(seed)
  context.globalCompositeOperation = 'source-over'
  context.fillStyle = '#2b221c'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < 90; index++) {
    context.fillStyle = random() > 0.5 ? 'rgba(60,48,38,0.6)' : 'rgba(18,14,11,0.6)'
    context.beginPath()
    context.ellipse(
      random() * canvas.width,
      random() * canvas.height,
      (0.02 + random() * 0.06) * canvas.width,
      (0.02 + random() * 0.05) * canvas.height,
      random() * Math.PI,
      0,
      Math.PI * 2,
    )
    context.fill()
  }
}

function cleanedShare(canvas: HTMLCanvasElement, panels: Panel[], world: SceneLayout['world']) {
  const context = sootContext(canvas)
  if (!context) return 0
  const ratio = canvas.width / world.width
  let clear = 0
  let total = 0
  for (const panel of panels) {
    const left = Math.max(0, Math.floor((panel.x - (PANEL_WIDTH / 2) * panel.scale) * ratio))
    const top = Math.max(0, Math.floor((panel.y - (PANEL_HEIGHT / 2) * panel.scale) * ratio))
    const width = Math.floor(PANEL_WIDTH * panel.scale * ratio)
    const height = Math.floor(PANEL_HEIGHT * panel.scale * ratio)
    const { data } = context.getImageData(left, top, width, height)
    for (let index = 3; index < data.length; index += 16) {
      total++
      if (data[index] < 60) clear++
    }
  }
  return total === 0 ? 0 : clear / total
}

export function FrescoStage({ layout, round, playing, onRound }: FrescoStageProps) {
  const { world, unit } = layout
  const plan = FRESCO_ROUNDS[Math.min(round, FRESCO_ROUNDS.length - 1)]
  const [order] = useState(() => shuffled(plan.scenes.map((scene) => scene.id)))
  const panels = useMemo(() => panelLayout(layout, order), [layout, order])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokeRef = useRef<{ x: number; y: number } | null>(null)
  const movesRef = useRef(0)
  const [cleaned, setCleaned] = useState(false)
  const [found, setFound] = useState<FrescoSceneId[]>([])
  const [shaking, setShaking] = useState<FrescoSceneId | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const backdrop = useMemo(() => <ChapelBackdrop layout={layout} seed={round} />, [layout, round])
  const frescoes = useMemo(
    () => (
      <g filter={PAINT}>
        {panels.map((panel) => (
          <g key={panel.id} transform={`translate(${panel.x} ${panel.y}) scale(${panel.scale})`}>
            <rect
              x={-PANEL_WIDTH / 2 - 10}
              y={-PANEL_HEIGHT / 2 - 10}
              width={PANEL_WIDTH + 20}
              height={PANEL_HEIGHT + 20}
              rx={8}
              fill="#5a3e28"
            />
            <rect
              x={-PANEL_WIDTH / 2}
              y={-PANEL_HEIGHT / 2}
              width={PANEL_WIDTH}
              height={PANEL_HEIGHT}
              fill="#e9cf9c"
            />
            <FrescoArt id={panel.id} />
          </g>
        ))}
      </g>
    ),
    [panels],
  )
  const done = found.length >= plan.scenes.length
  const next = cleaned && !done ? plan.scenes[found.length] : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = Math.max(1, Math.round(canvas.clientWidth / SOOT_SCALE))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight / SOOT_SCALE))
    paintSoot(canvas, round + 5)
  }, [round])

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  useEffect(() => {
    if (done) onRound(round)
  }, [done, round, onRound])

  function rub(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!playing || cleaned) return
    const pressed = event.buttons > 0 || event.pointerType === 'touch'
    if (!pressed) {
      strokeRef.current = null
      return
    }
    const canvas = event.currentTarget
    const context = sootContext(canvas)
    if (!context) return
    const rect = canvas.getBoundingClientRect()
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
    const from = strokeRef.current ?? point
    context.globalCompositeOperation = 'destination-out'
    context.lineCap = 'round'
    context.lineWidth = ((90 * unit) / world.width) * canvas.width
    context.beginPath()
    context.moveTo(from.x, from.y)
    context.lineTo(point.x + 0.01, point.y)
    context.stroke()
    strokeRef.current = point
    movesRef.current++
    if (movesRef.current % CHECK_EVERY !== 0) return
    if (cleanedShare(canvas, panels, world) >= CLEAN_SHARE) {
      setCleaned(true)
      setMessage(null)
    }
  }

  function choose(id: FrescoSceneId) {
    if (!playing || !next || found.includes(id)) return
    if (id !== next.id) {
      setShaking(id)
      setMessage(FRESCO_HINTS.wrong)
      return
    }
    setFound([...found, id])
    setMessage(next.fact)
  }

  return (
    <div className="absolute inset-0 select-none" data-fresco data-cleaned={cleaned}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full transform-gpu"
      >
        <WatercolorDefs />
        {backdrop}
        {frescoes}
      </svg>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="pointer-events-none absolute inset-0 size-full"
      >
        {panels.map((panel) => {
          const scene = plan.scenes.find((entry) => entry.id === panel.id)
          const isFound = found.includes(panel.id)
          return (
            <motion.g
              key={panel.id}
              animate={shaking === panel.id ? { opacity: [1, 0.4, 1, 0.4, 1] } : { opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <g
                role="button"
                tabIndex={cleaned ? 0 : -1}
                aria-label={isFound ? scene?.label : 'Fresk'}
                data-scene={panel.id}
                pointerEvents={cleaned ? 'auto' : 'none'}
                className="cursor-pointer outline-none"
                transform={`translate(${panel.x} ${panel.y}) scale(${panel.scale})`}
                onClick={() => choose(panel.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  choose(panel.id)
                }}
              >
                <rect
                  x={-PANEL_WIDTH / 2 - 10}
                  y={-PANEL_HEIGHT / 2 - 10}
                  width={PANEL_WIDTH + 20}
                  height={PANEL_HEIGHT + 20}
                  rx={8}
                  fill="#fff"
                  fillOpacity={0}
                  stroke={isFound ? '#f2c94c' : 'transparent'}
                  strokeWidth={8}
                />
                {isFound && scene && (
                  <g>
                    <rect
                      x={-90}
                      y={PANEL_HEIGHT / 2 + 18}
                      width={180}
                      height={34}
                      rx={8}
                      fill="#fbf0d6"
                      stroke="#7a4e28"
                      strokeWidth={3}
                    />
                    <text
                      y={PANEL_HEIGHT / 2 + 42}
                      textAnchor="middle"
                      fontSize={17}
                      fontWeight={700}
                      fill="#4a2f1a"
                    >
                      {scene.label}
                    </text>
                  </g>
                )}
              </g>
            </motion.g>
          )
        })}
      </svg>
      <motion.canvas
        ref={canvasRef}
        aria-label="Sadza na freskach"
        data-soot
        className="absolute inset-0 size-full cursor-crosshair touch-none"
        style={{ pointerEvents: cleaned ? 'none' : 'auto' }}
        initial={false}
        animate={{ opacity: cleaned ? 0 : 1 }}
        transition={{ duration: 1.2 }}
        onPointerDown={rub}
        onPointerMove={rub}
        onPointerUp={() => {
          strokeRef.current = null
        }}
      />

      <AnimatePresence>
        {playing && (
          <motion.section
            key="fresco-panel"
            aria-label="Kaplica Trójcy Świętej"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">🖌️</span>}
              counter={`Freski: ${found.length} / ${plan.scenes.length}`}
              hint={message ?? (next ? next.prompt : FRESCO_HINTS.rub)}
            >
              {message && next && (
                <p className="mt-2 text-sm font-bold text-[#5a4630] sm:text-base">{next.prompt}</p>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
