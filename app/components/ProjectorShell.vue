<script setup lang="ts">
// Mode proyektor: layar penuh, latar polos, teks dua kali lebih besar, tombol keluar selalu terlihat (DESIGN.md).
// Layar dijaga tetap menyala selama mode ini aktif
const target = useTemplateRef<HTMLElement>('target')
const { isFullscreen, enter, exit, isSupported } = useFullscreen(target)
const wakeLock = reactive(useWakeLock())
// isSupported selalu false saat prerender; tombol baru ditampilkan setelah mount supaya HTML-nya sama
const mounted = useMounted()

watch(isFullscreen, async (on) => {
  // Kelas Tailwind memakai rem, jadi yang diperbesar adalah ukuran huruf dasar di <html>
  document.documentElement.classList.toggle('projector-mode', on)
  if (!wakeLock.isSupported) return
  if (on) await wakeLock.request('screen')
  else await wakeLock.release()
})

onBeforeUnmount(() => document.documentElement.classList.remove('projector-mode'))
</script>

<template>
  <div
    ref="target"
    :class="isFullscreen ? 'bg-default overflow-auto p-6 sm:p-10' : ''"
  >
    <div class="flex justify-end gap-2 mb-4 print:hidden">
      <UButton
        v-if="mounted && isSupported && !isFullscreen"
        icon="i-lucide-projector"
        color="neutral"
        variant="outline"
        @click="enter"
      >
        Mode proyektor
      </UButton>
      <UButton
        v-if="isFullscreen"
        icon="i-lucide-minimize"
        color="neutral"
        variant="solid"
        size="xl"
        class="fixed top-4 right-4 z-10"
        @click="exit"
      >
        Keluar (Esc)
      </UButton>
    </div>

    <slot :projector="isFullscreen" />
  </div>
</template>

<style>
html.projector-mode {
  font-size: 200%;
}
</style>
