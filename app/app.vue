<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')

// Sinkronisasi pengaturan ukuran huruf dari localStorage ke <html> (PRD F-08)
useFontSize()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Lexend:wght@400;500;600;700&display=swap'
    }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

useSeoMeta({
  titleTemplate: title => (title ? `${title} · Peragu` : 'Peragu: alat kerja guru SD'),
  description: 'Alat kerja guru SD di peramban: pemilih siswa acak, pembagi kelompok, timer, lembar kerja, dan lainnya. Data kelas tersimpan di perangkat guru, tidak dikirim ke server.'
})
</script>

<template>
  <UApp :toaster="{ position: 'bottom-center' }">
    <div class="latar-panggung min-h-dvh overflow-x-clip">
      <AppHeader class="print:hidden [.projector-mode_&]:hidden" />

      <UMain>
        <NuxtPage v-if="isHome" />
        <UContainer
          v-else
          class="py-8 sm:py-10"
        >
          <NuxtPage />
        </UContainer>
      </UMain>

      <footer class="print:hidden [.projector-mode_&]:hidden pb-8 pt-4">
        <UContainer>
          <div class="panel-kertas flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm text-toned">
            <span>Data kelas, nilai, dan pengaturan tersimpan di perangkat ini saja.</span>
            <ULink
              to="/pengaturan"
              class="font-semibold text-primary underline"
            >Cadangkan data ke file</ULink>
          </div>
        </UContainer>
      </footer>
    </div>
  </UApp>
</template>
