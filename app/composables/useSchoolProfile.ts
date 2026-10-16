import { useDb } from '~/db'
import type { SchoolProfile } from '~/utils/backup'

const KEY = 'school-profile'

export const EMPTY_PROFILE: SchoolProfile = {
  schoolName: '',
  teacherName: '',
  teacherNip: '',
  principalName: '',
  principalNip: '',
  academicYear: ''
}

// Profil sekolah dipakai bersama oleh kop cetak, sertifikat, dan surat
export function useSchoolProfile() {
  const { data, status, error } = useLiveQuery(
    async () => ({ ...EMPTY_PROFILE, ...((await useDb().settings.get(KEY))?.value as Partial<SchoolProfile> | undefined) }),
    { ...EMPTY_PROFILE }
  )

  async function save(profile: SchoolProfile) {
    await useDb().settings.put({ key: KEY, value: { ...profile } })
  }

  return { profile: data, status, error, save }
}
