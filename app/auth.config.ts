import { adminClient, magicLinkClient } from 'better-auth/client/plugins'
import { defineClientAuth } from '@nuxtjs/better-auth/config'

// Pasangan plugin klien Better Auth sesuai server/auth.config.ts
export default defineClientAuth({
  plugins: [
    adminClient(),
    magicLinkClient()
  ]
})

