import { z } from 'zod'
import { dialogueLineSchema, sourceSchema } from '@/content/schema'

const ACCESSED = '2026-11-09'

const TOWN = sourceSchema.parse({
  title: 'Zwierzyniec (miasto), Wikipedia',
  url: 'https://pl.wikipedia.org/wiki/Zwierzyniec_(miasto)',
  accessedAt: ACCESSED,
})

const CHURCH = sourceSchema.parse({
  title: 'Kościół św. Jana Nepomucena w Zwierzyńcu, Wikipedia',
  url: 'https://pl.wikipedia.org/wiki/Ko%C5%9Bci%C3%B3%C5%82_%C5%9Bw._Jana_Nepomucena_w_Zwierzy%C5%84cu',
  accessedAt: ACCESSED,
})

const NEPOMUK = sourceSchema.parse({
  title: 'Jan Nepomucen, Wikipedia',
  url: 'https://pl.wikipedia.org/wiki/Jan_Nepomucen',
  accessedAt: ACCESSED,
})

const PARK = sourceSchema.parse({
  title: 'Roztoczański Park Narodowy, Wikipedia',
  url: 'https://pl.wikipedia.org/wiki/Roztocza%C5%84ski_Park_Narodowy',
  accessedAt: ACCESSED,
})

const KONIK = sourceSchema.parse({
  title: 'Konik polski, Wikipedia',
  url: 'https://pl.wikipedia.org/wiki/Konik_polski',
  accessedAt: ACCESSED,
})

const lines = z.array(dialogueLineSchema)

export const ZWIERZYNIEC_ARRIVAL = lines.parse([
  {
    id: 'zwierzyniec-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Zwierzyńcu, w samym sercu Roztocza! Słyszycie ten tętent? Ktoś tu narobił zamieszania...',
  },
])

export const HERD_PROLOGUE = lines.parse([
  {
    id: 'herd-devil-fence',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Ha! Wyrwałem sztachety z płotu i rozgoniłem koniki po polanie. Niech ich szukają do zimy!',
  },
  {
    id: 'herd-founded',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Co za łobuz! Zwierzyniec powstał w 1593 roku, cztery lata po założeniu Ordynacji Zamojskiej.',
    sources: [TOWN],
  },
  {
    id: 'herd-name',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Nazwa wzięła się od wielkiego zwierzyńca otoczonego wysokim płotem. Zamoyscy trzymali w nim jelenie, sarny, łosie i dziki.',
    sources: [TOWN],
  },
  {
    id: 'herd-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Pomóżcie mi zagonić koniki do zagrody. Pójdę tam, gdzie wskażecie, a koniki będą przede mną uciekać. Zachodźcie je od tyłu i nie biegajcie prosto na nie, bo się spłoszą!',
  },
])

export const HERD_WAVES = z
  .array(z.object({ count: z.number().int().positive(), facts: lines.min(1) }))
  .parse([
    {
      count: 2,
      facts: [
        {
          id: 'herd-wave-1-symbol',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Dwa koniki w zagrodzie! To koniki polskie, symbol Roztoczańskiego Parku Narodowego.',
          sources: [PARK],
        },
        {
          id: 'herd-wave-1-coat',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Poznacie je po myszatej, szarej sierści i czarnej prędze biegnącej wzdłuż grzbietu.',
          sources: [KONIK],
        },
      ],
    },
    {
      count: 3,
      facts: [
        {
          id: 'herd-wave-2-devil',
          speaker: 'diabel',
          gesture: 'laugh',
          text: 'Phi, trzy koniki to nic! Teraz będę strzelał z bata zza krzaków!',
        },
        {
          id: 'herd-wave-2-tarpan',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Przodkami koników były dzikie tarpany. W 1780 roku złapano je w puszczy i umieszczono w zwierzyńcu Zamoyskich.',
          sources: [KONIK],
        },
        {
          id: 'herd-wave-2-peasants',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Około 1806 roku, gdy panowała bieda, rozdano je okolicznym chłopom. Tak zamieszkały w gospodarstwach koło Biłgoraja.',
          sources: [KONIK],
        },
      ],
    },
    {
      count: 4,
      facts: [
        {
          id: 'herd-wave-3-vetulani',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Całe stado w domu! Nazwę „konik polski” wprowadził profesor Tadeusz Vetulani. Od 1936 roku odtwarzał w Puszczy Białowieskiej konika podobnego do tarpana.',
          sources: [KONIK],
        },
        {
          id: 'herd-wave-3-park',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Roztoczański Park Narodowy utworzono 10 maja 1974 roku, a jego dyrekcja mieści się tu, w Zwierzyńcu. Park hoduje koniki wokół stawów Echo.',
          sources: [PARK],
        },
      ],
    },
  ])

export const HERD_HINTS = {
  start: 'Wskażcie mi miejsce za konikiem, a popędzę go w stronę bramy zagrody.',
  scared: 'Ojej, spłoszył się! Podchodźcie do koników spokojniej, łukiem.',
  whip: 'Diabeł strzelił z bata! Zbierzcie rozbiegane koniki.',
  penned: 'Jest w zagrodzie! Teraz następny.',
} as const

export const BRIDGE_PROLOGUE = lines.parse([
  {
    id: 'bridge-devil-pond',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Koniki wróciły? To spójrzcie na staw! Połamałem wszystkie kładki do kościółka na wyspie. Nikt tam nie dojdzie!',
  },
  {
    id: 'bridge-church',
    speaker: 'koziol',
    gesture: 'present',
    text: 'To kościół świętego Jana Nepomucena „na wyspie”. Zbudowano go w latach 1741–1747.',
    sources: [CHURCH],
  },
  {
    id: 'bridge-founders',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Ufundował go ordynat Tomasz Zamoyski razem z żoną Teresą. Stał przy pałacu Zamoyskich i służył im za kaplicę.',
    sources: [CHURCH],
  },
  {
    id: 'bridge-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Ułóżmy nowe kładki! Przeciągnijcie deskę o pasującej długości na przerwę między słupkami. Tylko uważajcie na poczerniałe deski, to podróbki diabła!',
  },
])

export const BRIDGE_SECTIONS = z.array(z.object({ facts: lines.min(1) })).parse([
  {
    facts: [
      {
        id: 'bridge-section-1-patron',
        speaker: 'koziol',
        gesture: 'cheer',
        text: 'Pierwsza wysepka! Święty Jan Nepomucen to patron mostów i tonących, a także orędownik podczas powodzi.',
        sources: [NEPOMUK],
      },
    ],
  },
  {
    facts: [
      {
        id: 'bridge-section-2-figures',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Jego figury, zwane nepomukami, stoją często przy mostach i rzekach. Według ludowej tradycji chronił pola przed powodzią i suszą.',
        sources: [NEPOMUK],
      },
    ],
  },
  {
    facts: [
      {
        id: 'bridge-section-3-inside',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Wnętrze kościółka zdobią malowidła Łukasza Smuglewicza, a na frontonie są herby Jelita i Rawicz, czyli Zamoyskich i Michowskich.',
        sources: [CHURCH],
      },
      {
        id: 'bridge-section-3-real-bridge',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Prawdziwy most do kościoła zbudowano z żelbetu w latach 1963–1964. Ale nasza kładka też da radę!',
        sources: [CHURCH],
      },
    ],
  },
])

export const BRIDGE_HINTS = {
  start: 'Wybierzcie deskę na dole i przeciągnijcie ją na świecącą przerwę.',
  pickFirst: 'Najpierw wybierzcie deskę z brzegu.',
  tooShort: 'Za krótka! Wpadłaby do wody. Poszukajcie dłuższej.',
  tooLong: 'Za długa, nie zmieści się między słupkami. Spróbujcie krótszej.',
  rotten: 'Trach! Ta deska była spróchniała, to sprawka diabła. Bierzcie tylko jasne deski.',
  wave: 'Diabeł puścił falę i zmył jedną kładkę! Szybko, ułóżcie ją jeszcze raz.',
  placed: 'Trzyma się! Dalej.',
  procession: 'Kładka gotowa! Patrzcie, procesja z lampionami idzie do kościółka.',
} as const

export const ZWIERZYNIEC_OUTRO = lines.parse([
  {
    id: 'zwierzyniec-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Koniki w zagrodzie, a procesja z lampionami doszła po kładce do kościółka. Brawo!',
  },
  {
    id: 'zwierzyniec-lusthaus',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Ciekawostka na koniec: w ogrodzie Zamoyskich stał kiedyś na wodzie letni pałacyk Gryzeldy, matki króla Michała Korybuta Wiśniowieckiego.',
    sources: [TOWN],
  },
  {
    id: 'zwierzyniec-wieprz',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Zwierzyniec leży nad rzeką Wieprz, a tuż za południową granicą miasta są stawy Echo.',
    sources: [TOWN],
  },
  {
    id: 'zwierzyniec-devil-flees',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Grrr! Płot naprawiony, kładki ułożone... Jeszcze się spotkamy!',
  },
  {
    id: 'zwierzyniec-stamp',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Pieczęć Zwierzyńca trafia do waszego paszportu. Ruszamy w dalszą drogę!',
  },
])
