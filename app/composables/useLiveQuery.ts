import { liveQuery } from 'dexie'

export type LoadStatus = 'pending' | 'success' | 'error'

// Data dari IndexedDB yang ikut diperbarui otomatis saat isinya berubah, juga dari tab lain.
// Hanya berjalan di peramban; selama prerender statusnya tetap 'pending'
export function useLiveQuery<T>(query: () => Promise<T>, initial: T) {
  const data = shallowRef<T>(initial)
  const status = ref<LoadStatus>('pending')
  const error = shallowRef<unknown>()
  let subscription: { unsubscribe: () => void } | undefined

  onMounted(() => {
    subscription = liveQuery(query).subscribe({
      next: (value) => {
        data.value = value
        status.value = 'success'
      },
      error: (err) => {
        error.value = err
        status.value = 'error'
      }
    })
  })

  onBeforeUnmount(() => subscription?.unsubscribe())

  return { data, status, error }
}
