'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AdditiveBlending, DoubleSide, MeshBasicMaterial } from 'three'
import { BUILDING_IDS, SOCKET_NAMES } from '@/content/zamosc'
import type { BuildingId, HejnalDirection } from '@/content/zamosc'
import type { CitySocket, ZamoscCity } from '@/levels/zamosc/useZamoscCity'

const RISE_SECONDS = 1.1
const HIDDEN_SCALE = 0.0001
const CLICK_TOLERANCE_PX = 6
const TURN_EASE = 5

const FACING: Record<HejnalDirection, number> = {
  south: 0,
  east: Math.PI / 2,
  north: Math.PI,
  west: -Math.PI / 2,
}

function easeOutBack(t: number) {
  const overshoot = 1.6
  const shifted = t - 1
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2
}

function shortestTurn(from: number, to: number) {
  const full = Math.PI * 2
  return ((((to - from) % full) + full * 1.5) % full) - Math.PI
}

const ringMaterial = new MeshBasicMaterial({
  color: '#ffd36e',
  transparent: true,
  side: DoubleSide,
  depthWrite: false,
})
const discMaterial = new MeshBasicMaterial({
  color: '#fff3c4',
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
})
const beamMaterial = new MeshBasicMaterial({
  color: '#ffe39a',
  transparent: true,
  opacity: 0.22,
  blending: AdditiveBlending,
  depthWrite: false,
})

type SocketMarkerProps = {
  socket: CitySocket
  onPick: (id: BuildingId) => void
}

function SocketMarker({ socket, onPick }: SocketMarkerProps) {
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  return (
    <group position={socket.position} scale={hovered ? 1.12 : 1} userData={{ socket: socket.id }}>
      <mesh rotation-x={-Math.PI / 2} material={ringMaterial} position-y={0.03}>
        <ringGeometry args={[socket.radius * 0.82, socket.radius, 40]} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        material={discMaterial}
        position-y={0.02}
        name={`socket-${socket.id}`}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          if (event.delta > CLICK_TOLERANCE_PX) return
          event.stopPropagation()
          onPick(socket.id)
        }}
      >
        <circleGeometry args={[socket.radius, 40]} />
      </mesh>
      <Html position={[0, 1.9, 0]} center zIndexRange={[15, 0]}>
        <button
          type="button"
          aria-label={`Miejsce na makiecie: ${SOCKET_NAMES[socket.id]}`}
          className="grid size-8 place-items-center rounded-full border-2 border-[#b8894f] bg-[#fff3c4] font-display text-base font-bold text-[#8a5a2b] shadow-[0_4px_12px_rgba(60,30,10,0.35)] hover:scale-110"
          onClick={() => onPick(socket.id)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          ?
        </button>
      </Html>
      <mesh material={beamMaterial} position-y={0.9}>
        <cylinderGeometry args={[socket.radius * 0.18, socket.radius * 0.3, 1.8, 12, 1, true]} />
      </mesh>
    </group>
  )
}

function hideUnbuilt(city: ZamoscCity) {
  for (const id of BUILDING_IDS) {
    const building = city.buildings[id]
    building.scale.y = HIDDEN_SCALE
    building.visible = false
  }
  city.trumpeter.visible = false
  city.trumpeter.rotation.y = FACING.west
}

function animateCity(
  city: ZamoscCity,
  built: readonly BuildingId[],
  riseStart: Map<BuildingId, number>,
  facing: HejnalDirection,
  now: number,
  delta: number,
) {
  for (const id of built) {
    if (!riseStart.has(id)) riseStart.set(id, now)
    const progress = Math.min(1, (now - (riseStart.get(id) ?? now)) / RISE_SECONDS)
    const building = city.buildings[id]
    building.visible = true
    building.scale.y = Math.max(HIDDEN_SCALE, easeOutBack(progress))
  }
  city.trumpeter.visible = riseStart.has('townhall')
  const turn = shortestTurn(city.trumpeter.rotation.y, FACING[facing])
  city.trumpeter.rotation.y += turn * Math.min(1, delta * TURN_EASE)
  ringMaterial.opacity = 0.55 + 0.35 * Math.sin(now * 3.2)
}

type CityModelProps = {
  city: ZamoscCity
  built: readonly BuildingId[]
  sockets: readonly BuildingId[]
  facing: HejnalDirection
  onPick: (id: BuildingId) => void
}

export function CityModel({ city, built, sockets, facing, onPick }: CityModelProps) {
  const riseStart = useRef(new Map<BuildingId, number>())
  const visibleSockets = useMemo(
    () => city.sockets.filter((socket) => sockets.includes(socket.id)),
    [city.sockets, sockets],
  )

  useEffect(() => hideUnbuilt(city), [city])

  useFrame(({ clock }, delta) => {
    animateCity(city, built, riseStart.current, facing, clock.elapsedTime, delta)
  })

  return (
    <group>
      <primitive object={city.scene} />
      {visibleSockets.map((socket) => (
        <SocketMarker key={socket.id} socket={socket} onPick={onPick} />
      ))}
    </group>
  )
}
