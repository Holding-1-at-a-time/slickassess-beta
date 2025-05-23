import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

// Initialize the Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify the channel ID and resource ID
    const channelId = request.headers.get("x-goog-channel-id")
    const resourceId = request.headers.get("x-goog-resource-id")
    const resourceState = request.headers.get("x-goog-resource-state")

    if (!channelId || !resourceId) {
      return NextResponse.json({ error: "Invalid webhook request" }, { status: 400 })
    }

    // Handle different resource states
    switch (resourceState) {
      case "sync":
        // Initial sync message, no action needed
        break

      case "exists":
        // Resource was updated
        const resourceUri = request.headers.get("x-goog-resource-uri")
        if (resourceUri) {
          // Extract the event ID from the resource URI
          const eventIdMatch = resourceUri.match(/events\/([^/?]+)/)
          const eventId = eventIdMatch ? eventIdMatch[1] : null

          if (eventId) {
            // Update the booking in Convex
            await convex.mutation(api.functions.handleCalendarEventUpdate, {
              googleEventId: eventId,
              eventData: body,
            })
          }
        }
        break

      case "not_exists":
        // Resource was deleted
        // Handle event deletion in Convex
        const deletedResourceUri = request.headers.get("x-goog-resource-uri")
        if (deletedResourceUri) {
          const eventIdMatch = deletedResourceUri.match(/events\/([^/?]+)/)
          const eventId = eventIdMatch ? eventIdMatch[1] : null

          if (eventId) {
            // Update the booking status in Convex
            await convex.mutation(api.functions.handleCalendarEventDeletion, {
              googleEventId: eventId,
            })
          }
        }
        break

      default:
        console.warn(`Unhandled resource state: ${resourceState}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling Google Calendar webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
