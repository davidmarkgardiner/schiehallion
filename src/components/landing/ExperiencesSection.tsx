import type { experienceStories } from '@/data/landing'

interface ExperiencesSectionProps {
  experiences: typeof experienceStories
}

export default function ExperiencesSection({ experiences }: ExperiencesSectionProps) {
  return (
    <section id="experiences" className="bg-lundies-ivory py-24">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6">
        <header className="max-w-2xl space-y-4" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Experiences</p>
          <h2 className="text-3xl sm:text-4xl">Curated adventures around Aberfeldy</h2>
          <p className="text-base text-lundies-peat">
            Designed as swipeable stories with partner integrations and live availability hooks.
          </p>
        </header>

        <div
          className="flex gap-8 overflow-x-auto pb-4"
          data-reveal
          role="list"
          aria-label="Experience highlights"
        >
          {experiences.map((experience) => (
            <div
              key={experience.name}
              role="listitem"
              className="min-w-[260px] max-w-xs flex-1 space-y-4 rounded-[2rem] border border-lundies-stone/60 bg-white/70 p-6 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-lundies-moss">{experience.distance}</p>
              <h3 className="text-2xl">{experience.name}</h3>
              <p className="text-sm text-lundies-peat">{experience.description}</p>
              <span className="text-xs uppercase tracking-[0.3em] text-lundies-charcoal/60">Concierge ready</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
