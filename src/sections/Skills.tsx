import { skills } from '@/data/content'
import { RevealLines, Rise } from '@/components/kit'

export function Skills() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-12 py-8 text-center">
      <RevealLines lines={skills.title} className="text-[clamp(34px,6vw,96px)]" />
      <div className="grid w-full max-w-[1000px] grid-cols-2 gap-x-6 gap-y-10 text-left xl:grid-cols-4">
        {skills.groups.map((g, gi) => (
          <Rise key={g.name} delay={0.15 + gi * 0.07}>
            <div className="grid grid-cols-[28px_1fr] pb-2">
              <span className="caption text-muted">{String(gi + 1).padStart(2, '0')}</span>
              <span className="caption">{g.name}</span>
            </div>
            <ul className="border-b border-dashed border-line">
              {g.items.map((item, i) => (
                <li
                  key={item}
                  className="grid grid-cols-[28px_1fr] border-t border-dashed border-line py-[7px] transition-colors duration-300 hover:bg-smoke"
                >
                  <span className="caption text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="caption">{item}</span>
                </li>
              ))}
            </ul>
          </Rise>
        ))}
      </div>
    </div>
  )
}
