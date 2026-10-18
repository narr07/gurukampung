// Kata kunci → ikon Lucide (set ikon yang sama dengan UI Guru Kampung), dirender sebagai stiker bergaris tinta.
// ponytail: pencocokan awalan kata yang naif; cukup untuk memilih ikon dekoratif, bukan untuk makna.
const KAMUS: [string, string][] = [
  // alam dan cuaca
  ['matahari', 'sun'], ['bulan', 'moon'], ['bintang', 'star'], ['bumi', 'earth'], ['planet', 'orbit'], ['tata surya', 'orbit'], ['komet', 'sparkles'],
  ['awan', 'cloud'], ['hujan', 'cloud-rain'], ['petir', 'cloud-lightning'], ['angin', 'wind'], ['pelangi', 'rainbow'], ['salju', 'snowflake'],
  ['musim', 'calendar-range'], ['gunung', 'mountain'], ['bukit', 'mountain-snow'], ['laut', 'waves'], ['pantai', 'umbrella'], ['sungai', 'waves'],
  ['danau', 'waves'], ['air', 'droplet'], ['api', 'flame'], ['hutan', 'trees'], ['pohon', 'tree-deciduous'], ['tumbuhan', 'sprout'], ['tanaman', 'sprout'],
  ['daun', 'leaf'], ['bunga', 'flower-2'], ['biji', 'bean'], ['tanah', 'shovel'], ['batu', 'gem'], ['gempa', 'activity'], ['banjir', 'waves'],
  ['iklim', 'thermometer-sun'], ['suhu', 'thermometer'], ['panas', 'flame'], ['dingin', 'snowflake'], ['udara', 'wind'], ['oksigen', 'wind'],
  ['polusi', 'factory'], ['sampah', 'trash-2'], ['limbah', 'recycle'], ['daur ulang', 'recycle'], ['lingkungan', 'trees'], ['energi', 'zap'],
  ['listrik', 'plug-zap'], ['panel surya', 'sun'], ['baterai', 'battery-full'], ['magnet', 'magnet'], ['gaya', 'move-right'], ['cahaya', 'lightbulb'],
  ['lampu', 'lamp'], ['bayangan', 'sun-moon'], ['bunyi', 'volume-2'], ['suara', 'volume-2'], ['getaran', 'audio-waveform'], ['wujud', 'flask-conical'],
  ['zat', 'flask-conical'], ['ekosistem', 'trees'], ['siklus', 'refresh-cw'], ['fotosintesis', 'leaf'],
  // hewan
  ['hewan', 'paw-print'], ['kucing', 'cat'], ['anjing', 'dog'], ['ayam', 'egg'], ['burung', 'bird'], ['ikan', 'fish'], ['sapi', 'milk'],
  ['kupu', 'bug'], ['katak', 'bug'], ['ular', 'worm'], ['kura', 'turtle'], ['penyu', 'turtle'], ['semut', 'bug'], ['lebah', 'bug'], ['tikus', 'rat'],
  ['kelinci', 'rabbit'], ['tupai', 'squirrel'], ['siput', 'snail'], ['cacing', 'worm'], ['serangga', 'bug'], ['kancil', 'paw-print'], ['buaya', 'paw-print'],
  ['gajah', 'paw-print'], ['keledai', 'paw-print'], ['domba', 'paw-print'], ['kambing', 'paw-print'],
  // tubuh dan kesehatan
  ['tubuh', 'person-standing'], ['mata', 'eye'], ['telinga', 'ear'], ['hidung', 'smile'], ['mulut', 'smile'], ['gigi', 'smile-plus'], ['tangan', 'hand'],
  ['kaki', 'footprints'], ['jantung', 'heart-pulse'], ['paru', 'wind'], ['otak', 'brain'], ['tulang', 'bone'], ['otot', 'biceps-flexed'],
  ['pencernaan', 'utensils'], ['lambung', 'utensils'], ['napas', 'wind'], ['pernapasan', 'wind'], ['sehat', 'heart-pulse'], ['sakit', 'thermometer'],
  ['obat', 'pill'], ['cedera', 'bandage'], ['luka', 'bandage'], ['p3k', 'briefcase-medical'], ['mandi', 'bath'], ['cuci tangan', 'hand'], ['bersih', 'sparkles'],
  ['tidur', 'bed'], ['olahraga', 'dumbbell'], ['lari', 'footprints'], ['lompat', 'person-standing'], ['senam', 'person-standing'], ['renang', 'waves'],
  ['bola', 'volleyball'], ['permainan', 'dice-5'], ['bermain', 'puzzle'], ['kebugaran', 'dumbbell'], ['gizi', 'salad'], ['sayur', 'carrot'],
  ['buah', 'apple'], ['makanan', 'utensils-crossed'], ['makan', 'utensils'], ['minum', 'cup-soda'], ['susu', 'milk'], ['nasi', 'wheat'], ['roti', 'croissant'],
  ['telur', 'egg'], ['pisang', 'banana'], ['jeruk', 'citrus'], ['apel', 'apple'], ['kue', 'cake'], ['dapur', 'cooking-pot'], ['masak', 'chef-hat'],
  ['resep', 'clipboard-list'], ['perasaan', 'smile'], ['emosi', 'smile'], ['senang', 'laugh'], ['sedih', 'frown'], ['marah', 'angry'], ['takut', 'frown'],
  ['puber', 'sprout'], ['privasi', 'lock'], ['bela diri', 'shield'], ['pencak silat', 'shield'],
  // rumah, sekolah, masyarakat
  ['keluarga', 'users'], ['ayah', 'user'], ['ibu', 'user'], ['kakek', 'user'], ['nenek', 'user'], ['adik', 'baby'], ['teman', 'handshake'],
  ['sahabat', 'handshake'], ['diriku', 'user-round'], ['aku', 'user-round'], ['rumah', 'house'], ['sekolah', 'school'], ['kelas', 'school'],
  ['guru', 'graduation-cap'], ['perpustakaan', 'library'], ['buku', 'book-open'], ['membaca', 'book-open-text'], ['menulis', 'pencil-line'],
  ['tulisan', 'pen-line'], ['huruf', 'a-large-small'], ['kata', 'whole-word'], ['kalimat', 'text'], ['cerita', 'book-heart'], ['puisi', 'feather'],
  ['dongeng', 'castle'], ['fabel', 'rabbit'], ['legenda', 'castle'], ['surat', 'mail'], ['wawancara', 'mic'], ['presentasi', 'presentation'],
  ['pidato', 'mic'], ['diskusi', 'messages-square'], ['berbicara', 'message-circle'], ['pendapat', 'message-circle-more'], ['iklan', 'megaphone'],
  ['poster', 'image'], ['berita', 'newspaper'], ['kamus', 'book-a'], ['pasar', 'store'], ['toko', 'store'], ['uang', 'banknote'], ['harga', 'tag'],
  ['belanja', 'shopping-basket'], ['jual', 'shopping-bag'], ['wirausaha', 'store'], ['tabung', 'piggy-bank'], ['bank', 'landmark'], ['koperasi', 'landmark'],
  ['ekonomi', 'chart-line'], ['pekerjaan', 'briefcase'], ['profesi', 'briefcase'], ['petani', 'tractor'], ['nelayan', 'fish'], ['dokter', 'stethoscope'],
  ['jalan', 'route'], ['lalu lintas', 'traffic-cone'], ['rambu', 'signpost'], ['kendaraan', 'car'], ['mobil', 'car'], ['truk', 'truck'], ['sepeda', 'bike'],
  ['kereta', 'train-front'], ['pesawat', 'plane'], ['kapal', 'ship'], ['perahu', 'sailboat'], ['peta', 'map'], ['arah', 'compass'], ['kompas', 'compass'],
  ['denah', 'map-pinned'], ['wilayah', 'map'], ['provinsi', 'map'], ['desa', 'house'], ['kota', 'building-2'], ['daerah', 'map-pin'], ['indonesia', 'flag'],
  ['bendera', 'flag'], ['pancasila', 'star'], ['garuda', 'bird'], ['sila', 'star'], ['pahlawan', 'medal'], ['sejarah', 'scroll-text'], ['museum', 'landmark'],
  ['aturan', 'list-checks'], ['norma', 'scale'], ['hukum', 'gavel'], ['hak', 'hand-heart'], ['kewajiban', 'list-checks'], ['musyawarah', 'messages-square'],
  ['gotong royong', 'handshake'], ['kerja sama', 'handshake'], ['keragaman', 'rainbow'], ['beragam', 'rainbow'], ['berbeda', 'rainbow'], ['budaya', 'drama'],
  ['tradisi', 'drama'], ['adat', 'castle'], ['kearifan', 'wheat'], ['suku', 'users'], ['persatuan', 'handshake'], ['disiplin', 'alarm-clock'], ['patuh', 'list-checks'],
  // matematika
  ['bilangan', 'hash'], ['angka', 'hash'], ['membilang', 'hash'], ['penjumlahan', 'plus'], ['pengurangan', 'minus'], ['perkalian', 'x'], ['pembagian', 'divide'],
  ['pecahan', 'pie-chart'], ['desimal', 'percent'], ['persen', 'percent'], ['rasio', 'scale'], ['pola', 'repeat'], ['bangun datar', 'shapes'], ['bentuk', 'shapes'],
  ['segitiga', 'triangle'], ['persegi', 'square'], ['lingkaran', 'circle'], ['bangun ruang', 'box'], ['kubus', 'box'], ['balok', 'package'], ['sudut', 'triangle-right'],
  ['garis', 'ruler'], ['panjang', 'ruler'], ['berat', 'weight'], ['massa', 'weight'], ['luas', 'square-dashed'], ['keliling', 'square'], ['volume', 'beaker'],
  ['waktu', 'clock'], ['jam', 'alarm-clock'], ['kalender', 'calendar-days'], ['hari', 'calendar'], ['data', 'chart-column'], ['diagram', 'chart-column'],
  ['tabel', 'table'], ['grafik', 'chart-line'], ['peluang', 'dices'], ['kpk', 'hash'], ['fpb', 'hash'], ['ukur', 'ruler'], ['pengukuran', 'ruler'], ['posisi', 'map-pin'],
  // seni
  ['gambar', 'image'], ['menggambar', 'pencil'], ['lukis', 'paintbrush'], ['warna', 'palette'], ['seni rupa', 'palette'], ['kolase', 'scissors'],
  ['gunting', 'scissors'], ['patung', 'person-standing'], ['anyaman', 'grid-3x3'], ['makrame', 'spline'], ['batik', 'flower'], ['motif', 'flower'],
  ['kerajinan', 'hammer'], ['diorama', 'box'], ['pameran', 'frame'], ['sketsa', 'pencil-ruler'], ['karya', 'paintbrush'], ['musik', 'music'], ['lagu', 'music-2'],
  ['nyanyi', 'mic-vocal'], ['irama', 'drum'], ['ritme', 'drum'], ['gendang', 'drum'], ['melodi', 'music-4'], ['nada', 'music-3'], ['not ', 'music-3'],
  ['alat musik', 'guitar'], ['gitar', 'guitar'], ['piano', 'piano'], ['pianika', 'piano'], ['ensambel', 'users'], ['tari', 'person-standing'], ['gerak', 'move'],
  ['properti', 'wand-sparkles'], ['kostum', 'shirt'], ['busana', 'shirt'], ['rias', 'brush'], ['teater', 'drama'], ['drama', 'drama'], ['peran', 'drama'],
  ['tokoh', 'user-round'], ['panggung', 'theater'], ['pentas', 'theater'], ['pantomim', 'hand'], ['improvisasi', 'lightbulb'], ['naskah', 'scroll-text'], ['dialog', 'messages-square'],
  // agama dan budi pekerti
  ['al-qur', 'book-open'], ['surah', 'book-open'], ['ayat', 'book-open'], ['hadis', 'scroll-text'], ['salat', 'moon-star'], ['masjid', 'moon-star'],
  ['wudu', 'droplets'], ['doa', 'hand-heart'], ['berdoa', 'hand-heart'], ['puasa', 'moon-star'], ['zakat', 'hand-coins'], ['sedekah', 'hand-coins'],
  ['infak', 'hand-coins'], ['haji', 'moon-star'], ['kurban', 'paw-print'], ['nabi', 'sparkles'], ['rasul', 'sparkles'], ['asmaulhusna', 'sparkles'],
  ['iman', 'heart'], ['akhlak', 'heart-handshake'], ['terpuji', 'heart-handshake'], ['jujur', 'badge-check'], ['syukur', 'heart'], ['bersyukur', 'heart'],
  ['tuhan', 'sparkles'], ['allah', 'sparkles'], ['ibadah', 'hand-heart'], ['gereja', 'church'], ['alkitab', 'book-heart'], ['yesus', 'church'],
  ['sakramen', 'church'], ['pura', 'landmark'], ['vihara', 'landmark'], ['kelenteng', 'landmark'], ['hari raya', 'party-popper'], ['maaf', 'heart-handshake'],
  ['halal', 'badge-check'], ['takdir', 'sparkles'], ['kiamat', 'hourglass'], ['kasih', 'heart'], ['ciptaan', 'sparkles'],
  // bahasa Inggris dan koding
  ['greeting', 'hand'], ['family', 'users'], ['school', 'school'], ['classroom', 'school'], ['teacher', 'graduation-cap'], ['meal', 'utensils'], ['food', 'utensils'],
  ['toy', 'puzzle'], ['vegetable', 'carrot'], ['fruit', 'apple'], ['kitchen', 'cooking-pot'], ['market', 'store'], ['library', 'library'], ['stories', 'book-heart'],
  ['story', 'book-heart'], ['zoo', 'paw-print'], ['animal', 'paw-print'], ['play', 'dice-5'], ['camp', 'tent'], ['plant', 'sprout'], ['hygiene', 'sparkles'],
  ['morning', 'sunrise'], ['routine', 'alarm-clock'], ['time', 'clock'], ['day', 'calendar'], ['month', 'calendar-days'], ['direction', 'compass'], ['house', 'house'],
  ['komputer', 'monitor'], ['komputasional', 'puzzle'], ['algoritma', 'list-ordered'], ['instruksi', 'list-ordered'], ['digital', 'smartphone'], ['ponsel', 'smartphone'],
  ['internet', 'globe'], ['kata sandi', 'key-round'], ['keamanan', 'lock'], ['kecerdasan artifisial', 'bot'], ['robot', 'bot'], ['mesin', 'cog'], ['sensor', 'radar'],
  ['klasifikasi', 'folder-tree'], ['perangkat', 'cpu'], ['kamera', 'camera'], ['mikrofon', 'mic']
]

const POLA = KAMUS.map(([k, e]) => [new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), e] as const)

/** Nama ikon untuk kata kunci yang muncul di teks, urut sesuai letaknya, tanpa duplikat. */
export function cariIkon(teks: string, maks = 1): string[] {
  const temu: { i: number, e: string }[] = []
  for (const [re, e] of POLA) {
    const m = re.exec(teks)
    if (m) temu.push({ i: m.index, e })
  }
  return [...new Set(temu.sort((a, b) => a.i - b.i).map(t => t.e))].slice(0, maks)
}

export const IKON_MAPEL: Record<string, string> = {
  'matematika': 'calculator', 'bahasa-indonesia': 'book-open-text', 'ipas': 'microscope', 'pendidikan-pancasila': 'star', 'pjok': 'volleyball',
  'seni-rupa': 'palette', 'seni-musik': 'music', 'seni-tari': 'person-standing', 'seni-teater': 'drama', 'pai': 'moon-star', 'pak-kristen': 'church',
  'pak-katolik': 'church', 'pah-hindu': 'landmark', 'pab-buddha': 'landmark', 'khonghucu': 'landmark', 'kepercayaan': 'sprout',
  'bahasa-inggris': 'languages', 'koding-ka': 'bot'
}

// Ilustrasi SVG proyek (app/utils/ilustrasi.ts) untuk pengantar bab, dipilih dari kata kunci
export const ILUSTRASI_KATA: [RegExp, string][] = [
  [/bilangan|angka|hitung|operasi|penjumlahan|pengurangan|perkalian|pembagian|kpk|fpb|rasio|desimal/i, 'kalkulator'],
  [/pecahan|peluang/i, 'pecahan'], [/data|diagram|grafik|tabel|piktogram/i, 'grafik'], [/uang|harga|belanja|jual|ekonomi|pasar|wirausaha|zakat|sedekah|infak/i, 'uang'],
  [/hari|bulan|kalender|jadwal|waktu|musim|puasa|hari raya|rutin/i, 'kalender'], [/teman|keluarga|kelompok|kerja sama|gotong|masyarakat|suku|keragaman|persatuan|musyawarah/i, 'kelompok'],
  [/surat|pesan|kabar/i, 'amplop'], [/menulis|cerita|puisi|teks|naskah|lakon|dongeng|fabel|legenda/i, 'lembar-soal'], [/pahlawan|juara|prestasi|bakat|hadiah/i, 'medali'],
  [/cahaya|energi|listrik|ide|lampu|kreasi|kreatif|komputasional|kecerdasan/i, 'lampu'], [/amati|selidik|ilmu|zat|ekosistem|organ|tubuh|bumi|alam|tata surya|sensor|klasifikasi/i, 'kaca-pembesar'],
  [/tujuan|target|cita|sasaran/i, 'target'], [/kelas|sekolah|guru|belajar/i, 'papan-tulis'], [/bentuk|bangun|ukur|luas|keliling|sudut|kubus|balok/i, 'kotak-tts']
]
