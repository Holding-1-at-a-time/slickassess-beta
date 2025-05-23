import { ConvexClient } from "convex/browser"
import { ConvexReactClient } from "convex/react"

// Create a client instance for the browser
export const createBrowserClient = () => {
  return new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")
}

// Create a React client for use with the ConvexProvider
export const createReactClient = () => {
  return new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")
}
