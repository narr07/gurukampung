<script setup lang="ts">
import { beep } from '~/utils/sound'

const tab = useLocalStorage('gurukampung:timer:tab', 'timer', { initOnMounted: true })
const tabs = [
  { label: 'Timer', value: 'timer', icon: 'i-lucide-timer', slot: 'timer' as const },
  { label: 'Stopwatch', value: 'stopwatch', icon: 'i-lucide-watch', slot: 'stopwatch' as const }
]

const fmt = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const now = ref(Date.now())
useIntervalFn(() => (now.value = Date.now()), 200)

// ---------- Timer
const minutes = useLocalStorage('gurukampung:timer:menit', 5, { initOnMounted: true })
const seconds = useLocalStorage('gurukampung:timer:detik', 0, { initOnMounted: true })
const duration = computed(() => (Math.max(0, minutes.value) * 60 + Math.max(0, Math.min(59, seconds.value))) * 1000)
const endsAt = ref<number | null>(null)
const pausedLeft = ref<number | null>(null)
const finished = ref(false)

const left = computed(() => {
  if (endsAt.value) return Math.max(0, endsAt.value - now.value)
  if (pausedLeft.value !== null) return pausedLeft.value
  return duration.value
})
const running = computed(() => endsAt.value !== null)

watch(left, (ms) => {
  if (running.value && ms <= 0) {
    endsAt.value = null
    pausedLeft.value = null
    finished.value = true
    beep({ times: 3, frequency: 988, duration: 0.3, gap: 0.2 })
  }
})

function start() {
  finished.value = false
  endsAt.value = Date.now() + (pausedLeft.value ?? duration.value)
  pausedLeft.value = null
}
function pause() {
  pausedLeft.value = left.value
  endsAt.value = null
}
function reset() {
  endsAt.value = null
  pausedLeft.value = null
  finished.value = false
}
function preset(m: number) {
  reset()
  minutes.value = m
  seconds.value = 0
}

const wakeLock = reactive(useWakeLock())
watch(running, async (on) => {
  if (!wakeLock.isSupported) return
  if (on) await wakeLock.request('screen')
  else await wakeLock.release()
})

// ---------- Stopwatch
const swStart = ref<number | null>(null)
const swElapsed = ref(0)
const laps = ref<number[]>([])
const swNow = computed(() => swElapsed.value + (swStart.value ? now.value - swStart.value : 0))
const fmtSw = (ms: number) => {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const t = Math.floor((ms % 1000) / 100)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${t}`
}
function swToggle() {
  if (swStart.value) {
    swElapsed.value += Date.now() - swStart.value
    swStart.value = null
  } else {
    swStart.value = Date.now()
  }
}
function swReset() {
  swStart.value = null
  swElapsed.value = 0
  laps.value = []
}
</script>

<template>
  <UTabs
    v-model="tab"
    :items="tabs"
    variant="link"
  >
    <template #timer>
      <ProjectorShell v-slot="{ projector }">
        <div class="flex flex-col items-center gap-6">
          <div
            class="flex flex-wrap justify-center gap-2 print:hidden"
            :class="{ hidden: projector }"
          >
            <UButton
              v-for="m in [1, 3, 5, 10, 15]"
              :key="m"
              color="neutral"
              :variant="minutes === m && seconds === 0 ? 'solid' : 'outline'"
              :disabled="running"
              @click="preset(m)"
            >
              {{ m }} menit
            </UButton>
          </div>

          <div
            v-if="!running && pausedLeft === null"
            class="flex items-end gap-2"
            :class="{ hidden: projector }"
          >
            <UFormField label="Menit">
              <UInputNumber
                v-model="minutes"
                :min="0"
                :max="180"
                class="w-28"
              />
            </UFormField>
            <UFormField label="Detik">
              <UInputNumber
                v-model="seconds"
                :min="0"
                :max="59"
                class="w-28"
              />
            </UFormField>
          </div>

          <div class="rounded-3xl border-2 border-(--color-tinta) bg-amber-50/60 dark:bg-slate-800/80 px-8 py-6 shadow-[0_4px_0_0_var(--color-tinta)]">
            <p
              class="font-display font-extrabold tabular-nums leading-none"
              :class="[projector ? 'text-[10rem]' : 'text-7xl sm:text-9xl', running ? 'text-secondary' : finished ? 'text-error' : 'text-highlighted']"
              role="timer"
              aria-live="off"
            >
              {{ fmt(left) }}
            </p>
          </div>
          <p
            class="min-h-8 text-2xl font-display font-bold text-error"
            aria-live="assertive"
          >
            {{ finished ? 'Waktu habis!' : '' }}
          </p>

          <div class="flex flex-wrap justify-center gap-2">
            <UButton
              v-if="!running"
              size="xl"
              icon="i-lucide-play"
              :disabled="duration === 0 && pausedLeft === null"
              @click="start"
            >
              {{ pausedLeft !== null ? 'Lanjutkan' : 'Mulai' }}
            </UButton>
            <UButton
              v-else
              size="xl"
              icon="i-lucide-pause"
              @click="pause"
            >
              Jeda
            </UButton>
            <UButton
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-rotate-ccw"
              @click="reset"
            >
              Ulang
            </UButton>
          </div>
        </div>
      </ProjectorShell>
    </template>

    <template #stopwatch>
      <ProjectorShell v-slot="{ projector }">
        <div class="flex flex-col items-center gap-6">
          <div class="rounded-3xl border-2 border-(--color-tinta) bg-amber-50/60 dark:bg-slate-800/80 px-8 py-6 shadow-[0_4px_0_0_var(--color-tinta)]">
            <p
              class="font-display font-extrabold tabular-nums leading-none"
              :class="[projector ? 'text-[9rem]' : 'text-7xl sm:text-8xl', swStart ? 'text-secondary' : 'text-highlighted']"
              role="timer"
              aria-live="off"
            >
              {{ fmtSw(swNow) }}
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-2">
            <UButton
              size="xl"
              :icon="swStart ? 'i-lucide-pause' : 'i-lucide-play'"
              @click="swToggle"
            >
              {{ swStart ? 'Jeda' : swElapsed ? 'Lanjutkan' : 'Mulai' }}
            </UButton>
            <UButton
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-flag"
              :disabled="!swStart"
              @click="laps.unshift(swNow)"
            >
              Catat putaran
            </UButton>
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              icon="i-lucide-rotate-ccw"
              @click="swReset"
            >
              Ulang
            </UButton>
          </div>
          <ol
            v-if="laps.length"
            class="w-full max-w-xs divide-y-2 divide-(--color-tinta)/15 rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 px-4 py-2 text-lg tabular-nums"
          >
            <li
              v-for="(lap, i) in laps"
              :key="i"
              class="flex justify-between py-1.5"
            >
              <span class="font-medium text-muted">Putaran {{ laps.length - i }}</span>
              <span class="font-bold">{{ fmtSw(lap) }}</span>
            </li>
          </ol>
        </div>
      </ProjectorShell>
    </template>
  </UTabs>
</template>

