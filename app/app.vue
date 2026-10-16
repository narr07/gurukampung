<script setup lang="ts">
// Sinkronisasi pengaturan ukuran huruf dari localStorage ke <html> (PRD F-08)
useFontSize()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    // Funnel Display dan Funnel Sans diunduh saat build oleh @nuxt/fonts (bawaan Nuxt UI) dari --font-display dan
    // --font-sans di main.css, lalu disajikan dari situs ini sendiri tanpa permintaan ke Google
    { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' }
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
        <!-- Satu NuxtPage saja: dua NuxtPage bergantian (v-if/v-else) membuat beranda terpasang dua kali saat kembali -->
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
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
