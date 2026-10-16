<script setup lang="ts">
const maxNum = useLocalStorage('gurukampung:perkalian:ukuran', 10, { initOnMounted: true })
const practiceMode = useLocalStorage('gurukampung:perkalian:latihan', false, { initOnMounted: true })
const selectedRow = ref<number | null>(null)
const selectedCol = ref<number | null>(null)
const revealed = ref<Set<string>>(new Set())

const numbers = computed(() => Array.from({ length: maxNum.value }, (_, i) => i + 1))

function selectCell(r: number, c: number) {
  selectedRow.value = r
  selectedCol.value = c
  const key = `${r}:${c}`
  if (practiceMode.value) {
    const next = new Set(revealed.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    revealed.value = next
  }
}

function clearSelection() {
  selectedRow.value = null
  selectedCol.value = null
  revealed.value = new Set()
}

const sizeItems = [
  { value: 10, label: '1 sampai 10' },
  { value: 12, label: '1 sampai 12' }
]
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-end gap-4 print:hidden">
      <UFormField label="Rentang tabel">
        <USelect
          v-model="maxNum"
          :items="sizeItems"
          class="w-44"
        />
      </UFormField>

      <USwitch
        v-model="practiceMode"
        label="Sembunyikan hasil (klik kotak untuk membuka)"
        @update:model-value="revealed = new Set()"
      />

      <UButton
        v-if="selectedRow !== null || revealed.size > 0"
        color="neutral"
        variant="outline"
        icon="i-lucide-rotate-ccw"
        @click="clearSelection"
      >
        Reset sorotan
      </UButton>
    </div>

    <ProjectorShell v-slot="{ projector }">
      <div class="space-y-4">
        <div
          v-if="selectedRow && selectedCol"
          class="flex justify-center"
          aria-live="polite"
        >
          <span class="lencana-pensil px-5 py-1.5 font-display text-2xl sm:text-3xl font-extrabold tabular-nums">
            {{ selectedRow }} × {{ selectedCol }} = {{ (!practiceMode || revealed.has(`${selectedRow}:${selectedCol}`)) ? selectedRow * selectedCol : '?' }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table
            class="mx-auto border-collapse tabular-nums"
            :class="projector ? 'text-xl' : 'text-sm sm:text-base'"
          >
            <thead>
              <tr>
                <th class="size-11 border-2 border-(--color-tinta) bg-(--color-pensil) text-slate-900 font-bold">
                  ×
                </th>
                <th
                  v-for="c in numbers"
                  :key="`h-${c}`"
                  class="size-11 border-2 border-(--color-tinta) font-bold"
                  :class="selectedCol === c ? 'bg-secondary text-white' : 'bg-amber-50 dark:bg-slate-800 text-highlighted'"
                >
                  {{ c }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in numbers"
                :key="`r-${r}`"
              >
                <th
                  class="size-11 border-2 border-(--color-tinta) font-bold"
                  :class="selectedRow === r ? 'bg-secondary text-white' : 'bg-amber-50 dark:bg-slate-800 text-highlighted'"
                >
                  {{ r }}
                </th>
                <td
                  v-for="c in numbers"
                  :key="`${r}-${c}`"
                  class="p-0 border-2 border-(--color-tinta)"
                >
                  <button
                    type="button"
                    :aria-label="`${r} dikali ${c}`"
                    class="size-11 w-full font-semibold transition-colors"
                    :class="[
                      selectedRow === r && selectedCol === c
                        ? 'bg-secondary text-white font-bold'
                        : (selectedRow === r || selectedCol === c)
                          ? 'bg-yellow-200 text-slate-900 dark:bg-teal-950 dark:text-yellow-100'
                          : 'bg-white dark:bg-slate-900 text-highlighted hover:bg-amber-50 dark:hover:bg-slate-800'
                    ]"
                    @click="selectCell(r, c)"
                  >
                    {{ (!practiceMode || revealed.has(`${r}:${c}`)) ? r * c : '?' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ProjectorShell>

    <div class="space-y-3">
      <h2 class="font-display text-lg font-bold text-highlighted print:hidden">
        Cetak tabel perkalian
      </h2>
      <PrintLayout>
        <div class="p-6">
          <PrintHeader
            :title="`Tabel Perkalian 1 sampai ${maxNum}`"
            :subtitle="practiceMode ? 'Lembar Latihan (Isilah kotak yang kosong)' : 'Tabel Referensi Kelas'"
          />
          <table class="w-full border-collapse tabular-nums text-center text-sm">
            <thead>
              <tr>
                <th class="border-2 border-black p-2 font-bold">
                  ×
                </th>
                <th
                  v-for="c in numbers"
                  :key="`pc-${c}`"
                  class="border-2 border-black p-2 font-bold"
                >
                  {{ c }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in numbers"
                :key="`pr-${r}`"
              >
                <th class="border-2 border-black p-2 font-bold">
                  {{ r }}
                </th>
                <td
                  v-for="c in numbers"
                  :key="`p-${r}-${c}`"
                  class="border border-black p-2"
                >
                  {{ (!practiceMode || revealed.has(`${r}:${c}`)) ? r * c : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PrintLayout>
    </div>
  </div>
</template>

