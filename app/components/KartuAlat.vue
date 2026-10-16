<script setup lang="ts">
import { CATEGORIES, type ToolInfo } from '~/tools/catalog'

const props = defineProps<{
  tool: ToolInfo
  // Kelas --miring, hanya di beranda (panggung); di meja kerja kartu tegak (DESIGN.md)
  tilt?: string
}>()

const { isFavorite, toggleFavorite } = useFavorites()
const favorite = computed(() => isFavorite(props.tool.slug))

// Animasi bintang hanya diputar saat ditekan, bukan saat halaman dimuat
const starAnim = ref<'masuk' | 'keluar' | null>(null)
function onStar() {
  toggleFavorite(props.tool.slug)
  starAnim.value = null
  // Kelas dilepas dulu supaya animasi bisa diulang kalau bintang ditekan berkali-kali
  requestAnimationFrame(() => {
    starAnim.value = favorite.value ? 'masuk' : 'keluar'
  })
}
const categoryName = computed(() => CATEGORIES.find(c => c.id === props.tool.category)?.name ?? '')

// Hubungan ilustrasi dengan alat nyata (R-22, DESIGN.md)
const illustration = computed(() => {
  const slug = props.tool.slug
  if (slug === 'dadu-spinner' || slug === 'pemilih-acak') return 'dadu'
  if (slug === 'timer' || slug === 'jam-analog') return 'jam'
  if (slug === 'lk-matematika' || slug === 'latihan-menulis') return 'pensil'
  if (slug === 'nilai-rapor' || slug === 'tabel-perkalian') return 'penggaris'
  if (slug === 'sertifikat' || slug === 'papan-poin') return 'bintang'
  return undefined
})
</script>

<template>
  <!-- Miring dan gerak hover ada di pembungkus, supaya tombol bintang ikut bergerak bersama kartu -->
  <div :class="['kartu-bergerak relative h-full', tilt]">
    <NuxtLink
      :to="`/alat/${tool.slug}`"
      class="stiker-kartu flex h-full flex-col justify-between bg-white p-5 pr-14 sm:p-6 dark:bg-slate-900"
    >
      <div class="space-y-3">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex size-10 items-center justify-center rounded-2xl border-2 border-(--color-tinta) bg-(--color-pensil) text-slate-900">
            <UIcon
              :name="tool.icon"
              class="size-5"
            />
          </span>
          <span class="text-xs font-semibold text-muted">
            {{ categoryName }}
          </span>
        </div>

        <h3 class="font-display text-xl font-bold text-highlighted">
          {{ tool.name }}
        </h3>

        <p class="text-sm text-toned">
          {{ tool.summary }}
        </p>
      </div>

      <div class="mt-4 flex items-end justify-between gap-2 pt-2">
        <div class="flex flex-wrap gap-1.5 text-xs font-medium text-muted">
          <span
            v-if="tool.needs.includes('kelas')"
            class="rounded-md border border-default px-2 py-0.5"
          >Data Kelas</span>
          <span
            v-if="tool.needs.includes('proyektor')"
            class="rounded-md border border-default px-2 py-0.5"
          >Proyektor</span>
          <span
            v-if="tool.needs.includes('cetak')"
            class="rounded-md border border-default px-2 py-0.5"
          >Siap Cetak</span>
        </div>

        <div
          v-if="tool.priority === 1 && illustration"
          class="w-14 shrink-0"
        >
          <PeraguIlustrasi :name="illustration" />
        </div>
      </div>
    </NuxtLink>

    <!-- Tombol penanda favorit (PRD F-01), minimal 44x44px. Bintang terisi kuning pensil seperti stiker hadiah dari guru -->
    <button
      type="button"
      :aria-label="favorite ? `Hapus ${tool.name} dari favorit` : `Tandai ${tool.name} sebagai favorit`"
      :aria-pressed="favorite"
      :class="['tombol-bintang absolute top-2.5 right-2.5 z-10 inline-flex size-11 items-center justify-center rounded-full', { 'bintang-masuk': starAnim === 'masuk', 'bintang-keluar': starAnim === 'keluar' }, favorite ? 'text-(--color-tinta)' : 'text-muted']"
      @click.stop.prevent="onStar"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        class="bintang-ikon size-6"
        :fill="favorite ? 'var(--color-pensil)' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      >
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </svg>
      <!-- Percikan kecil saat ditandai favorit -->
      <span
        aria-hidden="true"
        class="bintang-percik"
      >
        <span
          v-for="n in 6"
          :key="n"
          :style="{ '--sudut': `${n * 60}deg` }"
        />
      </span>
    </button>
  </div>
</template>
