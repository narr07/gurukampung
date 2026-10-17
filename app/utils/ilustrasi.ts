// Ilustrasi stiker tambahan untuk kartu alat, blog, dan tutorial. Gayanya sama dengan GambarIlustrasi.vue (DESIGN.md, R-22):
// viewBox 96, garis tinta 3px, alas biru tua yang bergeser ke bawah untuk kesan tiga dimensi, warna dari palet saja.
// Disimpan sebagai data supaya GambarIlustrasi.vue tidak membengkak; markup statis buatan sendiri, aman untuk v-html

const T = '#0f172b' // tinta
const K = '#ffdf20' // kuning pensil
const A = '#1e3a8a' // alas biru tua
const P = '#ffffff'
const L = '#bae6fd' // langit
const Y = '#fef9c2' // kayu
const M = '#c10007' // merah aksen, hanya titik kecil

const g = `stroke="${T}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`

export const ILUSTRASI_BARU = {
  'roda': `
    <circle cx="48" cy="54" r="34" fill="${A}" ${g}/>
    <circle cx="48" cy="48" r="34" fill="${P}" ${g}/>
    <path d="M48 48 L48 14 A34 34 0 0 1 82 48 Z" fill="${K}" ${g}/>
    <path d="M48 48 L82 48 A34 34 0 0 1 48 82 Z" fill="${L}" ${g}/>
    <path d="M48 48 L48 82 A34 34 0 0 1 14 48 Z" fill="${K}" ${g}/>
    <circle cx="48" cy="48" r="7" fill="${P}" ${g}/>
    <path d="M39 4 H57 L48 19 Z" fill="${M}" ${g}/>`,

  'kelompok': `
    <rect x="8" y="76" width="80" height="10" rx="5" fill="${A}" ${g}/>
    <circle cx="24" cy="40" r="9" fill="${K}" ${g}/>
    <path d="M10 78 v-6 a14 14 0 0 1 28 0 v6 Z" fill="${L}" ${g}/>
    <circle cx="72" cy="40" r="9" fill="${L}" ${g}/>
    <path d="M58 78 v-6 a14 14 0 0 1 28 0 v6 Z" fill="${K}" ${g}/>
    <circle cx="48" cy="32" r="11" fill="${P}" ${g}/>
    <path d="M30 80 v-8 a18 18 0 0 1 36 0 v8 Z" fill="${K}" ${g}/>
    <path d="M44 33 h0.1 M52 33 h0.1" ${g}/>`,

  'meja': `
    <rect x="10" y="40" width="76" height="14" rx="4" fill="${A}" ${g}/>
    <rect x="10" y="34" width="76" height="14" rx="4" fill="${K}" ${g}/>
    <path d="M20 48 V84 M76 48 V84" ${g} stroke-width="4"/>
    <rect x="28" y="20" width="24" height="14" rx="2" fill="${P}" ${g} transform="rotate(-6 40 27)"/>
    <path d="M58 30 L74 22" ${g}/>
    <rect x="34" y="62" width="28" height="8" rx="3" fill="${L}" ${g}/>
    <path d="M38 70 V84 M58 70 V84" ${g}/>`,

  'toa': `
    <path d="M18 46 L58 28 V78 L18 62 Z" fill="${A}" ${g}/>
    <path d="M18 40 L58 22 V72 L18 56 Z" fill="${K}" ${g}/>
    <rect x="10" y="40" width="10" height="16" rx="3" fill="${P}" ${g}/>
    <path d="M30 60 l4 18 h9 l-3 -14" fill="${L}" ${g}/>
    <path d="M66 36 q8 11 0 22 M74 28 q15 19 0 38" ${g}/>`,

  'kalender': `
    <rect x="14" y="26" width="68" height="60" rx="8" fill="${A}" ${g}/>
    <rect x="14" y="20" width="68" height="60" rx="8" fill="${P}" ${g}/>
    <path d="M14 38 V28 a8 8 0 0 1 8 -8 h52 a8 8 0 0 1 8 8 v10 Z" fill="${K}" ${g}/>
    <path d="M30 12 V26 M66 12 V26" ${g} stroke-width="4"/>
    <rect x="24" y="46" width="12" height="11" rx="2" fill="${L}" ${g}/>
    <rect x="42" y="46" width="12" height="11" rx="2" fill="${L}" ${g}/>
    <rect x="60" y="46" width="12" height="11" rx="2" fill="${L}" ${g}/>
    <rect x="24" y="62" width="12" height="11" rx="2" fill="${L}" ${g}/>
    <rect x="42" y="62" width="12" height="11" rx="2" fill="${K}" ${g}/>
    <path d="M45 67 l3 3 l5 -6" stroke="${M}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,

  'medali': `
    <path d="M28 6 h16 l12 32 h-16 Z" fill="${L}" ${g}/>
    <path d="M68 6 h-16 l-12 32 h16 Z" fill="${K}" ${g}/>
    <circle cx="48" cy="66" r="24" fill="${A}" ${g}/>
    <circle cx="48" cy="60" r="24" fill="${K}" ${g}/>
    <path d="M48 47 l4 8.5 l9.3 1 l-7 6.3 l2 9.2 l-8.3 -4.8 l-8.3 4.8 l2 -9.2 l-7 -6.3 l9.3 -1 Z" fill="${P}" ${g}/>`,

  'kalkulator': `
    <rect x="20" y="18" width="56" height="72" rx="8" fill="${A}" ${g}/>
    <rect x="20" y="12" width="56" height="72" rx="8" fill="${L}" ${g}/>
    <rect x="28" y="20" width="40" height="16" rx="3" fill="${P}" ${g}/>
    <path d="M54 28 h8" ${g}/>
    <circle cx="34" cy="48" r="4.5" fill="${P}" ${g}/><circle cx="48" cy="48" r="4.5" fill="${P}" ${g}/><circle cx="62" cy="48" r="4.5" fill="${K}" ${g}/>
    <circle cx="34" cy="61" r="4.5" fill="${P}" ${g}/><circle cx="48" cy="61" r="4.5" fill="${P}" ${g}/><circle cx="62" cy="61" r="4.5" fill="${K}" ${g}/>
    <circle cx="34" cy="74" r="4.5" fill="${P}" ${g}/><circle cx="48" cy="74" r="4.5" fill="${P}" ${g}/><circle cx="62" cy="74" r="4.5" fill="${M}" ${g}/>`,

  'papan-klip': `
    <rect x="18" y="20" width="60" height="70" rx="7" fill="${A}" ${g}/>
    <rect x="18" y="14" width="60" height="70" rx="7" fill="${K}" ${g}/>
    <rect x="26" y="24" width="44" height="54" rx="3" fill="${P}" ${g}/>
    <rect x="36" y="8" width="24" height="12" rx="4" fill="${L}" ${g}/>
    <path d="M32 38 l4 4 l7 -8 M32 52 l4 4 l7 -8" stroke="${M}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M48 39 h15 M48 53 h15 M34 66 h29" ${g}/>`,

  'rapor': `
    <rect x="20" y="20" width="56" height="70" rx="6" fill="${A}" ${g}/>
    <rect x="20" y="14" width="56" height="70" rx="6" fill="${L}" ${g}/>
    <path d="M30 14 V84" ${g}/>
    <rect x="38" y="26" width="30" height="20" rx="3" fill="${P}" ${g}/>
    <path d="M47 41 l6 -11 l6 11 M49.5 37 h7" ${g}/>
    <path d="M40 58 h26 M40 66 h18" ${g}/>
    <circle cx="64" cy="76" r="7" fill="${K}" ${g}/>`,

  'grafik': `
    <rect x="12" y="22" width="72" height="64" rx="8" fill="${A}" ${g}/>
    <rect x="12" y="16" width="72" height="64" rx="8" fill="${P}" ${g}/>
    <rect x="24" y="48" width="11" height="22" rx="2" fill="${L}" ${g}/>
    <rect x="42" y="36" width="11" height="34" rx="2" fill="${K}" ${g}/>
    <rect x="60" y="26" width="11" height="44" rx="2" fill="${L}" ${g}/>
    <path d="M20 70 H76" ${g}/>`,

  'buku': `
    <path d="M10 34 V84 Q29 79 48 86 Q67 79 86 84 V34 Z" fill="${A}" ${g}/>
    <path d="M48 28 C38 21 24 21 13 26 V78 C24 73 38 73 48 80 Z" fill="${P}" ${g}/>
    <path d="M48 28 C58 21 72 21 83 26 V78 C72 73 58 73 48 80 Z" fill="${Y}" ${g}/>
    <path d="M21 38 h19 M21 47 h19 M21 56 h13 M56 38 h19 M56 47 h19" ${g} stroke-width="2.5"/>
    <path d="M64 24 v22 l5 -4 l5 4 v-23" fill="${M}" ${g}/>`,

  'lembar-soal': `
    <path d="M22 16 H62 L76 30 V92 H22 Z" fill="${A}" ${g}/>
    <path d="M22 10 H62 L76 24 V86 H22 Z" fill="${P}" ${g}/>
    <path d="M62 10 V24 H76" fill="${L}" ${g}/>
    <circle cx="33" cy="40" r="4.5" fill="${P}" ${g}/><path d="M43 40 h22" ${g}/>
    <circle cx="33" cy="55" r="4.5" fill="${K}" ${g}/><path d="M43 55 h18" ${g}/>
    <circle cx="33" cy="70" r="4.5" fill="${P}" ${g}/><path d="M43 70 h22" ${g}/>
    <path d="M29 55 l3 3 l6 -7" stroke="${M}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,

  'kaca-pembesar': `
    <rect x="10" y="16" width="56" height="56" rx="8" fill="${A}" ${g}/>
    <rect x="10" y="10" width="56" height="56" rx="8" fill="${K}" ${g}/>
    <path d="M22 24 h8 M38 24 h8 M22 38 h8 M22 52 h8" ${g}/>
    <path d="M60 60 L84 84" stroke="${T}" stroke-width="11" stroke-linecap="round"/>
    <path d="M62 62 L82 82" stroke="${L}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="46" cy="46" r="20" fill="${L}" fill-opacity="0.85" stroke="${T}" stroke-width="4"/>
    <path d="M36 40 a12 12 0 0 1 8 -6" stroke="${P}" stroke-width="3" stroke-linecap="round"/>`,

  'kotak-tts': `
    <rect x="14" y="20" width="68" height="68" rx="8" fill="${A}" ${g}/>
    <rect x="14" y="14" width="68" height="68" rx="8" fill="${P}" ${g}/>
    <rect x="36.7" y="14" width="22.6" height="22.6" fill="${T}"/>
    <rect x="59.3" y="36.7" width="22.6" height="22.6" fill="${T}"/>
    <rect x="14" y="36.7" width="22.6" height="22.6" fill="${K}"/>
    <path d="M36.7 14 V82 M59.3 14 V82 M14 36.7 H82 M14 59.3 H82" ${g}/>
    <rect x="14" y="14" width="68" height="68" rx="8" fill="none" ${g}/>
    <path d="M44 66 l4 -9 l4 9 M45.5 63 h5" ${g} stroke-width="2.5"/>`,

  'kartu-tumpuk': `
    <rect x="18" y="22" width="48" height="62" rx="7" fill="${L}" ${g} transform="rotate(-12 42 53)"/>
    <rect x="30" y="18" width="48" height="62" rx="7" fill="${K}" ${g} transform="rotate(8 54 49)"/>
    <rect x="24" y="22" width="48" height="62" rx="7" fill="${P}" ${g}/>
    <circle cx="48" cy="50" r="12" fill="${M}" ${g}/>
    <path d="M48 38 q2 -6 8 -6" ${g}/>
    <path d="M34 74 h28" ${g}/>`,

  'pecahan': `
    <circle cx="48" cy="54" r="34" fill="${A}" ${g}/>
    <circle cx="48" cy="48" r="34" fill="${P}" ${g}/>
    <path d="M48 48 L48 14 A34 34 0 1 1 14 48 Z" fill="${K}" ${g}/>
    <path d="M48 14 V82 M14 48 H82" ${g}/>
    <circle cx="48" cy="48" r="34" fill="none" ${g}/>`,

  'uang': `
    <rect x="8" y="30" width="62" height="38" rx="5" fill="${A}" ${g}/>
    <rect x="8" y="24" width="62" height="38" rx="5" fill="${L}" ${g}/>
    <circle cx="39" cy="43" r="10" fill="${P}" ${g}/>
    <path d="M36 39 v8 M36 39 h4 a2.5 2.5 0 0 1 0 5 h-4 l5 3" ${g} stroke-width="2.5"/>
    <path d="M16 32 h6 M56 54 h6" ${g}/>
    <circle cx="70" cy="70" r="15" fill="${A}" ${g}/>
    <circle cx="70" cy="65" r="15" fill="${K}" ${g}/>
    <circle cx="70" cy="65" r="8" fill="none" ${g}/>`,

  'papan-tulis': `
    <rect x="8" y="20" width="80" height="52" rx="6" fill="${A}" ${g}/>
    <rect x="8" y="14" width="80" height="52" rx="6" fill="${K}" ${g}/>
    <rect x="15" y="21" width="66" height="38" rx="3" fill="${P}" ${g}/>
    <path d="M23 46 q8 -14 16 0 t16 0" stroke="${M}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M60 32 h12 M66 26 v12" ${g}/>
    <path d="M28 66 L22 88 M68 66 L74 88" ${g} stroke-width="4"/>`,

  'amplop': `
    <rect x="12" y="30" width="72" height="50" rx="6" fill="${A}" ${g}/>
    <rect x="12" y="24" width="72" height="50" rx="6" fill="${P}" ${g}/>
    <path d="M14 70 L40 50 M82 70 L56 50" ${g}/>
    <path d="M14 27 L48 54 L82 27 Z" fill="${K}" ${g}/>
    <circle cx="48" cy="52" r="7" fill="${M}" ${g}/>`,

  'label': `
    <path d="M14 36 H58 L78 56 L58 76 H14 Z" fill="${A}" ${g}/>
    <path d="M14 30 H58 L78 50 L58 70 H14 Z" fill="${K}" ${g}/>
    <circle cx="61" cy="50" r="5" fill="${P}" ${g}/>
    <path d="M66 50 q14 -12 18 -32" ${g}/>
    <path d="M24 44 h24 M24 56 h16" ${g}/>`,

  'piagam': `
    <rect x="10" y="20" width="76" height="54" rx="5" fill="${A}" ${g}/>
    <rect x="10" y="14" width="76" height="54" rx="5" fill="${P}" ${g}/>
    <rect x="16" y="20" width="64" height="42" rx="3" fill="none" stroke="${K}" stroke-width="3"/>
    <path d="M28 32 h40 M28 41 h28 M28 50 h20" ${g}/>
    <path d="M62 66 l-5 20 l9 -5 l8 5 l-3 -20" fill="${M}" ${g}/>
    <circle cx="68" cy="62" r="11" fill="${K}" ${g}/>
    <path d="M68 56 l1.8 3.7 l4 .5 l-3 2.7 l.8 4 l-3.6 -2 l-3.6 2 l.8 -4 l-3 -2.7 l4 -.5 Z" fill="${P}" stroke="${T}" stroke-width="2" stroke-linejoin="round"/>`,

  'target': `
    <circle cx="44" cy="58" r="32" fill="${A}" ${g}/>
    <circle cx="44" cy="52" r="32" fill="${P}" ${g}/>
    <circle cx="44" cy="52" r="22" fill="${K}" ${g}/>
    <circle cx="44" cy="52" r="12" fill="${P}" ${g}/>
    <circle cx="44" cy="52" r="4" fill="${M}" ${g}/>
    <path d="M46 50 L82 14" ${g} stroke-width="4"/>
    <path d="M74 12 l8 2 l2 8 l-6 -4 Z" fill="${L}" ${g}/>`,

  'lampu': `
    <path d="M30 42 a18 18 0 1 1 36 0 c0 9 -7 13 -8 22 h-20 c-1 -9 -8 -13 -8 -22 Z" fill="${A}" ${g} transform="translate(0 5)"/>
    <path d="M30 42 a18 18 0 1 1 36 0 c0 9 -7 13 -8 22 h-20 c-1 -9 -8 -13 -8 -22 Z" fill="${K}" ${g}/>
    <rect x="37" y="64" width="22" height="14" rx="4" fill="${L}" ${g}/>
    <path d="M37 71 h22" ${g}/>
    <path d="M42 84 h12" ${g}/>
    <path d="M42 34 a8 8 0 0 1 8 -6" stroke="${P}" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 30 l-6 -3 M82 30 l6 -3 M48 8 v-4 M22 12 l-3 -4 M74 12 l3 -4" ${g}/>`
} as const

export type IlustrasiBaru = keyof typeof ILUSTRASI_BARU
export type NamaIlustrasi = 'pensil' | 'penggaris' | 'dadu' | 'jam' | 'pesawat' | 'kartu-nama' | 'bintang' | 'gembok-tas' | IlustrasiBaru

export const isIlustrasiBaru = (name: string): name is IlustrasiBaru => name in ILUSTRASI_BARU

// Ilustrasi untuk setiap alat, dipilih dari benda nyata yang dipakai alat itu (R-22)
export const ILUSTRASI_ALAT: Record<string, NamaIlustrasi> = {
  'pemilih-acak': 'roda',
  'pembagi-kelompok': 'kelompok',
  'timer': 'jam',
  'denah-duduk': 'meja',
  'pengukur-suara': 'toa',
  'jadwal-piket': 'kalender',
  'papan-poin': 'medali',
  'nilai-rapor': 'kalkulator',
  'rekap-absensi': 'papan-klip',
  'predikat': 'rapor',
  'ketuntasan': 'target',
  'deskripsi-rapor': 'rapor',
  'analisis-butir': 'grafik',
  'lkpd-bergambar': 'lembar-soal',
  'lk-matematika': 'pensil',
  'latihan-menulis': 'pensil',
  'cari-kata': 'kaca-pembesar',
  'kuis-pg': 'lembar-soal',
  'tts': 'kotak-tts',
  'flashcard': 'kartu-tumpuk',
  'bingo': 'bintang',
  'dadu-spinner': 'dadu',
  'jam-analog': 'jam',
  'tabel-perkalian': 'kotak-tts',
  'pecahan': 'pecahan',
  'garis-bilangan': 'penggaris',
  'uang-rupiah': 'uang',
  'papan-tulis': 'papan-tulis',
  'sertifikat': 'piagam',
  'label-siswa': 'label',
  'surat-edaran': 'amplop',
  'modul-ajar': 'buku'
}
