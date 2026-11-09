export type BilgorajIconName = 'sieve' | 'bowl' | 'pierog'

const INK = '#3a2614'

function Glyph({ name }: { name: BilgorajIconName }) {
  if (name === 'sieve') {
    return (
      <>
        <path d="M4 17V23A14 6 0 0 0 32 23V17Z" fill="#c99a62" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={18} cy={17} rx={14} ry={6} fill="#6b4a2e" stroke={INK} strokeWidth={1.6} />
        <path
          d="M10 13V21M14 12V22M18 11V23M22 12V22M26 13V21M6 15H30M5 17H31M6 19H30"
          stroke="#d8c8a4"
          strokeWidth={0.9}
        />
      </>
    )
  }
  if (name === 'bowl') {
    return (
      <>
        <path
          d="M4 16H32C32 26 26 31 18 31C10 31 4 26 4 16Z"
          fill="#c0603a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <ellipse cx={18} cy={16} rx={14} ry={4} fill="#f4ead2" stroke={INK} strokeWidth={1.4} />
        <path d="M8 22C12 24 24 24 28 22" stroke="#f2c08a" strokeWidth={1.4} fill="none" />
      </>
    )
  }
  return (
    <>
      <rect
        x={4}
        y={12}
        width={28}
        height={16}
        rx={3}
        fill="#8a8a92"
        stroke={INK}
        strokeWidth={1.6}
      />
      <rect
        x={6}
        y={10}
        width={24}
        height={12}
        rx={3}
        fill="#d9a35a"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M10 14L14 18M16 13L20 17M22 14L26 18" stroke="#a8702e" strokeWidth={1.2} />
    </>
  )
}

export function BilgorajIcon({ name, className }: { name: BilgorajIconName; className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className={className}>
      <Glyph name={name} />
    </svg>
  )
}
