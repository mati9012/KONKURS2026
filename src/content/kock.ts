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
const CAMPAIGN = wiki('Kampania wrześniowa', 'Kampania_wrze%C5%9Bniowa')
const WESTERPLATTE = wiki('Obrona Westerplatte', 'Obrona_Westerplatte')
const BZURA = wiki('Bitwa nad Bzurą', 'Bitwa_nad_Bzur%C4%85')
const USSR = wiki('Agresja ZSRR na Polskę', 'Agresja_ZSRR_na_Polsk%C4%99')
const WARSAW = wiki('Obrona Warszawy (1939)', 'Obrona_Warszawy_(1939)')
const SGO = wiki(
  'Samodzielna Grupa Operacyjna „Polesie”',
  'Samodzielna_Grupa_Operacyjna_%E2%80%9EPolesie%E2%80%9D',
)
const KLEEBERG = wiki('Franciszek Kleeberg', 'Franciszek_Kleeberg')
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
    id: 'memory-campaign',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'Kampania wrześniowa trwała od 1 września do 6 października 1939 roku. Polska broniła się przed agresją III Rzeszy, a potem także ZSRR.',
    sources: [CAMPAIGN],
  },
  {
    id: 'memory-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Pomóżcie ułożyć pamiątki w gablotach. Przeciągnijcie każdą na właściwą datę na osi czasu.',
  },
])

export const EXHIBIT_IDS = [
  'charter',
  'palace-plan',
  'shako',
  'postcard',
  'map',
  'calendar',
  'armband',
  'order',
  'helmet',
  'ammo',
  'flag',
  'letter',
  'wreath',
  'key',
] as const
export type ExhibitId = (typeof EXHIBIT_IDS)[number]

export const EXHIBITS = z
  .array(
    z.object({
      id: z.enum(EXHIBIT_IDS),
      name: z.string().min(1),
      order: z.number().int(),
      when: z.string().min(1),
      label: z.string().min(1),
      sources: z.array(sourceSchema).min(1),
    }),
  )
  .parse([
    {
      id: 'charter',
      name: 'Akt lokacji miasta',
      order: 14170000,
      when: '1417',
      label: 'Kock zostaje miastem',
      sources: [TOWN],
    },
    {
      id: 'palace-plan',
      name: 'Projekt pałacu',
      order: 17790000,
      when: '1779',
      label: 'Przebudowa pałacu według projektu Zuga',
      sources: [PALACE],
    },
    {
      id: 'shako',
      name: 'Czapka strzelca konnego',
      order: 18090000,
      when: '1809',
      label: 'Pułkownik Berek Joselewicz ginie pod Kockiem',
      sources: [BEREK],
    },
    {
      id: 'postcard',
      name: 'Pocztówka z Westerplatte',
      order: 19390901,
      when: '1 IX 1939',
      label: 'Atak Niemiec. Westerplatte broni się przez 7 dni',
      sources: [CAMPAIGN, WESTERPLATTE],
    },
    {
      id: 'map',
      name: 'Mapa znad Bzury',
      order: 19390909,
      when: '9 IX 1939',
      label: 'Początek bitwy nad Bzurą, największej bitwy kampanii',
      sources: [BZURA],
    },
    {
      id: 'calendar',
      name: 'Kartka z kalendarza',
      order: 19390917,
      when: '17 IX 1939',
      label: 'Napaść ZSRR na Polskę',
      sources: [USSR],
    },
    {
      id: 'armband',
      name: 'Opaska obrońcy Warszawy',
      order: 19390928,
      when: '28 IX 1939',
      label: 'Kapitulacja Warszawy',
      sources: [WARSAW],
    },
    {
      id: 'order',
      name: 'Rozkaz o utworzeniu grupy',
      order: 19390911,
      when: '11 IX 1939',
      label: 'Powstaje Samodzielna Grupa Operacyjna „Polesie”',
      sources: [SGO],
    },
    {
      id: 'helmet',
      name: 'Hełm żołnierza SGO „Polesie”',
      order: 19391002,
      when: '2 X 1939',
      label: 'Początek bitwy pod Kockiem',
      sources: [BATTLE],
    },
    {
      id: 'ammo',
      name: 'Pusta skrzynka po amunicji',
      order: 19391005,
      when: '5 X 1939',
      label: 'Meldunek: kończy się amunicja',
      sources: [BATTLE],
    },
    {
      id: 'flag',
      name: 'Proporczyk kawalerii',
      order: 19391006,
      when: '6 X 1939',
      label: 'Kapitulacja. Ostatnia bitwa kampanii wrześniowej',
      sources: [BATTLE, SGO],
    },
    {
      id: 'letter',
      name: 'Fotografia generała Kleeberga',
      order: 19410405,
      when: '1941',
      label: 'Generał Kleeberg umiera w niewoli niemieckiej',
      sources: [KLEEBERG],
    },
    {
      id: 'wreath',
      name: 'Wieniec z grobu generała',
      order: 19691006,
      when: '1969',
      label: 'Prochy generała spoczywają w Kocku',
      sources: [KLEEBERG],
    },
    {
      id: 'key',
      name: 'Klucz do izby pamięci',
      order: 20121007,
      when: '2012',
      label: 'Otwarcie Wojskowej Izby Pamięci w Kocku',
      sources: [BATTLE],
    },
  ])

export const MEMORY_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      exhibits: z.array(z.enum(EXHIBIT_IDS)).min(2),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Dawny Kock',
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
      title: 'Wrzesień 1939',
      exhibits: ['postcard', 'map', 'calendar', 'armband'],
      facts: [
        {
          id: 'memory-2-westerplatte',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Westerplatte broniło się od 1 do 7 września 1939 roku. Komendantem składnicy był major Henryk Sucharski.',
          sources: [WESTERPLATTE],
        },
        {
          id: 'memory-2-bzura',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Bitwa nad Bzurą, toczona od 9 do 22 września, była największą bitwą kampanii wrześniowej.',
          sources: [BZURA],
        },
        {
          id: 'memory-2-ussr',
          speaker: 'koziol',
          gesture: 'think',
          text: '17 września 1939 roku na Polskę napadł także Związek Radziecki.',
          sources: [USSR],
        },
        {
          id: 'memory-2-warsaw',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Warszawa broniła się od 1 do 28 września. Gdy skapitulowała, broń złożyło 5 tysięcy oficerów oraz 97 tysięcy podoficerów i szeregowych.',
          sources: [WARSAW],
        },
      ],
    },
    {
      title: 'Bitwa pod Kockiem',
      exhibits: ['order', 'helmet', 'ammo', 'flag'],
      facts: [
        {
          id: 'memory-3-sgo',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Grupę „Polesie” utworzono 11 września 1939 roku. Należały do niej 50 Dywizja Piechoty „Brzoza” i 60 Dywizja Piechoty „Kobryń”, a potem też kawaleria.',
          sources: [SGO],
        },
        {
          id: 'memory-3-warsaw',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Generał Kleeberg poprowadził żołnierzy z odsieczą oblężonej Warszawie. Gdy stolica skapitulowała, ruszyli po amunicję do składów koło Dęblina.',
          sources: [SGO, BATTLE],
        },
        {
          id: 'memory-3-young',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Większość żołnierzy generała należała do młodego rocznika, bez doświadczenia bojowego. Losy bitwy rozstrzygnęły się w rejonie Woli Gułowskiej.',
          sources: [BATTLE],
        },
        {
          id: 'memory-3-ammo',
          speaker: 'koziol',
          gesture: 'talk',
          text: '5 października kwatermistrz zameldował, że zostało tylko 20 pocisków i zero amunicji do karabinów.',
          sources: [BATTLE],
        },
        {
          id: 'memory-3-last',
          speaker: 'koziol',
          gesture: 'think',
          text: '6 października grupa skapitulowała jako ostatnia regularna polska jednostka kampanii wrześniowej. Taktycznie bitwę wygrali Polacy, ale strategicznie zwyciężyli Niemcy.',
          sources: [SGO, BATTLE],
        },
        {
          id: 'memory-3-honour',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Generał Kleeberg powiedział wtedy: „Nic sobie nie mamy do zarzucenia. Zachowaliśmy honor żołnierski do końca”.',
          sources: [BATTLE],
        },
      ],
    },
    {
      title: 'Pamięć',
      exhibits: ['letter', 'wreath', 'key'],
      facts: [
        {
          id: 'memory-4-general',
          speaker: 'koziol',
          gesture: 'talk',
          text: 'Generał Franciszek Kleeberg złożył broń jako ostatni polski generał. Był odznaczony czterema klasami Orderu Virtuti Militari.',
          sources: [KLEEBERG],
        },
        {
          id: 'memory-4-death',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Zmarł w niewoli 5 kwietnia 1941 roku w Dreźnie. W 1969 roku jego prochy złożono na cmentarzu wojennym w Kocku.',
          sources: [KLEEBERG],
        },
        {
          id: 'memory-4-room',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Od 7 października 2012 roku w Kocku działa Wojskowa Izba Pamięci, a szkoła podstawowa nosi imię generała Kleeberga.',
          sources: [BATTLE],
        },
      ],
    },
  ])

export const MEMORY_HINTS = {
  start: 'Przeciągnijcie pamiątkę na właściwą datę na osi czasu.',
  wrong: 'To nie ta data. Przypomnijcie sobie, co już wiecie.',
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
