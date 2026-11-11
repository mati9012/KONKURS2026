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

const TOWN = wiki('Kazimierz Dolny', 'Kazimierz_Dolny')
const HOUSES = wiki('Kamienice Przybyłów', 'Kamienice_Przyby%C5%82%C3%B3w')
const RAFTING = wiki('Flisactwo', 'Flisactwo')
const GRANARY = wiki('Spichlerz', 'Spichlerz')
const LOESS = wiki('Less', 'Less')
const RAVINE = wiki('Wąwóz', 'W%C4%85w%C3%B3z')
const BAKERY = sourceSchema.parse({
  title: 'Zmarł Cezary Sarzyński, KazimierzDolny.pl',
  url: 'https://www.kazimierzdolny.pl/amp/zmarl-cezary-sarzynski.html',
  accessedAt: ACCESSED,
})

const lines = z.array(dialogueLineSchema)

export const KAZIMIERZ_ARRIVAL = lines.parse([
  {
    id: 'kazimierz-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie w Kazimierzu Dolnym nad Wisłą! Miasto leży w Małopolskim Przełomie Wisły. Pomoże nam dziś kazimierski kogucik.',
    sources: [TOWN],
  },
])

export const CRANE_PROLOGUE = lines.parse([
  {
    id: 'crane-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Kazimierz wzbogacił się na zbożu? To ja zatrzymam statki i ziarno nigdy nie dopłynie do Gdańska!',
  },
  {
    id: 'crane-trade',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Od XVI do XVII wieku miasto bogaciło się na handlu zbożem spławianym Wisłą do Gdańska.',
    sources: [TOWN],
  },
  {
    id: 'crane-granary',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Ziarno czekało w spichlerzach, czyli budynkach do przechowywania zboża.',
    sources: [GRANARY],
  },
  {
    id: 'crane-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Żuraw trzyma worek zboża. Stuknijcie albo naciśnijcie spację, gdy statek będzie pod workiem!',
  },
])

export const CRANE_ROUNDS = z
  .array(
    z.object({
      sacks: z.number().int().min(1),
      speed: z.number().positive(),
      capacity: z.number().int().min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      sacks: 4,
      speed: 150,
      capacity: 2,
      facts: [
        {
          id: 'crane-1-families',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwsze statki płyną! Na handlu zbożem wyrosły kupieckie rody Przybyłów, Czarnotów i Celejów.',
          sources: [TOWN],
        },
        {
          id: 'crane-1-zuraw',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Jeden z kazimierskich spichlerzy nazywa się „Pod Żurawiem”. Pochodzi z drugiej połowy XVII wieku.',
          sources: [TOWN],
        },
      ],
    },
    {
      sacks: 5,
      speed: 200,
      capacity: 2,
      facts: [
        {
          id: 'crane-2-boats',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Zboże pływało m.in. na specjalnych statkach zwanych komięgami, a drewno spławiano jako tratwy.',
          sources: [RAFTING],
        },
        {
          id: 'crane-2-people',
          speaker: 'koziol',
          gesture: 'present',
          text: 'W pierwszej połowie XVII wieku flisactwem na Wiśle zajmowało się od 5 do 28 tysięcy osób.',
          sources: [RAFTING],
        },
      ],
    },
    {
      sacks: 6,
      speed: 220,
      capacity: 3,
      facts: [
        {
          id: 'crane-3-unesco',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'W 2022 roku tradycję flisacką wpisano na listę niematerialnego dziedzictwa ludzkości UNESCO.',
          sources: [RAFTING],
        },
        {
          id: 'crane-3-fire',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Złoty wiek Kazimierza skończył się w 1656 roku, gdy wojska szwedzkie spaliły miasto i zamek.',
          sources: [TOWN],
        },
      ],
    },
  ])

export const CRANE_HINTS = {
  start: 'Stuknijcie albo naciśnijcie spację, gdy statek będzie pod workiem.',
  miss: 'Plusk! Worek wpadł do Wisły. Puśćcie go trochę wcześniej.',
  good: 'Worek na pokładzie!',
} as const

export const HOUSE_IDS = ['mikolaj', 'krzysztof'] as const
export type HouseId = (typeof HOUSE_IDS)[number]

export const HOUSE_NAMES: Record<HouseId, string> = {
  mikolaj: 'Pod Świętym Mikołajem',
  krzysztof: 'Pod Świętym Krzysztofem',
}

export const ORNAMENT_KINDS = ['bishop', 'giant', 'pensive', 'attic', 'arcade'] as const
export type OrnamentKind = (typeof ORNAMENT_KINDS)[number]

export const FACADE_PROLOGUE = lines.parse([
  {
    id: 'facade-brothers',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Na rynku stoją kamienice braci Mikołaja i Krzysztofa Przybyłów. Bracia przebudowali je w stylu renesansowym i skończyli prace w 1615 roku.',
    sources: [HOUSES],
  },
  {
    id: 'facade-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'A ja pozrywałem z nich wszystkie ozdoby! Hehe, teraz to zwykłe szare domy!',
  },
  {
    id: 'facade-how',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Przeciągnijcie ozdoby na właściwe miejsca na fasadach. Czytajcie opisy na kartach.',
  },
])

export const FACADE_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      pieces: z
        .array(
          z.object({
            id: z.string().min(1),
            kind: z.enum(ORNAMENT_KINDS),
            label: z.string().min(1),
            house: z.enum(HOUSE_IDS).optional(),
          }),
        )
        .min(2),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Płaskorzeźby',
      pieces: [
        { id: 'bishop', kind: 'bishop', label: 'Biskup z pastorałem', house: 'mikolaj' },
        {
          id: 'giant',
          kind: 'giant',
          label: 'Olbrzym z Dzieciątkiem na ramieniu',
          house: 'krzysztof',
        },
        { id: 'pensive', kind: 'pensive', label: 'Chrystus Frasobliwy', house: 'krzysztof' },
      ],
      facts: [
        {
          id: 'facade-1-patrons',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Płaskorzeźby przedstawiają patronów właścicieli: św. Mikołaja w stroju biskupim i św. Krzysztofa, który przenosi Dzieciątko przez rzekę.',
          sources: [HOUSES],
        },
        {
          id: 'facade-1-pensive',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Figurka Chrystusa Frasobliwego na kamienicy św. Krzysztofa przypomina rzeźby z przydrożnych kapliczek.',
          sources: [HOUSES],
        },
      ],
    },
    {
      title: 'Attyki i podcienia',
      pieces: [
        { id: 'attic-1', kind: 'attic', label: 'Wysoka attyka' },
        { id: 'attic-2', kind: 'attic', label: 'Wysoka attyka' },
        { id: 'arcade-1', kind: 'arcade', label: 'Trzy arkady podcieni' },
        { id: 'arcade-2', kind: 'arcade', label: 'Trzy arkady podcieni' },
      ],
      facts: [
        {
          id: 'facade-2-attic',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Fasady wieńczą wysokie attyki. Kryją strome dachy, które odprowadzają deszcz w stronę podwórza.',
          sources: [HOUSES],
        },
        {
          id: 'facade-2-stone',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Kamienice zbudowano prawdopodobnie z wapienia z miejscowych kamieniołomów. Ich architektura nawiązuje do renesansu włoskiego i niderlandzkiego.',
          sources: [HOUSES],
        },
      ],
    },
  ])

export const FACADE_HINTS = {
  start: 'Przeciągnijcie ozdobę na świecące miejsce na fasadzie.',
  wrong: 'To nie to miejsce. Przeczytajcie opis na karcie jeszcze raz.',
  good: 'Pasuje!',
} as const

export const GORGE_PROLOGUE = lines.parse([
  {
    id: 'gorge-devil',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Statki popłynęły, kamienice błyszczą? To zgubicie się w wąwozach! Pozasypuję wam przejścia lessem!',
  },
  {
    id: 'gorge-ravines',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Wokół Kazimierza jest wiele wąwozów lessowych. Jednym z nich jest Korzeniowy Dół.',
    sources: [TOWN, RAVINE],
  },
  {
    id: 'gorge-how',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Na każdym rozwidleniu zadam wam pytanie. Każde przejście ma inną odpowiedź. Wybierzcie dobrą, a kogucik znajdzie drogę. Zła odpowiedź prowadzi pod osuwisko.',
  },
])

const forkSchema = z
  .object({
    question: z.string().min(1),
    answers: z.array(z.string().min(1)).min(2),
    correctIndex: z.number().int().nonnegative(),
    fact: z.string().min(1),
    sources: z.array(sourceSchema).min(1),
  })
  .refine((fork) => fork.correctIndex < fork.answers.length, {
    message: 'correctIndex poza zakresem odpowiedzi',
    path: ['correctIndex'],
  })

export const GORGE_LEGS = z
  .array(
    z.object({
      title: z.string().min(1),
      forks: z.array(forkSchema).min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Wejście do wąwozu',
      forks: [
        {
          question: 'Co przyniosło pył, z którego powstał less?',
          answers: ['Wiatr', 'Fale morskie', 'Wybuch wulkanu'],
          correctIndex: 0,
          fact: 'Tak! Less naniósł wiatr w czasach suchego klimatu.',
          sources: [LOESS],
        },
        {
          question: 'Jaki kolor ma najczęściej less?',
          answers: ['Żółtawoszary albo jasnożółty', 'Czerwony', 'Czarny'],
          correctIndex: 0,
          fact: 'Zgadza się! Spójrzcie na żółte ściany wąwozu.',
          sources: [LOESS],
        },
        {
          question: 'Co robi less, gdy jest suchy?',
          answers: [
            'Pęka i tworzy pionowe urwiska',
            'Topi się jak lód',
            'Zamienia się w piasek morski',
          ],
          correctIndex: 0,
          fact: 'Właśnie! Suchy less pęka i tworzy pionowe urwiska.',
          sources: [LOESS],
        },
      ],
      facts: [
        {
          id: 'gorge-1-loess',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Pierwszy wąwóz za nami! Less to pylasta skała osadowa, złożona głównie z drobniutkich ziarenek kwarcu.',
          sources: [LOESS],
        },
      ],
    },
    {
      title: 'Głęboki parów',
      forks: [
        {
          question: 'Czym jest wąwóz?',
          answers: [
            'Głęboką, suchą doliną o stromych zboczach',
            'Jeziorem w górach',
            'Jaskinią pod ziemią',
          ],
          correctIndex: 0,
          fact: 'Brawo! Wąwóz ma strome zbocza i wąskie, płaskie dno.',
          sources: [RAVINE],
        },
        {
          question: 'Co żłobi wąwozy w lessie?',
          answers: ['Woda, która płynie tylko czasami', 'Krety', 'Ludzie z łopatami'],
          correctIndex: 0,
          fact: 'Dobrze! Wąwozy powstają przez erozję wód okresowych.',
          sources: [RAVINE],
        },
        {
          question: 'Na jakiej części województwa lubelskiego są wąwozy?',
          answers: ['Na około 20% powierzchni', 'Na około 90% powierzchni', 'Nie ma ich wcale'],
          correctIndex: 0,
          fact: 'Tak! Wąwozy zajmują około jednej piątej województwa.',
          sources: [RAVINE],
        },
      ],
      facts: [
        {
          id: 'gorge-2-ravine',
          speaker: 'koziol',
          gesture: 'think',
          text: 'W Polsce wąwozy najczęściej występują na obszarach lessowych.',
          sources: [RAVINE],
        },
      ],
    },
    {
      title: 'Ku wyjściu',
      forks: [
        {
          question: 'Jak nazywa się słynny wąwóz koło Kazimierza?',
          answers: ['Korzeniowy Dół', 'Dolina Kościeliska', 'Morskie Oko'],
          correctIndex: 0,
          fact: 'Tak! Korzeniowy Dół to jeden z wąwozów lessowych koło Kazimierza.',
          sources: [RAVINE],
        },
        {
          question: 'Co budowano w wąwozach pod koniec XIX wieku?',
          answers: ['Wille i pensjonaty dla letników', 'Spichlerze na zboże', 'Kopalnie złota'],
          correctIndex: 0,
          fact: 'Zgadza się! Przyjeżdżali tu letnicy, głównie z Lublina i Warszawy.',
          sources: [TOWN],
        },
        {
          question: 'Kiedy utworzono Kazimierski Park Krajobrazowy?',
          answers: ['W 1979 roku', 'W 1406 roku', 'W 2022 roku'],
          correctIndex: 0,
          fact: 'Brawo! Park utworzono 27 kwietnia 1979 roku.',
          sources: [TOWN],
        },
      ],
      facts: [
        {
          id: 'gorge-3-exit',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Wyszliśmy z labiryntu wąwozów! Diabeł nie zdołał nas zasypać.',
        },
      ],
    },
  ])

export const GORGE_HINTS = {
  start: 'Przeczytajcie pytanie i wybierzcie przejście z dobrą odpowiedzią.',
  wrong: 'Osuwisko! To przejście zasypał less. Wracamy i próbujemy inaczej.',
} as const

export const KAZIMIERZ_OUTRO = lines.parse([
  {
    id: 'kazimierz-done',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Statki dopłynęły, kamienice odzyskały ozdoby, a wąwóz przeszliśmy bez szwanku. Kogucik pieje z radości!',
  },
  {
    id: 'kazimierz-rooster',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Koguty z ciasta stały się symbolem Kazimierza. Piekarnia Sarzyńskich działa tu od 1915 roku.',
    sources: [BAKERY],
  },
  {
    id: 'kazimierz-1406',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'A miasto lokował na prawie magdeburskim król Władysław Jagiełło w 1406 roku.',
    sources: [TOWN],
  },
])
