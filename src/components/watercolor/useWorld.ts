import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export type World = { width: number; height: number }

const MIN_WIDTH = 600
const MAX_WIDTH = 1800
const BASE_HEIGHT = 900

function worldFor(aspect: number): World {
  const width = Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, BASE_HEIGHT * aspect)))
  return { width, height: Math.round(width / aspect) }
}

export function useWorld(container: RefObject<HTMLElement | null>) {
  const [world, setWorld] = useState<World>({ width: 1600, height: BASE_HEIGHT })

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) return
      const next = worldFor(width / height)
      setWorld((current) =>
        current.width === next.width && current.height === next.height ? current : next,
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [container])

  return world
}

export function toWorld(svg: SVGSVGElement, clientX: number, clientY: number) {
  const matrix = svg.getScreenCTM()
  if (!matrix) return null
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
  return { x: point.x, y: point.y }
}
