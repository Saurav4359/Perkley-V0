type Section = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export function CampaignDetailBody({ sections }: { sections: Section[] }) {
  return (
    <div className="min-w-0">
      <div className="border-b border-border px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8">
          <span className="border-b-2 border-foreground pb-3 text-sm font-medium text-foreground">
            Details
          </span>
        </nav>
      </div>

      <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-[15px] font-semibold text-foreground">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-[15px] leading-7 text-foreground/85">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="space-y-2.5 text-[15px] leading-7 text-foreground/85">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-3 size-1 shrink-0 rounded-full bg-foreground/35" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  )
}
