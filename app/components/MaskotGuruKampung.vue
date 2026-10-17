<script setup lang="ts">
// Maskot Guru Kampung (public/brand/guru-kampung-maskot.svg) sebagai SVG inline:
// berkedip, melambai, dan sedikit melayang lewat CSS di main.css (.maskot)
</script>

<template>
  <svg
    class="maskot"
    viewBox="70 56 390 420"
    aria-hidden="true"
    focusable="false"
  >
    <g class="maskot-tubuh">
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
    </g>
  </svg>
</template>
