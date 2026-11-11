import { blobPath, ridgePath } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/kazimierz-dolny/scene-layout'

const INK = '#2a1e16'

const TREES = {
  fir: ['#5a7e52', '#648a5a'],
  beech: ['#7aa05a', '#88ac64', '#6e9450'],
  trunk: '#5a4632',
}

export function craneRig(layout: SceneLayout) {
  const { world, unit, ground, portrait } = layout
  return {
    x: world.width * (portrait ? 0.42 : 0.36),
    hookY: ground - 300 * unit,
    deckY: ground - 20 * unit,
    granaryRight: world.width * (portrait ? 0.24 : 0.2),
  }
}

export function CraneBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const rig = craneRig(layout)
  const roof = ground - (portrait ? 640 : 430) * unit
  const far = ground - (portrait ? 300 : 140) * unit
  return (
    <g>
      <defs>
        <linearGradient id="kd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc4dc" />
          <stop offset="1" stopColor="#f4ead0" />
        </linearGradient>
        <linearGradient id="kd-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7aa4b4" />
          <stop offset="1" stopColor="#4a7a8a" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#kd-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.6, height * 0.14, 140 * unit, 20 * unit, 51, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <path
        d={ridgePath(width, far - 80 * unit, 60 * unit, 33, ground, 0.004)}
        fill="#a4b88a"
        filter={PAINT_SOFT}
      />
      <g
        transform={`translate(${width * 0.78} ${far - 90 * unit}) scale(${unit})`}
        filter={PAINT_SOFT}
      >
        <rect
          x={-14}
          y={-90}
          width={28}
          height={90}
          fill="#d8c8a4"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M-18 -90H18L14 -104H-14Z" fill="#c8b48a" stroke={INK} strokeWidth={1.4} />
        <path d="M-90 0V-40L-70 -60L-50 -40V0Z" fill="#e4d8bc" stroke={INK} strokeWidth={1.4} />
        <path d="M-130 0V-30H-100V0Z" fill="#d8c8a4" stroke={INK} strokeWidth={1.2} />
      </g>
      <TreeLine
        width={width}
        baseY={far + 30 * unit}
        height={80 * unit}
        seed={77}
        palette={TREES}
        density={0.6}
        filter={PAINT_SOFT}
        opacity={0.9}
      />
      <rect y={far + 20 * unit} width={width} height={ground - far} fill="#c8b88a" filter={PAINT} />
      <rect
        y={ground - 40 * unit}
        width={width}
        height={height}
        fill="url(#kd-river)"
        filter={PAINT}
      />
      {Array.from({ length: Math.ceil(width / (90 * unit)) }, (_, index) => (
        <path
          key={index}
          d={`M${index * 90 * unit + (index % 2) * 30 * unit} ${ground + (20 + (index % 3) * 40) * unit}h${40 * unit}`}
          stroke="#d8eef4"
          strokeWidth={3 * unit}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}
      <g filter={PAINT}>
        <rect
          x={-10}
          y={roof}
          width={rig.granaryRight + 10}
          height={ground - roof}
          fill="#efe2c4"
          stroke={INK}
          strokeWidth={2}
        />
        <path
          d={`M-10 ${roof}L${rig.granaryRight * 0.5} ${roof - 120 * unit}L${rig.granaryRight + 4} ${roof}Z`}
          fill="#a8604a"
          stroke={INK}
          strokeWidth={2}
        />
        {[0.3, 0.7].map((share) =>
          [0.25, 0.5, 0.75].map((level) => (
            <rect
              key={`${share}-${level}`}
              x={rig.granaryRight * share - 10 * unit}
              y={roof + (ground - roof) * level - 14 * unit}
              width={20 * unit}
              height={28 * unit}
              fill="#5a4030"
            />
          )),
        )}
        <path
          d={`M${rig.granaryRight - 20 * unit} ${roof + 30 * unit}L${rig.x + 20 * unit} ${rig.hookY - 60 * unit}`}
          stroke="#6a4a2a"
          strokeWidth={14 * unit}
          strokeLinecap="round"
        />
        <path
          d={`M${rig.granaryRight - 10 * unit} ${roof + 120 * unit}L${rig.x - 40 * unit} ${rig.hookY - 50 * unit}`}
          stroke="#6a4a2a"
          strokeWidth={8 * unit}
          strokeLinecap="round"
        />
        <path
          d={`M${rig.x} ${rig.hookY - 66 * unit}V${rig.hookY - 56 * unit}`}
          stroke={INK}
          strokeWidth={3}
        />
      </g>
      <rect
        x={-10}
        y={ground - 46 * unit}
        width={rig.granaryRight + 60 * unit}
        height={20 * unit}
        fill="#8a6a44"
        stroke={INK}
        strokeWidth={1.6}
      />
      {[0.1, 0.5, 0.9].map((share) => (
        <path
          key={share}
          d={`M${(rig.granaryRight + 50 * unit) * share} ${ground - 26 * unit}V${ground + 30 * unit}`}
          stroke="#5a3a22"
          strokeWidth={8 * unit}
        />
      ))}
    </g>
  )
}
