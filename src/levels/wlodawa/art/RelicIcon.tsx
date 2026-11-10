import type { RelicId } from '@/content/wlodawa'

const INK = '#2a1e16'
const GOLD = '#d8a83a'

function Glyph({ id }: { id: RelicId }) {
  if (id === 'aron') {
    return (
      <>
        <path d="M10 44V16C10 10 38 10 38 16V44Z" fill="#e8dcc0" stroke={INK} strokeWidth={1.6} />
        <path d="M16 42V22C16 18 32 18 32 22V42Z" fill="#7a2a3a" stroke={INK} strokeWidth={1.4} />
        <path d="M24 20V42M16 30H32" stroke={GOLD} strokeWidth={1.2} />
        <path
          d="M18 8C18 4 23 4 23 8V13H18ZM25 8C25 4 30 4 30 8V13H25Z"
          fill="#f4ecd8"
          stroke={INK}
        />
        <path d="M8 44H40" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      </>
    )
  }
  if (id === 'iconostasis') {
    return (
      <>
        <rect x={5} y={8} width={38} height={36} fill="#c8963a" stroke={INK} strokeWidth={1.6} />
        {[10, 20].map((y) =>
          [8, 16, 26, 34].map((x) => (
            <g key={`${x}-${y}`}>
              <rect
                x={x}
                y={y}
                width={6}
                height={8}
                fill="#7a3a2a"
                stroke={INK}
                strokeWidth={0.8}
              />
              <circle cx={x + 3} cy={y + 3} r={1.6} fill={GOLD} />
            </g>
          )),
        )}
        <path d="M19 44V34C19 30 29 30 29 34V44Z" fill="#f4d47a" stroke={INK} strokeWidth={1.2} />
        <path d="M24 31V44" stroke={INK} strokeWidth={0.8} />
        <path d="M24 2V8M21 4H27" stroke={INK} strokeWidth={1.6} />
      </>
    )
  }
  if (id === 'organ') {
    return (
      <>
        <rect x={6} y={30} width={36} height={14} fill="#8a5a34" stroke={INK} strokeWidth={1.6} />
        {[
          [9, 18],
          [14, 12],
          [19, 7],
          [24, 4],
          [29, 7],
          [34, 12],
          [39, 18],
        ].map(([x, top]) => (
          <g key={x}>
            <rect
              x={x - 2}
              y={top}
              width={4}
              height={30 - top}
              fill="#c8ccd0"
              stroke={INK}
              strokeWidth={0.9}
            />
            <path d={`M${x - 2} ${top + 4}h4`} stroke={INK} strokeWidth={0.8} />
          </g>
        ))}
        <path d="M10 37H38" stroke="#f4ecd8" strokeWidth={2.4} strokeDasharray="2 1" />
      </>
    )
  }
  if (id === 'bima') {
    return (
      <>
        <path d="M6 40H42V44H6Z" fill="#8a6a4a" stroke={INK} strokeWidth={1.4} />
        <path d="M10 40V28H38V40" fill="#c8a878" stroke={INK} strokeWidth={1.4} />
        {[14, 19, 24, 29, 34].map((x) => (
          <path key={x} d={`M${x} 28V40`} stroke="#6a4a2a" strokeWidth={1.4} />
        ))}
        <path d="M8 28H40" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        <path d="M18 24L24 18L30 24Z" fill="#6a2a3a" stroke={INK} strokeWidth={1.2} />
        <path d="M24 18V10M20 12H28" stroke={INK} strokeWidth={1.4} />
        <rect
          x={19}
          y={6}
          width={10}
          height={6}
          rx={1}
          fill="#f4ecd8"
          stroke={INK}
          strokeWidth={1}
        />
      </>
    )
  }
  if (id === 'onion-dome') {
    return (
      <>
        <path
          d="M24 3V10M20.5 5.5H27.5M21 8.5L27 7"
          stroke={GOLD}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M24 10C30 16 36 20 34 28C33 32 15 32 14 28C12 20 18 16 24 10Z"
          fill="#3a8a6a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M20 18C18 22 18 26 19 29" stroke="#8ac8a8" strokeWidth={1.6} fill="none" />
        <rect x={15} y={30} width={18} height={14} fill="#f2eadc" stroke={INK} strokeWidth={1.4} />
        <path d="M19 44V36C19 33 22 33 22 36V44M26 44V36C26 33 29 33 29 36V44" fill="#4a5a6a" />
      </>
    )
  }
  if (id === 'twin-towers') {
    return (
      <>
        {[12, 36].map((x) => (
          <g key={x}>
            <rect
              x={x - 6}
              y={20}
              width={12}
              height={24}
              fill="#f2e6c8"
              stroke={INK}
              strokeWidth={1.4}
            />
            <path
              d={`M${x - 6} 20C${x - 6} 14 ${x + 6} 14 ${x + 6} 20Z`}
              fill="#5a6a6a"
              stroke={INK}
              strokeWidth={1.2}
            />
            <path
              d={`M${x - 3} 15C${x - 4} 10 ${x + 4} 10 ${x + 3} 15Z`}
              fill="#5a6a6a"
              stroke={INK}
              strokeWidth={1}
            />
            <path d={`M${x} 10V4M${x - 2} 6H${x + 2}`} stroke={INK} strokeWidth={1.2} />
            <path d={`M${x - 2} 34V27C${x - 2} 24 ${x + 2} 24 ${x + 2} 27V34Z`} fill="#4a3a2a" />
          </g>
        ))}
        <path d="M18 44V28C18 24 30 24 30 28V44Z" fill="#f8eed4" stroke={INK} strokeWidth={1.2} />
        <path d="M21 44V36C21 33 27 33 27 36V44Z" fill="#6a4a2a" />
      </>
    )
  }
  if (id === 'shofar') {
    return (
      <>
        <path
          d="M6 38C14 40 26 36 32 26C36 18 38 12 44 8C42 14 42 20 38 28C32 40 16 46 6 42Z"
          fill="#d8b47a"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M14 40C14 38 14 42 14 42M22 37C22 35 23 40 23 40M30 31C30 29 32 34 32 34"
          stroke="#8a6a3a"
          strokeWidth={1.4}
        />
        <ellipse cx={42} cy={10} rx={3} ry={4} fill="#5a3a1a" transform="rotate(30 42 10)" />
      </>
    )
  }
  if (id === 'icon') {
    return (
      <>
        <rect
          x={9}
          y={4}
          width={30}
          height={40}
          rx={2}
          fill={GOLD}
          stroke={INK}
          strokeWidth={1.6}
        />
        <rect x={13} y={8} width={22} height={32} fill="#7a3a2a" />
        <circle cx={24} cy={17} r={7} fill="#f4d47a" stroke={INK} strokeWidth={0.8} />
        <circle cx={24} cy={18} r={4} fill="#d8b08a" stroke={INK} strokeWidth={0.8} />
        <path d="M16 40C16 28 32 28 32 40Z" fill="#3a5a7a" stroke={INK} strokeWidth={0.8} />
        <path d="M24 28V38M21 31H27" stroke="#f4ecd8" strokeWidth={1.4} />
      </>
    )
  }
  return (
    <>
      <path d="M10 18C10 28 38 28 38 18Z" fill="#e8dcc8" stroke={INK} strokeWidth={1.6} />
      <path d="M9 16H39V19H9Z" fill="#c8a060" stroke={INK} strokeWidth={1.2} />
      <path d="M14 16C14 8 34 8 34 16Z" fill="#c8a060" stroke={INK} strokeWidth={1.4} />
      <path d="M24 9V3M21.5 5H26.5" stroke={GOLD} strokeWidth={1.6} />
      <path
        d="M20 26C18 32 22 36 20 40H28C26 36 30 32 28 26Z"
        fill="#e8dcc8"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M14 40H34V44H14Z" fill="#c8a060" stroke={INK} strokeWidth={1.4} />
      <path d="M16 20C20 22 28 22 32 20" stroke="#8a6a4a" strokeWidth={1} fill="none" />
    </>
  )
}

export function RelicIcon({
  id,
  className,
  size,
}: {
  id: RelicId
  className?: string
  size?: number
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} width={size} height={size}>
      <Glyph id={id} />
    </svg>
  )
}
