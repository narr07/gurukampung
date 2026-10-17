<script setup lang="ts">
import type { ContentNavigationItem, TocLink } from '@nuxt/content'
import type { NamaIlustrasi } from '~/utils/ilustrasi'

// Kerangka halaman bacaan (tutorial dan blog). Termasuk meja kerja: tenang, tanpa gerak dekoratif (DESIGN.md).
// Ilustrasi stiker dari frontmatter `ilustrasi` tampil di samping judul
defineProps<{
  page: { title: string, description?: string, ilustrasi?: string, body?: { toc?: { links?: TocLink[] } } }
  surround?: ContentNavigationItem[] | null
  backTo: string
  backLabel: string
}>()
</script>

<template>
  <div class="space-y-6">
    <UButton
      :to="backTo"
      color="neutral"
      variant="outline"
      size="sm"
      icon="i-lucide-arrow-left"
      class="stiker-tombol bg-white print:hidden dark:bg-slate-900"
    >
      {{ backLabel }}
    </UButton>

    <div class="grid gap-8 lg:grid-cols-12">
      <article class="panel-kertas min-w-0 p-5 sm:p-8 lg:col-span-9 lg:p-10">
        <header class="mb-8 flex items-start justify-between gap-6 border-b-2 border-dashed border-default pb-6">
          <div class="min-w-0 space-y-3">
            <p class="text-sm font-semibold text-muted">
              <slot name="eyebrow" />
            </p>
            <h1 class="font-display text-3xl font-extrabold text-balance text-highlighted sm:text-4xl">
              {{ page.title }}
            </h1>
            <p
              v-if="page.description"
              class="text-lg text-toned"
            >
              {{ page.description }}
            </p>
          </div>
          <div
            v-if="page.ilustrasi"
            class="ilustrasi-judul hidden w-24 shrink-0 sm:block lg:w-28"
          >
            <GambarIlustrasi :name="page.ilustrasi as NamaIlustrasi" />
          </div>
        </header>

        <ContentRenderer
          :value="page"
          class="bacaan"
        />

        <slot name="after" />
      </article>

      <aside
        v-if="page.body?.toc?.links?.length"
        class="hidden lg:col-span-3 lg:block print:hidden"
      >
        <UContentToc
          :links="page.body.toc.links"
          title="Di halaman ini"
          highlight
          highlight-color="secondary"
          class="top-24 rounded-3xl"
        />
      </aside>
    </div>

    <UContentSurround
      v-if="surround?.length"
      :surround="surround"
      :prev-icon="'i-lucide-arrow-left'"
      :next-icon="'i-lucide-arrow-right'"
      class="print:hidden"
    />
  </div>
</template>
