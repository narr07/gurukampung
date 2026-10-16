import { shuffle, type Rng } from './random'

export interface QuizQuestion {
  id: string
  stem: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export interface ShuffledQuestion {
  number: number
  stem: string
  options: { letter: 'A' | 'B' | 'C' | 'D', text: string }[]
  answerLetter: 'A' | 'B' | 'C' | 'D'
}

const LETTERS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']

export function buildQuizPackage(
  rng: Rng,
  questions: readonly QuizQuestion[],
  shuffleQuestions = true,
  shuffleOptions = true
): ShuffledQuestion[] {
  const valid = questions.filter(q => q.stem.trim().length > 0)
  const ordered = shuffleQuestions ? shuffle(rng, valid) : [...valid]

  return ordered.map((q, idx) => {
    const indexed = q.options.map((text, i) => ({
      text: text.trim() || `Pilihan ${LETTERS[i]}`,
      isCorrect: i === q.correctIndex
    }))
    const mixed = shuffleOptions ? shuffle(rng, indexed) : indexed
    const correctPos = Math.max(0, mixed.findIndex(o => o.isCorrect))

    return {
      number: idx + 1,
      stem: q.stem.trim(),
      options: mixed.map((o, i) => ({
        letter: LETTERS[i]!,
        text: o.text
      })),
      answerLetter: LETTERS[correctPos]!
    }
  })
}

