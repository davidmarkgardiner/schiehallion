import type { awards } from '@/data/landing'

interface AwardsSectionProps {
  awards: typeof awards
}

export default function AwardsSection({ awards }: AwardsSectionProps) {
  return (
    <section id="awards" className="bg-white py-24">
      <div className="mx-auto w-full max-w-5xl px-6">
        <header className="max-w-xl space-y-4 text-center" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Recognition</p>
          <h2 className="text-3xl sm:text-4xl">Awards & credentials</h2>
          <p className="text-base text-lundies-peat">
            Trusted accolades underscore the craft, sustainability, and welcome at the heart of Schiehallion.
          </p>
        </header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2" data-reveal>
          {awards.map((award) => (
            <div
              key={award.label}
              className="flex flex-col gap-2 rounded-[2rem] border border-lundies-stone/70 bg-lundies-linen/70 p-8 text-center"
            >
              <span className="text-xs uppercase tracking-[0.4em] text-lundies-moss">{award.label}</span>
              <span className="text-lg">{award.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
