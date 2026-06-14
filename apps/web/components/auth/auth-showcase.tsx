import { cn } from "@/lib/utils"

type AuthShowcaseProps = {
  variant?: "login" | "signup"
  className?: string
}

const copy = {
  login: {
    title: "Reward creators for results, not reach.",
    body: "Launch bounties, track performance, and pay out winners — all in one place.",
  },
  signup: {
    title: "Built for brands and creators who move fast.",
    body: "Create an account to launch campaigns or compete for real performance rewards.",
  },
} as const

export function AuthShowcase({
  variant = "login",
  className,
}: AuthShowcaseProps) {
  const content = copy[variant]

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[560px] w-full max-w-xl flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-brand-muted px-10 py-12 dark:bg-card",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#FE6C37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-[#FE6C37]/8 blur-3xl" />

      <div className="relative flex flex-1 items-center justify-center py-6">
        <CampaignIllustration />
      </div>

      <div className="relative space-y-4">
        <div className="flex justify-center gap-2">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
        </div>
        <h2 className="text-center text-2xl font-medium leading-snug tracking-tight text-foreground">
          {content.title}
        </h2>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          {content.body}
        </p>
      </div>
    </div>
  )
}

function CampaignIllustration() {
  return (
    <svg
      viewBox="0 0 420 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[340px]"
      aria-hidden
    >
      <rect
        x="48"
        y="56"
        width="324"
        height="248"
        rx="28"
        fill="white"
        stroke="#FE6C37"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <circle cx="92" cy="96" r="18" fill="#FE6C37" fillOpacity="0.15" />
      <circle cx="92" cy="96" r="10" fill="#FE6C37" />
      <rect x="118" y="86" width="120" height="10" rx="5" fill="#0A0A0A" fillOpacity="0.12" />
      <rect x="118" y="104" width="72" height="8" rx="4" fill="#0A0A0A" fillOpacity="0.08" />

      <rect x="72" y="148" width="276" height="56" rx="18" fill="#FFF4EF" />
      <rect x="88" y="164" width="88" height="10" rx="5" fill="#FE6C37" fillOpacity="0.35" />
      <rect x="88" y="182" width="132" height="8" rx="4" fill="#0A0A0A" fillOpacity="0.1" />
      <rect x="286" y="160" width="46" height="32" rx="16" fill="#0A0A0A" />
      <circle cx="309" cy="176" r="8" fill="#FE6C37" />

      <rect x="72" y="220" width="132" height="56" rx="18" fill="#0A0A0A" fillOpacity="0.04" />
      <rect x="88" y="236" width="64" height="8" rx="4" fill="#0A0A0A" fillOpacity="0.12" />
      <rect x="88" y="252" width="96" height="8" rx="4" fill="#FE6C37" fillOpacity="0.45" />

      <rect x="216" y="220" width="132" height="56" rx="18" fill="#0A0A0A" fillOpacity="0.04" />
      <rect x="232" y="236" width="72" height="8" rx="4" fill="#0A0A0A" fillOpacity="0.12" />
      <rect x="232" y="252" width="88" height="8" rx="4" fill="#0A0A0A" fillOpacity="0.08" />

      <circle cx="330" cy="72" r="22" fill="white" stroke="#FE6C37" strokeOpacity="0.25" />
      <circle cx="330" cy="72" r="12" fill="#FE6C37" fillOpacity="0.2" />
      <path
        d="M324 72H336M330 66V78"
        stroke="#FE6C37"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle cx="56" cy="248" r="18" fill="white" stroke="#E8E8E4" />
      <circle cx="56" cy="248" r="8" fill="#FFB899" />

      <circle cx="372" cy="248" r="18" fill="white" stroke="#E8E8E4" />
      <circle cx="372" cy="248" r="8" fill="#FE6C37" />
    </svg>
  )
}
