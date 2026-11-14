import { about } from '@/data/content'
import { RevealLines, Rise } from '@/components/kit'

export function About() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-10 py-8 text-center">
      <RevealLines lines={about.title} className="text-[clamp(34px,5.2vw,84px)]" />
      <Rise delay={0.2} className="flex max-w-[620px] flex-col gap-4">
        {about.paragraphs.map((p, i) => (
          <p key={i} className="text-body-s text-soft">
            {p}
          </p>
        ))}
      </Rise>
      <div className="grid w-full max-w-[1000px] border-t border-dashed border-line md:grid-cols-3">
        {about.services.map((s, i) => (
          <Rise
            key={s.n}
            delay={0.3 + i * 0.08}
            className="flex flex-col items-center gap-3 border-b border-dashed border-line px-4 py-6 md:border-b-0 md:not-first:border-l"
          >
            <span className="caption text-muted">[{s.n}]</span>
            <h3 className="text-[clamp(17px,1.3vw,20px)] leading-tight font-bold">{s.title}</h3>
            <p className="max-w-[300px] text-body-s text-soft">{s.body}</p>
          </Rise>
        ))}
      </div>
    </div>
  )
}
