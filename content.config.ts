import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// Konten bacaan Peragu (blog dan tutorial) ditulis sebagai Markdown di content/, lalu dibuat statis saat build
export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        date: z.string(),
        penulis: z.string().default('Tim Peragu'),
        tags: z.array(z.string()).default([])
      })
    }),
    tutorial: defineCollection({
      type: 'page',
      source: 'tutorial/*.md',
      schema: z.object({
        date: z.string(),
        // Lihat TUTORIAL_CATEGORIES di app/utils/tutorial.ts
        kategori: z.enum(['perangkat-ajar', 'asesmen', 'peragu']),
        urutan: z.number().default(100),
        durasi: z.string().optional(),
        // Slug alat Peragu yang dipakai di tutorial, ditampilkan sebagai tautan di akhir halaman
        alat: z.array(z.string()).default([])
      })
    })
  }
})
