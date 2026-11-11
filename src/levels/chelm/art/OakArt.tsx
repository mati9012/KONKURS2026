const INK = '#2a2216'

export function OakArt({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} strokeLinejoin="round">
      <path d="M-7 0L-5 -46H5L7 0Z" fill="#7a5530" stroke={INK} strokeWidth={2.5} />
      <path
        d="M0 -112C-22 -114 -40 -98 -38 -80C-52 -74 -52 -52 -36 -46C-24 -36 24 -36 36 -46C52 -52 52 -74 38 -80C40 -98 22 -114 0 -112Z"
        fill="#8cc06a"
        stroke={INK}
        strokeWidth={2.5}
      />
      <path d="M-16 -76C-8 -70 8 -70 16 -76" fill="none" stroke="#6aa04c" strokeWidth={4} />
    </g>
  )
}
