'use client'

import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { extractModelAsset, modelUrl } from '@/lib/three/model-asset'

export function useModelAsset(name: string, baseCut = 0) {
  const { scene } = useGLTF(modelUrl(name))
  return useMemo(() => extractModelAsset(scene, baseCut), [scene, baseCut])
}

export function preloadModels(names: string[]) {
  names.forEach((name) => useGLTF.preload(modelUrl(name)))
}
