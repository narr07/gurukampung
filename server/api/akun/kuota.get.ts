import { and, eq, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

// Mengambil status paket aktif dan sisa kuota AI bulanan untuk pengguna yang sedang masuk (PRD A-06 & AI-05)
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu.' })
  }

  const userId = session.user.id
  const periodMonth = new Date().toISOString().slice(0, 7)

  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .limit(1)

  const [usage] = await db
    .select({
      textUsed: sql<number>`coalesce(sum(${schema.aiUsage.textCount}), 0)`,
      imageUsed: sql<number>`coalesce(sum(${schema.aiUsage.imageCount}), 0)`
    })
    .from(schema.aiUsage)
    .where(and(eq(schema.aiUsage.userId, userId), eq(schema.aiUsage.periodMonth, periodMonth)))

  const isPaidActive = Boolean(sub && sub.status === 'aktif' && sub.expiresAt.getTime() > Date.now())
  const textLimit = isPaidActive ? sub.textQuotaLimit : 3
  const imageLimit = isPaidActive ? sub.imageQuotaLimit : 1

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email
    },
    subscription: sub ?? {
      plan: 'gratis',
      status: 'aktif',
      expiresAt: null
    },
    quota: {
      periodMonth,
      textUsed: Number(usage?.textUsed ?? 0),
      textLimit,
      imageUsed: Number(usage?.imageUsed ?? 0),
      imageLimit
    }
  }
})

