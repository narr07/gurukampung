<script setup lang="ts">
import type { NamaIlustrasi } from '~/utils/ilustrasi'

useSeoMeta({
  title: 'Blog',
  description: 'Kabar pembaruan Guru Kampung dan catatan tentang cara alat-alatnya dibuat untuk guru SD.'
})

const { data: posts } = await useAsyncData('blog-daftar', () =>
  queryCollection('blog').select('path', 'title', 'description', 'date', 'penulis', 'ilustrasi', 'terkunci').order('date', 'DESC').all()
)
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Blog"
      description="Kabar pembaruan Guru Kampung dan catatan tentang cara alat-alatnya dibuat."
      illustration="pesawat"
    />

    <ol class="grid gap-5 md:grid-cols-2">
      <li
        v-for="post in posts"
        :key="post.path"
        class="gerak-muncul"
      >
        <NuxtLink
          :to="post.path"
          class="stiker-kartu flex h-full flex-col bg-white p-6 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between gap-4">
            <time
              :datetime="post.date"
              class="text-sm font-semibold text-muted"
            >
              {{ formatTanggal(post.date) }}
            </time>
            <div
              v-if="post.ilustrasi"
              class="ilustrasi-kartu -mt-1 w-16 shrink-0"
            >
              <GambarIlustrasi :name="post.ilustrasi as NamaIlustrasi" />
            </div>
          </div>
          <h2 class="mt-2 font-display text-2xl font-bold text-highlighted">
            {{ post.title }}
          </h2>
          <p class="mt-2 flex-1 text-toned">
            {{ post.description }}
          </p>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-muted">{{ post.penulis }}</span>
            <span
              v-if="post.terkunci"
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
      </li>
    </ol>
  </div>
</template>
