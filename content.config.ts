import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } from '@nuxtjs/seo/content'

// Konten bacaan Guru Kampung (blog dan tutorial) ditulis sebagai Markdown di content/, lalu dibuat statis saat build.
// Kolom SEO dari Nuxt SEO (sitemap, robots, ogImage, schemaOrg) bisa diatur per artikel lewat frontmatter
export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        date: z.string(),
        penulis: z.string().default('Tim Guru Kampung'),
        tags: z.array(z.string()).default([]),
        // true kalau artikel memuat ::konten-terkunci (sebagian isi khusus pelanggan); tampil sebagai lencana di kartu
        terkunci: z.boolean().default(false),
        sitemap: defineSitemapSchema({ z }),
        robots: defineRobotsSchema({ z }),
        ogImage: defineOgImageSchema({ z }),
        schemaOrg: defineSchemaOrgSchema({ z }),
        // Nama ilustrasi stiker dari utils/ilustrasi.ts (NamaIlustrasi), tampil di kartu dan kepala artikel
        ilustrasi: z.string().optional()
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
              kelas: z.number().optional(),
              // Unsur TP format ABCD; `teks` adalah gabungannya. Minimal resmi hanya kompetensi + lingkup materi
              // (= behavior), jadi condition dan degree boleh tidak ada. Generator memakai behavior untuk isi dan
              // tingkat Bloom, condition untuk bentuk soal dan media, degree untuk kunci, rubrik, dan KKTP
              abcd: z.object({
                audience: z.string(),
                behavior: z.string(),
                condition: z.string().optional(),
                degree: z.string().optional()
              }).optional()
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
        alat: z.array(z.string()).default([]),
        // true kalau artikel memuat ::konten-terkunci (sebagian isi khusus pelanggan); tampil sebagai lencana di kartu
        terkunci: z.boolean().default(false),
        sitemap: defineSitemapSchema({ z }),
        robots: defineRobotsSchema({ z }),
        ogImage: defineOgImageSchema({ z }),
        schemaOrg: defineSchemaOrgSchema({ z }),
        // Nama ilustrasi stiker dari utils/ilustrasi.ts (NamaIlustrasi)
        ilustrasi: z.string().optional()
      })
    })
  }
})
