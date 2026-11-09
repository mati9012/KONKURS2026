const INK = '#2a130e'
const SKIN = '#b8352b'
const SKIN_SHADE = '#8e2620'
const COAT = '#2f2b4f'
const GOLD = '#d9a93a'

export function DevilSprite({ cracking }: { cracking: boolean }) {
  return (
    <g>
      <path
        d="M10 -14C30 -10 40 -24 34 -36C30 -44 40 -48 44 -42L48 -50L50 -38C44 -42 38 -38 42 -30C48 -16 32 0 8 -6Z"
        fill={SKIN_SHADE}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M-16 -52C-21 -30-20 -14-16 0L16 0C20 -14 21 -30 16 -52Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-18 -28H18V-22H-18Z" fill={GOLD} stroke={INK} strokeWidth={1.2} />
      <path d="M0 -52V0" stroke="#1d1a33" strokeWidth={1.4} />
      <circle cx={-3} cy={-42} r={1.6} fill={GOLD} />
      <circle cx={-3} cy={-34} r={1.6} fill={GOLD} />
      <path d="M-12 0L-14 4L-4 4L-3 0ZM3 0L4 4L14 4L12 0Z" fill="#2a1a12" />
      <path
        d="M-16 -46C-26 -40-30 -30-28 -22"
        fill="none"
        stroke={COAT}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <circle cx={-28} cy={-21} r={4} fill={SKIN} stroke={INK} strokeWidth={1.2} />
      <g transform={cracking ? 'rotate(-30 16 -44)' : undefined}>
        <path d="M16 -46L32 -60" stroke={COAT} strokeWidth={7} strokeLinecap="round" />
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
      <circle cx={0} cy={-70} r={21} fill={SKIN} stroke={INK} strokeWidth={2} />
      <path
        d="M-12 -86C-22 -98-20 -108-10 -112C-14 -102-9 -95-4 -90Z"
        fill="#f1e2c4"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M12 -86C22 -98 20 -108 10 -112C14 -102 9 -95 4 -90Z"
        fill="#f1e2c4"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M-11 -76L-3 -72M11 -76L3 -72" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx={-6} cy={-68} rx={3.4} ry={4} fill="#ffd34d" />
      <ellipse cx={6} cy={-68} rx={3.4} ry={4} fill="#ffd34d" />
      <circle cx={-5.4} cy={-67.4} r={1.6} fill={INK} />
      <circle cx={6.6} cy={-67.4} r={1.6} fill={INK} />
      <path
        d="M-10 -58C-4 -52 4 -52 10 -58C6 -54-6 -54-10 -58Z"
        fill="#fff3dc"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M-3 -52L0 -46L3 -52" fill={SKIN_SHADE} stroke={INK} strokeWidth={1} />
    </g>
  )
}
