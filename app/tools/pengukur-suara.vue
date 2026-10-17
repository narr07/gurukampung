<script setup lang="ts">
const calmMax = useLocalStorage('gurukampung:suara:tenang', 35, { initOnMounted: true })
const loudMin = useLocalStorage('gurukampung:suara:ramai', 68, { initOnMounted: true })

const listening = ref(false)
const level = ref(0)
const peak = ref(0)
const micError = ref<string | null>(null)

let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let mediaStream: MediaStream | null = null
let rafId: number | null = null

// Bar level digerakkan GSAP quickTo lewat scaleX: satu tween dipakai ulang tiap frame, tanpa menghitung ulang layout
const levelBar = useTemplateRef<HTMLElement>('levelBar')
let levelTo: ((value: number) => void) | undefined

function setupLevelBar() {
  if (!levelBar.value) return
  const { gsap } = useGSAP()
  levelTo = gsap.quickTo(levelBar.value, 'scaleX', { duration: 0.15, ease: 'power2.out' })
}

const zone = computed<'tenang' | 'sedang' | 'ramai'>(() => {
  if (level.value >= loudMin.value) return 'ramai'
  if (level.value >= calmMax.value) return 'sedang'
  return 'tenang'
})

const zoneInfo = computed(() => {
  if (zone.value === 'ramai') {
    return {
      label: 'Ramai! Ayo tenangkan suara',
      bg: 'bg-rose-500 text-white',
      badge: 'RAMAI'
    }
  }
  if (zone.value === 'sedang') {
    return {
      label: 'Suara diskusi kelompok (Sedang)',
      bg: 'bg-(--color-pensil) text-slate-950',
      badge: 'SEDANG'
    }
  }
  return {
    label: 'Kelas tenang dan fokus',
    bg: 'bg-emerald-500 text-slate-950',
    badge: 'TENANG'
  }
})

async function startListening() {
  micError.value = null
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    })
    audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(mediaStream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.82
    source.connect(analyser)

    const buffer = new Uint8Array(analyser.frequencyBinCount)
    listening.value = true
    if (!levelTo) setupLevelBar()

    const tick = () => {
      if (!analyser || !listening.value) return
      analyser.getByteTimeDomainData(buffer)
      let sumSquares = 0
      for (let i = 0; i < buffer.length; i++) {
        const normalized = (buffer[i]! - 128) / 128
        sumSquares += normalized * normalized
      }
      const rms = Math.sqrt(sumSquares / buffer.length)
      const scaled = Math.min(100, Math.round(rms * 260))
      level.value = scaled
      levelTo?.(scaled / 100)
      if (scaled > peak.value) peak.value = scaled
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  } catch {
    micError.value = 'Izin mikrofon belum diberikan atau perangkat tidak memiliki mikrofon aktif.'
    listening.value = false
  }
}

function stopListening() {
  listening.value = false
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
  level.value = 0
  levelTo?.(0)
}

onBeforeUnmount(() => {
  stopListening()
})
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
    <div class="space-y-4">
      <UFormField
        :label="`Batas Tenang ke Sedang (${calmMax}%)`"
        hint="Di bawah angka ini status kelas dianggap Tenang"
      >
        <UInputNumber
          v-model="calmMax"
          :min="10"
          :max="60"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="`Batas Sedang ke Ramai (${loudMin}%)`"
        hint="Di atas angka ini peringatan Ramai menyala"
      >
        <UInputNumber
          v-model="loudMin"
          :min="40"
          :max="95"
          class="w-full"
        />
      </UFormField>

      <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
        <p class="font-bold text-slate-900 dark:text-white">
          Privasi Mikrofon Kelas
        </p>
        <p>
          Suara hanya dihitung tingkat keras-lembutnya saat itu juga di peramban. Tidak ada rekaman suara yang disimpan atau dikirim ke mana pun.
        </p>
      </div>

      <UAlert
        v-if="micError"
        color="error"
        variant="subtle"
        icon="i-lucide-mic-off"
        :description="micError"
      />
    </div>

    <ProjectorShell v-slot="{ projector }">
      <div class="flex flex-col items-center gap-6">
        <div
          class="w-full max-w-xl rounded-3xl border-2 border-(--color-tinta) p-8 text-center transition-colors shadow-[0_5px_0_0_var(--color-tinta)]"
          :class="listening ? zoneInfo.bg : 'bg-amber-50/70 dark:bg-slate-800 text-highlighted'"
          aria-live="polite"
        >
          <span class="inline-block rounded-full border-2 border-(--color-tinta) bg-white px-4 py-1 font-display text-sm font-extrabold text-slate-950">
            {{ listening ? zoneInfo.badge : 'SIAP MEMANTAU' }}
          </span>

          <p
            class="mt-4 font-display font-extrabold tabular-nums leading-none"
            :class="projector ? 'text-[8rem]' : 'text-6xl sm:text-8xl'"
          >
            {{ listening ? `${level}%` : '0%' }}
          </p>

          <p class="mt-3 font-display text-xl sm:text-2xl font-bold">
            {{ listening ? zoneInfo.label : 'Klik tombol Mulai Pantau Suara untuk mengaktifkan mikrofon' }}
          </p>
        </div>

        <!-- Bar indikator tiga warna -->
        <div class="w-full max-w-xl space-y-2">
          <div class="relative h-9 w-full overflow-hidden rounded-full border-2 border-(--color-tinta) bg-slate-100 dark:bg-slate-800">
            <div
              ref="levelBar"
              class="h-full w-full origin-left transition-colors will-change-transform"
              :class="zone === 'ramai' ? 'bg-rose-500' : zone === 'sedang' ? 'bg-(--color-pensil)' : 'bg-emerald-500'"
              style="transform: scaleX(0)"
            />
            <div
              class="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-900"
              :style="{ left: `${calmMax}%` }"
              title="Batas Sedang"
            />
            <div
              class="absolute top-0 bottom-0 border-l-2 border-solid border-slate-900"
              :style="{ left: `${loudMin}%` }"
              title="Batas Ramai"
            />
          </div>
          <div class="flex justify-between text-xs font-bold text-muted tabular-nums">
            <span>0% Tenang</span>
            <span>{{ calmMax }}% Sedang</span>
            <span>{{ loudMin }}% Ramai</span>
            <span>Puncak: {{ peak }}%</span>
          </div>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <UButton
            v-if="!listening"
            size="xl"
            icon="i-lucide-mic"
            @click="startListening"
          >
            Mulai pantau suara
          </UButton>
          <UButton
            v-else
            size="xl"
            color="error"
            icon="i-lucide-mic-off"
            @click="stopListening"
          >
            Hentikan mikrofon
          </UButton>
          <UButton
            v-if="peak > 0"
            size="xl"
            color="neutral"
            variant="outline"
            icon="i-lucide-rotate-ccw"
            @click="peak = 0"
          >
            Reset puncak
          </UButton>
        </div>
      </div>
    </ProjectorShell>
  </div>
</template>
