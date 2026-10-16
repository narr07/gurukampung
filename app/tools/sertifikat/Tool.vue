<script setup lang="ts">
const { classId, students } = useActiveClass()
const { profile } = useSchoolProfile()

const source = useLocalStorage<'kelas' | 'manual'>('gurukampung:sertifikat:sumber', 'kelas', { initOnMounted: true })
const manualText = useLocalStorage('gurukampung:sertifikat:manual', '', { initOnMounted: true })
const form = useLocalStorage('gurukampung:sertifikat:isi', {
  heading: 'PIAGAM PENGHARGAAN',
  intro: 'Diberikan kepada',
  body: 'atas partisipasinya dalam kegiatan belajar dengan penuh semangat.',
  place: '',
  date: '',
  signerRole: 'Kepala Sekolah'
}, { initOnMounted: true, mergeDefaults: true })
const style = useLocalStorage<'garis-ganda' | 'garis-tebal' | 'sudut'>('gurukampung:sertifikat:gaya', 'garis-ganda', { initOnMounted: true })

const names = computed(() =>
  source.value === 'kelas'
    ? students.value.map(s => s.name)
    : manualText.value.split('\n').map(n => n.trim()).filter(Boolean)
)

// Satu sertifikat per siswa; pratinjau di layar menampilkan yang pertama saja supaya ringan
const previewOnly = ref(true)
const shown = computed(() => (previewOnly.value ? names.value.slice(0, 1) : names.value))

function printAll() {
  previewOnly.value = false
  nextTick(() => {
    window.print()
    previewOnly.value = true
  })
}

const signerName = computed(() => profile.value.principalName)
const signerNip = computed(() => profile.value.principalNip)

const sourceItems = [
  { value: 'kelas', label: 'Dari Data Kelas' },
  { value: 'manual', label: 'Ketik nama sendiri' }
]
// Bingkai dibuat dengan CSS hitam-putih supaya jelas saat dicetak tanpa warna (DESIGN.md)
const corner = (pos: string) => `linear-gradient(#000, #000) ${pos} / 60px 6px no-repeat, linear-gradient(#000, #000) ${pos} / 6px 60px no-repeat`
const FRAMES = {
  'garis-ganda': { border: '6px double #000', outline: '2px solid #000', outlineOffset: '-18px' },
  'garis-tebal': { border: '10px solid #000' },
  'sudut': { border: '1px solid #000', background: ['top left', 'top right', 'bottom left', 'bottom right'].map(corner).join(', ') }
}

const styleItems = [
  { value: 'garis-ganda', label: 'Bingkai garis ganda' },
  { value: 'garis-tebal', label: 'Bingkai garis tebal' },
  { value: 'sudut', label: 'Hiasan sudut' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
    <div class="space-y-4 print:hidden">
      <UFormField label="Nama penerima">
        <USelect
          v-model="source"
          :items="sourceItems"
          class="w-full"
        />
      </UFormField>
      <ClassPicker
        v-if="source === 'kelas'"
        v-model="classId"
      />
      <UFormField
        v-else
        label="Daftar nama"
        hint="Satu nama per baris"
      >
        <UTextarea
          v-model="manualText"
          :rows="6"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Judul">
        <UInput
          v-model="form.heading"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Kalimat pembuka">
        <UInput
          v-model="form.intro"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Isi">
        <UTextarea
          v-model="form.body"
          :rows="3"
          class="w-full"
        />
      </UFormField>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Tempat">
          <UInput
            v-model="form.place"
            placeholder="Majalengka"
          />
        </UFormField>
        <UFormField label="Tanggal">
          <UInput
            v-model="form.date"
            placeholder="15 Oktober 2026"
          />
        </UFormField>
      </div>
      <UFormField
        label="Jabatan penanda tangan"
        :hint="signerName ? '' : 'Nama diambil dari Pengaturan'"
      >
        <UInput
          v-model="form.signerRole"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Gaya bingkai">
        <USelect
          v-model="style"
          :items="styleItems"
          class="w-full"
        />
      </UFormField>
      <UAlert
        v-if="!signerName"
        color="warning"
        variant="subtle"
        icon="i-lucide-info"
        description="Nama kepala sekolah belum diisi. Isi di Pengaturan supaya muncul di bawah tanda tangan."
      />
      <UButton
        block
        icon="i-lucide-printer"
        :disabled="names.length === 0"
        @click="printAll"
      >
        Cetak {{ names.length }} sertifikat
      </UButton>
    </div>

    <div>
      <UEmpty
        v-if="names.length === 0"
        icon="i-lucide-award"
        title="Belum ada nama penerima"
        description="Pilih kelas yang sudah berisi siswa, atau ketik daftar nama sendiri."
      />
      <template v-else>
        <p class="mb-2 text-sm text-muted print:hidden">
          Pratinjau sertifikat pertama. Kertas A4 mendatar disarankan; atur di pilihan kertas di bawah.
        </p>
        <PrintLayout>
          <div
            v-for="(name, i) in shown"
            :key="i"
            class="relative flex min-h-[170mm] flex-col items-center justify-center p-12 text-center"
            :class="i > 0 ? 'break-before-page' : ''"
            :style="FRAMES[style]"
          >
            <p class="text-3xl font-bold tracking-wide">
              {{ form.heading }}
            </p>
            <p class="mt-8 text-lg">
              {{ form.intro }}
            </p>
            <p class="mt-3 border-b-2 border-black px-10 pb-1 text-4xl font-bold">
              {{ name }}
            </p>
            <p class="mt-6 max-w-xl text-lg">
              {{ form.body }}
            </p>
            <div class="mt-12 self-end text-center">
              <p>{{ [form.place, form.date].filter(Boolean).join(', ') }}</p>
              <p>{{ form.signerRole }}</p>
              <p class="mt-16 font-bold underline">
                {{ signerName || '..............................' }}
              </p>
              <p v-if="signerNip">
                NIP {{ signerNip }}
              </p>
            </div>
          </div>
        </PrintLayout>
      </template>
    </div>
  </div>
</template>
