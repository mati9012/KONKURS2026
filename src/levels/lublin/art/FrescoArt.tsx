import type { FrescoSceneId } from '@/content/lublin'

const INK = '#3a2418'
const GOLD = '#d9a83e'
const GOLD_LIGHT = '#f0cf72'
const BLUE = '#3f5f8e'
const BLUE_DARK = '#2c446a'
const RED = '#a8402e'
const OCHRE = '#d9a86a'
const SKIN = '#e8c49a'
const WHITE = '#f4ecdc'

const line = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const }

function Halo({ x, y, r = 22 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={GOLD} {...line} />
}

function Face({ x, y, r = 13 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r * 0.82} ry={r} fill={SKIN} {...line} />
      <path
        d={`M${x - r * 0.35} ${y - r * 0.1}h0.1M${x + r * 0.35} ${y - r * 0.1}h0.1`}
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

function Wing({ x, y, side }: { x: number; y: number; side: 1 | -1 }) {
  return (
    <path
      d={`M${x} ${y}C${x + side * 40} ${y - 30} ${x + side * 50} ${y + 10} ${x + side * 44} ${y + 60}C${x + side * 30} ${y + 40} ${x + side * 16} ${y + 30} ${x} ${y + 26}Z`}
      fill={WHITE}
      {...line}
    />
  )
}

function Majesty() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={70} ry={104} fill={BLUE_DARK} {...line} />
      <ellipse cx={0} cy={0} rx={58} ry={90} fill={BLUE} {...line} />
      <Halo x={0} y={-48} r={26} />
      <path d="M0 -74V-22M-26 -48H26" stroke={RED} strokeWidth={4} />
      <Face x={0} y={-46} r={14} />
      <path d="M-34 70C-40 20 -30 -20 0 -28C30 -20 40 20 34 70Z" fill={RED} {...line} />
      <path d="M-10 -24C-24 10 -20 50 -30 70H6C2 40 10 10 10 -24Z" fill={BLUE_DARK} {...line} />
      <path d="M22 -10L36 -34M36 -34L42 -40" stroke={SKIN} strokeWidth={8} strokeLinecap="round" />
      <rect x={-22} y={8} width={26} height={32} fill={GOLD_LIGHT} {...line} />
    </g>
  )
}

function Dove() {
  return (
    <g>
      <circle cx={0} cy={0} r={82} fill={GOLD} opacity={0.4} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2
        return (
          <path
            key={index}
            d={`M${Math.cos(angle) * 50} ${Math.sin(angle) * 50}L${Math.cos(angle) * 96} ${Math.sin(angle) * 96}`}
            stroke={GOLD_LIGHT}
            strokeWidth={5}
            strokeLinecap="round"
          />
        )
      })}
      <circle cx={0} cy={0} r={50} fill={BLUE} {...line} />
      <path d="M-8 6C-30 -18 -54 -20 -66 -10C-48 -6 -34 6 -24 18Z" fill={WHITE} {...line} />
      <path d="M8 6C30 -18 54 -20 66 -10C48 -6 34 6 24 18Z" fill={WHITE} {...line} />
      <ellipse cx={0} cy={10} rx={16} ry={26} fill={WHITE} {...line} />
      <circle cx={0} cy={-16} r={9} fill={WHITE} {...line} />
      <path d="M-4 -26L0 -34L4 -26" fill={OCHRE} {...line} />
      <path d="M-10 34L0 52L10 34Z" fill={WHITE} {...line} />
    </g>
  )
}

function Angel({ x, color }: { x: number; color: string }) {
  return (
    <g>
      <Wing x={x - 6} y={-30} side={-1} />
      <Wing x={x + 6} y={-30} side={1} />
      <Halo x={x} y={-52} r={20} />
      <Face x={x} y={-50} />
      <path
        d={`M${x - 26} 96C${x - 30} 30 ${x - 22} -20 ${x} -36C${x + 22} -20 ${x + 30} 30 ${x + 26} 96Z`}
        fill={color}
        {...line}
      />
      <path d={`M${x} -30V96`} stroke={INK} strokeWidth={1.5} opacity={0.5} />
    </g>
  )
}

function Angels() {
  return (
    <g>
      <Angel x={-44} color={RED} />
      <Angel x={44} color={BLUE} />
    </g>
  )
}

function Annunciation() {
  return (
    <g>
      <Wing x={-50} y={-40} side={-1} />
      <Halo x={-48} y={-50} r={18} />
      <Face x={-48} y={-48} r={12} />
      <path d="M-74 96C-76 30 -66 -18 -48 -34C-30 -18 -22 30 -24 96Z" fill={WHITE} {...line} />
      <path d="M-30 -10L20 -24" stroke={SKIN} strokeWidth={7} strokeLinecap="round" />
      <path d="M-20 -60L36 -36" stroke={GOLD_LIGHT} strokeWidth={4} strokeDasharray="6 6" />
      <Halo x={52} y={-40} r={20} />
      <path d="M26 96C24 20 32 -40 52 -60C72 -40 80 20 78 96Z" fill={BLUE_DARK} {...line} />
      <Face x={52} y={-38} r={12} />
      <path d="M40 -26C36 -10 36 6 42 14" fill="none" stroke={RED} strokeWidth={3} />
    </g>
  )
}

function King() {
  return (
    <g>
      <path d="M-22 -80L-22 -98L-11 -88L0 -104L11 -88L22 -98L22 -80Z" fill={GOLD} {...line} />
      <Face x={0} y={-62} r={16} />
      <path d="M-12 -52C-10 -36 10 -36 12 -52C6 -44 -6 -44 -12 -52Z" fill="#8a5a3a" {...line} />
      <path d="M-50 100C-56 30 -40 -24 0 -40C40 -24 56 30 50 100Z" fill={RED} {...line} />
      <path d="M-16 -36C-22 20 -18 70 -24 100H24C18 70 22 20 16 -36Z" fill={GOLD_LIGHT} {...line} />
      {[-10, 10, 30, 50, 70].map((y) => (
        <circle key={y} cx={0} cy={y} r={3} fill={RED} />
      ))}
      <path
        d="M-36 0C-20 -10 -10 -14 -4 -4M36 0C20 -10 10 -14 4 -4"
        stroke={SKIN}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  )
}

function FoundationPlaque() {
  return (
    <g>
      <rect x={-80} y={-96} width={160} height={192} rx={6} fill={RED} {...line} />
      <rect x={-68} y={-84} width={136} height={168} fill={WHITE} {...line} />
      {Array.from({ length: 8 }, (_, row) => (
        <path
          key={row}
          d={Array.from({ length: 7 }, (_, column) => {
            const x = -58 + column * 17
            const y = -64 + row * 20
            return column % 2 === 0
              ? `M${x} ${y}h10M${x + 5} ${y}v-10`
              : `M${x} ${y - 10}l5 10l5 -10M${x} ${y - 4}h10`
          }).join('')}
          stroke={INK}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path d="M-30 -100L0 -116L30 -100" fill="none" stroke={GOLD} strokeWidth={5} />
    </g>
  )
}

export function FrescoArt({ id }: { id: FrescoSceneId }) {
  if (id === 'majestat') return <Majesty />
  if (id === 'duch') return <Dove />
  if (id === 'aniolowie') return <Angels />
  if (id === 'zwiastowanie') return <Annunciation />
  if (id === 'krol') return <King />
  return <FoundationPlaque />
}
