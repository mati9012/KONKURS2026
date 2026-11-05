import type { BufferGeometry } from 'three'
import type { PlaceId } from '@/content/places'
import {
  buildChelm,
  buildKazimierzDolny,
  buildKock,
  buildLublin,
  buildPulawy,
  buildWlodawa,
  buildZamosc,
} from '@/lib/landmarks/cities'
import {
  buildBilgoraj,
  buildPoleskiPark,
  buildRoztocze,
  buildZwierzyniec,
} from '@/lib/landmarks/nature'

export const LANDMARK_BUILDERS: Record<PlaceId, () => BufferGeometry> = {
  lublin: buildLublin,
  zamosc: buildZamosc,
  'kazimierz-dolny': buildKazimierzDolny,
  chelm: buildChelm,
  pulawy: buildPulawy,
  wlodawa: buildWlodawa,
  'poleski-park-narodowy': buildPoleskiPark,
  roztocze: buildRoztocze,
  zwierzyniec: buildZwierzyniec,
  bilgoraj: buildBilgoraj,
  kock: buildKock,
}
