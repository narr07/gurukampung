export type TutorialCategory = 'perangkat-ajar' | 'asesmen' | 'peragu'

export const TUTORIAL_CATEGORIES: { id: TutorialCategory, name: string, summary: string, icon: string }[] = [
  { id: 'perangkat-ajar', name: 'Perangkat ajar', summary: 'Menyusun tujuan pembelajaran, RPP, dan modul ajar.', icon: 'i-lucide-notebook-pen' },
  { id: 'asesmen', name: 'Asesmen', summary: 'Mengetahui kemampuan awal murid, membuat rubrik, dan mengolah nilai.', icon: 'i-lucide-clipboard-check' },
  { id: 'peragu', name: 'Memakai Peragu', summary: 'Langkah demi langkah memakai alat Peragu di kelas.', icon: 'i-lucide-mouse-pointer-click' }
]

export function tutorialCategory(id: string) {
  return TUTORIAL_CATEGORIES.find(c => c.id === id)
}

// Tanggal di frontmatter ditulis YYYY-MM-DD; ditampilkan seperti "16 Oktober 2026"
export function formatTanggal(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
