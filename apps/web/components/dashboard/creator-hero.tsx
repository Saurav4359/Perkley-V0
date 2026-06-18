import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

type CreatorHeroProps = {
  userName: string
  totalRewardLabel?: string
  socialProof?: string
}

const AVATARS: { initials: string; from: string; to: string }[] = [
  { initials: "MC", from: "#FFB199", to: "#FF6B2C" },
  { initials: "JO", from: "#7C8FAD", to: "#3F4A60" },
  { initials: "PS", from: "#FFD59E", to: "#C2845A" },
  { initials: "AR", from: "#C4B5FD", to: "#7C3AED" },
  { initials: "SL", from: "#A7F3D0", to: "#10B981" },
]

export function CreatorHero({
  userName,
  totalRewardLabel = "—",
  socialProof = "Live campaigns on Perkley",
}: CreatorHeroProps) {
  return (
    <section
      aria-labelledby="creator-hero-heading"
      className={cn(
        "creator-hero relative min-h-[340px] overflow-hidden",
        "rounded-[28px] bg-[#F8F8F3]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] bg-[#F8F8F3]">
        <Image
          src="/dashboard/creator-hero-pixel.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="(min-width: 1280px) 900px, 100vw"
          className="select-none bg-[#F8F8F3] object-contain object-right"
        />
      </div>

      <div
        aria-hidden
        className="creator-hero-scrim pointer-events-none absolute inset-y-0 left-0 z-[1] w-[58%]"
      />

      <div className="relative z-10 flex min-h-[360px] items-center px-6 py-8 sm:px-9 sm:py-9 lg:px-10 lg:py-10">
        <div className="max-w-[520px] sm:max-w-[560px]">
          <p
            className="font-semibold text-[#FF6B2C]"
            style={{ fontSize: 16, marginBottom: 14, letterSpacing: "-0.005em" }}
          >
            Welcome back, {userName} <span aria-hidden>👋</span>
          </p>

          <h1
            id="creator-hero-heading"
            className="font-extrabold text-[#111111]"
            style={{
              fontSize: "clamp(32px, 4.2vw, 50px)",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
          >
            <span className="block">Discover campaigns</span>
            <span className="mt-1 block sm:whitespace-nowrap">
              worth{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.08em] bottom-[0.12em] z-0 h-[0.42em] rounded-sm"
                />
                <span
                  className="relative z-[1] bg-gradient-to-br from-[#FF6B2C] to-[#FF8547] bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: "text" }}
                >
                  {totalRewardLabel}
                </span>
              </span>{" "}
              waiting for you
            </span>
          </h1>

          <p
            className="font-medium text-[#6B6B6B]"
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              marginTop: 18,
              maxWidth: 420,
            }}
          >
            Join, create, and compete. Top creators are earning more on Perkley.
          </p>

          <div className="mt-7 flex flex-wrap items-center" style={{ gap: 14 }}>
            <Link
              href="#browse-listings"
              className={cn(
                "group inline-flex items-center justify-center font-semibold text-white",
                "transition-all duration-300 ease-out will-change-transform",
                "hover:-translate-y-[2px] active:translate-y-0"
              )}
              style={{
                height: 48,
                paddingInline: 22,
                borderRadius: 12,
                fontSize: 15,
                gap: 8,
                background: "linear-gradient(135deg, #FF6B2C 0%, #FF8547 100%)",
                boxShadow:
                  "0 10px 22px -8px rgba(255,107,44,0.45), 0 3px 8px -3px rgba(255,107,44,0.3), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              Browse Campaigns
              <ArrowRight
                className="size-[16px] transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>

            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center font-semibold text-[#111111]",
                "border border-black/[0.08] bg-white",
                "shadow-sm transition-all duration-300 ease-out",
                "hover:-translate-y-[2px] hover:border-black/[0.12] hover:shadow-md active:translate-y-0"
              )}
              style={{
                height: 48,
                paddingInline: 22,
                borderRadius: 12,
                fontSize: 15,
                gap: 8,
              }}
            >
              Create Portfolio
              <Sparkles className="size-[16px] text-[#FF6B2C]" strokeWidth={2.25} />
            </button>
          </div>

          <div className="mt-6 flex items-center" style={{ gap: 12 }}>
            <div className="flex -space-x-2">
              {AVATARS.map((avatar) => (
                <span
                  key={avatar.initials}
                  className="flex size-7 items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-[#F8F8F3]"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}
                  aria-hidden
                >
                  {avatar.initials}
                </span>
              ))}
            </div>
            <p
              className="font-medium text-[#888888]"
              style={{ fontSize: 14, letterSpacing: "-0.005em" }}
            >
              {socialProof}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .creator-hero {
          animation: creator-hero-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          color-scheme: light;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .dark .creator-hero {
          border: none;
          box-shadow: none;
          outline: 1px solid var(--background);
          outline-offset: -1px;
        }
        .creator-hero-scrim {
          background: linear-gradient(
            90deg,
            #f8f8f3 0%,
            #f8f8f3 58%,
            rgba(248, 248, 243, 0.82) 78%,
            transparent 100%
          );
        }
        @keyframes creator-hero-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .creator-hero {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
