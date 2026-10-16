<script setup lang="ts">
import { buildNumberLineTicks } from '~/utils/fase3'

const minVal = useLocalStorage('gurukampung:garis:min', -10, { initOnMounted: true })
const maxVal = useLocalStorage('gurukampung:garis:max', 10, { initOnMounted: true })
const startPos = useLocalStorage('gurukampung:garis:awal', -2, { initOnMounted: true })
const jumpDelta = useLocalStorage('gurukampung:garis:lompat', 5, { initOnMounted: true })
const showAnswer = useLocalStorage('gurukampung:garis:tampil', true, { initOnMounted: true })

const ticks = computed(() => {
  const lo = Math.max(-25, Math.min(minVal.value, maxVal.value - 2))
  const hi = Math.min(25, Math.max(maxVal.value, lo + 2))
  return buildNumberLineTicks(lo, hi)
})

const endPos = computed(() => startPos.value + jumpDelta.value)

const steps = computed(() => {
  const count = Math.abs(jumpDelta.value)
  const dir = jumpDelta.value >= 0 ? 1 : -1
  return Array.from({ length: count }, (_, i) => ({
    from: startPos.value + i * dir,
    to: startPos.value + (i + 1) * dir
  }))
})

function xFor(val: number): number {
  const list = ticks.value
  if (list.length <= 1) return 400
  const lo = list[0]!
  const hi = list[list.length - 1]!
  const ratio = (val - lo) / (hi - lo)
  return 50 + ratio * 700
}

const equationText = computed(() => {
  const op = jumpDelta.value >= 0 ? '+' : '−'
  const absDelta = Math.abs(jumpDelta.value)
  const ans = showAnswer.value ? endPos.value : '?'
  return `${startPos.value} ${op} ${absDelta} = ${ans}`
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <UFormField label="Batas kiri (Min)">
        <UInputNumber
          v-model="minVal"
          :min="-20"
          :max="0"
        />
      </UFormField>
      <UFormField label="Batas kanan (Maks)">
        <UInputNumber
          v-model="maxVal"
          :min="2"
          :max="25"
        />
      </UFormField>
      <UFormField label="Titik awal">
        <UInputNumber
          v-model="startPos"
          :min="minVal"
          :max="maxVal"
        />
      </UFormField>
      <UFormField
        label="Lompatan (+ maju / - mundur)"
      >
        <UInputNumber
          v-model="jumpDelta"
          :min="-20"
          :max="20"
        />
      </UFormField>
      <div class="flex items-end pb-1">
        <USwitch
          v-model="showAnswer"
          label="Tampilkan hasil akhir"
        />
      </div>
    </div>

    <ProjectorShell>
      <div class="flex flex-col items-center gap-6 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-6 shadow-[0_4px_0_0_var(--color-tinta)]">
        <div
          class="lencana-pensil px-6 py-2 font-display text-3xl sm:text-4xl font-extrabold tabular-nums"
          aria-live="polite"
        >
          {{ equationText }}
        </div>

        <div class="w-full overflow-x-auto">
          <svg
            viewBox="0 0 800 220"
            class="w-full min-w-[38rem]"
            role="img"
            :aria-label="`Garis bilangan dari ${ticks[0]} sampai ${ticks[ticks.length - 1]}`"
          >
            <!-- Busur lompatan -->
            <g
              v-for="(st, idx) in steps"
              :key="`arc-${idx}`"
            >
              <path
                :d="`M ${xFor(st.from)} 120 Q ${(xFor(st.from) + xFor(st.to)) / 2} 55 ${xFor(st.to)} 120`"
                fill="none"
                :stroke="jumpDelta >= 0 ? '#0d9488' : '#e11d48'"
                stroke-width="3.5"
                stroke-dasharray="5 3"
              />
            </g>

            <!-- Garis utama -->
            <line
              x1="25"
              y1="125"
              x2="775"
              y2="125"
              stroke="#0f172a"
              stroke-width="4"
              stroke-linecap="round"
            />

            <!-- Tanda panah ujung garis -->
            <polygon
              points="18,125 32,117 32,133"
              fill="#0f172a"
            />
            <polygon
              points="782,125 768,117 768,133"
              fill="#0f172a"
            />

            <!-- Titik dan angka -->
            <g
              v-for="t in ticks"
              :key="`t-${t}`"
            >
              <line
                :x1="xFor(t)"
                :y1="t === 0 ? 111 : 116"
                :x2="xFor(t)"
                :y2="t === 0 ? 139 : 134"
                stroke="#0f172a"
                :stroke-width="t === 0 ? 4 : 2.5"
              />
              <text
                :x="xFor(t)"
                y="162"
                text-anchor="middle"
                font-size="14"
                :font-weight="t === 0 || t === startPos || (showAnswer && t === endPos) ? '800' : '600'"
                :fill="t < 0 ? '#be123c' : '#0f172a'"
              >{{ t }}</text>
            </g>

            <!-- Penanda titik awal -->
            <circle
              :cx="xFor(startPos)"
              cy="125"
              r="9"
              fill="#facc15"
              stroke="#0f172a"
              stroke-width="3"
            />
            <text
              :x="xFor(startPos)"
              y="192"
              text-anchor="middle"
              font-size="12"
              font-weight="800"
              fill="#0f172a"
            >Awal ({{ startPos }})</text>

            <!-- Penanda titik akhir -->
            <g v-if="showAnswer">
              <circle
                :cx="xFor(endPos)"
                cy="125"
                r="10"
                :fill="jumpDelta >= 0 ? '#14b8a6' : '#f43f5e'"
                stroke="#0f172a"
                stroke-width="3"
              />
              <text
                :x="xFor(endPos)"
                y="38"
                text-anchor="middle"
                font-size="13"
                font-weight="800"
                fill="#0f172a"
              >Hasil = {{ endPos }}</text>
            </g>
          </svg>
        </div>
      </div>
    </ProjectorShell>
  </div>
</template>

