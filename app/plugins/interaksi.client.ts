// Menandai <html> dengan kelas ada-interaksi setelah sentuhan, klik, atau tombol keyboard pertama.
// Animasi pilihan di main.css hanya aktif setelah itu, supaya elemen yang sudah terpilih saat halaman dimuat tidak ikut memantul
export default defineNuxtPlugin(() => {
  const tandai = () => {
    document.documentElement.classList.add('ada-interaksi')
    window.removeEventListener('pointerdown', tandai)
    window.removeEventListener('keydown', tandai)
  }
  window.addEventListener('pointerdown', tandai, { passive: true })
  window.addEventListener('keydown', tandai)
})
