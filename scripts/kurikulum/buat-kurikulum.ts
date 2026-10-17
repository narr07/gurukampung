// Menyusun content/kurikulum/<mapel>-fase-<x>.yml: teks capaian per elemen diambil verbatim dari
// sumber/kurikulum/CAPAIAN PEMBELAJARAN 046.md, materi dan TP disusun dari teks CP tersebut.
// Pakai (dari folder proyek): bun scripts/kurikulum/buat-kurikulum.ts (butuh folder sumber/ di komputer ini)
import fs from 'node:fs'
import { stringify } from 'yaml'

const SUMBER = 'E:/website/narr/peragu/sumber/kurikulum/CAPAIAN PEMBELAJARAN 046.md'
const baris = fs.readFileSync(SUMBER, 'utf8').split('\n')

function capaian(awal: number, akhir: number, fase: string) {
  const potong = baris.slice(awal - 1, akhir)
  // Judul fase biasanya "2. Fase B (Umumnya untuk Kelas ...", tetapi kadang terpecah ke sel tabel ("1. Fase B SD/MI/...")
  const iFase = potong.findIndex(b => new RegExp(`\\d+\\.\\s*Fase ${fase}\\b[^\\n]*(\\(Umumnya untuk Kelas|SD/MI)`).test(b) && !/SDLB|SMALB|SMPLB/.test(b))
  if (iFase < 0) throw new Error(`Fase ${fase} tidak ditemukan`)
  const no = (potong[iFase].match(new RegExp(`(\\d+)\\.\\s*Fase ${fase}\\b`)) ?? [])[1]
  const sisa = potong.slice(iFase + 1)
  const iAkhir = sisa.findIndex(b => /\bFase [A-F] \(Umumnya/.test(b))
  const isi = (iAkhir < 0 ? sisa : sisa.slice(0, iAkhir)).join('\n')
  const pola = new RegExp(`(?:^|\\n)${no}\\.(\\d+)\\.\\s*([^\\n]+)\\n([\\s\\S]*?)(?=\\n${no}\\.\\d+\\.|$)`, 'g')
  const peta: Record<string, string> = {}
  for (const m of isi.matchAll(pola)) {
    peta[m[2].trim()] = m[3].replace(/\*/g, '').replace(/-\s*\d+\s*-/g, ' ').replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
  }
  return peta
}

// Untuk fase yang hasil konversinya satu paragraf ("Menyimak Menganalisis ... Membaca dan Memirsa Membaca ..."):
// cari baris yang diawali `awalan`, lalu potong berurutan di setiap nama elemen yang diikuti huruf kapital
function capaianSebaris(awal: number, akhir: number, awalan: string, nama: string[]) {
  const teks = baris.slice(awal - 1, akhir).find(b => b.startsWith(awalan))
  if (!teks) throw new Error(`Baris berawalan "${awalan}" tidak ditemukan`)
  const posisi: number[] = []
  let dari = 0
  for (const n of nama) {
    const m = new RegExp(`${n}\\s+(?=[A-Z])`).exec(teks.slice(dari))
    if (!m) throw new Error(`Elemen "${n}" tidak ditemukan di baris sebaris`)
    posisi.push(dari + m.index)
    dari += m.index + m[0].length
  }
  const peta: Record<string, string> = {}
  nama.forEach((n, i) => {
    peta[n] = teks.slice(posisi[i] + n.length, posisi[i + 1] ?? teks.length).replace(/\s{2,}/g, ' ').trim()
  })
  return peta
}

// TP berformat ABCD (sumber/taksonomi/rumusan-tp-abcd.md). Minimal resmi hanya kompetensi + lingkup materi (= behavior);
// audience dibuat dari kelas ("Murid kelas N"), condition dan degree boleh kosong ('') kalau tidak menambah kejelasan
type Tp = [id: string, kelas: number, behavior: string, condition: string, degree: string]

function tpAbcd([id, kelas, behavior, condition, degree]: Tp) {
  const audience = `Murid kelas ${kelas}`
  // Behavior yang diakhiri contoh ("..., misalnya A atau B") butuh koma sebelum kondisi supaya tidak menyatu
  const jeda = /, (misalnya|seperti) /.test(behavior) ? ', ' : ' '
  return {
    id,
    teks: `${audience} dapat ${behavior}${condition ? jeda + condition : ''}${degree ? `, ${degree}` : ''}.`,
    kelas,
    abcd: { audience, behavior, ...(condition && { condition }), ...(degree && { degree }) }
  }
}
type Materi = { id: string, nama: string, tp: Tp[] }
type Elemen = { id: string, nama: string, materi: Materi[] }
type Berkas = {
  berkas: string
  mapelId: string
  mapel: string
  fase: 'A' | 'B' | 'C'
  baris: [number, number]
  bagian: string
  // Diisi kalau teks capaian fase ini berupa satu paragraf, berisi awal paragrafnya
  sebaris?: string
  elemen: Elemen[]
}

const MATEMATIKA: [number, number] = [1620, 1780]
const BAGIAN_MTK = 'Lampiran, IV.1 Capaian Pembelajaran Matematika'
const BAHASA_INDONESIA: [number, number] = [1426, 1561]
const BAGIAN_BIND = 'Lampiran, III.1 Capaian Pembelajaran Bahasa Indonesia'
const IPAS: [number, number] = [1987, 2028]
const BAGIAN_IPAS = 'Lampiran, VI Capaian Pembelajaran Ilmu Pengetahuan Alam dan Sosial (IPAS)'

const DATA: Berkas[] = [
  {
    berkas: 'matematika-fase-a', mapelId: 'matematika', mapel: 'Matematika', fase: 'A', baris: MATEMATIKA, bagian: `${BAGIAN_MTK}, Fase A`,
    elemen: [
      { id: 'bilangan', nama: 'Bilangan', materi: [
        { id: 'bilangan-cacah-20', nama: 'Bilangan cacah sampai 20', tp: [
          ['bilangan-cacah-20-1', 1, 'membaca, menulis, membilang, dan membandingkan bilangan cacah sampai 20', 'menggunakan benda konkret', 'sedikitnya 8 dari 10 butir benar'],
          ['bilangan-cacah-20-2', 1, 'menjumlahkan dan mengurangkan bilangan cacah sampai 20', 'menggunakan benda konkret', 'sedikitnya 8 dari 10 soal benar']
        ] },
        { id: 'bilangan-cacah-100', nama: 'Bilangan cacah sampai 100', tp: [
          ['bilangan-cacah-100-1', 2, 'membaca, menulis, dan menentukan nilai tempat puluhan dan satuan pada bilangan cacah sampai 100', 'menggunakan kartu bilangan atau ikatan lidi', 'sedikitnya 8 dari 10 soal benar'],
          ['bilangan-cacah-100-2', 2, 'menyusun dan mengurai bilangan cacah sampai 100 menjadi puluhan dan satuan (misalnya 47 = 40 + 7)', 'dengan bantuan benda konkret atau gambar', 'sedikitnya 4 dari 5 soal benar'],
          ['bilangan-cacah-100-3', 2, 'membandingkan dan mengurutkan bilangan cacah sampai 100', 'menggunakan garis bilangan atau tabel ratusan', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'pecahan-sederhana', nama: 'Setengah dan seperempat', tp: [
          ['pecahan-sederhana-1', 2, 'menunjukkan setengah dan seperempat dari sebuah benda atau kumpulan benda', 'melalui kegiatan melipat kertas atau membagi benda sama banyak', '']
        ] }
      ] },
      { id: 'aljabar', nama: 'Aljabar', materi: [
        { id: 'makna-sama-dengan', nama: 'Makna tanda sama dengan', tp: [
          ['makna-sama-dengan-1', 1, 'menjelaskan makna tanda "=" pada kalimat penjumlahan dan pengurangan sampai 20', 'berbantuan gambar atau timbangan sederhana', 'dengan kalimat sendiri yang benar']
        ] },
        { id: 'pola-bukan-bilangan', nama: 'Pola bukan bilangan', tp: [
          ['pola-bukan-bilangan-1', 1, 'meniru dan melanjutkan pola gambar, warna, atau bunyi', 'menggunakan benda atau gambar', 'sedikitnya 2 langkah berikutnya benar']
        ] }
      ] },
      { id: 'pengukuran', nama: 'Pengukuran', materi: [
        { id: 'panjang-berat', nama: 'Panjang dan berat', tp: [
          ['panjang-berat-1', 1, 'membandingkan panjang dan berat dua benda', 'secara langsung, yaitu menjajarkan atau mengangkat benda', 'memakai kata lebih panjang, lebih pendek, lebih berat, atau lebih ringan secara tepat'],
          ['panjang-berat-2', 2, 'mengukur dan memperkirakan panjang dan berat benda', 'menggunakan satuan tidak baku seperti jengkal, langkah, atau kelereng', 'dengan perkiraan yang masuk akal dan hasil ukur yang benar']
        ] },
        { id: 'durasi-waktu', nama: 'Durasi waktu', tp: [
          ['durasi-waktu-1', 2, 'membandingkan lama dua kegiatan sehari-hari', 'dari gambar atau pengalaman sendiri', 'dengan alasan yang benar']
        ] }
      ] },
      { id: 'geometri', nama: 'Geometri', materi: [
        { id: 'bangun-datar-ruang', nama: 'Bangun datar dan bangun ruang', tp: [
          ['bangun-datar-ruang-1', 1, 'menyebutkan dan menunjukkan segitiga, segiempat, segi banyak, dan lingkaran', 'pada benda di sekitarnya', 'sedikitnya satu contoh benda untuk setiap bangun'],
          ['bangun-datar-ruang-2', 1, 'menyebutkan dan menunjukkan balok, kubus, kerucut, dan bola', 'pada benda di sekitarnya', 'sedikitnya satu contoh benda untuk setiap bangun'],
          ['bangun-datar-ruang-3', 2, 'menyusun dan mengurai bangun datar (segitiga, segiempat, dan segi banyak)', 'menggunakan potongan kertas atau tangram', 'sedikitnya dengan dua cara berbeda']
        ] },
        { id: 'posisi-benda', nama: 'Posisi benda', tp: [
          ['posisi-benda-1', 1, 'menentukan posisi benda terhadap benda lain (kanan, kiri, depan, belakang, atas, dan bawah)', 'pada gambar atau di ruang kelas', '']
        ] }
      ] },
      { id: 'analisis-data-dan-peluang', nama: 'Analisis Data dan Peluang', materi: [
        { id: 'data-sederhana', nama: 'Mengelompokkan dan menyajikan data', tp: [
          ['data-sederhana-1', 1, 'mengurutkan, menyortir, dan mengelompokkan benda berdasarkan ciri tertentu', 'menggunakan benda konkret di kelas', 'dengan alasan pengelompokan yang benar'],
          ['data-sederhana-2', 2, 'menyajikan dan membandingkan data banyak benda dalam turus dan piktogram', 'yang terdiri atas paling banyak 4 kategori', 'dengan jumlah dan perbandingan yang benar']
        ] }
      ] }
    ]
  },
  {
    berkas: 'matematika-fase-b', mapelId: 'matematika', mapel: 'Matematika', fase: 'B', baris: MATEMATIKA, bagian: `${BAGIAN_MTK}, Fase B`,
    elemen: [
      { id: 'bilangan', nama: 'Bilangan', materi: [
        { id: 'bilangan-cacah', nama: 'Bilangan cacah sampai 10.000', tp: [
          ['b-1', 3, 'membaca, menulis, membandingkan, dan mengurutkan bilangan cacah sampai 1.000', 'menggunakan kartu bilangan atau garis bilangan', 'sedikitnya 8 dari 10 soal benar'],
          ['b-2', 3, 'menentukan nilai tempat serta menyusun dan mengurai bilangan cacah sampai 1.000', 'dengan bantuan blok dienes atau kartu nilai tempat', 'sedikitnya 8 dari 10 soal benar'],
          ['b-6', 4, 'membaca, menulis, membandingkan, mengurutkan, dan menentukan nilai tempat bilangan cacah sampai 10.000', 'menggunakan tabel nilai tempat', 'sedikitnya 8 dari 10 soal benar']
        ] },
        { id: 'operasi-hitung', nama: 'Operasi hitung bilangan cacah', tp: [
          ['b-3', 3, 'menyelesaikan masalah penjumlahan dan pengurangan bilangan cacah sampai 1.000', 'pada soal cerita sehari-hari dengan cara bersusun', 'sedikitnya 4 dari 5 soal benar'],
          ['b-4', 3, 'menyelesaikan masalah perkalian dan pembagian bilangan cacah sampai 100', 'dengan bantuan benda konkret, gambar, dan simbol', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'kelipatan-faktor', nama: 'Kelipatan dan faktor', tp: [
          ['b-7', 4, 'menentukan kelipatan dan faktor bilangan cacah sampai 100 serta memakainya pada masalah sehari-hari', 'menggunakan tabel perkalian atau susunan benda', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'pecahan', nama: 'Pecahan, desimal, dan persen', tp: [
          ['b-5', 3, 'membandingkan dan mengurutkan pecahan berpembilang satu serta pecahan berpenyebut sama', 'menggunakan pita pecahan atau gambar', 'sedikitnya 4 dari 5 soal benar'],
          ['b-8', 4, 'menentukan pecahan senilai', 'menggunakan pita kertas atau gambar', 'sedikitnya 3 dari 4 soal benar'],
          ['b-9', 4, 'menyatakan pecahan sebagai desimal dan persen', 'menggunakan gambar petak seratus', 'sedikitnya 4 dari 5 soal benar']
        ] }
      ] },
      { id: 'aljabar', nama: 'Aljabar', materi: [
        { id: 'kalimat-matematika', nama: 'Nilai yang belum diketahui', tp: [
          ['a-1', 3, 'menemukan nilai yang tidak diketahui dalam kalimat matematika penjumlahan dan pengurangan bilangan cacah sampai 100', 'dengan bantuan gambar timbangan atau garis bilangan', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'pola', nama: 'Pola gambar dan pola bilangan', tp: [
          ['a-2', 3, 'meniru dan mengembangkan pola gambar atau objek sederhana', 'menggunakan benda atau gambar', 'dengan aturan pola yang dijelaskan secara benar'],
          ['a-3', 4, 'mengembangkan pola bilangan membesar dan mengecil yang melibatkan penjumlahan dan pengurangan sampai 100', 'dari barisan bilangan yang diberikan', 'sedikitnya 3 suku berikutnya benar disertai aturannya']
        ] }
      ] },
      { id: 'pengukuran', nama: 'Pengukuran', materi: [
        { id: 'panjang-berat', nama: 'Panjang dan berat', tp: [
          ['p-1', 3, 'mengukur panjang benda dalam cm dan m', 'menggunakan penggaris atau meteran', 'dengan selisih paling banyak 1 cm dari hasil ukur guru'],
          ['p-2', 3, 'mengukur berat benda dalam g dan kg', 'menggunakan timbangan', 'dengan pembacaan skala yang benar'],
          ['p-3', 4, 'menentukan hubungan antarsatuan panjang (cm dan m) dan antarsatuan berat (g dan kg)', 'pada soal pengubahan satuan dan soal cerita', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'luas-volume', nama: 'Luas dan volume', tp: [
          ['p-4', 4, 'mengukur dan memperkirakan luas bangun datar', 'menggunakan satuan tidak baku, lalu petak satuan', 'dengan perkiraan yang masuk akal dan hasil hitung petak yang benar'],
          ['p-5', 4, 'mengukur dan memperkirakan volume benda', 'menggunakan satuan tidak baku, lalu kubus satuan', 'dengan perkiraan yang masuk akal dan hasil hitung kubus yang benar']
        ] }
      ] },
      { id: 'geometri', nama: 'Geometri', materi: [
        { id: 'bangun-datar', nama: 'Bangun datar', tp: [
          ['g-1', 3, 'mendeskripsikan ciri segiempat dan segitiga', 'dari gambar atau model bangun', 'sedikitnya tiga ciri yang benar untuk setiap bangun'],
          ['g-2', 4, 'mendeskripsikan ciri segi banyak', 'dari gambar atau model bangun', 'dengan banyak sisi dan sudut yang benar'],
          ['g-3', 4, 'menyusun dan mengurai bangun datar', 'menggunakan potongan kertas atau tangram', 'sedikitnya dengan dua cara berbeda']
        ] }
      ] },
      { id: 'analisis-data-dan-peluang', nama: 'Analisis Data dan Peluang', materi: [
        { id: 'penyajian-data', nama: 'Tabel, piktogram, dan diagram batang', tp: [
          ['d-1', 3, 'mengurutkan, membandingkan, dan menyajikan data dalam tabel, diagram gambar, dan piktogram', 'dari data hasil pengamatan di kelas', 'dengan penyajian yang sesuai data'],
          ['d-2', 4, 'menyajikan, menganalisis, dan menginterpretasi data dalam diagram batang berskala satu satuan', 'dari data hasil pengamatan atau tabel yang diberikan', 'sedikitnya dua kesimpulan yang benar']
        ] }
      ] }
    ]
  },
  {
    berkas: 'matematika-fase-c', mapelId: 'matematika', mapel: 'Matematika', fase: 'C', baris: MATEMATIKA, bagian: `${BAGIAN_MTK}, Fase C`,
    elemen: [
      { id: 'bilangan', nama: 'Bilangan', materi: [
        { id: 'bilangan-cacah', nama: 'Bilangan cacah sampai 1.000.000', tp: [
          ['bilangan-cacah-1', 5, 'membaca, menulis, menentukan nilai tempat, membandingkan, dan mengurutkan bilangan cacah sampai 1.000.000', 'menggunakan tabel nilai tempat', 'sedikitnya 8 dari 10 soal benar']
        ] },
        { id: 'operasi-hitung', nama: 'Operasi hitung dan uang', tp: [
          ['operasi-hitung-1', 5, 'melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian bilangan cacah sampai 100.000', 'dengan cara bersusun tanpa kalkulator', 'sedikitnya 8 dari 10 soal benar'],
          ['operasi-hitung-2', 5, 'menyelesaikan masalah sehari-hari yang berkaitan dengan uang', 'pada soal cerita jual beli', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'kpk-fpb', nama: 'KPK dan FPB', tp: [
          ['kpk-fpb-1', 5, 'menyelesaikan masalah yang berkaitan dengan KPK dan FPB', 'pada soal cerita sehari-hari', 'sedikitnya 4 dari 5 soal benar dengan langkah yang runtut']
        ] },
        { id: 'pecahan', nama: 'Pecahan', tp: [
          ['pecahan-1', 5, 'membandingkan dan mengurutkan berbagai pecahan, termasuk pecahan campuran', 'menggunakan garis bilangan atau penyamaan penyebut', 'sedikitnya 4 dari 5 soal benar'],
          ['pecahan-2', 5, 'menjumlahkan dan mengurangkan pecahan', 'menggunakan gambar atau penyamaan penyebut', 'sedikitnya 4 dari 5 soal benar'],
          ['pecahan-3', 6, 'mengalikan dan membagi pecahan dengan bilangan asli', 'dengan bantuan gambar atau model luas', 'sedikitnya 4 dari 5 soal benar'],
          ['pecahan-4', 6, 'mengubah pecahan ke bentuk lain (pecahan biasa, pecahan campuran, desimal, dan persen)', 'tanpa kalkulator', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'desimal', nama: 'Bilangan desimal', tp: [
          ['desimal-1', 6, 'membandingkan dan mengurutkan bilangan desimal satu angka di belakang koma', 'menggunakan garis bilangan', 'sedikitnya 4 dari 5 soal benar']
        ] }
      ] },
      { id: 'aljabar', nama: 'Aljabar', materi: [
        { id: 'kalimat-matematika', nama: 'Nilai yang belum diketahui', tp: [
          ['kalimat-matematika-1', 5, 'menemukan nilai yang belum diketahui dalam kalimat matematika yang melibatkan empat operasi hitung pada bilangan cacah sampai 1.000', 'menggunakan sifat-sifat operasi hitung', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'pola-bilangan', nama: 'Pola bilangan', tp: [
          ['pola-bilangan-1', 5, 'meniru dan mengembangkan pola bilangan membesar dan mengecil yang melibatkan perkalian dan pembagian', 'dari barisan bilangan yang diberikan', 'sedikitnya 3 suku berikutnya benar disertai aturannya']
        ] },
        { id: 'rasio-proporsi', nama: 'Rasio dan proporsi', tp: [
          ['rasio-proporsi-1', 6, 'menyelesaikan masalah sehari-hari dengan penalaran proporsional dan rasio satuan (misalnya harga per buah)', 'menggunakan tabel atau gambar', 'sedikitnya 4 dari 5 soal benar'],
          ['rasio-proporsi-2', 6, 'menggunakan perkalian dan pembagian untuk menyelesaikan masalah proporsi sehari-hari', 'pada soal cerita seperti resep atau skala', 'sedikitnya 4 dari 5 soal benar']
        ] }
      ] },
      { id: 'pengukuran', nama: 'Pengukuran', materi: [
        { id: 'keliling-luas', nama: 'Keliling dan luas bangun datar', tp: [
          ['keliling-luas-1', 5, 'menentukan keliling dan luas segitiga, segiempat, dan segi banyak', 'dari gambar berukuran atau petak satuan', 'sedikitnya 4 dari 5 soal benar dengan satuan yang tepat'],
          ['keliling-luas-2', 6, 'menentukan keliling dan luas gabungan bangun datar', 'dari gambar berukuran', 'sedikitnya 3 dari 4 soal benar dengan langkah yang runtut']
        ] },
        { id: 'durasi-waktu', nama: 'Durasi waktu', tp: [
          ['durasi-waktu-1', 5, 'menghitung durasi waktu suatu kegiatan', 'dari jadwal atau gambar jam', 'sedikitnya 4 dari 5 soal benar']
        ] },
        { id: 'sudut', nama: 'Besar sudut', tp: [
          ['sudut-1', 6, 'mengukur besar sudut pada bangun datar atau sudut yang dibentuk dua garis berpotongan', 'menggunakan busur derajat', 'dengan selisih paling banyak 2 derajat']
        ] }
      ] },
      { id: 'geometri', nama: 'Geometri', materi: [
        { id: 'bangun-ruang', nama: 'Bangun ruang', tp: [
          ['bangun-ruang-1', 5, 'menyusun dan mengurai kubus, balok, dan gabungannya', 'menggunakan jaring-jaring atau kubus satuan', ''],
          ['bangun-ruang-2', 6, 'menentukan tampak depan, atas, dan samping bangun ruang', 'dari susunan kubus satuan', 'sedikitnya 3 dari 4 soal benar']
        ] },
        { id: 'karakteristik-bangun', nama: 'Karakteristik bangun datar dan ruang', tp: [
          ['karakteristik-bangun-1', 5, 'membandingkan karakteristik antarbangun datar dan antarbangun ruang', 'menggunakan tabel atau model bangun', 'sedikitnya dua persamaan dan dua perbedaan yang benar']
        ] },
        { id: 'peta-berpetak', nama: 'Lokasi pada peta berpetak', tp: [
          ['peta-berpetak-1', 6, 'menentukan lokasi pada peta berpetak', 'menggunakan kode baris dan kolom', 'sedikitnya 4 dari 5 lokasi benar']
        ] }
      ] },
      { id: 'analisis-data-dan-peluang', nama: 'Analisis Data dan Peluang', materi: [
        { id: 'penyajian-data', nama: 'Penyajian dan analisis data', tp: [
          ['penyajian-data-1', 5, 'menyajikan dan menganalisis data dalam piktogram, diagram batang, dan tabel frekuensi', 'dari data hasil pengamatan atau survei kelas', 'sedikitnya dua informasi yang benar dari penyajian tersebut']
        ] },
        { id: 'peluang', nama: 'Peluang', tp: [
          ['peluang-1', 6, 'menentukan kejadian yang lebih mungkin atau kurang mungkin terjadi dalam percobaan acak', 'melalui percobaan dengan dadu, koin, atau putaran', 'dengan alasan berdasarkan hasil percobaan']
        ] }
      ] }
    ]
  },

  // Bahasa Indonesia. Pembagian kelas mengikuti urutan CP (fase A: menyimak dan membaca permulaan dulu,
  // fase B dan C: teks yang makin panjang dan kompleks)
  {
    berkas: 'bahasa-indonesia-fase-a', mapelId: 'bahasa-indonesia', mapel: 'Bahasa Indonesia', fase: 'A', baris: BAHASA_INDONESIA, bagian: `${BAGIAN_BIND}, Fase A`,
    elemen: [
      { id: 'menyimak', nama: 'Menyimak', materi: [
        { id: 'menyimak-informasi', nama: 'Menyimak informasi dan percakapan', tp: [
          ['menyimak-informasi-1', 1, 'menjawab pertanyaan siapa, apa, dan di mana tentang percakapan mengenai diri dan keluarga', 'setelah mendengarkan percakapan atau teks yang dibacakan', 'sedikitnya 3 dari 4 pertanyaan benar'],
          ['menyimak-informasi-2', 2, 'menyebutkan informasi penting dari teks nonsastra tentang lingkungan sekitar', 'setelah mendengarkan teks yang dibacakan', 'sedikitnya dua informasi yang benar']
        ] },
        { id: 'menyimak-cerita', nama: 'Menyimak cerita dan puisi anak', tp: [
          ['menyimak-cerita-1', 1, 'menyebutkan tokoh dan kejadian dalam dongeng atau cerita bergambar', 'setelah mendengarkan cerita yang dibacakan', ''],
          ['menyimak-cerita-2', 2, 'menyampaikan pesan dari cerita atau puisi anak', 'setelah mendengarkan cerita atau puisi yang dibacakan', 'dengan kalimat sendiri yang sesuai isi']
        ] }
      ] },
      { id: 'membaca-memirsa', nama: 'Membaca dan Memirsa', materi: [
        { id: 'membaca-permulaan', nama: 'Membaca permulaan', tp: [
          ['membaca-permulaan-1', 1, 'membaca suku kata dan merangkainya menjadi kata sederhana', 'menggunakan kartu huruf dan kartu suku kata', 'sedikitnya 8 dari 10 kata benar'],
          ['membaca-permulaan-2', 1, 'membaca kalimat sederhana tentang diri dan keluarga', 'dari teks bergambar', 'dengan lafal yang tepat']
        ] },
        { id: 'membaca-lancar', nama: 'Membaca lancar teks pendek', tp: [
          ['membaca-lancar-1', 2, 'membaca nyaring teks pendek tentang kesehatan dan lingkungan sekitar', 'dari buku atau kartu bacaan', 'dengan lancar dan intonasi yang tepat']
        ] },
        { id: 'memahami-bacaan', nama: 'Memahami isi bacaan dan tayangan', tp: [
          ['memahami-bacaan-1', 1, 'menjawab pertanyaan tentang isi teks pendek', 'setelah membaca teks bergambar', 'sedikitnya 3 dari 4 pertanyaan benar'],
          ['memahami-bacaan-2', 2, 'menyebutkan informasi dan urutan kejadian dalam bacaan atau tayangan tentang kesehatan dan lingkungan sekitar', '', 'dengan urutan yang benar']
        ] }
      ] },
      { id: 'berbicara-mempresentasikan', nama: 'Berbicara dan Mempresentasikan', materi: [
        { id: 'percakapan-santun', nama: 'Bercakap-cakap dengan santun', tp: [
          ['percakapan-santun-1', 1, 'bertanya dan menjawab pertanyaan dalam percakapan tentang diri dan keluarga', 'dalam kegiatan bermain peran bersama teman', 'dengan bahasa yang santun'],
          ['percakapan-santun-2', 2, 'menanggapi komentar teman atau guru dalam percakapan tentang kesehatan dan lingkungan sekitar', 'dalam diskusi kelas', 'dengan bahasa yang santun dan sesuai topik']
        ] },
        { id: 'mengungkapkan-gagasan', nama: 'Mengungkapkan perasaan dan gagasan', tp: [
          ['mengungkapkan-gagasan-1', 1, 'mengungkapkan perasaan secara lisan', 'dengan bantuan gambar ekspresi wajah', 'dalam sedikitnya satu kalimat lengkap'],
          ['mengungkapkan-gagasan-2', 2, 'menyampaikan gagasan sederhana secara lisan tentang lingkungan sekitar', 'tanpa bantuan gambar', 'dalam sedikitnya dua kalimat yang runtut']
        ] },
        { id: 'menceritakan-kembali', nama: 'Menceritakan kembali', tp: [
          ['menceritakan-kembali-1', 1, 'menceritakan kembali isi cerita bergambar', 'sambil melihat gambar cerita', 'dengan kalimat sederhana sesuai urutan gambar'],
          ['menceritakan-kembali-2', 2, 'menceritakan kembali isi teks yang dibaca, dipirsa, atau didengar', 'tanpa melihat teks', 'dengan urutan kejadian yang tepat']
        ] }
      ] },
      { id: 'menulis', nama: 'Menulis', materi: [
        { id: 'menulis-permulaan', nama: 'Menulis permulaan', tp: [
          ['menulis-permulaan-1', 1, 'menulis huruf kecil dan huruf kapital', 'sambil memegang pensil secara benar', 'dengan bentuk huruf yang tepat'],
          ['menulis-permulaan-2', 1, 'menulis kata dan kalimat sederhana', 'melalui kegiatan menyalin atau dikte', 'dengan huruf yang terbaca jelas']
        ] },
        { id: 'tulisan-tangan', nama: 'Tulisan tangan', tp: [
          ['tulisan-tangan-1', 2, 'menulis kalimat', 'di buku bergaris', 'dengan huruf yang rapi, ukuran yang konsisten, dan spasi antarkata yang tepat']
        ] },
        { id: 'menulis-teks-sederhana', nama: 'Menulis teks sederhana', tp: [
          ['menulis-teks-sederhana-1', 1, 'menulis beberapa kalimat sederhana tentang diri sendiri', 'berbantuan gambar atau kerangka kalimat', 'dengan huruf kapital di awal kalimat dan tanda titik di akhir'],
          ['menulis-teks-sederhana-2', 2, 'menulis teks sederhana tentang keluarga atau lingkungan sekitar, misalnya kartu ucapan atau deskripsi benda', 'secara mandiri', 'dalam sedikitnya tiga kalimat yang runtut']
        ] }
      ] }
    ]
  },
  {
    berkas: 'bahasa-indonesia-fase-b', mapelId: 'bahasa-indonesia', mapel: 'Bahasa Indonesia', fase: 'B', baris: BAHASA_INDONESIA, bagian: `${BAGIAN_BIND}, Fase B`,
    elemen: [
      { id: 'menyimak', nama: 'Menyimak', materi: [
        { id: 'ide-pokok-simakan', nama: 'Ide pokok teks yang didengar', tp: [
          ['ide-pokok-simakan-1', 3, 'menemukan ide pokok informasi yang dibacakan, misalnya pengumuman atau berita sederhana', '', ''],
          ['ide-pokok-simakan-2', 4, 'menyimpulkan ide pokok dan informasi penting dari teks nonsastra', 'setelah mendengarkan teks yang dibacakan atau rekaman', 'sedikitnya satu ide pokok dan dua informasi penting yang benar']
        ] },
        { id: 'sastra-simakan', nama: 'Isi cerita dan puisi yang didengar', tp: [
          ['sastra-simakan-1', 3, 'menyebutkan tokoh, latar, dan urutan peristiwa dari dongeng atau cerita rakyat', 'setelah mendengarkan cerita yang dibacakan', ''],
          ['sastra-simakan-2', 4, 'menjelaskan pesan dari cerita atau puisi', 'setelah mendengarkan cerita atau puisi', 'dengan alasan dari isi teks']
        ] }
      ] },
      { id: 'membaca-memirsa', nama: 'Membaca dan Memirsa', materi: [
        { id: 'membaca-fasih', nama: 'Membaca fasih dan kosakata baru', tp: [
          ['membaca-fasih-1', 3, 'membaca nyaring teks dan menjelaskan arti kata baru', 'berdasarkan konteks kalimat', 'dengan fasih dan arti kata yang tepat']
        ] },
        { id: 'ide-pokok-pendukung', nama: 'Ide pokok dan ide pendukung', tp: [
          ['ide-pokok-pendukung-1', 3, 'menemukan ide pokok setiap paragraf dalam teks informasi', 'dengan menggarisbawahi kalimat utama', 'sedikitnya 3 dari 4 paragraf benar'],
          ['ide-pokok-pendukung-2', 4, 'membedakan ide pokok dan ide pendukung dalam paragraf, lalu meringkas isi bacaan', 'dari teks informasi', 'dengan ringkasan yang memuat semua ide pokok']
        ] },
        { id: 'pesan-teks-sastra', nama: 'Tokoh, latar, dan pesan dalam teks sastra', tp: [
          ['pesan-teks-sastra-1', 3, 'menemukan tokoh, watak, dan latar dalam cerita', '', 'dengan menunjukkan bukti kalimat dari teks'],
          ['pesan-teks-sastra-2', 4, 'menjelaskan pesan dalam cerita, fabel, atau puisi', '', 'dengan menunjukkan buktinya di dalam teks']
        ] },
        { id: 'teks-cetak-elektronik', nama: 'Informasi dari teks cetak dan elektronik', tp: [
          ['teks-cetak-elektronik-1', 4, 'menemukan informasi penting dari teks cetak atau elektronik', 'seperti poster, petunjuk, atau tayangan pendek', 'sedikitnya tiga informasi yang benar']
        ] }
      ] },
      { id: 'berbicara-mempresentasikan', nama: 'Berbicara dan Mempresentasikan', materi: [
        { id: 'menyajikan-pendapat', nama: 'Menyajikan pendapat', tp: [
          ['menyajikan-pendapat-1', 3, 'menyampaikan pendapat tentang suatu hal', 'dalam kegiatan tanya jawab di kelas', 'dengan pilihan kata yang tepat dan sedikitnya satu alasan'],
          ['menyajikan-pendapat-2', 4, 'menyajikan pendapat', 'di depan kelas', 'dengan volume, intonasi, dan gestur yang sesuai']
        ] },
        { id: 'berdiskusi', nama: 'Berdiskusi', tp: [
          ['berdiskusi-1', 3, 'mengikuti diskusi kelompok', 'dalam kelompok kecil', 'dengan menunggu giliran berbicara dan mendengarkan pendapat teman'],
          ['berdiskusi-2', 4, 'menanggapi pendapat teman dalam diskusi', 'sesuai tata cara diskusi', 'dengan bahasa yang santun dan alasan yang jelas']
        ] },
        { id: 'menceritakan-kembali-teks', nama: 'Menceritakan kembali isi teks', tp: [
          ['menceritakan-kembali-teks-1', 3, 'menceritakan kembali isi cerita yang dibaca atau didengar', 'secara lisan', 'dengan urutan peristiwa yang tepat'],
          ['menceritakan-kembali-teks-2', 4, 'menceritakan kembali informasi dari teks nonsastra yang dibaca atau dipirsa', 'secara lisan atau tertulis', 'dengan kata-kata sendiri dan informasi yang benar']
        ] }
      ] },
      { id: 'menulis', nama: 'Menulis', materi: [
        { id: 'tipe-teks-sederhana', nama: 'Menulis berbagai tipe teks sederhana', tp: [
          ['tipe-teks-sederhana-1', 3, 'menulis teks deskripsi sederhana tentang benda, hewan, atau tempat di sekitarnya', 'berdasarkan pengamatan langsung', 'dalam sedikitnya satu paragraf yang memuat tiga ciri'],
          ['tipe-teks-sederhana-2', 3, 'menulis teks narasi tentang pengalaman pribadi', 'berbantuan kerangka cerita', 'dengan urutan waktu yang jelas'],
          ['tipe-teks-sederhana-3', 4, 'menulis teks prosedur sederhana, misalnya cara membuat minuman atau merawat tanaman', 'berdasarkan kegiatan yang pernah dilakukan', 'dengan bahan dan langkah yang lengkap dan berurutan'],
          ['tipe-teks-sederhana-4', 4, 'menulis surat atau pesan singkat', 'berpedoman pada contoh surat', 'dengan bagian-bagian surat yang lengkap']
        ] },
        { id: 'ejaan-kosakata', nama: 'Ejaan dan kosakata', tp: [
          ['ejaan-kosakata-1', 3, 'menggunakan huruf kapital, tanda titik, tanda koma, dan tanda tanya dalam tulisan', 'saat menulis atau menyunting kalimat', 'dengan tepat pada sedikitnya 8 dari 10 kalimat'],
          ['ejaan-kosakata-2', 4, 'menggunakan kosakata baru yang bermakna denotatif dan kalimat yang beragam dalam tulisan', 'saat menulis teks sederhana', 'sedikitnya tiga kosakata baru yang tepat maknanya']
        ] }
      ] }
    ]
  },
  {
    berkas: 'bahasa-indonesia-fase-c', mapelId: 'bahasa-indonesia', mapel: 'Bahasa Indonesia', fase: 'C', baris: BAHASA_INDONESIA, bagian: `${BAGIAN_BIND}, Fase C`,
    // Hasil konversi tabel fase C berupa satu paragraf; fase D di bawahnya tidak ikut karena dipotong di elemen terakhir
    sebaris: 'Menyimak Menganalisis informasi dari teks nonsastra',
    elemen: [
      { id: 'menyimak', nama: 'Menyimak', materi: [
        { id: 'informasi-simakan', nama: 'Menganalisis informasi yang didengar', tp: [
          ['informasi-simakan-1', 5, 'menganalisis informasi penting (apa, siapa, kapan, di mana, mengapa, dan bagaimana) dari berita atau teks', 'setelah mendengarkan teks yang dibacakan atau rekaman', 'sedikitnya 5 dari 6 unsur benar'],
          ['informasi-simakan-2', 6, 'membedakan fakta dan opini dalam teks nonsastra', '', 'sedikitnya 4 dari 5 kalimat benar']
        ] },
        { id: 'sastra-simakan-c', nama: 'Menganalisis cerita yang didengar', tp: [
          ['sastra-simakan-c-1', 5, 'menganalisis tokoh, watak, latar, dan alur cerita', '', 'dengan bukti dari isi cerita'],
          ['sastra-simakan-c-2', 6, 'menganalisis nilai-nilai dalam cerita rakyat atau puisi', 'setelah mendengarkan cerita atau puisi', 'sedikitnya dua nilai disertai alasan dari teks']
        ] }
      ] },
      { id: 'membaca-memirsa', nama: 'Membaca dan Memirsa', materi: [
        { id: 'membaca-fasih-c', nama: 'Membaca fasih berbagai kombinasi huruf', tp: [
          ['membaca-fasih-c-1', 5, 'membaca teks yang memuat gabungan huruf (ng, ny, kh, sy) dan kata serapan', 'dari bacaan cetak atau digital', 'dengan fasih dan lafal yang tepat']
        ] },
        { id: 'teks-visual', nama: 'Informasi dalam teks visual dan audiovisual', tp: [
          ['teks-visual-1', 5, 'menganalisis informasi dalam teks nonsastra berwujud visual, seperti infografik, tabel, atau poster', 'dari teks visual yang disediakan', 'sedikitnya tiga informasi dan satu kesimpulan yang benar'],
          ['teks-visual-2', 6, 'menyimpulkan informasi dari tayangan audiovisual, seperti video berita atau iklan layanan masyarakat', '', 'dengan kesimpulan yang sesuai isi tayangan']
        ] },
        { id: 'nilai-teks-sastra', nama: 'Nilai-nilai dalam teks sastra', tp: [
          ['nilai-teks-sastra-1', 5, 'menganalisis unsur cerita dan nilai-nilai dalam cerita fiksi', '', 'dengan bukti kutipan dari teks'],
          ['nilai-teks-sastra-2', 6, 'membandingkan nilai-nilai dalam dua cerita atau puisi', 'dari dua teks yang dibaca', 'sedikitnya satu persamaan dan satu perbedaan disertai bukti']
        ] }
      ] },
      { id: 'berbicara-mempresentasikan', nama: 'Berbicara dan Mempresentasikan', materi: [
        { id: 'presentasi-gagasan', nama: 'Mempresentasikan gagasan', tp: [
          ['presentasi-gagasan-1', 5, 'mempresentasikan hasil pengamatan atau gagasan', 'di depan kelas', 'secara runtut, efektif, dan santun'],
          ['presentasi-gagasan-2', 6, 'mempresentasikan gagasan dan menjawab pertanyaan pendengar', 'berbantuan media seperti poster atau gambar', 'dengan jawaban yang sesuai pertanyaan']
        ] },
        { id: 'ekspresi-sastra', nama: 'Menyampaikan perasaan dalam karya sastra', tp: [
          ['ekspresi-sastra-1', 5, 'membacakan puisi', 'di depan kelas', 'dengan lafal, intonasi, dan ekspresi yang sesuai'],
          ['ekspresi-sastra-2', 6, 'menyampaikan perasaan berdasarkan fakta atau imajinasi secara lisan dalam bentuk puisi atau cerita', 'dari pengalaman sendiri atau gambar pemantik', 'dengan kosakata yang kreatif']
        ] }
      ] },
      { id: 'menulis', nama: 'Menulis', materi: [
        { id: 'menulis-kreatif', nama: 'Menulis dari gagasan, pengamatan, dan imajinasi', tp: [
          ['menulis-kreatif-1', 5, 'menulis laporan hasil pengamatan sederhana', 'berdasarkan pengamatan langsung', 'dengan kalimat kompleks yang runtut'],
          ['menulis-kreatif-2', 5, 'menulis cerita fiksi', 'berdasarkan imajinasi', 'dengan tokoh, latar, dan alur yang jelas'],
          ['menulis-kreatif-3', 6, 'menulis teks persuasif sederhana, seperti poster atau iklan', 'tentang masalah di sekitar sekolah', 'dengan bahasa yang menarik dan ajakan yang jelas'],
          ['menulis-kreatif-4', 6, 'menulis puisi', 'berdasarkan pengalaman atau imajinasi', 'sedikitnya dua bait dengan pilihan kata yang indah']
        ] },
        { id: 'kaidah-makna-kata', nama: 'Kaidah kebahasaan dan makna kata', tp: [
          ['kaidah-makna-kata-1', 5, 'menggunakan ejaan, tanda baca, dan kalimat efektif dalam tulisan', 'saat menulis dan menyunting tulisan sendiri', 'dengan paling banyak tiga kesalahan ejaan dalam satu tulisan'],
          ['kaidah-makna-kata-2', 6, 'membedakan makna denotatif dan konotatif serta menggunakannya dalam tulisan', 'dari contoh kalimat', 'sedikitnya 4 dari 5 kalimat benar']
        ] }
      ] }
    ]
  },

  // IPAS hanya ada di fase B dan C. Pembagian kelas mengikuti ATP di Buku Panduan Guru IPAS Kelas III–VI (Edisi Revisi)
  {
    berkas: 'ipas-fase-b', mapelId: 'ipas', mapel: 'IPAS', fase: 'B', baris: IPAS, bagian: `${BAGIAN_IPAS}, Fase B`,
    elemen: [
      { id: 'pemahaman-ipas', nama: 'Pemahaman IPAS', materi: [
        { id: 'pancaindra', nama: 'Pancaindra', tp: [
          ['pancaindra-1', 3, 'menjelaskan hubungan bentuk dan fungsi setiap pancaindra', 'melalui pengamatan dan percobaan sederhana', 'dengan tepat untuk kelima indra'],
          ['pancaindra-2', 3, 'menyebutkan cara merawat pancaindra dalam kegiatan sehari-hari', 'dari pengalaman sendiri dan gambar', 'sedikitnya satu cara untuk setiap indra']
        ] },
        { id: 'siklus-hidup', nama: 'Siklus hidup makhluk hidup', tp: [
          ['siklus-hidup-1', 3, 'menceritakan kembali tahapan siklus hidup hewan atau tumbuhan di sekitarnya', 'menggunakan gambar atau model sederhana', 'dengan urutan tahap yang benar'],
          ['siklus-hidup-2', 3, 'menganalisis perubahan pada setiap tahap siklus hidup dan upaya melestarikan makhluk hidup tersebut', 'dari hasil pengamatan atau gambar', 'sedikitnya satu upaya pelestarian yang sesuai']
        ] },
        { id: 'wujud-zat', nama: 'Wujud zat dan perubahannya', tp: [
          ['wujud-zat-1', 3, 'membedakan benda padat, cair, dan gas berdasarkan ciri-cirinya', 'melalui pengamatan benda di sekitarnya', 'sedikitnya 8 dari 10 benda benar'],
          ['wujud-zat-2', 3, 'menyimpulkan proses perubahan wujud zat (mencair, membeku, menguap, mengembun)', 'dari percobaan sederhana', 'dengan kesimpulan yang sesuai hasil percobaan']
        ] },
        { id: 'energi', nama: 'Sumber, bentuk, dan perubahan energi', tp: [
          ['energi-1', 3, 'menyebutkan sumber dan bentuk energi', '', 'sedikitnya tiga sumber dan tiga bentuk energi'],
          ['energi-2', 4, 'menjelaskan perubahan bentuk energi pada alat sehari-hari, misalnya kipas angin atau setrika', 'dari pengamatan alat di rumah atau sekolah', 'dengan urutan perubahan energi yang benar'],
          ['energi-3', 4, 'menjelaskan manfaat perubahan bentuk energi bagi kehidupan sehari-hari', '', 'sedikitnya dua contoh yang benar']
        ] },
        { id: 'gaya', nama: 'Gaya dan pengaruhnya', tp: [
          ['gaya-1', 4, 'membedakan gaya otot, gaya gesek, gaya magnet, gaya pegas, dan gaya gravitasi', 'melalui contoh kegiatan sehari-hari', 'sedikitnya 4 dari 5 contoh benar'],
          ['gaya-2', 4, 'menjelaskan pengaruh gaya terhadap arah, gerak, dan bentuk benda', 'melalui percobaan sederhana', 'dengan penjelasan yang sesuai hasil percobaan']
        ] },
        { id: 'pelestarian-alam', nama: 'Pelestarian sumber daya alam dan perubahan iklim', tp: [
          ['pelestarian-alam-1', 4, 'menjelaskan penyebab dan dampak perubahan iklim', '', 'sedikitnya dua penyebab dan dua dampak'],
          ['pelestarian-alam-2', 4, 'menghasilkan solusi untuk melestarikan sumber daya alam sebagai upaya mitigasi perubahan iklim, misalnya hemat air atau mengurangi sampah plastik', 'berdasarkan masalah nyata di sekitar sekolah atau rumah', 'sedikitnya satu solusi yang dapat dilakukan sendiri']
        ] },
        { id: 'peran-interaksi', nama: 'Peran, tugas, dan interaksi sosial', tp: [
          ['peran-interaksi-1', 3, 'menjelaskan peran dan tugas dirinya di rumah dan di sekolah', 'sesuai aturan yang berlaku', 'sedikitnya dua peran di setiap tempat'],
          ['peran-interaksi-2', 4, 'menjelaskan peran, tugas, dan tanggung jawab orang-orang di sekitar tempat tinggal dan sekolah serta interaksi sosial di antara mereka', 'melalui wawancara atau pengamatan', 'sedikitnya tiga contoh yang benar']
        ] },
        { id: 'denah-peta', nama: 'Denah dan peta wilayah', tp: [
          ['denah-peta-1', 3, 'membuat denah sederhana rumah, kelas, atau lingkungan sekitar', 'yang dilengkapi arah mata angin', 'dengan letak benda atau tempat yang sesuai kenyataan'],
          ['denah-peta-2', 4, 'menunjukkan letak kabupaten/kota dan provinsi tempat tinggalnya', 'pada peta konvensional atau digital', '']
        ] },
        { id: 'bentang-alam', nama: 'Bentang alam, profesi, dan budaya', tp: [
          ['bentang-alam-1', 4, 'mengklasifikasikan ragam bentang alam di daerahnya, seperti pegunungan, dataran rendah, dan pantai', 'dari gambar atau peta', 'sedikitnya 4 dari 5 gambar benar'],
          ['bentang-alam-2', 4, 'menjelaskan keterkaitan bentang alam dengan profesi masyarakat dan ragam budaya di daerahnya', 'dari pengamatan atau sumber bacaan', 'sedikitnya dua keterkaitan yang benar'],
          ['bentang-alam-3', 4, 'menjelaskan upaya melestarikan budaya dan kearifan lokal di daerahnya', 'dari contoh budaya setempat', 'sedikitnya dua upaya yang dapat dilakukan murid']
        ] },
        { id: 'sejarah-masyarakat', nama: 'Sejarah keluarga dan masyarakat sekitar', tp: [
          ['sejarah-masyarakat-1', 3, 'menceritakan sejarah keluarganya dan perubahan kehidupan masyarakat di lingkungan tempat tinggal dari dulu sampai sekarang', 'berdasarkan wawancara kepada anggota keluarga atau tokoh setempat', 'dengan urutan waktu yang benar'],
          ['sejarah-masyarakat-2', 3, 'membandingkan kehidupan masyarakat sekitar pada masa lalu dan masa kini, misalnya alat transportasi atau permainan anak', 'dari gambar atau cerita narasumber', 'sedikitnya dua perbedaan yang benar']
        ] },
        { id: 'uang-keuangan', nama: 'Nilai uang dan mengelola keuangan', tp: [
          ['uang-keuangan-1', 3, 'membedakan kebutuhan dan keinginan serta menentukan skala prioritas saat berbelanja', 'dari daftar belanja sederhana', 'dengan alasan yang masuk akal'],
          ['uang-keuangan-2', 3, 'menjelaskan nilai mata uang dan fungsinya sebagai alat tukar', 'dalam simulasi jual beli memakai uang mainan', 'dengan perhitungan uang yang benar'],
          ['uang-keuangan-3', 3, 'membuat rencana mengelola uang saku, misalnya menyisihkan sebagian untuk ditabung', 'dalam tabel rencana sederhana', 'dengan jumlah pengeluaran yang tidak melebihi uang saku']
        ] }
      ] },
      { id: 'keterampilan-proses', nama: 'Keterampilan Proses', materi: [
        { id: 'mengamati', nama: 'Mengamati', tp: [
          ['mengamati-1', 3, 'mengamati suatu fenomena dan mencatat hasil pengamatannya', 'dengan panduan lembar pengamatan', 'sedikitnya tiga hasil pengamatan yang sesuai']
        ] },
        { id: 'mempertanyakan-memprediksi', nama: 'Mempertanyakan dan memprediksi', tp: [
          ['mempertanyakan-memprediksi-1', 3, 'mengajukan pertanyaan tentang hal yang diamati dan membuat prediksi', 'berdasarkan pengetahuan yang dimiliki sebelumnya', 'sedikitnya satu pertanyaan dan satu prediksi yang relevan']
        ] },
        { id: 'menyelidiki', nama: 'Merencanakan dan melakukan penyelidikan', tp: [
          ['menyelidiki-1', 4, 'membuat rencana dan melakukan langkah-langkah penyelidikan, termasuk mengukur', 'dengan panduan guru dan alat ukur sederhana', '']
        ] },
        { id: 'mengolah-data', nama: 'Memproses dan menganalisis data', tp: [
          ['mengolah-data-1', 3, 'menyajikan data hasil pengamatan dalam turus dan diagram gambar untuk menemukan pola', 'di bawah bimbingan guru', 'dengan data yang sesuai hasil pengamatan'],
          ['mengolah-data-2', 4, 'membandingkan hasil pengamatan dengan prediksi dan memberikan penjelasan', 'dari data penyelidikan sendiri', '']
        ] },
        { id: 'refleksi-komunikasi', nama: 'Mengevaluasi dan mengomunikasikan hasil', tp: [
          ['refleksi-komunikasi-1', 4, 'merefleksikan penyelidikan dan mengomunikasikan hasilnya', 'secara lisan dan tertulis', 'dengan sedikitnya satu hal yang perlu diperbaiki']
        ] }
      ] }
    ]
  },
  {
    berkas: 'ipas-fase-c', mapelId: 'ipas', mapel: 'IPAS', fase: 'C', baris: IPAS, bagian: `${BAGIAN_IPAS}, Fase C`,
    elemen: [
      { id: 'pemahaman-ipas', nama: 'Pemahaman IPAS', materi: [
        { id: 'letak-geografis', nama: 'Letak dan kondisi geografis Indonesia', tp: [
          ['letak-geografis-1', 5, 'menjelaskan letak geografis Indonesia', 'menggunakan peta konvensional atau digital', 'dengan batas wilayah dan posisi Indonesia yang benar'],
          ['letak-geografis-2', 5, 'menganalisis pengaruh letak dan kondisi geografis Indonesia terhadap kehidupan masyarakat, misalnya sebagai negara maritim dan agraris', 'dari peta, gambar, dan sumber bacaan', 'sedikitnya dua pengaruh disertai alasan']
        ] },
        { id: 'kegiatan-ekonomi', nama: 'Kegiatan ekonomi masyarakat', tp: [
          ['kegiatan-ekonomi-1', 5, 'menjelaskan kegiatan produksi, distribusi, dan konsumsi', 'dari contoh kegiatan ekonomi di lingkungan sekitar', 'sedikitnya satu contoh yang benar untuk setiap kegiatan'],
          ['kegiatan-ekonomi-2', 5, 'menerapkan kegiatan ekonomi sederhana dan mengusulkan solusi atas masalah yang muncul', 'dalam kegiatan jual beli hasil karya kelas', 'sedikitnya satu solusi yang masuk akal']
        ] },
        { id: 'ekosistem', nama: 'Ekosistem', tp: [
          ['ekosistem-1', 5, 'menganalisis hubungan komponen biotik dan abiotik dalam ekosistem, termasuk rantai dan jaring-jaring makanan', 'dari pengamatan lingkungan sekitar atau gambar', 'sedikitnya tiga hubungan yang benar'],
          ['ekosistem-2', 5, 'mengevaluasi dampak aktivitas manusia terhadap keseimbangan ekosistem', 'dari kasus nyata di sekitarnya', 'sedikitnya dua dampak dan satu usulan perbaikan'],
          ['ekosistem-3', 5, 'menjelaskan siklus air dan mengusulkan upaya menjaga ketersediaan air', 'menggunakan diagram atau model sederhana', 'dengan urutan tahap yang benar dan sedikitnya dua upaya']
        ] },
        { id: 'sejarah-daerah', nama: 'Sejarah daerah dan perjuangan pahlawan', tp: [
          ['sejarah-daerah-1', 5, 'menjelaskan sejarah daerahnya melalui peninggalan sejarah dan warisan budaya', 'dari kunjungan, gambar, atau wawancara narasumber', 'sedikitnya dua peninggalan beserta ceritanya'],
          ['sejarah-daerah-2', 6, 'meninjau sejarah perjuangan pahlawan di daerahnya dan dampaknya bagi perkembangan daerah', 'dari sumber bacaan atau cerita narasumber', 'sedikitnya satu dampak disertai bukti']
        ] },
        { id: 'organ-tubuh', nama: 'Sistem organ tubuh dan kesehatan', tp: [
          ['organ-tubuh-1', 5, 'menjelaskan perubahan tubuh pada masa pubertas dan cara menjaga kesehatan diri', 'dari gambar dan bacaan', 'sedikitnya tiga perubahan dan dua cara menjaga kesehatan'],
          ['organ-tubuh-2', 6, 'menjelaskan organ dan fungsi sistem pencernaan serta cara menjaganya, termasuk memilih makanan bergizi', 'menggunakan gambar atau model organ', 'dengan urutan organ dan fungsi yang benar'],
          ['organ-tubuh-3', 6, 'menjelaskan organ dan fungsi sistem pernapasan serta cara menjaganya', 'menggunakan gambar atau model organ', 'dengan urutan organ dan fungsi yang benar'],
          ['organ-tubuh-4', 6, 'merefleksikan kebiasaan sehari-hari dan menyusun cara menjaga kesehatan sistem organ tubuh', 'berdasarkan catatan kebiasaan selama satu minggu', 'sedikitnya dua kebiasaan yang akan diperbaiki']
        ] },
        { id: 'cahaya', nama: 'Cahaya', tp: [
          ['cahaya-1', 5, 'menjelaskan sifat-sifat cahaya (merambat lurus, dapat dipantulkan, dapat dibiaskan, dan menembus benda bening)', 'melalui percobaan sederhana', 'dengan penjelasan yang sesuai hasil percobaan'],
          ['cahaya-2', 5, 'menjelaskan penerapan sifat cahaya dalam kehidupan sehari-hari, misalnya pada cermin dan kaca pembesar', 'dari benda di sekitarnya', 'sedikitnya dua contoh yang benar']
        ] },
        { id: 'bunyi', nama: 'Bunyi', tp: [
          ['bunyi-1', 5, 'menjelaskan bagaimana bunyi dihasilkan dan merambat melalui benda padat, cair, dan gas', 'melalui percobaan sederhana', 'dengan penjelasan yang sesuai hasil percobaan'],
          ['bunyi-2', 5, 'menjelaskan pemantulan bunyi dan pemanfaatan bunyi dalam kehidupan sehari-hari', '', 'sedikitnya dua contoh yang benar']
        ] },
        { id: 'kearifan-lokal', nama: 'Keragaman budaya dan kearifan lokal', tp: [
          ['kearifan-lokal-1', 6, 'menemukan keragaman budaya nasional dan nilai-nilai kearifan lokal di daerah tempat tinggalnya', 'dari sumber bacaan, tayangan, atau wawancara', 'sedikitnya tiga contoh budaya beserta nilainya'],
          ['kearifan-lokal-2', 6, 'merefleksikan makna kearifan lokal untuk memperkuat persatuan dalam kebinekaan', 'dalam tulisan atau diskusi', 'dengan sedikitnya satu contoh sikap yang akan dilakukan']
        ] },
        { id: 'energi-masa-depan', nama: 'Penghematan energi dan energi alternatif', tp: [
          ['energi-masa-depan-1', 6, 'menganalisis penggunaan energi fosil di lingkungannya beserta keunggulan dan keterbatasannya', 'dari data penggunaan energi di rumah atau sekolah', 'sedikitnya dua keunggulan dan dua keterbatasan'],
          ['energi-masa-depan-2', 6, 'menghasilkan upaya penghematan energi', 'di rumah atau di sekolah', 'sedikitnya tiga upaya yang dapat dilakukan sendiri'],
          ['energi-masa-depan-3', 6, 'menjelaskan pemanfaatan sumber energi alternatif sebagai upaya mitigasi perubahan iklim', 'dari contoh di sekitarnya atau sumber bacaan', 'sedikitnya dua contoh yang benar']
        ] },
        { id: 'tata-surya', nama: 'Sistem tata surya', tp: [
          ['tata-surya-1', 6, 'menjelaskan anggota sistem tata surya dan ciri-cirinya', 'menggunakan gambar atau model tata surya', 'sedikitnya satu ciri untuk setiap anggota'],
          ['tata-surya-2', 6, 'menjelaskan hubungan rotasi dan revolusi bumi dengan peristiwa sehari-hari, seperti siang dan malam, perbedaan waktu, dan pergantian tahun', 'melalui peragaan memakai senter dan bola', '']
        ] }
      ] },
      { id: 'keterampilan-proses', nama: 'Keterampilan Proses', materi: [
        { id: 'mengamati', nama: 'Mengamati', tp: [
          ['mengamati-c-1', 5, 'mengamati fenomena, mencatat hasilnya, serta mencari persamaan dan perbedaannya', 'dengan lembar pengamatan', 'sedikitnya dua persamaan dan dua perbedaan']
        ] },
        { id: 'mempertanyakan-memprediksi', nama: 'Mempertanyakan dan memprediksi', tp: [
          ['mempertanyakan-memprediksi-c-1', 5, 'mengidentifikasi pertanyaan yang dapat diselidiki secara ilmiah dan membuat prediksinya', 'dengan panduan guru', 'sedikitnya satu pertanyaan yang dapat diuji']
        ] },
        { id: 'menyelidiki', nama: 'Merencanakan dan melakukan penyelidikan', tp: [
          ['menyelidiki-c-1', 6, 'merencanakan dan melakukan langkah-langkah penyelidikan', 'secara mandiri dengan alat ukur sederhana', '']
        ] },
        { id: 'mengolah-data', nama: 'Memproses dan menganalisis data', tp: [
          ['mengolah-data-c-1', 5, 'mengolah data dalam tabel dan grafik serta menjelaskan pola atau hubungan pada data', 'dari data hasil penyelidikan', 'sedikitnya satu pola atau hubungan yang benar'],
          ['mengolah-data-c-2', 6, 'membandingkan data dengan prediksi dan memberikan alasan', 'berdasarkan bukti hasil penyelidikan', '']
        ] },
        { id: 'refleksi-komunikasi', nama: 'Mengevaluasi dan mengomunikasikan hasil', tp: [
          ['refleksi-komunikasi-c-1', 6, 'memberikan saran perbaikan terhadap penyelidikan dan mengomunikasikan hasilnya secara utuh', 'dalam berbagai media', 'dengan argumen yang didukung data']
        ] }
      ] }
    ]
  }
]

for (const d of DATA) {
  const cp = d.sebaris
    ? capaianSebaris(d.baris[0], d.baris[1], d.sebaris, d.elemen.map(e => e.nama))
    : capaian(d.baris[0], d.baris[1], d.fase)
  const isi = {
    contoh: false,
    mapelId: d.mapelId,
    mapel: d.mapel,
    fase: d.fase,
    sumber: { dokumen: 'Keputusan Kepala BSKAP Nomor 046/H/KR/2025', bagian: d.bagian },
    elemen: d.elemen.map((e) => {
      const teks = cp[e.nama]
      if (!teks) throw new Error(`${d.berkas}: capaian elemen "${e.nama}" tidak ditemukan di sumber (ada: ${Object.keys(cp).join(', ')})`)
      return {
        id: e.id,
        nama: e.nama,
        capaian: teks,
        materi: e.materi.map(m => ({
          id: m.id,
          nama: m.nama,
          kelas: [...new Set(m.tp.map(t => t[1]))].sort(),
          tp: m.tp.map(tpAbcd)
        }))
      }
    })
  }
  const kepala = '# Teks capaian disalin apa adanya dari Kepka BSKAP 046/H/KR/2025 (sumber/kurikulum/CAPAIAN PEMBELAJARAN 046.md).\n'
    + '# Materi, pembagian kelas, dan TP adalah contoh susunan Guru Kampung; sekolah boleh mengubahnya. Jangan ubah id yang sudah dipakai.\n'
  fs.writeFileSync(`content/kurikulum/${d.berkas}.yml`, kepala + stringify(isi, { lineWidth: 0 }))
  const jumlahTp = isi.elemen.reduce((n, e) => n + e.materi.reduce((k, m) => k + m.tp.length, 0), 0)
  console.log(`${d.berkas}.yml: ${isi.elemen.length} elemen, ${jumlahTp} TP`)
}
