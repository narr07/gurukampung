import { useDb } from '~/db'
import type { ClassRecord } from '~/utils/backup'
import type { Student } from '~/utils/roster'

const newId = () => crypto.randomUUID()

export function useClasses() {
  const { data: classes, status, error } = useLiveQuery(
    () => useDb().classes.orderBy('name').toArray(),
    [] as ClassRecord[]
  )

  async function createClass(name: string) {
    const now = Date.now()
    const record: ClassRecord = { id: newId(), name: name.trim(), students: [], createdAt: now, updatedAt: now }
    await useDb().classes.add(record)
    return record
  }

  async function renameClass(id: string, name: string) {
    await useDb().classes.update(id, { name: name.trim(), updatedAt: Date.now() })
  }

  async function saveStudents(id: string, students: Student[]) {
    // Disimpan sebagai objek biasa: Dexie tidak bisa menyimpan proxy reaktif Vue
    const plain = students.map(s => ({ ...s }))
    await useDb().classes.update(id, { students: plain, updatedAt: Date.now() })
  }

  async function deleteClass(id: string) {
    await useDb().classes.delete(id)
  }

  return { classes, status, error, createClass, renameClass, saveStudents, deleteClass, newStudentId: newId }
}
