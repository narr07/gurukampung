import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Skema database Cloudflare D1 (SQLite) untuk Guru Kampung lewat NuxtHub (okf/keputusan/002-saas.md).
// Tabel auth (users, sessions, accounts, verifications) dibuat otomatis oleh @nuxtjs/better-auth.
// PENTING: Tidak ada tabel siswa, kelas, nilai, atau isian alat di server (PRD Bagian 3 & 8).

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  plan: text('plan', { enum: ['gratis', 'bulanan', 'tahunan'] }).notNull().default('gratis'),
  status: text('status', { enum: ['aktif', 'kedaluwarsa', 'dibatalkan'] }).notNull().default('aktif'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  textQuotaLimit: integer('text_quota_limit').notNull().default(60),
  imageQuotaLimit: integer('image_quota_limit').notNull().default(25),
  grantedBy: text('granted_by', { enum: ['webhook', 'manual-admin'] }).notNull().default('webhook'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().unique(),
  userId: text('user_id').notNull(),
  plan: text('plan', { enum: ['bulanan', 'tahunan'] }).notNull(),
  method: text('method', { enum: ['qris', 'va', 'ewallet', 'manual'] }).notNull(),
  amountRp: integer('amount_rp').notNull(),
  status: text('status', { enum: ['pending', 'lunas', 'gagal'] }).notNull().default('pending'),
  webhookVerified: integer('webhook_verified', { mode: 'boolean' }).notNull().default(false),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// Catatan pemakaian kuota dan estimasi biaya API Gemini per generate tanpa menyimpan isi masukan (aturan AI-05 & AI-11)
export const aiUsage = sqliteTable('ai_usage', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  periodMonth: text('period_month').notNull(), // Format YYYY-MM, misalnya '2026-10'
  toolSlug: text('tool_slug').notNull(),
  textCount: integer('text_count').notNull().default(0),
  imageCount: integer('image_count').notNull().default(0),
  estimatedCostRp: integer('estimated_cost_rp').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// Pengaturan status alat gratis / berbayar oleh pemilik tanpa mengubah kode (PRD M-03)
export const toolTiers = sqliteTable('tool_tiers', {
  slug: text('slug').primaryKey(),
  tier: text('tier', { enum: ['gratis', 'berbayar'] }).notNull().default('gratis'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

