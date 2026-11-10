const INK = '#2a1e16'

export type CropKind = 'sunflower' | 'rapeseed' | 'bean'

const LEAF = '#5f8a3a'
const DRY = '#a8a04a'

function Bloom({ kind, open }: { kind: CropKind; open: boolean }) {
  if (kind === 'sunflower') {
    return open ? (
      <g>
        {Array.from({ length: 12 }, (_, index) => (
          <ellipse
            key={index}
            cx={0}
            cy={-20}
            rx={6}
            ry={14}
            fill="#f4c43a"
            stroke={INK}
            strokeWidth={0.8}
            transform={`rotate(${index * 30})`}
          />
        ))}
        <circle r={13} fill="#6a4a22" stroke={INK} strokeWidth={1.2} />
      </g>
    ) : (
      <circle r={10} fill="#7a9a3a" stroke={INK} strokeWidth={1.2} />
    )
  }
  if (kind === 'rapeseed') {
    return (
      <g>
        {[
          [-10, 0],
          [8, -6],
          [0, -16],
          [12, 8],
          [-6, 12],
        ].map(([x, y]) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={open ? 7 : 4}
            fill={open ? '#f4e04a' : '#a8b84a'}
            stroke={INK}
            strokeWidth={0.8}
          />
        ))}
      </g>
    )
  }
  return (
    <g>
      {[
        [-8, 0],
        [8, 6],
      ].map(([x, y]) =>
        open ? (
          <path
            key={x}
            d={`M${x} ${y}c-4 10 -2 22 4 26c2 -8 2 -18 -4 -26Z`}
            fill="#7aaa4a"
            stroke={INK}
            strokeWidth={0.9}
          />
        ) : (
          <circle key={x} cx={x} cy={y} r={5} fill="#f4f0f8" stroke={INK} strokeWidth={0.8} />
        ),
      )}
    </g>
  )
}

export function CropArt({
  kind,
  growth,
  thirsty,
  weedy,
}: {
  kind: CropKind
  growth: number
  thirsty: boolean
  weedy: boolean
}) {
  const height = 30 + growth * 34
  const leaf = thirsty ? DRY : LEAF
  const droop = thirsty ? 14 : 0
  return (
    <g>
      <path
        d="M-46 4C-30 -6 30 -6 46 4C30 12 -30 12 -46 4Z"
        fill="#6a4a2a"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d={`M0 0C${-4 - droop / 2} ${-height * 0.4} ${4 + droop} ${-height * 0.7} ${droop / 2} ${-height}`}
        stroke={leaf}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      {Array.from({ length: 1 + growth }, (_, index) => {
        const y = -14 - index * 26
        const side = index % 2 === 0 ? -1 : 1
        return (
          <path
            key={index}
            d={`M0 ${y}C${side * 14} ${y - 14 + droop} ${side * 30} ${y - 6 + droop} ${side * 34} ${y + 4 + droop * 1.4}C${side * 22} ${y + 6 + droop} ${side * 10} ${y + 4} 0 ${y}Z`}
            fill={leaf}
            stroke={INK}
            strokeWidth={1}
          />
        )
      })}
      {growth >= 2 && (
        <g transform={`translate(${droop / 2} ${-height})`}>
          <Bloom kind={kind} open={growth >= 3} />
        </g>
      )}
      {weedy &&
        [-38, -24, 22, 36].map((x) => (
          <path
            key={x}
            d={`M${x} 4l-6 -22M${x} 4l2 -26M${x} 4l8 -18`}
            stroke="#3a6a2a"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
    </g>
  )
}
