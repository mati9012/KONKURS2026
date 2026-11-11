import { z } from 'zod'
import { dialogueLineSchema, sourceSchema } from '@/content/schema'

const ACCESSED = '2026-11-11'

function wiki(title: string, path: string) {
  return sourceSchema.parse({
    title: `${title}, Wikipedia`,
    url: `https://pl.wikipedia.org/wiki/${path}`,
    accessedAt: ACCESSED,
  })
}

const TOWN = wiki('Chełm', 'Che%C5%82m')
const TUNNELS = wiki('Chełmskie Podziemia Kredowe', 'Che%C5%82mskie_Podziemia_Kredowe')
const ARMS = wiki('Herb Chełma', 'Herb_Che%C5%82ma')
const BASILICA = wiki(
  'Bazylika Narodzenia Najświętszej Maryi Panny w Chełmie',
  'Bazylika_Narodzenia_Naj%C5%9Bwi%C4%99tszej_Maryi_Panny_w_Che%C5%82mie',
)
const GHOST = sourceSchema.parse({
  title: 'Biały duch białych podziemi, National Geographic Polska',
  url: 'https://www.national-geographic.pl/traveler/kierunki/bialy-duch-bialych-podziemi/',
  accessedAt: ACCESSED,
})

const lines = z.array(dialogueLineSchema)

export const CHELM_ARRIVAL = lines.parse([
  {
    id: 'chelm-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Chełmie! Pod miastem ciągną się jedyne w Europie podziemia kredowe, a strzeże ich duch Bieluch.',
    sources: [TOWN],
  },
])

export const HILL_PROLOGUE = lines.parse([
  {
    id: 'hill-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Ukradnę skarby Bielucha! A żeby nikt mi nie przeszkodził, rozrzuciłem kartki kroniki Chełma po całym wzgórzu!',
  },
  {
    id: 'hill-prince',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Bez kroniki nie trafimy do Bielucha. Wejdźmy na Górę Chełmską. To tu wszystko się zaczęło.',
  },
  {
    id: 'hill-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Na każdym zakręcie ścieżki przeczytajcie wskazówkę i wybierzcie kartkę, która do niej pasuje. Ułożymy historię po kolei!',
  },
])

export const HILL_PAGE_IDS = [
  'grod',
  'cerkiew',
  'miasto',
  'bazylika',
  'dzwonnica',
  'papiez',
] as const

export type HillPageId = (typeof HILL_PAGE_IDS)[number]

const pageSchema = z.object({
  id: z.enum(HILL_PAGE_IDS),
  label: z.string().min(1),
  clue: z.string().min(1),
  fact: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
})

export const HILL_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      pages: z.array(pageSchema).length(3),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Podnóże wzgórza',
      pages: [
        {
          id: 'grod',
          label: 'Książę zamieszkał na wzgórzu',
          clue: 'Najpierw przybył książę i przeniósł tu swoją siedzibę.',
          fact: 'Około 1240 roku książę Daniel Halicki przeniósł swoją siedzibę z Halicza do Chełma.',
          sources: [TOWN],
        },
        {
          id: 'cerkiew',
          label: 'Na wzgórzu stanęła cerkiew',
          clue: 'Potem książę ufundował na wzgórzu świątynię.',
          fact: 'Około 1256 roku Daniel Romanowicz ufundował tu cerkiew.',
          sources: [BASILICA],
        },
        {
          id: 'miasto',
          label: 'Chełm dostał prawa miejskie',
          clue: 'Wreszcie osada pod wzgórzem została prawdziwym miastem.',
          fact: 'Chełm ma prawa miejskie od 1392 roku.',
          sources: [TOWN],
        },
      ],
      facts: [
        {
          id: 'hill-1-height',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwsza część kroniki ułożona! To wzgórze to Góra Chełmska, nazywana też Wysoką Górką. Ma 237 metrów nad poziomem morza.',
          sources: [TOWN],
        },
        {
          id: 'hill-1-bear',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Według legendy w kredowej jaskini pod trzema dębami na tym wzgórzu mieszkał biały niedźwiedź.',
          sources: [TOWN],
        },
      ],
    },
    {
      title: 'Szczyt wzgórza',
      pages: [
        {
          id: 'bazylika',
          label: 'Zbudowano nowy, większy kościół',
          clue: 'Starą cerkiew rozebrano i postawiono w jej miejscu nową, okazałą świątynię.',
          fact: 'Nowy kościół budowano w latach 1735–1756 według projektu Pawła Antoniego Fontany.',
          sources: [BASILICA],
        },
        {
          id: 'dzwonnica',
          label: 'Obok wyrosła dzwonnica',
          clue: 'Później obok kościoła stanęła wysoka wieża na dzwony.',
          fact: 'Dzwonnicę zbudowano w 1878 roku, a w 1939 roku przebudowano ją i podwyższono.',
          sources: [TOWN],
        },
        {
          id: 'papiez',
          label: 'Kościół dostał tytuł bazyliki',
          clue: 'Na koniec papież nadał świątyni zaszczytny tytuł.',
          fact: 'W 1988 roku papież Jan Paweł II nadał świątyni tytuł bazyliki mniejszej.',
          sources: [BASILICA],
        },
      ],
      facts: [
        {
          id: 'hill-2-tower',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Kronika jest cała! Dzwonnicę otwarto dla turystów w czerwcu 2008 roku.',
          sources: [TOWN],
        },
        {
          id: 'hill-2-icon',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W głównym ołtarzu bazyliki jest kopia cudownego obrazu Matki Bożej Chełmskiej. Oryginał przechowuje muzeum w Łucku.',
          sources: [BASILICA],
        },
      ],
    },
  ])

export const HILL_HINTS = {
  wrong: 'Diabelski wiatr porwał kartkę! Przeczytajcie wskazówkę jeszcze raz.',
} as const

export const ARMS_PROLOGUE = lines.parse([
  {
    id: 'arms-devil',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Za późno! Rozbiłem herb Chełma na kawałki. Bez herbu biały niedźwiedź straci siły, a Bieluch zniknie na zawsze!',
  },
  {
    id: 'arms-spirit',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Bieluch to duch białego niedźwiedzia z herbu Chełma. Musimy szybko złożyć herb z powrotem!',
    sources: [TOWN],
  },
  {
    id: 'arms-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Przeciągnijcie właściwe części na tarczę albo stuknijcie część, a potem tarczę. Uważajcie na diabelskie podróbki!',
  },
])

export const ARMS_PART_KINDS = [
  'field-green',
  'field-red',
  'oaks',
  'spruce',
  'bear-white',
  'bear-brown',
  'crown',
  'horns',
] as const

export type ArmsPartKind = (typeof ARMS_PART_KINDS)[number]

export const ARMS_SLOTS = ['field', 'trees', 'bear', 'crown'] as const

export type ArmsSlot = (typeof ARMS_SLOTS)[number]

export const ARMS_SLOT_NAMES: Record<ArmsSlot, string> = {
  field: 'tło tarczy',
  trees: 'wzgórze z drzewami',
  bear: 'zwierzę w herbie',
  crown: 'miejsce nad tarczą',
}

const partSchema = z.object({
  id: z.enum(ARMS_PART_KINDS),
  label: z.string().min(1),
  slot: z.enum(ARMS_SLOTS).nullable(),
})

export const ARMS_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      parts: z.array(partSchema).min(2),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Tarcza i drzewa',
      parts: [
        { id: 'field-green', label: 'Zielone pole', slot: 'field' },
        { id: 'field-red', label: 'Czerwone pole', slot: null },
        { id: 'oaks', label: 'Trzy dęby na wzgórzu', slot: 'trees' },
        { id: 'spruce', label: 'Jeden świerk', slot: null },
      ],
      facts: [
        {
          id: 'arms-1-field',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pole tarczy jest zielone, a na wzgórzu rosną obok siebie trzy dęby.',
          sources: [ARMS],
        },
        {
          id: 'arms-1-legend',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Legenda mówi, że najeźdźcy szukali w jaskini ukrytych mieszkańców, ale spotkali tam białego niedźwiedzia i uciekli w popłochu.',
          sources: [ARMS],
        },
      ],
    },
    {
      title: 'Niedźwiedź i korona',
      parts: [
        { id: 'bear-white', label: 'Biały niedźwiedź', slot: 'bear' },
        { id: 'bear-brown', label: 'Brunatny niedźwiedź', slot: null },
        { id: 'crown', label: 'Złota korona z krzyżem', slot: 'crown' },
        { id: 'horns', label: 'Diabelskie rogi', slot: null },
      ],
      facts: [
        {
          id: 'arms-2-chalk',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Herb jest cały! Niedźwiedź kroczy w prawo, a biały jest podobno od kredy.',
          sources: [ARMS],
        },
        {
          id: 'arms-2-thanks',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Z wdzięczności mieszkańcy umieścili niedźwiedzia w herbie. Nad tarczą jest złota korona zwieńczona krzyżem.',
          sources: [ARMS],
        },
        {
          id: 'arms-2-bieluch',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Patrzcie, Bieluch odzyskał siły! Poprowadzi nas do podziemi.',
        },
      ],
    },
  ])

export const ARMS_HINTS = {
  start: 'Wybierzcie część, która pasuje do herbu Chełma.',
  wrong: 'To diabelska podróbka albo złe miejsce! Spróbujcie innej części.',
  good: 'Pasuje!',
} as const

export const TUNNEL_PROLOGUE = lines.parse([
  {
    id: 'tunnel-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! W podziemiach jest ciemno jak w piekle. Będę wam zdmuchiwał latarkę i nigdy nie znajdziecie skarbów!',
  },
  {
    id: 'tunnel-mine',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Kredę kopano tu od XIII wieku. Korytarze miały kilka poziomów i sięgały ponad 20 metrów w głąb.',
    sources: [TUNNELS],
  },
  {
    id: 'tunnel-ghost',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Nie bójcie się Bielucha! To duch niegroźny, lubi dzieci i spełnia życzenia.',
    sources: [GHOST],
  },
  {
    id: 'tunnel-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Wodźcie latarką po korytarzu i stuknijcie każdą znalezioną rzecz. Gdy diabeł zdmuchnie światło, stuknijcie białą poświatę Bielucha.',
  },
])

export const TUNNEL_ITEM_KINDS = [
  'pick',
  'chalk',
  'barrow',
  'chest',
  'ladder',
  'barrel',
  'paw',
  'prop',
  'treasure',
] as const

export type TunnelItemKind = (typeof TUNNEL_ITEM_KINDS)[number]

const itemSchema = z.object({
  id: z.enum(TUNNEL_ITEM_KINDS),
  label: z.string().min(1),
  fact: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
})

export const TUNNEL_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      items: z.array(itemSchema).min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Pierwszy poziom',
      items: [
        {
          id: 'pick',
          label: 'Kilof górnika',
          fact: 'Kilof górnika! Kredę wydobywano tu od XIII wieku, a najwięcej w XVII i XVIII wieku.',
          sources: [TUNNELS],
        },
        {
          id: 'chalk',
          label: 'Bryła kredy',
          fact: 'Bryła kredy! Używano jej w budownictwie, w ceramice i do produkcji barwników.',
          sources: [TUNNELS],
        },
        {
          id: 'barrow',
          label: 'Taczka',
          fact: 'Taczka! Kredę wysyłano daleko, nawet do Krakowa dla Akademii Krakowskiej.',
          sources: [TUNNELS],
        },
      ],
      facts: [
        {
          id: 'tunnel-1-cold',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwszy poziom przeszukany! Czujecie chłód? W podziemiach zawsze jest około 9 stopni, bez względu na pogodę na górze.',
          sources: [TUNNELS],
        },
      ],
    },
    {
      title: 'Drugi poziom',
      items: [
        {
          id: 'ladder',
          label: 'Drabina',
          fact: 'Drabina na niższy poziom! Wyrobiska miały kiedyś 4–5 poziomów.',
          sources: [TUNNELS],
        },
        {
          id: 'chest',
          label: 'Skrzynia',
          fact: 'Skrzynia! Podziemia służyły też za schronienie w czasie najazdów i wojen.',
          sources: [TUNNELS],
        },
        {
          id: 'barrel',
          label: 'Beczka',
          fact: 'Beczka! Podobno w korytarzach chowano kosztowności i jedzenie.',
          sources: [GHOST],
        },
      ],
      facts: [
        {
          id: 'tunnel-2-route',
          speaker: 'koziol',
          gesture: 'think',
          text: 'W 1936 roku przy budowie wodociągów zbadano część korytarzy i przygotowano oświetloną trasę długości 300 metrów.',
          sources: [TUNNELS],
        },
      ],
    },
    {
      title: 'Najgłębszy poziom',
      items: [
        {
          id: 'prop',
          label: 'Drewniana podpora',
          fact: 'Podpora stropu! Na początku XX wieku całkiem zakazano wydobycia, żeby miasto było bezpieczne.',
          sources: [TUNNELS],
        },
        {
          id: 'paw',
          label: 'Ślad łapy',
          fact: 'Ślad łapy! To trop Bielucha, ducha białego niedźwiedzia z herbu Chełma.',
          sources: [TOWN],
        },
        {
          id: 'treasure',
          label: 'Skarb Bielucha',
          fact: 'Skarb Bielucha! Według legendy biały niedźwiedź strzegł podziemnych skarbów pod Górą Chełmską.',
          sources: [TOWN],
        },
      ],
      facts: [
        {
          id: 'tunnel-3-saved',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Skarb jest bezpieczny! Bieluch przegonił diabła z podziemi.',
        },
        {
          id: 'tunnel-3-monument',
          speaker: 'koziol',
          gesture: 'talk',
          text: '25 stycznia 1995 roku podziemia wpisano do rejestru zabytków.',
          sources: [TUNNELS],
        },
      ],
    },
  ])

export const TUNNEL_HINTS = {
  start: 'Poświećcie latarką w ciemne kąty korytarza.',
  dark: 'Diabeł zdmuchnął latarkę! Stuknijcie białą poświatę Bielucha.',
  lit: 'Bieluch znów zapalił latarkę. Szukamy dalej!',
} as const

export const CHELM_OUTRO = lines.parse([
  {
    id: 'chelm-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Kronika ułożona, herb cały, a skarby Bielucha bezpieczne. Chełm znów śpi spokojnie!',
  },
  {
    id: 'chelm-fools',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Chełm bywa nazywany bajecznym miastem głupców. To za sprawą opowiadań Isaaca Bashevisa Singera o chełmskich mędrcach.',
    sources: [TOWN],
  },
])
