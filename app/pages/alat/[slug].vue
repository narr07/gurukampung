<script setup lang="ts">
import { CATEGORIES, findTool, type ToolInfo } from '~/tools/catalog'
import { loadTool } from '~/tools/registry'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const tool = computed(() => findTool(slug.value))
const { isFavorite, toggleFavorite } = useFavorites()

if (!tool.value) {
  throw createError({ statusCode: 404, statusMessage: 'Alat tidak ditemukan', fatal: true })
}

const category = computed(() => CATEGORIES.find(c => c.id === tool.value?.category)?.name)
const loader = computed(() => loadTool(slug.value))
const ToolComponent = computed(() => (loader.value ? defineAsyncComponent(loader.value) : null))

function pickIllustration(t: ToolInfo): 'pensil' | 'penggaris' | 'dadu' | 'jam' | 'pesawat' | 'kartu-nama' | 'bintang' {
  if (t.slug === 'dadu-spinner' || t.slug === 'pemilih-acak') return 'dadu'
  if (t.slug === 'timer' || t.slug === 'jam-analog') return 'jam'
  if (t.slug === 'sertifikat' || t.slug === 'papan-poin') return 'bintang'
  if (t.slug === 'pembagi-kelompok' || t.slug === 'label-siswa' || t.slug === 'rekap-absensi') return 'kartu-nama'
  if (t.category === 'penilaian' || t.slug === 'tabel-perkalian') return 'penggaris'
  if (t.category === 'bahan-ajar') return 'pensil'
  return 'pesawat'
}

useSeoMeta({
  title: () => tool.value?.name,
  description: () => tool.value?.summary
})
</script>

<template>
  <div
    v-if="tool"
    class="space-y-6"
  >
    <div class="space-y-4 print:hidden [.projector-mode_&]:hidden">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <UButton
          to="/alat"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-arrow-left"
        >
          Semua alat
        </UButton>

        <UButton
          :color="isFavorite(tool.slug) ? 'secondary' : 'neutral'"
          :variant="isFavorite(tool.slug) ? 'solid' : 'outline'"
          size="sm"
          icon="i-lucide-star"
          :aria-pressed="isFavorite(tool.slug)"
          @click="toggleFavorite(tool.slug)"
        >
          {{ isFavorite(tool.slug) ? 'Tersimpan di Favorit' : 'Tandai Favorit' }}
        </UButton>
      </div>

      <PageTitle
        :title="tool.name"
        :description="tool.summary"
        :badge="category"
        :icon="tool.icon"
        :illustration="pickIllustration(tool)"
      />
    </div>

    <div
      v-if="ToolComponent"
      class="panel-kertas p-5 sm:p-8 print:border-0 print:p-0 print:bg-transparent"
    >
      <component :is="ToolComponent" />
    </div>

    <div
      v-else
      class="panel-kertas p-8"
    >
      <UEmpty
        icon="i-lucide-hammer"
        title="Alat ini belum tersedia"
        :description="`${tool.name} dijadwalkan di fase ${tool.phase} pengerjaan Guru Kampung. Untuk sementara, coba alat lain yang sudah siap.`"
        :actions="[{ label: 'Kembali ke daftar alat', to: '/alat', icon: 'i-lucide-arrow-left', color: 'primary', variant: 'solid' }]"
      />
    </div>
  </div>
</template>
