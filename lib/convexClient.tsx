"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProvider } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { ReactNode } from "react"

// Create a client
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

// Provider component for React
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

// Export the API for convenience
export { api }
