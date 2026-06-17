"use client"

import { useState } from "react"

import {
  useAdminBrands,
  useAdminCampaigns,
  useAdminCreators,
  useAdminPayments,
  useAdminUsers,
  useModerateCampaign,
  usePlatformReport,
  useSetBrandVerification,
  useSetCreatorVerification,
  useUpdateUserStatus,
} from "@/hooks/use-admin"
import type { UserStatus, VerificationStatus } from "@/lib/api/admin"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

type TabId = "overview" | "users" | "creators" | "brands" | "campaigns" | "payments"

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "creators", label: "Creators" },
  { id: "brands", label: "Brands" },
  { id: "campaigns", label: "Campaigns" },
  { id: "payments", label: "Payments" },
]

const verificationTone: Record<string, string> = {
  verified: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  rejected: "bg-destructive/10 text-destructive",
  none: "bg-muted text-muted-foreground",
}

const statusTone: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  funded: "bg-emerald-500/10 text-emerald-600",
  released: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  suspended: "bg-amber-500/10 text-amber-600",
  pending: "bg-amber-500/10 text-amber-600",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  deleted: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
  refunded: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
}

function Badge({ value, tones }: { value: string; tones: Record<string, string> }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        tones[value] ?? "bg-muted text-muted-foreground"
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  )
}

const tableWrap =
  "overflow-x-auto rounded-2xl border border-border bg-card"
const th = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
const td = "px-4 py-3 align-middle"

function Pager({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-between px-1 pt-3 text-sm text-muted-foreground">
      <span>
        {total} total · page {page} of {lastPage}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function StateRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">
        {label}
      </td>
    </tr>
  )
}

function OverviewTab() {
  const { data, isLoading } = usePlatformReport()

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading platform report…</p>
  }

  const cards = [
    { label: "Total users", value: String(data.users.total), hint: `${data.users.creators} creators · ${data.users.brands} brands` },
    { label: "Active users", value: String(data.users.active), hint: `${data.users.suspended} suspended` },
    { label: "Campaigns", value: String(data.campaigns.total), hint: `${data.campaigns.active} active · ${data.campaigns.draft} draft` },
    { label: "Submissions", value: formatInr(data.submissions.total), hint: "Across all campaigns" },
    { label: "In escrow", value: `₹${formatInr(data.revenue.inEscrowInr)}`, hint: `₹${formatInr(data.revenue.escrowedInr)} escrowed` },
    { label: "Paid out", value: `₹${formatInr(data.payouts.paidAmountInr)}`, hint: `${data.payouts.paidCount} payouts` },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-card px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
        </div>
      ))}
    </div>
  )
}

function UsersTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminUsers({ page })
  const updateStatus = useUpdateUserStatus()
  const rows = data?.users ?? []

  return (
    <div>
      <div className={tableWrap}>
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className={th}>User</th>
              <th className={th}>Role</th>
              <th className={th}>Status</th>
              <th className={th}>Verified</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <StateRow colSpan={5} label="Loading users…" />
            ) : rows.length === 0 ? (
              <StateRow colSpan={5} label="No users found." />
            ) : (
              rows.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className={td}>
                    <p className="font-medium text-foreground">{user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className={cn(td, "capitalize")}>{user.role}</td>
                  <td className={td}>
                    <Badge value={user.status} tones={statusTone} />
                  </td>
                  <td className={td}>{user.emailVerified ? "Yes" : "No"}</td>
                  <td className={td}>
                    {user.role !== "admin" && user.status !== "deleted" ? (
                      <div className="flex gap-2">
                        {user.status === "active" ? (
                          <ActionButton
                            label="Suspend"
                            busy={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: user.id, status: "suspended" as UserStatus })
                            }
                          />
                        ) : (
                          <ActionButton
                            label="Reactivate"
                            variant="primary"
                            busy={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: user.id, status: "active" as UserStatus })
                            }
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data ? (
        <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      ) : null}
    </div>
  )
}

function VerificationActions({
  status,
  busy,
  onSet,
}: {
  status: VerificationStatus
  busy: boolean
  onSet: (status: VerificationStatus) => void
}) {
  if (status === "verified") {
    return (
      <ActionButton label="Revoke" busy={busy} onClick={() => onSet("rejected")} />
    )
  }
  return (
    <div className="flex gap-2">
      <ActionButton label="Verify" variant="primary" busy={busy} onClick={() => onSet("verified")} />
      {status !== "rejected" ? (
        <ActionButton label="Reject" busy={busy} onClick={() => onSet("rejected")} />
      ) : null}
    </div>
  )
}

function CreatorsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminCreators({ page })
  const setVerification = useSetCreatorVerification()
  const rows = data?.creators ?? []

  return (
    <div>
      <div className={tableWrap}>
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className={th}>Creator</th>
              <th className={th}>Followers</th>
              <th className={th}>Trust</th>
              <th className={th}>Verification</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <StateRow colSpan={5} label="Loading creators…" />
            ) : rows.length === 0 ? (
              <StateRow colSpan={5} label="No creators found." />
            ) : (
              rows.map((creator) => (
                <tr key={creator.userId} className="border-b border-border last:border-0">
                  <td className={td}>
                    <p className="font-medium text-foreground">{creator.displayName ?? "—"}</p>
                    {creator.instagramHandle ? (
                      <p className="text-xs text-muted-foreground">@{creator.instagramHandle}</p>
                    ) : null}
                  </td>
                  <td className={cn(td, "tabular-nums")}>
                    {creator.followersCount.toLocaleString("en-IN")}
                  </td>
                  <td className={cn(td, "tabular-nums")}>{creator.trustScore}</td>
                  <td className={td}>
                    <Badge value={creator.verificationStatus} tones={verificationTone} />
                  </td>
                  <td className={td}>
                    <VerificationActions
                      status={creator.verificationStatus}
                      busy={setVerification.isPending}
                      onSet={(verificationStatus) =>
                        setVerification.mutate({ id: creator.userId, verificationStatus })
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data ? (
        <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      ) : null}
    </div>
  )
}

function BrandsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminBrands({ page })
  const setVerification = useSetBrandVerification()
  const rows = data?.brands ?? []

  return (
    <div>
      <div className={tableWrap}>
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className={th}>Brand</th>
              <th className={th}>Industry</th>
              <th className={th}>Trust</th>
              <th className={th}>Verification</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <StateRow colSpan={5} label="Loading brands…" />
            ) : rows.length === 0 ? (
              <StateRow colSpan={5} label="No brands found." />
            ) : (
              rows.map((brand) => (
                <tr key={brand.userId} className="border-b border-border last:border-0">
                  <td className={td}>
                    <p className="font-medium text-foreground">{brand.brandName ?? "—"}</p>
                    {brand.website ? (
                      <p className="truncate text-xs text-muted-foreground">{brand.website}</p>
                    ) : null}
                  </td>
                  <td className={cn(td, "capitalize")}>{brand.industry ?? "—"}</td>
                  <td className={cn(td, "tabular-nums")}>{brand.trustScore}</td>
                  <td className={td}>
                    <Badge value={brand.verificationStatus} tones={verificationTone} />
                  </td>
                  <td className={td}>
                    <VerificationActions
                      status={brand.verificationStatus}
                      busy={setVerification.isPending}
                      onSet={(verificationStatus) =>
                        setVerification.mutate({ id: brand.userId, verificationStatus })
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data ? (
        <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      ) : null}
    </div>
  )
}

function CampaignsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminCampaigns({ page })
  const moderate = useModerateCampaign()
  const rows = data?.campaigns ?? []

  return (
    <div>
      <div className={tableWrap}>
        <table className="w-full min-w-[880px] text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className={th}>Campaign</th>
              <th className={th}>Type</th>
              <th className={th}>Budget</th>
              <th className={th}>Status</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <StateRow colSpan={5} label="Loading campaigns…" />
            ) : rows.length === 0 ? (
              <StateRow colSpan={5} label="No campaigns found." />
            ) : (
              rows.map((campaign) => {
                const canCancel =
                  campaign.status !== "cancelled" && campaign.status !== "completed"
                return (
                  <tr key={campaign.id} className="border-b border-border last:border-0">
                    <td className={td}>
                      <p className="font-medium text-foreground">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground">{campaign.brandName}</p>
                    </td>
                    <td className={cn(td, "capitalize")}>{campaign.type}</td>
                    <td className={cn(td, "tabular-nums")}>₹{formatInr(campaign.totalBudget)}</td>
                    <td className={td}>
                      <Badge value={campaign.status} tones={statusTone} />
                    </td>
                    <td className={td}>
                      {canCancel ? (
                        <ActionButton
                          label="Cancel"
                          busy={moderate.isPending}
                          onClick={() => {
                            const reason = window.prompt("Reason for cancelling this campaign?")
                            if (reason === null) return
                            moderate.mutate({
                              id: campaign.id,
                              reason: reason.trim() || undefined,
                            })
                          }}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {data ? (
        <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      ) : null}
    </div>
  )
}

function PaymentsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminPayments({ page })
  const rows = data?.payments ?? []

  return (
    <div>
      <div className={tableWrap}>
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className={th}>Campaign</th>
              <th className={th}>Escrow</th>
              <th className={th}>Released</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <StateRow colSpan={4} label="Loading payments…" />
            ) : rows.length === 0 ? (
              <StateRow colSpan={4} label="No escrow transactions found." />
            ) : (
              rows.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0">
                  <td className={td}>
                    <p className="font-medium text-foreground">{payment.campaignTitle}</p>
                  </td>
                  <td className={cn(td, "tabular-nums")}>₹{formatInr(payment.amountInr)}</td>
                  <td className={cn(td, "tabular-nums")}>
                    ₹{formatInr(payment.releasedAmountInr)}
                  </td>
                  <td className={td}>
                    <Badge value={payment.status} tones={statusTone} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data ? (
        <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      ) : null}
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  busy,
  variant = "outline",
}: {
  label: string
  onClick: () => void
  busy?: boolean
  variant?: "outline" | "primary"
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
        variant === "primary"
          ? "bg-brand text-white hover:bg-brand/90"
          : "border border-border text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}

export function AdminConsole() {
  const [tab, setTab] = useState<TabId>("overview")

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
        {TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === option.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? <OverviewTab /> : null}
      {tab === "users" ? <UsersTab /> : null}
      {tab === "creators" ? <CreatorsTab /> : null}
      {tab === "brands" ? <BrandsTab /> : null}
      {tab === "campaigns" ? <CampaignsTab /> : null}
      {tab === "payments" ? <PaymentsTab /> : null}
    </div>
  )
}
