import { useMemo } from 'react'
import { scatter } from '@/components/watercolor/paint'
import type { HerdLayout } from '@/levels/zwierzyniec/herd-layout'

const BLADES = ['#55763a', '#6a8a45', '#4a6a34', '#7c9a4e']
const BLOOMS = ['#f3d35a', '#fff6e0', '#b58bd0', '#e98f7c']

export function MeadowForeground({ layout }: { layout: HerdLayout }) {
  const { world, unit } = layout
  const tufts = useMemo(
    () =>
      scatter(123, Math.round(world.width / (26 * unit)), {
        x: -20,
        y: world.height - 14 * unit,
        width: world.width + 40,
        height: 18 * unit,
      }),
    [world, unit],
  )

  return (
    <svg
      viewBox={`0 0 ${world.width} ${world.height}`}
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
    >
      <g className="zw-sway" strokeLinecap="round" fill="none">
        {tufts.map((tuft, index) => {
          const height = 46 * unit * tuft.size
          const lean = (tuft.tone - 0.5) * 30 * unit
          return (
            <g key={index} style={{ animationDelay: `${-index * 0.31}s` }}>
              <path
                d={`M${tuft.x} ${tuft.y + 20 * unit}Q${tuft.x + lean * 0.2} ${tuft.y - height * 0.5} ${tuft.x + lean} ${tuft.y - height}`}
                stroke={BLADES[index % BLADES.length]}
                strokeWidth={4 * unit}
              />
              <path
                d={`M${tuft.x + 8 * unit} ${tuft.y + 20 * unit}Q${tuft.x + 10 * unit} ${tuft.y - height * 0.3} ${tuft.x + 22 * unit - lean * 0.4} ${tuft.y - height * 0.72}`}
                stroke={BLADES[(index + 1) % BLADES.length]}
                strokeWidth={3 * unit}
              />
              {index % 3 === 0 && (
                <circle
                  cx={tuft.x + lean}
                  cy={tuft.y - height - 3 * unit}
                  r={5 * unit}
                  fill={BLOOMS[index % BLOOMS.length]}
                  stroke="#5a4020"
                  strokeWidth={unit}
                />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}
