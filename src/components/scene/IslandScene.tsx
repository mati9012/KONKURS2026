'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, PerformanceMonitor } from '@react-three/drei'
import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  Vignette,
} from '@react-three/postprocessing'
import { CameraRig } from '@/components/scene/CameraRig'
import { DevTools } from '@/components/scene/DevTools'
import { FloatingIsland } from '@/components/scene/island/FloatingIsland'
import { Balloon } from '@/components/scene/sky/Balloon'
import { CloudSea } from '@/components/scene/sky/CloudSea'
import { Eagle } from '@/components/scene/sky/Eagle'
import { SkyDome } from '@/components/scene/sky/SkyDome'
import { useGameStore } from '@/store/game-store'

const SUN_POSITION: [number, number, number] = [22, 26, 14]
const FOG_COLOR = '#c9c1ea'

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
      gl={{ toneMappingExposure: 1.08 }}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <fog attach="fog" args={[FOG_COLOR, 70, 260]} />
      <SkyDome />
      <hemisphereLight args={['#c9dcff', '#b38b6e', 1.15]} />
      <ambientLight intensity={0.25} color="#fff0e0" />
      <directionalLight
        position={SUN_POSITION}
        intensity={3.4}
        color="#ffd59a"
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
        <FloatingIsland quality={quality} />
      </Float>
      <Suspense fallback={null}>
        <CloudSea quality={quality} />
        <Balloon />
        <Eagle />
      </Suspense>
      <CameraRig />
      {high && (
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.72} luminanceSmoothing={0.25} intensity={0.85} />
          <HueSaturation saturation={0.22} />
          <BrightnessContrast brightness={0.02} contrast={0.1} />
          <Vignette offset={0.3} darkness={0.5} />
        </EffectComposer>
      )}
      <DevTools />
    </Canvas>
  )
}
