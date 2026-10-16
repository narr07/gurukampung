<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  badge?: string
  icon?: string
  illustration?: 'pensil' | 'penggaris' | 'dadu' | 'jam' | 'pesawat' | 'kartu-nama' | 'bintang' | 'gembok-tas'
}>()
</script>

<template>
  <header class="panel-judul panel-kertas p-5 sm:p-7">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-3">
        <div
          v-if="badge || icon"
          class="inline-flex items-center gap-2"
        >
          <span
            v-if="icon"
            class="lencana-pensil inline-flex size-9 items-center justify-center rounded-xl"
          >
            <UIcon
              :name="icon"
              class="size-5"
            />
          </span>
          <span
            v-if="badge"
            class="lencana-pensil rounded-full px-3 py-0.5 text-xs tracking-wide"
          >
            {{ badge }}
          </span>
        </div>

        <div>
          <!-- Motif identitas: judul Funnel Display dengan coretan tinta merah guru seperti di beranda (DESIGN.md) -->
          <h1 class="font-display relative inline-block pb-2 text-2xl sm:text-4xl font-extrabold text-highlighted">
            <span>{{ title }}</span>
            <svg
              viewBox="0 0 320 20"
              fill="none"
              aria-hidden="true"
              class="pointer-events-none absolute -bottom-1 left-0 h-3.5 w-full"
              preserveAspectRatio="none"
            >
              <path
                class="coretan-judul"
                pathLength="1"
                d="M4 12C82 4 218 4 316 11C224 17 98 18 18 15"
                stroke="var(--ui-secondary)"
                stroke-width="5"
                stroke-linecap="round"
              />
            </svg>
          </h1>
        </div>

        <p
          v-if="description"
          class="max-w-2xl text-sm sm:text-base text-toned"
        >
          {{ description }}
        </p>
      </div>

      <div
        v-if="illustration"
        class="ilustrasi-judul hidden w-28 shrink-0 -rotate-2 sm:block lg:w-36"
      >
        <PeraguIlustrasi :name="illustration" />
      </div>
    </div>
  </header>
</template>
