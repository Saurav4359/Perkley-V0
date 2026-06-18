import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "@/components/theme-script"
import { SiteFooter } from "@/components/landing/footer"
import { getServerSession } from "@/lib/auth/server"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Perkley — Creator marketing, reimagined",
  description:
    "Launch creator campaigns. Let creators compete. Reward performance.",
  openGraph: {
    title: "Perkley — Creator marketing, reimagined",
    description:
      "Performance-based creator marketing where brands launch campaigns and creators compete for rewards.",
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialUser = await getServerSession()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <QueryProvider initialUser={initialUser}>
          <ThemeProvider>
            <div className="flex min-h-full flex-col">
              {children}
              <SiteFooter />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
