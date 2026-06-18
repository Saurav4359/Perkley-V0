import type { DashboardActivityItem } from "@/lib/api/dashboard"
import { formatRelativeTime } from "@/lib/dashboard/utils"

export type SidebarActivity = {
  user: string
  action: string
  campaign: string
  time: string
  kind?: "submit" | "qualified" | "new"
}

function activityIconKind(
  kind: DashboardActivityItem["kind"]
): SidebarActivity["kind"] {
  switch (kind) {
    case "campaign":
      return "new"
    case "application":
      return "qualified"
    default:
      return "submit"
  }
}

export function dashboardActivityToSidebar(
  item: DashboardActivityItem
): SidebarActivity {
  return {
    user: item.actorName,
    action: item.action,
    campaign: item.campaignTitle,
    time: formatRelativeTime(item.occurredAt),
    kind: activityIconKind(item.kind),
  }
}
