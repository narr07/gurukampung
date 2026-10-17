import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

// Webhook pembayaran dari payment gateway Indonesia (Xendit / Midtrans, PRD B-03 & B-04).
// Status langganan hanya berubah dari webhook yang tanda tangannya diverifikasi, dan aman diulang (idempotent).
export default defineEventHandler(async (event) => {
  const secret = process.env.NUXT_PAYMENT_WEBHOOK_SECRET
  const tokenHeader = getHeader(event, 'x-callback-token') || getHeader(event, 'x-webhook-signature')

  if (!secret || tokenHeader !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Tanda tangan webhook tidak sah.' })
  }

  const payload = await readBody<{
    invoiceId: string
    userId: string
    plan: 'bulanan' | 'tahunan'
    method: 'qris' | 'va' | 'ewallet'
    amountRp: number
    status: 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED'
  }>(event)

  if (!payload?.invoiceId || !payload?.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Payload webhook tidak lengkap.' })
  }

  const now = new Date()
  const isPaid = payload.status === 'PAID' || payload.status === 'SETTLED'

  // Idempoten: kalau invoice sudah lunas sebelumnya, jangan gandakan masa aktif (ADR 002 Bagian 5)
  const [existingPayment] = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.invoiceId, payload.invoiceId))
    .limit(1)

  if (existingPayment?.status === 'lunas') {
    return { ok: true, idempotent: true }
  }

  if (existingPayment) {
    await db
      .update(schema.payments)
      .set({
        status: isPaid ? 'lunas' : 'gagal',
        webhookVerified: true,
        paidAt: isPaid ? now : null
      })
      .where(eq(schema.payments.id, existingPayment.id))
  } else {
    await db.insert(schema.payments).values({
      id: `pay-${crypto.randomUUID()}`,
      invoiceId: payload.invoiceId,
      userId: payload.userId,
      plan: payload.plan ?? 'bulanan',
      method: payload.method ?? 'qris',
      amountRp: Number(payload.amountRp || 0),
      status: isPaid ? 'lunas' : 'gagal',
      webhookVerified: true,
      paidAt: isPaid ? now : null,
      createdAt: now
    })
  }

  if (isPaid) {
    const durasiHari = payload.plan === 'tahunan' ? 365 : 30
    const expiresAt = new Date(now.getTime() + durasiHari * 86_400_000)

    const [sub] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, payload.userId))
      .limit(1)

    if (sub) {
      await db
        .update(schema.subscriptions)
        .set({
          plan: payload.plan,
          status: 'aktif',
          expiresAt,
          grantedBy: 'webhook',
          updatedAt: now
        })
        .where(eq(schema.subscriptions.id, sub.id))
    } else {
      await db.insert(schema.subscriptions).values({
        id: `sub-${crypto.randomUUID()}`,
        userId: payload.userId,
        plan: payload.plan,
        status: 'aktif',
        expiresAt,
        textQuotaLimit: 60,
        imageQuotaLimit: 25,
        grantedBy: 'webhook',
        createdAt: now,
        updatedAt: now
      })
    }
  }

  return { ok: true }
})

