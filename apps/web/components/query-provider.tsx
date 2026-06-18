"use client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { useState } from "react"

import { authQueryKey } from "@/hooks/use-auth"
import { ApiError } from "@/lib/api/client"
import type { AuthUser } from "@/lib/api/auth"

type QueryProviderProps = {
  children: React.ReactNode
  initialUser: AuthUser | null
}

export function QueryProvider({ children, initialUser }: QueryProviderProps) {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          retry: (failureCount, error) => {
            // Don't retry auth/permission/validation errors.
            if (error instanceof ApiError && error.status < 500) return false
            return failureCount < 2
          },
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

    queryClient.setQueryData(authQueryKey, initialUser)

    return queryClient
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
