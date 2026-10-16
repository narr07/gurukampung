<script setup lang="ts">
import { CUBE_FLAPS, CUBE_NET, PIPS, type Edge } from '~/utils/dice'

// Jaring-jaring dadu untuk dicetak: garis tegas = gunting, garis putus-putus = lipat.
// Satuan SVG adalah milimeter supaya ukuran di kertas tepat
const props = defineProps<{
  sizeMm: number
  labels?: string[]
}>()

const FLAP = 0.28
const EDGES: Edge[] = ['top', 'right', 'bottom', 'left']
const STEP: Record<Edge, [number, number]> = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] }

const s = computed(() => props.sizeMm)
const pad = computed(() => s.value * FLAP + 1)
const width = computed(() => s.value * 4 + pad.value * 2)
const height = computed(() => s.value * 3 + pad.value * 2)

const faces = computed(() => CUBE_NET.map(f => ({
  ...f,
  x: pad.value + f.col * s.value,
  y: pad.value + f.row * s.value,
  label: props.labels?.[f.face - 1]?.trim()
})))

const occupied = new Set(CUBE_NET.map(f => `${f.col},${f.row}`))
const hasFlap = (face: number, edge: Edge) => CUBE_FLAPS.some(f => f.face === face && f.edge === edge)

function edgeLine(x: number, y: number, edge: Edge) {
  const S = s.value
  return {
    top: { x1: x, y1: y, x2: x + S, y2: y },
    right: { x1: x + S, y1: y, x2: x + S, y2: y + S },
    bottom: { x1: x, y1: y + S, x2: x + S, y2: y + S },
    left: { x1: x, y1: y, x2: x, y2: y + S }
  }[edge]
}

// Sisi yang bersebelahan dengan sisi lain atau dengan lidah lem dilipat; sisanya digunting
const edges = computed(() => faces.value.flatMap(f => EDGES.map((edge) => {
  const [dc, dr] = STEP[edge]
  const fold = occupied.has(`${f.col + dc},${f.row + dr}`) || hasFlap(f.face, edge)
  return { key: `${f.face}-${edge}`, fold, ...edgeLine(f.x, f.y, edge) }
})))

const flaps = computed(() => CUBE_FLAPS.map(({ face, edge }) => {
  const f = faces.value.find(n => n.face === face)!
  const S = s.value
  const d = S * FLAP
  const i = S * 0.18
  const { x, y } = f
  const path = {
    top: `M${x},${y} L${x + i},${y - d} L${x + S - i},${y - d} L${x + S},${y}`,
    bottom: `M${x},${y + S} L${x + i},${y + S + d} L${x + S - i},${y + S + d} L${x + S},${y + S}`,
    left: `M${x},${y} L${x - d},${y + i} L${x - d},${y + S - i} L${x},${y + S}`,
    right: `M${x + S},${y} L${x + S + d},${y + i} L${x + S + d},${y + S - i} L${x + S},${y + S}`
  }[edge]
  const [dc, dr] = STEP[edge]
  return { key: `${face}-${edge}`, path, cx: x + S / 2 + dc * (S / 2 + d / 2), cy: y + S / 2 + dr * (S / 2 + d / 2) }
}))
</script>

<template>
  <svg
    :width="`${width}mm`"
    :height="`${height}mm`"
    :viewBox="`0 0 ${width} ${height}`"
    role="img"
    aria-label="Jaring-jaring dadu untuk digunting dan dilipat"
    class="block mx-auto"
  >
    <g
      v-for="flap in flaps"
      :key="flap.key"
    >
      <path
        :d="flap.path"
        fill="#eee"
        stroke="#000"
        stroke-width="0.4"
      />
      <text
        :x="flap.cx"
        :y="flap.cy"
        font-size="3"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#444"
      >lem</text>
    </g>

    <g
      v-for="f in faces"
      :key="f.face"
    >
      <text
        v-if="f.label"
        :x="f.x + s / 2"
        :y="f.y + s / 2"
        :font-size="Math.min(s / 3.2, (s * 1.6) / Math.max(f.label.length, 1))"
        font-weight="600"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#000"
      >{{ f.label }}</text>
      <template v-else>
        <circle
          v-for="([c, r], i) in PIPS[f.face]"
          :key="i"
          :cx="f.x + s * (0.22 + c * 0.28)"
          :cy="f.y + s * (0.22 + r * 0.28)"
          :r="s * 0.08"
          fill="#000"
        />
      </template>
    </g>

    <line
      v-for="e in edges"
      :key="e.key"
      :x1="e.x1"
      :y1="e.y1"
      :x2="e.x2"
      :y2="e.y2"
      stroke="#000"
      :stroke-width="e.fold ? 0.3 : 0.5"
      :stroke-dasharray="e.fold ? '1.5 1' : undefined"
    />
  </svg>
</template>
