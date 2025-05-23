"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProvider } from "convex/react"
import type { ReactNode } from "react"

// Create a client with error handling
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL environment variable")
}

export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

// Provider component for React
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
          <p className="mt-2 text-gray-600">Missing NEXT_PUBLIC_CONVEX_URL environment variable</p>
          <p className="mt-1 text-sm text-gray-500">Please check your environment configuration</p>
        </div>
      </div>
    )
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
