<script setup lang="ts">
import { generateCrossword, parseCrosswordLines } from '~/utils/fase3'

const title = useLocalStorage('peragu:tts:judul', 'Teka-Teki Silang Pengetahuan Alam', { initOnMounted: true })
const rawInput = useLocalStorage(
  'peragu:tts:daftar',
  'FOTOSINTESIS: Proses tumbuhan hijau memasak makanan dengan bantuan cahaya matahari\nKLOROFIL: Zat hijau daun pada tumbuhan\nAKAR: Bagian tumbuhan yang menyerap air dan mineral dari dalam tanah\nSTOMATA: Mulut daun tempat pertukaran udara\nOKSIGEN: Gas yang dihasilkan tumbuhan dan dihirup manusia\nBATANG: Bagian tumbuhan yang menopang dahan dan menyalurkan air',
  { initOnMounted: true }
)
const withKey = useLocalStorage('peragu:tts:kunci', true, { initOnMounted: true })

const entries = computed(() => parseCrosswordLines(rawInput.value))
const puzzle = computed(() => generateCrossword(entries.value))

const acrossClues = computed(() => puzzle.value.placed.filter(p => p.direction === 'mendatar'))
const downClues = computed(() => puzzle.value.placed.filter(p => p.direction === 'menurun'))
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[22rem_1fr]">
    <div class="space-y-4 print:hidden">
      <UFormField label="Judul lembar TTS">
        <UInput
          v-model="title"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Daftar kata dan petunjuk"
        hint="Format: KATA: Petunjuk soal (satu baris per kata)"
      >
        <UTextarea
          v-model="rawInput"
          :rows="11"
          class="w-full font-mono text-xs"
        />
      </UFormField>

      <USwitch
        v-model="withKey"
        label="Sertakan kunci jawaban di halaman terpisah"
      />

      <UAlert
        v-if="puzzle.unplaced.length > 0"
        color="warning"
        variant="subtle"
        icon="i-lucide-info"
        :description="`Belum menemukan persilangan huruf untuk: ${puzzle.unplaced.map(u => u.word).join(', ')}. Tambahkan kata lain yang memiliki huruf sama.`"
      />
    </div>

    <div>
      <UEmpty
        v-if="puzzle.placed.length === 0"
        icon="i-lucide-grid-3x3"
        title="Belum ada kata"
        description="Masukkan daftar kata dan petunjuk dengan format KATA: Petunjuk di sebelah kiri."
      />

      <PrintLayout v-else>
        <div class="p-6">
          <PrintHeader
            :title="title"
            :subtitle="`Isilah kotak teka-teki silang sesuai petunjuk Mendatar dan Menurun`"
          />

          <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
            <span>Nama: ____________________</span>
            <span>Kelas: ________</span>
            <span>Tanggal: ____________</span>
          </div>

          <div class="my-6 overflow-x-auto">
            <table class="mx-auto border-collapse">
              <tbody>
                <tr
                  v-for="(row, rIdx) in puzzle.grid"
                  :key="rIdx"
                >
                  <td
                    v-for="(cell, cIdx) in row"
                    :key="cIdx"
                    class="relative size-9"
                    :class="cell !== null ? 'border-2 border-black bg-white' : 'bg-transparent'"
                  >
                    <span
                      v-if="puzzle.numbers[rIdx]?.[cIdx]"
                      class="absolute top-0.5 left-1 text-[9px] font-bold leading-none text-black"
                    >
                      {{ puzzle.numbers[rIdx]![cIdx] }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 text-sm">
            <div class="border-2 border-black p-3">
              <p class="border-b-2 border-black pb-1 font-bold uppercase">
                Mendatar
              </p>
              <ol class="mt-2 space-y-1.5">
                <li
                  v-for="item in acrossClues"
                  :key="`a-${item.number}-${item.word}`"
                >
                  <strong>{{ item.number }}.</strong> {{ item.clue }} ({{ item.word.length }} huruf)
                </li>
              </ol>
            </div>

            <div class="border-2 border-black p-3">
              <p class="border-b-2 border-black pb-1 font-bold uppercase">
                Menurun
              </p>
              <ol class="mt-2 space-y-1.5">
                <li
                  v-for="item in downClues"
                  :key="`d-${item.number}-${item.word}`"
                >
                  <strong>{{ item.number }}.</strong> {{ item.clue }} ({{ item.word.length }} huruf)
                </li>
              </ol>
            </div>
          </div>

          <div
            v-if="withKey"
            class="mt-10 border-t-2 border-dashed border-gray-400 pt-6 print:mt-0 print:border-0 print:pt-0 print:break-before-page"
          >
            <PrintHeader
              :title="`Kunci Jawaban: ${title}`"
            />
            <div class="my-6 overflow-x-auto">
              <table class="mx-auto border-collapse">
                <tbody>
                  <tr
                    v-for="(row, rIdx) in puzzle.grid"
                    :key="`kr-${rIdx}`"
                  >
                    <td
                      v-for="(cell, cIdx) in row"
                      :key="`kc-${cIdx}`"
                      class="relative size-9 text-center font-bold text-black"
                      :class="cell !== null ? 'border-2 border-black bg-white' : 'bg-transparent'"
                    >
                      <span
                        v-if="puzzle.numbers[rIdx]?.[cIdx]"
                        class="absolute top-0.5 left-1 text-[9px] font-normal leading-none"
                      >
                        {{ puzzle.numbers[rIdx]![cIdx] }}
                      </span>
                      {{ cell ?? '' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PrintLayout>
    </div>
  </div>
</template>

