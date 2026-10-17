import { and, eq, gt } from 'drizzle-orm'
import { db, schema } from 'hub:db'

// Isi berbayar blog dan tutorial (okf/rencana-konten.md). Berkasnya ada di server/assets/premium/<id>.md dan hanya
// dikirim ke pelanggan aktif atau admin. Isi ini tidak pernah ada di content/, karena koleksi Nuxt Content terkirim utuh ke peramban
const ID = /^[a-z0-9-]{3,80}$/

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  if (!ID.test(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Isi tidak ditemukan.' })
  }

  const session = await requireUserSession(event)
  if (session.user.role !== 'admin') {
    const [langganan] = await db
      .select({ plan: schema.subscriptions.plan })
      .from(schema.subscriptions)
      .where(and(
        eq(schema.subscriptions.userId, session.user.id),
        eq(schema.subscriptions.status, 'aktif'),
        gt(schema.subscriptions.expiresAt, new Date())
      ))
      .limit(1)
    if (!langganan || langganan.plan === 'gratis') {
      throw createError({ statusCode: 403, statusMessage: 'Bagian ini khusus pelanggan.' })
    }
  }

  const markdown = await useStorage('assets:server').getItem<string>(`premium:${id}.md`)
  if (!markdown) {
    throw createError({ statusCode: 404, statusMessage: 'Isi tidak ditemukan.' })
  }
  setHeader(event, 'Cache-Control', 'private, no-store')
  return { markdown: String(markdown) }
})
