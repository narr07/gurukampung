<script setup lang="ts">
import DieFace from './DieFace.vue'
import CubeNet from './CubeNet.vue'
import { mulberry32, newSeed } from '~/utils/random'
import { rollDice, spin } from '~/utils/dice'

const rng = mulberry32(newSeed())
const reducedMotion = usePreferredReducedMotion()
const animate = computed(() => reducedMotion.value !== 'reduce')

const tabs = [
  { label: 'Dadu', value: 'dadu', icon: 'i-lucide-dices', slot: 'dadu' as const },
  { label: 'Spinner', value: 'spinner', icon: 'i-lucide-loader-pinwheel', slot: 'spinner' as const },
  { label: 'Cetak jaring-jaring', value: 'cetak', icon: 'i-lucide-printer', slot: 'cetak' as const }
]
const tab = useLocalStorage('gurukampung:dadu:tab', 'dadu', { initOnMounted: true })

// ---------- Dadu
const diceCount = useLocalStorage('gurukampung:dadu:jumlah', 1, { initOnMounted: true })
const diceItems = [1, 2, 3, 4, 5, 6].map(n => ({ value: n, label: `${n} dadu` }))
const faces = ref<number[]>([1])
const rolling = ref(false)
const history = ref<{ faces: number[], total: number }[]>([])
const total = computed(() => faces.value.reduce((a, b) => a + b, 0))

watch(diceCount, n => (faces.value = Array(n).fill(1)), { immediate: true })

async function roll() {
  if (rolling.value) return
  const result = rollDice(rng, diceCount.value)
  // Gerak singkat hanya saat dadu dilempar, dan dilewati kalau pengguna memilih kurangi gerakan
  if (animate.value) {
    rolling.value = true
    for (let i = 0; i < 6; i++) {
      faces.value = rollDice(rng, diceCount.value)
      await new Promise(r => setTimeout(r, 60))
    }
    rolling.value = false
  }
  faces.value = result
  history.value = [{ faces: result, total: result.reduce((a, b) => a + b, 0) }, ...history.value].slice(0, 10)
}

// ---------- Spinner
const optionsText = useLocalStorage('gurukampung:spinner:isi', 'Merah\nKuning\nHijau\nBiru', { initOnMounted: true })
const options = computed(() => optionsText.value.split('\n').map(o => o.trim()).filter(Boolean).slice(0, 24))
const wheel = useTemplateRef<{ spinTo: (i: number) => void, spinning: boolean }>('wheel')
const picked = ref<number | null>(null)
watch(options, () => (picked.value = null))

function spinWheel() {
  const result = spin(rng, options.value)
  if (!result || wheel.value?.spinning) return
  picked.value = null
  wheel.value?.spinTo(result.index)
}

// ---------- Cetak jaring-jaring
const faceSize = useLocalStorage('gurukampung:dadu:ukuran', 35, { initOnMounted: true })
// Lebar jaring-jaring termasuk lidah lem (lihat CubeNet.vue), ditambah padding 12 mm di pratinjau
const netWidthMm = computed(() => faceSize.value * 4 + 2 * (faceSize.value * 0.28 + 1) + 12)
const sizeItems = [30, 35, 40, 45].map(mm => ({ value: mm, label: `${mm} mm per sisi` }))
const printMode = useLocalStorage<'titik' | 'tulisan'>('gurukampung:dadu:cetak-isi', 'titik', { initOnMounted: true })
const printModeItems = [
  { value: 'titik', label: 'Titik dadu 1 sampai 6' },
  { value: 'tulisan', label: 'Tulisan bebas di tiap sisi' }
]
const faceLabels = useLocalStorage('gurukampung:dadu:cetak-tulisan', ['', '', '', '', '', ''], { initOnMounted: true })
</script>

<template>
  <UTabs
    v-model="tab"
    :items="tabs"
    variant="link"
    class="w-full"
  >
    <template #dadu>
      <ProjectorShell v-slot="{ projector }">
        <div class="flex flex-wrap items-end gap-3">
          <UFormField label="Jumlah dadu">
            <USelect
              v-model="diceCount"
              :items="diceItems"
              class="w-32"
            />
          </UFormField>
        </div>

        <div
          class="mt-6 flex flex-wrap items-center justify-center gap-4"
          aria-live="polite"
        >
          <DieFace
            v-for="(f, i) in faces"
            :key="i"
            :value="f"
            :class="projector ? 'size-40' : 'size-24 sm:size-28'"
          />
        </div>

        <div
          v-if="faces.length > 1 && !rolling"
          class="mt-4 flex justify-center"
        >
          <span class="lencana-pensil px-4 py-1 font-display text-2xl font-extrabold">
            Jumlah: {{ total }}
          </span>
        </div>

        <div class="mt-6 flex justify-center">
          <UButton
            size="xl"
            icon="i-lucide-dices"
            :loading="rolling"
            @click="roll"
          >
            Lempar dadu
          </UButton>
        </div>

        <div
          v-if="history.length && !projector"
          class="mt-8"
        >
          <h2 class="text-sm font-bold text-slate-700 dark:text-slate-300">
            10 lemparan terakhir
          </h2>
          <ol class="mt-2 flex flex-wrap gap-2 text-sm">
            <li
              v-for="(h, i) in history"
              :key="i"
              class="rounded-full border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800 px-3 py-1 font-semibold tabular-nums"
            >
              {{ h.faces.join(' + ') }}<span v-if="h.faces.length > 1"> = {{ h.total }}</span>
            </li>
          </ol>
        </div>
      </ProjectorShell>
    </template>

    <template #spinner>
      <ProjectorShell v-slot="{ projector }">
        <div class="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div class="flex flex-col items-center gap-6">
            <div
              class="relative"
              :class="projector ? 'size-[32rem] max-w-full' : 'size-72 sm:size-80'"
            >
              <SpinWheel
                ref="wheel"
                class="size-full"
                :options="options"
                :label="`Spinner dengan ${options.length} pilihan`"
                @done="i => (picked = i)"
              />
            </div>

            <div
              class="min-h-12 flex items-center justify-center text-center"
              aria-live="polite"
            >
              <span
                v-if="picked !== null"
                class="lencana-pensil px-5 py-1.5 font-display text-3xl font-extrabold"
              >
                {{ options[picked] }}
              </span>
            </div>

            <UButton
              size="xl"
              icon="i-lucide-rotate-cw"
              :disabled="options.length < 2"
              :loading="wheel?.spinning"
              @click="spinWheel"
            >
              Putar
            </UButton>
          </div>

          <UFormField
            v-if="!projector"
            label="Isi spinner"
            hint="Satu pilihan per baris, paling banyak 24"
          >
            <UTextarea
              v-model="optionsText"
              :rows="10"
              class="w-full"
            />
          </UFormField>
        </div>
      </ProjectorShell>
    </template>

    <template #cetak>
      <div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div class="space-y-4">
          <UFormField label="Ukuran">
            <USelect
              v-model="faceSize"
              :items="sizeItems"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Isi sisi dadu">
            <USelect
              v-model="printMode"
              :items="printModeItems"
              class="w-full"
            />
          </UFormField>
          <div
            v-if="printMode === 'tulisan'"
            class="grid grid-cols-2 gap-2"
          >
            <UInput
              v-for="i in 6"
              :key="i"
              v-model="faceLabels[i - 1]"
              :placeholder="`Sisi ${i}`"
              :aria-label="`Tulisan sisi ${i}`"
            />
          </div>
          <p class="text-sm text-muted">
            Gunting di garis tegas, lipat di garis putus-putus, lalu rekatkan bagian berlabel "lem".
          </p>
        </div>

        <PrintLayout v-slot="{ widthMm }">
          <UAlert
            v-if="netWidthMm > widthMm"
            class="m-4 print:hidden"
            color="warning"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            title="Jaring-jaring lebih lebar dari kertas"
            description="Pilih arah kertas Mendatar, atau ukuran sisi yang lebih kecil."
          />
          <div class="p-6">
            <CubeNet
              :size-mm="faceSize"
              :labels="printMode === 'tulisan' ? faceLabels : undefined"
            />
          </div>
        </PrintLayout>
      </div>
    </template>
  </UTabs>
</template>
