import { useMemo } from 'react'

const RAMP = ' .:-=+*#%@'

/** Deterministic ASCII "render" of a lit sphere — placeholder art for projects without a capture. */
function sphere(cols: number, rows: number) {
  const out: string[] = []
  for (let y = 0; y < rows; y++) {
    let line = ''
    for (let x = 0; x < cols; x++) {
      // Characters are ~2x taller than wide, so squash x.
      const nx = ((x / cols) * 2 - 1) * (cols / rows) * 0.5
      const ny = (y / rows) * 2 - 1
      const d = nx * nx + ny * ny
      if (d > 0.72) {
        line += (x * 7 + y * 13) % 23 === 0 ? '.' : ' '
        continue
      }
      const z = Math.sqrt(0.72 - d)
      const light = Math.max(0, (-nx * 0.5 - ny * 0.6 + z * 0.9) / 1.2)
      line += RAMP[Math.min(RAMP.length - 1, Math.floor(light * RAMP.length))]
    }
    out.push(line)
  }
  return out.join('\n')
}

export function AsciiField({ label }: { label: string }) {
  const art = useMemo(() => sphere(96, 34), [])
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <pre
        aria-hidden
        className="absolute inset-0 flex items-center justify-center text-[clamp(5px,0.62vw,9px)] leading-[1.15] text-muted transition-opacity duration-700 group-hover:opacity-100 sm:opacity-80"
      >
        {art}
      </pre>
      <span className="display relative bg-void px-2 text-[clamp(32px,3.4vw,56px)]">{label}</span>
    </div>
  )
}
