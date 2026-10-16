import { randomInt, type Rng } from './random'

export type Operation = '+' | '-' | '×' | ':'

export interface WorksheetOptions {
  operations: Operation[]
  min: number
  max: number
  count: number
  // Pengurangan tidak menghasilkan bilangan negatif
  noNegative: boolean
  // Pembagian selalu habis dibagi
  noRemainder: boolean
}

export interface Problem {
  a: number
  b: number
  op: Operation
  answer: number
  remainder?: number
}

export function makeProblem(rng: Rng, op: Operation, o: Pick<WorksheetOptions, 'min' | 'max' | 'noNegative' | 'noRemainder'>): Problem {
  const lo = Math.min(o.min, o.max)
  const hi = Math.max(o.min, o.max)
  let a = randomInt(rng, lo, hi)
  let b = randomInt(rng, lo, hi)

  switch (op) {
    case '+':
      return { a, b, op, answer: a + b }
    case '-':
      if (o.noNegative && b > a) [a, b] = [b, a]
      return { a, b, op, answer: a - b }
    case '×':
      return { a, b, op, answer: a * b }
    case ':': {
      if (b === 0) b = 1
      if (o.noRemainder) {
        // Bilangan yang dibagi dibuat dari hasil kali, jadi rentang berlaku untuk pembagi dan hasil bagi
        const q = randomInt(rng, Math.max(lo, 1), Math.max(hi, 1))
        return { a: q * b, b, op, answer: q }
      }
      return { a, b, op, answer: Math.floor(a / b), remainder: a % b }
    }
  }
}

export function makeWorksheet(rng: Rng, o: WorksheetOptions): Problem[] {
  const ops = o.operations.length ? o.operations : ['+'] as Operation[]
  const out: Problem[] = []
  const seen = new Set<string>()
  let guard = 0
  // Soal kembar dihindari selama rentang angkanya masih memungkinkan
  while (out.length < o.count && guard++ < o.count * 50) {
    const p = makeProblem(rng, ops[out.length % ops.length]!, o)
    const key = `${p.a}${p.op}${p.b}`
    if (seen.has(key) && guard < o.count * 25) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

export function answerText(p: Problem) {
  return p.remainder ? `${p.answer} sisa ${p.remainder}` : String(p.answer)
}
