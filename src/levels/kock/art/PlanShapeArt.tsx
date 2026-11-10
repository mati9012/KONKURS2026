import type { PlanShape } from '@/content/kock'

const INK = '#3a2a22'

export function PlanShapeArt({ shape, className }: { shape: PlanShape; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect x={2} y={2} width={44} height={44} rx={4} fill="#f6ecd2" stroke="#b8894f" />
      {shape === 'horseshoe' && (
        <path
          d="M8 10H40V38H31V20H17V38H8Z"
          fill="#c98a5a"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      )}
      {shape === 'square' && (
        <rect x={10} y={10} width={28} height={28} fill="#c98a5a" stroke={INK} strokeWidth={1.6} />
      )}
      {shape === 'circle' && (
        <circle cx={24} cy={24} r={15} fill="#c98a5a" stroke={INK} strokeWidth={1.6} />
      )}
    </svg>
  )
}
