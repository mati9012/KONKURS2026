import { useMemo } from 'react'
import { createRandom } from '@/lib/noise'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import { CzartyDance } from '@/levels/roztocze/art/CzartyDance'
import type { SceneLayout } from '@/levels/roztocze/scene-layout'

const FAR_FOREST = {
  fir: ['#6a4f6e', '#5f4866', '#74566f'],
  beech: ['#7d5f72', '#86677a'],
  trunk: '#4a3550',
}
const NEAR_FOREST = {
  fir: ['#3b2f45', '#33293d', '#45364c'],
  beech: ['#4c3a4a', '#563f4f', '#433441'],
  trunk: '#2c2230',
}

export function DuskBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, horizon, unit } = layout
  const { width, height } = world
  const pebbles = useMemo(
    () =>
      scatter(23, Math.round((width * height) / 14000), {
        x: 0,
        y: horizon + 40 * unit,
        width,
        height: height - horizon,
      }),
    [width, height, horizon, unit],
  )

  const trunkY = horizon + (height - horizon) * 0.13
  const rocks = useMemo(() => {
    const random = createRandom(88)
    return scatter(91, Math.round(width / 260), {
      x: 0,
      y: horizon + 60 * unit,
      width,
      height: height - horizon - 60 * unit,
    })
      .map((rock) => ({ ...rock, seed: Math.floor(random() * 1000) }))
      .filter((rock) => Math.abs(rock.y - trunkY) > 70 * unit)
  }, [width, height, horizon, unit, trunkY])
  const tufts = useMemo(
    () =>
      scatter(17, Math.round((width * height) / 30000), {
        x: 0,
        y: horizon + 50 * unit,
        width,
        height: height - horizon,
      }),
    [width, height, horizon, unit],
  )

  return (
    <g>
      <defs>
        <linearGradient id="rz-dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f3566" />
          <stop offset="0.45" stopColor="#9a5f78" />
          <stop offset="0.8" stopColor="#e39a6c" />
          <stop offset="1" stopColor="#f6c987" />
        </linearGradient>
        <linearGradient id="rz-dusk-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c99f73" />
          <stop offset="1" stopColor="#e3c391" />
        </linearGradient>
        <radialGradient id="rz-dusk-sun">
          <stop offset="0" stopColor="#fff2c4" />
          <stop offset="0.5" stopColor="#ffd38a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffb070" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#rz-dusk-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.35} />
      <circle cx={width * 0.78} cy={horizon - 40 * unit} r={150 * unit} fill="url(#rz-dusk-sun)" />
      <circle cx={width * 0.78} cy={horizon - 30 * unit} r={42 * unit} fill="#ffe3a6" />
      <g filter={PAINT_SOFT}>
        <path
          d={blobPath(width * 0.25, horizon * 0.35, 220 * unit, 22 * unit, 4, 0.3)}
          fill="#f2a98a"
          opacity={0.55}
        />
        <path
          d={blobPath(width * 0.6, horizon * 0.5, 260 * unit, 18 * unit, 9, 0.3)}
          fill="#f7c29a"
          opacity={0.5}
        />
      </g>
      <path
        d={ridgePath(width, horizon - 70 * unit, 60 * unit, 3, height, 0.003)}
        fill="#8a6688"
        filter={PAINT_SOFT}
        opacity={0.85}
      />
      <TreeLine
        width={width}
        baseY={horizon - 20 * unit}
        height={90 * unit}
        seed={12}
        palette={FAR_FOREST}
        filter={PAINT_SOFT}
        opacity={0.9}
      />
      <TreeLine
        width={width}
        baseY={horizon + 10 * unit}
        height={120 * unit}
        seed={31}
        palette={NEAR_FOREST}
        density={0.8}
        filter={PAINT}
      />
      <path
        d={ridgePath(width, horizon + 40 * unit, 18 * unit, 8, height, 0.002)}
        fill="url(#rz-dusk-sand)"
        filter={PAINT}
      />
      <CzartyDance x={width * 0.12} y={horizon + 36 * unit} scale={unit * 1.8} />
      {rocks.map((rock) => (
        <g key={`${rock.x}-${rock.y}`} filter={PAINT}>
          <path
            d={blobPath(
              rock.x,
              rock.y,
              34 * unit * rock.size,
              18 * unit * rock.size,
              rock.seed,
              0.22,
            )}
            fill={rock.tone > 0.5 ? '#9a8a7a' : '#867868'}
          />
          <path
            d={blobPath(
              rock.x - 8 * unit,
              rock.y - 7 * unit,
              18 * unit * rock.size,
              7 * unit * rock.size,
              rock.seed + 1,
              0.2,
            )}
            fill="#c2b4a0"
            opacity={0.7}
          />
        </g>
      ))}
      {tufts.map((tuft) => (
        <path
          key={`${tuft.x}-${tuft.y}`}
          d={`M${tuft.x - 8 * unit} ${tuft.y}l${-4 * unit} ${-16 * unit * tuft.size}M${tuft.x} ${tuft.y}l${1 * unit} ${-22 * unit * tuft.size}M${tuft.x + 8 * unit} ${tuft.y}l${5 * unit} ${-15 * unit * tuft.size}`}
          stroke={tuft.tone > 0.5 ? '#8a8a4a' : '#6f7a42'}
          strokeWidth={3 * unit}
          strokeLinecap="round"
        />
      ))}
      {pebbles.map((pebble) => (
        <ellipse
          key={`${pebble.x}-${pebble.y}`}
          cx={pebble.x}
          cy={pebble.y}
          rx={6 * unit * pebble.size}
          ry={3.5 * unit * pebble.size}
          fill={pebble.tone > 0.5 ? '#a98b6c' : '#8e7a66'}
          opacity={0.7}
        />
      ))}
    </g>
  )
}
