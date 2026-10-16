<script setup lang="ts">
import { DEFAULT_COMPONENTS, finalScore, parseScoreColumn, toCsv, totalWeight, type GradeComponent, type ScoreRow } from '~/utils/grades'

interface GradeBook {
  components: GradeComponent[]
  scores: Record<string, ScoreRow>
}

const toast = useToast()
const { classId, activeClass, students } = useActiveClass()
const { data: book, status, saved } = useToolData<GradeBook>(
  () => (classId.value ? `nilai-rapor:${classId.value}` : undefined),
  () => ({ components: DEFAULT_COMPONENTS.map(c => ({ ...c })), scores: {} })
)

const decimals = useLocalStorage('gurukampung:nilai:desimal', 0, { initOnMounted: true })
const weightSum = computed(() => totalWeight(book.value.components))

function row(id: string) {
  book.value.scores[id] ??= {}
  return book.value.scores[id]!
}

function setScore(studentId: string, compId: string, v: number | null | undefined) {
  row(studentId)[compId] = typeof v === 'number' && !Number.isNaN(v) ? Math.max(0, Math.min(100, v)) : null
}

const final = (id: string) => finalScore(book.value.scores[id] ?? {}, book.value.components, decimals.value)

function addComponent() {
  book.value.components.push({ id: crypto.randomUUID().slice(0, 8), label: `Komponen ${book.value.components.length + 1}`, weight: 0 })
}
function removeComponent(id: string) {
  book.value.components = book.value.components.filter(c => c.id !== id)
}

// Tempel satu kolom nilai dari spreadsheet, urut sesuai daftar siswa
const pasteFor = ref<GradeComponent | null>(null)
const pasteText = ref('')
const pasteOpen = computed({
  get: () => pasteFor.value !== null,
  set: (open: boolean) => {
    if (!open) pasteFor.value = null
  }
})
const parsedColumn = computed(() => parseScoreColumn(pasteText.value))
function applyPaste() {
  if (!pasteFor.value) return
  const values = parsedColumn.value
  students.value.forEach((s, i) => {
    if (i < values.length) row(s.id)[pasteFor.value!.id] = values[i]
  })
  toast.add({ title: `Nilai ${pasteFor.value.label} ditempel`, description: `${Math.min(values.length, students.value.length)} siswa`, color: 'success', icon: 'i-lucide-clipboard-paste' })
  pasteText.value = ''
  pasteFor.value = null
}

function downloadCsv() {
  const header = ['No', 'Nama', ...book.value.components.map(c => `${c.label} (${c.weight}%)`), 'Nilai akhir']
  const rows = students.value.map((s, i) => [s.number ?? i + 1, s.name, ...book.value.components.map(c => book.value.scores[s.id]?.[c.id] ?? ''), final(s.id) ?? ''])
  const blob = new Blob(['﻿' + toCsv([header, ...rows])], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `nilai-${activeClass.value?.name ?? 'kelas'}.csv`.replace(/\s+/g, '-').toLowerCase()
  a.click()
  URL.revokeObjectURL(a.href)
}

const decimalItems = [
  { value: 0, label: 'Bilangan bulat' },
  { value: 1, label: '1 angka desimal' },
  { value: 2, label: '2 angka desimal' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end gap-4 print:hidden">
      <ClassPicker v-model="classId" />
      <UFormField label="Pembulatan nilai akhir">
        <USelect
          v-model="decimals"
          :items="decimalItems"
          class="w-44"
        />
      </UFormField>
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
      title="Nilai tidak bisa disimpan di perangkat ini."
    />

    <UEmpty
      v-if="students.length === 0"
      icon="i-lucide-users"
      title="Belum ada siswa"
      description="Pilih kelas yang sudah berisi siswa di Data Kelas."
    />

    <template v-else>
      <UCard class="print:hidden">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold text-highlighted">
              Komponen dan bobot
            </h2>
            <UBadge
              :color="weightSum === 100 ? 'neutral' : 'warning'"
              variant="subtle"
            >
              Total bobot {{ weightSum }}%
            </UBadge>
          </div>
        </template>
        <div class="space-y-2">
          <div
            v-for="c in book.components"
            :key="c.id"
            class="flex flex-wrap items-center gap-2"
          >
            <UInput
              v-model="c.label"
              :aria-label="`Nama komponen ${c.label}`"
              class="w-60"
            />
            <UInputNumber
              v-model="c.weight"
              :min="0"
              :max="100"
              :aria-label="`Bobot ${c.label} dalam persen`"
              class="w-28"
            />
            <span class="text-sm text-muted">%</span>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-clipboard-paste"
              @click="pasteFor = c"
            >
              Tempel kolom
            </UButton>
            <UTooltip text="Hapus komponen">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-x"
                :aria-label="`Hapus komponen ${c.label}`"
                :disabled="book.components.length <= 1"
                @click="removeComponent(c.id)"
              />
            </UTooltip>
          </div>
          <p
            v-if="weightSum !== 100"
            class="text-sm text-muted"
          >
            Bobot tidak harus berjumlah 100%; nilai akhir dihitung dari perbandingan bobot. Komponen yang belum diisi tidak dihitung.
          </p>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-plus"
            @click="addComponent"
          >
            Tambah komponen
          </UButton>
        </div>
      </UCard>

      <div class="overflow-x-auto print:hidden">
        <table class="w-full min-w-[40rem] text-sm">
          <thead class="text-left text-muted">
            <tr>
              <th class="py-2 pr-2 w-12 font-medium">
                No.
              </th>
              <th class="py-2 pr-2 font-medium">
                Nama
              </th>
              <th
                v-for="c in book.components"
                :key="c.id"
                class="py-2 pr-2 w-28 font-medium"
              >
                {{ c.label }}
              </th>
              <th class="py-2 w-24 font-semibold text-highlighted">
                Nilai akhir
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, i) in students"
              :key="s.id"
              class="border-t border-default"
            >
              <td class="py-1.5 pr-2 tabular-nums text-muted">
                {{ s.number ?? i + 1 }}
              </td>
              <td class="py-1.5 pr-2">
                {{ s.name }}
              </td>
              <td
                v-for="c in book.components"
                :key="c.id"
                class="py-1.5 pr-2"
              >
                <UInput
                  :model-value="book.scores[s.id]?.[c.id] ?? undefined"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  :aria-label="`${c.label} ${s.name}`"
                  @update:model-value="v => setScore(s.id, c.id, typeof v === 'number' ? v : v ? Number(v) : null)"
                />
              </td>
              <td class="py-1.5 text-lg font-semibold tabular-nums text-highlighted">
                {{ final(s.id) ?? '–' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap gap-2 print:hidden">
        <UButton
          icon="i-lucide-file-spreadsheet"
          color="neutral"
          variant="outline"
          @click="downloadCsv"
        >
          Unduh CSV untuk Excel
        </UButton>
      </div>

      <h2 class="font-semibold text-highlighted print:hidden">
        Cetak
      </h2>
      <PrintLayout>
        <div class="p-6">
          <PrintHeader
            title="Rekap Nilai"
            :subtitle="activeClass?.name"
          />
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th class="border border-black px-1 py-0.5">
                  No
                </th>
                <th class="border border-black px-1 py-0.5 text-left">
                  Nama
                </th>
                <th
                  v-for="c in book.components"
                  :key="c.id"
                  class="border border-black px-1 py-0.5"
                >
                  {{ c.label }} ({{ c.weight }}%)
                </th>
                <th class="border border-black px-1 py-0.5">
                  Akhir
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(s, i) in students"
                :key="s.id"
              >
                <td class="border border-black px-1 text-center">
                  {{ s.number ?? i + 1 }}
                </td>
                <td class="border border-black px-1">
                  {{ s.name }}
                </td>
                <td
                  v-for="c in book.components"
                  :key="c.id"
                  class="border border-black px-1 text-center"
                >
                  {{ book.scores[s.id]?.[c.id] ?? '' }}
                </td>
                <td class="border border-black px-1 text-center font-bold">
                  {{ final(s.id) ?? '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PrintLayout>
    </template>

    <UModal
      v-model:open="pasteOpen"
      :title="`Tempel nilai ${pasteFor?.label ?? ''}`"
      description="Salin satu kolom nilai dari Excel atau Google Sheets, urut sesuai nomor absen. Baris kosong berarti nilai kosong."
    >
      <template #body>
        <UTextarea
          v-model="pasteText"
          :rows="10"
          class="w-full"
          aria-label="Kolom nilai"
          placeholder="85&#10;90&#10;78,5"
        />
        <p
          v-if="pasteText.trim()"
          class="mt-2 text-sm text-toned"
        >
          {{ parsedColumn.length }} baris terbaca untuk {{ students.length }} siswa.
          <span v-if="parsedColumn.length > students.length">Baris berlebih diabaikan.</span>
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="pasteOpen = false"
          >
            Batal
          </UButton>
          <UButton
            icon="i-lucide-clipboard-paste"
            :disabled="parsedColumn.length === 0"
            @click="applyPaste"
          >
            Tempel ke tabel
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
