import type { GoodId } from '@/content/wlodawa'

const INK = '#2a1e16'

function Glyph({ id }: { id: GoodId }) {
  if (id === 'bread') {
    return (
      <>
        <path
          d="M5 32C4 22 14 15 24 15C34 15 44 22 43 32C42 36 6 36 5 32Z"
          fill="#c8843a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M6 31C14 34 34 34 42 31" stroke="#8a5424" strokeWidth={1.4} fill="none" />
        <path
          d="M15 20L19 27M23 18L27 26M31 19L34 26"
          stroke="#f2d49a"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </>
    )
  }
  if (id === 'boots') {
    return (
      <>
        <path
          d="M8 10H18V30C22 31 28 33 28 37V40H8Z"
          fill="#6a4228"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M20 8H30V28C34 29 41 31 41 36V39H20Z"
          fill="#8a5a34"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path d="M20 35H41M8 36H28" stroke="#2a1a10" strokeWidth={2.4} />
        <path d="M20 12H30M8 14H18" stroke="#c8a070" strokeWidth={1.4} />
      </>
    )
  }
  if (id === 'pot') {
    return (
      <>
        <path
          d="M12 14C8 20 8 34 14 40H34C40 34 40 20 36 14Z"
          fill="#b8643a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M10 12H38V16H10Z" fill="#a8542e" stroke={INK} strokeWidth={1.4} />
        <path
          d="M36 18C44 18 44 30 36 30"
          fill="none"
          stroke={INK}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <path d="M12 24C20 27 28 27 36 24" stroke="#f2c49a" strokeWidth={1.6} fill="none" />
        <path d="M13 30C20 33 28 33 35 30" stroke="#8a4424" strokeWidth={1.2} fill="none" />
      </>
    )
  }
  if (id === 'cloth') {
    return (
      <>
        <path
          d="M8 14H34V36H8Z"
          fill="#3a6a9a"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <ellipse cx={34} cy={25} rx={6} ry={11} fill="#4a7aaa" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={34} cy={25} rx={2} ry={4} fill="#2a4a6a" />
        <path d="M8 36C12 40 20 42 26 40" stroke="#3a6a9a" strokeWidth={5} strokeLinecap="round" />
        <path d="M12 18V32M18 18V32M24 18V32" stroke="#c8d8e8" strokeWidth={1.2} opacity={0.7} />
      </>
    )
  }
  if (id === 'fish') {
    return (
      <>
        <path
          d="M6 24C12 14 28 12 36 22L44 14V34L36 26C28 36 12 34 6 24Z"
          fill="#8aa4a8"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path d="M14 18C18 24 18 28 14 31" stroke="#5a7478" strokeWidth={1.4} fill="none" />
        <path d="M20 22l3 2l-3 2M25 22l3 2l-3 2" stroke="#e4eef0" strokeWidth={1.2} fill="none" />
        <circle cx={11} cy={22} r={1.8} fill={INK} />
      </>
    )
  }
  if (id === 'candles') {
    return (
      <>
        {[
          [12, 18],
          [22, 12],
          [32, 20],
        ].map(([x, top]) => (
          <g key={x}>
            <rect
              x={x}
              y={top}
              width={6}
              height={40 - top}
              rx={1}
              fill="#f4e8c4"
              stroke={INK}
              strokeWidth={1.4}
            />
            <path
              d={`M${x + 3} ${top - 1}C${x} ${top - 5} ${x + 3} ${top - 9} ${x + 3} ${top - 10}C${x + 6} ${top - 6} ${x + 6} ${top - 3} ${x + 3} ${top - 1}Z`}
              fill="#f4b43a"
              stroke="#c8641a"
              strokeWidth={0.8}
            />
          </g>
        ))}
        <path d="M8 40H42" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      </>
    )
  }
  return (
    <>
      <path
        d="M12 16C10 22 10 36 14 40H34C38 36 38 22 36 16Z"
        fill="#e8a83a"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path d="M12 12H36V17H12Z" fill="#f4e4c0" stroke={INK} strokeWidth={1.4} />
      <path d="M12 12L14 8H34L36 12" fill="#c8a070" stroke={INK} strokeWidth={1.2} />
      <rect x={16} y={24} width={16} height={9} rx={2} fill="#f8f0d8" stroke={INK} />
      <path d="M20 28.5h8" stroke="#8a5a2a" strokeWidth={1.4} />
      <path d="M16 18C17 21 15 22 15 24" stroke="#f4c45a" strokeWidth={2} strokeLinecap="round" />
    </>
  )
}

export function GoodIcon({
  id,
  className,
  size,
}: {
  id: GoodId
  className?: string
  size?: number
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} width={size} height={size}>
      <Glyph id={id} />
    </svg>
  )
}
