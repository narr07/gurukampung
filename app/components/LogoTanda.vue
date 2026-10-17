<script setup lang="ts">
// Tanda pensil-rumah Guru Kampung (public/brand/guru-kampung-mark.svg) sebagai SVG inline,
// supaya tiap bagian bisa dianimasikan lewat CSS di main.css (.logo-tanda).
// Bayangan hanya selebar badan dan ikut bergerak bersama pensil, jadi tidak tertinggal saat atap terangkat
</script>

<template>
  <svg
    class="logo-tanda"
    viewBox="138 72 236 396"
    aria-hidden="true"
    focusable="false"
  >
    <g
      class="logo-pensil"
      stroke="#0f172b"
      stroke-width="24"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <path
        d="M150 270 H362 V456 H150 Z"
        fill="#0f172b"
      />
      <path
        d="M150 250 Q185.3 286 220.7 250 Q256 286 291.3 250 Q326.7 286 362 250 V436 H150 Z"
        fill="#ffdf20"
      />
      <path
        d="M218 436 V372 A38 38 0 0 1 294 372 V436 Z"
        fill="#0f172b"
        stroke="none"
      />
      <g class="logo-atap">
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
    </g>
  </svg>
</template>
