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

function formatSelfActivityAction(action: string): string {
  switch (action) {
    case "application accepted":
      return "Your application was accepted"
    case "application rejected":
      return "Your application was rejected"
    case "application withdrawn":
      return "You withdrew your application"
    case "applied to campaign":
      return "You applied to a campaign"
    case "submitted to a bounty":
      return "You submitted to a bounty"
    case "submitted to a campaign":
      return "You submitted to a campaign"
    case "won a bounty":
      return "You won a bounty"
    case "won a campaign":
      return "You won a campaign"
    case "qualified for campaign payout":
      return "You qualified for campaign payout"
    case "submission rejected":
      return "Your submission was rejected"
    case "submitted content":
      return "You submitted content"
    default:
      return action.charAt(0).toUpperCase() + action.slice(1)
  }
}

export function dashboardActivityToSidebar(
  item: DashboardActivityItem
): SidebarActivity {
  if (item.actorName === "You") {
    return {
      user: "",
      action: formatSelfActivityAction(item.action),
      campaign: item.campaignTitle,
      time: formatRelativeTime(item.occurredAt),
      kind: activityIconKind(item.kind),
    }
  }

  return {
    user: item.actorName,
    action: item.action,
    campaign: item.campaignTitle,
    time: formatRelativeTime(item.occurredAt),
    kind: activityIconKind(item.kind),
  }
}
