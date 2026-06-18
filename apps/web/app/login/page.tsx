import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginPage } from "@/components/auth/login-page"
import { LoginSessionRedirect } from "@/components/auth/login-session-redirect"

export const metadata: Metadata = {
  title: "Login — Perkley",
  description: "Login to your Perkley account.",
}

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginSessionRedirect />
      <LoginPage />
    </Suspense>
  )
}
