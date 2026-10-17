<script setup lang="ts">
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const toolMode = ref<'pena' | 'penghapus'>('pena')
const strokeColor = ref('#0f172a')
const strokeWidth = ref(4)
const bgPattern = useLocalStorage<'polos' | 'garis' | 'kotak'>('gurukampung:papantulis:latar', 'kotak', { initOnMounted: true })

const COLORS = [
  { hex: '#0f172a', label: 'Tinta Hitam' },
  { hex: '#e11d48', label: 'Spidol Merah' },
  { hex: '#0d9488', label: 'Spidol Hijau Toska' },
  { hex: '#2563eb', label: 'Spidol Biru' },
  { hex: '#d97706', label: 'Spidol Kuning Tua' }
]

const drawing = ref(false)
const snapshots = ref<string[]>([])

function saveSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return
  snapshots.value = [...snapshots.value.slice(-9), canvas.toDataURL('image/png')]
}

function getCoords(e: PointerEvent) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function startDraw(e: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  saveSnapshot()
  drawing.value = true
  ;(e.currentTarget as Element)?.setPointerCapture?.(e.pointerId)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { x, y } = getCoords(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

function moveDraw(e: PointerEvent) {
  if (!drawing.value || !canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  const { x, y } = getCoords(e)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (toolMode.value === 'penghapus') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = strokeWidth.value * 5
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = strokeColor.value
    ctx.lineWidth = strokeWidth.value
  }
  ctx.lineTo(x, y)
  ctx.stroke()
}

function endDraw() {
  drawing.value = false
}

function undo() {
  const canvas = canvasRef.value
  const prev = snapshots.value.pop()
  if (!canvas || !prev) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const img = new Image()
  img.onload = () => {
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
  }
  img.src = prev
}

function clearBoard() {
  const canvas = canvasRef.value
  if (!canvas) return
  saveSnapshot()
  const ctx = canvas.getContext('2d')
  ctx?.clearRect(0, 0, canvas.width, canvas.height)
}

function insertImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  const canvas = canvasRef.value
  if (!file || !canvas) return
  saveSnapshot()
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.globalCompositeOperation = 'source-over'
      const ratio = Math.min(400 / img.width, 300 / img.height, 1)
      const w = img.width * ratio
      const h = img.height * ratio
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    }
    img.src = String(reader.result)
  }
  reader.readAsDataURL(file)
}

function downloadPng() {
  const source = canvasRef.value
  if (!source) return
  const out = document.createElement('canvas')
  out.width = source.width
  out.height = source.height
  const ctx = out.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#fffbeb'
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(source, 0, 0)
  const a = document.createElement('a')
  a.href = out.toDataURL('image/png')
  a.download = `papan-tulis-${Date.now()}.png`
  a.click()
}

const bgItems = [
  { value: 'polos', label: 'Kertas Polos' },
  { value: 'garis', label: 'Buku Tulis Bergaris' },
  { value: 'kotak', label: 'Kotak-Kotak Matematika' }
]
</script>

<template>
  <ProjectorShell>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-(--color-tinta) bg-amber-50/80 dark:bg-slate-800 p-3">
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            size="sm"
            :color="toolMode === 'pena' ? 'primary' : 'neutral'"
            :variant="toolMode === 'pena' ? 'solid' : 'outline'"
            :aria-pressed="toolMode === 'pena'"
            icon="i-lucide-pen-tool"
            @click="toolMode = 'pena'"
          >
            Spidol
          </UButton>
          <UButton
            size="sm"
            :color="toolMode === 'penghapus' ? 'secondary' : 'neutral'"
            :variant="toolMode === 'penghapus' ? 'solid' : 'outline'"
            :aria-pressed="toolMode === 'penghapus'"
            icon="i-lucide-eraser"
            @click="toolMode = 'penghapus'"
          >
            Penghapus
          </UButton>

          <div class="flex items-center gap-1.5 px-2">
            <button
              v-for="c in COLORS"
              :key="c.hex"
              type="button"
              :aria-label="c.label"
              :aria-pressed="strokeColor === c.hex && toolMode === 'pena'"
              class="size-7 rounded-full border-2 border-(--color-tinta) transition-transform"
              :class="strokeColor === c.hex && toolMode === 'pena' ? 'scale-125 ring-2 ring-(--color-pensil)' : ''"
              :style="{ backgroundColor: c.hex }"
              @click="strokeColor = c.hex; toolMode = 'pena'"
            />
          </div>

          <USelect
            v-model="bgPattern"
            :items="bgItems"
            class="w-48"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <label class="cursor-pointer rounded-full border-2 border-(--color-tinta) bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold">
            <span>Sisip Gambar</span>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="insertImage"
            >
          </label>
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-undo-2"
            :disabled="snapshots.length === 0"
            @click="undo"
          >
            Urungkan
          </UButton>
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-trash-2"
            @click="clearBoard"
          >
            Bersihkan
          </UButton>
          <UButton
            size="sm"
            color="primary"
            icon="i-lucide-download"
            @click="downloadPng"
          >
            Simpan PNG
          </UButton>
        </div>
      </div>

      <div
        class="relative overflow-hidden rounded-3xl border-2 border-(--color-tinta) bg-[#fffbeb] shadow-[0_5px_0_0_var(--color-tinta)]"
        :style="{
          backgroundImage: bgPattern === 'kotak'
            ? 'linear-gradient(to right, rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.08) 1px, transparent 1px)'
            : bgPattern === 'garis'
              ? 'linear-gradient(to bottom, transparent 31px, rgba(15,23,42,0.12) 32px)'
              : 'none',
          backgroundSize: bgPattern === 'kotak' ? '28px 28px' : '100% 32px'
        }"
      >
        <canvas
          ref="canvasRef"
          width="1200"
          height="680"
          class="w-full h-auto touch-none cursor-crosshair"
          @pointerdown="startDraw"
          @pointermove="moveDraw"
          @pointerup="endDraw"
          @pointercancel="endDraw"
        />
      </div>
    </div>
  </ProjectorShell>
</template>
