const INK = '#2a1e16'

export type CustomerMood = 'waiting' | 'happy' | 'puzzled'

const LOOKS = [
  { coat: '#6a4a7a', trim: '#c8b4d8', hat: 'cap', skin: '#f0c8a0', hair: '#4a3020' },
  { coat: '#3a6a5a', trim: '#a8d0c0', hat: 'kerchief', skin: '#e8b890', hair: '#7a4a2a' },
  { coat: '#8a4a2a', trim: '#e8c09a', hat: 'hat', skin: '#f4d0b0', hair: '#2a2020' },
  { coat: '#3a4a7a', trim: '#b0c0e0', hat: 'kerchief', skin: '#f0c4a0', hair: '#c8a060' },
] as const

function Headwear({ kind, color }: { kind: string; color: string }) {
  if (kind === 'cap') {
    return (
      <path
        d="M-20 -128C-20 -150 20 -150 20 -128H28V-122H-20Z"
        fill={color}
        stroke={INK}
        strokeWidth={1.6}
      />
    )
  }
  if (kind === 'hat') {
    return (
      <g>
        <path d="M-32 -128H32V-122H-32Z" fill="#2a2a2a" stroke={INK} strokeWidth={1.6} />
        <path d="M-18 -128V-150H18V-128Z" fill="#2a2a2a" stroke={INK} strokeWidth={1.6} />
        <path d="M-18 -134H18" stroke={color} strokeWidth={3} />
      </g>
    )
  }
  return (
    <path
      d="M-24 -116C-28 -146 28 -146 24 -116C22 -108 18 -104 14 -102C18 -122 -18 -122 -14 -102C-18 -104 -22 -108 -24 -116Z"
      fill={color}
      stroke={INK}
      strokeWidth={1.6}
    />
  )
}

export function CustomerArt({ look, mood }: { look: number; mood: CustomerMood }) {
  const style = LOOKS[look % LOOKS.length]
  const armUp = mood === 'happy'
  return (
    <g>
      <path d="M-14 -30V0M14 -30V0" stroke="#3a2a22" strokeWidth={9} strokeLinecap="round" />
      <path d="M-22 0H-6M6 0H22" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path
        d="M-30 -24L-22 -88C-14 -96 14 -96 22 -88L30 -24Z"
        fill={style.coat}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M0 -90V-26" stroke={style.trim} strokeWidth={3} />
      <path d="M-30 -28H30" stroke={style.trim} strokeWidth={4} />
      <path
        d="M-22 -84C-34 -70 -38 -52 -34 -40"
        stroke={style.coat}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={armUp ? 'M22 -84C34 -96 40 -110 38 -124' : 'M22 -84C34 -70 38 -52 34 -40'}
        stroke={style.coat}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={-34} cy={-38} r={5} fill={style.skin} stroke={INK} strokeWidth={1.2} />
      <circle
        cx={armUp ? 38 : 34}
        cy={armUp ? -126 : -38}
        r={5}
        fill={style.skin}
        stroke={INK}
        strokeWidth={1.2}
      />
      <circle cx={0} cy={-112} r={20} fill={style.skin} stroke={INK} strokeWidth={1.8} />
      <path
        d="M-18 -118C-16 -132 16 -132 18 -118"
        stroke={style.hair}
        strokeWidth={5}
        fill="none"
      />
      <Headwear kind={style.hat} color={style.trim} />
      <circle cx={-7} cy={-112} r={2.2} fill={INK} />
      <circle cx={7} cy={-112} r={2.2} fill={INK} />
      <circle cx={-12} cy={-104} r={3} fill="#e88a7a" opacity={0.5} />
      <circle cx={12} cy={-104} r={3} fill="#e88a7a" opacity={0.5} />
      {mood === 'puzzled' ? (
        <path d="M-6 -100C-2 -103 2 -97 6 -100" stroke={INK} strokeWidth={2} fill="none" />
      ) : (
        <path
          d={mood === 'happy' ? 'M-8 -102C-4 -95 4 -95 8 -102' : 'M-5 -100H5'}
          stroke={INK}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  )
}
