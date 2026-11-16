/**
 * Synthesized UI sound kit (Web Audio, no files). Tuned like a tactical
 * shooter menu: low, dry, filtered transients with a bit of weight, instead
 * of bright arcade blips. Everything runs through a low-pass + compressor
 * bus so nothing gets shrill.
 * Audio only starts after the first user gesture, as browsers require.
 */

const STORAGE_KEY = 'sfx-muted'
const MASTER = 0.5

let ctx: AudioContext | null = null
let bus: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
let muted = readMuted()
let unlocked = false
const listeners = new Set<(m: boolean) => void>()

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function audio() {
  if (muted || !unlocked) return null
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    // bus -> low-pass (tames highs) -> compressor (glues, adds punch) -> out
    bus = ctx.createGain()
    bus.gain.value = MASTER
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4200
    lp.Q.value = 0.5
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 4
    comp.attack.value = 0.002
    comp.release.value = 0.12
    bus.connect(lp).connect(comp).connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx.state === 'running' ? ctx : null
}

type ToneOpts = { type?: OscillatorType; vol?: number; at?: number; to?: number; attack?: number }

/** Pitched body: sine/triangle with optional glide to `to` Hz. */
function tone(freq: number, dur: number, { type = 'sine', vol = 1, at = 0, to, attack = 0.002 }: ToneOpts = {}) {
  const c = audio()
  if (!c || !bus) return
  const t = c.currentTime + at
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(bus)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

type NoiseOpts = {
  freq?: number
  to?: number
  q?: number
  vol?: number
  at?: number
  attack?: number
  type?: BiquadFilterType
}

/** Filtered noise: transients, mechanical clicks and air sweeps. */
function noise(dur: number, { freq = 1500, to, q = 1, vol = 1, at = 0, attack = 0.001, type = 'bandpass' }: NoiseOpts = {}) {
  const c = audio()
  if (!c || !bus || !noiseBuf) return
  const t = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.setValueAtTime(freq, t)
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur)
  f.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(bus)
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.02)
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

// Rate-limit very frequent sounds so they never turn into a buzz.
const last: Record<string, number> = {}
function throttle(key: string, ms: number) {
  const now = performance.now()
  if (now - (last[key] ?? 0) < ms) return false
  last[key] = now
  return true
}

export const sfx = {
  /** Hover: soft, low "tk" — felt more than heard. */
  hover() {
    if (!throttle('hover', 70)) return
    noise(0.03, { freq: rand(1100, 1300), q: 2.5, vol: 0.18 })
    tone(rand(380, 420), 0.04, { vol: 0.08 })
  },
  /** Click: dry mechanical "thock" with a low body. */
  click() {
    noise(0.035, { freq: 1800, q: 1.2, vol: 0.45 })
    tone(160, 0.09, { vol: 0.4, to: 70 })
  },
  /** One detent of the menu wheel: short damped click. */
  tick() {
    if (!throttle('tick', 35)) return
    noise(0.022, { freq: rand(1400, 1600), q: 3, vol: 0.32 })
    tone(260, 0.03, { vol: 0.1, type: 'triangle' })
  },
  /** Menu opens: filtered air swell over a sub thump. */
  open() {
    noise(0.28, { type: 'lowpass', freq: 250, to: 2200, q: 1.5, vol: 0.22, attack: 0.08 })
    tone(90, 0.25, { vol: 0.45, to: 55 })
    tone(330, 0.22, { vol: 0.07, type: 'triangle', at: 0.06, attack: 0.04 })
  },
  /** Menu closes: the swell reversed, shorter. */
  close() {
    noise(0.2, { type: 'lowpass', freq: 2000, to: 220, q: 1.5, vol: 0.2, attack: 0.01 })
    tone(110, 0.18, { vol: 0.35, to: 60 })
  },
  /** Section confirmed: weighty two-step lock-in (low fifth, no beeps). */
  confirm() {
    noise(0.04, { freq: 2000, q: 1, vol: 0.4 })
    tone(220, 0.16, { vol: 0.22, type: 'triangle' })
    tone(330, 0.24, { vol: 0.16, type: 'triangle', at: 0.07 })
    tone(75, 0.3, { vol: 0.45, to: 45 })
  },
  /** One glyph settling in the decrypt effect: barely-there data tick. */
  glyph() {
    if (!throttle('glyph', 55)) return
    noise(0.012, { freq: rand(2200, 2800), q: 4, vol: 0.06 })
  },
}

/** Browsers only allow audio after a user gesture: arm it on the first one. */
export function armAudio() {
  const unlock = () => {
    unlocked = true
    audio()
    window.removeEventListener('pointerdown', unlock, true)
    window.removeEventListener('keydown', unlock, true)
  }
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('keydown', unlock, true)
}

export function isMuted() {
  return muted
}

export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(STORAGE_KEY, m ? '1' : '0')
  } catch {
    /* storage unavailable: keep in-memory value */
  }
  if (m) void ctx?.suspend()
  listeners.forEach((fn) => fn(m))
}

export function onMutedChange(fn: (m: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
