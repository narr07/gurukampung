<script setup lang="ts">
import { mulberry32 } from '~/utils/random'
import { answerText, makeWorksheet, type Operation, type WorksheetOptions } from '~/utils/worksheet'

const opts = useLocalStorage<WorksheetOptions>('gurukampung:lk:opsi', {
  operations: ['+', '-'],
  min: 1,
  max: 20,
  count: 20,
  noNegative: true,
  noRemainder: true
}, { initOnMounted: true, mergeDefaults: true })
const title = useLocalStorage('gurukampung:lk:judul', 'Latihan Berhitung', { initOnMounted: true })
const columns = useLocalStorage('gurukampung:lk:kolom', 2, { initOnMounted: true })
const withKey = useLocalStorage('gurukampung:lk:kunci', true, { initOnMounted: true })
const { seed, reroll } = useSeed()

const problems = computed(() => makeWorksheet(mulberry32(seed.value), { ...opts.value, count: Math.max(1, Math.min(100, opts.value.count)) }))

const OPS: { value: Operation, label: string }[] = [
  { value: '+', label: 'Penjumlahan (+)' },
  { value: '-', label: 'Pengurangan (−)' },
  { value: '×', label: 'Perkalian (×)' },
  { value: ':', label: 'Pembagian (:)' }
]

function toggleOp(op: Operation, on: boolean | 'indeterminate') {
  const set = new Set(opts.value.operations)
  if (on === true) set.add(op)
  else set.delete(op)
  opts.value.operations = OPS.map(o => o.value).filter(v => set.has(v))
}

const displayOp = (op: Operation) => (op === '-' ? '−' : op)
const columnItems = [1, 2, 3, 4].map(n => ({ value: n, label: `${n} kolom` }))
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
    <div class="space-y-4">
      <UFormField label="Judul">
        <UInput
          v-model="title"
          class="w-full"
        />
      </UFormField>
      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-highlighted">
          Operasi
        </legend>
        <UCheckbox
          v-for="o in OPS"
          :key="o.value"
          :model-value="opts.operations.includes(o.value)"
          :label="o.label"
          @update:model-value="v => toggleOp(o.value, v)"
        />
      </fieldset>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Angka terkecil">
          <UInputNumber
            v-model="opts.min"
            :min="0"
            :max="9999"
          />
        </UFormField>
        <UFormField label="Angka terbesar">
          <UInputNumber
            v-model="opts.max"
            :min="1"
            :max="9999"
          />
        </UFormField>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Jumlah soal">
          <UInputNumber
            v-model="opts.count"
            :min="1"
            :max="100"
          />
        </UFormField>
        <UFormField label="Tata letak">
          <USelect
            v-model="columns"
            :items="columnItems"
            class="w-full"
          />
        </UFormField>
      </div>
      <USwitch
        v-model="opts.noNegative"
        label="Pengurangan tanpa hasil negatif"
      />
      <USwitch
        v-model="opts.noRemainder"
        label="Pembagian selalu habis dibagi"
      />
      <USwitch
        v-model="withKey"
        label="Cetak kunci jawaban di halaman terpisah"
      />
      <UButton
        block
        icon="i-lucide-shuffle"
        @click="reroll"
      >
        Buat soal baru
      </UButton>
    </div>

    <PrintLayout>
      <div class="p-6">
        <PrintHeader :title="title" />
        <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
          <span>Nama: ____________________</span>
          <span>Kelas: ________</span>
          <span>Tanggal: ____________</span>
        </div>
        <ol
          class="grid gap-x-8 gap-y-4 text-lg tabular-nums"
          :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
        >
          <li
            v-for="(p, i) in problems"
            :key="i"
            class="break-inside-avoid"
          >
            <span class="inline-block w-8 text-sm text-gray-600">{{ i + 1 }}.</span>
            {{ p.a }} {{ displayOp(p.op) }} {{ p.b }} = ______
          </li>
        </ol>

        <div
          v-if="withKey"
          class="mt-10 border-t-2 border-dashed border-gray-400 pt-6 print:mt-0 print:border-0 print:pt-0 print:break-before-page"
        >
          <PrintHeader
            :title="`Kunci Jawaban: ${title}`"
            :subtitle="`Kode soal ${seed}`"
          />
          <ol
            class="grid grid-cols-4 gap-x-6 gap-y-1 tabular-nums"
          >
            <li
              v-for="(p, i) in problems"
              :key="i"
            >
              <span class="inline-block w-8 text-sm text-gray-600">{{ i + 1 }}.</span>{{ answerText(p) }}
            </li>
          </ol>
        </div>
      </div>
    </PrintLayout>
  </div>
</template>
