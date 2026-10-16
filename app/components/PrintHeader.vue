<script setup lang="ts">
// Kop sederhana di hasil cetak, dari profil sekolah di Pengaturan. Kosong kalau profil belum diisi
defineProps<{
  title: string
  subtitle?: string
}>()

const { profile } = useSchoolProfile()
</script>

<template>
  <div class="mb-5 border-b-2 border-black pb-2">
    <p
      v-if="profile.schoolName"
      class="text-sm font-semibold"
    >
      {{ profile.schoolName }}<span v-if="profile.academicYear"> · Tahun Ajaran {{ profile.academicYear }}</span>
    </p>
    <h2 class="text-xl font-bold">
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      class="text-sm"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
