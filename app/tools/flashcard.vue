<script setup lang="ts">
interface FlashcardItem {
  id: string
  front: string
  back: string
  imageDataUrl?: string
}

const DEFAULT_CARDS: FlashcardItem[] = [
  { id: 'c1', front: 'Matahari', back: 'Sumber energi panas dan cahaya terbesar bagi Bumi' },
  { id: 'c2', front: 'Klorofil', back: 'Zat hijau daun yang berperan dalam proses fotosintesis' },
  { id: 'c3', front: 'Herbivora', back: 'Kelompok hewan pemakan tumbuhan (contoh: sapi, kambing)' },
  { id: 'c4', front: 'Karnivora', back: 'Kelompok hewan pemakan daging (contoh: harimau, elang)' }
]

const title = useLocalStorage('peragu:flashcard:judul', 'Kartu Kosakata IPA', { initOnMounted: true })
const perPage = useLocalStorage<4 | 6 | 8>('peragu:flashcard:perhalaman', 6, { initOnMounted: true })
const cards = useLocalStorage<FlashcardItem[]>(
  'peragu:flashcard:daftar',
  DEFAULT_CARDS.map(c => ({ ...c })),
  { initOnMounted: true }
)

function addCard() {
  cards.value.push({
    id: `fc-${Date.now().toString(36)}`,
    front: `Istilah ${cards.value.length + 1}`,
    back: 'Penjelasan singkat atau arti kata'
  })
}

function removeCard(id: string) {
  if (cards.value.length <= 1) return
  cards.value = cards.value.filter(c => c.id !== id)
}

function onFileChange(card: FlashcardItem, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      card.imageDataUrl = reader.result
    }
  }
  reader.readAsDataURL(file)
}

const perPageItems = [
  { value: 4, label: '4 kartu besar per halaman (2×2)' },
  { value: 6, label: '6 kartu sedang per halaman (2×3)' },
  { value: 8, label: '8 kartu ringkas per halaman (2×4)' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[24rem_1fr]">
    <div class="space-y-4 print:hidden">
      <UFormField label="Judul kumpulan kartu">
        <UInput
          v-model="title"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Ukuran &amp; jumlah kartu per halaman">
        <USelect
          v-model="perPage"
          :items="perPageItems"
          class="w-full"
        />
      </UFormField>

      <div class="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
        <UCard
          v-for="(c, idx) in cards"
          :key="c.id"
        >
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="lencana-pensil px-2.5 py-0.5 text-xs font-bold">Kartu {{ idx + 1 }}</span>
              <UButton
                icon="i-lucide-trash-2"
                color="neutral"
                variant="ghost"
                size="xs"
                :disabled="cards.length <= 1"
                :aria-label="`Hapus kartu ${idx + 1}`"
                @click="removeCard(c.id)"
              />
            </div>

            <UFormField label="Kata / Judul Depan">
              <UInput
                v-model="c.front"
                class="w-full font-bold"
              />
            </UFormField>

            <UFormField label="Arti / Penjelasan">
              <UTextarea
                v-model="c.back"
                :rows="2"
                class="w-full"
              />
            </UFormField>

            <div class="flex items-center justify-between gap-2 text-xs">
              <label class="cursor-pointer rounded-full border-2 border-(--color-tinta) bg-amber-50 dark:bg-slate-800 px-3 py-1 font-semibold">
                <span>{{ c.imageDataUrl ? 'Ganti gambar' : 'Unggah gambar' }}</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="e => onFileChange(c, e)"
                >
              </label>
              <UButton
                v-if="c.imageDataUrl"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="c.imageDataUrl = undefined"
              >
                Hapus gambar
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <UButton
        block
        color="neutral"
        variant="outline"
        icon="i-lucide-plus"
        @click="addCard"
      >
        Tambah kartu baru
      </UButton>
    </div>

    <PrintLayout>
      <div class="p-6">
        <PrintHeader
          :title="title"
          subtitle="Gunting mengikuti garis putus-putus"
        />

        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="c in cards"
            :key="`p-${c.id}`"
            class="break-inside-avoid flex flex-col items-center justify-between border-2 border-dashed border-black p-4 text-center"
            :class="perPage === 4 ? 'min-h-[82mm]' : perPage === 6 ? 'min-h-[58mm]' : 'min-h-[44mm]'"
          >
            <img
              v-if="c.imageDataUrl"
              :src="c.imageDataUrl"
              :alt="c.front"
              class="max-h-20 w-auto object-contain"
            >
            <p class="font-display text-2xl font-extrabold tracking-tight text-black">
              {{ c.front }}
            </p>
            <p class="mt-2 border-t border-black pt-2 text-sm text-black">
              {{ c.back }}
            </p>
          </div>
        </div>
      </div>
    </PrintLayout>
  </div>
</template>

