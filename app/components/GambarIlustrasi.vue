<script setup lang="ts">
// Ilustrasi SVG buatan sendiri dengan garis tinta 3px, sudut membulat, dan warna dari palet (DESIGN.md, R-22).
// Selalu dekoratif bagi pembaca layar (aria-hidden="true").
// Ilustrasi tambahan (roda, kalkulator, buku, dan lainnya) ada di utils/ilustrasi.ts
import { ILUSTRASI_BARU, isIlustrasiBaru, type NamaIlustrasi } from '~/utils/ilustrasi'

defineProps<{
  name: NamaIlustrasi
  locked?: boolean
}>()
</script>

<template>
  <svg
    v-if="name === 'pensil'"
    viewBox="0 0 220 64"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <!-- Bayangan bawah pensil untuk kesan tiga dimensi -->
    <rect
      x="34"
      y="20"
      width="136"
      height="30"
      rx="6"
      fill="#eab308"
    />
    <!-- Batang pensil kuning -->
    <rect
      x="34"
      y="14"
      width="136"
      height="30"
      rx="6"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <!-- Garis faset tengah pensil -->
    <line
      x1="34"
      y1="29"
      x2="170"
      y2="29"
      stroke="var(--color-tinta)"
      stroke-width="2.5"
    />
    <!-- Penghapus merah di pangkal -->
    <path
      d="M14 20C14 16.6863 16.6863 14 20 14H36V44H20C16.6863 44 14 41.3137 14 38V20Z"
      fill="var(--ui-secondary)"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <!-- Cincin penjepit logam -->
    <rect
      x="32"
      y="14"
      width="12"
      height="30"
      fill="#e2e8f0"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <!-- Kerucut kayu dan ujung grafit -->
    <polygon
      points="170,14 208,29 170,44"
      fill="#fef08a"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <polygon
      points="194,23.5 208,29 194,34.5"
      fill="var(--color-tinta)"
    />
  </svg>

  <svg
    v-else-if="name === 'penggaris'"
    viewBox="0 0 220 68"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <!-- Sisi bawah lebih gelap untuk kesan tiga dimensi -->
    <rect
      x="12"
      y="20"
      width="196"
      height="36"
      rx="8"
      fill="#1e3a8a"
    />
    <!-- Badan penggaris biru -->
    <rect
      x="12"
      y="12"
      width="196"
      height="36"
      rx="8"
      fill="#93c5fd"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <!-- Garis takik ukuran sentimeter -->
    <g
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linecap="round"
    >
      <line
        x1="32"
        y1="12"
        x2="32"
        y2="28"
      />
      <line
        x1="52"
        y1="12"
        x2="52"
        y2="22"
      />
      <line
        x1="72"
        y1="12"
        x2="72"
        y2="28"
      />
      <line
        x1="92"
        y1="12"
        x2="92"
        y2="22"
      />
      <line
        x1="112"
        y1="12"
        x2="112"
        y2="28"
      />
      <line
        x1="132"
        y1="12"
        x2="132"
        y2="22"
      />
      <line
        x1="152"
        y1="12"
        x2="152"
        y2="28"
      />
      <line
        x1="172"
        y1="12"
        x2="172"
        y2="22"
      />
      <line
        x1="192"
        y1="12"
        x2="192"
        y2="28"
      />
    </g>
    <circle
      cx="24"
      cy="36"
      r="4"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="2.5"
    />
  </svg>

  <svg
    v-else-if="name === 'dadu'"
    viewBox="0 0 96 96"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <!-- Sisi bawah tiga dimensi -->
    <rect
      x="14"
      y="20"
      width="68"
      height="68"
      rx="16"
      fill="#94a3b8"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Permukaan dadu -->
    <rect
      x="14"
      y="12"
      width="68"
      height="68"
      rx="16"
      fill="#ffffff"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Mata dadu 5 dengan titik tengah merah aksen -->
    <circle
      cx="32"
      cy="30"
      r="5"
      fill="#0f172b"
    />
    <circle
      cx="64"
      cy="30"
      r="5"
      fill="#0f172b"
    />
    <circle
      cx="48"
      cy="46"
      r="6"
      fill="#c10007"
    />
    <circle
      cx="32"
      cy="62"
      r="5"
      fill="#0f172b"
    />
    <circle
      cx="64"
      cy="62"
      r="5"
      fill="#0f172b"
    />
  </svg>

  <svg
    v-else-if="name === 'jam'"
    viewBox="0 0 96 96"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <!-- Bingkai bawah tiga dimensi -->
    <circle
      cx="48"
      cy="52"
      r="36"
      fill="#1e3a8a"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Bingkai jam dinding -->
    <circle
      cx="48"
      cy="46"
      r="36"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <circle
      cx="48"
      cy="46"
      r="28"
      fill="#ffffff"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Tanda jam 12, 3, 6, 9 -->
    <g
      stroke="#0f172b"
      stroke-width="3"
      stroke-linecap="round"
    >
      <line
        x1="48"
        y1="22"
        x2="48"
        y2="26"
      />
      <line
        x1="72"
        y1="46"
        x2="68"
        y2="46"
      />
      <line
        x1="48"
        y1="70"
        x2="48"
        y2="66"
      />
      <line
        x1="24"
        y1="46"
        x2="28"
        y2="46"
      />
      <!-- Jarum jam & menit -->
      <line
        x1="48"
        y1="46"
        x2="48"
        y2="30"
      />
      <line
        x1="48"
        y1="46"
        x2="62"
        y2="46"
        stroke="#c10007"
      />
    </g>
    <circle
      cx="48"
      cy="46"
      r="4"
      fill="#c10007"
    />
  </svg>

  <svg
    v-else-if="name === 'pesawat'"
    viewBox="0 0 140 96"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <!-- Lipatan bawah pesawat kertas (lebih gelap) -->
    <polygon
      points="12,46 128,16 68,78 52,56"
      fill="#cbd5e1"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <!-- Sayap kiri atas -->
    <polygon
      points="12,46 128,16 52,56"
      fill="#ffffff"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <!-- Sayap kanan bawah -->
    <polygon
      points="68,78 128,16 88,84"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'kartu-nama'"
    viewBox="0 0 120 76"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <rect
      x="10"
      y="14"
      width="100"
      height="54"
      rx="10"
      fill="#cbd5e1"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <rect
      x="10"
      y="8"
      width="100"
      height="54"
      rx="10"
      fill="#ffffff"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Pita atas warna kuning pensil -->
    <path
      d="M10 18C10 12.4772 14.4772 8 20 8H100C105.523 8 110 12.4772 110 18V22H10V18Z"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <circle
      cx="30"
      cy="41"
      r="9"
      fill="#93c5fd"
      stroke="#0f172b"
      stroke-width="2.5"
    />
    <line
      x1="48"
      y1="36"
      x2="94"
      y2="36"
      stroke="#0f172b"
      stroke-width="3"
      stroke-linecap="round"
    />
    <line
      x1="48"
      y1="46"
      x2="78"
      y2="46"
      stroke="#64748b"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'bintang'"
    viewBox="0 0 88 88"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <path
      d="M44 14L53.2 32.6L73.7 35.6L58.8 50.1L62.3 70.5L44 60.9L25.7 70.5L29.2 50.1L14.3 35.6L34.8 32.6L44 14Z"
      transform="translate(0 4)"
      fill="#eab308"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M44 10L53.2 28.6L73.7 31.6L58.8 46.1L62.3 66.5L44 56.9L25.7 66.5L29.2 46.1L14.3 31.6L34.8 28.6L44 10Z"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="3"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'gembok-tas'"
    viewBox="0 0 128 128"
    fill="none"
    aria-hidden="true"
    class="select-none"
  >
    <!-- Tali atas tas sekolah -->
    <path
      d="M44 26C44 17.1634 51.1634 10 60 10H68C76.8366 10 84 17.1634 84 26V34H44V26Z"
      stroke="var(--color-tinta)"
      stroke-width="4"
      stroke-linejoin="round"
    />
    <!-- Badan tas sekolah biru -->
    <rect
      x="20"
      y="30"
      width="88"
      height="82"
      rx="20"
      fill="#193cb8"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Tutup atas tas -->
    <path
      d="M20 48C20 38.0589 28.0589 30 38 30H90C99.9411 30 108 38.0589 108 48V64C108 68.4183 104.418 72 100 72H28C23.5817 72 20 68.4183 20 64V48Z"
      fill="#3b82f6"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Tangkai gembok yang menutup saat bagian terlihat -->
    <path
      d="M52 68V58C52 51.3726 57.3726 46 64 46C70.6274 46 76 51.3726 76 58V68"
      stroke="var(--color-tinta)"
      stroke-width="5"
      stroke-linecap="round"
      :style="{
        transform: locked === false ? 'translateY(-10px)' : 'translateY(0px)',
        transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      }"
    />
    <!-- Badan gembok kuning pensil -->
    <rect
      x="44"
      y="66"
      width="40"
      height="34"
      rx="8"
      fill="var(--color-pensil)"
      stroke="var(--color-tinta)"
      stroke-width="3"
    />
    <!-- Lubang kunci -->
    <circle
      cx="64"
      cy="80"
      r="4"
      fill="#0f172b"
    />
    <path
      d="M64 84V92"
      stroke="#0f172b"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
  <svg
    v-else-if="isIlustrasiBaru(name)"
    viewBox="0 0 96 96"
    fill="none"
    aria-hidden="true"
    class="select-none"
    v-html="ILUSTRASI_BARU[name]"
  />
</template>
