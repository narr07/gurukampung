<script setup lang="ts">
import { TOOLS } from '~/tools/catalog'
import { isToolAvailable } from '~/tools/registry'

const route = useRoute()
const { favorites } = useFavorites()

const items = [
  { label: 'Alat', to: '/alat', description: 'Semua alat yang siap dipakai' },
  { label: 'Tutorial', to: '/tutorial', description: 'Perangkat ajar, asesmen, dan cara memakai Peragu' },
  { label: 'Blog', to: '/blog', description: 'Kabar dan catatan dari Peragu' },
  { label: 'Dokumen', to: '/dokumen', description: 'Dokumen untuk guru' },
  { label: 'Data Kelas', to: '/kelas', description: 'Daftar siswa untuk semua alat' },
  { label: 'Pengaturan', to: '/pengaturan', description: 'Profil sekolah, ukuran huruf, cadangan data' }
]

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

// Garis tipis warna tinta di tepi atas layar menunjukkan seberapa jauh beranda sudah digulir (DESIGN.md)
const isHome = computed(() => route.path === '/')
const scrollProgress = ref(0)

function updateScrollProgress() {
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  scrollProgress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}

useEventListener('scroll', updateScrollProgress, { passive: true })
useEventListener('resize', updateScrollProgress, { passive: true })
onMounted(updateScrollProgress)

// Menu tombol: satu tombol tetap di pojok kanan atas, panelnya terbuka dari posisi tombol (DESIGN.md)
const menuOpen = ref(false)
watch(() => route.fullPath, () => {
  menuOpen.value = false
})

// Jalan pintas di panel menu: alat favorit, atau alat harian (P1) kalau belum ada favorit
const quickTools = computed(() => {
  const ready = TOOLS.filter(t => isToolAvailable(t.slug))
  const fav = ready.filter(t => favorites.value.includes(t.slug))
  return {
    title: fav.length > 0 ? 'Alat favorit' : 'Alat harian',
    tools: (fav.length > 0 ? fav : ready.filter(t => t.priority === 1)).slice(0, 6)
  }
})

// Pencarian seluruh Peragu ada di CariPeragu.vue (PRD F-01)
const searchOpen = ref(false)
defineShortcuts({
  meta_k: () => {
    menuOpen.value = false
    searchOpen.value = !searchOpen.value
  }
})

function openSearch() {
  menuOpen.value = false
  searchOpen.value = true
}
</script>

<template>
  <div>
    <!-- Garis progres gulir khusus di beranda (DESIGN.md) -->
    <div
      v-if="isHome"
      aria-hidden="true"
      class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1"
    >
      <div
        class="h-full origin-left bg-(--color-tinta)"
        :style="{ transform: `scaleX(${scrollProgress})` }"
      />
    </div>

    <!-- Logo ikut tergulir; hanya tombol menu yang tetap di layar -->
    <header class="relative z-30 pt-4">
      <UContainer class="flex h-12 items-center">
        <NuxtLink
          to="/"
          class="stiker-pulau inline-flex min-h-11 items-center bg-white px-5 py-1.5 font-display text-xl font-extrabold tracking-tight text-highlighted dark:bg-slate-900"
        >
          Peragu
        </NuxtLink>
      </UContainer>
    </header>

    <UModal
      v-model:open="menuOpen"
      fullscreen
      :transition="false"
      :overlay="false"
      title="Menu Peragu"
      description="Pindah halaman, buka alat, cari alat, atau ganti tema."
      :ui="{ content: 'menu-panel ring-0 divide-y-0 bg-(--color-pensil) text-slate-900 dark:bg-blue-950 dark:text-yellow-100' }"
    >
      <!-- Tombol menu tetap di layar; DialogTrigger mengembalikan fokus ke sini saat menu ditutup -->
      <button
        type="button"
        class="tombol-menu stiker-pulau fixed top-4 right-4 z-40 inline-flex min-h-12 items-center gap-3 bg-white py-2 pr-2 pl-5 font-semibold text-highlighted sm:right-6 lg:right-8 dark:bg-slate-900"
      >
        <span>Menu</span>
        <span
          aria-hidden="true"
          class="ikon-menu inline-flex size-8 flex-col items-center justify-center gap-1.5 rounded-full bg-(--color-pensil)"
        >
          <span />
          <span />
        </span>
      </button>

      <template #content="{ close }">
        <div
          class="flex h-full flex-col overflow-y-auto"
          data-lenis-prevent
        >
          <UContainer class="flex h-12 shrink-0 items-center justify-between pt-4 box-content">
            <NuxtLink
              to="/"
              class="stiker-pulau inline-flex min-h-11 items-center bg-white px-5 py-1.5 font-display text-xl font-extrabold tracking-tight text-slate-900 dark:bg-slate-900 dark:text-yellow-100"
              @click="close"
            >
              Peragu
            </NuxtLink>
          </UContainer>

          <!-- Tombol tutup berada tepat di posisi tombol menu, jadi terasa seperti tombol yang sama -->
          <button
            type="button"
            class="stiker-pulau fixed top-4 right-4 z-10 inline-flex min-h-12 items-center gap-3 bg-slate-900 py-2 pr-2 pl-5 font-semibold text-yellow-100 sm:right-6 lg:right-8 dark:bg-yellow-100 dark:text-slate-900"
            @click="close"
          >
            <span>Tutup</span>
            <span
              aria-hidden="true"
              class="ikon-tutup relative inline-flex size-8 items-center justify-center rounded-full bg-(--color-pensil)"
            >
              <span />
              <span />
            </span>
          </button>

          <UContainer class="grid flex-1 content-center gap-12 py-10 lg:grid-cols-12 lg:gap-8">
            <nav
              aria-label="Menu utama"
              class="lg:col-span-7"
            >
              <ol class="space-y-2 sm:space-y-3">
                <li
                  v-for="(item, i) in items"
                  :key="item.to"
                >
                  <NuxtLink
                    :to="item.to"
                    :aria-current="isActive(item.to) ? 'page' : undefined"
                    class="menu-tautan group flex items-start gap-3 sm:gap-5"
                    @click="close"
                  >
                    <span
                      class="menu-muncul mt-2 font-display text-sm font-bold sm:mt-4 sm:text-base"
                      :style="{ '--i': i }"
                    >{{ String(i + 1).padStart(2, '0') }}</span>
                    <span class="flex flex-col">
                      <span class="overflow-hidden pb-2">
                        <span
                          class="menu-baris block"
                          :style="{ '--i': i }"
                        >
                          <span class="menu-label">{{ item.label }}</span>
                        </span>
                      </span>
                      <span
                        class="menu-muncul text-sm font-medium opacity-80 sm:text-base"
                        :style="{ '--i': i }"
                      >{{ item.description }}</span>
                    </span>
                  </NuxtLink>
                </li>
              </ol>
            </nav>

            <div class="space-y-6 lg:col-span-5">
              <div
                aria-hidden="true"
                class="menu-pesawat hidden w-36 sm:block lg:w-44"
              >
                <PeraguIlustrasi name="pesawat" />
              </div>

              <section
                aria-labelledby="menu-jalan-pintas"
                class="space-y-3"
              >
                <h2
                  id="menu-jalan-pintas"
                  class="menu-muncul font-display text-lg font-bold"
                  :style="{ '--i': 1 }"
                >
                  {{ quickTools.title }}
                </h2>
                <ul class="flex flex-wrap gap-2.5">
                  <li
                    v-for="(tool, i) in quickTools.tools"
                    :key="tool.slug"
                    class="menu-muncul"
                    :style="{ '--i': i + 2 }"
                  >
                    <NuxtLink
                      :to="`/alat/${tool.slug}`"
                      class="stiker-tombol inline-flex min-h-11 items-center gap-2 bg-white px-4 py-2 text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-yellow-100"
                      @click="close"
                    >
                      <UIcon
                        :name="tool.icon"
                        class="size-4 shrink-0"
                      />
                      {{ tool.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </section>

              <div
                class="menu-muncul flex flex-wrap items-center gap-2.5"
                :style="{ '--i': 6 }"
              >
                <button
                  type="button"
                  class="stiker-tombol inline-flex min-h-11 items-center gap-2 bg-slate-900 px-4 py-2 text-sm font-semibold text-yellow-100 dark:bg-yellow-100 dark:text-slate-900"
                  @click="openSearch"
                >
                  <UIcon
                    name="i-lucide-search"
                    class="size-4"
                  />
                  Cari
                  <span class="hidden rounded-md border border-current/40 px-1.5 text-xs sm:inline">Ctrl K</span>
                </button>
                <div class="stiker-tombol inline-flex min-h-11 items-center bg-white px-1 dark:bg-slate-900">
                  <UColorModeButton />
                </div>
              </div>
            </div>
          </UContainer>

          <UContainer class="shrink-0 pb-6 text-sm font-medium opacity-80">
            Data kelas tersimpan di perangkat ini saja.
          </UContainer>
        </div>
      </template>
    </UModal>

    <CariPeragu v-model:open="searchOpen" />
  </div>
</template>
