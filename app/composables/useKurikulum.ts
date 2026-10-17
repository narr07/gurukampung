import { faseDariKelas, PILIHAN_KOSONG, TP_SENDIRI, type PilihanKurikulum } from '~/utils/kurikulum'

// Data kurikulum (content/kurikulum/*.yml) dan pilihan guru yang sedang aktif.
// Setiap langkah bergantung pada langkah sebelumnya; mengubah satu langkah mengosongkan langkah sesudahnya
export function useKurikulum() {
  const { data, status } = useAsyncData('kurikulum', () => queryCollection('kurikulum').all(), { default: () => [] })
  const pilihan = useLocalStorage<PilihanKurikulum>('gurukampung:kurikulum:pilihan', { ...PILIHAN_KOSONG }, { initOnMounted: true, mergeDefaults: true })

  const fase = computed(() => (pilihan.value.kelas ? faseDariKelas(pilihan.value.kelas) : null))
  const daftarMapel = computed(() => (data.value ?? []).filter(d => d.fase === fase.value))
  const mapel = computed(() => daftarMapel.value.find(m => m.mapelId === pilihan.value.mapelId))
  const elemen = computed(() => mapel.value?.elemen.find(e => e.id === pilihan.value.elemenId))
  const materi = computed(() => elemen.value?.materi.find(m => m.id === pilihan.value.materiId))
  const tp = computed(() => {
    if (pilihan.value.tpId === TP_SENDIRI) return pilihan.value.tpSendiri.trim() || null
    return materi.value?.tp?.find(t => t.id === pilihan.value.tpId)?.teks ?? null
  })

  const lengkap = computed(() => Boolean(mapel.value && elemen.value && materi.value && tp.value))

  function pilih<K extends keyof PilihanKurikulum>(kunci: K, nilai: PilihanKurikulum[K]) {
    const urutan: (keyof PilihanKurikulum)[] = ['kelas', 'mapelId', 'elemenId', 'materiId', 'tpId']
    const next = { ...pilihan.value, [kunci]: nilai }
    for (const k of urutan.slice(urutan.indexOf(kunci) + 1)) (next as Record<string, unknown>)[k] = null
    // Mapel tetap dipertahankan saat pindah kelas dalam fase yang sama
    if (kunci === 'kelas' && typeof nilai === 'number' && pilihan.value.kelas && faseDariKelas(nilai) === faseDariKelas(pilihan.value.kelas)) {
      next.mapelId = pilihan.value.mapelId
      next.elemenId = pilihan.value.elemenId
      next.materiId = pilihan.value.materiId
      next.tpId = pilihan.value.tpId
    }
    pilihan.value = next
  }

  return { data, status, pilihan, fase, daftarMapel, mapel, elemen, materi, tp, lengkap, pilih }
}
