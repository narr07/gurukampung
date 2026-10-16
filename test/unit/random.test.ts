import { describe, expect, it } from 'vitest'
import { mulberry32, randomInt, shuffle } from '~/utils/random'
import { CUBE_FLAPS, CUBE_NET, PIPS, rollDice, spin } from '~/utils/dice'

describe('random', () => {
  it('seed yang sama menghasilkan urutan yang sama', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b))
  })

  it('randomInt selalu di dalam rentang', () => {
    const rng = mulberry32(1)
    const values = Array.from({ length: 2000 }, () => randomInt(rng, 1, 6))
    expect(Math.min(...values)).toBe(1)
    expect(Math.max(...values)).toBe(6)
  })

  it('shuffle tidak mengubah isi dan tidak mengubah array asli', () => {
    const items = [1, 2, 3, 4, 5]
    const out = shuffle(mulberry32(7), items)
    expect([...out].sort()).toEqual(items)
    expect(items).toEqual([1, 2, 3, 4, 5])
  })
})

describe('dadu', () => {
  it('jumlah dadu sesuai dan semua mata 1 sampai 6', () => {
    const r = rollDice(mulberry32(3), 4)
    expect(r).toHaveLength(4)
    expect(r.every(n => n >= 1 && n <= 6)).toBe(true)
  })

  it('setiap mata dadu muncul kira-kira sama sering', () => {
    const counts = Array(7).fill(0)
    for (const n of rollDice(mulberry32(9), 60_000)) counts[n]++
    for (let f = 1; f <= 6; f++) expect(counts[f] / 60_000).toBeCloseTo(1 / 6, 1)
  })

  it('spinner kosong tidak menghasilkan apa-apa', () => {
    expect(spin(mulberry32(1), [])).toBeUndefined()
  })

  it('jaring-jaring: enam sisi, sisi berseberangan berjumlah 7', () => {
    expect(CUBE_NET.map(f => f.face).sort()).toEqual([1, 2, 3, 4, 5, 6])
    const at = (col: number, row: number) => CUBE_NET.find(f => f.col === col && f.row === row)!.face
    expect(at(1, 0) + at(1, 2)).toBe(7)
    expect(at(0, 1) + at(2, 1)).toBe(7)
    expect(at(1, 1) + at(3, 1)).toBe(7)
  })
  it('lidah lem: tujuh, dan masing-masing di sisi luar jaring-jaring', () => {
    expect(CUBE_FLAPS).toHaveLength(7)
    const occupied = new Set(CUBE_NET.map(f => `${f.col},${f.row}`))
    const step = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] } as const
    for (const flap of CUBE_FLAPS) {
      const f = CUBE_NET.find(n => n.face === flap.face)!
      const [dc, dr] = step[flap.edge]
      expect(occupied.has(`${f.col + dc},${f.row + dr}`)).toBe(false)
    }
  })

  it('jumlah titik sesuai angka mata dadu', () => {
    for (let n = 1; n <= 6; n++) expect(PIPS[n]).toHaveLength(n)
  })
})
