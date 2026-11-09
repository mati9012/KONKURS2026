export type RoztoczeIconName = 'log' | 'paw' | 'leaf'

const INK = '#3a2614'

function Glyph({ name }: { name: RoztoczeIconName }) {
  if (name === 'log') {
    return (
      <>
        <path
          d="M5 14L27 10L29 24L7 27Z"
          fill="#a99583"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <ellipse cx={28} cy={17} rx={3.5} ry={7} fill="#d6c4a8" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={28} cy={17} rx={1.6} ry={3.4} fill="none" stroke="#8b745f" strokeWidth={1} />
        <path d="M9 19L24 16M10 23L24 21" stroke="#7e6b5b" strokeWidth={1.2} />
      </>
    )
  }
  if (name === 'paw') {
    return (
      <>
        <path
          d="M18 31C11 31 9 25 12 21C14 18 16 17 18 17C20 17 22 18 24 21C27 25 25 31 18 31Z"
          fill="#5b4632"
          stroke={INK}
          strokeWidth={1.6}
        />
        <ellipse cx={9} cy={14} rx={3} ry={4} fill="#5b4632" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={15} cy={9} rx={3} ry={4} fill="#5b4632" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={21} cy={9} rx={3} ry={4} fill="#5b4632" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={27} cy={14} rx={3} ry={4} fill="#5b4632" stroke={INK} strokeWidth={1.4} />
      </>
    )
  }
  return (
    <>
      <path
        d="M18 4C27 9 31 18 26 26C23 30 19 31 18 31C17 31 13 30 10 26C5 18 9 9 18 4Z"
        fill="#7c9c52"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M18 8V34M18 16L23 12M18 21L13 17M18 25L24 21" stroke={INK} strokeWidth={1.2} />
    </>
  )
}

export function RoztoczeIcon({ name, className }: { name: RoztoczeIconName; className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className={className}>
      <Glyph name={name} />
    </svg>
  )
}
