<script setup lang="ts">
import { buildReportDescription, type TpItem } from '~/utils/predikat'

interface DescriptionBook {
  tps: TpItem[]
  studentChoices: Record<string, { masteredIds: string[], guidanceIds: string[], customText?: string }>
}

const DEFAULT_TPS: TpItem[] = [
  { id: 'tp-1', code: 'TP 1', text: 'membaca dan memahami isi teks narasi sederhana' },
  { id: 'tp-2', code: 'TP 2', text: 'menulis kalimat efektif dengan huruf kapital dan tanda baca yang tepat' },
  { id: 'tp-3', code: 'TP 3', text: 'menceritakan kembali isi bacaan secara lisan dengan runtut' }
]

const toast = useToast()
const { classId, students } = useActiveClass()
const { data: book, status, saved } = useToolData<DescriptionBook>(
  () => (classId.value ? `deskripsi-rapor:${classId.value}` : undefined),
  () => ({
    tps: DEFAULT_TPS.map(t => ({ ...t })),
    studentChoices: {}
  })
)

function ensureStudent(studentId: string) {
  book.value.studentChoices[studentId] ??= {
    masteredIds: [book.value.tps[0]?.id].filter((x): x is string => Boolean(x)),
    guidanceIds: [book.value.tps[1]?.id].filter((x): x is string => Boolean(x))
  }
  return book.value.studentChoices[studentId]!
}

function toggleChoice(studentId: string, tpId: string, kind: 'mastered' | 'guidance') {
  const row = ensureStudent(studentId)
  const list = kind === 'mastered' ? row.masteredIds : row.guidanceIds
  const other = kind === 'mastered' ? row.guidanceIds : row.masteredIds

  if (list.includes(tpId)) {
    const idx = list.indexOf(tpId)
    if (idx !== -1) list.splice(idx, 1)
  } else {
    list.push(tpId)
    const otherIdx = other.indexOf(tpId)
    if (otherIdx !== -1) other.splice(otherIdx, 1)
  }
  row.customText = undefined
}

function generatedText(studentId: string, studentName: string): string {
  const row = book.value.studentChoices[studentId]
  const masteredIds = row?.masteredIds ?? [book.value.tps[0]?.id].filter(Boolean)
  const guidanceIds = row?.guidanceIds ?? [book.value.tps[1]?.id].filter(Boolean)
  const mastered = book.value.tps.filter(t => masteredIds.includes(t.id)).map(t => t.text)
  const guidance = book.value.tps.filter(t => guidanceIds.includes(t.id)).map(t => t.text)
  return buildReportDescription(studentName, mastered, guidance)
}

function displayText(studentId: string, studentName: string): string {
  const custom = book.value.studentChoices[studentId]?.customText
  return custom !== undefined ? custom : generatedText(studentId, studentName)
}

function updateCustomText(studentId: string, text: string) {
  ensureStudent(studentId).customText = text
}

function addTp() {
  const n = book.value.tps.length + 1
  book.value.tps.push({
    id: `tp-${Date.now().toString(36)}`,
    code: `TP ${n}`,
    text: `menguasai materi pembelajaran ke-${n}`
  })
}

function removeTp(id: string) {
  if (book.value.tps.length <= 1) return
  book.value.tps = book.value.tps.filter(t => t.id !== id)
}

async function copyOne(studentId: string, name: string) {
  await navigator.clipboard.writeText(displayText(studentId, name))
  toast.add({ title: `Deskripsi ${name} disalin`, color: 'success', icon: 'i-lucide-copy' })
}

async function copyAll() {
  const lines = students.value.map(s => `${s.name}\t${displayText(s.id, s.nickname || s.name)}`)
  await navigator.clipboard.writeText(lines.join('\n'))
  toast.add({ title: `${lines.length} deskripsi rapor disalin`, description: 'Siap ditempel ke kolom deskripsi e-Rapor atau Excel.', color: 'success', icon: 'i-lucide-copy' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-wrap items-end gap-4">
        <ClassPicker v-model="classId" />
        <span
          v-if="classId"
          class="text-sm text-muted"
          role="status"
        >{{ saved ? 'Tersimpan otomatis' : 'Menyimpan…' }}</span>
      </div>

      <UButton
        v-if="students.length > 0"
        icon="i-lucide-copy"
        @click="copyAll"
      >
        Salin semua ke spreadsheet
      </UButton>
    </div>

    <UAlert
      v-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Deskripsi tidak bisa disimpan di perangkat ini."
    />

    <UEmpty
      v-if="students.length === 0"
      icon="i-lucide-users"
      title="Belum ada siswa"
      description="Pilih kelas yang sudah berisi siswa di Data Kelas."
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-display text-lg font-bold text-highlighted">
                Butir Tujuan Pembelajaran (TP)
              </h2>
              <p class="text-xs text-muted">
                Tulis dengan huruf kecil di awal kalimat supaya menyambung rapi di dalam kalimat rapor.
              </p>
            </div>
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-plus"
              @click="addTp"
            >
              Tambah TP
            </UButton>
          </div>
        </template>

        <div class="space-y-2">
          <div
            v-for="tp in book.tps"
            :key="tp.id"
            class="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2"
          >
            <UInput
              v-model="tp.code"
              aria-label="Kode TP"
              class="font-semibold"
            />
            <UInput
              v-model="tp.text"
              aria-label="Kalimat TP"
            />
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="book.tps.length <= 1"
              :aria-label="`Hapus ${tp.code}`"
              @click="removeTp(tp.id)"
            />
          </div>
        </div>
      </UCard>

      <div class="space-y-4">
        <UCard
          v-for="(s, idx) in students"
          :key="s.id"
        >
          <div class="grid gap-4 lg:grid-cols-[18rem_1fr_auto] lg:items-start">
            <div class="space-y-2">
              <p class="font-display font-bold text-highlighted">
                <span class="tabular-nums text-muted">{{ s.number ?? idx + 1 }}.</span> {{ s.name }}
              </p>

              <div class="space-y-1.5 text-xs">
                <p class="font-medium text-muted">
                  Sudah dikuasai:
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <UButton
                    v-for="tp in book.tps"
                    :key="`m-${tp.id}`"
                    size="xs"
                    :color="(book.studentChoices[s.id]?.masteredIds ?? [book.tps[0]?.id]).includes(tp.id) ? 'primary' : 'neutral'"
                    :variant="(book.studentChoices[s.id]?.masteredIds ?? [book.tps[0]?.id]).includes(tp.id) ? 'solid' : 'outline'"
                    :aria-pressed="(book.studentChoices[s.id]?.masteredIds ?? [book.tps[0]?.id]).includes(tp.id)"
                    @click="toggleChoice(s.id, tp.id, 'mastered')"
                  >
                    {{ tp.code }}
                  </UButton>
                </div>
              </div>

              <div class="space-y-1.5 text-xs">
                <p class="font-medium text-muted">
                  Perlu bimbingan:
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <UButton
                    v-for="tp in book.tps"
                    :key="`g-${tp.id}`"
                    size="xs"
                    :color="(book.studentChoices[s.id]?.guidanceIds ?? [book.tps[1]?.id]).includes(tp.id) ? 'secondary' : 'neutral'"
                    :variant="(book.studentChoices[s.id]?.guidanceIds ?? [book.tps[1]?.id]).includes(tp.id) ? 'solid' : 'outline'"
                    :aria-pressed="(book.studentChoices[s.id]?.guidanceIds ?? [book.tps[1]?.id]).includes(tp.id)"
                    @click="toggleChoice(s.id, tp.id, 'guidance')"
                  >
                    {{ tp.code }}
                  </UButton>
                </div>
              </div>
            </div>

            <UTextarea
              :model-value="displayText(s.id, s.nickname || s.name)"
              :rows="3"
              class="w-full"
              :aria-label="`Deskripsi rapor ${s.name}`"
              @update:model-value="v => updateCustomText(s.id, String(v))"
            />

            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-copy"
              @click="copyOne(s.id, s.nickname || s.name)"
            >
              Salin
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </div>
</template>
