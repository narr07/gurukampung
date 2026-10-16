// Daftar slug alat favorit disimpan di localStorage perangkat guru (PRD F-01)
export function useFavorites() {
  const favorites = useLocalStorage<string[]>('peragu:favorit', [], { initOnMounted: true })

  function isFavorite(slug: string) {
    return favorites.value.includes(slug)
  }

  function toggleFavorite(slug: string) {
    if (favorites.value.includes(slug)) {
      favorites.value = favorites.value.filter(s => s !== slug)
    } else {
      favorites.value = [...favorites.value, slug]
    }
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite
  }
}

