# DESIGN.md — Guru Kampung

Arah visual Guru Kampung. Isinya diambil dari jawaban pemilik proyek (14 Oktober 2026, diperbarui 16 Oktober 2026). Angka kontras dihitung dengan rumus WCAG 2.x.

Inspirasi gerak dan gaya ilustrasi: [sowieso.wero-wallet.eu](https://sowieso.wero-wallet.eu/nl-en/consumer). Yang diambil hanya cara bercerita lewat gulir, garis tinta tebal, dan bayangan padat. Warna, ilustrasi, dan isinya milik Guru Kampung sendiri.

## Kesatuan suasana: Beranda dan Alat

Guru Kampung memakai bahasa visual yang sama di seluruh halaman: baik di Beranda (`/`), halaman Alat (`/alat/*`), Data Kelas (`/kelas`), maupun Pengaturan (`/pengaturan`).

| Tempat | Halaman | Dial | Tugasnya |
|---|---|---|---|
| **Panggung** | Beranda (`/`) | ENERGY 3 / RHYTHM 3 / MOTION 3 | Memperkenalkan Guru Kampung dengan cerita bergulir, lalu mengantar guru ke alatnya |
| **Meja kerja bergaya stiker** | Daftar alat (`/alat`), halaman alat (`/alat/*`), Tutorial, Blog, Dokumen, Data Kelas, Pengaturan | ENERGY 3 / RHYTHM 2 / MOTION 2 | Menerapkan warna gradien, kartu kertas bergaris tinta 2px, tombol stiker, coretan merah, dan ilustrasi yang sama dengan beranda. Isi halaman masuk bertahap saat dibuka, tapi tanpa pin, scrub, dan Lenis supaya tetap nyaman dipakai mengajar |

> **Perubahan 16 Oktober 2026 (disetujui pemilik):** setiap halaman alat menerapkan desain yang sama seperti di beranda (latar gradien langit-kertas-pensil, panel kertas putih/slate-900 dengan garis tinta 2px, tombol stiker berbayangan padat, coretan tinta merah pada judul, dan ilustrasi SVG pendamping). Saat masuk **Mode Proyektor** atau **Cetak**, latar otomatis menjadi polos dan bayangan/gradien dimatikan agar tetap terbaca dari belakang kelas dan hemat tinta.

## Identitas

Guru Kampung adalah alat kerja guru SD. Bahannya diambil dari meja guru: pensil kuning, penggaris, dadu, jam dinding, pesawat kertas, stiker bintang, dan tinta merah untuk mengoreksi. Warna sekolah (biru tua dan merah) tetap menjadi warna utama, ditambah kuning pensil supaya lebih ceria.

## Warna

Palet memakai warna bawaan Tailwind (11 shade lengkap), tanpa nilai heksadesimal karangan.

> **Perubahan 17 Oktober 2026 (disetujui pemilik):** Mode gelap (`dark mode`) dihapus sepenuhnya (`ui.colorMode: false`). Guru Kampung dikunci pada **mode terang** di semua halaman supaya kontras kertas, kuning pensil, dan garis tinta selalu terjaga baik di layar laptop maupun saat ditembakkan ke proyektor kelas.

| Peran | Token | Nilai (Mode Terang Permanen) | Kontras |
|---|---|---|---|
| Utama | `primary: 'blue'` | blue-800 `#193cb8` | 8,82:1 di atas putih |
| Aksen | `secondary: 'red'` | red-700 `#c10007` | 6,42:1 di atas putih |
| Ceria | `--color-pensil` = yellow-300 | yellow-300 `#ffdf20` | slate-900 di atasnya 13,44:1 · blue-800 di atasnya 6,65:1 |
| Tinta | `--color-tinta` = slate-900 | slate-900 `#0f172b` | 17,83:1 di atas putih |
| Netral | `neutral: 'slate'` | slate | |
| Galat | `error: 'red'` | red-700 | sama dengan aksen; galat selalu disertai ikon dan teks |

Shade bawaan Nuxt UI (500) tidak dipakai untuk biru dan merah, karena blue-500 di atas putih kurang dari 4,5:1.

### Gradien panggung

Latar panggung adalah gradien diagonal **langit -> kertas -> pensil**:

- sky-300 `#74d4ff` -> yellow-100 `#fef9c2` -> yellow-300 `#ffdf20`.

Teks di atas gradien selalu memakai warna tinta. Titik terlemahnya slate-900 di atas sky-300, yaitu 10,70:1. Teks abu (slate-700) di atas gradien masih 6,22:1.

### Aturan aksen merah

Merah adalah satu-satunya aksen, ibarat **tinta merah guru**. Merah hanya dipakai untuk sesuatu yang sedang berlangsung, terpilih, atau ditandai:

- item navigasi yang aktif
- timer yang sedang berjalan, dan peringatan saat waktunya habis
- siswa yang terpilih di pemilih acak
- garis bawah judul halaman dan coretan tinta di beranda (motif identitas, lihat di bawah)

Merah tidak dipakai untuk dekorasi, latar kartu, atau ikon biasa. Di atas gradien, merah tidak dipakai sebagai warna teks biasa (red-700 di atas sky-300 hanya 3,85:1). Kata yang disorot memakai kotak merah dengan teks putih (6,42:1).

## Tipografi

| Peran | Font | Aturan |
|---|---|---|
| Judul panggung | **Funnel Display** 800, huruf kapital | Ukuran `clamp(3rem, 11vw, 9rem)`, jarak baris 0,9, jarak huruf -0,02em. Hanya di beranda |
| Judul halaman | Funnel Display 700, huruf biasa | Judul setiap halaman alat, Data Kelas, dan Pengaturan |
| Teks | **Funnel Sans** 400 sampai 700 | Semua teks lain: isi, tombol, label, tabel, angka di alat |

- Funnel Display dan Funnel Sans dipilih pemilik (16 Oktober 2026, menggantikan Bricolage Grotesque dan Lexend). Keduanya satu keluarga, jadi judul dan teks terasa serasi.
- Angka besar di alat (timer, hasil dadu) memakai Funnel Sans, bukan Funnel Display, supaya tetap terbaca dari bangku belakang.
- Mode proyektor menaikkan ukuran teks, bukan mengganti font.

## Bentuk: gaya stiker

Semua yang bisa ditekan terlihat seperti stiker yang ditempel: garis tinta tebal dan bayangan padat tanpa blur.

| Unsur | Aturan |
|---|---|
| Garis tinta | 2px warna tinta pada tombol utama, pulau navbar, dan kartu yang berupa tautan |
| Bayangan padat | `0 4px 0` warna tinta, tanpa blur. Saat ditekan, bayangan menjadi `0 1px 0` dan elemen turun 3px |
| Radius | Pil penuh hanya untuk tombol dan pulau navbar. Kartu memakai `1.5rem`. Isian formulir tetap `--ui-radius: 0.75rem` |
| Miring | Kartu di beranda boleh miring -2° sampai 2° (variabel `--miring`). Saat disentuh atau difokus, kartu berbalik miring ke arah sebaliknya (250 ms, sedikit memantul). Di meja kerja tidak ada yang miring |

Alasan bayangan padat (R-12): bayangan ini menandai **bisa ditekan**. Teks, judul, dan kotak informasi yang tidak bisa diklik tetap rata tanpa bayangan.

### Logo

Tanda Guru Kampung adalah **pensil kuning yang sekaligus rumah** (17 Oktober 2026): ujung raut menjadi atap, badan pensil menjadi dinding, dan pintu melengkung di tengahnya. Pensil mewakili guru, rumah mewakili kampung. Semua file ada di `public/brand/`.

| File | Dipakai untuk |
|---|---|
| `guru-kampung-logo-horizontal.svg` | Latar terang: kop surat, header dokumen, slide |
| `guru-kampung-logo-horizontal-putih.svg` | Latar biru atau gelap; tanda diberi bingkai stiker putih |
| `guru-kampung-logo-vertikal(-putih).svg` | Ruang tegak atau persegi: spanduk, kaos, poster |
| `guru-kampung-mark.svg` | Tanda saja, latar transparan |
| `guru-kampung-mark-stiker.svg` | Tanda saja di latar gelap atau foto |
| `guru-kampung-mark-mono.svg` | Satu warna (`currentColor`): stempel, sablon, bordir, watermark |
| `guru-kampung-app-icon(-persegi).svg`, PNG 1024 | Ikon aplikasi dan avatar media sosial |
| `public/icon.svg`, `favicon.ico` | Tab peramban. Versi sederhana tanpa lekuk raut, karena dibaca di 16–32px |

- Warna hanya dari palet: biru blue-800, kuning pensil yellow-300, kayu yellow-100, tinta slate-900. Merah tidak dipakai di logo.
- Tulisan "Guru Kampung" adalah Funnel Display 800 yang sudah diubah menjadi path, jadi tampil sama di mana pun tanpa font terpasang.
- Jangan memutar, meregangkan, mengganti warna di luar palet, atau menaruh logo berwarna di latar gelap tanpa versi stiker.
- Bagian tanda punya id terpisah untuk animasi: `gk-bayangan`, `gk-badan`, `gk-pintu`, `gk-atap`, `gk-grafit` (dan `gk-tulisan` di logo). Contoh: atap terangkat seperti tutup pensil, pintu terbuka, atau pensil memantul.
- Di header, tanda ditampilkan lewat `LogoTanda.vue`: jatuh lalu memantul saat halaman dibuka; saat disentuh, ujung raut terangkat dan pensil bergoyang seperti menulis. Semua gerak mati kalau pengguna memilih kurangi gerak.

### Maskot (draf)

Maskot adalah tanda yang sama dengan wajah: dua mata di dinding kuning, pintu sebagai mulut, tangan bersarung putih, dan kaki tinta. File: `public/brand/guru-kampung-maskot.svg` (diam) dan `guru-kampung-maskot-animasi.svg` (berkedip dan melambai, berhenti kalau pengguna memilih kurangi gerak). Bagian yang bisa dianimasikan: `gk-mata`, `gk-tangan-kanan`, `gk-tangan-kiri`, `gk-kaki`, `gk-atap`, `gk-pintu`. Nama maskot belum diputuskan.

### Tombol menu

Tidak ada navbar. Navigasi berupa satu tombol **Menu** yang tetap di pojok kanan atas (`fixed`), dipakai di semua halaman (disetujui pemilik, 16 Oktober 2026).

- Tulisan "Guru Kampung" (Funnel Display tebal, pil stiker) ada di kiri atas dan ikut tergulir.
- Tombol menu dan logo berlatar putih dengan garis tinta dan bayangan padat, tanpa blur.
- Saat ditekan, panel kuning pensil terbuka sebagai lingkaran dari posisi tombol. Seluruh isinya muat satu layar tanpa digulir:
  - delapan tautan besar dalam dua kolom, bernomor 01 sampai 08; halaman yang sedang dibuka bergaris bawah tinta merah. Ukuran huruf mengikuti lebar dan tinggi layar, deskripsi hilang di ponsel dan layar pendek;
  - jalan pintas ke alat favorit, atau ke alat harian (P1) kalau belum ada favorit (empat saja di ponsel);
  - tombol Cari (Ctrl K), lalu bagian Akun terpisah berisi Masuk dan Admin.
- Tombol Tutup muncul tepat di posisi tombol Menu. Escape juga menutup panel, dan fokus kembali ke tombol Menu.
- Di beranda, garis tipis warna tinta di tepi atas layar menunjukkan seberapa jauh halaman sudah digulir.

Gerak panel menu adalah satu-satunya gerak di atas 200 ms yang juga ada di meja kerja, karena hanya terjadi saat guru menekan tombol: lingkaran membuka 600 ms, tautan naik satu per satu (jeda 80 ms), pesawat kertas terbang masuk. Dengan `prefers-reduced-motion`, panel langsung tampil tanpa gerak.

## Tata letak

### Beranda: cerita bergulir

Beranda disusun sebagai cerita, bukan template landing page. Urutannya mengikuti hal yang perlu guru ketahui:

1. **Pembuka.** Judul besar "Alat kerja guru SD" dengan pensil dan penggaris di kiri-kanan, lalu satu kalimat penjelasan.
2. **Satu daftar siswa.** Data Kelas diisi sekali, lalu dipakai di semua alat. Bagian ini disematkan saat digulir, dan pesawat kertas terbang melintasinya.
3. **Sapuan pensil.** Pensil-pensil panjang menyapu layar secara diagonal sebagai peralihan ke daftar alat.
4. **Alat harian.** Kartu stiker untuk alat prioritas P1, dengan tombol ke daftar lengkap di `/alat`.
5. **Data tetap di perangkat.** Penjelasan bahwa data kelas tidak dikirim ke server, dengan tautan ke Pengaturan untuk mencadangkan.
6. **Bekal mengajar.** Tiga tutorial dan dua tulisan blog terbaru (kartu blog berlatar kuning pensil supaya beda dari tutorial).

> **Perubahan 16 Oktober 2026 (disetujui pemilik):** Guru Kampung tidak lagi hanya berisi alat. Beranda menjadi landing page, daftar lengkap alat beserta pencarian, saringan kategori, dan favorit pindah ke `/alat`, dan situs mendapat halaman Tutorial, Blog, dan Dokumen.

### Halaman bacaan (tutorial dan blog)

- Konten ditulis sebagai Markdown di `content/tutorial/` dan `content/blog/` (Nuxt Content), dan bisa disunting lewat Nuxt Studio.
- Artikel berada di panel kertas, judul Funnel Display, isi Funnel Sans. Daftar isi menempel di kanan pada layar lebar.
- Tutorial diakhiri tautan stiker ke alat Guru Kampung yang dipakai di dalamnya (frontmatter `alat`).
- Halaman Dokumen sementara hanya berisi keterangan "sedang disiapkan" dan tautan ke alat pembuat dokumen. Tidak ada isi contoh palsu.

Jarak antarbagian sengaja berbeda-beda (RHYTHM 3): bagian yang disematkan setinggi layar, daftar alat rapat, dan bagian privasi lapang.

### Bento untuk kartu alat

> **Pengecualian R-05 (disetujui pemilik, 14 Oktober 2026):** antislop menandai grid bento sebagai pola yang sering dipakai tanpa alasan. Pemilik memilih tetap memakainya. Syaratnya, ukuran kartu harus punya arti, bukan acak.

- Grid 12 kolom di layar besar, 6 kolom di tablet, dan 1 kolom di ponsel (`UPageGrid`).
- Ukuran kartu mengikuti seberapa sering sesuatu dipakai atau seberapa penting:

  | Ukuran | Kelas | Dipakai untuk |
  |---|---|---|
  | 2×2 | `lg:col-span-6 lg:row-span-2` | satu hal terpenting di halaman (di beranda: Data Kelas) |
  | 2×1 | `lg:col-span-6` | alat harian (prioritas P1) |
  | 1×1 | `lg:col-span-3` | alat lainnya |

- Satu halaman paling banyak punya satu kartu 2×2.

## Ilustrasi

Ilustrasi digambar sendiri sebagai SVG di dalam kode, bukan gambar stok atau pustaka ilustrasi.

- Gaya: garis tinta 3px, sudut membulat, isi gradien dari palet di atas, sedikit kesan tiga dimensi (sisi bawah lebih gelap).
- Setiap ilustrasi harus terhubung dengan sesuatu yang nyata di Guru Kampung (R-22):

  | Ilustrasi | Terhubung dengan |
  |---|---|
  | Pensil kuning | Lembar kerja dan latihan menulis; juga pita sapuan |
  | Penggaris | Alat hitung dan nilai rapor |
  | Dadu | Alat Dadu & Spinner, Pemilih Siswa Acak |
  | Jam dinding | Timer & Stopwatch Kelas |
  | Pesawat kertas | Data Kelas yang "terbang" ke semua alat |
  | Kartu nama siswa | Daftar siswa di Data Kelas |
  | Stiker bintang | Hadiah dari guru, Papan Poin |
  | Gembok di tas sekolah | Data tersimpan di perangkat ini saja |

- Ilustrasi selalu dekoratif bagi pembaca layar (`aria-hidden="true"`). Informasinya ada di teks.
- Di mode gelap, garis tinta berganti warna sesuai token tinta.

## Motif identitas

**Tinta merah guru.** Di meja kerja, motif ini berupa garis bawah merah tebal di judul halaman, seperti guru menggarisbawahi dengan pulpen merah. Di beranda, motif yang sama muncul sebagai coretan: satu kata di judul dilingkari atau digarisbawahi tinta merah, dan coretan itu tergambar saat halaman dibuka.

Motif ini dipakai di judul halaman dan judul bagian beranda, tidak di judul kartu.

## Gerak

### Panggung (MOTION 3, hanya beranda)

Pustaka: **GSAP** dengan ScrollTrigger, dan **Lenis** untuk gulir halus. Keduanya dimuat hanya di beranda (impor dinamis), dan dimatikan saat guru pindah ke halaman lain.

| Bagian | Gerak |
|---|---|
| Pembuka | Judul muncul per baris dari bawah dengan sedikit pantulan (`back.out(1.7)`, 700 ms, jeda antarbaris 120 ms). Pensil dan penggaris masuk dari kiri dan kanan. Coretan merah tergambar setelah judul selesai |
| Gulir dari pembuka | Judul mengecil dan naik, pensil dan penggaris keluar layar. Gerak mengikuti gulir (`scrub`) |
| Satu daftar siswa | Bagian disematkan (`pin`) sejauh 100% tinggi layar. Pesawat kertas terbang melintas mengikuti gulir, kartu nama siswa menumpuk satu per satu |
| Sapuan pensil | Pensil panjang menyapu diagonal mengikuti gulir, menutup layar sebentar, lalu membuka daftar alat |
| Daftar alat | Kartu muncul dengan pantulan, jeda antarkartu 80 ms, sekali saja saat pertama terlihat |
| Data tetap di perangkat | Gembok menutup sekali saat bagian terlihat |

Batasan:

- Hanya `transform` dan `opacity` yang dianimasikan.
- Tidak ada animasi yang berulang terus-menerus. Semua gerak dipicu oleh gulir atau terjadi sekali.
- Hover kartu: naik 2px, bayangan bertambah (150 ms), dan kartu yang miring berbalik arah (250 ms).
- Di layar di bawah 640px, bagian tidak disematkan. Gerak masuknya saja yang tetap berjalan.

### Konten tanpa JavaScript

Halaman beranda dibuat saat build dan HTML-nya menampilkan keadaan akhir: semua teks dan kartu terlihat. Elemen pembuka baru disembunyikan sebelum animasi kalau JavaScript berjalan dan gerak diizinkan. Kalau animasi tidak mulai dalam 2,5 detik, CSS menampilkan elemen itu dengan sendirinya.

### Gerak dikurangi

Kalau `prefers-reduced-motion: reduce` aktif:

- Lenis tidak dipasang; gulir memakai bawaan peramban.
- Tidak ada `pin`, `scrub`, sapuan pensil, atau gerak masuk. Semua bagian langsung tampil di posisi akhirnya.
- Yang tersisa hanya perubahan warna saat hover dan fokus.

### Meja kerja (MOTION 2)

> **Perubahan 16 Oktober 2026 (disetujui pemilik):** halaman selain beranda tidak lagi datar. Dial naik dari MOTION 1 ke MOTION 2.

Semua gerak meja kerja ditulis dalam CSS (`main.css`), tanpa GSAP. Karena itu tidak berkedip di halaman statis dan tidak perlu dilepas saat pindah halaman.

| Gerak | Aturan |
|---|---|
| Masuk halaman | Anak langsung halaman (judul, panel, kartu grid) naik 28px dan muncul, 650 ms dengan sedikit pantulan, jeda 90 ms per urutan, paling lama 5 urutan. Dipasang lewat kelas `halaman-masuk` di layout `default` |
| Judul halaman | Coretan tinta merah tergambar (700 ms, mulai 400 ms). Ilustrasi meletup masuk dari 30% dan miring -30°. Saat panel judul disentuh, ilustrasi miring 8° dan membesar 8% |
| Muncul saat digulir | Kartu di `/alat`, Tutorial, dan Blog (kelas `gerak-muncul`) naik 48px dan muncul mengikuti gulir (`animation-timeline: view()`). Peramban yang belum mendukung memakai gerak masuk biasa |
| Kartu dan tombol | Hover seperti di gaya stiker. Kartu miring berbalik arah. Bintang favorit memantul dan memercik saat ditandai |

Batasan:

- Bagian dalam alat (roda, timer, tabel, pratinjau cetak) tidak diberi animasi masuk atau gulir. Alat yang memang butuh gerak (roda putar, dadu) bergerak hanya saat dipakai.
- Tidak ada animasi yang berulang terus-menerus.
- Dengan `prefers-reduced-motion`, semua gerak masuk, gulir, coretan, dan ilustrasi dimatikan; isi langsung tampil di posisi akhirnya.

## Fokus dan aksesibilitas

- Cincin fokus: garis 3px warna tinta dengan jarak 2px, terlihat di atas gradien maupun putih.
- Semua tombol dan kartu tetap bisa dipakai dengan keyboard selama bagian disematkan.
- Ukuran target sentuh minimal 44 × 44px.

## Mode proyektor

- Layar penuh dengan latar polos dan tanpa navbar.
- Teks minimal 2 kali ukuran normal.
- Tombol keluar selalu terlihat di pojok, dan bisa juga keluar dengan Escape.
- Gradien, ilustrasi, dan miring kartu tidak dipakai.

## Cetak

- Hitam-putih. Warna tidak boleh menjadi satu-satunya pembeda informasi.
- Kertas A4 (210 × 297 mm) dan F4 (215 × 330 mm).
- Tanpa navbar, tombol, latar berwarna, gradien, ilustrasi, dan bayangan.
