import { blob } from 'hub:blob'

// Unggah foto profil (halaman /akun). Gambar sudah dipotong persegi dan diperkecil ke 256px di peramban,
// server hanya memeriksa jenis dan ukurannya, menyimpannya di blob (R2 di produksi), lalu memperbarui user.image
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const form = await readFormData(event)
  const file = form.get('foto')
  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'Foto tidak ditemukan.' })
  }
  ensureBlob(file, { maxSize: '1MB', types: ['image/webp', 'image/jpeg', 'image/png'] })

  const lama = session.user.image
  // Safari tidak bisa membuat WebP dari canvas dan mengirim PNG, jadi ekstensi mengikuti jenis berkas
  const ekstensi = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const hasil = await blob.put(`${session.user.id}.${ekstensi}`, file, {
    prefix: 'foto-profil',
    addRandomSuffix: true,
    contentType: file.type
  })
  const image = `/${hasil.pathname}`
  await serverAuth(event).api.updateUser({ body: { image }, headers: event.headers })

  // Foto lama milik pengguna ini dihapus supaya penyimpanan tidak menumpuk
  if (lama?.startsWith('/foto-profil/')) {
    await blob.del(lama.slice(1)).catch(() => {})
  }
  return { image }
})
