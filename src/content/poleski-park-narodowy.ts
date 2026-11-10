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

const PARK = wiki('Poleski Park Narodowy', 'Poleski_Park_Narodowy')
const TURTLE = wiki('Żółw błotny', '%C5%BB%C3%B3%C5%82w_b%C5%82otny')
const SUNDEW = wiki('Rosiczka okrągłolistna', 'Rosiczka_okr%C4%85g%C5%82olistna')
const CRANBERRY = wiki('Żurawina błotna', '%C5%BBurawina_b%C5%82otna')
const SPHAGNUM = wiki('Torfowiec', 'Torfowiec')
const BIRCH = wiki('Brzoza niska', 'Brzoza_niska')
const BITTERN = wiki('Bąk (ptak)', 'B%C4%85k_(ptak)')
const WARBLER = wiki('Wodniczka (ptak)', 'Wodniczka_(ptak)')
const CRANE = wiki('Żuraw zwyczajny', '%C5%BBuraw_zwyczajny')

const lines = z.array(dialogueLineSchema)

export const POLESKI_ARRIVAL = lines.parse([
  {
    id: 'poleski-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Poleskim Parku Narodowym! Nad mokradłami wstaje mglisty poranek. Spędzimy tu cały dzień.',
  },
])

export const TURTLE_PROLOGUE = lines.parse([
  {
    id: 'turtle-park',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Park utworzono 1 maja 1990 roku. Chroni bagna, torfowiska, jeziora i lasy polskiej części Polesia.',
    sources: [PARK],
  },
  {
    id: 'turtle-species',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Mieszka tu żółw błotny, jedyny żółw żyjący naturalnie w Polsce. Jego młode wykluwają się pod koniec sierpnia.',
    sources: [TURTLE],
  },
  {
    id: 'turtle-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Maluchy wędrują z gniazda do wody, a czyhają na nie lisy, jenoty i borsuki. Stukajcie w drapieżniki, żeby je przegonić!',
    sources: [TURTLE],
  },
])

export const PREDATOR_IDS = ['fox', 'raccoon-dog', 'badger'] as const
export type PredatorId = (typeof PREDATOR_IDS)[number]

export const PREDATOR_NAMES: Record<PredatorId, string> = {
  fox: 'Lis',
  'raccoon-dog': 'Jenot',
  badger: 'Borsuk',
}

export const TURTLE_WAVES = z
  .array(
    z.object({
      hatchlings: z.number().int().min(1),
      predatorEveryMs: z.number().int().min(500),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      hatchlings: 3,
      predatorEveryMs: 3200,
      facts: [
        {
          id: 'turtle-1-size',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwsze maluchy w wodzie! Młody żółw po wykluciu ma około 2,5 centymetra i miękki pancerz.',
          sources: [TURTLE],
        },
        {
          id: 'turtle-1-shell',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Pancerz twardnieje na tyle, żeby żółw był bezpieczny, dopiero po około 6 latach.',
          sources: [TURTLE],
        },
      ],
    },
    {
      hatchlings: 4,
      predatorEveryMs: 2600,
      facts: [
        {
          id: 'turtle-2-nest',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Żółwica kopie gniazdo w suchej, nasłonecznionej ziemi i składa w nim od 6 do około 16 jaj.',
          sources: [TURTLE],
        },
        {
          id: 'turtle-2-walk',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Szukając miejsca na gniazdo, potrafi odejść nawet 4 do 5 kilometrów od swojego jeziorka.',
          sources: [TURTLE],
        },
      ],
    },
    {
      hatchlings: 5,
      predatorEveryMs: 2100,
      facts: [
        {
          id: 'turtle-3-protection',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Żółw błotny jest pod ścisłą ochroną od 1935 roku. To jeden z najbardziej zagrożonych gadów w Polsce.',
          sources: [TURTLE, PARK],
        },
        {
          id: 'turtle-3-urszulin',
          speaker: 'koziol',
          gesture: 'present',
          text: 'W Urszulinie działa Ośrodek Ochrony Żółwia Błotnego. Od września do maja można tam oglądać małe żółwie.',
          sources: [PARK],
        },
        {
          id: 'turtle-3-name',
          speaker: 'koziol',
          gesture: 'laugh',
          text: 'A wiecie, że w niektórych rejonach Polski żółwia błotnego nazywano żelazną żabą?',
          sources: [TURTLE],
        },
      ],
    },
  ])

export const TURTLE_HINTS = {
  start: 'Stukajcie w drapieżniki, zanim dobiegną do żółwików.',
  scared: 'Uciekł! Pilnujcie dalej.',
  caught: 'Ojej, żółwik schował się w pancerzu i cofnął. Szybciej przeganiajcie drapieżniki!',
} as const

export const BOG_PROLOGUE = lines.parse([
  {
    id: 'bog-peat',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Jest południe, wchodzimy na torfowisko. Prawie cały teren parku to równiny torfowe.',
    sources: [PARK],
  },
  {
    id: 'bog-plants',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Rośnie tu około tysiąca gatunków roślin, wiele z nich to pamiątki z epoki lodowcowej.',
    sources: [PARK],
  },
  {
    id: 'bog-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Dam wam zagadki. Przeczytajcie uważnie i stuknijcie w roślinę, o której mówię.',
  },
])

export const PLANT_IDS = ['sundew', 'cranberry', 'sphagnum', 'birch'] as const
export type PlantId = (typeof PLANT_IDS)[number]

export const PLANTS = z
  .array(
    z.object({
      id: z.enum(PLANT_IDS),
      name: z.string().min(1),
      riddle: z.string().min(1),
      sources: z.array(sourceSchema).min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      id: 'sundew',
      name: 'Rosiczka okrągłolistna',
      riddle:
        'Mam okrągławe, czerwonawe liście pełne lepkich kropelek. Owad, który na mnie usiądzie, już nie odleci.',
      sources: [SUNDEW],
      facts: [
        {
          id: 'bog-sundew-insects',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To rosiczka, roślina owadożerna! Na torfowisku brakuje azotu, więc zdobywa go z owadów.',
          sources: [SUNDEW],
        },
        {
          id: 'bog-sundew-time',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Liść zamyka się na owadzie przez około 3 godziny, a po strawieniu otwiera się znowu po 24 godzinach.',
          sources: [SUNDEW],
        },
      ],
    },
    {
      id: 'cranberry',
      name: 'Żurawina błotna',
      riddle: 'Pełzam po mchu cienkimi pędami. Moje kuliste jagody są czerwone i bardzo kwaśne.',
      sources: [CRANBERRY],
      facts: [
        {
          id: 'bog-cranberry-berries',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Żurawina błotna! Jej pędy mają do metra długości, a jagody do 1 centymetra średnicy.',
          sources: [CRANBERRY],
        },
        {
          id: 'bog-cranberry-soil',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Żurawina lubi kwaśną i wilgotną glebę, dlatego tak dobrze rośnie na torfowiskach.',
          sources: [CRANBERRY],
        },
      ],
    },
    {
      id: 'sphagnum',
      name: 'Torfowiec',
      riddle: 'Jestem mchem i piję wodę jak gąbka. Z moich szczątków powstaje torf.',
      sources: [SPHAGNUM],
      facts: [
        {
          id: 'bog-sphagnum-water',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Torfowiec zatrzymuje wodę w ilości 20 do 30 razy większej niż jego własna masa!',
          sources: [SPHAGNUM],
        },
        {
          id: 'bog-sphagnum-bandage',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Dzięki temu w czasie I wojny światowej używano go nawet jako materiału na opatrunki.',
          sources: [SPHAGNUM],
        },
      ],
    },
    {
      id: 'birch',
      name: 'Brzoza niska',
      riddle:
        'Jestem brzozą, ale rosnę jako niski krzew. Przywędrowałam tu pod koniec epoki lodowcowej.',
      sources: [BIRCH],
      facts: [
        {
          id: 'bog-birch-relic',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Brzoza niska to relikt polodowcowy. Na Syberii rośnie w tundrze.',
          sources: [BIRCH],
        },
        {
          id: 'bog-birch-tundra',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W parku można zobaczyć namiastkę tundry, wysuniętą najdalej na południowy zachód w Europie.',
          sources: [PARK],
        },
      ],
    },
  ])

export const BOG_HINTS = {
  start: 'Która to roślina? Stuknijcie w nią.',
  wrong: 'To nie ta roślina. Przeczytajcie zagadkę jeszcze raz.',
  good: 'Brawo, znaleźliście!',
} as const

export const VOICES_PROLOGUE = lines.parse([
  {
    id: 'voices-birds',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Zapada wieczór. Park to jeden z najbogatszych w ptaki obszarów w Polsce. Stwierdzono tu około dwustu gatunków.',
    sources: [PARK],
  },
  {
    id: 'voices-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Posłuchajcie mokradeł. Gdy usłyszycie głos, wybierzcie ptaka, który tak się odzywa. Głosy naśladuję fujarką, prawdziwe są jeszcze piękniejsze!',
  },
])

export const CALLING_BIRD_IDS = ['bittern', 'warbler', 'crane'] as const
export const BIRD_IDS = [...CALLING_BIRD_IDS, 'owl'] as const
export type BirdId = (typeof BIRD_IDS)[number]

export const BIRD_NAMES: Record<BirdId, string> = {
  bittern: 'Bąk',
  warbler: 'Wodniczka',
  crane: 'Żuraw',
  owl: 'Puchacz',
}

export const VOICES = z
  .array(
    z.object({
      bird: z.enum(CALLING_BIRD_IDS),
      clue: z.string().min(1),
      sources: z.array(sourceSchema).min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      bird: 'bittern',
      clue: 'Z trzcin dochodzi głębokie buczenie, podobne do ryku krowy: prumb… prumb… prumb…',
      sources: [BITTERN],
      facts: [
        {
          id: 'voices-bittern-voice',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To bąk! Samiec wzmacnia swój głos przełykiem, jak pudłem rezonansowym.',
          sources: [BITTERN],
        },
        {
          id: 'voices-bittern-park',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W Poleskim Parku Narodowym bąków jest najgęściej w całym kraju.',
          sources: [PARK],
        },
        {
          id: 'voices-bittern-hide',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Trudno go zobaczyć. Gdy się niepokoi, wyciąga szyję pionowo w górę i wygląda jak trzcina.',
          sources: [BITTERN],
        },
      ],
    },
    {
      bird: 'warbler',
      clue: 'Z bagiennej łąki śpiewa mały, rzadki ptak. Na całym świecie żyje tylko kilkanaście tysięcy par.',
      sources: [WARBLER],
      facts: [
        {
          id: 'voices-warbler-rare',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To wodniczka, ptak narażony na wyginięcie. W Polsce żyje jej największe skupisko w Unii Europejskiej.',
          sources: [WARBLER],
        },
        {
          id: 'voices-warbler-park',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W Poleskim Parku Narodowym mieszka trzecia co do wielkości populacja wodniczki w kraju.',
          sources: [PARK],
        },
        {
          id: 'voices-warbler-africa',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Na zimę odlatuje aż do zachodniej Afryki. Badania wskazują na park narodowy w Senegalu.',
          sources: [WARBLER],
        },
      ],
    },
    {
      bird: 'crane',
      clue: 'Nad mokradłem niesie się donośny głos podobny do trąbki. Słychać go z kilku kilometrów.',
      sources: [CRANE],
      facts: [
        {
          id: 'voices-crane-symbol',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To żuraw, symbol Poleskiego Parku Narodowego!',
          sources: [PARK],
        },
        {
          id: 'voices-crane-klangor',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Ten głos to klangor. Powstaje dzięki zapętlonej tchawicy, która działa jak pudło rezonansowe.',
          sources: [CRANE],
        },
        {
          id: 'voices-crane-flock',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Patrzcie! Żurawie lecą kluczem i wołają się nawzajem.',
          sources: [CRANE],
        },
      ],
    },
  ])

export const VOICE_HINTS = {
  listen: 'Posłuchajcie i wybierzcie ptaka.',
  wrong: 'To nie ten ptak. Posłuchajcie jeszcze raz.',
  good: 'Zgadza się!',
} as const

export const POLESKI_OUTRO = lines.parse([
  {
    id: 'poleski-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Żółwiki w wodzie, rośliny rozpoznane, a żurawie odleciały kluczem. Piękny dzień na mokradłach!',
  },
  {
    id: 'poleski-ramsar',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Park chroni konwencja ramsarska jako ważny obszar podmokły. Należy też do Rezerwatu Biosfery „Polesie Zachodnie”.',
    sources: [PARK],
  },
  {
    id: 'poleski-beaver',
    speaker: 'koziol',
    gesture: 'present',
    text: 'I jeszcze jedno: w 1992 roku sprowadzono do parku bobry. Mieszka tu 48 gatunków ssaków.',
    sources: [PARK],
  },
])
