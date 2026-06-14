import type { Metadata } from "next"

import { SignupPage } from "@/components/auth/signup-page"

export const metadata: Metadata = {
  title: "Sign up — Perkley",
  description: "Create your Perkley account.",
}

export default function SignupRoute() {
  return <SignupPage />
}
