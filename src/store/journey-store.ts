import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { PlaceId } from '@/content/places'
import { safeLocalStorage } from '@/store/game-store'

export type JourneyPhase = 'intro' | 'play' | 'outro'

type Point = [x: number, y: number, z: number]

type JourneyState = {
  placeId: PlaceId | null
  focus: Point | null
  phase: JourneyPhase
  passportOpen: boolean
  stages: Partial<Record<PlaceId, unknown>>
  visit: (placeId: PlaceId, focus: Point) => void
  play: () => void
  finish: () => void
  leave: () => void
  showPassport: (open: boolean) => void
  saveStage: (placeId: PlaceId, stage: unknown) => void
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      placeId: null,
      focus: null,
      phase: 'intro',
      passportOpen: false,
      stages: {},
      visit: (placeId, focus) => set({ placeId, focus, phase: 'intro', passportOpen: false }),
      play: () => set({ phase: 'play' }),
      finish: () =>
        set((state) => {
          const stages = { ...state.stages }
          if (state.placeId) delete stages[state.placeId]
          return { phase: 'outro', stages }
        }),
      leave: () => set({ placeId: null, focus: null, phase: 'intro' }),
      showPassport: (passportOpen) => set({ passportOpen }),
      saveStage: (placeId, stage) =>
        set((state) => ({ stages: { ...state.stages, [placeId]: stage } })),
    }),
    {
      name: 'czarcia-lapa-wyprawa',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      skipHydration: true,
      partialize: ({ placeId, focus, phase, stages }) => ({ placeId, focus, phase, stages }),
    },
  ),
)
