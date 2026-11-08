import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { PlaceId } from '@/content/places'

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
  stamps: Partial<Record<PlaceId, Stamp>>
  settings: Settings
  introSeen: boolean
  earnStamp: (placeId: PlaceId) => void
  markIntroSeen: () => void
  setQuality: (quality: Quality) => void
  setVolume: (channel: 'musicVolume' | 'sfxVolume', value: number) => void
  reset: () => void
}

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      console.warn('Nie udało się zapisać postępu gry', error)
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.warn('Nie udało się usunąć zapisu gry', error)
    }
  },
}

const initialState = {
  stamps: {},
  settings: {
    quality: 'high',
    musicVolume: 0.6,
    sfxVolume: 0.8,
  },
  introSeen: false,
} satisfies Pick<GameState, 'stamps' | 'settings' | 'introSeen'>

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      earnStamp: (placeId) =>
        set((state) =>
          state.stamps[placeId]
            ? state
            : { stamps: { ...state.stamps, [placeId]: { earnedAt: new Date().toISOString() } } },
        ),
      markIntroSeen: () => set({ introSeen: true }),
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
      storage: createJSONStorage(() => safeLocalStorage),
      skipHydration: true,
      partialize: ({ stamps, settings, introSeen }) => ({ stamps, settings, introSeen }),
    },
  ),
)
