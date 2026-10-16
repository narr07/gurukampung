import Dexie, { type EntityTable } from 'dexie'
import { BACKUP_APP, BACKUP_VERSION, type BackupFile, type ClassRecord, type SettingRecord, type ToolDataRecord } from '~/utils/backup'

// Semua data guru disimpan di IndexedDB perangkat ini, tidak dikirim ke server (ADR 001)
class GuruKampungDB extends Dexie {
  classes!: EntityTable<ClassRecord, 'id'>
  settings!: EntityTable<SettingRecord, 'key'>
  toolData!: EntityTable<ToolDataRecord, 'key'>

  constructor() {
    // Nama database sengaja tetap 'peragu' (nama lama aplikasi): menggantinya membuat data kelas guru yang sudah ada tidak terbaca
    super('peragu')
    this.version(1).stores({
      classes: 'id, name, updatedAt',
      settings: 'key'
    })
    this.version(2).stores({
      toolData: 'key, updatedAt'
    })
  }
}

let instance: GuruKampungDB | undefined

// Hanya dipanggil di peramban; saat prerender di server IndexedDB tidak ada
export function useDb() {
  if (import.meta.server) throw new Error('IndexedDB hanya tersedia di peramban')
  instance ??= new GuruKampungDB()
  return instance
}

export async function exportBackup(): Promise<BackupFile> {
  const db = useDb()
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    classes: await db.classes.toArray(),
    settings: await db.settings.toArray(),
    toolData: await db.toolData.toArray()
  }
}

export async function importBackup(data: BackupFile) {
  const db = useDb()
  await db.transaction('rw', [db.classes, db.settings, db.toolData], async () => {
    await db.classes.clear()
    await db.settings.clear()
    await db.toolData.clear()
    await db.classes.bulkPut(data.classes)
    await db.settings.bulkPut(data.settings)
    await db.toolData.bulkPut(data.toolData ?? [])
  })
}
