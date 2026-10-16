// Nilai rapor: setiap komponen punya bobot (persen). Istilah mengikuti Kurikulum Merdeka
// (sumatif lingkup materi, STS, SAS) dan labelnya bisa diganti guru

export interface GradeComponent {
  id: string
  label: string
  weight: number
}

export const DEFAULT_COMPONENTS: GradeComponent[] = [
  { id: 'slm', label: 'Sumatif lingkup materi', weight: 50 },
  { id: 'sts', label: 'STS', weight: 25 },
  { id: 'sas', label: 'SAS', weight: 25 }
]

export type ScoreRow = Record<string, number | null | undefined>

// Komponen yang belum diisi tidak dihitung, dan bobot sisanya dinormalkan.
// Hasil undefined kalau belum ada satu pun nilai
export function finalScore(scores: ScoreRow, components: GradeComponent[], decimals = 0) {
  let sum = 0
  let weight = 0
  for (const c of components) {
    const v = scores[c.id]
    if (typeof v !== 'number' || Number.isNaN(v) || c.weight <= 0) continue
    sum += v * c.weight
    weight += c.weight
  }
  if (weight === 0) return undefined
  const f = 10 ** decimals
  return Math.round((sum / weight) * f) / f
}

export function totalWeight(components: GradeComponent[]) {
  return components.reduce((a, c) => a + (c.weight > 0 ? c.weight : 0), 0)
}

// Satu kolom nilai yang disalin dari spreadsheet: satu angka per baris, mengikuti urutan siswa.
// Koma desimal (85,5) diterima; baris kosong berarti nilai kosong
export function parseScoreColumn(text: string): (number | null)[] {
  const lines = text.replace(/\r/g, '').split('\n')
  while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop()
  return lines.map((line) => {
    const t = line.trim().replace(',', '.')
    if (!t) return null
    const n = Number(t)
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : null
  })
}

export function toCsv(rows: (string | number | undefined | null)[][]) {
  const cell = (v: string | number | undefined | null) => {
    const s = v === undefined || v === null ? '' : String(v)
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  // Pemisah titik koma supaya Excel versi Indonesia langsung memisah kolom
  return rows.map(r => r.map(cell).join(';')).join('\r\n')
}
