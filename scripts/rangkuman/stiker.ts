// Aset visual Guru Kampung untuk PDF: ikon Lucide sebagai stiker bergaris tinta, ilustrasi SVG proyek, maskot, dan logo.
import fs from 'node:fs'
import path from 'node:path'
import { ILUSTRASI_BARU } from '../../app/utils/ilustrasi'

const ROOT = path.resolve(import.meta.dir, '../..')
const lucide = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/@iconify-json/lucide/icons.json'), 'utf8')) as
  { icons: Record<string, { body: string }>, aliases?: Record<string, { parent: string }> }

// Warna stiker dari palet DESIGN.md: kuning pensil, langit, kayu, putih
export const WARNA_STIKER = ['#ffdf20', '#74d4ff', '#fef9c2', '#ffffff']

const fileUrl = (rel: string) => `file:///${path.join(ROOT, rel).replace(/\\/g, '/')}`
export const MASKOT = fileUrl('public/brand/guru-kampung-maskot.svg')
export const LOGO = fileUrl('public/brand/guru-kampung-logo-horizontal.svg')

function badan(nama: string) {
  const ikon = lucide.icons[nama] ?? lucide.icons[lucide.aliases?.[nama]?.parent ?? ''] ?? lucide.icons.sparkles
  return ikon.body.replace(/stroke-width="2"/g, 'stroke-width="2.25"')
}

/** Ikon Lucide di dalam lingkaran berwarna dengan garis tinta dan bayangan padat (gaya stiker). */
export const stiker = (nama: string, warna = WARNA_STIKER[0], kelas = '') =>
  `<span class="stiker ${kelas}" style="--sb:${warna}"><svg viewBox="0 0 24 24" aria-hidden="true">${badan(nama)}</svg></span>`

/** Ilustrasi 96×96 dari app/utils/ilustrasi.ts. */
export const ilustrasi = (nama: string, kelas = 'ilus') =>
  `<svg class="${kelas}" viewBox="0 0 96 96" aria-hidden="true">${ILUSTRASI_BARU[nama as keyof typeof ILUSTRASI_BARU] ?? ILUSTRASI_BARU.buku}</svg>`
