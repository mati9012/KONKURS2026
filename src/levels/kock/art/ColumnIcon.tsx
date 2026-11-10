import type { ColumnKind } from '@/content/kock'
import { ColumnArt } from '@/levels/kock/art/ColumnArt'

export function ColumnIcon({
  kind,
  className,
  top = false,
}: {
  kind: ColumnKind
  className?: string
  top?: boolean
}) {
  return (
    <svg
      viewBox={top ? '-12 -101 24 26' : '-24 -104 48 108'}
      aria-hidden="true"
      className={className}
    >
      <ColumnArt kind={kind} height={100} />
    </svg>
  )
}
