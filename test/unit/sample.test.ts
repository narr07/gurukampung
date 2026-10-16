import { describe, expect, it } from 'vitest'
import { finalScore } from '~/utils/grades'
import { sampleAttendance, sampleGradeBook, sampleMasteryBook, sampleSchoolDays, sampleStudents } from '~/utils/sample'

let n = 0
const students = sampleStudents(() => `s${++n}`)

describe('kelas contoh', () => {
  it('berisi 24 siswa bernomor urut dengan nama panggilan', () => {
    expect(students).toHaveLength(24)
    expect(students[0]).toMatchObject({ name: 'Adi Nugroho', nickname: 'Adi', gender: 'L', number: 1 })
    expect(students.at(-1)?.number).toBe(24)
  })

  it('mengisi tiga nilai untuk setiap siswa, antara 40 dan 100', () => {
    const book = sampleGradeBook(students)
    for (const s of students) {
      const row = book.scores[s.id]!
      for (const v of [row.slm, row.sts, row.sas]) {
        expect(v).toBeGreaterThanOrEqual(40)
        expect(v).toBeLessThanOrEqual(100)
      }
    }
  })

  it('selalu menghasilkan nilai yang sama, dan ada siswa di bawah maupun di atas KKTP', () => {
    expect(sampleGradeBook(students)).toEqual(sampleGradeBook(students))
    const book = sampleGradeBook(students)
    const finals = students.map(s => finalScore(book.scores[s.id]!, book.components)!)
    expect(finals.some(v => v < 75)).toBe(true)
    expect(finals.some(v => v >= 90)).toBe(true)
  })

  it('mengisi nilai ketuntasan untuk kedua TP', () => {
    const book = sampleMasteryBook(students)
    expect(book.tps.map(t => t.id)).toEqual(['tp-1', 'tp-2'])
    expect(Object.keys(book.scores)).toHaveLength(24)
  })

  it('hanya mengisi absensi di hari sekolah, sampai hari ini', () => {
    const today = new Date(2026, 9, 16)
    const days = sampleSchoolDays(today)
    expect(days[0]).toBe('2026-09-01')
    expect(days.at(-1)).toBe('2026-10-16')
    expect(days).not.toContain('2026-10-17') // Sabtu
    expect(days).not.toContain('2026-10-11') // Minggu

    const book = sampleAttendance(students, today)
    expect(Object.keys(book)).toEqual(days)
    const statuses = Object.values(book).flatMap(day => Object.values(day))
    const hadir = statuses.filter(s => s === 'H').length / statuses.length
    expect(hadir).toBeGreaterThan(0.8)
    expect(new Set(statuses)).toEqual(new Set(['H', 'S', 'I', 'A']))
  })
})
