import { blob } from 'hub:blob'

// Menyajikan foto profil dari blob. Nama berkas memakai akhiran acak dan berganti setiap unggahan,
// jadi aman disimpan lama di cache peramban
export default defineEventHandler(async (event) => {
  const pathname = getRouterParam(event, 'pathname')
  if (!pathname || pathname.includes('..')) {
    throw createError({ statusCode: 404, statusMessage: 'Foto tidak ditemukan.' })
  }
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return blob.serve(event, `foto-profil/${pathname}`)
})
