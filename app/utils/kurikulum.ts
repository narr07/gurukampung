// Fase menurut CP: A = kelas 1–2, B = kelas 3–4, C = kelas 5–6
export type Fase = 'A' | 'B' | 'C'

export function faseDariKelas(kelas: number): Fase {
  return kelas <= 2 ? 'A' : kelas <= 4 ? 'B' : 'C'
}

// Pilihan guru di pemilih kurikulum, dipakai bersama oleh semua generator dan diingat di perangkat
export interface PilihanKurikulum {
  kelas: number | null
  mapelId: string | null
  elemenId: string | null
  materiId: string | null
  tpId: string | null
  // Diisi kalau guru menulis TP sendiri (tpId = 'sendiri')
  tpSendiri: string
}

export const PILIHAN_KOSONG: PilihanKurikulum = {
  kelas: null,
  mapelId: null,
  elemenId: null,
  materiId: null,
  tpId: null,
  tpSendiri: ''
}

export const TP_SENDIRI = 'sendiri'
