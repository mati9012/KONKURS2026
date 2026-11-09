import { motion } from 'motion/react'
import type { HejnalDirection } from '@/content/zamosc'

const INK = '#3a2614'
const SKIN = '#f1c9a5'
const COAT = '#b03a2e'
const COAT_DARK = '#8a2a22'
const HOSE = '#2f3e63'
const GOLD = '#e0b04a'
const CAP = '#2a2440'

type TrumpeterProps = {
  x: number
  y: number
  size: number
  facing: HejnalDirection
  playing: boolean
}

function Legs() {
  return (
    <g fill={HOSE} stroke={INK} strokeWidth={1.2}>
      <rect x={-13} y={-34} width={10} height={34} rx={3} />
      <rect x={3} y={-34} width={10} height={34} rx={3} />
      <ellipse cx={-8} cy={0} rx={8} ry={3.5} fill="#3a2a1e" />
      <ellipse cx={8} cy={0} rx={8} ry={3.5} fill="#3a2a1e" />
    </g>
  )
}

function Coat({ back }: { back: boolean }) {
  return (
    <>
      <path
        d="M-22 -32C-22 -58 -18 -74 0 -76C18 -74 22 -58 22 -32Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M-22 -36H22V-30H-22Z" fill={GOLD} stroke={INK} strokeWidth={1} />
      {!back && <path d="M0 -75V-36" stroke={GOLD} strokeWidth={3} strokeDasharray="4 4" />}
      <path d="M-16 -76Q0 -68 16 -76L12 -82H-12Z" fill="#f3ead8" stroke={INK} strokeWidth={1} />
    </>
  )
}

function Head({ view }: { view: 'front' | 'back' | 'side' }) {
  return (
    <>
      <circle
        cx={0}
        cy={-94}
        r={14}
        fill={view === 'back' ? '#6b4a32' : SKIN}
        stroke={INK}
        strokeWidth={1.4}
      />
      {view === 'side' && (
        <>
          <path d="M12 -96L18 -92L12 -90" fill={SKIN} stroke={INK} strokeWidth={1.2} />
          <circle cx={7} cy={-97} r={1.6} fill={INK} />
          <path d="M-14 -96Q-12 -84 -4 -82L-6 -96Z" fill="#6b4a32" />
        </>
      )}
      {view === 'front' && (
        <>
          <circle cx={-5} cy={-96} r={1.6} fill={INK} />
          <circle cx={5} cy={-96} r={1.6} fill={INK} />
          <path d="M-4 -88Q0 -86 4 -88" stroke={INK} strokeWidth={1.2} fill="none" />
        </>
      )}
      <path d="M-17 -100C-16 -116 16 -116 17 -100Z" fill={CAP} stroke={INK} strokeWidth={1.2} />
      <path
        d="M8 -110C18 -122 30 -118 34 -126"
        stroke="#f3ead8"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </>
  )
}

function Trumpet({ length }: { length: number }) {
  return (
    <g stroke={INK} strokeWidth={1.2} strokeLinejoin="round">
      <rect x={0} y={-2.5} width={length} height={5} rx={2} fill={GOLD} />
      <path d={`M${length - 4} -3L${length + 14} -12V12L${length - 4} 3Z`} fill={GOLD} />
      <path d={`M${length * 0.3} -2.5V-8H${length * 0.55}V-2.5`} fill="none" />
      <rect x={-6} y={-3} width={7} height={6} rx={2} fill="#c9943a" />
    </g>
  )
}

function SideView({ playing }: { playing: boolean }) {
  return (
    <>
      <g transform="scale(0.8 1)">
        <Legs />
        <Coat back={false} />
      </g>
      <Head view="side" />
      {playing ? (
        <>
          <path
            d="M-4 -66Q12 -78 18 -90"
            stroke={COAT_DARK}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
          />
          <g transform="translate(18 -90) rotate(-8)">
            <Trumpet length={46} />
          </g>
        </>
      ) : (
        <>
          <path
            d="M-2 -70Q2 -54 4 -42"
            stroke={COAT_DARK}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
          />
          <g transform="translate(6 -40) rotate(80)">
            <Trumpet length={38} />
          </g>
        </>
      )}
    </>
  )
}

function FrontView({ playing }: { playing: boolean }) {
  return (
    <>
      <Legs />
      <Coat back={false} />
      <Head view="front" />
      {playing ? (
        <>
          <path
            d="M-20 -68Q-24 -84 -8 -90M20 -68Q24 -84 8 -90"
            stroke={COAT_DARK}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={0} cy={-88} r={14} fill={GOLD} stroke={INK} strokeWidth={1.4} />
          <circle cx={0} cy={-88} r={7} fill="#7a5a1e" />
        </>
      ) : (
        <>
          <path
            d="M20 -70Q26 -56 24 -44"
            stroke={COAT_DARK}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
          />
          <g transform="translate(24 -46) rotate(88)">
            <Trumpet length={36} />
          </g>
        </>
      )}
    </>
  )
}

function BackView({ playing }: { playing: boolean }) {
  return (
    <>
      <Legs />
      <Coat back />
      {playing && (
        <path
          d="M-20 -68Q-22 -84 -10 -92M20 -68Q22 -84 10 -92"
          stroke={COAT_DARK}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />
      )}
      <Head view="back" />
      {playing && <path d="M-10 -112L0 -132L10 -112Z" fill={GOLD} stroke={INK} strokeWidth={1.2} />}
    </>
  )
}

export function Trumpeter({ x, y, size, facing, playing }: TrumpeterProps) {
  const scale = size / 130
  const mirror = facing === 'west' ? -1 : 1
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={0} rx={30} ry={6} fill="#2a1a10" opacity={0.25} />
      <motion.g
        key={facing}
        initial={{ scaleX: 0.2, opacity: 0.4 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.g
          animate={playing ? { y: [0, -2, 0] } : { y: 0 }}
          transition={playing ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }}
        >
          <g transform={`scale(${mirror} 1)`}>
            {(facing === 'east' || facing === 'west') && <SideView playing={playing} />}
            {facing === 'south' && <FrontView playing={playing} />}
            {facing === 'north' && <BackView playing={playing} />}
          </g>
        </motion.g>
      </motion.g>
    </g>
  )
}
