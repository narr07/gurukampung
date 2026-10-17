<script setup lang="ts">
// Roda putar bersama (Dadu & Spinner, Pemilih Siswa Acak) dengan garis tinta tebal dan warna pensil/langit seperti di beranda.
// Potongan terpilih berwarna aksen merah (DESIGN.md)
const props = defineProps<{
  options: string[]
  label: string
}>()

const emit = defineEmits<{
  done: [index: number]
}>()

const reducedMotion = usePreferredReducedMotion()
const wheel = useTemplateRef<SVGGElement>('wheel')
let rotation = 0
const spinning = ref(false)
const picked = ref<number | null>(null)

const segment = computed(() => 360 / Math.max(props.options.length, 1))
watch(() => props.options, () => (picked.value = null))

// Putaran memakai tween GSAP: onComplete selalu tepat saat roda berhenti (setTimeout bisa meleset kalau tab di latar),
// dan tween dihentikan saat komponen dilepas
let spinTween: { kill: () => void } | undefined

function finish(index: number) {
  spinning.value = false
  picked.value = index
  emit('done', index)
}

function spinTo(index: number) {
  if (spinning.value || index < 0 || index >= props.options.length || !wheel.value) return
  const { gsap } = useGSAP()
  const animate = reducedMotion.value !== 'reduce'
  const target = 360 - (index + 0.5) * segment.value
  const current = rotation % 360
  rotation += (animate ? 5 * 360 : 0) + ((target - current + 360) % 360)
  picked.value = null
  if (!animate) {
    gsap.set(wheel.value, { rotation, svgOrigin: '0 0' })
    finish(index)
    return
  }
  spinning.value = true
  spinTween = gsap.to(wheel.value, {
    rotation,
    svgOrigin: '0 0',
    duration: 3.2,
    ease: 'power4.out',
    onComplete: () => finish(index)
  })
}

onBeforeUnmount(() => spinTween?.kill())

defineExpose({ spinTo, spinning })

function slicePath(i: number) {
  const r = 98
  if (props.options.length === 1) return `M0,${-r} A${r},${r} 0 1 1 -0.01,${-r} Z`
  const a0 = ((i * segment.value) - 90) * Math.PI / 180
  const a1 = (((i + 1) * segment.value) - 90) * Math.PI / 180
  const large = segment.value > 180 ? 1 : 0
  return `M0,0 L${r * Math.cos(a0)},${r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${r * Math.cos(a1)},${r * Math.sin(a1)} Z`
}

function sliceFill(i: number) {
  if (picked.value === i) return '#c10007'
  const palette = ['#ffdf20', '#ffffff', '#bae6fd', '#fef9c2']
  return palette[i % palette.length]
}

function labelPos(i: number) {
  const a = (((i + 0.5) * segment.value) - 90) * Math.PI / 180
  return { x: 58 * Math.cos(a), y: 58 * Math.sin(a), rotate: (i + 0.5) * segment.value - 90 }
}

const fontSize = computed(() => Math.max(5, Math.min(13, 120 / Math.max(props.options.length, 1) + 3)))
const short = (s: string) => (s.length > 14 ? `${s.slice(0, 13)}…` : s)
</script>

<template>
  <svg
    viewBox="-108 -116 216 226"
    role="img"
    :aria-label="label"
  >
    <!-- Bayangan padat roda di sisi bawah -->
    <circle
      cx="0"
      cy="5"
      r="100"
      fill="var(--color-tinta)"
    />
    <g ref="wheel">
      <g
        v-for="(opt, i) in options"
        :key="i"
      >
        <path
          :d="slicePath(i)"
          :fill="sliceFill(i)"
          stroke="#0f172b"
          stroke-width="2"
        />
        <text
          :transform="`translate(${labelPos(i).x} ${labelPos(i).y}) rotate(${labelPos(i).rotate})`"
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="fontSize"
          font-weight="700"
          :fill="picked === i ? '#ffffff' : '#0f172b'"
        >{{ short(opt) }}</text>
      </g>
    </g>
    <!-- Lingkaran luar garis tinta tebal dan poros tengah -->
    <circle
      cx="0"
      cy="0"
      r="98"
      fill="none"
      stroke="var(--color-tinta)"
      stroke-width="4"
    />
    <circle
      cx="0"
      cy="0"
      r="11"
      fill="#ffffff"
      stroke="#0f172b"
      stroke-width="3"
    />
    <path
      d="M-11,-113 L11,-113 L0,-90 Z"
      fill="#c10007"
      stroke="#0f172b"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
  </svg>
</template>
