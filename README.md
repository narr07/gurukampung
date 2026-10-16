# Peragu

**Peragu** (*peraga* + *guru*) adalah kumpulan alat kerja harian guru SD berbasis peramban: mengelola kelas, menilai, membuat lembar kerja cetak (A4 dan F4/folio), serta menampilkan alat peraga interaktif di proyektor.

Semua data kelas, siswa, nilai, dan absensi disimpan di perangkat guru (IndexedDB) dan tidak dikirim ke server.

## Dokumen Proyek

- [Arah Desain (`design.md`)](./design.md)
- [Kebutuhan Produk (`okf/prd.md`)](./okf/prd.md)
- [Katalog 31 Alat (`okf/katalog-tools.md`)](./okf/katalog-tools.md)
- [Rencana Kerja (`okf/rencana.md`)](./okf/rencana.md)
- [Keputusan Arsitektur (`okf/keputusan/001-arsitektur.md`)](./okf/keputusan/001-arsitektur.md)
- [Catatan Perubahan (`okf/log.md`)](./okf/log.md)

## Menjalankan di Lokal

```bash
pnpm install
pnpm dev
```

Pengujian, lint, dan pemeriksaan tipe:

```bash
pnpm test
pnpm lint
pnpm typecheck
```
