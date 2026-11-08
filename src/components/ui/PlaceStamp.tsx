import { useId } from 'react'

type PlaceStampProps = {
  name: string
  earned: boolean
  className?: string
}

const INK = '#a8322a'

export function PlaceStamp({ name, earned, className = '' }: PlaceStampProps) {
  const arcId = useId()
  const bottomArcId = useId()
  const label = name.toUpperCase()

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={earned ? `Pieczęć: ${name}` : `Brak pieczęci: ${name}`}
      className={className}
    >
      <defs>
        <path id={arcId} d="M 22 60 A 38 38 0 1 1 98 60" />
        <path id={bottomArcId} d="M 18 60 A 42 42 0 0 0 102 60" />
      </defs>
      {earned ? (
        <g fill="none" stroke={INK} opacity={0.88}>
          <circle cx="60" cy="60" r="54" strokeWidth="4" />
          <circle cx="60" cy="60" r="46" strokeWidth="1.5" />
          <text
            fill={INK}
            stroke="none"
            fontSize={label.length > 14 ? 9 : 12}
            fontWeight="700"
            letterSpacing="1.5"
            className="font-display"
          >
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              {label}
            </textPath>
          </text>
          <g fill={INK} stroke="none">
            <path d="M60 58c-9 0-17 8-17 16 0 6 5 9 10 8 3-1 5-2 7-2s4 1 7 2c5 1 10-2 10-8 0-8-8-16-17-16z" />
            <ellipse cx="42" cy="54" rx="5" ry="7" transform="rotate(-25 42 54)" />
            <ellipse cx="52" cy="45" rx="5" ry="7.5" transform="rotate(-8 52 45)" />
            <ellipse cx="68" cy="45" rx="5" ry="7.5" transform="rotate(8 68 45)" />
            <ellipse cx="78" cy="54" rx="5" ry="7" transform="rotate(25 78 54)" />
            <path d="M38 46l-3-6 6 4zM50 36l-1-7 4 6zM70 36l1-7-4 6zM82 46l3-6-6 4z" />
          </g>
          <text
            fill={INK}
            stroke="none"
            fontSize="8"
            fontWeight="700"
            letterSpacing="2"
            className="font-display"
          >
            <textPath href={`#${bottomArcId}`} startOffset="50%" textAnchor="middle">
              CZARCIA ŁAPA
            </textPath>
          </text>
        </g>
      ) : (
        <g fill="none" stroke="#b8894f" opacity={0.7}>
          <circle cx="60" cy="60" r="52" strokeWidth="2.5" strokeDasharray="6 7" />
          <text
            x="60"
            y="64"
            fill="#8a5a2b"
            stroke="none"
            fontSize={name.length > 14 ? 9 : 12}
            fontWeight="600"
            textAnchor="middle"
            className="font-display"
          >
            {name}
          </text>
        </g>
      )}
    </svg>
  )
}
