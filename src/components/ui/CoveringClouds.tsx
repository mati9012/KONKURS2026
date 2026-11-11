'use client'

import { useReducedMotion } from 'motion/react'
import { CloudCurtain } from '@/components/ui/CloudCurtain'

export function CoveringClouds({ closeFromAway = false }: { closeFromAway?: boolean }) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <CloudCurtain open={false} reduceMotion={reduceMotion} closeFromAway={closeFromAway} />
    </div>
  )
}
