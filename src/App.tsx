import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import GradientASCII from '@/components/GradientASCII'
import { Eyebrow } from '@/components/kit'
import { WheelButton, WheelMenu } from '@/components/WheelMenu'
import { about, contact, sections, skills } from '@/data/content'
import { compare, hashOf, LAST, menuEntries, menuIndexOf, PROJECTS, posFromHash, stepPos, type Pos } from '@/lib/nav'
import { armAudio, isMuted, onMutedChange, setMuted, sfx } from '@/lib/sfx'
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { Home } from '@/sections/Home'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'

const views: { Component?: ComponentType; eyebrow?: string }[] = [
  { Component: Home },
  { eyebrow: 'Proyectos seleccionados' }, // rendered with its nav state below
  { Component: About, eyebrow: about.eyebrow },
  { Component: Skills, eyebrow: skills.eyebrow },
  { Component: Contact, eyebrow: contact.eyebrow },
]

const EASE = [0.16, 1, 0.3, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

/** Sections where the wheel always pages (nothing to scroll inside). */
const PAGED = new Set([0, PROJECTS])
const WHEEL_STEP = 40 // px of wheel delta that count as one step
const EDGE_STEP = 160 // extra "overscroll" needed to leave a scrollable section

export default function App() {
  const [nav, setNav] = useState<{ pos: Pos; dir: number }>(() => ({ pos: posFromHash(), dir: 1 }))
  const [menuOpen, setMenuOpen] = useState(false)
  const [muted, setMutedState] = useState(isMuted)
  const { pos, dir } = nav
  const active = pos.section
  const scrollerRef = useRef<HTMLElement>(null)

  /** One step forward/back: next capture, next project or next section. */
  const step = useCallback((d: 1 | -1) => {
    setNav((n) => {
      const next = stepPos(n.pos, d)
      return next ? { pos: next, dir: d } : n
    })
  }, [])

  const goTo = useCallback((target: Pos) => {
    setNav((n) => ({ pos: target, dir: compare(n.pos, target) || n.dir }))
  }, [])

  // Keep the URL hash in sync so sections (and projects) are linkable.
  useEffect(() => {
    history.replaceState(null, '', hashOf(pos))
  }, [pos])

  // Wheel / swipe paging. In Home and Projects every gesture is a step (the
  // page itself never moves); elsewhere the section scrolls normally and only
  // pushing past its top/bottom edge moves on.
  useEffect(() => {
    if (menuOpen) return
    const w = { acc: 0, last: 0, lockedUntil: 0, inGesture: false }
    const atEdge = (d: number) => {
      const el = scrollerRef.current
      if (!el) return true
      return d > 0 ? el.scrollTop + el.clientHeight >= el.scrollHeight - 2 : el.scrollTop <= 0
    }
    const push = (delta: number, paged: boolean) => {
      const now = performance.now()
      const gap = now - w.last
      w.last = now
      // After a step, ignore the rest of that gesture (trackpad inertia).
      if (w.inGesture && gap < 180) return
      w.inGesture = false
      if (now < w.lockedUntil) return
      if (gap > 250 || Math.sign(delta) !== Math.sign(w.acc)) w.acc = 0
      const d = (delta > 0 ? 1 : -1) as 1 | -1
      if (!paged && !atEdge(d)) {
        w.acc = 0
        return
      }
      w.acc += delta
      if (Math.abs(w.acc) < (paged ? WHEEL_STEP : EDGE_STEP)) return
      w.acc = 0
      w.inGesture = true
      w.lockedUntil = now + 650
      step(d)
    }
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
      push(e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY, PAGED.has(active))
    }
    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY == null) return
      const dy = touchY - e.changedTouches[0].clientY
      touchY = null
      if (Math.abs(dy) < 50) return
      const d = (dy > 0 ? 1 : -1) as 1 | -1
      if (PAGED.has(active) || atEdge(d)) {
        w.lockedUntil = 0
        w.inGesture = false
        step(d)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [active, menuOpen, step])

  // Global UI sounds: blip on hovering links/buttons, tick on clicking them.
  useEffect(() => {
    armAudio()
    const off = onMutedChange(setMutedState)
    const interactive = (t: EventTarget | null) =>
      t instanceof Element ? t.closest('a, button, [role="option"]') : null
    let hovered: Element | null = null
    const onOver = (e: PointerEvent) => {
      const el = interactive(e.target)
      if (el && el !== hovered) sfx.hover()
      hovered = el
    }
    const onClick = (e: MouseEvent) => {
      if (interactive(e.target)) sfx.click()
    }
    document.addEventListener('pointerover', onOver)
    document.addEventListener('click', onClick, true)
    return () => {
      off()
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  // Arrow keys step through sections while the menu is closed; Esc closes it.
  useEffect(() => {
    const onHash = () => goTo(posFromHash())
    const onKey = (e: KeyboardEvent) => {
      if (menuOpen) {
        if (e.key === 'Escape') {
          sfx.close()
          setMenuOpen(false)
        }
        return
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) step(1)
      else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) step(-1)
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKey)
    }
  }, [goTo, menuOpen, step])

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
          <WheelButton
            open={menuOpen}
            onClick={() => {
              if (menuOpen) sfx.close()
              else sfx.open()
              setMenuOpen((o) => !o)
            }}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {eyebrow && <motion.div
            key={eyebrow}
            className="hidden lg:block"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Eyebrow>{eyebrow}</Eyebrow>
          </motion.div>}
        </AnimatePresence>

        <div className="caption flex items-center gap-4 justify-self-end text-muted">
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            aria-pressed={!muted}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            className="cursor-pointer uppercase hover:text-chalk"
          >
            [snd:<span className="text-chalk">{muted ? 'off' : 'on'}</span>]
          </button>
          <span>
            [<span className="text-chalk">{pad(active)}</span>/{pad(LAST)}]
          </span>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section
            key={active}
            ref={scrollerRef}
            custom={dir}
            aria-label={sections[active].label}
            className={
              PAGED.has(active)
                ? 'absolute inset-0 overflow-hidden'
                : 'absolute inset-0 overflow-y-auto pb-[22px] [scrollbar-width:none]'
            }
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
            {Component ? <Component /> : <Projects project={pos.project} shot={pos.shot} dir={dir} />}
          </motion.section>
        </AnimatePresence>
      </main>

      <WheelMenu
        open={menuOpen}
        active={menuIndexOf(pos)}
        onSelect={(i) => {
          goTo(menuEntries[i].pos)
          setMenuOpen(false)
        }}
        onClose={() => {
          sfx.close()
          setMenuOpen(false)
        }}
      />
    </div>
  )
}
