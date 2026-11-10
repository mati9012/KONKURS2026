import type { ExhibitId } from '@/content/kock'

const INK = '#2a1e16'

function Glyph({ id }: { id: ExhibitId }) {
  if (id === 'charter') {
    return (
      <>
        <path d="M10 8H36V40H10Z" fill="#f2e2bc" stroke={INK} strokeWidth={1.6} />
        <path
          d="M8 6C8 10 12 10 12 8M34 40C34 44 38 44 38 40"
          fill="none"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M14 14H32M14 19H32M14 24H28" stroke="#8a6a4a" strokeWidth={1.4} />
        <circle cx={28} cy={33} r={5} fill="#b8302a" stroke={INK} strokeWidth={1.2} />
        <path d="M26 37L24 44M30 37L32 44" stroke="#b8302a" strokeWidth={2} />
      </>
    )
  }
  if (id === 'palace-plan') {
    return (
      <>
        <rect x={6} y={8} width={36} height={32} fill="#e8eef4" stroke={INK} strokeWidth={1.6} />
        <path d="M12 14H36V34H30V20H18V34H12Z" fill="none" stroke="#2a5a8a" strokeWidth={1.8} />
        <path
          d="M6 16H42M6 24H42M6 32H42M14 8V40M24 8V40M34 8V40"
          stroke="#c8d4e0"
          strokeWidth={0.6}
        />
      </>
    )
  }
  if (id === 'shako') {
    return (
      <>
        <path d="M14 40L12 14H36L34 40Z" fill="#2a3a5a" stroke={INK} strokeWidth={1.6} />
        <rect x={11} y={12} width={26} height={5} fill="#c8a040" stroke={INK} strokeWidth={1.2} />
        <path d="M12 40H38L36 44H10Z" fill="#1a1a1a" />
        <circle cx={24} cy={26} r={4} fill="#c8a040" stroke={INK} strokeWidth={1} />
        <path
          d="M24 12C22 6 24 2 26 2C28 6 26 10 24 12Z"
          fill="#c8402f"
          stroke={INK}
          strokeWidth={1}
        />
      </>
    )
  }
  if (id === 'helmet') {
    return (
      <>
        <path
          d="M6 32C6 16 14 10 24 10C34 10 42 16 42 32Z"
          fill="#5a6a4a"
          stroke={INK}
          strokeWidth={1.8}
        />
        <path d="M4 32H44V36H4Z" fill="#4a5a3a" stroke={INK} strokeWidth={1.4} />
        <path d="M14 18C18 14 24 13 28 14" fill="none" stroke="#8a9a7a" strokeWidth={2} />
      </>
    )
  }
  if (id === 'letter') {
    return (
      <>
        <rect x={10} y={6} width={28} height={36} fill="#c8a870" stroke={INK} strokeWidth={1.6} />
        <rect x={14} y={10} width={20} height={26} fill="#d8d0c0" />
        <circle cx={24} cy={19} r={5} fill="#6a6258" />
        <path d="M15 36C15 28 33 28 33 36Z" fill="#6a6258" />
        <path d="M18 14C20 12 28 12 30 14L29 15H19Z" fill="#4a4a3a" />
      </>
    )
  }
  return (
    <>
      <circle cx={24} cy={22} r={15} fill="none" stroke="#3a6a3a" strokeWidth={7} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx={24 + Math.cos((angle * Math.PI) / 180) * 15}
          cy={22 + Math.sin((angle * Math.PI) / 180) * 15}
          rx={4}
          ry={2.4}
          transform={`rotate(${angle + 90} ${24 + Math.cos((angle * Math.PI) / 180) * 15} ${22 + Math.sin((angle * Math.PI) / 180) * 15})`}
          fill="#5a8a4a"
        />
      ))}
      <path d="M18 34L14 46L20 43L22 36Z" fill="#fff" stroke={INK} strokeWidth={1} />
      <path d="M30 34L34 46L28 43L26 36Z" fill="#c8302a" stroke={INK} strokeWidth={1} />
    </>
  )
}

export function ExhibitIcon({
  id,
  className,
  size,
}: {
  id: ExhibitId
  className?: string
  size?: number
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} width={size} height={size}>
      <Glyph id={id} />
    </svg>
  )
}
