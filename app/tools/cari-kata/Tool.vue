<script setup lang="ts">
import { mulberry32 } from '~/utils/random'
import { cleanWords, generateWordSearch, type WordDirection } from '~/utils/wordsearch'

const title = useLocalStorage('peragu:carikata:judul', 'Cari Kata Kosakata', { initOnMounted: true })
const rawWords = useLocalStorage(
  'peragu:carikata:kata',
  'PANCASILA\nMUSYAWARAH\nTOLERANSI\nGOTONGROYONG\nPERSATUAN\nKEADILAN\n KERUKUNAN\nAMANAH',
  { initOnMounted: true }
)
const dirs = useLocalStorage<WordDirection[]>('peragu:carikata:arah', ['mendatar', 'menurun'], { initOnMounted: true })
const withKey = useLocalStorage('peragu:carikata:kunci', true, { initOnMounted: true })
const { seed, reroll } = useSeed()

const words = computed(() => cleanWords(rawWords.value))
const puzzle = computed(() => generateWordSearch(mulberry32(seed.value), words.value, dirs.value))

const DIR_OPTIONS: { value: WordDirection, label: string }[] = [
  { value: 'mendatar', label: 'Mendatar (kiri ke kanan)' },
  { value: 'menurun', label: 'Menurun (atas ke bawah)' },
  { value: 'diagonal', label: 'Miring (diagonal)' }
]

function toggleDir(d: WordDirection, on: boolean | 'indeterminate') {
  const set = new Set(dirs.value)
  if (on === true) set.add(d)
  else if (set.size > 1) set.delete(d)
  dirs.value = DIR_OPTIONS.map(o => o.value).filter(v => set.has(v))
}
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

      <UFormField
        label="Daftar kosakata"
        hint="Satu kata per baris (2 sampai 18 huruf)"
      >
        <UTextarea
          v-model="rawWords"
          :rows="9"
          class="w-full font-mono uppercase"
        />
      </UFormField>

      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-highlighted">
          Arah susunan kata
        </legend>
        <UCheckbox
          v-for="d in DIR_OPTIONS"
          :key="d.value"
          :model-value="dirs.includes(d.value)"
          :label="d.label"
          @update:model-value="v => toggleDir(d.value, v)"
        />
      </fieldset>

      <USwitch
        v-model="withKey"
        label="Cetak kunci jawaban di halaman kedua"
      />

      <UButton
        block
        icon="i-lucide-shuffle"
        :disabled="words.length === 0"
        @click="reroll"
      >
        Acak susunan kotak
      </UButton>

      <UAlert
        v-if="puzzle.unplaced.length > 0"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :description="`Kata terlalu panjang atau penuh: ${puzzle.unplaced.join(', ')}`"
      />
    </div>

    <div>
      <UEmpty
        v-if="words.length === 0"
        icon="i-lucide-search"
        title="Belum ada kosakata"
        description="Masukkan minimal satu kata di kolom sebelah kiri."
      />

      <PrintLayout v-else>
        <div class="p-6">
          <PrintHeader
            :title="title"
            :subtitle="`Temukan ${puzzle.placed.length} kata di dalam kotak huruf`"
          />

          <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
            <span>Nama: ____________________</span>
            <span>Kelas: ________</span>
            <span>Tanggal: ____________</span>
          </div>

          <div class="grid gap-6 md:grid-cols-[1fr_14rem] items-start">
            <table class="border-collapse mx-auto">
              <tbody>
                <tr
                  v-for="(row, rIdx) in puzzle.grid"
                  :key="rIdx"
                >
                  <td
                    v-for="(ch, cIdx) in row"
                    :key="cIdx"
                    class="size-8 border border-black text-center font-bold text-base select-none"
                  >
                    {{ ch }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="border border-black p-3">
              <p class="font-bold text-sm border-b border-black pb-1 mb-2">
                Kata yang dicari:
              </p>
              <ul class="grid grid-cols-2 md:grid-cols-1 gap-1 text-sm font-medium">
                <li
                  v-for="p in puzzle.placed"
                  :key="p.word"
                >
                  ☐ {{ p.word }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Halaman kedua: Kunci Jawaban hitam-putih (DESIGN.md) -->
          <div
            v-if="withKey"
            class="mt-10 border-t-2 border-dashed border-gray-400 pt-6 print:mt-0 print:border-0 print:pt-0 print:break-before-page"
          >
            <PrintHeader
              :title="`Kunci Jawaban: ${title}`"
              :subtitle="`Kode susunan ${seed}`"
            />

            <div class="grid gap-6 md:grid-cols-[1fr_15rem] items-start">
              <table class="border-collapse mx-auto">
                <tbody>
                  <tr
                    v-for="(row, rIdx) in puzzle.grid"
                    :key="`k-${rIdx}`"
                  >
                    <td
                      v-for="(ch, cIdx) in row"
                      :key="`k-${cIdx}`"
                      class="size-8 border border-black text-center text-base"
                      :class="puzzle.solutionCells.has(`${rIdx}:${cIdx}`) ? 'font-extrabold bg-gray-200 underline decoration-2' : 'text-gray-400'"
                    >
                      {{ ch }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="text-xs space-y-1">
                <p class="font-bold text-sm mb-2">
                  Posisi awal (Baris, Kolom):
                </p>
                <p
                  v-for="p in puzzle.placed"
                  :key="`pos-${p.word}`"
                >
                  <strong>{{ p.word }}</strong>: baris {{ p.row + 1 }}, kolom {{ p.col + 1 }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PrintLayout>
    </div>
  </div>
</template>

