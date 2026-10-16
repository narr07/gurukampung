import { TOOLS } from './app/tools/catalog'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt/module',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-06-30',

  // Situs statis (ADR 001): semua halaman dibuat saat build, termasuk halaman setiap alat
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/kelas', '/pengaturan', ...TOOLS.map(t => `/alat/${t.slug}`)]
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        'gsap',
        'gsap/ScrollTrigger',
        'gsap/Flip',
        'lenis'
      ]
    }
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

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
