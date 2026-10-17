import { TOOLS } from './app/tools/catalog'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    // @nuxthub/core harus dimuat sebelum @nuxtjs/better-auth agar tabel auth masuk ke skema hub:db
    '@nuxthub/core',
    '@nuxtjs/better-auth',
    // Nuxt SEO harus dimuat sebelum @nuxt/content supaya asSeoCollection di content.config.ts berlaku
    '@nuxtjs/seo',
    '@nuxt/content',
    'nuxt-studio',
    '@vueuse/nuxt/module',
    '@pinia/nuxt'
  ],

  $production: {
    // ID resource dari `wrangler d1 create` / `wrangler kv namespace create`; wrangler.json dibuat otomatis saat build
    nitro: {
      preset: 'cloudflare_module',
      cloudflare: {
        wrangler: {
          name: 'gurukampung',
          observability: { logs: { enabled: true } }
        }
      }
    },
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
      },
      // Bucket dibuat dengan `bunx wrangler r2 bucket create gurukampung-media`
      blob: {
        driver: 'cloudflare-r2',
        bucketName: 'gurukampung-media'
      }
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Nuxt SEO: dasar untuk sitemap, robots, schema.org, llms.txt, dan OG image.
  // Alamat produksi bisa diganti lewat env NUXT_SITE_URL (bukan NUXT_PUBLIC_SITE_URL yang di dev berisi localhost)
  site: {
    // Domain sementara; ganti di sini (atau env NUXT_SITE_URL) saat pindah ke domain final
    url: 'https://gurukampung.permadi.dev',
    name: 'Guru Kampung',
    description: 'Alat kerja guru SD di peramban: pemilih siswa acak, pembagi kelompok, timer, lembar kerja, LKPD, RPP, dan rangkuman materi sesuai Kurikulum Merdeka.',
    defaultLocale: 'id'
  },

  // Node 22.5+ / Bun punya SQLite bawaan
  content: {
    experimental: { sqliteConnector: 'native' }
  },

  // Nonaktifkan mode gelap sepenuhnya: Guru Kampung hanya memakai tema terang kertas-tinta-pensil
  ui: {
    colorMode: false
  },

  // Render campuran di Cloudflare Workers (ADR 002): halaman publik & alat gratis di-prerender,
  // sedangkan sesi, dashboard, admin, dan API berjalan di server Worker + D1
  routeRules: {
    '/': { prerender: true },
    '/alat': { prerender: true },
    '/paket': { prerender: true },
    '/tutorial/**': { prerender: true },
    '/blog/**': { prerender: true },
    '/dokumen': { prerender: true },
    // Halaman akun dan admin tidak diindeks mesin pencari (meta noindex)
    '/dashboard': { robots: false },
    '/dasbor': { robots: false },
    '/akun': { robots: false },
    '/masuk': { robots: false },
    '/admin/**': { robots: false }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/alat', '/paket', '/tutorial', '/blog', '/dokumen', '/kelas', '/pengaturan', ...TOOLS.map(t => `/alat/${t.slug}`), '/sitemap.xml', '/robots.txt', '/llms.txt'],
      // Halaman bergantung sesi tidak boleh ikut di-prerender walau ditautkan dari menu
      ignore: ['/dashboard', '/dasbor', '/masuk', '/akun', '/admin']
    }
  },

  // NuxtHub v0.10.8 (ADR 002). Saat dev: SQLite & file lokal di .data.
  // Binding Cloudflare (D1 + KV + Cache) hanya dipasang di $production, karena tidak tersedia di `nuxt dev`
  hub: {
    db: 'sqlite',
    kv: true,
    cache: true,
    // Foto profil akun (server/api/akun/foto.*); di produksi disimpan di R2
    blob: true,
    dir: '.data'
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

  // Halaman yang butuh akun mengarah ke /masuk, bukan /login bawaan modul
  auth: {
    redirects: {
      login: '/masuk',
      guest: '/dashboard'
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

  // OG image juga dibuat saat build saja, supaya renderer gambar tidak ikut masuk ke Worker
  ogImage: {
    zeroRuntime: true,
    defaults: { component: 'GuruKampung' },
    // Hanya berlaku saat build; 15 detik bawaan terlalu singkat di laptop yang sedang berat dan membuat build gagal
    security: { renderTimeout: 60_000 }
  },

  // Halaman pribadi, API, dan editor tidak boleh dirayapi
  robots: {
    groups: [
      { userAgent: '*', disallow: ['/admin', '/dashboard', '/dasbor', '/akun', '/masuk', '/api/', '/_studio', '/foto-profil/'] }
    ]
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Guru Kampung',
      logo: '/icon-512.png',
      email: 'dinar@permadi.dev'
    }
  },

  // Sitemap dibuat saat build saja (zeroRuntime), karena semua halaman publik di-prerender dan Worker sudah besar
  sitemap: {
    zeroRuntime: true,
    exclude: ['/admin/**', '/dashboard', '/dasbor', '/akun', '/masuk']
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
