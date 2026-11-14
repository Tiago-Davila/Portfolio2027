import { projects } from '@/data/content'
import { AsciiField } from '@/components/AsciiField'
import { ArrowUpRight, DataRows, RevealLines, Rise, Tags } from '@/components/kit'

export function Projects() {
  return (
    <div className="flex min-h-full items-center justify-center py-8">
      <div className="grid w-full max-w-[1100px] gap-x-10 gap-y-14 md:grid-cols-2">
        {projects.map((p, i) => (
          <article key={p.id} className="flex min-w-0 flex-col items-center text-center">
            <Rise delay={0.1 + i * 0.08}>
              <Tags items={[p.domain, ...p.tags]} className="justify-center" />
            </Rise>
            <RevealLines as="h2" lines={[p.name]} className="mt-3 text-[clamp(30px,3.4vw,52px)]" />
            <Rise delay={0.25 + i * 0.08} className="mt-5 flex w-full flex-col items-center gap-5">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-[16/10] max-h-[34vh] w-full overflow-hidden border border-dashed border-line bg-smoke"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={`Captura de ${p.name}`}
                    className="size-full object-cover opacity-80 grayscale contrast-150 transition duration-700 ease-out-expo group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                ) : (
                  <AsciiField label={p.name} />
                )}
                <span className="caption absolute top-2 left-2 bg-void px-1 text-muted">[img] {p.id}</span>
              </a>
              <p className="max-w-[380px] text-body-s text-soft">{p.description}</p>
              <DataRows rows={p.rows} className="w-full text-left" />
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="caption inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                Ver sitio <ArrowUpRight />
              </a>
            </Rise>
          </article>
        ))}
      </div>
    </div>
  )
}
