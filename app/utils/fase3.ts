import { shuffle } from './random'

// ---------- 1. Denah Tempat Duduk
export function assignSeats(
  rng: () => number,
  studentIds: string[],
  totalSeats: number,
  randomize: boolean
): (string | null)[] {
  const ordered = randomize ? shuffle(rng, studentIds) : [...studentIds]
  return Array.from({ length: Math.max(0, totalSeats) }, (_, idx) => ordered[idx] ?? null)
}

export function swapSeats(seats: (string | null)[], i: number, j: number): (string | null)[] {
  const next = [...seats]
  if (i < 0 || j < 0 || i >= next.length || j >= next.length) return next
  const tmp = next[i] ?? null
  next[i] = next[j] ?? null
  next[j] = tmp
  return next
}

// ---------- 2. Jadwal Piket
export const SCHOOL_DAYS_5 = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const
export const SCHOOL_DAYS_6 = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const

export interface PiketDayGroup<T> {
  day: string
  members: T[]
}

export function makePiketSchedule<T>(
  students: T[],
  daysCount: 5 | 6 = 5,
  weekNumber = 1
): PiketDayGroup<T>[] {
  const days = daysCount === 6 ? [...SCHOOL_DAYS_6] : [...SCHOOL_DAYS_5]
  const buckets: T[][] = days.map(() => [])

  students.forEach((student, idx) => {
    const baseDay = idx % days.length
    const shiftedDay = (baseDay + Math.max(0, weekNumber - 1)) % days.length
    buckets[shiftedDay]!.push(student)
  })

  return days.map((day, i) => ({
    day,
    members: buckets[i]!
  }))
}

// ---------- 3. Pembuat Teka-Teki Silang (TTS)
export interface CrosswordInput {
  word: string
  clue: string
}

export interface PlacedCrosswordWord {
  number: number
  word: string
  clue: string
  row: number
  col: number
  direction: 'mendatar' | 'menurun'
}

export interface CrosswordPuzzle {
  rows: number
  cols: number
  grid: (string | null)[][]
  numbers: (number | null)[][]
  placed: PlacedCrosswordWord[]
  unplaced: CrosswordInput[]
}

export function parseCrosswordLines(raw: string): CrosswordInput[] {
  const seen = new Set<string>()
  const result: CrosswordInput[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const sepIdx = trimmed.indexOf(':') !== -1 ? trimmed.indexOf(':') : trimmed.indexOf('-')
    const rawWord = (sepIdx !== -1 ? trimmed.slice(0, sepIdx) : trimmed).replace(/[^a-zA-Z]/g, '').toUpperCase()
    const clue = (sepIdx !== -1 ? trimmed.slice(sepIdx + 1) : `Petunjuk untuk ${rawWord}`).trim()
    if (rawWord.length >= 2 && rawWord.length <= 16 && !seen.has(rawWord)) {
      seen.add(rawWord)
      result.push({ word: rawWord, clue: clue || `Petunjuk untuk ${rawWord}` })
    }
  }
  return result
}

export function generateCrossword(inputs: CrosswordInput[]): CrosswordPuzzle {
  if (inputs.length === 0) {
    return { rows: 0, cols: 0, grid: [], numbers: [], placed: [], unplaced: [] }
  }

  const size = 36
  const board: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null))
  const sorted = [...inputs].sort((a, b) => b.word.length - a.word.length)

  interface RawPlacement {
    word: string
    clue: string
    row: number
    col: number
    direction: 'mendatar' | 'menurun'
  }

  const rawPlaced: RawPlacement[] = []
  const unplaced: CrosswordInput[] = []

  function canPlace(word: string, r: number, c: number, dir: 'mendatar' | 'menurun'): boolean {
    const dr = dir === 'menurun' ? 1 : 0
    const dc = dir === 'mendatar' ? 1 : 0
    const endR = r + dr * (word.length - 1)
    const endC = c + dc * (word.length - 1)
    if (r < 1 || c < 1 || endR >= size - 1 || endC >= size - 1) return false

    // Sel sebelum awal dan sesudah akhir kata harus kosong
    if (board[r - dr]?.[c - dc] !== null) return false
    if (board[endR + dr]?.[endC + dc] !== null) return false

    let intersections = 0
    for (let i = 0; i < word.length; i++) {
      const cr = r + dr * i
      const cc = c + dc * i
      const ch = word[i]!
      const existing = board[cr]![cc]
      if (existing !== null && existing !== ch) return false
      if (existing === ch) {
        intersections++
      } else {
        // Sel di samping tegak lurus harus kosong agar tidak menempel kata sejajar
        if (dir === 'mendatar') {
          if (board[cr - 1]![cc] !== null || board[cr + 1]![cc] !== null) return false
        } else {
          if (board[cr]![cc - 1] !== null || board[cr]![cc + 1] !== null) return false
        }
      }
    }
    return intersections > 0
  }

  function commitWord(item: CrosswordInput, r: number, c: number, dir: 'mendatar' | 'menurun') {
    const dr = dir === 'menurun' ? 1 : 0
    const dc = dir === 'mendatar' ? 1 : 0
    for (let i = 0; i < item.word.length; i++) {
      board[r + dr * i]![c + dc * i] = item.word[i]!
    }
    rawPlaced.push({ ...item, row: r, col: c, direction: dir })
  }

  // Tempatkan kata pertama di tengah secara mendatar
  const first = sorted[0]!
  const startR = Math.floor(size / 2)
  const startC = Math.floor((size - first.word.length) / 2)
  commitWord(first, startR, startC, 'mendatar')

  for (let idx = 1; idx < sorted.length; idx++) {
    const candidate = sorted[idx]!
    let found = false

    for (const existing of rawPlaced) {
      if (found) break
      const nextDir: 'mendatar' | 'menurun' = existing.direction === 'mendatar' ? 'menurun' : 'mendatar'
      for (let i = 0; i < candidate.word.length; i++) {
        if (found) break
        for (let j = 0; j < existing.word.length; j++) {
          if (candidate.word[i] !== existing.word[j]) continue
          const hitR = existing.row + (existing.direction === 'menurun' ? j : 0)
          const hitC = existing.col + (existing.direction === 'mendatar' ? j : 0)
          const candR = hitR - (nextDir === 'menurun' ? i : 0)
          const candC = hitC - (nextDir === 'mendatar' ? i : 0)
          if (canPlace(candidate.word, candR, candC, nextDir)) {
            commitWord(candidate, candR, candC, nextDir)
            found = true
            break
          }
        }
      }
    }

    if (!found) {
      unplaced.push(candidate)
    }
  }

  // Potong batas kotak agar pas dengan kata yang berhasil dipasang
  let minR = size
  let maxR = 0
  let minC = size
  let maxC = 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r]![c] !== null) {
        if (r < minR) minR = r
        if (r > maxR) maxR = r
        if (c < minC) minC = c
        if (c > maxC) maxC = c
      }
    }
  }

  const rows = maxR - minR + 1
  const cols = maxC - minC + 1
  const grid: (string | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => board[minR + r]![minC + c] ?? null)
  )

  const shifted = rawPlaced.map(p => ({
    ...p,
    row: p.row - minR,
    col: p.col - minC
  }))

  // Beri nomor urut dari kiri-atas ke kanan-bawah
  shifted.sort((a, b) => (a.row - b.row) || (a.col - b.col))
  const numbers: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
  let currentNumber = 0
  const coordToNumber = new Map<string, number>()

  const placed: PlacedCrosswordWord[] = shifted.map((p) => {
    const key = `${p.row}:${p.col}`
    let num = coordToNumber.get(key)
    if (!num) {
      currentNumber++
      num = currentNumber
      coordToNumber.set(key, num)
      numbers[p.row]![p.col] = num
    }
    return {
      ...p,
      number: num
    }
  })

  return { rows, cols, grid, numbers, placed, unplaced }
}

// ---------- 4. Visualisasi Pecahan
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a))
  let y = Math.abs(Math.trunc(b))
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function simplifyFraction(num: number, den: number): { num: number, den: number } {
  const safeDen = Math.max(1, Math.trunc(den))
  const safeNum = Math.max(0, Math.trunc(num))
  const d = gcd(safeNum, safeDen)
  return { num: safeNum / d, den: safeDen / d }
}

export function compareFractions(n1: number, d1: number, n2: number, d2: number): '<' | '=' | '>' {
  const left = n1 * d2
  const right = n2 * d1
  if (left < right) return '<'
  if (left > right) return '>'
  return '='
}

export function equivalentFractions(num: number, den: number, count = 4): { num: number, den: number }[] {
  const base = simplifyFraction(num, den)
  return Array.from({ length: count }, (_, i) => ({
    num: base.num * (i + 1),
    den: base.den * (i + 1)
  }))
}

// ---------- 5. Garis Bilangan
export function buildNumberLineTicks(min: number, max: number): number[] {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
}

