import { shuffle } from './random'

// ---------- 1. Analisis Butir Soal Pilihan Ganda
export interface StudentAnswerRow {
  studentName: string
  answers: string[]
}

export interface ItemAnalysisStat {
  number: number
  key: string
  correctCount: number
  difficultyIndex: number
  difficultyLabel: 'Sukar' | 'Sedang' | 'Mudah'
  discriminationIndex: number
  discriminationLabel: 'Baik Sekali' | 'Baik' | 'Cukup' | 'Perlu Revisi'
  optionCounts: Record<'A' | 'B' | 'C' | 'D', number>
}

export interface ExamAnalysisResult {
  studentScores: { name: string, correct: number, score: number, tuntas: boolean }[]
  itemStats: ItemAnalysisStat[]
  classicalMasteryPercent: number
  averageScore: number
}

export function classifyDifficulty(p: number): 'Sukar' | 'Sedang' | 'Mudah' {
  if (p < 0.3) return 'Sukar'
  if (p <= 0.7) return 'Sedang'
  return 'Mudah'
}

export function classifyDiscrimination(d: number): 'Baik Sekali' | 'Baik' | 'Cukup' | 'Perlu Revisi' {
  if (d >= 0.4) return 'Baik Sekali'
  if (d >= 0.3) return 'Baik'
  if (d >= 0.2) return 'Cukup'
  return 'Perlu Revisi'
}

export function analyzeMultipleChoice(
  keys: string[],
  rows: StudentAnswerRow[],
  kktp = 75
): ExamAnalysisResult {
  const numQuestions = keys.length
  const numStudents = rows.length
  if (numQuestions === 0 || numStudents === 0) {
    return { studentScores: [], itemStats: [], classicalMasteryPercent: 0, averageScore: 0 }
  }

  const normalizedKeys = keys.map(k => k.trim().toUpperCase())
  const scoredRows = rows.map((r) => {
    let correct = 0
    for (let q = 0; q < numQuestions; q++) {
      const ans = (r.answers[q] ?? '').trim().toUpperCase()
      if (ans && ans === normalizedKeys[q]) correct++
    }
    const score = Math.round((correct / numQuestions) * 1000) / 10
    return {
      name: r.studentName,
      answers: r.answers.map(a => a.trim().toUpperCase()),
      correct,
      score,
      tuntas: score >= kktp
    }
  })

  // Urutkan skor tertinggi ke terendah untuk membagi kelompok atas dan kelompok bawah
  const sortedByScore = [...scoredRows].sort((a, b) => b.correct - a.correct)
  const groupSize = Math.max(1, Math.floor(numStudents / 2))
  const upperGroup = sortedByScore.slice(0, groupSize)
  const lowerGroup = sortedByScore.slice(numStudents - groupSize)

  const itemStats: ItemAnalysisStat[] = normalizedKeys.map((key, qIdx) => {
    let correctCount = 0
    const optionCounts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 }

    for (const r of scoredRows) {
      const ans = r.answers[qIdx] as 'A' | 'B' | 'C' | 'D' | undefined
      if (ans && ans in optionCounts) {
        optionCounts[ans]++
      }
      if (ans === key) correctCount++
    }

    const upperCorrect = upperGroup.filter(r => r.answers[qIdx] === key).length
    const lowerCorrect = lowerGroup.filter(r => r.answers[qIdx] === key).length

    const difficultyIndex = Math.round((correctCount / numStudents) * 100) / 100
    const discriminationIndex = Math.round(((upperCorrect - lowerCorrect) / groupSize) * 100) / 100

    return {
      number: qIdx + 1,
      key,
      correctCount,
      difficultyIndex,
      difficultyLabel: classifyDifficulty(difficultyIndex),
      discriminationIndex,
      discriminationLabel: classifyDiscrimination(discriminationIndex),
      optionCounts
    }
  })

  const tuntasCount = scoredRows.filter(s => s.tuntas).length
  const classicalMasteryPercent = Math.round((tuntasCount / numStudents) * 1000) / 10
  const totalScore = scoredRows.reduce((acc, s) => acc + s.score, 0)
  const averageScore = Math.round((totalScore / numStudents) * 10) / 10

  return {
    studentScores: scoredRows.map(({ name, correct, score, tuntas }) => ({ name, correct, score, tuntas })),
    itemStats,
    classicalMasteryPercent,
    averageScore
  }
}

// ---------- 2. Pembuat Bingo Edukasi
export interface BingoCardData {
  id: number
  cells: string[][]
}

export function generateBingoSet(
  rng: () => number,
  items: string[],
  gridSize: 3 | 4 | 5,
  cardCount: number,
  freeCenter = true
): { cards: BingoCardData[], callerList: string[] } {
  const needed = gridSize * gridSize
  const pool = [...items]
  while (pool.length < needed) {
    pool.push(`${pool.length + 1}`)
  }

  const cards: BingoCardData[] = []
  const centerIdx = Math.floor(gridSize / 2)

  for (let c = 0; c < cardCount; c++) {
    const picked = shuffle(rng, pool).slice(0, needed)
    const cells: string[][] = []
    for (let row = 0; row < gridSize; row++) {
      const rowCells: string[] = []
      for (let col = 0; col < gridSize; col++) {
        if (freeCenter && gridSize % 2 === 1 && row === centerIdx && col === centerIdx) {
          rowCells.push('BEBAS')
        } else {
          rowCells.push(picked[row * gridSize + col]!)
        }
      }
      cells.push(rowCells)
    }
    cards.push({ id: c + 1, cells })
  }

  const callerList = shuffle(rng, pool)
  return { cards, callerList }
}

// ---------- 3. Simulasi Uang Rupiah
export interface RupiahDenomination {
  value: number
  label: string
  type: 'kertas' | 'logam'
  bgHex: string
  inkHex: string
}

export const RUPIAH_DENOMINATIONS: RupiahDenomination[] = [
  { value: 100000, label: 'Rp100.000', type: 'kertas', bgHex: '#fda4af', inkHex: '#881337' },
  { value: 50000, label: 'Rp50.000', type: 'kertas', bgHex: '#93c5fd', inkHex: '#1e3a8a' },
  { value: 20000, label: 'Rp20.000', type: 'kertas', bgHex: '#86efac', inkHex: '#14532d' },
  { value: 10000, label: 'Rp10.000', type: 'kertas', bgHex: '#d8b4fe', inkHex: '#581c87' },
  { value: 5000, label: 'Rp5.000', type: 'kertas', bgHex: '#fde047', inkHex: '#713f12' },
  { value: 2000, label: 'Rp2.000', type: 'kertas', bgHex: '#cbd5e1', inkHex: '#1e293b' },
  { value: 1000, label: 'Rp1.000', type: 'kertas', bgHex: '#fef08a', inkHex: '#3f6212' },
  { value: 1000, label: 'Rp1.000 (Logam)', type: 'logam', bgHex: '#e2e8f0', inkHex: '#0f172a' },
  { value: 500, label: 'Rp500', type: 'logam', bgHex: '#f1f5f9', inkHex: '#0f172a' },
  { value: 200, label: 'Rp200', type: 'logam', bgHex: '#f1f5f9', inkHex: '#0f172a' },
  { value: 100, label: 'Rp100', type: 'logam', bgHex: '#f8fafc', inkHex: '#0f172a' }
]

export function formatRupiah(amount: number): string {
  const clean = Math.round(amount)
  return `Rp${clean.toLocaleString('id-ID')}`
}

export function breakdownRupiah(amount: number): { value: number, count: number }[] {
  let rem = Math.max(0, Math.floor(amount))
  const uniqueValues = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100]
  const out: { value: number, count: number }[] = []
  for (const val of uniqueValues) {
    if (rem >= val) {
      const count = Math.floor(rem / val)
      out.push({ value: val, count })
      rem %= val
    }
  }
  return out
}

