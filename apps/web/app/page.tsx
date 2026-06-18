import { redirect } from "next/navigation"

import { LandingPage } from "@/components/landing/landing-page"
import {
  getDashboardPathForUser,
  getServerSession,
} from "@/lib/auth/server"

export default async function HomePage() {
  const user = await getServerSession()
  if (user) {
    redirect(getDashboardPathForUser(user))
  }

  return <LandingPage />
}
