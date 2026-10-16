import { randomInt, type Rng } from './random'

export function rollDice(rng: Rng, count: number, sides = 6) {
  return Array.from({ length: count }, () => randomInt(rng, 1, sides))
}

// Spinner dengan isi bebas: setiap pilihan punya peluang sama
export function spin<T>(rng: Rng, options: readonly T[]) {
  if (options.length === 0) return undefined
  const index = Math.floor(rng() * options.length)
  return { index, value: options[index]! }
}

// Jaring-jaring kubus bentuk salib (1-4-1) untuk dicetak, digunting, dan dilipat.
// Posisi [kolom, baris] dalam grid 4 x 3; angka berseberangan selalu berjumlah 7 seperti dadu asli
export const CUBE_NET: { face: number, col: number, row: number }[] = [
  { face: 1, col: 1, row: 0 },
  { face: 2, col: 0, row: 1 },
  { face: 3, col: 1, row: 1 },
  { face: 5, col: 2, row: 1 },
  { face: 4, col: 3, row: 1 },
  { face: 6, col: 1, row: 2 }
]

export type Edge = 'top' | 'right' | 'bottom' | 'left'

// Tujuh lidah lem, satu untuk setiap pasangan sisi yang bertemu saat dilipat.
// Semuanya diletakkan di baris tengah supaya mudah digunting
export const CUBE_FLAPS: { face: number, edge: Edge }[] = [
  { face: 2, edge: 'top' },
  { face: 2, edge: 'bottom' },
  { face: 5, edge: 'top' },
  { face: 5, edge: 'bottom' },
  { face: 4, edge: 'top' },
  { face: 4, edge: 'bottom' },
  { face: 4, edge: 'right' }
]

// Posisi titik mata dadu pada kotak 3 x 3 (0 = kiri/atas, 2 = kanan/bawah)
export const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]]
}
