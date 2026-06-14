import type { Metadata } from "next"

import { LoginPage } from "@/components/auth/login-page"

export const metadata: Metadata = {
  title: "Login — Perkley",
  description: "Login to your Perkley account.",
}

export default function LoginRoute() {
  return <LoginPage />
}
