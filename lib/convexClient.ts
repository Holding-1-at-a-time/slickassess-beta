import type React from "react"
import { ConvexReactClient } from "convex/react"
import { ConvexProvider } from "convex/react"

// Create a client
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

// Provider component for React
export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
