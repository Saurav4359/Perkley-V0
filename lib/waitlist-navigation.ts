export type WaitlistRole = "brand" | "creator"

export const WAITLIST_OPEN_EVENT = "waitlist:open"

export function parseWaitlistRole(
  search = "",
  hash = ""
): WaitlistRole | null {
  const searchParams = new URLSearchParams(search)
  const searchRole = searchParams.get("role")
  if (searchRole === "brand" || searchRole === "creator") return searchRole

  const hashQuery = hash.includes("?") ? hash.split("?")[1] : ""
  const hashParams = new URLSearchParams(hashQuery)
  const hashRole = hashParams.get("role")
  if (hashRole === "brand" || hashRole === "creator") return hashRole

  return null
}

export function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

export function focusWaitlistForm() {
  window.setTimeout(() => {
    const input = document.querySelector<HTMLElement>(
      "#waitlist form input:not([type='hidden'])"
    )
    input?.focus()
  }, 450)
}

export function openWaitlist(role?: WaitlistRole) {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)

  if (role) {
    url.searchParams.set("role", role)
  }

  url.hash = "waitlist"
  window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`)

  window.dispatchEvent(
    new CustomEvent(WAITLIST_OPEN_EVENT, {
      detail: { role: role ?? null },
    })
  )

  scrollToWaitlist()
  focusWaitlistForm()
}
