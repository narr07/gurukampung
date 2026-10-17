<script setup lang="ts">
import { mulberry32, newSeed, pick } from '~/utils/random'
import { beep } from '~/utils/sound'

const rng = mulberry32(newSeed())
const { classId, students } = useActiveClass()

const source = useLocalStorage<'kelas' | 'manual'>('gurukampung:pemilih:sumber', 'kelas', { initOnMounted: true })
const manualText = useLocalStorage('gurukampung:pemilih:manual', '', { initOnMounted: true })
const mode = useLocalStorage<'roda' | 'kartu'>('gurukampung:pemilih:mode', 'roda', { initOnMounted: true })
const noRepeat = useLocalStorage('gurukampung:pemilih:tanpa-ulang', true, { initOnMounted: true })
const withSound = useLocalStorage('gurukampung:pemilih:suara', true, { initOnMounted: true })

const names = computed(() =>
  source.value === 'kelas'
    ? students.value.map(s => s.nickname || s.name)
    : manualText.value.split('\n').map(n => n.trim()).filter(Boolean)
)

const pickedNames = ref<string[]>([])
watch(names, () => (pickedNames.value = []))
const remaining = computed(() => (noRepeat.value ? names.value.filter(n => !pickedNames.value.includes(n)) : names.value))

const current = ref<string | null>(null)
let pending: string | null = null
const wheel = useTemplateRef<{ spinTo: (i: number) => void, spinning: boolean }>('wheel')

function choose() {
  if (remaining.value.length === 0 || wheel.value?.spinning) return
  const name = pick(rng, remaining.value)!
  current.value = null
  if (mode.value === 'roda') {
    pending = name
    wheel.value?.spinTo(remaining.value.indexOf(name))
  } else {
    finish(name)
  }
}

function onWheelDone() {
  if (pending) finish(pending)
  pending = null
}

function finish(name: string) {
  current.value = name
  if (noRepeat.value) pickedNames.value = [...pickedNames.value, name]
  if (withSound.value) beep({ times: 2, frequency: 1046 })
}

function resetRound() {
  pickedNames.value = []
  current.value = null
}

const sourceItems = [
  { value: 'kelas', label: 'Dari Data Kelas' },
  { value: 'manual', label: 'Ketik nama sendiri' }
]
const modeItems = [
  { value: 'roda', label: 'Roda putar' },
  { value: 'kartu', label: 'Kartu acak' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
    <div class="space-y-4">
      <UFormField label="Sumber nama">
        <USelect
          v-model="source"
          :items="sourceItems"
          class="w-full"
        />
      </UFormField>
      <ClassPicker
        v-if="source === 'kelas'"
        v-model="classId"
      />
      <UFormField
        v-else
        label="Daftar nama"
        hint="Satu nama per baris"
      >
        <UTextarea
          v-model="manualText"
          :rows="8"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Tampilan">
        <USelect
          v-model="mode"
          :items="modeItems"
          class="w-full"
        />
      </UFormField>
      <USwitch
        v-model="noRepeat"
        label="Jangan ulangi sampai semua kebagian"
      />
      <USwitch
        v-model="withSound"
        label="Bunyi saat terpilih"
      />
    </div>

    <ProjectorShell v-slot="{ projector }">
      <div class="flex flex-col items-center gap-6">
        <UEmpty
          v-if="names.length === 0"
          icon="i-lucide-users"
          title="Belum ada nama"
          description="Pilih kelas yang sudah berisi siswa, atau ketik daftar nama sendiri."
        />

        <template v-else>
          <SpinWheel
            v-if="mode === 'roda'"
            ref="wheel"
            :class="projector ? 'size-[30rem] max-w-full' : 'size-72 sm:size-96'"
            :options="remaining"
            :label="`Roda berisi ${remaining.length} nama`"
            @done="onWheelDone"
          />

          <div
            v-else
            class="flex min-h-44 w-full max-w-xl items-center justify-center rounded-3xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-6 shadow-[0_4px_0_0_var(--color-tinta)]"
          >
            <span
              v-if="!current"
              class="font-medium text-slate-600 dark:text-slate-300"
            >Tekan tombol untuk mengambil satu kartu</span>
            <span
              v-else
              class="font-display text-4xl font-extrabold text-slate-900 dark:text-white"
            >{{ current }}</span>
          </div>

          <div
            class="min-h-14 flex items-center justify-center text-center"
            aria-live="polite"
          >
            <span
              v-if="current && mode === 'roda'"
              :key="current"
              class="hasil-muncul lencana-pensil px-5 py-2 font-display text-3xl sm:text-4xl font-extrabold"
            >
              {{ current }}
            </span>
          </div>

          <div class="flex flex-wrap justify-center gap-2">
            <UButton
              size="xl"
              :icon="mode === 'roda' ? 'i-lucide-rotate-cw' : 'i-lucide-shuffle'"
              :disabled="remaining.length === 0"
              :loading="wheel?.spinning"
              @click="choose"
            >
              {{ mode === 'roda' ? 'Putar roda' : 'Ambil kartu' }}
            </UButton>
            <UButton
              v-if="noRepeat && pickedNames.length"
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-rotate-ccw"
              @click="resetRound"
            >
              Mulai putaran baru
            </UButton>
          </div>

          <p
            v-if="noRepeat"
            class="text-sm text-muted"
          >
            <template v-if="remaining.length">
              {{ remaining.length }} dari {{ names.length }} belum terpilih.
            </template>
            <template v-else>
              Semua sudah kebagian. Mulai putaran baru untuk mengulang.
            </template>
          </p>
        </template>
      </div>
    </ProjectorShell>
  </div>
</template>
