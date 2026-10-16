import { TOOLS } from './app/tools/catalog'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-studio',
    '@vueuse/nuxt/module',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Node 22.5+ punya SQLite bawaan, jadi tidak perlu memasang better-sqlite3
  content: {
    experimental: { sqliteConnector: 'native' }
  },

  compatibilityDate: '2026-06-30',

  // Situs statis (ADR 001): semua halaman dibuat saat build, termasuk halaman setiap alat.
  // Preset ditulis eksplisit: kalau dibiarkan, Cloudflare Pages terdeteksi dan Nuxt Content beralih ke database D1
  nitro: {
    preset: 'static',
    // Hasil build langsung ke dist/ (folder output Cloudflare Pages). Tanpa ini Nuxt membuat dist/ sebagai
    // symlink ke .output/public, dan Cloudflare menolak folder output yang berisi tautan
    output: { publicDir: '{{ rootDir }}/dist' },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/alat', '/tutorial', '/blog', '/dokumen', '/kelas', '/pengaturan', ...TOOLS.map(t => `/alat/${t.slug}`)]
    }
  },

  vite: {
    // Semua dependensi yang dimuat lambat harus dibundel di awal; kalau Vite baru menemukannya saat halaman berjalan,
    // modul yang sudah dimuat gagal diambil ("Failed to fetch dynamically imported module")
    optimizeDeps: {
      include: [
        'dexie',
        'gsap',
        'gsap/ScrollTrigger',
        'gsap/Flip',
        'lenis'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // Font diunduh saat build dan disajikan dari situs sendiri. Bawaan @nuxt/fonts hanya 400-700, judul panggung butuh 800
  fonts: {
    families: [
      { name: 'Funnel Display', provider: 'google', weights: ['500 800'] },
      { name: 'Funnel Sans', provider: 'google', weights: ['400 700'], styles: ['normal', 'italic'] }
    ]
  },

  // Bundel seluruh ikon Lucide secara lokal agar tidak timeout dan berjalan 100% luring
  icon: {
    serverBundle: 'local',
    fallbackToApi: false,
    clientBundle: {
      scan: {
        globInclude: ['app/**/*.{vue,ts}']
      },
      icons: [
        ...TOOLS.map(t => t.icon.replace(/^i-lucide-/, 'lucide:')),
        'lucide:printer',
        'lucide:loader-pinwheel',
        'lucide:check',
        'lucide:chevron-down',
        'lucide:chevron-up',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:x',
        'lucide:search',
        'lucide:star',
        'lucide:users',
        'lucide:download',
        'lucide:upload',
        'lucide:plus',
        'lucide:trash-2',
        'lucide:rotate-ccw',
        'lucide:maximize-2',
        'lucide:minimize-2',
        'lucide:sun',
        'lucide:moon'
      ]
    }
  },

  // Editor konten di /_studio. Di dev langsung menulis ke content/; di produksi butuh deploy SSR (nuxt build)
  // dan OAuth GitHub (STUDIO_GITHUB_CLIENT_ID dan STUDIO_GITHUB_CLIENT_SECRET di nuxt-studio 1.7), lalu menyimpan sebagai commit
  studio: {
    repository: {
      provider: 'github',
      owner: 'narr07',
      repo: 'gurukampung',
      branch: 'main'
    }
  }
})
