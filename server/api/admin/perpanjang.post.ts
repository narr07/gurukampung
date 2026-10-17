import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

// Memberi atau memperpanjang masa aktif langganan secara manual oleh pemilik (PRD M-02)
export default defineEventHandler(async (event) => {
  await requireUserSession(event, {
    user: { role: 'admin' }
  })

  const body = await readBody<{
    userId: string
    plan?: 'bulanan' | 'tahunan'
    durasiHari?: number
    note?: string
  }>(event)

  if (!body?.userId) {
    throw createError({ statusCode: 400, statusMessage: 'userId wajib diisi.' })
  }

  const days = Math.max(1, Math.min(365, Number(body.durasiHari || 30)))
  const now = new Date()
  const expiresAt = new Date(now.getTime() + days * 86_400_000)

  const [existing] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, body.userId))
    .limit(1)

  if (existing) {
    await db
      .update(schema.subscriptions)
      .set({
        plan: body.plan ?? 'bulanan',
        status: 'aktif',
        expiresAt,
        grantedBy: 'manual-admin',
        note: body.note ?? 'Perpanjangan manual pemilik',
        updatedAt: now
      })
      .where(eq(schema.subscriptions.id, existing.id))
  } else {
    await db.insert(schema.subscriptions).values({
      id: `sub-${crypto.randomUUID()}`,
      userId: body.userId,
      plan: body.plan ?? 'bulanan',
      status: 'aktif',
      expiresAt,
      textQuotaLimit: 60,
      imageQuotaLimit: 25,
      grantedBy: 'manual-admin',
      note: body.note ?? 'Pemberian manual pemilik',
      createdAt: now,
      updatedAt: now
    })
  }

  return { ok: true, expiresAt: expiresAt.toISOString() }
})

