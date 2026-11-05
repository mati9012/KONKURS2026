'use client'

import { Float } from '@react-three/drei'

export function Island() {
  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[4, 2.5, 1.2, 7]} />
        <meshStandardMaterial color="#4d7c0f" flatShading />
      </mesh>
      <mesh position={[0, -1.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[2.5, 2.4, 7]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>
    </Float>
  )
}
