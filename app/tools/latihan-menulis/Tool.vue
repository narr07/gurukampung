<script setup lang="ts">
const title = useLocalStorage('gurukampung:menulis:judul', 'Latihan Menulis Halus', { initOnMounted: true })
const lineType = useLocalStorage<'tiga' | 'empat'>('gurukampung:menulis:garis', 'empat', { initOnMounted: true })
const letterStyle = useLocalStorage<'cetak' | 'sambung'>('gurukampung:menulis:gaya', 'cetak', { initOnMounted: true })
const rowMode = useLocalStorage<'penuh' | 'mandiri'>('gurukampung:menulis:baris', 'penuh', { initOnMounted: true })
const rawLines = useLocalStorage(
  'gurukampung:menulis:teks',
  'Aa Bb Cc Dd Ee\nFf Gg Hh Ii Jj\nsaya suka membaca buku\nibu pergi ke pasar pagi',
  { initOnMounted: true }
)

const lines = computed(() => {
  const list = rawLines.value.split('\n').map(l => l.trim()).filter(Boolean)
  return list.length > 0 ? list : ['Aa Bb Cc Dd Ee']
})

function repeatTraceText(line: string) {
  if (rowMode.value === 'mandiri') return line
  if (line.length >= 22) return line
  const repeatCount = Math.max(1, Math.floor(26 / (line.length + 2)))
  return Array(repeatCount).fill(line).join('   ')
}

const lineTypeItems = [
  { value: 'empat', label: 'Garis 4 (buku halus atas-tengah-bawah)' },
  { value: 'tiga', label: 'Garis 3 (atas-tengah-bawah)' }
]

const styleItems = [
  { value: 'cetak', label: 'Huruf cetak lepas' },
  { value: 'sambung', label: 'Huruf miring / tegak bersambung' }
]

const rowModeItems = [
  { value: 'penuh', label: 'Titik-titik penuh satu baris' },
  { value: 'mandiri', label: 'Contoh di kiri, sisanya latihan mandiri' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
    <div class="space-y-4 print:hidden">
      <UFormField label="Judul lembar kerja">
        <UInput
          v-model="title"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Jenis garis buku">
        <USelect
          v-model="lineType"
          :items="lineTypeItems"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bentuk huruf">
        <USelect
          v-model="letterStyle"
          :items="styleItems"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Pola latihan per baris">
        <USelect
          v-model="rowMode"
          :items="rowModeItems"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Isi baris tulisan"
        hint="Satu baris teks menghasilkan dua baris latihan di kertas"
      >
        <UTextarea
          v-model="rawLines"
          :rows="8"
          class="w-full"
        />
      </UFormField>
    </div>

    <PrintLayout>
      <div class="p-6">
        <PrintHeader :title="title" />

        <div class="mb-5 grid grid-cols-3 gap-4 text-sm">
          <span>Nama: ____________________</span>
          <span>Kelas: ________</span>
          <span>Tanggal: ____________</span>
        </div>

        <div class="space-y-5">
          <template
            v-for="(line, idx) in lines"
            :key="idx"
          >
            <div
              v-for="copy in 2"
              :key="`${idx}-${copy}`"
              class="break-inside-avoid"
            >
              <svg
                viewBox="0 0 720 68"
                class="w-full h-16"
                role="img"
                :aria-label="`Baris latihan: ${line}`"
              >
                <!-- Garis bantu atas -->
                <line
                  x1="0"
                  y1="10"
                  x2="720"
                  y2="10"
                  stroke="#64748b"
                  stroke-width="1"
                  stroke-dasharray="4 3"
                />
                <!-- Garis tengah atas -->
                <line
                  x1="0"
                  y1="26"
                  x2="720"
                  y2="26"
                  stroke="#334155"
                  stroke-width="1"
                />
                <!-- Garis dasar tempat huruf berpijak -->
                <line
                  x1="0"
                  y1="46"
                  x2="720"
                  y2="46"
                  stroke="#000000"
                  stroke-width="1.5"
                />
                <!-- Garis bawah ekor huruf (g, j, p, y) pada garis 4 -->
                <line
                  v-if="lineType === 'empat'"
                  x1="0"
                  y1="62"
                  x2="720"
                  y2="62"
                  stroke="#64748b"
                  stroke-width="1"
                  stroke-dasharray="4 3"
                />

                <!-- Huruf putus-putus untuk ditebalkan siswa -->
                <text
                  x="12"
                  y="44"
                  font-size="31"
                  :font-style="letterStyle === 'sambung' ? 'italic' : 'normal'"
                  :font-family="letterStyle === 'sambung' ? 'Georgia, serif' : 'Lexend, sans-serif'"
                  fill="none"
                  stroke="#475569"
                  stroke-width="1.2"
                  stroke-dasharray="2.2 2.2"
                  letter-spacing="2"
                >{{ copy === 1 ? repeatTraceText(line) : (rowMode === 'mandiri' ? line : repeatTraceText(line)) }}</text>
              </svg>
            </div>
          </template>
        </div>
      </div>
    </PrintLayout>
  </div>
</template>

