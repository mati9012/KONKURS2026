import dynamic from 'next/dynamic'
import { CoveringClouds } from '@/components/ui/CoveringClouds'
import { BILGORAJ_ARRIVAL, BILGORAJ_OUTRO } from '@/content/bilgoraj'
import { CHELM_ARRIVAL, CHELM_OUTRO } from '@/content/chelm'
import { KAZIMIERZ_ARRIVAL, KAZIMIERZ_OUTRO } from '@/content/kazimierz-dolny'
import { KOCK_ARRIVAL, KOCK_OUTRO } from '@/content/kock'
import { LUBLIN_ARRIVAL, LUBLIN_OUTRO } from '@/content/lublin'
import { POLESKI_ARRIVAL, POLESKI_OUTRO } from '@/content/poleski-park-narodowy'
import { WLODAWA_ARRIVAL, WLODAWA_OUTRO } from '@/content/wlodawa'
import { PULAWY_ARRIVAL, PULAWY_OUTRO } from '@/content/pulawy'
import { ROZTOCZE_ARRIVAL, ROZTOCZE_OUTRO } from '@/content/roztocze'
import { ZAMOSC_ARRIVAL, ZAMOSC_OUTRO } from '@/content/zamosc'
import { ZWIERZYNIEC_ARRIVAL, ZWIERZYNIEC_OUTRO } from '@/content/zwierzyniec'
import type { PlaceId } from '@/content/places'
import type { LevelDefinition } from '@/levels/level-game'

const LEVEL_LOADING = { ssr: false, loading: () => <CoveringClouds /> }

export const LEVELS: Partial<Record<PlaceId, LevelDefinition>> = {
  zamosc: {
    intro: ZAMOSC_ARRIVAL,
    outro: ZAMOSC_OUTRO,
    Game: dynamic(() => import('@/levels/zamosc/ZamoscLevel').then((mod) => mod.ZamoscLevel), {
      ...LEVEL_LOADING,
    }),
  },
  zwierzyniec: {
    intro: ZWIERZYNIEC_ARRIVAL,
    outro: ZWIERZYNIEC_OUTRO,
    Game: dynamic(
      () => import('@/levels/zwierzyniec/ZwierzyniecLevel').then((mod) => mod.ZwierzyniecLevel),
      { ...LEVEL_LOADING },
    ),
  },
  roztocze: {
    intro: ROZTOCZE_ARRIVAL,
    outro: ROZTOCZE_OUTRO,
    Game: dynamic(
      () => import('@/levels/roztocze/RoztoczeLevel').then((mod) => mod.RoztoczeLevel),
      { ...LEVEL_LOADING },
    ),
  },
  bilgoraj: {
    intro: BILGORAJ_ARRIVAL,
    outro: BILGORAJ_OUTRO,
    Game: dynamic(
      () => import('@/levels/bilgoraj/BilgorajLevel').then((mod) => mod.BilgorajLevel),
      { ...LEVEL_LOADING },
    ),
  },
  kock: {
    intro: KOCK_ARRIVAL,
    outro: KOCK_OUTRO,
    Game: dynamic(() => import('@/levels/kock/KockLevel').then((mod) => mod.KockLevel), {
      ...LEVEL_LOADING,
    }),
  },
  'poleski-park-narodowy': {
    intro: POLESKI_ARRIVAL,
    outro: POLESKI_OUTRO,
    Game: dynamic(
      () => import('@/levels/poleski-park-narodowy/PoleskiLevel').then((mod) => mod.PoleskiLevel),
      { ...LEVEL_LOADING },
    ),
  },
  wlodawa: {
    intro: WLODAWA_ARRIVAL,
    outro: WLODAWA_OUTRO,
    Game: dynamic(() => import('@/levels/wlodawa/WlodawaLevel').then((mod) => mod.WlodawaLevel), {
      ...LEVEL_LOADING,
    }),
  },
  pulawy: {
    intro: PULAWY_ARRIVAL,
    outro: PULAWY_OUTRO,
    Game: dynamic(() => import('@/levels/pulawy/PulawyLevel').then((mod) => mod.PulawyLevel), {
      ...LEVEL_LOADING,
    }),
  },
  chelm: {
    intro: CHELM_ARRIVAL,
    outro: CHELM_OUTRO,
    Game: dynamic(() => import('@/levels/chelm/ChelmLevel').then((mod) => mod.ChelmLevel), {
      ...LEVEL_LOADING,
    }),
  },
  'kazimierz-dolny': {
    intro: KAZIMIERZ_ARRIVAL,
    outro: KAZIMIERZ_OUTRO,
    Game: dynamic(
      () => import('@/levels/kazimierz-dolny/KazimierzLevel').then((mod) => mod.KazimierzLevel),
      { ...LEVEL_LOADING },
    ),
  },
  lublin: {
    intro: LUBLIN_ARRIVAL,
    outro: LUBLIN_OUTRO,
    Game: dynamic(() => import('@/levels/lublin/LublinLevel').then((mod) => mod.LublinLevel), {
      ...LEVEL_LOADING,
    }),
  },
}
