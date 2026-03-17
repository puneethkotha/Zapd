import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { SupabaseProvider } from "@/components/providers/SupabaseProvider"
import { Toaster } from "@/components/ui/Toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "ZAPD — P2P EV Charging Marketplace",
  description:
    "Find nearby charging stations, book time slots, and charge your EV — frictionless, fast, dark-mode-first.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
