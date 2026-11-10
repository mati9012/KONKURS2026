import type { GorgeObstacleKind } from '@/levels/kazimierz-dolny/gorge-course'

const INK = '#2a1e16'
const ROOT = '#6a4a2a'

export function GorgeObstacleArt({ kind }: { kind: GorgeObstacleKind }) {
  if (kind === 'root') {
    return (
      <g>
        <path
          d="M-60 0C-50 -30 -30 -44 0 -44C30 -44 50 -30 60 0"
          stroke={ROOT}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-20 -40C-24 -20 -30 -8 -36 0M18 -42C24 -24 30 -10 38 0"
          stroke="#5a3a22"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-60 0C-50 -30 -30 -44 0 -44C30 -44 50 -30 60 0"
          stroke={INK}
          strokeWidth={1.6}
          fill="none"
        />
      </g>
    )
  }
  return (
    <g>
      <path d="M-70 -400H70" stroke="#5a7a3a" strokeWidth={24} strokeLinecap="round" />
      {[-46, -16, 14, 44].map((x, index) => (
        <path
          key={x}
          d={`M${x} -400C${x - 10} -300 ${x + 14} -200 ${x + (index % 2 === 0 ? -6 : 6)} ${-86 - (index % 2) * 14}`}
          stroke={index % 2 === 0 ? ROOT : '#7a5a34'}
          strokeWidth={index % 2 === 0 ? 9 : 6}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M-50 -110C-30 -96 30 -96 50 -110"
        stroke={ROOT}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}
