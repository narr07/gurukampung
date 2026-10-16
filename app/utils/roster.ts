export type Gender = 'L' | 'P'

export interface Student {
  id: string
  name: string
  nickname?: string
  gender?: Gender
  number?: number
}

export interface ParsedRoster {
  students: Omit<Student, 'id'>[]
  skipped: string[]
}

const GENDER_WORDS: Record<string, Gender> = {
  'l': 'L', 'lk': 'L', 'laki': 'L', 'laki-laki': 'L', 'putra': 'L',
  'p': 'P', 'pr': 'P', 'perempuan': 'P', 'putri': 'P'
}

const HEADER_WORDS = /^(no\.?|nomor|nama|nama siswa|nama lengkap|l\/p|jk|jenis kelamin|nisn|nis)$/i

// Daftar siswa biasanya ditempel dari Excel atau Google Sheets (kolom dipisah tab),
// atau diketik satu nama per baris. Urutan kolom bisa berbeda-beda, jadi tiap sel dikenali dari isinya:
// angka kecil = nomor absen, L/P = jenis kelamin, teks terpanjang = nama
export function parseRoster(text: string): ParsedRoster {
  const students: ParsedRoster['students'] = []
  const skipped: string[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    let cells = line.split(/\t|;|\s{2,}/).map(c => c.trim()).filter(Boolean)
    // Diketik dengan spasi tunggal, misalnya "1 Budi Santoso L": pisahkan nomor di depan dan L/P di belakang
    if (cells.length === 1) {
      const m = line.match(/^(\d{1,3})[.)]?\s+(.+?)(?:\s+(L|P|LK|PR))?$/i)
        ?? line.match(/^(.+?)\s+(L|P|LK|PR)$/i)
      if (m) cells = m.slice(1).filter((c): c is string => Boolean(c))
    }
    if (cells.every(c => HEADER_WORDS.test(c))) continue

    let number: number | undefined
    let gender: Gender | undefined
    const texts: string[] = []

    for (const cell of cells) {
      const lower = cell.toLowerCase().replace(/\.$/, '')
      if (number === undefined && /^\d{1,3}$/.test(lower)) {
        number = Number(lower)
      } else if (gender === undefined && lower in GENDER_WORDS) {
        gender = GENDER_WORDS[lower]
      } else if (/^\d{4,}$/.test(lower)) {
        // NIS atau NISN: tidak disimpan
      } else {
        texts.push(cell)
      }
    }

    const name = texts.sort((a, b) => b.length - a.length)[0]
    if (!name) {
      skipped.push(rawLine)
      continue
    }
    students.push({ name: tidyName(name), number, gender })
  }

  return { students, skipped }
}

// "BUDI SANTOSO" atau "budi santoso" jadi "Budi Santoso"; nama yang sudah campuran huruf besar-kecil dibiarkan
export function tidyName(name: string) {
  const clean = name.replace(/\s+/g, ' ').trim()
  const isSingleCase = clean === clean.toUpperCase() || clean === clean.toLowerCase()
  if (!isSingleCase) return clean
  return clean.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}
