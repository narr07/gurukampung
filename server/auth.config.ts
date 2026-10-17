import { admin, magicLink } from 'better-auth/plugins'
import { defineServerAuth } from '@nuxtjs/better-auth/config'

// Konfigurasi server Better Auth untuk Guru Kampung (PRD 7.2 A-01 s.d. A-08 & ADR 002 Bagian 3).
// Saat dipasangkan dengan @nuxthub/core (hub.db = 'sqlite'), tabel auth D1 dibuat otomatis.
export default defineServerAuth({
  // A-03: Masuk dan daftar dengan email & kata sandi
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8
  },

  // A-01: Masuk dengan Google (akun @guru.sd.belajar.id adalah akun Google)
  socialProviders: {
    google: {
      clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || ''
    }
  },

  // A-04: Satu email = satu akun; cara masuk berbeda dengan email yang sama otomatis digabungkan
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google']
    }
  },

  plugins: [
    // M-01 & M-02: Peran admin khusus pemilik untuk mengelola pengguna dan langganan
    admin(),

    // A-02: Tautan masuk lewat email tanpa kata sandi (sekali pakai, berlaku 15 menit)
    magicLink({
      expiresIn: 60 * 15,
      sendMagicLink: async ({ email, url }) => {
        // E-01: Di produksi dihubungkan ke layanan email transaksional (Resend / Postmark / Brevo)
        console.info(`[Guru Kampung Auth] Tautan masuk untuk ${email}: ${url}`)
      }
    })
  ]
})

