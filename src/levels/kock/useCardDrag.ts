import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

const DRAG_THRESHOLD = 8

export type CardDrag = {
  id: string
  startX: number
  startY: number
  x: number
  y: number
  moved: boolean
}

function targetAt(x: number, y: number) {
  for (const element of document.elementsFromPoint(x, y)) {
    const target = element.closest<SVGElement>('[data-target]')
    if (target?.dataset.target) return target.dataset.target
  }
  return null
}

export function useCardDrag(onDrop: (card: string, target: string) => void) {
  const [drag, setDrag] = useState<CardDrag | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const dragging = useRef<CardDrag | null>(null)

  function start(id: string, event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const { clientX: x, clientY: y } = event
    dragging.current = { id, startX: x, startY: y, x, y, moved: false }
    setDrag(dragging.current)
  }

  function move(event: ReactPointerEvent<HTMLElement>) {
    const current = dragging.current
    if (!current) return
    const { clientX: x, clientY: y } = event
    const moved =
      current.moved || Math.hypot(x - current.startX, y - current.startY) > DRAG_THRESHOLD
    dragging.current = { ...current, x, y, moved }
    setDrag(dragging.current)
    setHovered(moved ? targetAt(x, y) : null)
  }

  function cancel() {
    dragging.current = null
    setDrag(null)
    setHovered(null)
  }

  function end(event: ReactPointerEvent<HTMLElement>) {
    const current = dragging.current
    cancel()
    if (!current) return
    if (!current.moved) {
      setSelected((chosen) => (chosen === current.id ? null : current.id))
      return
    }
    const target = targetAt(event.clientX, event.clientY)
    if (target) onDrop(current.id, target)
  }

  function pick(target: string) {
    if (!selected) return
    setSelected(null)
    onDrop(selected, target)
  }

  return {
    drag,
    hovered,
    selected,
    setSelected,
    start,
    pick,
    handlers: { onPointerMove: move, onPointerUp: end, onPointerCancel: cancel },
  }
}
