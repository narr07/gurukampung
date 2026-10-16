import { shuffle, type Rng } from './random'
import type { Gender } from './roster'

export interface GroupMember {
  id: string
  name: string
  gender?: Gender
  score?: number
}

export type GroupMode = 'acak' | 'gender' | 'nilai'

// Jumlah kelompok dari pilihan guru: langsung jumlah kelompok, atau jumlah anggota per kelompok
export function groupCount(total: number, by: 'kelompok' | 'anggota', value: number) {
  const v = Math.max(1, Math.floor(value))
  const n = by === 'kelompok' ? v : Math.ceil(total / v)
  return Math.max(1, Math.min(n, total))
}

// Pembagian ular (1,2,3,3,2,1,...) supaya kelompok pertama tidak selalu mendapat yang terbaik
function snake<T>(items: T[], n: number): T[][] {
  const groups: T[][] = Array.from({ length: n }, () => [])
  items.forEach((item, i) => {
    const round = Math.floor(i / n)
    const pos = i % n
    groups[round % 2 === 0 ? pos : n - 1 - pos]!.push(item)
  })
  return groups
}

export function makeGroups(rng: Rng, members: GroupMember[], n: number, mode: GroupMode): GroupMember[][] {
  if (members.length === 0) return []
  const mixed = shuffle(rng, members)

  if (mode === 'gender') {
    // Laki-laki dibagi dulu, lalu perempuan melanjutkan dari kelompok berikutnya, sehingga tiap kelompok seimbang
    const order = [...mixed.filter(m => m.gender === 'L'), ...mixed.filter(m => m.gender === 'P'), ...mixed.filter(m => !m.gender)]
    const groups: GroupMember[][] = Array.from({ length: n }, () => [])
    order.forEach((m, i) => groups[i % n]!.push(m))
    return groups
  }

  if (mode === 'nilai') {
    // Siswa tanpa nilai diletakkan di tengah urutan supaya tidak menumpuk di satu kelompok
    const scored = mixed.filter(m => typeof m.score === 'number').sort((a, b) => b.score! - a.score!)
    const unscored = mixed.filter(m => typeof m.score !== 'number')
    const mid = Math.floor(scored.length / 2)
    return snake([...scored.slice(0, mid), ...unscored, ...scored.slice(mid)], n)
  }

  const groups: GroupMember[][] = Array.from({ length: n }, () => [])
  mixed.forEach((m, i) => groups[i % n]!.push(m))
  return groups
}

export function average(group: GroupMember[]) {
  const s = group.filter(m => typeof m.score === 'number')
  return s.length ? s.reduce((a, m) => a + m.score!, 0) / s.length : undefined
}
