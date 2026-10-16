import { randomInt, shuffle, type Rng } from './random'

export type WordDirection = 'mendatar' | 'menurun' | 'diagonal'

export interface PlacedWord {
  word: string
  row: number
  col: number
  dRow: number
  dCol: number
}

export interface WordSearchPuzzle {
  size: number
  grid: string[][]
  placed: PlacedWord[]
  unplaced: string[]
  solutionCells: Set<string>
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function cleanWords(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of raw.split(/[\n,;]+/)) {
    const word = line.toUpperCase().replace(/[^A-Z]/g, '')
    if (word.length >= 2 && word.length <= 18 && !seen.has(word)) {
      seen.add(word)
      out.push(word)
    }
  }
  return out
}

export function generateWordSearch(
  rng: Rng,
  rawWords: readonly string[],
  directions: readonly WordDirection[] = ['mendatar', 'menurun'],
  requestedSize?: number
): WordSearchPuzzle {
  const words = [...rawWords].sort((a, b) => b.length - a.length)
  const longest = words.reduce((m, w) => Math.max(m, w.length), 6)
  const autoSize = Math.max(10, Math.min(18, Math.max(longest + 2, Math.ceil(Math.sqrt(words.join('').length * 2.2)))))
  const size = requestedSize ? Math.max(longest, Math.min(20, requestedSize)) : autoSize

  const grid: string[][] = Array.from({ length: size }, () => Array<string>(size).fill(''))
  const vectors: { dRow: number, dCol: number }[] = []
  if (directions.includes('mendatar')) vectors.push({ dRow: 0, dCol: 1 })
  if (directions.includes('menurun')) vectors.push({ dRow: 1, dCol: 0 })
  if (directions.includes('diagonal')) {
    vectors.push({ dRow: 1, dCol: 1 }, { dRow: -1, dCol: 1 })
  }
  if (vectors.length === 0) vectors.push({ dRow: 0, dCol: 1 })

  const placed: PlacedWord[] = []
  const unplaced: string[] = []
  const solutionCells = new Set<string>()

  for (const word of words) {
    let isPlaced = false
    const candidates: { row: number, col: number, dRow: number, dCol: number }[] = []

    for (const v of vectors) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const endR = r + v.dRow * (word.length - 1)
          const endC = c + v.dCol * (word.length - 1)
          if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue

          let fits = true
          for (let i = 0; i < word.length; i++) {
            const rr = r + v.dRow * i
            const cc = c + v.dCol * i
            const ch = grid[rr]![cc]!
            if (ch !== '' && ch !== word[i]) {
              fits = false
              break
            }
          }
          if (fits) candidates.push({ row: r, col: c, dRow: v.dRow, dCol: v.dCol })
        }
      }
    }

    const shuffled = shuffle(rng, candidates)
    const chosen = shuffled[0]
    if (chosen) {
      for (let i = 0; i < word.length; i++) {
        const rr = chosen.row + chosen.dRow * i
        const cc = chosen.col + chosen.dCol * i
        grid[rr]![cc] = word[i]!
        solutionCells.add(`${rr}:${cc}`)
      }
      placed.push({ word, ...chosen })
      isPlaced = true
    }

    if (!isPlaced) unplaced.push(word)
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r]![c]) {
        grid[r]![c] = ALPHABET[randomInt(rng, 0, ALPHABET.length - 1)]!
      }
    }
  }

  return { size, grid, placed, unplaced, solutionCells }
}

