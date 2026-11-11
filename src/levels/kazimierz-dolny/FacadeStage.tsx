'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { blobPath } from '@/components/watercolor/paint'
import {
  PAINT,
  PAINT_SOFT,
  PAINT_WASH,
  WatercolorDefs,
} from '@/components/watercolor/WatercolorDefs'
import { FACADE_HINTS, FACADE_ROUNDS, HOUSE_IDS, HOUSE_NAMES } from '@/content/kazimierz-dolny'
import type { HouseId, OrnamentKind } from '@/content/kazimierz-dolny'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { OrnamentIcon } from '@/levels/kazimierz-dolny/art/OrnamentIcon'
import { RoosterArt } from '@/levels/kazimierz-dolny/art/RoosterArt'
import type { SceneLayout } from '@/levels/kazimierz-dolny/scene-layout'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const INK = '#2a1e16'

type SlotKind = 'relief' | 'pensive' | 'attic' | 'arcade'

type Slot = { house: HouseId; kind: SlotKind; x: number; y: number; size: number }

const SLOT_OF: Record<OrnamentKind, SlotKind> = {
  bishop: 'relief',
  giant: 'relief',
  pensive: 'pensive',
  attic: 'attic',
  arcade: 'arcade',
}

const RELIEF_OF: Record<HouseId, OrnamentKind> = { mikolaj: 'bishop', krzysztof: 'giant' }

type FacadeStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function slotId(slot: { house: HouseId; kind: SlotKind }) {
  return `slot-${slot.house}-${slot.kind}`
}

function houseSlots(house: HouseId): Omit<Slot, 'house'>[] {
  const base: Omit<Slot, 'house'>[] = [
    { kind: 'arcade', x: 0, y: -55, size: 110 },
    { kind: 'relief', x: -42, y: -185, size: 70 },
    { kind: 'attic', x: 0, y: -320, size: 120 },
  ]
  return house === 'krzysztof' ? [...base, { kind: 'pensive', x: 67, y: -185, size: 46 }] : base
}

function Square({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground, portrait } = layout
  const hill = portrait ? 2 : 1
  const { width, height } = world
  return (
    <g>
      <defs>
        <linearGradient id="kd-square-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a4c8e0" />
          <stop offset="1" stopColor="#f6ecd4" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#kd-square-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.3, height * 0.12, 130 * unit, 18 * unit, 61, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <path
        d={`M-20 ${ground - hill * 260 * unit}C${width * 0.3} ${ground - hill * 330 * unit} ${width * 0.6} ${ground - hill * 300 * unit} ${width + 20} ${ground - hill * 350 * unit}V${ground}H-20Z`}
        fill="#9ab07a"
        filter={PAINT_SOFT}
        opacity={0.8}
      />
      <rect y={ground} width={width} height={height - ground} fill="#c8b490" filter={PAINT} />
      {Array.from({ length: Math.ceil(width / (34 * unit)) * 3 }, (_, index) => {
        const columns = Math.ceil(width / (34 * unit))
        const row = Math.floor(index / columns)
        const column = index % columns
        return (
          <path
            key={index}
            d={blobPath(
              column * 34 * unit + (row % 2) * 17 * unit,
              ground + (26 + row * 34) * unit,
              14 * unit,
              8 * unit,
              index + 300,
              0.2,
              8,
            )}
            fill="#a89878"
            opacity={0.6}
          />
        )
      })}
    </g>
  )
}

function House({ house, filled }: { house: HouseId; filled: (kind: SlotKind) => boolean }) {
  const wall = house === 'mikolaj' ? '#efe4c8' : '#ece0c2'
  return (
    <g>
      <rect x={-140} y={-260} width={280} height={260} fill={wall} stroke={INK} strokeWidth={2} />
      <path d="M-146 -110H146M-146 -260H146" stroke={INK} strokeWidth={3} />
      {[-105, 20, 115].map((x) => (
        <g key={x}>
          <rect
            x={x - 18}
            y={-232}
            width={36}
            height={70}
            fill="#5a6a7a"
            stroke={INK}
            strokeWidth={1.6}
          />
          <path d={`M${x} -232V-162M${x - 18} -197H${x + 18}`} stroke="#d8ccb0" strokeWidth={2} />
        </g>
      ))}
      {filled('arcade') ? (
        [-90, 0, 90].map((x) => (
          <path
            key={x}
            d={`M${x - 36} 0V-60C${x - 36} -96 ${x + 36} -96 ${x + 36} -60V0Z`}
            fill="#6a5a44"
            stroke={INK}
            strokeWidth={2}
          />
        ))
      ) : (
        <rect x={-120} y={-100} width={240} height={100} fill="#d8ccb0" opacity={0.6} />
      )}
      {filled('attic') ? (
        <g>
          <path d="M-140 -260V-330H140V-260Z" fill={wall} stroke={INK} strokeWidth={2} />
          {[-120, -60, 0, 60, 120].map((x) => (
            <g key={x}>
              <path
                d={`M${x - 10} -330V-370H${x + 10}V-330`}
                fill={wall}
                stroke={INK}
                strokeWidth={1.6}
              />
              <path
                d={`M${x - 10} -370L${x} -400L${x + 10} -370Z`}
                fill="#c8b48a"
                stroke={INK}
                strokeWidth={1.4}
              />
            </g>
          ))}
          {[-90, -30, 30, 90].map((x) => (
            <circle key={x} cx={x} cy={-296} r={12} fill="#c8b48a" stroke={INK} strokeWidth={1.4} />
          ))}
          <path d="M-140 -330H140" stroke={INK} strokeWidth={3} />
        </g>
      ) : (
        <path d="M-150 -260L0 -330L150 -260Z" fill="#9a8a7a" opacity={0.5} />
      )}
      {filled('relief') && (
        <g transform="translate(-77 -220) scale(1.45)">
          <OrnamentIcon kind={RELIEF_OF[house]} size={48} />
        </g>
      )}
      {house === 'krzysztof' && filled('pensive') && (
        <g transform="translate(44 -208) scale(0.95)">
          <OrnamentIcon kind="pensive" size={48} />
        </g>
      )}
    </g>
  )
}

export function FacadeStage({ layout, round, playing, onRound }: FacadeStageProps) {
  const { world, unit, ground, portrait } = layout
  const plan = FACADE_ROUNDS[Math.min(round, FACADE_ROUNDS.length - 1)]
  const [deck] = useState(() => shuffled(plan.pieces))
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [hint, setHint] = useState<string>(FACADE_HINTS.start)
  const [shaking, setShaking] = useState<string | null>(null)
  const square = useMemo(() => <Square layout={layout} />, [layout])
  const drag = useCardDrag(drop)
  const scale = Math.min(
    unit * (portrait ? 1.25 : 1.15),
    (world.width / 2) * (portrait ? 0.0028 : 0.0022),
  )
  const activeKinds = new Set(plan.pieces.map((piece) => SLOT_OF[piece.kind]))
  const earlier = FACADE_ROUNDS.slice(0, round).flatMap((entry) =>
    entry.pieces.map((piece) => SLOT_OF[piece.kind]),
  )
  const used = Object.values(placed)
  const cards = deck
    .filter((piece) => !used.includes(piece.id))
    .map((piece) => ({
      id: piece.id,
      label: piece.label,
      icon: <OrnamentIcon kind={piece.kind} className="size-10 sm:size-12" />,
    }))
  const draggedPiece = drag.drag?.moved
    ? plan.pieces.find((piece) => piece.id === drag.drag?.id)
    : undefined
  const showTargets = playing && (drag.selected || drag.drag?.moved)

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function fits(pieceId: string, target: string) {
    const piece = plan.pieces.find((entry) => entry.id === pieceId)
    if (!piece) return false
    const kind = SLOT_OF[piece.kind]
    if (piece.house) return target === slotId({ house: piece.house, kind })
    return HOUSE_IDS.some((house) => target === slotId({ house, kind }))
  }

  function drop(card: string, target: string) {
    if (!playing || placed[target]) return
    if (!target.startsWith('slot-')) return
    if (!fits(card, target)) {
      setShaking(card)
      setHint(FACADE_HINTS.wrong)
      return
    }
    const next = { ...placed, [target]: card }
    setPlaced(next)
    const piece = plan.pieces.find((entry) => entry.id === card)
    setHint(`${FACADE_HINTS.good} ${piece?.label ?? ''}.`)
    if (Object.keys(next).length === plan.pieces.length) onRound(round)
  }

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {square}
        {HOUSE_IDS.map((house, index) => {
          const x = world.width * (index === 0 ? 0.3 : 0.7)
          const filled = (kind: SlotKind) =>
            earlier.includes(kind) || Boolean(placed[slotId({ house, kind })])
          return (
            <g key={house}>
              <g transform={`translate(${x} ${ground}) scale(${scale})`} filter={PAINT}>
                <House house={house} filled={filled} />
              </g>
              {houseSlots(house)
                .filter(
                  (slot) =>
                    activeKinds.has(slot.kind) && !placed[slotId({ house, kind: slot.kind })],
                )
                .map((slot) => {
                  const target = slotId({ house, kind: slot.kind })
                  const hovered = drag.hovered === target
                  const half = (slot.size / 2) * scale
                  return (
                    <g
                      key={target}
                      role="button"
                      tabIndex={0}
                      aria-label={`Miejsce na ozdobę: ${HOUSE_NAMES[house]}`}
                      data-target={target}
                      className="cursor-pointer outline-none"
                      onClick={() => drag.pick(target)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        drag.pick(target)
                      }}
                    >
                      <rect
                        x={
                          x +
                          slot.x * scale -
                          half * (slot.kind === 'attic' || slot.kind === 'arcade' ? 2 : 1)
                        }
                        y={ground + slot.y * scale - half}
                        width={half * 2 * (slot.kind === 'attic' || slot.kind === 'arcade' ? 2 : 1)}
                        height={half * 2}
                        rx={8 * unit}
                        fill="#ffe7a3"
                        fillOpacity={hovered ? 0.7 : showTargets ? 0.45 : 0.25}
                        stroke={hovered ? '#1f5c50' : '#f2b84b'}
                        strokeWidth={3}
                        strokeDasharray="10 7"
                        className={hovered ? undefined : 'zw-pulse'}
                      />
                    </g>
                  )
                })}
              <g transform={`translate(${x} ${ground + 40 * unit})`}>
                <rect
                  x={-130 * scale}
                  y={-16 * unit}
                  width={260 * scale}
                  height={32 * unit}
                  rx={8 * unit}
                  fill="#f6ecd2"
                  stroke={INK}
                  strokeWidth={2}
                />
                <text
                  y={7 * unit}
                  textAnchor="middle"
                  fontSize={Math.min(19 * unit, 24 * scale)}
                  fontWeight={700}
                  fill="#4a2f1a"
                  fontFamily="var(--font-alegreya), Georgia, serif"
                >
                  {HOUSE_NAMES[house]}
                </text>
              </g>
            </g>
          )
        })}
        <g transform={`translate(${world.width * 0.5} ${ground + 20 * unit}) scale(${unit * 0.8})`}>
          <RoosterArt pose={Object.keys(placed).length > 0 ? 'crow' : 'stand'} />
        </g>
      </svg>

      {draggedPiece && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y} over={drag.hovered !== null}>
          <OrnamentIcon kind={draggedPiece.kind} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && (
          <CardTray
            key={`ornaments-${round}`}
            label="Ozdoby"
            cards={cards}
            selected={drag.selected}
            shaking={shaking}
            dragged={draggedPiece?.id ?? null}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="facade-panel"
            aria-label="Kamienice Przybyłów"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<OrnamentIcon kind="attic" className="size-6" />}
              counter={`Ozdoby: ${Object.keys(placed).length} / ${plan.pieces.length}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
