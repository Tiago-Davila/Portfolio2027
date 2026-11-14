import { hero } from '@/data/content'
import { RevealLines } from '@/components/kit'

export function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
      <RevealLines lines={hero.title} className="text-[clamp(26px,4.6vw,76px)]" />
    </div>
  )
}
