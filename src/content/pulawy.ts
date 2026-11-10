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

const TOWN = wiki('Puławy', 'Pu%C5%82awy')
const PALACE = wiki('Pałac Czartoryskich w Puławach', 'Pa%C5%82ac_Czartoryskich_w_Pu%C5%82awach')
const IZABELA = wiki('Izabela Czartoryska', 'Izabela_Czartoryska')
const SYBILLA = wiki('Świątynia Sybilli w Puławach', '%C5%9Awi%C4%85tynia_Sybilli_w_Pu%C5%82awach')
const IUNG = wiki(
  'Instytut Uprawy, Nawożenia i Gleboznawstwa w Puławach',
  'Instytut_Uprawy%2C_Nawo%C5%BCenia_i_Gleboznawstwa_w_Pu%C5%82awach',
)
const FERTILIZING = wiki('Nawożenie', 'Nawo%C5%BCenie')
const BEE = wiki('Pszczoła miodna', 'Pszczo%C5%82a_miodna')

const lines = z.array(dialogueLineSchema)

export const PULAWY_ARRIVAL = lines.parse([
  {
    id: 'pulawy-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Puławach nad Wisłą! Za czasów Czartoryskich miasto konkurowało ze stolicą i nazywano je Polskimi Atenami.',
    sources: [TOWN],
  },
])

export const PARK_BUILDING_IDS = [
  'sybilla',
  'gothic',
  'greek',
  'roman-gate',
  'chinese',
  'marynka',
] as const
export type ParkBuildingId = (typeof PARK_BUILDING_IDS)[number]

export const PARK_PROLOGUE = lines.parse([
  {
    id: 'park-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Księżna Izabela zebrała tyle skarbów. Pochowam je po całym parku i nikt ich nie znajdzie!',
  },
  {
    id: 'park-romantic',
    speaker: 'koziol',
    gesture: 'think',
    text: 'W latach 1798–1806 księżna Izabela zmieniła park w ogród romantyczny w stylu angielskim. Pomagał jej angielski ogrodnik James Savage.',
    sources: [TOWN, PALACE],
  },
  {
    id: 'park-hermit',
    speaker: 'koziol',
    gesture: 'laugh',
    text: 'W grocie w parku mieszkał nawet pustelnik, którego księżna wynajęła na etat!',
    sources: [TOWN],
  },
  {
    id: 'park-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Czytajcie moje zagadki i stukajcie w budowlę, o którą chodzi. Tam diabeł schował skarb.',
  },
])

export const PARK_RIDDLES = z
  .array(
    z.object({
      building: z.enum(PARK_BUILDING_IDS),
      name: z.string().min(1),
      riddle: z.string().min(1),
      facts: lines.min(1),
    }),
  )
  .length(PARK_BUILDING_IDS.length)
  .parse([
    {
      building: 'sybilla',
      name: 'Świątynia Sybilli',
      riddle:
        'Okrągła budowla z kolumnami i kopułą, wzorowana na świątyni Westy w Tivoli pod Rzymem.',
      facts: [
        {
          id: 'park-sybilla-museum',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To Świątynia Sybilli! W 1801 roku księżna Izabela założyła w niej pierwsze w Polsce muzeum, pełne pamiątek narodowych.',
          sources: [TOWN],
        },
        {
          id: 'park-sybilla-lions',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Nad wejściem widnieje napis „Przeszłość–Przyszłości”, a schodów strzegą kamienne lwy.',
          sources: [SYBILLA],
        },
      ],
    },
    {
      building: 'gothic',
      name: 'Dom Gotycki',
      riddle:
        'Budynek ze spiczastymi oknami i wieżą. W jego ściany wmurowano dawne kamienie i pamiątki.',
      facts: [
        {
          id: 'park-gothic-foreign',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To Dom Gotycki! Stoi tuż obok Świątyni Sybilli, ale zbierano w nim głównie pamiątki z innych krajów.',
          sources: [IZABELA],
        },
        {
          id: 'park-gothic-lady',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Wisiała w nim nawet „Dama z gronostajem” Leonarda da Vinci! Dziś obraz jest w Muzeum Czartoryskich w Krakowie.',
          sources: [IZABELA],
        },
      ],
    },
    {
      building: 'greek',
      name: 'Domek Grecki',
      riddle:
        'Budynek z kolumnami, który dawniej był oranżerią dla drzewek pomarańczowych. Dziś mieszkają w nim książki.',
      facts: [
        {
          id: 'park-greek-library',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To Domek Grecki! Dawniej oranżeria, a dziś biblioteka miejska.',
          sources: [TOWN, IZABELA],
        },
      ],
    },
    {
      building: 'roman-gate',
      name: 'Brama Rzymska',
      riddle:
        'Brama, która od początku miała wyglądać jak ruina. Wzorowano ją na Łuku Tytusa w Rzymie.',
      facts: [
        {
          id: 'park-gate-ruin',
          speaker: 'koziol',
          gesture: 'laugh',
          text: 'To Brama Rzymska z 1829 roku. Od razu zbudowano ją jako trwałą ruinę.',
          sources: [TOWN],
        },
      ],
    },
    {
      building: 'chinese',
      name: 'Altana Chińska',
      riddle: 'Altanka z zadartym dachem w stylu dalekiego Wschodu.',
      facts: [
        {
          id: 'park-chinese-age',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'To Altana Chińska z połowy XVIII wieku.',
          sources: [TOWN],
        },
      ],
    },
    {
      building: 'marynka',
      name: 'Pałac Marynki',
      riddle: 'Mały pałacyk z kolumnowym portykiem, zbudowany dla córki księżnej.',
      facts: [
        {
          id: 'park-marynka',
          speaker: 'koziol',
          gesture: 'present',
          text: 'To Pałac Marynki z lat 1790–1794, zbudowany dla Marii Wirtemberskiej. Wzorowano go na pałacyku Petit Trianon w Wersalu.',
          sources: [TOWN, IZABELA],
        },
      ],
    },
  ])

export const PARK_HINTS = {
  start: 'Przeczytajcie zagadkę i stuknijcie we właściwą budowlę.',
  wrong: 'To nie ta budowla. Przeczytajcie zagadkę jeszcze raz.',
  good: 'Jest skarb!',
} as const

export const STATION_IDS = ['painter', 'writer', 'architect', 'musician'] as const
export type StationId = (typeof STATION_IDS)[number]

export const STATION_NAMES: Record<StationId, string> = {
  painter: 'Malarze',
  writer: 'Pisarze',
  architect: 'Architekci',
  musician: 'Muzycy',
}

export const GUEST_IDS = [
  'norblin',
  'kniaznin',
  'aigner',
  'vogel',
  'niemcewicz',
  'hempel',
  'lessel',
  'wojniakowski',
  'woronicz',
  'richter',
] as const
export type GuestId = (typeof GUEST_IDS)[number]

export const SALON_PROLOGUE = lines.parse([
  {
    id: 'salon-tylman',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Teraz pałac. Pierwszy wzniesiono w latach 1676–1679 według projektu Tylmana z Gameren. W 1706 roku spalili go Szwedzi.',
    sources: [TOWN],
  },
  {
    id: 'salon-aigner',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'W latach 1785–1810 Czartoryscy przebudowali go w stylu klasycystycznym według projektu Piotra Aignera.',
    sources: [TOWN],
  },
  {
    id: 'salon-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'A teraz pomieszam gości księżnej! Niech malarze piszą wiersze, a muzycy budują domy!',
  },
  {
    id: 'salon-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Przedstawię wam gości. Zapamiętajcie, kto czym się zajmuje, i zaprowadźcie każdego do właściwego kąta salonu.',
  },
])

export const SALON_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      guests: z
        .array(
          z.object({
            id: z.enum(GUEST_IDS),
            name: z.string().min(1),
            station: z.enum(STATION_IDS),
          }),
        )
        .min(2),
      intro: lines.min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Pierwsi goście',
      guests: [
        { id: 'norblin', name: 'Jan Piotr Norblin', station: 'painter' },
        { id: 'kniaznin', name: 'Franciszek Dionizy Kniaźnin', station: 'writer' },
        { id: 'aigner', name: 'Piotr Aigner', station: 'architect' },
      ],
      intro: [
        {
          id: 'salon-1-intro',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Oto pierwsi goście: Jan Piotr Norblin to malarz, Franciszek Dionizy Kniaźnin to pisarz, a Piotr Aigner to architekt.',
          sources: [PALACE],
        },
      ],
      facts: [
        {
          id: 'salon-1-golden',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Brawo! Okres świetności pałacu zaczął się w 1785 roku, gdy Izabela i Adam Kazimierz Czartoryscy zamieszkali w Puławach na stałe.',
          sources: [PALACE],
        },
      ],
    },
    {
      title: 'Wieczór w salonie',
      guests: [
        { id: 'vogel', name: 'Zygmunt Vogel', station: 'painter' },
        { id: 'niemcewicz', name: 'Julian Ursyn Niemcewicz', station: 'writer' },
        { id: 'hempel', name: 'Joachim Hempel', station: 'architect' },
        { id: 'lessel', name: 'Wincenty i Franciszek Lesslowie', station: 'musician' },
      ],
      intro: [
        {
          id: 'salon-2-intro',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Kolejni goście: Zygmunt Vogel to malarz, Julian Ursyn Niemcewicz to pisarz, Joachim Hempel to architekt, a Wincenty i Franciszek Lesslowie to muzycy.',
          sources: [PALACE],
        },
      ],
      facts: [
        {
          id: 'salon-2-malwina',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W 1816 roku Maria Wirtemberska napisała w Puławach „Malwinę”, uznawaną za pierwszą polską powieść psychologiczno-obyczajową.',
          sources: [TOWN],
        },
        {
          id: 'salon-2-library',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Biblioteka Czartoryskich liczyła około 60 tysięcy tomów. Po powstaniu listopadowym udało się ją ocalić i wywieźć do Paryża.',
          sources: [PALACE],
        },
      ],
    },
    {
      title: 'Ostatni goście',
      guests: [
        { id: 'wojniakowski', name: 'Kazimierz Wojniakowski', station: 'painter' },
        { id: 'woronicz', name: 'Jan Paweł Woronicz', station: 'writer' },
        { id: 'richter', name: 'Józef Richter', station: 'painter' },
      ],
      intro: [
        {
          id: 'salon-3-intro',
          speaker: 'koziol',
          gesture: 'present',
          text: 'I ostatni goście: Kazimierz Wojniakowski i Józef Richter to malarze, a Jan Paweł Woronicz to pisarz.',
          sources: [PALACE],
        },
      ],
      facts: [
        {
          id: 'salon-3-woronicz',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Wszyscy na miejscach! Puławska świątynia natchnęła Woronicza do napisania poematu „Świątynia Sybilli”.',
          sources: [SYBILLA],
        },
        {
          id: 'salon-3-exile',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Po powstaniu listopadowym Czartoryscy musieli emigrować, a majątek skonfiskowano. Rosjanie zmienili nawet nazwę Puław na Nowa Aleksandria.',
          sources: [TOWN],
        },
      ],
    },
  ])

export const SALON_HINTS = {
  start: 'Przeciągnijcie gościa do kąta, w którym pracują ludzie jego zawodu.',
  good: 'Gość zadowolony!',
} as const

export const TOOL_IDS = ['water', 'fertilizer', 'hoe', 'bees'] as const
export type ToolId = (typeof TOOL_IDS)[number]

export const TOOL_NAMES: Record<ToolId, string> = {
  water: 'Konewka',
  fertilizer: 'Nawóz',
  hoe: 'Motyka',
  bees: 'Pszczoły',
}

export const NEED_LABELS: Record<ToolId, string> = {
  water: 'chce pić',
  fertilizer: 'potrzebuje nawozu',
  hoe: 'zarasta chwastami',
  bees: 'kwitnie i czeka na pszczoły',
}

export const LAB_PROLOGUE = lines.parse([
  {
    id: 'lab-devil',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Skarby znalezione, goście na miejscach? To popsuję doświadczenia uczonych! Ześlę suszę i chwasty!',
  },
  {
    id: 'lab-institute',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Po upadku powstania w Puławach zaczęły powstawać szkoły i instytuty. W 1862 roku otwarto tu Instytut Politechniczny i Rolniczo-Leśny.',
    sources: [TOWN],
  },
  {
    id: 'lab-students',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Studiowali w nim m.in. Adam Chmielowski, późniejszy Brat Albert, i Maksymilian Gierymski.',
    sources: [TOWN],
  },
  {
    id: 'lab-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Ratujmy poletko doświadczalne! Nad rośliną pojawi się znak, czego potrzebuje. Przeciągnijcie właściwe narzędzie na roślinę.',
  },
])

export const LAB_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      plants: z.number().int().min(1),
      tools: z.array(z.enum(TOOL_IDS)).min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Pierwsze poletko',
      plants: 3,
      tools: ['water', 'fertilizer'],
      facts: [
        {
          id: 'lab-1-iung',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Wyrosło! W pałacu Czartoryskich ma dziś siedzibę Instytut Uprawy, Nawożenia i Gleboznawstwa.',
          sources: [TOWN],
        },
        {
          id: 'lab-1-fertilizing',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Nawozy uzupełniają w glebie składniki potrzebne roślinom, głównie azot, potas i fosfor.',
          sources: [FERTILIZING],
        },
      ],
    },
    {
      title: 'Chwasty diabła',
      plants: 4,
      tools: ['water', 'fertilizer', 'hoe'],
      facts: [
        {
          id: 'lab-2-history',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Instytut powstał w 1950 roku. Nawiązuje do Państwowego Instytutu Naukowego Gospodarstwa Wiejskiego z lat 1917–1950.',
          sources: [IUNG],
        },
        {
          id: 'lab-2-weeds',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Rośliny rosną najlepiej, gdy mają dobre warunki: wodę, światło, ciepło i odchwaszczoną glebę.',
          sources: [FERTILIZING],
        },
      ],
    },
    {
      title: 'Kwitnące poletko',
      plants: 5,
      tools: ['water', 'fertilizer', 'hoe', 'bees'],
      facts: [
        {
          id: 'lab-3-bees',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pszczoły zbierają nektar i pyłek, a przy okazji zapylają rośliny, na przykład drzewa owocowe i rzepak.',
          sources: [BEE],
        },
        {
          id: 'lab-3-institutes',
          speaker: 'koziol',
          gesture: 'present',
          text: 'W Puławach działa sześć instytutów naukowo-badawczych, a wśród nich nawet oddział pszczelnictwa.',
          sources: [TOWN],
        },
      ],
    },
  ])

export const LAB_HINTS = {
  start:
    'Przeciągnijcie narzędzie na roślinę ze znakiem albo stuknijcie narzędzie, a potem roślinę.',
  wrong: 'Ta roślina potrzebuje czegoś innego. Spójrzcie na znak nad nią.',
  idle: 'Ta roślina ma teraz wszystko, czego potrzebuje.',
  noTool: 'Najpierw wybierzcie narzędzie na dole albo przeciągnijcie je na roślinę.',
  good: 'Roślina rośnie!',
} as const

export const PULAWY_OUTRO = lines.parse([
  {
    id: 'pulawy-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Skarby odnalezione, goście na swoich miejscach, a poletko kwitnie. Diabeł znowu przegrał!',
  },
  {
    id: 'pulawy-krakow',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Zbiory ze Świątyni Sybilli i Domu Gotyckiego trafiły w końcu do Krakowa. W 1876 roku powstało tam Muzeum Czartoryskich.',
    sources: [PALACE],
  },
  {
    id: 'pulawy-azoty',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'A w 1960 roku zdecydowano o budowie Zakładów Azotowych. Z małego miasteczka Puławy stały się miastem przemysłowym.',
    sources: [TOWN],
  },
])
