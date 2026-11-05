export const LEVEL_IDS = [
  'zamosc',
  'lublin',
  'chelm',
  'kazimierz-dolny',
  'roztocze',
  'bilgoraj',
  'kuchnia',
] as const

export type LevelId = (typeof LEVEL_IDS)[number]
