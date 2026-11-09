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

const REGION = wiki('Roztocze (kraina)', 'Roztocze_(kraina)')
const CZARTOWE_POLE = wiki('Rezerwat przyrody Czartowe Pole', 'Czartowe_Pole')
const SIEDLISKA = wiki('Siedliska (powiat tomaszowski)', 'Siedliska_(powiat_tomaszowski)')
const PARK = wiki('Roztoczański Park Narodowy', 'Roztocza%C5%84ski_Park_Narodowy')
const BUKOWA = wiki('Bukowa Góra (Roztocze)', 'Bukowa_G%C3%B3ra_(Roztocze)')
const TRACK = wiki('Trop (łowiectwo)', 'Trop_(%C5%82owiectwo)')
const WOLF = wiki('Wilk szary', 'Wilk_szary')
const DEER = wiki('Jeleń szlachetny', 'Jele%C5%84_szlachetny')
const BOAR = wiki('Dzik euroazjatycki', 'Dzik_euroazjatycki')
const BEAVER = wiki('Bóbr europejski', 'B%C3%B3br_europejski')
const OWL = wiki('Puszczyk uralski', 'Puszczyk_uralski')
const BEECH = wiki('Buk zwyczajny', 'Buk_zwyczajny')
const FIR = wiki('Jodła pospolita', 'Jod%C5%82a_pospolita')
const SYCAMORE = wiki('Klon jawor', 'Klon_jawor')
const YEW = wiki('Cis pospolity', 'Cis_pospolity')
const SPRUCE = wiki('Świerk pospolity', '%C5%9Awierk_pospolity')

const STONE_FOREST = sourceSchema.parse({
  title: 'The Polish Forest Where the Trees Have Turned to Stone, 3 Seas Europe',
  url: 'https://3seaseurope.com/stone-forest-siedliska/',
  accessedAt: ACCESSED,
})

const WOLF_COUNT = sourceSchema.parse({
  title: 'Coraz mniej rysi na Roztoczu, liczba wilków bez zmian, Radio Lublin',
  url: 'https://radio.lublin.pl/2024/02/coraz-mniej-rysi-na-roztoczu-liczba-wilkow-bez-zmian',
  accessedAt: ACCESSED,
})

const lines = z.array(dialogueLineSchema)

export const ROZTOCZE_ARRIVAL = lines.parse([
  {
    id: 'roztocze-arrival',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Witajcie na Roztoczu! Słońce już zachodzi, a z lasu dochodzą dziwne chichoty...',
  },
])

export const STONES_PROLOGUE = lines.parse([
  {
    id: 'stones-devil-feast',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Dziś w nocy wielka zabawa na Czartowym Polu! A wy nie przeszkadzajcie, bo zamienię was w kamień jak te drzewa!',
  },
  {
    id: 'stones-czartowe-pole',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Czartowe Pole to rezerwat nad rzeką Sopot. Nazwa pochodzi z legendy, że na tej polanie harcowały tylko czarty.',
    sources: [CZARTOWE_POLE],
  },
  {
    id: 'stones-name',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Samo Roztocze to pas wzgórz długi na około 180 kilometrów, od Kraśnika aż po Lwów. Nazwa pochodzi od gwarowego słowa „roztoka”, czyli dział wodny.',
    sources: [REGION],
  },
  {
    id: 'stones-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Jesteśmy w Kamiennym Lesie koło Siedlisk. Diabeł zakopał tu kawałki skamieniałego pnia. Odgarniajcie piasek z kopczyków i zbierajcie kamienne drewno, ale omijajcie czarcie węgle!',
  },
])

export const STONE_PIECES = z.array(z.object({ facts: lines.min(1) })).parse([
  {
    facts: [
      {
        id: 'stones-1-siedliska',
        speaker: 'koziol',
        gesture: 'cheer',
        text: 'Pierwszy kawałek! W Siedliskach jest największe w Polsce skupisko skamieniałych pni drzew z trzeciorzędu.',
        sources: [SIEDLISKA],
      },
      {
        id: 'stones-1-south',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Siedliska leżą w dolinie Prutnika. To najdalej na południe wysunięta wieś województwa lubelskiego.',
        sources: [SIEDLISKA],
      },
    ],
  },
  {
    facts: [
      {
        id: 'stones-2-cypress',
        speaker: 'koziol',
        gesture: 'present',
        text: 'Te kamienne pnie to nie nasze sosny, tylko cyprysy. Rosły tu od 12 do 16 milionów lat temu.',
        sources: [STONE_FOREST],
      },
      {
        id: 'stones-2-florida',
        speaker: 'koziol',
        gesture: 'think',
        text: 'Podobne drzewa rosną dziś na bagnach Florydy. Wyobraźcie sobie Roztocze pełne ciepłych mokradeł!',
        sources: [STONE_FOREST],
      },
    ],
  },
  {
    facts: [
      {
        id: 'stones-3-devil',
        speaker: 'diabel',
        gesture: 'angry',
        text: 'Ej! Te kamienie miały zostać pod ziemią! Pomieszam wam je z moimi węglami!',
      },
      {
        id: 'stones-3-silica',
        speaker: 'koziol',
        gesture: 'talk',
        text: 'Drzewa połamały się i przykrył je popiół wulkaniczny z gorącą wodą. Bez powietrza drewno nie zgniło, tylko powoli nasiąkało krzemionką i zamieniało się w kamień.',
        sources: [STONE_FOREST],
      },
    ],
  },
  {
    facts: [
      {
        id: 'stones-4-dlugosz',
        speaker: 'koziol',
        gesture: 'cheer',
        text: 'Cały pień złożony! Już Jan Długosz pisał, że drzewa koło Hrebennego po ścięciu zmieniają się w krzemień w kilka lat.',
        sources: [STONE_FOREST],
      },
      {
        id: 'stones-4-truth',
        speaker: 'koziol',
        gesture: 'think',
        text: 'Tak szybko to nie działa, potrzeba milionów lat. Ten kamienny las to jedno z największych skupisk skamieniałego drewna na świecie.',
        sources: [STONE_FOREST],
      },
      {
        id: 'stones-4-sea',
        speaker: 'koziol',
        gesture: 'present',
        text: 'A wzgórza Roztocza zbudowane są z margli, opok i wapieni. Część skał powstała na dnie płytkiego morza.',
        sources: [REGION],
      },
    ],
  },
])

export const STONE_HINTS = {
  start: 'Pocierajcie kopczyki piasku, żeby odsłonić, co jest pod spodem.',
  uncovered: 'Coś tu jest! Stuknijcie znalezisko, żeby je podnieść.',
  coal: 'Fuj, czarci węgiel! Prawdziwe skamieniałe drewno ma słoje jak pień.',
  piece: 'Pasuje do pnia! Szukajcie dalej.',
} as const

export const TRACKS_PROLOGUE = lines.parse([
  {
    id: 'tracks-devil-moon',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Noc zapadła! Zadepczę wszystkie tropy w lesie swoimi kopytami. Nikt się nie dowie, kto tu mieszka!',
  },
  {
    id: 'tracks-definition',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Trop to odcisk łap albo racic na miękkim podłożu. Wszystko inne, co zostawia zwierzę, na przykład ślady żerowania czy pióra, nazywamy śladem.',
    sources: [TRACK],
  },
  {
    id: 'tracks-count',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Pracownicy Roztoczańskiego Parku Narodowego liczą zwierzęta właśnie po tropach. Chodzą wyznaczonymi trasami po zaśnieżonych ścieżkach.',
    sources: [WOLF_COUNT],
  },
  {
    id: 'tracks-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Weźcie latarkę! Świećcie po lesie, a gdy znajdziecie trop albo ślad, stuknijcie go i powiedzcie, czyj jest. Tylko nie dajcie się nabrać na kopyta diabła!',
  },
])

export const ANIMAL_IDS = ['wolf', 'deer', 'boar', 'beaver', 'owl'] as const
export type AnimalId = (typeof ANIMAL_IDS)[number]

export const ANIMAL_NAMES: Record<AnimalId, string> = {
  wolf: 'Wilk',
  deer: 'Jeleń',
  boar: 'Dzik',
  beaver: 'Bóbr',
  owl: 'Puszczyk uralski',
}

export const TRACKS = z
  .array(
    z.object({
      animal: z.enum(ANIMAL_IDS),
      sign: z.string().min(1),
      clue: z.string().min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      animal: 'wolf',
      sign: 'Jedna prosta linia tropów',
      clue: 'Jedna równa linia dużych, psich tropów. Wygląda, jakby przeszło jedno zwierzę, ale to całe stado.',
      facts: [
        {
          id: 'tracks-wolf-line',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Wilki! Wataha idąca truchtem zostawia zwykle jeden ślad, bo wilki stąpają trop w trop. Mówi się na to „sznurowanie”.',
          sources: [WOLF],
        },
        {
          id: 'tracks-wolf-count',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'W 2024 roku w parku naliczono po tropach 11 dorosłych wilków z trzech rodzin. Na całym Roztoczu żyje ich do 30.',
          sources: [WOLF_COUNT],
        },
      ],
    },
    {
      animal: 'deer',
      sign: 'Drzewo z obtartą korą',
      clue: 'Kora obtarta wysoko na pniu, jakby ktoś drapał drzewo czymś twardym i rozłożystym.',
      facts: [
        {
          id: 'tracks-deer-paint',
          speaker: 'koziol',
          gesture: 'present',
          text: 'To jeleń! Byki ocierają się o drzewa, żeby pozbyć się pasożytów. Myśliwi mówią, że jelenie „malują”.',
          sources: [DEER],
        },
        {
          id: 'tracks-deer-night',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Jeleń zaczyna żerować po zmierzchu, a nad ranem wraca do kryjówki. Śpi tylko od 60 do 100 minut na dobę!',
          sources: [DEER],
        },
      ],
    },
    {
      animal: 'boar',
      sign: 'Zryta ziemia',
      clue: 'Ziemia przekopana, jakby ktoś orał ją nosem w poszukiwaniu jedzenia.',
      facts: [
        {
          id: 'tracks-boar-dig',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Dzik! Szuka jedzenia, przekopując ziemię wydłużonym ryjem i zdzierając wierzchnią warstwę gleby.',
          sources: [BOAR],
        },
        {
          id: 'tracks-boar-family',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Mama to locha, tata to odyniec, a młode to warchlaki. Malutki warchlak w paski to pasiak.',
          sources: [BOAR],
        },
      ],
    },
    {
      animal: 'beaver',
      sign: 'Ścięte drzewo nad strumieniem',
      clue: 'Pień nad wodą podgryziony zębami, a w strumieniu kopiec z gałęzi i mułu.',
      facts: [
        {
          id: 'tracks-beaver-biggest',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Bóbr, największy gryzoń Eurazji! Prowadzi nocny tryb życia i potrafi ściąć drzewo o średnicy nawet metra.',
          sources: [BEAVER],
        },
        {
          id: 'tracks-beaver-lodge',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Najbardziej charakterystyczne ślady bobrów to tamy i żeremia, czyli domki z gałęzi, darni i mułu.',
          sources: [BEAVER],
        },
      ],
    },
    {
      animal: 'owl',
      sign: 'Wypluwka pod drzewem',
      clue: 'Pod wysokim drzewem leży kłębek sierści i drobnych kosteczek, a z góry słychać głuche „hu hu”.',
      facts: [
        {
          id: 'tracks-owl-voice',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Puszczyk uralski! W Polsce jest bardzo rzadki, ale mieszka właśnie na Roztoczu. Odzywa się niemal wyłącznie w nocy.',
          sources: [OWL],
        },
        {
          id: 'tracks-owl-pellet',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Jego pohukiwanie słychać nawet z 2 kilometrów. A w jednej wypluwce są średnio szczątki czterech zjedzonych zwierzątek, na przykład norników i ryjówek.',
          sources: [OWL],
        },
      ],
    },
  ])

export const TRACK_HINTS = {
  start: 'Wodźcie latarką po lesie i szukajcie tropów i śladów.',
  found: 'Coś tu jest! Czyj to ślad?',
  wrong: 'Hmm, to nie pasuje. Przyjrzyjcie się jeszcze raz.',
  devil: 'Hehe, to moje kopyta! Diabeł próbuje was zmylić.',
  right: 'Zgadza się! Szukajcie dalej.',
} as const

export const FOREST_PROLOGUE = lines.parse([
  {
    id: 'forest-devil-seeds',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Już świta?! Zanim uciekniemy z Czartowego Pola, rozrzucę nasiona i szyszki po całej Bukowej Górze. Niech drzewa się poplączą!',
  },
  {
    id: 'forest-bukowa',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Bukowa Góra ma 310 metrów i leży w obszarze ochrony ścisłej Roztoczańskiego Parku Narodowego. Rezerwat powstał tu już w latach 30. XX wieku.',
    sources: [BUKOWA, PARK],
  },
  {
    id: 'forest-percent',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'To najbardziej zalesiony park narodowy w Polsce. Lasy pokrywają aż 95,5 procent jego powierzchni.',
    sources: [PARK],
  },
  {
    id: 'forest-how',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Oddajmy drzewom ich nasiona i szyszki! Popatrzcie na znalezisko i stuknijcie drzewo, z którego spadło. Z każdym trafieniem słońce wzejdzie wyżej.',
  },
])

export const TREE_IDS = ['beech', 'fir', 'sycamore', 'yew', 'spruce'] as const
export type TreeId = (typeof TREE_IDS)[number]

export const TREE_NAMES: Record<TreeId, string> = {
  beech: 'Buk',
  fir: 'Jodła',
  sycamore: 'Jawor',
  yew: 'Cis',
  spruce: 'Świerk',
}

export const FOREST_FINDS = z
  .array(
    z.object({
      tree: z.enum(TREE_IDS),
      item: z.string().min(1),
      clue: z.string().min(1),
      wrong: z.string().min(1),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      tree: 'beech',
      item: 'Trójgraniaste brązowe orzeszki',
      clue: 'Brązowe, trójgraniaste orzeszki. Spadły z drzewa o gładkiej, popielatej korze.',
      wrong: 'Szukajcie drzewa z gładką, szarą korą i liśćmi, nie igłami.',
      facts: [
        {
          id: 'forest-beech-nut',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'To buk! Jego orzeszki to bukiew. Kora buka jest gładka i popielatoszara, nigdy nie pęka i się nie łuszczy.',
          sources: [BEECH],
        },
        {
          id: 'forest-beech-age',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Buk może żyć ponad 400 lat. Jego nasiona kiełkują tylko wtedy, gdy przykryje je leśna ściółka.',
          sources: [BEECH],
        },
      ],
    },
    {
      tree: 'fir',
      item: 'Sama oś szyszki',
      clue: 'Goły patyczek, czyli oś szyszki. Ta szyszka stała na gałęzi jak świeczka i rozpadła się na drzewie.',
      wrong: 'Szyszki tego drzewa stoją na gałęziach, a nie zwisają.',
      facts: [
        {
          id: 'forest-fir-cone',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Jodła! Jej szyszki stoją na gałęziach, a po dojrzeniu rozpadają się i zostaje sama oś.',
          sources: [FIR],
        },
        {
          id: 'forest-fir-needles',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Igły jodły są tępe, a od spodu mają dwa białe paski. Najwyższa jodła w Polsce mierzy prawie 56 metrów!',
          sources: [FIR],
        },
      ],
    },
    {
      tree: 'sycamore',
      item: 'Orzeszki ze skrzydełkami',
      clue: 'Para orzeszków ze skrzydełkami, które wirują jak śmigiełko. Spadły z drzewa o pięcioklapowych liściach.',
      wrong: 'Szukajcie drzewa z dużymi liśćmi o pięciu klapach.',
      facts: [
        {
          id: 'forest-sycamore-seed',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Jawor! Jego owoce to orzeszki ze skrzydełkami, które dojrzewają we wrześniu i październiku.',
          sources: [SYCAMORE],
        },
        {
          id: 'forest-sycamore-age',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Jawor ma liście z pięcioma klapami, dorasta do 40 metrów i może żyć nawet 500 lat.',
          sources: [SYCAMORE],
        },
      ],
    },
    {
      tree: 'yew',
      item: 'Czerwona osnówka z nasionkiem',
      clue: 'Czerwony kubeczek z nasionkiem w środku. To drzewo nie ma szyszek, a jego igły są miękkie.',
      wrong: 'Szukajcie ciemnego drzewa z miękkimi igłami i czerwonymi owockami.',
      facts: [
        {
          id: 'forest-yew-aril',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Cis! Nie ma szyszek, a nasionko otacza czerwona osnówka. Uwaga: cis jest trujący, poza samą osnówką.',
          sources: [YEW],
        },
        {
          id: 'forest-yew-age',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Cis żyje ponad tysiąc lat. Najstarszy w Polsce, cis Henrykowski, ma około 1300 lat.',
          sources: [YEW],
        },
      ],
    },
    {
      tree: 'spruce',
      item: 'Długa, cała szyszka',
      clue: 'Długa, gładka szyszka, która spadła w całości. Na drzewie takie szyszki zwisają w dół.',
      wrong: 'Szukajcie drzewa, z którego szyszki zwisają w dół.',
      facts: [
        {
          id: 'forest-spruce-cone',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Świerk! Jego szyszki zwisają i opadają w całości. Igły są krótkie, ostre i kwadratowe w przekroju.',
          sources: [SPRUCE],
        },
        {
          id: 'forest-border',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Przez Roztocze przebiega granica zasięgu jodły, buka, jawora, świerka i cisu. Dlatego spotkacie je tu wszystkie razem.',
          sources: [PARK],
        },
      ],
    },
  ])

export const FOREST_HINTS = {
  start: 'Popatrzcie na znalezisko i stuknijcie drzewo, z którego spadło.',
  right: 'Trafione! Słońce wschodzi coraz wyżej.',
} as const

export const ROZTOCZE_OUTRO = lines.parse([
  {
    id: 'roztocze-sunrise',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Wschód słońca nad Bukową Górą! Kamienny pień złożony, tropy policzone, a drzewa odzyskały nasiona. Brawo!',
  },
  {
    id: 'roztocze-mill',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Jeśli kiedyś zajrzycie na Czartowe Pole, zobaczycie ruiny dawnej papierni Zamoyskich i wodospady na rzece Sopot.',
    sources: [CZARTOWE_POLE],
  },
  {
    id: 'roztocze-devil-flees',
    speaker: 'diabel',
    gesture: 'angry',
    text: 'Aaa, słońce! Czarty, uciekamy z polany! Jeszcze tu wrócimy...',
  },
  {
    id: 'roztocze-stamp',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Pieczęć Roztocza trafia do waszego paszportu. Ruszamy dalej!',
  },
])
