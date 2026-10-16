# DESIGN.md — Peragu

Arah visual Peragu. Isinya diambil dari jawaban pemilik proyek (14 Oktober 2026, diperbarui 16 Oktober 2026). Angka kontras dihitung dengan rumus WCAG 2.x.

Inspirasi gerak dan gaya ilustrasi: [sowieso.wero-wallet.eu](https://sowieso.wero-wallet.eu/nl-en/consumer). Yang diambil hanya cara bercerita lewat gulir, garis tinta tebal, dan bayangan padat. Warna, ilustrasi, dan isinya milik Peragu sendiri.

## Kesatuan suasana: Beranda dan Alat

Peragu memakai bahasa visual yang sama di seluruh halaman: baik di Beranda (`/`), halaman Alat (`/alat/*`), Data Kelas (`/kelas`), maupun Pengaturan (`/pengaturan`).

| Tempat | Halaman | Dial | Tugasnya |
|---|---|---|---|
| **Panggung** | Beranda (`/`) | ENERGY 3 / RHYTHM 3 / MOTION 3 | Memperkenalkan Peragu dengan cerita bergulir, lalu mengantar guru ke alatnya |
| **Meja kerja bergaya stiker** | Alat (`/alat/*`), Data Kelas, Pengaturan | ENERGY 3 / RHYTHM 2 / MOTION 1 | Menerapkan warna gradien, kartu kertas bergaris tinta 2px, tombol stiker, coretan merah, dan ilustrasi yang sama dengan beranda, namun tanpa animasi gulir supaya tetap nyaman dipakai mengajar |

> **Perubahan 16 Oktober 2026 (disetujui pemilik):** setiap halaman alat menerapkan desain yang sama seperti di beranda (latar gradien langit-kertas-pensil, panel kertas putih/slate-900 dengan garis tinta 2px, tombol stiker berbayangan padat, coretan tinta merah pada judul, dan ilustrasi SVG pendamping). Saat masuk **Mode Proyektor** atau **Cetak**, latar otomatis menjadi polos dan bayangan/gradien dimatikan agar tetap terbaca dari belakang kelas dan hemat tinta.

## Identitas

Peragu adalah alat kerja guru SD. Bahannya diambil dari meja guru: pensil kuning, penggaris, dadu, jam dinding, pesawat kertas, stiker bintang, dan tinta merah untuk mengoreksi. Warna sekolah (biru tua dan merah) tetap menjadi warna utama, ditambah kuning pensil supaya lebih ceria.

## Warna

Palet memakai warna bawaan Tailwind (11 shade lengkap), tanpa nilai heksadesimal karangan.

| Peran | Token | Mode terang | Mode gelap | Kontras |
|---|---|---|---|---|
| Utama | `primary: 'blue'` | blue-800 `#193cb8` | blue-300 `#8ec5ff` | 8,82:1 di atas putih · 9,83:1 di atas slate-900 |
| Aksen | `secondary: 'red'` | red-700 `#c10007` | red-400 `#ff6467` | 6,42:1 di atas putih · 5,12:1 di atas blue-950 |
| Ceria | `--color-pensil` = yellow-300 | yellow-300 `#ffdf20` | yellow-300 | slate-900 di atasnya 13,44:1 · blue-800 di atasnya 6,65:1 |
| Tinta | `--color-tinta` = slate-900 | slate-900 `#0f172b` | yellow-100 `#fef9c2` | 17,83:1 di atas putih · 16,59:1 di atas slate-900 |
| Netral | `neutral: 'slate'` | | | |
| Galat | `error: 'red'` | red-700 | red-400 | sama dengan aksen; galat selalu disertai ikon dan teks |

Shade bawaan Nuxt UI (500 di mode terang, 400 di mode gelap) tidak dipakai untuk biru dan merah, karena blue-500 di atas putih kurang dari 4,5:1.

### Gradien panggung (hanya beranda)

Latar beranda adalah gradien diagonal **langit → kertas → pensil**:

- Mode terang: sky-300 `#74d4ff` → yellow-100 `#fef9c2` → yellow-300 `#ffdf20`.
- Mode gelap: blue-950 `#162456` → slate-900 `#0f172b`, dengan kuning pensil sebagai warna sorotan.

Teks di atas gradien selalu memakai warna tinta. Titik terlemahnya slate-900 di atas sky-300, yaitu 10,70:1. Teks abu (slate-700) di atas gradien masih 6,22:1.

Gradien punya fungsi: menandai bahwa guru sedang di panggung, bukan di meja kerja. Halaman alat tidak memakainya (R-01).

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
| Judul panggung | **Bricolage Grotesque** 800, huruf kapital | Ukuran `clamp(3rem, 11vw, 9rem)`, jarak baris 0,9, jarak huruf -0,02em. Hanya di beranda |
| Judul halaman | Bricolage Grotesque 700, huruf biasa | Judul setiap halaman alat, Data Kelas, dan Pengaturan |
| Teks | **Lexend** 400 sampai 600 | Semua teks lain: isi, tombol, label, tabel, angka di alat |

- Bricolage Grotesque dipilih karena bentuknya lebar, tebal, dan sedikit tidak rapi, seperti huruf yang ditulis di papan tulis. Rasanya ramah tanpa terlihat kekanak-kanakan.
- Lexend tetap untuk teks karena dirancang untuk kemudahan membaca dan jelas di proyektor maupun di kertas.
- Angka besar di alat (timer, hasil dadu) memakai Lexend, bukan Bricolage, supaya tetap terbaca dari bangku belakang.
- Mode proyektor menaikkan ukuran teks, bukan mengganti font.

## Bentuk: gaya stiker

Semua yang bisa ditekan terlihat seperti stiker yang ditempel: garis tinta tebal dan bayangan padat tanpa blur.

| Unsur | Aturan |
|---|---|
| Garis tinta | 2px warna tinta pada tombol utama, pulau navbar, dan kartu yang berupa tautan |
| Bayangan padat | `0 4px 0` warna tinta, tanpa blur. Saat ditekan, bayangan menjadi `0 1px 0` dan elemen turun 3px |
| Radius | Pil penuh hanya untuk tombol dan pulau navbar. Kartu memakai `1.5rem`. Isian formulir tetap `--ui-radius: 0.75rem` |
| Miring | Kartu di beranda boleh miring -2° sampai 2°. Di meja kerja tidak ada yang miring |

Alasan bayangan padat (R-12): bayangan ini menandai **bisa ditekan**. Teks, judul, dan kotak informasi yang tidak bisa diklik tetap rata tanpa bayangan.

### Navbar pulau

Navbar terdiri dari pulau-pulau terpisah: logo, navigasi, dan aksi. Pulau-pulau itu mengambang di atas konten (`sticky top-3`).

- Setiap pulau berlatar putih (gelap: slate-900) dengan garis tinta dan bayangan padat. Latarnya padat, jadi efek blur tidak dipakai lagi.
- Logo berupa tulisan "Peragu" dalam Bricolage Grotesque tebal. Ikon atau logo grafis baru dibuat setelah ada keputusan dari pemilik.
- Di beranda, garis tipis warna tinta di tepi atas layar menunjukkan seberapa jauh halaman sudah digulir.

## Tata letak

### Beranda: cerita bergulir

Beranda disusun sebagai cerita, bukan template landing page. Urutannya mengikuti hal yang perlu guru ketahui:

1. **Pembuka.** Judul besar "Alat kerja guru SD" dengan pensil dan penggaris di kiri-kanan, lalu satu kalimat penjelasan.
2. **Satu daftar siswa.** Data Kelas diisi sekali, lalu dipakai di semua alat. Bagian ini disematkan saat digulir, dan pesawat kertas terbang melintasinya.
3. **Sapuan pensil.** Pensil-pensil panjang menyapu layar secara diagonal sebagai peralihan ke daftar alat.
4. **Daftar alat.** Kartu stiker untuk setiap alat yang sudah siap. Ukurannya mengikuti prioritas (lihat bento di bawah).
5. **Data tetap di perangkat.** Penjelasan bahwa data kelas tidak dikirim ke server, dengan tautan ke Pengaturan untuk mencadangkan.
6. **Segera hadir.** Daftar alat yang sedang dibuat, per kategori, dalam bentuk daftar yang tenang.

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
- Setiap ilustrasi harus terhubung dengan sesuatu yang nyata di Peragu (R-22):

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
- Hover kartu: naik 2px dan bayangan bertambah, 150 ms.
- Di layar di bawah 640px, bagian tidak disematkan. Gerak masuknya saja yang tetap berjalan.

### Konten tanpa JavaScript

Halaman beranda dibuat saat build dan HTML-nya menampilkan keadaan akhir: semua teks dan kartu terlihat. Elemen pembuka baru disembunyikan sebelum animasi kalau JavaScript berjalan dan gerak diizinkan. Kalau animasi tidak mulai dalam 2,5 detik, CSS menampilkan elemen itu dengan sendirinya.

### Gerak dikurangi

Kalau `prefers-reduced-motion: reduce` aktif:

- Lenis tidak dipasang; gulir memakai bawaan peramban.
- Tidak ada `pin`, `scrub`, sapuan pensil, atau gerak masuk. Semua bagian langsung tampil di posisi akhirnya.
- Yang tersisa hanya perubahan warna saat hover dan fokus.

### Meja kerja (MOTION 1)

- Hanya status hover, fokus, dan transisi kecil (maksimal 200 ms).
- Tidak ada animasi muncul bertahap, parallax, atau gerak dekoratif.
- Alat yang memang butuh gerak (roda putar, dadu) bergerak hanya saat dipakai, dan menghormati `prefers-reduced-motion`.

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
