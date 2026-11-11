import type { ArmsPartKind } from '@/content/chelm'
import { BearArt } from '@/levels/chelm/art/BearArt'
import { CrownArt } from '@/levels/chelm/art/CrownArt'
import { OakArt } from '@/levels/chelm/art/OakArt'

const INK = '#2a2216'
const SMALL_SHIELD = 'M-40 -46H40V14C40 36 18 46 0 52C-18 46 -40 36 -40 14Z'

function PartDrawing({ kind }: { kind: ArmsPartKind }) {
  if (kind === 'field-green' || kind === 'field-red') {
    return (
      <path
        d={SMALL_SHIELD}
        fill={kind === 'field-green' ? '#3f7d3a' : '#b8322a'}
        stroke={INK}
        strokeWidth={3}
      />
    )
  }
  if (kind === 'oaks') {
    return (
      <g>
        <path d="M-46 40C-24 14 24 14 46 40Z" fill="#2f6a2c" stroke={INK} strokeWidth={2.5} />
        <OakArt x={-24} y={30} size={0.42} />
        <OakArt x={24} y={30} size={0.42} />
        <OakArt x={0} y={34} size={0.5} />
      </g>
    )
  }
  if (kind === 'spruce') {
    return (
      <g strokeLinejoin="round">
        <rect x={-4} y={22} width={8} height={18} fill="#6a4a2a" stroke={INK} strokeWidth={2} />
        <path d="M0 -46L-30 24H30Z" fill="#2a5a3a" stroke={INK} strokeWidth={2.5} />
      </g>
    )
  }
  if (kind === 'bear-white' || kind === 'bear-brown') {
    return (
      <g transform="translate(-14 30) scale(0.34)">
        {kind === 'bear-white' ? <BearArt /> : <BearArt fur="#7a4e2a" shade="#5a361c" />}
      </g>
    )
  }
  if (kind === 'crown') {
    return (
      <g transform="translate(0 24) scale(0.4)">
        <CrownArt />
      </g>
    )
  }
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={2.5}>
      <path d="M-30 30C-44 6 -40 -24 -22 -44C-24 -20 -16 0 -6 14Z" fill="#9a2a22" />
      <path d="M30 30C44 6 40 -24 22 -44C24 -20 16 0 6 14Z" fill="#9a2a22" />
    </g>
  )
}

export function ArmsPartIcon({ kind, className }: { kind: ArmsPartKind; className?: string }) {
  return (
    <svg viewBox="-55 -55 110 110" className={className} aria-hidden="true">
      <PartDrawing kind={kind} />
    </svg>
  )
}
