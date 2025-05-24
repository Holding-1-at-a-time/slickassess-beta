import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexusTech - Elevate Your Digital Experience",
  description: "Seamlessly integrate powerful features into your workflow with our innovative platform",
  keywords: "technology, digital platform, innovation, cloud solutions, AI, analytics",
  openGraph: {
    title: "NexusTech - Elevate Your Digital Experience",
    description: "Seamlessly integrate powerful features into your workflow with our innovative platform",
    url: "https://nexustech.example.com",
    siteName: "NexusTech",
    images: [
      {
        url: "https://nexustech.example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NexusTech Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusTech - Elevate Your Digital Experience",
    description: "Seamlessly integrate powerful features into your workflow with our innovative platform",
    images: ["https://nexustech.example.com/twitter-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-black text-white antialiased`}>{children}</body>
    </html>
  )
}
