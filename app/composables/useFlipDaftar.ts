import type { MaybeElementRef } from '@vueuse/core'
import type { WatchSource } from 'vue'

// Animasi GSAP Flip untuk daftar yang disaring atau diurutkan ulang (misalnya kartu alat saat kategori dipilih):
// posisi anak dicatat sebelum DOM berubah, lalu anak yang tetap ada meluncur ke tempat barunya
// dan anak yang baru masuk muncul dengan sedikit pantulan. Mati kalau pengguna memilih kurangi gerak
export function useFlipDaftar(container: MaybeElementRef, source: WatchSource) {
  const reducedMotion = usePreferredReducedMotion()
  let state: ReturnType<ReturnType<typeof useGSAP>['Flip']['getState']> | undefined
  let flip: { kill: () => void } | undefined

  const children = () => {
    const el = unrefElement(container)
    return el instanceof HTMLElement ? Array.from(el.children) as HTMLElement[] : []
  }

  watch(source, () => {
    if (reducedMotion.value === 'reduce' || !import.meta.client) return
    const items = children()
    if (items.length === 0) return
    const { Flip } = useGSAP()
    flip?.kill()
    state = Flip.getState(items)
  }, { flush: 'pre' })

  watch(source, () => {
    if (!state) return
    const { gsap, Flip } = useGSAP()
    flip = Flip.from(state, {
      targets: children(),
      duration: 0.5,
      ease: 'power3.inOut',
      prune: true,
      onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.92, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.04 })
    })
    state = undefined
  }, { flush: 'post' })

  onBeforeUnmount(() => flip?.kill())
}
