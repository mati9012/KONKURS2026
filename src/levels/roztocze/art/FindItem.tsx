import type { TreeId } from '@/content/roztocze'

const INK = '#3a2614'

function Glyph({ tree }: { tree: TreeId }) {
  if (tree === 'beech') {
    return (
      <>
        <path
          d="M14 34L22 12L30 34Z"
          fill="#8a5a2e"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M26 36L34 16L41 36Z"
          fill="#a06a36"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M22 14L22 32M34 18L34 34" stroke="#c9945a" strokeWidth={1.2} />
      </>
    )
  }
  if (tree === 'fir') {
    return (
      <>
        <path d="M24 42L24 8" stroke="#6a4a3a" strokeWidth={4} strokeLinecap="round" />
        <path
          d="M24 14L30 12M24 22L18 20M24 30L30 28"
          stroke="#8a6a4a"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    )
  }
  if (tree === 'sycamore') {
    return (
      <>
        <path
          d="M24 26C18 22 10 14 8 6C14 8 22 16 24 26Z"
          fill="#c9b27a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path
          d="M24 26C30 22 38 14 40 6C34 8 26 16 24 26Z"
          fill="#c9b27a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <circle cx={21} cy={28} r={4} fill="#8a6a3a" stroke={INK} strokeWidth={1.4} />
        <circle cx={27} cy={28} r={4} fill="#8a6a3a" stroke={INK} strokeWidth={1.4} />
      </>
    )
  }
  if (tree === 'yew') {
    return (
      <>
        <path d="M14 22C14 36 34 36 34 22Z" fill="#d9332a" stroke="#6a1410" strokeWidth={1.8} />
        <ellipse cx={24} cy={22} rx={10} ry={3.5} fill="#a8201a" />
        <ellipse cx={24} cy={20} rx={4} ry={5} fill="#3a4a2a" stroke={INK} strokeWidth={1.2} />
      </>
    )
  }
  return (
    <>
      <path d="M24 4L24 8" stroke={INK} strokeWidth={2} />
      <ellipse cx={24} cy={26} rx={8} ry={18} fill="#8a5a36" stroke={INK} strokeWidth={1.8} />
      <path d="M17 18L31 18M16 26L32 26M17 34L31 34" stroke="#5a3a20" strokeWidth={1.4} />
    </>
  )
}

export function FindItem({ tree, className }: { tree: TreeId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <Glyph tree={tree} />
    </svg>
  )
}
