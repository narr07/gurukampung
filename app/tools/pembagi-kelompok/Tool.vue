<script setup lang="ts">
import { mulberry32 } from '~/utils/random'
import { average, groupCount, makeGroups, type GroupMember, type GroupMode } from '~/utils/groups'
import { finalScore, DEFAULT_COMPONENTS, type GradeComponent, type ScoreRow } from '~/utils/grades'

const { classId, activeClass, students } = useActiveClass()

const mode = useLocalStorage<GroupMode>('gurukampung:kelompok:mode', 'acak', { initOnMounted: true })
const by = useLocalStorage<'kelompok' | 'anggota'>('gurukampung:kelompok:dasar', 'kelompok', { initOnMounted: true })
const value = useLocalStorage('gurukampung:kelompok:nilai', 5, { initOnMounted: true })
const { seed, reroll } = useSeed()
const seedInput = ref('')

// Mode seimbang nilai memakai nilai akhir dari Kalkulator Nilai Rapor untuk kelas yang sama
const { data: gradeBook } = useToolData<{ components: GradeComponent[], scores: Record<string, ScoreRow> }>(
  () => (classId.value ? `nilai-rapor:${classId.value}` : undefined),
  () => ({ components: DEFAULT_COMPONENTS, scores: {} })
)

const members = computed<GroupMember[]>(() => students.value.map(s => ({
  id: s.id,
  name: s.nickname || s.name,
  gender: s.gender,
  score: finalScore(gradeBook.value.scores[s.id] ?? {}, gradeBook.value.components)
})))

const scoredCount = computed(() => members.value.filter(m => typeof m.score === 'number').length)
const genderCount = computed(() => members.value.filter(m => m.gender).length)

const n = computed(() => groupCount(members.value.length, by.value, value.value))
const groups = computed(() => makeGroups(mulberry32(seed.value), members.value, n.value, mode.value))

function reshuffle() {
  reroll()
}

function applySeed() {
  const v = Number(seedInput.value)
  if (Number.isInteger(v) && v >= 0) seed.value = v
}

const modeItems = [
  { value: 'acak', label: 'Acak' },
  { value: 'gender', label: 'Seimbang laki-laki dan perempuan' },
  { value: 'nilai', label: 'Seimbang nilai' }
]
const byItems = [
  { value: 'kelompok', label: 'Jumlah kelompok' },
  { value: 'anggota', label: 'Anggota per kelompok' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
    <div class="space-y-4 print:hidden">
      <ClassPicker v-model="classId" />
      <UFormField label="Cara membagi">
        <USelect
          v-model="mode"
          :items="modeItems"
          class="w-full"
        />
      </UFormField>
      <UAlert
        v-if="mode === 'gender' && genderCount < members.length"
        color="warning"
        variant="subtle"
        icon="i-lucide-info"
        :description="`${members.length - genderCount} siswa belum diisi L/P di Data Kelas, jadi dibagi rata saja.`"
      />
      <UAlert
        v-if="mode === 'nilai' && scoredCount < members.length"
        color="warning"
        variant="subtle"
        icon="i-lucide-info"
        :description="`Nilai diambil dari Kalkulator Nilai Rapor. ${members.length - scoredCount} siswa belum punya nilai.`"
      />
      <div class="grid grid-cols-[1fr_6rem] gap-2">
        <UFormField label="Berdasarkan">
          <USelect
            v-model="by"
            :items="byItems"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Jumlah">
          <UInputNumber
            v-model="value"
            :min="1"
            :max="40"
          />
        </UFormField>
      </div>
      <UButton
        block
        icon="i-lucide-shuffle"
        :disabled="members.length === 0"
        @click="reshuffle"
      >
        Acak ulang
      </UButton>
      <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3.5 text-sm">
        <p class="text-slate-700 dark:text-slate-300">
          Kode hasil ini: <strong class="lencana-pensil px-2 py-0.5 text-xs tabular-nums">{{ seed }}</strong>. Catat kode ini untuk memunculkan pembagian yang sama lagi.
        </p>
        <form
          class="mt-2.5 flex gap-2"
          @submit.prevent="applySeed"
        >
          <UInput
            v-model="seedInput"
            inputmode="numeric"
            placeholder="Kode"
            aria-label="Kode pembagian"
            class="w-28"
          />
          <UButton
            type="submit"
            color="neutral"
            variant="outline"
          >
            Pakai kode
          </UButton>
        </form>
      </div>
    </div>

    <div>
      <UEmpty
        v-if="members.length === 0"
        icon="i-lucide-users"
        title="Belum ada siswa"
        description="Pilih kelas yang sudah berisi siswa di Data Kelas."
      />
      <template v-else>
        <ProjectorShell>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <section
              v-for="(g, i) in groups"
              :key="i"
              class="rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-4 shadow-[0_3px_0_0_var(--color-tinta)]"
            >
              <h2 class="flex items-baseline justify-between font-display font-bold text-slate-900 dark:text-white">
                <span class="lencana-pensil px-2.5 py-0.5 text-sm">Kelompok {{ i + 1 }}</span>
                <span
                  v-if="mode === 'nilai' && average(g) !== undefined"
                  class="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >rata-rata {{ average(g)!.toFixed(1) }}</span>
              </h2>
              <ol class="mt-3 space-y-1.5 list-decimal ps-5 font-medium">
                <li
                  v-for="m in g"
                  :key="m.id"
                >
                  {{ m.name }}<span
                    v-if="m.gender"
                    class="text-muted"
                  > ({{ m.gender }})</span>
                </li>
              </ol>
            </section>
          </div>
        </ProjectorShell>

        <h2 class="mt-8 mb-2 font-semibold text-highlighted print:hidden">
          Cetak
        </h2>
        <PrintLayout>
          <div class="p-6">
            <PrintHeader
              title="Pembagian Kelompok"
              :subtitle="`${activeClass?.name ?? ''} · kode ${seed}`"
            />
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(g, i) in groups"
                :key="i"
                class="break-inside-avoid border border-black p-2"
              >
                <p class="font-bold">
                  Kelompok {{ i + 1 }}
                </p>
                <ol class="list-decimal ps-5 text-sm">
                  <li
                    v-for="m in g"
                    :key="m.id"
                  >
                    {{ m.name }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </PrintLayout>
      </template>
    </div>
  </div>
</template>
