import type { Gender, Student } from './roster'

// Data dummy untuk mencoba alat sebelum guru mengisi kelas sendiri. Kelasnya diberi label jelas
// "data dummy" supaya tidak tertukar dengan kelas sungguhan
export const SAMPLE_CLASS_NAME = 'Kelas Contoh (data dummy)'

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
