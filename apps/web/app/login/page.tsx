import type { Metadata } from "next"

import { AuthGuestGate } from "@/components/auth/auth-guest-gate"
import { LoginPage } from "@/components/auth/login-page"

export const metadata: Metadata = {
  title: "Login — Perkley",
  description: "Login to your Perkley account.",
}

export default function LoginRoute() {
  return (
    <AuthGuestGate>
      <LoginPage />
    </AuthGuestGate>
  )
}
