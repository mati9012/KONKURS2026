export const PLACE_IDS = [
  'lublin',
  'zamosc',
  'kazimierz-dolny',
  'chelm',
  'pulawy',
  'wlodawa',
  'poleski-park-narodowy',
  'roztocze',
  'zwierzyniec',
  'bilgoraj',
  'kock',
] as const

export type PlaceId = (typeof PLACE_IDS)[number]

export type Place = {
  id: PlaceId
  name: string
  longitude: number
  latitude: number
  footprint: number
  scale: number
  rotation?: number
  extras?: PlaceExtra[]
}

export type PlaceExtra = {
  model: string
  offset: [x: number, z: number]
  size: number
}

export const PLACES: Place[] = [
  {
    id: 'lublin',
    name: 'Lublin',
    longitude: 22.5684,
    latitude: 51.2465,
    footprint: 0.9,
    scale: 1.7,
    extras: [{ model: 'lublin-gate', offset: [1.75, 1.2], size: 0.9 }],
  },
  {
    id: 'zamosc',
    name: 'Zamość',
    longitude: 23.252,
    latitude: 50.7231,
    footprint: 0.9,
    scale: 1.45,
  },
  {
    id: 'kazimierz-dolny',
    name: 'Kazimierz Dolny',
    longitude: 21.995,
    latitude: 51.3214,
    footprint: 0.65,
    scale: 0.85,
  },
  {
    id: 'chelm',
    name: 'Chełm',
    longitude: 23.4716,
    latitude: 51.1431,
    footprint: 0.6,
    scale: 1.35,
  },
  {
    id: 'pulawy',
    name: 'Puławy',
    longitude: 22.01,
    latitude: 51.435,
    footprint: 0.65,
    scale: 0.85,
  },
  {
    id: 'wlodawa',
    name: 'Włodawa',
    longitude: 23.485,
    latitude: 51.5469,
    footprint: 0.55,
    scale: 1.25,
  },
  {
    id: 'poleski-park-narodowy',
    name: 'Poleski Park Narodowy',
    longitude: 23.2,
    latitude: 51.43,
    footprint: 0.5,
    scale: 1.35,
  },
  {
    id: 'roztocze',
    name: 'Roztocze',
    longitude: 23.13,
    latitude: 50.5,
    footprint: 0.6,
    scale: 1.35,
  },
  {
    id: 'zwierzyniec',
    name: 'Zwierzyniec',
    longitude: 22.9686,
    latitude: 50.6133,
    footprint: 0.65,
    scale: 1.25,
  },
  {
    id: 'bilgoraj',
    name: 'Biłgoraj',
    longitude: 22.7222,
    latitude: 50.5413,
    footprint: 0.5,
    scale: 1.25,
  },
  { id: 'kock', name: 'Kock', longitude: 22.4485, latitude: 51.6413, footprint: 0.5, scale: 1.25 },
]
