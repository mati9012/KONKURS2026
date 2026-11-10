import { GUEST_IDS } from '@/content/pulawy'
import type { GuestId } from '@/content/pulawy'

const INK = '#2a1e16'

const COATS = ['#3a5a8a', '#7a3a3a', '#3a6a4a', '#6a4a7a', '#8a6a2a']
const HAIR = ['#f2ece0', '#e8e0d0', '#5a3a22', '#d8d0c0', '#3a2a1a']

export function GuestIcon({
  id,
  className,
  size,
}: {
  id: GuestId
  className?: string
  size?: number
}) {
  const index = GUEST_IDS.indexOf(id)
  const coat = COATS[index % COATS.length]
  const hair = HAIR[(index * 3) % HAIR.length]
  const pair = id === 'lessel'
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} width={size} height={size}>
      <ellipse cx={24} cy={24} rx={21} ry={22} fill="#c8a050" stroke={INK} strokeWidth={1.6} />
      <ellipse cx={24} cy={24} rx={17} ry={18} fill="#efe4cc" />
      {(pair ? [17, 31] : [24]).map((x) => (
        <g key={x}>
          <path
            d={`M${x - 11} 42C${x - 11} 32 ${x + 11} 32 ${x + 11} 42Z`}
            fill={coat}
            stroke={INK}
            strokeWidth={1.2}
          />
          <path
            d={`M${x - 3} 33L${x} 38L${x + 3} 33`}
            fill="#fbf8f0"
            stroke={INK}
            strokeWidth={0.8}
          />
          <circle cx={x} cy={23} r={pair ? 6 : 7.5} fill="#f0cca8" stroke={INK} strokeWidth={1.2} />
          <path
            d={`M${x - (pair ? 7 : 8.5)} ${pair ? 23 : 22}C${x - 9} ${pair ? 13 : 11} ${x + 9} ${pair ? 13 : 11} ${x + (pair ? 7 : 8.5)} ${pair ? 23 : 22}C${x + 4} ${pair ? 18 : 16} ${x - 4} ${pair ? 18 : 16} ${x - (pair ? 7 : 8.5)} ${pair ? 23 : 22}Z`}
            fill={hair}
            stroke={INK}
            strokeWidth={0.9}
          />
          <circle cx={x - 2.5} cy={24} r={0.9} fill={INK} />
          <circle cx={x + 2.5} cy={24} r={0.9} fill={INK} />
          <path
            d={`M${x - 2} 27.5C${x - 1} 28.5 ${x + 1} 28.5 ${x + 2} 27.5`}
            stroke={INK}
            strokeWidth={0.8}
            fill="none"
          />
        </g>
      ))}
    </svg>
  )
}
