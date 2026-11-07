'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, PerformanceMonitor } from '@react-three/drei'
import { CameraRig } from '@/components/scene/CameraRig'
import { DevTools } from '@/components/scene/DevTools'
import { FloatingIsland } from '@/components/scene/island/FloatingIsland'
import { Balloon } from '@/components/scene/sky/Balloon'
import { CloudSea } from '@/components/scene/sky/CloudSea'
import { Eagle } from '@/components/scene/sky/Eagle'
import { SkyDome } from '@/components/scene/sky/SkyDome'
import { useGameStore } from '@/store/game-store'

const SUN_POSITION: [number, number, number] = [26, 19, -6]
const FOG_COLOR = '#c9c8ec'

export function IslandScene() {
  const quality = useGameStore((state) => state.settings.quality)
  const setQuality = useGameStore((state) => state.setQuality)
  const high = quality === 'high'

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      shadows={high ? 'percentage' : false}
      dpr={high ? [1, 2] : [1, 1.25]}
      camera={{ position: [0, 22, 22], fov: 40, near: 0.1, far: 700 }}
      flat
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <fog attach="fog" args={[FOG_COLOR, 70, 260]} />
      <SkyDome />
      <ambientLight intensity={0.9} color="#cfd6f2" />
      <directionalLight
        position={SUN_POSITION}
        intensity={4}
        color="#ffe0b8"
        castShadow={high}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <Float
        speed={0.8}
        rotationIntensity={0.03}
        floatIntensity={0.25}
        floatingRange={[-0.15, 0.15]}
      >
        <Suspense fallback={null}>
          <FloatingIsland quality={quality} />
        </Suspense>
      </Float>
      <Suspense fallback={null}>
        <CloudSea quality={quality} />
        <Balloon />
        <Eagle />
      </Suspense>
      <CameraRig />
      <DevTools />
    </Canvas>
  )
}
