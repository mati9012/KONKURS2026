import { DefaultLoadingManager } from 'three'

export type LoadingSnapshot = {
  loaded: number
  total: number
  active: boolean
}

export const IDLE_LOADING: LoadingSnapshot = { loaded: 0, total: 0, active: false }

let snapshot = IDLE_LOADING
const listeners = new Set<() => void>()

function publish(next: LoadingSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

DefaultLoadingManager.onStart = (_url, loaded, total) => publish({ loaded, total, active: true })
DefaultLoadingManager.onProgress = (_url, loaded, total) =>
  publish({ loaded, total, active: loaded < total })
DefaultLoadingManager.onLoad = () =>
  publish({ loaded: snapshot.total, total: snapshot.total, active: false })

const SMOOTH_FRAME_SECONDS = 0.05
const SMOOTH_FRAMES_NEEDED = 45
const SLOW_DEVICE_IDLE_SECONDS = 3
const SLOW_DEVICE_FRAMES_NEEDED = 10

let smoothFrames = 0
let idleFrames = 0
let idleSeconds = 0
let sceneSettled = false

export function reportRenderedFrame(delta: number) {
  if (sceneSettled) return
  const idle = !snapshot.active && snapshot.total > 0
  smoothFrames = idle && delta < SMOOTH_FRAME_SECONDS ? smoothFrames + 1 : 0
  idleFrames = idle ? idleFrames + 1 : 0
  idleSeconds = idle ? idleSeconds + delta : 0
  const smooth = smoothFrames >= SMOOTH_FRAMES_NEEDED
  const slowButDone =
    idleSeconds >= SLOW_DEVICE_IDLE_SECONDS && idleFrames >= SLOW_DEVICE_FRAMES_NEEDED
  if (!smooth && !slowButDone) return
  sceneSettled = true
  listeners.forEach((listener) => listener())
}

export function isSceneSettled() {
  return sceneSettled
}

export function subscribeToLoading(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getLoadingSnapshot() {
  return snapshot
}
