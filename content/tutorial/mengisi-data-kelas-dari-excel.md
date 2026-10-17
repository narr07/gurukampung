---
title: Mengisi Data Kelas dari Excel
description: Daftar siswa cukup ditempel sekali dari Excel atau Google Sheets, lalu langsung dipakai di Pemilih Siswa Acak, Pembagi Kelompok, Rekap Absensi, dan alat lainnya.
date: 2026-10-16
kategori: cara-pakai
urutan: 1
durasi: 5 menit
alat:
  - pemilih-acak
  - pembagi-kelompok
  - rekap-absensi
ilustrasi: kartu-nama
---

Banyak alat Guru Kampung memakai nama siswa. Supaya Anda tidak mengetik ulang di setiap alat, daftar siswa disimpan sekali di **Data Kelas**. Setelah itu, setiap alat yang membutuhkan nama siswa tinggal memilih kelasnya.

## Membuat kelas

::steps{level="3"}

### Buka Data Kelas

Tekan tombol **Menu** di pojok kanan atas, lalu pilih **Data Kelas**.

### Beri nama kelas

Di kartu **Kelas baru**, ketik nama kelas, misalnya `Kelas 4A`, lalu tekan **Buat kelas**.

### Tempel daftar siswa

Buka daftar siswa di Excel atau Google Sheets. Blok kolom nomor absen, nama, dan jenis kelamin (L/P), lalu salin dengan `Ctrl` + `C`. Kembali ke Guru Kampung dan tempel di kotak **Tempel dari Excel** dengan `Ctrl` + `V`.

### Periksa pratinjau, lalu simpan

Guru Kampung menampilkan berapa siswa yang terbaca dan baris mana yang dilewati. Kalau sudah sesuai, tekan **Tambahkan ke daftar**.

::

::tip
Kolom jenis kelamin boleh dikosongkan. Satu nama per baris juga bisa dibaca. Kolom L/P hanya dibutuhkan kalau Anda ingin memakai mode **seimbang laki-laki dan perempuan** di Pembagi Kelompok.
::

## Format yang bisa dibaca

Ketiga contoh ini sama-sama terbaca:

```text
1	Budi Santoso	L
2	Siti Aminah	P
3	Rizky Pratama	L
```

```text
Budi Santoso
Siti Aminah
Rizky Pratama
```

```text
1	Budi Santoso
2	Siti Aminah
```

Baris yang tidak berisi nama, misalnya judul kolom atau baris kosong, otomatis dilewati.

## Mengubah data siswa

Pilih kelasnya di Data Kelas. Nama lengkap, nama panggilan, nomor absen, dan jenis kelamin bisa diubah langsung di tabel. Nama panggilan dipakai di alat yang tampil di proyektor, seperti Pemilih Siswa Acak, supaya tulisannya pendek dan mudah dibaca dari bangku belakang.

## Data tersimpan di perangkat ini

Data kelas tersimpan di peramban perangkat yang Anda pakai, tidak dikirim ke server. Artinya:

- Data di laptop sekolah tidak otomatis muncul di laptop rumah.
- Kalau riwayat peramban dihapus, data kelas ikut terhapus.

::caution
Unduh cadangan secara berkala di **Pengaturan**, lalu simpan filenya di flashdisk atau Google Drive. File yang sama bisa dipulihkan di perangkat lain.
::

## Mencoba tanpa data asli

Belum sempat menyiapkan daftar siswa? Tekan **Isi kelas contoh**, baik di Data Kelas maupun di alat mana pun yang membutuhkan nama siswa. Guru Kampung membuat "Kelas Contoh (data dummy)" berisi 24 siswa, lengkap dengan nilai rapor, nilai ketuntasan per TP, dan absensi sejak awal bulan lalu. Dengan begitu Kalkulator Nilai Rapor, Rekap Absensi, Kalkulator Ketuntasan, dan Pembagi Kelompok mode seimbang nilai langsung bisa dicoba. Kelas contoh bisa dihapus kapan saja di Data Kelas.
