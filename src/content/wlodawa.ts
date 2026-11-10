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

const TOWN = wiki('Włodawa', 'W%C5%82odawa')
const SYNAGOGUE = wiki('Wielka Synagoga we Włodawie', 'Wielka_Synagoga_we_W%C5%82odawie')
const CERKIEW = wiki(
  'Cerkiew Narodzenia Najświętszej Maryi Panny we Włodawie',
  'Cerkiew_Narodzenia_Naj%C5%9Bwi%C4%99tszej_Maryi_Panny_we_W%C5%82odawie',
)
const CHURCH = wiki(
  'Kościół św. Ludwika we Włodawie',
  'Ko%C5%9Bci%C3%B3%C5%82_%C5%9Bw._Ludwika_we_W%C5%82odawie',
)
const BUG = wiki('Bug', 'Bug')

const lines = z.array(dialogueLineSchema)

export const WLODAWA_ARRIVAL = lines.parse([
  {
    id: 'wlodawa-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie we Włodawie! Miasto leży nad Bugiem i Włodawką, tuż przy granicy z Białorusią. Przejdziemy się od rynku aż nad rzekę.',
    sources: [TOWN],
  },
])

export const GOOD_IDS = ['bread', 'boots', 'pot', 'cloth', 'fish', 'candles', 'honey'] as const
export type GoodId = (typeof GOOD_IDS)[number]

export const GOOD_NAMES: Record<GoodId, string> = {
  bread: 'Chleb',
  boots: 'Buty',
  pot: 'Garnek',
  cloth: 'Sukno',
  fish: 'Ryba',
  candles: 'Świece',
  honey: 'Miód',
}

export const MARKET_PROLOGUE = lines.parse([
  {
    id: 'market-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Pomieszałem wszystkie towary na rynku. Teraz kupcy nie wiedzą, co komu sprzedać!',
  },
  {
    id: 'market-history',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Włodawę wymieniono już w 1242 roku w Kronice halicko-wołyńskiej. Prawa miejskie dostała w 1534 roku.',
    sources: [TOWN],
  },
  {
    id: 'market-czworobok',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Na środku rynku stoi Czworobok: budynek w kształcie kwadratu z dziedzińcem w środku. To zespół kramów i jatek, najprawdopodobniej jedyny taki w Polsce.',
    sources: [TOWN],
  },
  {
    id: 'market-how',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Pomóżmy kupcom! Klienci podchodzą do kramu i mówią, czego szukają. Przeciągnijcie właściwy towar z kart na dole do klienta.',
  },
])

export const MARKET_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      orders: z.array(z.object({ good: z.enum(GOOD_IDS), request: z.string().min(1) })).min(1),
      decoys: z.array(z.enum(GOOD_IDS)).min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Poranek na rynku',
      orders: [
        { good: 'bread', request: 'Poproszę coś świeżego, prosto z pieca, na śniadanie.' },
        { good: 'boots', request: 'Zdarłem podeszwy w drodze. Potrzebuję czegoś na nogi.' },
      ],
      decoys: ['pot', 'candles'],
      facts: [
        {
          id: 'market-1-trade',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Brawo! Położenie nad wielką rzeką, Bugiem, pomogło Włodawie szybko wyrosnąć na miasto handlu i przejazdu.',
          sources: [TOWN],
        },
      ],
    },
    {
      title: 'Południe przy kramach',
      orders: [
        { good: 'pot', request: 'Potrzebuję glinianego naczynia, żeby ugotować zupę.' },
        { good: 'cloth', request: 'Szyję nowy płaszcz i zabrakło mi materiału.' },
        { good: 'fish', request: 'Coś złowionego w rzece na obiad, proszę.' },
      ],
      decoys: ['bread', 'honey'],
      facts: [
        {
          id: 'market-2-settlers',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Po lokacji miasta coraz liczniej osiedlali się tu Niemcy, Ormianie, Czesi i Żydzi.',
          sources: [TOWN],
        },
        {
          id: 'market-2-owners',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Czworobok należał do włodawskich rajców, kupców i rzemieślników, w większości Żydów.',
          sources: [TOWN],
        },
      ],
    },
    {
      title: 'Wieczór na rynku',
      orders: [
        { good: 'candles', request: 'Wieczorem w izbie jest ciemno. Czym ją oświetlić?' },
        { good: 'honey', request: 'Poproszę coś słodkiego, co zrobiły pszczoły.' },
        { good: 'boots', request: 'Idzie zima, a ja chodzę w dziurawym obuwiu.' },
      ],
      decoys: ['cloth', 'fish'],
      facts: [
        {
          id: 'market-3-cultures',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Przez wieki żyli tu obok siebie Polacy, Rusini i Żydzi. Do II wojny światowej Żydzi stanowili ponad 60% mieszkańców.',
          sources: [TOWN],
        },
        {
          id: 'market-3-festival',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Tę tradycję przypomina co roku Festiwal Trzech Kultur: żydowskiej, polskiej i ruskiej.',
          sources: [TOWN],
        },
      ],
    },
  ])

export const MARKET_HINTS = {
  start: 'Posłuchajcie klienta i podajcie mu właściwy towar.',
  wrong: 'Klient kręci głową. Przeczytajcie jeszcze raz, czego szuka.',
  good: 'Klient zadowolony!',
} as const

export const TEMPLE_IDS = ['synagogue', 'cerkiew', 'church'] as const
export type TempleId = (typeof TEMPLE_IDS)[number]

export const TEMPLE_NAMES: Record<TempleId, string> = {
  synagogue: 'Wielka Synagoga',
  cerkiew: 'Cerkiew',
  church: 'Kościół św. Ludwika',
}

export const RELIC_IDS = [
  'aron',
  'iconostasis',
  'organ',
  'bima',
  'onion-dome',
  'twin-towers',
  'shofar',
  'icon',
  'font',
] as const
export type RelicId = (typeof RELIC_IDS)[number]

export const TEMPLE_PROLOGUE = lines.parse([
  {
    id: 'temple-three',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Z rynku idziemy do świątyń trzech religii: judaizmu, prawosławia i katolicyzmu. To Wielka Synagoga, cerkiew i kościół św. Ludwika.',
    sources: [TOWN],
  },
  {
    id: 'temple-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'A ja poprzestawiałem, co się dało! Ciekawe, czy wiecie, co gdzie pasuje.',
  },
  {
    id: 'temple-how',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Przeciągnijcie każdą kartę do świątyni, do której należy. Jeśli nie wiecie, czytajcie podpowiedzi na kartach.',
  },
])

export const TEMPLE_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      relics: z
        .array(
          z.object({
            id: z.enum(RELIC_IDS),
            name: z.string().min(1),
            clue: z.string().min(1),
            temple: z.enum(TEMPLE_IDS),
          }),
        )
        .length(3),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Serce świątyni',
      relics: [
        { id: 'aron', name: 'Aron ha-kodesz', clue: 'szafa na zwoje Tory', temple: 'synagogue' },
        { id: 'iconostasis', name: 'Ikonostas', clue: 'ściana z rzędami ikon', temple: 'cerkiew' },
        { id: 'organ', name: 'Organy', clue: 'grają przy mszy', temple: 'church' },
      ],
      facts: [
        {
          id: 'temple-1-aron',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Aron ha-kodesz stoi na wschodniej ścianie synagogi. Ten z 1936 roku to jeden z najlepiej zachowanych w Polsce.',
          sources: [SYNAGOGUE],
        },
        {
          id: 'temple-1-iconostasis',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W ikonostasie cerkwi ikony wiszą rzędami. Na dole są m.in. Chrystus Pantokrator i Matka Boża, wyżej rząd świąt.',
          sources: [CERKIEW],
        },
        {
          id: 'temple-1-organ',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Organy w kościele św. Ludwika mają 19 głosów i 2 manuały, czyli klawiatury do grania rękami.',
          sources: [CHURCH],
        },
      ],
    },
    {
      title: 'Wnętrza i dachy',
      relics: [
        { id: 'bima', name: 'Bima', clue: 'stała między czterema kolumnami', temple: 'synagogue' },
        {
          id: 'onion-dome',
          name: 'Cebulasta kopułka',
          clue: 'na latarni najwyższej z trzech wież',
          temple: 'cerkiew',
        },
        {
          id: 'twin-towers',
          name: 'Dwie wieże z hełmami',
          clue: 'ujmują barokową fasadę',
          temple: 'church',
        },
      ],
      facts: [
        {
          id: 'temple-2-bima',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Bimę otoczoną niską balustradą rozebrano w czasie II wojny światowej. W 2004 roku odtworzono ją ze starych fotografii.',
          sources: [SYNAGOGUE],
        },
        {
          id: 'temple-2-fontana',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Kościół św. Ludwika zaprojektował Paweł Antoni Fontana. Synagogę zbudowano w latach 1764–1774 prawdopodobnie według projektu tego samego architekta!',
          sources: [CHURCH, SYNAGOGUE],
        },
        {
          id: 'temple-2-towers',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Cerkiew ma trzy wieże. Najwyższą wieńczy hełm w kształcie ostrosłupa z latarnią i cebulastą kopułką.',
          sources: [CERKIEW],
        },
      ],
    },
    {
      title: 'Skarby świątyń',
      relics: [
        { id: 'shofar', name: 'Szofar', clue: 'róg w zbiorach muzeum', temple: 'synagogue' },
        {
          id: 'icon',
          name: 'Ikona św. Jana Chryzostoma',
          clue: 'z przełomu XVII i XVIII wieku',
          temple: 'cerkiew',
        },
        {
          id: 'font',
          name: 'Chrzcielnica',
          clue: 'rokokowa, z warsztatu Filewicza',
          temple: 'church',
        },
      ],
      facts: [
        {
          id: 'temple-3-museum',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Od 1983 roku w synagodze działa muzeum. Są w nim m.in. zwoje Tory, chanukije i szofary.',
          sources: [SYNAGOGUE],
        },
        {
          id: 'temple-3-cerkiew',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Murowaną cerkiew wzniesiono w latach 1840–1843. Najpierw była unicka, a od 1875 roku jest prawosławna.',
          sources: [CERKIEW],
        },
        {
          id: 'temple-3-rococo',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Rokokowe wyposażenie kościoła powstało w latach 1781–1786. Ołtarz i chrzcielnicę wykonał warsztat Michała Filewicza.',
          sources: [CHURCH],
        },
      ],
    },
  ])

export const TEMPLE_HINTS = {
  start: 'Przeciągnijcie kartę do właściwej świątyni.',
  wrong: 'To nie ta świątynia. Przeczytajcie podpowiedź na karcie.',
  good: 'Pasuje!',
} as const

export const RIVER_PROLOGUE = lines.parse([
  {
    id: 'river-bug',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Na koniec spływ kajakiem! Bug płynie wzdłuż wschodniej granicy miasta.',
    sources: [TOWN],
  },
  {
    id: 'river-how',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Omijajcie kłody, mielizny i konary. Sterujcie strzałkami albo stukajcie w lewą lub prawą stronę ekranu.',
  },
])

export const RIVER_LEGS = z
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
      speed: 260,
      facts: [
        {
          id: 'river-1-length',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwszy odcinek za nami! Bug ma 772 kilometry. To czwarta pod względem długości rzeka w Polsce.',
          sources: [BUG],
        },
        {
          id: 'river-1-course',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Bug zaczyna się na Ukrainie, w Werchobużu, a wpada do Narwi w Jeziorze Zegrzyńskim.',
          sources: [BUG],
        },
      ],
    },
    {
      distance: 3000,
      speed: 300,
      facts: [
        {
          id: 'river-2-border',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Na odcinku 363 kilometrów Bug jest granicą Polski z Ukrainą i Białorusią.',
          sources: [BUG],
        },
        {
          id: 'river-2-wlodawka',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Jednym z lewych dopływów Bugu jest Włodawka. Nad nią też leży Włodawa.',
          sources: [BUG, TOWN],
        },
      ],
    },
    {
      distance: 3400,
      speed: 340,
      facts: [
        {
          id: 'river-3-nature',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Meta! Od Gołębia do Terespola nad Bugiem żyje blisko 100 gatunków motyli dziennych i 44 gatunki ryb.',
          sources: [BUG],
        },
        {
          id: 'river-3-narew',
          speaker: 'koziol',
          gesture: 'laugh',
          text: 'A wiecie, że do 1962 roku uważano odwrotnie: że to Narew jest dopływem Bugu?',
          sources: [BUG],
        },
      ],
    },
  ])

export const RIVER_HINTS = {
  start: 'Strzałki albo stuknięcia w lewo i prawo zmieniają tor kajaka.',
  bump: 'Bum! Kajak zwolnił. Skręcajcie wcześniej.',
} as const

export const WLODAWA_OUTRO = lines.parse([
  {
    id: 'wlodawa-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Kramy obsłużone, świątynie uporządkowane, a spływ Bugiem zakończony. Nie bez powodu Włodawa nazywa się Miastem Trzech Kultur!',
    sources: [TOWN],
  },
  {
    id: 'wlodawa-museum',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Muzeum w dawnych synagogach organizuje Festiwal Trzech Kultur, najważniejsze wydarzenie kulturalne miasta.',
    sources: [TOWN],
  },
])
