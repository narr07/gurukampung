<script setup lang="ts">
import { PIPS } from '~/utils/dice'

defineProps<{
  value: number
}>()
</script>

<template>
  <svg
    viewBox="0 0 96 100"
    role="img"
    :aria-label="`Dadu menunjukkan ${value}`"
    class="block select-none"
  >
    <!-- Bayangan bawah tiga dimensi bergaya stiker -->
    <rect
      x="5"
      y="9"
      width="86"
      height="86"
      rx="18"
      fill="var(--color-tinta)"
    />
    <rect
      x="5"
      y="3"
      width="86"
      height="86"
      rx="18"
      fill="#ffffff"
      stroke="var(--color-tinta)"
      stroke-width="3.5"
    />
    <circle
      v-for="([c, r], i) in PIPS[value]"
      :key="i"
      :cx="23 + c * 25"
      :cy="21 + r * 25"
      :r="c === 1 && r === 1 && (value === 1 || value === 5) ? 9 : 7.5"
      :fill="c === 1 && r === 1 && (value === 1 || value === 5) ? '#c10007' : '#0f172b'"
    />
  </svg>
</template>
