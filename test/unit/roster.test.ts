import { describe, expect, it } from 'vitest'
import { parseRoster, tidyName } from '~/utils/roster'

describe('parseRoster', () => {
  it('membaca tempelan dari Excel dengan baris judul', () => {
    const text = 'No\tNama\tL/P\n1\tBUDI SANTOSO\tL\n2\tsiti aminah\tP\n'
    expect(parseRoster(text).students).toEqual([
      { name: 'Budi Santoso', number: 1, gender: 'L' },
      { name: 'Siti Aminah', number: 2, gender: 'P' }
    ])
  })

  it('urutan kolom berbeda dan NISN diabaikan', () => {
    const text = 'Rina Kartika\tP\t0012345678\t3'
    expect(parseRoster(text).students[0]).toEqual({ name: 'Rina Kartika', number: 3, gender: 'P' })
  })

  it('satu nama per baris tanpa kolom lain', () => {
    expect(parseRoster('Ahmad\nDewi Lestari').students.map(s => s.name)).toEqual(['Ahmad', 'Dewi Lestari'])
  })

  it('diketik dengan spasi tunggal: "1 Budi Santoso L"', () => {
    expect(parseRoster('1 Budi Santoso L\n2. Siti Aminah P').students).toEqual([
      { name: 'Budi Santoso', number: 1, gender: 'L' },
      { name: 'Siti Aminah', number: 2, gender: 'P' }
    ])
  })

  it('baris tanpa nama dicatat sebagai dilewati', () => {
    const r = parseRoster('4\tL')
    expect(r.students).toHaveLength(0)
    expect(r.skipped).toEqual(['4\tL'])
  })
})

describe('tidyName', () => {
  it('nama campuran huruf besar-kecil dibiarkan', () => {
    expect(tidyName('McDonald van Basten')).toBe('McDonald van Basten')
  })

  it('apostrof dan tanda hubung', () => {
    expect(tidyName('NUR\'AINI SITI-RAHMA')).toBe('Nur\'Aini Siti-Rahma')
  })
})
