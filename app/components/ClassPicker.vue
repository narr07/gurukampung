<script setup lang="ts">
// Pilih kelas dari Data Kelas; alat tetap bisa dipakai dengan mengetik nama manual (PRD 5.2)
const model = defineModel<string | undefined>()
const { classes, status } = useClasses()

const items = computed(() => classes.value.map(c => ({ value: c.id, label: `${c.name} (${c.students.length} siswa)` })))
</script>

<template>
  <div>
    <USkeleton
      v-if="status === 'pending'"
      class="h-9 w-56"
    />
    <UAlert
      v-else-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Data kelas tidak bisa dibaca dari perangkat ini."
    />
    <div
      v-else-if="items.length === 0"
      class="text-sm text-muted"
    >
      Belum ada kelas.
      <ULink
        to="/kelas"
        class="text-primary underline"
      >Isi Data Kelas</ULink>
      supaya nama siswa bisa dipakai di alat ini.
    </div>
    <USelect
      v-else
      v-model="model"
      :items="items"
      placeholder="Pilih kelas"
      aria-label="Kelas"
      class="w-64"
    />
  </div>
</template>
