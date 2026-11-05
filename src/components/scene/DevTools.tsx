'use client'

import dynamic from 'next/dynamic'

const Perf = dynamic(() => import('r3f-perf').then((mod) => mod.Perf), { ssr: false })

export function DevTools() {
  if (process.env.NODE_ENV !== 'development') return null
  return <Perf position="bottom-left" minimal />
}
