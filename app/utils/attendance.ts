// H = hadir, S = sakit, I = izin, A = alpa (tanpa keterangan)
export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  H: 'Hadir',
  S: 'Sakit',
  I: 'Izin',
  A: 'Alpa'
}

// Kunci tanggal YYYY-MM-DD -> id siswa -> status
export type AttendanceBook = Record<string, Record<string, AttendanceStatus>>

export function dateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export interface AttendanceSummary {
  H: number
  S: number
  I: number
  A: number
  days: number
  percent: number | undefined
}

// Hari efektif = tanggal yang punya catatan absensi di rentang itu (hari libur tidak dicatat).
// Siswa tanpa catatan di hari efektif dianggap belum diisi, bukan alpa
export function summarize(book: AttendanceBook, studentId: string, from: string, to: string): AttendanceSummary {
  const s: AttendanceSummary = { H: 0, S: 0, I: 0, A: 0, days: 0, percent: undefined }
  for (const [day, entries] of Object.entries(book)) {
    if (day < from || day > to) continue
    const st = entries[studentId]
    if (!st) continue
    s[st]++
    s.days++
  }
  s.percent = s.days ? Math.round((s.H / s.days) * 1000) / 10 : undefined
  return s
}

export function schoolDays(book: AttendanceBook, from: string, to: string) {
  return Object.keys(book).filter(d => d >= from && d <= to && Object.keys(book[d]!).length > 0).sort()
}

export function monthRange(year: number, month: number) {
  const last = new Date(year, month + 1, 0).getDate()
  const m = String(month + 1).padStart(2, '0')
  return { from: `${year}-${m}-01`, to: `${year}-${m}-${String(last).padStart(2, '0')}` }
}
