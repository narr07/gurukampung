// Daftar lengkap alat Guru Kampung, sumbernya okf/katalog-tools.md.
// Alat dianggap tersedia kalau folder app/tools/<slug>/ punya Tool.vue (lihat registry.ts)

export type ToolCategory = 'kelas' | 'penilaian' | 'bahan-ajar' | 'peraga' | 'dokumen'
export type ToolPriority = 1 | 2 | 3
export type ToolNeed = 'kelas' | 'cetak' | 'proyektor' | 'mik' | 'audio'
// Alat berbayar memakai AI dan dibuka dengan langganan (okf/alat-berbayar.md)
export type ToolTier = 'gratis' | 'berbayar'

export interface ToolInfo {
  slug: string
  name: string
  summary: string
  icon: string
  category: ToolCategory
  priority: ToolPriority
  phase: number
  needs: ToolNeed[]
  tier?: ToolTier
}

export const CATEGORIES: { id: ToolCategory, name: string }[] = [
  { id: 'kelas', name: 'Manajemen Kelas' },
  { id: 'penilaian', name: 'Penilaian & Administrasi' },
  { id: 'bahan-ajar', name: 'Pembuat Bahan Ajar' },
  { id: 'peraga', name: 'Alat Peraga Digital' },
  { id: 'dokumen', name: 'Dokumen & Template' }
]

export const TOOLS: ToolInfo[] = [
  // Manajemen Kelas
  { slug: 'pemilih-acak', name: 'Pemilih Siswa Acak', summary: 'Roda putar atau kartu acak untuk menunjuk siswa, tanpa mengulang yang sudah terpilih.', icon: 'i-lucide-hand', category: 'kelas', priority: 1, phase: 1, needs: ['kelas', 'proyektor', 'audio'] },
  { slug: 'pembagi-kelompok', name: 'Pembagi Kelompok', summary: 'Bagi kelas secara acak, seimbang laki-laki dan perempuan, atau seimbang nilai.', icon: 'i-lucide-users', category: 'kelas', priority: 1, phase: 1, needs: ['kelas', 'proyektor', 'cetak'] },
  { slug: 'timer', name: 'Timer & Stopwatch Kelas', summary: 'Angka besar untuk proyektor, dengan bunyi saat waktu habis.', icon: 'i-lucide-timer', category: 'kelas', priority: 1, phase: 1, needs: ['proyektor', 'audio'] },
  { slug: 'denah-duduk', name: 'Denah Tempat Duduk', summary: 'Atur posisi duduk siswa, acak, simpan beberapa versi, lalu cetak.', icon: 'i-lucide-armchair', category: 'kelas', priority: 2, phase: 3, needs: ['kelas', 'cetak'] },
  { slug: 'pengukur-suara', name: 'Pengukur Suara Kelas', summary: 'Tanda tenang, sedang, atau ramai dari mikrofon. Suara tidak direkam.', icon: 'i-lucide-volume-2', category: 'kelas', priority: 2, phase: 3, needs: ['mik', 'proyektor'] },
  { slug: 'jadwal-piket', name: 'Pembuat Jadwal Piket', summary: 'Rotasi piket mingguan otomatis, siap cetak satu halaman.', icon: 'i-lucide-calendar-days', category: 'kelas', priority: 2, phase: 3, needs: ['kelas', 'cetak'] },
  { slug: 'papan-poin', name: 'Papan Poin', summary: 'Beri poin ke siswa atau kelompok, dengan riwayat per hari.', icon: 'i-lucide-medal', category: 'kelas', priority: 3, phase: 4, needs: ['kelas', 'proyektor'] },

  // Penilaian & Administrasi
  { slug: 'nilai-rapor', name: 'Kalkulator Nilai Rapor', summary: 'Hitung nilai akhir dari bobot sumatif, STS, dan SAS. Bisa ditempel dari spreadsheet.', icon: 'i-lucide-calculator', category: 'penilaian', priority: 1, phase: 1, needs: ['kelas', 'cetak'] },
  { slug: 'rekap-absensi', name: 'Rekap Absensi', summary: 'Catat kehadiran harian, lalu rekap bulanan dan persentase per siswa.', icon: 'i-lucide-clipboard-check', category: 'penilaian', priority: 1, phase: 1, needs: ['kelas', 'cetak'] },
  { slug: 'predikat', name: 'Konversi Nilai ke Predikat', summary: 'Ubah angka menjadi predikat dengan rentang yang diatur sendiri.', icon: 'i-lucide-arrow-right-left', category: 'penilaian', priority: 2, phase: 2, needs: [] },
  { slug: 'ketuntasan', name: 'Kalkulator Ketuntasan', summary: 'Daftar siswa yang tuntas dan yang perlu remedial atau pengayaan, per TP.', icon: 'i-lucide-list-checks', category: 'penilaian', priority: 2, phase: 2, needs: ['kelas'] },
  { slug: 'deskripsi-rapor', name: 'Generator Deskripsi Rapor', summary: 'Susun kalimat deskripsi capaian dari TP yang dikuasai dan yang perlu ditingkatkan.', icon: 'i-lucide-file-pen-line', category: 'penilaian', priority: 2, phase: 2, needs: ['kelas'] },
  { slug: 'analisis-butir', name: 'Analisis Butir Soal', summary: 'Tingkat kesukaran, daya beda, dan efektivitas pengecoh soal pilihan ganda.', icon: 'i-lucide-chart-column', category: 'penilaian', priority: 3, phase: 4, needs: ['kelas', 'cetak'] },

  // Pembuat Bahan Ajar
  { slug: 'lkpd-bergambar', name: 'Generator LKPD Bergambar', summary: 'LKPD bergambar siap cetak dari CP, materi, dan TP yang dipilih, dibuat dengan AI.', icon: 'i-lucide-file-image', category: 'bahan-ajar', priority: 2, phase: 5, needs: ['cetak'], tier: 'berbayar' },
  { slug: 'lk-matematika', name: 'Lembar Kerja Matematika', summary: 'Soal hitung acak dengan kunci jawaban di halaman terpisah, siap cetak.', icon: 'i-lucide-sigma', category: 'bahan-ajar', priority: 1, phase: 1, needs: ['cetak'] },
  { slug: 'latihan-menulis', name: 'Latihan Menulis Huruf', summary: 'Garis tiga atau empat dengan huruf putus-putus untuk ditebalkan.', icon: 'i-lucide-pencil-line', category: 'bahan-ajar', priority: 2, phase: 2, needs: ['cetak'] },
  { slug: 'cari-kata', name: 'Pembuat Cari Kata', summary: 'Susun kotak cari kata dari daftar kosakata, lengkap dengan kunci.', icon: 'i-lucide-search', category: 'bahan-ajar', priority: 2, phase: 2, needs: ['cetak'] },
  { slug: 'kuis-pg', name: 'Pembuat Kuis Pilihan Ganda', summary: 'Acak soal dan pilihan jawaban, cetak paket A dan B.', icon: 'i-lucide-list-todo', category: 'bahan-ajar', priority: 2, phase: 2, needs: ['cetak'] },
  { slug: 'tts', name: 'Pembuat Teka-Teki Silang', summary: 'Masukkan kata dan petunjuk, grid disusun otomatis.', icon: 'i-lucide-grid-3x3', category: 'bahan-ajar', priority: 2, phase: 3, needs: ['cetak'] },
  { slug: 'flashcard', name: 'Kartu Flashcard', summary: 'Kata dan gambar dalam kartu siap potong.', icon: 'i-lucide-layers', category: 'bahan-ajar', priority: 3, phase: 4, needs: ['cetak'] },
  { slug: 'bingo', name: 'Pembuat Bingo Edukasi', summary: 'Kartu bingo berisi angka, kata, atau gambar, setiap kartu berbeda.', icon: 'i-lucide-grid-2x2-check', category: 'bahan-ajar', priority: 3, phase: 4, needs: ['cetak'] },

  // Alat Peraga Digital
  { slug: 'dadu-spinner', name: 'Dadu & Spinner', summary: 'Lempar 1 sampai 6 dadu atau putar spinner, dan cetak jaring-jaring dadu.', icon: 'i-lucide-dices', category: 'peraga', priority: 1, phase: 0, needs: ['proyektor', 'cetak'] },
  { slug: 'jam-analog', name: 'Jam Analog Interaktif', summary: 'Geser jarum jam untuk belajar membaca waktu.', icon: 'i-lucide-clock', category: 'peraga', priority: 2, phase: 2, needs: ['proyektor'] },
  { slug: 'tabel-perkalian', name: 'Tabel Perkalian', summary: 'Sorot baris dan kolom, sembunyikan hasil untuk latihan.', icon: 'i-lucide-table', category: 'peraga', priority: 2, phase: 2, needs: ['proyektor', 'cetak'] },
  { slug: 'pecahan', name: 'Visualisasi Pecahan', summary: 'Lingkaran dan batang untuk membandingkan pecahan.', icon: 'i-lucide-pie-chart', category: 'peraga', priority: 2, phase: 3, needs: ['proyektor'] },
  { slug: 'garis-bilangan', name: 'Garis Bilangan', summary: 'Lompatan penjumlahan dan pengurangan, termasuk bilangan negatif.', icon: 'i-lucide-move-horizontal', category: 'peraga', priority: 2, phase: 3, needs: ['proyektor'] },
  { slug: 'uang-rupiah', name: 'Simulasi Uang Rupiah', summary: 'Latihan belanja dan menghitung kembalian.', icon: 'i-lucide-banknote', category: 'peraga', priority: 3, phase: 4, needs: ['proyektor'] },
  { slug: 'papan-tulis', name: 'Papan Tulis Digital', summary: 'Tulis, gambar, dan sisipkan gambar, lalu simpan sebagai PNG.', icon: 'i-lucide-presentation', category: 'peraga', priority: 3, phase: 4, needs: ['proyektor'] },

  // Dokumen & Template
  { slug: 'sertifikat', name: 'Sertifikat & Piagam', summary: 'Cetak massal satu nama per halaman dari daftar kelas.', icon: 'i-lucide-award', category: 'dokumen', priority: 1, phase: 1, needs: ['kelas', 'cetak'] },
  { slug: 'label-siswa', name: 'Label & Kartu Nama Meja', summary: 'Label nama untuk buku atau meja, cetak massal.', icon: 'i-lucide-tag', category: 'dokumen', priority: 2, phase: 2, needs: ['kelas', 'cetak'] },
  { slug: 'surat-edaran', name: 'Surat Edaran Orang Tua', summary: 'Isi template dengan kop sekolah, cetak atau salin ke WhatsApp.', icon: 'i-lucide-mail', category: 'dokumen', priority: 2, phase: 3, needs: ['cetak'] },
  { slug: 'modul-ajar', name: 'Generator Modul Ajar', summary: 'Isi komponen modul ajar Kurikulum Merdeka, lalu cetak.', icon: 'i-lucide-book-open', category: 'dokumen', priority: 3, phase: 4, needs: ['cetak'] }
]

export function findTool(slug: string) {
  return TOOLS.find(t => t.slug === slug)
}
