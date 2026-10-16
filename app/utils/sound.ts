// Bunyi pendek dibuat langsung dengan Web Audio, jadi tidak perlu file suara
let ctx: AudioContext | undefined

export function beep({ times = 1, frequency = 880, duration = 0.18, gap = 0.12 } = {}) {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  const start = ctx.currentTime
  for (let i = 0; i < times; i++) {
    const t = start + i * (duration + gap)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  }
}
