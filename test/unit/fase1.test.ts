import { describe, expect, it } from 'vitest'
import { mulberry32 } from '~/utils/random'
import { average, groupCount, makeGroups, type GroupMember } from '~/utils/groups'
import { DEFAULT_COMPONENTS, finalScore, parseScoreColumn, toCsv } from '~/utils/grades'
import { monthRange, schoolDays, summarize, type AttendanceBook } from '~/utils/attendance'
import { makeWorksheet } from '~/utils/worksheet'

const members = (n: number, withGender = false): GroupMember[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, name: `Siswa ${i}`, gender: withGender ? (i % 3 === 0 ? 'P' : 'L') : undefined, score: 50 + i }))

describe('pembagi kelompok', () => {
  it('jumlah kelompok dari jumlah anggota dibulatkan ke atas', () => {
    expect(groupCount(29, 'anggota', 4)).toBe(8)
    expect(groupCount(29, 'kelompok', 5)).toBe(5)
    expect(groupCount(3, 'kelompok', 10)).toBe(3)
  })

  it('semua siswa masuk tepat satu kali dan ukuran kelompok selisih paling banyak 1', () => {
    for (const mode of ['acak', 'gender', 'nilai'] as const) {
      const g = makeGroups(mulberry32(5), members(29, true), 6, mode)
      const ids = g.flat().map(m => m.id).sort()
      expect(ids).toEqual(members(29).map(m => m.id).sort())
      const sizes = g.map(x => x.length)
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
    }
  })

  it('mode gender: jumlah perempuan per kelompok selisih paling banyak 1', () => {
    const g = makeGroups(mulberry32(2), members(30, true), 5, 'gender')
    const p = g.map(x => x.filter(m => m.gender === 'P').length)
    expect(Math.max(...p) - Math.min(...p)).toBeLessThanOrEqual(1)
  })

  it('mode nilai: rata-rata kelompok berdekatan', () => {
    const g = makeGroups(mulberry32(8), members(30), 5, 'nilai')
    const avg = g.map(x => average(x)!)
    expect(Math.max(...avg) - Math.min(...avg)).toBeLessThan(3)
  })

  it('seed sama, hasil sama', () => {
    const a = makeGroups(mulberry32(11), members(20), 4, 'acak').map(g => g.map(m => m.id))
    const b = makeGroups(mulberry32(11), members(20), 4, 'acak').map(g => g.map(m => m.id))
    expect(a).toEqual(b)
  })
})

describe('nilai rapor', () => {
  it('bobot 50/25/25', () => {
    expect(finalScore({ slm: 80, sts: 70, sas: 90 }, DEFAULT_COMPONENTS)).toBe(80)
  })

  it('komponen kosong tidak dihitung, bobot dinormalkan', () => {
    expect(finalScore({ slm: 80, sts: 60 }, DEFAULT_COMPONENTS)).toBe(73)
    expect(finalScore({}, DEFAULT_COMPONENTS)).toBeUndefined()
  })

  it('kolom tempelan: koma desimal, baris kosong, batas 0-100', () => {
    expect(parseScoreColumn('85,5\n\n120\nabc\n70\n')).toEqual([85.5, null, 100, null, 70])
  })

  it('CSV memakai titik koma dan meng-escape tanda kutip', () => {
    expect(toCsv([['Nama', 'Nilai'], ['Budi "Kecil"', 80]])).toBe('Nama;Nilai\r\n"Budi ""Kecil""";80')
  })
})

describe('absensi', () => {
  const book: AttendanceBook = {
    '2026-10-01': { a: 'H', b: 'S' },
    '2026-10-02': { a: 'H', b: 'H' },
    '2026-10-03': { a: 'A' },
    '2026-11-01': { a: 'H' }
  }

  it('rekap bulanan dan persentase', () => {
    const { from, to } = monthRange(2026, 9)
    expect(from).toBe('2026-10-01')
    expect(to).toBe('2026-10-31')
    expect(summarize(book, 'a', from, to)).toEqual({ H: 2, S: 0, I: 0, A: 1, days: 3, percent: 66.7 })
    expect(summarize(book, 'b', from, to).percent).toBe(50)
  })

  it('hari efektif hanya tanggal yang punya catatan', () => {
    expect(schoolDays(book, '2026-10-01', '2026-10-31')).toEqual(['2026-10-01', '2026-10-02', '2026-10-03'])
  })
})

describe('lembar kerja matematika', () => {
  it('jumlah soal dan jawaban benar', () => {
    const ws = makeWorksheet(mulberry32(4), { operations: ['+', '-', '×', ':'], min: 1, max: 12, count: 40, noNegative: true, noRemainder: true })
    expect(ws).toHaveLength(40)
    for (const p of ws) {
      if (p.op === '+') expect(p.answer).toBe(p.a + p.b)
      if (p.op === '-') {
        expect(p.answer).toBe(p.a - p.b)
        expect(p.answer).toBeGreaterThanOrEqual(0)
      }
      if (p.op === '×') expect(p.answer).toBe(p.a * p.b)
      if (p.op === ':') {
        expect(p.a % p.b).toBe(0)
        expect(p.a / p.b).toBe(p.answer)
      }
    }
  })

  it('pembagian bersisa kalau diizinkan', () => {
    const ws = makeWorksheet(mulberry32(9), { operations: [':'], min: 10, max: 50, count: 30, noNegative: true, noRemainder: false })
    for (const p of ws) expect(p.answer * p.b + (p.remainder ?? 0)).toBe(p.a)
  })
})
