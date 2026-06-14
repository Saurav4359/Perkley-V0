import { cn } from "@/lib/utils"

type WelcomeBannerProps = {
  userName: string
  message: string
  className?: string
}

export function WelcomeBanner({
  userName,
  message,
  className,
}: WelcomeBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand via-[#ff8555] to-[#ff9a73] px-6 py-7 text-white shadow-[0_20px_50px_rgba(254,108,55,0.22)] sm:px-8 sm:py-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-semibold ring-2 ring-white/30">
          {userName.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-medium text-white/85">Welcome back, {userName}</p>
          <h1 className="mt-1 max-w-xl text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            {message}
          </h1>
        </div>
      </div>
    </div>
  )
}
