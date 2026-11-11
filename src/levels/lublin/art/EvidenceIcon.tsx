import type { TrialEvidenceId } from '@/content/lublin'

const INK = '#3a2418'
const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const }

function EvidenceArt({ id }: { id: TrialEvidenceId }) {
  if (id === 'morando') {
    return (
      <g>
        <rect x={-40} y={-34} width={80} height={68} rx={4} fill="#f4e6c4" {...line} />
        <path d="M0 -24L22 -8L14 18H-14L-22 -8Z" fill="none" {...line} />
        <path
          d="M-22 -8H22M0 -24V18M-14 18L22 -8M14 18L-22 -8"
          stroke="#a8402e"
          strokeWidth={1.6}
        />
        <circle cx={-44} cy={0} r={8} fill="#d9b46a" {...line} />
        <circle cx={44} cy={0} r={8} fill="#d9b46a" {...line} />
      </g>
    )
  }
  if (id === 'sito') {
    return (
      <g>
        <circle r={40} fill="#c89a5c" {...line} />
        <circle r={30} fill="#f2e2b8" {...line} />
        <path
          d="M-30 -10H30M-30 0H30M-30 10H30M-28 -18H28M-28 18H28M-10 -30V30M0 -30V30M10 -30V30M-18 -28V28M18 -28V28"
          stroke="#8a6a3a"
          strokeWidth={1.4}
        />
      </g>
    )
  }
  if (id === 'kreda') {
    return (
      <g>
        <path d="M-36 24L-40 -6L-14 -32L22 -28L40 0L30 28Z" fill="#fbfaf2" {...line} />
        <path d="M-14 -32L-6 0L30 28M-6 0L-40 -6" fill="none" stroke="#c8c4b4" strokeWidth={3} />
      </g>
    )
  }
  if (id === 'sybilla') {
    return (
      <g>
        <circle cx={-18} cy={0} r={18} fill="none" stroke="#d9a83e" strokeWidth={9} />
        <circle cx={-18} cy={0} r={18} fill="none" stroke={INK} strokeWidth={2} />
        <path d="M0 0H42M30 0V14M40 0V12" stroke="#d9a83e" strokeWidth={8} strokeLinecap="round" />
      </g>
    )
  }
  if (id === 'swiatynie') {
    return (
      <g>
        <rect x={-44} y={-6} width={26} height={34} fill="#f0dcb0" {...line} />
        <path d="M-48 -6L-31 -24L-14 -6Z" fill="#8a5a3a" {...line} />
        <rect x={-12} y={-2} width={24} height={30} fill="#f4ecdc" {...line} />
        <path d="M-12 -2C-14 -20 0 -24 0 -36C0 -24 14 -20 12 -2Z" fill="#5f9e86" {...line} />
        <rect x={18} y={-4} width={26} height={32} fill="#f4ecdc" {...line} />
        <path d="M18 -4L31 -40L44 -4Z" fill="#9c4a32" {...line} />
      </g>
    )
  }
  return (
    <g>
      <ellipse cx={0} cy={4} rx={40} ry={28} fill="#5a6a3a" {...line} />
      <path
        d="M-20 -14L0 -22L20 -14L24 10L0 20L-24 10Z"
        fill="none"
        stroke="#e8d070"
        strokeWidth={2.5}
      />
      <path
        d="M-20 -14L-34 0M20 -14L34 0M-24 10L-20 26M24 10L20 26"
        stroke="#e8d070"
        strokeWidth={2}
      />
      <circle cx={44} cy={0} r={8} fill="#7a8a4a" {...line} />
    </g>
  )
}

export function EvidenceIcon({ id, className }: { id: TrialEvidenceId; className?: string }) {
  return (
    <svg viewBox="-55 -55 110 110" className={className} aria-hidden="true">
      <EvidenceArt id={id} />
    </svg>
  )
}
