<script setup lang="ts">
import { mulberry32, randomInt, shuffle } from '~/utils/random'
import { beep } from '~/utils/sound'

const totalMinutes = useLocalStorage('gurukampung:jam:menit-total', 7 * 60 + 30, { initOnMounted: true })
const showDigital = useLocalStorage('gurukampung:jam:digital', true, { initOnMounted: true })
const quizMode = useLocalStorage('gurukampung:jam:kuis', false, { initOnMounted: true })
const { seed, reroll } = useSeed()

const hours24 = computed(() => Math.floor(((totalMinutes.value % 1440) + 1440) % 1440 / 60))
const hours12 = computed(() => {
  const h = hours24.value % 12
  return h === 0 ? 12 : h
})
const minutes = computed(() => ((totalMinutes.value % 60) + 60) % 60)

// Jarum jam dan menit bergerak bersama secara proporsional
const minuteAngle = computed(() => minutes.value * 6)
const hourAngle = computed(() => ((hours12.value % 12) * 30) + (minutes.value * 0.5))

const digitalText = computed(() => `${String(hours24.value).padStart(2, '0')}:${String(minutes.value).padStart(2, '0')}`)

function stepMinutes(delta: number) {
  totalMinutes.value = ((totalMinutes.value + delta) % 1440 + 1440) % 1440
  feedback.value = null
}

// Geser jarum menit langsung pada SVG jam
const svgRef = useTemplateRef<SVGSVGElement>('svgRef')
const dragging = ref(false)

function setFromPointer(e: PointerEvent) {
  if (!svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90 + 360) % 360
  const newMin = Math.round(deg / 6) % 60
  const oldMin = minutes.value
  let h = hours24.value
  if (oldMin > 45 && newMin < 15) h = (h + 1) % 24
  else if (oldMin < 15 && newMin > 45) h = (h + 23) % 24
  totalMinutes.value = h * 60 + newMin
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true
  ;(e.currentTarget as Element)?.setPointerCapture?.(e.pointerId)
  setFromPointer(e)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  setFromPointer(e)
}

function onPointerUp() {
  dragging.value = false
}

// Mode tebak jam
const feedback = ref<'benar' | 'salah' | null>(null)

function newQuizQuestion() {
  reroll()
  const rng = mulberry32(seed.value)
  const h = randomInt(rng, 1, 12)
  const m = randomInt(rng, 0, 11) * 5
  totalMinutes.value = h * 60 + m
  feedback.value = null
}

const quizOptions = computed(() => {
  const rng = mulberry32(seed.value + 101)
  const correct = `${String(hours12.value).padStart(2, '0')}:${String(minutes.value).padStart(2, '0')}`
  const set = new Set<string>([correct])
  while (set.size < 4) {
    const h = randomInt(rng, 1, 12)
    const m = randomInt(rng, 0, 11) * 5
    set.add(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return shuffle(rng, [...set])
})

function answerQuiz(choice: string) {
  const correct = `${String(hours12.value).padStart(2, '0')}:${String(minutes.value).padStart(2, '0')}`
  if (choice === correct) {
    feedback.value = 'benar'
    beep({ times: 2, frequency: 1046 })
  } else {
    feedback.value = 'salah'
    beep({ times: 1, frequency: 330 })
  }
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[19rem_1fr]">
    <div class="space-y-4">
      <USwitch
        v-model="showDigital"
        :disabled="quizMode"
        label="Tampilkan angka jam digital"
      />
      <USwitch
        v-model="quizMode"
        label="Mode tebak jam (kuis kelas)"
        @update:model-value="v => { if (v) newQuizQuestion() }"
      />

      <div class="space-y-2">
        <p class="text-sm font-medium text-highlighted">
          Putar jarum dengan tombol atau geser langsung jarum di jam:
        </p>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(-15)"
          >
            -15 menit
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(15)"
          >
            +15 menit
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(-5)"
          >
            -5 menit
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(5)"
          >
            +5 menit
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(-1)"
          >
            -1 menit
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(1)"
          >
            +1 menit
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(-60)"
          >
            -1 jam
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="stepMinutes(60)"
          >
            +1 jam
          </UButton>
        </div>
      </div>

      <UButton
        v-if="quizMode"
        block
        icon="i-lucide-shuffle"
        @click="newQuizQuestion"
      >
        Soal jam berikutnya
      </UButton>
    </div>

    <ProjectorShell v-slot="{ projector }">
      <div class="flex flex-col items-center gap-6">
        <svg
          ref="svgRef"
          viewBox="-120 -120 240 240"
          role="img"
          :aria-label="`Jam analog menunjukkan pukul ${hours12} lewat ${minutes} menit`"
          class="touch-none cursor-grab active:cursor-grabbing select-none"
          :class="projector ? 'size-[28rem] max-w-full' : 'size-72 sm:size-96'"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <!-- Bingkai luar jam dinding -->
          <circle
            cx="0"
            cy="0"
            r="112"
            fill="var(--color-pensil)"
            stroke="var(--color-tinta)"
            stroke-width="5"
          />
          <circle
            cx="0"
            cy="0"
            r="98"
            fill="#ffffff"
            stroke="var(--color-tinta)"
            stroke-width="4"
          />

          <!-- Garis menit kecil -->
          <g
            v-for="m in 60"
            :key="`tick-${m}`"
            :transform="`rotate(${m * 6})`"
          >
            <line
              x1="0"
              :y1="m % 5 === 0 ? -92 : -94"
              x2="0"
              y2="-98"
              stroke="#0f172b"
              :stroke-width="m % 5 === 0 ? 3 : 1.2"
              stroke-linecap="round"
            />
          </g>

          <!-- Angka 1 sampai 12 -->
          <text
            v-for="h in 12"
            :key="`num-${h}`"
            :x="76 * Math.sin((h * 30) * Math.PI / 180)"
            :y="-76 * Math.cos((h * 30) * Math.PI / 180)"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="16"
            font-weight="700"
            fill="#0f172b"
          >{{ h }}</text>

          <!-- Jarum jam (pendek tebal biru) -->
          <line
            x1="0"
            y1="10"
            x2="0"
            y2="-52"
            stroke="#193cb8"
            stroke-width="7"
            stroke-linecap="round"
            :transform="`rotate(${hourAngle})`"
          />

          <!-- Jarum menit (panjang merah aksen) -->
          <line
            x1="0"
            y1="14"
            x2="0"
            y2="-78"
            stroke="#c10007"
            stroke-width="5"
            stroke-linecap="round"
            :transform="`rotate(${minuteAngle})`"
          />

          <circle
            cx="0"
            cy="0"
            r="6"
            fill="#0f172b"
          />
        </svg>

        <div
          v-if="!quizMode && showDigital"
          class="rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 px-6 py-2 text-4xl sm:text-5xl font-bold tabular-nums text-highlighted"
        >
          {{ digitalText }}
        </div>

        <div
          v-if="quizMode"
          class="space-y-4 text-center"
        >
          <p class="text-lg font-semibold text-highlighted">
            Pukul berapakah yang ditunjukkan jarum jam di atas?
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <UButton
              v-for="opt in quizOptions"
              :key="opt"
              size="xl"
              color="primary"
              class="px-6 text-2xl font-bold tabular-nums"
              @click="answerQuiz(opt)"
            >
              {{ opt }}
            </UButton>
          </div>
          <p
            v-if="feedback"
            class="text-xl font-bold"
            :class="feedback === 'benar' ? 'text-primary' : 'text-error'"
            aria-live="polite"
          >
            {{ feedback === 'benar' ? 'Benar! Jawaban tepat.' : 'Belum tepat, perhatikan kembali posisi jarum pendek dan panjang.' }}
          </p>
        </div>
      </div>
    </ProjectorShell>
  </div>
</template>

