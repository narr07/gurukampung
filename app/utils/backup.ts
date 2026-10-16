import type { Student } from './roster'

export const BACKUP_APP = 'peragu'
export const BACKUP_VERSION = 2

export interface ClassRecord {
  id: string
  name: string
  students: Student[]
  createdAt: number
  updatedAt: number
}

export interface SchoolProfile {
  schoolName: string
  teacherName: string
  teacherNip: string
  principalName: string
  principalNip: string
  academicYear: string
}

export interface SettingRecord {
  key: string
  value: unknown
}

// Data kerja tiap alat, misalnya nilai atau absensi satu kelas. key = "<slug alat>:<id kelas atau nama data>"
export interface ToolDataRecord {
  key: string
  value: unknown
  updatedAt: number
}

export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  exportedAt: string
  classes: ClassRecord[]
  settings: SettingRecord[]
  // Belum ada di cadangan versi 1
  toolData?: ToolDataRecord[]
}

export type BackupCheck = { ok: true, data: BackupFile } | { ok: false, reason: string }

// Isi file cadangan berasal dari luar aplikasi, jadi diperiksa bentuknya sebelum menimpa data
export function checkBackup(raw: unknown): BackupCheck {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'File ini bukan cadangan Peragu.' }
  const b = raw as Partial<BackupFile>
  if (b.app !== BACKUP_APP) return { ok: false, reason: 'File ini bukan cadangan Peragu.' }
  if (typeof b.version !== 'number' || b.version > BACKUP_VERSION) {
    return { ok: false, reason: 'Cadangan ini dibuat oleh versi Peragu yang lebih baru. Perbarui aplikasi dulu.' }
  }
  if (!Array.isArray(b.classes) || !Array.isArray(b.settings) || (b.toolData !== undefined && !Array.isArray(b.toolData))) {
    return { ok: false, reason: 'Isi cadangan tidak lengkap.' }
  }
  const badClass = b.classes.find(c => !c || typeof c.id !== 'string' || typeof c.name !== 'string' || !Array.isArray(c.students))
  if (badClass) return { ok: false, reason: 'Ada data kelas yang rusak di dalam cadangan.' }
  return { ok: true, data: b as BackupFile }
}

export function backupFileName(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `peragu-cadangan-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}
