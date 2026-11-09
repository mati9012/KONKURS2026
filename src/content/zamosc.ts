import { z } from 'zod'
import { dialogueLineSchema, sourceSchema } from '@/content/schema'

const ACCESSED = '2026-11-08'

const UNESCO = sourceSchema.parse({
  title: 'Old City of Zamość, UNESCO World Heritage Centre',
  url: 'https://whc.unesco.org/en/list/564/',
  accessedAt: ACCESSED,
})

const NATIONAL_GEOGRAPHIC = sourceSchema.parse({
  title: 'Zamość: historia miasta, najlepsze atrakcje i ciekawostki, National Geographic Polska',
  url: 'https://www.national-geographic.pl/traveler/kierunki/zamosc-historia-miasta-najlepsze-atrakcje-i-ciekawostki/',
  accessedAt: ACCESSED,
})

const TOWN_HALL = sourceSchema.parse({
  title: 'Zamość Town Hall, Wikipedia',
  url: 'https://en.wikipedia.org/wiki/Zamo%C5%9B%C4%87_Town_Hall',
  accessedAt: ACCESSED,
})

const ACADEMY = sourceSchema.parse({
  title: 'Zamoyski Academy, Wikipedia',
  url: 'https://en.wikipedia.org/wiki/Zamoyski_Academy',
  accessedAt: ACCESSED,
})

const FORTRESS = sourceSchema.parse({
  title: 'Zamość Fortress, Wikipedia',
  url: 'https://en.wikipedia.org/wiki/Zamo%C5%9B%C4%87_Fortress',
  accessedAt: ACCESSED,
})

const CATHEDRAL = sourceSchema.parse({
  title: 'Zamość Cathedral, Wikipedia',
  url: 'https://en.wikipedia.org/wiki/Zamo%C5%9B%C4%87_Cathedral',
  accessedAt: ACCESSED,
})

const lines = z.array(dialogueLineSchema)

export const BUILDING_IDS = [
  'palace',
  'grodzka',
  'market',
  'townhall',
  'houses',
  'collegiate',
  'academy',
  'fortress',
] as const

export type BuildingId = (typeof BUILDING_IDS)[number]

export const BUILDING_NAMES: Record<BuildingId, string> = {
  palace: 'Pałac Zamoyskich',
  grodzka: 'Ulica Grodzka',
  market: 'Rynek Wielki',
  townhall: 'Ratusz',
  houses: 'Kamienice z podcieniami',
  collegiate: 'Kolegiata',
  academy: 'Akademia Zamojska',
  fortress: 'Mury i 7 bastionów',
}

export const SOCKET_NAMES: Record<BuildingId, string> = {
  palace: 'zachodni kraniec miasta',
  grodzka: 'oś od pałacu na wschód',
  market: 'wielki plac na wschodzie',
  townhall: 'północny brzeg placu',
  houses: 'pierzeje wokół placu',
  collegiate: 'na południe od osi',
  academy: 'na północ od osi',
  fortress: 'skraj miasta',
}

const buildStepSchema = z.object({
  building: z.enum(BUILDING_IDS),
  task: dialogueLineSchema,
  wrongBuilding: z.string().min(1),
  wrongPlace: z.string().min(1),
  facts: lines.min(1),
})

export type BuildStep = z.infer<typeof buildStepSchema>

export const ZAMOSC_ARRIVAL = lines.parse([
  {
    id: 'zamosc-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Oto Zamość, renesansowe miasto idealne! Zejdźmy niżej, coś mi tu nie pasuje...',
  },
])

export const ZAMOSC_PROLOGUE = lines.parse([
  {
    id: 'zamosc-devil-plans',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Ha! Rozrzuciłem plany waszego architekta na cztery wiatry. Nikt już nie postawi tego miasta jak należy!',
  },
  {
    id: 'zamosc-welcome',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Nie martwcie się, odbudujemy je razem! Zamość założył kanclerz Jan Zamoyski. Akt założenia miasta wystawiono 3 kwietnia 1580 roku.',
    sources: [FORTRESS],
  },
  {
    id: 'zamosc-morando',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Miasto zaprojektował Bernardo Morando, architekt z Padwy. Budował je według włoskich teorii renesansowego miasta idealnego.',
    sources: [UNESCO],
  },
  {
    id: 'zamosc-body',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Plan Zamościa przypomina ciało człowieka. Zapamiętajcie to, bo będę wam podpowiadać, gdzie co stoi.',
    sources: [NATIONAL_GEOGRAPHIC],
  },
  {
    id: 'zamosc-rules',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Przeciągnijcie budowlę z kart na dole na świecące miejsce na planie, gdzie ma stanąć.',
  },
])

export const BUILD_STEPS = z.array(buildStepSchema).parse([
  {
    building: 'palace',
    task: {
      id: 'task-palace',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Zacznijmy od głowy miasta. To prywatna rezydencja założyciela, na zachodnim końcu miasta.',
    },
    wrongBuilding: 'To nie ta budowla. Głową miasta była rezydencja samego Zamoyskiego.',
    wrongPlace: 'Głowa jest na zachodnim krańcu miasta. Zerknijcie na różę wiatrów.',
    facts: [
      {
        id: 'fact-palace',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Głowę renesansowego człowieka symbolizuje Pałac Zamoyskich, zbudowany jako prywatna rezydencja.',
        sources: [NATIONAL_GEOGRAPHIC],
      },
    ],
  },
  {
    building: 'grodzka',
    task: {
      id: 'task-grodzka',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Teraz kręgosłup: ulica, która biegnie od pałacu prosto na wschód, przez całe miasto.',
    },
    wrongBuilding: 'Szukamy ulicy, nie budynku.',
    wrongPlace: 'Kręgosłup zaczyna się przy pałacu i prowadzi na wschód.',
    facts: [
      {
        id: 'fact-grodzka',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Kręgosłupem miasta jest ulica Grodzka, a ulice poprzeczne przy rynku to jego ramiona.',
        sources: [NATIONAL_GEOGRAPHIC],
      },
    ],
  },
  {
    building: 'market',
    task: {
      id: 'task-market',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Każde porządne miasto potrzebuje serca handlu. Wielki kwadratowy plac stanie na kręgosłupie, we wschodniej części miasta.',
    },
    wrongBuilding: 'Potrzebujemy placu, na którym kupcy rozłożą towary.',
    wrongPlace: 'Plac leży na ulicy Grodzkiej, bliżej wschodniej strony.',
    facts: [
      {
        id: 'fact-market-size',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Rynek Wielki ma niezmienione od początku wymiary: 100 na 100 metrów.',
        sources: [NATIONAL_GEOGRAPHIC],
      },
      {
        id: 'fact-market-squares',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Miasto rozplanowano wokół trzech rynków. Rynek Wielki leży na skrzyżowaniu dwóch głównych osi miasta.',
        sources: [UNESCO],
      },
    ],
  },
  {
    building: 'townhall',
    task: {
      id: 'task-townhall',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Gdzie obradują rajcy? Ich budynek z wysoką wieżą stoi przy północnej pierzei Rynku Wielkiego.',
    },
    wrongBuilding: 'Rajcy obradują w budynku z wieżą zegarową.',
    wrongPlace:
      'Szukajcie miejsca na północnym brzegu rynku. Róża wiatrów pokaże, gdzie jest północ.',
    facts: [
      {
        id: 'fact-townhall-tower',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Ratusz zaprojektował Morando. Ma wieżę zegarową wysoką na 52 metry.',
        sources: [TOWN_HALL],
      },
      {
        id: 'fact-townhall-stairs',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Słynne wachlarzowe schody dobudowano dopiero dwa stulecia później, a wieżę pod koniec XVIII wieku.',
        sources: [TOWN_HALL],
      },
    ],
  },
  {
    building: 'houses',
    task: {
      id: 'task-houses',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Kupcy potrzebują domów. Kolorowe kamienice z podcieniami otoczą rynek.',
    },
    wrongBuilding: 'Szukamy domów kupców, z łukami na parterze.',
    wrongPlace: 'Kamienice obejmują rynek, tuż przy jego brzegach.',
    facts: [
      {
        id: 'fact-houses-arcades',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Rynek Wielki otaczają kupieckie kamienice z podcieniami. Najsłynniejsze to manierystyczno-barokowe kamienice ormiańskie.',
        sources: [UNESCO, NATIONAL_GEOGRAPHIC],
      },
      {
        id: 'fact-houses-tolerance',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Od początku Zamość miał być miastem wielu narodów, w którym panowała tolerancja religijna.',
        sources: [UNESCO],
      },
    ],
  },
  {
    building: 'collegiate',
    task: {
      id: 'task-collegiate',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Teraz świątynia ufundowana przez Zamoyskiego. Stanie na południe od ulicy Grodzkiej, między pałacem a rynkiem.',
    },
    wrongBuilding: 'Szukamy kościoła, a nie szkoły ani domu.',
    wrongPlace: 'To miejsce jest na południe od Grodzkiej, między pałacem a rynkiem.',
    facts: [
      {
        id: 'fact-collegiate',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Kolegiatę ufundował Jan Zamoyski, a zaprojektował Morando, wzorując się na włoskich kościołach.',
        sources: [CATHEDRAL],
      },
      {
        id: 'fact-cathedral',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Od 1992 roku kolegiata jest katedrą nowej diecezji zamojsko-lubaczowskiej.',
        sources: [CATHEDRAL],
      },
    ],
  },
  {
    building: 'academy',
    task: {
      id: 'task-academy',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Zamoyski chciał kształcić młodzież. Szkoła stanie naprzeciw kolegiaty, po północnej stronie Grodzkiej.',
    },
    wrongBuilding: 'Szukamy uczelni, w której wykładali profesorowie.',
    wrongPlace: 'Szkoła stoi na północ od Grodzkiej, naprzeciw kolegiaty.',
    facts: [
      {
        id: 'fact-academy-founded',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Akademię Zamojską założono w 1594 roku. Była trzecią uczelnią w Rzeczypospolitej, po Krakowie i Wilnie, i pierwszą prywatną.',
        sources: [ACADEMY],
      },
      {
        id: 'fact-academy-motto',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Zamoyski napisał w akcie fundacyjnym: „Takie są rzeczypospolite, jakie ich młodzieży chowanie”.',
        sources: [ACADEMY],
      },
    ],
  },
  {
    building: 'fortress',
    task: {
      id: 'task-fortress',
      speaker: 'koziol',
      gesture: 'think',
      text: 'Na koniec obrona! Mury z bastionami muszą otoczyć całe miasto. Przeciągnijcie je na sam skraj planu.',
    },
    wrongBuilding: 'Bez murów diabeł wejdzie do miasta. Wybierzcie fortyfikacje.',
    wrongPlace: 'Mury biegną wokół całego miasta, po jego krawędzi.',
    facts: [
      {
        id: 'fact-fortress-shape',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Twierdza miała kształt siedmioboku z siedmioma bastionami. Stały około 200 metrów od siebie, bo tyle wynosił zasięg ówczesnych armat.',
        sources: [FORTRESS],
      },
      {
        id: 'fact-fortress-sieges',
        speaker: 'koziol',
        gesture: 'cheer',
        text: 'Mury były tak solidne, że twierdza oparła się i Kozakom, i Szwedom w czasie potopu.',
        sources: [FORTRESS],
      },
    ],
  },
])

export const BUILD_FINALE = lines.parse([
  {
    id: 'zamosc-city-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Udało się! Miasto idealne stoi jak za czasów Zamoyskiego.',
  },
  {
    id: 'zamosc-devil-tower',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Phi! Ale trębacza na wieży ratusza i tak wam pomieszałem. Niech gra hejnał na Kraków, ha!',
  },
  {
    id: 'zamosc-hejnal-tradition',
    speaker: 'koziol',
    gesture: 'think',
    text: 'O nie! Z wieży ratusza od wieków gra się hejnał. Hetman Zamoyski zakazał grać go w stronę Krakowa.',
    sources: [TOWN_HALL],
  },
  {
    id: 'zamosc-hejnal-three',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Dlatego hejnał w Zamościu rozbrzmiewa tylko na trzy strony świata. Pomóżcie trębaczowi!',
    sources: [NATIONAL_GEOGRAPHIC],
  },
  {
    id: 'zamosc-hejnal-rules',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Obróćcie trębacza w dobrą stronę, a potem stukajcie w rytm, gdy nuta dotknie złotego kręgu.',
  },
])

export const HEJNAL_DIRECTIONS = ['north', 'east', 'south', 'west'] as const

export type HejnalDirection = (typeof HEJNAL_DIRECTIONS)[number]

export const DIRECTION_NAMES: Record<HejnalDirection, string> = {
  north: 'Północ',
  east: 'Wschód',
  south: 'Południe',
  west: 'Zachód',
}

export const HEJNAL_WEST_WARNING = dialogueLineSchema.parse({
  id: 'hejnal-west',
  speaker: 'koziol',
  gesture: 'think',
  text: 'Nie na zachód! Tam leży Kraków, a w tę stronę hejnału w Zamościu się nie gra.',
  sources: [TOWN_HALL],
})

export const ZAMOSC_OUTRO = lines.parse([
  {
    id: 'zamosc-hejnal-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Pięknie! Hejnał popłynął na północ, wschód i południe, tak jak trzeba.',
  },
  {
    id: 'zamosc-hejnal-2020',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Ciekawostka na koniec: w 2020 roku wyjątkowo zagrano hejnał na wszystkie cztery strony, także w stronę Krakowa.',
    sources: [TOWN_HALL],
  },
  {
    id: 'zamosc-pharmacy',
    speaker: 'koziol',
    gesture: 'present',
    text: 'W Zamościu działa też najstarsza apteka w Polsce, otwarta w 1616 roku.',
    sources: [NATIONAL_GEOGRAPHIC],
  },
  {
    id: 'zamosc-unesco',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'W 1992 roku Stare Miasto w Zamościu wpisano na Listę Światowego Dziedzictwa UNESCO.',
    sources: [UNESCO],
  },
  {
    id: 'zamosc-devil-flees',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Grrr! Następnym razem tak łatwo wam nie pójdzie!',
  },
  {
    id: 'zamosc-stamp',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Pieczęć Zamościa trafia do waszego paszportu. Na wyspie czekają już kolejne miejsca!',
  },
])
