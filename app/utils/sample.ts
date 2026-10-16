import type { AttendanceBook, AttendanceStatus } from './attendance'
import { dateKey } from './attendance'
import { DEFAULT_COMPONENTS, type GradeComponent, type ScoreRow } from './grades'
import type { TpItem } from './predikat'
import { mulberry32, type Rng } from './random'
import type { Gender, Student } from './roster'

// Data dummy untuk mencoba alat sebelum guru mengisi kelas sendiri. Kelasnya diberi label jelas
// "data dummy" supaya tidak tertukar dengan kelas sungguhan
export const SAMPLE_CLASS_NAME = 'Kelas Contoh (data dummy)'

// Seed tetap: setiap kelas contoh berisi nilai dan absensi yang sama, sehingga mudah dibandingkan dan diuji
const SAMPLE_SEED = 20261016

const SAMPLE: [string, Gender][] = [
  ['Adi Nugroho', 'L'], ['Aisyah Putri', 'P'], ['Bagas Pratama', 'L'], ['Bunga Lestari', 'P'],
  ['Citra Maharani', 'P'], ['Dimas Saputra', 'L'], ['Eka Wulandari', 'P'], ['Fajar Hidayat', 'L'],
  ['Gita Anggraini', 'P'], ['Hafiz Ramadhan', 'L'], ['Intan Permata', 'P'], ['Joko Susilo', 'L'],
  ['Kirana Ayu', 'P'], ['Lukman Hakim', 'L'], ['Maya Sari', 'P'], ['Nanda Firmansyah', 'L'],
  ['Oki Setiawan', 'L'], ['Putri Rahmawati', 'P'], ['Raka Aditya', 'L'], ['Salsabila Nur', 'P'],
  ['Tegar Wibowo', 'L'], ['Umi Kalsum', 'P'], ['Vino Kurniawan', 'L'], ['Wulan Safitri', 'P']
]

export function sampleStudents(makeId: () => string): Student[] {
  return SAMPLE.map(([name, gender], i) => ({
    id: makeId(),
    name,
    nickname: name.split(' ')[0],
    gender,
    number: i + 1
  }))
}

// Kemampuan dasar tiap siswa (55 sampai 95). Nilai rapor dan ketuntasan diturunkan dari angka ini,
// jadi siswa yang nilai rapornya rendah juga cenderung belum tuntas
function abilities(rng: Rng, students: Student[]) {
  return new Map(students.map(s => [s.id, 55 + rng() * 40]))
}

const around = (rng: Rng, base: number, spread: number) =>
  Math.round(Math.max(40, Math.min(100, base + (rng() * 2 - 1) * spread)))

export interface SampleGradeBook {
  components: GradeComponent[]
  scores: Record<string, ScoreRow>
}

export function sampleGradeBook(students: Student[], seed = SAMPLE_SEED): SampleGradeBook {
  const rng = mulberry32(seed)
  const ability = abilities(rng, students)
  const scores: Record<string, ScoreRow> = {}
  for (const s of students) {
    const base = ability.get(s.id)!
    scores[s.id] = { slm: around(rng, base, 6), sts: around(rng, base, 10), sas: around(rng, base, 10) }
  }
  return { components: DEFAULT_COMPONENTS.map(c => ({ ...c })), scores }
}

export interface SampleMasteryBook {
  kktp: number
  enrichmentMin: number
  tps: TpItem[]
  scores: Record<string, Record<string, number | null>>
}

export function sampleMasteryBook(students: Student[], seed = SAMPLE_SEED): SampleMasteryBook {
  const rng = mulberry32(seed)
  const ability = abilities(rng, students)
  const tps: TpItem[] = [
    { id: 'tp-1', code: 'TP 1', text: 'Menjumlahkan dan mengurangkan bilangan cacah sampai 1.000' },
    { id: 'tp-2', code: 'TP 2', text: 'Menyelesaikan soal cerita operasi hitung campuran' }
  ]
  const scores: Record<string, Record<string, number | null>> = {}
  for (const s of students) {
    const base = ability.get(s.id)!
    // Soal cerita (TP 2) sedikit lebih sulit, supaya ada siswa yang tuntas TP 1 tapi belum TP 2
    scores[s.id] = { 'tp-1': around(rng, base + 4, 8), 'tp-2': around(rng, base - 4, 10) }
  }
  return { kktp: 75, enrichmentMin: 90, tps, scores }
}

// Hari sekolah (Senin sampai Jumat) dari awal bulan lalu sampai hari ini
export function sampleSchoolDays(today: Date) {
  const days: string[] = []
  const d = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  while (d <= today) {
    const weekday = d.getDay()
    if (weekday !== 0 && weekday !== 6) days.push(dateKey(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Sebagian besar hadir. Sakit, izin, dan alpa muncul sesekali, dengan beberapa siswa yang lebih sering absen
export function sampleAttendance(students: Student[], today = new Date(), seed = SAMPLE_SEED): AttendanceBook {
  const rng = mulberry32(seed + 1)
  const oftenAbsent = new Set(students.filter(() => rng() < 0.15).map(s => s.id))
  const book: AttendanceBook = {}
  for (const day of sampleSchoolDays(today)) {
    const entries: Record<string, AttendanceStatus> = {}
    for (const s of students) {
      const r = rng() * (oftenAbsent.has(s.id) ? 0.5 : 1)
      entries[s.id] = r < 0.02 ? 'A' : r < 0.05 ? 'I' : r < 0.09 ? 'S' : 'H'
    }
    book[day] = entries
  }
  return book
}
