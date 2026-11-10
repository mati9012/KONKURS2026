import type { ObstacleKind } from '@/levels/kock/ride-course'

const INK = '#2a1e16'

export function ObstacleArt({ kind }: { kind: ObstacleKind }) {
  if (kind === 'log') {
    return (
      <g>
        <ellipse cx={0} cy={2} rx={44} ry={6} fill="#000" opacity={0.18} />
        <rect
          x={-40}
          y={-38}
          width={74}
          height={36}
          rx={16}
          fill="#8a5a34"
          stroke={INK}
          strokeWidth={2}
        />
        <ellipse cx={34} cy={-20} rx={10} ry={18} fill="#d8b07a" stroke={INK} strokeWidth={2} />
        <ellipse cx={34} cy={-20} rx={5} ry={9} fill="none" stroke="#a8784a" strokeWidth={1.4} />
        <path d="M-30 -28H20M-26 -16H14" stroke="#6a4226" strokeWidth={1.6} />
      </g>
    )
  }
  if (kind === 'fence') {
    return (
      <g>
        <ellipse cx={0} cy={2} rx={48} ry={6} fill="#000" opacity={0.18} />
        {[-36, 0, 36].map((x) => (
          <rect
            key={x}
            x={x - 5}
            y={-64}
            width={10}
            height={66}
            rx={2}
            fill="#a8743f"
            stroke={INK}
            strokeWidth={1.6}
          />
        ))}
        {[-52, -30].map((y) => (
          <rect
            key={y}
            x={-46}
            y={y}
            width={92}
            height={10}
            rx={3}
            fill="#c4905a"
            stroke={INK}
            strokeWidth={1.6}
          />
        ))}
      </g>
    )
  }
  return (
    <g>
      <ellipse cx={0} cy={2} rx={44} ry={6} fill="#000" opacity={0.18} />
      <rect
        x={-38}
        y={-52}
        width={76}
        height={52}
        rx={10}
        fill="#e0c060"
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M-30 -40H30M-32 -26H32M-30 -12H30" stroke="#b8963a" strokeWidth={2} />
      <path d="M-12 -52V0M12 -52V0" stroke="#8a6a2a" strokeWidth={2.4} />
    </g>
  )
}
