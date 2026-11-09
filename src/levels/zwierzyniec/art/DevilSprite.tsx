const INK = '#2a130e'
const SKIN = '#d9472f'
const SKIN_SHADE = '#a8321f'
const CAPE = '#262130'
const LINING = '#b8302a'
const WING = '#c93a2a'
const HORN = '#6b4a35'
const HAIR = '#5a3524'
const HOOF = '#3a2418'
const GOLD = '#e0b04a'

function Wing({ side }: { side: 1 | -1 }) {
  return (
    <g transform={`scale(${side} 1)`}>
      <path
        d="M10 -50C24 -64 44 -66 58 -58C54 -50 52 -44 54 -36C46 -40 40 -38 36 -32C32 -38 24 -38 20 -32C18 -40 14 -44 10 -42Z"
        fill={WING}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M12 -48L54 -38M14 -46L36 -33M14 -46L20 -33"
        stroke={SKIN_SHADE}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  )
}

export function DevilSprite({ cracking }: { cracking: boolean }) {
  return (
    <g>
      <Wing side={1} />
      <Wing side={-1} />
      <path
        d="M4 -16C22 -14 32 -22 30 -32C28 -40 36 -44 40 -40"
        fill="none"
        stroke={SKIN_SHADE}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <path
        d="M40 -40L44 -50L48 -38Z"
        fill={SKIN_SHADE}
        stroke={INK}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        d="M-18 -48C-26 -32-26 -18-24 -10L24 -10C26 -18 26 -32 18 -48Z"
        fill={CAPE}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M-20 -14C-21 -24-20 -36-15 -46L-11 -46C-15 -34-16 -22-14 -12Z" fill={LINING} />
      <path d="M20 -14C21 -24 20 -36 15 -46L11 -46C15 -34 16 -22 14 -12Z" fill={LINING} />
      <path
        d="M-9 -3V-26Q-9 -33-4.5 -33Q-1 -33-1 -26V-3ZM9 -3V-26Q9 -33 4.5 -33Q1 -33 1 -26V-3Z"
        fill={SKIN}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M-11 0L-10 -5H-2L-1 0ZM1 0L2 -5H10L11 0Z" fill={HOOF} stroke={INK} strokeWidth={1} />
      <path
        d="M-12 -50C-12 -40-10 -32 0 -32C10 -32 12 -40 12 -50Z"
        fill={SKIN}
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d="M-20 -50C-12 -46 12 -46 20 -50L14 -56H-14Z"
        fill={CAPE}
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <circle cx={0} cy={-48} r={3.6} fill={GOLD} stroke={INK} strokeWidth={1} />
      <path
        d="M-14 -46C-22 -40-26 -30-26 -22"
        fill="none"
        stroke={SKIN}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <circle cx={-26} cy={-21} r={4} fill={SKIN} stroke={INK} strokeWidth={1.2} />
      <g transform={cracking ? 'rotate(-30 16 -44)' : undefined}>
        <path d="M14 -46L32 -60" stroke={SKIN} strokeWidth={6} strokeLinecap="round" />
        <circle cx={34} cy={-62} r={4} fill={SKIN} stroke={INK} strokeWidth={1.2} />
        <path d="M34 -62L38 -70" stroke="#5a3a20" strokeWidth={3.5} strokeLinecap="round" />
        <path
          d={cracking ? 'M38 -70C62 -110 96 -70 124 -104' : 'M38 -70C46 -60 40 -40 50 -24'}
          fill="none"
          stroke="#3a2416"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </g>
      <path
        d="M-18 -74L-34 -80L-22 -64Z"
        fill={SKIN}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M18 -74L34 -80L22 -64Z"
        fill={SKIN}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx={0} cy={-72} r={20} fill={SKIN} stroke={INK} strokeWidth={2} />
      <path
        d="M-12 -88C-24 -94-26 -106-18 -112C-18 -104-12 -98-6 -92Z"
        fill={HORN}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M12 -88C24 -94 26 -106 18 -112C18 -104 12 -98 6 -92Z"
        fill={HORN}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M-12 -86C-10 -96 2 -100 8 -94C10 -98 14 -96 12 -88C8 -92 2 -90-2 -86C-4 -90-8 -90-12 -86Z"
        fill={HAIR}
        stroke={INK}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        d="M-12 -80L-3 -78M12 -80L3 -78"
        stroke={HAIR}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <ellipse cx={-7} cy={-71} rx={5.5} ry={6} fill="#fff8ec" stroke={INK} strokeWidth={1.2} />
      <ellipse cx={7} cy={-71} rx={5.5} ry={6} fill="#fff8ec" stroke={INK} strokeWidth={1.2} />
      <circle cx={-6} cy={-70.5} r={3.4} fill="#b8681e" />
      <circle cx={6} cy={-70.5} r={3.4} fill="#b8681e" />
      <circle cx={-6} cy={-70.5} r={1.8} fill={INK} />
      <circle cx={6} cy={-70.5} r={1.8} fill={INK} />
      <circle cx={-5} cy={-72} r={0.9} fill="#fff" />
      <circle cx={7} cy={-72} r={0.9} fill="#fff" />
      <ellipse cx={0} cy={-64} rx={2.6} ry={1.8} fill={SKIN_SHADE} />
      <path
        d="M-10 -59C-4 -51 4 -51 10 -59C4 -56-4 -56-10 -59Z"
        fill="#5a1a14"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M-6 -57.5L-5 -54.5L-4 -57.2ZM4 -57.2L5 -54.5L6 -57.5Z" fill="#fff8ec" />
    </g>
  )
}
