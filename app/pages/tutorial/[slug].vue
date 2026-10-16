<script setup lang="ts">
import { findTool } from '~/tools/catalog'

const route = useRoute()

const { data: page } = await useAsyncData(`tutorial-${route.path}`, () =>
  queryCollection('tutorial').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tutorial tidak ditemukan', fatal: true })
}

const { data: surround } = await useAsyncData(`tutorial-${route.path}-sekitar`, () =>
  queryCollectionItemSurroundings('tutorial', route.path, { fields: ['description'] }).order('urutan', 'ASC')
)

// Alat Peragu yang dipakai di tutorial ini, ditampilkan sebagai tautan di akhir halaman
const tools = computed(() => (page.value?.alat ?? []).map(slug => findTool(slug)).filter(t => t !== undefined))

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description
})
</script>

<template>
  <BacaanArtikel
    v-if="page"
    :page="page"
    :surround="surround"
    back-to="/tutorial"
    back-label="Semua tutorial"
  >
    <template #eyebrow>
      Tutorial · {{ tutorialCategory(page.kategori)?.name }}<template v-if="page.durasi">
        · {{ page.durasi }}
      </template>
    </template>

    <template #after>
      <section
        v-if="tools.length"
        aria-labelledby="alat-terkait"
        class="mt-10 space-y-3 border-t-2 border-dashed border-default pt-6 print:hidden"
      >
        <h2
          id="alat-terkait"
          class="font-display text-xl font-bold text-highlighted"
        >
          Alat Peragu untuk tutorial ini
        </h2>
        <ul class="flex flex-wrap gap-2.5">
          <li
            v-for="tool in tools"
            :key="tool.slug"
          >
            <NuxtLink
              :to="`/alat/${tool.slug}`"
              class="stiker-tombol inline-flex min-h-11 items-center gap-2 bg-white px-4 py-2 text-sm font-semibold text-highlighted dark:bg-slate-900"
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
    </template>
  </BacaanArtikel>
</template>
