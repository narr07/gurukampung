<script setup lang="ts">
import { beep } from '~/utils/sound'

interface PointHistoryItem {
  time: string
  targetName: string
  delta: number
}

interface PointBoardBook {
  mode: 'siswa' | 'kelompok'
  groupNames: string[]
  studentPoints: Record<string, number>
  groupPoints: Record<string, number>
  history: PointHistoryItem[]
}

const { classId, students } = useActiveClass()
const { data: book, status, saved } = useToolData<PointBoardBook>(
  () => (classId.value ? `papan-poin:${classId.value}` : 'papan-poin:umum'),
  () => ({
    mode: 'siswa',
    groupNames: ['Regu Garuda', 'Regu Rajawali', 'Regu Elang', 'Regu Merpati'],
    studentPoints: {},
    groupPoints: {},
    history: []
  })
)

const confirmResetOpen = ref(false)
const newGroupName = ref('')

function adjustPoint(id: string, name: string, delta: number) {
  if (book.value.mode === 'siswa') {
    book.value.studentPoints[id] = Math.max(0, (book.value.studentPoints[id] ?? 0) + delta)
  } else {
    book.value.groupPoints[id] = Math.max(0, (book.value.groupPoints[id] ?? 0) + delta)
  }

  const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  book.value.history = [
    { time: nowStr, targetName: name, delta },
    ...book.value.history
  ].slice(0, 20)

  beep({ times: 1, frequency: delta > 0 ? 988 : 392, duration: 0.12 })
}

function addGroup() {
  const trimmed = newGroupName.value.trim()
  if (!trimmed || book.value.groupNames.includes(trimmed)) return
  book.value.groupNames.push(trimmed)
  newGroupName.value = ''
}

function removeGroup(name: string) {
  if (book.value.groupNames.length <= 2) return
  book.value.groupNames = book.value.groupNames.filter(g => g !== name)
}

function resetAllPoints() {
  book.value.studentPoints = {}
  book.value.groupPoints = {}
  book.value.history = []
  confirmResetOpen.value = false
}

const modeItems = [
  { value: 'siswa', label: 'Poin per Siswa' },
  { value: 'kelompok', label: 'Poin per Kelompok / Regu' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-wrap items-end gap-4">
        <UFormField label="Mode papan poin">
          <USelect
            v-model="book.mode"
            :items="modeItems"
            class="w-56"
          />
        </UFormField>

        <ClassPicker
          v-if="book.mode === 'siswa'"
          v-model="classId"
        />

        <form
          v-else
          class="flex items-end gap-2"
          @submit.prevent="addGroup"
        >
          <UFormField label="Tambah kelompok">
            <UInput
              v-model="newGroupName"
              placeholder="Nama regu..."
              class="w-44"
            />
          </UFormField>
          <UButton
            type="submit"
            color="neutral"
            variant="outline"
            icon="i-lucide-plus"
          >
            Tambah
          </UButton>
        </form>

        <span
          class="text-sm text-muted"
          role="status"
        >{{ saved ? 'Tersimpan otomatis' : 'Menyimpan…' }}</span>
      </div>

      <UButton
        color="error"
        variant="outline"
        icon="i-lucide-rotate-ccw"
        @click="confirmResetOpen = true"
      >
        Reset poin mingguan
      </UButton>
    </div>

    <UAlert
      v-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Poin tidak bisa disimpan di perangkat ini."
    />

    <ProjectorShell>
      <UEmpty
        v-if="book.mode === 'siswa' && students.length === 0"
        icon="i-lucide-medal"
        title="Belum ada siswa"
        description="Pilih kelas yang sudah berisi siswa di Data Kelas, atau ganti mode ke Poin per Kelompok."
      />

      <div
        v-else-if="book.mode === 'siswa'"
        class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="(s, idx) in students"
          :key="s.id"
          class="flex flex-col justify-between gap-3 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-4 shadow-[0_4px_0_0_var(--color-tinta)]"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="font-display font-bold text-highlighted">
              <span class="text-muted tabular-nums">{{ s.number ?? idx + 1 }}.</span> {{ s.nickname || s.name }}
            </p>
            <span class="lencana-pensil px-3 py-0.5 font-display text-xl font-extrabold tabular-nums">
              {{ book.studentPoints[s.id] ?? 0 }} ★
            </span>
          </div>

          <div class="flex gap-1.5">
            <UButton
              size="sm"
              color="primary"
              class="flex-1 justify-center font-bold"
              @click="adjustPoint(s.id, s.nickname || s.name, 1)"
            >
              +1
            </UButton>
            <UButton
              size="sm"
              color="secondary"
              class="flex-1 justify-center font-bold"
              @click="adjustPoint(s.id, s.nickname || s.name, 5)"
            >
              +5
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              class="justify-center font-bold"
              :disabled="(book.studentPoints[s.id] ?? 0) <= 0"
              @click="adjustPoint(s.id, s.nickname || s.name, -1)"
            >
              -1
            </UButton>
          </div>
        </div>
      </div>

      <div
        v-else
        class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="gName in book.groupNames"
          :key="gName"
          class="flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-6 text-center shadow-[0_4px_0_0_var(--color-tinta)]"
        >
          <div class="flex w-full items-center justify-between">
            <span class="font-display text-lg font-extrabold text-highlighted">{{ gName }}</span>
            <UButton
              v-if="book.groupNames.length > 2"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              :aria-label="`Hapus ${gName}`"
              @click="removeGroup(gName)"
            />
          </div>

          <div class="lencana-pensil px-6 py-3 font-display text-5xl font-extrabold tabular-nums">
            {{ book.groupPoints[gName] ?? 0 }}
          </div>

          <div class="flex w-full gap-2">
            <UButton
              color="primary"
              class="flex-1 justify-center font-bold"
              @click="adjustPoint(gName, gName, 1)"
            >
              +1
            </UButton>
            <UButton
              color="secondary"
              class="flex-1 justify-center font-bold"
              @click="adjustPoint(gName, gName, 5)"
            >
              +5
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              class="justify-center font-bold"
              :disabled="(book.groupPoints[gName] ?? 0) <= 0"
              @click="adjustPoint(gName, gName, -1)"
            >
              -1
            </UButton>
          </div>
        </div>
      </div>
    </ProjectorShell>

    <!-- Riwayat poin hari ini -->
    <div
      v-if="book.history.length > 0"
      class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/60 dark:bg-slate-800/70 p-4"
    >
      <h2 class="font-display text-sm font-bold text-highlighted">
        Riwayat Pemberian Poin Terakhir
      </h2>
      <ul class="mt-2 flex flex-wrap gap-2 text-xs">
        <li
          v-for="(item, idx) in book.history"
          :key="idx"
          class="rounded-full border-2 border-(--color-tinta) bg-white dark:bg-slate-900 px-3 py-1 font-semibold tabular-nums"
        >
          <span class="text-muted">{{ item.time }}</span> · {{ item.targetName }}
          <strong :class="item.delta > 0 ? 'text-primary' : 'text-error'">
            {{ item.delta > 0 ? `+${item.delta}` : item.delta }}
          </strong>
        </li>
      </ul>
    </div>

    <UModal
      v-model:open="confirmResetOpen"
      title="Reset semua poin ke 0?"
      description="Seluruh catatan poin siswa dan kelompok pada kelas ini akan dikembalikan ke nol untuk memulai pekan baru."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="confirmResetOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            @click="resetAllPoints"
          >
            Ya, reset semua poin
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

