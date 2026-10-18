// Naskah rangkuman (produk/rangkuman-kelas-N/naskah/*.md) → poster HTML → PDF A4 lewat Edge headless.
// Desain mengikuti DESIGN.md Guru Kampung: palet langit-kertas-pensil, gaya stiker, Funnel Display/Sans, maskot, ikon Lucide, ilustrasi proyek.
// Hasil ada di produk/ (tidak di-commit). Pakai:
//   bun scripts/rangkuman/buat-pdf.ts                 semua kelas dan mapel
//   bun scripts/rangkuman/buat-pdf.ts 5 6             kelas tertentu
//   bun scripts/rangkuman/buat-pdf.ts 5 --mapel=ipas  satu mapel
//   ... --html                                        hanya HTML, tanpa PDF
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { marked } from 'marked'
import { cariIkon, IKON_MAPEL, ILUSTRASI_KATA } from './ikon'
import { ilustrasi, LOGO, MASKOT, stiker, WARNA_STIKER } from './stiker'

const ROOT = path.resolve(import.meta.dir, '../..')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const CSS = fs.readFileSync(path.join(import.meta.dir, 'poster.css'), 'utf8')

// Naskah agama yang belum diperiksa ulang (lihat okf/log.md), tidak dicetak dulu
const DITUNDA: Record<number, string[]> = {
  3: ['pah-hindu', 'pab-buddha', 'khonghucu', 'kepercayaan'],
  4: ['pak-kristen', 'pak-katolik', 'pah-hindu', 'pab-buddha', 'khonghucu', 'kepercayaan'],
  5: ['pak-kristen', 'pak-katolik', 'pah-hindu', 'pab-buddha', 'khonghucu', 'kepercayaan'],
  6: ['pak-kristen', 'pak-katolik', 'pah-hindu', 'pab-buddha', 'khonghucu', 'kepercayaan']
}

// Warna kepala kotak bergiliran, sama dengan pratinjau kelas 1 (langit, pensil, mawar, daun, ungu, jingga)
const KOTAK = ['langit', 'kuning', 'mawar', 'daun', 'ungu', 'jingga']
const SEMANGAT = ['Belajar itu seru, terus semangat!', 'Sedikit demi sedikit, lama-lama jadi bukit!', 'Ayo berlatih, kamu pasti bisa!',
  'Rajin belajar, pangkal pandai!', 'Hebat! Satu bab lagi selesai!', 'Bertanya itu tanda kamu ingin tahu!']

interface Kotak { no: string, judul: string, isi: string, jenis: 'biasa' | 'rangkuman' | 'latihan' }
interface Bab { label: string, judul: string, semester: string, pengantar: string, tujuan: string, kotak: Kotak[], kunci: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s: string) => marked.parseInline(s.trim()) as string
const bersih = (s: string) => s.replace(/\s*⚑\s*/g, ' ').trim()

function parse(md: string) {
  const baris = md.replace(/\r/g, '').split('\n')
  const mapel = /Rangkuman (.+?) Kelas \d/.exec(baris[0] ?? '')?.[1] ?? 'Rangkuman'
  const bagian: { judul: string, isi: string[] }[] = []
  for (const b of baris.slice(1)) {
    if (b.startsWith('## ')) bagian.push({ judul: b.slice(3).trim(), isi: [] })
    else bagian.at(-1)?.isi.push(b)
  }
  let semester = '1'
  const bab: Bab[] = []
  let sumber = ''
  let peta = ''
  let catatan = ''
  for (const { judul, isi } of bagian) {
    const teks = isi.join('\n')
    if (/^SEMESTER/i.test(judul)) semester = /\d/.exec(judul)?.[0] ?? semester
    else if (/^Dasar penyusunan/i.test(judul)) sumber = isi.filter(l => /\*\*(Buku sumber|CP yang berlaku)\*\*/.test(l)).join('\n')
    else if (/^Peta CP/i.test(judul)) peta = bersih(teks)
    else if (/^Catatan untuk/i.test(judul)) catatan = teks
    else if (judul.includes(' · ')) bab.push(parseBab(judul, teks, semester))
  }
  return { mapel, bab, sumber, peta, catatan }
}

function parseBab(judul: string, teks: string, semester: string): Bab {
  const [label, ...sisa] = judul.split(' · ')
  const potong = teks.split(/\n(?=### )/)
  const awal = potong[0].startsWith('### ') ? '' : potong.shift()!
  const ambil = (k: string) => new RegExp(`\\*\\*${k}\\*\\*:\\s*(.+)`).exec(awal)?.[1] ?? ''
  const tambahan = ['Bahan Alkitab', 'Bacaan'].map(k => ambil(k) && `${k}: ${ambil(k)}`).filter(Boolean)
  let kunci = ''
  const kotak = potong.map((p): Kotak => {
    const [kepala, ...badan] = p.split('\n')
    let isi = badan.filter(l => l.trim() !== '---').join('\n')
    const k = /\*\*Kunci\*\*:\s*(.+)/.exec(isi)
    if (k) {
      kunci = k[1]
      isi = isi.replace(k[0], '')
    }
    const t = kepala.replace(/^###\s*/, '')
    const m = /^(\d+)\.\s*(.+)$/.exec(t)
    const jenis = /^Rangkuman/i.test(t) ? 'rangkuman' : /^Ayo Berlatih/i.test(t) ? 'latihan' : 'biasa'
    return { no: m?.[1] ?? '', judul: m?.[2] ?? t, isi: isi.trim(), jenis }
  })
  return { label: label.trim(), judul: bersih(sisa.join(' · ')), semester, pengantar: ambil('Pengantar'), tujuan: [ambil('Tujuan'), ...tambahan].filter(Boolean).join(' · '), kotak, kunci }
}

/** Rencana gambar di naskah menjadi adegan stiker ikon; isi lain dirender sebagai markdown. */
function htmlIsi(md: string) {
  const adegan: string[] = []
  const tanpaGambar = md.replace(/^>\s*🖼️.*$/gm, (baris) => {
    const desk = /\*\*Gambar\*\*:\s*(.*?)(\*\*Cara\*\*|$)/.exec(baris)?.[1] ?? ''
    const ikon = cariIkon(desk, 4)
    if (ikon.length < 2) return ''
    adegan.push(`<div class="adegan">${ikon.map((n, i) => stiker(n, WARNA_STIKER[i % 4], 'besar')).join('')}</div>`)
    return `\n@@ADEGAN${adegan.length - 1}@@\n`
  })
  return (marked.parse(tanpaGambar) as string).replace(/<p>@@ADEGAN(\d+)@@<\/p>/g, (_, i) => adegan[+i])
}

function perluLebar(k: Kotak) {
  const kolomTabel = Math.max(0, ...[...k.isi.matchAll(/^\|(.*)\|\s*$/gm)].map(m => m[1].split('|').length))
  return k.jenis !== 'biasa' || kolomTabel >= 3 || k.isi.length > 650
}

/** Kotak sempit yang tersisa sendirian di barisnya dijadikan lebar supaya tidak ada lubang di kisi. */
function aturLebar(kotak: Kotak[]) {
  const lebar = kotak.map(perluLebar)
  let deret: number[] = []
  const tutup = () => {
    if (deret.length % 2) lebar[deret.at(-1)!] = true
    deret = []
  }
  lebar.forEach((l, i) => l ? tutup() : deret.push(i))
  tutup()
  return lebar
}

function htmlKotak(k: Kotak, i: number, ikonMapel: string, lebar: boolean) {
  if (k.jenis === 'rangkuman')
    return `<div class="ringkas lebar"><h3>${stiker('star', '#ffffff', 'kecil')}Rangkuman</h3>${htmlIsi(k.isi)}</div>`
  if (k.jenis === 'latihan')
    return `<div class="latihan lebar"><h3>${stiker('pencil', '#ffdf20', 'kecil')}Ayo Berlatih</h3>${htmlIsi(k.isi)}</div>`
  const ikon = cariIkon(k.judul)[0] ?? cariIkon(k.isi)[0] ?? ikonMapel
  return `<div class="kartu ${KOTAK[i % KOTAK.length]}${lebar ? ' lebar' : ''}"><div class="tajuk">${k.no ? `<span class="no">${k.no}</span>` : ''}<span class="t">${inline(k.judul)}</span>${stiker(ikon, '#ffffff', 'kecil')}</div><div class="isi">${htmlIsi(k.isi)}</div></div>`
}

const pilihIlustrasi = (teks: string) => ILUSTRASI_KATA.find(([re]) => re.test(teks))?.[1] ?? 'buku'

function htmlHalaman(slug: string, kelas: number, d: ReturnType<typeof parse>) {
  const ikonMapel = IKON_MAPEL[slug] ?? 'book-open'
  const sem = [...new Set(d.bab.map(b => b.semester))].join(' & ')
  const ikonBab = d.bab.map(b => cariIkon(b.judul)[0] ?? cariIkon([b.pengantar, ...b.kotak.map(k => k.judul)].join(' '))[0] ?? ikonMapel)
  const jenisBab = (d.bab[0]?.label.split(' ')[0] ?? 'Bab').toUpperCase()
  const kolom = d.bab.length <= 6 ? ' tiga' : d.bab.length > 8 && d.bab.length <= 10 ? ' lima' : ''

  const sampul = `<section class="sampul${d.bab.length > 8 ? ' banyak' : ''}">
  <img class="logo" src="${LOGO}" alt="Guru Kampung">
  <div class="label">RANGKUMAN MATERI</div>
  <h1 class="judul-besar${d.mapel.length > 16 ? ' panjang' : ''}">${esc(d.mapel)}</h1>
  <div class="pil-baris"><span class="pil biru">Kelas ${kelas}</span><span class="pil">Semester ${sem}</span><span class="pil kuning">${d.bab.length} ${jenisBab.toLowerCase()} lengkap</span></div>
  <div class="panggung">
    ${ilustrasi(pilihIlustrasi(d.bab.map(b => b.judul).join(' ')), 'ilus kiri')}
    <img class="maskot" src="${MASKOT}" alt="">
    ${ilustrasi('medali', 'ilus kanan')}
    ${stiker(ikonMapel, '#ffdf20', 'ikon-mapel')}
  </div>
  <div class="daftar${kolom}">${d.bab.map((b, i) => `<div class="kartu-bab ${KOTAK[i % KOTAK.length]}"><div class="no">${esc(b.label)}</div><div class="ikon">${stiker(ikonBab[i], WARNA_STIKER[i % 4])}</div><div class="nama">${esc(b.judul)}</div></div>`).join('')}</div>
  <div class="jaminan"><span>Ringkas &amp; mudah dipahami</span><span>Sesuai CP 046/2025</span><span>Ada latihan &amp; kunci jawaban</span></div>
</section>`

  const halBab = d.bab.map((b, i) => `<section class="bab">
  <div class="kepala">
    <img class="maskot" src="${MASKOT}" alt="">
    <div class="label">RINGKASAN MATERI</div>
    <div class="mapel${d.mapel.length > 22 ? ' panjang' : ''}">${esc(d.mapel)}</div>
    <span class="kelas">Kelas ${kelas}</span><span class="kelas">Semester ${b.semester}</span>
    <div class="nomor">${esc(b.label.split(' ').at(-1) ?? '')}</div>
    <div class="judul-bab">${esc(b.label)} · ${esc(b.judul)}</div>
  </div>
  ${b.pengantar || b.tujuan ? `<div class="pengantar">${ilustrasi(pilihIlustrasi(`${b.judul} ${b.pengantar}`))}<div>${inline(b.pengantar)}${b.tujuan ? `<span class="tujuan"><b>Tujuan:</b> ${inline(b.tujuan)}</span>` : ''}</div>${stiker(ikonBab[i], '#ffdf20')}</div>` : ''}
  <div class="kisi">${(lebar => b.kotak.map((k, j) => htmlKotak(k, j, ikonMapel, lebar[j])).join(''))(aturLebar(b.kotak))}</div>
  <div class="kaki"><span class="merek"><img src="${MASKOT}" alt="">Guru Kampung</span><span class="semangat">${SEMANGAT[i % SEMANGAT.length]}</span></div>
</section>`).join('\n')

  const penutup = `<section class="penutup">
  <h2 class="bagian">${stiker('badge-check', '#ffdf20', 'kecil')}Kunci Jawaban Ayo Berlatih</h2>
  ${d.bab.filter(b => b.kunci).map(b => `<div class="kunci-bab"><b>${esc(b.label)} · ${esc(b.judul)}</b><br>${inline(b.kunci)}</div>`).join('')}
  ${d.catatan ? `<h2 class="bagian">${stiker('heart-handshake', '#74d4ff', 'kecil')}Catatan untuk Ayah, Bunda, dan Guru</h2><div class="catatan">${marked.parse(d.catatan)}</div>` : ''}
  <h2 class="bagian">${stiker('book-open', '#fef9c2', 'kecil')}Tentang Rangkuman Ini</h2>
  <div class="kecil">${marked.parse(d.sumber)}${d.peta ? marked.parse(d.peta) : ''}<p>Disusun oleh Guru Kampung dari buku teks Kemendikdasmen dan Capaian Pembelajaran Kepka BSKAP No. 046/H/KR/2025.</p></div>
  <img class="logo-akhir" src="${LOGO}" alt="Guru Kampung">
</section>`

  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Rangkuman ${esc(d.mapel)} Kelas ${kelas} · Guru Kampung</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@500;700;800&family=Funnel+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=block" rel="stylesheet">
<style>${CSS}</style></head><body>
${sampul}
${halBab}
${penutup}
</body></html>`
}

function cetak(html: string, pdf: string) {
  const profil = path.join(os.tmpdir(), 'gk-cetak-profil')
  const r = spawnSync(EDGE, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=20000', `--user-data-dir=${profil}`, `--print-to-pdf=${pdf}`, `file:///${html.replace(/\\/g, '/')}`], { stdio: 'ignore' })
  if (r.status !== 0 || !fs.existsSync(pdf)) throw new Error(`Gagal mencetak ${pdf}`)
}

const arg = process.argv.slice(2)
const hanyaHtml = arg.includes('--html')
const filterMapel = arg.find(a => a.startsWith('--mapel='))?.split('=')[1]
const daftarKelas = arg.filter(a => /^\d$/.test(a)).map(Number)
for (const kelas of daftarKelas.length ? daftarKelas : [1, 2, 3, 4, 5, 6]) {
  const dir = path.join(ROOT, 'produk', `rangkuman-kelas-${kelas}`)
  const naskah = path.join(dir, 'naskah')
  if (!fs.existsSync(naskah)) continue
  fs.mkdirSync(path.join(dir, 'html'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'pdf'), { recursive: true })
  for (const f of fs.readdirSync(naskah).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort()) {
    const slug = f.replace(/\.md$/, '')
    if (filterMapel && slug !== filterMapel) continue
    if (DITUNDA[kelas]?.includes(slug)) continue
    const d = parse(fs.readFileSync(path.join(naskah, f), 'utf8'))
    const html = path.join(dir, 'html', `${slug}.html`)
    fs.writeFileSync(html, htmlHalaman(slug, kelas, d))
    if (!hanyaHtml) cetak(html, path.join(dir, 'pdf', `Rangkuman ${d.mapel} Kelas ${kelas}.pdf`))
    console.log(`Kelas ${kelas} · ${d.mapel}: ${d.bab.length} bab${hanyaHtml ? ' (HTML)' : ''}`)
  }
}
