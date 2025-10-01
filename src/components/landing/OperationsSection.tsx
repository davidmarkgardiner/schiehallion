import type { operationsHighlights } from '@/data/landing'

interface OperationsSectionProps {
  highlights: typeof operationsHighlights
}

export default function OperationsSection({ highlights }: OperationsSectionProps) {
  return (
    <section id="operations" className="bg-lundies-ivory py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <header className="max-w-2xl space-y-4" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Operations</p>
          <h2 className="text-3xl sm:text-4xl">Empowering teams behind the scenes</h2>
          <p className="text-base text-lundies-peat">
            Interfaces choreographed for operations, revenue, and guest relations to collaborate in real time.
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-3" data-reveal>
          {highlights.map((highlight) => (
            <article key={highlight.title} className="space-y-5 rounded-[2rem] border border-lundies-stone/60 bg-white/80 p-6">
              <h3 className="text-2xl">{highlight.title}</h3>
              <ul className="space-y-3 text-sm text-lundies-peat">
                {highlight.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-lundies-moss" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
