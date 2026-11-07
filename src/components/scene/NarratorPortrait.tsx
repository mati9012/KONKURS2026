'use client'

import { useAnimations, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { Quaternion, Vector3 } from 'three'
import type { AnimationAction, Group, Object3D } from 'three'
import type { NarratorGesture } from '@/content/schema'
import { modelUrl } from '@/lib/three/model-asset'

const MODEL = modelUrl('koziol')
const FADE_SECONDS = 0.35
const JAW_OPEN = 0.09
const JAW_EASE = 14
const HINGE = new Vector3(1, 0, 0)
const parentTurn = new Quaternion()
const hinge = new Vector3()
const jawTurn = new Quaternion()
const jawBase = new Quaternion()
const jawWritten = new Quaternion()

type GoatProps = {
  gesture: NarratorGesture
  speaking: boolean
}

function chatter(time: number) {
  return (0.5 + 0.5 * Math.sin(time * 13)) * (0.65 + 0.35 * Math.sin(time * 3.1))
}

function openJaw(jaw: Object3D, amount: number) {
  if (!jaw.quaternion.equals(jawWritten)) jawBase.copy(jaw.quaternion)
  jaw.quaternion.copy(jawBase)
  if (jaw.parent && amount > 0.001) {
    jaw.parent.getWorldQuaternion(parentTurn)
    hinge.copy(HINGE).applyQuaternion(parentTurn.invert())
    jawTurn.setFromAxisAngle(hinge, amount * JAW_OPEN)
    jaw.quaternion.premultiply(jawTurn)
  }
  jawWritten.copy(jaw.quaternion)
}

function Goat({ gesture, speaking }: GoatProps) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(MODEL)
  const { actions } = useAnimations(animations, group)
  const jaw = useRef<Object3D | null>(null)
  const mouth = useRef(0)
  const current = useRef<AnimationAction | null>(null)

  useEffect(() => {
    jaw.current = scene.getObjectByName('jaw') ?? null
  }, [scene])

  useEffect(() => {
    const next = actions[gesture]
    if (!next) return
    const previous = current.current
    if (previous === next && next.isRunning()) return
    next.reset().play()
    if (previous && previous !== next && previous.isRunning()) {
      next.fadeIn(FADE_SECONDS)
      previous.fadeOut(FADE_SECONDS)
    }
    current.current = next
  }, [actions, gesture])

  useFrame(({ clock }, delta) => {
    const target = speaking && gesture !== 'talk' ? chatter(clock.elapsedTime) : 0
    mouth.current += (target - mouth.current) * Math.min(1, delta * JAW_EASE)
    if (jaw.current) openJaw(jaw.current, mouth.current)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

export function NarratorPortrait(props: GoatProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ alpha: true }}
      camera={{ position: [0.34, 0.7, 1.7], fov: 30 }}
      onCreated={({ camera }) => camera.lookAt(0.02, 0.6, 0)}
    >
      <hemisphereLight args={['#f4f1ff', '#8a6a52', 1.6]} />
      <directionalLight position={[1.5, 2.5, 2]} intensity={2.6} color="#ffe6c8" />
      <directionalLight position={[-2, 1, -1]} intensity={0.8} color="#b9c6ff" />
      <Suspense fallback={null}>
        <Goat {...props} />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(MODEL)
