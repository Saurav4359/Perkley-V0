import { AuthGuestGate } from "@/components/auth/auth-guest-gate"
import { LandingPage } from "@/components/landing/landing-page"

export default function HomePage() {
  return (
    <AuthGuestGate>
      <LandingPage />
    </AuthGuestGate>
  )
}
