<script setup lang="ts">
import { checkMastery, type TpItem } from '~/utils/predikat'

interface MasteryBook {
  kktp: number
  enrichmentMin: number
  tps: TpItem[]
  scores: Record<string, Record<string, number | null>>
}

const DEFAULT_TPS: TpItem[] = [
  { id: 'tp-1', code: 'TP 1', text: 'Menjumlahkan dan mengurangkan bilangan cacah sampai 1.000' },
  { id: 'tp-2', code: 'TP 2', text: 'Menyelesaikan soal cerita operasi hitung campuran' }
]

const { classId, students } = useActiveClass()
const { data: book, status, saved } = useToolData<MasteryBook>(
  () => (classId.value ? `ketuntasan:${classId.value}` : undefined),
  () => ({
    kktp: 75,
    enrichmentMin: 90,
    tps: DEFAULT_TPS.map(t => ({ ...t })),
    scores: {}
  })
)

const selectedTpId = ref<string>('tp-1')
watch(() => book.value.tps, (list) => {
  if (list.length && !list.some(t => t.id === selectedTpId.value)) {
    selectedTpId.value = list[0]!.id
  }
}, { immediate: true })

function getScore(studentId: string, tpId: string): number | undefined {
  const val = book.value.scores[studentId]?.[tpId]
  return typeof val === 'number' ? val : undefined
}

function setScore(studentId: string, tpId: string, val: number | null) {
  book.value.scores[studentId] ??= {}
  book.value.scores[studentId]![tpId] = typeof val === 'number' && !Number.isNaN(val)
    ? Math.max(0, Math.min(100, val))
    : null
}

function addTp() {
  const nextNum = book.value.tps.length + 1
  const id = `tp-${Date.now().toString(36)}`
  book.value.tps.push({ id, code: `TP ${nextNum}`, text: `Tujuan pembelajaran ${nextNum}` })
  selectedTpId.value = id
}

function removeTp(id: string) {
  if (book.value.tps.length <= 1) return
  book.value.tps = book.value.tps.filter(t => t.id !== id)
}

const groupsForSelectedTp = computed(() => {
  const remedial: { name: string, score: number }[] = []
  const tuntas: { name: string, score: number }[] = []
  const pengayaan: { name: string, score: number }[] = []

  for (const s of students.value) {
    const sc = getScore(s.id, selectedTpId.value)
    if (sc === undefined) continue
    const st = checkMastery(sc, book.value.kktp, book.value.enrichmentMin)
    if (st === 'remedial') remedial.push({ name: s.name, score: sc })
    else if (st === 'pengayaan') pengayaan.push({ name: s.name, score: sc })
    else tuntas.push({ name: s.name, score: sc })
  }

  return { remedial, tuntas, pengayaan }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end gap-4">
      <ClassPicker v-model="classId" />
      <UFormField label="Batas tuntas (KKTP)">
        <UInputNumber
          v-model="book.kktp"
          :min="0"
          :max="100"
          class="w-28"
        />
      </UFormField>
      <UFormField label="Batas pengayaan">
        <UInputNumber
          v-model="book.enrichmentMin"
          :min="0"
          :max="100"
          class="w-28"
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
      title="Data ketuntasan tidak bisa disimpan di perangkat ini."
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
            <h2 class="font-display text-lg font-bold text-highlighted">
              Daftar Tujuan Pembelajaran (TP)
            </h2>
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
              aria-label="Deskripsi TP"
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

      <div class="overflow-x-auto rounded-2xl border border-default">
        <table class="w-full min-w-[38rem] text-sm">
          <thead class="bg-elevated text-left text-muted">
            <tr>
              <th class="px-3 py-2 w-12">
                No.
              </th>
              <th class="px-3 py-2">
                Nama siswa
              </th>
              <th
                v-for="tp in book.tps"
                :key="tp.id"
                class="px-3 py-2 w-32"
              >
                {{ tp.code }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="(s, idx) in students"
              :key="s.id"
            >
              <td class="px-3 py-1.5 tabular-nums text-muted">
                {{ s.number ?? idx + 1 }}
              </td>
              <td class="px-3 py-1.5 font-medium">
                {{ s.name }}
              </td>
              <td
                v-for="tp in book.tps"
                :key="tp.id"
                class="px-3 py-1.5"
              >
                <UInput
                  :model-value="getScore(s.id, tp.id)"
                  type="number"
                  min="0"
                  max="100"
                  :aria-label="`Nilai ${tp.code} ${s.name}`"
                  @update:model-value="v => setScore(s.id, tp.id, v === '' || v === undefined ? null : Number(v))"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="font-display text-lg font-bold text-highlighted">
            Pengelompokan tindak lanjut per TP:
          </h2>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="tp in book.tps"
              :key="tp.id"
              size="sm"
              :color="selectedTpId === tp.id ? 'secondary' : 'neutral'"
              :variant="selectedTpId === tp.id ? 'solid' : 'outline'"
              @click="selectedTpId = tp.id"
            >
              {{ tp.code }}
            </UButton>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-error">
                  Perlu Remedial (&lt; {{ book.kktp }})
                </h3>
                <UBadge
                  color="error"
                  variant="subtle"
                >
                  {{ groupsForSelectedTp.remedial.length }} siswa
                </UBadge>
              </div>
            </template>
            <p
              v-if="groupsForSelectedTp.remedial.length === 0"
              class="text-sm text-muted"
            >
              Tidak ada siswa yang perlu remedial pada TP ini.
            </p>
            <ul
              v-else
              class="space-y-1 text-sm"
            >
              <li
                v-for="item in groupsForSelectedTp.remedial"
                :key="item.name"
                class="flex justify-between"
              >
                <span>{{ item.name }}</span>
                <span class="font-semibold tabular-nums">{{ item.score }}</span>
              </li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-highlighted">
                  Tuntas ({{ book.kktp }} sampai {{ book.enrichmentMin - 1 }})
                </h3>
                <UBadge
                  color="neutral"
                  variant="subtle"
                >
                  {{ groupsForSelectedTp.tuntas.length }} siswa
                </UBadge>
              </div>
            </template>
            <p
              v-if="groupsForSelectedTp.tuntas.length === 0"
              class="text-sm text-muted"
            >
              Belum ada siswa di rentang ini.
            </p>
            <ul
              v-else
              class="space-y-1 text-sm"
            >
              <li
                v-for="item in groupsForSelectedTp.tuntas"
                :key="item.name"
                class="flex justify-between"
              >
                <span>{{ item.name }}</span>
                <span class="font-semibold tabular-nums">{{ item.score }}</span>
              </li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-primary">
                  Pengayaan (≥ {{ book.enrichmentMin }})
                </h3>
                <UBadge
                  color="primary"
                  variant="subtle"
                >
                  {{ groupsForSelectedTp.pengayaan.length }} siswa
                </UBadge>
              </div>
            </template>
            <p
              v-if="groupsForSelectedTp.pengayaan.length === 0"
              class="text-sm text-muted"
            >
              Belum ada siswa di rentang pengayaan.
            </p>
            <ul
              v-else
              class="space-y-1 text-sm"
            >
              <li
                v-for="item in groupsForSelectedTp.pengayaan"
                :key="item.name"
                class="flex justify-between"
              >
                <span>{{ item.name }}</span>
                <span class="font-semibold tabular-nums">{{ item.score }}</span>
              </li>
            </ul>
          </UCard>
        </div>
      </div>
    </template>
  </div>
</template>

