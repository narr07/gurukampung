<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { CATEGORIES, TOOLS } from '~/tools/catalog'
import { isToolAvailable } from '~/tools/registry'

const route = useRoute()
const router = useRouter()
const { favorites } = useFavorites()

const items: NavigationMenuItem[] = [
  { label: 'Alat', to: '/', icon: 'i-lucide-layout-grid' },
  { label: 'Data Kelas', to: '/kelas', icon: 'i-lucide-users' },
  { label: 'Pengaturan', to: '/pengaturan', icon: 'i-lucide-settings' }
]

// Pulau navbar berlatar padat putih (gelap: slate-900) dengan garis tinta dan bayangan padat tanpa blur (DESIGN.md)
const island = 'stiker-pulau bg-white dark:bg-slate-900'

// Garis tipis warna tinta di tepi atas layar menunjukkan seberapa jauh beranda sudah digulir (DESIGN.md)
const isHome = computed(() => route.path === '/')
const scrollProgress = ref(0)

function updateScrollProgress() {
  if (!import.meta.client) return
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  scrollProgress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}

onMounted(() => {
  updateScrollProgress()
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  window.addEventListener('resize', updateScrollProgress, { passive: true })
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', updateScrollProgress)
  window.removeEventListener('resize', updateScrollProgress)
})

// Pencarian alat dengan UCommandPalette (PRD F-01)
const searchOpen = ref(false)
defineShortcuts({
  meta_k: () => {
    searchOpen.value = !searchOpen.value
  }
})

const commandGroups = computed(() => {
  const favTools = TOOLS.filter(t => favorites.value.includes(t.slug))
  const groups = CATEGORIES.map(cat => ({
    id: cat.id,
    label: cat.name,
    items: TOOLS.filter(t => t.category === cat.id).map(t => ({
      id: t.slug,
      label: t.name,
      suffix: isToolAvailable(t.slug) ? t.summary : `Segera hadir (Fase ${t.phase})`,
      icon: t.icon,
      onSelect: () => {
        searchOpen.value = false
        router.push(`/alat/${t.slug}`)
      }
    }))
  }))

  if (favTools.length > 0) {
    groups.unshift({
      id: 'favorit',
      label: 'Alat Favorit',
      items: favTools.map(t => ({
        id: `fav-${t.slug}`,
        label: t.name,
        suffix: t.summary,
        icon: t.icon,
        onSelect: () => {
          searchOpen.value = false
          router.push(`/alat/${t.slug}`)
        }
      }))
    })
  }

  return groups
})

defineExpose({
  openSearch: () => {
    searchOpen.value = true
  }
})
</script>

<template>
  <div>
    <!-- Garis progres gulir khusus di beranda (DESIGN.md) -->
    <div
      v-if="isHome"
      aria-hidden="true"
      class="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none print:hidden"
    >
      <div
        class="h-full bg-(--color-tinta) origin-left transition-transform duration-75"
        :style="{ transform: `scaleX(${scrollProgress})` }"
      />
    </div>

    <UHeader
      :ui="{
        root: 'sticky top-3 z-40 bg-transparent border-none h-auto py-0',
        container: 'gap-2 sm:gap-4',
        left: 'lg:flex-none',
        right: 'lg:flex-none'
      }"
    >
      <template #left>
        <NuxtLink
          to="/"
          :class="[island, 'inline-flex items-center min-h-11 px-5 py-1.5 font-display text-xl font-extrabold tracking-tight text-highlighted']"
        >
          Peragu
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="items"
        variant="pill"
        color="secondary"
        highlight
        highlight-color="secondary"
        :class="[island, 'px-2 py-1']"
      />

      <template #right>
        <div :class="[island, 'flex items-center gap-1 px-2 py-1']">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-search"
            aria-label="Cari alat (Ctrl+K)"
            @click="searchOpen = true"
          >
            <span class="hidden sm:inline text-sm">Cari alat</span>
          </UButton>
          <UColorModeButton />
        </div>
      </template>

      <template #body>
        <div class="space-y-3 p-2">
          <UButton
            block
            color="neutral"
            variant="outline"
            icon="i-lucide-search"
            @click="searchOpen = true"
          >
            Cari alat
          </UButton>
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            color="secondary"
            class="-mx-2.5"
          />
        </div>
      </template>
    </UHeader>

    <UModal
      v-model:open="searchOpen"
      title="Cari alat Peragu"
      description="Ketik nama alat atau kegunaannya untuk langsung membuka."
    >
      <template #content>
        <UCommandPalette
          :groups="commandGroups"
          placeholder="Cari alat, misalnya timer, kelompok, rapor, dadu..."
          class="h-80"
        />
      </template>
    </UModal>
  </div>
</template>
