<script setup lang="ts">
import { compareFractions, equivalentFractions, simplifyFraction } from '~/utils/fase3'

const shape = useLocalStorage<'lingkaran' | 'batang'>('gurukampung:pecahan:bentuk', 'lingkaran', { initOnMounted: true })
const num1 = useLocalStorage('gurukampung:pecahan:n1', 1, { initOnMounted: true })
const den1 = useLocalStorage('gurukampung:pecahan:d1', 2, { initOnMounted: true })
const num2 = useLocalStorage('gurukampung:pecahan:n2', 2, { initOnMounted: true })
const den2 = useLocalStorage('gurukampung:pecahan:d2', 4, { initOnMounted: true })

watch(den1, (d) => {
  if (num1.value > d) num1.value = d
})
watch(den2, (d) => {
  if (num2.value > d) num2.value = d
})

const comparison = computed(() => compareFractions(num1.value, den1.value, num2.value, den2.value))
const simplified1 = computed(() => simplifyFraction(num1.value, den1.value))
const simplified2 = computed(() => simplifyFraction(num2.value, den2.value))
const equivalents1 = computed(() => equivalentFractions(num1.value, den1.value, 4))

function sectorPath(index: number, total: number, r = 88): string {
  if (total <= 1) return `M 0 -${r} A ${r} ${r} 0 1 1 -0.01 -${r} Z`
  const startAngle = (index * 2 * Math.PI) / total - Math.PI / 2
  const endAngle = ((index + 1) * 2 * Math.PI) / total - Math.PI / 2
  const x1 = r * Math.cos(startAngle)
  const y1 = r * Math.sin(startAngle)
  const x2 = r * Math.cos(endAngle)
  const y2 = r * Math.sin(endAngle)
  const largeArc = 2 * Math.PI / total > Math.PI ? 1 : 0
  return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

const shapeItems = [
  { value: 'lingkaran', label: 'Lingkaran (Pie)' },
  { value: 'batang', label: 'Batang pecahan' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
    <div class="space-y-4">
      <UFormField label="Bentuk peraga">
        <USelect
          v-model="shape"
          :items="shapeItems"
          class="w-full"
        />
      </UFormField>

      <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3.5 space-y-3">
        <p class="font-display font-bold text-highlighted">
          Pecahan Pertama (Kiri)
        </p>
        <div class="grid grid-cols-2 gap-2">
          <UFormField label="Pembilang">
            <UInputNumber
              v-model="num1"
              :min="0"
              :max="den1"
            />
          </UFormField>
          <UFormField label="Penyebut">
            <UInputNumber
              v-model="den1"
              :min="1"
              :max="12"
            />
          </UFormField>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3.5 space-y-3">
        <p class="font-display font-bold text-highlighted">
          Pecahan Kedua (Kanan)
        </p>
        <div class="grid grid-cols-2 gap-2">
          <UFormField label="Pembilang">
            <UInputNumber
              v-model="num2"
              :min="0"
              :max="den2"
            />
          </UFormField>
          <UFormField label="Penyebut">
            <UInputNumber
              v-model="den2"
              :min="1"
              :max="12"
            />
          </UFormField>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-3.5 text-sm space-y-1.5">
        <p class="font-display font-bold text-highlighted">
          Pecahan Senilai (Pecahan Kiri)
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <span
            v-for="(eq, idx) in equivalents1"
            :key="idx"
            class="lencana-pensil px-2.5 py-0.5 text-xs font-bold tabular-nums"
          >
            {{ eq.num }}/{{ eq.den }}
          </span>
        </div>
      </div>
    </div>

    <ProjectorShell v-slot="{ projector }">
      <div class="flex flex-col items-center gap-8">
        <div class="grid w-full items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <!-- Pecahan 1 -->
          <div class="flex flex-col items-center gap-4 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-6 shadow-[0_4px_0_0_var(--color-tinta)]">
            <svg
              v-if="shape === 'lingkaran'"
              viewBox="-100 -100 200 200"
              :class="projector ? 'size-64' : 'size-48'"
              role="img"
              :aria-label="`Pecahan ${num1} per ${den1}`"
            >
              <path
                v-for="idx in den1"
                :key="`p1-${idx}`"
                :d="sectorPath(idx - 1, den1)"
                :fill="idx <= num1 ? '#14b8a6' : '#fef3c7'"
                stroke="#0f172a"
                stroke-width="3"
              />
            </svg>

            <div
              v-else
              class="grid h-16 w-full overflow-hidden rounded-2xl border-2 border-(--color-tinta)"
              :style="{ gridTemplateColumns: `repeat(${den1}, minmax(0, 1fr))` }"
            >
              <div
                v-for="idx in den1"
                :key="`b1-${idx}`"
                class="border-r-2 last:border-r-0 border-(--color-tinta)"
                :class="idx <= num1 ? 'bg-teal-500' : 'bg-amber-100'"
              />
            </div>

            <div class="text-center">
              <p class="font-display text-4xl font-extrabold tabular-nums text-highlighted">
                {{ num1 }} / {{ den1 }}
              </p>
              <p class="text-xs font-medium text-muted">
                Bentuk sederhana: {{ simplified1.num }}/{{ simplified1.den }} ({{ Math.round((num1 / den1) * 100) }}%)
              </p>
            </div>
          </div>

          <!-- Tanda Pembanding -->
          <div class="flex flex-col items-center justify-center">
            <div
              class="lencana-pensil flex size-20 items-center justify-center font-display text-5xl font-extrabold"
              aria-live="polite"
            >
              {{ comparison }}
            </div>
            <span class="mt-2 text-xs font-bold uppercase tracking-wider text-muted">
              {{ comparison === '=' ? 'Senilai' : comparison === '>' ? 'Lebih besar' : 'Lebih kecil' }}
            </span>
          </div>

          <!-- Pecahan 2 -->
          <div class="flex flex-col items-center gap-4 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-6 shadow-[0_4px_0_0_var(--color-tinta)]">
            <svg
              v-if="shape === 'lingkaran'"
              viewBox="-100 -100 200 200"
              :class="projector ? 'size-64' : 'size-48'"
              role="img"
              :aria-label="`Pecahan ${num2} per ${den2}`"
            >
              <path
                v-for="idx in den2"
                :key="`p2-${idx}`"
                :d="sectorPath(idx - 1, den2)"
                :fill="idx <= num2 ? '#facc15' : '#fef3c7'"
                stroke="#0f172a"
                stroke-width="3"
              />
            </svg>

            <div
              v-else
              class="grid h-16 w-full overflow-hidden rounded-2xl border-2 border-(--color-tinta)"
              :style="{ gridTemplateColumns: `repeat(${den2}, minmax(0, 1fr))` }"
            >
              <div
                v-for="idx in den2"
                :key="`b2-${idx}`"
                class="border-r-2 last:border-r-0 border-(--color-tinta)"
                :class="idx <= num2 ? 'bg-(--color-pensil)' : 'bg-amber-100'"
              />
            </div>

            <div class="text-center">
              <p class="font-display text-4xl font-extrabold tabular-nums text-highlighted">
                {{ num2 }} / {{ den2 }}
              </p>
              <p class="text-xs font-medium text-muted">
                Bentuk sederhana: {{ simplified2.num }}/{{ simplified2.den }} ({{ Math.round((num2 / den2) * 100) }}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProjectorShell>
  </div>
</template>

