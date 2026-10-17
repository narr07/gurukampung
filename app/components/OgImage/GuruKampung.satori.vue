<script setup lang="ts">
// Template OG image Guru Kampung (nuxt-og-image, renderer Satori): kartu stiker putih bergaris tinta di atas gradien
// langit-kuning, tanda pensil-rumah, judul halaman, dan alamat situs. Dibuat saat build saja (ogImage.zeroRuntime).
// Satori hanya mendukung flexbox dan gaya inline, jadi tidak memakai kelas Tailwind
const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Guru Kampung',
  description: 'Alat kerja guru SD di peramban'
})

const tanda = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="138 72 236 396"><path d="M150 270 H362 V456 H150 Z" fill="#0f172b" stroke="#0f172b" stroke-width="24" stroke-linejoin="round"/><path d="M150 250 Q185.3 286 220.7 250 Q256 286 291.3 250 Q326.7 286 362 250 V436 H150 Z" fill="#ffdf20" stroke="#0f172b" stroke-width="24" stroke-linejoin="round"/><path d="M218 436 V372 A38 38 0 0 1 294 372 V436 Z" fill="#0f172b"/><path d="M150 250 L256 84 L362 250 Q326.7 286 291.3 250 Q256 286 220.7 250 Q185.3 286 150 250 Z" fill="#fef9c2" stroke="#0f172b" stroke-width="24" stroke-linejoin="round"/><path d="M256 84 L217.6 144 H294.4 Z" fill="#0f172b"/></svg>`)}`

// Domain tampil dari site.url di nuxt.config.ts, jadi ikut berubah saat pindah domain
const domain = computed(() => new URL(useSiteConfig().url).host)

const judul = computed(() => (props.title.length > 70 ? `${props.title.slice(0, 67)}…` : props.title))
const deskripsi = computed(() => (props.description.length > 110 ? `${props.description.slice(0, 107)}…` : props.description))
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: center; width: 1200px; height: 600px; background-image: linear-gradient(135deg, #74d4ff 0%, #fef9c2 55%, #ffdf20 100%);">
    <div style="display: flex; align-items: center; gap: 48px; width: 980px; height: 490px; margin-top: -12px; padding-left: 56px; padding-right: 56px; background-color: #ffffff; border: 6px solid #0f172b; border-radius: 48px; box-shadow: 0 14px 0 0 #0f172b;">
      <img
        :src="tanda"
        width="150"
        height="252"
        style="flex-shrink: 0;"
      >
      <div style="display: flex; flex-direction: column; flex: 1; gap: 16px;">
        <!-- Judul paling banyak 3 baris dan deskripsi 2 baris; sisanya dipotong dengan … supaya kartu tidak keluar dari gambar -->
        <div style="display: block; font-size: 54px; font-weight: 800; line-height: 1.08; color: #0f172b; line-clamp: 3; overflow: hidden;">
          {{ judul }}
        </div>
        <div
          v-if="deskripsi"
          style="display: block; font-size: 26px; line-height: 1.35; color: #334155; line-clamp: 2; overflow: hidden;"
        >
          {{ deskripsi }}
        </div>
        <div style="display: flex; align-items: center; gap: 14px; margin-top: 12px;">
          <div style="display: flex; padding: 8px 22px; font-size: 26px; font-weight: 800; color: #0f172b; background-color: #ffdf20; border: 4px solid #0f172b; border-radius: 999px;">
            Guru Kampung
          </div>
          <div style="display: flex; font-size: 26px; font-weight: 600; color: #193cb8;">
            {{ domain }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
