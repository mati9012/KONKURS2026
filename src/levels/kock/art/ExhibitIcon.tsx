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
  if (id === 'postcard') {
    return (
      <>
        <rect
          x={5}
          y={10}
          width={38}
          height={28}
          rx={2}
          fill="#f2e8d4"
          stroke={INK}
          strokeWidth={1.6}
        />
        <rect x={8} y={13} width={20} height={22} fill="#9ab8c8" />
        <path d="M8 30H28V35H8Z" fill="#c8b890" />
        <path d="M16 30V18L19 15L22 18V30Z" fill="#e8e0cc" stroke={INK} strokeWidth={1} />
        <path d="M31 16H40M31 21H40M31 26H38" stroke="#8a7a5a" strokeWidth={1.2} />
        <rect x={34} y={29} width={6} height={6} fill="#c8402f" />
      </>
    )
  }
  if (id === 'map') {
    return (
      <>
        <path
          d="M6 12L17 8L31 12L42 8V36L31 40L17 36L6 40Z"
          fill="#e8dcb8"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path d="M17 8V36M31 12V40" stroke="#b8a888" strokeWidth={1} />
        <path
          d="M8 26C14 22 20 30 26 24C30 20 36 24 40 20"
          fill="none"
          stroke="#3a7aa8"
          strokeWidth={2}
        />
        <path d="M22 16L26 20M26 16L22 20" stroke="#c8402f" strokeWidth={1.8} />
      </>
    )
  }
  if (id === 'calendar') {
    return (
      <>
        <rect
          x={10}
          y={8}
          width={28}
          height={32}
          rx={2}
          fill="#fbf8f0"
          stroke={INK}
          strokeWidth={1.6}
        />
        <rect x={10} y={8} width={28} height={9} fill="#c8402f" />
        <path d="M16 6V11M32 6V11" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        <text x={24} y={34} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>
          17
        </text>
      </>
    )
  }
  if (id === 'armband') {
    return (
      <>
        <path
          d="M6 18C6 14 42 14 42 18V30C42 34 6 34 6 30Z"
          fill="#fbfbf6"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M6 24H42V30C42 34 6 34 6 30Z" fill="#c8302a" />
        <path d="M6 18C6 22 42 22 42 18" fill="none" stroke={INK} strokeWidth={1} />
      </>
    )
  }
  if (id === 'order') {
    return (
      <>
        <rect x={10} y={6} width={28} height={36} fill="#f4ecd8" stroke={INK} strokeWidth={1.6} />
        <path d="M15 13H33M15 18H33M15 23H33M15 28H28" stroke="#6a5a4a" strokeWidth={1.3} />
        <path d="M27 36C29 33 33 33 34 36" fill="none" stroke="#2a3a6a" strokeWidth={1.4} />
      </>
    )
  }
  if (id === 'ammo') {
    return (
      <>
        <path d="M6 18H42V38H6Z" fill="#6a7a4a" stroke={INK} strokeWidth={1.6} />
        <path d="M4 14H44V18H4Z" fill="#5a6a3a" stroke={INK} strokeWidth={1.4} />
        <path d="M20 26H28" stroke="#e8dcb8" strokeWidth={2} />
        <path d="M14 22V34M34 22V34" stroke="#4a5a2a" strokeWidth={1.4} />
      </>
    )
  }
  if (id === 'flag') {
    return (
      <>
        <path d="M10 6V44" stroke="#5a4632" strokeWidth={3} strokeLinecap="round" />
        <path d="M12 8H40L33 15L40 22H12Z" fill="#fbfbf6" stroke={INK} strokeWidth={1.4} />
        <path d="M12 15H33L40 22H12Z" fill="#c8302a" />
      </>
    )
  }
  if (id === 'key') {
    return (
      <>
        <circle cx={16} cy={24} r={8} fill="none" stroke="#b8902a" strokeWidth={4} />
        <path
          d="M24 24H42M36 24V30M41 24V29"
          stroke="#b8902a"
          strokeWidth={4}
          strokeLinecap="round"
        />
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
