import type { ArmsSlot } from '@/content/chelm'
import { BearArt } from '@/levels/chelm/art/BearArt'
import { CrownArt } from '@/levels/chelm/art/CrownArt'
import { OakArt } from '@/levels/chelm/art/OakArt'

const INK = '#2a2216'
export const SHIELD_PATH = 'M-150 -170H150V60C150 140 70 180 0 200C-70 180 -150 140 -150 60Z'

export function ArmsShield({ filled }: { filled: (slot: ArmsSlot) => boolean }) {
  return (
    <g>
      <path
        d={SHIELD_PATH}
        fill={filled('field') ? '#3f7d3a' : '#efe4c8'}
        stroke={INK}
        strokeWidth={5}
      />
      {filled('field') && (
        <path d="M-130 -150H130V-120C60 -132 -60 -132 -130 -120Z" fill="#5a9a4c" opacity={0.5} />
      )}
      {filled('trees') && (
        <g>
          <path
            d="M-150 120C-90 70 90 70 150 120V140C120 170 60 190 0 200C-60 190 -120 170 -150 140Z"
            fill="#2f6a2c"
            stroke={INK}
            strokeWidth={3}
          />
          <OakArt x={-95} y={96} size={0.8} />
          <OakArt x={95} y={96} size={0.8} />
        </g>
      )}
      {filled('bear') && (
        <g transform="translate(-18 100) scale(1.05)">
          <BearArt />
        </g>
      )}
      {filled('trees') && <OakArt x={-6} y={112} size={0.72} />}
      {filled('crown') && (
        <g transform="translate(0 -184)">
          <CrownArt />
        </g>
      )}
    </g>
  )
}
