<script setup lang="ts">
import type { NamaIlustrasi } from '~/utils/ilustrasi'

useSeoMeta({
  title: 'Tutorial',
  description: 'Tutorial untuk guru SD: menulis tujuan pembelajaran, menyusun RPP, asesmen awal, membuat rubrik, dan memakai alat Guru Kampung.'
})

const { data: tutorials } = await useAsyncData('tutorial-daftar', () =>
  queryCollection('tutorial').select('path', 'title', 'description', 'kategori', 'urutan', 'durasi', 'ilustrasi', 'terkunci').order('urutan', 'ASC').all()
)

const groups = computed(() => TUTORIAL_CATEGORIES
  .map(cat => ({ ...cat, items: (tutorials.value ?? []).filter(t => t.kategori === cat.id) }))
  .filter(cat => cat.items.length > 0))
</script>

<template>
  <div class="space-y-10">
    <PageTitle
      title="Tutorial"
      description="Panduan langkah demi langkah untuk pekerjaan guru setiap minggu: menyusun perangkat ajar, menilai, dan memakai alat Guru Kampung."
      illustration="pensil"
    />

    <section
      v-for="cat in groups"
      :key="cat.id"
      :aria-labelledby="`kategori-${cat.id}`"
      class="space-y-4"
    >
      <div class="flex items-start gap-3">
        <span class="lencana-pensil inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
          <UIcon
            :name="cat.icon"
            class="size-5"
          />
        </span>
        <div>
          <h2
            :id="`kategori-${cat.id}`"
            class="font-display text-2xl font-bold text-highlighted"
          >
            {{ cat.name }}
          </h2>
          <p class="text-sm text-toned">
            {{ cat.summary }}
          </p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="t in cat.items"
          :key="t.path"
          :to="t.path"
          class="gerak-muncul stiker-kartu flex flex-col bg-white p-5 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-display text-lg font-bold text-highlighted">
              {{ t.title }}
            </h3>
            <div
              v-if="t.ilustrasi"
              class="ilustrasi-kartu w-14 shrink-0"
            >
              <GambarIlustrasi :name="t.ilustrasi as NamaIlustrasi" />
            </div>
          </div>
          <p class="mt-2 flex-1 text-sm text-toned">
            {{ t.description }}
          </p>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span
              v-if="t.durasi"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-3.5"
              />
              {{ t.durasi }}
            </span>
            <span
              v-if="t.terkunci"
              class="lencana-pensil inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
            >
              <UIcon
                name="i-lucide-lock-keyhole"
                class="size-3"
              />
              Sebagian untuk pelanggan
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
