export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001"

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

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

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
