import { useMotionValue } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

const DRAG_THRESHOLD = 8

export type CardDrag = {
  id: string
  moved: boolean
}

export type DragPosition = { x: MotionValue<number>; y: MotionValue<number> }

type DragStart = CardDrag & { startX: number; startY: number }

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
  const dragging = useRef<DragStart | null>(null)
  const hoverFrame = useRef(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  function start(id: string, event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const { clientX, clientY } = event
    dragging.current = { id, startX: clientX, startY: clientY, moved: false }
    x.set(clientX)
    y.set(clientY)
    setDrag({ id, moved: false })
  }

  function move(event: ReactPointerEvent<HTMLElement>) {
    const current = dragging.current
    if (!current) return
    const { clientX, clientY } = event
    x.set(clientX)
    y.set(clientY)
    if (!current.moved) {
      if (Math.hypot(clientX - current.startX, clientY - current.startY) <= DRAG_THRESHOLD) return
      current.moved = true
      setDrag({ id: current.id, moved: true })
    }
    if (hoverFrame.current) return
    hoverFrame.current = requestAnimationFrame(() => {
      hoverFrame.current = 0
      if (dragging.current) setHovered(targetAt(x.get(), y.get()))
    })
  }

  function cancel() {
    cancelAnimationFrame(hoverFrame.current)
    hoverFrame.current = 0
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
    position: { x, y } satisfies DragPosition,
    hovered,
    selected,
    setSelected,
    start,
    pick,
    handlers: { onPointerMove: move, onPointerUp: end, onPointerCancel: cancel },
  }
}
