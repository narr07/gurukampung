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
    // Referensi kurikulum: dasar wajib semua generator AI (okf/referensi-kurikulum.md).
    // Satu berkas = satu mata pelajaran di satu fase, disalin dari dokumen resmi, bukan dibuat AI
    kurikulum: defineCollection({
      type: 'data',
      source: 'kurikulum/*.yml',
      schema: z.object({
        // true selama isinya belum disalin dari dokumen sumber; generator menampilkan peringatan
        contoh: z.boolean().default(false),
        mapelId: z.string(),
        mapel: z.string(),
        fase: z.enum(['A', 'B', 'C']),
        sumber: z.object({
          dokumen: z.string(),
          bagian: z.string().optional()
        }),
        elemen: z.array(z.object({
          id: z.string(),
          nama: z.string(),
          capaian: z.string(),
          materi: z.array(z.object({
            id: z.string(),
            nama: z.string(),
            // Kelas dalam fase yang biasanya mengajarkan materi ini (contoh pembagian, bukan ketetapan resmi)
            kelas: z.array(z.number()).default([]),
            tp: z.array(z.object({
              id: z.string(),
              teks: z.string(),
              kelas: z.number().optional()
            })).default([])
          }))
        }))
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
