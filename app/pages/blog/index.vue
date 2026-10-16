<script setup lang="ts">
useSeoMeta({
  title: 'Blog',
  description: 'Kabar pembaruan Guru Kampung dan catatan tentang cara alat-alatnya dibuat untuk guru SD.'
})

const { data: posts } = await useAsyncData('blog-daftar', () =>
  queryCollection('blog').select('path', 'title', 'description', 'date', 'penulis').order('date', 'DESC').all()
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
          <time
            :datetime="post.date"
            class="text-sm font-semibold text-muted"
          >
            {{ formatTanggal(post.date) }}
          </time>
          <h2 class="mt-2 font-display text-2xl font-bold text-highlighted">
            {{ post.title }}
          </h2>
          <p class="mt-2 flex-1 text-toned">
            {{ post.description }}
          </p>
          <span class="mt-4 text-sm font-medium text-muted">{{ post.penulis }}</span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>
