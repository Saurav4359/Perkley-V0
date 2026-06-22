export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-5 p-1">
      <div className="h-28 rounded-[1.15rem] bg-muted/60" />
      <div className="h-12 rounded-[1.15rem] bg-muted/50" />
      <div className="space-y-3 rounded-[1.15rem] border border-border/80 bg-card p-4">
        <div className="h-5 w-40 rounded bg-muted/60" />
        <div className="h-24 rounded-xl bg-muted/40" />
        <div className="h-24 rounded-xl bg-muted/40" />
        <div className="h-24 rounded-xl bg-muted/40" />
      </div>
    </div>
  )
}
