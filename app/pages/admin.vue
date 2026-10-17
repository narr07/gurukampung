<script setup lang="ts">
import { CATEGORIES, TOOLS, type ToolTier } from '~/tools/catalog'

useSeoMeta({
  title: 'Dashboard Admin Pemilik',
  description: 'Pengelolaan pengguna, langganan, perpanjangan manual, pemakaian API Gemini, dan status alat Guru Kampung.'
})

const toast = useToast()

interface PenggunaAdmin {
  id: string
  nama: string
  email: string
  metode: string
  statusPaket: 'Aktif' | 'Gratis' | 'Kedaluwarsa'
  berakhirPada: string
  kuotaTeks: string
  kuotaGambar: string
}

const daftarPengguna = useLocalStorage<PenggunaAdmin[]>('gurukampung:pratinjau:admin-pengguna', [
  {
    id: 'usr-01',
    nama: 'Siti Aminah, S.Pd.',
    email: 'siti.aminah42@guru.sd.belajar.id',
    metode: 'Google (belajar.id)',
    statusPaket: 'Aktif',
    berakhirPada: '2026-11-17',
    kuotaTeks: '14 / 60',
    kuotaGambar: '6 / 25'
  },
  {
    id: 'usr-02',
    nama: 'Budi Santoso, S.Pd.SD.',
    email: 'budi.santoso88@guru.sd.belajar.id',
    metode: 'Google (belajar.id)',
    statusPaket: 'Aktif',
    berakhirPada: '2027-10-10',
    kuotaTeks: '29 / 60',
    kuotaGambar: '12 / 25'
  },
  {
    id: 'usr-03',
    nama: 'Rina Marlina',
    email: 'rinamarlina.sdn2@gmail.com',
    metode: 'Tautan Email',
    statusPaket: 'Gratis',
    berakhirPada: '-',
    kuotaTeks: '2 / 3',
    kuotaGambar: '0 / 1'
  },
  {
    id: 'usr-04',
    nama: 'Hendra Wijaya, S.Pd.',
    email: 'hendra.wijaya@guru.sd.belajar.id',
    metode: 'Email & Sandi',
    statusPaket: 'Kedaluwarsa',
    berakhirPada: '2026-10-05',
    kuotaTeks: '48 / 60',
    kuotaGambar: '19 / 25'
  }
], { initOnMounted: true })

const cariPengguna = ref('')
const filterStatus = ref<'semua' | 'Aktif' | 'Gratis' | 'Kedaluwarsa'>('semua')

const penggunaTersaring = computed(() => {
  const q = cariPengguna.value.trim().toLowerCase()
  return daftarPengguna.value.filter((u) => {
    if (filterStatus.value !== 'semua' && u.statusPaket !== filterStatus.value) return false
    if (!q) return true
    return u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })
})

// Ringkasan angka bulanan (PRD M-04 & AI-11)
const ringkasan = computed(() => {
  const aktif = daftarPengguna.value.filter(u => u.statusPaket === 'Aktif').length
  return {
    pendaftarBaru: 48,
    pelangganAktif: aktif + 16,
    pendapatanBulanIni: 'Rp702.000',
    generateTeksBulanIni: 312,
    generateGambarBulanIni: 94,
    biayaApiGemini: 'Rp64.800'
  }
})

// Modal Beri / Perpanjang Langganan Manual (PRD M-02)
const manualOpen = ref(false)
const formManual = reactive({
  email: '',
  nama: '',
  durasiHari: 30,
  alasan: 'Uji coba guru SD'
})

function bukaPerpanjangManual(u?: PenggunaAdmin) {
  formManual.email = u?.email ?? ''
  formManual.nama = u?.nama ?? ''
  formManual.durasiHari = 30
  formManual.alasan = u ? 'Perpanjangan manual / transfer langsung' : 'Uji coba guru SD'
  manualOpen.value = true
}

function simpanPerpanjangManual() {
  const email = formManual.email.trim()
  if (!email) return

  const target = new Date()
  target.setDate(target.getDate() + Number(formManual.durasiHari || 30))
  const tgl = target.toISOString().slice(0, 10)

  const existing = daftarPengguna.value.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    existing.statusPaket = 'Aktif'
    existing.berakhirPada = tgl
  } else {
    daftarPengguna.value.unshift({
      id: `usr-${Date.now().toString(36)}`,
      nama: formManual.nama.trim() || email.split('@')[0] || 'Guru Baru',
      email,
      metode: 'Manual Admin',
      statusPaket: 'Aktif',
      berakhirPada: tgl,
      kuotaTeks: '0 / 60',
      kuotaGambar: '0 / 25'
    })
  }

  manualOpen.value = false
  toast.add({
    title: 'Langganan manual diaktifkan',
    description: `${email} aktif sampai ${tgl} (${formManual.alasan}).`,
    color: 'success',
    icon: 'i-lucide-check'
  })
}

// Pengaturan status alat gratis / berbayar (PRD M-03)
const overrideTier = useLocalStorage<Record<string, ToolTier>>('gurukampung:pratinjau:admin-tier-alat', {}, { initOnMounted: true })

function tierAlat(slug: string, bawaan?: ToolTier): ToolTier {
  return overrideTier.value[slug] ?? bawaan ?? 'gratis'
}

function toggleTierAlat(slug: string, bawaan?: ToolTier) {
  const sekarang = tierAlat(slug, bawaan)
  const baru: ToolTier = sekarang === 'berbayar' ? 'gratis' : 'berbayar'
  overrideTier.value = { ...overrideTier.value, [slug]: baru }
  toast.add({
    title: 'Status alat diperbarui',
    description: `${slug} diatur menjadi ${baru.toUpperCase()} (simulasi PRD M-03).`,
    color: 'neutral',
    icon: 'i-lucide-sliders-horizontal'
  })
}

const namaKategori = (id: string) => CATEGORIES.find(c => c.id === id)?.name ?? id

// Riwayat pembayaran masuk dari webhook payment gateway (PRD M-01, B-04)
const riwayatWebhook = [
  {
    id: 'PG-20261017-019',
    waktu: '17 Okt 2026, 07.52',
    email: 'siti.aminah42@guru.sd.belajar.id',
    metode: 'QRIS',
    nominal: 'Rp39.000',
    webhook: 'Terverifikasi (HMAC-SHA256)'
  },
  {
    id: 'PG-20261015-018',
    waktu: '15 Okt 2026, 16.10',
    email: 'budi.santoso88@guru.sd.belajar.id',
    metode: 'BRI Virtual Account',
    nominal: 'Rp349.000',
    webhook: 'Terverifikasi (HMAC-SHA256)'
  },
  {
    id: 'PG-20261012-017',
    waktu: '12 Okt 2026, 11.05',
    email: 'dewi.kartika@guru.sd.belajar.id',
    metode: 'GoPay / E-Wallet',
    nominal: 'Rp39.000',
    webhook: 'Terverifikasi (HMAC-SHA256)'
  }
]
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Dashboard Admin Pemilik"
      description="Pantau pendaftar, pelanggan aktif, biaya API Gemini per bulan, perpanjangan manual, dan pengaturan status alat."
      badge="Khusus Pemilik (PRD 7.4)"
      icon="i-lucide-shield-check"
      illustration="penggaris"
    />

    <!-- Keterangan prototipe dan tautan cepat ke halaman SaaS lainnya -->
    <div class="panel-kertas flex flex-wrap items-center justify-between gap-3 p-4">
      <div class="flex items-center gap-2 text-sm">
        <span class="lencana-pensil rounded-full px-3 py-0.5 text-xs">
          Mode Pratinjau Admin
        </span>
        <span class="text-toned">
          Database D1 dan Better Auth belum disambungkan. Perubahan disimpan di peramban untuk uji tampilan.
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          to="/dashboard"
          size="xs"
          color="neutral"
          variant="outline"
          icon="i-lucide-layout-dashboard"
          class="stiker-tombol bg-white dark:bg-slate-900"
        >
          Dashboard Guru
        </UButton>
        <UButton
          to="/paket"
          size="xs"
          color="neutral"
          variant="outline"
          icon="i-lucide-credit-card"
          class="stiker-tombol bg-white dark:bg-slate-900"
        >
          Halaman Paket
        </UButton>
        <UButton
          to="/masuk"
          size="xs"
          color="neutral"
          variant="outline"
          icon="i-lucide-log-in"
          class="stiker-tombol bg-white dark:bg-slate-900"
        >
          Halaman Masuk
        </UButton>
      </div>
    </div>

    <!-- Ringkasan Angka Bulanan (PRD M-04 & AI-11) -->
    <UPageGrid>
      <!-- Satu-satunya kartu 2x2 di halaman ini (DESIGN.md): Ringkasan Pendapatan & Biaya API Gemini -->
      <div class="panel-kertas flex flex-col justify-between p-6 sm:col-span-6 sm:p-7 lg:col-span-6 lg:row-span-2">
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-2">
            <span class="lencana-pensil rounded-full px-3 py-0.5 text-xs">
              Oktober 2026 (PRD M-04 & AI-11)
            </span>
            <UIcon
              name="i-lucide-trending-up"
              class="size-6 text-primary"
            />
          </div>
          <h2 class="font-display text-2xl font-bold text-highlighted">
            Pendapatan & Biaya API Gemini
          </h2>
          <p class="text-sm text-toned">
            Biaya API per generate dicatat tanpa menyimpan isi masukan guru (aturan AI-11), supaya harga paket dan kuota bulanan selalu terukur dari data nyata.
          </p>

          <div class="grid gap-4 pt-2 sm:grid-cols-2">
            <div class="rounded-2xl border-2 border-(--color-tinta) bg-yellow-50/70 p-4 dark:bg-slate-800/70">
              <p class="text-xs font-semibold text-muted">
                Pendapatan Kotor Bulan Ini
              </p>
              <p class="font-display mt-1 text-3xl font-extrabold text-highlighted">
                {{ ringkasan.pendapatanBulanIni }}
              </p>
              <p class="mt-1 text-xs text-toned">
                Dari {{ ringkasan.pelangganAktif }} pelanggan aktif
              </p>
            </div>

            <div class="rounded-2xl border-2 border-(--color-tinta) bg-sky-50/70 p-4 dark:bg-slate-800/70">
              <p class="text-xs font-semibold text-muted">
                Biaya API Gemini Bulan Ini
              </p>
              <p class="font-display mt-1 text-3xl font-extrabold text-highlighted">
                {{ ringkasan.biayaApiGemini }}
              </p>
              <p class="mt-1 text-xs text-toned">
                {{ ringkasan.generateTeksBulanIni }} teks · {{ ringkasan.generateGambarBulanIni }} gambar
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4 text-xs text-muted">
          <span>Tabel database D1: users, sessions, subscriptions, payments, ai_usage (ADR 002).</span>
          <span class="font-semibold text-highlighted">0 byte data siswa di server</span>
        </div>
      </div>

      <div class="panel-kertas space-y-2 p-6 sm:col-span-3 lg:col-span-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted">Pendaftar Baru (30 Hari)</span>
          <UIcon
            name="i-lucide-user-plus"
            class="size-5 text-primary"
          />
        </div>
        <p class="font-display text-4xl font-extrabold text-highlighted">
          {{ ringkasan.pendaftarBaru }}
        </p>
        <p class="text-xs text-toned">
          Mayoritas masuk dengan akun Google belajar.id (PRD A-01).
        </p>
      </div>

      <div class="panel-kertas space-y-2 p-6 sm:col-span-3 lg:col-span-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted">Pelanggan Aktif</span>
          <UIcon
            name="i-lucide-award"
            class="size-5 text-primary"
          />
        </div>
        <p class="font-display text-4xl font-extrabold text-highlighted">
          {{ ringkasan.pelangganAktif }}
        </p>
        <p class="text-xs text-toned">
          Membuka akses ke 7 alat generator AI berdasar kurikulum.
        </p>
      </div>

      <!-- Tombol cepat Beri / Perpanjang Langganan Manual (PRD M-02) -->
      <div class="panel-kertas flex flex-col justify-between gap-4 p-6 sm:col-span-6 lg:col-span-6">
        <div class="space-y-1">
          <h3 class="font-display text-lg font-bold text-highlighted">
            Pemberian & Perpanjangan Manual (PRD M-02)
          </h3>
          <p class="text-sm text-toned">
            Berikan masa aktif secara langsung untuk guru penguji coba atau pembayaran transfer di luar payment gateway.
          </p>
        </div>
        <div>
          <UButton
            color="primary"
            icon="i-lucide-calendar-plus"
            class="stiker-tombol"
            @click="bukaPerpanjangManual()"
          >
            Beri / Perpanjang Langganan Manual
          </UButton>
        </div>
      </div>
    </UPageGrid>

    <!-- Daftar Pengguna & Status Langganan (PRD M-01 & M-02) -->
    <section
      aria-labelledby="judul-daftar-pengguna"
      class="panel-kertas space-y-5 p-6"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2
            id="judul-daftar-pengguna"
            class="font-display text-xl font-bold text-highlighted"
          >
            Daftar Pengguna & Langganan (PRD M-01)
          </h2>
          <p class="text-xs text-muted">
            Hanya menyimpan nama, email, cara masuk, status paket, dan jumlah pemakaian kuota AI.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Saring status pengguna"
            class="flex flex-wrap gap-1.5"
          >
            <UButton
              v-for="st in (['semua', 'Aktif', 'Gratis', 'Kedaluwarsa'] as const)"
              :key="st"
              size="xs"
              :color="filterStatus === st ? 'secondary' : 'neutral'"
              :variant="filterStatus === st ? 'solid' : 'outline'"
              :aria-pressed="filterStatus === st"
              class="stiker-tombol"
              @click="filterStatus = st"
            >
              {{ st === 'semua' ? 'Semua' : st }}
            </UButton>
          </div>

          <UInput
            v-model="cariPengguna"
            icon="i-lucide-search"
            placeholder="Cari nama atau email guru..."
            aria-label="Cari pengguna"
            size="sm"
            class="w-full sm:w-64"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b-2 border-(--color-tinta) text-xs text-muted">
              <th class="pb-2.5 font-semibold">
                Guru & Email
              </th>
              <th class="pb-2.5 font-semibold">
                Cara Masuk
              </th>
              <th class="pb-2.5 font-semibold">
                Status Paket
              </th>
              <th class="pb-2.5 font-semibold">
                Berakhir
              </th>
              <th class="pb-2.5 font-semibold">
                Kuota AI (Teks / Gambar)
              </th>
              <th class="pb-2.5 text-right font-semibold">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="u in penggunaTersaring"
              :key="u.id"
            >
              <td class="py-3 pr-3">
                <div class="font-semibold text-highlighted">
                  {{ u.nama }}
                </div>
                <div class="text-xs text-muted">
                  {{ u.email }}
                </div>
              </td>
              <td class="py-3 pr-3 text-xs text-toned">
                {{ u.metode }}
              </td>
              <td class="py-3 pr-3">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="u.statusPaket === 'Aktif'
                    ? 'lencana-pensil'
                    : u.statusPaket === 'Kedaluwarsa'
                      ? 'border border-red-700 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'border border-default bg-slate-100 text-toned dark:bg-slate-800'"
                >
                  {{ u.statusPaket }}
                </span>
              </td>
              <td class="py-3 pr-3 text-xs font-medium text-toned">
                {{ u.berakhirPada }}
              </td>
              <td class="py-3 pr-3 text-xs text-toned">
                Teks {{ u.kuotaTeks }} · Gambar {{ u.kuotaGambar }}
              </td>
              <td class="py-3 text-right">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-calendar-plus"
                  class="stiker-tombol"
                  @click="bukaPerpanjangManual(u)"
                >
                  Perpanjang
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Pengaturan Status Alat (PRD M-03) & Log Pembayaran Webhook (PRD M-01, B-04) -->
    <div class="grid gap-6 lg:grid-cols-12">
      <section
        aria-labelledby="judul-status-alat"
        class="panel-kertas space-y-4 p-6 lg:col-span-7"
      >
        <div>
          <h2
            id="judul-status-alat"
            class="font-display text-xl font-bold text-highlighted"
          >
            Pengaturan Status Alat: Gratis / Berbayar (PRD M-03)
          </h2>
          <p class="text-xs text-muted">
            Ubah status alat di katalog. Alat berbayar menampilkan lencana gembok dan memeriksa langganan di server (PRD B-02, B-05).
          </p>
        </div>

        <div class="max-h-96 overflow-y-auto pr-1">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b-2 border-(--color-tinta) text-xs text-muted">
                <th class="pb-2 font-semibold">
                  Nama Alat
                </th>
                <th class="pb-2 font-semibold">
                  Kategori
                </th>
                <th class="pb-2 text-right font-semibold">
                  Paket Saat Ini
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="t in TOOLS"
                :key="t.slug"
              >
                <td class="py-2.5 pr-2">
                  <div class="font-semibold text-highlighted">
                    {{ t.name }}
                  </div>
                  <div class="text-xs text-muted">
                    /alat/{{ t.slug }}
                  </div>
                </td>
                <td class="py-2.5 pr-2 text-xs text-toned">
                  {{ namaKategori(t.category) }}
                </td>
                <td class="py-2.5 text-right">
                  <button
                    type="button"
                    class="stiker-tombol inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
                    :aria-pressed="tierAlat(t.slug, t.tier) === 'berbayar'"
                    :class="tierAlat(t.slug, t.tier) === 'berbayar'
                      ? 'bg-(--color-pensil) text-slate-900'
                      : 'bg-white text-highlighted dark:bg-slate-900'"
                    @click="toggleTierAlat(t.slug, t.tier)"
                  >
                    <UIcon
                      :name="tierAlat(t.slug, t.tier) === 'berbayar' ? 'i-lucide-lock' : 'i-lucide-lock-open'"
                      class="size-3.5"
                    />
                    {{ tierAlat(t.slug, t.tier) === 'berbayar' ? 'Berbayar (AI)' : 'Gratis' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="judul-riwayat-webhook"
        class="panel-kertas space-y-4 p-6 lg:col-span-5"
      >
        <div>
          <h2
            id="judul-riwayat-webhook"
            class="font-display text-xl font-bold text-highlighted"
          >
            Riwayat Pembayaran & Webhook (PRD B-04)
          </h2>
          <p class="text-xs text-muted">
            Status langganan hanya berubah dari webhook payment gateway yang tanda tangannya terverifikasi.
          </p>
        </div>

        <ul class="divide-y divide-default">
          <li
            v-for="w in riwayatWebhook"
            :key="w.id"
            class="space-y-1 py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-display text-sm font-bold text-highlighted">
                {{ w.nominal }} · {{ w.metode }}
              </span>
              <span class="lencana-pensil rounded-full px-2 py-0.5 text-[0.7rem]">
                Lunas
              </span>
            </div>
            <p class="text-xs font-medium text-toned">
              {{ w.email }}
            </p>
            <p class="text-xs text-muted">
              {{ w.waktu }} · {{ w.id }} · {{ w.webhook }}
            </p>
          </li>
        </ul>
      </section>
    </div>

    <!-- Modal Pemberian / Perpanjangan Manual (PRD M-02) -->
    <UModal
      v-model:open="manualOpen"
      title="Beri atau Perpanjang Langganan Manual (PRD M-02)"
      description="Digunakan untuk guru peserta uji coba atau perpanjangan masa aktif di luar payment gateway."
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="simpanPerpanjangManual"
        >
          <UFormField
            label="Email guru"
            required
          >
            <UInput
              v-model="formManual.email"
              type="email"
              placeholder="nama@guru.sd.belajar.id"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Nama guru">
            <UInput
              v-model="formManual.nama"
              placeholder="Nama lengkap dengan gelar"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Tambah masa aktif (hari)">
              <UInputNumber
                v-model="formManual.durasiHari"
                :min="7"
                :max="365"
              />
            </UFormField>

            <UFormField label="Catatan / alasan">
              <UInput
                v-model="formManual.alasan"
                placeholder="Uji coba guru SD"
                class="w-full"
              />
            </UFormField>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="manualOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-check"
            @click="simpanPerpanjangManual"
          >
            Aktifkan Langganan
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
