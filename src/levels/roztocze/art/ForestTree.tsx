import { blobPath } from '@/components/watercolor/paint'
import { PAINT } from '@/components/watercolor/WatercolorDefs'
import type { TreeId } from '@/content/roztocze'

const INK = '#2f2418'

function Shadow({ width }: { width: number }) {
  return <ellipse cx={0} cy={4} rx={width} ry={10} fill="#2c3a1c" opacity={0.25} />
}

function Beech() {
  return (
    <g>
      <Shadow width={90} />
      <path d="M-12 4L-8 -120L8 -120L12 4Z" fill="#9aa0a0" stroke={INK} strokeWidth={2} />
      <path
        d="M-4 -60L-30 -110M4 -80L30 -124"
        stroke="#9aa0a0"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <g filter={PAINT}>
        <path d={blobPath(0, -170, 110, 80, 3, 0.16)} fill="#7aa04e" />
        <path d={blobPath(-30, -195, 60, 40, 4, 0.2)} fill="#9cbc62" />
        <path d={blobPath(40, -150, 50, 36, 5, 0.2)} fill="#668c42" />
      </g>
      {[
        [-70, -150],
        [60, -200],
        [10, -230],
        [-50, -210],
        [80, -160],
      ].map(([x, y]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx={9}
          ry={5}
          fill="#b4d07a"
          transform={`rotate(-25 ${x} ${y})`}
        />
      ))}
    </g>
  )
}

function Fir() {
  const tiers = [0, 1, 2, 3, 4]
  return (
    <g>
      <Shadow width={60} />
      <rect x={-8} y={-50} width={16} height={54} fill="#7a6a5a" stroke={INK} strokeWidth={2} />
      {tiers.map((tier) => {
        const top = -280 + tier * 46
        const half = 26 + tier * 15
        return (
          <path
            key={tier}
            d={`M0 ${top}L${half} ${top + 70}Q0 ${top + 60} ${-half} ${top + 70}Z`}
            fill={tier % 2 ? '#2f5a40' : '#36664a'}
            stroke={INK}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        )
      })}
      {[
        [-12, -240],
        [10, -236],
        [-26, -196],
        [24, -192],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 4}
          y={y - 16}
          width={8}
          height={18}
          rx={4}
          fill="#6a4a6a"
          stroke={INK}
          strokeWidth={1}
        />
      ))}
    </g>
  )
}

function Sycamore() {
  const leaves = [
    [-90, -160],
    [-60, -230],
    [10, -250],
    [80, -220],
    [100, -150],
  ]
  return (
    <g>
      <Shadow width={100} />
      <path d="M-14 4L-9 -130L9 -130L14 4Z" fill="#7d6f62" stroke={INK} strokeWidth={2} />
      <path d="M-6 -40L-4 -100M5 -20L3 -90" stroke="#5e5248" strokeWidth={2} />
      <g filter={PAINT}>
        <path d={blobPath(0, -175, 120, 85, 13, 0.18)} fill="#5f8a3e" />
        <path d={blobPath(30, -200, 60, 44, 14, 0.2)} fill="#7aa14c" />
      </g>
      {leaves.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          transform={`translate(${x} ${y}) scale(1.4)`}
          d="M0 8L-3 2L-10 2L-6 -2L-9 -9L-2 -5L0 -12L2 -5L9 -9L6 -2L10 2L3 2Z"
          fill="#8ab858"
          stroke={INK}
          strokeWidth={0.8}
        />
      ))}
    </g>
  )
}

function Yew() {
  const berries = [
    [-40, -90],
    [30, -110],
    [0, -70],
    [50, -80],
    [-20, -130],
    [-55, -60],
  ]
  return (
    <g>
      <Shadow width={80} />
      <path d="M-14 4L-12 -50L12 -50L14 4Z" fill="#8a4a36" stroke={INK} strokeWidth={2} />
      <path d="M-10 -10L-4 -14M4 -30L10 -34M-8 -40L-2 -44" stroke="#c07a5a" strokeWidth={2} />
      <g filter={PAINT}>
        <path d={blobPath(0, -100, 85, 70, 21, 0.18)} fill="#1f3a2a" />
        <path d={blobPath(-20, -125, 45, 34, 22, 0.2)} fill="#2a4a34" />
      </g>
      {berries.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={6}
          fill="#d9332a"
          stroke="#6a1410"
          strokeWidth={1}
        />
      ))}
    </g>
  )
}

function Spruce() {
  const tiers = [0, 1, 2, 3, 4, 5]
  return (
    <g>
      <Shadow width={60} />
      <rect x={-7} y={-40} width={14} height={44} fill="#6a4a36" stroke={INK} strokeWidth={2} />
      {tiers.map((tier) => {
        const top = -310 + tier * 46
        const half = 20 + tier * 13
        return (
          <path
            key={tier}
            d={`M0 ${top}L${half} ${top + 64}L${half * 0.7} ${top + 58}L${half * 0.85} ${top + 72}Q0 ${top + 62} ${-half * 0.85} ${top + 72}L${-half * 0.7} ${top + 58}L${-half} ${top + 64}Z`}
            fill={tier % 2 ? '#24483a' : '#2a5242'}
            stroke={INK}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        )
      })}
      {[
        [-30, -150],
        [34, -110],
        [-44, -80],
        [20, -200],
      ].map(([x, y]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y + 14}
          rx={6}
          ry={15}
          fill="#8a5a36"
          stroke={INK}
          strokeWidth={1}
        />
      ))}
    </g>
  )
}

export function ForestTree({ tree }: { tree: TreeId }) {
  if (tree === 'beech') return <Beech />
  if (tree === 'fir') return <Fir />
  if (tree === 'sycamore') return <Sycamore />
  if (tree === 'yew') return <Yew />
  return <Spruce />
}
