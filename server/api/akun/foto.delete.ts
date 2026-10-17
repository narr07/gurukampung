import { blob } from 'hub:blob'

// Hapus foto profil: berkas di blob dihapus dan user.image dikosongkan, avatar kembali ke inisial nama
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const lama = session.user.image
  await serverAuth(event).api.updateUser({ body: { image: null }, headers: event.headers })
  if (lama?.startsWith('/foto-profil/')) {
    await blob.del(lama.slice(1)).catch(() => {})
  }
  return { image: null }
})
