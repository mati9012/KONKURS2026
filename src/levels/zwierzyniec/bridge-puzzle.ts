import { BRIDGE_HINTS } from '@/content/zwierzyniec'
import { createRandom } from '@/lib/noise'
import { shuffled } from '@/lib/shuffle'
import { PLANK_SPAN, SECTION_ROTTEN, SECTION_SPARES } from '@/levels/zwierzyniec/bridge-layout'
import type { Gap, PlankLength } from '@/levels/zwierzyniec/bridge-layout'

export type Card = { id: string; length: PlankLength; rotten: boolean }

export type Effect = { id: number; kind: 'splash' | 'crack' | 'wave'; x: number; y: number }

export type Point = { x: number; y: number }

export type PuzzleState = {
  section: number
  tray: Card[]
  placed: Record<string, Card>
  order: string[]
  selected: string | null
  flood: number
  hint: string
  shake: string | null
  effects: Effect[]
  nextEffect: number
}

export type PuzzleAction =
  | { type: 'start'; section: number; gaps: readonly Gap[]; seed: number }
  | { type: 'select'; id: string }
  | { type: 'place'; cardId: string; gap: Gap; at: Point }
  | { type: 'tick'; dt: number; seconds: number; midpoints: Record<string, Point> }
  | { type: 'clear-effect'; id: number }
  | { type: 'clear-shake' }
  | { type: 'hint'; text: string }

export const FLOOD_SECONDS = [34, 30, 26]

export function initialPuzzle(): PuzzleState {
  return {
    section: -1,
    tray: [],
    placed: {},
    order: [],
    selected: null,
    flood: 0,
    hint: BRIDGE_HINTS.start,
    shake: null,
    effects: [],
    nextEffect: 1,
  }
}

function cardsFor(section: number, gaps: readonly Gap[], seed: number) {
  const lengths = gaps.filter((gap) => gap.section === section).map((gap) => gap.length)
  const cards: Card[] = [...lengths, ...SECTION_SPARES[section]].map((length, index) => ({
    id: `plank-${section}-${index}`,
    length,
    rotten: false,
  }))
  cards.push({ id: `plank-${section}-rotten`, length: SECTION_ROTTEN[section], rotten: true })
  return shuffled(cards, createRandom(seed))
}

function withEffect(state: PuzzleState, kind: Effect['kind'], at: Point): PuzzleState {
  return {
    ...state,
    effects: [...state.effects, { id: state.nextEffect, kind, x: at.x, y: at.y }],
    nextEffect: state.nextEffect + 1,
  }
}

function place(state: PuzzleState, cardId: string, gap: Gap, at: Point): PuzzleState {
  const card = state.tray.find((candidate) => candidate.id === cardId)
  if (!card || gap.section !== state.section || state.placed[gap.id]) return state
  if (card.rotten) {
    return withEffect(
      {
        ...state,
        tray: state.tray.filter((candidate) => candidate.id !== cardId),
        selected: null,
        hint: BRIDGE_HINTS.rotten,
      },
      'crack',
      at,
    )
  }
  if (card.length !== gap.length) {
    const tooShort = PLANK_SPAN[card.length] < PLANK_SPAN[gap.length]
    return {
      ...state,
      shake: card.id,
      hint: tooShort ? BRIDGE_HINTS.tooShort : BRIDGE_HINTS.tooLong,
    }
  }
  return withEffect(
    {
      ...state,
      tray: state.tray.filter((candidate) => candidate.id !== cardId),
      placed: { ...state.placed, [gap.id]: card },
      order: [...state.order, gap.id],
      selected: null,
      hint: BRIDGE_HINTS.placed,
    },
    'splash',
    at,
  )
}

function tick(state: PuzzleState, dt: number, seconds: number, midpoints: Record<string, Point>) {
  const flood = state.flood + dt / seconds
  if (flood < 1) return { ...state, flood }
  const sectionPlaced = state.order.filter((gapId) => gapId.startsWith(`gap-${state.section}-`))
  const washed = sectionPlaced[sectionPlaced.length - 1]
  if (!washed) return { ...state, flood: 0 }
  const card = state.placed[washed]
  const placed = { ...state.placed }
  delete placed[washed]
  return withEffect(
    {
      ...state,
      flood: 0,
      placed,
      order: state.order.filter((gapId) => gapId !== washed),
      tray: [...state.tray, card],
      hint: BRIDGE_HINTS.wave,
    },
    'wave',
    midpoints[washed],
  )
}

export function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        section: action.section,
        tray: cardsFor(action.section, action.gaps, action.seed),
        selected: null,
        flood: 0,
        hint: action.section === 0 ? BRIDGE_HINTS.start : state.hint,
      }
    case 'select':
      return { ...state, selected: state.selected === action.id ? null : action.id }
    case 'place':
      return place(state, action.cardId, action.gap, action.at)
    case 'tick':
      return tick(state, action.dt, action.seconds, action.midpoints)
    case 'clear-effect':
      return { ...state, effects: state.effects.filter((effect) => effect.id !== action.id) }
    case 'clear-shake':
      return { ...state, shake: null }
    case 'hint':
      return { ...state, hint: action.text }
  }
}

export function sectionComplete(state: PuzzleState, gaps: readonly Gap[]) {
  return gaps
    .filter((gap) => gap.section === state.section)
    .every((gap) => Boolean(state.placed[gap.id]))
}
