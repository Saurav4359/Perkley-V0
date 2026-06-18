"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect } from "react"

import {
  getCurrentUser,
  signinRequest,
  signoutRequest,
  signupRequest,
  type AuthUser,
  type SigninPayload,
  type SignupPayload,
} from "@/lib/api/auth"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const authQueryKey = ["auth", "me"] as const

const AUTH_BROADCAST_CHANNEL = "perkley-auth"

function broadcastAuthChange(event: "signed-in" | "signed-out") {
  if (typeof BroadcastChannel === "undefined") return
  new BroadcastChannel(AUTH_BROADCAST_CHANNEL).postMessage(event)
}

export function notifyAuthSignedIn() {
  broadcastAuthChange("signed-in")
}

/**
 * Reads the current session from `/api/auth/me`. Returns `null` when the
 * visitor is not authenticated (the request 401s).
 */
export function useAuth() {
  const queryClient = useQueryClient()

  const query = useQuery<AuthUser | null>({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  })

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return

    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL)
    channel.onmessage = (event: MessageEvent<"signed-in" | "signed-out">) => {
      if (event.data === "signed-out") {
        queryClient.setQueryData(authQueryKey, null)
        return
      }
      void queryClient.invalidateQueries({ queryKey: authQueryKey })
    }

    return () => channel.close()
  }, [queryClient])

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
    refetch: query.refetch,
  }
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SignupPayload) => signupRequest(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKey, user)
      broadcastAuthChange("signed-in")
    },
  })
}

export function useSignin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SigninPayload) => signinRequest(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKey, user)
      broadcastAuthChange("signed-in")
    },
  })
}

export function useSignout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      // Clear the app session (perkley_session) and the Supabase session, if any.
      await signoutRequest()
      if (isSupabaseConfigured()) {
        try {
          await createSupabaseBrowserClient().auth.signOut()
        } catch {
          // Best effort — a missing Supabase session must not block logout.
        }
      }
    },
    onSettled: () => {
      queryClient.setQueryData(authQueryKey, null)
      queryClient.clear()
      broadcastAuthChange("signed-out")
    },
  })
}
