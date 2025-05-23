import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ConvexClientProvider } from "@/lib/convexClient"

export const metadata: Metadata = {
  title: "SlickAssess",
  description: "Vehicle assessment and booking platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
