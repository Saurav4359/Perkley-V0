import type { LeaderboardEntry } from "@/lib/dashboard/types"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

type BountyLeaderboardProps = {
  entries: LeaderboardEntry[]
  isLive: boolean
  prizeTiers?: { rank: number; amount: number }[]
}

const rankStyles: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-900 ring-yellow-300/60",
  2: "bg-zinc-100 text-zinc-800 ring-zinc-300/60",
  3: "bg-orange-100 text-orange-900 ring-orange-300/60",
}

export function BountyLeaderboard({ entries, isLive, prizeTiers }: BountyLeaderboardProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Leaderboard</h2>
          <p className="text-xs text-muted-foreground">
            Ranked by engagement score — views ×1 + likes ×2 + comments ×3. Syncs every 6h.
          </p>
        </div>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Final
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Followers</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const tier = prizeTiers?.find((item) => item.rank === entry.rank)
              return (
                <tr
                  key={entry.submissionId}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    entry.rank <= 3 && "bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset",
                        rankStyles[entry.rank] ?? "bg-background text-foreground ring-border"
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                        {entry.creatorInitials}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{entry.creatorName}</p>
                        {tier ? (
                          <p className="text-xs text-muted-foreground">
                            Prize: ₹{formatInr(tier.amount)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {entry.followers.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{entry.views.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {entry.score.toLocaleString("en-IN")}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
