import dynamic from 'next/dynamic'
import { BILGORAJ_ARRIVAL, BILGORAJ_OUTRO } from '@/content/bilgoraj'
import { ROZTOCZE_ARRIVAL, ROZTOCZE_OUTRO } from '@/content/roztocze'
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
  roztocze: {
    intro: ROZTOCZE_ARRIVAL,
    outro: ROZTOCZE_OUTRO,
    Game: dynamic(
      () => import('@/levels/roztocze/RoztoczeLevel').then((mod) => mod.RoztoczeLevel),
      { ssr: false },
    ),
  },
  bilgoraj: {
    intro: BILGORAJ_ARRIVAL,
    outro: BILGORAJ_OUTRO,
    Game: dynamic(
      () => import('@/levels/bilgoraj/BilgorajLevel').then((mod) => mod.BilgorajLevel),
      { ssr: false },
    ),
  },
}
