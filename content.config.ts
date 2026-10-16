import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// Konten bacaan Guru Kampung (blog dan tutorial) ditulis sebagai Markdown di content/, lalu dibuat statis saat build
export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        date: z.string(),
        penulis: z.string().default('Tim Guru Kampung'),
        tags: z.array(z.string()).default([])
      })
    }),
    tutorial: defineCollection({
      type: 'page',
      source: 'tutorial/*.md',
      schema: z.object({
        date: z.string(),
        // Lihat TUTORIAL_CATEGORIES di app/utils/tutorial.ts
        kategori: z.enum(['perangkat-ajar', 'asesmen', 'cara-pakai']),
        urutan: z.number().default(100),
        durasi: z.string().optional(),
        // Slug alat Guru Kampung yang dipakai di tutorial, ditampilkan sebagai tautan di akhir halaman
        alat: z.array(z.string()).default([])
      })
    })
  }
})
