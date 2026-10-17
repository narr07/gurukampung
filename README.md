# Guru Kampung

**Guru Kampung** adalah kumpulan alat kerja harian guru SD berbasis peramban: mengelola kelas, menilai, membuat lembar kerja cetak (A4 dan F4/folio), serta menampilkan alat peraga interaktif di proyektor. Dilengkapi tutorial perangkat ajar dan blog.

Sebelumnya bernama Peragu. Untuk saat ini semua data kelas, siswa, nilai, dan absensi disimpan di perangkat guru (IndexedDB) dan tidak dikirim ke server.

## Dokumen Proyek

- [Arah Desain (`DESIGN.md`)](./DESIGN.md)
- [Kebutuhan Produk (`okf/prd.md`)](./okf/prd.md)
- [Katalog 31 Alat (`okf/katalog-tools.md`)](./okf/katalog-tools.md)
- [Rencana Kerja (`okf/rencana.md`)](./okf/rencana.md)
- [Keputusan Arsitektur (`okf/keputusan/001-arsitektur.md`)](./okf/keputusan/001-arsitektur.md)
- [Catatan Perubahan (`okf/log.md`)](./okf/log.md)

## Menjalankan di Lokal

```bash
bun install
bun run dev
```

Pengujian, lint, dan pemeriksaan tipe:

```bash
bun run test
bun run lint
bun run typecheck
```

Pakai `bun run test`, bukan `bun test`: `bun test` menjalankan test runner bawaan Bun, sedangkan proyek ini memakai Vitest.
