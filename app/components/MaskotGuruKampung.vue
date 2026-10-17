<script setup lang="ts">
// Maskot Guru Kampung (public/brand/guru-kampung-maskot.svg) sebagai SVG inline.
// Diam: melayang pelan dan berkedip lewat CSS (.maskot di main.css); tangan tidak bergerak.
// Disentuh atau disorot: reaksi "aww" lewat timeline GSAP: kedua tangan terangkat ke samping wajah, mata tersenyum,
// pipi merona, badan mengempis malu, dan hati melayang. Dipicu juga oleh ketukan supaya jalan di layar sentuh
const root = useTemplateRef<SVGSVGElement>('root')
const reducedMotion = usePreferredReducedMotion()
let reaksi: { restart: () => void, kill: () => void } | undefined

// Timeline dibuat sekali (sekitar 1 detik), lalu diputar ulang dari awal setiap kali disorot atau diketuk
function buatReaksi() {
  const { gsap } = useGSAP()
  const q = gsap.utils.selector(root.value)
  const diam = reducedMotion.value === 'reduce'
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })

  tl.fromTo(q('.maskot-mata'), { opacity: 1 }, { opacity: 0, duration: 0.08 }, 0)
    .fromTo(q('.maskot-mata-senang'), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
    .fromTo(q('.maskot-pipi'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0)

  if (!diam) {
    // Gaya "aww": tangan kiri terangkat ke samping kepala, tangan kanan ikut naik, lalu keduanya bergoyang gemas.
    // Tangan digambar di belakang badan, jadi sudutnya dipilih supaya tetap di luar siluet badan
    const kiri = { svgOrigin: '156 352' }
    const kanan = { svgOrigin: '356 342' }
    tl.fromTo(q('.maskot-tangan-kiri'), { rotation: 0 }, { ...kiri, rotation: 95, duration: 0.2, ease: 'back.out(1.8)' }, 0)
      .fromTo(q('.maskot-tangan-kanan'), { rotation: 0 }, { ...kanan, rotation: -12, duration: 0.2, ease: 'back.out(1.8)' }, 0)
      .to(q('.maskot-tangan-kiri'), { ...kiri, rotation: 83, duration: 0.08, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.2)
      .to(q('.maskot-tangan-kanan'), { ...kanan, rotation: 0, duration: 0.08, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.2)
      .to(q('.maskot-tangan-kiri'), { ...kiri, rotation: 0, duration: 0.28, ease: 'power2.inOut' }, 0.72)
      .to(q('.maskot-tangan-kanan'), { ...kanan, rotation: 0, duration: 0.28, ease: 'power2.inOut' }, 0.72)
    tl.fromTo(q('.maskot-reaksi'), { scaleX: 1, scaleY: 1 }, { scaleX: 1.08, scaleY: 0.9, duration: 0.12, svgOrigin: '256 468' }, 0)
      .to(q('.maskot-reaksi'), { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.45)', svgOrigin: '256 468' }, 0.12)
      .fromTo(q('.maskot-hati'), { opacity: 0, y: 0, scale: 0.4 }, { opacity: 1, y: -40, scale: 1, duration: 0.4, stagger: 0.07, transformOrigin: '50% 100%' }, 0.05)
      .to(q('.maskot-hati'), { opacity: 0, y: -64, duration: 0.25, stagger: 0.07 }, 0.5)
  }

  tl.to(q('.maskot-pipi'), { opacity: 0, duration: 0.2 }, 0.8)
    .to(q('.maskot-mata-senang'), { opacity: 0, duration: 0.08 }, 0.9)
    .to(q('.maskot-mata'), { opacity: 1, duration: 0.08 }, 0.9)
  return tl
}

function awww(event?: PointerEvent) {
  if (event && event.pointerType !== 'mouse') return
  if (!root.value) return
  reaksi ??= buatReaksi()
  reaksi.restart()
}

onBeforeUnmount(() => reaksi?.kill())
</script>

<template>
  <svg
    ref="root"
    class="maskot"
    viewBox="70 16 390 460"
    aria-hidden="true"
    focusable="false"
    @pointerenter="awww"
    @click="awww()"
  >
    <g class="maskot-tubuh">
      <g class="maskot-reaksi">
        <g fill="#0f172b">
          <ellipse
            cx="204"
            cy="450"
            rx="38"
            ry="18"
          />
          <ellipse
            cx="308"
            cy="450"
            rx="38"
            ry="18"
          />
        </g>
        <g
          class="maskot-tangan-kiri"
          fill="none"
          stroke="#0f172b"
          stroke-width="22"
          stroke-linecap="round"
        >
          <path d="M156 352 Q118 362 104 398" />
          <circle
            cx="100"
            cy="404"
            r="20"
            fill="#ffffff"
            stroke-width="14"
          />
        </g>
        <g
          class="maskot-tangan-kanan"
          fill="none"
          stroke="#0f172b"
          stroke-width="22"
          stroke-linecap="round"
        >
          <path d="M356 342 Q402 326 418 268" />
          <circle
            cx="422"
            cy="256"
            r="20"
            fill="#ffffff"
            stroke-width="14"
          />
        </g>
        <g
          stroke="#0f172b"
          stroke-width="24"
          stroke-linejoin="round"
          stroke-linecap="round"
        >
          <path
            d="M150 250 Q185.3 286 220.7 250 Q256 286 291.3 250 Q326.7 286 362 250 V436 H150 Z"
            fill="#ffdf20"
          />
          <path
            d="M218 436 V372 A38 38 0 0 1 294 372 V436 Z"
            fill="#0f172b"
            stroke="none"
          />
          <path
            d="M150 250 L256 84 L362 250 Q326.7 286 291.3 250 Q256 286 220.7 250 Q185.3 286 150 250 Z"
            fill="#fef9c2"
          />
          <path
            d="M256 84 L217.6 144 H294.4 Z"
            fill="#0f172b"
            stroke-width="0"
          />
        </g>
        <!-- Pipi merona, hanya terlihat saat reaksi -->
        <g
          class="maskot-pipi"
          fill="#c10007"
          opacity="0"
        >
          <ellipse
            cx="196"
            cy="330"
            rx="17"
            ry="10"
            fill-opacity="0.35"
          />
          <ellipse
            cx="316"
            cy="330"
            rx="17"
            ry="10"
            fill-opacity="0.35"
          />
        </g>
        <g class="maskot-mata">
          <ellipse
            cx="222"
            cy="304"
            rx="12"
            ry="16"
            fill="#0f172b"
          />
          <ellipse
            cx="290"
            cy="304"
            rx="12"
            ry="16"
            fill="#0f172b"
          />
          <circle
            cx="226"
            cy="298"
            r="4.5"
            fill="#ffffff"
          />
          <circle
            cx="294"
            cy="298"
            r="4.5"
            fill="#ffffff"
          />
        </g>
        <!-- Mata tersenyum ^ ^ saat reaksi -->
        <g
          class="maskot-mata-senang"
          fill="none"
          stroke="#0f172b"
          stroke-width="8"
          stroke-linecap="round"
          opacity="0"
        >
          <path d="M209 310 Q222 290 235 310" />
          <path d="M277 310 Q290 290 303 310" />
        </g>
      </g>
    </g>

    <!-- Hati yang melayang di sisi kanan atas kepala, dekat kepala -->
    <g
      fill="#c10007"
      stroke="#0f172b"
      stroke-width="5"
      stroke-linejoin="round"
    >
      <path
        class="maskot-hati"
        opacity="0"
        d="M372 112 c-9 -12 -27 -4 -20 11 l20 20 l20 -20 c7 -15 -11 -23 -20 -11 Z"
      />
      <path
        class="maskot-hati"
        opacity="0"
        d="M426 92 c-7 -10 -22 -3 -16 9 l16 16 l16 -16 c6 -12 -9 -19 -16 -9 Z"
      />
      <path
        class="maskot-hati"
        opacity="0"
        d="M324 84 c-6 -8 -18 -3 -13 7 l13 13 l13 -13 c5 -10 -7 -15 -13 -7 Z"
      />
    </g>

  </svg>
</template>
