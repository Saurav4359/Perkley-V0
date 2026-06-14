"use client"

import { motion } from "framer-motion"
import { ArrowUpRightIcon, TrophyIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { SurfaceCard } from "@/components/landing/primitives"

const leaderboard = [
  { rank: 1, name: "Maya K.", handle: "@mayakfit", score: "128K views", delta: "+24%" },
  { rank: 2, name: "Arjun S.", handle: "@arjcreates", score: "96K views", delta: "+18%" },
  { rank: 3, name: "Lena R.", handle: "@lenar", score: "81K views", delta: "+12%" },
]

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <SurfaceCard className="overflow-hidden p-6 sm:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Live campaign
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              Protein Launch Bounty
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              ₹1,00,000 pool · 14 days left
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-brand" />
            248 creators
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Reach", value: "2.4M", icon: UsersIcon },
            { label: "Posts", value: "612", icon: ArrowUpRightIcon },
            { label: "Top payout", value: "₹25K", icon: TrophyIcon },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-muted/30 px-3 py-3"
            >
              <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
                <stat.icon className="size-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                  {stat.label}
                </span>
              </div>
              <p className="text-base font-semibold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Leaderboard</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Live
            </p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    entry.rank === 1
                      ? "bg-brand text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  {entry.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{entry.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.handle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{entry.score}</p>
                  <p className="text-xs text-muted-foreground">{entry.delta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>
    </motion.div>
  )
}
