'use client'

import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  failed: boolean
}

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
        <p className="max-w-sm text-lg font-bold">
          Nie udało się uruchomić mapy 3D. Spróbuj odświeżyć stronę albo otworzyć grę w innej
          przeglądarce.
        </p>
      </div>
    )
  }
}
