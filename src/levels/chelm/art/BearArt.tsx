const INK = '#2a2622'

type BearArtProps = {
  fur?: string
  shade?: string
  ink?: string
}

export function BearArt({ fur = '#fbfaf4', shade = '#d8d6cc', ink = INK }: BearArtProps) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M-62 -4L-58 -44L-40 -46L-42 -4Z M34 -4L38 -42L56 -40L54 -4Z"
        fill={shade}
        stroke={ink}
        strokeWidth={3}
      />
      <path
        d="M-86 -54C-92 -88 -60 -108 -16 -106C24 -110 58 -100 70 -80C80 -64 74 -46 60 -40L-70 -38C-82 -40 -88 -46 -86 -54Z"
        fill={fur}
        stroke={ink}
        strokeWidth={3.5}
      />
      <path
        d="M-76 -4L-74 -48L-52 -50L-54 -4Z M18 -4L22 -48L44 -48L42 -4Z"
        fill={fur}
        stroke={ink}
        strokeWidth={3}
      />
      <path d="M-80 -4H-50M14 -4H46" stroke={ink} strokeWidth={6} />
      <path
        d="M58 -86C64 -104 84 -110 100 -100C112 -92 122 -86 124 -76C126 -68 118 -64 108 -64C96 -60 80 -60 68 -64Z"
        fill={fur}
        stroke={ink}
        strokeWidth={3.5}
      />
      <path d="M72 -102C70 -114 82 -118 86 -106Z" fill={fur} stroke={ink} strokeWidth={3} />
      <circle cx={124} cy={-75} r={4.5} fill={ink} />
      <circle cx={98} cy={-86} r={3.5} fill={ink} />
      <path d="M-40 -60C-20 -54 10 -54 34 -62" fill="none" stroke={shade} strokeWidth={6} />
      <path d="M-86 -70C-96 -72 -100 -64 -94 -60" fill="none" stroke={ink} strokeWidth={3} />
    </g>
  )
}
