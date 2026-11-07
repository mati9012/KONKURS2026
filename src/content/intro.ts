import { z } from 'zod'
import { dialogueLineSchema } from '@/content/schema'
import type { Source } from '@/content/schema'

export const NARRATOR_NAME = 'Szaro'

const LUBLIN_HISTORY: Source = {
  title: 'Historia Lublina, lublin.eu',
  url: 'https://lublin.eu/turystyka/poznaj-lublin',
  accessedAt: '2026-11-07',
}

const LUBLIN_LEGENDS: Source = {
  title: 'Lublin legends, lublin.eu',
  url: 'https://lublin.eu/en/lublin/about-the-city/lublin-legends',
  accessedAt: '2026-11-07',
}

export const INTRO_DIALOGUE = z.array(dialogueLineSchema).parse([
  {
    id: 'intro-hello',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Cześć! Jestem Szaro, kozioł prosto z herbu Lublina. Od dziś jestem waszym przewodnikiem po Lubelszczyźnie!',
    sources: [LUBLIN_HISTORY],
  },
  {
    id: 'intro-island',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Spójrzcie w dół. Pod nami unosi się całe województwo lubelskie: rzeki, lasy, zamki i miasta, które czekają, aż je odwiedzicie.',
  },
  {
    id: 'intro-legend',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Zanim ruszymy, posłuchajcie legendy. W 1637 roku w lubelskim Trybunale Koronnym biedna wdowa przegrała proces z bogatym szlachcicem. Zawołała wtedy, że nawet diabły osądziłyby sprawiedliwiej.',
    sources: [LUBLIN_LEGENDS],
  },
  {
    id: 'intro-trial',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Tej samej nocy diabły zasiadły w sądzie, wydały uczciwy wyrok i zostawiły na stole wypalony ślad łapy. Stół z tym śladem przetrwał do dziś.',
    sources: [LUBLIN_LEGENDS],
  },
  {
    id: 'intro-theft',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'A teraz diabeł wrócił! Porwał duszę naszego regionu i ukrył siedem skarbów w różnych zakątkach województwa.',
  },
  {
    id: 'intro-quest',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Razem odwiedzimy Zamość, Lublin, Chełm i inne miejsca. Za każde rozwiązane zadanie dostaniecie pieczęć do Paszportu Lubelskiego.',
  },
  {
    id: 'intro-go',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Gdy zbierzecie wszystkie pieczęcie, staniemy przed Trybunałem na wielkiej rozprawie z diabłem. Gotowi? To ruszamy!',
  },
])
