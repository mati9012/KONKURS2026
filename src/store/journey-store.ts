import { create } from 'zustand'
import type { PlaceId } from '@/content/places'

export type JourneyPhase = 'intro' | 'play' | 'outro'

type Point = [x: number, y: number, z: number]

type JourneyState = {
  placeId: PlaceId | null
  focus: Point | null
  phase: JourneyPhase
  passportOpen: boolean
  visit: (placeId: PlaceId, focus: Point) => void
  play: () => void
  finish: () => void
  leave: () => void
  showPassport: (open: boolean) => void
}

export const useJourneyStore = create<JourneyState>()((set) => ({
  placeId: null,
  focus: null,
  phase: 'intro',
  passportOpen: false,
  visit: (placeId, focus) => set({ placeId, focus, phase: 'intro', passportOpen: false }),
  play: () => set({ phase: 'play' }),
  finish: () => set({ phase: 'outro' }),
  leave: () => set({ placeId: null, focus: null, phase: 'intro' }),
  showPassport: (passportOpen) => set({ passportOpen }),
}))
