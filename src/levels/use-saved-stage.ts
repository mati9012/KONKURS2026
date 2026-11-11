import { useCallback, useState } from 'react'
import { useJourneyStore } from '@/store/journey-store'

type StageUpdate<T> = T | ((current: T) => T)

export function useSavedStage<T extends { kind: string }>(initial: T) {
  const [fallback] = useState(initial)
  const placeId = useJourneyStore((state) => state.placeId)
  const saved = useJourneyStore((state) => (placeId ? state.stages[placeId] : undefined))
  const stage = (saved as T | undefined) ?? fallback

  const setStage = useCallback(
    (update: StageUpdate<T>) => {
      const { placeId: current, stages, saveStage } = useJourneyStore.getState()
      if (!current) return
      const previous = (stages[current] as T | undefined) ?? fallback
      saveStage(current, typeof update === 'function' ? update(previous) : update)
    },
    [fallback],
  )

  return [stage, setStage] as const
}
