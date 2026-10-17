import { TOOLS } from './app/tools/catalog'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    // @nuxthub/core harus dimuat sebelum @nuxtjs/better-auth agar tabel auth masuk ke skema hub:db
    '@nuxthub/core',
    '@nuxtjs/better-auth',
    '@nuxt/content',
    'nuxt-studio',
    '@vueuse/nuxt/module',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  // Nonaktifkan mode gelap sepenuhnya: Guru Kampung hanya memakai tema terang kertas-tinta-pensil
  ui: {
    colorMode: false
  },

  css: ['~/assets/css/main.css'],

  // NuxtHub v0.10.8 (ADR 002). Saat dev: SQLite & file lokal di .data.
  // Binding Cloudflare (D1 + KV + Cache) hanya dipasang di $production, karena tidak tersedia di `nuxt dev`
  hub: {
    db: 'sqlite',
    kv: true,
    cache: true,
    dir: '.data'
  },

  $production: {
    // ID resource dari `wrangler d1 create` / `wrangler kv namespace create`; wrangler.json dibuat otomatis saat build
    hub: {
      db: {
        dialect: 'sqlite',
        driver: 'd1',
        connection: { databaseId: '4967f8c9-e48f-4f7b-8cd7-152c6fa0d795' }
      },
      kv: {
        driver: 'cloudflare-kv-binding',
        namespaceId: 'b98e8b54df514999ae808058bfe33928'
      },
      cache: {
        driver: 'cloudflare-kv-binding',
        namespaceId: '851783a587ae4c7685f7414947d58742'
      }
    },
    nitro: {
      preset: 'cloudflare_module',
      cloudflare: {
        wrangler: {
          name: 'gurukampung',
          observability: { logs: { enabled: true } }
        }
      }
    }
  },

  // Node 22.5+ / Bun punya SQLite bawaan
  content: {
    experimental: { sqliteConnector: 'native' }
  },

  compatibilityDate: '2026-06-30',

  // Render campuran di Cloudflare Workers (ADR 002): halaman publik & alat gratis di-prerender,
  // sedangkan sesi, dashboard, admin, dan API berjalan di server Worker + D1
  routeRules: {
    '/': { prerender: true },
    '/alat': { prerender: true },
    '/paket': { prerender: true },
    '/tutorial/**': { prerender: true },
    '/blog/**': { prerender: true },
    '/dokumen': { prerender: true }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/alat', '/paket', '/tutorial', '/blog', '/dokumen', '/kelas', '/pengaturan', ...TOOLS.map(t => `/alat/${t.slug}`)],
      // Halaman bergantung sesi tidak boleh ikut di-prerender walau ditautkan dari menu
      ignore: ['/dashboard', '/dasbor', '/masuk', '/akun', '/admin']
    }
  },

  vite: {
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
        'lucide:layout-dashboard',
        'lucide:sparkles',
        'lucide:shield-check',
        'lucide:key-round'
      ]
    }
  },

  // Editor konten di /_studio
  studio: {
    repository: {
      provider: 'github',
      owner: 'narr07',
      repo: 'gurukampung',
      branch: 'main'
    }
  }
})
