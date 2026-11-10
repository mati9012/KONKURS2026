import { blobPath, ridgePath } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { PalaceLayout } from '@/levels/kock/palace-layout'
import type { SceneLayout } from '@/levels/kock/scene-layout'

const INK = '#3a2a22'
const WALL = '#f3e2bd'
const WALL_SHADE = '#e0c99a'
const ROOF = '#9a4a32'
const FOREST = {
  fir: ['#5f8a5a', '#557f52', '#6a9462'],
  beech: ['#86a85e', '#94b468'],
  trunk: '#5a4632',
}

function Windows({
  x,
  y,
  width,
  rows,
  cols,
  size,
}: {
  x: number
  y: number
  width: number
  rows: number
  cols: number
  size: number
}) {
  const cells = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({ cx: x + (width * (col + 0.5)) / cols, cy: y + row * size * 2.1 })
    }
  }
  return (
    <g>
      {cells.map((cell) => (
        <g key={`${cell.cx}-${cell.cy}`}>
          <rect
            x={cell.cx - size * 0.4}
            y={cell.cy}
            width={size * 0.8}
            height={size * 1.3}
            fill="#5a7488"
            stroke={INK}
            strokeWidth={1.4}
          />
          <path
            d={`M${cell.cx} ${cell.cy}V${cell.cy + size * 1.3}M${cell.cx - size * 0.4} ${cell.cy + size * 0.5}H${cell.cx + size * 0.4}`}
            stroke="#f3e2bd"
            strokeWidth={1.4}
          />
          <path
            d={`M${cell.cx - size * 0.52} ${cell.cy - size * 0.12}H${cell.cx + size * 0.52}`}
            stroke={INK}
            strokeWidth={2.2}
          />
        </g>
      ))}
    </g>
  )
}

type PalaceBackdropProps = {
  layout: SceneLayout
  palace: PalaceLayout
  garden: boolean
}

export function PalaceBackdrop({ layout, palace, garden }: PalaceBackdropProps) {
  const { world, unit, ground } = layout
  const { width, height } = world
  const { centerX, base, porticoWidth, columnHeight } = palace
  const half = palace.width / 2
  const wing = palace.width * 0.22
  const wallTop = base - palace.height
  const beamY = base - columnHeight
  const beamH = palace.height * 0.08
  const pedimentTop = beamY - beamH - palace.height * 0.26
  const pane = palace.height * 0.1

  return (
    <g>
      <defs>
        <linearGradient id="kk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc4dc" />
          <stop offset="1" stopColor="#f2e6c8" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#kk-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.2, height * 0.16, 140 * unit, 26 * unit, 3, 0.3)}
          fill="#fffaf0"
        />
        <path
          d={blobPath(width * 0.78, height * 0.12, 180 * unit, 24 * unit, 8, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <path
        d={ridgePath(width, ground - 120 * unit, 30 * unit, 4, height, 0.003)}
        fill="#a8bc8a"
        filter={PAINT_SOFT}
      />
      <TreeLine
        width={width}
        baseY={ground - 30 * unit}
        height={130 * unit}
        seed={garden ? 18 : 9}
        palette={FOREST}
        filter={PAINT}
      />
      <rect
        x={0}
        y={ground}
        width={width}
        height={height - ground}
        fill={garden ? '#8fb070' : '#d9c8a0'}
        filter={PAINT}
      />

      <g filter={PAINT}>
        <rect
          x={centerX - half}
          y={wallTop + palace.height * 0.18}
          width={wing}
          height={palace.height * 0.82}
          fill={WALL_SHADE}
        />
        <rect
          x={centerX + half - wing}
          y={wallTop + palace.height * 0.18}
          width={wing}
          height={palace.height * 0.82}
          fill={WALL_SHADE}
        />
        <rect
          x={centerX - half + wing}
          y={wallTop}
          width={palace.width - wing * 2}
          height={palace.height}
          fill={WALL}
        />
        <path
          d={`M${centerX - half - 10} ${wallTop + palace.height * 0.18}L${centerX - half + wing * 0.5} ${wallTop - palace.height * 0.02}L${centerX - half + wing + 10} ${wallTop + palace.height * 0.18}Z`}
          fill={ROOF}
        />
        <path
          d={`M${centerX + half - wing - 10} ${wallTop + palace.height * 0.18}L${centerX + half - wing * 0.5} ${wallTop - palace.height * 0.02}L${centerX + half + 10} ${wallTop + palace.height * 0.18}Z`}
          fill={ROOF}
        />
        <path
          d={`M${centerX - half + wing - 10} ${wallTop}L${centerX - half + wing + 30} ${wallTop - palace.height * 0.2}H${centerX + half - wing - 30}L${centerX + half - wing + 10} ${wallTop}Z`}
          fill={ROOF}
        />
      </g>
      <Windows
        x={centerX - half}
        y={wallTop + palace.height * 0.32}
        width={wing}
        rows={2}
        cols={2}
        size={pane}
      />
      <Windows
        x={centerX + half - wing}
        y={wallTop + palace.height * 0.32}
        width={wing}
        rows={2}
        cols={2}
        size={pane}
      />
      <Windows
        x={centerX - half + wing}
        y={wallTop + palace.height * 0.2}
        width={(palace.width - wing * 2 - porticoWidth) / 2}
        rows={2}
        cols={2}
        size={pane}
      />
      <Windows
        x={centerX + porticoWidth / 2}
        y={wallTop + palace.height * 0.2}
        width={(palace.width - wing * 2 - porticoWidth) / 2}
        rows={2}
        cols={2}
        size={pane}
      />
      <rect
        x={centerX - porticoWidth / 2}
        y={beamY}
        width={porticoWidth}
        height={columnHeight}
        fill="#d9c49a"
      />
      <path
        d={`M${centerX - porticoWidth * 0.12} ${base}V${base - columnHeight * 0.55}Q${centerX} ${base - columnHeight * 0.7} ${centerX + porticoWidth * 0.12} ${base - columnHeight * 0.55}V${base}Z`}
        fill="#7a5034"
        stroke={INK}
        strokeWidth={1.6}
      />
      <rect
        x={centerX - porticoWidth * 0.56}
        y={beamY - beamH}
        width={porticoWidth * 1.12}
        height={beamH}
        fill={WALL}
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d={`M${centerX - porticoWidth * 0.58} ${beamY - beamH}L${centerX} ${pedimentTop}L${centerX + porticoWidth * 0.58} ${beamY - beamH}Z`}
        fill={WALL}
        stroke={INK}
        strokeWidth={2}
      />
      <ellipse
        cx={centerX}
        cy={(beamY - beamH + pedimentTop) / 2 + palace.height * 0.04}
        rx={porticoWidth * 0.08}
        ry={palace.height * 0.05}
        fill="#5a7488"
        stroke={INK}
        strokeWidth={1.4}
      />
      {[0, 1, 2].map((step) => (
        <rect
          key={step}
          x={centerX - porticoWidth * (0.58 + step * 0.04)}
          y={base + step * 8 * unit}
          width={porticoWidth * (1.16 + step * 0.08)}
          height={8 * unit}
          fill="#e8dcc4"
          stroke={INK}
          strokeWidth={1.2}
        />
      ))}
      {garden ? (
        <g>
          {[-1, 1].map((side) => (
            <g key={side}>
              <ellipse
                cx={centerX + side * palace.width * 0.32}
                cy={base + 70 * unit}
                rx={130 * unit}
                ry={34 * unit}
                fill="#6a9a50"
                stroke="#3a5a2a"
                strokeWidth={2}
              />
              <ellipse
                cx={centerX + side * palace.width * 0.32}
                cy={base + 70 * unit}
                rx={80 * unit}
                ry={18 * unit}
                fill="#e88a8a"
                opacity={0.8}
              />
            </g>
          ))}
        </g>
      ) : (
        <path
          d={`M${centerX - porticoWidth * 0.6} ${base + 24 * unit}L${centerX - porticoWidth * 1.2} ${height}H${centerX + porticoWidth * 1.2}L${centerX + porticoWidth * 0.6} ${base + 24 * unit}Z`}
          fill="#e8dcbc"
          opacity={0.7}
        />
      )}
    </g>
  )
}
