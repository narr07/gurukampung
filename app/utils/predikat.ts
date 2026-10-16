export interface PredicateRange {
  grade: string
  min: number
  max: number
  label: string
}

export const DEFAULT_PREDICATES: PredicateRange[] = [
  { grade: 'A', min: 90, max: 100, label: 'Sangat Baik' },
  { grade: 'B', min: 80, max: 89, label: 'Baik' },
  { grade: 'C', min: 70, max: 79, label: 'Cukup' },
  { grade: 'D', min: 0, max: 69, label: 'Perlu Bimbingan' }
]

export function toPredicate(score: number, ranges: readonly PredicateRange[] = DEFAULT_PREDICATES): PredicateRange | undefined {
  if (!Number.isFinite(score)) return undefined
  const rounded = Math.round(score)
  const sorted = [...ranges].sort((a, b) => b.min - a.min)
  return sorted.find(r => rounded >= r.min && rounded <= r.max) ?? sorted.find(r => rounded >= r.min)
}

export type MasteryStatus = 'pengayaan' | 'tuntas' | 'remedial'

export function checkMastery(score: number, kktp: number, enrichmentMin = 90): MasteryStatus {
  if (score >= enrichmentMin) return 'pengayaan'
  if (score >= kktp) return 'tuntas'
  return 'remedial'
}

export interface TpItem {
  id: string
  code: string
  text: string
}

export function buildReportDescription(
  studentName: string,
  mastered: readonly string[],
  needsGuidance: readonly string[]
): string {
  const name = studentName.trim() || 'Siswa'
  const cleanMastered = mastered.map(s => s.trim().replace(/\.$/, '')).filter(Boolean)
  const cleanGuidance = needsGuidance.map(s => s.trim().replace(/\.$/, '')).filter(Boolean)

  const parts: string[] = []
  if (cleanMastered.length > 0) {
    parts.push(`Ananda ${name} menunjukkan penguasaan yang baik dalam ${joinListId(cleanMastered)}.`)
  }
  if (cleanGuidance.length > 0) {
    parts.push(`Perlu bimbingan dan pendampingan lebih lanjut dalam ${joinListId(cleanGuidance)}.`)
  }
  return parts.join(' ')
}

export function joinListId(items: readonly string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  if (items.length === 2) return `${items[0]} serta ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, serta ${items[items.length - 1]}`
}

