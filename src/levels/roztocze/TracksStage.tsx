'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { toWorld } from '@/components/watercolor/useWorld'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { ANIMAL_IDS, ANIMAL_NAMES, TRACK_HINTS, TRACKS } from '@/content/roztocze'
import type { AnimalId } from '@/content/roztocze'
import { AnimalArt } from '@/levels/roztocze/art/AnimalArt'
import { NightBackdrop } from '@/levels/roztocze/art/NightBackdrop'
import { RoztoczeIcon } from '@/levels/roztocze/art/RoztoczeIcon'
import { TrackSign } from '@/levels/roztocze/art/TrackSign'
import type { SignKind } from '@/levels/roztocze/art/TrackSign'
import { placeSpots } from '@/levels/roztocze/scene-layout'
import type { SceneLayout, Spot } from '@/levels/roztocze/scene-layout'

const REVEAL_MS = 1800
const TRACK_TOTAL = TRACKS.length

const SIGN_KINDS: readonly SignKind[] = [
  'wolf',
  'deer',
  'devil',
  'boar',
  'owl',
  'devil',
  'beaver',
  'devil',
]

const WIDE_SPOTS = [
  [0.08, 0.72],
  [0.3, 0.3],
  [0.22, 0.98],
  [0.52, 0.86],
  [0.62, 0.36],
  [0.42, 0.58],
  [0.88, 0.6],
  [0.74, 0.96],
] as const

const TALL_SPOTS = [
  [0.22, 0.86],
  [0.12, 0.3],
  [0.78, 0.98],
  [0.45, 0.62],
  [0.7, 0.24],
  [0.22, 0.52],
  [0.86, 0.72],
  [0.48, 0.96],
] as const

const BEAVER = SIGN_KINDS.indexOf('beaver')

type Sign = Spot & { id: number; kind: SignKind }

type TracksStageProps = {
  layout: SceneLayout
  playing: boolean
  onFound: (count: number, animal: AnimalId) => void
}

type Perch = Spot & { flip: boolean }

function animalPerch(sign: Sign, layout: SceneLayout): Perch {
  const { unit, world } = layout
  if (sign.kind === 'owl') return { x: sign.x, y: sign.y - 112 * unit, flip: false }
  const side = sign.x > world.width * 0.62 ? -1 : 1
  return { x: sign.x + side * 140 * unit, y: sign.y + 10 * unit, flip: side === 1 }
}

function signLabel(kind: SignKind, id: number) {
  if (kind === 'devil') return `Dziwne odciski ${id + 1}`
  return TRACKS.find((track) => track.animal === kind)?.sign ?? kind
}

export function TracksStage({ layout, playing, onFound }: TracksStageProps) {
  const svg = useRef<SVGSVGElement>(null)
  const { world, unit, portrait } = layout
  const signs: Sign[] = useMemo(() => {
    const spots = placeSpots(layout, portrait ? TALL_SPOTS : WIDE_SPOTS, layout.horizon + 60 * unit)
    return SIGN_KINDS.map((kind, id) => ({ ...spots[id], id, kind }))
  }, [layout, portrait, unit])
  const radius = (portrait ? 150 : 170) * unit
  const [lamp, setLamp] = useState<Spot | null>(null)
  const [found, setFound] = useState<AnimalId[]>([])
  const [gone, setGone] = useState<number[]>([])
  const [chosen, setChosen] = useState<Sign | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [hint, setHint] = useState<string>(TRACK_HINTS.start)
  const backdrop = useMemo(
    () => <NightBackdrop layout={layout} stream={signs[BEAVER]} />,
    [layout, signs],
  )
  const light = lamp ?? {
    x: world.width / 2,
    y: layout.horizon + (world.height - layout.horizon) / 2,
  }
  const busy = !playing || revealed
  const spotted = signs
    .filter((sign) => sign.kind !== 'devil' && found.includes(sign.kind))
    .map((sign) => ({ sign, perch: animalPerch(sign, layout) }))

  function aim(event: ReactPointerEvent<SVGSVGElement>) {
    if (!svg.current) return
    const point = toWorld(svg.current, event.clientX, event.clientY)
    if (point) setLamp(point)
  }

  function isLit(sign: Sign) {
    return Math.hypot(sign.x - light.x, sign.y - 40 * unit - light.y) < radius
  }

  function inspect(sign: Sign, forced: boolean) {
    if (busy || (!forced && !isLit(sign))) return
    if (sign.kind === 'devil') {
      setGone((current) => [...current, sign.id])
      setChosen(null)
      setHint(TRACK_HINTS.devil)
      return
    }
    if (found.includes(sign.kind)) return
    setChosen(sign)
    setHint(TRACK_HINTS.found)
  }

  function answer(animal: AnimalId) {
    if (!chosen || busy) return
    if (animal !== chosen.kind) {
      setHint(TRACK_HINTS.wrong)
      return
    }
    const count = found.length + 1
    setFound((current) => [...current, animal])
    setChosen(null)
    setRevealed(true)
    setHint(TRACK_HINTS.right)
    setTimeout(() => {
      setRevealed(false)
      onFound(count, animal)
    }, REVEAL_MS)
  }

  const clue = chosen ? TRACKS.find((track) => track.animal === chosen.kind)?.clue : null

  return (
    <>
      <svg
        ref={svg}
        viewBox={`0 0 ${world.width} ${world.height}`}
        className="absolute inset-0 size-full touch-none select-none"
        onPointerMove={aim}
        onPointerDown={aim}
      >
        <WatercolorDefs />
        <defs>
          <radialGradient id="rz-lamp-hole">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.55" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <radialGradient id="rz-lamp-glow">
            <stop offset="0" stopColor="#fff3c0" stopOpacity="0.28" />
            <stop offset="1" stopColor="#fff3c0" stopOpacity="0" />
          </radialGradient>
          <mask
            id="rz-lamp"
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={world.width}
            height={world.height}
          >
            <rect width={world.width} height={world.height} fill="#fff" />
            <circle cx={light.x} cy={light.y} r={radius} fill="url(#rz-lamp-hole)" />
            {spotted.map(({ sign, perch }) => (
              <circle
                key={sign.id}
                cx={(sign.x + perch.x) / 2}
                cy={Math.min(sign.y, perch.y) - 60 * unit}
                r={radius * 0.95}
                fill="url(#rz-lamp-hole)"
              />
            ))}
          </mask>
        </defs>
        {backdrop}
        {signs
          .filter((sign) => !gone.includes(sign.id))
          .map((sign) => (
            <g
              key={sign.id}
              role="button"
              tabIndex={0}
              aria-label={signLabel(sign.kind, sign.id)}
              data-sign={sign.kind}
              className="cursor-pointer outline-none"
              transform={`translate(${sign.x} ${sign.y}) scale(${unit})`}
              onClick={(event) => inspect(sign, event.detail === 0)}
              onFocus={() => setLamp({ x: sign.x, y: sign.y - 40 * unit })}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                inspect(sign, true)
              }}
            >
              <rect x={-90} y={-120} width={180} height={140} fill="transparent" />
              <TrackSign kind={sign.kind} />
              {chosen?.id === sign.id && (
                <ellipse
                  cx={0}
                  cy={-10}
                  rx={90}
                  ry={40}
                  fill="none"
                  stroke="#ffe58a"
                  strokeWidth={4}
                  strokeDasharray="10 8"
                  className="zw-pulse"
                />
              )}
            </g>
          ))}
        {spotted.map(({ sign, perch }) => (
          <motion.g
            key={sign.id}
            initial={{ opacity: 0, x: perch.x + (perch.flip ? 40 : -40) * unit, y: perch.y }}
            animate={{ opacity: 1, x: perch.x, y: perch.y }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            pointerEvents="none"
          >
            <g transform={`scale(${unit * (perch.flip ? -1.25 : 1.25)} ${unit * 1.25})`}>
              <g className="rz-breathe">
                <AnimalArt animal={sign.kind as AnimalId} />
              </g>
            </g>
          </motion.g>
        ))}
        <rect
          width={world.width}
          height={world.height}
          fill="#071028"
          opacity={0.76}
          mask="url(#rz-lamp)"
          pointerEvents="none"
        />
        <circle
          cx={light.x}
          cy={light.y}
          r={radius}
          fill="url(#rz-lamp-glow)"
          pointerEvents="none"
        />
      </svg>
      <AnimatePresence>
        {playing && (
          <motion.section
            key="tracks-panel"
            aria-label="Nocny las"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title="Nocny las"
              icon={<RoztoczeIcon name="paw" className="size-6" />}
              counter={`Tropy: ${found.length} / ${TRACK_TOTAL}`}
              hint={hint}
            >
              {clue && (
                <div className="mt-2">
                  <p className="text-sm text-[#5a4630] italic">{clue}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ANIMAL_IDS.map((animal) => (
                      <button
                        key={animal}
                        type="button"
                        className="rounded-full border-2 border-[#b8894f] bg-[#fbf0d6] px-3 py-1 font-display text-sm font-bold text-[#4a2f1a] hover:bg-[#fff6e2]"
                        onClick={() => answer(animal)}
                      >
                        {ANIMAL_NAMES[animal]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
