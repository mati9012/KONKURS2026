const INK = '#2e2118'

export function WalkerArt({ coat, scarf }: { coat: string; scarf: string }) {
  return (
    <g>
      <circle cx={14} cy={-34} r={26} fill="url(#zw-glow)" />
      <ellipse cx={0} cy={0} rx={10} ry={3} fill="#1c2a2e" opacity={0.35} />
      <path data-leg="0" d="M-5 -16L-6 0" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path data-leg="3.14" d="M4 -16L5 0" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path
        d="M-10 -14C-12 -26-8 -38 0 -40C8 -38 12 -26 10 -14Z"
        fill={coat}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M-7 -36H7" stroke={scarf} strokeWidth={4} strokeLinecap="round" />
      <path d="M6 -32L14 -40" stroke={coat} strokeWidth={4} strokeLinecap="round" />
      <circle cx={0} cy={-46} r={7} fill="#f0cfae" stroke={INK} strokeWidth={1.6} />
      <path d="M-7 -48C-7 -56 7 -56 7 -48Z" fill={scarf} stroke={INK} strokeWidth={1.4} />
      <path d="M14 -40V-36" stroke={INK} strokeWidth={1.2} />
      <path
        d="M10 -36H18L17 -26H11Z"
        fill="#ffd36e"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </g>
  )
}
