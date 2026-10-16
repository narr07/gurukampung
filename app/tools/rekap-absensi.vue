<script setup lang="ts">
import { dateKey, monthRange, schoolDays, STATUS_LABEL, summarize, type AttendanceBook, type AttendanceStatus } from '~/utils/attendance'

const { classId, activeClass, students } = useActiveClass()
const { data: book, status, saved } = useToolData<AttendanceBook>(
  () => (classId.value ? `rekap-absensi:${classId.value}` : undefined),
  () => ({})
)

const tab = useLocalStorage('peragu:absensi:tab', 'harian', { initOnMounted: true })
const tabs = [
  { label: 'Isi harian', value: 'harian', icon: 'i-lucide-calendar-check', slot: 'harian' as const },
  { label: 'Rekap bulanan', value: 'rekap', icon: 'i-lucide-table', slot: 'rekap' as const }
]

// ---------- Harian
const day = ref(dateKey(new Date()))
const STATUSES: AttendanceStatus[] = ['H', 'S', 'I', 'A']
const entries = computed(() => book.value[day.value] ?? {})

function setStatus(studentId: string, s: AttendanceStatus) {
  book.value[day.value] = { ...entries.value, [studentId]: s }
}
function allPresent() {
  book.value[day.value] = Object.fromEntries(students.value.map(s => [s.id, entries.value[s.id] ?? 'H']))
}
function clearDay() {
  book.value = Object.fromEntries(Object.entries(book.value).filter(([d]) => d !== day.value))
}
const filledToday = computed(() => students.value.filter(s => entries.value[s.id]).length)

// ---------- Rekap
const today = new Date()
const month = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
const range = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return monthRange(y!, m! - 1)
})
const days = computed(() => schoolDays(book.value, range.value.from, range.value.to))
const rows = computed(() => students.value.map(s => ({ student: s, sum: summarize(book.value, s.id, range.value.from, range.value.to) })))
const monthLabel = computed(() => new Date(`${month.value}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))

const statusColor: Record<AttendanceStatus, 'primary' | 'warning' | 'info' | 'error'> = { H: 'primary', S: 'warning', I: 'info', A: 'error' }
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end gap-4 print:hidden">
      <ClassPicker v-model="classId" />
      <span
        v-if="classId"
        class="text-sm text-muted"
        role="status"
      >{{ saved ? 'Tersimpan otomatis' : 'Menyimpan…' }}</span>
    </div>

    <UAlert
      v-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Absensi tidak bisa disimpan di perangkat ini."
    />

    <UEmpty
      v-if="students.length === 0"
      icon="i-lucide-users"
      title="Belum ada siswa"
      description="Pilih kelas yang sudah berisi siswa di Data Kelas."
    />

    <UTabs
      v-else
      v-model="tab"
      :items="tabs"
      variant="link"
    >
      <template #harian>
        <div class="space-y-4 pt-2">
          <div class="flex flex-wrap items-end gap-3">
            <UFormField label="Tanggal">
              <UInput
                v-model="day"
                type="date"
              />
            </UFormField>
            <UButton
              icon="i-lucide-check-check"
              @click="allPresent"
            >
              Tandai sisanya hadir
            </UButton>
            <UButton
              v-if="filledToday"
              color="neutral"
              variant="ghost"
              icon="i-lucide-eraser"
              @click="clearDay"
            >
              Kosongkan tanggal ini
            </UButton>
            <span class="text-sm text-muted">{{ filledToday }} dari {{ students.length }} sudah diisi</span>
          </div>

          <ul class="divide-y-2 divide-(--color-tinta)/15 rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900">
            <li
              v-for="(s, i) in students"
              :key="s.id"
              class="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
            >
              <span class="font-medium"><span class="tabular-nums text-muted">{{ s.number ?? i + 1 }}.</span> {{ s.name }}</span>
              <div
                role="radiogroup"
                :aria-label="`Kehadiran ${s.name}`"
                class="flex gap-1.5"
              >
                <UButton
                  v-for="st in STATUSES"
                  :key="st"
                  role="radio"
                  :aria-checked="entries[s.id] === st"
                  :aria-label="`${STATUS_LABEL[st]}`"
                  :color="entries[s.id] === st ? statusColor[st] : 'neutral'"
                  :variant="entries[s.id] === st ? 'solid' : 'outline'"
                  size="sm"
                  class="w-10 justify-center"
                  @click="setStatus(s.id, st)"
                >
                  {{ st }}
                </UButton>
              </div>
            </li>
          </ul>
          <p class="text-sm text-muted">
            H = hadir, S = sakit, I = izin, A = alpa. Tanggal tanpa catatan (misalnya hari libur) tidak dihitung sebagai hari efektif.
          </p>
        </div>
      </template>

      <template #rekap>
        <div class="space-y-4 pt-2">
          <div class="flex flex-wrap items-end gap-3 print:hidden">
            <UFormField label="Bulan">
              <UInput
                v-model="month"
                type="month"
              />
            </UFormField>
            <span class="text-sm text-muted">{{ days.length }} hari efektif tercatat</span>
          </div>

          <PrintLayout>
            <div class="p-6">
              <PrintHeader
                title="Rekap Absensi"
                :subtitle="`${activeClass?.name ?? ''} · ${monthLabel} · ${days.length} hari efektif`"
              />
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th class="border border-black px-1">
                      No
                    </th>
                    <th class="border border-black px-1 text-left">
                      Nama
                    </th>
                    <th
                      v-for="st in STATUSES"
                      :key="st"
                      class="border border-black px-1 w-10"
                    >
                      {{ st }}
                    </th>
                    <th class="border border-black px-1 w-20">
                      Kehadiran
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(r, i) in rows"
                    :key="r.student.id"
                  >
                    <td class="border border-black px-1 text-center">
                      {{ r.student.number ?? i + 1 }}
                    </td>
                    <td class="border border-black px-1">
                      {{ r.student.name }}
                    </td>
                    <td
                      v-for="st in STATUSES"
                      :key="st"
                      class="border border-black px-1 text-center tabular-nums"
                    >
                      {{ r.sum[st] || '' }}
                    </td>
                    <td class="border border-black px-1 text-center tabular-nums">
                      {{ r.sum.percent !== undefined ? `${r.sum.percent}%` : '–' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PrintLayout>
        </div>
      </template>
    </UTabs>
  </div>
</template>

