<script setup lang="ts">
useSeoMeta({
  title: 'Paket & Harga',
  description: 'Alat kelas harian gratis tanpa daftar. Paket berbayar membuka 7 generator AI berbasis kurikulum SD dengan kuota bulanan.'
})

const toast = useToast()

type PeriodePaket = 'bulanan' | 'tahunan'
const periode = ref<PeriodePaket>('bulanan')

const metodeBayar = ref<'qris' | 'va' | 'ewallet'>('qris')
const checkoutOpen = ref(false)

const daftarMetode = [
  { value: 'qris', label: 'QRIS (Semua Bank & Dompet Digital)', description: 'Pindai kode QR dari aplikasi mobile banking, GoPay, OVO, DANA, atau ShopeePay.' },
  { value: 'va', label: 'Virtual Account (BRI, Mandiri, BNI, BCA, BSI)', description: 'Nomor rekening virtual otomatis terverifikasi lewat webhook.' },
  { value: 'ewallet', label: 'E-Wallet Langsung', description: 'Konfirmasi instan lewat aplikasi dompet digital di ponsel.' }
]

const rincianAlatAi = [
  {
    no: '01',
    slug: 'lkpd-bergambar',
    nama: 'Generator LKPD Bergambar',
    masukan: 'Kelas, mapel, elemen CP, materi, TP, jenis kegiatan (isian, menjodohkan, menghitung gambar), jumlah soal.',
    keluaran: 'LKPD siap cetak A4/F4 dengan kop sekolah, gambar garis hitam-putih, versi A/B, dan kunci jawaban terpisah.',
    siapPrototipe: true
  },
  {
    no: '02',
    slug: 'bank-soal-ai',
    nama: 'Bank Soal, Kisi-Kisi & Kartu Soal',
    masukan: 'Kelas, mapel, elemen CP, daftar TP, jenis asesmen (Sumatif, STS, SAS), bentuk soal (PG, isian, uraian), level kognitif.',
    keluaran: 'Naskah soal, kunci jawaban, tabel kisi-kisi (TP, indikator, level, nomor soal), kartu soal, rubrik uraian, ekspor Word.',
    siapPrototipe: false
  },
  {
    no: '03',
    slug: 'soal-foto-buku',
    nama: 'LKPD & Soal dari Foto Buku',
    masukan: 'Pilihan kurikulum (kelas s.d. TP), foto halaman buku cetak, dan pilihan latihan serupa / lebih mudah / soal cerita.',
    keluaran: 'Soal atau LKPD baru yang setara dengan materi di foto (bukan salinan kata per kata). Foto tidak disimpan di server.',
    siapPrototipe: false
  },
  {
    no: '04',
    slug: 'modul-ajar-ai',
    nama: 'Modul Ajar / RPP Berbantuan AI',
    masukan: 'Kelas, mapel, elemen CP, materi, TP, alokasi waktu, dan kondisi kelas (opsional).',
    keluaran: 'Rencana pertemuan (memahami, mengaplikasi, merefleksi), asesmen, dan profil lulusan (Permendikdasmen 1/2026 & 13/2025).',
    siapPrototipe: false
  },
  {
    no: '05',
    slug: 'bacaan-berjenjang',
    nama: 'Bacaan Berjenjang Bergambar',
    masukan: 'Kelas 1 sampai 6, mapel, elemen CP, materi, TP, tema cerita, dan bahasa (Indonesia, Inggris, atau daerah).',
    keluaran: 'Cerita pendek dengan ilustrasi, daftar kosakata sulit, dan pertanyaan pemahaman (tersurat, tersirat, pendapat).',
    siapPrototipe: false
  },
  {
    no: '06',
    slug: 'numerasi-kontekstual',
    nama: 'Soal Numerasi Kontekstual',
    masukan: 'Kelas (terutama 4 sampai 6), elemen CP & materi Matematika, TP, konteks dekat murid (pasar, kebun, olahraga).',
    keluaran: 'Stimulus cerita/tabel/grafik beserta soal, kunci, dan pembahasan yang hitungannya diperiksa ulang oleh server.',
    siapPrototipe: false
  },
  {
    no: '07',
    slug: 'flashcard-bergambar',
    nama: 'Flashcard & Kartu Kata Bergambar',
    masukan: 'Kelas, mapel, materi, TP, daftar kata atau tema, bahasa, dan ukuran kartu.',
    keluaran: 'Kartu bergambar gaya seragam siap potong di kertas A4/F4. Alat Kartu Flashcard manual tetap gratis.',
    siapPrototipe: false
  }
]

function mulaiLangganan() {
  checkoutOpen.value = true
}

function konfirmasiSimulasiBayar() {
  checkoutOpen.value = false
  toast.add({
    title: 'Simulasi alur pembayaran berhasil',
    description: 'Di produksi, akses terbuka otomatis saat webhook payment gateway terverifikasi (PRD B-03 & B-04).',
    color: 'success',
    icon: 'i-lucide-check'
  })
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="space-y-10">
    <PageTitle
      title="Paket & Harga"
      description="Alat kelas harian gratis selamanya tanpa daftar. Paket berbayar membuka tujuh generator AI berbasis referensi kurikulum SD."
      badge="Jelas & Tanpa Biaya Tersembunyi (PRD B-01)"
      icon="i-lucide-sparkles"
      illustration="bintang"
    />

    <!-- Pilihan periode masa aktif (PRD 5.1) -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="font-display text-xl font-bold text-highlighted">
          Pilih Paket Sesuai Kebutuhan Mengajar
        </h2>
        <p class="text-sm text-toned">
          Masa aktif 1 bulan atau 1 tahun, bisa dibayar dengan QRIS, e-wallet, atau Virtual Account tanpa tagihan tersembunyi.
        </p>
      </div>

      <div
        role="group"
        aria-label="Pilih periode masa aktif"
        class="flex items-center gap-2"
      >
        <UButton
          size="sm"
          :color="periode === 'bulanan' ? 'secondary' : 'neutral'"
          :variant="periode === 'bulanan' ? 'solid' : 'outline'"
          :aria-pressed="periode === 'bulanan'"
          class="stiker-tombol"
          @click="periode = 'bulanan'"
        >
          Masa Aktif 1 Bulan
        </UButton>
        <UButton
          size="sm"
          :color="periode === 'tahunan' ? 'secondary' : 'neutral'"
          :variant="periode === 'tahunan' ? 'solid' : 'outline'"
          :aria-pressed="periode === 'tahunan'"
          class="stiker-tombol"
          @click="periode = 'tahunan'"
        >
          Masa Aktif 1 Tahun (Hemat 25%)
        </UButton>
      </div>
    </div>

    <UPageGrid>
      <!-- Satu-satunya kartu 2x2 di halaman ini (DESIGN.md): Paket Berbayar AI -->
      <div class="panel-kertas flex flex-col justify-between p-6 sm:col-span-6 sm:p-8 lg:col-span-7 lg:row-span-2">
        <div class="space-y-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-1">
              <span class="lencana-pensil inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs">
                <UIcon
                  name="i-lucide-sparkles"
                  class="size-3.5"
                />
                Paket Berbayar (7 Alat AI Gemini)
              </span>
              <h3 class="font-display pt-1 text-2xl sm:text-3xl font-extrabold text-highlighted">
                {{ periode === 'bulanan' ? 'Paket Bulanan' : 'Paket Tahunan' }}
              </h3>
            </div>

            <div class="text-right">
              <p class="font-display text-3xl sm:text-4xl font-extrabold text-highlighted">
                {{ periode === 'bulanan' ? 'Rp39.000' : 'Rp349.000' }}
              </p>
              <p class="text-xs font-semibold text-muted">
                {{ periode === 'bulanan' ? 'untuk masa aktif 30 hari' : 'untuk masa aktif 12 bulan (usulan)' }}
              </p>
            </div>
          </div>

          <p class="text-sm text-toned">
            Menghemat berjam-jam menyusun LKPD bergambar, bank soal beserta kisi-kisi, soal numerasi, dan modul ajar. Semua generator diikat ke referensi kurikulum supaya tidak melantur.
          </p>

          <ul class="grid gap-3 text-sm sm:grid-cols-2">
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span><strong>Semua 30+ alat gratis</strong> tanpa batas pemakaian</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span><strong>7 generator AI berdasar CP & TP</strong> Kurikulum Merdeka</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span><strong>Kuota 60 generate teks/soal</strong> per bulan</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span><strong>Kuota 25 generate gambar LKPD</strong> garis hitam-putih per bulan</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span><strong>Pratinjau bisa diedit</strong> sebelum cetak A4/F4 atau ekspor Word</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span><strong>Kuota aman:</strong> gagal generate tidak memotong kuota (AI-10)</span>
            </li>
          </ul>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-5">
          <div class="text-xs text-muted">
            Metode bayar: QRIS, E-Wallet, Virtual Account (PRD 5.1).
          </div>
          <UButton
            size="xl"
            color="primary"
            icon="i-lucide-credit-card"
            class="stiker-tombol"
            @click="mulaiLangganan"
          >
            Pilih {{ periode === 'bulanan' ? 'Paket Bulanan' : 'Paket Tahunan' }}
          </UButton>
        </div>
      </div>

      <!-- Tamu (Tanpa Login) -->
      <div class="panel-kertas flex flex-col justify-between space-y-4 p-6 sm:col-span-3 lg:col-span-5">
        <div class="space-y-2">
          <span class="inline-flex rounded-full border-2 border-(--color-tinta) bg-white px-3 py-0.5 text-xs font-bold text-highlighted dark:bg-slate-800">
            Tamu · Tanpa Daftar
          </span>
          <div class="flex items-baseline justify-between">
            <h3 class="font-display text-xl font-bold text-highlighted">
              Alat Harian Gratis
            </h3>
            <span class="font-display text-2xl font-extrabold text-highlighted">Rp0</span>
          </div>
          <p class="text-sm text-toned">
            Langsung pakai di kelas tanpa membuat akun: timer, pemilih siswa acak, pembagi kelompok, dadu, kalkulator nilai rapor, rekap absensi, dan lembar kerja matematika.
          </p>
        </div>
        <div>
          <UButton
            to="/alat"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-layout-grid"
            class="stiker-tombol"
          >
            Buka Semua Alat Gratis
          </UButton>
        </div>
      </div>

      <!-- Akun Gratis -->
      <div class="panel-kertas flex flex-col justify-between space-y-4 p-6 sm:col-span-3 lg:col-span-5">
        <div class="space-y-2">
          <span class="inline-flex rounded-full border-2 border-(--color-tinta) bg-yellow-100 px-3 py-0.5 text-xs font-bold text-slate-900">
            Akun Gratis · Masuk dengan belajar.id
          </span>
          <div class="flex items-baseline justify-between">
            <h3 class="font-display text-xl font-bold text-highlighted">
              Coba Generator AI
            </h3>
            <span class="font-display text-2xl font-extrabold text-highlighted">Rp0</span>
          </div>
          <p class="text-sm text-toned">
            Semua alat gratis ditambah usulan jatah percobaan kecil (3 generate teks & 1 gambar per bulan) supaya bisa merasakan hasilnya sebelum berlangganan (PRD 5).
          </p>
        </div>
        <div>
          <UButton
            to="/masuk"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-key-round"
            class="stiker-tombol"
          >
            Masuk dengan Google / Email
          </UButton>
        </div>
      </div>
    </UPageGrid>

    <!-- Tabel Perbandingan Paket (PRD Bagian 5) -->
    <section
      aria-labelledby="judul-perbandingan-paket"
      class="panel-kertas space-y-4 p-6"
    >
      <h2
        id="judul-perbandingan-paket"
        class="font-display text-xl font-bold text-highlighted"
      >
        Perbandingan Lengkap Paket (PRD Bagian 5)
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b-2 border-(--color-tinta) text-xs text-muted">
              <th class="pb-2.5 font-semibold">
                Fasilitas
              </th>
              <th class="pb-2.5 font-semibold">
                Tamu (Tanpa Login)
              </th>
              <th class="pb-2.5 font-semibold">
                Akun Gratis
              </th>
              <th class="pb-2.5 font-semibold">
                Paket Berbayar
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr>
              <td class="py-3 pr-3 font-semibold text-highlighted">
                Alat kelas harian & peraga (30+ alat non-AI)
              </td>
              <td class="py-3 pr-3 text-toned">
                Ya, penuh tanpa batas
              </td>
              <td class="py-3 pr-3 text-toned">
                Ya, penuh tanpa batas
              </td>
              <td class="py-3 pr-3 font-semibold text-highlighted">
                Ya, penuh tanpa batas
              </td>
            </tr>
            <tr>
              <td class="py-3 pr-3 font-semibold text-highlighted">
                7 Alat Generator Berbasis AI (Gemini)
              </td>
              <td class="py-3 pr-3 text-muted">
                Lihat penjelasan & contoh
              </td>
              <td class="py-3 pr-3 text-toned">
                Jatah coba (3 generate/bln)
              </td>
              <td class="py-3 pr-3 font-semibold text-highlighted">
                Terbuka penuh (kuota bulanan)
              </td>
            </tr>
            <tr>
              <td class="py-3 pr-3 font-semibold text-highlighted">
                Alat favorit, nama siswa & pengaturan alat
              </td>
              <td class="py-3 pr-3 text-toned">
                Di perangkat ini saja
              </td>
              <td class="py-3 pr-3 text-toned">
                Di perangkat ini saja
              </td>
              <td class="py-3 pr-3 text-toned">
                Di perangkat ini saja
              </td>
            </tr>
            <tr>
              <td class="py-3 pr-3 font-semibold text-highlighted">
                Tutorial, blog, dan referensi kurikulum
              </td>
              <td class="py-3 pr-3 text-toned">
                Ya, gratis & publik
              </td>
              <td class="py-3 pr-3 text-toned">
                Ya, gratis & publik
              </td>
              <td class="py-3 pr-3 text-toned">
                Ya, gratis & publik
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Penjelasan 7 Alat AI Berbayar (PRD B-02 & okf/alat-berbayar.md) -->
    <section
      aria-labelledby="judul-rincian-ai"
      class="space-y-4"
    >
      <div>
        <h2
          id="judul-rincian-ai"
          class="font-display text-2xl font-bold text-highlighted"
        >
          Apa Saja yang Termasuk di Paket Berbayar?
        </h2>
        <p class="text-sm text-toned">
          Ketujuh generator di bawah ini wajib berpijak pada pilihan Kelas, Mata Pelajaran, Elemen CP, Materi, dan TP supaya hasil AI tetap sesuai kurikulum SD.
        </p>
      </div>

      <UPageGrid>
        <div
          v-for="item in rincianAlatAi"
          :key="item.slug"
          class="panel-kertas flex flex-col justify-between space-y-4 p-5 sm:col-span-3 lg:col-span-4"
        >
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="langkah-nomor">{{ item.no }}</span>
              <span class="lencana-pensil inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs">
                <UIcon
                  name="i-lucide-lock"
                  class="size-3"
                />
                Alat AI Berbayar
              </span>
            </div>

            <h3 class="font-display text-lg font-bold text-highlighted">
              {{ item.nama }}
            </h3>

            <div class="space-y-1.5 text-xs text-toned">
              <p><strong>Masukan:</strong> {{ item.masukan }}</p>
              <p><strong>Keluaran:</strong> {{ item.keluaran }}</p>
            </div>
          </div>

          <div class="pt-1">
            <UButton
              v-if="item.siapPrototipe"
              :to="`/alat/${item.slug}`"
              color="primary"
              size="xs"
              icon="i-lucide-eye"
              class="stiker-tombol"
            >
              Lihat Prototipe Tampilan
            </UButton>
            <span
              v-else
              class="text-xs font-medium text-muted"
            >
              Tahap pengerjaan generator AI (PRD Tahap 5 & 7)
            </span>
          </div>
        </div>
      </UPageGrid>
    </section>

    <!-- Modal Simulasi Alur Pembayaran (PRD B-03) -->
    <UModal
      v-model:open="checkoutOpen"
      :title="`Langganan ${periode === 'bulanan' ? 'Paket Bulanan (Rp39.000)' : 'Paket Tahunan (Rp349.000)'}`"
      description="Alur PRD B-03: Pilih paket -> Masuk akun -> Pembayaran lewat payment gateway -> Akses terbuka saat webhook terverifikasi."
    >
      <template #body>
        <div class="space-y-4">
          <URadioGroup
            v-model="metodeBayar"
            :items="daftarMetode"
            variant="card"
            legend="Pilih metode pembayaran (QRIS / Virtual Account / E-Wallet)"
            :ui="{ item: 'rounded-xl', description: 'text-xs' }"
          />
          <p class="text-xs text-muted">
            Saat masa aktif berakhir nanti, alat yang sedang terbuka di kelas tidak akan tertutup mendadak di tengah pemakaian (PRD B-08).
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="checkoutOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-arrow-right"
            @click="konfirmasiSimulasiBayar"
          >
            Lanjutkan Simulasi Pembayaran
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
