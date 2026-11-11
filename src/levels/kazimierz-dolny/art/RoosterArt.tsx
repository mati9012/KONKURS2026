const INK = '#2a1e16'

export type RoosterPose = 'stand' | 'run' | 'jump' | 'duck' | 'crow'

function Leg({ x, pose, delay }: { x: number; pose: RoosterPose; delay: number }) {
  const running = pose === 'run'
  return (
    <g transform={`translate(${x} -30)`}>
      <g
        className={running ? 'kk-gallop' : undefined}
        style={{
          animationDelay: `${delay}s`,
          transformBox: 'fill-box',
          transformOrigin: '50% 0',
          transform: pose === 'jump' ? `rotate(${x < 0 ? 30 : -30}deg)` : undefined,
        }}
      >
        <path
          d="M0 0V26M0 26l-9 4M0 26l8 4M0 26l-1 6"
          stroke="#e8a02a"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

export function RoosterArt({ pose }: { pose: RoosterPose }) {
  const duck = pose === 'duck'
  const crow = pose === 'crow'
  return (
    <g>
      <ellipse cx={0} cy={2} rx={34} ry={6} fill="#000" opacity={pose === 'jump' ? 0.08 : 0.2} />
      {!duck && <Leg x={-8} pose={pose} delay={0} />}
      {!duck && <Leg x={8} pose={pose} delay={0.21} />}
      <g transform={duck ? 'translate(0 24) scale(1.1 0.7)' : undefined}>
        <path
          d="M-24 -46C-46 -56 -54 -84 -44 -104C-38 -88 -30 -80 -22 -76C-30 -92 -28 -108 -18 -118C-16 -98 -12 -86 -6 -78Z"
          fill="#2a5a4a"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path d="M-40 -96C-36 -86 -30 -80 -24 -76" stroke="#c8402f" strokeWidth={4} fill="none" />
        <path
          d="M-28 -40C-34 -64 -14 -80 8 -78C24 -76 34 -62 30 -44C26 -30 -20 -26 -28 -40Z"
          fill="#c8642a"
          stroke={INK}
          strokeWidth={1.8}
        />
        <path
          d="M-18 -50C-8 -62 10 -62 18 -50C8 -44 -8 -44 -18 -50Z"
          fill="#a8441e"
          stroke={INK}
          strokeWidth={1.2}
        />
        <path
          d="M10 -74C8 -92 14 -104 26 -106C38 -106 44 -96 42 -84C40 -74 24 -66 10 -74Z"
          fill="#e8a83a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path
          d="M22 -106C20 -116 26 -120 30 -114C32 -122 40 -122 40 -112C46 -114 48 -106 42 -102Z"
          fill="#d0242e"
          stroke={INK}
          strokeWidth={1.2}
        />
        <path
          d={crow ? 'M42 -92L58 -98L44 -88L56 -82L42 -86Z' : 'M42 -92L54 -88L42 -84Z'}
          fill="#f4c43a"
          stroke={INK}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <path
          d="M40 -82C44 -74 40 -68 34 -70C34 -76 36 -80 40 -82Z"
          fill="#d0242e"
          stroke={INK}
          strokeWidth={1}
        />
        <circle cx={32} cy={-92} r={3} fill="#fff" stroke={INK} strokeWidth={0.8} />
        <circle cx={33} cy={-92} r={1.4} fill={INK} />
      </g>
      {crow && (
        <g stroke="#f4c43a" strokeWidth={3} strokeLinecap="round">
          <path d="M64 -104l10 -6M66 -92h12M64 -80l10 6" />
        </g>
      )}
    </g>
  )
}
