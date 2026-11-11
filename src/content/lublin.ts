import { z } from 'zod'
import { dialogueLineSchema, sourceSchema } from '@/content/schema'

const ACCESSED = '2026-11-11'

function wiki(title: string, path: string, accessedAt = ACCESSED) {
  return sourceSchema.parse({
    title: `${title}, Wikipedia`,
    url: `https://pl.wikipedia.org/wiki/${path}`,
    accessedAt,
  })
}

const ARMS = wiki('Herb Lublina', 'Herb_Lublina')
const KRAKOWSKA = wiki('Brama Krakowska w Lublinie', 'Brama_Krakowska_w_Lublinie')
const GRODZKA = wiki('Brama Grodzka w Lublinie', 'Brama_Grodzka_w_Lublinie')
const TRYNITARSKA = wiki('Wieża Trynitarska w Lublinie', 'Wie%C5%BCa_Trynitarska_w_Lublinie')
const MARKET = wiki('Rynek w Lublinie', 'Rynek_w_Lublinie')
const TRIBUNAL = wiki(
  'Trybunał Główny Koronny w Lublinie',
  'Trybuna%C5%82_G%C5%82%C3%B3wny_Koronny_w_Lublinie',
)
const CHAPEL = wiki(
  'Kaplica Trójcy Świętej w Lublinie',
  'Kaplica_Tr%C3%B3jcy_%C5%9Awi%C4%99tej_w_Lublinie',
)
const PAW = wiki('Czarcia Łapa', 'Czarcia_%C5%81apa')
const ZAMOSC = sourceSchema.parse({
  title: 'Old City of Zamość, UNESCO World Heritage Centre',
  url: 'https://whc.unesco.org/en/list/564/',
  accessedAt: '2026-11-08',
})
const SIEVES = wiki('Sitarstwo', 'Sitarstwo', '2026-11-09')
const CHELM = wiki('Chełm', 'Che%C5%82m')
const PULAWY = wiki('Puławy', 'Pu%C5%82awy', '2026-11-10')
const WLODAWA = wiki('Włodawa', 'W%C5%82odawa', '2026-11-10')
const TURTLE = wiki('Żółw błotny', '%C5%BB%C3%B3%C5%82w_b%C5%82otny', '2026-11-10')

const lines = z.array(dialogueLineSchema)

export const LUBLIN_ARRIVAL = lines.parse([
  {
    id: 'lublin-arrival',
    speaker: 'koziol',
    gesture: 'wave',
    text: 'Witajcie w Lublinie, w moim domu! Srebrny kozioł z herbu miasta wspina się na zielony krzak winny. Poznajecie?',
    sources: [ARMS],
  },
])

export const CHASE_PROLOGUE = lines.parse([
  {
    id: 'chase-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Hehe! Dziesięć pieczęci, a wszystkie fałszywe! O północy sam zasiądę w Trybunale i wydam wyrok. Złapcie mnie, jeśli umiecie!',
  },
  {
    id: 'chase-koziol',
    speaker: 'koziol',
    gesture: 'angry',
    text: 'Ucieka przez Stare Miasto! Na każdym skrzyżowaniu przeczytajcie wskazówkę i wybierzcie drogę do właściwego zabytku.',
  },
])

export const CHASE_STOP_IDS = [
  'krakowska',
  'trynitarska',
  'rynek',
  'trybunal',
  'grodzka',
  'zamek',
] as const

export type ChaseStopId = (typeof CHASE_STOP_IDS)[number]

export const CHASE_STOP_NAMES: Record<ChaseStopId, string> = {
  krakowska: 'Brama Krakowska',
  trynitarska: 'Wieża Trynitarska',
  rynek: 'Rynek',
  trybunal: 'Trybunał Koronny',
  grodzka: 'Brama Grodzka',
  zamek: 'Zamek Lubelski',
}

const stopSchema = z.object({
  id: z.enum(CHASE_STOP_IDS),
  clue: z.string().min(1),
  options: z.array(z.enum(CHASE_STOP_IDS)).length(3),
  fact: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
})

export const CHASE_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      stops: z.array(stopSchema).length(3),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Przez bramę do miasta',
      stops: [
        {
          id: 'krakowska',
          clue: 'Diabeł pobiegł do bramy, którą stare księgi miejskie nazywały Bramą Wyższą.',
          options: ['grodzka', 'krakowska', 'trynitarska'],
          fact: 'To Brama Krakowska! Powstała około połowy XIV wieku razem z murami miejskimi, po najeździe Tatarów w 1341 roku.',
          sources: [KRAKOWSKA],
        },
        {
          id: 'trynitarska',
          clue: 'Wdrapał się na najwyższy zabytkowy punkt Lublina.',
          options: ['trynitarska', 'zamek', 'trybunal'],
          fact: 'Wieża Trynitarska! Z jej tarasu widokowego, 40 metrów nad ziemią, widać całe miasto.',
          sources: [TRYNITARSKA],
        },
        {
          id: 'rynek',
          clue: 'Uciekł na plac w kształcie trapezu, z którego wychodzi sześć ulic.',
          options: ['zamek', 'grodzka', 'rynek'],
          fact: 'Rynek Starego Miasta! Wytyczono go w 1317 roku, gdy Lublin dostał prawo magdeburskie.',
          sources: [MARKET],
        },
      ],
      facts: [
        {
          id: 'chase-gate-music',
          speaker: 'koziol',
          gesture: 'present',
          text: 'W XVI wieku Brama Krakowska miała ganki dla trębaczy i muzyków oraz zegar miejski. Dziś mieści się w niej Muzeum Historii Miasta Lublina.',
          sources: [KRAKOWSKA],
        },
        {
          id: 'chase-devil-hide',
          speaker: 'diabel',
          gesture: 'laugh',
          text: 'Nie złapiecie mnie! Znam tu każdą bramę i każdą piwnicę!',
        },
      ],
    },
    {
      title: 'W stronę zamku',
      stops: [
        {
          id: 'trybunal',
          clue: 'Schował się w dawnym ratuszu, w którym od 1578 roku sądzono szlachtę z Małopolski.',
          options: ['trybunal', 'krakowska', 'trynitarska'],
          fact: 'To Trybunał Koronny, najwyższy sąd dla szlachty z Małopolski. Klasycystyczny wygląd nadał mu Dominik Merlini.',
          sources: [TRIBUNAL],
        },
        {
          id: 'grodzka',
          clue: 'Przebiegł przez bramę nazywaną też Żydowską.',
          options: ['rynek', 'grodzka', 'krakowska'],
          fact: 'Brama Grodzka prowadziła ze Starego Miasta do dzielnicy żydowskiej. Dziś działa w niej Ośrodek „Brama Grodzka – Teatr NN”.',
          sources: [GRODZKA],
        },
        {
          id: 'zamek',
          clue: 'Pognał na wzgórze, gdzie za Kazimierza Wielkiego zbudowano kaplicę.',
          options: ['trynitarska', 'rynek', 'zamek'],
          fact: 'Diabeł wpadł do Kaplicy Trójcy Świętej na zamku! Zbudowano ją między 1341 a 1370 rokiem.',
          sources: [CHAPEL],
        },
      ],
      facts: [
        {
          id: 'chase-chapel',
          speaker: 'koziol',
          gesture: 'think',
          text: 'W tej kaplicy są wyjątkowe freski w stylu rusko-bizantyjskim. Ufundował je król Władysław Jagiełło.',
          sources: [CHAPEL],
        },
      ],
    },
  ])

export const CHASE_HINTS = {
  start: 'Którędy uciekł diabeł?',
  wrong: 'Pudło! Diabeł chichocze za rogiem. Przeczytajcie wskazówkę jeszcze raz.',
} as const

export const FRESCO_PROLOGUE = lines.parse([
  {
    id: 'fresco-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'Za późno! Zamazałem wszystkie freski sadzą. Nikt już nie zobaczy, co tu namalowano!',
  },
  {
    id: 'fresco-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Weźmy pędzel! Przecierajcie ścianę myszką albo palcem, aż sadza zejdzie. Potem wskażcie scenę, o którą zapytam.',
  },
])

export const FRESCO_SCENE_IDS = [
  'majestat',
  'duch',
  'aniolowie',
  'zwiastowanie',
  'krol',
  'tablica',
] as const

export type FrescoSceneId = (typeof FRESCO_SCENE_IDS)[number]

const sceneSchema = z.object({
  id: z.enum(FRESCO_SCENE_IDS),
  label: z.string().min(1),
  prompt: z.string().min(1),
  fact: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
})

export const FRESCO_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      scenes: z.array(sceneSchema).length(3),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Sklepienie kaplicy',
      scenes: [
        {
          id: 'majestat',
          label: 'Chrystus w majestacie',
          prompt: 'Wskażcie Chrystusa w majestacie.',
          fact: 'Chrystusa w majestacie namalowano w najwyższej części sklepienia. Freski układają się według hierarchii, od nieba aż do spraw ziemskich.',
          sources: [CHAPEL],
        },
        {
          id: 'duch',
          label: 'Duch Święty',
          prompt: 'Wskażcie Ducha Świętego.',
          fact: 'Ducha Świętego też umieszczono wysoko na sklepieniu, obok Chrystusa i aniołów.',
          sources: [CHAPEL],
        },
        {
          id: 'aniolowie',
          label: 'Aniołowie',
          prompt: 'Wskażcie aniołów.',
          fact: 'Aniołów, proroków i świętych malował Cyryl. Jego postacie patrzą prosto na widza.',
          sources: [CHAPEL],
        },
      ],
      facts: [
        {
          id: 'fresco-team',
          speaker: 'koziol',
          gesture: 'present',
          text: 'Freski namalował zespół ruskich malarzy pod kierunkiem mistrza Andrzeja. Używali naturalnych barwników, takich jak malachit, azuryt i węgiel drzewny.',
          sources: [CHAPEL],
        },
      ],
    },
    {
      title: 'Ściany kaplicy',
      scenes: [
        {
          id: 'zwiastowanie',
          label: 'Zwiastowanie',
          prompt: 'Wskażcie scenę Zwiastowania: anioł przynosi Maryi dobrą nowinę.',
          fact: 'Scenę Zwiastowania namalował Cyryl, ten sam malarz, który malował aniołów.',
          sources: [CHAPEL],
        },
        {
          id: 'krol',
          label: 'Król Władysław Jagiełło',
          prompt: 'Wskażcie króla, który ufundował freski.',
          fact: 'W kaplicy są dwa portrety króla Władysława Jagiełły, fundatora fresków.',
          sources: [CHAPEL],
        },
        {
          id: 'tablica',
          label: 'Napis fundacyjny',
          prompt: 'Wskażcie napis fundacyjny zapisany cyrylicą.',
          fact: 'Napis fundacyjny cyrylicą mówi, że malowidła ukończono w 1418 roku. Widnieje na nim imię mistrza Andrzeja.',
          sources: [CHAPEL],
        },
      ],
      facts: [
        {
          id: 'fresco-plaster',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Diabeł nie był pierwszy! W XIX wieku kaplicę otynkowano i freski zniknęły. W 1899 roku Józef Smoliński odkrył ich fragmenty.',
          sources: [CHAPEL],
        },
        {
          id: 'fresco-restored',
          speaker: 'koziol',
          gesture: 'cheer',
          text: 'Renowację fresków zakończono w 1997 roku. A teraz szybko do Trybunału, zanim wybije północ!',
          sources: [CHAPEL],
        },
      ],
    },
  ])

export const FRESCO_HINTS = {
  rub: 'Przecierajcie ścianę, aż zejdzie sadza.',
  wrong: 'To nie ta scena. Przyjrzyjcie się jeszcze raz!',
} as const

export const TRIAL_PROLOGUE = lines.parse([
  {
    id: 'trial-legend',
    speaker: 'koziol',
    gesture: 'think',
    text: 'Według legendy w 1637 roku w tym Trybunale skrzywdzono wdowę. Zawołała wtedy, że diabły wydałyby sprawiedliwszy wyrok.',
    sources: [PAW],
  },
  {
    id: 'trial-devil',
    speaker: 'diabel',
    gesture: 'laugh',
    text: 'I wydam! Jest północ, ja tu sędziuję. Wasza wyprawa to same kłamstwa, a pieczęcie są fałszywe!',
  },
  {
    id: 'trial-how',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Mamy dowody z całej wyprawy! Gdy diabeł skłamie, przeciągnijcie na stół sędziowski dowód, który go obala.',
  },
])

export const TRIAL_EVIDENCE_IDS = [
  'morando',
  'sito',
  'kreda',
  'sybilla',
  'swiatynie',
  'zolw',
] as const

export type TrialEvidenceId = (typeof TRIAL_EVIDENCE_IDS)[number]

const chargeSchema = z.object({
  id: z.enum(TRIAL_EVIDENCE_IDS),
  label: z.string().min(1),
  lie: z.string().min(1),
  fact: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
})

export const TRIAL_ROUNDS = z
  .array(
    z.object({
      title: z.string().min(1),
      charges: z.array(chargeSchema).length(3),
      facts: lines.min(1),
    }),
  )
  .parse([
    {
      title: 'Pierwsza rozprawa',
      charges: [
        {
          id: 'morando',
          label: 'Plan Bernarda Morando',
          lie: 'Zamość? Narysował go byle kto, bez żadnego planu!',
          fact: 'Fałsz! Zamość zaprojektował Bernardo Morando, architekt z Padwy, jako renesansowe miasto idealne.',
          sources: [ZAMOSC],
        },
        {
          id: 'sito',
          label: 'Sito z Biłgoraja',
          lie: 'W Biłgoraju nikt nigdy nie zrobił ani jednego sita!',
          fact: 'Fałsz! W dawnej Polsce to Biłgoraj był głównym ośrodkiem sitarstwa.',
          sources: [SIEVES],
        },
        {
          id: 'kreda',
          label: 'Bryła chełmskiej kredy',
          lie: 'Pod Chełmem nie ma żadnych podziemi, to zwykła piwnica!',
          fact: 'Fałsz! Pod Chełmem ciągną się jedyne w Europie podziemia kredowe.',
          sources: [CHELM],
        },
      ],
      facts: [
        {
          id: 'trial-devil-angry',
          speaker: 'diabel',
          gesture: 'angry',
          text: 'Grrr! Szczęście początkującego! Ale teraz was zagnę!',
        },
      ],
    },
    {
      title: 'Druga rozprawa',
      charges: [
        {
          id: 'sybilla',
          label: 'Klucz do Świątyni Sybilli',
          lie: 'W Puławach nie było nigdy żadnego muzeum!',
          fact: 'Fałsz! W 1801 roku księżna Izabela Czartoryska założyła w Świątyni Sybilli pierwsze w Polsce muzeum.',
          sources: [PULAWY],
        },
        {
          id: 'swiatynie',
          label: 'Rysunek trzech świątyń',
          lie: 'We Włodawie stoi jedna świątynia, i to byle jaka!',
          fact: 'Fałsz! We Włodawie stoją świątynie trzech religii: Wielka Synagoga, cerkiew i kościół św. Ludwika.',
          sources: [WLODAWA],
        },
        {
          id: 'zolw',
          label: 'Skorupka żółwia błotnego',
          lie: 'Żółwie w Polsce? Żyją tylko w ciepłych krajach!',
          fact: 'Fałsz! Żółw błotny z Poleskiego Parku Narodowego to jedyny żółw żyjący w Polsce naturalnie.',
          sources: [TURTLE],
        },
      ],
      facts: [
        {
          id: 'trial-verdict',
          speaker: 'diabel',
          gesture: 'angry',
          text: 'No dobrze, dobrze! Diabeł też umie sądzić sprawiedliwie. Wyrok: pieczęcie są prawdziwe!',
        },
        {
          id: 'trial-paw',
          speaker: 'koziol',
          gesture: 'think',
          text: 'Tak jak w legendzie! Diabelski sędzia przypieczętował wyrok, wypalając na stole ślad łapy.',
          sources: [PAW],
        },
      ],
    },
  ])

export const TRIAL_HINTS = {
  start: 'Przeciągnijcie właściwy dowód na stół sędziowski.',
  wrong: 'Ten dowód dotyczy innej sprawy! Diabeł się śmieje.',
} as const

export const LUBLIN_OUTRO = lines.parse([
  {
    id: 'lublin-table',
    speaker: 'koziol',
    gesture: 'present',
    text: 'Stół z wypaloną czarcią łapą możecie zobaczyć w Muzeum Narodowym w Lublinie. Badacze ustalili, że jego blat pochodzi z końca XVIII albo z początku XIX wieku.',
    sources: [PAW],
  },
  {
    id: 'lublin-fresco',
    speaker: 'koziol',
    gesture: 'talk',
    text: 'A na kamienicy Rynek 4 trzej diabli w szlacheckich strojach do dziś stoją przy stole trybunalskim. Namalowano ich w 1954 roku.',
    sources: [PAW],
  },
  {
    id: 'lublin-end',
    speaker: 'koziol',
    gesture: 'cheer',
    text: 'Paszport pełny! Przeszliście całe Lubelskie, od Zamościa po Lublin. Dziękuję za wspólną wyprawę!',
  },
])
