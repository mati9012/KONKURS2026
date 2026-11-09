import { z } from 'zod'
import { dialogueLineSchema, sourceSchema } from '@/content/schema'

const ACCESSED = '2026-11-09'

function wiki(title: string, path: string) {
  return sourceSchema.parse({
    title: `${title}, Wikipedia`,
    url: `https://pl.wikipedia.org/wiki/${path}`,
    accessedAt: ACCESSED,
  })
}

const TOWN = wiki('Biłgoraj', 'Bi%C5%82goraj')
const CRAFT = wiki('Sitarstwo', 'Sitarstwo')
const SIEVE = wiki('Sito', 'Sito')
const PIEROG = wiki('Pieróg biłgorajski', 'Pier%C3%B3g_bi%C5%82gorajski')
const PIEROG_CITY = sourceSchema.parse({
  title: 'Pieróg biłgorajski, Urząd Miasta Biłgoraj',
  url: 'https://www.bilgoraj.pl/page/247/pierog-bilgorajski.html',
  accessedAt: ACCESSED,
})

const lines = z.array(dialogueLineSchema)

export const BILGORAJ_ARRIVAL = lines.parse([
  {
    id: 'bilgoraj-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Biłgoraju! Jest zima, a w drewnianych zagrodach stukają krosna. Oj, ktoś tu chyba narozrabiał...',
  },
])

export const WEAVE_PROLOGUE = lines.parse([
  {
    id: 'weave-devil-tangle',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Poplątałem całe końskie włosie w zagrodzie sitarzy. Żadne sito w tym mieście już nie powstanie!',
  },
  {
    id: 'weave-founded',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Biłgoraj dostał akt lokacyjny od króla Stefana Batorego we Lwowie, 10 września 1578 roku.',
    sources: [TOWN],
  },
  {
    id: 'weave-name',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Miasto założono na zalesionym wzniesieniu zwanym Białym Gorajem. Stąd wzięła się jego nazwa.',
    sources: [TOWN],
  },
  {
    id: 'weave-centre',
    speaker: 'koziol',
    gesture: 'think',
    text: 'W dawnej Polsce to właśnie Biłgoraj był głównym ośrodkiem sitarstwa, czyli robienia sit.',
    sources: [CRAFT],
  },
  {
    id: 'weave-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Siatkę na sito plotło się na krojsie, czyli odmianie krosna. Naciskajcie lewy i prawy podnóżek według wzoru na karcie, zawsze w rytm stuknięć krosna!',
    sources: [TOWN],
  },
])

export const WEAVE_ROUNDS = z
  .array(
    z.object({
      name: z.string().min(1),
      pattern: z.array(z.enum(['L', 'R'])).min(4),
      bpm: z.number().positive(),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      name: 'Rzadka siatka',
      pattern: ['L', 'R', 'L', 'R', 'L', 'R'],
      bpm: 66,
      facts: [
        {
          id: 'weave-1-horsehair',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwsza siatka gotowa! Plotło się ją z końskiego włosia, a obręcze, na których się ją rozpinało, robiono zwykle z sosny.',
          sources: [CRAFT],
        },
        {
          id: 'weave-1-family',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Pracowała cała rodzina: mężczyźni szykowali drewniane łuby do oprawy, a kobiety wyplatały siatkę z włosia.',
          sources: [TOWN],
        },
      ],
    },
    {
      name: 'Gęstsza siatka',
      pattern: ['L', 'L', 'R', 'R', 'L', 'L', 'R', 'R'],
      bpm: 76,
      facts: [
        {
          id: 'weave-2-devil',
          speaker: 'diabel',
          gesture: 'angry',
          text: 'Grr, plecie się! To przy następnej będę wyrywał wam nitki przy każdej pomyłce!',
        },
        {
          id: 'weave-2-guild',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Cech sitarski w Biłgoraju powstał jeszcze przed 1693 rokiem.',
          sources: [TOWN],
        },
        {
          id: 'weave-2-share',
          speaker: 'koziol',
          gesture: 'think',
          text: 'W pierwszej połowie XIX wieku rzemieślnicy stanowili około 65% mieszkańców, a od 80 do 90% z nich to byli sitarze!',
          sources: [TOWN],
        },
      ],
    },
    {
      name: 'Najgęstsza siatka',
      pattern: ['L', 'R', 'R', 'L', 'R', 'L', 'L', 'R'],
      bpm: 84,
      facts: [
        {
          id: 'weave-3-winter',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Trzy siatki gotowe! Sita robiło się zimą, a gdy robiło się cieplej, sitarz brał je na plecy w drewnianych nosiłkach i „szedł w świat”.',
          sources: [CRAFT],
        },
        {
          id: 'weave-3-language',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Biłgorajanie mieli nawet tajny język sitarski. Była to szyfrowana mowa, którą rozumieli tylko mieszczanie z Biłgoraja.',
          sources: [TOWN],
        },
      ],
    },
  ])

export const WEAVE_HINTS = {
  start: 'Naciskajcie podnóżki według karty, w rytm stuknięć krosna.',
  early: 'Za wcześnie! Poczekajcie na stuknięcie krosna.',
  miss: 'Zły podnóżek! Spójrzcie na kartę ze wzorem.',
  wrong: 'Zły podnóżek! Diabeł wyrwał ostatnią nitkę.',
  row: 'Pięknie! Kolejny rząd.',
} as const

export const SIEVE_IDS = ['przetak', 'medium', 'fine'] as const
export type SieveId = (typeof SIEVE_IDS)[number]

export const SIEVE_NAMES: Record<SieveId, string> = {
  przetak: 'Przetak, duże oczka',
  medium: 'Sito, średnie oczka',
  fine: 'Sito, drobne oczka',
}

export const GRAIN_KINDS = [
  'grain',
  'stone',
  'straw',
  'kasza',
  'sand',
  'flour',
  'clump',
  'worm',
] as const
export type GrainKind = (typeof GRAIN_KINDS)[number]

export const SIFT_PROLOGUE = lines.parse([
  {
    id: 'sift-devil-sand',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Sita są? To ja nasypałem piasku do kaszy, kamieni do ziarna, a w mące zalęgły się robaki. Smacznego!',
  },
  {
    id: 'sift-definition',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Sito to proste urządzenie do oddzielania drobnych rzeczy od większych. Wszystko zależy od wielkości oczek.',
    sources: [SIEVE],
  },
  {
    id: 'sift-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Wybierzcie sito ze ściany i potrząsajcie nim. Przez oczka przeleci tylko to, co mniejsze od nich. Do miski ma trafić to, czego potrzebujemy do pieroga!',
  },
])

export const SIFT_TASKS = z
  .array(
    z.object({
      goal: z.string().min(1),
      mix: z.array(z.enum(GRAIN_KINDS)).min(2),
      keep: z.enum(GRAIN_KINDS),
      sieve: z.enum(SIEVE_IDS),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      goal: 'Oddzielcie ziarno od kamieni i słomy. Ziarno ma przelecieć do miski.',
      mix: ['grain', 'stone', 'straw'],
      keep: 'grain',
      sieve: 'przetak',
      facts: [
        {
          id: 'sift-1-przetak',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Czyste ziarno! Do czyszczenia ziarna służyły przetaki, sita z większymi oczkami. Robił je przetaczarz z cienkiego drutu.',
          sources: [CRAFT],
        },
      ],
    },
    {
      goal: 'Odsiejcie piasek od kaszy gryczanej. Kasza ma zostać w sicie.',
      mix: ['kasza', 'sand'],
      keep: 'kasza',
      sieve: 'medium',
      facts: [
        {
          id: 'sift-2-spring',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Kasza czysta! Co roku wiosną mężczyźni z Biłgoraja wyruszali w drogę, żeby sprzedawać sita.',
          sources: [TOWN],
        },
        {
          id: 'sift-2-far',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Docierali aż do Czech, Węgier, Mołdawii, Prus i dalekich części Rosji. Wracali dopiero jesienią.',
          sources: [TOWN],
        },
      ],
    },
    {
      goal: 'Przesiejcie mąkę na ciasto. Grudki i robaki mają zostać w sicie.',
      mix: ['flour', 'clump', 'worm'],
      keep: 'flour',
      sieve: 'fine',
      facts: [
        {
          id: 'sift-3-worms',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Puszysta mąka! Sitami przesiewano mąkę i oczyszczano ją z robaków, na przykład larw mącznika.',
          sources: [CRAFT],
        },
        {
          id: 'sift-3-farewell',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Pożegnanie sitarzy ruszających w drogę nazywano „Żałosnymi”, a powitanie wracających kilka miesięcy później „Radosnymi”.',
          sources: [TOWN],
        },
      ],
    },
  ])

export const SIFT_HINTS = {
  pick: 'Wybierzcie sito ze ściany.',
  shake: 'Potrząsajcie sitem!',
  tooBig: 'Ojej, przez te oczka przelatuje wszystko! Weźcie sito z mniejszymi oczkami.',
  tooSmall: 'Nic nie przelatuje, oczka są za małe. Weźcie sito z większymi.',
  done: 'Udało się!',
} as const

export const INGREDIENT_IDS = [
  'potatoes',
  'quark',
  'kasza',
  'eggs',
  'cream',
  'mint',
  'sugar',
  'carrot',
  'jam',
] as const
export type IngredientId = (typeof INGREDIENT_IDS)[number]

export const INGREDIENT_NAMES: Record<IngredientId, string> = {
  potatoes: 'Ziemniaki',
  quark: 'Twaróg',
  kasza: 'Kasza gryczana',
  eggs: 'Jajka',
  cream: 'Śmietana',
  mint: 'Mięta',
  sugar: 'Cukier',
  carrot: 'Marchewka',
  jam: 'Konfitura',
}

export const RECIPE: readonly IngredientId[] = [
  'potatoes',
  'quark',
  'kasza',
  'eggs',
  'cream',
  'mint',
]

export const OVEN = { min: 100, max: 260, step: 20, from: 180, to: 200 } as const

export const PIEROG_PROLOGUE = lines.parse([
  {
    id: 'pierog-devil-pantry',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Mąka przesiana, kasza czysta... To ja dorzucę do spiżarni swoje słodkości. Niech pieróg wyjdzie diabelski!',
  },
  {
    id: 'pierog-intro',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Pieczemy pieróg biłgorajski! Dawniej przyrządzano go na szczególne okazje, na przykład na Boże Narodzenie i Wielkanoc.',
    sources: [TOWN, PIEROG_CITY],
  },
  {
    id: 'pierog-list',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Od 2005 roku pieróg biłgorajski jest na Krajowej liście produktów tradycyjnych Ministerstwa Rolnictwa.',
    sources: [TOWN, PIEROG],
  },
  {
    id: 'pierog-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Przeciągnijcie do blaszki tylko to, co należy do farszu. Diabelskie słodkości zostawcie na półce!',
  },
])

export const PIEROG_STEPS = {
  filling: lines.parse([
    {
      id: 'pierog-filling',
      speaker: 'koziol',
      gesture: 'cheer',
      text: 'Farsz gotowy! Robi się go z kaszy gryczanej, ziemniaków, twarogu, jajek i śmietany. Zależnie od przepisu dodaje się też miętę, smalec albo słoninę.',
      sources: [PIEROG],
    },
    {
      id: 'pierog-crust-ask',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Teraz wybierzcie: pieczemy bez skórki czy w skórce z ciasta drożdżowego?',
      sources: [PIEROG],
    },
  ]),
  crust: lines.parse([
    {
      id: 'pierog-crust-names',
      speaker: 'koziol',
      gesture: 'talk',
      text: 'Obie wersje są prawdziwe! Pieróg bez skórki nazywa się „łysy”. W domach piecze się go najczęściej w dużych prostokątnych blaszkach.',
      sources: [PIEROG_CITY],
    },
    {
      id: 'pierog-oven-ask',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Do pieca! Ustawcie dobrą temperaturę, żeby się nie spalił ani nie został surowy.',
    },
  ]),
  baked: lines.parse([
    {
      id: 'pierog-baked',
      speaker: 'koziol',
      gesture: 'cheer',
      text: 'Upieczony! Według przepisu piecze się go około półtorej godziny w piecu nagrzanym do 180–200 stopni.',
      sources: [PIEROG_CITY],
    },
    {
      id: 'pierog-serve',
      speaker: 'koziol',
      gesture: 'talk',
      text: 'Wyglądem przypomina pasztet. Można go jeść na gorąco albo na zimno, ze śmietaną, mlekiem albo masłem.',
      sources: [PIEROG_CITY],
    },
  ]),
}

export const PIEROG_HINTS = {
  start: 'Przeciągnijcie składnik z półki do blaszki.',
  good: 'Pasuje do farszu!',
  devil: 'Bleh! To diabelska słodkość, do pieroga nie pasuje.',
  crust: 'Wybierzcie rodzaj pieroga.',
  oven: 'Ustawcie temperaturę pieca i wstawcie pieróg.',
  cold: 'Za zimno, pieróg zostałby surowy. Podkręćcie piec.',
  hot: 'Za gorąco, pieróg by się spalił! Skręćcie piec.',
  baking: 'Pieróg się piecze...',
} as const

export const BILGORAJ_OUTRO = lines.parse([
  {
    id: 'bilgoraj-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Sita uplecione, ziarno przesiane, a pieróg pachnie ziemniakami i kaszą na całą zagrodę. Brawo!',
  },
  {
    id: 'bilgoraj-singer',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Przez kilka lat w Biłgoraju wychowywał się Izaak Baszewis Singer, późniejszy laureat Nagrody Nobla w dziedzinie literatury.',
    sources: [TOWN],
  },
  {
    id: 'bilgoraj-three-cultures',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Biłgoraj nazywany jest Miastem Trzech Kultur: polskiej, żydowskiej i rusińskiej. A w herbie ma srebrnego łabędzia nad trzema belkami.',
    sources: [TOWN],
  },
  {
    id: 'bilgoraj-devil-flees',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Phi! Nawet nie spróbuję tego pieroga... No dobra, może kawałek. Ale jeszcze się spotkamy!',
  },
  {
    id: 'bilgoraj-stamp',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Pieczęć Biłgoraja trafia do waszego paszportu. W drogę!',
  },
])
