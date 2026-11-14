import { contact } from '@/data/content'
import { ArrowUpRight, RevealLines, Rise } from '@/components/kit'

export function Contact() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-10 py-8 text-center">
      <RevealLines lines={contact.title} className="text-[clamp(34px,5.2vw,84px)]" />
      <Rise delay={0.2} className="w-full max-w-[520px] text-left">
        <ul className="border-b border-dashed border-line">
          {contact.rows.map((r) => (
            <li key={r.label} className="border-t border-dashed border-line">
              <a
                href={r.href}
                target={r.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group grid grid-cols-[96px_1fr_auto] items-center py-3 transition-colors duration-300 hover:bg-chalk hover:text-void"
              >
                <span className="caption pl-2 text-muted transition-colors group-hover:text-void/60">{r.label}</span>
                <span className="truncate text-body-s">{r.value}</span>
                <ArrowUpRight className="mr-2 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </Rise>
      <Rise delay={0.35}>
        <p className="caption text-muted">{contact.footer}</p>
      </Rise>
    </div>
  )
}
