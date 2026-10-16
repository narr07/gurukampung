export type FontSizeScale = 'normal' | 'besar' | 'sangat-besar'

// Pengaturan ukuran huruf di seluruh aplikasi (PRD F-08)
export function useFontSize() {
  const fontSize = useLocalStorage<FontSizeScale>('peragu:ukuran-huruf', 'normal', { initOnMounted: true })

  if (import.meta.client) {
    watch(fontSize, (val) => {
      document.documentElement.dataset.fontSize = val
    }, { immediate: true })
  }

  return {
    fontSize
  }
}

