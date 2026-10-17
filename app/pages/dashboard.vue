<script setup lang="ts">
useSeoMeta({
  title: 'Dashboard Akun',
  description: 'Kelola akun Guru Kampung, sisa kuota AI bulanan, paket langganan, dan riwayat pembayaran.'
})

const toast = useToast()

type StatusSimulasi = 'aktif' | 'hampir-habis' | 'gratis'
const modePratinjau = useLocalStorage<StatusSimulasi>('gurukampung:pratinjau:status-akun', 'aktif', { initOnMounted: true })

const profil = useLocalStorage('gurukampung:pratinjau:profil-akun', {
  nama: 'Siti Aminah, S.Pd.',
  email: 'siti.aminah42@guru.sd.belajar.id',
  metodeMasuk: ['Google (belajar.id)', 'Tautan Email'],
  paket: 'Berbayar Bulanan',
  berakhirPada: '2026-11-17',
  sisaHari: 31,
  kuotaTeksTerpakai: 14,
  kuotaTeksMaks: 60,
  kuotaGambarTerpakai: 6,
  kuotaGambarMaks: 25
}, { initOnMounted: true, mergeDefaults: true })

const sisaHariTampil = computed(() => {
  if (modePratinjau.value === 'gratis') return 0
  if (modePratinjau.value === 'hampir-habis') return 5
  return profil.value.sisaHari
})

const paketTampil = computed(() => {
  if (modePratinjau.value === 'gratis') return 'Akun Gratis'
  return profil.value.paket
})

const kuotaTeks = computed(() => {
  if (modePratinjau.value === 'gratis') {
    return { terpakai: 1, maks: 3, sisa: 2, persen: 33 }
  }
  const sisa = Math.max(0, profil.value.kuotaTeksMaks - profil.value.kuotaTeksTerpakai)
  const persen = Math.min(100, Math.round((profil.value.kuotaTeksTerpakai / profil.value.kuotaTeksMaks) * 100))
  return { terpakai: profil.value.kuotaTeksTerpakai, maks: profil.value.kuotaTeksMaks, sisa, persen }
})

const kuotaGambar = computed(() => {
  if (modePratinjau.value === 'gratis') {
    return { terpakai: 0, maks: 1, sisa: 1, persen: 0 }
  }
  const sisa = Math.max(0, profil.value.kuotaGambarMaks - profil.value.kuotaGambarTerpakai)
  const persen = Math.min(100, Math.round((profil.value.kuotaGambarTerpakai / profil.value.kuotaGambarMaks) * 100))
  return { terpakai: profil.value.kuotaGambarTerpakai, maks: profil.value.kuotaGambarMaks, sisa, persen }
})

// Bar kuota terisi halus lewat GSAP (scaleX, bukan width) saat tampil dan setiap kali angkanya berubah.
// Bar bisa muncul belakangan (v-if mode pratinjau), jadi elemennya ikut diawasi
const barTeks = useTemplateRef<HTMLElement>('barTeks')
const barGambar = useTemplateRef<HTMLElement>('barGambar')
const reducedMotion = usePreferredReducedMotion()

watch(
  [barTeks, barGambar, () => kuotaTeks.value.persen, () => kuotaGambar.value.persen],
  ([elTeks, elGambar, persenTeks, persenGambar]) => {
    const { gsap } = useGSAP()
    const duration = reducedMotion.value === 'reduce' ? 0 : 0.9
    for (const [el, persen] of [[elTeks, persenTeks], [elGambar, persenGambar]] as const) {
      if (el) gsap.to(el, { scaleX: persen / 100, duration, ease: 'power3.out', overwrite: true })
    }
  },
  { flush: 'post' }
)

// Tujuh alat berbayar sesuai okf/alat-berbayar.md
const alatAi = [
  {
    slug: 'lkpd-bergambar',
    nama: 'Generator LKPD Bergambar',
    ringkasan: 'LKPD siap cetak A4/F4 dengan gambar garis hitam-putih dari CP, materi, dan TP.',
    ikon: 'i-lucide-file-image',
    siapPrototipe: true
  },
  {
    slug: 'bank-soal-ai',
    nama: 'Bank Soal, Kisi-Kisi & Kartu Soal',
    ringkasan: 'Naskah soal STS/SAS, kisi-kisi otomatis, kartu soal, rubrik uraian, dan paket A/B.',
    ikon: 'i-lucide-file-spreadsheet',
    siapPrototipe: false
  },
  {
    slug: 'soal-foto-buku',
    nama: 'LKPD & Soal dari Foto Buku',
    ringkasan: 'Foto halaman buku cetak untuk membuat latihan setara tanpa menyalin kata per kata.',
    ikon: 'i-lucide-camera',
    siapPrototipe: false
  },
  {
    slug: 'modul-ajar-ai',
    nama: 'Modul Ajar / RPP Berbantuan AI',
    ringkasan: 'Rencana pembelajaran (memahami, mengaplikasi, merefleksi) sesuai Standar Proses 2026.',
    ikon: 'i-lucide-book-open-check',
    siapPrototipe: false
  },
  {
    slug: 'bacaan-berjenjang',
    nama: 'Bacaan Berjenjang Bergambar',
    ringkasan: 'Cerita pendek bergambar sesuai tingkat membaca kelas 1 sampai 6 beserta soal pemahaman.',
    ikon: 'i-lucide-book-heart',
    siapPrototipe: false
  },
  {
    slug: 'numerasi-kontekstual',
    nama: 'Soal Numerasi Kontekstual',
    ringkasan: 'Stimulus cerita, tabel, atau gambar dengan hitungan yang diperiksa ulang oleh server.',
    ikon: 'i-lucide-calculator',
    siapPrototipe: false
  },
  {
    slug: 'flashcard-bergambar',
    nama: 'Flashcard & Kartu Kata Bergambar',
    ringkasan: 'Kartu kosakata bergambar seragam siap potong untuk bahasa Indonesia, Inggris, dan daerah.',
    ikon: 'i-lucide-layers',
    siapPrototipe: false
  }
]

// Riwayat generate terakhir yang tersimpan di perangkat ini (aturan AI-09)
const riwayatGenerate = ref([
  {
    id: 'gen-01',
    alat: 'Generator LKPD Bergambar',
    mapel: 'Matematika · Kelas 3 (Fase B)',
    materi: 'Pecahan sederhana (1/2, 1/3, 1/4)',
    waktu: '17 Okt 2026, 08.15',
    jenisKuota: '1 teks + 4 gambar',
    to: '/alat/lkpd-bergambar'
  },
  {
    id: 'gen-02',
    alat: 'Bank Soal, Kisi-Kisi & Kartu Soal',
    mapel: 'Bahasa Indonesia · Kelas 2 (Fase A)',
    materi: 'Membaca kalimat sederhana (20 soal PG)',
    waktu: '15 Okt 2026, 19.40',
    jenisKuota: '1 teks',
    to: '/alat/lkpd-bergambar'
  },
  {
    id: 'gen-03',
    alat: 'Modul Ajar / RPP Berbantuan AI',
    mapel: 'Matematika · Kelas 4 (Fase B)',
    materi: 'Keliling bangun datar (2 pertemuan)',
    waktu: '12 Okt 2026, 14.20',
    jenisKuota: '1 teks',
    to: '/alat/modul-ajar'
  }
])

// Riwayat pembayaran & bukti bayar (PRD A-06, B-07)
const riwayatBayar = [
  {
    id: 'INV-202610-0084',
    tanggal: '17 Oktober 2026',
    paket: 'Paket Berbayar (1 Bulan)',
    metode: 'QRIS',
    nominal: 'Rp39.000',
    status: 'Lunas'
  },
  {
    id: 'INV-202609-0041',
    tanggal: '17 September 2026',
    paket: 'Paket Berbayar (1 Bulan)',
    metode: 'BRI Virtual Account',
    nominal: 'Rp39.000',
    status: 'Lunas'
  }
]

const keluarSemuaOpen = ref(false)
const hapusAkunOpen = ref(false)

function unduhBuktiBayar(inv: (typeof riwayatBayar)[number]) {
  const isi = [
    'BUKTI PEMBAYARAN GURU KAMPUNG',
    '==============================',
    `Nomor Bukti : ${inv.id}`,
    `Tanggal     : ${inv.tanggal}`,
    `Nama Guru   : ${profil.value.nama}`,
    `Email       : ${profil.value.email}`,
    `Paket       : ${inv.paket}`,
    `Metode Bayar: ${inv.metode}`,
    `Total Bayar : ${inv.nominal}`,
    `Status      : ${inv.status}`,
    '',
    'Catatan: Server Guru Kampung hanya mencatat transaksi langganan dan tidak menyimpan data siswa.'
  ].join('\n')

  const url = URL.createObjectURL(new Blob([isi], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `bukti-bayar-${inv.id.toLowerCase()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  toast.add({ title: 'Bukti bayar diunduh', description: inv.id, color: 'success', icon: 'i-lucide-download' })
}

function keluarPerangkatIni() {
  toast.add({
    title: 'Simulasi keluar akun',
    description: 'Di produksi, sesi perangkat ini ditutup dan Anda kembali ke mode tamu.',
    color: 'neutral',
    icon: 'i-lucide-log-out'
  })
}

function konfirmasiKeluarSemua() {
  keluarSemuaOpen.value = false
  toast.add({
    title: 'Semua sesi perangkat ditutup',
    description: 'Seluruh sesi login di perangkat lain telah dicabut (PRD A-07).',
    color: 'success',
    icon: 'i-lucide-check'
  })
}

function konfirmasiHapusAkun() {
  hapusAkunOpen.value = false
  toast.add({
    title: 'Permintaan hapus akun dicatat',
    description: 'Akun dihapus dari server. Isian alat di perangkat ini tetap milik Anda (PRD A-08).',
    color: 'warning',
    icon: 'i-lucide-trash-2'
  })
}
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Dashboard Akun"
      description="Pantau paket langganan, sisa kuota AI bulanan, riwayat generate di perangkat ini, dan bukti pembayaran."
      badge="Akun & Kuota AI"
      icon="i-lucide-layout-dashboard"
      illustration="bintang"
    />

    <!-- Bar kendali pratinjau supaya pemilik bisa menguji 3 keadaan tampilan sesuai PRD -->
    <div class="panel-kertas flex flex-wrap items-center justify-between gap-3 p-4">
      <div class="flex items-center gap-2.5 text-sm">
        <span class="lencana-pensil inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs">
          <UIcon
            name="i-lucide-eye"
            class="size-3.5"
          />
          Pratinjau Tampilan
        </span>
        <span class="text-toned">
          Uji tampilan dashboard untuk berbagai status akun guru:
        </span>
      </div>
      <div
        role="group"
        aria-label="Pilih mode pratinjau status akun"
        class="flex flex-wrap gap-2"
      >
        <UButton
          size="xs"
          :color="modePratinjau === 'aktif' ? 'secondary' : 'neutral'"
          :variant="modePratinjau === 'aktif' ? 'solid' : 'outline'"
          :aria-pressed="modePratinjau === 'aktif'"
          class="stiker-tombol"
          @click="modePratinjau = 'aktif'"
        >
          Pelanggan Aktif
        </UButton>
        <UButton
          size="xs"
          :color="modePratinjau === 'hampir-habis' ? 'secondary' : 'neutral'"
          :variant="modePratinjau === 'hampir-habis' ? 'solid' : 'outline'"
          :aria-pressed="modePratinjau === 'hampir-habis'"
          class="stiker-tombol"
          @click="modePratinjau = 'hampir-habis'"
        >
          Hampir Habis (H-5)
        </UButton>
        <UButton
          size="xs"
          :color="modePratinjau === 'gratis' ? 'secondary' : 'neutral'"
          :variant="modePratinjau === 'gratis' ? 'solid' : 'outline'"
          :aria-pressed="modePratinjau === 'gratis'"
          class="stiker-tombol"
          @click="modePratinjau = 'gratis'"
        >
          Akun Gratis
        </UButton>
        <UButton
          to="/admin"
          size="xs"
          color="neutral"
          variant="outline"
          icon="i-lucide-shield-check"
          class="stiker-tombol bg-white dark:bg-slate-900"
        >
          Dashboard Admin
        </UButton>
      </div>
    </div>

    <!-- Pengingat masa aktif H-7 / H-1 sesuai PRD B-06 -->
    <UAlert
      v-if="modePratinjau === 'hampir-habis'"
      color="warning"
      variant="subtle"
      icon="i-lucide-clock-alert"
      title="Masa aktif paket berakhir dalam 5 hari"
      description="Perpanjang sebelum 22 Oktober 2026 supaya ketujuh alat AI tetap terbuka. Isi dan riwayat yang sudah ada di perangkat ini tidak akan hilang."
      :actions="[{ label: 'Perpanjang Paket', to: '/paket', color: 'primary', variant: 'solid' }]"
    />

    <UPageGrid>
      <!-- Satu-satunya kartu 2x2 di halaman ini (DESIGN.md): Paket & Sisa Kuota AI Bulanan (PRD A-06, AI-05) -->
      <div class="panel-kertas flex flex-col justify-between p-6 sm:col-span-6 sm:p-7 lg:col-span-7 lg:row-span-2">
        <div class="space-y-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="lencana-pensil rounded-full px-3 py-0.5 text-xs">
                  {{ paketTampil }}
                </span>
                <span
                  v-if="modePratinjau !== 'gratis'"
                  class="rounded-full border border-default px-2.5 py-0.5 text-xs font-semibold text-toned"
                >
                  Aktif {{ sisaHariTampil }} hari lagi
                </span>
              </div>
              <h2 class="font-display pt-1 text-2xl font-bold text-highlighted">
                Kuota AI Bulan Ini
              </h2>
              <p class="text-sm text-toned">
                {{ modePratinjau === 'gratis'
                  ? 'Jatah percobaan untuk akun gratis. Buka kuota penuh dengan paket berbayar.'
                  : `Berlaku sampai ${profil.berakhirPada}. Kuota hanya terpotong saat generate berhasil (AI-10).` }}
              </p>
            </div>

            <UButton
              to="/paket"
              color="primary"
              icon="i-lucide-sparkles"
              class="stiker-tombol"
            >
              {{ modePratinjau === 'gratis' ? 'Langganan Paket AI' : 'Perpanjang / Ubah Paket' }}
            </UButton>
          </div>

          <!-- Meter kuota teks dan gambar terpisah sesuai PRD 5 & AI-05 -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border-2 border-(--color-tinta) bg-yellow-50/70 p-4 dark:bg-slate-800/70">
              <div class="flex items-center justify-between gap-2">
                <span class="font-display text-sm font-bold text-highlighted">
                  Generate Teks & Soal
                </span>
                <UIcon
                  name="i-lucide-file-text"
                  class="size-5 text-primary"
                />
              </div>
              <p class="font-display mt-2 text-3xl font-extrabold text-highlighted">
                {{ kuotaTeks.sisa }}
                <span class="text-sm font-normal text-muted">tersisa dari {{ kuotaTeks.maks }}</span>
              </p>
              <div
                class="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-(--color-tinta) bg-white dark:bg-slate-900"
                role="progressbar"
                :aria-valuenow="kuotaTeks.terpakai"
                :aria-valuemin="0"
                :aria-valuemax="kuotaTeks.maks"
                aria-label="Pemakaian kuota teks AI"
              >
                <div
                  ref="barTeks"
                  class="h-full w-full origin-left bg-(--color-pensil)"
                  style="transform: scaleX(0)"
                />
              </div>
              <p class="mt-2 text-xs text-muted">
                Terpakai {{ kuotaTeks.terpakai }} generate untuk soal, kisi-kisi, bacaan, atau modul ajar.
              </p>
            </div>

            <div class="rounded-2xl border-2 border-(--color-tinta) bg-sky-50/70 p-4 dark:bg-slate-800/70">
              <div class="flex items-center justify-between gap-2">
                <span class="font-display text-sm font-bold text-highlighted">
                  Generate Gambar LKPD
                </span>
                <UIcon
                  name="i-lucide-image"
                  class="size-5 text-primary"
                />
              </div>
              <p class="font-display mt-2 text-3xl font-extrabold text-highlighted">
                {{ kuotaGambar.sisa }}
                <span class="text-sm font-normal text-muted">tersisa dari {{ kuotaGambar.maks }}</span>
              </p>
              <div
                class="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-(--color-tinta) bg-white dark:bg-slate-900"
                role="progressbar"
                :aria-valuenow="kuotaGambar.terpakai"
                :aria-valuemin="0"
                :aria-valuemax="kuotaGambar.maks"
                aria-label="Pemakaian kuota gambar AI"
              >
                <div
                  ref="barGambar"
                  class="h-full w-full origin-left bg-(--color-pensil)"
                  style="transform: scaleX(0)"
                />
              </div>
              <p class="mt-2 text-xs text-muted">
                Terpakai {{ kuotaGambar.terpakai }} ilustrasi garis hitam-putih untuk LKPD dan flashcard.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4 text-xs text-muted">
          <span class="inline-flex items-center gap-1.5">
            <UIcon
              name="i-lucide-shield-check"
              class="size-4 text-primary"
            />
            Tidak ada data siswa yang dikirim ke AI (aturan AI-02).
          </span>
          <ULink
            to="/alat/lkpd-bergambar"
            class="font-semibold text-primary underline"
          >
            Buka Generator LKPD Bergambar
          </ULink>
        </div>
      </div>

      <!-- Profil akun dan cara masuk yang terhubung (PRD A-04, A-06) -->
      <div class="panel-kertas space-y-4 p-6 sm:col-span-6 lg:col-span-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-lg font-bold text-highlighted">
              Profil Akun Guru
            </h2>
            <p class="text-xs text-muted">
              Satu email menyatukan semua cara masuk (PRD A-04).
            </p>
          </div>
          <span class="lencana-pensil inline-flex size-10 items-center justify-center rounded-2xl">
            GK
          </span>
        </div>

        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-xs font-medium text-muted">
              Nama
            </dt>
            <dd class="font-semibold text-highlighted">
              {{ profil.nama }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-muted">
              Email akun
            </dt>
            <dd class="font-semibold text-highlighted">
              {{ profil.email }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-muted">
              Cara masuk yang terhubung
            </dt>
            <dd class="mt-1 flex flex-wrap gap-1.5">
              <span
                v-for="m in profil.metodeMasuk"
                :key="m"
                class="inline-flex items-center gap-1 rounded-full border-2 border-(--color-tinta) bg-white px-2.5 py-0.5 text-xs font-semibold text-highlighted dark:bg-slate-800"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-3.5 text-primary"
                />
                {{ m }}
              </span>
            </dd>
          </div>
        </dl>

        <div class="flex flex-wrap gap-2 pt-2">
          <UButton
            to="/pengaturan"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-school"
            class="stiker-tombol"
          >
            Profil Sekolah (Perangkat)
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-log-out"
            class="stiker-tombol"
            @click="keluarPerangkatIni"
          >
            Keluar
          </UButton>
        </div>
      </div>

      <!-- Ringkasan penyimpanan perangkat (PRD 3 & 8: Privasi) -->
      <div class="panel-kertas space-y-3 p-6 sm:col-span-6 lg:col-span-5">
        <h2 class="font-display text-lg font-bold text-highlighted">
          Data Tetap di Perangkat
        </h2>
        <p class="text-sm text-toned">
          Server Guru Kampung hanya menyimpan akun, status langganan, dan jumlah pemakaian kuota AI. Daftar nama siswa, nilai, serta hasil generate disimpan di peramban perangkat ini saja.
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <UButton
            to="/alat"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-layout-grid"
            class="stiker-tombol"
          >
            Semua Alat Gratis
          </UButton>
          <UButton
            to="/masuk"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-key-round"
            class="stiker-tombol"
          >
            Halaman Masuk
          </UButton>
        </div>
      </div>
    </UPageGrid>

    <!-- Daftar 7 Alat AI Berbayar (okf/alat-berbayar.md) -->
    <section
      aria-labelledby="judul-alat-ai"
      class="space-y-4"
    >
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="judul-alat-ai"
            class="font-display text-2xl font-bold text-highlighted"
          >
            Tujuh Alat AI Berbayar
          </h2>
          <p class="text-sm text-toned">
            Semua generator wajib berdasar pada pilihan kelas, mata pelajaran, elemen CP, materi, dan TP dari referensi kurikulum.
          </p>
        </div>
        <UButton
          to="/paket"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-credit-card"
          class="stiker-tombol bg-white dark:bg-slate-900"
        >
          Lihat rincian paket
        </UButton>
      </div>

      <UPageGrid>
        <div
          v-for="alat in alatAi"
          :key="alat.slug"
          class="panel-kertas flex flex-col justify-between p-5 sm:col-span-3 lg:col-span-4"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="lencana-pensil inline-flex size-10 items-center justify-center rounded-2xl">
                <UIcon
                  :name="alat.ikon"
                  class="size-5"
                />
              </span>
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="modePratinjau === 'gratis'
                  ? 'border border-default bg-slate-100 text-toned dark:bg-slate-800'
                  : 'lencana-pensil'"
              >
                <UIcon
                  :name="modePratinjau === 'gratis' ? 'i-lucide-lock' : 'i-lucide-lock-open'"
                  class="size-3"
                />
                {{ modePratinjau === 'gratis' ? 'Terkunci' : 'Terbuka' }}
              </span>
            </div>

            <h3 class="font-display text-lg font-bold text-highlighted">
              {{ alat.nama }}
            </h3>
            <p class="text-sm text-toned">
              {{ alat.ringkasan }}
            </p>
          </div>

          <div class="mt-4 pt-2">
            <UButton
              v-if="alat.siapPrototipe"
              :to="`/alat/${alat.slug}`"
              color="primary"
              size="sm"
              icon="i-lucide-arrow-right"
              class="stiker-tombol"
            >
              Buka Prototipe Alat
            </UButton>
            <UButton
              v-else
              to="/paket"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-sparkles"
              class="stiker-tombol"
            >
              Lihat spesifikasi di Paket
            </UButton>
          </div>
        </div>
      </UPageGrid>
    </section>

    <!-- Riwayat Generate Terakhir di Perangkat Ini (AI-09) & Riwayat Pembayaran (A-06, B-07) -->
    <div class="grid gap-6 lg:grid-cols-12">
      <section
        aria-labelledby="judul-riwayat-ai"
        class="panel-kertas space-y-4 p-6 lg:col-span-6"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2
              id="judul-riwayat-ai"
              class="font-display text-xl font-bold text-highlighted"
            >
              Riwayat Generate di Perangkat Ini
            </h2>
            <p class="text-xs text-muted">
              Disimpan lokal di peramban (aturan AI-09), tidak disimpan di server.
            </p>
          </div>
        </div>

        <ul class="divide-y divide-default">
          <li
            v-for="item in riwayatGenerate"
            :key="item.id"
            class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="space-y-1">
              <p class="font-display text-sm font-bold text-highlighted">
                {{ item.alat }}
              </p>
              <p class="text-xs font-medium text-toned">
                {{ item.mapel }} · {{ item.materi }}
              </p>
              <p class="text-xs text-muted">
                {{ item.waktu }} · Pemakaian: {{ item.jenisKuota }}
              </p>
            </div>
            <UButton
              :to="item.to"
              color="neutral"
              variant="outline"
              size="xs"
              class="stiker-tombol shrink-0"
            >
              Buka
            </UButton>
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="judul-riwayat-bayar"
        class="panel-kertas space-y-4 p-6 lg:col-span-6"
      >
        <div>
          <h2
            id="judul-riwayat-bayar"
            class="font-display text-xl font-bold text-highlighted"
          >
            Riwayat Pembayaran & Bukti Bayar
          </h2>
          <p class="text-xs text-muted">
            Bukti bayar resmi dapat diunduh kapan saja untuk keperluan administrasi (PRD B-07).
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b-2 border-(--color-tinta) text-xs text-muted">
                <th class="pb-2 font-semibold">
                  Tanggal & Nomor
                </th>
                <th class="pb-2 font-semibold">
                  Paket & Metode
                </th>
                <th class="pb-2 font-semibold">
                  Jumlah
                </th>
                <th class="pb-2 text-right font-semibold">
                  Bukti
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="inv in riwayatBayar"
                :key="inv.id"
              >
                <td class="py-3 pr-2">
                  <div class="font-semibold text-highlighted">
                    {{ inv.tanggal }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ inv.id }}
                  </div>
                </td>
                <td class="py-3 pr-2">
                  <div class="text-highlighted">
                    {{ inv.paket }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ inv.metode }}
                  </div>
                </td>
                <td class="py-3 pr-2 font-semibold text-highlighted">
                  {{ inv.nominal }}
                </td>
                <td class="py-3 text-right">
                  <UButton
                    color="neutral"
                    variant="outline"
                    size="xs"
                    icon="i-lucide-download"
                    class="stiker-tombol"
                    @click="unduhBuktiBayar(inv)"
                  >
                    Unduh
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Keamanan Sesi & Hapus Akun (PRD A-07, A-08) -->
    <section
      aria-labelledby="judul-keamanan-akun"
      class="panel-kertas p-6"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <h2
            id="judul-keamanan-akun"
            class="font-display text-lg font-bold text-highlighted"
          >
            Keamanan Sesi & Penghapusan Akun
          </h2>
          <p class="text-sm text-muted">
            Pernah masuk di komputer sekolah atau perangkat bersama? Anda bisa mencabut semua sesi sekaligus atau menghapus akun.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-monitor-x"
            class="stiker-tombol"
            @click="keluarSemuaOpen = true"
          >
            Keluar dari semua perangkat
          </UButton>
          <UButton
            color="error"
            variant="outline"
            icon="i-lucide-user-x"
            class="stiker-tombol"
            @click="hapusAkunOpen = true"
          >
            Hapus akun
          </UButton>
        </div>
      </div>
    </section>

    <UModal
      v-model:open="keluarSemuaOpen"
      title="Keluar dari semua perangkat?"
      description="Semua sesi login aktif di laptop sekolah, ponsel, maupun komputer lain akan langsung dihentikan (PRD A-07)."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="keluarSemuaOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-log-out"
            @click="konfirmasiKeluarSemua"
          >
            Ya, cabut semua sesi
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="hapusAkunOpen"
      title="Hapus akun Guru Kampung?"
      description="Profil akun dan cara masuk Anda akan dihapus dari server. Catatan transaksi pembayaran tetap disimpan sebatas kewajiban perpajakan sesuai kebijakan privasi (PRD A-08). Isian alat di perangkat ini tidak ikut terhapus."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="hapusAkunOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            @click="konfirmasiHapusAkun"
          >
            Hapus akun saya
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
