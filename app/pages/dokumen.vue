<script setup lang="ts">
useSeoMeta({
  title: 'Dokumen',
  description: 'Dokumen untuk guru SD di Guru Kampung sedang disiapkan.'
})
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Dokumen"
      description="Kumpulan dokumen untuk guru SD."
      illustration="kartu-nama"
    />

    <!-- Halaman disiapkan lebih dulu; isinya menunggu keputusan pemilik (16 Oktober 2026). Tidak ada isi contoh palsu -->
    <div class="panel-kertas space-y-4 p-8 text-center sm:p-12">
      <p class="font-display text-2xl font-bold text-highlighted">
        Sedang disiapkan
      </p>
      <p class="mx-auto max-w-lg text-toned">
        Halaman ini akan berisi dokumen untuk guru. Sementara itu, dokumen yang bisa langsung dibuat dan dicetak ada di alat Guru Kampung.
      </p>
      <div class="flex flex-wrap justify-center gap-3 pt-2">
        <UButton
          to="/alat/modul-ajar"
          color="neutral"
          icon="i-lucide-file-text"
          class="stiker-tombol bg-white text-slate-900 dark:bg-slate-900 dark:text-yellow-100"
        >
          Generator Modul Ajar
        </UButton>
        <UButton
          to="/alat/surat-edaran"
          color="neutral"
          icon="i-lucide-mail"
          class="stiker-tombol bg-white text-slate-900 dark:bg-slate-900 dark:text-yellow-100"
        >
          Surat Edaran Orang Tua
        </UButton>
        <UButton
          to="/tutorial"
          color="neutral"
          icon="i-lucide-book-open"
          class="stiker-tombol bg-white text-slate-900 dark:bg-slate-900 dark:text-yellow-100"
        >
          Baca tutorial
        </UButton>
      </div>
    </div>
  </div>
</template>
