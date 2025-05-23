import { NextResponse } from "next/server"
import { updateBookingFromCalendarEvent } from "@/convex/functions/updateBookingFromCalendarEvent"

export async function POST(request: Request) {
  try {
    // Verify the request is from Google
    const channelId = request.headers.get("X-Goog-Channel-ID")
    const resourceId = request.headers.get("X-Goog-Resource-ID")
    const resourceState = request.headers.get("X-Goog-Resource-State")

    if (!channelId || !resourceId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Handle different resource states
    if (resourceState === "sync") {
      // This is the initial sync message
      console.log("Received sync notification for channel:", channelId)
      return NextResponse.json({ status: "ok" })
    }

    if (resourceState === "exists" || resourceState === "not_exists") {
      // Get the event details and update the booking
      const eventId = request.headers.get("X-Goog-Resource-URI")?.split("/").pop()

      if (eventId) {
        // Update the booking based on the calendar event
        await updateBookingFromCalendarEvent({ eventId })
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error handling calendar webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
