import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { blobPath, ridgePath } from '@/components/watercolor/paint'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { HillPageId } from '@/content/chelm'
import { OakArt } from '@/levels/chelm/art/OakArt'
import type { SceneLayout } from '@/levels/chelm/scene-layout'

const INK = '#2a2216'
const WALL = '#f6f1e4'
const COPPER = '#5a9a84'

export type HillGeometry = {
  summitX: number
  summitY: number
  waypoints: { x: number; y: number }[]
}

export function hillGeometry(layout: SceneLayout): HillGeometry {
  const { world, unit, ground, portrait } = layout
  const summitX = world.width * (portrait ? 0.55 : 0.72)
  const summitY = ground - (portrait ? 430 : 250) * unit
  const startY = ground - 20 * unit
  const steps = 6
  const reach = portrait ? 0.3 : 0.2
  return {
    summitX,
    summitY,
    waypoints: Array.from({ length: steps + 1 }, (_, index) => {
      const share = index / steps
      const side = index % 2 === 0 ? -1 : 1
      const spread = world.width * reach * (1 - share * 0.7)
      return {
        x:
          index === steps
            ? summitX - 150 * unit
            : world.width * 0.5 + (summitX - world.width * 0.5) * share + side * spread,
        y: startY + (summitY - startY) * share,
      }
    }),
  }
}

function Rise({ children, show }: { children: ReactNode; show: boolean }) {
  if (!show) return null
  return (
    <motion.g
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      {children}
    </motion.g>
  )
}

function Stronghold() {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={2.5}>
      <rect x={-90} y={-70} width={120} height={70} fill="#b07a44" />
      <path d="M-100 -70L-30 -120L40 -70Z" fill="#7a4e2a" />
      {Array.from({ length: 16 }, (_, index) => (
        <path
          key={index}
          d={`M${-220 + index * 28} 0V-46L${-206 + index * 28} -60L${-192 + index * 28} -46V0Z`}
          fill="#9a6a3a"
        />
      ))}
    </g>
  )
}

function OldChurch() {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={2.5}>
      <rect x={-50} y={-90} width={100} height={90} fill={WALL} />
      <rect x={-26} y={-150} width={52} height={60} fill={WALL} />
      <path d="M-30 -150C-30 -190 30 -190 30 -150Z" fill={COPPER} />
      <path d="M0 -188V-212M-9 -202H9" stroke="#c8a040" strokeWidth={4} />
      <path d="M-12 0V-40C-12 -54 12 -54 12 -40V0Z" fill="#6a5440" />
    </g>
  )
}

function Basilica({ papal }: { papal: boolean }) {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={2.5}>
      <rect x={-110} y={-150} width={220} height={150} fill={WALL} />
      <path d="M-70 -150L0 -200L70 -150Z" fill={WALL} />
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 130} 0)`}>
          <rect x={-34} y={-250} width={68} height={250} fill={WALL} />
          <path d="M-38 -250C-38 -290 38 -290 38 -250Z" fill={COPPER} />
          <path d="M-14 -290C-14 -312 14 -312 14 -290Z" fill={COPPER} />
          <path d="M0 -312V-338M-10 -326H10" stroke="#c8a040" strokeWidth={4} />
          <rect x={-12} y={-220} width={24} height={40} rx={10} fill="#6a7a8a" />
          {papal && (
            <g>
              <path d="M0 -338V-372" strokeWidth={2} />
              <path d="M0 -372H24V-360H0Z" fill="#f2d24a" />
              <path d="M0 -360H24V-348H0Z" fill="#fbfaf4" />
            </g>
          )}
        </g>
      ))}
      <path d="M-26 0V-70C-26 -100 26 -100 26 -70V0Z" fill="#6a5440" />
      {[-70, 70].map((x) => (
        <rect key={x} x={x - 12} y={-120} width={24} height={44} rx={10} fill="#6a7a8a" />
      ))}
    </g>
  )
}

function BellTower() {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={2.5}>
      <rect x={-40} y={-200} width={80} height={200} fill={WALL} />
      <rect x={-32} y={-300} width={64} height={100} fill={WALL} />
      <path d="M-16 -270C-16 -292 16 -292 16 -270V-224H-16Z" fill="#3a3028" />
      <path d="M-10 -240C-10 -262 10 -262 10 -240L14 -230H-14Z" fill="#c89a3a" />
      <path d="M-38 -300C-38 -350 38 -350 38 -300Z" fill={COPPER} />
      <path d="M0 -346V-376M-10 -362H10" stroke="#c8a040" strokeWidth={4} />
      <rect x={-12} y={-150} width={24} height={40} rx={10} fill="#6a7a8a" />
    </g>
  )
}

function Townhouses({ count, seed }: { count: number; seed: number }) {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth={2}>
      {Array.from({ length: count }, (_, index) => {
        const x = index * 70
        const tall = 70 + ((index * 37 + seed) % 3) * 16
        return (
          <g key={index}>
            <rect
              x={x}
              y={-tall}
              width={64}
              height={tall}
              fill={index % 2 ? '#efe2c4' : '#f4ead2'}
            />
            <path
              d={`M${x - 4} ${-tall}L${x + 32} ${-tall - 40}L${x + 68} ${-tall}Z`}
              fill="#b8523a"
            />
            <rect x={x + 22} y={-tall + 18} width={20} height={24} fill="#5a6a7a" />
          </g>
        )
      })}
    </g>
  )
}

type HillSceneProps = {
  layout: SceneLayout
  geometry: HillGeometry
  built: (page: HillPageId) => boolean
}

export function HillScene({ layout, geometry, built }: HillSceneProps) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const { summitX, summitY, waypoints } = geometry
  const plateau = (portrait ? 220 : 200) * unit
  const hill = `M-20 ${ground + 60 * unit}C${width * 0.12} ${ground - 40 * unit} ${summitX - plateau * 1.8} ${summitY} ${summitX - plateau} ${summitY}H${summitX + plateau}C${summitX + plateau * 1.8} ${summitY} ${width * 0.9} ${ground - 40 * unit} ${width + 20} ${ground + 40 * unit}V${height}H-20Z`
  const trail = waypoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join('')
  const scale = unit * (portrait ? 0.9 : 0.62)

  return (
    <g>
      <defs>
        <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc4e0" />
          <stop offset="1" stopColor="#f8eed6" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#ch-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.2, height * 0.14, 140 * unit, 22 * unit, 11, 0.3)}
          fill="#fffaf0"
        />
        <path
          d={blobPath(width * 0.82, height * 0.22, 110 * unit, 18 * unit, 17, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <path
        d={ridgePath(width, ground - 120 * unit, 50 * unit, 3, ground + 20 * unit)}
        fill="#a8bc8a"
        opacity={0.7}
        filter={PAINT_SOFT}
      />
      <path d={hill} fill="#8aa86a" filter={PAINT} />
      <path
        d={`M${summitX - plateau} ${summitY + 6 * unit}H${summitX + plateau}`}
        stroke="#e8e2cc"
        strokeWidth={14 * unit}
        opacity={0.7}
      />
      <path
        d={trail}
        fill="none"
        stroke="#e8d8b0"
        strokeWidth={18 * unit}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={PAINT_SOFT}
      />
      <g transform={`translate(${width * 0.02} ${ground + 10 * unit}) scale(${scale * 0.8})`}>
        <Rise show={built('miasto')}>
          <Townhouses count={5} seed={1} />
        </Rise>
      </g>
      <g transform={`translate(${width * 0.78} ${ground + 20 * unit}) scale(${scale * 0.8})`}>
        <Rise show={built('miasto')}>
          <Townhouses count={5} seed={2} />
        </Rise>
      </g>
      {[-0.95, -0.7, -0.45].map((share, index) => (
        <OakArt
          key={share}
          x={summitX + plateau * share * 1.5}
          y={summitY + (60 + index * 18) * unit}
          size={scale * 0.9}
        />
      ))}
      <g transform={`translate(${summitX} ${summitY}) scale(${scale})`}>
        <Rise show={built('grod') && !built('bazylika')}>
          <Stronghold />
        </Rise>
        <Rise show={built('cerkiew') && !built('bazylika')}>
          <OldChurch />
        </Rise>
        <Rise show={built('bazylika')}>
          <Basilica papal={built('papiez')} />
        </Rise>
      </g>
      <g transform={`translate(${summitX + plateau * 0.85} ${summitY}) scale(${scale})`}>
        <Rise show={built('dzwonnica')}>
          <BellTower />
        </Rise>
      </g>
    </g>
  )
}
