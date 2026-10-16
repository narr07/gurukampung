<script setup lang="ts">
import { exportBackup, importBackup, useDb } from '~/db'
import { backupFileName, checkBackup, type SchoolProfile } from '~/utils/backup'
import type { FontSizeScale } from '~/composables/useFontSize'

useSeoMeta({ title: 'Pengaturan' })

const toast = useToast()
const colorMode = useColorMode()
const { fontSize } = useFontSize()
const { profile, status, save } = useSchoolProfile()

// Catat kapan terakhir guru mengunduh cadangan untuk pengingat 30 hari (ADR 001)
const lastBackupAt = useLocalStorage<string | null>('gurukampung:cadangan-terakhir', null, { initOnMounted: true })
const daysSinceBackup = computed(() => {
  if (!lastBackupAt.value) return null
  const ms = Date.now() - new Date(lastBackupAt.value).getTime()
  return Number.isFinite(ms) ? Math.floor(ms / 86_400_000) : null
})

const form = reactive<SchoolProfile>({ ...EMPTY_PROFILE })
watch(profile, p => Object.assign(form, p), { immediate: true })

const isSaving = ref(false)
async function saveProfile() {
  isSaving.value = true
  try {
    await save({ ...form })
    toast.add({ title: 'Profil sekolah tersimpan', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Profil gagal disimpan', description: 'Penyimpanan peramban mungkin diblokir atau penuh.', color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    isSaving.value = false
  }
}

// Cadangan: satu file JSON berisi semua kelas, pengaturan, dan data kerja alat
async function downloadBackup() {
  try {
    const data = await exportBackup()
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = backupFileName()
    a.click()
    URL.revokeObjectURL(url)
    lastBackupAt.value = new Date().toISOString()
    toast.add({ title: 'Cadangan diunduh', description: a.download, color: 'success', icon: 'i-lucide-download' })
  } catch {
    toast.add({ title: 'Cadangan gagal dibuat', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const pendingRestore = shallowRef<Awaited<ReturnType<typeof exportBackup>> | null>(null)
const restoreOpen = computed({
  get: () => pendingRestore.value !== null,
  set: (open: boolean) => {
    if (!open) pendingRestore.value = null
  }
})

async function onFileChosen(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const result = checkBackup(JSON.parse(await file.text()))
    if (!result.ok) {
      toast.add({ title: 'File tidak bisa dipulihkan', description: result.reason, color: 'error', icon: 'i-lucide-circle-alert' })
      return
    }
    pendingRestore.value = result.data
  } catch {
    toast.add({ title: 'File tidak bisa dibaca', description: 'Pilih file cadangan .json dari Guru Kampung.', color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function confirmRestore() {
  if (!pendingRestore.value) return
  try {
    await importBackup(pendingRestore.value)
    lastBackupAt.value = new Date().toISOString()
    toast.add({ title: 'Data dipulihkan', description: `${pendingRestore.value.classes.length} kelas dari cadangan.`, color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Pemulihan gagal', description: 'Data lama tidak berubah.', color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    pendingRestore.value = null
  }
}

const wipeOpen = ref(false)
async function wipeAll() {
  await useDb().delete()
  wipeOpen.value = false
  reloadNuxtApp({ path: '/pengaturan' })
}

const fields: { key: keyof SchoolProfile, label: string, placeholder: string }[] = [
  { key: 'schoolName', label: 'Nama sekolah', placeholder: 'SD Negeri 1 ...' },
  { key: 'academicYear', label: 'Tahun ajaran', placeholder: '2026/2027' },
  { key: 'teacherName', label: 'Nama guru', placeholder: 'Nama lengkap dengan gelar' },
  { key: 'teacherNip', label: 'NIP guru', placeholder: 'Kosongkan kalau tidak ada' },
  { key: 'principalName', label: 'Nama kepala sekolah', placeholder: 'Nama lengkap dengan gelar' },
  { key: 'principalNip', label: 'NIP kepala sekolah', placeholder: 'Kosongkan kalau tidak ada' }
]

const themeItems = [
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
  { value: 'system', label: 'Ikuti perangkat' }
]

const fontSizeItems: { value: FontSizeScale, label: string }[] = [
  { value: 'normal', label: 'Standar (100%)' },
  { value: 'besar', label: 'Besar (112%)' },
  { value: 'sangat-besar', label: 'Sangat besar (125%)' }
]
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Pengaturan"
      description="Profil sekolah dipakai untuk kop cetak, sertifikat, dan surat. Semua data hanya tersimpan di perangkat ini."
      badge="Perangkat & Profil"
      icon="i-lucide-settings"
      illustration="gembok-tas"
    />

    <UPageGrid>
      <!-- Satu-satunya kartu 2×2 di halaman ini: profil sekolah (DESIGN.md) -->
      <UCard class="sm:col-span-6 lg:col-span-7 lg:row-span-2">
        <template #header>
          <h2 class="font-display text-lg font-bold text-highlighted">
            Profil sekolah
          </h2>
        </template>
        <USkeleton
          v-if="status === 'pending'"
          class="h-48 w-full"
        />
        <UAlert
          v-else-if="status === 'error'"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Profil tidak bisa dibaca dari perangkat ini."
          description="Peramban mungkin dalam mode penyamaran atau penyimpanannya diblokir."
        />
        <form
          v-else
          class="grid gap-4 sm:grid-cols-2"
          @submit.prevent="saveProfile"
        >
          <UFormField
            v-for="f in fields"
            :key="f.key"
            :label="f.label"
            :name="f.key"
          >
            <UInput
              v-model="form[f.key]"
              :placeholder="f.placeholder"
              class="w-full"
            />
          </UFormField>
          <div class="sm:col-span-2">
            <UButton
              type="submit"
              icon="i-lucide-save"
              :loading="isSaving"
            >
              Simpan profil
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Tampilan: tema terang/gelap dan ukuran huruf (PRD F-08) -->
      <UCard class="sm:col-span-6 lg:col-span-5">
        <template #header>
          <h2 class="font-display text-lg font-bold text-highlighted">
            Tampilan dan ukuran huruf
          </h2>
        </template>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Tema warna">
            <USelect
              v-model="colorMode.preference"
              :items="themeItems"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Ukuran huruf">
            <USelect
              v-model="fontSize"
              :items="fontSizeItems"
              class="w-full"
            />
          </UFormField>
        </div>
        <p class="mt-3 text-sm text-muted">
          Untuk tampilan di depan kelas dengan ukuran huruf dua kali lipat, gunakan tombol Mode proyektor di dalam alat.
        </p>
      </UCard>

      <UCard class="sm:col-span-3 lg:col-span-5">
        <template #header>
          <h2 class="font-display text-lg font-bold text-highlighted">
            Cadangan data
          </h2>
        </template>
        <p class="text-sm text-muted">
          Unduh semua kelas, nilai, absensi, dan pengaturan sebagai satu file. Simpan file itu di Google Drive atau flashdisk, lalu pulihkan di perangkat lain.
        </p>
        <UAlert
          v-if="daysSinceBackup !== null && daysSinceBackup >= 30"
          class="mt-3"
          color="warning"
          variant="subtle"
          icon="i-lucide-clock-alert"
          :description="`Sudah ${daysSinceBackup} hari sejak cadangan terakhir. Unduh cadangan terbaru supaya data tetap aman.`"
        />
        <p
          v-else-if="lastBackupAt"
          class="mt-2 text-xs text-muted"
        >
          Cadangan terakhir: {{ new Date(lastBackupAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) }}
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton
            icon="i-lucide-download"
            @click="downloadBackup"
          >
            Unduh cadangan
          </UButton>
          <UButton
            icon="i-lucide-upload"
            color="neutral"
            variant="outline"
            @click="fileInput?.click()"
          >
            Pulihkan dari file
          </UButton>
          <input
            ref="fileInput"
            type="file"
            accept="application/json,.json"
            class="sr-only"
            aria-label="Pilih file cadangan"
            @change="onFileChosen"
          >
        </div>
      </UCard>

      <UCard class="sm:col-span-3 lg:col-span-12">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-lg font-bold text-highlighted">
              Hapus semua data
            </h2>
            <p class="mt-1 text-sm text-muted">
              Menghapus semua kelas, nilai, absensi, dan pengaturan dari perangkat ini. Unduh cadangan dulu kalau masih dibutuhkan.
            </p>
          </div>
          <UButton
            color="error"
            variant="outline"
            icon="i-lucide-trash-2"
            @click="wipeOpen = true"
          >
            Hapus semua data
          </UButton>
        </div>
      </UCard>
    </UPageGrid>

    <UModal
      v-model:open="restoreOpen"
      title="Pulihkan dari cadangan?"
      :description="`Semua data di perangkat ini akan diganti dengan isi cadangan (${pendingRestore?.classes.length ?? 0} kelas, dibuat ${pendingRestore ? new Date(pendingRestore.exportedAt).toLocaleString('id-ID') : ''}).`"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="restoreOpen = false"
          >
            Batal
          </UButton>
          <UButton
            icon="i-lucide-upload"
            @click="confirmRestore"
          >
            Ganti dengan cadangan
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="wipeOpen"
      title="Hapus semua data?"
      description="Semua kelas, siswa, dan pengaturan di perangkat ini akan hilang permanen."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="wipeOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            @click="wipeAll"
          >
            Hapus permanen
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
