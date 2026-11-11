'use client'

import { motion } from 'motion/react'
import { useMemo } from 'react'
import { createRandom } from '@/lib/noise'
import { textureUrl } from '@/lib/three/texture-url'

const EXIT_EASE = [0.5, 0, 0.9, 0.4] as const
const CLOSE_EASE = [0.2, 0.8, 0.3, 1] as const
export const CURTAIN_CLOSE_MS = 1350

type Puff = {
  x: number
  y: number
  size: number
  tile: number
  flip: boolean
}

const TILE_POSITIONS = ['0% 0%', '100% 0%', '0% 100%', '100% 100%']

const LAYER_STYLE = {
  back: {
    width: 'w-[66vw]',
    fill: 'rgba(150, 156, 214, 0.9)',
    seedOffset: 0,
  },
  front: {
    width: 'w-[56vw]',
    fill: 'rgba(236, 214, 230, 0.95)',
    seedOffset: 50,
  },
}

function puffsFor(seed: number): Puff[] {
  const random = createRandom(seed)
  const puffs: Puff[] = []
  for (let y = -14; y < 110; y += 14) {
    const count = 2 + Math.floor(random() * 2)
    for (let i = 0; i < count; i++) {
      const inner = i === count - 1
      puffs.push({
        x: inner ? 62 + random() * 20 : random() * 45 - 10,
        y: y + random() * 8,
        size: inner ? 38 + random() * 16 : 48 + random() * 16,
        tile: Math.floor(random() * TILE_POSITIONS.length),
        flip: random() < 0.5,
      })
    }
  }
  return puffs
}

type CurtainProps = {
  side: 'left' | 'right'
  layer: 'back' | 'front'
  open: boolean
  reduceMotion: boolean
  closeFromAway?: boolean
}

export function Curtain({ side, layer, open, reduceMotion, closeFromAway = false }: CurtainProps) {
  const style = LAYER_STYLE[layer]
  const puffs = useMemo(
    () => puffsFor((side === 'left' ? 1385 : 1569) + style.seedOffset),
    [side, style.seedOffset],
  )
  const away = side === 'left' ? '-120vw' : '120vw'
  const duration = reduceMotion ? 0.6 : layer === 'back' ? 1.9 : 1.6
  const delay = layer === 'back' ? 0.15 : 0
  const travel = reduceMotion ? { opacity: 0 } : { x: away, opacity: [1, 1, 0] }
  const closed = { x: '0vw', opacity: 1 }
  const outer = side === 'left' ? 'to right' : 'to left'

  return (
    <motion.div
      className={`absolute inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} ${style.width} min-w-[300px] ${open ? 'will-change-transform' : ''}`}
      initial={closeFromAway ? { x: away, opacity: 1 } : false}
      animate={open ? travel : closed}
      transition={
        open
          ? {
              duration,
              delay,
              ease: EXIT_EASE,
              opacity: { duration, delay, times: [0, 0.7, 1], ease: 'linear' },
            }
          : { duration: duration * 0.6, delay, ease: CLOSE_EASE }
      }
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${outer}, ${style.fill} 0%, ${style.fill} 45%, transparent 78%)`,
        }}
      />
      <div className="absolute inset-0">
        {puffs.map((puff, index) => (
          <div
            key={index}
            className="absolute aspect-square bg-no-repeat"
            style={{
              [side]: `${puff.x}%`,
              top: `${puff.y}%`,
              width: `${puff.size}vmax`,
              translate: side === 'left' ? '-50% -50%' : '50% -50%',
              backgroundImage: `url(${textureUrl(`loading-clouds-${layer}.webp`)})`,
              backgroundSize: '200% 200%',
              backgroundPosition: TILE_POSITIONS[puff.tile],
              scale: puff.flip ? '-1 1' : '1 1',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

type CloudCurtainProps = {
  open: boolean
  reduceMotion: boolean
  closeFromAway?: boolean
}

export function CloudCurtain(props: CloudCurtainProps) {
  return (
    <>
      <Curtain side="left" layer="back" {...props} />
      <Curtain side="right" layer="back" {...props} />
      <Curtain side="left" layer="front" {...props} />
      <Curtain side="right" layer="front" {...props} />
    </>
  )
}
