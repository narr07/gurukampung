// Aplikasi berganti nama dari Peragu menjadi Guru Kampung. Pengaturan alat yang tersimpan dengan kunci lama
// (peragu:*) disalin ke kunci baru (gurukampung:*) sebelum halaman dipasang, supaya guru tidak kehilangan
// pengaturannya. Data kelas di IndexedDB tidak perlu dipindah karena nama database-nya tetap
export default defineNuxtPlugin(() => {
  try {
    const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('peragu:'))
    for (const oldKey of oldKeys) {
      const newKey = `gurukampung:${oldKey.slice('peragu:'.length)}`
      const value = localStorage.getItem(oldKey)
      if (value !== null && localStorage.getItem(newKey) === null) localStorage.setItem(newKey, value)
      localStorage.removeItem(oldKey)
    }
  } catch {
    // Penyimpanan bisa diblokir peramban; aplikasi tetap jalan dengan pengaturan bawaan
  }
})
