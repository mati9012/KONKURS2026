import type { GrainKind } from '@/content/bilgoraj'

const INK = '#3a2614'

export function GrainArt({ kind, turn }: { kind: GrainKind; turn: number }) {
  const rotate = `rotate(${turn})`
  if (kind === 'grain') {
    return (
      <g transform={rotate}>
        <ellipse cx={0} cy={0} rx={6} ry={3.4} fill="#e0b450" stroke={INK} strokeWidth={0.9} />
        <path d="M-4 0H4" stroke="#b08430" strokeWidth={0.9} />
      </g>
    )
  }
  if (kind === 'stone') {
    return (
      <g transform={rotate}>
        <path
          d="M-10 2C-11 -6 -2 -9 5 -7C11 -5 12 3 6 7C0 9 -9 8 -10 2Z"
          fill="#8f8a84"
          stroke={INK}
          strokeWidth={1}
        />
        <path d="M-5 -3C-2 -6 3 -6 5 -4" fill="none" stroke="#c4bfb8" strokeWidth={1.2} />
      </g>
    )
  }
  if (kind === 'straw') {
    return (
      <g transform={rotate}>
        <path d="M-18 0H18" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
        <path d="M-18 0H18" stroke="#e8c870" strokeWidth={2.6} strokeLinecap="round" />
      </g>
    )
  }
  if (kind === 'kasza') {
    return (
      <g transform={rotate}>
        <path
          d="M0 -4L4 3L-4 3Z"
          fill="#8a5a30"
          stroke={INK}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </g>
    )
  }
  if (kind === 'sand') return <circle cx={0} cy={0} r={1.8} fill="#c9a870" />
  if (kind === 'flour') return <circle cx={0} cy={0} r={2} fill="#fbf6ea" />
  if (kind === 'clump') {
    return (
      <g transform={rotate}>
        <path
          d="M-5 1C-6 -3 -1 -5 3 -4C6 -2 6 3 2 4C-2 5 -5 4 -5 1Z"
          fill="#f2ead8"
          stroke="#b8ab90"
          strokeWidth={0.8}
        />
      </g>
    )
  }
  return (
    <g transform={rotate}>
      <path
        d="M-6 0C-6 -3 -2 -4 0 -1C2 2 6 2 6 -1"
        fill="none"
        stroke={INK}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <path
        d="M-6 0C-6 -3 -2 -4 0 -1C2 2 6 2 6 -1"
        fill="none"
        stroke="#e8d0a0"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </g>
  )
}
