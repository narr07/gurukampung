import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../app/utils/random'
import { buildReportDescription, checkMastery, DEFAULT_PREDICATES, toPredicate } from '../app/utils/predikat'
import { cleanWords, generateWordSearch } from '../app/utils/wordsearch'
import { buildQuizPackage } from '../app/utils/quiz'

describe('predikat & ketuntasan', () => {
  it('mengubah angka menjadi predikat sesuai rentang bawaan', () => {
    expect(toPredicate(95, DEFAULT_PREDICATES)?.grade).toBe('A')
    expect(toPredicate(85, DEFAULT_PREDICATES)?.grade).toBe('B')
    expect(toPredicate(75, DEFAULT_PREDICATES)?.grade).toBe('C')
    expect(toPredicate(60, DEFAULT_PREDICATES)?.grade).toBe('D')
  })

  it('menentukan status ketuntasan KKTP', () => {
    expect(checkMastery(68, 75, 90)).toBe('remedial')
    expect(checkMastery(80, 75, 90)).toBe('tuntas')
    expect(checkMastery(92, 75, 90)).toBe('pengayaan')
  })

  it('menyusun kalimat deskripsi rapor dari TP yang dikuasai dan perlu bimbingan', () => {
    const text = buildReportDescription('Budi', ['membaca nyaring'], ['menulis tegak bersambung'])
    expect(text).toContain('Ananda Budi menunjukkan penguasaan yang baik dalam membaca nyaring.')
    expect(text).toContain('Perlu bimbingan dan pendampingan lebih lanjut dalam menulis tegak bersambung.')
  })
})

describe('wordsearch (cari-kata)', () => {
  it('membersihkan daftar kosakata dan menyusun grid deterministik dengan seed', () => {
    const words = cleanWords('Pancasila\nMusyawarah\nPancasila')
    expect(words).toEqual(['PANCASILA', 'MUSYAWARAH'])

    const p1 = generateWordSearch(mulberry32(42), words, ['mendatar', 'menurun'])
    const p2 = generateWordSearch(mulberry32(42), words, ['mendatar', 'menurun'])
    expect(p1.grid).toEqual(p2.grid)
    expect(p1.placed.length).toBe(2)
    expect(p1.unplaced.length).toBe(0)
  })
})

describe('quiz (kuis-pg)', () => {
  it('menyusun Paket A dan B secara deterministik beserta kunci jawaban yang tepat', () => {
    const sample = [
      {
        id: '1',
        stem: '2 + 3 = ...',
        options: ['5', '4', '6', '7'] as [string, string, string, string],
        correctIndex: 0 as const
      }
    ]
    const pkg = buildQuizPackage(mulberry32(123), sample, true, true)
    expect(pkg).toHaveLength(1)
    const q = pkg[0]!
    const chosen = q.options.find(o => o.letter === q.answerLetter)
    expect(chosen?.text).toBe('5')
  })
})

