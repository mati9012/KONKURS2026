import type { PredatorId } from '@/content/poleski-park-narodowy'

const INK = '#2a1e16'

function Fox() {
  return (
    <g>
      <path
        d="M-58 -30C-80 -40 -92 -20 -80 -8C-72 -2 -60 -14 -48 -20Z"
        fill="#c8642a"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path d="M-86 -14C-84 -8 -78 -6 -74 -8C-78 -10 -82 -12 -86 -14Z" fill="#fbf4e4" />
      <path
        d="M-50 -34C-34 -46 18 -46 30 -32C34 -22 26 -12 18 -12H-40C-52 -12 -58 -24 -50 -34Z"
        fill="#d4702e"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d="M-36 -12V6M-24 -12V6M6 -12V6M18 -14V6"
        stroke="#3a2418"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M22 -36L30 -58L38 -42L46 -56L50 -36C62 -32 72 -26 76 -20C68 -14 52 -14 40 -16C30 -18 22 -26 22 -36Z"
        fill="#d4702e"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M50 -22C58 -18 68 -18 76 -20C70 -14 56 -12 48 -16Z" fill="#fbf4e4" />
      <circle cx={76} cy={-20} r={3} fill={INK} />
      <path d="M44 -32L50 -30" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  )
}

function RaccoonDog() {
  return (
    <g>
      <path
        d="M-50 -24C-66 -28 -72 -16 -64 -8C-58 -4 -50 -12 -44 -16Z"
        fill="#6a5a46"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d="M-48 -26C-40 -48 18 -50 32 -30C38 -18 28 -6 16 -6H-36C-50 -6 -54 -16 -48 -26Z"
        fill="#8a7a62"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d="M-30 -42C-10 -50 10 -48 24 -40"
        stroke="#4a3e30"
        strokeWidth={5}
        fill="none"
        opacity={0.6}
      />
      <path
        d="M-30 -6V8M-18 -6V8M6 -6V8M18 -8V8"
        stroke="#2a2420"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M24 -30C24 -44 34 -50 46 -48L50 -58L54 -46C62 -42 68 -34 70 -26C60 -20 40 -18 30 -22Z"
        fill="#b8a888"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M38 -36C42 -42 52 -42 56 -34C52 -30 42 -30 38 -36Z" fill="#2a2420" />
      <circle cx={48} cy={-36} r={2.2} fill="#f4ecd8" />
      <circle cx={70} cy={-26} r={3} fill={INK} />
    </g>
  )
}

function Badger() {
  return (
    <g>
      <path
        d="M-56 -20C-50 -42 14 -46 34 -26C40 -16 32 -4 18 -4H-44C-56 -4 -60 -12 -56 -20Z"
        fill="#9a9a94"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d="M-50 -14C-30 -20 0 -22 30 -16"
        stroke="#6a6a64"
        strokeWidth={4}
        fill="none"
        opacity={0.6}
      />
      <path
        d="M-40 -4V8M-28 -4V8M4 -4V8M18 -6V8"
        stroke="#1e1e1a"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M28 -30C36 -40 52 -38 64 -26C70 -20 74 -16 76 -14C64 -10 44 -10 32 -16Z"
        fill="#fbfbf4"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path d="M36 -34C46 -30 58 -22 72 -16L74 -12C58 -16 44 -22 32 -28Z" fill="#1e1e1a" />
      <circle cx={76} cy={-14} r={3} fill={INK} />
      <circle cx={32} cy={-34} r={4} fill="#1e1e1a" />
    </g>
  )
}

export function PredatorArt({ kind }: { kind: PredatorId }) {
  return (
    <g>
      <ellipse cx={0} cy={8} rx={70} ry={8} fill="#1c2a14" opacity={0.25} />
      {kind === 'fox' && <Fox />}
      {kind === 'raccoon-dog' && <RaccoonDog />}
      {kind === 'badger' && <Badger />}
    </g>
  )
}
