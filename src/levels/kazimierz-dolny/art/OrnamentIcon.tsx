import type { OrnamentKind } from '@/content/kazimierz-dolny'

const INK = '#2a1e16'
const STONE = '#e8dcc0'
const SHADOW = '#b8a880'

function Glyph({ kind }: { kind: OrnamentKind }) {
  if (kind === 'bishop') {
    return (
      <>
        <rect
          x={6}
          y={4}
          width={36}
          height={40}
          rx={3}
          fill={STONE}
          stroke={INK}
          strokeWidth={1.4}
        />
        <path d="M24 9L19 17H29Z" fill={SHADOW} stroke={INK} strokeWidth={1} />
        <circle cx={24} cy={20} r={3.5} fill={STONE} stroke={INK} />
        <path
          d="M17 41C16 30 19 24 24 24C29 24 32 30 31 41Z"
          fill={SHADOW}
          stroke={INK}
          strokeWidth={1.2}
        />
        <path d="M34 41V14C34 10 30 10 30 13" stroke={INK} strokeWidth={1.8} fill="none" />
        <path d="M24 26V40" stroke={INK} strokeWidth={0.8} />
      </>
    )
  }
  if (kind === 'giant') {
    return (
      <>
        <rect
          x={6}
          y={4}
          width={36}
          height={40}
          rx={3}
          fill={STONE}
          stroke={INK}
          strokeWidth={1.4}
        />
        <path
          d="M8 38C14 35 20 41 26 38C32 35 38 41 40 38"
          stroke="#6a8aa8"
          strokeWidth={2}
          fill="none"
        />
        <circle cx={22} cy={15} r={4} fill={STONE} stroke={INK} />
        <circle cx={29} cy={10} r={2.6} fill={STONE} stroke={INK} />
        <path
          d="M16 37C15 27 18 20 22 20C27 20 30 26 29 37Z"
          fill={SHADOW}
          stroke={INK}
          strokeWidth={1.2}
        />
        <path d="M14 38V18" stroke={INK} strokeWidth={2} />
        <path d="M26 20L29 13" stroke={INK} strokeWidth={1.2} />
      </>
    )
  }
  if (kind === 'pensive') {
    return (
      <>
        <path d="M10 44V18C10 8 38 8 38 18V44Z" fill="#c8b48a" stroke={INK} strokeWidth={1.4} />
        <circle cx={22} cy={20} r={4} fill={STONE} stroke={INK} />
        <path d="M18 18C20 15 24 15 26 18" stroke="#8a5a2a" strokeWidth={1.4} fill="none" />
        <path
          d="M14 40C14 30 18 26 22 26C27 26 32 30 32 40Z"
          fill={STONE}
          stroke={INK}
          strokeWidth={1.2}
        />
        <path d="M24 30C26 27 27 25 26 22" stroke={INK} strokeWidth={1.6} fill="none" />
        <path d="M8 44H40" stroke={INK} strokeWidth={2} />
      </>
    )
  }
  if (kind === 'attic') {
    return (
      <>
        <path d="M4 42H44V30H4Z" fill={STONE} stroke={INK} strokeWidth={1.4} />
        {[8, 18, 30, 40].map((x) => (
          <g key={x}>
            <path d={`M${x - 3} 30V20H${x + 3}V30`} fill={STONE} stroke={INK} strokeWidth={1.2} />
            <path
              d={`M${x - 3} 20L${x} 10L${x + 3} 20Z`}
              fill={SHADOW}
              stroke={INK}
              strokeWidth={1}
            />
          </g>
        ))}
        <path
          d="M24 30C20 24 20 18 24 14C28 18 28 24 24 30Z"
          fill={SHADOW}
          stroke={INK}
          strokeWidth={1}
        />
        {[10, 20, 30].map((x) => (
          <circle key={x} cx={x + 4} cy={36} r={2.2} fill={SHADOW} />
        ))}
      </>
    )
  }
  return (
    <>
      <path d="M2 44V10H46V44" fill={STONE} stroke={INK} strokeWidth={1.4} />
      {[10, 24, 38].map((x) => (
        <path
          key={x}
          d={`M${x - 6} 44V24C${x - 6} 16 ${x + 6} 16 ${x + 6} 24V44Z`}
          fill="#6a5a44"
          stroke={INK}
          strokeWidth={1.2}
        />
      ))}
      <path d="M2 14H46" stroke={INK} strokeWidth={1.4} />
    </>
  )
}

export function OrnamentIcon({
  kind,
  className,
  size,
}: {
  kind: OrnamentKind
  className?: string
  size?: number
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} width={size} height={size}>
      <Glyph kind={kind} />
    </svg>
  )
}
