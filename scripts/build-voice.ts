import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { DialogueLine } from '@/content/schema'

const CONTENT_DIR = 'src/content'
const RAW_DIR = 'assets-src/voice-raw'
const OUTPUT_DIR = 'public/audio/voice'
const MANIFEST = 'src/content/voiced-lines.json'
const MODEL = 'eleven_multilingual_v2'

const VOICES: Partial<Record<DialogueLine['speaker'], object>> = {
  koziol: {
    voice_id: 'WZWY41HpsUVj15DdpPEX',
    voice_settings: {
      stability: 0.35,
      similarity_boost: 0.8,
      style: 0.35,
      use_speaker_boost: true,
    },
  },
  diabel: {
    voice_id: 'xAVsdcJvD1uegu8lFEE2',
    voice_settings: { stability: 0.2, similarity_boost: 0.75, style: 0.8, use_speaker_boost: true },
  },
}

const SPOKEN: Record<string, string> = {
  'W 1637 roku': 'W roku tysiąc sześćset trzydziestym siódmym',
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

function spoken(text: string) {
  return Object.entries(SPOKEN).reduce(
    (result, [written, said]) => result.replace(written, said),
    text,
  )
}

async function synthesize(line: DialogueLine, previous?: DialogueLine, next?: DialogueLine) {
  const { voice_id, voice_settings } = VOICES[line.speaker] as {
    voice_id: string
    voice_settings: object
  }
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: spoken(line.text),
        model_id: MODEL,
        voice_settings,
        previous_text: previous && spoken(previous.text),
        next_text: next && spoken(next.text),
      }),
    },
  )
  if (!response.ok) throw new Error(`${line.id}: ${response.status} ${await response.text()}`)
  return Buffer.from(await response.arrayBuffer())
}

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('Brak ELEVENLABS_API_KEY')
  const prefixes = process.argv.slice(2)
  mkdirSync(RAW_DIR, { recursive: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const conversations: DialogueLine[][] = []
  for (const file of readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.ts'))) {
    collectConversations(await import(`@/content/${basename(file, '.ts')}`), conversations)
  }

  for (const lines of conversations) {
    for (const [index, line] of lines.entries()) {
      const output = `${OUTPUT_DIR}/${line.id}.mp3`
      if (!VOICES[line.speaker] || existsSync(output)) continue
      if (prefixes.length > 0 && !prefixes.some((prefix) => line.id.startsWith(prefix))) continue
      const raw = `${RAW_DIR}/${line.id}.mp3`
      if (!existsSync(raw))
        writeFileSync(raw, await synthesize(line, lines[index - 1], lines[index + 1]))
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
  }

  const voiced = readdirSync(OUTPUT_DIR)
    .filter((name) => name.endsWith('.mp3'))
    .map((name) => basename(name, '.mp3'))
    .sort()
  writeFileSync(MANIFEST, `${JSON.stringify(voiced)}\n`)
  execFileSync('pnpm', ['exec', 'prettier', '--write', MANIFEST])
}

main()
