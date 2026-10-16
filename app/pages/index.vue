<script setup lang="ts">
import { TOOLS } from '~/tools/catalog'
import { isToolAvailable } from '~/tools/registry'

definePageMeta({ layout: 'panggung' })

useSeoMeta({ title: '' })

const { classes, status: classStatus } = useClasses()
const reducedMotion = usePreferredReducedMotion()
const lastBackupAt = useLocalStorage<string | null>('peragu:cadangan-terakhir', null, { initOnMounted: true })

const studentCount = computed(() => classes.value.reduce((n, c) => n + c.students.length, 0))
const daysSinceBackup = computed(() => {
  if (!lastBackupAt.value) return null
  const ms = Date.now() - new Date(lastBackupAt.value).getTime()
  return Number.isFinite(ms) ? Math.floor(ms / 86_400_000) : null
})

// Beranda hanya menyorot alat harian (P1); daftar lengkap dengan pencarian ada di /alat
const available = TOOLS.filter(t => isToolAvailable(t.slug))
const dailyTools = available.filter(t => t.priority === 1)

// Kemiringan halus untuk kartu di beranda (-1.5° sampai 1.5°), tegak saat hover/fokus (DESIGN.md)
const tilts = ['[--miring:-1deg]', '[--miring:1deg]', '[--miring:-1.5deg]', '[--miring:1.5deg]', '[--miring:0.75deg]', '[--miring:-0.75deg]']
const cardTilt = (index: number) => tilts[index % tilts.length]

const { data: latest } = await useAsyncData('beranda-bacaan', async () => {
  const [tutorials, posts] = await Promise.all([
    queryCollection('tutorial').order('date', 'DESC').order('urutan', 'ASC').select('path', 'title', 'description', 'kategori', 'durasi').limit(3).all(),
    queryCollection('blog').order('date', 'DESC').select('path', 'title', 'description', 'date').limit(2).all()
  ])
  return { tutorials, posts }
})

const sampleCards = [
  { no: '01', name: 'Alya Putri', note: 'Kelompok 1 · Tuntas' },
  { no: '02', name: 'Bima Pratama', note: 'Kelompok 2 · Hadir' },
  { no: '03', name: 'Citra Lestari', note: 'Giliran Maju · Piagam' }
]

// Referensi DOM untuk gerak panggung (MOTION 3, hanya di beranda)
const stageRoot = useTemplateRef<HTMLElement>('stageRoot')
const lockClosed = ref(true)
const stagePreAnim = ref(false)

let cleanupStage: (() => void) | undefined
// Halaman bisa dilepas sebelum Lenis selesai dimuat; tanpa penanda ini GSAP tetap dipasang dengan selektor global
let disposed = false

onMounted(async () => {
  // Kalau prefers-reduced-motion aktif, Lenis dan animasi gulir tidak dipasang (DESIGN.md)
  if (reducedMotion.value === 'reduce') {
    lockClosed.value = true
    return
  }

  stagePreAnim.value = true
  lockClosed.value = false

  try {
    const { gsap, ScrollTrigger } = useGSAP()
    const { default: Lenis } = await import('lenis')
    const root = stageRoot.value
    if (disposed || !root) return

    const lenis = new Lenis({
      autoRaf: false
    })

    lenis.on('scroll', ScrollTrigger.update)
    const onTick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    let cardBatchTriggers: ReturnType<typeof ScrollTrigger.batch> = []

    const setupCardScrollBatch = (fromFilter = false) => {
      cardBatchTriggers.forEach(t => t.kill())
      cardBatchTriggers = []

      const cards = Array.from(root.querySelectorAll<HTMLElement>('.kartu-alat-stiker'))
      if (cards.length === 0) {
        ScrollTrigger.refresh()
        return
      }

      if (fromFilter) {
        const viewportLimit = window.innerHeight * 0.95
        const visibleNow: HTMLElement[] = []
        const belowFold: HTMLElement[] = []

        for (const el of cards) {
          const rect = el.getBoundingClientRect()
          if (rect.top < viewportLimit && rect.bottom > 0) {
            visibleNow.push(el)
          } else {
            belowFold.push(el)
          }
        }

        if (visibleNow.length > 0) {
          gsap.fromTo(
            visibleNow,
            {
              autoAlpha: 0,
              y: 34,
              scale: 0.92,
              rotation: (i: number) => (i % 2 === 0 ? -2 : 2)
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.52,
              stagger: 0.055,
              ease: 'back.out(1.7)',
              overwrite: true,
              clearProps: 'transform'
            }
          )
        }

        if (belowFold.length > 0) {
          gsap.set(belowFold, { autoAlpha: 0, y: 44, scale: 0.93 })
        }
      } else {
        gsap.set(cards, { autoAlpha: 0, y: 44, scale: 0.93 })
      }

      cardBatchTriggers = ScrollTrigger.batch(cards, {
        interval: 0.1,
        batchMax: 4,
        start: 'top 88%',
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.58,
            stagger: 0.08,
            ease: 'back.out(1.7)',
            overwrite: true,
            clearProps: 'transform'
          })
        },
        onEnterBack: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.48,
            stagger: 0.06,
            ease: 'back.out(1.5)',
            overwrite: true,
            clearProps: 'transform'
          })
        },
        onLeaveBack: (batch) => {
          gsap.set(batch, {
            autoAlpha: 0,
            y: 38,
            scale: 0.94,
            overwrite: true
          })
        }
      })

      ScrollTrigger.refresh()
    }

    const ctx = gsap.context(() => {
      // 1. Pembuka: judul muncul per baris dengan pantulan back.out(1.7), 700ms, jeda 120ms
      const tl = gsap.timeline({
        onComplete: () => {
          stagePreAnim.value = false
        }
      })

      tl.fromTo('.pembuka-baris', {
        y: 48,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'back.out(1.7)'
      })
        .fromTo('.pembuka-pensil', {
          x: -80,
          autoAlpha: 0
        }, {
          x: 0,
          autoAlpha: 1,
          duration: 0.55,
          ease: 'back.out(1.5)'
        }, '-=0.45')
        .fromTo('.pembuka-penggaris', {
          x: 80,
          autoAlpha: 0
        }, {
          x: 0,
          autoAlpha: 1,
          duration: 0.55,
          ease: 'back.out(1.5)'
        }, '<')
        .fromTo('.coretan-merah-jalur', {
          strokeDashoffset: 620
        }, {
          strokeDashoffset: 0,
          duration: 0.55,
          ease: 'power2.out'
        })

      // Saat digulir dari pembuka: judul mengecil dan naik, pensil dan penggaris keluar layar
      gsap.to('.pembuka-judul-bungkus', {
        scale: 0.9,
        y: -36,
        ease: 'none',
        scrollTrigger: {
          trigger: '#pembuka',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })

      gsap.to('.pembuka-pensil', {
        x: -140,
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '#pembuka',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })

      gsap.to('.pembuka-penggaris', {
        x: 140,
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '#pembuka',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })

      // 2. Satu daftar siswa: disematkan (pin) sejauh 90% tinggi layar hanya di layar >= 640px
      const mm = gsap.matchMedia()
      mm.add('(min-width: 640px)', () => {
        const rosterTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#satu-daftar-siswa',
            start: 'top top',
            end: '+=90%',
            pin: true,
            scrub: 0.6
          }
        })

        rosterTl
          .fromTo('.pesawat-terbang', {
            x: -80,
            y: 36,
            rotation: -8
          }, {
            x: 180,
            y: -28,
            rotation: 6,
            ease: 'none'
          }, 0)
          .from('.kartu-tumpuk-item', {
            y: 44,
            autoAlpha: 0,
            stagger: 0.2,
            ease: 'back.out(1.4)'
          }, 0.05)
          .from('.kartu-data-kelas', {
            y: 48,
            autoAlpha: 0,
            scale: 0.94,
            ease: 'back.out(1.5)'
          }, 0.1)
      })

      mm.add('(max-width: 639px)', () => {
        gsap.from('.kartu-tumpuk-item', {
          y: 28,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '#satu-daftar-siswa',
            start: 'top 80%',
            once: true
          }
        })
        gsap.from('.kartu-data-kelas', {
          y: 32,
          autoAlpha: 0,
          scale: 0.95,
          duration: 0.55,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '.kartu-data-kelas',
            start: 'top 85%',
            once: true
          }
        })
      })

      // 3. Sapuan pensil diagonal mengikuti gulir
      gsap.fromTo('.sapuan-pensil-baris-1', {
        xPercent: -12
      }, {
        xPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '#sapuan-pensil',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })

      gsap.fromTo('.sapuan-pensil-baris-2', {
        xPercent: 10
      }, {
        xPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: '#sapuan-pensil',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })

      // 4. Alat harian serta 6. tutorial dan blog: kartu beranimasi saat digulir (ScrollTrigger.batch)
      setupCardScrollBatch(false)

      // 5. Data tetap di perangkat: kartu privasi memantul masuk dan gembok menutup saat bagian terlihat
      gsap.from('.kartu-privasi', {
        y: 40,
        autoAlpha: 0,
        scale: 0.96,
        duration: 0.6,
        ease: 'back.out(1.5)',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: '#privasi-perangkat',
          start: 'top 82%'
        }
      })

      ScrollTrigger.create({
        trigger: '#privasi-perangkat',
        start: 'top 78%',
        once: true,
        onEnter: () => {
          lockClosed.value = true
        }
      })
    }, root)

    cleanupStage = () => {
      cardBatchTriggers.forEach(t => t.kill())
      ctx.revert()
      gsap.ticker.remove(onTick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  } catch {
    stagePreAnim.value = false
    lockClosed.value = true
  }
})

onBeforeUnmount(() => {
  disposed = true
  cleanupStage?.()
})
</script>

<template>
  <div
    ref="stageRoot"
    :class="{ 'panggung-pra-animasi': stagePreAnim }"
  >
    <!-- 1. PEMBUKA: Judul panggung besar dengan pensil dan penggaris di kiri-kanan (DESIGN.md) -->
    <section
      id="pembuka"
      aria-labelledby="judul-pembuka"
      class="relative py-12 sm:py-20 lg:py-24"
    >
      <UContainer>
        <div class="relative flex flex-col items-center text-center">
          <!-- Pensil dan penggaris di kiri-kanan -->
          <div class="mb-6 flex w-full max-w-5xl items-center justify-between gap-4 px-2 sm:mb-8">
            <div class="pembuka-pensil w-36 sm:w-52 lg:w-64 -rotate-6">
              <PeraguIlustrasi name="pensil" />
            </div>
            <div class="pembuka-penggaris w-36 sm:w-52 lg:w-64 rotate-6">
              <PeraguIlustrasi name="penggaris" />
            </div>
          </div>

          <div class="pembuka-judul-bungkus space-y-2">
            <h1
              id="judul-pembuka"
              class="judul-panggung flex flex-col items-center"
            >
              <span class="pembuka-baris block">ALAT KERJA</span>
              <span class="pembuka-baris relative inline-block px-3 pb-2">
                <span>GURU SD</span>
                <!-- Motif identitas: coretan tinta merah di beranda yang tergambar setelah judul selesai (DESIGN.md) -->
                <svg
                  viewBox="0 0 380 42"
                  fill="none"
                  aria-hidden="true"
                  class="pointer-events-none absolute -bottom-2 left-0 w-full h-6 sm:h-9"
                >
                  <path
                    class="coretan-merah-jalur"
                    d="M8 24C98 10 256 8 372 22C264 31 118 34 26 30"
                    stroke="var(--ui-secondary)"
                    stroke-width="8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-dasharray="620"
                  />
                </svg>
              </span>
            </h1>
          </div>

          <p class="mt-6 max-w-2xl text-lg sm:text-xl font-medium text-(--color-tinta)">
            Satu meja kerja untuk mengacak kelompok, memutar roda nama, memasang timer proyektor, merekap nilai rapor, dan mencetak lembar kerja A4 maupun F4.
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <UButton
              to="/alat"
              size="xl"
              color="primary"
              icon="i-lucide-layout-grid"
              class="px-6"
            >
              Lihat {{ available.length }} alat
            </UButton>
            <UButton
              to="/kelas"
              size="xl"
              color="neutral"
              variant="solid"
              icon="i-lucide-users"
              class="stiker-tombol bg-white text-slate-900 hover:bg-yellow-100 dark:bg-slate-900 dark:text-yellow-100 px-6"
            >
              Isi Data Kelas
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- 2. SATU DAFTAR SISWA: Bagian yang disematkan saat digulir, pesawat kertas melintas, dan kartu 2×2 Data Kelas -->
    <section
      id="satu-daftar-siswa"
      aria-labelledby="judul-satu-daftar"
      class="relative flex min-h-dvh items-center py-12 sm:py-16"
    >
      <UContainer class="w-full">
        <div class="grid items-center gap-8 lg:grid-cols-12">
          <!-- Narasi + ilustrasi pesawat kertas dan kartu nama siswa -->
          <div class="space-y-6 lg:col-span-6">
            <div class="inline-flex items-center gap-3">
              <span class="rounded-md bg-secondary px-3 py-1 text-sm font-semibold text-white">
                Cukup sekali ketik
              </span>
            </div>

            <h2
              id="judul-satu-daftar"
              class="font-display text-3xl sm:text-5xl font-bold text-(--color-tinta) underline decoration-secondary decoration-4 underline-offset-8"
            >
              Satu daftar siswa untuk semua alat
            </h2>

            <p class="text-base sm:text-lg text-(--color-tinta)">
              Tempel daftar siswa dari Excel atau Google Sheets sekali saja di Data Kelas. Saat membuka Pemilih Acak, Pembagi Kelompok, Rekap Absensi, Nilai Rapor, atau Sertifikat, nama siswa langsung tersedia.
            </p>

            <!-- Pesawat kertas dan tumpukan kartu nama siswa -->
            <div class="relative pt-2">
              <div class="pesawat-terbang mb-4 w-28 sm:w-36">
                <PeraguIlustrasi name="pesawat" />
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div
                  v-for="(item, idx) in sampleCards"
                  :key="item.no"
                  class="kartu-tumpuk-item rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-3"
                  :class="idx === 1 ? 'sm:translate-y-2' : idx === 2 ? 'sm:translate-y-4' : ''"
                >
                  <div class="flex items-center gap-2">
                    <span class="inline-flex size-7 items-center justify-center rounded-full bg-(--color-pensil) text-xs font-bold text-slate-900 border border-slate-900">
                      {{ item.no }}
                    </span>
                    <span class="font-semibold text-sm text-highlighted">{{ item.name }}</span>
                  </div>
                  <p class="mt-1.5 text-xs text-muted">
                    {{ item.note }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Satu-satunya kartu 2×2 di beranda: Data Kelas (DESIGN.md baris 119-123) -->
          <div class="lg:col-span-6">
            <NuxtLink
              to="/kelas"
              class="kartu-data-kelas stiker-kartu block bg-white dark:bg-slate-900 p-6 sm:p-8 [--miring:-1deg]"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-2">
                  <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <UIcon
                      name="i-lucide-users"
                      class="size-5"
                    />
                    Langkah awal yang disarankan
                  </span>
                  <h3 class="font-display text-2xl sm:text-3xl font-bold text-highlighted">
                    Data Kelas
                  </h3>
                </div>
                <div class="w-24 shrink-0">
                  <PeraguIlustrasi name="kartu-nama" />
                </div>
              </div>

              <div class="mt-4 text-base text-toned">
                <USkeleton
                  v-if="classStatus === 'pending'"
                  class="h-6 w-56"
                />
                <p v-else-if="classStatus === 'error'">
                  Data kelas tidak bisa dibaca dari perangkat ini.
                </p>
                <p v-else-if="classes.length === 0">
                  Belum ada kelas di perangkat ini. Klik untuk menempel daftar siswa dari Excel atau mencoba dengan 24 siswa contoh.
                </p>
                <p
                  v-else
                  class="font-medium text-highlighted"
                >
                  {{ classes.length }} kelas dan {{ studentCount }} siswa siap dipakai di semua alat.
                </p>
              </div>

              <div class="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                <span>Buka Data Kelas</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-5"
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- 3. SAPUAN PENSIL: Pensil panjang menyapu diagonal sebagai peralihan ke daftar alat (DESIGN.md) -->
    <div
      id="sapuan-pensil"
      aria-hidden="true"
      class="relative overflow-hidden py-6 sm:py-10 select-none"
    >
      <div class=" -rotate-2 space-y-3">
        <div class="sapuan-pensil-baris-1 flex items-center gap-6 whitespace-nowrap">
          <div
            v-for="n in 6"
            :key="`p1-${n}`"
            class="w-64 sm:w-80 shrink-0"
          >
            <PeraguIlustrasi name="pensil" />
          </div>
        </div>
        <div class="sapuan-pensil-baris-2 flex items-center gap-6 whitespace-nowrap">
          <div
            v-for="n in 5"
            :key="`p2-${n}`"
            class="w-64 sm:w-80 shrink-0"
          >
            <PeraguIlustrasi name="penggaris" />
          </div>
        </div>
      </div>
    </div>

    <!-- 4. ALAT HARIAN: kartu stiker alat P1; daftar lengkap dengan pencarian ada di /alat (DESIGN.md) -->
    <section
      id="daftar-alat"
      aria-labelledby="judul-daftar-alat"
      class="py-8 sm:py-12"
    >
      <UContainer class="space-y-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-2">
            <h2
              id="judul-daftar-alat"
              class="font-display text-3xl font-bold text-(--color-tinta) underline decoration-secondary decoration-4 underline-offset-8 sm:text-4xl"
            >
              Alat harian
            </h2>
            <p class="text-(--color-tinta)">
              Yang paling sering dibuka guru setiap minggu. Tandai bintang supaya alat pilihan Anda muncul di menu.
            </p>
          </div>
          <UButton
            to="/alat"
            size="lg"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
            class="stiker-tombol self-start bg-white text-slate-900 hover:bg-yellow-100 lg:self-auto dark:bg-slate-900 dark:text-yellow-100"
          >
            Semua {{ available.length }} alat
          </UButton>
        </div>

        <UPageGrid>
          <KartuAlat
            v-for="(tool, idx) in dailyTools"
            :key="tool.slug"
            :tool="tool"
            :tilt="cardTilt(idx)"
            class="kartu-alat-stiker sm:col-span-3 lg:col-span-3"
          />
        </UPageGrid>
      </UContainer>
    </section>

    <!-- 5. DATA TETAP DI PERANGKAT: Bagian lapang dengan ilustrasi gembok di tas sekolah (DESIGN.md) -->
    <section
      id="privasi-perangkat"
      aria-labelledby="judul-privasi"
      class="py-16 sm:py-24"
    >
      <UContainer>
        <div class="kartu-privasi stiker-kartu rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-6 sm:p-10 lg:p-12">
          <div class="grid items-center gap-8 lg:grid-cols-[9rem_1fr_auto]">
            <div class="mx-auto w-28 sm:w-36">
              <PeraguIlustrasi
                name="gembok-tas"
                :locked="lockClosed"
              />
            </div>

            <div class="space-y-3">
              <h2
                id="judul-privasi"
                class="font-display text-2xl sm:text-3xl font-bold text-highlighted underline decoration-secondary decoration-4 underline-offset-8"
              >
                Data tetap di perangkat guru
              </h2>
              <p class="text-base text-toned max-w-2xl">
                Nama siswa, nilai rapor, dan rekap absensi disimpan di peramban perangkat ini saja (IndexedDB). Tidak ada server Peragu yang menerima data kelas Anda. Unduh file cadangan kapan saja untuk disimpan di flashdisk atau Google Drive pribadi.
              </p>
              <p
                v-if="daysSinceBackup !== null && daysSinceBackup >= 30"
                class="text-sm font-medium text-secondary"
              >
                Pengingat: Anda belum mengunduh cadangan dalam {{ daysSinceBackup }} hari terakhir.
              </p>
            </div>

            <div>
              <UButton
                to="/pengaturan"
                size="xl"
                color="primary"
                icon="i-lucide-download"
              >
                Cadangkan di Pengaturan
              </UButton>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- 6. BELAJAR BARENG: tutorial perangkat ajar dan kabar dari blog (konten Nuxt Content) -->
    <section
      v-if="latest && (latest.tutorials.length || latest.posts.length)"
      aria-labelledby="judul-bacaan"
      class="pt-4 pb-14 sm:pb-20"
    >
      <UContainer class="space-y-6">
        <div class="space-y-2">
          <h2
            id="judul-bacaan"
            class="font-display text-3xl font-bold text-(--color-tinta) underline decoration-secondary decoration-4 underline-offset-8 sm:text-4xl"
          >
            Bekal mengajar
          </h2>
          <p class="text-(--color-tinta)">
            Tutorial menyusun perangkat ajar dan asesmen, ditambah kabar terbaru dari Peragu.
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-12">
          <div class="space-y-4 lg:col-span-7">
            <NuxtLink
              v-for="(t, idx) in latest.tutorials"
              :key="t.path"
              :to="t.path"
              :class="['kartu-alat-stiker stiker-kartu block bg-white p-5 sm:p-6 dark:bg-slate-900', idx % 2 ? '[--miring:0.4deg]' : '[--miring:-0.4deg]']"
            >
              <span class="text-xs font-semibold text-muted">
                Tutorial · {{ tutorialCategory(t.kategori)?.name }}<template v-if="t.durasi"> · {{ t.durasi }}</template>
              </span>
              <h3 class="mt-1.5 font-display text-xl font-bold text-highlighted">
                {{ t.title }}
              </h3>
              <p class="mt-1.5 text-sm text-toned">
                {{ t.description }}
              </p>
            </NuxtLink>
            <UButton
              to="/tutorial"
              color="neutral"
              trailing-icon="i-lucide-arrow-right"
              class="stiker-tombol bg-white text-slate-900 hover:bg-yellow-100 dark:bg-slate-900 dark:text-yellow-100"
            >
              Semua tutorial
            </UButton>
          </div>

          <div class="space-y-4 lg:col-span-5">
            <NuxtLink
              v-for="(p, idx) in latest.posts"
              :key="p.path"
              :to="p.path"
              :class="['kartu-alat-stiker stiker-kartu block bg-(--color-pensil) p-5 text-slate-900 sm:p-6', cardTilt(idx + 2)]"
            >
              <span class="text-xs font-semibold">
                Blog · {{ formatTanggal(p.date) }}
              </span>
              <h3 class="mt-1.5 font-display text-xl font-bold">
                {{ p.title }}
              </h3>
              <p class="mt-1.5 text-sm">
                {{ p.description }}
              </p>
            </NuxtLink>
            <UButton
              to="/blog"
              color="neutral"
              trailing-icon="i-lucide-arrow-right"
              class="stiker-tombol bg-white text-slate-900 hover:bg-yellow-100 dark:bg-slate-900 dark:text-yellow-100"
            >
              Semua tulisan
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
