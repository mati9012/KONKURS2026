import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { DialogueLine } from '@/content/schema'

const CONTENT_DIR = 'src/content'
const RAW_DIR = 'assets-src/voice-raw'
const OUTPUT_DIR = 'public/audio/voice'
const MANIFEST = 'src/content/voiced-lines.json'
const MODEL = 'eleven_v3'

type Voice = { id: string; stability: number }

const VOICES: Partial<Record<DialogueLine['speaker'], Voice>> = {
  koziol: { id: 'WZWY41HpsUVj15DdpPEX', stability: 1 },
  diabel: { id: 'xAVsdcJvD1uegu8lFEE2', stability: 0.5 },
}

const DELIVERY: Record<string, string> = {
  'koziol:wave': '[warmly] %s',
  'koziol:cheer': '[cheerfully] %s',
  'koziol:present': '[proudly] %s',
  'koziol:think': '[thoughtfully] %s',
  'koziol:laugh': '[laughs] %s',
  'koziol:angry': '[annoyed] %s',
  'diabel:laugh': '[playfully] %s [chuckles]',
  'diabel:angry': '[angrily] %s',
}

const SPOKEN: Record<string, string> = {
  'W 1637 roku': 'W roku tysiąc sześćset trzydziestym siódmym',
  Kleeberg: 'Kleberg',
}

const PLOSIVE_FILTER =
  'highpass=f=60:p=2,acrossover=split=220[lo][hi];' +
  '[lo]acompressor=threshold=0.1:ratio=20:attack=0.2:release=40:knee=1[loc];' +
  '[loc][hi]amix=inputs=2:normalize=0'

function isLine(value: unknown): value is DialogueLine {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'speaker' in value &&
    'text' in value
  )
}

function collectConversations(value: unknown, found: DialogueLine[][]) {
  if (Array.isArray(value) && value.length > 0 && value.every(isLine)) {
    found.push(value)
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) collectConversations(child, found)
  }
}

function spoken(line: DialogueLine) {
  const text = Object.entries(SPOKEN).reduce(
    (result, [written, said]) => result.replaceAll(written, said),
    line.text,
  )
  return (DELIVERY[`${line.speaker}:${line.gesture}`] ?? '%s').replace('%s', text)
}

async function synthesize(line: DialogueLine, voice: Voice) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: spoken(line),
        model_id: MODEL,
        voice_settings: { stability: voice.stability },
      }),
    },
  )
  if (!response.ok) throw new Error(`${line.id}: ${response.status} ${await response.text()}`)
  return Buffer.from(await response.arrayBuffer())
}

function writeManifest() {
  const voiced = readdirSync(OUTPUT_DIR)
    .filter((name) => name.endsWith('.mp3'))
    .map((name) => basename(name, '.mp3'))
    .sort()
  writeFileSync(MANIFEST, `${JSON.stringify(voiced)}\n`)
  execFileSync('pnpm', ['exec', 'prettier', '--write', MANIFEST])
}

async function voiceLine(line: DialogueLine) {
  const voice = VOICES[line.speaker]
  const output = `${OUTPUT_DIR}/${line.id}.mp3`
  if (!voice || existsSync(output)) return
  const raw = `${RAW_DIR}/${line.id}.mp3`
  if (!existsSync(raw)) writeFileSync(raw, await synthesize(line, voice))
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    raw,
    '-filter_complex',
    PLOSIVE_FILTER,
    '-b:a',
    '128k',
    output,
  ])
  process.stdout.write(`${output}\n`)
}

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('Brak ELEVENLABS_API_KEY')
  mkdirSync(RAW_DIR, { recursive: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const requested = process.argv.slice(2)
  const modules =
    requested.length > 0
      ? requested
      : readdirSync(CONTENT_DIR)
          .filter((name) => name.endsWith('.ts'))
          .map((name) => basename(name, '.ts'))

  try {
    for (const name of modules) {
      const conversations: DialogueLine[][] = []
      collectConversations(await import(`@/content/${name}`), conversations)
      for (const line of conversations.flat()) await voiceLine(line)
    }
  } finally {
    writeManifest()
  }
}

main()
