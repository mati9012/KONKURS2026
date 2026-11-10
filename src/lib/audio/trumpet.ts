import { audioContext } from '@/lib/audio/context'

export function playTrumpetNote(frequency: number, volume: number, seconds = 0.32) {
  const audio = audioContext()
  if (!audio || volume <= 0) return
  const start = audio.currentTime
  const tone = audio.createOscillator()
  const vibrato = audio.createOscillator()
  const vibratoDepth = audio.createGain()
  const filter = audio.createBiquadFilter()
  const envelope = audio.createGain()

  tone.type = 'sawtooth'
  tone.frequency.setValueAtTime(frequency * 0.97, start)
  tone.frequency.linearRampToValueAtTime(frequency, start + 0.04)
  vibrato.frequency.value = 5.5
  vibratoDepth.gain.value = frequency * 0.006
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(900, start)
  filter.frequency.linearRampToValueAtTime(2600, start + 0.05)
  filter.Q.value = 2
  envelope.gain.setValueAtTime(0, start)
  envelope.gain.linearRampToValueAtTime(0.32 * volume, start + 0.025)
  envelope.gain.linearRampToValueAtTime(0.2 * volume, start + seconds * 0.6)
  envelope.gain.linearRampToValueAtTime(0, start + seconds)

  vibrato.connect(vibratoDepth).connect(tone.frequency)
  tone.connect(filter).connect(envelope).connect(audio.destination)
  tone.start(start)
  vibrato.start(start)
  tone.stop(start + seconds + 0.05)
  vibrato.stop(start + seconds + 0.05)
}
