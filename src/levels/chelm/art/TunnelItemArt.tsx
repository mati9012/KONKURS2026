import type { TunnelItemKind } from '@/content/chelm'

const INK = '#2a2216'
const WOOD = '#9a6a3a'
const WOOD_DARK = '#6a4422'
const IRON = '#6a6e74'

export function TunnelItemArt({ kind }: { kind: TunnelItemKind }) {
  if (kind === 'pick') {
    return (
      <g strokeLinejoin="round" strokeLinecap="round" stroke={INK} strokeWidth={3}>
        <path d="M-30 40L22 -30" stroke={WOOD_DARK} strokeWidth={9} />
        <path d="M-30 40L22 -30" stroke={WOOD} strokeWidth={5} />
        <path d="M-14 -44C10 -40 30 -30 44 -8L30 -16C18 -30 4 -34 -16 -34Z" fill={IRON} />
      </g>
    )
  }
  if (kind === 'chalk') {
    return (
      <g strokeLinejoin="round" stroke={INK} strokeWidth={3}>
        <path d="M-36 30L-40 -6L-14 -34L24 -30L42 0L32 30Z" fill="#fbfaf2" />
        <path d="M-14 -34L-6 0L32 30M-6 0L-40 -6" fill="none" stroke="#c8c4b4" strokeWidth={3} />
      </g>
    )
  }
  if (kind === 'barrow') {
    return (
      <g strokeLinejoin="round" stroke={INK} strokeWidth={3}>
        <path d="M-40 -14H22L14 14H-30Z" fill={WOOD} />
        <path d="M-36 -18C-20 -30 4 -30 18 -18Z" fill="#f4f2e8" />
        <path d="M22 -10L48 -22M-24 14L-30 34" fill="none" strokeWidth={4} />
        <circle cx={6} cy={24} r={13} fill={WOOD_DARK} />
        <circle cx={6} cy={24} r={4} fill={IRON} />
      </g>
    )
  }
  if (kind === 'chest') {
    return (
      <g strokeLinejoin="round" stroke={INK} strokeWidth={3}>
        <rect x={-40} y={-10} width={80} height={44} rx={4} fill={WOOD} />
        <path d="M-40 -10C-40 -40 40 -40 40 -10Z" fill={WOOD_DARK} />
        <path d="M-40 4H40M-22 -32V34M22 -32V34" fill="none" stroke={IRON} strokeWidth={4} />
        <rect x={-7} y={-4} width={14} height={16} rx={2} fill="#d8b44a" />
      </g>
    )
  }
  if (kind === 'ladder') {
    return (
      <g stroke={INK} strokeWidth={3} strokeLinecap="round">
        <path d="M-20 46L-14 -46M20 46L14 -46" stroke={WOOD_DARK} strokeWidth={8} />
        {[-30, -8, 14, 36].map((y) => (
          <path key={y} d={`M-17 ${y}H17`} stroke={WOOD} strokeWidth={6} />
        ))}
      </g>
    )
  }
  if (kind === 'barrel') {
    return (
      <g strokeLinejoin="round" stroke={INK} strokeWidth={3}>
        <path d="M-28 -38C-40 -14 -40 14 -28 38H28C40 14 40 -14 28 -38Z" fill={WOOD} />
        <path d="M-34 -18H34M-34 18H34" fill="none" stroke={IRON} strokeWidth={5} />
        <path
          d="M-8 -38C-12 -10 -12 10 -8 38M10 -38C14 -10 14 10 10 38"
          fill="none"
          stroke={WOOD_DARK}
        />
      </g>
    )
  }
  if (kind === 'paw') {
    return (
      <g fill="#f4f6fb" stroke="#8a9ab0" strokeWidth={3}>
        <ellipse cx={0} cy={14} rx={26} ry={22} />
        {[-26, -9, 9, 26].map((x, index) => (
          <ellipse key={x} cx={x} cy={index === 0 || index === 3 ? -14 : -24} rx={9} ry={11} />
        ))}
      </g>
    )
  }
  if (kind === 'prop') {
    return (
      <g strokeLinejoin="round" stroke={INK} strokeWidth={3}>
        <rect x={-46} y={-46} width={92} height={14} fill={WOOD_DARK} />
        <rect x={-38} y={-32} width={14} height={78} fill={WOOD} />
        <rect x={24} y={-32} width={14} height={78} fill={WOOD} />
      </g>
    )
  }
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={3}>
      <path d="M-44 36L-36 -4H36L44 36Z" fill={WOOD} />
      <path d="M-36 -4C-30 -30 30 -30 36 -4" fill="#d8b44a" />
      {[
        [-16, -14],
        [6, -18],
        [22, -8],
        [-4, -4],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={8} fill="#f2d46a" strokeWidth={2} />
      ))}
      <path d="M-40 12H40" fill="none" stroke={IRON} strokeWidth={4} />
    </g>
  )
}
