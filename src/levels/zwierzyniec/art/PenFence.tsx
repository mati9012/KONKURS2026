import { useMemo } from 'react'
import { depthScale } from '@/levels/zwierzyniec/herd-layout'
import type { HerdLayout } from '@/levels/zwierzyniec/herd-layout'

const INK = '#3a2614'
const WOOD = '#9a6a3c'
const WOOD_LIGHT = '#c08a52'
const POST_HEIGHT = 50
const RAILS = [0.38, 0.78]

type Post = { x: number; y: number; height: number; gate?: boolean }

function postsAlong(layout: HerdLayout, x1: number, y1: number, x2: number, y2: number) {
  const length = Math.hypot(x2 - x1, (y2 - y1) * 2)
  const count = Math.max(1, Math.round(length / (70 * layout.unit)))
  return Array.from({ length: count + 1 }, (_, index): Post => {
    const t = index / count
    const y = y1 + (y2 - y1) * t
    return { x: x1 + (x2 - x1) * t, y, height: POST_HEIGHT * depthScale(layout, y) }
  })
}

function Rails({ posts, unit }: { posts: readonly Post[]; unit: number }) {
  let path = ''
  for (let index = 0; index < posts.length - 1; index++) {
    const a = posts[index]
    const b = posts[index + 1]
    for (const level of RAILS) {
      path += `M${a.x} ${a.y - a.height * level}L${b.x} ${b.y - b.height * level}`
    }
  }
  return (
    <>
      <path d={path} stroke={INK} strokeWidth={9 * unit} strokeLinecap="round" fill="none" />
      <path d={path} stroke={WOOD} strokeWidth={6 * unit} strokeLinecap="round" fill="none" />
      <path
        d={path}
        stroke={WOOD_LIGHT}
        strokeWidth={1.6 * unit}
        strokeLinecap="round"
        fill="none"
        transform={`translate(0 ${-1.5 * unit})`}
      />
    </>
  )
}

function Posts({ posts, unit }: { posts: readonly Post[]; unit: number }) {
  return (
    <>
      {posts.map((post) => {
        const width = (post.gate ? 12 : 8) * unit
        const height = post.height * (post.gate ? 1.25 : 1)
        return (
          <g key={`${post.x}-${post.y}`}>
            <ellipse
              cx={post.x}
              cy={post.y}
              rx={width}
              ry={width * 0.35}
              fill="#2c3a1c"
              opacity={0.25}
            />
            <path
              d={`M${post.x - width / 2} ${post.y}L${post.x - width / 2} ${post.y - height}L${post.x} ${post.y - height - width * 0.5}L${post.x + width / 2} ${post.y - height}L${post.x + width / 2} ${post.y}Z`}
              fill={WOOD}
              stroke={INK}
              strokeWidth={1.8 * unit}
              strokeLinejoin="round"
            />
            <path
              d={`M${post.x - width * 0.15} ${post.y - 2 * unit}L${post.x - width * 0.15} ${post.y - height + 2 * unit}`}
              stroke={WOOD_LIGHT}
              strokeWidth={1.4 * unit}
            />
          </g>
        )
      })}
    </>
  )
}

export function PenFence({ layout, side }: { layout: HerdLayout; side: 'back' | 'front' }) {
  const { pen, unit } = layout
  const runs = useMemo(() => {
    if (side === 'back') {
      return [
        postsAlong(layout, pen.left, pen.bottom, pen.left, pen.top),
        postsAlong(layout, pen.left, pen.top, pen.right, pen.top),
        postsAlong(layout, pen.right, pen.top, pen.right, pen.bottom),
      ]
    }
    const left = postsAlong(layout, pen.left, pen.bottom, pen.gateLeft, pen.bottom)
    const right = postsAlong(layout, pen.gateRight, pen.bottom, pen.right, pen.bottom)
    left[left.length - 1].gate = true
    right[0].gate = true
    return [left, right]
  }, [layout, pen, side])

  const gateLeaf = side === 'front' && (
    <g>
      <path
        d={`M${pen.gateRight + 6 * unit} ${pen.bottom - 8 * unit}L${pen.gateRight + 70 * unit} ${pen.bottom + 40 * unit}`}
        stroke={INK}
        strokeWidth={9 * unit}
        strokeLinecap="round"
      />
      <path
        d={`M${pen.gateRight + 6 * unit} ${pen.bottom - 8 * unit}L${pen.gateRight + 70 * unit} ${pen.bottom + 40 * unit}`}
        stroke={WOOD}
        strokeWidth={6 * unit}
        strokeLinecap="round"
      />
      <path
        d={`M${pen.gateRight + 6 * unit} ${pen.bottom - 38 * unit}L${pen.gateRight + 70 * unit} ${pen.bottom + 4 * unit}`}
        stroke={INK}
        strokeWidth={9 * unit}
        strokeLinecap="round"
      />
      <path
        d={`M${pen.gateRight + 6 * unit} ${pen.bottom - 38 * unit}L${pen.gateRight + 70 * unit} ${pen.bottom + 4 * unit}`}
        stroke={WOOD}
        strokeWidth={6 * unit}
        strokeLinecap="round"
      />
    </g>
  )

  return (
    <g>
      {runs.map((posts, index) => (
        <g key={index}>
          <Rails posts={posts} unit={unit} />
          <Posts posts={posts} unit={unit} />
        </g>
      ))}
      {gateLeaf}
    </g>
  )
}
