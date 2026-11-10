'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { PAINT, PAINT_WASH, WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { SALON_HINTS, SALON_ROUNDS, STATION_IDS, STATION_NAMES } from '@/content/pulawy'
import type { GuestId, StationId } from '@/content/pulawy'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { GuestIcon } from '@/levels/pulawy/art/GuestIcon'
import { StationArt } from '@/levels/pulawy/art/StationArt'
import type { SceneLayout } from '@/levels/pulawy/scene-layout'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const INK = '#2a1e16'

type SalonStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

function Hall({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const windows = Math.max(3, Math.round(width / (260 * unit)))
  const lift = portrait ? 2 : 1
  const up = (offset: number) => ground - (110 + (offset - 110) * lift) * unit
  return (
    <g>
      <rect width={width} height={height} fill="#e8dcc0" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.25} />
      <rect width={width} height={40 * unit} fill="#c8b48a" />
      <path d={`M0 ${40 * unit}H${width}`} stroke="#a8946a" strokeWidth={6 * unit} />
      {Array.from({ length: windows }, (_, index) => {
        const x = (width / windows) * (index + 0.5)
        return (
          <g key={index}>
            <path
              d={`M${x - 50 * unit} ${up(120)}V${up(330)}A${50 * unit} ${50 * unit} 0 0 1 ${x + 50 * unit} ${up(330)}V${up(120)}Z`}
              fill="#b8d4e4"
              stroke="#8a7a5a"
              strokeWidth={6 * unit}
            />
            <path
              d={`M${x} ${up(380)}V${up(120)}M${x - 50 * unit} ${up(250)}H${x + 50 * unit}`}
              stroke="#8a7a5a"
              strokeWidth={3 * unit}
            />
            <path
              d={`M${x - 66 * unit} ${up(400)}C${x - 70 * unit} ${up(300)} ${x - 56 * unit} ${up(200)} ${x - 70 * unit} ${up(110)}`}
              stroke="#a83a3a"
              strokeWidth={16 * unit}
              fill="none"
              opacity={0.85}
            />
            <path
              d={`M${x + 66 * unit} ${up(400)}C${x + 70 * unit} ${up(300)} ${x + 56 * unit} ${up(200)} ${x + 70 * unit} ${up(110)}`}
              stroke="#a83a3a"
              strokeWidth={16 * unit}
              fill="none"
              opacity={0.85}
            />
          </g>
        )
      })}
      {portrait && (
        <g>
          <path
            d={`M${width / 2} ${40 * unit}V${up(440)}`}
            stroke="#8a7a5a"
            strokeWidth={3 * unit}
          />
          <path
            d={`M${width / 2 - 110 * unit} ${up(440)}C${width / 2 - 80 * unit} ${up(410)} ${width / 2 + 80 * unit} ${up(410)} ${width / 2 + 110 * unit} ${up(440)}`}
            stroke="#c8a040"
            strokeWidth={8 * unit}
            fill="none"
          />
          {[-110, -55, 0, 55, 110].map((dx) => (
            <g key={dx}>
              <rect
                x={width / 2 + (dx - 4) * unit}
                y={up(440) - (dx === 0 ? 50 : 26) * unit}
                width={8 * unit}
                height={22 * unit}
                fill="#f6efe0"
              />
              <circle
                cx={width / 2 + dx * unit}
                cy={up(440) - (dx === 0 ? 56 : 32) * unit}
                r={6 * unit}
                fill="#f4c45a"
              />
            </g>
          ))}
        </g>
      )}
      <rect
        y={ground - 30 * unit}
        width={width}
        height={30 * unit}
        fill="#d8c8a0"
        stroke="#a8946a"
      />
      <rect y={ground} width={width} height={height - ground} fill="#9a6a40" filter={PAINT} />
      {Array.from({ length: Math.ceil(width / (60 * unit)) }, (_, index) => (
        <path
          key={index}
          d={`M${index * 60 * unit} ${ground}l${-40 * unit} ${height - ground}`}
          stroke="#7a5030"
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
    </g>
  )
}

export function SalonStage({ layout, round, playing, onRound }: SalonStageProps) {
  const { world, unit, ground, portrait } = layout
  const plan = SALON_ROUNDS[Math.min(round, SALON_ROUNDS.length - 1)]
  const [deck] = useState(() => shuffled(plan.guests))
  const [stations] = useState(() => shuffled(STATION_IDS))
  const [seated, setSeated] = useState<GuestId[]>([])
  const [hint, setHint] = useState<string>(SALON_HINTS.start)
  const [shaking, setShaking] = useState<string | null>(null)
  const hall = useMemo(() => <Hall layout={layout} />, [layout])
  const drag = useCardDrag(drop)
  const scale = Math.min(unit * (portrait ? 1.1 : 1.25), (world.width / 4) * 0.0055)
  const cards = deck
    .filter((guest) => !seated.includes(guest.id))
    .map((guest) => ({
      id: guest.id,
      label: guest.name,
      icon: <GuestIcon id={guest.id} className="size-10 sm:size-12" />,
    }))
  const draggedId = drag.drag?.moved ? (drag.drag.id as GuestId) : null
  const showTargets = playing && (drag.selected || drag.drag?.moved)

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  function drop(card: string, target: string) {
    if (!playing) return
    const guest = plan.guests.find((entry) => entry.id === card)
    const station = target.replace('station-', '') as StationId
    if (!guest || seated.includes(guest.id) || !STATION_IDS.includes(station)) return
    if (guest.station !== station) {
      setShaking(guest.id)
      setHint(`Nie tutaj! ${guest.name} pasuje do kąta: ${STATION_NAMES[guest.station]}.`)
      return
    }
    const next = [...seated, guest.id]
    setSeated(next)
    setHint(`${SALON_HINTS.good} ${guest.name} trafia do kąta: ${STATION_NAMES[station]}.`)
    if (next.length === plan.guests.length) onRound(round)
  }

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {hall}
        {stations.map((station, index) => {
          const x = world.width * (0.14 + index * 0.24)
          const target = `station-${station}`
          const hovered = drag.hovered === target
          const guests = plan.guests.filter(
            (guest) => guest.station === station && seated.includes(guest.id),
          )
          return (
            <g
              key={station}
              role="button"
              tabIndex={0}
              aria-label={`Kąt: ${STATION_NAMES[station]}`}
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
                x={x - 100 * scale}
                y={ground - 230 * scale}
                width={200 * scale}
                height={230 * scale + 70 * unit}
                rx={14 * unit}
                fill="#ffe7a3"
                fillOpacity={hovered ? 0.45 : showTargets ? 0.25 : 0}
                stroke={hovered ? '#1f5c50' : '#f2b84b'}
                strokeOpacity={showTargets ? 1 : 0}
                strokeWidth={3}
                strokeDasharray="10 7"
                className={showTargets && !hovered ? 'zw-pulse' : undefined}
              />
              <g transform={`translate(${x} ${ground + 10 * unit}) scale(${scale})`} filter={PAINT}>
                <StationArt station={station} />
              </g>
              <g transform={`translate(${x} ${ground + 44 * unit})`}>
                <rect
                  x={-90 * scale}
                  y={-16 * unit}
                  width={180 * scale}
                  height={32 * unit}
                  rx={8 * unit}
                  fill="#f6ecd2"
                  stroke={INK}
                  strokeWidth={2}
                />
                <text
                  y={7 * unit}
                  textAnchor="middle"
                  fontSize={Math.min(20 * unit, 26 * scale)}
                  fontWeight={700}
                  fill="#4a2f1a"
                  fontFamily="var(--font-alegreya), Georgia, serif"
                >
                  {STATION_NAMES[station]}
                </text>
              </g>
              {guests.map((guest, slot) => (
                <g
                  key={guest.id}
                  transform={`translate(${x + (slot - (guests.length - 1) / 2) * 70 * scale} ${ground - 250 * scale})`}
                >
                  <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}>
                    <g transform={`translate(${-34 * scale} ${-34 * scale})`}>
                      <GuestIcon id={guest.id} size={68 * scale} />
                    </g>
                  </motion.g>
                </g>
              ))}
            </g>
          )
        })}
      </svg>

      {draggedId && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y} over={drag.hovered !== null}>
          <GuestIcon id={draggedId} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && (
          <CardTray
            key={`guests-${round}`}
            label="Goście"
            cards={cards}
            selected={drag.selected}
            shaking={shaking}
            dragged={draggedId}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="salon-panel"
            aria-label="Salon Polskich Aten"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">🎨</span>}
              counter={`Goście: ${seated.length} / ${plan.guests.length}`}
              hint={hint}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
