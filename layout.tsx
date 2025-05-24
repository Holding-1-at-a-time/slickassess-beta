import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SlickAssess - Vehicle Assessment Platform",
  description:
    "Streamline your vehicle assessments with our all-in-one platform. Manage your fleet, schedule assessments, and optimize pricing.",
  keywords: "vehicle assessment, fleet management, automotive, booking system",
  authors: [{ name: "SlickAssess Team" }],
  openGraph: {
    title: "SlickAssess - Vehicle Assessment Platform",
    description: "Streamline your vehicle assessments with our all-in-one platform.",
    url: "https://slickassess.com",
    siteName: "SlickAssess",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SlickAssess - Vehicle Assessment Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SlickAssess - Vehicle Assessment Platform",
    description: "Streamline your vehicle assessments with our all-in-one platform.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  )
}
