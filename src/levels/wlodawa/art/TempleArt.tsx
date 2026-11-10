import type { TempleId } from '@/content/wlodawa'

const INK = '#2a1e16'
const GOLD = '#d8a83a'

function arch(x: number, y: number, width: number, height: number) {
  const half = width / 2
  return `M${x - half} ${y}V${y - height + half}A${half} ${half} 0 0 1 ${x + half} ${y - height + half}V${y}Z`
}

function OrthodoxCross({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <path
      d={`M${x} ${y}V${y - size * 2.4}M${x - size * 0.5} ${y - size * 1.9}H${x + size * 0.5}M${x - size * 0.8} ${y - size * 1.4}H${x + size * 0.8}M${x - size * 0.5} ${y - size * 0.6}L${x + size * 0.5} ${y - size * 0.9}`}
      stroke={GOLD}
      strokeWidth={3}
      strokeLinecap="round"
    />
  )
}

function Onion({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  return (
    <path
      d={`M${x - size * 0.6} ${y}C${x - size * 1.2} ${y - size * 0.8} ${x - size * 0.3} ${y - size * 1.4} ${x} ${y - size * 2}C${x + size * 0.3} ${y - size * 1.4} ${x + size * 1.2} ${y - size * 0.8} ${x + size * 0.6} ${y}Z`}
      fill={fill}
      stroke={INK}
      strokeWidth={2}
    />
  )
}

function Synagogue() {
  const wall = '#efe0bc'
  const roof = '#6a625a'
  return (
    <g>
      <path d="M-122 -196L-100 -250H100L122 -196Z" fill={roof} stroke={INK} strokeWidth={2} />
      <path d="M-100 -250L-64 -278H64L100 -250Z" fill="#7e766c" stroke={INK} strokeWidth={2} />
      <rect x={-120} y={-196} width={240} height={196} fill={wall} stroke={INK} strokeWidth={2} />
      {[-96, 96].map((x) => (
        <path key={x} d={arch(x, -70, 16, 90)} fill="#5a6a7a" stroke={INK} strokeWidth={1.4} />
      ))}
      <rect x={-68} y={-150} width={136} height={150} fill="#f4e8c8" stroke={INK} strokeWidth={2} />
      <path d="M-72 -150H72M-68 -82H68" stroke={INK} strokeWidth={2.4} />
      {[-40, 0, 40].map((x) => (
        <path key={x} d={arch(x, -96, 18, 44)} fill="#5a6a7a" stroke={INK} strokeWidth={1.4} />
      ))}
      {[-52, -26, 26, 52].map((x) => (
        <path key={x} d={arch(x, -18, 14, 40)} fill="#5a6a7a" stroke={INK} strokeWidth={1.4} />
      ))}
      <path d={arch(0, 0, 26, 56)} fill="#5a3a24" stroke={INK} strokeWidth={1.8} />
      {[-98, 98].map((x) => (
        <g key={x}>
          <path
            d={`M${x - 32} -168L${x} -200L${x + 32} -168Z`}
            fill={roof}
            stroke={INK}
            strokeWidth={2}
          />
          <rect
            x={x - 28}
            y={-168}
            width={56}
            height={168}
            fill={wall}
            stroke={INK}
            strokeWidth={2}
          />
          <path d={`M${x - 30} -78H${x + 30}`} stroke={INK} strokeWidth={2.4} />
          {[-11, 11].map((dx) => (
            <path
              key={dx}
              d={arch(x + dx, -100, 14, 48)}
              fill="#5a6a7a"
              stroke={INK}
              strokeWidth={1.4}
            />
          ))}
          <path d={arch(x, 0, 36, 60)} fill="#a89878" stroke={INK} strokeWidth={1.6} />
        </g>
      ))}
      {[-150, 150].map((x) => (
        <g key={x}>
          <rect
            x={x < 0 ? x : x - 20}
            y={-70}
            width={20}
            height={70}
            fill={wall}
            stroke={INK}
            strokeWidth={1.6}
          />
          <path
            d={`M${x < 0 ? x : x - 20} -70l5 -12l5 12l5 -12l5 12`}
            fill={wall}
            stroke={INK}
            strokeWidth={1.4}
          />
        </g>
      ))}
    </g>
  )
}

function Cerkiew() {
  const wall = '#f6f2ea'
  const dome = '#3a8a6a'
  return (
    <g>
      <rect x={-40} y={-232} width={80} height={80} fill={wall} stroke={INK} strokeWidth={2} />
      <path d="M-44 -232C-44 -280 44 -280 44 -232Z" fill={dome} stroke={INK} strokeWidth={2} />
      <rect x={-8} y={-286} width={16} height={22} fill={wall} stroke={INK} strokeWidth={1.4} />
      <Onion x={0} y={-286} size={14} fill={dome} />
      <OrthodoxCross x={0} y={-314} size={10} />
      <rect x={-112} y={-160} width={224} height={160} fill={wall} stroke={INK} strokeWidth={2} />
      <path d="M-116 -160H116" stroke={INK} strokeWidth={3} />
      {[-82, -50, 50, 82].map((x) => (
        <path key={x} d={arch(x, -40, 16, 60)} fill="#4a6a8a" stroke={INK} strokeWidth={1.4} />
      ))}
      {[-82, 82].map((x) => (
        <g key={x}>
          <rect
            x={x - 18}
            y={-206}
            width={36}
            height={46}
            fill={wall}
            stroke={INK}
            strokeWidth={2}
          />
          <path d={arch(x, -170, 12, 26)} fill="#4a6a8a" stroke={INK} strokeWidth={1.2} />
          <Onion x={x} y={-206} size={16} fill={dome} />
          <OrthodoxCross x={x} y={-238} size={9} />
        </g>
      ))}
      <rect x={-34} y={-250} width={68} height={250} fill={wall} stroke={INK} strokeWidth={2} />
      <path d="M-38 -250L0 -300L38 -250Z" fill={dome} stroke={INK} strokeWidth={2} />
      <rect x={-9} y={-322} width={18} height={22} fill={wall} stroke={INK} strokeWidth={1.4} />
      <Onion x={0} y={-322} size={13} fill={dome} />
      <OrthodoxCross x={0} y={-348} size={10} />
      <path d={arch(0, -200, 18, 36)} fill="#4a6a8a" stroke={INK} strokeWidth={1.4} />
      <path d="M-38 -160L0 -186L38 -160Z" fill={wall} stroke={INK} strokeWidth={2} />
      <path d={arch(0, 0, 34, 76)} fill="#5a3a24" stroke={INK} strokeWidth={1.8} />
      <circle cx={0} cy={-122} r={12} fill="#d8b46a" stroke={INK} strokeWidth={1.4} />
    </g>
  )
}

function BaroqueHelmet({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x - 28} ${y}C${x - 34} ${y - 26} ${x - 8} ${y - 30} ${x - 10} ${y - 48}H${x + 10}C${x + 8} ${y - 30} ${x + 34} ${y - 26} ${x + 28} ${y}Z`}
        fill="#4a5a58"
        stroke={INK}
        strokeWidth={2}
      />
      <rect
        x={x - 8}
        y={y - 64}
        width={16}
        height={16}
        fill="#f4ead0"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d={`M${x - 10} ${y - 64}C${x - 10} ${y - 80} ${x + 10} ${y - 80} ${x + 10} ${y - 64}Z`}
        fill="#4a5a58"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d={`M${x} ${y - 76}V${y - 100}M${x - 6} ${y - 92}H${x + 6}`}
        stroke={GOLD}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

function Church() {
  const wall = '#f2dfae'
  const trim = '#fbf4e0'
  return (
    <g>
      <path d="M-92 -170C-92 -262 92 -262 92 -170Z" fill="#5a6a64" stroke={INK} strokeWidth={2} />
      <rect x={-16} y={-276} width={32} height={30} fill={trim} stroke={INK} strokeWidth={1.6} />
      {[-10, -3, 4, 11].map((x) => (
        <path key={x} d={`M${x} -272V-250`} stroke={INK} strokeWidth={1.2} />
      ))}
      <path d="M-18 -276C-18 -296 18 -296 18 -276Z" fill="#5a6a64" stroke={INK} strokeWidth={1.6} />
      <path d="M0 -292V-312M-5 -305H5" stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
      {[-98, 98].map((x) => (
        <g key={x}>
          <rect
            x={x - 26}
            y={-246}
            width={52}
            height={246}
            fill={wall}
            stroke={INK}
            strokeWidth={2}
          />
          <path
            d={`M${x - 28} -246H${x + 28}M${x - 28} -150H${x + 28}`}
            stroke={INK}
            strokeWidth={2.4}
          />
          <path d={arch(x, -186, 18, 42)} fill="#4a5a6a" stroke={INK} strokeWidth={1.4} />
          <path d={arch(x, -70, 18, 50)} fill="#4a5a6a" stroke={INK} strokeWidth={1.4} />
          <path d={`M${x - 20} -244V-4M${x + 20} -244V-4`} stroke={trim} strokeWidth={4} />
          <BaroqueHelmet x={x} y={-246} />
        </g>
      ))}
      <path
        d="M-72 -196C-64 -226 -34 -224 -24 -252H24C34 -224 64 -226 72 -196Z"
        fill={wall}
        stroke={INK}
        strokeWidth={2}
      />
      <circle cx={0} cy={-224} r={10} fill={trim} stroke={INK} strokeWidth={1.4} />
      <rect x={-72} y={-196} width={144} height={196} fill={wall} stroke={INK} strokeWidth={2} />
      <path d="M-76 -196H76M-76 -110H76" stroke={INK} strokeWidth={2.6} />
      {[-62, -50, 50, 62].map((x) => (
        <path key={x} d={`M${x} -192V-4`} stroke={trim} strokeWidth={5} />
      ))}
      <path d={arch(0, -128, 34, 60)} fill="#4a5a6a" stroke={INK} strokeWidth={1.6} />
      <path d={arch(0, 0, 40, 84)} fill="#5a3a24" stroke={INK} strokeWidth={1.8} />
      <path d="M-28 -86C-20 -100 20 -100 28 -86" stroke={INK} strokeWidth={2} fill="none" />
    </g>
  )
}

export function TempleArt({ temple }: { temple: TempleId }) {
  return (
    <g>
      {temple === 'synagogue' && <Synagogue />}
      {temple === 'cerkiew' && <Cerkiew />}
      {temple === 'church' && <Church />}
    </g>
  )
}
