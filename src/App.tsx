import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState, type ComponentType } from 'react'
import GradientASCII from '@/components/GradientASCII'
import { Eyebrow } from '@/components/kit'
import { WheelButton, WheelMenu } from '@/components/WheelMenu'
import { about, contact, hero, sections, skills } from '@/data/content'
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { Home } from '@/sections/Home'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'

const views: { Component: ComponentType; eyebrow: string }[] = [
  { Component: Home, eyebrow: hero.eyebrow },
  { Component: Projects, eyebrow: 'Proyectos seleccionados' },
  { Component: About, eyebrow: about.eyebrow },
  { Component: Skills, eyebrow: skills.eyebrow },
  { Component: Contact, eyebrow: contact.eyebrow },
]

const EASE = [0.16, 1, 0.3, 1] as const
const LAST = sections.length - 1
const pad = (n: number) => String(n).padStart(2, '0')

function indexFromHash() {
  const i = sections.findIndex((s) => `#${s.id}` === window.location.hash)
  return i < 0 ? 0 : i
}

export default function App() {
  const [active, setActive] = useState(indexFromHash)
  const [dir, setDir] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)

  const go = useCallback((next: number) => {
    const i = Math.max(0, Math.min(LAST, next))
    setActive((cur) => {
      if (i !== cur) setDir(i > cur ? 1 : -1)
      return i
    })
  }, [])

  // Keep the URL hash in sync so sections are linkable.
  useEffect(() => {
    history.replaceState(null, '', `#${sections[active].id}`)
  }, [active])

  // Arrow keys step through sections while the menu is closed; Esc closes it.
  useEffect(() => {
    const onHash = () => go(indexFromHash())
    const onKey = (e: KeyboardEvent) => {
      if (menuOpen) {
        if (e.key === 'Escape') setMenuOpen(false)
        return
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) go(active + 1)
      else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) go(active - 1)
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, go, menuOpen])

  const { Component, eyebrow } = views[active]

  return (
    <div className="relative flex h-dvh flex-col px-4 lg:px-[22px]">
      {/* ASCII glow rising behind the home section */}
      <AnimatePresence>
        {active === 0 && (
          <motion.div
            key="ascii-bg"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <GradientASCII
              colors={['#000000', '#ffffff', '#e8fffb']}
              shape="rise"
              cellSize={16}
              density={0.8}
              glyphOpacity={0.85}
              gradientOpacity={0.9}
              glow={0.2}
              depthOfField={0}
              flicker={0.2}
              softness={0.5}
              scale={1}
              flow={0.55}
              speed={1}
              grain={0.08}
              variation={0}
              scrambleRadius={0.1}
              mouseInteraction
              clickEffect="wave"
              intro
              lightMode={false}
              fontFamily="'JetBrains Mono', ui-monospace, monospace"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <header className="relative grid grid-cols-[1fr_auto] items-center gap-4 py-4 lg:grid-cols-[1fr_auto_1fr] lg:py-[22px]">
        <div className="justify-self-start">
          <WheelButton open={menuOpen} onClick={() => setMenuOpen((o) => !o)} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={eyebrow}
            className="hidden lg:block"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Eyebrow>{eyebrow}</Eyebrow>
          </motion.div>
        </AnimatePresence>

        <span className="caption justify-self-end text-muted">
          [<span className="text-chalk">{pad(active)}</span>/{pad(LAST)}]
        </span>
      </header>

      <main className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section
            key={active}
            custom={dir}
            aria-label={sections[active].label}
            className="absolute inset-0 overflow-y-auto pb-[22px] [scrollbar-width:none]"
            variants={{
              enter: (d: number) => ({ opacity: 0, y: d * 40 }),
              center: { opacity: 1, y: 0 },
              exit: (d: number) => ({ opacity: 0, y: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Component />
          </motion.section>
        </AnimatePresence>
      </main>

      <WheelMenu
        open={menuOpen}
        active={active}
        onSelect={(i) => {
          go(i)
          setMenuOpen(false)
        }}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  )
}
