export type IconName = 'konik' | 'plank' | 'wave'

const INK = '#3a2614'

function Glyph({ name }: { name: IconName }) {
  if (name === 'konik') {
    return (
      <>
        <path
          d="M9 30C9 22 11 15 16 10L15 4L20 8C26 7 31 11 33 17C34 20 33 23 30 23C28 23 26 21 25 19C23 22 22 26 22 30Z"
          fill="#9b9182"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M14 11C11 15 9 21 9 27L12 27C12 21 14 15 17 11Z" fill="#2a221c" />
        <path d="M28 18C31 18 33 20 32 22C30 23 28 22 27 20Z" fill="#4a4037" />
        <circle cx={24} cy={14} r={1.5} fill="#1a120c" />
      </>
    )
  }
  if (name === 'plank') {
    return (
      <>
        <path
          d="M4 22L32 12L35 18L7 28Z"
          fill="#d9a86a"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M9 23L29 16M11 26L31 19" stroke="#a4723f" strokeWidth={1} />
        <circle cx={8} cy={24} r={1.1} fill={INK} />
        <circle cx={31} cy={16} r={1.1} fill={INK} />
      </>
    )
  }
  return (
    <>
      <path
        d="M3 26C8 20 12 20 15 24C18 28 22 28 25 22C27 17 23 12 18 14C22 7 32 9 34 18C35 24 32 30 26 31L3 31Z"
        fill="#6fa6c4"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path
        d="M22 16C25 14 29 15 30 19"
        fill="none"
        stroke="#e8f4f8"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </>
  )
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className={className}>
      <Glyph name={name} />
    </svg>
  )
}
