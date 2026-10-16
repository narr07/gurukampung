<script setup lang="ts">
import { DEFAULT_PREDICATES, toPredicate, type PredicateRange } from '~/utils/predikat'
import { parseScoreColumn } from '~/utils/grades'

const toast = useToast()

const ranges = useLocalStorage<PredicateRange[]>(
  'gurukampung:predikat:rentang',
  DEFAULT_PREDICATES.map(r => ({ ...r })),
  { initOnMounted: true }
)

const singleScore = ref<number>(84)
const singleResult = computed(() => toPredicate(singleScore.value, ranges.value))

const rawList = useLocalStorage('gurukampung:predikat:daftar', '92\n85\n76\n64', { initOnMounted: true })
const parsedScores = computed(() =>
  parseScoreColumn(rawList.value)
    .filter((v): v is number => typeof v === 'number')
    .map(score => ({
      score,
      pred: toPredicate(score, ranges.value)
    }))
)

function resetDefaultRanges() {
  ranges.value = DEFAULT_PREDICATES.map(r => ({ ...r }))
}

function addRange() {
  ranges.value.push({ grade: 'E', min: 0, max: 59, label: 'Kurang' })
}

function removeRange(idx: number) {
  if (ranges.value.length <= 2) return
  ranges.value.splice(idx, 1)
}

async function copyResults() {
  if (parsedScores.value.length === 0) return
  const text = parsedScores.value
    .map(r => `${r.score}\t${r.pred?.grade ?? '-'}\t${r.pred?.label ?? '-'}`)
    .join('\n')
  await navigator.clipboard.writeText(text)
  toast.add({ title: 'Hasil disalin ke papan klip', description: 'Siap ditempel kembali ke Excel atau Google Sheets.', color: 'success', icon: 'i-lucide-copy' })
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[22rem_1fr]">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-display text-lg font-bold text-highlighted">
            Rentang predikat
          </h2>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-rotate-ccw"
            @click="resetDefaultRanges"
          >
            Contoh bawaan
          </UButton>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-muted">
          Sesuaikan batas angka dengan aturan KKM/KKTP di sekolah Anda.
        </p>

        <div
          v-for="(r, i) in ranges"
          :key="i"
          class="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 rounded-2xl border-2 border-(--color-tinta) bg-amber-50/50 dark:bg-slate-800/70 p-2.5"
        >
          <UInput
            v-model="r.grade"
            aria-label="Huruf predikat"
            class="font-bold text-center"
          />
          <div class="space-y-1.5">
            <UInput
              v-model="r.label"
              aria-label="Keterangan predikat"
              placeholder="Sebutan"
            />
            <div class="flex items-center gap-1.5 text-xs text-muted">
              <UInputNumber
                v-model="r.min"
                :min="0"
                :max="100"
                aria-label="Nilai terkecil"
                class="w-20"
              />
              <span>sampai</span>
              <UInputNumber
                v-model="r.max"
                :min="0"
                :max="100"
                aria-label="Nilai terbesar"
                class="w-20"
              />
            </div>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="ranges.length <= 2"
            :aria-label="`Hapus predikat ${r.grade}`"
            @click="removeRange(i)"
          />
        </div>

        <UButton
          block
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
          @click="addRange"
        >
          Tambah tingkat predikat
        </UButton>
      </div>
    </UCard>

    <div class="space-y-6">
      <UCard>
        <template #header>
          <h2 class="font-display text-lg font-bold text-highlighted">
            Cek satu nilai
          </h2>
        </template>
        <div class="flex flex-wrap items-center gap-6">
          <UFormField label="Nilai angka (0 sampai 100)">
            <UInputNumber
              v-model="singleScore"
              :min="0"
              :max="100"
              class="w-36"
            />
          </UFormField>

          <div
            v-if="singleResult"
            class="lencana-pensil flex items-center gap-3 px-5 py-3"
          >
            <span class="font-display text-3xl font-extrabold tabular-nums">{{ singleResult.grade }}</span>
            <span class="font-bold">{{ singleResult.label }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-display text-lg font-bold text-highlighted">
              Konversi satu kolom nilai dari spreadsheet
            </h2>
            <UButton
              size="sm"
              icon="i-lucide-copy"
              :disabled="parsedScores.length === 0"
              @click="copyResults"
            >
              Salin hasil untuk Excel
            </UButton>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField
            label="Daftar nilai"
            hint="Satu nilai per baris"
          >
            <UTextarea
              v-model="rawList"
              :rows="10"
              class="w-full font-mono"
              placeholder="90&#10;82&#10;74"
            />
          </UFormField>

          <div>
            <p class="mb-2 text-sm font-bold text-highlighted">
              Hasil ({{ parsedScores.length }} baris)
            </p>
            <div
              v-if="parsedScores.length === 0"
              class="rounded-2xl border-2 border-(--color-tinta) p-6 text-center text-sm text-muted"
            >
              Tempel daftar nilai di sebelah kiri untuk melihat hasil predikatnya.
            </div>
            <div
              v-else
              class="max-h-64 overflow-y-auto rounded-2xl border-2 border-(--color-tinta)"
            >
              <table class="w-full text-sm">
                <thead class="border-b-2 border-(--color-tinta) bg-amber-50 dark:bg-slate-800 text-left text-highlighted">
                  <tr>
                    <th class="px-3 py-2 font-bold">
                      No.
                    </th>
                    <th class="px-3 py-2 font-bold">
                      Nilai
                    </th>
                    <th class="px-3 py-2 font-bold">
                      Predikat
                    </th>
                    <th class="px-3 py-2 font-bold">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-(--color-tinta)/15">
                  <tr
                    v-for="(item, idx) in parsedScores"
                    :key="idx"
                  >
                    <td class="px-3 py-1.5 tabular-nums text-muted">
                      {{ idx + 1 }}
                    </td>
                    <td class="px-3 py-1.5 font-semibold tabular-nums">
                      {{ item.score }}
                    </td>
                    <td class="px-3 py-1.5 font-bold">
                      {{ item.pred?.grade ?? '-' }}
                    </td>
                    <td class="px-3 py-1.5 text-toned">
                      {{ item.pred?.label ?? '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

