<script setup lang="ts">
import { TP_SENDIRI } from '~/utils/kurikulum'

// Pemilih kurikulum bersama untuk semua generator AI: kelas → mata pelajaran → elemen CP → materi → TP.
// AI hanya menerima hasil pilihan ini, tidak ada permintaan bebas (okf/referensi-kurikulum.md)
const { status, pilihan, fase, daftarMapel, mapel, elemen, materi, pilih } = useKurikulum()

const KELAS = [1, 2, 3, 4, 5, 6]
const faseLabel = (k: number) => (k <= 2 ? 'A' : k <= 4 ? 'B' : 'C')

const elemenItems = computed(() => (mapel.value?.elemen ?? []).map(e => ({ value: e.id, label: e.nama, description: e.capaian })))

// Materi yang biasa diajarkan di kelas terpilih ditampilkan lebih dulu; sisanya tetap bisa dipilih
const daftarMateri = computed(() => {
  const k = pilihan.value.kelas
  return [...(elemen.value?.materi ?? [])].sort((a, b) => Number((b.kelas ?? []).includes(k ?? 0)) - Number((a.kelas ?? []).includes(k ?? 0)))
})

const tpItems = computed(() => [
  ...(materi.value?.tp ?? []).map(t => ({ value: t.id, label: t.teks, description: t.kelas ? `Contoh untuk kelas ${t.kelas}` : undefined })),
  { value: TP_SENDIRI, label: 'Tulis TP sendiri', description: 'Kompetensi + konten + bukti, untuk materi yang dipilih' }
])
</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="mapel?.contoh"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Data contoh"
      description="Data kurikulum mata pelajaran ini masih contoh format, belum disalin dari dokumen resmi."
    />

    <!-- 1. Kelas -->
    <section
      aria-labelledby="langkah-kelas"
      class="space-y-2"
    >
      <h3
        id="langkah-kelas"
        class="langkah-judul"
      >
        <span class="langkah-nomor">1</span> Kelas
      </h3>
      <div
        role="group"
        aria-labelledby="langkah-kelas"
        class="grid grid-cols-6 gap-2"
      >
        <button
          v-for="k in KELAS"
          :key="k"
          type="button"
          :aria-pressed="pilihan.kelas === k"
          class="stiker-tombol flex min-h-12 flex-col items-center justify-center rounded-[0.875rem]! py-1.5"
          :class="pilihan.kelas === k ? 'bg-(--color-pensil) text-slate-900' : 'bg-white text-highlighted dark:bg-slate-900'"
          @click="pilih('kelas', k)"
        >
          <span class="font-display text-lg leading-none font-bold">{{ k }}</span>
          <span class="text-[0.65rem] font-semibold opacity-70">Fase {{ faseLabel(k) }}</span>
        </button>
      </div>
    </section>

    <!-- 2. Mata pelajaran -->
    <section
      v-if="pilihan.kelas"
      aria-labelledby="langkah-mapel"
      class="space-y-2"
    >
      <h3
        id="langkah-mapel"
        class="langkah-judul"
      >
        <span class="langkah-nomor">2</span> Mata pelajaran
      </h3>
      <USkeleton
        v-if="status === 'pending'"
        class="h-11 w-full"
      />
      <p
        v-else-if="daftarMapel.length === 0"
        class="rounded-xl border-2 border-dashed border-default p-3 text-sm text-muted"
      >
        Data kurikulum untuk Fase {{ fase }} belum tersedia.
      </p>
      <div
        v-else
        role="group"
        aria-labelledby="langkah-mapel"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="m in daftarMapel"
          :key="m.mapelId"
          type="button"
          :aria-pressed="pilihan.mapelId === m.mapelId"
          class="stiker-tombol min-h-11 px-4 py-2 text-sm font-semibold"
          :class="pilihan.mapelId === m.mapelId ? 'bg-(--color-pensil) text-slate-900' : 'bg-white text-highlighted dark:bg-slate-900'"
          @click="pilih('mapelId', m.mapelId)"
        >
          {{ m.mapel }}
        </button>
      </div>
    </section>

    <!-- 3. Elemen CP, dengan teks capaian supaya guru melihat dasarnya -->
    <section
      v-if="mapel"
      aria-labelledby="langkah-elemen"
      class="space-y-2"
    >
      <h3
        id="langkah-elemen"
        class="langkah-judul"
      >
        <span class="langkah-nomor">3</span> Elemen CP
      </h3>
      <URadioGroup
        :model-value="pilihan.elemenId ?? undefined"
        :items="elemenItems"
        variant="card"
        aria-labelledby="langkah-elemen"
        :ui="{ item: 'rounded-xl', description: 'line-clamp-3 text-xs' }"
        @update:model-value="v => pilih('elemenId', String(v))"
      />
    </section>

    <!-- 4. Materi -->
    <section
      v-if="elemen"
      aria-labelledby="langkah-materi"
      class="space-y-2"
    >
      <h3
        id="langkah-materi"
        class="langkah-judul"
      >
        <span class="langkah-nomor">4</span> Materi
      </h3>
      <div
        role="group"
        aria-labelledby="langkah-materi"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="m in daftarMateri"
          :key="m.id"
          type="button"
          :aria-pressed="pilihan.materiId === m.id"
          class="stiker-tombol min-h-11 px-4 py-2 text-left text-sm font-semibold"
          :class="pilihan.materiId === m.id ? 'bg-(--color-pensil) text-slate-900' : 'bg-white text-highlighted dark:bg-slate-900'"
          @click="pilih('materiId', m.id)"
        >
          {{ m.nama }}
          <span
            v-if="m.kelas?.length"
            class="ms-1 text-xs font-medium opacity-70"
          >kelas {{ m.kelas?.join(', ') }}</span>
        </button>
      </div>
    </section>

    <!-- 5. Tujuan pembelajaran -->
    <section
      v-if="materi"
      aria-labelledby="langkah-tp"
      class="space-y-2"
    >
      <h3
        id="langkah-tp"
        class="langkah-judul"
      >
        <span class="langkah-nomor">5</span> Tujuan pembelajaran
      </h3>
      <URadioGroup
        :model-value="pilihan.tpId ?? undefined"
        :items="tpItems"
        variant="card"
        aria-labelledby="langkah-tp"
        :ui="{ item: 'rounded-xl', description: 'text-xs' }"
        @update:model-value="v => pilih('tpId', String(v))"
      />
      <UTextarea
        v-if="pilihan.tpId === TP_SENDIRI"
        v-model="pilihan.tpSendiri"
        :rows="3"
        autoresize
        placeholder="Contoh: Murid dapat mengurutkan tiga pecahan dari yang terkecil dan menjelaskan alasannya."
        aria-label="Tujuan pembelajaran yang ditulis sendiri"
        class="w-full"
      />
    </section>
  </div>
</template>
