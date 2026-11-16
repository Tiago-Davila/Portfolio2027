import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const RAMP = ' .:-=+*#%@'
const SCRAMBLE = '!<>-_\\/[]{}=+*^?#01'
const VOID = '#0a0a0a'
const CHALK = '235 232 225'

/**
 * Image that "decodes" from ASCII: the frame starts as scrambled glyphs,
 * settles into an ASCII render of the picture, then dissolves cell by cell
 * (top to bottom, with noise) into the real image.
 * Remount it (change its `key`) to replay the effect.
 */
export function AsciiReveal({
  src,
  alt,
  placeholder,
  className,
  imgClassName,
  cell = 11,
  duration = 1150,
}: {
  src?: string
  alt: string
  /** Shown instead of the image when there is no `src` yet. */
  placeholder?: ReactNode
  className?: string
  imgClassName?: string
  /** Glyph size in px. */
  cell?: number
  duration?: number
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Reduced motion: skip straight to the image.
  const [done, setDone] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return
    if (done) return

    const { width: w, height: h } = wrap.getBoundingClientRect()
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.scale(dpr, dpr)

    const cw = cell * 0.62
    const ch = cell * 1.05
    const cols = Math.ceil(w / cw)
    const rows = Math.ceil(h / ch)
    const n = cols * rows

    // Luminance per cell: procedural until the image is sampled.
    const luma = new Float32Array(n)
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const v = 0.5 + 0.5 * Math.sin(x * 0.18 + y * 0.31) * Math.cos(y * 0.12 - x * 0.07)
        luma[y * cols + x] = v * 0.6
      }
    // When each cell resolves: mostly top→bottom, with noise.
    const thr = new Float32Array(n)
    const glyph = new Uint8Array(n)
    for (let i = 0; i < n; i++) {
      thr[i] = (Math.floor(i / cols) / rows) * 0.55 + Math.random() * 0.45
      glyph[i] = Math.floor(Math.random() * SCRAMBLE.length)
    }

    ctx.fillStyle = VOID
    ctx.fillRect(0, 0, w, h)
    ctx.font = `${cell}px 'JetBrains Mono', ui-monospace, monospace`
    ctx.textBaseline = 'top'

    let raf = 0
    let t0 = 0
    let cancelled = false
    const SPAN = 1.5 // progress runs 0 → SPAN; each cell lives thr → thr + 0.5

    const frame = (now: number) => {
      if (cancelled) return
      if (!t0) t0 = now
      const p = ((now - t0) / duration) * SPAN
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < n; i++) {
        const local = p - thr[i]
        if (local >= 0.5) continue
        const x = (i % cols) * cw
        const y = Math.floor(i / cols) * ch
        ctx.globalAlpha = 1
        ctx.fillStyle = VOID
        ctx.fillRect(x, y, cw + 0.5, ch + 0.5)
        let c: string
        let a: number
        if (local < 0) {
          // Scrambled noise, flickering.
          if (Math.random() < 0.08) glyph[i] = Math.floor(Math.random() * SCRAMBLE.length)
          c = SCRAMBLE[glyph[i]]
          a = 0.12 + 0.18 * Math.max(0, 1 + local * 2)
        } else {
          // ASCII render of the image, brightening just before it dissolves.
          const l = luma[i]
          c = RAMP[Math.min(RAMP.length - 1, Math.floor(l * RAMP.length))]
          a = 0.35 + 0.65 * l
          if (local > 0.4) {
            ctx.fillStyle = `rgb(${CHALK} / ${0.25 * (1 - (local - 0.4) / 0.1)})`
            ctx.fillRect(x, y, cw + 0.5, ch + 0.5)
          }
        }
        if (c === ' ') continue
        ctx.globalAlpha = a
        ctx.fillStyle = `rgb(${CHALK})`
        ctx.fillText(c, x, y)
      }
      ctx.globalAlpha = 1
      if (p >= SPAN) {
        setDone(true)
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (!cancelled) raf = requestAnimationFrame(frame)
    }

    if (src) {
      const img = new Image()
      img.src = src
      img
        .decode()
        .then(() => {
          // Sample with the same crop as `object-cover object-top`.
          const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
          const sw = w / s
          const sh = h / s
          const sx = (img.naturalWidth - sw) / 2
          const off = document.createElement('canvas')
          off.width = cols
          off.height = rows
          const octx = off.getContext('2d', { willReadFrequently: true })
          if (!octx) return
          octx.drawImage(img, sx, 0, sw, sh, 0, 0, cols, rows)
          const d = octx.getImageData(0, 0, cols, rows).data
          for (let i = 0; i < n; i++) {
            const l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255
            luma[i] = Math.pow(l, 0.9)
          }
        })
        .catch(() => {})
        .finally(start)
    } else start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount/src
  }, [src, cell, duration])

  return (
    <div ref={wrapRef} className={cn('relative overflow-hidden bg-smoke', className)}>
      {src ? (
        <img src={src} alt={alt} draggable={false} className={cn('size-full object-cover object-top', imgClassName)} />
      ) : (
        placeholder
      )}
      {!done && <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />}
    </div>
  )
}
