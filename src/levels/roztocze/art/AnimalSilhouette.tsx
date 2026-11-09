import type { AnimalId } from '@/content/roztocze'

const BODY = '#1a1712'
const EYE = '#ffe58a'

function Eyes({ x, y, gap }: { x: number; y: number; gap: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={2.6} fill={EYE} />
      <circle cx={x + gap} cy={y} r={2.6} fill={EYE} />
    </g>
  )
}

const SHAPES: Record<AnimalId, { d: string; eyes: [number, number, number] }> = {
  wolf: {
    d: 'M-50 0L-46 -30C-48 -40 -40 -46 -30 -44L20 -46C30 -50 34 -56 34 -64L40 -76L42 -64L48 -74L50 -60C60 -56 66 -52 70 -48C66 -44 58 -44 52 -46C48 -40 42 -34 40 -26L42 0L34 0L30 -24L-24 -26L-30 0L-38 0L-40 -26C-52 -30 -62 -24 -72 -34C-64 -32 -56 -36 -50 -38Z',
    eyes: [46, -58, 6],
  },
  deer: {
    d: 'M-46 0L-44 -40C-46 -54 -36 -60 -24 -58L24 -60C30 -70 34 -84 36 -96L32 -118L38 -106L40 -124L44 -104L50 -120L50 -100C58 -104 64 -110 66 -122L68 -100C60 -92 52 -88 48 -86L56 -80C62 -76 64 -72 60 -70L46 -72L40 -48L40 0L32 0L30 -42L-30 -40L-34 0L-42 0Z',
    eyes: [48, -80, 7],
  },
  boar: {
    d: 'M-56 0L-54 -14C-64 -26 -56 -48 -30 -52C-8 -60 24 -56 40 -44C52 -40 64 -32 72 -26L74 -18C64 -16 56 -18 48 -16L44 0L36 0L34 -12L-30 -12L-34 0L-42 0L-44 -14Z',
    eyes: [52, -32, 6],
  },
  beaver: {
    d: 'M-70 -4C-76 -12 -70 -22 -56 -20L-30 -14C-24 -34 6 -46 26 -36C38 -32 44 -24 48 -16L46 -8L36 0L-20 0C-34 2 -50 2 -70 -4Z',
    eyes: [36, -26, 5],
  },
  owl: {
    d: 'M-22 0C-30 -20 -28 -50 -20 -64L-24 -80L-12 -70C-4 -74 4 -74 12 -70L24 -80L20 -64C28 -50 30 -20 22 0Z',
    eyes: [-8, -60, 16],
  },
}

export function AnimalSilhouette({ animal }: { animal: AnimalId }) {
  const shape = SHAPES[animal]
  const [x, y, gap] = shape.eyes
  return (
    <g>
      <ellipse cx={0} cy={2} rx={60} ry={8} fill="#000" opacity={0.3} />
      <path d={shape.d} fill={BODY} stroke="#3a3326" strokeWidth={2} strokeLinejoin="round" />
      <Eyes x={x} y={y} gap={gap} />
    </g>
  )
}
