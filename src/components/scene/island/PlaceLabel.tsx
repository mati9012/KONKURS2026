'use client'

import { Html } from '@react-three/drei'

type PlaceLabelProps = {
  name: string
  major: boolean
  position: [number, number, number]
}

export function PlaceLabel({ name, major, position }: PlaceLabelProps) {
  return (
    <Html position={position} center distanceFactor={18} zIndexRange={[20, 0]}>
      <div className="pointer-events-none flex flex-col items-center select-none">
        <span
          className={`rounded-lg border-2 border-[#b8894f] bg-[#f6e7c8] px-3 py-1 text-center font-display leading-tight whitespace-nowrap text-[#4a2f1a] shadow-[0_4px_12px_rgba(60,30,10,0.35)] ${major ? 'text-2xl font-bold' : 'text-base font-semibold'}`}
        >
          {name}
        </span>
        <span className="-mt-1 size-3 rotate-45 border-r-2 border-b-2 border-[#b8894f] bg-[#f6e7c8]" />
        <span className="mt-1 size-2 rotate-45 bg-[#ffe8a8] shadow-[0_0_8px_#ffd36e]" />
      </div>
    </Html>
  )
}
