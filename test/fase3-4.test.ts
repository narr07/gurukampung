import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../app/utils/random'
import {
  assignSeats,
  swapSeats,
  makePiketSchedule,
  parseCrosswordLines,
  generateCrossword,
  simplifyFraction,
  compareFractions,
  equivalentFractions,
  buildNumberLineTicks
} from '../app/utils/fase3'
import {
  analyzeMultipleChoice,
  generateBingoSet,
  formatRupiah,
  breakdownRupiah
} from '../app/utils/fase4'

describe('Fase 3 logic utilities', () => {
  it('assigns and swaps seats accurately', () => {
    const seats = assignSeats(mulberry32(42), ['s1', 's2', 's3'], 5, false)
    expect(seats).toEqual(['s1', 's2', 's3', null, null])
    const swapped = swapSeats(seats, 0, 3)
    expect(swapped).toEqual([null, 's2', 's3', 's1', null])
  })

  it('rotates piket schedule across weeks', () => {
    const students = ['Ani', 'Budi', 'Citra', 'Dedi', 'Eka']
    const week1 = makePiketSchedule(students, 5, 1)
    const week2 = makePiketSchedule(students, 5, 2)
    expect(week1[0]!.members).toEqual(['Ani'])
    expect(week2[1]!.members).toEqual(['Ani'])
  })

  it('generates an intersecting crossword grid', () => {
    const inputs = parseCrosswordLines('INDONESIA: Negara kita\nMERDEKA: Bebas dari penjajahan\nPANCASILA: Dasar negara')
    expect(inputs.length).toBe(3)
    const puzzle = generateCrossword(inputs)
    expect(puzzle.placed.length).toBeGreaterThanOrEqual(2)
    expect(puzzle.rows).toBeGreaterThan(0)
    expect(puzzle.cols).toBeGreaterThan(0)
  })

  it('simplifies and compares fractions', () => {
    expect(simplifyFraction(6, 8)).toEqual({ num: 3, den: 4 })
    expect(compareFractions(1, 2, 2, 4)).toBe('=')
    expect(compareFractions(3, 4, 1, 2)).toBe('>')
    expect(equivalentFractions(2, 3, 3)).toEqual([
      { num: 2, den: 3 },
      { num: 4, den: 6 },
      { num: 6, den: 9 }
    ])
  })

  it('builds number line ticks including negatives', () => {
    expect(buildNumberLineTicks(-3, 2)).toEqual([-3, -2, -1, 0, 1, 2])
  })
})

describe('Fase 4 logic utilities', () => {
  it('computes multiple-choice item difficulty and discrimination', () => {
    const keys = ['A', 'B', 'C', 'D']
    const rows = [
      { studentName: 'S1', answers: ['A', 'B', 'C', 'D'] },
      { studentName: 'S2', answers: ['A', 'B', 'C', 'A'] },
      { studentName: 'S3', answers: ['A', 'A', 'A', 'A'] },
      { studentName: 'S4', answers: ['B', 'A', 'A', 'A'] }
    ]
    const analysis = analyzeMultipleChoice(keys, rows, 75)
    expect(analysis.studentScores[0]!.score).toBe(100)
    expect(analysis.itemStats[0]!.difficultyIndex).toBe(0.75)
    expect(analysis.classicalMasteryPercent).toBe(50)
  })

  it('generates bingo cards with free center', () => {
    const items = Array.from({ length: 25 }, (_, i) => `${i + 1}`)
    const set = generateBingoSet(mulberry32(7), items, 5, 3, true)
    expect(set.cards).toHaveLength(3)
    expect(set.cards[0]!.cells[2]![2]).toBe('BEBAS')
  })

  it('formats and breaks down Rupiah denominations', () => {
    expect(formatRupiah(17500)).toContain('17.500')
    expect(breakdownRupiah(76500)).toEqual([
      { value: 50000, count: 1 },
      { value: 20000, count: 1 },
      { value: 5000, count: 1 },
      { value: 1000, count: 1 },
      { value: 500, count: 1 }
    ])
  })
})

