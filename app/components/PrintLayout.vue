<script setup lang="ts">
// Tata letak cetak bersama: pilihan kertas A4/F4 dan orientasi, pratinjau, lalu dialog cetak peramban.
// Saat mencetak, hanya isi [data-print-area] yang terlihat
type Paper = 'A4' | 'F4'
type Orientation = 'portrait' | 'landscape'

const PAPERS: Record<Paper, { w: number, h: number, label: string }> = {
  A4: { w: 210, h: 297, label: 'A4 (210 × 297 mm)' },
  F4: { w: 215, h: 330, label: 'F4 / Folio (215 × 330 mm)' }
}

const paper = useLocalStorage<Paper>('gurukampung:cetak:kertas', 'A4', { initOnMounted: true })
const orientation = useLocalStorage<Orientation>('gurukampung:cetak:orientasi', 'portrait', { initOnMounted: true })

const size = computed(() => {
  const p = PAPERS[paper.value] ?? PAPERS.A4
  return orientation.value === 'portrait' ? { w: p.w, h: p.h } : { w: p.h, h: p.w }
})

// @page tidak bisa diatur lewat class, jadi ditulis sebagai style di <head>
useHead(() => ({
  style: [{ key: 'gurukampung-page-size', textContent: `@page { size: ${size.value.w}mm ${size.value.h}mm; }` }]
}))

const paperItems = Object.entries(PAPERS).map(([value, p]) => ({ value, label: p.label }))
const orientationItems = [
  { value: 'portrait', label: 'Tegak' },
  { value: 'landscape', label: 'Mendatar' }
]

function print() {
  window.print()
}
</script>

<template>
  <!-- min-w-0: pratinjau selebar kertas tidak boleh melebarkan grid induk di layar kecil -->
  <div class="min-w-0 space-y-4">
    <div class="flex flex-wrap items-end gap-3 print:hidden">
      <UFormField label="Kertas">
        <USelect
          v-model="paper"
          :items="paperItems"
          class="w-52"
        />
      </UFormField>
      <UFormField label="Arah kertas">
        <USelect
          v-model="orientation"
          :items="orientationItems"
          class="w-36"
        />
      </UFormField>
      <UButton
        icon="i-lucide-printer"
        @click="print"
      >
        Cetak
      </UButton>
    </div>

    <!-- Pratinjau kertas dengan ukuran asli dalam mm; bisa digulir menyamping di layar kecil -->
    <div class="overflow-x-auto rounded-2xl border-2 border-(--color-tinta) bg-yellow-50/70 dark:bg-slate-950 p-4 print:p-0 print:border-0 print:bg-transparent print:overflow-visible">
      <div
        data-print-area
        class="mx-auto border-2 border-(--color-tinta) bg-white text-black print:border-0 print:shadow-none"
        :style="{ width: `${size.w - 24}mm`, minHeight: `${size.h - 24}mm` }"
      >
        <slot
          :width-mm="size.w - 24"
          :height-mm="size.h - 24"
        />
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  [data-print-area],
  [data-print-area] * {
    visibility: visible;
  }

  [data-print-area] {
    position: absolute;
    inset: 0;
  }
}
</style>
