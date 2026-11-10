type IconName = 'turtle' | 'leaf' | 'note'

const INK = '#3a2a22'

export function PoleskiIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {name === 'turtle' && (
        <>
          <path d="M19 13C21 12 23 13 22 15C21 16 19 15 18 15Z" fill="#7a7a42" stroke={INK} />
          <path d="M3 16C3 9 8 7 11 7C15 7 19 10 19 16Z" fill="#5a5a30" stroke={INK} />
          <circle cx={9} cy={12} r={1} fill="#e8c84a" />
          <circle cx={13} cy={11} r={1} fill="#e8c84a" />
          <path d="M6 16V18M15 16V18" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {name === 'leaf' && (
        <>
          <circle cx={12} cy={12} r={6} fill="#b8404a" stroke={INK} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
            const angle = (index / 8) * Math.PI * 2
            return (
              <circle
                key={index}
                cx={12 + Math.cos(angle) * 8}
                cy={12 + Math.sin(angle) * 8}
                r={1.6}
                fill="#f4e4a0"
                stroke={INK}
                strokeWidth={0.6}
              />
            )
          })}
        </>
      )}
      {name === 'note' && (
        <>
          <path d="M9 18V6L19 4V16" fill="none" stroke={INK} strokeWidth={2} />
          <ellipse cx={7} cy={18} rx={3} ry={2.2} fill="#2f5a6a" stroke={INK} />
          <ellipse cx={17} cy={16} rx={3} ry={2.2} fill="#2f5a6a" stroke={INK} />
        </>
      )}
    </svg>
  )
}
