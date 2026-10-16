// Kelas yang terakhir dipilih diingat di semua alat, supaya guru tidak memilih ulang tiap membuka alat
export function useActiveClass() {
  const classId = useLocalStorage<string | undefined>('gurukampung:kelas-aktif', undefined, { initOnMounted: true })
  const { classes, status } = useClasses()

  const activeClass = computed(() => classes.value.find(c => c.id === classId.value))
  const students = computed(() =>
    [...(activeClass.value?.students ?? [])].sort((a, b) => (a.number ?? 999) - (b.number ?? 999))
  )

  // Kalau kelas yang diingat sudah dihapus, atau baru ada satu kelas, pilih otomatis
  watch(classes, (list) => {
    if (list.length && !list.some(c => c.id === classId.value)) classId.value = list[0]!.id
  })

  return { classId, activeClass, students, classes, status }
}
