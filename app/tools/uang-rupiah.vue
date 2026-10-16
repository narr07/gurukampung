<script setup lang="ts">
import { breakdownRupiah, formatRupiah, RUPIAH_DENOMINATIONS, type RupiahDenomination } from '~/utils/fase4'
import { beep } from '~/utils/sound'

const tab = useLocalStorage('gurukampung:rupiah:tab', 'susun', { initOnMounted: true })
const tabs = [
  { label: 'Susun Uang di Meja', value: 'susun', icon: 'i-lucide-banknote', slot: 'susun' as const },
  { label: 'Latihan Belanja & Kembalian', value: 'belanja', icon: 'i-lucide-shopping-basket', slot: 'belanja' as const }
]

// ---------- Mode 1: Susun Uang
const tray = ref<RupiahDenomination[]>([])
const trayTotal = computed(() => tray.value.reduce((acc, item) => acc + item.value, 0))

function addMoney(denom: RupiahDenomination) {
  tray.value.push(denom)
  beep({ times: 1, frequency: 880, duration: 0.08 })
}

function removeAt(idx: number) {
  tray.value.splice(idx, 1)
}

function clearTray() {
  tray.value = []
}

// ---------- Mode 2: Latihan Belanja & Kembalian
const itemPrice = useLocalStorage('gurukampung:rupiah:harga', 13500, { initOnMounted: true })
const paidAmount = useLocalStorage('gurukampung:rupiah:bayar', 20000, { initOnMounted: true })
const showChange = useLocalStorage('gurukampung:rupiah:tampil-kembali', true, { initOnMounted: true })

const changeAmount = computed(() => Math.max(0, paidAmount.value - itemPrice.value))
const changeBreakdown = computed(() => breakdownRupiah(changeAmount.value))
</script>

<template>
  <UTabs
    v-model="tab"
    :items="tabs"
    variant="link"
  >
    <template #susun>
      <ProjectorShell>
        <div class="grid gap-6 lg:grid-cols-[22rem_1fr] pt-3">
          <div class="space-y-3">
            <p class="font-display text-sm font-bold text-highlighted">
              Klik pecahan uang untuk diletakkan ke meja hitung:
            </p>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="(d, idx) in RUPIAH_DENOMINATIONS"
                :key="idx"
                type="button"
                class="flex flex-col items-center justify-center rounded-2xl border-2 border-(--color-tinta) p-2.5 text-center transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_3px_0_0_var(--color-tinta)]"
                :style="{ backgroundColor: d.bgHex, color: d.inkHex }"
                @click="addMoney(d)"
              >
                <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {{ d.type === 'kertas' ? 'Uang Kertas' : 'Uang Logam' }}
                </span>
                <span class="font-display text-base font-extrabold tabular-nums">
                  {{ formatRupiah(d.value) }}
                </span>
              </button>
            </div>
            <p class="text-xs text-muted">
              Ilustrasi uang ini dibuat khusus untuk alat peraga edukasi kelas (bukan foto mata uang asli).
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-(--color-tinta) bg-amber-50/80 dark:bg-slate-800/80 p-5 shadow-[0_4px_0_0_var(--color-tinta)]">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-muted">
                  Jumlah Nilai Uang di Meja
                </p>
                <p
                  class="font-display text-4xl sm:text-5xl font-extrabold tabular-nums text-highlighted"
                  aria-live="polite"
                >
                  {{ formatRupiah(trayTotal) }}
                </p>
              </div>
              <UButton
                v-if="tray.length > 0"
                color="neutral"
                variant="outline"
                icon="i-lucide-trash-2"
                @click="clearTray"
              >
                Kosongkan meja
              </UButton>
            </div>

            <div
              v-if="tray.length === 0"
              class="flex min-h-56 items-center justify-center rounded-3xl border-2 border-dashed border-(--color-tinta) p-8 text-center text-sm text-muted"
            >
              Belum ada uang di meja. Klik pecahan uang di sebelah kiri untuk mulai menjumlahkan.
            </div>

            <div
              v-else
              class="flex flex-wrap gap-3 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-5"
            >
              <button
                v-for="(item, idx) in tray"
                :key="idx"
                type="button"
                title="Klik untuk mengambil kembali"
                class="group relative flex flex-col items-center justify-center border-2 border-(--color-tinta) transition-transform hover:scale-105"
                :class="item.type === 'kertas' ? 'h-20 w-36 rounded-xl px-3' : 'size-20 rounded-full'"
                :style="{ backgroundColor: item.bgHex, color: item.inkHex }"
                @click="removeAt(idx)"
              >
                <span class="text-[9px] font-bold uppercase tracking-widest">CONTOH EDUKASI</span>
                <span class="font-display text-lg font-extrabold tabular-nums">{{ formatRupiah(item.value) }}</span>
              </button>
            </div>
          </div>
        </div>
      </ProjectorShell>
    </template>

    <template #belanja>
      <ProjectorShell>
        <div class="grid gap-6 lg:grid-cols-[20rem_1fr] pt-3">
          <div class="space-y-4">
            <UFormField label="Harga barang belanjaan (Rp)">
              <UInputNumber
                v-model="itemPrice"
                :min="100"
                :max="500000"
                :step="500"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Uang yang dibayarkan (Rp)">
              <UInputNumber
                v-model="paidAmount"
                :min="100"
                :max="500000"
                :step="1000"
                class="w-full"
              />
            </UFormField>

            <USwitch
              v-model="showChange"
              label="Tampilkan hasil kembalian &amp; rincian pecahan"
            />
          </div>

          <div class="space-y-6 rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-6 shadow-[0_4px_0_0_var(--color-tinta)]">
            <div class="grid gap-4 sm:grid-cols-3 text-center">
              <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800 p-4">
                <p class="text-xs font-bold uppercase text-muted">
                  Harga Barang
                </p>
                <p class="mt-1 font-display text-2xl font-extrabold tabular-nums text-highlighted">
                  {{ formatRupiah(itemPrice) }}
                </p>
              </div>
              <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800 p-4">
                <p class="text-xs font-bold uppercase text-muted">
                  Uang Dibayar
                </p>
                <p class="mt-1 font-display text-2xl font-extrabold tabular-nums text-highlighted">
                  {{ formatRupiah(paidAmount) }}
                </p>
              </div>
              <div class="rounded-2xl border-2 border-(--color-tinta) bg-(--color-pensil) p-4 text-slate-950">
                <p class="text-xs font-bold uppercase">
                  Uang Kembalian
                </p>
                <p class="mt-1 font-display text-2xl font-extrabold tabular-nums">
                  {{ showChange ? formatRupiah(changeAmount) : 'Rp ?' }}
                </p>
              </div>
            </div>

            <UAlert
              v-if="paidAmount < itemPrice"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :description="`Uang yang dibayarkan masih kurang ${formatRupiah(itemPrice - paidAmount)}.`"
            />

            <div
              v-else-if="showChange && changeBreakdown.length > 0"
              class="space-y-2"
            >
              <p class="font-display text-sm font-bold text-highlighted">
                Pecahan uang kembalian paling efisien:
              </p>
              <div class="flex flex-wrap gap-2.5">
                <span
                  v-for="part in changeBreakdown"
                  :key="part.value"
                  class="lencana-pensil px-4 py-1.5 font-display text-base font-extrabold tabular-nums"
                >
                  {{ part.count }} × {{ formatRupiah(part.value) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ProjectorShell>
    </template>
  </UTabs>
</template>

