import { useDb } from '~/db'
import type { ClassRecord } from '~/utils/backup'
import { SAMPLE_CLASS_NAME, sampleAttendance, sampleGradeBook, sampleMasteryBook, sampleStudents } from '~/utils/sample'

// Kelas contoh lengkap: 24 siswa dummy beserta nilai rapor, ketuntasan per TP, dan absensi sejak awal bulan lalu.
// Kelas dan data alatnya disimpan dalam satu transaksi, supaya alat yang sedang terbuka tidak sempat membaca
// kelas baru sebelum nilainya tersimpan
export function useSampleClass() {
  const toast = useToast()
  const { classes } = useClasses()
  const classId = useLocalStorage<string | undefined>('peragu:kelas-aktif', undefined, { initOnMounted: true })
  const hasSample = computed(() => classes.value.some(c => c.name === SAMPLE_CLASS_NAME))
  const creating = ref(false)

  async function addSampleClass() {
    if (creating.value) return
    creating.value = true
    try {
      const now = Date.now()
      const students = sampleStudents(() => crypto.randomUUID())
      const record: ClassRecord = { id: crypto.randomUUID(), name: SAMPLE_CLASS_NAME, students, createdAt: now, updatedAt: now }
      const db = useDb()
      await db.transaction('rw', [db.classes, db.toolData], async () => {
        await db.toolData.bulkPut([
          { key: `nilai-rapor:${record.id}`, value: sampleGradeBook(students), updatedAt: now },
          { key: `ketuntasan:${record.id}`, value: sampleMasteryBook(students), updatedAt: now },
          { key: `rekap-absensi:${record.id}`, value: sampleAttendance(students), updatedAt: now }
        ])
        await db.classes.add(record)
      })
      classId.value = record.id
      toast.add({
        title: 'Kelas contoh dibuat',
        description: '24 siswa dummy lengkap dengan nilai dan absensi. Hapus di Data Kelas kapan saja.',
        color: 'success',
        icon: 'i-lucide-check'
      })
      return record
    } finally {
      creating.value = false
    }
  }

  return { addSampleClass, hasSample, creating }
}
