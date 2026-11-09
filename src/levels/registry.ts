import dynamic from 'next/dynamic'
import { ZAMOSC_ARRIVAL, ZAMOSC_OUTRO } from '@/content/zamosc'
import { ZWIERZYNIEC_ARRIVAL, ZWIERZYNIEC_OUTRO } from '@/content/zwierzyniec'
import type { PlaceId } from '@/content/places'
import type { LevelDefinition } from '@/levels/level-game'

export const LEVELS: Partial<Record<PlaceId, LevelDefinition>> = {
  zamosc: {
    intro: ZAMOSC_ARRIVAL,
    outro: ZAMOSC_OUTRO,
    Game: dynamic(() => import('@/levels/zamosc/ZamoscLevel').then((mod) => mod.ZamoscLevel), {
      ssr: false,
    }),
  },
  zwierzyniec: {
    intro: ZWIERZYNIEC_ARRIVAL,
    outro: ZWIERZYNIEC_OUTRO,
    Game: dynamic(
      () => import('@/levels/zwierzyniec/ZwierzyniecLevel').then((mod) => mod.ZwierzyniecLevel),
      { ssr: false },
    ),
  },
}
