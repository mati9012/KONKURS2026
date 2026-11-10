import type { BirdId } from '@/content/poleski-park-narodowy'
import { BirdArt } from '@/levels/poleski-park-narodowy/art/BirdArt'

export function BirdIcon({ bird, className }: { bird: BirdId; className?: string }) {
  return (
    <svg viewBox="-80 -150 160 200" aria-hidden="true" className={className}>
      <BirdArt bird={bird} />
    </svg>
  )
}
