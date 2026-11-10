import { z } from 'zod'
import { dialogueLineSchema, sourceSchema } from '@/content/schema'

const ACCESSED = '2026-11-10'

function wiki(title: string, path: string) {
  return sourceSchema.parse({
    title: `${title}, Wikipedia`,
    url: `https://pl.wikipedia.org/wiki/${path}`,
    accessedAt: ACCESSED,
  })
}

const TOWN = wiki('Kock', 'Kock')
const PALACE = wiki('Pałac w Kocku', 'Pa%C5%82ac_w_Kocku')
const ANNA = wiki('Anna Jabłonowska', 'Anna_Jab%C5%82onowska')
const IONIC = wiki('Porządek joński', 'Porz%C4%85dek_jo%C5%84ski')
const TUSCAN = wiki('Porządek toskański', 'Porz%C4%85dek_toska%C5%84ski')
const PORTICO = wiki('Portyk', 'Portyk')
const BEREK = wiki('Berek Joselewicz', 'Berek_Joselewicz')
const BEREK_GRAVE = wiki('Mogiła Berka Joselewicza', 'Mogi%C5%82a_Berka_Joselewicza')
const BATTLE = wiki('Bitwa pod Kockiem (1939)', 'Bitwa_pod_Kockiem_(1939)')
const MENDEL = wiki('Menachem Mendel Morgenstern', 'Menachem_Mendel_Morgenstern')

const lines = z.array(dialogueLineSchema)

export const KOCK_ARRIVAL = lines.parse([
  {
    id: 'kock-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Kocku! Miasto leży u ujścia Czarnej do Tyśmienicy. O, a co to za hałas w pałacu?',
    sources: [TOWN],
  },
])

export const COLUMN_KINDS = ['ionic', 'tuscan', 'corinthian', 'doric'] as const
export type ColumnKind = (typeof COLUMN_KINDS)[number]

export const COLUMN_NAMES: Record<ColumnKind, string> = {
  ionic: 'Kolumna jońska',
  tuscan: 'Kolumna toskańska',
  corinthian: 'Kolumna koryncka',
  doric: 'Kolumna dorycka',
}

export const PLAN_SHAPES = ['horseshoe', 'square', 'circle'] as const
export type PlanShape = (typeof PLAN_SHAPES)[number]

export const PLAN_NAMES: Record<PlanShape, string> = {
  horseshoe: 'Podkowa',
  square: 'Kwadrat',
  circle: 'Koło',
}

export const FACADE_PROLOGUE = lines.parse([
  {
    id: 'facade-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Powyrywałem kolumny z pałacu księżnej i pomieszałem je z kolumnami z całego świata. Ciekawe, czy traficie!',
  },
  {
    id: 'facade-founded',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Kock to dawne prywatne miasto szlacheckie, lokowane w 1417 roku.',
    sources: [TOWN],
  },
  {
    id: 'facade-anna',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Pałac przebudowała księżna Anna z Sapiehów Jabłonowska: pisarka, ekonomistka, kolekcjonerka i reformatorka.',
    sources: [ANNA],
  },
  {
    id: 'facade-zug',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Po 1779 roku przebudowano go według projektu architekta Szymona Bogumiła Zuga.',
    sources: [PALACE],
  },
  {
    id: 'facade-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Przeciągajcie kolumny z kart na dole na puste miejsca w portyku. Patrzcie na głowice, czyli górne zakończenia kolumn!',
  },
])

export const FACADE_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      task: z.string().min(1),
      column: z.enum(COLUMN_KINDS),
      decoys: z.array(z.enum(COLUMN_KINDS)).min(1),
      wrong: z.string().min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Fasada od dziedzińca',
      task: 'Od dziedzińca stoi portyk joński. Szukajcie głowic z wolutami, które wyglądają jak baranie rogi.',
      column: 'ionic',
      decoys: ['corinthian', 'doric'],
      wrong: 'To nie ta kolumna. Jońska głowica ma woluty podobne do baranich rogów.',
      facts: [
        {
          id: 'facade-1-portico',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Portyk gotowy! Fasadę pałacu ozdobiono portykiem jońskim.',
          sources: [PALACE],
        },
        {
          id: 'facade-1-portico-word',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Portyk to otwarta część budynku z rzędem kolumn, które podtrzymują dach. Często poprzedza wejście.',
          sources: [PORTICO],
        },
        {
          id: 'facade-1-ionic',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Porządek joński powstał w Azji Mniejszej, na przełomie VII i VI wieku przed naszą erą.',
          sources: [IONIC],
        },
      ],
    },
    {
      title: 'Fasada od ogrodu',
      task: 'Od ogrodu stoi portyk toskański. Toskańskie kolumny mają gładkie trzony, bazę i prostą głowicę.',
      column: 'tuscan',
      decoys: ['doric', 'ionic'],
      wrong: 'To nie ta kolumna. Toskańska ma gładki trzon bez żłobień i stoi na bazie.',
      facts: [
        {
          id: 'facade-2-devil',
          speaker: 'diabel',
          gesture: 'angry',
          text: 'Grr! Skąd wy to wszystko wiecie? To pomieszam wam chociaż plan pałacu!',
        },
        {
          id: 'facade-2-tuscan',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Od strony ogrodu pałac ma portyk toskański. Porządek toskański wykształcił się w Italii z porządku doryckiego.',
          sources: [PALACE, TUSCAN],
        },
        {
          id: 'facade-2-emperor',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W 1780 roku księżną Annę odwiedził w Kocku sam cesarz Józef II Habsburg.',
          sources: [PALACE],
        },
      ],
    },
  ])

export const PLAN_ROUND = {
  task: 'Diabeł pomieszał plany. Który kształt ma pałac widziany z lotu ptaka?',
  wrong: 'Nie ten kształt. Podpowiedź: plan pałacu przypomina coś, co nosi koń na kopycie.',
  facts: lines.parse([
    {
      id: 'facade-3-horseshoe',
      speaker: 'koziol',
      gesture: 'cheer',
      text: 'Tak! Pałac zbudowano na planie podkowy.',
      sources: [PALACE],
    },
    {
      id: 'facade-3-marconi',
      speaker: 'koziol',
      gesture: 'talk',
      text: 'W latach 1825–1832 przebudował go Henryk Marconi, który uprościł pierwotną architekturę.',
      sources: [PALACE],
    },
    {
      id: 'facade-3-reforms',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Księżna Anna zniosła w swoich dobrach pańszczyznę, a w Kocku ufundowała też ratusz i kościół.',
      sources: [ANNA, TOWN],
    },
  ]),
}

export const FACADE_HINTS = {
  start: 'Przeciągnijcie kolumnę z kart na dole na puste miejsce w portyku.',
  good: 'Pasuje! Następna kolumna.',
} as const

export const RIDE_PROLOGUE = lines.parse([
  {
    id: 'ride-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Pałac stoi? To ja rozrzucę kłody i płoty na wszystkich drogach wokół Kocka. Żaden posłaniec nie przejedzie!',
  },
  {
    id: 'ride-berek',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Przenosimy się do 1809 roku! Berek Joselewicz był polskim kupcem żydowskiego pochodzenia i pułkownikiem wojska polskiego.',
    sources: [BEREK],
  },
  {
    id: 'ride-1794',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Już w czasie powstania kościuszkowskiego zorganizował pułk jazdy złożony z Żydów.',
    sources: [BEREK],
  },
  {
    id: 'ride-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Zawieźmy meldunek do szwadronu pułkownika! Stukajcie w ekran albo naciskajcie spację, żeby koń przeskoczył przeszkodę.',
  },
])

export const RIDE_LEGS = z
  .array(
    z.object({
      distance: z.number().positive(),
      speed: z.number().positive(),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      distance: 2600,
      speed: 360,
      facts: [
        {
          id: 'ride-1-squadron',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwszy odcinek za nami! W 1807 roku Berek Joselewicz dowodził szwadronem 5 Pułku Strzelców Konnych.',
          sources: [BEREK],
        },
        {
          id: 'ride-1-virtuti',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Za odwagę w 1808 roku otrzymał order Virtuti Militari.',
          sources: [BEREK],
        },
      ],
    },
    {
      distance: 3200,
      speed: 420,
      facts: [
        {
          id: 'ride-2-devil',
          speaker: 'diabel',
          gesture: 'angry',
          text: 'Phi, koń skacze jak zając! Dorzucę więcej przeszkód!',
        },
        {
          id: 'ride-2-legion',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Berek Joselewicz był też oficerem Legionów Polskich we Włoszech, a od Francuzów dostał Legię Honorową.',
          sources: [BEREK],
        },
        {
          id: 'ride-2-son',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W bitwie pod Kockiem brał udział także jego syn, Józef Berkowicz.',
          sources: [BEREK],
        },
      ],
    },
    {
      distance: 3800,
      speed: 480,
      facts: [
        {
          id: 'ride-3-kock',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Meldunek dowieziony. Pułkownik Berek Joselewicz zginął w maju 1809 roku w starciu z Austriakami pod Kockiem.',
          sources: [BEREK, TOWN],
        },
        {
          id: 'ride-3-grave',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Pochowano go w miejscu, gdzie zginął, przy drodze z Kocka do Białobrzegów. W 1909 roku, w setną rocznicę, ustawiono tam pamiątkowy kamień.',
          sources: [BEREK_GRAVE],
        },
      ],
    },
  ])

export const RIDE_HINTS = {
  start: 'Stukajcie albo naciskajcie spację, żeby skoczyć.',
  bump: 'Ojej, koń się potknął! Skaczcie wcześniej.',
  good: 'Hop! Pięknie.',
} as const

export const MEMORY_PROLOGUE = lines.parse([
  {
    id: 'memory-intro',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Teraz zajrzymy do izby pamięci. Tu mówimy ciszej, bo Kock pamięta też trudne czasy.',
  },
  {
    id: 'memory-battle',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Od 2 do 6 października 1939 roku pod Kockiem walczyła Samodzielna Grupa Operacyjna „Polesie” generała Franciszka Kleeberga.',
    sources: [BATTLE],
  },
  {
    id: 'memory-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Pomóżcie ułożyć pamiątki z historii Kocka na osi czasu. Przeciągnijcie każdą na właściwy rok.',
  },
])

export const EXHIBIT_IDS = [
  'charter',
  'palace-plan',
  'shako',
  'helmet',
  'letter',
  'wreath',
] as const
export type ExhibitId = (typeof EXHIBIT_IDS)[number]

export const EXHIBITS = z
  .array(
    z.object({
      id: z.enum(EXHIBIT_IDS),
      name: z.string().min(1),
      year: z.number().int(),
      label: z.string().min(1),
      sources: z.array(sourceSchema).min(1),
    }),
  )
  .parse([
    {
      id: 'charter',
      name: 'Akt lokacji miasta',
      year: 1417,
      label: 'Kock zostaje miastem',
      sources: [TOWN],
    },
    {
      id: 'palace-plan',
      name: 'Projekt pałacu',
      year: 1779,
      label: 'Przebudowa pałacu według projektu Zuga',
      sources: [PALACE],
    },
    {
      id: 'shako',
      name: 'Czapka strzelca konnego',
      year: 1809,
      label: 'Pułkownik Berek Joselewicz ginie pod Kockiem',
      sources: [BEREK],
    },
    {
      id: 'helmet',
      name: 'Hełm żołnierza SGO „Polesie”',
      year: 1939,
      label: 'Ostatnia bitwa kampanii wrześniowej',
      sources: [BATTLE],
    },
    {
      id: 'letter',
      name: 'Fotografia generała Kleeberga',
      year: 1941,
      label: 'Generał Kleeberg umiera w niewoli niemieckiej',
      sources: [TOWN],
    },
    {
      id: 'wreath',
      name: 'Wieniec z grobu generała',
      year: 1969,
      label: 'Prochy generała wracają do Kocka',
      sources: [TOWN],
    },
  ])

export const MEMORY_ROUNDS = z
  .array(z.object({ exhibits: z.array(z.enum(EXHIBIT_IDS)).min(2), facts: lines.min(1) }))
  .parse([
    {
      exhibits: ['charter', 'palace-plan', 'shako'],
      facts: [
        {
          id: 'memory-1-done',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwsza gablota gotowa: lokacja miasta w 1417 roku, pałac księżnej i pułkownik Berek.',
          sources: [TOWN],
        },
      ],
    },
    {
      exhibits: ['helmet', 'letter', 'wreath'],
      facts: [
        {
          id: 'memory-2-last',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Bitwa pod Kockiem była ostatnią bitwą kampanii wrześniowej stoczoną przez regularne wojsko.',
          sources: [BATTLE],
        },
        {
          id: 'memory-2-honour',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Generał Kleeberg powiedział wtedy: „Nic sobie nie mamy do zarzucenia. Zachowaliśmy honor żołnierski do końca”.',
          sources: [BATTLE],
        },
        {
          id: 'memory-2-grave',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Generał zmarł w 1941 roku w niewoli niemieckiej. W 1969 roku jego prochy sprowadzono na cmentarz wojskowy w Kocku.',
          sources: [TOWN],
        },
        {
          id: 'memory-2-room',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Od 7 października 2012 roku w Kocku działa Wojskowa Izba Pamięci, a szkoła podstawowa nosi imię generała Kleeberga.',
          sources: [BATTLE],
        },
      ],
    },
  ])

export const MEMORY_HINTS = {
  start: 'Przeciągnijcie pamiątkę na właściwy rok na osi czasu.',
  wrong: 'To nie ten rok. Przypomnijcie sobie, co już wiecie o Kocku.',
  good: 'Zgadza się!',
} as const

export const KOCK_OUTRO = lines.parse([
  {
    id: 'kock-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Pałac ma swoje kolumny, meldunek dotarł, a pamiątki leżą na swoich miejscach. Dziękuję!',
  },
  {
    id: 'kock-mendel',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Jeszcze jedna ciekawostka: w 1829 roku osiadł w Kocku cadyk Menachem Mendel Morgenstern i założył tu ośrodek życia chasydzkiego.',
    sources: [MENDEL],
  },
  {
    id: 'kock-anna-monument',
    speaker: 'koziol',
    gesture: 'present',
    text: 'A na rynku w Kocku stoi pomnik księżnej Anny Jabłonowskiej.',
    sources: [ANNA],
  },
  {
    id: 'kock-devil',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Phi! Następnym razem nie dam się tak łatwo przegonić!',
  },
  {
    id: 'kock-stamp',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Pieczęć Kocka trafia do waszego paszportu. W drogę!',
  },
])
