<script setup lang="ts">
// Generator LKPD bergambar (alat berbayar, okf/alat-berbayar.md bagian 1).
// Prototipe tampilan: pemilih kurikulum dan tata letak LKPD sudah jadi, pemanggilan AI belum tersambung
const { pilihan, fase, mapel, elemen, materi, tp, lengkap } = useKurikulum()

const JENIS = [
  { value: 'isian', label: 'Isian singkat', description: 'Gambar dengan titik-titik untuk diisi' },
  { value: 'menjodohkan', label: 'Menjodohkan', description: 'Tarik garis dari gambar ke jawaban' },
  { value: 'pilihan-ganda', label: 'Pilihan ganda bergambar', description: 'Lingkari gambar atau jawaban yang tepat' },
  { value: 'menghitung', label: 'Menghitung gambar', description: 'Hitung benda pada gambar' }
]
const TINGKAT = [
  { value: 'mudah', label: 'Mudah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'menantang', label: 'Menantang' }
]

const opsi = useLocalStorage('gurukampung:lkpd:opsi', {
  jenis: 'isian',
  jumlah: 5,
  tingkat: 'sedang',
  versiAB: false,
  kunci: true
}, { initOnMounted: true, mergeDefaults: true })

const judul = computed(() => (materi.value ? `LKPD ${materi.value.nama.replace(/^\[Contoh\]\s*/, '')}` : 'LKPD'))
const jenisLabel = computed(() => JENIS.find(j => j.value === opsi.value.jenis)?.label ?? '')
</script>

<template>
  <div class="space-y-6">
    <UAlert
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      title="Prototipe tampilan"
      description="AI belum tersambung. Tombol Buat LKPD belum berfungsi, dan pratinjau hanya menunjukkan tata letak LKPD yang nanti dibuat."
    />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div class="space-y-6">
        <PilihKurikulum />

        <section
          v-if="lengkap"
          aria-labelledby="langkah-lkpd"
          class="space-y-4"
        >
          <h3
            id="langkah-lkpd"
            class="langkah-judul"
          >
            <span class="langkah-nomor">6</span> Isi LKPD
          </h3>
          <URadioGroup
            v-model="opsi.jenis"
            :items="JENIS"
            variant="card"
            legend="Jenis kegiatan"
            :ui="{ item: 'rounded-xl', description: 'text-xs' }"
          />
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Jumlah soal">
              <UInputNumber
                v-model="opsi.jumlah"
                :min="3"
                :max="10"
              />
            </UFormField>
            <UFormField label="Tingkat kesulitan">
              <USelect
                v-model="opsi.tingkat"
                :items="TINGKAT"
                class="w-full"
              />
            </UFormField>
          </div>
          <USwitch
            v-model="opsi.versiAB"
            label="Buat versi A dan B (urutan soal berbeda)"
          />
          <USwitch
            v-model="opsi.kunci"
            label="Kunci jawaban di halaman terpisah"
          />
          <UButton
            block
            size="lg"
            icon="i-lucide-file-image"
            disabled
          >
            Buat LKPD dengan AI
          </UButton>
          <p class="text-xs text-muted">
            Gambar dibuat sebagai garis hitam-putih supaya hemat tinta dan bisa diwarnai murid. Hasil AI selalu bisa diedit sebelum dicetak.
          </p>
        </section>
      </div>

      <div class="min-w-0">
        <div
          v-if="!lengkap"
          class="panel-kertas flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center"
        >
          <div class="w-24">
            <GambarIlustrasi name="pensil" />
          </div>
          <p class="font-display text-lg font-bold text-highlighted">
            Pratinjau LKPD
          </p>
          <p class="max-w-sm text-sm text-muted">
            Pilih kelas, mata pelajaran, elemen CP, materi, dan tujuan pembelajaran. Pratinjau tata letaknya muncul di sini.
          </p>
        </div>

        <PrintLayout v-else>
          <div class="p-6 text-black">
            <PrintHeader
              :title="judul"
              :subtitle="`${mapel?.mapel} · Kelas ${pilihan.kelas}${opsi.versiAB ? ' · Versi A' : ''}`"
            />
            <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
              <span>Nama: ____________________</span>
              <span>Kelas: ________</span>
              <span>Tanggal: ____________</span>
            </div>

            <p class="mb-3 text-sm">
              <strong>Tujuan:</strong> {{ tp }}
            </p>
            <p class="placeholder-ai mb-5">
              Petunjuk pengerjaan untuk kegiatan "{{ jenisLabel }}", ditulis AI sesuai kelas {{ pilihan.kelas }}.
            </p>

            <ol class="grid grid-cols-2 gap-5">
              <li
                v-for="n in opsi.jumlah"
                :key="n"
                class="break-inside-avoid space-y-2"
              >
                <p class="text-sm font-bold">
                  Soal {{ n }}
                </p>
                <div class="placeholder-ai flex aspect-[4/3] items-center justify-center text-center">
                  Gambar garis hitam-putih
                </div>
                <p class="placeholder-ai">
                  Pertanyaan {{ n }} dari AI
                </p>
              </li>
            </ol>

            <p class="mt-6 border-t border-gray-300 pt-2 text-[0.7rem] text-gray-600">
              Dasar: CP {{ mapel?.mapel }} Fase {{ fase }} ({{ mapel?.sumber.dokumen }}), elemen {{ elemen?.nama }}, materi {{ materi?.nama }}.
            </p>

            <div
              v-if="opsi.kunci"
              class="mt-10 border-t-2 border-dashed border-gray-400 pt-6 print:mt-0 print:break-before-page print:border-0 print:pt-0"
            >
              <PrintHeader :title="`Kunci Jawaban: ${judul}`" />
              <p class="placeholder-ai">
                Kunci jawaban untuk {{ opsi.jumlah }} soal, dibuat AI dan diperiksa guru sebelum dicetak.
              </p>
            </div>
          </div>
        </PrintLayout>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Kotak penanda isi yang nanti dibuat AI; jelas berbeda dari isi sungguhan */
.placeholder-ai {
  border: 1.5px dashed #9ca3af;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: #6b7280;
  font-size: 0.8rem;
  font-style: italic;
}
</style>
