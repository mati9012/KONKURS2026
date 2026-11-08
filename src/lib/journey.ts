import { PLACE_IDS } from '@/content/places'
import type { PlaceId } from '@/content/places'

export const FIRST_PLACE: PlaceId = 'zamosc'
export const LATE_PLACES: readonly PlaceId[] = ['chelm', 'lublin']
export const LATE_PLACES_STAMPS = 6

export type PlaceAccess = 'open' | 'needs-first' | 'needs-stamps'

export function stampedPlaces(stamps: Partial<Record<PlaceId, unknown>>): ReadonlySet<PlaceId> {
  return new Set(PLACE_IDS.filter((placeId) => stamps[placeId]))
}

export function placeAccess(placeId: PlaceId, stamps: ReadonlySet<PlaceId>): PlaceAccess {
  if (placeId === FIRST_PLACE || stamps.has(placeId)) return 'open'
  if (!stamps.has(FIRST_PLACE)) return 'needs-first'
  if (LATE_PLACES.includes(placeId) && stamps.size < LATE_PLACES_STAMPS) return 'needs-stamps'
  return 'open'
}
