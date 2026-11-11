import type { ChaseStopId } from '@/content/lublin'

const INK = '#3a2a1e'
const BRICK = '#b8573c'
const BRICK_DARK = '#8e3f2a'
const PLASTER = '#f1e6c8'
const PLASTER_SHADE = '#dccba2'
const COPPER = '#5f9e86'
const COPPER_DARK = '#3f7462'
const ROOF = '#9c4a32'
const WINDOW = '#4a3a30'
const GOLD = '#d9b04a'

const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const }

function ArchedWindow({ x, y, width, height }: Record<'x' | 'y' | 'width' | 'height', number>) {
  const half = width / 2
  return (
    <path
      d={`M${x - half} ${y}V${y - height + half}A${half} ${half} 0 0 1 ${x + half} ${y - height + half}V${y}Z`}
      fill={WINDOW}
    />
  )
}

function PointedWindow({ x, y, width, height }: Record<'x' | 'y' | 'width' | 'height', number>) {
  const half = width / 2
  return (
    <path
      d={`M${x - half} ${y}V${y - height + width}Q${x - half} ${y - height + half * 0.4} ${x} ${y - height}Q${x + half} ${y - height + half * 0.4} ${x + half} ${y - height + width}V${y}Z`}
      fill={WINDOW}
    />
  )
}

function KrakowskaGate() {
  return (
    <g>
      <rect x={-78} y={-270} width={156} height={270} fill={BRICK} {...stroke} />
      {[-230, -190, -150, -110, -70].map((y) => (
        <path
          key={y}
          d={`M-78 ${y + 30}L-20 ${y - 10}M20 ${y + 30}L78 ${y - 10}`}
          stroke={BRICK_DARK}
          strokeWidth={5}
          opacity={0.7}
        />
      ))}
      <path d="M-40 0V-90A40 40 0 0 1 40 -90V0Z" fill="#2e2219" {...stroke} />
      <rect x={-60} y={-370} width={120} height={100} fill="#c96a4c" {...stroke} />
      <path d="M-60 -370H-38V-270H-60ZM38 -370H60V-270H38Z" fill={BRICK_DARK} opacity={0.6} />
      <circle cx={0} cy={-322} r={26} fill={PLASTER} {...stroke} />
      <path d="M0 -322V-340M0 -322L12 -314" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M-74 -370H74L66 -384H-66Z" fill={PLASTER} {...stroke} />
      <path
        d="M-56 -384C-60 -420 -30 -432 -24 -446C-30 -460 -14 -470 0 -470C14 -470 30 -460 24 -446C30 -432 60 -420 56 -384Z"
        fill={COPPER}
        {...stroke}
      />
      <path d="M-14 -470C-14 -490 14 -490 14 -470Z" fill={COPPER_DARK} {...stroke} />
      <path d="M0 -488V-530" stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={-532} r={6} fill={GOLD} {...stroke} />
      <ArchedWindow x={-42} y={-180} width={20} height={44} />
      <ArchedWindow x={42} y={-180} width={20} height={44} />
    </g>
  )
}

function TrynitarskaTower() {
  return (
    <g>
      <rect x={-56} y={-330} width={112} height={330} fill={PLASTER} {...stroke} />
      <path d="M-56 0V-330H-40V0Z" fill={PLASTER_SHADE} />
      <path d="M-32 0V-120A32 32 0 0 1 32 -120V0Z" fill="#3a2c22" {...stroke} />
      <PointedWindow x={0} y={-180} width={30} height={60} />
      <PointedWindow x={0} y={-270} width={30} height={60} />
      <path d="M-62 -330H62V-350H-62Z" fill={PLASTER_SHADE} {...stroke} />
      {[-54, 54].map((x) => (
        <path key={x} d={`M${x - 8} -350L${x} -410L${x + 8} -350Z`} fill={PLASTER} {...stroke} />
      ))}
      <path d="M-44 -350L0 -500L44 -350Z" fill={COPPER} {...stroke} />
      <path d="M0 -500V-530" stroke={INK} strokeWidth={4} />
      <path d="M-10 -520H10" stroke={INK} strokeWidth={4} />
    </g>
  )
}

const HOUSES = [
  { x: -170, width: 84, height: 240, fill: '#e9b46a' },
  { x: -86, width: 84, height: 268, fill: '#8fb3a6' },
  { x: -2, width: 84, height: 232, fill: '#e58f6e' },
  { x: 82, width: 90, height: 256, fill: '#f0dc9a' },
]

function MarketHouses() {
  return (
    <g>
      {HOUSES.map((house) => {
        const top = -house.height
        const teeth = Array.from({ length: 4 }, (_, index) => {
          const step = house.width / 4
          const left = house.x + index * step
          return `L${left} ${top - 18}L${left + step / 2} ${top - 18}L${left + step / 2} ${top}L${left + step} ${top}`
        }).join('')
        return (
          <g key={house.x}>
            <path d={`M${house.x} 0V${top}${teeth}V0Z`} fill={house.fill} {...stroke} />
            {[0.28, 0.72].map((share) => (
              <g key={share}>
                {[-house.height * 0.32, -house.height * 0.62].map((y) => (
                  <rect
                    key={y}
                    x={house.x + house.width * share - 10}
                    y={y - 34}
                    width={20}
                    height={34}
                    fill={WINDOW}
                  />
                ))}
              </g>
            ))}
            <ArchedWindow x={house.x + house.width / 2} y={0} width={30} height={56} />
          </g>
        )
      })}
    </g>
  )
}

function TribunalHall() {
  return (
    <g>
      <rect x={-170} y={-240} width={340} height={240} fill={PLASTER} {...stroke} />
      {[-150, -90, -30, 30, 90, 150].map((x) => (
        <rect key={x} x={x - 7} y={-232} width={14} height={232} fill={PLASTER_SHADE} />
      ))}
      {[-120, -60, 60, 120].map((x) => (
        <g key={x}>
          <ArchedWindow x={x} y={-150} width={26} height={50} />
          <rect x={x - 13} y={-218} width={26} height={40} fill={WINDOW} />
        </g>
      ))}
      <path d="M-26 0V-90A26 26 0 0 1 26 -90V0Z" fill="#3a2c22" {...stroke} />
      <path d="M-130 -240L0 -310L130 -240Z" fill={PLASTER} {...stroke} />
      <path d="M-60 -256C-40 -276 40 -276 60 -256" fill="none" stroke={GOLD} strokeWidth={5} />
      <path d="M-14 -260H14V-282H-14Z" fill={GOLD} {...stroke} />
      <rect x={-28} y={-370} width={56} height={64} fill={PLASTER} {...stroke} />
      <circle cx={0} cy={-340} r={16} fill={PLASTER_SHADE} {...stroke} />
      <path d="M-32 -370C-32 -410 32 -410 32 -370Z" fill={COPPER} {...stroke} />
      <path d="M0 -400V-440" stroke={INK} strokeWidth={4} />
    </g>
  )
}

function GrodzkaGate() {
  return (
    <g>
      <rect x={-110} y={-230} width={220} height={230} fill={PLASTER} {...stroke} />
      <path d="M-110 0V-230H-90V0ZM90 0V-230H110V0Z" fill={PLASTER_SHADE} />
      <path d="M-48 0V-120A48 48 0 0 1 48 -120V0Z" fill="#2e2219" {...stroke} />
      <rect x={-118} y={-250} width={236} height={20} fill={PLASTER_SHADE} {...stroke} />
      {[-96, 96].map((x) => (
        <g key={x}>
          <rect x={x - 12} y={-270} width={24} height={20} fill={PLASTER} {...stroke} />
          <path
            d={`M${x - 14} -270C${x - 20} -296 ${x + 20} -296 ${x + 14} -270ZM${x - 4} -292C${x - 4} -304 ${x + 4} -304 ${x + 4} -292`}
            fill={PLASTER}
            {...stroke}
          />
        </g>
      ))}
      <ellipse cx={0} cy={-188} rx={30} ry={22} fill={GOLD} {...stroke} />
      <path d="M-12 -188H12M0 -200V-176" stroke={INK} strokeWidth={3} />
      <path d="M-90 -250V-300H90V-250" fill={ROOF} {...stroke} />
    </g>
  )
}

function CastleHill() {
  return (
    <g>
      <path d="M-300 0C-220 -70 220 -70 300 0Z" fill="#8fae6a" {...stroke} />
      <g transform="translate(0 -56)">
        <rect x={-130} y={-260} width={70} height={260} fill={BRICK} {...stroke} />
        <path d="M-138 -260L-95 -310L-52 -260Z" fill={ROOF} {...stroke} />
        <path d="M110 -180V-280L150 -320L190 -280V-180Z" fill={BRICK} {...stroke} />
        {[0, 1, 2].map((step) => (
          <rect
            key={step}
            x={124 + step * 8}
            y={-300 - step * 10}
            width={52 - step * 16}
            height={10}
            fill={BRICK_DARK}
          />
        ))}
        <PointedWindow x={150} y={-200} width={24} height={60} />
        <rect x={-170} y={-170} width={340} height={170} fill="#ece6da" {...stroke} />
        {Array.from({ length: 9 }, (_, index) => (
          <rect
            key={index}
            x={-166 + index * 38}
            y={-186}
            width={22}
            height={16}
            fill="#ece6da"
            {...stroke}
          />
        ))}
        {[-150, 150].map((x) => (
          <g key={x}>
            <rect x={x - 26} y={-220} width={52} height={220} fill="#e2dccd" {...stroke} />
            {[0, 1, 2].map((index) => (
              <rect
                key={index}
                x={x - 24 + index * 18}
                y={-234}
                width={12}
                height={14}
                fill="#e2dccd"
                {...stroke}
              />
            ))}
            <PointedWindow x={x} y={-130} width={16} height={40} />
          </g>
        ))}
        <path d="M-40 0V-90Q-40 -130 0 -150Q40 -130 40 -90V0Z" fill="#2e2219" {...stroke} />
        {[-90, 90].map((x) => (
          <PointedWindow key={x} x={x} y={-80} width={20} height={50} />
        ))}
      </g>
    </g>
  )
}

export function LandmarkArt({ id }: { id: ChaseStopId }) {
  if (id === 'krakowska') return <KrakowskaGate />
  if (id === 'trynitarska') return <TrynitarskaTower />
  if (id === 'rynek') return <MarketHouses />
  if (id === 'trybunal') return <TribunalHall />
  if (id === 'grodzka') return <GrodzkaGate />
  return <CastleHill />
}
