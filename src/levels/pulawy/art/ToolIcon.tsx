import type { ToolId } from '@/content/pulawy'

const INK = '#2a1e16'

function Glyph({ id }: { id: ToolId }) {
  if (id === 'water') {
    return (
      <>
        <path d="M10 18H32V40H10Z" fill="#6a9ab8" stroke={INK} strokeWidth={1.6} />
        <path d="M32 24L44 14L46 17L34 30" fill="#6a9ab8" stroke={INK} strokeWidth={1.4} />
        <path d="M14 18C14 8 28 8 28 18" fill="none" stroke={INK} strokeWidth={2.4} />
        <path
          d="M42 20l2 6M46 18l3 5M38 22l1 6"
          stroke="#4a8ac8"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path d="M12 26H30" stroke="#a8c8e0" strokeWidth={2} />
      </>
    )
  }
  if (id === 'fertilizer') {
    return (
      <>
        <path
          d="M12 12C10 20 8 34 12 42H36C40 34 38 20 36 12C30 14 18 14 12 12Z"
          fill="#e8d8a8"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path
          d="M12 12C16 8 20 10 24 7C28 10 32 8 36 12"
          fill="none"
          stroke={INK}
          strokeWidth={1.4}
        />
        <text x={24} y={32} textAnchor="middle" fontSize={10} fontWeight={800} fill="#3a6a3a">
          NPK
        </text>
        <path
          d="M18 20C20 17 22 17 24 20C26 17 28 17 30 20"
          stroke="#5a8a3a"
          strokeWidth={1.6}
          fill="none"
        />
      </>
    )
  }
  if (id === 'hoe') {
    return (
      <>
        <path d="M10 42L36 10" stroke="#8a5a34" strokeWidth={4} strokeLinecap="round" />
        <path
          d="M30 8L44 8L42 18L32 16Z"
          fill="#8a9098"
          stroke={INK}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <path
          d="M8 42C10 36 14 36 16 42M18 42C19 38 22 38 23 42"
          stroke="#5a8a3a"
          strokeWidth={2}
          fill="none"
        />
      </>
    )
  }
  return (
    <>
      <ellipse
        cx={16}
        cy={16}
        rx={8}
        ry={6}
        fill="#e8f0f8"
        stroke={INK}
        strokeWidth={1}
        opacity={0.9}
      />
      <ellipse
        cx={32}
        cy={16}
        rx={8}
        ry={6}
        fill="#e8f0f8"
        stroke={INK}
        strokeWidth={1}
        opacity={0.9}
      />
      <ellipse cx={24} cy={28} rx={13} ry={10} fill="#f4c43a" stroke={INK} strokeWidth={1.6} />
      <path d="M18 19V37M24 18V38M30 19V37" stroke={INK} strokeWidth={3} />
      <circle cx={36} cy={27} r={5} fill="#3a2a1a" />
      <path d="M11 28H6" stroke={INK} strokeWidth={1.6} />
    </>
  )
}

export function ToolIcon({
  id,
  className,
  size,
}: {
  id: ToolId
  className?: string
  size?: number
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} width={size} height={size}>
      <Glyph id={id} />
    </svg>
  )
}
