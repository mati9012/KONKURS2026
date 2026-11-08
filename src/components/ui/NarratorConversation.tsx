'use client'

import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { NARRATOR_NAME } from '@/content/intro'
import type { DialogueLine } from '@/content/schema'
import { PAPER_GRAIN, PARCHMENT_FILL, PARCHMENT_SHADOW } from '@/components/ui/parchment'

const NarratorPortrait = dynamic(
  () => import('@/components/scene/NarratorPortrait').then((mod) => mod.NarratorPortrait),
  { ssr: false },
)

const CHARACTERS_PER_SECOND = 34
const DEVIL_NAME = 'Diabeł'
const SETTLE_TO_IDLE_MS = 900

function useTypewriter(text: string) {
  const [shown, setShown] = useState(0)
  const [prevText, setPrevText] = useState(text)
  if (text !== prevText) {
    setPrevText(text)
    setShown(0)
  }

  useEffect(() => {
    if (shown >= text.length) return
    const timer = setTimeout(() => setShown((count) => count + 1), 1000 / CHARACTERS_PER_SECOND)
    return () => clearTimeout(timer)
  }, [shown, text])

  return {
    visible: text.slice(0, shown),
    done: shown >= text.length,
    finish: () => setShown(text.length),
  }
}

function useSettled(done: boolean, key: string) {
  const [settledKey, setSettledKey] = useState<string | null>(null)

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => setSettledKey(key), SETTLE_TO_IDLE_MS)
    return () => clearTimeout(timer)
  }, [done, key])

  return settledKey === key
}

type NarratorConversationProps = {
  lines: DialogueLine[]
  doneLabel: string
  onDone: () => void
}

export function NarratorConversation({ lines, doneLabel, onDone }: NarratorConversationProps) {
  const [index, setIndex] = useState(0)
  const line = lines[index]
  const last = index === lines.length - 1
  const { visible, done, finish } = useTypewriter(line.text)
  const settled = useSettled(done, line.id)
  const devil = line.speaker === 'diabel'

  const advance = useCallback(() => {
    if (!done) return finish()
    if (last) return onDone()
    setIndex((value) => value + 1)
  }, [done, finish, last, onDone])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDone()
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, onDone])

  return (
    <motion.section
      role="dialog"
      aria-label={`${NARRATOR_NAME} mówi`}
      className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="relative flex w-full max-w-4xl flex-col items-start sm:flex-row sm:items-end">
        <div className="pointer-events-none relative z-10 -mb-8 h-48 w-40 shrink-0 sm:-mr-14 sm:mb-0 sm:h-80 sm:w-64">
          <NarratorPortrait
            speaker={line.speaker}
            gesture={settled ? 'idle' : line.gesture}
            speaking={!done}
          />
        </div>
        <div
          className="relative w-full rounded-2xl px-5 pt-7 pb-4 sm:pr-7 sm:pl-16"
          style={{
            backgroundImage: `${PAPER_GRAIN}, ${PARCHMENT_FILL}`,
            boxShadow: `${PARCHMENT_SHADOW}, 0 18px 40px rgba(40, 25, 70, 0.35)`,
          }}
          onClick={advance}
        >
          <span
            className={`absolute -top-4 left-36 rounded-full border-2 px-4 py-1 font-display text-lg font-bold text-[#f6e7c8] shadow-md sm:left-14 ${devil ? 'border-[#3a0d0d] bg-[#8e1f1f]' : 'border-[#b8894f] bg-[#1f5c50]'}`}
          >
            {devil ? DEVIL_NAME : NARRATOR_NAME}
          </span>
          <p className="sr-only" aria-live="polite">
            {line.text}
          </p>
          <p
            aria-hidden="true"
            className={`min-h-[4.5rem] font-display text-base leading-snug font-semibold sm:text-lg ${devil ? 'text-[#7a1616] italic' : 'text-[#4a2f1a]'}`}
          >
            {visible}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#8a5a2b]">
              {index + 1} / {lines.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-sm font-bold text-[#8a5a2b] hover:bg-[#e8d3a8]"
                onClick={(event) => {
                  event.stopPropagation()
                  onDone()
                }}
              >
                Pomiń
              </button>
              <button
                type="button"
                className="rounded-full bg-[#1f5c50] px-5 py-1.5 text-sm font-bold text-[#f6e7c8] shadow hover:bg-[#2a7363]"
                onClick={(event) => {
                  event.stopPropagation()
                  advance()
                }}
              >
                {last && done ? doneLabel : 'Dalej'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
