<script setup lang="ts">
import { CATEGORIES, TOOLS, type ToolCategory } from '~/tools/catalog'
import { isToolAvailable } from '~/tools/registry'

useSeoMeta({
  title: 'Semua alat',
  description: 'Daftar lengkap alat kerja guru SD di Guru Kampung: manajemen kelas, penilaian, pembuat bahan ajar, alat peraga digital, dan dokumen.'
})

const { favorites, isFavorite } = useFavorites()

// Saring alat berdasarkan kata kunci, kategori, atau favorit (PRD F-01)
const searchQuery = ref('')
const activeCategory = ref<'semua' | 'favorit' | ToolCategory>('semua')

const available = TOOLS.filter(t => isToolAvailable(t.slug))
const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return available.filter((t) => {
    if (activeCategory.value === 'favorit' && !isFavorite(t.slug)) return false
    if (activeCategory.value !== 'semua' && activeCategory.value !== 'favorit' && t.category !== activeCategory.value) return false
    if (!q) return true
    return t.name.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)
  })
})

const filters = computed(() => [
  { id: 'semua' as const, label: `Semua (${available.length})`, icon: undefined },
  { id: 'favorit' as const, label: `Favorit (${favorites.value.length})`, icon: 'i-lucide-star' },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.name, icon: undefined }))
])

// Ukuran kartu mengikuti prioritas (DESIGN.md): alat harian P1 memakai 2×1 (6 kolom), alat lain 1×1 (3 kolom)
const span = (priority: number) => (priority === 1 ? 'sm:col-span-6 lg:col-span-6' : 'sm:col-span-3 lg:col-span-3')

function reset() {
  activeCategory.value = 'semua'
  searchQuery.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <PageTitle
      title="Semua alat"
      :description="`${available.length} alat kerja guru SD. Kartu besar adalah alat harian. Tandai bintang pada alat yang paling sering Anda buka.`"
      illustration="penggaris"
    />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="toolbar"
        aria-label="Saring kategori alat"
        class="flex flex-wrap gap-2"
      >
        <UButton
          v-for="f in filters"
          :key="f.id"
          :color="activeCategory === f.id ? 'secondary' : 'neutral'"
          :variant="activeCategory === f.id ? 'solid' : 'outline'"
          :icon="f.icon"
          :aria-pressed="activeCategory === f.id"
          size="sm"
          class="stiker-tombol"
          :class="activeCategory === f.id ? '' : 'bg-white dark:bg-slate-900'"
          @click="activeCategory = f.id"
        >
          {{ f.label }}
        </UButton>
      </div>

      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Cari nama atau kegunaan alat..."
        aria-label="Cari alat"
        class="w-full lg:w-80"
      />
    </div>

    <div
      v-if="filtered.length === 0"
      class="panel-kertas space-y-3 p-8 text-center"
    >
      <p class="font-display text-xl font-bold text-highlighted">
        {{ activeCategory === 'favorit' ? 'Belum ada alat favorit' : 'Alat tidak ditemukan' }}
      </p>
      <p class="mx-auto max-w-md text-sm text-muted">
        {{ activeCategory === 'favorit'
          ? 'Tekan tombol bintang di pojok kartu alat supaya mudah ditemukan di sini.'
          : 'Coba kata kunci lain atau tampilkan semua kategori alat.' }}
      </p>
      <UButton
        color="neutral"
        variant="outline"
        class="stiker-tombol"
        @click="reset"
      >
        Tampilkan semua alat
      </UButton>
    </div>

    <UPageGrid v-else>
      <KartuAlat
        v-for="tool in filtered"
        :key="tool.slug"
        :tool="tool"
        :class="['gerak-muncul', span(tool.priority)]"
      />
    </UPageGrid>
  </div>
</template>
