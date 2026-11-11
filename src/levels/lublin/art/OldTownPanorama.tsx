import { blobPath, ridgePath } from '@/components/watercolor/paint'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import { CHASE_STOP_IDS } from '@/content/lublin'
import { LandmarkArt } from '@/levels/lublin/art/LandmarkArt'
import type { OldTownGeometry } from '@/levels/lublin/old-town'
import type { SceneLayout } from '@/levels/lublin/scene-layout'
import { createRandom } from '@/lib/noise'

const INK = '#3a2a1e'
const FILLER_COLORS = ['#e8c48a', '#c9d8c4', '#efd2b4', '#d8b9a0', '#f2e2b0', '#bcd0d6']

function FillerHouses({ from, to, seed }: { from: number; to: number; seed: number }) {
  const random = createRandom(seed)
  const houses: { x: number; width: number; height: number; fill: string }[] = []
  let x = from
  while (x < to) {
    const width = 70 + random() * 40
    houses.push({
      x,
      width,
      height: 150 + random() * 80,
      fill: FILLER_COLORS[Math.floor(random() * FILLER_COLORS.length)],
    })
    x += width
  }
  return (
    <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round" opacity={0.85}>
      {houses.map((house) => (
        <g key={house.x}>
          <path
            d={`M${house.x} 0V${-house.height}L${house.x + house.width / 2} ${-house.height - 34}L${house.x + house.width} ${-house.height}V0Z`}
            fill={house.fill}
          />
          <path
            d={`M${house.x - 4} ${-house.height}L${house.x + house.width / 2} ${-house.height - 38}L${house.x + house.width + 4} ${-house.height}`}
            fill="none"
            stroke="#9c4a32"
            strokeWidth={6}
          />
          {[0.3, 0.7].map((share) => (
            <rect
              key={share}
              x={house.x + house.width * share - 9}
              y={-house.height * 0.6 - 30}
              width={18}
              height={30}
              fill="#4a3a30"
              stroke="none"
            />
          ))}
        </g>
      ))}
    </g>
  )
}

export function OldTownPanorama({
  layout,
  geometry,
}: {
  layout: SceneLayout
  geometry: OldTownGeometry
}) {
  const { world } = layout
  const { width, scale, spacing, ground } = geometry
  const height = world.height
  const clouds = Array.from({ length: Math.ceil(width / 500) }, (_, index) => ({
    key: index,
    x: index * 500 + 120,
    y: height * (0.12 + (index % 3) * 0.06),
  }))
  const gaps = [geometry.startX, ...CHASE_STOP_IDS.map((id) => geometry.stops[id])]

  return (
    <g>
      <defs>
        <linearGradient id="lb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc4dc" />
          <stop offset="0.7" stopColor="#f2e6cc" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#lb-sky)" />
      <g filter={PAINT_SOFT} opacity={0.8}>
        {clouds.map((cloud) => (
          <path
            key={cloud.key}
            d={blobPath(cloud.x, cloud.y, 130, 34, cloud.key + 3, 0.25)}
            fill="#fffaf0"
          />
        ))}
      </g>
      <path
        d={ridgePath(width, ground - 230 * scale, 70 * scale, 5, height, 0.002)}
        fill="#b9c9a8"
        opacity={0.7}
        filter={PAINT_WASH}
      />
      <g filter={PAINT}>
        {gaps.map((x, index) => (
          <g key={index} transform={`translate(0 ${ground}) scale(${scale} ${scale})`}>
            <FillerHouses
              from={(x + 260 * scale) / scale}
              to={(x + spacing - 260 * scale) / scale}
              seed={index + 20}
            />
          </g>
        ))}
        {CHASE_STOP_IDS.map((id) => (
          <g key={id} transform={`translate(${geometry.stops[id]} ${ground}) scale(${scale})`}>
            <LandmarkArt id={id} />
          </g>
        ))}
      </g>
      <rect x={0} y={ground} width={width} height={height - ground} fill="#c8b48e" />
      <g opacity={0.35}>
        {Array.from({ length: Math.ceil(width / 46) }, (_, index) => (
          <path
            key={index}
            d={blobPath(index * 46 + 20, ground + 30 + (index % 3) * 26, 18, 8, index, 0.3, 8)}
            fill="#8e7a58"
          />
        ))}
      </g>
      <path d={`M0 ${ground}H${width}`} stroke={INK} strokeWidth={3} opacity={0.5} />
    </g>
  )
}
