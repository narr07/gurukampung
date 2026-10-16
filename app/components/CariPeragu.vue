<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import { CATEGORIES, TOOLS } from '~/tools/catalog'
import { isToolAvailable } from '~/tools/registry'

// Pencarian seluruh Peragu: halaman, alat, tutorial, dan blog (PRD F-01). Dibuka dari menu atau Ctrl K
const open = defineModel<boolean>('open', { default: false })

const { favorites } = useFavorites()
const route = useRoute()

interface Hasil extends CommandPaletteItem {
  // Kata tambahan untuk pencarian (kategori, jenis), tidak ditampilkan
  kata?: string
  aktif?: boolean
}

const pages: Hasil[] = [
  { id: 'hal-alat', label: 'Semua alat', description: 'Daftar lengkap alat dengan pencarian dan favorit', icon: 'i-lucide-layout-grid', to: '/alat' },
  { id: 'hal-tutorial', label: 'Tutorial', description: 'Perangkat ajar, asesmen, dan cara memakai Peragu', icon: 'i-lucide-book-open', to: '/tutorial' },
  { id: 'hal-blog', label: 'Blog', description: 'Kabar dan catatan dari Peragu', icon: 'i-lucide-newspaper', to: '/blog' },
  { id: 'hal-dokumen', label: 'Dokumen', description: 'Dokumen untuk guru', icon: 'i-lucide-files', to: '/dokumen' },
  { id: 'hal-kelas', label: 'Data Kelas', description: 'Daftar siswa untuk semua alat', icon: 'i-lucide-users', to: '/kelas', kata: 'siswa murid excel' },
  { id: 'hal-pengaturan', label: 'Pengaturan', description: 'Profil sekolah, ukuran huruf, cadangan data', icon: 'i-lucide-settings', to: '/pengaturan', kata: 'cadangan backup pulihkan' }
]

const toolItem = (t: typeof TOOLS[number], id = t.slug): Hasil => ({
  id,
  label: t.name,
  description: isToolAvailable(t.slug) ? t.summary : `Segera hadir (Fase ${t.phase})`,
  icon: t.icon,
  to: `/alat/${t.slug}`,
  kata: CATEGORIES.find(c => c.id === t.category)?.name
})

// Tutorial dan blog baru diambil saat pencarian pertama kali dibuka
const { data: bacaan, execute } = useLazyAsyncData('cari-bacaan', async () => {
  const [tutorials, posts] = await Promise.all([
    queryCollection('tutorial').order('urutan', 'ASC').select('path', 'title', 'description').all(),
    queryCollection('blog').order('date', 'DESC').select('path', 'title', 'description').all()
  ])
  return { tutorials, posts }
}, { server: false, immediate: false })

watch(open, (value) => {
  if (value && !bacaan.value) execute()
})

const groups = computed<CommandPaletteGroup<Hasil>[]>(() => {
  const close = (item: Hasil) => ({
    ...item,
    // Ditandai dengan teks "Sedang dibuka", bukan latar abu-abu bawaan
    aktif: item.to === route.path,
    onSelect: () => {
      open.value = false
    }
  })
  const fav = TOOLS.filter(t => favorites.value.includes(t.slug))
  return [
    ...(fav.length ? [{ id: 'favorit', label: 'Alat favorit', items: fav.map(t => close(toolItem(t, `fav-${t.slug}`))) }] : []),
    { id: 'halaman', label: 'Halaman', items: pages.map(close) },
    ...CATEGORIES.map(cat => ({
      id: cat.id,
      label: cat.name,
      items: TOOLS.filter(t => t.category === cat.id).map(t => close(toolItem(t)))
    })),
    {
      id: 'tutorial',
      label: 'Tutorial',
      items: (bacaan.value?.tutorials ?? []).map(t => close({ id: t.path, label: t.title, description: t.description, icon: 'i-lucide-book-open', to: t.path, kata: 'tutorial' }))
    },
    {
      id: 'blog',
      label: 'Blog',
      items: (bacaan.value?.posts ?? []).map(p => close({ id: p.path, label: p.title, description: p.description, icon: 'i-lucide-newspaper', to: p.path, kata: 'blog' }))
    }
  ].filter(g => g.items.length > 0)
})

// Tinggi daftar dipotong tepat di bawah item terakhir yang muat utuh, supaya tidak ada item yang terlihat terpotong.
// Memakai offsetTop (tata letak), bukan getBoundingClientRect, karena panel sedang dianimasikan dengan scale saat dibuka
const searchTerm = ref('')
const moreBelow = ref(false)

function fitList() {
  const viewport = document.querySelector<HTMLElement>('.cari-panel [data-slot="viewport"]')
  if (!viewport) return
  viewport.style.maxHeight = ''
  const limit = Math.min(window.innerHeight * 0.6, 512)
  if (viewport.scrollHeight <= limit) {
    moreBelow.value = false
    return
  }
  const padding = Number.parseFloat(getComputedStyle(viewport).paddingBottom) || 0
  let fit = 0
  for (const item of viewport.querySelectorAll<HTMLElement>('[data-slot="item"]')) {
    const bottom = item.offsetTop + item.offsetHeight
    if (bottom + padding > limit) break
    fit = bottom
  }
  viewport.style.maxHeight = `${fit + padding}px`
  moreBelow.value = true
}

function refit() {
  nextTick(() => requestAnimationFrame(fitList))
}

watch([open, searchTerm, () => bacaan.value], () => {
  if (open.value) refit()
})
useEventListener('resize', () => open.value && fitList())

const fuse = {
  fuseOptions: { keys: ['label', 'description', 'kata'], threshold: 0.3, ignoreLocation: true },
  resultLimit: 6,
  matchAllWhenSearchEmpty: true
}
</script>

<template>
  <UModal
    v-model:open="open"
    :transition="false"
    title="Cari di Peragu"
    description="Ketik nama alat, tutorial, atau halaman, lalu tekan Enter untuk membuka."
    :ui="{
      overlay: 'cari-latar bg-slate-950/45',
      content: 'cari-panel top-[8vh] w-[calc(100vw-2rem)] max-w-2xl translate-y-0 divide-y-0 overflow-hidden rounded-[1.25rem] border-2 border-(--color-tinta) bg-white ring-0 sm:top-[12vh] dark:bg-slate-900'
    }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        :fuse="fuse"
        preserve-group-order
        size="lg"
        placeholder="Cari alat, tutorial, atau halaman..."
        close
        :input="{ ui: { base: 'h-14 rounded-[0.875rem] border-0 bg-transparent ps-12 pe-12 text-lg md:text-lg focus:border-0', leading: 'ps-4', leadingIcon: 'size-5', trailing: 'pe-2' } }"
        :ui="{
          root: 'divide-y-0',
          input: 'cari-input m-3 mb-1 rounded-[0.875rem] border-2 border-(--color-tinta) bg-white dark:bg-slate-950',
          viewport: 'cari-daftar max-h-[min(60vh,32rem)] divide-y-0 px-2 py-2',
          group: 'p-0 pb-1',
          label: 'px-3 pt-3 pb-1.5 text-xs font-bold text-muted',
          item: 'items-center gap-3 rounded-[0.875rem] px-3 py-2.5 before:rounded-[0.875rem] before:bg-transparent data-highlighted:not-data-disabled:before:bg-yellow-100 dark:data-highlighted:not-data-disabled:before:bg-blue-950',
          itemLabelBase: 'font-semibold [&>mark]:bg-(--color-pensil) [&>mark]:text-slate-900',
          itemDescription: 'line-clamp-2 whitespace-normal text-sm [&>mark]:bg-(--color-pensil)/60 [&>mark]:text-slate-900',
          footer: 'border-t-2 border-dashed border-default px-5 py-3 sm:px-7',
          empty: 'px-6 py-10'
        }"
      >
        <template #item-leading="{ item }">
          <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-(--color-tinta) bg-(--color-pensil) text-slate-900">
            <UIcon
              :name="item.icon"
              class="size-5"
            />
          </span>
        </template>

        <template #item-trailing="{ item }">
          <span
            v-if="item.aktif"
            class="shrink-0 rounded-full border border-default px-2 py-0.5 text-xs font-medium text-muted"
          >Sedang dibuka</span>
        </template>

        <template #empty="{ searchTerm }">
          <div class="space-y-2">
            <p class="font-display text-lg font-bold text-highlighted">
              Tidak ada yang cocok dengan "{{ searchTerm }}"
            </p>
            <p class="text-sm text-muted">
              Coba kata lain, misalnya nilai, kelompok, absen, atau RPP.
            </p>
          </div>
        </template>

        <template #footer>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span class="inline-flex items-center gap-1.5"><UKbd value="↑" /><UKbd value="↓" /> pilih</span>
            <span class="inline-flex items-center gap-1.5"><UKbd value="Enter" /> buka</span>
            <span class="inline-flex items-center gap-1.5"><UKbd value="Esc" /> tutup</span>
            <span
              v-if="moreBelow"
              class="ms-auto inline-flex items-center gap-1 font-medium"
            >
              <UIcon
                name="i-lucide-arrow-down"
                class="size-3.5"
              />
              Gulir untuk hasil lainnya
            </span>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
