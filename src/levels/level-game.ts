import type { ComponentType } from 'react'
import type { DialogueLine } from '@/content/schema'

export type LevelGameProps = {
  onComplete: () => void
}

export type LevelDefinition = {
  intro: DialogueLine[]
  outro: DialogueLine[]
  Game: ComponentType<LevelGameProps>
}
