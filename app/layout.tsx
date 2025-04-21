import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "../components/ui/toaster"

export const metadata: Metadata = {
  title: "MassFunding - Crowdfunding on Massa Blockchain",
  description: "Crowdfunding platform on Massa blockchain with deferred calls and vesting",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
