"use client"

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query"

type QueryHydrationProps = {
  state: DehydratedState
  children: React.ReactNode
}

export function QueryHydration({ state, children }: QueryHydrationProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>
}
