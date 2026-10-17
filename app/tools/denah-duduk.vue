<script setup lang="ts">
import { mulberry32 } from '~/utils/random'
import { assignSeats, swapSeats } from '~/utils/fase3'

interface SeatingPlanBook {
  rows: number
  cols: number
  activePlanId: string
  plans: { id: string, name: string, seats: (string | null)[] }[]
}

const { classId, activeClass, students } = useActiveClass()
const { seed, reroll } = useSeed()

const { data: book, status, saved } = useToolData<SeatingPlanBook>(
  () => (classId.value ? `denah-duduk:${classId.value}` : undefined),
  () => ({
    rows: 4,
    cols: 4,
    activePlanId: 'default',
    plans: [{ id: 'default', name: 'Denah Utama', seats: [] }]
  })
)

const totalDesks = computed(() => Math.max(1, book.value.rows * book.value.cols * 2))

const currentPlan = computed(() => {
  return book.value.plans.find(p => p.id === book.value.activePlanId) ?? book.value.plans[0]!
})

watch(
  [() => students.value, () => totalDesks.value, () => currentPlan.value?.id],
  () => {
    if (!currentPlan.value) return
    if (currentPlan.value.seats.length !== totalDesks.value || currentPlan.value.seats.every(s => s === null)) {
      currentPlan.value.seats = assignSeats(
        mulberry32(seed.value),
        students.value.map(s => s.id),
        totalDesks.value,
        false
      )
    }
  },
  { immediate: true }
)

const studentMap = computed(() => new Map(students.value.map(s => [s.id, s.nickname || s.name])))
const selectedSeatIdx = ref<number | null>(null)

function shuffleSeating() {
  if (!currentPlan.value) return
  reroll()
  currentPlan.value.seats = assignSeats(
    mulberry32(seed.value),
    students.value.map(s => s.id),
    totalDesks.value,
    true
  )
  selectedSeatIdx.value = null
}

function handleSeatClick(idx: number) {
  if (!currentPlan.value) return
  if (selectedSeatIdx.value === null) {
    selectedSeatIdx.value = idx
  } else if (selectedSeatIdx.value === idx) {
    selectedSeatIdx.value = null
  } else {
    currentPlan.value.seats = swapSeats(currentPlan.value.seats, selectedSeatIdx.value, idx)
    selectedSeatIdx.value = null
  }
}

const draggedIdx = ref<number | null>(null)
function onDragStart(idx: number) {
  draggedIdx.value = idx
}
function onDrop(targetIdx: number) {
  if (draggedIdx.value !== null && draggedIdx.value !== targetIdx && currentPlan.value) {
    currentPlan.value.seats = swapSeats(currentPlan.value.seats, draggedIdx.value, targetIdx)
  }
  draggedIdx.value = null
  selectedSeatIdx.value = null
}

function addNewPlan() {
  const num = book.value.plans.length + 1
  const id = `plan-${Date.now().toString(36)}`
  const seats = assignSeats(
    mulberry32(seed.value + num),
    students.value.map(s => s.id),
    totalDesks.value,
    true
  )
  book.value.plans.push({ id, name: `Versi ${num}`, seats })
  book.value.activePlanId = id
}

function deleteActivePlan() {
  if (book.value.plans.length <= 1) return
  book.value.plans = book.value.plans.filter(p => p.id !== book.value.activePlanId)
  book.value.activePlanId = book.value.plans[0]!.id
}

const planItems = computed(() => book.value.plans.map(p => ({ value: p.id, label: p.name })))
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <div class="space-y-4 print:hidden">
        <ClassPicker v-model="classId" />

        <div class="grid grid-cols-2 gap-2">
          <UFormField label="Baris meja">
            <UInputNumber
              v-model="book.rows"
              :min="1"
              :max="8"
            />
          </UFormField>
          <UFormField label="Kolom meja (berpasangan)">
            <UInputNumber
              v-model="book.cols"
              :min="1"
              :max="6"
            />
          </UFormField>
        </div>

        <UFormField label="Versi denah tersimpan">
          <div class="flex gap-2">
            <USelect
              v-model="book.activePlanId"
              :items="planItems"
              class="w-full"
            />
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-plus"
              aria-label="Buat versi denah baru"
              @click="addNewPlan"
            />
            <UButton
              v-if="book.plans.length > 1"
              color="neutral"
              variant="ghost"
              icon="i-lucide-trash-2"
              aria-label="Hapus versi denah ini"
              @click="deleteActivePlan"
            />
          </div>
        </UFormField>

        <UFormField
          v-if="currentPlan"
          label="Nama versi denah"
        >
          <UInput
            v-model="currentPlan.name"
            class="w-full"
          />
        </UFormField>

        <UButton
          block
          icon="i-lucide-shuffle"
          :disabled="students.length === 0"
          @click="shuffleSeating"
        >
          Acak posisi duduk
        </UButton>

        <p class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3 text-xs text-slate-700 dark:text-slate-300">
          Klik satu kursi lalu klik kursi lain (atau seret dengan mouse) untuk menukar tempat duduk siswa.
        </p>

        <span
          v-if="classId"
          class="block text-xs text-muted"
          role="status"
        >{{ saved ? 'Tersimpan otomatis' : 'Menyimpan…' }}</span>
      </div>

      <div>
        <UAlert
          v-if="status === 'error'"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Denah tidak bisa disimpan di perangkat ini."
          class="mb-4"
        />

        <UEmpty
          v-if="students.length === 0"
          icon="i-lucide-armchair"
          title="Belum ada siswa"
          description="Pilih kelas yang sudah berisi siswa di Data Kelas."
        />

        <template v-else-if="currentPlan">
          <div class="space-y-6 print:hidden">
            <div class="mx-auto max-w-md rounded-2xl border-2 border-(--color-tinta) bg-(--color-pensil) py-2 text-center font-display font-extrabold text-slate-900 shadow-[0_3px_0_0_var(--color-tinta)]">
              PAPAN TULIS &amp; MEJA GURU (DEPAN KELAS)
            </div>

            <div
              class="grid gap-4"
              :style="{ gridTemplateColumns: `repeat(${book.cols}, minmax(0, 1fr))` }"
            >
              <div
                v-for="deskIdx in book.rows * book.cols"
                :key="deskIdx"
                class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/60 dark:bg-slate-800/70 p-2.5 shadow-[0_3px_0_0_var(--color-tinta)]"
              >
                <p class="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">
                  Meja {{ deskIdx }}
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="side in [0, 1]"
                    :key="side"
                    type="button"
                    draggable="true"
                    :aria-pressed="selectedSeatIdx === (deskIdx - 1) * 2 + side"
                    class="min-h-14 rounded-xl border-2 border-(--color-tinta) px-2 py-1.5 text-center text-xs font-bold transition-transform cursor-grab active:cursor-grabbing"
                    :class="[
                      selectedSeatIdx === (deskIdx - 1) * 2 + side
                        ? 'bg-(--color-pensil) text-slate-950 scale-105'
                        : currentPlan.seats[(deskIdx - 1) * 2 + side]
                          ? 'bg-white dark:bg-slate-900 text-highlighted hover:-translate-y-0.5'
                          : 'bg-slate-100/80 dark:bg-slate-900/40 text-muted border-dashed'
                    ]"
                    @click="handleSeatClick((deskIdx - 1) * 2 + side)"
                    @dragstart="onDragStart((deskIdx - 1) * 2 + side)"
                    @dragover.prevent
                    @drop="onDrop((deskIdx - 1) * 2 + side)"
                  >
                    {{ studentMap.get(currentPlan.seats[(deskIdx - 1) * 2 + side] ?? '') ?? 'Kosong' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h2 class="mt-8 mb-2 font-display font-bold text-highlighted print:hidden">
            Cetak denah tempat duduk
          </h2>
          <PrintLayout>
            <div class="p-6">
              <PrintHeader
                :title="`Denah Tempat Duduk: ${currentPlan.name}`"
                :subtitle="`${activeClass?.name ?? ''} · ${students.length} siswa`"
              />
              <div class="mx-auto mb-6 max-w-sm border-2 border-black py-1.5 text-center text-sm font-bold">
                PAPAN TULIS (DEPAN KELAS)
              </div>
              <div
                class="grid gap-3"
                :style="{ gridTemplateColumns: `repeat(${book.cols}, minmax(0, 1fr))` }"
              >
                <div
                  v-for="deskIdx in book.rows * book.cols"
                  :key="`p-${deskIdx}`"
                  class="break-inside-avoid border-2 border-black p-2"
                >
                  <p class="mb-1 text-center text-[10px] font-bold uppercase">
                    Meja {{ deskIdx }}
                  </p>
                  <div class="grid grid-cols-2 gap-1.5 text-center text-xs">
                    <div
                      v-for="side in [0, 1]"
                      :key="`ps-${side}`"
                      class="border border-black px-1 py-2 font-semibold"
                    >
                      {{ studentMap.get(currentPlan.seats[(deskIdx - 1) * 2 + side] ?? '') ?? '—' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PrintLayout>
        </template>
      </div>
    </div>
  </div>
</template>
