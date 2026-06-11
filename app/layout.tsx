import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"

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
    "Launch creator campaigns. Let creators compete. Reward performance. Join the Perkley waitlist.",
  openGraph: {
    title: "Perkley — Creator marketing, reimagined",
    description:
      "Performance-based creator marketing where brands launch campaigns and creators compete for rewards.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
