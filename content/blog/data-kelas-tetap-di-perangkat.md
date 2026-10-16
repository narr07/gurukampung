---
title: Kenapa data kelas Anda tidak pernah dikirim ke server
description: Nama murid, nilai, dan absensi di Peragu tersimpan di peramban perangkat Anda sendiri. Ini alasannya, dan cara menjaga data itu supaya tidak hilang.
date: 2026-10-16
tags:
  - privasi
  - data kelas
---

Daftar nama murid, nilai rapor, dan catatan kehadiran adalah data anak-anak. Data seperti ini tidak seharusnya tersebar ke tempat yang tidak bisa dikendalikan guru. Karena itu, sejak awal Peragu dirancang supaya **tidak ada server yang menerima data kelas**.

## Di mana datanya disimpan

Semua data kelas tersimpan di **IndexedDB**, tempat penyimpanan bawaan peramban (Chrome, Edge, Firefox, Safari) di perangkat yang sedang Anda pakai. Peragu tidak punya basis data pusat, tidak meminta akun, dan tidak mengirim nama murid ke mana pun.

Dampaknya ada dua, dan keduanya perlu Anda ketahui.

**Kelebihannya:**

- Tidak ada akun yang bisa dibobol dan tidak ada server yang bisa bocor.
- Alat tetap cepat karena data dibaca langsung dari perangkat.
- Anda tidak perlu meminta izin siapa pun untuk memakai data kelas sendiri.

**Konsekuensinya:**

- Data tidak otomatis pindah antarperangkat. Kelas yang Anda isi di laptop sekolah tidak muncul di ponsel.
- Kalau riwayat dan data situs di peramban dihapus, data kelas ikut terhapus.

## Cara menjaga data supaya tidak hilang

Buka **Pengaturan**, lalu unduh **cadangan**. Hasilnya satu file yang berisi semua kelas, siswa, dan data alat. Simpan file itu di tempat yang aman, misalnya flashdisk atau Google Drive pribadi.

File yang sama bisa dipulihkan:

- di perangkat yang sama setelah data peramban terhapus,
- di perangkat lain, misalnya saat pindah dari laptop sekolah ke laptop rumah.

Peragu mencatat kapan terakhir kali Anda mengunduh cadangan, dan menampilkan pengingat kalau sudah lebih dari 30 hari.

## Satu kebiasaan kecil

Unduh cadangan setiap selesai memasukkan nilai atau mengubah daftar siswa. Hanya butuh beberapa detik, dan menyelamatkan pekerjaan berjam-jam kalau laptop rusak atau peramban di-*reset*.
