<script setup lang="ts">
import { mulberry32 } from '~/utils/random'
import { generateBingoSet } from '~/utils/fase4'

const title = useLocalStorage('gurukampung:bingo:judul', 'Bingo Kosakata & Berhitung', { initOnMounted: true })
const gridSize = useLocalStorage<3 | 4 | 5>('gurukampung:bingo:ukuran', 4, { initOnMounted: true })
const cardCount = useLocalStorage('gurukampung:bingo:jumlah-kartu', 4, { initOnMounted: true })
const freeCenter = useLocalStorage('gurukampung:bingo:tengah-bebas', true, { initOnMounted: true })
const rawPool = useLocalStorage(
  'gurukampung:bingo:isi',
  'MERDEKA\nPANCASILA\nBHINNEKA\nNUSANTARA\nGARUDA\nKHATULISTIWA\nSUMPAH PEMUDA\nPAHLAWAN\nPROKLAMASI\nGOTONG ROYONG\nMUSYAWARAH\nPERSATUAN\nKEADILAN\nAMANAH\nTOLERANSI\nBUDAYA\nBAHASA\nTANAH AIR',
  { initOnMounted: true }
)

const { seed, reroll } = useSeed()

const items = computed(() =>
  rawPool.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
)

const bingoSet = computed(() =>
  generateBingoSet(
    mulberry32(seed.value),
    items.value,
    gridSize.value,
    Math.max(1, Math.min(30, cardCount.value)),
    freeCenter.value
  )
)

function fillNumbers1To25() {
  rawPool.value = Array.from({ length: 25 }, (_, i) => `${i + 1}`).join('\n')
}

const sizeItems = [
  { value: 3, label: '3 × 3 (9 kotak)' },
  { value: 4, label: '4 × 4 (16 kotak)' },
  { value: 5, label: '5 × 5 (25 kotak)' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[21rem_1fr]">
    <div class="space-y-4 print:hidden">
      <UFormField label="Judul permainan Bingo">
        <UInput
          v-model="title"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Ukuran kotak">
          <USelect
            v-model="gridSize"
            :items="sizeItems"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Jumlah kartu siswa">
          <UInputNumber
            v-model="cardCount"
            :min="1"
            :max="30"
          />
        </UFormField>
      </div>

      <USwitch
        v-if="gridSize % 2 === 1"
        v-model="freeCenter"
        label="Kotak tengah bertuliskan BEBAS"
      />

      <UFormField
        :label="`Daftar kata atau angka (${items.length} item)`"
        hint="Satu kata atau angka per baris"
      >
        <UTextarea
          v-model="rawPool"
          :rows="9"
          class="w-full font-mono text-xs"
        />
      </UFormField>

      <div class="flex flex-wrap gap-2">
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          @click="fillNumbers1To25"
        >
          Isi angka 1 sampai 25
        </UButton>
        <UButton
          size="sm"
          icon="i-lucide-shuffle"
          @click="reroll"
        >
          Acak ulang semua kartu
        </UButton>
      </div>
    </div>

    <PrintLayout>
      <div class="p-6 space-y-8">
        <!-- Lembar Pemanggil Guru -->
        <div class="border-2 border-black p-4">
          <p class="border-b-2 border-black pb-1 font-bold uppercase">
            Lembar Pemanggil Guru ({{ title }} · Kode {{ seed }})
          </p>
          <p class="mt-1 text-xs">
            Bacakan urutan di bawah ini satu per satu dan beri tanda centang:
          </p>
          <ol class="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs font-medium">
            <li
              v-for="(word, idx) in bingoSet.callerList"
              :key="`call-${idx}`"
            >
              ☐ {{ idx + 1 }}. {{ word }}
            </li>
          </ol>
        </div>

        <!-- Daftar Kartu Siswa -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-for="card in bingoSet.cards"
            :key="card.id"
            class="break-inside-avoid border-2 border-black p-3"
          >
            <div class="mb-2 flex items-baseline justify-between border-b-2 border-black pb-1">
              <span class="font-display font-extrabold uppercase">{{ title }}</span>
              <span class="text-xs font-bold">Kartu #{{ card.id }}</span>
            </div>

            <table class="w-full border-collapse text-center">
              <tbody>
                <tr
                  v-for="(row, rIdx) in card.cells"
                  :key="`r-${rIdx}`"
                >
                  <td
                    v-for="(cell, cIdx) in row"
                    :key="`c-${cIdx}`"
                    class="h-14 border-2 border-black p-1 text-xs font-bold"
                    :class="cell === 'BEBAS' ? 'bg-gray-200 underline' : ''"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PrintLayout>
  </div>
</template>

