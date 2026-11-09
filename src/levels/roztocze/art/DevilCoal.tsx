export function DevilCoal({ size }: { size: number }) {
  return (
    <g transform={`scale(${size / 40})`}>
      <path
        d="M-30 8C-34 -6 -22 -18 -8 -16C0 -24 16 -22 22 -12C34 -10 36 6 28 12C18 18 -22 18 -30 8Z"
        fill="#231a22"
        stroke="#120c10"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M-16 -4L-8 2L-2 -6L6 4L14 -4"
        fill="none"
        stroke="#ff6a3a"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="zw-pulse"
      />
      <path d="M-12 -15L-9 -24L-5 -15Z" fill="#231a22" />
      <path d="M8 -18L12 -27L15 -16Z" fill="#231a22" />
    </g>
  )
}
