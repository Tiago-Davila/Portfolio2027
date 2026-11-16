import { AnimatePresence, motion } from 'motion/react'
import { AsciiReveal } from '@/components/AsciiReveal'
import { ArrowUpRight, DataRows, RevealLines, Tags } from '@/components/kit'
import { projects, type Project } from '@/data/content'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One project per screen. The page never scrolls: each scroll step swaps the
 * capture (with an ASCII decode), and past the last capture the next project
 * slides in. Navigation state lives in App.
 */
export function Projects({ project, shot, dir }: { project: number; shot: number; dir: number }) {
  const p = projects[project]
  return (
    <AnimatePresence mode="wait" custom={dir} initial={false}>
      <motion.article
        key={p.id}
        custom={dir}
        aria-label={p.name}
        className="h-full"
        variants={{
          enter: (d: number) => ({ opacity: 0, y: d * 32 }),
          center: { opacity: 1, y: 0 },
          exit: (d: number) => ({ opacity: 0, y: d * -32 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.45, ease: EASE }}
      >
        <ProjectView p={p} index={project} shot={shot} />
      </motion.article>
    </AnimatePresence>
  )
}

function ProjectView({ p, index, shot }: { p: Project; index: number; shot: number }) {
  const web = p.device === 'web'
  const s = p.shots[shot] ?? {}
  return (
    <div
      className={cn(
        'grid h-full grid-rows-[auto_minmax(0,1fr)] gap-5 pt-2 pb-4 lg:grid-rows-1 lg:items-center lg:gap-10 lg:py-4',
        web ? 'lg:grid-cols-[minmax(220px,290px)_minmax(0,1fr)_auto]' : 'lg:grid-cols-[minmax(220px,290px)_minmax(0,1fr)]',
      )}
    >
      <Info p={p} index={index} shot={shot} />

      <div className="flex min-h-0 items-center justify-center">
        {web ? (
          <BrowserFrame p={p} shot={shot} src={s.desktop} />
        ) : (
          <PhoneFrame p={p} shot={shot} src={s.mobile} size="lg" />
        )}
      </div>

      {web && (
        <div className="hidden items-center lg:flex">
          <PhoneFrame p={p} shot={shot} src={s.mobile} size="sm" />
        </div>
      )}
    </div>
  )
}

function Info({ p, index, shot }: { p: Project; index: number; shot: number }) {
  return (
    <aside className="flex min-w-0 flex-col items-start gap-3 text-left lg:gap-5">
      <span className="caption text-muted">
        [<span className="text-chalk">{pad(index + 1)}</span>/{pad(projects.length)}] proyecto
        {p.device === 'mobile' && ' // mobile'}
      </span>
      <RevealLines key={p.id} as="h2" lines={[p.name]} className="text-[clamp(28px,3.2vw,50px)]" />
      <Tags items={p.domain ? [p.domain, ...p.tags] : p.tags} />
      <p className="hidden max-w-[300px] text-body-s text-soft lg:block">{p.description}</p>
      <DataRows rows={p.rows} className="hidden w-full lg:block" />
      {p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="caption hidden items-center gap-1.5 underline-offset-4 hover:underline lg:inline-flex"
        >
          Ver sitio <ArrowUpRight />
        </a>
      )}
      <ShotProgress total={p.shots.length} current={shot} />
    </aside>
  )
}

/** Segmented progress for the captures of the current project. */
function ShotProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex w-full max-w-[290px] flex-col gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 transition-colors duration-500',
              i === current ? 'bg-chalk' : i < current ? 'bg-soft' : 'bg-line',
            )}
          />
        ))}
      </div>
      <div className="caption flex justify-between text-muted">
        <span>
          img <span className="text-chalk">{pad(current + 1)}</span>/{pad(total)}
        </span>
        <span className="hidden lg:inline">[scroll] siguiente</span>
      </div>
    </div>
  )
}

function BrowserFrame({ p, shot, src }: { p: Project; shot: number; src?: string }) {
  return (
    <div
      className="flex w-full flex-col border border-dashed border-line bg-void"
      // Fit 16:10 inside the free height on wide screens.
      style={{ maxWidth: 'calc((100dvh - 210px) * 1.6)' }}
    >
      <div className="caption flex items-center gap-3 border-b border-dashed border-line px-3 py-1.5 text-muted">
        <span className="flex gap-1" aria-hidden>
          <span className="size-1.5 bg-line" />
          <span className="size-1.5 bg-line" />
          <span className="size-1.5 bg-line" />
        </span>
        <span className="truncate">{p.domain ?? p.id}</span>
        <span className="ml-auto">[{pad(shot + 1)}]</span>
      </div>
      <AsciiReveal
        key={`${p.id}-${shot}-d`}
        src={src}
        alt={`${p.name}, captura ${shot + 1} (escritorio)`}
        className="aspect-[16/10] w-full"
        imgClassName="grayscale-[0.35]"
        placeholder={<Placeholder p={p} shot={shot} />}
      />
    </div>
  )
}

function PhoneFrame({ p, shot, src, size }: { p: Project; shot: number; src?: string; size: 'sm' | 'lg' }) {
  return (
    <div
      className={cn(
        'relative flex aspect-[9/19] flex-col rounded-[26px] border border-line bg-void p-[7px]',
        size === 'sm' ? 'h-[min(52dvh,440px)]' : 'h-[min(calc(100dvh-280px),620px)] lg:h-[min(calc(100dvh-170px),640px)]',
      )}
    >
      <span aria-hidden className="absolute top-[13px] left-1/2 z-10 h-[5px] w-[30%] -translate-x-1/2 rounded-full bg-void" />
      <AsciiReveal
        key={`${p.id}-${shot}-m`}
        src={src}
        alt={`${p.name}, captura ${shot + 1} (mobile)`}
        className="min-h-0 flex-1 rounded-[19px]"
        imgClassName="grayscale-[0.35]"
        cell={size === 'sm' ? 9 : 11}
        placeholder={<Placeholder p={p} shot={shot} compact />}
      />
    </div>
  )
}

function Placeholder({ p, shot, compact }: { p: Project; shot: number; compact?: boolean }) {
  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-2 px-3 text-center"
      style={{
        backgroundImage: 'radial-gradient(rgb(235 232 225 / 0.08) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      }}
    >
      <span className="caption text-muted">[captura pendiente]</span>
      <span className={cn('display', compact ? 'text-[18px]' : 'text-[clamp(22px,2.6vw,40px)]')}>{p.name}</span>
      <span className="caption text-muted">img {pad(shot + 1)}</span>
    </div>
  )
}
