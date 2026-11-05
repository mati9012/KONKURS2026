import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LevelId } from '@/content/levels'

export type Quality = 'high' | 'low'

type Stamp = {
  earnedAt: string
}

type Settings = {
  quality: Quality
  musicVolume: number
  sfxVolume: number
}

type GameState = {
  stamps: Partial<Record<LevelId, Stamp>>
  settings: Settings
  earnStamp: (levelId: LevelId) => void
  setQuality: (quality: Quality) => void
  setVolume: (channel: 'musicVolume' | 'sfxVolume', value: number) => void
  reset: () => void
}

const initialState = {
  stamps: {},
  settings: {
    quality: 'high',
    musicVolume: 0.6,
    sfxVolume: 0.8,
  },
} satisfies Pick<GameState, 'stamps' | 'settings'>

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      earnStamp: (levelId) =>
        set((state) =>
          state.stamps[levelId]
            ? state
            : { stamps: { ...state.stamps, [levelId]: { earnedAt: new Date().toISOString() } } },
        ),
      setQuality: (quality) => set((state) => ({ settings: { ...state.settings, quality } })),
      setVolume: (channel, value) =>
        set((state) => ({
          settings: { ...state.settings, [channel]: Math.min(1, Math.max(0, value)) },
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'czarcia-lapa-paszport',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ stamps, settings }) => ({ stamps, settings }),
    },
  ),
)
