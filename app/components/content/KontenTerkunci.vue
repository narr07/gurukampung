<script setup lang="ts">
// Batas konten terkunci di artikel blog/tutorial (okf/rencana-konten.md). Dipakai di Markdown sebagai:
//   ::konten-terkunci{id="kisi-kisi-sas-ipas-5" produk="Paket asesmen SAS"}
//   - daftar isi bagian berbayar
//   ::
// Isi berbayarnya tidak ada di halaman; pelanggan mengambilnya dari /api/premium/<id> setelah sesi dan langganan diperiksa
const props = defineProps<{
  id: string
  produk?: string
}>()

const route = useRoute()
const { loggedIn } = useUserSession()

const { data, error, status, execute } = useFetch<{ markdown: string }>(`/api/premium/${props.id}`, {
  key: `premium-${props.id}`,
  server: false,
  immediate: false
})

// Isi hanya diminta untuk pengunjung yang sudah masuk; pengunjung tamu langsung melihat kartu ajakan
watch(loggedIn, (masuk) => {
  if (masuk) execute()
}, { immediate: true })

const terbuka = computed(() => Boolean(data.value?.markdown))
const memuat = computed(() => loggedIn.value && status.value === 'pending')
const belumBerlangganan = computed(() => error.value?.statusCode === 403)
</script>

<template>
  <div class="konten-terkunci not-prose my-8">
    <MDC
      v-if="terbuka && data"
      :value="data.markdown"
      tag="div"
      class="bacaan hasil-muncul"
    />

    <div
      v-else-if="memuat"
      class="space-y-3"
    >
      <USkeleton class="h-6 w-2/3" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-5/6" />
    </div>

    <div
      v-else
      class="relative"
    >
      <!-- Cuplikan memudar: tanda bahwa tulisan berlanjut, tanpa memuat isi berbayar apa pun -->
      <div
        aria-hidden="true"
        class="pointer-events-none mb-4 space-y-2 opacity-60 blur-[2px] select-none"
      >
        <div class="h-3 w-full rounded bg-slate-300" />
        <div class="h-3 w-11/12 rounded bg-slate-300" />
        <div class="h-3 w-4/5 rounded bg-slate-300" />
      </div>

      <section
        :aria-labelledby="`judul-terkunci-${id}`"
        class="stiker-kartu bg-(--color-pensil) p-5 text-slate-900 sm:p-7"
      >
        <div class="flex items-start gap-3">
          <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-(--color-tinta) bg-white">
            <UIcon
              name="i-lucide-lock-keyhole"
              class="size-5"
            />
          </span>
          <div class="space-y-1">
            <h2
              :id="`judul-terkunci-${id}`"
              class="font-display text-xl font-bold sm:text-2xl"
            >
              Lanjutan tulisan ini untuk pelanggan
            </h2>
            <p
              v-if="produk"
              class="text-sm font-semibold"
            >
              Termasuk dalam {{ produk }}
            </p>
          </div>
        </div>

        <div class="mt-4 text-[15px] [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
          <slot />
        </div>

        <p
          v-if="belumBerlangganan"
          class="mt-4 text-sm font-semibold"
        >
          Akun Anda belum berlangganan. Pilih paket untuk membuka bagian ini.
        </p>

        <div class="mt-5 flex flex-wrap gap-2.5">
          <UButton
            to="/paket"
            icon="i-lucide-sparkles"
            class="stiker-tombol"
          >
            Lihat paket
          </UButton>
          <UButton
            v-if="!loggedIn"
            :to="`/masuk?redirect=${encodeURIComponent(route.path)}`"
            color="neutral"
            variant="outline"
            icon="i-lucide-key-round"
            class="stiker-tombol bg-white"
          >
            Sudah berlangganan? Masuk
          </UButton>
        </div>
      </section>
    </div>
  </div>
</template>
