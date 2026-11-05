'use client'

import { useMemo } from 'react'
import { InstancedModel } from '@/components/scene/island/InstancedModel'
import type { IslandModel } from '@/lib/island/island-model'
import { scatterFarmSpots } from '@/lib/island/scatter'

const HOUSE_SIZE = 0.32
const WINDMILL_SIZE = 0.55
const HORSE_SIZE = 0.16
const DEER_SIZE = 0.3

const HERD_OFFSETS: [number, number, number][] = [
  [0.9, 0.55, 0.4],
  [1.15, 0.75, -0.9],
  [0.75, 0.95, 2.4],
  [1.3, 0.35, 1.2],
]

type CountrysideProps = {
  model: IslandModel
}

export function Countryside({ model }: CountrysideProps) {
  const scene = useMemo(() => {
    const houses = scatterFarmSpots(model, { count: 34, seed: 1569, spacing: 0.9, clearance: 0.3 })
    const windmills = scatterFarmSpots(model, { count: 6, seed: 1385, spacing: 3, clearance: 0.6 })
    const roztocze = model.places.find((place) => place.id === 'roztocze')
    const horses = roztocze
      ? HERD_OFFSETS.map(([dx, dz, rotation]) => {
          const x = roztocze.position[0] + dx
          const z = roztocze.position[1] + dz
          return { position: [x, model.heightAt(x, z), z] as [number, number, number], rotation }
        })
      : []
    const eastmost = model.boundary.reduce((best, point) => (point[0] > best[0] ? point : best))
    const toCenter = Math.atan2(model.centroid[0] - eastmost[0], model.centroid[1] - eastmost[1])
    const deerX = eastmost[0] + Math.sin(toCenter) * 0.45
    const deerZ = eastmost[1] + Math.cos(toCenter) * 0.45
    const deer = [
      {
        position: [deerX, model.heightAt(deerX, deerZ), deerZ] as [number, number, number],
        rotation: toCenter + Math.PI / 2,
      },
    ]
    return { houses, windmills, horses, deer }
  }, [model])

  return (
    <group>
      <InstancedModel
        name="village-house"
        instances={scene.houses.map((spot) => ({ ...spot, scale: HOUSE_SIZE }))}
        baseCut={0.04}
      />
      <InstancedModel
        name="windmill"
        instances={scene.windmills.map((spot) => ({ ...spot, scale: WINDMILL_SIZE }))}
        baseCut={0.04}
      />
      <InstancedModel
        name="horse"
        instances={scene.horses.map((spot) => ({ ...spot, scale: HORSE_SIZE }))}
      />
      <InstancedModel
        name="deer"
        instances={scene.deer.map((spot) => ({ ...spot, scale: DEER_SIZE }))}
      />
    </group>
  )
}
