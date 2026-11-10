import { audioContext } from '@/lib/audio/context'

type Voice = {
  type: OscillatorType
  at: number
  seconds: number
  from: number
  to: number
  gain: number
  filter?: number
  vibrato?: number
}

const BITTERN: Voice[] = [0, 1.1, 2.2, 3.3].flatMap((at) => [
  { type: 'sine', at, seconds: 0.12, from: 160, to: 120, gain: 0.25 },
  { type: 'sine', at: at + 0.18, seconds: 0.7, from: 105, to: 82, gain: 0.9, vibrato: 9 },
])

const WARBLER: Voice[] = Array.from({ length: 22 }, (_, index) => ({
  type: 'triangle',
  at: index * 0.11 + (index % 5 === 4 ? 0.12 : 0),
  seconds: 0.07,
  from: 3200 + ((index * 1373) % 1700),
  to: 2600 + ((index * 911) % 1500),
  gain: 0.18,
}))

const CRANE: Voice[] = [0, 0.55, 1.4, 1.95].map((at, index) => ({
  type: 'sawtooth',
  at,
  seconds: 0.42,
  from: index % 2 === 0 ? 640 : 560,
  to: index % 2 === 0 ? 700 : 520,
  gain: 0.32,
  filter: 1600,
  vibrato: 24,
}))

const CALLS = { bittern: BITTERN, warbler: WARBLER, crane: CRANE } as const

export type MarshCall = keyof typeof CALLS

export const CALL_SECONDS: Record<MarshCall, number> = {
  bittern: 4.2,
  warbler: 2.7,
  crane: 2.5,
}

function playVoice(audio: AudioContext, voice: Voice, volume: number) {
  const start = audio.currentTime + voice.at
  const end = start + voice.seconds
  const tone = audio.createOscillator()
  const envelope = audio.createGain()
  const filter = audio.createBiquadFilter()
  tone.type = voice.type
  tone.frequency.setValueAtTime(voice.from, start)
  tone.frequency.exponentialRampToValueAtTime(voice.to, end)
  filter.type = 'lowpass'
  filter.frequency.value = voice.filter ?? 8000
  envelope.gain.setValueAtTime(0, start)
  envelope.gain.linearRampToValueAtTime(voice.gain * volume, start + voice.seconds * 0.2)
  envelope.gain.linearRampToValueAtTime(0, end)
  tone.connect(filter).connect(envelope).connect(audio.destination)
  if (voice.vibrato) {
    const wobble = audio.createOscillator()
    const depth = audio.createGain()
    wobble.frequency.value = voice.vibrato
    depth.gain.value = voice.from * 0.03
    wobble.connect(depth).connect(tone.frequency)
    wobble.start(start)
    wobble.stop(end)
  }
  tone.start(start)
  tone.stop(end + 0.05)
}

export function playMarshCall(call: MarshCall, volume: number) {
  const audio = audioContext()
  if (!audio || volume <= 0) return
  for (const voice of CALLS[call]) playVoice(audio, voice, volume)
}
