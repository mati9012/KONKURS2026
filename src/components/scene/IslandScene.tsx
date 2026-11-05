'use client'

import { Canvas } from '@react-three/fiber'
import { CameraControls, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { DevTools } from '@/components/scene/DevTools'
import { Island } from '@/components/scene/Island'
import { useGameStore } from '@/store/game-store'

export function IslandScene() {
  const quality = useGameStore((state) => state.settings.quality)
  const setQuality = useGameStore((state) => state.setQuality)

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      shadows={quality === 'high' ? 'percentage' : false}
      dpr={quality === 'high' ? [1, 2] : [1, 1.25]}
      camera={{ position: [0, 6, 10], fov: 45 }}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 12, 30]} />
      <hemisphereLight args={['#fde68a', '#1e293b', 0.6]} />
      <directionalLight position={[5, 10, 5]} intensity={1.4} castShadow />
      <Island />
      <CameraControls makeDefault minDistance={4} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
      {quality === 'high' && (
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.8} intensity={0.6} />
          <Vignette offset={0.3} darkness={0.6} />
        </EffectComposer>
      )}
      <DevTools />
    </Canvas>
  )
}
