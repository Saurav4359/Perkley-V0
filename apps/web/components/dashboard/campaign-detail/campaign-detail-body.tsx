import { cn } from "@/lib/utils"

type Section = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export function CampaignDetailBody({ sections }: { sections: Section[] }) {
  return (
    <div className="min-w-0 bg-muted/20 dark:bg-muted/10">
      <div className="border-b border-border bg-background/80 px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8">
          <span className="border-b-2 border-foreground pb-3.5 text-base font-semibold text-foreground">
            Details
          </span>
        </nav>
      </div>

      <div className="space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        {sections.map((section) => (
          <section
            key={section.title}
            className={cn(
              "rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6",
              "dark:border-border dark:bg-card/80"
            )}
          >
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-3xl text-base leading-7 text-foreground/90 sm:text-[17px] sm:leading-8"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="max-w-3xl space-y-3 text-base leading-7 text-foreground/90 sm:text-[17px] sm:leading-8">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand/80" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
