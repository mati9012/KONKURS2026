import type { IngredientId } from '@/content/bilgoraj'

const INK = '#3a2614'

function Jar({ fill, label }: { fill: string; label: string }) {
  return (
    <>
      <rect
        x={10}
        y={8}
        width={28}
        height={5}
        rx={2}
        fill="#a8743f"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d="M11 13H37V38C37 41 35 43 32 43H16C13 43 11 41 11 38Z"
        fill="#e8eef2"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path d="M12 22H36V38C36 40 34 42 32 42H16C14 42 12 40 12 38Z" fill={fill} />
      <rect
        x={15}
        y={26}
        width={18}
        height={9}
        rx={1.5}
        fill="#fbf0d6"
        stroke={INK}
        strokeWidth={0.8}
      />
      <text x={24} y={33} fontSize={6.5} textAnchor="middle" fill={INK} fontWeight={700}>
        {label}
      </text>
    </>
  )
}

function Glyph({ id }: { id: IngredientId }) {
  if (id === 'potatoes') {
    return (
      <>
        <ellipse cx={17} cy={30} rx={10} ry={7} fill="#c9a060" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={31} cy={28} rx={9} ry={7.5} fill="#d4ac6a" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={24} cy={19} rx={8} ry={6} fill="#c09656" stroke={INK} strokeWidth={1.6} />
        <circle cx={14} cy={28} r={1} fill={INK} />
        <circle cx={33} cy={26} r={1} fill={INK} />
        <circle cx={22} cy={18} r={1} fill={INK} />
      </>
    )
  }
  if (id === 'quark') {
    return (
      <>
        <path
          d="M8 34L24 14L40 34Z"
          fill="#fbf8ee"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path d="M8 34H40V38H8Z" fill="#e8e0cc" stroke={INK} strokeWidth={1.4} />
        <circle cx={22} cy={28} r={1.4} fill="#e2d8c0" />
        <circle cx={28} cy={24} r={1.2} fill="#e2d8c0" />
      </>
    )
  }
  if (id === 'kasza') return <Jar fill="#8a5a30" label="KASZA" />
  if (id === 'eggs') {
    return (
      <>
        <path d="M6 30C8 40 40 40 42 30Z" fill="#c9a26a" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={17} cy={27} rx={6} ry={8} fill="#fbf4e4" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={30} cy={26} rx={6} ry={8} fill="#f2e2c4" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={24} cy={30} rx={6} ry={7.5} fill="#fbf4e4" stroke={INK} strokeWidth={1.4} />
      </>
    )
  }
  if (id === 'cream') return <Jar fill="#fbf8ee" label="ŚMIET." />
  if (id === 'mint') {
    return (
      <>
        <path d="M24 42V14" stroke="#4a7a3a" strokeWidth={2} />
        {[
          [24, 16, -30],
          [24, 22, 30],
          [24, 28, -30],
          [24, 34, 30],
        ].map(([x, y, angle]) => (
          <ellipse
            key={`${y}`}
            cx={x + (angle > 0 ? 7 : -7)}
            cy={y}
            rx={8}
            ry={4.5}
            transform={`rotate(${angle} ${x + (angle > 0 ? 7 : -7)} ${y})`}
            fill="#6aaa5a"
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}
      </>
    )
  }
  if (id === 'sugar') return <Jar fill="#fdfdfd" label="CUKIER" />
  if (id === 'carrot') {
    return (
      <>
        <path
          d="M14 14L36 38L30 40Z"
          fill="#e8823a"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M14 14L8 6M14 14L12 4M14 14L18 5"
          stroke="#4a8a3a"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <path d="M22 24L25 22M27 30L30 28" stroke="#b85a20" strokeWidth={1.2} />
      </>
    )
  }
  return <Jar fill="#b8304a" label="KONFIT." />
}

export function IngredientIcon({ id, className }: { id: IngredientId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <Glyph id={id} />
    </svg>
  )
}
