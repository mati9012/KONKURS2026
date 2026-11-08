import dynamic from 'next/dynamic'
import { ZAMOSC_ARRIVAL, ZAMOSC_OUTRO } from '@/content/zamosc'
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
}
