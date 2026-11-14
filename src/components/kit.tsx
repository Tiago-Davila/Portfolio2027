import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import DecryptedText from '@/components/DecryptedText'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const
const GLYPHS = '!<>-_\\/[]{}=+*^?#01'

/**
 * Dot-matrix display lines that decrypt from random glyphs when shown,
 * and scramble again on hover.
 */
export function RevealLines({
  lines,
  className,
  as: Tag = 'h1',
}: {
  /** Wrap words in *asterisks* to render them as an inverted block. */
  lines: readonly string[]
  className?: string
  as?: 'h1' | 'h2' | 'p'
}) {
  return (
    <Tag className={cn('display', className)} aria-label={lines.join(' ').replaceAll('*', '')}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden className="block">
          {line.split(/(\*[^*]+\*)/).map((part, j) => {
            if (!part) return null
            const highlighted = part.startsWith('*')
            const text = highlighted ? part.slice(1, -1) : part
            return (
              <span key={j} className={highlighted ? 'inverse' : undefined}>
                <DecryptedText
                  text={text}
                  animateOn="inViewHover"
                  sequential
                  speed={26}
                  characters={GLYPHS}
                  encryptedClassName="opacity-60"
                />
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

/** Generic fade-up used for secondary blocks. */
export function Rise({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={cn('size-3', className)} fill="none" stroke="currentColor">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  )
}

/** Terminal prompt label: > LABEL█ */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="caption flex items-center gap-2">
      <span className="text-muted">&gt;</span>
      <span className="caret">{children}</span>
    </div>
  )
}

/** Label / value rows separated by dashed rules. */
export function DataRows({
  rows,
  className,
}: {
  rows: readonly (readonly [string, string])[]
  className?: string
}) {
  return (
    <dl className={cn('border-b border-dashed border-line', className)}>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[1fr_1fr] border-t border-dashed border-line py-[7px]">
          <dt className="caption text-muted">{k}</dt>
          <dd className="caption">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Path-like tag list: a // b // c */
export function Tags({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <div className={cn('caption flex flex-wrap gap-x-2 gap-y-1 text-muted', className)}>
      {items.map((t, i) => (
        <span key={t}>
          {i > 0 && <span className="mr-2 opacity-60">//</span>}
          {t}
        </span>
      ))}
    </div>
  )
}
