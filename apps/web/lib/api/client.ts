const DEFAULT_BACKEND_URL = "http://localhost:3001"

/**
 * Browser requests use same-origin `/api/*` (proxied to the backend in
 * next.config.ts) so session cookies are first-party on perkley.in and work
 * across tabs. Server-side code talks to the backend URL directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return ""
  }

  const serverUrl =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_BACKEND_URL

  return serverUrl.replace(/\/$/, "")
}

/** @deprecated Use getApiBaseUrl() so browser vs server resolution stays correct. */
export const API_BASE_URL = getApiBaseUrl()

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly issues?: unknown

  constructor(
    message: string,
    options: { status: number; code?: string; issues?: unknown }
  ) {
    super(message)
    this.name = "ApiError"
    this.status = options.status
    this.code = options.code
    this.issues = options.issues
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        })
        return response.ok
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

function shouldAttemptRefresh(path: string) {
  return (
    !path.startsWith("/api/auth/signin") &&
    !path.startsWith("/api/auth/signup") &&
    !path.startsWith("/api/auth/refresh") &&
    !path.startsWith("/api/auth/signout")
  )
}

async function resolveServerCookieHeader(
  headers: HeadersInit | undefined
): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined

  const existing = new Headers(headers ?? undefined)
  if (existing.has("Cookie")) return existing.get("Cookie") ?? undefined

  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")

  return cookieHeader || undefined
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options
  const serverCookieHeader = await resolveServerCookieHeader(headers)

  async function sendRequest() {
    return fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      credentials: "include",
      cache: rest.cache ?? (typeof window === "undefined" ? "no-store" : "default"),
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(serverCookieHeader ? { Cookie: serverCookieHeader } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let response = await sendRequest()

  if (response.status === 401 && shouldAttemptRefresh(path)) {
    const refreshed = await tryRefreshSession()
    if (refreshed) {
      response = await sendRequest()
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      "Something went wrong. Please try again."
    throw new ApiError(message, {
      status: response.status,
      code: payload?.code,
      issues: payload?.issues,
    })
  }

  return payload as T
}
