<script setup lang="ts">
const { classId, activeClass, students } = useActiveClass()
const { profile } = useSchoolProfile()

const source = useLocalStorage<'kelas' | 'manual'>('peragu:label:sumber', 'kelas', { initOnMounted: true })
const manualText = useLocalStorage('peragu:label:manual', '', { initOnMounted: true })
const kind = useLocalStorage<'buku' | 'meja'>('peragu:label:jenis', 'buku', { initOnMounted: true })
const subject = useLocalStorage('peragu:label:mapel', '', { initOnMounted: true })

const list = computed(() => {
  if (source.value === 'kelas') {
    return students.value.map((s, idx) => ({
      number: s.number ?? idx + 1,
      name: s.name,
      nickname: s.nickname || s.name
    }))
  }
  return manualText.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map((name, idx) => ({ number: idx + 1, name, nickname: name }))
})

const sourceItems = [
  { value: 'kelas', label: 'Dari Data Kelas' },
  { value: 'manual', label: 'Ketik daftar nama sendiri' }
]

const kindItems = [
  { value: 'buku', label: 'Label buku tulis (2 kolom)' },
  { value: 'meja', label: 'Kartu nama meja lipat dua sisi' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
    <div class="space-y-4 print:hidden">
      <UFormField label="Sumber nama siswa">
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
          :rows="7"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Jenis cetakan">
        <USelect
          v-model="kind"
          :items="kindItems"
          class="w-full"
        />
      </UFormField>

      <UFormField
        v-if="kind === 'buku'"
        label="Mata pelajaran (opsional)"
        hint="Kosongkan kalau ingin ditulis tangan oleh siswa"
      >
        <UInput
          v-model="subject"
          placeholder="Matematika / Bahasa Indonesia"
          class="w-full"
        />
      </UFormField>
    </div>

    <div>
      <UEmpty
        v-if="list.length === 0"
        icon="i-lucide-tag"
        title="Belum ada nama siswa"
        description="Pilih kelas di Data Kelas atau ketik daftar nama secara manual."
      />

      <PrintLayout v-else>
        <div class="p-6">
          <!-- Mode 1: Label buku tulis 2 kolom -->
          <div
            v-if="kind === 'buku'"
            class="grid grid-cols-2 gap-4"
          >
            <div
              v-for="item in list"
              :key="item.number"
              class="break-inside-avoid border-2 border-black p-3 text-sm space-y-1.5"
            >
              <p class="border-b border-black pb-1 text-xs font-bold uppercase tracking-wide">
                {{ profile.schoolName || 'LABEL BUKU PELAJARAN' }}
              </p>
              <p><strong>Nama:</strong> {{ item.name }}</p>
              <p><strong>No. Absen:</strong> {{ item.number }} · <strong>Kelas:</strong> {{ activeClass?.name || '........' }}</p>
              <p><strong>Pelajaran:</strong> {{ subject || '........................' }}</p>
            </div>
          </div>

          <!-- Mode 2: Kartu nama meja lipat segitiga (atas terbalik, bawah tegak) -->
          <div
            v-else
            class="space-y-6"
          >
            <div
              v-for="item in list"
              :key="`meja-${item.number}`"
              class="break-inside-avoid border-2 border-black"
            >
              <!-- Sisi belakang (terbalik 180 derajat supaya terbaca setelah dilipat) -->
              <div class="rotate-180 border-b border-dashed border-black p-6 text-center">
                <p class="text-xs uppercase tracking-widest">
                  {{ activeClass?.name || profile.schoolName || 'KARTU MEJA' }}
                </p>
                <p class="mt-1 text-3xl font-extrabold">
                  {{ item.nickname }}
                </p>
                <p class="text-sm">
                  {{ item.name }} (No. {{ item.number }})
                </p>
              </div>

              <!-- Sisi depan (tegak menghadap guru) -->
              <div class="p-6 text-center">
                <p class="text-xs uppercase tracking-widest">
                  {{ activeClass?.name || profile.schoolName || 'KARTU MEJA' }}
                </p>
                <p class="mt-1 text-3xl font-extrabold">
                  {{ item.nickname }}
                </p>
                <p class="text-sm">
                  {{ item.name }} (No. {{ item.number }})
                </p>
              </div>
            </div>
          </div>
        </div>
      </PrintLayout>
    </div>
  </div>
</template>

