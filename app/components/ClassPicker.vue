<script setup lang="ts">
// Pilih kelas dari Data Kelas; alat tetap bisa dipakai dengan mengetik nama manual (PRD 5.2)
const model = defineModel<string | undefined>()
const { classes, status } = useClasses()
const { addSampleClass, creating } = useSampleClass()

async function trySample() {
  const record = await addSampleClass()
  if (record) model.value = record.id
}

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
    <!-- Belum ada kelas: guru bisa langsung mencoba alat dengan kelas contoh tanpa pindah ke Data Kelas -->
    <div
      v-else-if="items.length === 0"
      class="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <UButton
        icon="i-lucide-flask-conical"
        color="neutral"
        :loading="creating"
        class="stiker-tombol bg-white text-slate-900 hover:bg-yellow-100 dark:bg-slate-900 dark:text-yellow-100"
        @click="trySample"
      >
        Isi kelas contoh
      </UButton>
      <p class="text-sm text-muted">
        24 siswa dummy beserta nilai dan absensi. Atau
        <ULink
          to="/kelas"
          class="text-primary underline"
        >isi Data Kelas</ULink>
        dengan siswa Anda sendiri.
      </p>
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
