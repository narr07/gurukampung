import { newSeed } from '~/utils/random'

// Seed acak baru dibuat setelah mount. Kalau dibuat saat setup, server dan peramban
// menghasilkan angka berbeda dan HTML hasil prerender tidak cocok (hydration mismatch)
export function useSeed() {
  const seed = ref(0)
  onMounted(() => (seed.value = newSeed()))
  const reroll = () => (seed.value = newSeed())
  return { seed, reroll }
}
