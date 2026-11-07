'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

export function Eagle() {
  const groupRef = useRef<Group>(null)
  const leftWingRef = useRef<Group>(null)
  const rightWingRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const orbit = t * 0.12
    const group = groupRef.current
    if (group) {
      group.position.set(Math.cos(orbit) * 11, 7.5 + Math.sin(t * 0.4) * 0.6, Math.sin(orbit) * 9)
      group.rotation.set(0, -orbit, 0.25)
    }
    const flap = Math.sin(t * 3.2) * 0.45
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap
  })

  return (
    <group ref={groupRef} scale={0.6}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.5, 5]} />
        <meshStandardMaterial color="#5b3a22" flatShading />
      </mesh>
      <mesh position={[0, 0.02, 0.27]}>
        <icosahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color="#f3ede0" flatShading />
      </mesh>
      <group ref={leftWingRef} position={[0, 0.02, 0]}>
        <mesh position={[0.24, 0, 0]}>
          <boxGeometry args={[0.46, 0.015, 0.16]} />
          <meshStandardMaterial color="#6b4528" flatShading />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0, 0.02, 0]}>
        <mesh position={[-0.24, 0, 0]}>
          <boxGeometry args={[0.46, 0.015, 0.16]} />
          <meshStandardMaterial color="#6b4528" flatShading />
        </mesh>
      </group>
    </group>
  )
}
