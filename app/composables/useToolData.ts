import { useDb } from '~/db'

// Data kerja satu alat (misalnya nilai kelas 4A) di IndexedDB, ikut masuk ke file cadangan.
// Perubahan disimpan otomatis setelah jeda singkat; `saved` false selama ada perubahan yang belum tersimpan
export function useToolData<T>(key: MaybeRefOrGetter<string | undefined>, initial: () => T) {
  const data = ref(initial()) as Ref<T>
  const status = ref<LoadStatus>('pending')
  const saved = ref(true)
  let loading = false

  async function load(k: string | undefined) {
    if (import.meta.server) return
    loading = true
    status.value = 'pending'
    try {
      const row = k ? await useDb().toolData.get(k) : undefined
      data.value = (row?.value as T | undefined) ?? initial()
      status.value = 'success'
    } catch {
      data.value = initial()
      status.value = 'error'
    } finally {
      saved.value = true
      // Lewati satu siklus watch supaya data yang baru dimuat tidak dianggap perubahan
      await nextTick()
      loading = false
    }
  }

  const persist = useDebounceFn(async () => {
    const k = toValue(key)
    if (!k) return
    try {
      await useDb().toolData.put({ key: k, value: JSON.parse(JSON.stringify(data.value)), updatedAt: Date.now() })
      saved.value = true
    } catch {
      status.value = 'error'
    }
  }, 400)

  watch(data, () => {
    if (loading) return
    saved.value = false
    persist()
  }, { deep: true })

  onMounted(() => {
    watch(() => toValue(key), k => load(k), { immediate: true })
  })

  return { data, status, saved }
}
