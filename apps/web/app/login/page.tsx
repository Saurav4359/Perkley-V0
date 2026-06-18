import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginPage } from "@/components/auth/login-page"
import {
  getDashboardPathForUser,
  getServerSession,
} from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Login — Perkley",
  description: "Login to your Perkley account.",
}

export default async function LoginRoute() {
  const user = await getServerSession()
  if (user) {
    redirect(getDashboardPathForUser(user))
  }

  return <LoginPage />
}
