import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import OptionWheel from '@/components/OptionWheel'
import { menuEntries } from '@/lib/nav'
import { sfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const
const ITEMS = menuEntries.map((e) => e.label)

/** Dial-shaped toggle: a ticked ring that turns on hover and when open. */
export function WheelButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      className="group relative z-[60] grid size-11 cursor-pointer place-items-center"
    >
      <svg
        viewBox="0 0 40 40"
        className={cn(
          'size-full transition-transform duration-700 ease-out-expo group-hover:rotate-45',
          open && 'rotate-180 group-hover:rotate-[225deg]',
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        {/* outer ticks */}
        {Array.from({ length: 24 }, (_, i) => (
          <line
            key={i}
            x1="20"
            y1="1.5"
            x2="20"
            y2={i % 6 === 0 ? 6 : 4}
            strokeWidth={i % 6 === 0 ? 1.8 : 1.2}
            opacity={i % 6 === 0 ? 1 : 0.55}
            transform={`rotate(${i * 15} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="11.5" strokeDasharray="2 2" opacity="0.7" />
        <circle cx="20" cy="20" r="6" />
        {/* notch */}
        <line x1="20" y1="14" x2="20" y2="9.5" strokeWidth="1.6" />
        <rect x="18.5" y="18.5" width="3" height="3" fill="currentColor" stroke="none" />
      </svg>
    </button>
  )
}

/** Full-screen menu: blurs the page behind and shows the option wheel. */
export function WheelMenu({
  open,
  active,
  onSelect,
  onClose,
}: {
  open: boolean
  active: number
  onSelect: (i: number) => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && <WheelPanel active={active} onSelect={onSelect} onClose={onClose} />}
    </AnimatePresence>
  )
}

function WheelPanel({
  active,
  onSelect,
  onClose,
}: {
  active: number
  onSelect: (i: number) => void
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState(active)
  const [compact] = useState(() => window.matchMedia('(max-width: 640px)').matches)

  // Hand keyboard focus to the wheel so arrows / Enter work straight away.
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('[role="listbox"]')?.focus()
  }, [])

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de secciones"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void/75 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <motion.div
        className="relative h-[min(72vh,620px)] w-[min(92vw,520px)]"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: -8 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* selection marker */}
        <span className="display pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[clamp(22px,2.4vw,34px)]">
          &gt;
        </span>
        <span className="pointer-events-none absolute top-1/2 right-0 left-8 h-px border-t border-dashed border-line" />
        <OptionWheel
          items={ITEMS}
          defaultSelected={active}
          onChange={(i) => {
            setHighlight(i)
            sfx.tick()
          }}
          onSelect={(i) => {
            sfx.confirm()
            onSelect(i)
          }}
          ariaLabel="Secciones"
          textColor="rgb(235 232 225 / 0.55)"
          activeColor="#ebe8e1"
          fontSize={compact ? 1.9 : 3.1}
          spacing={1.5}
          tilt={7}
          blur={1}
          fade={0.22}
          inset={compact ? 40 : 56}
          className="display uppercase"
        />
      </motion.div>

      <p className="caption mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-muted">
        <span>[scroll / arrastrar] elegir</span>
        <span>
          [click / enter] abrir <span className="text-chalk">{ITEMS[highlight].replace(/^[\s >]+/, '')}</span>
        </span>
        <span>[esc] cerrar</span>
      </p>
    </motion.div>
  )
}
