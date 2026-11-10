import type { BirdId } from '@/content/poleski-park-narodowy'

const INK = '#2a1e16'

function Bittern() {
  return (
    <g>
      <path d="M-6 0L-10 30M8 0L10 30" stroke="#7a8a3a" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M-22 4C-30 -30 -16 -64 -4 -96C4 -112 14 -114 16 -104C18 -80 22 -40 20 4C10 12 -14 12 -22 4Z"
        fill="#a8804a"
        stroke={INK}
        strokeWidth={1.8}
      />
      {[-80, -64, -48, -32, -16].map((y) => (
        <path
          key={y}
          d={`M${-8 + y * -0.08} ${y}C${0} ${y + 4} ${8} ${y + 4} ${14} ${y - 2}`}
          stroke="#5a3a1a"
          strokeWidth={2}
          fill="none"
          opacity={0.75}
        />
      ))}
      <path d="M8 -108L14 -146L18 -106Z" fill="#c8b44a" stroke={INK} strokeWidth={1.4} />
      <path d="M2 -112C6 -118 14 -118 16 -110" fill="#3a2a1a" />
      <circle cx={12} cy={-104} r={2.4} fill="#f4d44a" stroke={INK} strokeWidth={0.8} />
    </g>
  )
}

function Warbler() {
  return (
    <g>
      <path
        d="M-40 20C-20 -4 10 -30 40 -70"
        stroke="#a89a5a"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M-24 -18C-26 -32 -10 -42 6 -40C18 -38 24 -30 22 -20C18 -10 0 -6 -14 -8Z"
        fill="#c8a868"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path d="M-22 -16L-40 -6L-36 -16Z" fill="#a88848" stroke={INK} strokeWidth={1.2} />
      <path d="M-16 -26C-6 -30 6 -30 16 -26" stroke="#3a2a1a" strokeWidth={2.2} fill="none" />
      <path d="M-12 -18C-2 -22 8 -22 16 -18" stroke="#3a2a1a" strokeWidth={1.6} fill="none" />
      <path d="M8 -42C10 -48 16 -50 20 -46" stroke="#f4e4a8" strokeWidth={3} fill="none" />
      <path d="M22 -34L32 -32L22 -30Z" fill="#6a5a3a" />
      <circle cx={16} cy={-35} r={2} fill={INK} />
      <path d="M-4 -8L-6 2M4 -8L6 2" stroke="#8a6a4a" strokeWidth={2} />
    </g>
  )
}

function Crane() {
  return (
    <g>
      <path d="M-6 0L-10 60M8 0L12 60" stroke="#3a3a3a" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M-50 -10C-56 -34 -30 -52 0 -52C26 -52 36 -36 30 -14C20 -2 -30 4 -50 -10Z"
        fill="#9aa4a8"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d="M-50 -14C-70 -6 -76 10 -66 16C-56 6 -46 0 -40 -4Z"
        fill="#4a4e52"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d="M20 -40C28 -70 30 -100 32 -128"
        stroke="#9aa4a8"
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d="M22 -50C28 -76 30 -100 30 -116"
        stroke="#2a2a2a"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M30 -96C34 -104 36 -110 34 -118"
        stroke="#f4f4f0"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={32} cy={-130} r={11} fill="#2a2a2a" stroke={INK} strokeWidth={1.4} />
      <circle cx={30} cy={-139} r={4} fill="#c8202a" />
      <path d="M40 -132L66 -126L40 -124Z" fill="#6a6a5a" stroke={INK} strokeWidth={1} />
      <circle cx={36} cy={-132} r={2} fill="#e8a83a" />
    </g>
  )
}

function Owl() {
  return (
    <g>
      <path d="M-40 10H40" stroke="#5a4632" strokeWidth={8} strokeLinecap="round" />
      <path
        d="M-30 6C-38 -30 -28 -66 0 -68C28 -66 38 -30 30 6Z"
        fill="#a87a4a"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d="M-22 -60L-30 -84L-10 -66M22 -60L30 -84L10 -66"
        fill="#8a5a2a"
        stroke={INK}
        strokeWidth={1.4}
      />
      <circle cx={-12} cy={-48} r={10} fill="#f4a43a" stroke={INK} strokeWidth={1.4} />
      <circle cx={12} cy={-48} r={10} fill="#f4a43a" stroke={INK} strokeWidth={1.4} />
      <circle cx={-12} cy={-48} r={4} fill={INK} />
      <circle cx={12} cy={-48} r={4} fill={INK} />
      <path d="M-3 -40L0 -32L3 -40Z" fill="#3a2a1a" />
      {[-20, -6, 8].map((y) => (
        <path
          key={y}
          d={`M-14 ${y}l4 4M0 ${y}l4 4M12 ${y}l-4 4`}
          stroke="#5a3a1a"
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

export function BirdArt({ bird }: { bird: BirdId }) {
  return (
    <g>
      {bird === 'bittern' && <Bittern />}
      {bird === 'warbler' && <Warbler />}
      {bird === 'crane' && <Crane />}
      {bird === 'owl' && <Owl />}
    </g>
  )
}
