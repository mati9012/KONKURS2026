import { z } from 'zod'
import { dialogueLineSchema } from '@/content/schema'
import type { DialogueLine } from '@/content/schema'
import type { PlaceAccess } from '@/lib/journey'
import { LATE_PLACES_STAMPS } from '@/lib/journey'

const [needsFirst, needsStamps, comingSoon] = z.array(dialogueLineSchema).parse([
  {
    id: 'journey-needs-first',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Nie tak szybko! Wyprawę zaczynamy w Zamościu. Kliknijcie go na mapie.',
  },
  {
    id: 'journey-needs-stamps',
    speaker: 'koziol',
    gesture: 'think',
    text: `Tu diabeł ukrył coś naprawdę groźnego. Wrócimy, gdy w paszporcie będzie ${LATE_PLACES_STAMPS} pieczęci.`,
  },
  {
    id: 'journey-coming-soon',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Tutejsza przygoda jeszcze się szykuje. Zajrzyjmy tu niedługo!',
  },
])

export const CLOSED_PLACE: Record<Exclude<PlaceAccess, 'open'>, DialogueLine> = {
  'needs-first': needsFirst,
  'needs-stamps': needsStamps,
}

export const COMING_SOON: DialogueLine = comingSoon
