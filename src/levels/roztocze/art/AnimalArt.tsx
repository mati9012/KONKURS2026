import type { AnimalId } from '@/content/roztocze'

const INK = '#241a14'
const SHINE = '#ffe58a'

const inked = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' } as const

function Eye({
  x,
  y,
  r = 3.2,
  dark = false,
}: {
  x: number
  y: number
  r?: number
  dark?: boolean
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={dark ? '#1a120c' : SHINE} stroke={INK} strokeWidth={1} />
      {!dark && <circle cx={x + r * 0.15} cy={y} r={r * 0.45} fill="#3a2a10" />}
      <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.3} fill="#fffbe8" />
    </g>
  )
}

function Fur({ d, color, width = 1.4 }: { d: string; color: string; width?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
}

function Wolf() {
  return (
    <g>
      <path
        d="M-58 -52C-78 -48 -92 -30 -98 -10C-90 -14 -82 -22 -72 -28C-76 -18 -74 -10 -66 -4C-62 -22 -56 -38 -50 -48Z"
        fill="#6e6a63"
        {...inked}
      />
      <path d="M-82 -18C-86 -14 -90 -12 -96 -10" stroke="#3a3632" strokeWidth={3} />
      <path d="M-44 -40L-50 -4L-42 -3L-36 -36Z" fill="#4e4a44" {...inked} />
      <path d="M30 -40L28 -3L36 -3L38 -36Z" fill="#4e4a44" {...inked} />
      <path
        d="M-60 -52C-56 -68 -30 -72 -6 -70C14 -70 30 -74 42 -70C50 -66 54 -56 50 -46C44 -36 30 -34 16 -36L-30 -36C-46 -34 -60 -38 -60 -52Z"
        fill="#8a857c"
        {...inked}
      />
      <path d="M-52 -60C-34 -70 -6 -72 20 -70C0 -64 -30 -62 -52 -56Z" fill="#5e5a54" />
      <path d="M-40 -38C-20 -34 0 -34 18 -37C10 -43 -20 -45 -40 -43Z" fill="#cfc8b8" />
      <Fur d="M-30 -58l-4 6M-16 -60l-4 6M-2 -60l-4 6M12 -62l-4 6M26 -62l-4 6" color="#4a4640" />
      <path
        d="M-54 -46C-56 -30 -50 -18 -46 -10L-48 -2L-37 -2L-38 -12C-40 -22 -38 -34 -34 -40Z"
        fill="#7e796f"
        {...inked}
      />
      <path d="M38 -46L40 -4L36 0L49 0L48 -6L47 -46Z" fill="#7e796f" {...inked} />
      <ellipse cx={-43} cy={-1} rx={7} ry={3.2} fill="#5e5a54" {...inked} />
      <ellipse cx={43} cy={-1} rx={7} ry={3.2} fill="#5e5a54" {...inked} />
      <path
        d="M34 -70C40 -84 50 -92 60 -94L72 -62C62 -54 50 -50 40 -48Z"
        fill="#8a857c"
        {...inked}
      />
      <path d="M44 -58C50 -54 58 -54 66 -58L70 -64C62 -60 52 -60 44 -62Z" fill="#cfc8b8" />
      <path d="M58 -98L60 -116L69 -101Z" fill="#6e6a63" {...inked} />
      <path d="M66 -101L73 -116L77 -98Z" fill="#6e6a63" {...inked} />
      <path
        d="M54 -96C62 -102 74 -101 80 -95L98 -87C102 -85 102 -78 98 -76L80 -72C72 -66 60 -68 54 -76C50 -82 50 -90 54 -96Z"
        fill="#9a958c"
        {...inked}
      />
      <path d="M80 -81L98 -81C100 -79 98 -76 96 -76L80 -74Z" fill="#e2dccd" />
      <path d="M58 -76C62 -70 70 -69 76 -72L70 -64C64 -64 58 -68 57 -72Z" fill="#e2dccd" />
      <path d="M66 -94C70 -97 76 -96 78 -93" fill="none" stroke="#4a4640" strokeWidth={2} />
      <circle cx={100} cy={-84} r={3.2} fill="#1a1410" />
      <Eye x={73} y={-89} r={3} />
    </g>
  )
}

function Deer() {
  return (
    <g>
      <path
        d="M-42 -58C-44 -46 -40 -34 -44 -26L-44 -3L-39 -3L-38 -26C-34 -36 -34 -48 -32 -58Z"
        fill="#5e3e26"
        {...inked}
      />
      <path
        d="M24 -58C26 -46 28 -38 26 -30L25 -3L30 -3L31 -30C33 -40 34 -50 33 -58Z"
        fill="#5e3e26"
        {...inked}
      />
      <path
        d="M-56 -72C-50 -90 -20 -92 10 -90C30 -90 44 -86 48 -76C52 -64 44 -56 30 -56L-36 -56C-52 -56 -60 -62 -56 -72Z"
        fill="#8f5c36"
        {...inked}
      />
      <path
        d="M-50 -82C-30 -90 0 -91 30 -88C10 -84 -20 -82 -50 -76Z"
        fill="#a8703f"
        opacity={0.8}
      />
      <path d="M-34 -58C-10 -60 14 -60 32 -58C20 -64 -10 -66 -34 -63Z" fill="#c9a47a" />
      <path
        d="M-58 -76C-61 -68 -57 -60 -50 -58C-50 -66 -52 -72 -58 -76Z"
        fill="#ead8b6"
        {...inked}
      />
      <path
        d="M-52 -64C-54 -48 -48 -34 -46 -26L-48 -3L-41 -3L-40 -28C-40 -40 -38 -52 -36 -58Z"
        fill="#7a4e2e"
        {...inked}
      />
      <path
        d="M33 -62C35 -48 40 -38 38 -30L39 -4L45 -4L45 -30C47 -40 47 -52 46 -62Z"
        fill="#7a4e2e"
        {...inked}
      />
      <path
        d="M-49 -4L-41 -4L-40 0L-50 0ZM38 -4L46 -4L47 0L37 0ZM-45 -4L-38 -4L-37 0L-46 0ZM24 -4L31 -4L32 0L23 0Z"
        fill="#1a120c"
      />
      <path
        d="M28 -86C34 -104 42 -116 50 -124L66 -116C62 -100 56 -86 50 -72C42 -70 34 -76 28 -86Z"
        fill="#6a4428"
        {...inked}
      />
      <Fur d="M36 -96l-6 6M40 -104l-6 7M44 -110l-5 7M48 -90l-6 8" color="#4a2e1a" width={2} />
      <path d="M52 -128L42 -142L57 -133Z" fill="#7a4e2e" {...inked} />
      <path
        d="M48 -126C54 -133 64 -133 70 -127L88 -113C92 -109 90 -104 86 -104L70 -106C62 -104 54 -110 50 -116Z"
        fill="#93603a"
        {...inked}
      />
      <path d="M78 -110L88 -112C90 -108 88 -105 85 -105L78 -106Z" fill="#3a2414" />
      <path
        d="M60 -130C58 -150 50 -168 40 -180M58 -148L69 -157M54 -160L62 -174M46 -171L50 -187M63 -131C70 -149 78 -164 86 -177M70 -149L81 -151M76 -161L89 -164M82 -171L95 -179"
        fill="none"
        stroke={INK}
        strokeWidth={6.5}
        strokeLinecap="round"
      />
      <path
        d="M60 -130C58 -150 50 -168 40 -180M58 -148L69 -157M54 -160L62 -174M46 -171L50 -187M63 -131C70 -149 78 -164 86 -177M70 -149L81 -151M76 -161L89 -164M82 -171L95 -179"
        fill="none"
        stroke="#e2d0a8"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Eye x={64} y={-119} r={3} />
    </g>
  )
}

function Boar() {
  return (
    <g>
      <path d="M-62 -36C-70 -32 -72 -26 -68 -22" fill="none" stroke={INK} strokeWidth={2.5} />
      <path d="M-40 -18L-42 -3L-34 -3L-32 -18Z" fill="#2e241c" {...inked} />
      <path d="M28 -18L28 -3L36 -3L34 -18Z" fill="#2e241c" {...inked} />
      <path
        d="M-60 -20C-66 -40 -54 -62 -30 -66C-10 -78 20 -78 36 -66C46 -58 52 -46 52 -34L50 -18C40 -12 -40 -12 -60 -20Z"
        fill="#4e3e30"
        {...inked}
      />
      <path
        d="M-46 -40C-30 -56 0 -60 26 -54C2 -48 -24 -42 -46 -32Z"
        fill="#6c5846"
        opacity={0.85}
      />
      <path
        d="M-34 -66l4 -9l4 8l4 -10l4 9l4 -10l4 9l4 -9l4 8l4 -8l4 7l4 -7l4 6"
        fill="none"
        stroke="#241a14"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <Fur
        d="M-40 -30l-3 6M-26 -26l-3 6M-12 -24l-3 6M2 -24l-3 6M16 -26l-3 6M-50 -44l-3 6M30 -40l-3 6"
        color="#2e241c"
      />
      <path d="M-52 -22L-52 0L-42 0L-42 -20Z" fill="#3a2e24" {...inked} />
      <path d="M40 -24L42 0L50 0L50 -26Z" fill="#3a2e24" {...inked} />
      <path d="M48 -62L50 -78L59 -64Z" fill="#3a2e24" {...inked} />
      <path
        d="M40 -62C50 -64 60 -56 70 -46L92 -37C97 -35 97 -27 92 -25L72 -23C60 -21 48 -26 42 -34Z"
        fill="#5c4a3a"
        {...inked}
      />
      <path d="M52 -54C60 -50 66 -44 70 -40" fill="none" stroke="#3a2e24" strokeWidth={2} />
      <ellipse cx={93} cy={-31} rx={3.4} ry={5.5} fill="#c9978a" stroke={INK} strokeWidth={1.4} />
      <path
        d="M80 -26C84 -32 88 -35 90 -40"
        fill="none"
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M80 -26C84 -32 88 -35 90 -40"
        fill="none"
        stroke="#f2ead6"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Eye x={62} y={-47} r={2.6} />
    </g>
  )
}

function Beaver() {
  return (
    <g>
      <path d="M-34 -10C-60 -18 -92 -16 -102 -5C-94 6 -60 6 -34 0Z" fill="#3e3e4a" {...inked} />
      <path
        d="M-90 -12L-84 2M-78 -14L-72 3M-66 -14L-60 3M-54 -12L-50 2M-96 -5L-44 -4"
        stroke="#64646f"
        strokeWidth={1.3}
      />
      <path
        d="M-50 -6C-56 -30 -36 -52 -6 -56C20 -58 40 -44 46 -28C50 -14 44 0 30 0L-40 0C-48 0 -50 -2 -50 -6Z"
        fill="#7a5636"
        {...inked}
      />
      <path
        d="M-40 -30C-28 -46 -6 -52 16 -50C-4 -44 -24 -36 -40 -24Z"
        fill="#94704a"
        opacity={0.85}
      />
      <path d="M-30 -3C-10 -12 20 -12 37 -6L30 0L-30 0Z" fill="#9c7a54" />
      <Fur
        d="M-36 -20l-4 5M-22 -30l-4 5M-8 -36l-4 5M8 -38l-4 5M22 -34l-4 5M-20 -14l-4 5M0 -20l-4 5M18 -18l-4 5"
        color="#563a22"
      />
      <path d="M-32 0L-22 -5L-12 0Z" fill="#3a2a1c" {...inked} />
      <path
        d="M24 -52C34 -63 52 -61 60 -51C68 -43 70 -33 64 -28L44 -26C34 -28 24 -38 24 -52Z"
        fill="#86603e"
        {...inked}
      />
      <circle cx={34} cy={-58} r={5} fill="#6a4a2e" stroke={INK} strokeWidth={1.6} />
      <circle cx={66} cy={-39} r={3.6} fill="#1a120c" />
      <rect
        x={59}
        y={-30}
        width={6}
        height={8}
        rx={1.5}
        fill="#e8a040"
        stroke={INK}
        strokeWidth={1.2}
      />
      <path d="M62 -30V-22" stroke={INK} strokeWidth={0.8} />
      <path
        d="M66 -36L80 -40M66 -34L80 -32M64 -33L76 -26"
        stroke="#e8dcc0"
        strokeWidth={0.9}
        opacity={0.8}
      />
      <path
        d="M38 -18C42 -10 50 -8 56 -10"
        fill="none"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M38 -18C42 -10 50 -8 56 -10"
        fill="none"
        stroke="#6a4a2e"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Eye x={50} y={-48} r={2.8} />
    </g>
  )
}

function Owl() {
  return (
    <g>
      <path d="M-70 4C-30 -2 20 0 64 -4L64 4C20 8 -30 6 -70 12Z" fill="#4a3a2c" {...inked} />
      <path
        d="M30 0C40 -8 48 -10 56 -16"
        fill="none"
        stroke="#4a3a2c"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path d="M-12 -2L-10 14L10 14L12 -2Z" fill="#8f846f" {...inked} />
      <path
        d="M-30 0C-36 -30 -32 -62 -20 -78C-10 -88 10 -88 20 -78C32 -62 36 -30 30 0Z"
        fill="#bdb29c"
        {...inked}
      />
      <path d="M-30 0C-36 -30 -32 -60 -22 -74C-26 -50 -24 -20 -16 0Z" fill="#8f846f" {...inked} />
      <path d="M30 0C36 -30 32 -60 22 -74C26 -50 24 -20 16 0Z" fill="#8f846f" {...inked} />
      <Fur
        d="M-30 -40l8 -3M-30 -26l9 -3M-28 -12l8 -3M30 -40l-8 -3M30 -26l-9 -3M28 -12l-8 -3"
        color="#e6dccb"
        width={2}
      />
      <Fur
        d="M-8 -54v8M4 -56v8M-4 -40v9M8 -40v8M-12 -28v8M0 -26v9M12 -26v8M-6 -12v8M6 -12v8"
        color="#6e6452"
        width={1.8}
      />
      <path
        d="M-14 2l-2 6M-8 2l0 6M8 2l0 6M14 2l2 6"
        stroke="#d9b24a"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle cx={0} cy={-86} r={28} fill="#c6bba6" {...inked} />
      <ellipse cx={0} cy={-84} rx={22} ry={20} fill="#e2d8c4" stroke="#8a7e66" strokeWidth={2.5} />
      <path d="M0 -102C-4 -96 -4 -88 0 -82C4 -88 4 -96 0 -102Z" fill="#cfc4ae" />
      <Fur
        d="M-16 -96l4 4M-18 -86l5 1M-16 -76l4 -3M16 -96l-4 4M18 -86l-5 1M16 -76l-4 -3"
        color="#b3a78e"
      />
      <Eye x={-9} y={-87} r={5} dark />
      <Eye x={9} y={-87} r={5} dark />
      <path d="M-3.5 -80L3.5 -80L0 -71Z" fill="#e8c040" stroke={INK} strokeWidth={1} />
    </g>
  )
}

export function AnimalArt({ animal }: { animal: AnimalId }) {
  if (animal === 'wolf') return <Wolf />
  if (animal === 'deer') return <Deer />
  if (animal === 'boar') return <Boar />
  if (animal === 'beaver') return <Beaver />
  return <Owl />
}
