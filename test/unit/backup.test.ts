import { describe, expect, it } from 'vitest'
import { backupFileName, checkBackup } from '~/utils/backup'

const valid = { app: 'peragu', version: 1, exportedAt: '2026-10-14T00:00:00Z', classes: [{ id: 'k1', name: '4A', students: [], createdAt: 1, updatedAt: 1 }], settings: [] }

describe('checkBackup', () => {
  it('menerima cadangan yang benar', () => {
    expect(checkBackup(valid).ok).toBe(true)
  })

  it('menolak file lain', () => {
    expect(checkBackup({ foo: 1 })).toEqual({ ok: false, reason: 'File ini bukan cadangan Peragu.' })
    expect(checkBackup(null).ok).toBe(false)
  })

  it('menolak cadangan dari versi yang lebih baru', () => {
    expect(checkBackup({ ...valid, version: 99 }).ok).toBe(false)
  })

  it('menolak data kelas yang rusak', () => {
    expect(checkBackup({ ...valid, classes: [{ id: 'x' }] }).ok).toBe(false)
  })

  it('menerima cadangan versi 1 yang belum punya toolData', () => {
    expect(checkBackup({ ...valid, version: 1 }).ok).toBe(true)
  })

  it('menolak toolData yang bukan daftar', () => {
    expect(checkBackup({ ...valid, version: 2, toolData: 'x' }).ok).toBe(false)
  })

  it('nama file memakai tanggal', () => {
    expect(backupFileName(new Date(2026, 9, 4))).toBe('peragu-cadangan-2026-10-04.json')
  })
})
