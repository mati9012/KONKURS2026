'use client'

import { Canvas } from '@react-three/fiber'
import { Float, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { CameraRig } from '@/components/scene/CameraRig'
import { DevTools } from '@/components/scene/DevTools'
import { FloatingIsland } from '@/components/scene/island/FloatingIsland'
import { Balloon } from '@/components/scene/sky/Balloon'
import { CloudSea } from '@/components/scene/sky/CloudSea'
import { Eagle } from '@/components/scene/sky/Eagle'
import { SkyDome, SUN_DIRECTION } from '@/components/scene/sky/SkyDome'
import { useGameStore } from '@/store/game-store'

const SUN_POSITION = SUN_DIRECTION.clone().multiplyScalar(30).toArray()

export function IslandScene() {
  const quality = useGameStore((state) => state.settings.quality)
  const setQuality = useGameStore((state) => state.setQuality)
  const high = quality === 'high'

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      shadows={high ? 'percentage' : false}
      dpr={high ? [1, 2] : [1, 1.25]}
      camera={{ position: [0, 22, 22], fov: 42, near: 0.1, far: 400 }}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <fog attach="fog" args={['#e9c3d6', 38, 120]} />
      <SkyDome />
      <hemisphereLight args={['#e6eeff', '#a77fa0', 1.25]} />
      <ambientLight intensity={0.35} color="#fff0e0" />
      <directionalLight
        position={SUN_POSITION}
        intensity={2.9}
        color="#ffe2b8"
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
      <CloudSea quality={quality} />
      <Balloon />
      <Eagle />
      <CameraRig />
      {high && (
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.55} />
          <Vignette offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
      <DevTools />
    </Canvas>
  )
}
