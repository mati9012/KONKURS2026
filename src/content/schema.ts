import { z } from 'zod'
import { LEVEL_IDS } from '@/content/levels'

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  accessedAt: z.iso.date(),
})

export const factSchema = z.object({
  id: z.string().min(1),
  levelId: z.enum(LEVEL_IDS),
  text: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
})

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    levelId: z.enum(LEVEL_IDS),
    question: z.string().min(1),
    answers: z.array(z.string().min(1)).min(2),
    correctIndex: z.number().int().nonnegative(),
    sources: z.array(sourceSchema).min(1),
  })
  .refine((question) => question.correctIndex < question.answers.length, {
    message: 'correctIndex poza zakresem odpowiedzi',
    path: ['correctIndex'],
  })

export const NARRATOR_GESTURES = ['idle', 'talk', 'present', 'think', 'wave', 'cheer'] as const

export const dialogueLineSchema = z.object({
  id: z.string().min(1),
  speaker: z.enum(['koziol', 'diabel', 'gracz']),
  text: z.string().min(1),
  gesture: z.enum(NARRATOR_GESTURES).default('talk'),
  audio: z.string().optional(),
  sources: z.array(sourceSchema).min(1).optional(),
})

export type Source = z.infer<typeof sourceSchema>
export type Fact = z.infer<typeof factSchema>
export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type DialogueLine = z.infer<typeof dialogueLineSchema>
export type NarratorGesture = (typeof NARRATOR_GESTURES)[number]
