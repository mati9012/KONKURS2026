'use client'

import { Html } from '@react-three/drei'

export type PlaceLabelState = 'open' | 'locked' | 'stamped'

type PlaceLabelProps = {
  name: string
  major: boolean
  state: PlaceLabelState
  position: [number, number, number]
  onSelect?: () => void
}

const STATE_SUFFIX: Record<PlaceLabelState, string> = {
  open: '',
  locked: ', zablokowane',
  stamped: ', pieczęć zdobyta',
}

export function PlaceLabel({ name, major, state, position, onSelect }: PlaceLabelProps) {
  const locked = state === 'locked'

  return (
    <Html position={position} center distanceFactor={14} zIndexRange={[20, 0]}>
      <button
        type="button"
        disabled={!onSelect}
        aria-label={`${name}${STATE_SUFFIX[state]}`}
        className={`group flex flex-col items-center select-none ${onSelect ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
        onClick={onSelect}
      >
        <span
          className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1 text-center font-display leading-tight whitespace-nowrap shadow-[0_4px_12px_rgba(60,30,10,0.35)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_18px_rgba(60,30,10,0.45)] ${major ? 'text-2xl font-bold' : 'text-base font-semibold'} ${locked ? 'border-[#9c8a74] bg-[#ded3bf] text-[#6f604f]' : 'border-[#b8894f] bg-[#f6e7c8] text-[#4a2f1a]'}`}
        >
          {locked && (
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-[0.8em] fill-current">
              <path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zm2 0h4V5a2 2 0 0 0-4 0z" />
            </svg>
          )}
          {name}
          {state === 'stamped' && (
            <span
              aria-hidden="true"
              className="ml-0.5 size-[0.7em] rounded-full border-2 border-[#a8322a] bg-[#a8322a]/20"
            />
          )}
        </span>
        <span
          className={`-mt-1 size-3 rotate-45 border-r-2 border-b-2 ${locked ? 'border-[#9c8a74] bg-[#ded3bf]' : 'border-[#b8894f] bg-[#f6e7c8]'}`}
        />
        <span
          className={`mt-1 size-2 rotate-45 ${locked ? 'bg-[#bdb3a3]' : 'bg-[#ffe8a8] shadow-[0_0_8px_#ffd36e]'}`}
        />
      </button>
    </Html>
  )
}
